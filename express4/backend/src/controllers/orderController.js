/**
 * 订单管理控制器 - 订单CRUD、状态流转、售后、物流、操作日志
 */
const {
  getOrderList,
  getOrderDetail,
  createOrder,
  cancelOrder,
  shipOrder,
  confirmOrder,
  getAfterSaleList,
  auditAfterSale,
  getLogistics,
  getOrderLogs,
} = require('../mock/orders');

// ==================== 订单相关 ====================

/**
 * GET /api/v1/orders
 * 分页获取订单列表，支持多条件筛选
 */
function list(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const { orderNo, status, keyword, startDate, endDate } = req.query;

    const data = getOrderList({ page, pageSize, orderNo, status, keyword, startDate, endDate });

    return res.status(200).json({
      code: 200,
      message: '获取订单列表成功',
      data,
    });
  } catch (error) {
    console.error('获取订单列表异常:', error);
    return res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null,
    });
  }
}

/**
 * GET /api/v1/orders/:id
 * 获取订单完整详情（含商品/物流/售后/操作日志）
 */
function detail(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        code: 400,
        message: '订单ID格式不正确',
        data: null,
      });
    }

    const order = getOrderDetail(id);
    if (!order) {
      return res.status(404).json({
        code: 404,
        message: '订单不存在',
        data: null,
      });
    }

    return res.status(200).json({
      code: 200,
      message: '获取订单详情成功',
      data: order,
    });
  } catch (error) {
    console.error('获取订单详情异常:', error);
    return res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null,
    });
  }
}

/**
 * POST /api/v1/orders
 * 后台手动创建订单
 */
function create(req, res) {
  try {
    const { userId, userName, items, receiverName, receiverPhone, receiverAddress, remark, totalAmount, discountAmount, freightAmount, payAmount, payMethod } = req.body;

    if (!userId) {
      return res.status(400).json({
        code: 400,
        message: '请选择用户',
        data: null,
      });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '请至少选择一个商品',
        data: null,
      });
    }
    if (!receiverName || !receiverPhone || !receiverAddress) {
      return res.status(400).json({
        code: 400,
        message: '请填写完整的收货信息',
        data: null,
      });
    }

    // 从 token 中获取操作人信息（通过中间件设置）
    const operator = req.user?.nickname || '系统管理员';
    const operatorId = req.user?.id || 1;

    const order = createOrder({
      userId,
      userName: userName || '用户',
      items,
      receiverName,
      receiverPhone,
      receiverAddress,
      remark: remark || '',
      totalAmount: totalAmount || items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0),
      discountAmount: discountAmount || 0,
      freightAmount: freightAmount || 0,
      payAmount: payAmount || 0,
      payMethod: payMethod || 'wechat',
      operator,
      operatorId,
    });

    return res.status(201).json({
      code: 200,
      message: '订单创建成功',
      data: order,
    });
  } catch (error) {
    console.error('创建订单异常:', error);
    return res.status(500).json({
      code: 500,
      message: error.message || '服务器内部错误',
      data: null,
    });
  }
}

/**
 * PATCH /api/v1/orders/:id/cancel
 * 取消订单（仅支持待付款状态）
 */
function cancel(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        code: 400,
        message: '订单ID格式不正确',
        data: null,
      });
    }

    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      return res.status(400).json({
        code: 400,
        message: '请填写取消原因',
        data: null,
      });
    }

    const operator = req.user?.nickname || '系统管理员';
    const order = cancelOrder(id, reason.trim(), operator);

    return res.status(200).json({
      code: 200,
      message: '订单已取消',
      data: order,
    });
  } catch (error) {
    console.error('取消订单异常:', error);

    if (error.message.includes('不允许从')) {
      return res.status(400).json({
        code: 400,
        message: '当前订单状态不允许此操作',
        data: null,
      });
    }
    if (error.message === '订单不存在') {
      return res.status(404).json({
        code: 404,
        message: '订单不存在',
        data: null,
      });
    }

    return res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null,
    });
  }
}

/**
 * PATCH /api/v1/orders/:id/ship
 * 录入物流信息并发货
 */
function ship(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        code: 400,
        message: '订单ID格式不正确',
        data: null,
      });
    }

    const { company, trackingNo } = req.body;
    if (!company || !company.trim()) {
      return res.status(400).json({
        code: 400,
        message: '请填写物流公司',
        data: null,
      });
    }
    if (!trackingNo || !trackingNo.trim()) {
      return res.status(400).json({
        code: 400,
        message: '请填写物流单号',
        data: null,
      });
    }

    const operator = req.user?.nickname || '系统管理员';
    const order = shipOrder(id, { company: company.trim(), trackingNo: trackingNo.trim() }, operator);

    return res.status(200).json({
      code: 200,
      message: '发货成功',
      data: order,
    });
  } catch (error) {
    console.error('订单发货异常:', error);

    if (error.message.includes('不允许从')) {
      return res.status(400).json({
        code: 400,
        message: '当前订单状态不允许此操作',
        data: null,
      });
    }
    if (error.message === '订单不存在') {
      return res.status(404).json({
        code: 404,
        message: '订单不存在',
        data: null,
      });
    }

    return res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null,
    });
  }
}

/**
 * PATCH /api/v1/orders/:id/confirm
 * 确认收货，订单完成
 */
function confirm(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        code: 400,
        message: '订单ID格式不正确',
        data: null,
      });
    }

    const operator = req.user?.nickname || '系统管理员';
    const order = confirmOrder(id, operator);

    return res.status(200).json({
      code: 200,
      message: '确认收货成功，订单已完成',
      data: order,
    });
  } catch (error) {
    console.error('确认收货异常:', error);

    if (error.message.includes('不允许从')) {
      return res.status(400).json({
        code: 400,
        message: '当前订单状态不允许此操作',
        data: null,
      });
    }
    if (error.message === '订单不存在') {
      return res.status(404).json({
        code: 404,
        message: '订单不存在',
        data: null,
      });
    }

    return res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null,
    });
  }
}

// ==================== 售后相关 ====================

/**
 * GET /api/v1/after-sales
 * 分页获取售后列表
 */
function afterSaleList(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const { status } = req.query;

    const data = getAfterSaleList({ page, pageSize, status });

    return res.status(200).json({
      code: 200,
      message: '获取售后列表成功',
      data,
    });
  } catch (error) {
    console.error('获取售后列表异常:', error);
    return res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null,
    });
  }
}

/**
 * PATCH /api/v1/after-sales/:id/audit
 * 审核售后申请（通过/拒绝）
 */
function afterSaleAudit(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        code: 400,
        message: '售后单ID格式不正确',
        data: null,
      });
    }

    const { action, result } = req.body;
    if (!action || !['approved', 'rejected'].includes(action)) {
      return res.status(400).json({
        code: 400,
        message: '审核操作无效，只支持 approved 或 rejected',
        data: null,
      });
    }

    const operator = req.user?.nickname || '系统管理员';
    const afterSale = auditAfterSale(id, { action, result }, operator);

    return res.status(200).json({
      code: 200,
      message: action === 'approved' ? '售后审核通过' : '售后审核已拒绝',
      data: afterSale,
    });
  } catch (error) {
    console.error('售后审核异常:', error);

    if (error.message === '售后申请已处理，无法重复审核') {
      return res.status(400).json({
        code: 400,
        message: error.message,
        data: null,
      });
    }
    if (error.message.includes('无效的审核操作')) {
      return res.status(400).json({
        code: 400,
        message: error.message,
        data: null,
      });
    }

    return res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null,
    });
  }
}

// ==================== 物流 & 日志 ====================

/**
 * GET /api/v1/orders/:id/logistics
 * 查询订单物流轨迹
 */
function logistics(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        code: 400,
        message: '订单ID格式不正确',
        data: null,
      });
    }

    const order = getOrderDetail(id);
    if (!order) {
      return res.status(404).json({
        code: 404,
        message: '订单不存在',
        data: null,
      });
    }

    const logisticsData = getLogistics(id);
    if (!logisticsData) {
      return res.status(200).json({
        code: 200,
        message: '该订单暂无物流信息',
        data: null,
      });
    }

    return res.status(200).json({
      code: 200,
      message: '获取物流信息成功',
      data: logisticsData,
    });
  } catch (error) {
    console.error('获取物流信息异常:', error);
    return res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null,
    });
  }
}

/**
 * GET /api/v1/orders/:id/logs
 * 获取订单操作时间轴
 */
function logs(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        code: 400,
        message: '订单ID格式不正确',
        data: null,
      });
    }

    const order = getOrderDetail(id);
    if (!order) {
      return res.status(404).json({
        code: 404,
        message: '订单不存在',
        data: null,
      });
    }

    const logsData = getOrderLogs(id);

    return res.status(200).json({
      code: 200,
      message: '获取操作日志成功',
      data: logsData,
    });
  } catch (error) {
    console.error('获取操作日志异常:', error);
    return res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null,
    });
  }
}

module.exports = {
  list,
  detail,
  create,
  cancel,
  ship,
  confirm,
  afterSaleList,
  afterSaleAudit,
  logistics,
  logs,
};
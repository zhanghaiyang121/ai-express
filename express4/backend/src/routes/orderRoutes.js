/**
 * 订单管理路由 - M04 订单管理模块
 * 挂载点: /api/v1/orders
 */
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middlewares/authMiddleware');

// 所有订单接口都需要认证
router.use(authMiddleware);

// 获取订单列表（分页 + 筛选）
router.get('/', orderController.list);

// 获取订单详情
router.get('/:id', orderController.detail);

// 创建订单
router.post('/', orderController.create);

// 取消订单
router.patch('/:id/cancel', orderController.cancel);

// 订单发货
router.patch('/:id/ship', orderController.ship);

// 确认收货
router.patch('/:id/confirm', orderController.confirm);

// 查询物流轨迹
router.get('/:id/logistics', orderController.logistics);

// 获取操作日志
router.get('/:id/logs', orderController.logs);

module.exports = router;
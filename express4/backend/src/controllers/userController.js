/**
 * 用户管理控制器 - 用户列表、更新、删除
 */
const { findAll, findById, updateUser, deleteUser } = require('../mock/users');

/**
 * GET /api/v1/users
 * 获取用户列表（分页 + 搜索）
 */
function getUserList(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const { keyword, role } = req.query;

    let users = findAll();

    // 关键词搜索（用户名 / 昵称 / 邮箱）
    if (keyword) {
      const kw = keyword.toLowerCase();
      users = users.filter(
        u => u.username.toLowerCase().includes(kw) ||
             u.nickname.toLowerCase().includes(kw) ||
             u.email.toLowerCase().includes(kw)
      );
    }

    // 角色筛选
    if (role) {
      users = users.filter(u => u.role === role);
    }

    const total = users.length;
    const start = (page - 1) * pageSize;
    const list = users.slice(start, start + pageSize);

    return res.status(200).json({
      code: 200,
      message: '获取用户列表成功',
      data: { list, total, page, pageSize }
    });
  } catch (error) {
    console.error('获取用户列表异常:', error);
    return res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null
    });
  }
}

/**
 * GET /api/v1/users/:id
 * 获取用户详情
 */
function getUserDetail(req, res) {
  try {
    const id = parseInt(req.params.id);
    const user = findById(id);

    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在',
        data: null
      });
    }

    return res.status(200).json({
      code: 200,
      message: '获取用户详情成功',
      data: user
    });
  } catch (error) {
    console.error('获取用户详情异常:', error);
    return res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null
    });
  }
}

/**
 * PUT /api/v1/users/:id
 * 更新用户信息
 */
function update(req, res) {
  try {
    const id = parseInt(req.params.id);
    const { nickname, email, phone, role, status } = req.body;

    const updated = updateUser(id, { nickname, email, phone, role, status });

    if (!updated) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在',
        data: null
      });
    }

    // 返回去敏后的用户信息
    const { password, ...userInfo } = updated;

    return res.status(200).json({
      code: 200,
      message: '用户信息更新成功',
      data: userInfo
    });
  } catch (error) {
    console.error('更新用户异常:', error);
    return res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null
    });
  }
}

/**
 * DELETE /api/v1/users/:id
 * 删除用户（软删除：标记 status=0）
 */
function remove(req, res) {
  try {
    const id = parseInt(req.params.id);
    const success = deleteUser(id);

    if (!success) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在',
        data: null
      });
    }

    return res.status(200).json({
      code: 200,
      message: '用户删除成功',
      data: null
    });
  } catch (error) {
    console.error('删除用户异常:', error);
    return res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null
    });
  }
}

module.exports = { getUserList, getUserDetail, update, remove };
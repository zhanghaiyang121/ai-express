/**
 * 用户管理路由
 * M02-01: GET    /api/v1/users      - 用户列表（分页 + 搜索）
 * M02-02: GET    /api/v1/users/:id  - 用户详情
 * M02-04: PUT    /api/v1/users/:id  - 更新用户
 * M02-05: DELETE /api/v1/users/:id  - 删除用户（软删除）
 */
const express = require('express');
const router = express.Router();
const { getUserList, getUserDetail, update, remove } = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// 所有用户管理接口都需要认证
router.get('/', getUserList);
router.get('/:id', authMiddleware, getUserDetail);
router.put('/:id', authMiddleware, update);
router.delete('/:id', authMiddleware, remove);

module.exports = router;
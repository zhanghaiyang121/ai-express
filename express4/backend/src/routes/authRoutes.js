/**
 * 认证路由
 * M01-01: POST /api/v1/auth/login  - 用户登录
 * M01-06: GET  /api/v1/auth/me     - 当前用户信息（需认证）
 */
const express = require('express');
const router = express.Router();
const { login, getCurrentUser } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

// 登录（公开接口）
router.post('/login', login);

// 获取当前用户信息（需认证）
router.get('/me', authMiddleware, getCurrentUser);

module.exports = router;
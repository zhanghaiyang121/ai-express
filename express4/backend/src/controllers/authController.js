/**
 * 认证控制器 - 处理登录和用户信息获取
 */
const jwt = require('jsonwebtoken');
const { findByUsername, findById } = require('../mock/users');

// JWT 密钥（生产环境应放入环境变量）
const JWT_SECRET = process.env.JWT_SECRET || 'ai-express-jwt-secret-key-2026';
const JWT_EXPIRES_IN = '24h';

/**
 * POST /api/v1/auth/login
 * 用户登录
 */
function login(req, res) {
  try {
    const { username, password } = req.body;

    // 参数校验
    if (!username || !password) {
      return res.status(400).json({
        code: 400,
        message: '用户名和密码不能为空',
        data: null
      });
    }

    // 根据用户名查找用户
    const user = findByUsername(username);
    if (!user) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误',
        data: null
      });
    }

    // 校验密码（mock 数据明文比对）
    if (user.password !== password) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误',
        data: null
      });
    }

    // 检查用户状态
    if (user.status !== 1) {
      return res.status(403).json({
        code: 403,
        message: '账号已被禁用，请联系管理员',
        data: null
      });
    }

    // 生成 JWT Token
    const tokenPayload = {
      id: user.id,
      username: user.username,
      role: user.role
    };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // 返回用户信息（去敏）和 token
    const { password: _, ...userInfo } = user;

    return res.status(200).json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        user: userInfo
      }
    });
  } catch (error) {
    console.error('登录异常:', error);
    return res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null
    });
  }
}

/**
 * GET /api/v1/auth/me
 * 获取当前登录用户信息
 */
function getCurrentUser(req, res) {
  try {
    // 从 JWT 中间件注入的 req.user 中获取用户 ID
    const userId = req.user.id;

    const userInfo = findById(userId);
    if (!userInfo) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在',
        data: null
      });
    }

    return res.status(200).json({
      code: 200,
      message: '获取用户信息成功',
      data: userInfo
    });
  } catch (error) {
    console.error('获取用户信息异常:', error);
    return res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null
    });
  }
}

module.exports = { login, getCurrentUser };
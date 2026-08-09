/**
 * JWT 认证中间件
 * 解析请求头中的 Bearer Token，验证后将用户信息注入 req.user
 */
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'ai-express-jwt-secret-key-2026';

function authMiddleware(req, res, next) {
  // 从 Authorization 头取出 token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      code: 401,
      message: '未登录或 Token 缺失',
      data: null
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, username, role }
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        code: 401,
        message: 'Token 已过期，请重新登录',
        data: null
      });
    }
    return res.status(401).json({
      code: 401,
      message: 'Token 无效',
      data: null
    });
  }
}

module.exports = authMiddleware;
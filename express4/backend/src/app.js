/**
 * 电商后台管理系统 - 后端应用入口
 * Express 框架搭建，提供 RESTful API
 * 当前实现: M01-01 登录、M01-06 获取当前用户信息
 */
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// ================ 全局中间件 ================

// CORS 跨域配置
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 请求体解析
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ================ 路由注册 ================

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ code: 200, message: 'ok', timestamp: Date.now() });
});

// 认证模块路由 (M01)
app.use('/api/v1/auth', authRoutes);

// ================ 404 处理 ================

app.use((req, res) => {
  res.status(404).json({
    code: 404,
    message: `接口不存在: ${req.method} ${req.originalUrl}`,
    data: null
  });
});

// ================ 全局错误处理 ================

app.use((err, req, res, next) => {
  console.error('未捕获的服务器错误:', err);
  res.status(500).json({
    code: 500,
    message: '服务器内部错误',
    data: null
  });
});

// ================ 启动服务 ================

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n🚀 后端服务已启动: http://localhost:${PORT}`);
    console.log(`📋 健康检查: http://localhost:${PORT}/api/health`);
    console.log(`🔐 登录接口: POST http://localhost:${PORT}/api/v1/auth/login`);
    console.log(`👤 用户信息: GET  http://localhost:${PORT}/api/v1/auth/me\n`);
  });
}

module.exports = app;
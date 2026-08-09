/**
 * 售后管理路由 - M04 订单管理模块（售后部分）
 * 挂载点: /api/v1/after-sales
 */
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middlewares/authMiddleware');

// 所有接口都需要认证
router.use(authMiddleware);

// 售后列表
router.get('/', orderController.afterSaleList);

// 售后审核
router.patch('/:id/audit', orderController.afterSaleAudit);

module.exports = router;
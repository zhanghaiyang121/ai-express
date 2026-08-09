/**
 * Mock 订单数据 - 包含订单、订单商品、物流、售后、操作日志
 * 覆盖 6 种订单状态，至少 15 条订单数据
 */

// ========== 状态流转映射表 ==========
const ALLOWED_TRANSITIONS = {
  pending_payment: ['pending_shipment', 'canceled'],
  pending_shipment: ['shipped', 'after_sale'],
  shipped: ['completed', 'after_sale'],
  after_sale: ['completed', 'shipped'],
  canceled: [],
  completed: [],
};

// ========== 自增 ID 管理 ==========
let nextOrderId = 16;
let nextOrderItemId = 31;
let nextAfterSaleId = 5;
let nextOrderLogId = 36;
let nextLogisticsId = 7;

function generateOrderNo() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const seq = String(nextOrderId).padStart(3, '0');
  return `ORD${date}${seq}`;
}

// ========== 状态流转校验 ==========
function validateTransition(currentStatus, targetStatus) {
  const allowed = ALLOWED_TRANSITIONS[currentStatus];
  if (!allowed || !allowed.includes(targetStatus)) {
    throw new Error(`不允许从 ${currentStatus} 转换到 ${targetStatus}`);
  }
  return true;
}

// ========== 订单商品明细 ==========
const orderItems = [
  { id: 1, orderId: 1, productId: 101, productName: 'iPhone 15 手机壳', productImage: 'https://via.placeholder.com/100', skuId: 1001, skuSpec: '红色 / Pro Max', price: 49.00, quantity: 2, totalPrice: 98.00 },
  { id: 2, orderId: 1, productId: 102, productName: '钢化膜', productImage: 'https://via.placeholder.com/100', skuId: 1002, skuSpec: '透明 / 15 Pro', price: 19.90, quantity: 1, totalPrice: 19.90 },
  { id: 3, orderId: 2, productId: 201, productName: 'MacBook Pro 14寸', productImage: 'https://via.placeholder.com/100', skuId: 2001, skuSpec: '深空灰 / 16G+512G', price: 12999.00, quantity: 1, totalPrice: 12999.00 },
  { id: 4, orderId: 3, productId: 301, productName: 'AirPods Pro 第二代', productImage: 'https://via.placeholder.com/100', skuId: 3001, skuSpec: '白色 / USB-C', price: 1799.00, quantity: 1, totalPrice: 1799.00 },
  { id: 5, orderId: 4, productId: 401, productName: '小米14 Ultra', productImage: 'https://via.placeholder.com/100', skuId: 4001, skuSpec: '黑色 / 16G+512G', price: 5999.00, quantity: 1, totalPrice: 5999.00 },
  { id: 6, orderId: 5, productId: 501, productName: '华为Mate 60 Pro', productImage: 'https://via.placeholder.com/100', skuId: 5001, skuSpec: '雅丹黑 / 12G+1T', price: 7999.00, quantity: 1, totalPrice: 7999.00 },
  { id: 7, orderId: 6, productId: 601, productName: 'Sony WH-1000XM5', productImage: 'https://via.placeholder.com/100', skuId: 6001, skuSpec: '铂金银 / 无线降噪', price: 2499.00, quantity: 1, totalPrice: 2499.00 },
  { id: 8, orderId: 7, productId: 701, productName: 'iPad Air M2', productImage: 'https://via.placeholder.com/100', skuId: 7001, skuSpec: '星光色 / 256G WiFi', price: 4799.00, quantity: 1, totalPrice: 4799.00 },
  { id: 9, orderId: 8, productId: 801, productName: '罗技 MX Master 3S', productImage: 'https://via.placeholder.com/100', skuId: 8001, skuSpec: '石墨黑 / 无线', price: 699.00, quantity: 2, totalPrice: 1398.00 },
  { id: 10, orderId: 9, productId: 901, productName: '机械革命旷世16', productImage: 'https://via.placeholder.com/100', skuId: 9001, skuSpec: '银色 / i9+4060', price: 6999.00, quantity: 1, totalPrice: 6999.00 },
  { id: 11, orderId: 10, productId: 1001, productName: '三星T7 Shield 2TB', productImage: 'https://via.placeholder.com/100', skuId: 10001, skuSpec: '黑色 / USB 3.2', price: 1299.00, quantity: 1, totalPrice: 1299.00 },
  { id: 12, orderId: 11, productId: 1101, productName: 'Apple Watch Ultra 2', productImage: 'https://via.placeholder.com/100', skuId: 11001, skuSpec: '钛金属 / 海洋表带', price: 6499.00, quantity: 1, totalPrice: 6499.00 },
  { id: 13, orderId: 12, productId: 1201, productName: '戴尔U2723QE', productImage: 'https://via.placeholder.com/100', skuId: 12001, skuSpec: '27寸 / 4K IPS', price: 3499.00, quantity: 2, totalPrice: 6998.00 },
  { id: 14, orderId: 12, productId: 1202, productName: '显示器支架', productImage: 'https://via.placeholder.com/100', skuId: 12002, skuSpec: '黑色 / 双屏', price: 199.00, quantity: 1, totalPrice: 199.00 },
  { id: 15, orderId: 13, productName: '华为FreeBuds Pro 3', productImage: 'https://via.placeholder.com/100', skuId: 13001, skuSpec: '冰霜银 / 主动降噪', price: 1399.00, quantity: 1, totalPrice: 1399.00 },
  { id: 16, orderId: 13, productId: 1302, productName: '华为手环8', productImage: 'https://via.placeholder.com/100', skuId: 13002, skuSpec: '黑色 / NFC版', price: 299.00, quantity: 1, totalPrice: 299.00 },
  { id: 17, orderId: 14, productId: 1401, productName: '佳能EOS R6 Mark II', productImage: 'https://via.placeholder.com/100', skuId: 14001, skuSpec: '机身 / 24-105套机', price: 15999.00, quantity: 1, totalPrice: 15999.00 },
  { id: 18, orderId: 15, productId: 1501, productName: '大疆Mini 4 Pro', productImage: 'https://via.placeholder.com/100', skuId: 15001, skuSpec: '畅飞套装 / RC2', price: 5788.00, quantity: 1, totalPrice: 5788.00 },
  { id: 19, orderId: 15, productId: 1502, productName: 'ND滤镜套装', productImage: 'https://via.placeholder.com/100', skuId: 15002, skuSpec: 'ND4/8/16/32', price: 299.00, quantity: 1, totalPrice: 299.00 },
  { id: 20, orderId: 1, productId: 101, productName: 'iPhone 15 手机壳', productImage: 'https://via.placeholder.com/100', skuId: 1001, skuSpec: '红色 / Pro Max', price: 49.00, quantity: 1, totalPrice: 49.00 },
  { id: 21, orderId: 2, productId: 201, productName: 'MacBook Pro 14寸', productImage: 'https://via.placeholder.com/100', skuId: 2001, skuSpec: '深空灰 / 16G+512G', price: 12999.00, quantity: 1, totalPrice: 12999.00 },
  { id: 22, orderId: 3, productId: 301, productName: 'AirPods Pro 第二代', productImage: 'https://via.placeholder.com/100', skuId: 3001, skuSpec: '白色 / USB-C', price: 1799.00, quantity: 1, totalPrice: 1799.00 },
  { id: 23, orderId: 4, productId: 401, productName: '小米14 Ultra', productImage: 'https://via.placeholder.com/100', skuId: 4001, skuSpec: '黑色 / 16G+512G', price: 5999.00, quantity: 1, totalPrice: 5999.00 },
  { id: 24, orderId: 5, productId: 501, productName: '华为Mate 60 Pro', productImage: 'https://via.placeholder.com/100', skuId: 5001, skuSpec: '雅丹黑 / 12G+1T', price: 7999.00, quantity: 1, totalPrice: 7999.00 },
  { id: 25, orderId: 6, productId: 601, productName: 'Sony WH-1000XM5', productImage: 'https://via.placeholder.com/100', skuId: 6001, skuSpec: '铂金银 / 无线降噪', price: 2499.00, quantity: 1, totalPrice: 2499.00 },
  { id: 26, orderId: 7, productId: 701, productName: 'iPad Air M2', productImage: 'https://via.placeholder.com/100', skuId: 7001, skuSpec: '星光色 / 256G WiFi', price: 4799.00, quantity: 1, totalPrice: 4799.00 },
  { id: 27, orderId: 8, productId: 801, productName: '罗技 MX Master 3S', productImage: 'https://via.placeholder.com/100', skuId: 8001, skuSpec: '石墨黑 / 无线', price: 699.00, quantity: 2, totalPrice: 1398.00 },
  { id: 28, orderId: 9, productId: 901, productName: '机械革命旷世16', productImage: 'https://via.placeholder.com/100', skuId: 9001, skuSpec: '银色 / i9+4060', price: 6999.00, quantity: 1, totalPrice: 6999.00 },
  { id: 29, orderId: 10, productId: 1001, productName: '三星T7 Shield 2TB', productImage: 'https://via.placeholder.com/100', skuId: 10001, skuSpec: '黑色 / USB 3.2', price: 1299.00, quantity: 1, totalPrice: 1299.00 },
  { id: 30, orderId: 11, productId: 1101, productName: 'Apple Watch Ultra 2', productImage: 'https://via.placeholder.com/100', skuId: 11001, skuSpec: '钛金属 / 海洋表带', price: 6499.00, quantity: 1, totalPrice: 6499.00 },
];

// ========== 订单数据（15条，覆盖6种状态） ==========
const orders = [
  { id: 1, orderNo: 'ORD202608010001', userId: 2, userName: '张三', status: 'pending_payment', totalAmount: 117.90, discountAmount: 0, freightAmount: 0, payAmount: 117.90, payMethod: 'wechat', payTime: null, receiverName: '张三', receiverPhone: '138****0002', receiverAddress: '广东省深圳市南山区科技园', remark: '请尽快发货', adminRemark: '', cancelReason: null, cancelTime: null, createdAt: '2026-08-01T10:30:00.000Z', updatedAt: '2026-08-01T10:30:00.000Z' },
  { id: 2, orderNo: 'ORD202608020002', userId: 2, userName: '张三', status: 'pending_payment', totalAmount: 12999.00, discountAmount: 500, freightAmount: 0, payAmount: 12499.00, payMethod: 'alipay', payTime: null, receiverName: '张三', receiverPhone: '138****0002', receiverAddress: '广东省深圳市南山区科技园', remark: '', adminRemark: '', cancelReason: null, cancelTime: null, createdAt: '2026-08-02T09:15:00.000Z', updatedAt: '2026-08-02T09:15:00.000Z' },
  { id: 3, orderNo: 'ORD202608030003', userId: 4, userName: '王五', status: 'pending_payment', totalAmount: 1799.00, discountAmount: 0, freightAmount: 10, payAmount: 1809.00, payMethod: 'card', payTime: null, receiverName: '王五', receiverPhone: '138****0004', receiverAddress: '北京市朝阳区望京SOHO', remark: '送礼用，请包装好', adminRemark: '', cancelReason: null, cancelTime: null, createdAt: '2026-08-03T14:20:00.000Z', updatedAt: '2026-08-03T14:20:00.000Z' },
  { id: 4, orderNo: 'ORD202608040004', userId: 3, userName: '李四', status: 'pending_shipment', totalAmount: 5999.00, discountAmount: 100, freightAmount: 0, payAmount: 5899.00, payMethod: 'wechat', payTime: '2026-08-04T10:00:00.000Z', receiverName: '李四', receiverPhone: '138****0003', receiverAddress: '上海市浦东新区张江高科技园区', remark: '', adminRemark: '', cancelReason: null, cancelTime: null, createdAt: '2026-08-04T08:30:00.000Z', updatedAt: '2026-08-04T10:00:00.000Z' },
  { id: 5, orderNo: 'ORD202608040005', userId: 4, userName: '王五', status: 'pending_shipment', totalAmount: 7999.00, discountAmount: 200, freightAmount: 15, payAmount: 7814.00, payMethod: 'alipay', payTime: '2026-08-04T16:00:00.000Z', receiverName: '王五', receiverPhone: '138****0004', receiverAddress: '北京市朝阳区望京SOHO', remark: '', adminRemark: '优先发货', cancelReason: null, cancelTime: null, createdAt: '2026-08-04T15:00:00.000Z', updatedAt: '2026-08-04T16:05:00.000Z' },
  { id: 6, orderNo: 'ORD202608050006', userId: 5, userName: '赵六', status: 'pending_shipment', totalAmount: 2499.00, discountAmount: 0, freightAmount: 0, payAmount: 2499.00, payMethod: 'wechat', payTime: '2026-08-05T11:00:00.000Z', receiverName: '赵六', receiverPhone: '138****0005', receiverAddress: '广州市天河区珠江新城', remark: '发顺丰', adminRemark: '', cancelReason: null, cancelTime: null, createdAt: '2026-08-05T09:00:00.000Z', updatedAt: '2026-08-05T11:00:00.000Z' },
  { id: 7, orderNo: 'ORD202608050007', userId: 2, userName: '张三', status: 'shipped', totalAmount: 4799.00, discountAmount: 0, freightAmount: 0, payAmount: 4799.00, payMethod: 'alipay', payTime: '2026-08-05T10:30:00.000Z', receiverName: '张三', receiverPhone: '138****0002', receiverAddress: '广东省深圳市南山区科技园', remark: '', adminRemark: '', cancelReason: null, cancelTime: null, createdAt: '2026-08-05T08:00:00.000Z', updatedAt: '2026-08-05T14:00:00.000Z' },
  { id: 8, orderNo: 'ORD202608060008', userId: 3, userName: '李四', status: 'shipped', totalAmount: 1398.00, discountAmount: 50, freightAmount: 8, payAmount: 1356.00, payMethod: 'card', payTime: '2026-08-06T09:00:00.000Z', receiverName: '李四', receiverPhone: '138****0003', receiverAddress: '上海市浦东新区张江高科技园区', remark: '', adminRemark: '', cancelReason: null, cancelTime: null, createdAt: '2026-08-06T08:00:00.000Z', updatedAt: '2026-08-06T15:00:00.000Z' },
  { id: 9, orderNo: 'ORD202608060009', userId: 5, userName: '赵六', status: 'shipped', totalAmount: 6999.00, discountAmount: 300, freightAmount: 0, payAmount: 6699.00, payMethod: 'wechat', payTime: '2026-08-06T12:00:00.000Z', receiverName: '赵六', receiverPhone: '138****0005', receiverAddress: '广州市天河区珠江新城', remark: '周末送货', adminRemark: '', cancelReason: null, cancelTime: null, createdAt: '2026-08-06T10:00:00.000Z', updatedAt: '2026-08-07T09:00:00.000Z' },
  { id: 10, orderNo: 'ORD202608070010', userId: 4, userName: '王五', status: 'completed', totalAmount: 1299.00, discountAmount: 0, freightAmount: 0, payAmount: 1299.00, payMethod: 'alipay', payTime: '2026-08-07T10:00:00.000Z', receiverName: '王五', receiverPhone: '138****0004', receiverAddress: '北京市朝阳区望京SOHO', remark: '', adminRemark: '', cancelReason: null, cancelTime: null, createdAt: '2026-08-07T08:00:00.000Z', updatedAt: '2026-08-08T16:00:00.000Z' },
  { id: 11, orderNo: 'ORD202608070011', userId: 2, userName: '张三', status: 'completed', totalAmount: 6499.00, discountAmount: 200, freightAmount: 0, payAmount: 6299.00, payMethod: 'wechat', payTime: '2026-08-07T14:00:00.000Z', receiverName: '张三', receiverPhone: '138****0002', receiverAddress: '广东省深圳市南山区科技园', remark: '', adminRemark: '', cancelReason: null, cancelTime: null, createdAt: '2026-08-07T12:00:00.000Z', updatedAt: '2026-08-09T10:00:00.000Z' },
  { id: 12, orderNo: 'ORD202608080012', userId: 3, userName: '李四', status: 'canceled', totalAmount: 7197.00, discountAmount: 100, freightAmount: 0, payAmount: 7097.00, payMethod: 'card', payTime: null, receiverName: '李四', receiverPhone: '138****0003', receiverAddress: '上海市浦东新区张江高科技园区', remark: '', adminRemark: '', cancelReason: '用户主动取消', cancelTime: '2026-08-08T11:00:00.000Z', createdAt: '2026-08-08T09:00:00.000Z', updatedAt: '2026-08-08T11:00:00.000Z' },
  { id: 13, orderNo: 'ORD202608080013', userId: 5, userName: '赵六', status: 'canceled', totalAmount: 1698.00, discountAmount: 0, freightAmount: 0, payAmount: 1698.00, payMethod: 'alipay', payTime: null, receiverName: '赵六', receiverPhone: '138****0005', receiverAddress: '广州市天河区珠江新城', remark: '', adminRemark: '', cancelReason: '超时未支付', cancelTime: '2026-08-09T08:00:00.000Z', createdAt: '2026-08-08T16:00:00.000Z', updatedAt: '2026-08-09T08:00:00.000Z' },
  { id: 14, orderNo: 'ORD202608090014', userId: 4, userName: '王五', status: 'after_sale', totalAmount: 15999.00, discountAmount: 500, freightAmount: 20, payAmount: 15519.00, payMethod: 'alipay', payTime: '2026-08-09T09:00:00.000Z', receiverName: '王五', receiverPhone: '138****0004', receiverAddress: '北京市朝阳区望京SOHO', remark: '', adminRemark: '', cancelReason: null, cancelTime: null, createdAt: '2026-08-09T08:00:00.000Z', updatedAt: '2026-08-09T15:00:00.000Z' },
  { id: 15, orderNo: 'ORD202608090015', userId: 2, userName: '张三', status: 'after_sale', totalAmount: 6087.00, discountAmount: 0, freightAmount: 0, payAmount: 6087.00, payMethod: 'wechat', payTime: '2026-08-09T10:00:00.000Z', receiverName: '张三', receiverPhone: '138****0002', receiverAddress: '广东省深圳市南山区科技园', remark: '', adminRemark: '', cancelReason: null, cancelTime: null, createdAt: '2026-08-09T09:00:00.000Z', updatedAt: '2026-08-09T16:00:00.000Z' },
];

// ========== 物流信息 ==========
const logistics = [
  { id: 1, orderId: 7, company: '顺丰', trackingNo: 'SF1234567890', shipTime: '2026-08-05T14:00:00.000Z', estimatedArrival: '2026-08-08', traces: [
    { time: '2026-08-05T14:30:00.000Z', status: '已揽收', location: '深圳集散中心' },
    { time: '2026-08-06T08:00:00.000Z', status: '运输中', location: '广州中转中心' },
    { time: '2026-08-07T09:00:00.000Z', status: '派送中', location: '深圳南山网点' },
  ]},
  { id: 2, orderId: 8, company: '中通', trackingNo: 'ZT9876543210', shipTime: '2026-08-06T15:00:00.000Z', estimatedArrival: '2026-08-09', traces: [
    { time: '2026-08-06T15:30:00.000Z', status: '已揽收', location: '上海浦东集散中心' },
    { time: '2026-08-07T10:00:00.000Z', status: '运输中', location: '上海中转中心' },
  ]},
  { id: 3, orderId: 9, company: '圆通', trackingNo: 'YT1122334455', shipTime: '2026-08-07T09:00:00.000Z', estimatedArrival: '2026-08-10', traces: [
    { time: '2026-08-07T09:30:00.000Z', status: '已揽收', location: '广州白云集散中心' },
    { time: '2026-08-08T06:00:00.000Z', status: '运输中', location: '广州中转中心' },
    { time: '2026-08-09T08:00:00.000Z', status: '派送中', location: '天河网点' },
  ]},
  { id: 4, orderId: 10, company: '顺丰', trackingNo: 'SF5566778899', shipTime: '2026-08-07T14:00:00.000Z', estimatedArrival: '2026-08-08', traces: [
    { time: '2026-08-07T15:00:00.000Z', status: '已揽收', location: '北京朝阳集散中心' },
    { time: '2026-08-08T08:00:00.000Z', status: '已签收', location: '望京SOHO' },
  ]},
  { id: 5, orderId: 11, company: '京东', trackingNo: 'JD7788990011', shipTime: '2026-08-08T09:00:00.000Z', estimatedArrival: '2026-08-09', traces: [
    { time: '2026-08-08T09:30:00.000Z', status: '已揽收', location: '深圳南山集散中心' },
    { time: '2026-08-09T08:00:00.000Z', status: '已签收', location: '深圳科技园' },
  ]},
  { id: 6, orderId: 14, company: '顺丰', trackingNo: 'SF9988776655', shipTime: '2026-08-09T14:00:00.000Z', estimatedArrival: '2026-08-11', traces: [
    { time: '2026-08-09T14:30:00.000Z', status: '已揽收', location: '北京朝阳集散中心' },
  ]},
];

// ========== 售后单 ==========
const afterSales = [
  { id: 1, orderId: 14, orderNo: 'ORD202608090014', type: 'refund', status: 'pending', reason: '商品与描述不符', description: '收到的相机有划痕，申请退款', evidenceImages: ['https://via.placeholder.com/200'], refundAmount: 15519.00, auditResult: null, auditTime: null, completedTime: null, createdAt: '2026-08-09T15:00:00.000Z', updatedAt: '2026-08-09T15:00:00.000Z' },
  { id: 2, orderId: 15, orderNo: 'ORD202608090015', type: 'refund', status: 'pending', reason: '不想要了', description: '下单后不想要了，申请退款', evidenceImages: [], refundAmount: 6087.00, auditResult: null, auditTime: null, completedTime: null, createdAt: '2026-08-09T16:00:00.000Z', updatedAt: '2026-08-09T16:00:00.000Z' },
  { id: 3, orderId: 10, orderNo: 'ORD202608100010', type: 'refund', status: 'approved', reason: '质量问题', description: '硬盘读写速度不达标', evidenceImages: ['https://via.placeholder.com/200', 'https://via.placeholder.com/200'], refundAmount: 1299.00, auditResult: '经核实，同意退款', auditTime: '2026-08-08T14:00:00.000Z', completedTime: '2026-08-08T16:00:00.000Z', createdAt: '2026-08-08T12:00:00.000Z', updatedAt: '2026-08-08T16:00:00.000Z' },
  { id: 4, orderId: 11, orderNo: 'ORD202608110011', type: 'refund', status: 'rejected', reason: '七天无理由', description: '手表戴着不舒服', evidenceImages: [], refundAmount: 6299.00, auditResult: '商品已拆封使用，不符合七天无理由条件', auditTime: '2026-08-09T09:00:00.000Z', completedTime: null, createdAt: '2026-08-09T08:00:00.000Z', updatedAt: '2026-08-09T09:00:00.000Z' },
];

// ========== 操作日志 ==========
const orderLogs = [
  { id: 1, orderId: 1, action: 'created', description: '管理员创建订单', operator: '系统管理员', operatorId: 1, createdAt: '2026-08-01T10:30:00.000Z' },
  { id: 2, orderId: 2, action: 'created', description: '管理员创建订单', operator: '系统管理员', operatorId: 1, createdAt: '2026-08-02T09:15:00.000Z' },
  { id: 3, orderId: 3, action: 'created', description: '管理员创建订单', operator: '系统管理员', operatorId: 1, createdAt: '2026-08-03T14:20:00.000Z' },
  { id: 4, orderId: 4, action: 'created', description: '用户下单', operator: '李四', operatorId: 3, createdAt: '2026-08-04T08:30:00.000Z' },
  { id: 5, orderId: 4, action: 'paid', description: '微信支付成功，支付金额 5899.00', operator: '系统', operatorId: 0, createdAt: '2026-08-04T10:00:00.000Z' },
  { id: 6, orderId: 5, action: 'created', description: '用户下单', operator: '王五', operatorId: 4, createdAt: '2026-08-04T15:00:00.000Z' },
  { id: 7, orderId: 5, action: 'paid', description: '支付宝支付成功，支付金额 7814.00', operator: '系统', operatorId: 0, createdAt: '2026-08-04T16:00:00.000Z' },
  { id: 8, orderId: 5, action: 'remark', description: '管理员备注：优先发货', operator: '系统管理员', operatorId: 1, createdAt: '2026-08-04T16:05:00.000Z' },
  { id: 9, orderId: 6, action: 'created', description: '用户下单', operator: '赵六', operatorId: 5, createdAt: '2026-08-05T09:00:00.000Z' },
  { id: 10, orderId: 6, action: 'paid', description: '微信支付成功，支付金额 2499.00', operator: '系统', operatorId: 0, createdAt: '2026-08-05T11:00:00.000Z' },
  { id: 11, orderId: 7, action: 'created', description: '用户下单', operator: '张三', operatorId: 2, createdAt: '2026-08-05T08:00:00.000Z' },
  { id: 12, orderId: 7, action: 'paid', description: '支付宝支付成功，支付金额 4799.00', operator: '系统', operatorId: 0, createdAt: '2026-08-05T10:30:00.000Z' },
  { id: 13, orderId: 7, action: 'shipped', description: '顺丰发货，运单号 SF1234567890', operator: '系统管理员', operatorId: 1, createdAt: '2026-08-05T14:00:00.000Z' },
  { id: 14, orderId: 8, action: 'created', description: '用户下单', operator: '李四', operatorId: 3, createdAt: '2026-08-06T08:00:00.000Z' },
  { id: 15, orderId: 8, action: 'paid', description: '银行卡支付成功，支付金额 1356.00', operator: '系统', operatorId: 0, createdAt: '2026-08-06T09:00:00.000Z' },
  { id: 16, orderId: 8, action: 'shipped', description: '中通发货，运单号 ZT9876543210', operator: '系统管理员', operatorId: 1, createdAt: '2026-08-06T15:00:00.000Z' },
  { id: 17, orderId: 9, action: 'created', description: '用户下单', operator: '赵六', operatorId: 5, createdAt: '2026-08-06T10:00:00.000Z' },
  { id: 18, orderId: 9, action: 'paid', description: '微信支付成功，支付金额 6699.00', operator: '系统', operatorId: 0, createdAt: '2026-08-06T12:00:00.000Z' },
  { id: 19, orderId: 9, action: 'shipped', description: '圆通发货，运单号 YT1122334455', operator: '系统管理员', operatorId: 1, createdAt: '2026-08-07T09:00:00.000Z' },
  { id: 20, orderId: 10, action: 'created', description: '用户下单', operator: '王五', operatorId: 4, createdAt: '2026-08-07T08:00:00.000Z' },
  { id: 21, orderId: 10, action: 'paid', description: '支付宝支付成功，支付金额 1299.00', operator: '系统', operatorId: 0, createdAt: '2026-08-07T10:00:00.000Z' },
  { id: 22, orderId: 10, action: 'shipped', description: '顺丰发货，运单号 SF5566778899', operator: '系统管理员', operatorId: 1, createdAt: '2026-08-07T14:00:00.000Z' },
  { id: 23, orderId: 10, action: 'confirmed', description: '用户确认收货', operator: '王五', operatorId: 4, createdAt: '2026-08-08T10:00:00.000Z' },
  { id: 24, orderId: 10, action: 'after_sale', description: '申请售后（仅退款），原因：质量问题', operator: '王五', operatorId: 4, createdAt: '2026-08-08T12:00:00.000Z' },
  { id: 25, orderId: 10, action: 'refunded', description: '售后审核通过，退款 1299.00 元', operator: '系统管理员', operatorId: 1, createdAt: '2026-08-08T16:00:00.000Z' },
  { id: 26, orderId: 11, action: 'created', description: '用户下单', operator: '张三', operatorId: 2, createdAt: '2026-08-07T12:00:00.000Z' },
  { id: 27, orderId: 11, action: 'paid', description: '微信支付成功，支付金额 6299.00', operator: '系统', operatorId: 0, createdAt: '2026-08-07T14:00:00.000Z' },
  { id: 28, orderId: 11, action: 'shipped', description: '京东物流发货，运单号 JD7788990011', operator: '系统管理员', operatorId: 1, createdAt: '2026-08-08T09:00:00.000Z' },
  { id: 29, orderId: 11, action: 'confirmed', description: '用户确认收货', operator: '张三', operatorId: 2, createdAt: '2026-08-09T10:00:00.000Z' },
  { id: 30, orderId: 12, action: 'created', description: '用户下单', operator: '李四', operatorId: 3, createdAt: '2026-08-08T09:00:00.000Z' },
  { id: 31, orderId: 12, action: 'canceled', description: '订单取消，原因：用户主动取消', operator: '李四', operatorId: 3, createdAt: '2026-08-08T11:00:00.000Z' },
  { id: 32, orderId: 13, action: 'created', description: '用户下单', operator: '赵六', operatorId: 5, createdAt: '2026-08-08T16:00:00.000Z' },
  { id: 33, orderId: 13, action: 'canceled', description: '订单取消，原因：超时未支付', operator: '系统', operatorId: 0, createdAt: '2026-08-09T08:00:00.000Z' },
  { id: 34, orderId: 14, action: 'created', description: '用户下单', operator: '王五', operatorId: 4, createdAt: '2026-08-09T08:00:00.000Z' },
  { id: 35, orderId: 14, action: 'paid', description: '支付宝支付成功，支付金额 15519.00', operator: '系统', operatorId: 0, createdAt: '2026-08-09T09:00:00.000Z' },
  { id: 36, orderId: 14, action: 'shipped', description: '顺丰发货，运单号 SF9988776655', operator: '系统管理员', operatorId: 1, createdAt: '2026-08-09T14:00:00.000Z' },
  { id: 37, orderId: 14, action: 'after_sale', description: '申请售后（仅退款），原因：商品与描述不符', operator: '王五', operatorId: 4, createdAt: '2026-08-09T15:00:00.000Z' },
  { id: 38, orderId: 15, action: 'created', description: '用户下单', operator: '张三', operatorId: 2, createdAt: '2026-08-09T09:00:00.000Z' },
  { id: 39, orderId: 15, action: 'paid', description: '微信支付成功，支付金额 6087.00', operator: '系统', operatorId: 0, createdAt: '2026-08-09T10:00:00.000Z' },
  { id: 40, orderId: 15, action: 'after_sale', description: '申请售后（仅退款），原因：不想要了', operator: '张三', operatorId: 2, createdAt: '2026-08-09T16:00:00.000Z' },
];

// ========== Mock 数据操作函数 ==========

/** 获取订单列表（支持分页和筛选） */
function getOrderList({ page = 1, pageSize = 10, orderNo, status, keyword, startDate, endDate }) {
  let list = [...orders];

  if (orderNo) {
    list = list.filter(o => o.orderNo.includes(orderNo));
  }
  if (status) {
    list = list.filter(o => o.status === status);
  }
  if (keyword) {
    const kw = keyword.toLowerCase();
    list = list.filter(o =>
      o.receiverName.toLowerCase().includes(kw) ||
      o.receiverPhone.toLowerCase().includes(kw)
    );
  }
  if (startDate) {
    list = list.filter(o => o.createdAt >= startDate + 'T00:00:00.000Z');
  }
  if (endDate) {
    list = list.filter(o => o.createdAt <= endDate + 'T23:59:59.999Z');
  }

  // 按创建时间降序
  list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const total = list.length;
  const paged = list.slice((page - 1) * pageSize, page * pageSize);

  // 为每条订单附加商品明细
  const result = paged.map(order => {
    const items = orderItems.filter(item => item.orderId === order.id);
    return { ...order, itemCount: items.length, items };
  });

  return { list: result, total, page, pageSize };
}

/** 根据ID获取订单详情（含商品、物流、售后、日志） */
function getOrderDetail(id) {
  const order = orders.find(o => o.id === id);
  if (!order) return null;

  const items = orderItems.filter(item => item.orderId === id);
  const logisticsInfo = logistics.find(l => l.orderId === id) || null;
  const afterSaleInfo = afterSales.find(a => a.orderId === id) || null;
  const logs = orderLogs.filter(l => l.orderId === id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return { ...order, items, logistics: logisticsInfo, afterSale: afterSaleInfo, logs };
}

/** 创建订单 */
function createOrder(data) {
  const orderNo = generateOrderNo();
  const now = new Date().toISOString();

  const newOrder = {
    id: nextOrderId,
    orderNo,
    userId: data.userId,
    userName: data.userName || '用户',
    status: 'pending_payment',
    totalAmount: data.totalAmount || 0,
    discountAmount: data.discountAmount || 0,
    freightAmount: data.freightAmount || 0,
    payAmount: data.payAmount || (data.totalAmount || 0) - (data.discountAmount || 0) + (data.freightAmount || 0),
    payMethod: data.payMethod || 'wechat',
    payTime: null,
    receiverName: data.receiverName || '',
    receiverPhone: data.receiverPhone || '',
    receiverAddress: data.receiverAddress || '',
    remark: data.remark || '',
    adminRemark: '',
    cancelReason: null,
    cancelTime: null,
    createdAt: now,
    updatedAt: now,
  };

  orders.push(newOrder);
  nextOrderId++;

  // 创建订单商品明细
  if (data.items && Array.isArray(data.items)) {
    data.items.forEach(item => {
      orderItems.push({
        id: nextOrderItemId,
        orderId: newOrder.id,
        productId: item.productId || 0,
        productName: item.productName || '商品',
        productImage: item.productImage || 'https://via.placeholder.com/100',
        skuId: item.skuId || 0,
        skuSpec: item.skuSpec || '默认规格',
        price: item.price || 0,
        quantity: item.quantity || 1,
        totalPrice: (item.price || 0) * (item.quantity || 1),
      });
      nextOrderItemId++;
    });
  }

  // 记录操作日志
  orderLogs.push({
    id: nextOrderLogId,
    orderId: newOrder.id,
    action: 'created',
    description: '管理员创建订单',
    operator: data.operator || '系统管理员',
    operatorId: data.operatorId || 1,
    createdAt: now,
  });
  nextOrderLogId++;

  return getOrderDetail(newOrder.id);
}

/** 取消订单 */
function cancelOrder(id, reason, operator) {
  const order = orders.find(o => o.id === id);
  if (!order) return null;
  validateTransition(order.status, 'canceled');

  const now = new Date().toISOString();
  order.status = 'canceled';
  order.cancelReason = reason;
  order.cancelTime = now;
  order.updatedAt = now;

  orderLogs.push({
    id: nextOrderLogId,
    orderId: id,
    action: 'canceled',
    description: `订单取消，原因：${reason}`,
    operator: operator || '系统管理员',
    operatorId: 1,
    createdAt: now,
  });
  nextOrderLogId++;

  return getOrderDetail(id);
}

/** 订单发货 */
function shipOrder(id, { company, trackingNo }, operator) {
  const order = orders.find(o => o.id === id);
  if (!order) return null;
  validateTransition(order.status, 'shipped');

  const now = new Date().toISOString();
  order.status = 'shipped';
  order.updatedAt = now;

  // 创建物流记录
  logistics.push({
    id: nextLogisticsId,
    orderId: id,
    company,
    trackingNo,
    shipTime: now,
    estimatedArrival: null,
    traces: [
      { time: now, status: '已揽收', location: '集散中心' },
    ],
  });
  nextLogisticsId++;

  orderLogs.push({
    id: nextOrderLogId,
    orderId: id,
    action: 'shipped',
    description: `${company}发货，运单号 ${trackingNo}`,
    operator: operator || '系统管理员',
    operatorId: 1,
    createdAt: now,
  });
  nextOrderLogId++;

  return getOrderDetail(id);
}

/** 确认收货 */
function confirmOrder(id, operator) {
  const order = orders.find(o => o.id === id);
  if (!order) return null;
  validateTransition(order.status, 'completed');

  const now = new Date().toISOString();
  order.status = 'completed';
  order.updatedAt = now;

  orderLogs.push({
    id: nextOrderLogId,
    orderId: id,
    action: 'confirmed',
    description: '确认收货，订单完成',
    operator: operator || '系统管理员',
    operatorId: 1,
    createdAt: now,
  });
  nextOrderLogId++;

  return getOrderDetail(id);
}

/** 获取售后列表 */
function getAfterSaleList({ page = 1, pageSize = 10, status }) {
  let list = [...afterSales];

  if (status) {
    list = list.filter(a => a.status === status);
  }

  list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const total = list.length;
  const paged = list.slice((page - 1) * pageSize, page * pageSize);

  return { list: paged, total, page, pageSize };
}

/** 审核售后 */
function auditAfterSale(id, { action, result }, operator) {
  const afterSale = afterSales.find(a => a.id === id);
  if (!afterSale) return null;
  if (afterSale.status !== 'pending') {
    throw new Error('售后申请已处理，无法重复审核');
  }

  const order = orders.find(o => o.id === afterSale.orderId);
  if (!order) return null;

  const now = new Date().toISOString();

  if (action === 'approved') {
    afterSale.status = 'completed';
    afterSale.auditResult = result || '审核通过';
    afterSale.auditTime = now;
    afterSale.completedTime = now;
    afterSale.updatedAt = now;

    order.status = 'completed';
    order.updatedAt = now;

    orderLogs.push({
      id: nextOrderLogId,
      orderId: order.id,
      action: 'refunded',
      description: `售后审核通过，退款 ${afterSale.refundAmount} 元。审核意见：${result || '审核通过'}`,
      operator: operator || '系统管理员',
      operatorId: 1,
      createdAt: now,
    });
    nextOrderLogId++;
  } else if (action === 'rejected') {
    afterSale.status = 'rejected';
    afterSale.auditResult = result || '审核拒绝';
    afterSale.auditTime = now;
    afterSale.updatedAt = now;

    order.status = 'shipped';
    order.updatedAt = now;

    orderLogs.push({
      id: nextOrderLogId,
      orderId: order.id,
      action: 'remark',
      description: `售后审核拒绝，订单恢复至已发货状态。拒绝理由：${result || '审核拒绝'}`,
      operator: operator || '系统管理员',
      operatorId: 1,
      createdAt: now,
    });
    nextOrderLogId++;
  } else {
    throw new Error('无效的审核操作，只支持 approved 或 rejected');
  }

  return afterSale;
}

/** 获取物流轨迹 */
function getLogistics(orderId) {
  return logistics.find(l => l.orderId === orderId) || null;
}

/** 获取操作日志 */
function getOrderLogs(orderId) {
  return orderLogs
    .filter(log => log.orderId === orderId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

module.exports = {
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
  validateTransition,
  ALLOWED_TRANSITIONS,
};
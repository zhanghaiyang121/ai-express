/**
 * Mock 用户数据
 */

const users = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    nickname: '系统管理员',
    avatar: 'https://via.placeholder.com/100',
    email: 'admin@example.com',
    phone: '13800000001',
    role: 'admin',
    status: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-09T00:00:00.000Z'
  },
  {
    id: 2,
    username: 'zhangsan',
    password: '123456',
    nickname: '张三',
    avatar: 'https://via.placeholder.com/100',
    email: 'zhangsan@example.com',
    phone: '13800000002',
    role: 'editor',
    status: 1,
    createdAt: '2026-03-15T00:00:00.000Z',
    updatedAt: '2026-07-20T00:00:00.000Z'
  },
  {
    id: 3,
    username: 'lisi',
    password: '123456',
    nickname: '李四',
    avatar: 'https://via.placeholder.com/100',
    email: 'lisi@example.com',
    phone: '13800000003',
    role: 'viewer',
    status: 0,
    createdAt: '2026-05-10T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z'
  }
];

/**
 * 根据用户名查找用户
 * @param {string} username
 * @returns {object|null}
 */
function findByUsername(username) {
  return users.find(u => u.username === username) || null;
}

/**
 * 根据ID查找用户（去敏：移除password字段）
 * @param {number} id
 * @returns {object|null}
 */
function findById(id) {
  const user = users.find(u => u.id === id);
  if (!user) return null;
  // 返回用户信息，剔除密码字段
  const { password, ...userInfo } = user;
  return userInfo;
}

module.exports = { findByUsername, findById };
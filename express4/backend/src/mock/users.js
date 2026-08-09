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
  },
  {
    id: 4,
    username: 'wangwu',
    password: '123456',
    nickname: '王五',
    avatar: 'https://via.placeholder.com/100',
    email: 'wangwu@example.com',
    phone: '13800000004',
    role: 'editor',
    status: 1,
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-07-15T00:00:00.000Z'
  },
  {
    id: 5,
    username: 'zhaoliu',
    password: '123456',
    nickname: '赵六',
    avatar: 'https://via.placeholder.com/100',
    email: 'zhaoliu@example.com',
    phone: '13800000005',
    role: 'viewer',
    status: 1,
    createdAt: '2026-07-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z'
  }
];

// 自增 ID 计数器
let nextId = users.length + 1;

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

/**
 * 获取所有用户列表（去敏）
 * @returns {Array}
 */
function findAll() {
  return users.map(({ password, ...userInfo }) => userInfo);
}

/**
 * 更新用户信息
 * @param {number} id
 * @param {object} data
 * @returns {object|null}
 */
function updateUser(id, data) {
  const user = users.find(u => u.id === id);
  if (!user) return null;

  // 只允许更新部分字段
  const allowedFields = ['nickname', 'email', 'phone', 'role', 'status'];
  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      user[field] = data[field];
    }
  }
  user.updatedAt = new Date().toISOString();
  return user;
}

/**
 * 删除用户（软删除：设置 status=0）
 * @param {number} id
 * @returns {boolean}
 */
function deleteUser(id) {
  const user = users.find(u => u.id === id);
  if (!user) return false;

  user.status = 0;
  user.updatedAt = new Date().toISOString();
  return true;
}

module.exports = { findByUsername, findById, findAll, updateUser, deleteUser };
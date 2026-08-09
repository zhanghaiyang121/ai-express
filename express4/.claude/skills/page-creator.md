# 页面创建流程 (Page Creator)

## 1. 概述

本技能定义了 Express4 项目中创建完整前端页面的标准化流程。它将组件创建（component-creator）和 Web 设计（web-design）两大技能整合为端到端的页面交付流程，确保每个页面都包含完整的前端界面、路由配置和后端接口对接。

---

## 2. 适用场景

- 创建新页面（列表/表单/详情/仪表盘）
- 从零搭建一个完整的 CRUD 功能模块
- 为管理后台添加新的功能页面

---

## 3. 创建流程

### 阶段 1：规划 (Plan)

#### 1.1 页面信息收集
```markdown
## 页面创建规划

**页面信息**:
- 页面名称: [如 用户管理]
- 页面路径: [如 /users]
- 页面类型: [列表页 / 表单页 / 详情页]

**功能需求**:
- 需要哪些操作: [查看列表 / 创建 / 编辑 / 删除 / 查看详情]
- 是否需要搜索/筛选: [是/否，说明筛选条件]
- 是否需要分页: [是/否]
- 是否需要导出: [是/否]

**数据模型**:
- 主实体: [如 User]
- 主要字段: [字段名:类型]
- 关联数据: [是否需要加载其他关联数据]

**API 接口**:
- 列表: `GET /api/v1/users`
- 创建: `POST /api/v1/users`
- 更新: `PUT /api/v1/users/:id`
- 删除: `DELETE /api/v1/users/:id`
- 详情: `GET /api/v1/users/:id`
```

#### 1.2 文件清单
```markdown
## 需要创建的文件

### 前端文件 (如适用)
- [ ] src/pages/UserList/index.html      - 页面模板
- [ ] src/pages/UserList/style.css       - 页面样式
- [ ] src/pages/UserList/index.ts        - 页面逻辑
- [ ] src/components/UserForm.ts         - 用户表单组件
- [ ] src/components/UserTable.ts        - 用户表格组件

### 后端文件
- [ ] src/controllers/user.controller.ts - 控制器
- [ ] src/services/user.service.ts       - 服务层
- [ ] src/validators/user.validator.ts   - 验证器
- [ ] src/routes/user.routes.ts          - 路由定义

### 测试文件
- [ ] src/services/user.service.test.ts
- [ ] src/controllers/user.controller.test.ts
```

---

### 阶段 2：后端实现 (Backend)

#### 2.1 创建路由
```typescript
// src/routes/user.routes.ts
import { Router } from 'express';
import {
  getUsersHandler,
  getUserByIdHandler,
  createUserHandler,
  updateUserHandler,
  deleteUserHandler,
} from '../controllers/user.controller';
import { validate } from '../validators/user.validator';
import { createUserSchema, updateUserSchema } from '../validators/user.validator';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// 所有路由需要认证
router.use(authMiddleware);

router.get('/', getUsersHandler);
router.get('/:id', getUserByIdHandler);
router.post('/', validate(createUserSchema), createUserHandler);
router.put('/:id', validate(updateUserSchema), updateUserHandler);
router.delete('/:id', deleteUserHandler);

export default router;
```

#### 2.2 创建控制器
```typescript
// src/controllers/user.controller.ts
import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { UserRepository } from '../repositories/user.repository';

const userService = new UserService(new UserRepository());

export async function getUsersHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { page = '1', limit = '20', search, sort } = req.query;
    const result = await userService.findAll({
      page: Number(page),
      limit: Number(limit),
      search: search as string | undefined,
      sort: sort as string | undefined,
    });
    res.json({
      success: true,
      code: 200,
      message: '获取用户列表成功',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
}

export async function getUserByIdHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await userService.findById(Number(req.params.id));
    res.json({
      success: true,
      code: 200,
      message: '获取用户详情成功',
      data: user,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
}

export async function createUserHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await userService.create(req.body);
    res.status(201).json({
      success: true,
      code: 201,
      message: '创建用户成功',
      data: user,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
}

export async function updateUserHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await userService.update(Number(req.params.id), req.body);
    res.json({
      success: true,
      code: 200,
      message: '更新用户成功',
      data: user,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteUserHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await userService.delete(Number(req.params.id));
    res.json({
      success: true,
      code: 200,
      message: '删除用户成功',
      data: null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
}
```

#### 2.3 注册路由到主应用
```typescript
// src/routes/index.ts - 添加新路由
import userRoutes from './user.routes';

// 在现有路由注册处添加
router.use('/users', userRoutes);
```

---

### 阶段 3：前端实现 (Frontend)

#### 3.1 页面结构（管理后台模板）
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>用户管理 - 管理后台</title>
  <link rel="stylesheet" href="/styles/user-list.css">
</head>
<body>
  <div class="app-layout">
    <!-- 侧边栏 -->
    <aside class="sider" id="sider">
      <!-- 侧边栏内容 -->
    </aside>

    <!-- 主内容区 -->
    <main class="content">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="page-header__left">
          <nav class="breadcrumb">
            <a href="/">首页</a>
            <span>/</span>
            <span>用户管理</span>
          </nav>
          <h1 class="page-title">用户管理</h1>
        </div>
        <div class="page-header__right">
          <button class="btn btn-primary" id="btn-create">
            + 新建用户
          </button>
        </div>
      </div>

      <!-- 筛选区 -->
      <div class="filter-bar">
        <div class="filter-bar__search">
          <input
            type="text"
            class="input"
            placeholder="搜索用户名、邮箱..."
            id="search-input"
          />
        </div>
        <div class="filter-bar__actions">
          <button class="btn btn-default" id="btn-search">搜索</button>
          <button class="btn btn-link" id="btn-reset">重置</button>
        </div>
      </div>

      <!-- 数据表格 -->
      <div class="card">
        <table class="table" id="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>用户名</th>
              <th>邮箱</th>
              <th>角色</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody id="table-body">
            <!-- 动态渲染 -->
          </tbody>
        </table>

        <!-- 空状态 -->
        <div class="empty-state" id="empty-state" style="display:none;">
          <div class="empty-state__icon">📋</div>
          <p class="empty-state__text">暂无数据</p>
          <button class="btn btn-primary" id="btn-empty-create">
            新建用户
          </button>
        </div>

        <!-- 加载状态 -->
        <div class="loading-state" id="loading-state">
          <div class="spinner"></div>
          <p>加载中...</p>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination" id="pagination">
        <!-- 动态渲染 -->
      </div>
    </main>
  </div>

  <!-- 创建/编辑弹窗 -->
  <div class="modal-overlay" id="user-modal" style="display:none;">
    <div class="modal">
      <div class="modal__header">
        <h3 class="modal__title" id="modal-title">新建用户</h3>
        <button class="modal__close" id="modal-close">&times;</button>
      </div>
      <div class="modal__body">
        <form id="user-form">
          <div class="form-group">
            <label class="form-label" for="name">用户名</label>
            <input type="text" class="input" id="name" required minlength="2" />
            <span class="form-error" id="name-error"></span>
          </div>
          <div class="form-group">
            <label class="form-label" for="email">邮箱</label>
            <input type="email" class="input" id="email" required />
            <span class="form-error" id="email-error"></span>
          </div>
          <div class="form-group">
            <label class="form-label" for="role">角色</label>
            <select class="input" id="role">
              <option value="user">普通用户</option>
              <option value="editor">编辑</option>
              <option value="admin">管理员</option>
            </select>
          </div>
        </form>
      </div>
      <div class="modal__footer">
        <button class="btn btn-default" id="modal-cancel">取消</button>
        <button class="btn btn-primary" id="modal-submit">保存</button>
      </div>
    </div>
  </div>

  <script src="/scripts/user-list.js"></script>
</body>
</html>
```

#### 3.2 页面逻辑（TypeScript/JavaScript）
```typescript
// src/public/scripts/user-list.ts

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// 状态管理
const state = {
  users: [] as User[],
  pagination: {} as Pagination,
  search: '',
  loading: false,
  currentUserId: null as number | null,
};

// API 调用
const api = {
  async fetchUsers(page: number = 1): Promise<void> {
    state.loading = true;
    render();
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
        ...(state.search ? { search: state.search } : {}),
      });
      const response = await fetch(`/api/v1/users?${params}`);
      const result = await response.json();
      if (result.success) {
        state.users = result.data;
        state.pagination = result.pagination;
      }
    } catch (error) {
      showMessage('加载失败，请重试', 'error');
    } finally {
      state.loading = false;
      render();
    }
  },

  async createUser(data: Partial<User>): Promise<boolean> {
    try {
      const response = await fetch('/api/v1/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (result.success) {
        showMessage('创建成功', 'success');
        return true;
      }
      throw new Error(result.message);
    } catch (error) {
      showMessage((error as Error).message, 'error');
      return false;
    }
  },

  async deleteUser(id: number): Promise<boolean> {
    try {
      const response = await fetch(`/api/v1/users/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        showMessage('删除成功', 'success');
        return true;
      }
      throw new Error(result.message);
    } catch (error) {
      showMessage((error as Error).message, 'error');
      return false;
    }
  },
};

// 渲染函数
function render(): void {
  renderTable();
  renderPagination();
  renderLoadingState();
  renderEmptyState();
}

function renderTable(): void {
  const tbody = document.getElementById('table-body')!;
  tbody.innerHTML = state.users
    .map(
      (user) => `
    <tr>
      <td>${user.id}</td>
      <td>${escapeHtml(user.name)}</td>
      <td>${escapeHtml(user.email)}</td>
      <td><span class="tag tag--${user.role}">${user.role}</span></td>
      <td>${formatDate(user.createdAt)}</td>
      <td class="table-actions">
        <button class="btn btn-link" onclick="editUser(${user.id})">编辑</button>
        <button class="btn btn-link btn-link--danger" onclick="deleteUser(${user.id})">删除</button>
      </td>
    </tr>
  `
    )
    .join('');
}

// 工具函数
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('zh-CN');
}

function showMessage(msg: string, type: 'success' | 'error'): void {
  // 实现消息提示
  alert(`${type === 'success' ? '✅' : '❌'} ${msg}`);
}

// 事件处理
function editUser(id: number): void {
  state.currentUserId = id;
  const user = state.users.find((u) => u.id === id);
  if (user) {
    (document.getElementById('name') as HTMLInputElement).value = user.name;
    (document.getElementById('email') as HTMLInputElement).value = user.email;
    (document.getElementById('role') as HTMLSelectElement).value = user.role;
    document.getElementById('modal-title')!.textContent = '编辑用户';
    document.getElementById('user-modal')!.style.display = 'flex';
  }
}

async function deleteUser(id: number): Promise<void> {
  if (confirm('确定要删除该用户吗？此操作不可恢复。')) {
    const success = await api.deleteUser(id);
    if (success) {
      await api.fetchUsers(state.pagination.page);
    }
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  api.fetchUsers();

  // 搜索
  document.getElementById('btn-search')!.addEventListener('click', () => {
    state.search = (document.getElementById('search-input') as HTMLInputElement).value;
    api.fetchUsers(1);
  });

  // 弹出新建弹窗
  document.getElementById('btn-create')!.addEventListener('click', () => {
    state.currentUserId = null;
    (document.getElementById('user-form') as HTMLFormElement).reset();
    document.getElementById('modal-title')!.textContent = '新建用户';
    document.getElementById('user-modal')!.style.display = 'flex';
  });

  // 关闭弹窗
  document.getElementById('modal-close')!.addEventListener('click', () => {
    document.getElementById('user-modal')!.style.display = 'none';
  });
  document.getElementById('modal-cancel')!.addEventListener('click', () => {
    document.getElementById('user-modal')!.style.display = 'none';
  });

  // 提交表单
  document.getElementById('modal-submit')!.addEventListener('click', async () => {
    const data = {
      name: (document.getElementById('name') as HTMLInputElement).value,
      email: (document.getElementById('email') as HTMLInputElement).value,
      role: (document.getElementById('role') as HTMLSelectElement).value,
    };

    let success: boolean;
    if (state.currentUserId) {
      success = await api.updateUser(state.currentUserId, data);
    } else {
      success = await api.createUser(data);
    }

    if (success) {
      document.getElementById('user-modal')!.style.display = 'none';
      await api.fetchUsers(state.pagination.page);
    }
  });
});
```

---

### 阶段 4：测试验证 (Testing)

#### 4.1 功能测试清单
```markdown
## 页面测试清单

### 后端 API 测试
- [ ] GET /api/v1/users 返回正确的分页列表
- [ ] POST /api/v1/users 创建用户成功，返回 201
- [ ] POST /api/v1/users 缺少必填字段，返回 422
- [ ] GET /api/v1/users/:id 存在的 ID 返回用户
- [ ] GET /api/v1/users/:id 不存在的 ID 返回 404
- [ ] PUT /api/v1/users/:id 更新成功
- [ ] DELETE /api/v1/users/:id 删除成功

### 前端功能测试
- [ ] 页面加载时显示 loading 状态
- [ ] 列表正常渲染用户数据
- [ ] 空数据时显示空状态
- [ ] 搜索功能正常工作
- [ ] 分页切换正常
- [ ] 新建弹窗打开和关闭
- [ ] 表单提交后列表刷新
- [ ] 删除确认弹窗
- [ ] 删除后列表刷新
- [ ] 错误提示正常显示

### 边界测试
- [ ] 网络错误时的错误提示
- [ ] 超长文本的截断和 Tooltip
- [ ] 快速双击提交按钮的防抖
```

---

### 阶段 5：集成与注册

#### 5.1 注册路由
```typescript
// 确保在主路由文件中注册
// src/routes/index.ts
import userRoutes from './user.routes';
router.use('/users', userRoutes);
```

#### 5.2 添加导航菜单
```html
<!-- 侧边栏导航 -->
<li class="nav-item">
  <a href="/users" class="nav-link">
    <span class="nav-icon">👥</span>
    <span>用户管理</span>
  </a>
</li>
```

---

## 4. 快速启动

说以下任意一句即可触发：
> "创建一个 [功能名称] 的 [列表/表单/详情] 页面"
> "搭建一个完整的 [CRUD] 模块，实体为 [Entity]"
> "为管理后台添加 [页面名称] 页面"

AI 助手将先收集页面需求信息，然后按照上述 5 个阶段依次创建后端路由/控制器、前端页面/样式和测试用例。

---

## 5. 检查清单

页面交付前确认：
- [ ] 后端路由已注册到主路由文件
- [ ] 控制器包含完整的 CRUD 方法
- [ ] 请求参数都经过 Validator 验证
- [ ] 前端页面包含完整的 HTML 结构
- [ ] 页面逻辑覆盖所有用户交互
- [ ] 错误状态、空状态、加载状态已处理
- [ ] 导航菜单已添加入口
- [ ] API 测试全部通过
- [ ] 前端各功能点手动测试通过
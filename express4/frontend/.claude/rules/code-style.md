# 代码风格规范 (Code Style)

## 1. 概述

本规范定义了项目中所有代码必须遵守的风格约定，确保代码库的一致性、可读性和可维护性。适用于任何使用 JavaScript/TypeScript 的前后端项目。

---

## 2. 通用规范

### 2.1 缩进与空格
- 使用 **2 个空格** 进行缩进，禁止使用 Tab
- 文件末尾保留一个空行
- 行尾不允许存在多余空格
- 每行代码不超过 **120** 个字符

### 2.2 编码
- 所有源文件使用 **UTF-8** 编码
- 文件结尾使用 **LF** 换行符

### 2.3 分号
- 所有语句必须以分号 `;` 结尾
- 不使用 ASI（自动分号插入）依赖

### 2.4 引号
- 优先使用 **单引号** `'`，除非字符串内包含单引号
- 模板字符串（反引号）仅在需要变量插值时使用

---

## 3. JavaScript / TypeScript 规范

### 3.1 变量声明
```typescript
// ✅ 推荐：使用 const 和 let
const MAX_SIZE = 100;
let currentIndex = 0;

// ❌ 禁止：使用 var
var oldVariable = 'deprecated';
```

- 优先使用 `const`，仅在变量需要重新赋值时使用 `let`
- 禁止使用 `var`

### 3.2 命名规范

| 类型 | 风格 | 示例 |
|------|------|------|
| 变量/函数 | camelCase | `getUserById`, `userName` |
| 类/接口/类型 | PascalCase | `UserService`, `IUserData` |
| 常量 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT`, `API_BASE_URL` |
| 文件名 | kebab-case | `user-service.ts`, `auth-guard.ts` |
| 私有属性 | 下划线前缀或 `#` | `_internalState` / `#privateField` |

### 3.3 函数
```typescript
// ✅ 推荐：箭头函数用于回调
const doubled = numbers.map(n => n * 2);

// ✅ 推荐：普通函数用于命名函数
function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ✅ 推荐：async/await 处理异步
async function fetchData(): Promise<Data> {
  const response = await fetch('/api/data');
  return response.json();
}
```

- 函数应保持单一职责，不超过 **30 行**
- 参数不超过 **4 个**，否则使用对象参数
- 必须为公共函数添加 JSDoc 注释

### 3.4 TypeScript 类型
```typescript
// ✅ 推荐：显式类型注解
interface User {
  id: number;
  name: string;
  email: string;
}

// ✅ 推荐：使用 type 定义联合类型/交叉类型
type Status = 'active' | 'inactive' | 'pending';

// ❌ 避免：不必要的 any 类型
function process(data: any): any { ... }
```

- 禁止使用 `any`，使用 `unknown` 替代
- 优先使用 `interface` 而非 `type` 定义对象结构
- 公共接口/类型应显式导出

---

## 4. 项目结构规范

### 4.1 通用推荐结构

```
src/
├── controllers/      # 请求处理层 (后端) / 页面逻辑层 (前端)
├── services/         # 业务逻辑层
├── models/           # 数据模型/类型定义
├── utils/            # 通用工具函数
├── validators/       # 数据校验
├── middlewares/      # 中间件/拦截器
├── routes/           # 路由配置 (后端)
├── components/       # UI 组件 (前端)
├── hooks/            # 自定义 Hooks (前端)
├── pages/            # 页面组件 (前端)
└── assets/           # 静态资源 (前端)
```

### 4.2 后端通用规范
- 路由路径使用复数名词（`/users` 而非 `/user`）
- 控制器处理函数以 `Handler` 后缀命名
- 始终通过统一错误处理机制传递异常
- 配置文件放在专用目录（`config/` 或使用环境变量）

### 4.3 前端通用规范
- 页面组件一个文件一个默认导出
- 可复用 UI 组件放在 `components/` 目录
- 状态管理逻辑与 UI 渲染逻辑分离
- 自定义 hooks 以 `use` 前缀命名

---

## 5. 导入顺序

```typescript
// 1. 运行时核心模块 (Node.js / polyfill)
import path from 'path';

// 2. 第三方库
import express from 'express';
import React from 'react';

// 3. 项目内部模块
import { UserService } from '../services/user.service';
import { logger } from '../utils/logger';

// 4. 类型导入
import type { Request, Response } from 'express';
```

- 每组之间用空行分隔
- 同组内按字母顺序排列

---

## 6. 注释规范

### 6.1 JSDoc
```typescript
/**
 * 根据 ID 获取资源
 * @param id - 资源唯一标识
 * @returns 资源对象，不存在时返回 null
 * @throws {NotFoundError} 资源不存在时抛出
 */
async function getById(id: number): Promise<Resource | null> {
  // ...
}
```

### 6.2 行内注释
- 注释说明 **为什么** 这样做，而非 **做了什么**
- 使用 `//` 进行单行注释，`/* */` 进行多行注释
- TODO/FIXME 标记需包含负责人和时间：`// TODO(zhangsan): 2024-12-31 重构此方法`

---

## 7. 格式化工具

推荐使用以下工具自动格式化：

- **Prettier** — 代码格式化
- **ESLint** — 代码质量检查
- **Husky + lint-staged** — Git 提交前自动检查

`.prettierrc` 配置示例：
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 120,
  "endOfLine": "lf"
}
```

---

## 8. Git 提交规范

### 8.1 提交信息格式
```
<type>(<scope>): <subject>

<body>

<footer>
```

### 8.2 Type 类型
| Type | 说明 |
|------|------|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `docs` | 文档变更 |
| `style` | 代码格式（不影响功能） |
| `refactor` | 重构 |
| `perf` | 性能优化 |
| `test` | 测试相关 |
| `chore` | 构建/工具变更 |

### 8.3 示例
```
feat(user): 添加用户登录功能

- 实现 JWT token 签发
- 添加密码加密验证
- 新增 /auth/login 路由

Closes #123
```

---

## 9. 检查清单

在提交代码前，请确认：
- [ ] 代码已通过 ESLint 检查
- [ ] 代码已通过 Prettier 格式化
- [ ] 所有公共函数有 JSDoc 注释
- [ ] 变量命名符合规范
- [ ] 没有使用 `var` 或 `any`
- [ ] 提交信息符合 Conventional Commits 规范
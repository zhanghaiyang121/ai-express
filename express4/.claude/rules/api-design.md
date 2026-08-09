# API 设计规范 (API Design)

## 1. 概述

本规范定义了项目中 RESTful API 的设计原则、URL 结构、请求/响应格式和错误处理标准。适用于任何后端技术栈（Express、Fastify、Koa、Spring、Django 等）。

---

## 2. RESTful URL 设计

### 2.1 资源命名
```
✅ 推荐
GET    /api/users           # 获取用户列表
GET    /api/users/:id       # 获取单个用户
POST   /api/users           # 创建用户
PUT    /api/users/:id       # 更新用户（全量）
PATCH  /api/users/:id       # 更新用户（部分）
DELETE /api/users/:id       # 删除用户

❌ 避免
GET    /api/getUsers        # 不要在 URL 中使用动词
POST   /api/user/create     # 动词应用 HTTP Method 表示
GET    /api/user/:id        # 资源名应用复数形式
```

### 2.2 URL 设计原则
- 资源名使用**复数名词**（`/users` 而非 `/user`）
- 使用**短横线**分隔单词（`/order-items` 而非 `/orderItems`）
- 嵌套层级不超过 **2 级**（`/users/:id/orders` 而非 `/users/:id/orders/:oid/items`）
- 深层关联资源推荐使用独立端点或查询参数展开

### 2.3 子资源
```
GET    /api/users/:id/orders         # 获取用户的订单列表
GET    /api/users/:id/orders/:oid    # 获取用户的特定订单
POST   /api/users/:id/orders         # 为用户创建订单
```

### 2.4 版本控制
```
/api/v1/users
/api/v2/users
```
- 使用 URL 路径版本控制（`/vN/`）或请求头（`Accept: application/vnd.api.v2+json`）
- 主版本号变更时增加版本号（破坏性变更）
- 向后兼容的变更不改变版本号

---

## 3. 请求规范

### 3.1 HTTP 方法语义

| 方法 | 语义 | 幂等性 | 安全性 |
|------|------|--------|--------|
| `GET` | 获取资源 | ✅ 幂等 | ✅ 安全 |
| `POST` | 创建资源 | ❌ 非幂等 | ❌ |
| `PUT` | 全量更新 | ✅ 幂等 | ❌ |
| `PATCH` | 部分更新 | ❌ 非幂等 | ❌ |
| `DELETE` | 删除资源 | ✅ 幂等 | ❌ |

### 3.2 请求头
```http
POST /api/v1/users HTTP/1.1
Content-Type: application/json
Authorization: Bearer <token>
Accept: application/json
X-Request-ID: <uuid>
```

- 始终设置 `Content-Type`（通常为 `application/json`）
- 认证令牌通过 `Authorization` 头传递
- 推荐携带 `X-Request-ID` 用于请求追踪和日志关联

### 3.3 分页与查询

#### 分页请求
```
GET /api/v1/users?page=1&limit=20&sort=createdAt:desc
```

| 参数 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| `page` | number | 页码（1-based） | `1` |
| `limit` | number | 每页条数 | `20` |
| `sort` | string | 排序字段:方向 | `createdAt:desc` |
| `search` | string | 搜索关键词 | - |

#### 游标分页（适用于大数据集/实时数据）
```
GET /api/v1/users?cursor=eyJpZCI6MTAwfQ&limit=20
```

### 3.4 请求体规范
```json
{
  "name": "张三",
  "email": "zhangsan@example.com",
  "role": "editor"
}
```

- Body 使用 JSON 格式（除非文件上传等场景）
- 字段名使用 camelCase
- 不需要的字段不应传递
- 空值用 `null` 表示，而非省略字段

---

## 4. 响应规范

### 4.1 统一响应格式

#### 成功响应（单对象）
```json
{
  "success": true,
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": 1,
    "name": "张三",
    "email": "zhangsan@example.com"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### 列表响应
```json
{
  "success": true,
  "code": 200,
  "message": "操作成功",
  "data": [
    { "id": 1, "name": "张三" },
    { "id": 2, "name": "李四" }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### 错误响应
```json
{
  "success": false,
  "code": 404,
  "message": "用户不存在",
  "error": {
    "type": "NOT_FOUND",
    "detail": "User with id 999 not found",
    "fields": {}
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 4.2 响应字段定义

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `success` | boolean | ✅ | 请求是否成功 |
| `code` | number | ✅ | HTTP 状态码 |
| `message` | string | ✅ | 人类可读的提示信息 |
| `data` | any | 条件 | 成功时的响应数据 |
| `error` | object | 条件 | 失败时的错误详情 |
| `pagination` | object | 条件 | 列表时的分页信息 |
| `timestamp` | string | ✅ | ISO 8601 时间戳 |

### 4.3 HTTP 状态码速查

#### 成功 (2xx)
| 状态码 | 使用场景 |
|--------|----------|
| `200 OK` | 请求成功（GET, PUT, PATCH） |
| `201 Created` | 资源创建成功（POST） |
| `204 No Content` | 操作成功但无响应体（DELETE） |

#### 客户端错误 (4xx)
| 状态码 | 使用场景 |
|--------|----------|
| `400 Bad Request` | 请求格式/参数错误 |
| `401 Unauthorized` | 未认证 |
| `403 Forbidden` | 已认证但无权限 |
| `404 Not Found` | 资源不存在 |
| `409 Conflict` | 资源冲突（如唯一键重复） |
| `422 Unprocessable Entity` | 参数合法但语义错误（如验证失败） |
| `429 Too Many Requests` | 请求频率超限 |

#### 服务端错误 (5xx)
| 状态码 | 使用场景 |
|--------|----------|
| `500 Internal Server Error` | 未预期的服务端错误 |
| `503 Service Unavailable` | 服务维护/过载 |

---

## 5. 错误处理设计

### 5.1 通用错误模型
```typescript
// errors.ts - 框架无关的错误层次

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly errorType: string,
    message: string,
    public readonly fields: Record<string, string> = {},
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(404, 'NOT_FOUND', message);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', fields: Record<string, string> = {}) {
    super(422, 'VALIDATION_ERROR', message, fields);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(401, 'UNAUTHORIZED', message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access denied') {
    super(403, 'FORBIDDEN', message);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(409, 'CONFLICT', message);
  }
}
```

### 5.2 错误处理原则
- **分层处理**: 业务层抛出领域错误，框架层转换为 HTTP 响应
- **安全第一**: 生产环境不暴露堆栈信息（`detail` 字段模糊化）
- **类型明确**: 每种错误场景有对应的错误类型（NOT_FOUND, VALIDATION_ERROR 等）
- **保持日志**: 所有错误在服务端记录完整日志（含 traceId）

---

## 6. 安全设计

### 6.1 认证与授权
- **JWT Token**: Access Token 有效期 15 分钟 ~ 1 小时；Refresh Token 有效期 7 ~ 30 天
- **Token 传递**: 通过 `Authorization: Bearer <token>` 头传递
- **权限模型**: 推荐使用 RBAC（基于角色）或 ABAC（基于属性）

### 6.2 通用安全措施
- **HTTPS**: 生产环境强制使用 HTTPS
- **安全头**: 设置 `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security` 等
- **CORS**: 配置白名单，限制允许的来源域名
- **限流**: 对敏感端点（登录、注册、密码重置）实施速率限制
- **输入消毒**: 对所有用户输入进行转义和验证，防止 XSS/SQL 注入
- **依赖审计**: 定期检查第三方依赖的安全漏洞（`npm audit`）

### 6.3 敏感数据处理
- 不在 URL 中传递敏感参数（使用 POST Body）
- 不在日志中记录密码、Token 等敏感信息
- 响应中不返回密码哈希等内部数据
- 文件上传限制大小和 MIME 类型

---

## 7. 性能优化

### 7.1 服务端优化
- **响应压缩**: 启用 gzip/brotli 压缩
- **缓存策略**: 合理设置 `Cache-Control` 和 `ETag` 头
- **数据库优化**: 只查询需要的字段、添加适当索引、使用连接池
- **异步处理**: 耗时操作（如邮件发送）使用消息队列异步处理

### 7.2 API 设计优化
- **字段裁剪**: 支持 `?fields=id,name,email` 选择性返回字段
- **资源嵌套展开**: 支持 `?include=orders,profile` 按需加载关联资源
- **批量操作**: 提供批量创建/更新接口减少请求次数
- **列表默认轻量**: 列表接口返回核心字段，详情接口返回完整字段

---

## 8. API 文档

### 8.1 必须提供
- [ ] 接口路径和 HTTP 方法
- [ ] 路径参数、查询参数、请求体说明
- [ ] 响应数据结构（含字段含义）
- [ ] 可能的错误码及原因
- [ ] 认证/授权要求
- [ ] 调用示例（curl 命令）

### 8.2 推荐工具
- **OpenAPI / Swagger** — API 规范与文档生成标准
- **Postman / Insomnia** — 接口调试与集合管理
- **Stoplight / Redoc** — API 文档渲染

---

## 9. API 变更管理

### 9.1 兼容性规则
| 变更类型 | 是否向后兼容 | 是否需改版本号 |
|----------|-------------|---------------|
| 新增接口 | ✅ 兼容 | ❌ |
| 新增可选字段 | ✅ 兼容 | ❌ |
| 新增必填字段 | ❌ 不兼容 | ✅ 主版本号 |
| 删除字段 | ❌ 不兼容 | ✅ 主版本号 |
| 修改字段类型 | ❌ 不兼容 | ✅ 主版本号 |
| 修改错误码 | ❌ 不兼容 | ✅ 主版本号 |

### 9.2 废弃策略
- 废弃接口须提前通知（至少 1 个版本周期）
- 响应头中加入 `Deprecation: true` 和 `Sunset: <日期>`
- 接口文档中标记 `@deprecated`

---

## 10. 检查清单

发布 API 前：
- [ ] URL 使用复数名词，无动词
- [ ] 响应格式统一（success, code, message, data）
- [ ] HTTP 状态码使用正确
- [ ] 所有用户输入经过验证
- [ ] 错误处理覆盖所有异常分支
- [ ] 认证和授权已实现（如需要）
- [ ] CORS 和安全头已配置
- [ ] 敏感端点已添加速率限制
- [ ] 敏感数据不出现在响应中
- [ ] API 文档已更新
# 电商后台管理系统 - API 接口文档

> **Base URL**: `http://localhost:3000/api`
>
> **版本**: v1.0  
> **更新日期**: 2026-08-09

---

## 通用约定

### 请求格式

| 项目 | 说明 |
|------|------|
| Content-Type | `application/json` |
| 认证方式 | Bearer Token（`Authorization: Bearer <token>`） |

### 通用响应结构

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {}
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| code | number | 状态码，200 表示成功 |
| message | string | 提示信息 |
| data | object / array / null | 响应数据 |

### HTTP 状态码

| 状态码 | 含义 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 未登录或 Token 无效/过期 |
| 403 | 无权限（账号被禁用） |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 1. 系统

### 1.1 健康检查

**接口**: `GET /api/health`

**描述**: 检查服务是否正常运行。

**请求示例**:

```
GET /api/health
```

**响应示例**:

```json
{
  "code": 200,
  "message": "ok",
  "data": { "timestamp": 1755187200000 }
}
```

---

## 2. 认证模块 - M01

### 2.1 用户登录

**接口**: `POST /api/v1/auth/login`

**描述**: 使用用户名和密码登录，成功后返回 JWT Token。

**请求体**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | 是 | 用户名 |
| password | string | 是 | 密码 |

**请求示例**:

```json
{
  "username": "admin",
  "password": "admin123"
}
```

**成功响应**:

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin",
      "nickname": "系统管理员",
      "avatar": "https://via.placeholder.com/100",
      "email": "admin@example.com",
      "phone": "13800000001",
      "role": "admin",
      "status": 1,
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-08-09T00:00:00.000Z"
    }
  }
}
```

**错误响应**:

```json
// 参数为空 (400)
{
  "code": 400,
  "message": "用户名和密码不能为空",
  "data": null
}

// 用户名或密码错误 (401)
{
  "code": 401,
  "message": "用户名或密码错误",
  "data": null
}

// 账号被禁用 (403)
{
  "code": 403,
  "message": "账号已被禁用，请联系管理员",
  "data": null
}
```

---

### 2.2 获取当前用户信息

**接口**: `GET /api/v1/auth/me`

**描述**: 获取当前登录用户的详细信息。

**请求头**:

| 参数 | 说明 |
|------|------|
| Authorization | Bearer `<token>` |

**请求示例**:

```
GET /api/v1/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**成功响应**:

```json
{
  "code": 200,
  "message": "获取用户信息成功",
  "data": {
    "id": 1,
    "username": "admin",
    "nickname": "系统管理员",
    "avatar": "https://via.placeholder.com/100",
    "email": "admin@example.com",
    "phone": "13800000001",
    "role": "admin",
    "status": 1,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-08-09T00:00:00.000Z"
  }
}
```

**错误响应**:

```json
// Token 缺失 (401)
{
  "code": 401,
  "message": "未登录或 Token 缺失",
  "data": null
}

// Token 过期 (401)
{
  "code": 401,
  "message": "Token 已过期，请重新登录",
  "data": null
}

// Token 无效 (401)
{
  "code": 401,
  "message": "Token 无效",
  "data": null
}

// 用户不存在 (404)
{
  "code": 404,
  "message": "用户不存在",
  "data": null
}
```

---

## 3. 用户管理模块 - M02

> **注意**: 以下所有接口都需要在请求头中携带 `Authorization: Bearer <token>`。

### 3.1 用户列表

**接口**: `GET /api/v1/users`

**描述**: 分页获取用户列表，支持关键词搜索和角色筛选。

**请求参数**:

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | number | 否 | 1 | 页码 |
| pageSize | number | 否 | 10 | 每页数量 |
| keyword | string | 否 | - | 搜索关键词（用户名/昵称/邮箱） |
| role | string | 否 | - | 角色筛选（admin / editor / viewer） |

**请求示例**:

```
GET /api/v1/users?page=1&pageSize=10&keyword=zhang&role=editor
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**成功响应**:

```json
{
  "code": 200,
  "message": "获取用户列表成功",
  "data": {
    "list": [
      {
        "id": 2,
        "username": "zhangsan",
        "nickname": "张三",
        "avatar": "https://via.placeholder.com/100",
        "email": "zhangsan@example.com",
        "phone": "13800000002",
        "role": "editor",
        "status": 1,
        "createdAt": "2026-03-15T00:00:00.000Z",
        "updatedAt": "2026-07-20T00:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 10
  }
}
```

---

### 3.2 用户详情

**接口**: `GET /api/v1/users/:id`

**描述**: 获取指定用户的详细信息。

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | number | 是 | 用户 ID |

**请求示例**:

```
GET /api/v1/users/1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**成功响应**:

```json
{
  "code": 200,
  "message": "获取用户详情成功",
  "data": {
    "id": 1,
    "username": "admin",
    "nickname": "系统管理员",
    "avatar": "https://via.placeholder.com/100",
    "email": "admin@example.com",
    "phone": "13800000001",
    "role": "admin",
    "status": 1,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-08-09T00:00:00.000Z"
  }
}
```

**错误响应**:

```json
{
  "code": 404,
  "message": "用户不存在",
  "data": null
}
```

---

### 3.3 更新用户

**接口**: `PUT /api/v1/users/:id`

**描述**: 更新指定用户的基本信息。

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | number | 是 | 用户 ID |

**请求体**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| nickname | string | 否 | 昵称 |
| email | string | 否 | 邮箱 |
| phone | string | 否 | 手机号 |
| role | string | 否 | 角色 (admin / editor / viewer) |
| status | number | 否 | 状态 (1=启用, 0=禁用) |

**请求示例**:

```json
{
  "nickname": "张三丰",
  "email": "zhangsanfeng@example.com",
  "role": "admin"
}
```

**成功响应**:

```json
{
  "code": 200,
  "message": "用户信息更新成功",
  "data": {
    "id": 2,
    "username": "zhangsan",
    "nickname": "张三丰",
    "avatar": "https://via.placeholder.com/100",
    "email": "zhangsanfeng@example.com",
    "phone": "13800000002",
    "role": "admin",
    "status": 1,
    "createdAt": "2026-03-15T00:00:00.000Z",
    "updatedAt": "2026-08-09T06:30:00.000Z"
  }
}
```

**错误响应**:

```json
{
  "code": 404,
  "message": "用户不存在",
  "data": null
}
```

---

### 3.4 删除用户

**接口**: `DELETE /api/v1/users/:id`

**描述**: 软删除用户（标记 status=0），不物理删除数据。

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | number | 是 | 用户 ID |

**请求示例**:

```
DELETE /api/v1/users/3
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**成功响应**:

```json
{
  "code": 200,
  "message": "用户删除成功",
  "data": null
}
```

**错误响应**:

```json
{
  "code": 404,
  "message": "用户不存在",
  "data": null
}
```

---

## 附录

### 用户角色说明

| 角色值 | 中文名称 | 说明 |
|--------|----------|------|
| admin | 管理员 | 拥有全部操作权限 |
| editor | 编辑者 | 可查看和编辑内容 |
| viewer | 观察者 | 仅可查看内容 |

### Mock 测试账号

| 用户名 | 密码 | 角色 | 状态 |
|--------|------|------|------|
| admin | admin123 | 管理员 (admin) | 启用 |
| zhangsan | 123456 | 编辑者 (editor) | 启用 |
| lisi | 123456 | 观察者 (viewer) | 禁用 |
| wangwu | 123456 | 编辑者 (editor) | 启用 |
| zhaoliu | 123456 | 观察者 (viewer) | 启用 |

### Token 说明

- Token 有效期为 **24 小时**
- 请求时在 Header 中携带: `Authorization: Bearer <token>`
- Token 过期后需重新登录获取

> **文档版本**: v1.0 | **最后更新**: 2026-08-09
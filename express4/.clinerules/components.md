# 组件设计规范 (Components)

## 1. 概述

本规范定义了项目中可复用组件的设计原则、结构和最佳实践，适用于前后端各类项目。这里的"组件"涵盖服务层（Services）、工具类（Utilities）、中间件/拦截器（Middlewares/Interceptors）、校验器（Validators）等可复用的代码单元。

---

## 2. 组件分层架构

### 2.1 通用分层模型

```
┌─────────────────────────────────────┐
│           接入层 (Gateway)           │
│  Controllers / Routes / Pages       │
├─────────────────────────────────────┤
│           业务逻辑层 (Domain)        │
│  Services / Use Cases / Entities    │
├─────────────────────────────────────┤
│           基础设施层 (Infrastructure)│
│  Repositories / DB / External APIs  │
└─────────────────────────────────────┘

横向支撑层 (Cross-cutting):
  Middlewares / Guards / Utils / Validators
```

### 2.2 各层职责

| 层 | 职责 | 后端示例 | 前端示例 |
|----|------|----------|----------|
| **接入层** | 处理外部请求/用户交互 | Controller, Route, Resolver | Page, Container Component |
| **业务逻辑层** | 核心业务规则，与框架无关 | Service, UseCase, Domain Entity | Hook, Store, Service |
| **基础设施层** | 数据持久化、外部集成 | Repository, DB Adapter, HTTP Client | API Client, Storage Adapter |
| **横向支撑层** | 跨切面功能 | Middleware, Guard, Logger | HOC, Provider, Plugin |

---

## 3. 通用组件设计原则

### 3.1 SOLID 原则
- **S** — 单一职责：每个组件只做一件事
- **O** — 开闭原则：对扩展开放，对修改关闭
- **L** — 里氏替换：子类可以替换父类
- **I** — 接口隔离：不强迫依赖不需要的接口
- **D** — 依赖反转：依赖抽象而非具体实现

### 3.2 通用原则
- **单一职责**: 每个组件只处理一个业务领域或一个关注点
- **依赖注入**: 通过构造函数/参数注入依赖，便于测试和替换
- **错误隔离**: 组件内部错误不应直接暴露给上层，应转换为领域错误
- **可测试性**: 组件应可独立测试，不依赖全局状态

---

## 4. 服务层设计 (Service Layer)

### 4.1 基本结构
```typescript
// services/user.service.ts

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  create(data: CreateUserDTO): Promise<User>;
  update(id: string, data: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
}

export class UserService {
  constructor(private readonly userRepo: UserRepository) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new NotFoundError(`User ${id} not found`);
    }
    return user;
  }

  async create(data: CreateUserDTO): Promise<User> {
    await this.validateCreate(data);
    return this.userRepo.create(data);
  }

  private async validateCreate(data: CreateUserDTO): Promise<void> {
    // 业务规则校验
  }
}
```

### 4.2 设计要点
- **抽象依赖**: 通过接口定义依赖，而非具体实现
- **业务语言**: 方法命名使用业务术语（`enrollCourse` 而非 `insertRecord`）
- **事务边界**: 明确事务边界，一个公共方法 = 一个事务
- **无框架依赖**: Service 不依赖 HTTP/UI 框架

---

## 5. 工具/辅助函数设计 (Utilities)

### 5.1 基本结构
```typescript
// utils/hash.ts

const CONFIG = {
  SALT_LENGTH: 16,
  ITERATIONS: 100000,
  KEY_LENGTH: 64,
  DIGEST: 'sha512',
} as const;

/**
 * 生成密码哈希
 * @param password - 明文密码
 * @returns 带盐值的哈希字符串
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(CONFIG.SALT_LENGTH).toString('hex');
  const hash = crypto
    .pbkdf2Sync(password, salt, CONFIG.ITERATIONS, CONFIG.KEY_LENGTH, CONFIG.DIGEST)
    .toString('hex');
  return `${salt}:${hash}`;
}
```

### 5.2 设计原则
- **纯函数**: 相同输入始终产生相同输出，无副作用
- **无状态**: 不依赖全局状态或外部存储
- **单一文件按领域划分**: `hash.ts`, `date.ts`, `string.ts`, `http.ts`
- **完善的 JSDoc**: 包含参数、返回值、异常和示例

---

## 6. 数据校验设计 (Validators)

### 6.1 基本结构
```typescript
// validators/user.validator.ts

import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  role: z.enum(['admin', 'user', 'editor']).default('user'),
});

export type CreateUserDTO = z.infer<typeof createUserSchema>;

/**
 * 通用校验函数 - 框架无关
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}
```

### 6.2 设计原则
- 使用 Zod/Joi 等声明式校验库
- 从 Schema 推导类型（DRY 原则）
- 校验逻辑与业务逻辑分离
- 校验函数保持纯函数特性

---

## 7. 中间件/拦截器设计 (Middlewares / Interceptors)

### 7.1 通用中间件模式
```typescript
// middlewares/auth.ts

export interface RequestContext {
  userId?: string;
  userRole?: string;
  // ... 其他上下文信息
}

type NextFunction = () => Promise<void> | void;
type MiddlewareFn<T extends RequestContext> = (
  context: T,
  next: NextFunction,
) => Promise<void> | void;

/**
 * 认证中间件 - 验证请求中的身份凭证
 * @example
 * const pipeline = compose(authMiddleware, loggerMiddleware);
 * pipeline(ctx, () => handleRequest(ctx));
 */
export function authMiddleware(ctx: RequestContext, next: NextFunction): void {
  const token = extractToken(ctx);
  if (!token) {
    throw new UnauthorizedError('Missing credentials');
  }
  const payload = verifyToken(token);
  ctx.userId = payload.userId;
  ctx.userRole = payload.role;
  next();
}
```

### 7.2 设计原则
- **洋葱模型**: 中间件按注册顺序执行，支持前置和后置逻辑
- **无状态**: 不保存请求间的状态
- **显式传递**: 上下文信息通过参数显式传递
- **组合优于继承**: 使用函数组合，支持管道模式

---

## 8. 组件间通信

### 8.1 依赖方向
```
接入层 → 业务逻辑层 → 基础设施层
  ↓          ↓            ↓
横向支撑层（任意层可调用）
```

- **只能向下依赖**: 上层组件调用下层组件
- **禁止反向依赖**: Service 不应依赖 Controller
- **禁止跨层调用**: Controller 不应直接调用 Repository

### 8.2 依赖注入
```typescript
// 构造函数注入（推荐）
class OrderService {
  constructor(
    private readonly userService: UserService,
    private readonly paymentGateway: PaymentGateway,
    private readonly orderRepo: OrderRepository,
  ) {}
}

// 函数参数注入（适用于函数式风格）
async function createOrder(
  deps: { userService: UserService; orderRepo: OrderRepository },
  input: CreateOrderInput,
): Promise<Order> {
  // ...
}
```

---

## 9. 组件测试要求

### 9.1 测试策略
| 组件类型 | 单元测试 | 集成测试 |
|----------|----------|----------|
| Service | ✅ 必须 | ✅ 推荐 |
| Utility | ✅ 必须 | ⬜ 可选 |
| Validator | ✅ 必须 | ⬜ 可选 |
| Middleware | ✅ 必须 | ✅ 推荐 |
| Repository | ⬜ 可选 | ✅ 必须 |

### 9.2 AAA 测试模式
```typescript
describe('UserService', () => {
  it('should return user when exists', async () => {
    // Arrange - 准备测试数据
    const mockRepo = { findById: vi.fn().mockResolvedValue(testUser) };
    const service = new UserService(mockRepo);

    // Act - 执行被测方法
    const result = await service.findById('1');

    // Assert - 验证结果
    expect(result).toEqual(testUser);
  });
});
```

---

## 10. 反模式与避免

❌ **避免以下做法**:
1. **巨型组件**: 单个组件处理多个不相关的领域
2. **多层越权**: Controller 直接操作数据库
3. **静态依赖**: 使用 `new` 在组件内部硬编码依赖
4. **框架污染**: 业务逻辑组件依赖 HTTP Request/Response 等框架特定对象
5. **副作用泄漏**: Utility 函数修改外部状态或发起网络请求
6. **硬编码配置**: 配置值散落在代码中，而非通过环境变量或配置文件管理

---

## 11. 检查清单

创建新组件前：
- [ ] 确定组件应属于哪个层（接入层/业务逻辑层/基础设施层/支撑层）
- [ ] 检查是否有现有组件可以复用
- [ ] 依赖是否通过接口/参数注入（非硬编码 new）
- [ ] 组件是否可以在无框架环境下测试
- [ ] 命名是否符合项目规范
- [ ] 是否遵循单一职责原则
- [ ] 是否编写了对应的测试文件
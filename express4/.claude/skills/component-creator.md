# 组件创建流程 (Component Creator)

## 1. 概述

本技能定义了一套标准化的可复用组件创建流程，涵盖 Express4 项目中的 Service、Middleware、Utility、Validator 等代码单元。确保每个组件都遵循统一的结构、包含必要的测试且文档齐全。

---

## 2. 触发方式

- 说："创建一个 [类型] 组件，用于 [功能]"
- 示例："创建一个认证中间件"、"创建一个用户 Service"、"创建一个密码哈希工具"

---

## 3. 创建流程

### 步骤 1：需求确认

创建组件前，确认以下信息：

```markdown
## 组件需求确认

- **组件类型**: [Service / Middleware / Utility / Validator]
- **组件名称**: [如 UserService, AuthMiddleware]
- **功能描述**: [一句话描述组件的作用]
- **输入参数**: [组件需要接收什么参数]
- **输出/行为**: [组件应该返回什么或产生什么效果]
- **依赖项**: [组件依赖的其他模块]
- **文件位置**: [src/ 目录下的具体路径]
```

### 步骤 2：选择模板

根据组件类型选择对应的基础模板。

#### 2.1 Service 模板
```typescript
// src/services/{domain}.service.ts

import { logger } from '../utils/logger';
import { AppError } from '../utils/errors';

/**
 * {Domain}Service
 * 
 * 职责: {一句话描述}
 * 
 * @example
 * const service = new {Domain}Service(dependency);
 * const result = await service.methodName(params);
 */
export class {Domain}Service {
  constructor(
    // 通过构造函数注入依赖
  ) {}

  /**
   * {方法描述}
   * @param params - {参数说明}
   * @returns {返回值说明}
   * @throws {AppError} {异常说明}
   */
  async methodName(params: unknown): Promise<unknown> {
    logger.info('{Domain}Service.methodName called', { params });
    
    try {
      // 1. 验证输入
      // 2. 执行业务逻辑
      // 3. 返回结果
      
      throw new Error('Not implemented');
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('{Domain}Service.methodName failed', { error });
      throw new AppError(500, 'INTERNAL_ERROR', 'Operation failed');
    }
  }
}
```

#### 2.2 Middleware 模板
```typescript
// src/middlewares/{name}.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { AppError } from '../utils/errors';

/**
 * {MiddlewareName}
 * 
 * 职责: {一句话描述中间件的作用}
 * 
 * 使用方式:
 * router.get('/path', {name}Middleware, handler);
 */
export function {name}Middleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    logger.debug('{name}Middleware executed', {
      path: req.path,
      method: req.method,
    });

    // 1. 从请求中提取信息
    // 2. 执行验证/处理逻辑
    // 3. 将结果附加到 req 对象
    // 4. 调用 next() 或 next(error)

    next();
  } catch (error) {
    logger.error('{name}Middleware failed', { error });
    next(error);
  }
}
```

#### 2.3 Utility 模板
```typescript
// src/utils/{name}.ts

/**
 * {函数描述}
 * 
 * @param input - {参数说明}
 * @returns {返回值说明}
 * 
 * @example
 * const result = {functionName}('input');
 * console.log(result); // expected output
 */
export function {functionName}(input: unknown): unknown {
  // 纯函数，无副作用
  throw new Error('Not implemented');
}
```

#### 2.4 Validator 模板
```typescript
// src/validators/{domain}.validator.ts

import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/errors';

/**
 * {Domain} 创建请求验证模式
 */
export const create{Entity}Schema = z.object({
  // 定义字段验证规则
  // name: z.string().min(2).max(50),
});

/**
 * {Domain} 更新请求验证模式
 */
export const update{Entity}Schema = z.object({
  // 定义可更新字段
});

/**
 * 从 Schema 推导 TypeScript 类型
 */
export type Create{Entity}DTO = z.infer<typeof create{Entity}Schema>;
export type Update{Entity}DTO = z.infer<typeof update{Entity}Schema>;

/**
 * 通用验证中间件工厂函数
 */
export function validate{Entity}(
  schema: z.ZodSchema,
  source: 'body' | 'query' | 'params' = 'body'
) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req[source] = schema.parse(req[source]);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fields: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          fields[path] = err.message;
        });
        next(new ValidationError('Validation failed', fields));
      } else {
        next(error);
      }
    }
  };
}
```

### 步骤 3：编写测试

#### 3.1 测试模板
```typescript
// src/{layer}/{name}.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('{ComponentName}', () => {
  // 准备测试数据
  const mockDependency = {
    // mock 方法
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('methodName', () => {
    it('should return expected result for valid input', async () => {
      // Arrange - 准备
      // Act - 执行
      // Assert - 验证
    });

    it('should throw error for invalid input', async () => {
      // Arrange
      // Act & Assert
    });

    it('should handle edge cases', async () => {
      // 边界条件测试
    });
  });
});
```

#### 3.2 测试要求
- **正常路径**: 至少 1 个测试
- **异常路径**: 至少 1 个测试
- **边界条件**: 空值、极值、边界值
- **覆盖率**: Service/Middleware ≥ 80%

### 步骤 4：生成导出索引

如果创建的组件类型尚未有索引文件，则更新对应目录的 barrel export：

```typescript
// src/services/index.ts (如果不存在则创建)
export { UserService } from './user.service';
export { OrderService } from './order.service';
```

### 步骤 5：更新文档

在组件文件顶部包含完整的 JSDoc：
- 组件用途描述
- 使用示例
- 参数说明
- 异常说明

---

## 4. 完整示例

### 输入
> "创建一个 TokenService，用于生成和验证 JWT"

### 输出
```typescript
// src/services/token.service.ts

import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';
import { AppError } from '../utils/errors';

/**
 * TokenService
 * 
 * 职责: 管理 JWT Token 的生成、验证和刷新
 * 
 * @example
 * const tokenService = new TokenService();
 * const token = tokenService.generate({ userId: 1, role: 'admin' });
 * const payload = tokenService.verify(token);
 */
export class TokenService {
  private readonly secret: string;
  private readonly expiresIn: string;

  constructor(
    secret: string = process.env.JWT_SECRET || 'default-secret',
    expiresIn: string = '1h',
  ) {
    this.secret = secret;
    this.expiresIn = expiresIn;
  }

  /**
   * 生成 JWT Token
   * @param payload - Token 载荷数据
   * @returns 签发的 JWT 字符串
   */
  generate(payload: Record<string, unknown>): string {
    logger.info('TokenService.generate called', { sub: payload.sub });
    return jwt.sign(payload, this.secret, {
      expiresIn: this.expiresIn,
    });
  }

  /**
   * 验证并解码 JWT Token
   * @param token - JWT 字符串
   * @returns 解码后的载荷
   * @throws {AppError} Token 无效或过期时抛出
   */
  verify(token: string): Record<string, unknown> {
    try {
      return jwt.verify(token, this.secret) as Record<string, unknown>;
    } catch (error) {
      logger.warn('TokenService.verify failed', { error });
      throw new AppError(401, 'UNAUTHORIZED', 'Invalid or expired token');
    }
  }

  /**
   * 刷新 Token
   * @param token - 旧 Token（可仍有效或刚过期）
   * @returns 新签发的 Token
   * @throws {AppError} Token 完全无效时抛出
   */
  refresh(token: string): string {
    // 允许过期 5 分钟内的 token 被刷新
    const payload = jwt.verify(token, this.secret, {
      ignoreExpiration: false,
      clockTolerance: 300, // 5分钟容差
    }) as Record<string, unknown>;

    return this.generate(payload);
  }
}

// 导出单例
export const tokenService = new TokenService();
```

---

## 5. 创建后检查清单

组件创建完成后确认：
- [ ] 文件放置在正确的目录（services/middlewares/utils/validators）
- [ ] 类名/函数名遵循命名规范（PascalCase/camelCase）
- [ ] 顶部有 JSDoc 注释，包含描述和使用示例
- [ ] 所有公共方法有 JSDoc 注释（@param, @returns, @throws）
- [ ] 导入了必要的依赖
- [ ] 创建了对应的测试文件
- [ ] 通过 `import` 能正确引入（路径正确）
- [ ] 更新了目录的 barrel export（如果存在）

---

## 6. 快速启动

说以下任意一句即可触发：
> "创建一个 Service 组件，用于 [功能描述]"
> "创建一个 Middleware，用于 [功能描述]"
> "创建一个 Utility 函数，用于 [功能描述]"
> "创建一个 Validator，用于 [数据验证]"

AI 助手将先确认需求，然后按照上述模板生成完整的组件代码和测试文件。
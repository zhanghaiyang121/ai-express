# 提交代码 (Commit)

## 1. 概述

本命令定义了 Express4 项目中标准的 Git 提交流程，包括代码检查、提交信息格式化和分支管理规范。确保每次提交都是安全、规范且可追溯的。

---

## 2. 触发方式

- 输入: `/commit` 或说 "提交代码"
- 输入: `/commit feat 添加用户登录` 或说 "提交一个 feat 类型的新功能"

---

## 3. 执行流程

### 步骤 1：检查工作区状态

```bash
# 查看当前状态
git status

# 查看具体变更
git diff
```

检查内容：
- [ ] 确认所有变更文件都是有意的（无意外修改）
- [ ] 确认没有调试代码残留（console.log, debugger 等）
- [ ] 确认没有敏感信息（密码、API Key 等）
- [ ] 确认没有临时文件（.tmp, .bak 等）

---

### 步骤 2：代码质量检查

#### 2.1 自动检查
```bash
# 运行 lint 检查
npm run lint

# 运行类型检查（TypeScript 项目）
npm run type-check

# 运行测试
npm run test
```

- 如果 lint 报错 → 修复后再提交
- 如果测试失败 → 修复后再提交
- 如果类型检查失败 → 修复后再提交

#### 2.2 手动检查清单
- [ ] 代码风格符合 `rules/code-style.md` 规范
- [ ] 新增的公共函数有 JSDoc 注释
- [ ] 没有使用 `var` 或 `any`
- [ ] 没有未使用的导入
- [ ] 文件末尾有空行

---

### 步骤 3：选择提交文件

```bash
# 添加特定文件
git add src/controllers/user.controller.ts src/routes/user.routes.ts

# 或添加所有变更（需谨慎确认）
git add .
```

- **推荐**: 添加特定文件，而非 `git add .`
- **原则**: 一次提交只包含一个逻辑变更
- **禁止**: 将无关的变更混合在一次提交中

---

### 步骤 4：生成提交信息

#### 4.1 提交信息模板
```
<type>(<scope>): <subject>

<body>

<footer>
```

#### 4.2 Type 类型选择

| Type | 使用时机 | 示例 |
|------|----------|------|
| `feat` | 新功能 | `feat(user): 添加用户登录功能` |
| `fix` | Bug 修复 | `fix(order): 修复订单金额计算错误` |
| `docs` | 仅文档变更 | `docs(api): 更新接口文档` |
| `style` | 格式调整（不影响代码运行） | `style: 统一缩进为 2 空格` |
| `refactor` | 重构（既不修复 bug 也不添加功能） | `refactor(auth): 提取 token 验证逻辑` |
| `perf` | 性能优化 | `perf(query): 优化用户列表查询性能` |
| `test` | 添加或修改测试 | `test(user): 添加用户 Service 单元测试` |
| `chore` | 构建过程或辅助工具变更 | `chore(deps): 升级 express 到 4.19.0` |
| `ci` | CI/CD 配置变更 | `ci: 添加 GitHub Actions 自动部署` |
| `revert` | 回滚之前的提交 | `revert: 回滚 feat(user) 提交` |

#### 4.3 Subject 规范
- 使用中文或英文，团队统一
- 中文：动词开头，不超过 50 字符
- 英文：使用祈使句，首字母小写
- 结尾不加句号

```
✅ 推荐
feat(user): 添加用户列表导出功能
fix(auth): token 过期未正确刷新

❌ 避免
feat: 修改了一些东西。          # 描述不具体
feat(user): 添加用户列表导出功能。 # 结尾有句号（中文）
fix: fixed token refresh bug     # 不要用过去式
```

#### 4.4 Body（可选）
当提交较为复杂时，使用 body 详细描述：
```
feat(user): 添加用户角色权限管理

- 新增 RBAC 权限中间件
- 实现角色-权限关联查询
- 添加权限变更审计日志
- 更新用户管理页面权限控制

相关 PR: #234
```

---

### 步骤 5：执行提交

```bash
git commit -m "feat(user): 添加用户列表导出功能"
```

或使用编辑器编写详细提交信息：
```bash
git commit
```

---

### 步骤 6：提交后检查

```bash
# 查看提交日志
git log -1

# 确认提交内容
git show HEAD
```

- [ ] 提交信息格式正确
- [ ] 提交的文件都是预期的
- [ ] 没有遗漏的文件
- [ ] 没有多余的文件

---

## 4. 提交信息示例

### 示例 1：简单功能
```
feat(product): 添加商品分类筛选功能
```

### 示例 2：带 scope 的修复
```
fix(cart): 修复购物车数量计算精度问题
```

### 示例 3：带 body 的复杂提交
```
refactor(order): 重构订单状态机

- 将 if-else 状态判断改为状态模式
- 新增 OrderStatus 枚举和相关转换规则
- 提取状态变更通知逻辑到独立模块

Breaking Change: Order.status 字段类型从 string 改为 OrderStatus 枚举
```

### 示例 4：带 footer 的提交
```
feat(api): 添加 API 版本管理

- 支持 URL 路径版本控制 /v1/ /v2/
- 添加版本协商中间件

Closes #156
Reviewed-by: @team-lead
```

---

## 5. 分支策略

### 5.1 分支命名
```
main              # 主分支，稳定版本
develop           # 开发分支
feature/user-auth # 功能分支
fix/order-calc   # 修复分支
release/v1.2.0   # 发布分支
hotfix/v1.1.1    # 热修复分支
```

### 5.2 工作流程
1. 从 `develop` 创建功能分支
2. 在功能分支上开发并提交
3. 推送到远程，创建 Pull Request
4. Code Review 通过后合并到 `develop`

---

## 6. 自动化脚本（可选）

```json
// package.json
{
  "scripts": {
    "commit": "node scripts/commit.js",
    "lint": "eslint src/ --ext .ts",
    "type-check": "tsc --noEmit",
    "test": "vitest run"
  },
  "husky": {
    "hooks": {
      "pre-commit": "npm run lint && npm run type-check",
      "commit-msg": "node scripts/validate-commit-msg.js"
    }
  }
}
```

---

## 7. 反模式

❌ **避免以下行为**:
- `git commit -m "fix"` — 信息过于简略
- `git commit -m "WIP"` — 在工作分支上使用 WIP 提交
- `git add . && git commit -m "..."` — 不检查变更内容直接提交
- 一次提交包含多个不相关的变更
- 提交包含 `console.log` 等调试代码
- 提交包含 IDE 配置文件（.vscode/ 等，除团队共享的配置外）
- 提交 node_modules 或编译产物

---

## 8. AI 助手执行流程

当用户触发此命令时，AI 助手将：
1. 运行 `git status` 检查工作区状态
2. 运行 `git diff` 获取详细变更
3. 检查代码规范（lint, 类型检查）
4. 分析变更内容，建议合适的提交类型
5. 生成符合规范的提交信息
6. 等待用户确认后执行提交
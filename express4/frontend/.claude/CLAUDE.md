# CLAUDE.md - AI 编码助手规则入口

## 概述

本文件是 Express4 项目中 AI 编码助手（Claude）的全局规则入口。它整合了项目中的编码规范、可复用工作流和自定义命令，确保 AI 辅助编码的一致性和高质量。

---

## 目录结构

```
.claude/
├── CLAUDE.md              # 整个规则的入口（当前文件）
├── rules/                 # 规则与约束
│   ├── code-style.md      # 代码风格规范
│   ├── components.md      # 组件设计规范
│   ├── api-design.md      # API 设计规范
│   └── visual-spec.md     # 视觉设计规格
├── skills/                # 可复用的工作流
│   ├── brainstorming.md   # 头脑风暴流程
│   ├── component-creator.md # 组件创建流程
│   ├── web-design.md      # Web 设计流程
│   └── page-creator.md    # 页面创建流程
└── commands/              # 自定义命令
    ├── commit.md          # 提交代码
    └── plan.md            # 制定计划
```

---

## 规则加载顺序

当 AI 助手进行编码时，应按以下顺序加载和应用规则：

1. **code-style.md** — 首先确保代码风格一致
2. **components.md** — 然后遵循组件设计规范
3. **api-design.md** — 设计 API 时遵循接口规范
4. **visual-spec.md** — 最后确保视觉设计符合规格

---

## 使用方式

### 规则（Rules）

规则文件定义了项目中必须遵守的编码约束。AI 助手在处理任何代码时都应自动应用这些规则，无需用户额外指令。

### 技能（Skills）

技能文件定义了可复用的工作流程。用户可以通过以下方式触发：
- 明确提及技能名称（如"创建一个组件"）
- 使用命令触发（如 `/create-component`）

### 命令（Commands）

命令是用户可以直接调用的快捷操作，定义在 `commands/` 目录中。每个命令文件包含了该命令的详细执行流程。

---

## 项目技术栈

- **运行时**: Node.js
- **框架**: Express 4.x
- **语言**: TypeScript / JavaScript
- **包管理**: npm

---

## 快速参考

| 场景 | 参考文件 |
|------|----------|
| 编写新代码 | rules/code-style.md |
| 创建组件 | rules/components.md + skills/component-creator.md |
| 设计 API | rules/api-design.md |
| 页面布局/样式 | rules/visual-spec.md |
| 需求分析 | skills/brainstorming.md |
| 提交代码 | commands/commit.md |
| 制定开发计划 | commands/plan.md |
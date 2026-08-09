# 视觉设计规格 (Visual Spec)

## 1. 概述

本规范定义了项目前端界面的视觉设计标准和 UI 组件样式规范。适用于任何 Web 前端项目（管理后台、官网、H5 等），确保所有用户界面保持统一、专业且符合无障碍标准。

---

## 2. 设计系统

### 2.1 设计原则
- **简洁优先**: 去除不必要的视觉元素，突出核心内容
- **一致性**: 所有页面使用统一的组件样式、间距和排版
- **响应式**: 适配 Desktop（≥1024px）、Tablet（768px ~ 1023px）、Mobile（<768px）
- **可访问性**: 遵循 WCAG 2.1 AA 级标准

---

## 3. 色彩系统

### 3.1 主色调
| 颜色名称 | 色值 | 用途 |
|----------|------|------|
| Primary | `#1890ff` | 主要按钮、链接、选中状态 |
| Primary Hover | `#40a9ff` | 主色悬停 |
| Primary Active | `#096dd9` | 主色按下 |

### 3.2 功能色
| 颜色名称 | 色值 | 用途 |
|----------|------|------|
| Success | `#52c41a` | 成功状态、正向操作 |
| Warning | `#faad14` | 警告提示 |
| Error | `#ff4d4f` | 错误状态、危险操作 |
| Info | `#1890ff` | 信息提示 |

### 3.3 中性色
| 颜色名称 | 色值 | 用途 |
|----------|------|------|
| Title Text | `#262626` | 标题文字 |
| Primary Text | `#595959` | 正文内容 |
| Secondary Text | `#8c8c8c` | 辅助说明文字 |
| Disabled Text | `#bfbfbf` | 禁用状态文字 |
| Border | `#d9d9d9` | 边框线 |
| Divider | `#f0f0f0` | 分割线 |
| Background | `#f5f5f5` | 页面背景 |
| Surface | `#ffffff` | 组件/卡片/弹窗背景 |

### 3.4 CSS 变量（设计令牌）
```css
:root {
  /* 主色 */
  --color-primary: #1890ff;
  --color-primary-hover: #40a9ff;
  --color-primary-active: #096dd9;
  --color-primary-bg: rgba(24, 144, 255, 0.1);

  /* 功能色 */
  --color-success: #52c41a;
  --color-success-bg: #f6ffed;
  --color-warning: #faad14;
  --color-warning-bg: #fffbe6;
  --color-error: #ff4d4f;
  --color-error-bg: #fff2f0;
  --color-info: #1890ff;
  --color-info-bg: #e6f7ff;

  /* 中性色 */
  --color-title: #262626;
  --color-text: #595959;
  --color-text-secondary: #8c8c8c;
  --color-text-disabled: #bfbfbf;
  --color-border: #d9d9d9;
  --color-divider: #f0f0f0;
  --color-bg: #f5f5f5;
  --color-surface: #ffffff;
}
```

---

## 4. 排版系统

### 4.1 字体栈
```css
font-family:
  -apple-system,
  BlinkMacSystemFont,
  'Segoe UI',
  Roboto,
  'Helvetica Neue',
  Arial,
  'Noto Sans',
  'PingFang SC',
  'Microsoft YaHei',
  sans-serif;
```

### 4.2 字号与行高
| 级别 | 字号 | 行高 | 字重 | 用途 |
|------|------|------|------|------|
| H1 | 38px | 1.23 | 600 | 页面主标题 |
| H2 | 30px | 1.27 | 600 | 区块标题 |
| H3 | 24px | 1.33 | 600 | 卡片标题 |
| H4 | 20px | 1.4 | 500 | 段落标题 |
| H5 | 16px | 1.5 | 500 | 小标题 |
| Body | 14px | 1.57 | 400 | 正文内容 |
| Caption | 12px | 1.67 | 400 | 辅助说明/标签 |

### 4.3 CSS 变量
```css
:root {
  --font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-size-h1: 38px;
  --font-size-h2: 30px;
  --font-size-h3: 24px;
  --font-size-h4: 20px;
  --font-size-h5: 16px;
  --font-size-body: 14px;
  --font-size-caption: 12px;
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
}
```

---

## 5. 间距系统

### 5.1 基于 8px 网格

| 名称 | 值 | 用途 |
|------|------|------|
| xs | 4px | 极小间距，紧凑元素 |
| sm | 8px | 小间距，相关元素 |
| md | 16px | 中等间距，标准元素间隔 |
| lg | 24px | 大间距，区块间隔 |
| xl | 32px | 超大间距，区域分隔 |
| xxl | 48px | 极大间距，页面分区间隔 |

### 5.2 CSS 变量
```css
:root {
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-xxl: 48px;
}
```

### 5.3 布局常量
- 侧边栏宽度: `256px`（可配置为 CSS 变量）
- 内容区域最大宽度: `1200px`
- 页面内容区最小内边距: `24px`

---

## 6. 圆角与阴影

### 6.1 圆角
```css
:root {
  --radius-sm: 2px;    /* 小元素：标签、徽章 */
  --radius-md: 6px;    /* 标准：按钮、输入框、卡片 */
  --radius-lg: 8px;    /* 大元素：弹窗、抽屉 */
  --radius-xl: 12px;   /* 特大：大卡片、图片容器 */
  --radius-round: 50%; /* 圆形：头像、圆形按钮 */
}
```

### 6.2 阴影
```css
:root {
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);
  --shadow-hover: 0 2px 8px rgba(0, 0, 0, 0.15);
  --shadow-modal: 0 16px 48px rgba(0, 0, 0, 0.16);
}
```

---

## 7. 组件设计规格

### 7.1 按钮 (Button)

| 类型 | 样式描述 | 使用场景 |
|------|----------|----------|
| Primary | 主色填充，白色文字 | 主要操作（提交、保存、确认） |
| Default | 白色/浅色填充，灰色边框 | 常规操作（取消、返回） |
| Danger | 错误色填充，白色文字 | 危险/删除操作 |
| Link | 透明背景，主色文字 | 轻量操作（表格内编辑） |
| Text | 透明背景，默认文字色 | 最低优先级的操作 |

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  height: 32px;
  padding: 4px 15px;
  font-size: 14px;
  font-family: inherit;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  cursor: pointer;
  transition: all var(--transition-fast);
  user-select: none;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
}
```

**按钮尺寸：**

| 尺寸 | 高度 | 水平内边距 | 字号 |
|------|------|-----------|------|
| Small | 24px | 0 7px | 12px |
| Medium | 32px | 4px 15px | 14px |
| Large | 40px | 6px 15px | 16px |

### 7.2 输入框 (Input)

```css
.input {
  width: 100%;
  height: 32px;
  padding: 4px 11px;
  font-size: 14px;
  font-family: inherit;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text);
  background: var(--color-surface);
  transition: border-color var(--transition-fast),
              box-shadow var(--transition-fast);
  outline: none;
}

.input::placeholder {
  color: var(--color-text-disabled);
}

.input:hover {
  border-color: var(--color-primary-hover);
}

.input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-primary-bg);
}

.input--error {
  border-color: var(--color-error);
}

.input--error:focus {
  box-shadow: 0 0 0 2px var(--color-error-bg);
}

.input:disabled {
  background: var(--color-bg);
  color: var(--color-text-disabled);
  cursor: not-allowed;
}
```

### 7.3 卡片 (Card)
```css
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: var(--space-lg);
}

.card--hoverable:hover {
  box-shadow: var(--shadow-hover);
}
```

### 7.4 表格 (Table)
```css
.table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-body);
}

.table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: var(--font-weight-semibold);
  color: var(--color-title);
  background: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
  white-space: nowrap;
}

.table td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-divider);
  color: var(--color-text);
}

.table tr:hover td {
  background: var(--color-info-bg);
}

.table--empty td {
  text-align: center;
  padding: 48px 16px;
  color: var(--color-text-secondary);
}
```

### 7.5 弹窗 (Modal/Dialog)
- 最小宽度: `420px`，最大宽度: `80vw`
- 区域划分: 标题区 + 内容区 + 底部操作区
- 遮罩颜色: `rgba(0, 0, 0, 0.45)`
- 圆角: `var(--radius-lg)`
- 阴影: `var(--shadow-modal)`
- 支持 ESC 键关闭

### 7.6 标签/徽章 (Tag/Badge)

| 类型 | 背景色变量 | 文字色变量 |
|------|-----------|-----------|
| Default | `--color-bg` | `--color-text` |
| Primary | `--color-primary-bg` | `--color-primary` |
| Success | `--color-success-bg` | `--color-success` |
| Warning | `--color-warning-bg` | `--color-warning` |
| Error | `--color-error-bg` | `--color-error` |
| Info | `--color-info-bg` | `--color-info` |

### 7.7 加载状态
- **内联加载**: 24px 旋转圆环（spinner）+ 描述文字
- **骨架屏**: 浅灰色占位块 + shimmer 动画，用于列表/卡片初始加载
- **进度条**: 用于耗时明确的操作（文件上传、数据处理）

---

## 8. 图标

- 推荐使用 **SVG 图标**，通过 iconfont、SVG sprite 或组件库（如 `lucide`）管理
- 常用尺寸: `14px`, `16px`, `20px`, `24px`
- 颜色跟随: 使用 `currentColor` 继承父元素文字颜色
- 为无障碍提供 `aria-label` 或 `<title>` 描述

---

## 9. 动效

### 9.1 过渡时间
```css
:root {
  --transition-fast: 0.15s;   /* hover、focus 等即时反馈 */
  --transition-normal: 0.25s; /* 展开、收起、颜色切换 */
  --transition-slow: 0.35s;   /* 弹窗进出、页面切换 */
}
```

### 9.2 缓动函数
```css
:root {
  --ease-in: cubic-bezier(0.55, 0, 0.55, 0.2);
  --ease-out: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
}
```

- 入场动画: `ease-out`
- 退场动画: `ease-in`
- 循环/变换动画: `ease-in-out`

### 9.3 动效原则
- **有意义**: 动效应传达状态变化（如元素出现/消失/位置变化）
- **不打扰**: 避免自动播放的无限循环动画
- **可跳过**: 尊重 `prefers-reduced-motion` 用户偏好

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 10. 响应式设计

### 10.1 断点
```css
/* Mobile-first 基础样式（< 768px） */

/* Tablet */
@media (min-width: 768px) { }

/* Desktop */
@media (min-width: 1024px) { }

/* Large Desktop */
@media (min-width: 1440px) { }
```

| 断点名称 | 范围 | 典型设备 |
|----------|------|----------|
| Mobile | < 768px | 手机 |
| Tablet | 768px ~ 1023px | 平板 |
| Desktop | 1024px ~ 1439px | 笔记本/台式机 |
| Large | ≥ 1440px | 大屏/2K/4K |

### 10.2 响应式策略
- **优先 Mobile-first**: 基础样式面向移动端，通过 `min-width` 逐级增强
- **表格**: 移动端转为卡片列表或横向滚动
- **侧边栏**: 移动端变为抽屉式，平板端可折叠为图标
- **弹窗**: 移动端全屏显示

---

## 11. 通用页面布局模板

### 11.1 后台管理布局
```
┌──────────────────────────────────────────────┐
│  Header                                       │
├────────┬─────────────────────────────────────┤
│ Sider  │  Content                             │
│        │  ┌───────────────────────────────┐  │
│        │  │ Breadcrumb                    │  │
│        │  ├───────────────────────────────┤  │
│        │  │                               │  │
│        │  │ Page Content                  │  │
│        │  │                               │  │
│        │  └───────────────────────────────┘  │
└────────┴─────────────────────────────────────┘
```

### 11.2 列表页模板
```
┌─────────────────────────────────────────────┐
│ Title / Breadcrumb            [+ Create]     │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐ │
│ │ Filter Bar (Search / Selects / Date)    │ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐ │
│ │ Data Table / Card List                  │ │
│ │                                         │ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ Pagination                                  │
└─────────────────────────────────────────────┘
```

### 11.3 表单页模板
```
┌─────────────────────────────────────────────┐
│ Title / Breadcrumb                          │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────┐         │
│ │ Section Title                   │         │
│ │ ────────────────────────────── │         │
│ │ Label      [Input]              │         │
│ │ Label      [Select]             │         │
│ │                                 │         │
│ │ Section Title                   │         │
│ │ ────────────────────────────── │         │
│ │ Label      [Textarea]           │         │
│ │                                 │         │
│ ├─────────────────────────────────┤         │
│ │ [Submit]  [Cancel]  [Reset]     │         │
│ └─────────────────────────────────┘         │
└─────────────────────────────────────────────┘
```

---

## 12. 无障碍 (Accessibility)

### 12.1 色彩对比度
| 元素 | 最小对比度 |
|------|-----------|
| 正文文字（<18px） | 4.5:1 |
| 大号文字（≥18px 粗体 / ≥24px） | 3:1 |
| UI 组件和图形对象 | 3:1 |

### 12.2 键盘交互
- 所有交互元素可通过 Tab 键聚焦
- 焦点顺序符合视觉逻辑
- 弹窗打开时焦点移入，关闭时焦点返回触发元素
- 提供明显的焦点指示样式

```css
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

### 12.3 语义化
- 使用语义化 HTML 标签（`<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`）
- 表单输入关联 `<label>`
- 图片提供有意义的 `alt` 属性
- 图标按钮提供 `aria-label`

---

## 13. 检查清单

创建新页面/组件前：
- [ ] 颜色使用 CSS 变量，避免硬编码色值
- [ ] 间距基于 8px 网格系统
- [ ] 字号和行高符合排版规范
- [ ] 响应式设计已考虑（至少适配 Mobile + Desktop）
- [ ] 动效时间在 0.15s ~ 0.35s 范围内
- [ ] 组件覆盖所有必要状态（默认、悬停、激活、禁用、加载、空、错误）
- [ ] 键盘导航可用
- [ ] 色彩对比度达标
- [ ] 尊重 `prefers-reduced-motion` 用户偏好
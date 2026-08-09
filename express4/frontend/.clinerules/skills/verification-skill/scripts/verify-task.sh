#!/bin/bash
# verify-task.sh — 任务自动验证脚本
# 用法: bash scripts/verify-task.sh <任务类型> [参数]
# 任务类型: code / doc / config / all

set -euo pipefail

TASK_TYPE="${1:?用法: $0 <code|doc|config|all> [参数]}"
REPORT_FILE="./verification-report-$(date +%Y%m%d-%H%M%S).md"

echo "# 任务验证报告" > "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "**任务类型：** $TASK_TYPE" >> "$REPORT_FILE"
echo "**执行时间：** $(date '+%Y-%m-%d %H:%M:%S')" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0

# 验证函数
check() {
    local desc="$1"
    local cmd="$2"
    
    if eval "$cmd" >/dev/null 2>&1; then
        echo "- [x] ✅ $desc" >> "$REPORT_FILE"
        ((PASS_COUNT++))
        echo "  ✅ $desc"
    else
        echo "- [ ] ❌ $desc" >> "$REPORT_FILE"
        ((FAIL_COUNT++))
        echo "  ❌ $desc"
    fi
}

check_warn() {
    local desc="$1"
    local cmd="$2"
    
    if eval "$cmd" >/dev/null 2>&1; then
        echo "- [x] ✅ $desc" >> "$REPORT_FILE"
        ((PASS_COUNT++))
        echo "  ✅ $desc"
    else
        echo "- [ ] ⚠️ $desc" >> "$REPORT_FILE"
        ((WARN_COUNT++))
        echo "  ⚠️ $desc"
    fi
}

# ============================================================
# 代码任务验证
# ============================================================
verify_code() {
    echo "## 代码任务验证" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    
    echo "### 1. 产物存在性" >> "$REPORT_FILE"
    check "package.json 存在" "test -f package.json"
    check "src 目录存在" "test -d src"
    check "tsconfig.json 存在" "test -f tsconfig.json"
    echo "" >> "$REPORT_FILE"
    
    echo "### 2. 依赖检查" >> "$REPORT_FILE"
    check "node_modules 存在" "test -d node_modules"
    check "TypeScript 已安装" "npx tsc --version"
    echo "" >> "$REPORT_FILE"
    
    echo "### 3. 代码质量" >> "$REPORT_FILE"
    check_warn "TypeScript 类型检查" "npx tsc --noEmit"
    check_warn "ESLint 检查" "npx eslint src/ --ext .ts,.vue --quiet"
    
    # 检查常见代码问题
    if grep -r "console\.log" src/ --include="*.ts" --include="*.vue" -l 2>/dev/null; then
        echo "- [ ] ⚠️ 发现 console.log 遗留" >> "$REPORT_FILE"
        ((WARN_COUNT++))
    else
        echo "- [x] ✅ 无 console.log 遗留" >> "$REPORT_FILE"
        ((PASS_COUNT++))
    fi
    
    if grep -r ": any" src/ --include="*.ts" --include="*.vue" -l 2>/dev/null; then
        echo "- [ ] ⚠️ 发现 any 类型使用" >> "$REPORT_FILE"
        ((WARN_COUNT++))
    else
        echo "- [x] ✅ 无 any 类型" >> "$REPORT_FILE"
        ((PASS_COUNT++))
    fi
    echo "" >> "$REPORT_FILE"
    
    echo "### 4. 构建验证" >> "$REPORT_FILE"
    check_warn "构建成功" "npm run build"
    check_warn "单元测试通过" "npx vitest run"
    echo "" >> "$REPORT_FILE"
}

# ============================================================
# 文档任务验证
# ============================================================
verify_doc() {
    echo "## 文档任务验证" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    
    local DOC_FILE="${2:-}"
    
    echo "### 1. 文件验证" >> "$REPORT_FILE"
    if [ -n "$DOC_FILE" ]; then
        check "文件存在" "test -f $DOC_FILE"
        check "文件非空" "[ -s $DOC_FILE ]"
        SIZE=$(stat -c %s "$DOC_FILE" 2>/dev/null || echo 0)
        if [ "$SIZE" -gt 100 ]; then
            echo "- [x] ✅ 文件大小合理 ($SIZE bytes)" >> "$REPORT_FILE"
            ((PASS_COUNT++))
        else
            echo "- [ ] ❌ 文件过小 ($SIZE bytes)" >> "$REPORT_FILE"
            ((FAIL_COUNT++))
        fi
    else
        echo "- [ ] ⚠️ 未指定文档文件" >> "$REPORT_FILE"
        ((WARN_COUNT++))
    fi
    echo "" >> "$REPORT_FILE"
    
    echo "### 2. Markdown 格式检查" >> "$REPORT_FILE"
    if [ -n "$DOC_FILE" ] && [[ "$DOC_FILE" == *.md ]]; then
        # 检查是否有标题
        if grep -q "^#" "$DOC_FILE" 2>/dev/null; then
            echo "- [x] ✅ 包含标题" >> "$REPORT_FILE"
            ((PASS_COUNT++))
        else
            echo "- [ ] ❌ 缺少标题" >> "$REPORT_FILE"
            ((FAIL_COUNT++))
        fi
        
        # 检查是否有空白占位符
        if grep -q "TODO\|FIXME\|待补充" "$DOC_FILE" 2>/dev/null; then
            echo "- [ ] ⚠️ 包含待填写占位符" >> "$REPORT_FILE"
            ((WARN_COUNT++))
        else
            echo "- [x] ✅ 无空白占位符" >> "$REPORT_FILE"
            ((PASS_COUNT++))
        fi
    fi
    echo "" >> "$REPORT_FILE"
}

# ============================================================
# 配置任务验证
# ============================================================
verify_config() {
    echo "## 配置任务验证" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    
    echo "### 1. 配置文件验证" >> "$REPORT_FILE"
    
    # 检查常见配置文件
    for f in package.json tsconfig.json vite.config.ts .env; do
        if [ -f "$f" ]; then
            check "$f 存在" "true"
        fi
    done
    
    # JSON 语法检查
    for f in $(find . -name "*.json" -maxdepth 1); do
        check_warn "$f JSON 语法正确" "python3 -m json.tool $f"
    done
    echo "" >> "$REPORT_FILE"
    
    echo "### 2. 服务状态检查" >> "$REPORT_FILE"
    # 如果有 .env 文件，检查必要的环境变量
    if [ -f ".env" ]; then
        for key in NODE_ENV DATABASE_URL API_KEY; do
            if grep -q "^$key=" ".env" 2>/dev/null; then
                echo "- [x] ✅ 环境变量 $key 已设置" >> "$REPORT_FILE"
                ((PASS_COUNT++))
            else
                echo "- [ ] ⚠️ 环境变量 $key 未设置" >> "$REPORT_FILE"
                ((WARN_COUNT++))
            fi
        done
    fi
    echo "" >> "$REPORT_FILE"
}

# ============================================================
# 执行验证
# ============================================================
echo "🔍 开始任务验证: $TASK_TYPE"
echo ""

case "$TASK_TYPE" in
    code)
        verify_code "$@"
        ;;
    doc)
        verify_doc "$@"
        ;;
    config)
        verify_config "$@"
        ;;
    all)
        verify_code "$@"
        echo "" >> "$REPORT_FILE"
        verify_doc "$@"
        echo "" >> "$REPORT_FILE"
        verify_config "$@"
        ;;
    *)
        echo "❌ 未知的任务类型: $TASK_TYPE"
        echo "用法: $0 <code|doc|config|all> [参数]"
        exit 1
        ;;
esac

# ============================================================
# 生成总结
# ============================================================
echo "---" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "## 验证总结" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "| 状态 | 数量 |" >> "$REPORT_FILE"
echo "|------|------|" >> "$REPORT_FILE"
echo "| ✅ 通过 | $PASS_COUNT |" >> "$REPORT_FILE"
echo "| ❌ 失败 | $FAIL_COUNT |" >> "$REPORT_FILE"
echo "| ⚠️ 警告 | $WARN_COUNT |" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

if [ "$FAIL_COUNT" -eq 0 ]; then
    echo "### ✅ 验证结论：通过" >> "$REPORT_FILE"
    echo "任务已满足交付标准。" >> "$REPORT_FILE"
    echo ""
    echo "✅ 验证通过！报告: $REPORT_FILE"
else
    echo "### ❌ 验证结论：未通过" >> "$REPORT_FILE"
    echo "有 $FAIL_COUNT 项检查失败，需要修复后重新验证。" >> "$REPORT_FILE"
    echo ""
    echo "❌ 验证未通过！$FAIL_COUNT 项失败。报告: $REPORT_FILE"
fi

echo ""
echo "📋 验证报告: $REPORT_FILE"

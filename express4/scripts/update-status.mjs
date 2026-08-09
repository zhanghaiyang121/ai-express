#!/usr/bin/env node
/**
 * 功能状态更新工具
 *
 * 用法:
 *   node scripts/update-status.mjs <模块编号> <功能编号> <状态>
 *
 * 状态值:
 *   done     - 🟢 已完成
 *   doing    - 🟡 进行中
 *   todo     - 🔴 未开始
 *   dropped  - ⚫ 已废弃
 *   paused   - ⏸️ 暂缓
 *
 * 示例:
 *   node scripts/update-status.mjs M01 all done        # 将 M01 全部标记为已完成
 *   node scripts/update-status.mjs M01 M01-01 doing    # 将 M01-01 标记为进行中
 *   node scripts/update-status.mjs M03 M03-05 done     # 将 M03-05 标记为已完成
 *   node scripts/update-status.mjs all all doing        # 将所有功能标记为进行中
 *   node scripts/update-status.mjs --summary            # 打印模块进度摘要
 *   node scripts/update-status.mjs --recalc             # 重新计算并更新模块概览表
 *   node scripts/update-status.mjs M01-01 done          # 通过编号前缀自动匹配模块
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');
const OVERVIEW_FILE = resolve(ROOT, 'docs/功能拆解总览.md');
const MODULES_DIR = resolve(ROOT, 'docs/modules');

/** 状态 → emoji 映射 */
const STATUS_MAP = {
  done: '🟢',
  doing: '🟡',
  todo: '🔴',
  dropped: '⚫',
  paused: '⏸️',
};
const STATUS_NAMES = {
  '🟢': '已完成',
  '🟡': '进行中',
  '🔴': '未开始',
  '⚫': '已废弃',
  '⏸️': '暂缓',
};

/** 读取文件并统一换行符为 LF */
function readFileSafe(filePath) {
  if (!existsSync(filePath)) {
    console.error(`错误: 文件不存在 ${filePath}`);
    process.exit(1);
  }
  return readFileSync(filePath, 'utf-8').replace(/\r\n/g, '\n');
}

/** 写文件使用平台默认换行符 */
function writeFileSafe(filePath, content) {
  // content 内部是 \n，写文件时保持 \n（Node 会正确处理）
  writeFileSync(filePath, content, 'utf-8');
}

/** 解析参数 */
function parseArgs(args) {
  const flags = { summary: false, recalc: false };
  const positional = [];
  for (const arg of args) {
    if (arg === '--summary' || arg === '-s') flags.summary = true;
    else if (arg === '--recalc' || arg === '-r') flags.recalc = true;
    else positional.push(arg);
  }
  return { flags, positional };
}

/** 从总览文件中提取所有模块和功能 */
function parseOverview() {
  const content = readFileSafe(OVERVIEW_FILE);
  const lines = content.split('\n');

  /** @type {Map<string, string[]>} moduleId -> featureIds */
  const modules = new Map();
  /** @type {Map<string, {moduleId: string, status: string}>} featureId -> info */
  const features = new Map();

  let currentModule = null;

  for (const line of lines) {
    // 检测模块标题 (### Mxx-xxxx)
    const moduleMatch = line.match(/^### (M\d{2}-.+)$/);
    if (moduleMatch) {
      currentModule = moduleMatch[1];
      if (!modules.has(currentModule)) {
        modules.set(currentModule, []);
      }
      continue;
    }

    // 检测下一个 ### 标题（切换模块时结束当前模块区域）
    if (currentModule && line.startsWith('### ') && !line.startsWith(`### ${currentModule}`)) {
      currentModule = null;
      continue;
    }

    // 在模块区域内检测功能行
    if (currentModule) {
      const featureMatch = line.match(/^\| (M\d{2}-\d{2,3}) \| (.+?) \| .+? \| (🔴|🟡|🟢|⚫|⏸️) \|/);
      if (featureMatch) {
        const featureId = featureMatch[1];
        const featureName = featureMatch[2];
        const status = featureMatch[3];
        features.set(featureId, { moduleId: currentModule, status, name: featureName });
        modules.get(currentModule).push(featureId);
      }
    }
  }

  return { content, lines, modules, features };
}

/** 更新总览文件中指定的功能状态，并重新计算模块概览表 */
function updateFeature(featureId, newStatusEmoji) {
  const { content, lines, modules, features } = parseOverview();

  if (!features.has(featureId)) {
    console.error(`错误: 未找到功能 ${featureId}`);
    process.exit(1);
  }

  const today = new Date().toISOString().split('T')[0];
  const newLines = [];
  for (const line of lines) {
    const featureRe = new RegExp(
      `^\\| (${featureId}) \\| (.+?) \\| (.+?) \\| (🔴|🟡|🟢|⚫|⏸️) \\| (.+?) \\| (.+) \\|$`
    );
    const match = line.match(featureRe);
    if (match) {
      const oldDate = match[5].trim();
      const note = match[6].trim();
      const dateStr = newStatusEmoji === '🟢' ? today : (oldDate === '-' ? '-' : oldDate);
      newLines.push(
        `| ${featureId} | ${match[2]} | ${match[3]} | ${newStatusEmoji} | ${dateStr} | ${note} |`
      );
    } else {
      newLines.push(line);
    }
  }

  const newContent = recalcOverview(newLines.join('\n'));
  writeFileSafe(OVERVIEW_FILE, newContent);
  console.log(`✅ ${featureId} 状态已更新为 ${newStatusEmoji} ${STATUS_NAMES[newStatusEmoji]}`);
}

/** 更新指定模块下所有功能的状态 */
function updateModule(moduleId, newStatusEmoji) {
  const { content, lines, modules, features } = parseOverview();

  if (!modules.has(moduleId)) {
    console.error(`错误: 未找到模块 ${moduleId}`);
    process.exit(1);
  }

  const featureIds = modules.get(moduleId);
  const today = new Date().toISOString().split('T')[0];

  const newLines = [];
  for (const line of lines) {
    let replaced = false;
    for (const fid of featureIds) {
      const featureRe = new RegExp(
        `^\\| (${fid}) \\| (.+?) \\| (.+?) \\| (🔴|🟡|🟢|⚫|⏸️) \\| (.+?) \\| (.+) \\|$`
      );
      const match = line.match(featureRe);
      if (match) {
        const oldDate = match[5].trim();
        const note = match[6].trim();
        const dateStr = newStatusEmoji === '🟢' ? today : (oldDate === '-' ? '-' : oldDate);
        newLines.push(
          `| ${fid} | ${match[2]} | ${match[3]} | ${newStatusEmoji} | ${dateStr} | ${note} |`
        );
        replaced = true;
        break;
      }
    }
    if (!replaced) {
      newLines.push(line);
    }
  }

  const newContent = recalcOverview(newLines.join('\n'));
  writeFileSafe(OVERVIEW_FILE, newContent);
  console.log(`✅ ${moduleId} 下 ${featureIds.length} 个功能全部更新为 ${newStatusEmoji} ${STATUS_NAMES[newStatusEmoji]}`);
}

/** 更新所有模块下所有功能的状态 */
function updateAll(newStatusEmoji) {
  const { content, lines, modules } = parseOverview();
  const today = new Date().toISOString().split('T')[0];

  const newLines = [];
  for (const line of lines) {
    const featureRe = /^\| (M\d{2}-\d{2,3}) \| (.+?) \| (.+?) \| (🔴|🟡|🟢|⚫|⏸️) \| (.+?) \| (.+) \|$/;
    const match = line.match(featureRe);
    if (match) {
      const oldDate = match[5].trim();
      const note = match[6].trim();
      const dateStr = newStatusEmoji === '🟢' ? today : (oldDate === '-' ? '-' : oldDate);
      newLines.push(
        `| ${match[1]} | ${match[2]} | ${match[3]} | ${newStatusEmoji} | ${dateStr} | ${note} |`
      );
    } else {
      newLines.push(line);
    }
  }

  const newContent = recalcOverview(newLines.join('\n'));
  writeFileSafe(OVERVIEW_FILE, newContent);
  console.log(`✅ 全部功能已更新为 ${newStatusEmoji} ${STATUS_NAMES[newStatusEmoji]}`);
}

/** 重新计算模块概览表 */
function recalcOverview(content) {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const newLines = [];
  let inOverview = false;

  for (const line of lines) {
    // 开始模块概览表
    if (line.startsWith('| 模块 | 功能数 | 已完成 | 进行中 | 未开始 | 进度 |')) {
      inOverview = true;
      newLines.push(line);
      continue;
    }

    // 分隔行
    if (inOverview && line.startsWith('|------|--------|--------|--------|--------|------|')) {
      newLines.push(line);
      continue;
    }

    // 总计行 - 跳过，后面重建
    if (inOverview && line.startsWith('| **总计** |')) {
      inOverview = false;
      continue;
    }

    // 模块数据行 - 重建统计数据
    if (inOverview) {
      const moduleRe = /^\| (M\d{2}-.+?) \| (\d+) \| (\d+) \| (\d+) \| (\d+) \| (\d+)% \|$/;
      const match = line.match(moduleRe);
      if (match) {
        const moduleId = match[1];
        const stats = calcModuleStats(lines.join('\n'), moduleId);
        newLines.push(
          `| ${moduleId} | ${stats.total} | ${stats.done} | ${stats.doing} | ${stats.todo} | ${stats.progress}% |`
        );
        continue;
      }
    }

    newLines.push(line);
  }

  // 在模块概览表末尾重建总计行
  return buildFinalContent(newLines);
}

/** 从重建的行数组构建最终内容（插入总计行） */
function buildFinalContent(newLines) {
  const result = [];
  let inTable = false;
  let totalDone = 0, totalDoing = 0, totalTodo = 0, totalAll = 0;

  for (let i = 0; i < newLines.length; i++) {
    const line = newLines[i];

    // 概览表表头
    if (line.startsWith('| 模块 | 功能数 | 已完成 | 进行中 | 未开始 | 进度 |')) {
      inTable = true;
      totalDone = 0; totalDoing = 0; totalTodo = 0; totalAll = 0;
      result.push(line);
      continue;
    }

    // 概览表分隔线
    if (inTable && line.startsWith('|------')) {
      result.push(line);
      continue;
    }

    // 概览表中的模块行 - 累加统计
    if (inTable && line.startsWith('| M')) {
      const match = line.match(/^\| (M\d{2}-.+?) \| (\d+) \| (\d+) \| (\d+) \| (\d+) \| (\d+)% \|$/);
      if (match) {
        totalAll += parseInt(match[2]);
        totalDone += parseInt(match[3]);
        totalDoing += parseInt(match[4]);
        totalTodo += parseInt(match[5]);
        result.push(line);
        continue;
      }
    }

    // 概览表结束后的第一行（空行/开发阶段标题等） - 插入总计行
    if (inTable && !line.startsWith('| M') && !line.startsWith('| 模块') && !line.startsWith('|------')) {
      const totalProgress = totalAll > 0 ? Math.round((totalDone / totalAll) * 100) : 0;
      result.push(
        `| **总计** | **${totalAll}** | **${totalDone}** | **${totalDoing}** | **${totalTodo}** | **${totalProgress}%** |`
      );
      result.push('');  // 空行
      inTable = false;
      result.push(line);
      continue;
    }

    result.push(line);
  }

  // 如果概览表在文件末尾（没有结束标记）
  if (inTable) {
    const totalProgress = totalAll > 0 ? Math.round((totalDone / totalAll) * 100) : 0;
    result.push(
      `| **总计** | **${totalAll}** | **${totalDone}** | **${totalDoing}** | **${totalTodo}** | **${totalProgress}%** |`
    );
  }

  return result.join('\n');
}

/** 计算单个模块的统计数据 */
function calcModuleStats(content, moduleId) {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  let inModule = false;
  let total = 0, done = 0, doing = 0, todo = 0;

  for (const line of lines) {
    if (line.startsWith(`### ${moduleId}`)) {
      inModule = true;
      continue;
    }
    if (inModule && line.startsWith('### ') && !line.startsWith(`### ${moduleId}`)) {
      break;
    }
    if (inModule) {
      const match = line.match(/^\| M\d{2}-\d{2,3} \| .+? \| .+? \| (🔴|🟡|🟢|⚫|⏸️) \|/);
      if (match) {
        total++;
        const s = match[1];
        if (s === '🟢') done++;
        else if (s === '🟡') doing++;
        else if (s === '🔴') todo++;
      }
    }
  }

  const progress = total > 0 ? Math.round((done / total) * 100) : 0;
  return { total, done, doing, todo, progress };
}

/** 打印进度摘要 */
function printSummary() {
  const { modules, features } = parseOverview();
  console.log('\n📊 模块进度摘要\n');
  console.log('| 模块 | 总数 | 🟢 完成 | 🟡 进行中 | 🔴 未开始 | 进度 |');
  console.log('|------|------|---------|-----------|-----------|------|');

  let totalAll = 0, totalDone = 0, totalDoing = 0, totalTodo = 0;
  const content = readFileSafe(OVERVIEW_FILE);

  for (const [moduleId, featureIds] of modules) {
    const stats = calcModuleStats(content, moduleId);
    totalAll += stats.total;
    totalDone += stats.done;
    totalDoing += stats.doing;
    totalTodo += stats.todo;
    console.log(`| ${moduleId} | ${stats.total} | ${stats.done} | ${stats.doing} | ${stats.todo} | ${stats.progress}% |`);
  }

  const totalProgress = totalAll > 0 ? Math.round((totalDone / totalAll) * 100) : 0;
  console.log(`| **总计** | **${totalAll}** | **${totalDone}** | **${totalDoing}** | **${totalTodo}** | **${totalProgress}%** |`);
  console.log('');
}

/** 通过功能编号查找模块 (如 M01-01 → M01-认证授权) */
function findModuleByFeatureId(featureId) {
  const { modules } = parseOverview();
  const prefix = featureId.split('-')[0]; // M01-01 → M01
  for (const [moduleId] of modules) {
    if (moduleId.startsWith(prefix)) return moduleId;
  }
  return null;
}

/** 匹配短模块编号到完整名称 (如 M01 → M01-认证授权) */
function resolveModuleId(shortId) {
  const { modules } = parseOverview();
  if (shortId.toLowerCase() === 'all') return 'all';
  if (/^M\d{2}-/.test(shortId)) return shortId; // 已经是完整名称
  if (/^M\d{2}$/.test(shortId)) {
    for (const [key] of modules) {
      if (key.startsWith(shortId)) return key;
    }
  }
  return null;
}

// ---- 主入口 ----
const { flags, positional } = parseArgs(process.argv.slice(2));

if (flags.summary) {
  printSummary();
  process.exit(0);
}

if (flags.recalc) {
  const content = readFileSafe(OVERVIEW_FILE);
  const recalculated = recalcOverview(content);
  writeFileSafe(OVERVIEW_FILE, recalculated);
  console.log('✅ 模块概览表已重新计算');
  process.exit(0);
}

if (positional.length === 0) {
  console.log(`
📋 功能状态更新工具

用法:
  node scripts/update-status.mjs <模块编号> <功能编号> <状态>    (三参数)
  node scripts/update-status.mjs <功能编号> <状态>                (两参数，自动匹配模块)
  node scripts/update-status.mjs --summary                        (打印摘要)
  node scripts/update-status.mjs --recalc                         (重新计算概览)

参数:
  <模块编号>    M01, M02, ..., M10  或  all
  <功能编号>    M01-01  或  all
  <状态>        done | doing | todo | dropped | paused

示例:
  node scripts/update-status.mjs M01 all done        # M01模块全部标完成
  node scripts/update-status.mjs M01 M01-01 doing    # M01-01标进行中
  node scripts/update-status.mjs M01-01 done         # 自动匹配模块并标完成
  node scripts/update-status.mjs --summary            # 查看进度
`);
  process.exit(0);
}

// 验证状态参数
const statusArg = positional[positional.length - 1];
if (!(statusArg in STATUS_MAP)) {
  console.error(`错误: 无效状态 "${statusArg}"，可选值: done, doing, todo, dropped, paused`);
  process.exit(1);
}
const emoji = STATUS_MAP[statusArg];

// 两参数模式: 功能编号 + 状态
if (positional.length === 2) {
  const featureId = positional[0];
  const modId = findModuleByFeatureId(featureId);
  if (!modId) {
    console.error(`错误: 无法从功能编号 ${featureId} 匹配到模块`);
    process.exit(1);
  }
  updateFeature(featureId, emoji);
  process.exit(0);
}

// 三参数模式: 模块编号 + 功能编号 + 状态
if (positional.length === 3) {
  const [moduleIdRaw, featureIdRaw] = positional;

  // all all <status> -> 全部功能
  if (moduleIdRaw.toLowerCase() === 'all' && featureIdRaw.toLowerCase() === 'all') {
    updateAll(emoji);
    process.exit(0);
  }

  // 解析模块编号
  const moduleId = resolveModuleId(moduleIdRaw);
  if (!moduleId) {
    console.error(`错误: 未找到模块 ${moduleIdRaw}`);
    process.exit(1);
  }

  // M01 all <status> -> 模块下全部功能
  if (featureIdRaw.toLowerCase() === 'all') {
    updateModule(moduleId, emoji);
    process.exit(0);
  }

  // M01 M01-01 <status> -> 单个功能
  updateFeature(featureIdRaw, emoji);
  process.exit(0);
}

console.error('错误: 参数格式不正确');
console.error('用法: node scripts/update-status.mjs <模块> <功能> <状态> 或 node scripts/update-status.mjs <功能> <状态>');
process.exit(1);
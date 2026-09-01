import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve(import.meta.dirname, '..');
const modulePages = [
  'foundation.html', 'baoyan.html', 'kaoyan.html', 'kaogong.html', 'jiuye.html',
  'action-center.html', 'exploration.html', 'promotion-destinations.html', 'resources.html'
];
const htmlPages = ['index.html', '404.html', 'promotion.html', ...modulePages];
const required = [
  ...htmlPages, 'robots.txt', 'sitemap.xml', 'js/vendor/marked.min.js',
  'js/vendor/purify.min.js', 'css/style.css', 'js/features.js', 'js/search.js',
  'js/promotion-data.js'
];
const errors = [];

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

for (const file of required) {
  if (!fs.existsSync(path.join(root, file))) errors.push(`缺少文件：${file}`);
}

for (const file of modulePages) {
  const html = read(file);
  if (!/<h1\b/.test(html)) errors.push(`${file} 缺少 h1`);
  if (!/class="skip-link"/.test(html)) errors.push(`${file} 缺少跳到正文入口`);
  if (!/<main[^>]+id="mainContent"/.test(html)) errors.push(`${file} 缺少 mainContent`);
}

for (const file of htmlPages) {
  const html = read(file);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length) errors.push(`${file} 存在重复 id：${[...new Set(duplicates)].join(', ')}`);

  for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const ref = match[1];
    if (!ref || /^(?:https?:|data:|mailto:|tel:|#)/.test(ref)) continue;
    const local = decodeURIComponent(ref.split(/[?#]/)[0]);
    if (local && !fs.existsSync(path.resolve(root, path.dirname(file), local))) {
      errors.push(`${file} 引用了不存在的文件：${ref}`);
    }
  }

  for (const match of html.matchAll(/<img\b([^>]*)>/g)) {
    if (!/\balt="[^"]*"/.test(match[1])) errors.push(`${file} 存在缺少 alt 的图片`);
  }
  for (const match of html.matchAll(/<button\b([^>]*)>/g)) {
    if (!/\btype="(?:button|submit|reset)"/.test(match[1])) errors.push(`${file} 存在未声明 type 的按钮`);
  }
  for (const match of html.matchAll(/<a\b([^>]*)>/g)) {
    const attrs = match[1];
    if (/\btarget="_blank"/.test(attrs) && !/\brel="[^"]*\bnoopener\b/.test(attrs)) {
      errors.push(`${file} 存在缺少 noopener 的新窗口链接`);
    }
  }
}

const allHtml = htmlPages.map(read).join('\n');
if (/cdn\.jsdelivr\.net\/npm\/(?:marked|dompurify)/.test(allHtml)) errors.push('仍在使用外部 Markdown CDN');
if (!/promotion-destinations\.html#promotion/.test(read('promotion.html'))) errors.push('旧推免链接未配置跳转');
if (!/localBackupExport/.test(read('action-center.html'))) errors.push('行动中心缺少备份入口');
if (!/promotionCombinationCount/.test(read('promotion-destinations.html'))) errors.push('推免页面缺少聚合口径');
if (!/promotionTypeTableBody/.test(read('promotion-destinations.html'))) errors.push('推免页面缺少类型汇总');

const promotionContext = { window: {} };
vm.runInNewContext(read('js/promotion-data.js'), promotionContext);
const promotionData = promotionContext.window.PROMOTION_DATA;
const promotionTypeTotal = promotionData.typeSummary.items.reduce((sum, item) => sum + item.count, 0);
if (promotionTypeTotal !== promotionData.typeSummary.total) {
  errors.push(`推免类型人数合计 ${promotionTypeTotal} 与总数 ${promotionData.typeSummary.total} 不一致`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`检查通过：${htmlPages.length} 个页面，${required.length} 个必要文件。`);

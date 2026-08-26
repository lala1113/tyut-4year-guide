/* ==========================================================================
   太原理工大学 · 四年生涯规划指南 — Markdown 渲染引擎
   依赖：marked（CDN 解析）+ DOMPurify（CDN 消毒）；加载失败时自动降级为原文显示。
   用法：
   1) 政策卡片：<div class="policy-list" data-md-key="baoyan"></div>
      —— 从 window.MARKDOWN_CONTENT.baoyan 取 Markdown，按 "### " 分段渲染为卡片
   2) 通用富文本：<div class="md-render"><script type="text/markdown"># 标题 ...</script></div>
      —— 支持标题 / 列表 / 引用 / 表格 / 代码 / 链接等完整 Markdown 语法
   ========================================================================== */
(function () {
  'use strict';

  function hasLibs() {
    return typeof window.marked === 'object' && typeof window.DOMPurify === 'function';
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ---------- 通用 Markdown → 安全 HTML ---------- */
  function renderMarkdown(md) {
    if (typeof md !== 'string' || !md.trim()) return '';
    if (!hasLibs()) {
      // CDN 未加载（如离线打开）：降级显示原文
      return '<pre class="md-fallback">' + escapeHtml(md.trim()) + '</pre>';
    }
    var html;
    try {
      html = window.marked.parse(md, { gfm: true, breaks: true });
    } catch (e) {
      try {
        html = window.marked(md, { gfm: true, breaks: true });
      } catch (e2) {
        html = escapeHtml(md);
      }
    }
    // 消毒（防止 XSS），站外链接一律新窗口打开
    html = window.DOMPurify.sanitize(html, { ADD_ATTR: ['target', 'rel'] });
    html = html.replace(/<a /g, '<a target="_blank" rel="noopener" ');
    return html;
  }

  /* ---------- 政策卡片：data-md-key ---------- */
  function renderPolicyList(key) {
    var box = document.querySelector('.policy-list[data-md-key="' + key + '"]');
    if (!box) return;
    var md = (window.MARKDOWN_CONTENT && window.MARKDOWN_CONTENT[key]) || '';
    if (!md.trim()) return;

    var blocks = md.split(/\n###\s+/)
      .map(function (s) { return s.trim(); })
      .filter(Boolean);

    var out = '';
    blocks.forEach(function (block, index) {
      var lines = block.split('\n');
      var titleLine = lines.shift().trim();
      var isHl = /\|\s*highlight\s*$/i.test(titleLine);
      var title = titleLine.replace(/\s*\|\s*highlight\s*$/i, '').trim();
      var body = renderMarkdown(lines.join('\n'));
      out += '<div class="policy-item' + (isHl ? ' highlight' : '') + '" id="' + escapeHtml(key) + '-policy-' + (index + 1) + '">' +
             '<h4>' + escapeHtml(title) + '</h4>' +
             '<div class="md-body">' + body + '</div></div>';
    });
    box.innerHTML = out;
  }

  /* ---------- 通用富文本块：.md-render ---------- */
  function renderMdBlocks() {
    var blocks = document.querySelectorAll('.md-render script[type="text/markdown"]');
    Array.prototype.forEach.call(blocks, function (script) {
      var holder = script.parentNode;
      holder.innerHTML = renderMarkdown(script.textContent);
    });
  }

  /* ---------- 竞赛目录：#contest-catalog ---------- */
  function renderContestCatalog() {
    var box = document.getElementById('contest-catalog');
    if (!box) return;
    var data = window.CONTEST_CATALOG;
    if (!data || !data.categories) return;

    var tabsHtml = '<div class="contest-tabs" role="tablist">';
    data.categories.forEach(function (cat, idx) {
      tabsHtml += '<button class="contest-tab' + (idx === 0 ? ' active' : '') + '" data-level="' + cat.level + '" role="tab" aria-selected="' + (idx === 0 ? 'true' : 'false') + '">' +
        '<span class="tab-level">' + escapeHtml(cat.level) + '</span>' +
        '<span class="tab-name">' + escapeHtml(cat.name) + '</span>' +
        '<span class="tab-count">' + cat.count + '项</span></button>';
    });
    tabsHtml += '</div>';

    var panelsHtml = '<div class="contest-panels">';
    data.categories.forEach(function (cat, idx) {
      var chips = cat.items.map(function (item) {
        return '<span class="contest-chip">' + escapeHtml(item) + '</span>';
      }).join('');
      panelsHtml += '<div class="contest-panel' + (idx === 0 ? ' active' : '') + '" data-panel="' + cat.level + '" role="tabpanel">' +
        '<p class="panel-desc">' + escapeHtml(cat.desc) + '</p>' +
        '<div class="contest-chips">' + chips + '</div></div>';
    });
    panelsHtml += '</div>';

    box.innerHTML = '<div class="contest-head"><h4>' + escapeHtml(data.title) + '</h4>' +
      '<span class="contest-meta">' + escapeHtml(data.source) + ' · ' + escapeHtml(data.date) + '</span></div>' +
      tabsHtml + panelsHtml;

    var tabs = box.querySelectorAll('.contest-tab');
    var panels = box.querySelectorAll('.contest-panel');
    Array.prototype.forEach.call(tabs, function (tab) {
      tab.addEventListener('click', function () {
        var lv = this.getAttribute('data-level');
        Array.prototype.forEach.call(tabs, function (t) { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
        Array.prototype.forEach.call(panels, function (p) { p.classList.remove('active'); });
        this.classList.add('active'); this.setAttribute('aria-selected', 'true');
        var target = box.querySelector('.contest-panel[data-panel="' + lv + '"]');
        if (target) target.classList.add('active');
      });
    });
  }

  function init() {
    renderMdBlocks();
    if (window.MARKDOWN_CONTENT) {
      Object.keys(window.MARKDOWN_CONTENT).forEach(renderPolicyList);
    }
    renderContestCatalog();
    if (window.location.hash) {
      var target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
      if (target) window.requestAnimationFrame(function () { target.scrollIntoView({ block: 'start' }); });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

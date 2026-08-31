/* ========================================================================== 
   网站更新日志：弹层、未读状态与键盘焦点管理
   ========================================================================== */

(function () {
  'use strict';

  var CURRENT_VERSION = '4.2.2';
  var STORAGE_KEY = 'tyutCareerGuide.v3.changelogSeen';

  function readSeenVersion() {
    try { return localStorage.getItem(STORAGE_KEY) || ''; }
    catch (error) { return ''; }
  }

  function writeSeenVersion() {
    try { localStorage.setItem(STORAGE_KEY, CURRENT_VERSION); }
    catch (error) { /* 禁用本地存储时仅保留本次打开状态。 */ }
  }

  function init() {
    var toggle = document.getElementById('updateLogToggle');
    var dialog = document.getElementById('updateLogDialog');
    var panel = dialog && dialog.querySelector('.update-log-panel');
    var closeButton = document.getElementById('updateLogClose');
    if (!toggle || !dialog || !panel || !closeButton) return;

    var latest = panel.querySelector('.update-log-latest');
    var list = panel.querySelector('.update-log-list');
    if (latest) {
      latest.querySelector('strong').textContent = 'v4.2.2';
      latest.querySelector('em').textContent = '2026-09-01 更新';
    }
    if (list && !list.querySelector('[data-version="4.2.2"]')) {
      var previousLatest = list.querySelector('.is-latest');
      if (previousLatest) previousLatest.classList.remove('is-latest');
      list.insertAdjacentHTML('afterbegin',
        '<li class="update-log-entry is-latest" data-version="4.2.2">' +
          '<div class="update-log-marker" aria-hidden="true"></div>' +
          '<article><div class="update-log-meta"><strong>v4.2.2</strong><time datetime="2026-09-01">2026-09-01</time><span>链接与可维护性修复</span></div>' +
          '<h3>修复失效来源与公共导航细节</h3><ul>' +
          '<li>研究生院入口改用学校公布的可访问地址，避免证书错误阻断。</li>' +
          '<li>移除来源失效且无法重新核验的考研经验引用。</li>' +
          '<li>公共导航按钮补齐类型声明，并增加链接安全、图片替代文本和按钮类型检查。</li>' +
          '</ul></article></li>');
    }
    if (list && !list.querySelector('[data-version="4.2.1"]')) {
      list.querySelector('[data-version="4.2.2"]').insertAdjacentHTML('afterend',
        '<li class="update-log-entry" data-version="4.2.1">' +
          '<div class="update-log-marker" aria-hidden="true"></div>' +
          '<article><div class="update-log-meta"><strong>v4.2.1</strong><time datetime="2026-08-31">2026-08-31</time><span>推免数据补充</span></div>' +
          '<h3>新增文法与外语学院 2026 届推免去向</h3><ul>' +
          '<li>新增文法与外语学院 45 条匿名来源记录，覆盖 6 个专业。</li>' +
          '<li>查询数据更新为 845 条记录、19 个学院、60 个专业口径和 99 所去向院校。</li>' +
          '<li>继续只展示学院、专业、去向院校与人数，不展示学生姓名。</li>' +
          '</ul></article></li>');
    }
    if (list && !list.querySelector('[data-version="4.2.0"]')) {
      list.querySelector('[data-version="4.2.1"]').insertAdjacentHTML('afterend',
        '<li class="update-log-entry" data-version="4.2.0">' +
          '<div class="update-log-marker" aria-hidden="true"></div>' +
          '<article><div class="update-log-meta"><strong>v4.2.0</strong><time datetime="2026-08-28">2026-08-28</time><span>可靠性与可访问性修复</span></div>' +
          '<h3>旧链接、信息年份、搜索和本地记录能力集中修复</h3><ul>' +
          '<li>旧版推免链接自动跳转，补充站点地图与搜索引擎入口。</li>' +
          '<li>标明历史数据年份，清理搜索摘要并补充核验标签。</li>' +
          '<li>新增本地记录备份恢复、内页主标题、跳到正文与手机端吸顶目录。</li>' +
          '<li>Markdown 渲染脚本改为站内托管，降低外部网络波动影响。</li>' +
          '</ul></article></li>');
    }

    var lastFocused = null;

    function markSeen() {
      toggle.classList.add('seen');
      writeSeenVersion();
    }

    function getFocusable() {
      return Array.prototype.filter.call(
        panel.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'),
        function (element) { return element.offsetParent !== null; }
      );
    }

    function openDialog() {
      lastFocused = document.activeElement;
      dialog.hidden = false;
      document.body.classList.add('update-log-open');
      toggle.classList.add('active');
      toggle.setAttribute('aria-expanded', 'true');
      panel.scrollTop = 0;
      panel.focus({ preventScroll: true });
      markSeen();
    }

    function closeDialog() {
      if (dialog.hidden) return;
      dialog.hidden = true;
      document.body.classList.remove('update-log-open');
      toggle.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
      if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus({ preventScroll: true });
    }

    function trapFocus(event) {
      if (dialog.hidden || event.key !== 'Tab') return;
      var focusable = getFocusable();
      if (!focusable.length) {
        event.preventDefault();
        panel.focus();
        return;
      }
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (!panel.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    toggle.classList.toggle('seen', readSeenVersion() === CURRENT_VERSION);
    toggle.addEventListener('click', openDialog);
    document.querySelectorAll('[data-open-update-log]').forEach(function (opener) {
      opener.addEventListener('click', openDialog);
    });
    closeButton.addEventListener('click', closeDialog);
    dialog.addEventListener('click', function (event) {
      if (event.target === dialog || event.target.closest('[data-update-log-link]')) closeDialog();
    });
    document.addEventListener('keydown', function (event) {
      if (dialog.hidden) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        closeDialog();
      } else {
        trapFocus(event);
      }
    });
  }

  init();
  window.TYUTChangelog = { version: CURRENT_VERSION };
})();

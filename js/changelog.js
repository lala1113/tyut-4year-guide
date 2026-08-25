/* ========================================================================== 
   网站更新日志：弹层、未读状态与键盘焦点管理
   ========================================================================== */

(function () {
  'use strict';

  var CURRENT_VERSION = '3.1.0';
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

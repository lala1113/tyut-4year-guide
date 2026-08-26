/* ==========================================================================
   太原理工大学 · 四年生涯规划指南 — 交互脚本
   纯前端实现：导航交互 / 滚动高亮 / 动画
   ========================================================================== */

(function () {
  'use strict';

  /* ---------- 导航栏：滚动阴影 ---------- */
  var header = document.getElementById('siteHeader');
  function onScrollHeader() {
    if (header) {
      header.classList.toggle('scrolled', window.scrollY > 10);
    }
  }
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------- 移动端菜单 ---------- */
  var navToggle = document.getElementById('navToggle');
  var mainNav = document.getElementById('mainNav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      var open = mainNav.classList.toggle('open');
      navToggle.classList.toggle('open', open);
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      navToggle.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
    });
    // 点击菜单项后自动收起
    mainNav.addEventListener('click', function (e) {
      if (e.target.closest('a[href]')) {
        mainNav.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- 滚动导航高亮（scrollspy） ---------- */
  var sections = Array.prototype.filter.call(document.querySelectorAll('section[id]'), function (section) {
    return !section.hidden && !section.classList.contains('resource-source-section');
  });
  var navLinks = document.querySelectorAll('.main-nav a[href]');

  var currentFile = window.location.pathname.split('/').pop() || 'index.html';

  var spy = function () {
    var pos = window.scrollY + 140;
    var currentId = '';
    sections.forEach(function (sec) {
      if (sec.offsetTop <= pos) {
        currentId = sec.id;
      }
    });
    navLinks.forEach(function (link) {
      var href = link.getAttribute('href') || '';
      var parts = href.split('#');
      var targetFile = parts[0] || currentFile;
      var targetId = parts[1] || '';
      var active = targetFile === currentFile && (!targetId || targetId === currentId);
      if (currentFile === 'index.html' && targetFile === currentFile && !targetId && currentId === 'contact') active = false;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    document.querySelectorAll('.main-nav .nav-group').forEach(function (group) {
      group.classList.toggle('active', Boolean(group.querySelector('a.active')));
    });
  };
  window.addEventListener('scroll', spy, { passive: true });
  spy();

  document.addEventListener('click', function (event) {
    if (event.target.closest('.nav-group')) return;
    document.querySelectorAll('.nav-group[open]').forEach(function (group) { group.open = false; });
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') document.querySelectorAll('.nav-group[open]').forEach(function (group) { group.open = false; });
  });

  /* ---------- 模块页当前位置与最近访问 ---------- */
  var breadcrumbCurrent = document.getElementById('moduleCurrentSection');
  function initModuleContext() {
    if (breadcrumbCurrent) {
      var contextHeadings = Array.prototype.slice.call(document.querySelectorAll('.module-page-main h3.block-title, .module-page-main .policy-item h4, .module-page-main .faq-item summary'));
      var updateContext = function () {
        var position = window.scrollY + 150;
        var current = '页面概览';
        contextHeadings.forEach(function (heading) {
          if (heading.getBoundingClientRect().top + window.scrollY <= position) current = heading.textContent.replace(/^◆\s*/, '').trim();
        });
        breadcrumbCurrent.textContent = current;
      };
      window.addEventListener('scroll', updateContext, { passive: true });
      updateContext();
    }

    var pageName = document.querySelector('.module-breadcrumb strong');
    if (pageName && currentFile !== 'index.html') {
      try {
        localStorage.setItem('tyutCareerGuide.v3.recentVisit', JSON.stringify({ title: pageName.textContent.trim(), href: currentFile + window.location.hash, visitedAt: Date.now() }));
      } catch (error) { /* 本地存储不可用时忽略。 */ }
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initModuleContext);
  else initModuleContext();

  /* ---------- 404 搜索入口与轻量反馈 ---------- */
  document.querySelectorAll('[data-open-site-search]').forEach(function (button) {
    button.addEventListener('click', function () {
      var searchToggle = document.getElementById('searchToggle');
      if (searchToggle) searchToggle.click();
    });
  });

  document.querySelectorAll('[data-feedback-type]').forEach(function (button) {
    button.addEventListener('click', function () {
      var type = button.dataset.feedbackType;
      var message = '【网站反馈｜' + type + '】\n页面：' + document.title + '\n链接：' + window.location.href + '\n具体情况：请在这里补充说明';
      var status = document.getElementById('feedbackStatus');
      function done() { if (status) status.textContent = '已复制“' + type + '”反馈模板，请通过上方微信发送给作者。'; }
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(message).then(done).catch(function () {});
      else {
        var textarea = document.createElement('textarea');
        textarea.value = message;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try { document.execCommand('copy'); done(); } catch (error) { if (status) status.textContent = '复制失败，请通过上方微信直接反馈。'; }
        textarea.remove();
      }
    });
  });

  /* ---------- 入场动画（IntersectionObserver，渐进式呈现） ---------- */
  var animEls = document.querySelectorAll('.tl-item, .exp-card, .quote-card, .video-card, .hero-card, .verification-card, .month-task, .promotion-stat, .school-card, .resource-hub-card');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    animEls.forEach(function (el) { io.observe(el); });
  } else {
    animEls.forEach(function (el) { el.classList.add('in-view'); });
  }

  /* ---------- 站内搜索初始化 ---------- */
  if (window.SiteSearch && typeof window.SiteSearch.init === 'function') {
    window.SiteSearch.init();
  }
})();

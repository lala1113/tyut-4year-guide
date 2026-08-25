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
      if (e.target.classList.contains('nav-link')) {
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
  var navLinks = document.querySelectorAll('.main-nav .nav-link');

  var spy = function () {
    var pos = window.scrollY + 140;
    var currentId = '';
    sections.forEach(function (sec) {
      if (sec.offsetTop <= pos) {
        currentId = sec.id;
      }
    });
    navLinks.forEach(function (link) {
      link.classList.toggle('active', link.getAttribute('href') === '#' + currentId);
    });
  };
  window.addEventListener('scroll', spy, { passive: true });
  spy();

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

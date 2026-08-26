/* 首页“继续上次使用”：只读取本站已有的浏览器本地记录。 */
(function () {
  'use strict';

  var prefix = 'tyutCareerGuide.v3.';
  var root = document.getElementById('homeContinue');
  var grid = document.getElementById('homeContinueGrid');
  if (!root || !grid) return;

  function load(key, fallback) {
    try {
      var value = JSON.parse(localStorage.getItem(prefix + key));
      return value == null ? fallback : value;
    } catch (error) { return fallback; }
  }

  function escapeHtml(value) {
    return String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  var routes = {
    foundation: ['基础篇 · 学业基石', 'foundation.html#foundation'],
    baoyan: ['保研 · 推免', 'baoyan.html#baoyan'],
    kaoyan: ['考研 · 统考', 'kaoyan.html#kaoyan'],
    kaogong: ['考公 · 选调', 'kaogong.html#kaogong'],
    jiuye: ['直接就业', 'jiuye.html#jiuye'],
    promotion: ['2026届推免去向', 'promotion-destinations.html#promotion'],
    'resource-hub': ['经验与资源中心', 'resources.html#resource-hub']
  };

  var cards = [];
  var action = load('actionState', { todos: [] });
  if (Array.isArray(action.todos) && action.todos.length) {
    var completed = action.todos.filter(function (item) { return item.completed; }).length;
    cards.push({ label: '本月行动', title: completed + ' / ' + action.todos.length + ' 项已完成', desc: '继续勾选待办或安排下一项任务。', href: 'action-center.html#action-center' });
  }

  var schools = load('targetSchools', []);
  if (Array.isArray(schools) && schools.length) {
    cards.push({ label: '考研择校', title: '已记录 ' + schools.length + ' 所目标院校', desc: '继续补充考试科目、目标分数和来源。', href: 'kaoyan.html#school-compare' });
  }

  var favorites = load('favoriteSections', []);
  if (Array.isArray(favorites) && favorites.length) {
    var route = routes[favorites[0]] || [favorites[0], 'index.html'];
    cards.push({ label: '收藏板块', title: route[0], desc: '你共收藏了 ' + favorites.length + ' 个板块。', href: route[1] });
  }

  var resourceFavorites = load('resourceFavorites', []);
  if (Array.isArray(resourceFavorites) && resourceFavorites.length) {
    cards.push({ label: '收藏资源', title: resourceFavorites[0].title || '资源中心收藏', desc: '你共收藏了 ' + resourceFavorites.length + ' 条经验、视频或资料。', href: resourceFavorites[0].href || 'resources.html#resource-hub' });
  }

  var recentVisit = load('recentVisit', null);
  if (recentVisit && recentVisit.href && recentVisit.title) {
    cards.push({ label: '最近浏览', title: recentVisit.title, desc: '回到上次浏览的模块继续查看。', href: recentVisit.href });
  }

  if (!cards.length) return;
  grid.innerHTML = cards.slice(0, 4).map(function (card) {
    return '<a class="home-continue-card" href="' + escapeHtml(card.href) + '">' +
      '<span>' + escapeHtml(card.label) + '</span><strong>' + escapeHtml(card.title) + '</strong>' +
      '<p>' + escapeHtml(card.desc) + '</p><em>继续 →</em></a>';
  }).join('');
  root.hidden = false;
})();

/**
 * 站内搜索 v3：内容类型 / 发展方向 / 官方来源筛选、关键词高亮、热门搜索与本地历史。
 * 纯前端实现，不发送搜索词或浏览记录。
 */
(function () {
  'use strict';

  var HISTORY_KEY = 'tyutCareerGuide.v3.searchHistory';
  var TYPE_LABELS = { policy: '政策', experience: '经验', video: '视频', resource: '资料', tool: '工具' };
  var DIRECTION_LABELS = { all: '全方向', foundation: '基础', baoyan: '保研', kaoyan: '考研', kaogong: '考公', jiuye: '就业', campus: '校园' };

  var STATIC_INDEX = [
    item('首页 · 四年生涯规划指南', '按年级梳理保研、考研、考公与就业四条路线。', '#home', 'tool', 'all', false, '首页 生涯规划 太原理工 四年'),
    item('本月行动中心', '按年级与当前月份生成三项行动建议，可加入待办并在本机保存进度。', '#action-center', 'tool', 'all', false, '本月 任务 待办 年级 进度 localStorage'),
    item('六题方向探索', '通过六个选择找到当前更匹配的准备方向，并获得三项下一步行动。', '#assessment', 'tool', 'all', false, '测评 选择 保研 考研 考公 就业'),
    item('基础篇 · 学业基石', '四六级、转专业、评奖评优、绩点与挂科提醒。', '#foundation', 'policy', 'foundation', true, 'GPA 绩点 学业 大一 大二 四六级'),
    item('四六级备考与要求', '查询 CET-4、CET-6 的时间安排、准备方法及相关资格要求。', '#foundation', 'policy', 'foundation', true, '英语 四级 六级 425 报名'),
    item('转专业政策', '查看转专业申请条件、时间窗口和官方通知入口。', '#foundation', 'policy', 'foundation', true, '转专业 GPA 排名 志愿 教务'),
    item('评奖评优与综测', '奖学金、综合素质测评和能力素质加分说明。', '#foundation', 'policy', 'foundation', true, '综测 奖学金 加分 学生处'),
    item('挂科与重修提醒', '了解不及格、补考、重修对绩点和推免资格的影响。', '#foundation', 'policy', 'foundation', true, '挂科 重修 补考 不及格'),
    item('保研 · 推免路径', '推免条件、四年时间线、竞赛目录、夏令营与预推免准备。', '#baoyan', 'policy', 'baoyan', true, '保研资格 推免 夏令营 预推免 直博 排名 竞赛'),
    item('2026届推免去向查询', '800条匿名记录，支持18个学院、专业和去向院校筛选与统计。', '#promotion', 'tool', 'baoyan', false, '800 学院 专业 院校 去向 统计 匿名'),
    item('考研 · 统考路径', '从目标院校、公共课和专业课准备到报名、初试、复试与调剂。', '#kaoyan', 'policy', 'kaoyan', true, '研究生 研招网 报名 初试 复试 调剂 数学 英语 政治'),
    item('考研择校对比工具', '在本机比较3—6所目标院校的专业、考试科目、目标分数和信息来源。', '#school-compare', 'tool', 'kaoyan', false, '择校 院校 专业代码 考试科目 目标分数'),
    item('考公 · 国考、省考与选调', '公务员考试时间线、职位筛选、行测申论和选调条件。', '#kaogong', 'policy', 'kaogong', true, '公务员 国考 省考 选调生 行测 申论 职位表'),
    item('直接就业路径', '实习、简历、秋招、春招、面试与签约事项。', '#jiuye', 'policy', 'jiuye', true, '就业 求职 实习 简历 秋招 春招 offer 三方协议'),
    item('经验与资源中心', '统一查找学长学姐经验、视频与可打印资料，并按方向筛选。', '#resource-hub', 'resource', 'all', false, '资源中心 经验 视频 资料 下载 校园'),
    item('联系作者', '反馈内容错误、补充经验或提出功能建议。', '#contact', 'resource', 'campus', false, '联系 反馈 作者 勘误 建议')
  ];

  function item(title, desc, href, type, direction, official, tags) {
    return { title: title, desc: desc, href: href, type: type, direction: direction, official: official, tags: tags || '' };
  }

  function cleanText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function sectionDirection(id) {
    if (['foundation', 'baoyan', 'kaoyan', 'kaogong', 'jiuye'].indexOf(id) !== -1) return id;
    return id === 'promotion' ? 'baoyan' : 'campus';
  }

  function anchorFor(element) {
    var section = element.closest('section[id]');
    if (!section) return '#home';
    if (['seniors', 'videos', 'resources'].indexOf(section.id) !== -1) return '#resource-hub';
    return '#' + section.id;
  }

  function dynamicType(element) {
    if (element.matches('.video-card, .video-chip')) return 'video';
    if (element.matches('.quote-card, .exp-card')) return 'experience';
    if (element.matches('.resource-card')) return 'resource';
    return 'policy';
  }

  function buildDynamicIndex() {
    var selector = '.direction h3.block-title, .faq-item summary, .exp-card, .quote-card, .video-card, .resource-card';
    return Array.prototype.map.call(document.querySelectorAll(selector), function (element) {
      var section = element.closest('section[id]');
      var text = cleanText(element.textContent);
      var heading = element.querySelector && element.querySelector('h4, b, .exp-meta, .quote-who');
      var title = element.matches('h3, summary') ? text : cleanText(heading ? heading.textContent : text.slice(0, 42));
      var type = dynamicType(element);
      var direction = sectionDirection(section ? section.id : 'campus');
      if (section && ['seniors', 'videos', 'resources'].indexOf(section.id) !== -1) {
        if (/保研|推免|直博|夏令营/.test(text)) direction = 'baoyan';
        else if (/考研|上岸|研究生|数学/.test(text)) direction = 'kaoyan';
        else if (/考公|公务员|选调|行测|申论/.test(text)) direction = 'kaogong';
        else if (/就业|求职|招聘|面试|简历|实习/.test(text)) direction = 'jiuye';
      }
      return item(title, text.slice(title.length, title.length + 180) || text.slice(0, 180), anchorFor(element), type, direction, false, text);
    }).filter(function (entry) { return entry.title.length > 1; });
  }

  function dedupe(entries) {
    var seen = {};
    return entries.filter(function (entry) {
      var key = entry.href + '|' + entry.type + '|' + entry.title.slice(0, 60);
      if (seen[key]) return false;
      seen[key] = true;
      return true;
    });
  }

  function normal(value) { return cleanText(value).toLowerCase(); }

  function searchIndex(entries, query, filters) {
    var tokens = normal(query).split(/\s+/).filter(Boolean);
    return entries.map(function (entry, order) {
      if (filters.type !== 'all' && entry.type !== filters.type) return null;
      if (filters.direction !== 'all' && entry.direction !== filters.direction) return null;
      if (filters.official && !entry.official) return null;
      var title = normal(entry.title);
      var tags = normal(entry.tags);
      var desc = normal(entry.desc);
      if (tokens.some(function (token) { return (title + ' ' + tags + ' ' + desc).indexOf(token) === -1; })) return null;
      var score = tokens.length ? 0 : (entry.type === 'tool' ? 2 : 1);
      tokens.forEach(function (token) {
        if (title === token) score += 40;
        else if (title.indexOf(token) === 0) score += 24;
        else if (title.indexOf(token) !== -1) score += 15;
        if (tags.indexOf(token) !== -1) score += 7;
        if (desc.indexOf(token) !== -1) score += 3;
      });
      if (entry.official) score += 1;
      return { entry: entry, score: score, order: order };
    }).filter(Boolean).sort(function (a, b) { return b.score - a.score || a.order - b.order; }).slice(0, 14);
  }

  function escapeHtml(value) {
    return String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function highlight(value, query) {
    var safe = escapeHtml(value);
    var tokens = normal(query).split(/\s+/).filter(Boolean).sort(function (a, b) { return b.length - a.length; });
    if (!tokens.length) return safe;
    var pattern = tokens.map(function (token) { return escapeRegExp(escapeHtml(token)); }).join('|');
    return safe.replace(new RegExp('(' + pattern + ')', 'gi'), '<mark>$1</mark>');
  }

  function loadHistory() {
    try {
      var value = JSON.parse(localStorage.getItem(HISTORY_KEY));
      return Array.isArray(value) ? value.slice(0, 6) : [];
    } catch (error) { return []; }
  }

  function saveHistory(query) {
    var value = cleanText(query);
    if (!value) return;
    var history = loadHistory().filter(function (entry) { return entry !== value; });
    history.unshift(value);
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 6))); } catch (error) { /* 本地存储不可用时忽略。 */ }
  }

  function init() {
    var toggle = document.getElementById('searchToggle');
    var panel = document.getElementById('searchPanel');
    var input = document.getElementById('searchInput');
    var results = document.getElementById('searchResults');
    var discovery = document.getElementById('searchDiscovery');
    var historyRow = document.getElementById('searchHistoryRow');
    var historyContainer = document.getElementById('searchHistory');
    var historyClear = document.getElementById('searchHistoryClear');
    var typeFilters = document.getElementById('searchTypeFilters');
    var directionFilters = document.getElementById('searchDirectionFilters');
    if (!toggle || !panel || !input || !results || !historyRow || !historyContainer || !historyClear || !typeFilters || !directionFilters) return;

    var entries = dedupe(STATIC_INDEX.concat(buildDynamicIndex()));
    var state = { type: 'all', direction: 'all', official: false, active: -1 };
    historyContainer.classList.add('search-suggestion-list');

    function renderHistory() {
      var history = loadHistory();
      historyRow.hidden = history.length === 0;
      historyContainer.innerHTML = history.map(function (value) {
        return '<button type="button" data-search-suggestion="' + escapeHtml(value) + '">' + escapeHtml(value) + '</button>';
      }).join('');
    }

    function filtersAreDefault() { return state.type === 'all' && state.direction === 'all' && !state.official; }

    function render() {
      var query = input.value.trim();
      if (!query && filtersAreDefault()) {
        results.classList.remove('show');
        results.innerHTML = '';
        discovery.hidden = false;
        state.active = -1;
        return;
      }
      discovery.hidden = true;
      results.classList.add('show');
      var matches = searchIndex(entries, query, state);
      state.active = -1;
      if (!matches.length) {
        results.innerHTML = '<div class="search-empty">没有找到匹配内容。可以减少筛选条件，或换一个更短的关键词。</div>';
        return;
      }
      results.innerHTML = matches.map(function (match) {
        var entry = match.entry;
        return '<a class="search-result-item" role="option" aria-selected="false" href="' + escapeHtml(entry.href) + '">' +
          '<span class="search-result-meta"><span>' + escapeHtml(TYPE_LABELS[entry.type] || entry.type) + '</span>' +
          '<span>' + escapeHtml(DIRECTION_LABELS[entry.direction] || entry.direction) + '</span>' +
          (entry.official ? '<span class="official">官方来源</span>' : '') + '</span>' +
          '<span class="sr-title">' + highlight(entry.title, query) + '</span>' +
          '<span class="sr-desc">' + highlight(entry.desc, query) + '</span><span class="sr-go">→</span></a>';
      }).join('');
    }

    function openPanel() {
      panel.classList.add('open');
      toggle.classList.add('active');
      toggle.setAttribute('aria-expanded', 'true');
      input.focus();
      renderHistory();
    }

    function closePanel() {
      panel.classList.remove('open');
      toggle.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
      state.active = -1;
    }

    function chooseSuggestion(value) {
      input.value = value;
      saveHistory(value);
      renderHistory();
      render();
      input.focus();
    }

    function updateActive(delta) {
      var links = results.querySelectorAll('.search-result-item');
      if (!links.length) return;
      state.active = (state.active + delta + links.length) % links.length;
      links.forEach(function (link, index) {
        var active = index === state.active;
        link.classList.toggle('active', active);
        link.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      links[state.active].scrollIntoView({ block: 'nearest' });
    }

    toggle.addEventListener('click', function () { panel.classList.contains('open') ? closePanel() : openPanel(); });
    input.addEventListener('input', render);
    input.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowDown') { event.preventDefault(); updateActive(1); }
      else if (event.key === 'ArrowUp') { event.preventDefault(); updateActive(-1); }
      else if (event.key === 'Enter') {
        var links = results.querySelectorAll('.search-result-item');
        if (state.active >= 0 && links[state.active]) { event.preventDefault(); saveHistory(input.value); links[state.active].click(); }
        else if (input.value.trim()) { saveHistory(input.value); renderHistory(); }
      } else if (event.key === 'Escape') closePanel();
    });

    panel.addEventListener('click', function (event) {
      var suggestion = event.target.closest('[data-search-suggestion]');
      if (suggestion) chooseSuggestion(suggestion.dataset.searchSuggestion);
      var result = event.target.closest('.search-result-item');
      if (result) { saveHistory(input.value); closePanel(); }
    });

    typeFilters.addEventListener('click', function (event) {
      var button = event.target.closest('[data-search-type]');
      if (!button) return;
      state.type = button.dataset.searchType;
      typeFilters.querySelectorAll('[data-search-type]').forEach(function (candidate) { candidate.classList.toggle('active', candidate === button); });
      render();
    });

    directionFilters.addEventListener('click', function (event) {
      var direction = event.target.closest('[data-search-direction]');
      var official = event.target.closest('[data-search-official]');
      if (direction) {
        state.direction = direction.dataset.searchDirection;
        directionFilters.querySelectorAll('[data-search-direction]').forEach(function (candidate) { candidate.classList.toggle('active', candidate === direction); });
      }
      if (official) {
        state.official = !state.official;
        official.classList.toggle('active', state.official);
        official.setAttribute('aria-pressed', state.official ? 'true' : 'false');
      }
      render();
    });

    historyClear.addEventListener('click', function () {
      try { localStorage.removeItem(HISTORY_KEY); } catch (error) { /* 忽略。 */ }
      renderHistory();
    });

    document.addEventListener('click', function (event) {
      if (!event.target.closest('.search-wrap')) closePanel();
    });
    renderHistory();
  }

  window.SiteSearch = {
    init: init,
    search: function (query, filters) {
      return searchIndex(dedupe(STATIC_INDEX.concat(buildDynamicIndex())), query || '', Object.assign({ type: 'all', direction: 'all', official: false }, filters || {}));
    }
  };
})();

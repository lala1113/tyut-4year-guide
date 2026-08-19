/**
 * search.js — 站内全文搜索（纯前端，零依赖）
 *
 * 原理：
 *   1. 静态索引：手动维护的板块级条目（标题 + 描述 + 关键词标签 + 锚点）
 *   2. 动态索引：页面加载后扫描 DOM 中的标题/FAQ/卡片等元素自动补充
 *   3. 搜索时合并两套索引，按 title > tags > desc 权重排序，取前 8 条
 *
 * 用法：main.js 中调用 window.SiteSearch.init()
 */
(function () {
  'use strict';

  /* ========== 静态索引：板块级核心条目 ========== */
  var STATIC_INDEX = [
    {
      title: '首页 · 太原理工大学四年生涯规划指南',
      desc: '保研、考研、考公、直接就业四条路，按年级整理成一条清晰的路',
      href: '#home',
      tags: ['首页', '主页', '太原理工', 'tyut', '规划', '指南', '生涯', '四年', '大学生', '迎西', '虎峪', '柏林', '明向']
    },
    {
      title: '基础篇 · 学业基石',
      desc: '四六级、转专业、评奖评优、挂科警示——所有方向的"地基"',
      href: '#foundation',
      tags: ['基础篇', '四六级', 'cet', 'cet4', 'cet6', '转专业', '评奖评优', '综测', '综合素质测评', '奖学金', '挂科', '重修', '绩点', 'gpa', 'faq', '问答', '时间轴', '全局时间轴', '大一', '大二', '大三', '大四', '学业', '基石']
    },
    {
      title: '全局大学四年时间轴（总览）',
      desc: '大一打基础 → 大二定方向 → 大三拼冲刺 → 大四收成果，四大方向串成主线',
      href: '#foundation',
      tags: ['时间轴', '总览', '时间线', '大一', '大二', '大三', '大四', '全局', '主线', '四年规划']
    },
    {
      title: '四六级备考',
      desc: '推免四级425+/直博六级425+，2026下半年报名9月中下旬、笔试12月，分项备考攻略',
      href: '#foundation',
      tags: ['四六级', 'cet4', 'cet6', '英语四级', '英语六级', '报名', '笔试', '听力', '阅读', '写作', '翻译', '单词', '备考', '425']
    },
    {
      title: '转专业政策',
      desc: 'GPA排名前60%可申请，2个志愿按GPA排序录取，专长生/退伍复学另有通道',
      href: '#foundation',
      tags: ['转专业', '转系', '转院', 'gpa', '排名', '前60%', '志愿', '教务', '通知', '专长生']
    },
    {
      title: '评奖评优 · 综测加分',
      desc: '综测=基本素质(思想品德+学业+身心)+能力素质加分，奖学金一等1800/二等1200/三等600',
      href: '#foundation',
      tags: ['评奖评优', '综测', '综合素质测评', '奖学金', '一等奖', '二等奖', '三等奖', '1800', '1200', '600', '国家奖学金', '励志奖学金', '校长奖学金', '加分', '思想品德', '学业成绩', '身心素质', '能力素质']
    },
    {
      title: '挂科 · 重修警示',
      desc: '保研一票否决、入党受影响、奖学金取消，重修绩点×0.6并注明"重修"',
      href: '#foundation',
      tags: ['挂科', '不及格', '重修', '补考', '绩点', '0.6', '警示', '一票否决', '处分', '作弊']
    },
    {
      title: '保研 · 推免',
      desc: '推荐免试攻读研究生，综合排名+科创加分，3+1+4本博贯通，保研率约11.87%',
      href: '#baoyan',
      tags: ['保研', '推免', '免试', '研究生', '夏令营', '预推免', '保资', '支教保研', '辅导员', '竞赛加分', '科创分', '3+1+4', '本博贯通', '直博', '竞赛目录', '推免系统', '优秀营员', '11.87%']
    },
    {
      title: '保研 · 四年时间线',
      desc: '大一打基础→大二稳排名→大三定目标/夏令营→大四系统填报与复试',
      href: '#baoyan',
      tags: ['保研', '推免', '时间线', '夏令营', '预推免', '5-8月', '9月', '10月20日', '复试', '导师', '邮件']
    },
    {
      title: '保研 · 政策条件解读',
      desc: '推免基本条件、综合成绩排名、科创成绩认定、3+1+4本博贯通、支教团保资辅导员',
      href: '#baoyan',
      tags: ['保研', '推免', '政策', '条件', '综合成绩', '排名', '科创成绩', '3+1+4', '本博贯通', '支教团', '保资辅导员', 'cet4', '425']
    },
    {
      title: '有效竞赛目录（2024年版）',
      desc: '依据校学〔2024〕10号，获奖可作推免科创成绩认定与综测加分依据',
      href: '#baoyan',
      tags: ['竞赛', '目录', '2024', '校学', '10号', '评级', 's级', 'a级', 'b级', '数学建模', '电赛', '智能车', '科创加分']
    },
    {
      title: '考研 · 统考',
      desc: '全国硕士研究生统一招生考试，数学英语政治专业课，初试+复试全流程',
      href: '#kaoyan',
      tags: ['考研', '统考', '研究生', '硕士', '初试', '复试', '调剂', '国家线', '数学', '英语', '政治', '专业课', '660题', '35.02%']
    },
    {
      title: '考研 · 四年时间线',
      desc: '大一夯地基→大二定方向→大三系统复习→大四报名冲刺→复试调剂',
      href: '#kaoyan',
      tags: ['考研', '时间线', '数学', '英语', '政治', '专业课', '9月', '10月', '12月', '初试', '复试', '调剂', '2月', '3月']
    },
    {
      title: '考公 · 选调',
      desc: '国考/省考/定向选调，应届身份是关键窗口，山西选调588人',
      href: '#kaogong',
      tags: ['考公', '公务员', '选调', '选调生', '定向选调', '国考', '省考', '行测', '申论', '结构化面试', '无领导', '入党', '党员', '学生干部', '588', '山西省', '政审']
    },
    {
      title: '考公 · 四年时间线',
      desc: '大一定身份→大二攒履历→大三系统备考→大四国考选调→省考面试政审',
      href: '#kaogong',
      tags: ['考公', '时间线', '入党', '学生干部', '行测', '申论', '国考', '10月', '11月', '选调', '12月', '省考', '面试', '政审']
    },
    {
      title: '直接就业',
      desc: '秋招春招黄金期，国企央企签约占比约37%，去向集中北京太原上海',
      href: '#jiuye',
      tags: ['就业', '秋招', '春招', '实习', '简历', '面试', '国企', '央企', '校园招聘', '双选会', '三方协议', '宏志助航', '求职训练营', '37%', '北京', '太原', '上海', '制造业']
    },
    {
      title: '就业 · 四年时间线',
      desc: '大一自我探索→大二简历从0到1→大三实习冲刺→大四秋招→春招补录签约',
      href: '#jiuye',
      tags: ['就业', '时间线', '实习', '简历', '秋招', '9月', '11月', '春招', '3月', '5月', '三方协议', '签约', 'offer']
    },
    {
      title: '学长学姐说',
      desc: '来自官网、B站、知乎及公开报道的真实分享，每句标注来源',
      href: '#seniors',
      tags: ['学长', '学姐', '经验', '分享', '语录', '徐振然', '侯敏', '王涵', '李城龙', '王海港', '我们的太理', '延时摄影', '知乎', '信息差', '北京大学', '大连理工']
    },
    {
      title: '视频资源专区',
      desc: 'B站原视频与UP主空间直达入口，覆盖四大方向及校内课程',
      href: '#videos',
      tags: ['视频', 'b站', '哔哩哔哩', 'up主', '花生十三', '物电学院', '凌云悟理', '宋浩', '田静', '980系统课', '敖丙', '秋招', '武忠祥']
    },
    {
      title: '资料下载',
      desc: '简历模板、四六级/考研/考公备考清单，可打印另存',
      href: '#resources',
      tags: ['资料', '下载', '模板', '简历模板', '四六级清单', '考研清单', '考公清单', '打印', 'pdf']
    },
    {
      title: '联系作者',
      desc: '保研/考研/转专业/科创竞赛/评奖评优问题，扫码加学长微信交流',
      href: '#contact',
      tags: ['联系', '作者', '学长', '微信', '二维码', '交流', '咨询', 'yxz', '材料成型', '班长', '综测前10%']
    }
  ];

  /* ========== FAQ 条目（精准搜索高频问题） ========== */
  var FAQ_INDEX = [
    { title: 'FAQ：挂科了还能保研吗？', desc: '原则上不能，推免要求前六学期无不及格课程', href: '#foundation', tags: ['挂科', '保研', '推免', '不及格', '一票否决'] },
    { title: 'FAQ：综测到底怎么算？', desc: '综测=基本素质(思想品德+学业+身心)+能力素质加分', href: '#foundation', tags: ['综测', '综合素质测评', '计算', '加分', '思想品德', '学业', '身心'] },
    { title: 'FAQ：选调生和普通公务员有什么区别？', desc: '选调生是党政领导干部后备人选，定向选调竞争更小', href: '#foundation', tags: ['选调生', '公务员', '区别', '定向选调', '国考', '省考'] },
    { title: 'FAQ：四六级没过影响保研吗？', desc: '影响，推免要求CET-4≥425，直博要求CET-6≥425', href: '#foundation', tags: ['四六级', 'cet4', 'cet6', '保研', '推免', '425', '直博'] },
    { title: 'FAQ：转专业什么时候能申请？', desc: '学期末集中开展，GPA排名前60%可申请，2个志愿', href: '#foundation', tags: ['转专业', '申请', '时间', 'gpa', '前60%', '志愿'] },
    { title: 'FAQ：挂科后绩点怎么算？补考过了还有影响吗？', desc: '重修绩点=考试成绩×0.6，成绩单注明"重修"', href: '#foundation', tags: ['挂科', '绩点', '补考', '重修', '0.6'] },
    { title: 'FAQ：奖学金多久评一次？大概多少钱？', desc: '每学期评一次，一等1800/二等1200/三等600', href: '#foundation', tags: ['奖学金', '评定', '金额', '1800', '1200', '600', '国家奖学金', '8000'] },
    { title: 'FAQ：大二才开始准备考研，来得及吗？', desc: '完全来得及，关键是数学英语提前打基础', href: '#foundation', tags: ['考研', '大二', '来得及', '数学', '英语', '基础'] }
  ];

  /* ========== 动态索引：扫描 DOM 标题元素 ========== */
  var dynamicIndex = [];
  var dynamicBuilt = false;

  function buildDynamicIndex() {
    if (dynamicBuilt) return;
    dynamicBuilt = true;
    dynamicIndex = [];
    var sections = document.querySelectorAll('section[id]');
    sections.forEach(function (sec) {
      var anchor = '#' + sec.id;
      var selectors = [
        '.tl-card h4',          // 时间线卡片标题
        '.faq-item summary',    // FAQ 问题
        '.exp-card .exp-meta b', // 学长名字
        '.quote-card .quote-who b', // 学长学姐名字
        '.video-card h4',       // 视频卡片标题
        '.video-chip',          // 视频小链接
        '.resource-card h4',    // 资料卡片标题
        '.tl-stage-year',       // 时间轴年级
        '.hero-card h3',        // Hero 四大方向
        '.metric strong'        // Hero 数据
      ];
      selectors.forEach(function (sel) {
        sec.querySelectorAll(sel).forEach(function (el) {
          var text = (el.textContent || '').trim();
          if (text && text.length >= 2 && text.length <= 50) {
            // 尝试获取描述
            var desc = '';
            var card = el.closest('.tl-card, .faq-item, .exp-card, .quote-card, .video-card, .video-chip, .resource-card');
            if (card) {
              var p = card.querySelector('.faq-body p, .exp-quote, .quote-text, .video-body p, .resource-body p, p');
              if (p) desc = (p.textContent || '').trim().slice(0, 80);
            }
            dynamicIndex.push({
              title: text,
              desc: desc,
              href: anchor,
              tags: []
            });
          }
        });
      });
    });
  }

  /* ========== 合并 + 搜索 ========== */
  function getFullIndex() {
    buildDynamicIndex();
    var seen = {};
    var all = STATIC_INDEX.concat(FAQ_INDEX, dynamicIndex);
    var result = [];
    all.forEach(function (item) {
      var key = item.title + '|' + item.href;
      if (!seen[key]) {
        seen[key] = true;
        result.push(item);
      }
    });
    return result;
  }

  function search(query) {
    query = query.trim().toLowerCase();
    if (!query) return [];
    var index = getFullIndex();
    var results = [];
    index.forEach(function (item) {
      var title = (item.title || '').toLowerCase();
      var desc = (item.desc || '').toLowerCase();
      var tags = (item.tags || []).join(' ').toLowerCase();
      var score = 0;
      if (title.indexOf(query) !== -1) score += 3;
      if (tags.indexOf(query) !== -1) score += 2;
      if (desc.indexOf(query) !== -1) score += 1;
      if (score > 0) results.push({ item: item, score: score });
    });
    results.sort(function (a, b) { return b.score - a.score; });
    return results.slice(0, 8).map(function (r) { return r.item; });
  }

  /* ========== DOM 交互 ========== */
  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function init() {
    var toggle = document.getElementById('searchToggle');
    var panel = document.getElementById('searchPanel');
    var input = document.getElementById('searchInput');
    var results = document.getElementById('searchResults');
    if (!toggle || !input || !results) return;

    var isOpen = false;

    function open() {
      isOpen = true;
      panel.classList.add('open');
      toggle.classList.add('active');
      setTimeout(function () { input.focus(); }, 60);
    }

    function close() {
      isOpen = false;
      panel.classList.remove('open');
      toggle.classList.remove('active');
      results.classList.remove('show');
      results.innerHTML = '';
      input.value = '';
    }

    toggle.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (isOpen) close(); else open();
    });

    var debounceTimer;
    input.addEventListener('input', function () {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function () {
        var q = input.value;
        var hits = search(q);
        renderResults(hits, q);
      }, 120);
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { close(); return; }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        var items = results.querySelectorAll('.search-result-item');
        if (!items.length) return;
        var current = results.querySelector('.search-result-item.active');
        var idx = current ? Array.prototype.indexOf.call(items, current) : -1;
        if (e.key === 'ArrowDown') idx = (idx + 1) % items.length;
        else idx = (idx - 1 + items.length) % items.length;
        for (var i = 0; i < items.length; i++) items[i].classList.remove('active');
        items[idx].classList.add('active');
        items[idx].scrollIntoView({ block: 'nearest' });
      }
      if (e.key === 'Enter') {
        var active = results.querySelector('.search-result-item.active');
        if (active) active.click();
      }
    });

    document.addEventListener('click', function (e) {
      if (isOpen && !panel.contains(e.target) && !toggle.contains(e.target)) {
        close();
      }
    });

    function renderResults(hits, query) {
      results.innerHTML = '';
      if (!query.trim()) {
        results.classList.remove('show');
        return;
      }
      results.classList.add('show');
      if (!hits.length) {
        results.innerHTML = '<div class="search-empty">未找到「' + escapeHtml(query) + '」相关内容，试试搜索：保研 / 考研 / 四六级 / 挂科 / 转专业</div>';
        return;
      }
      var frag = document.createDocumentFragment();
      hits.forEach(function (hit) {
        var a = document.createElement('a');
        a.className = 'search-result-item';
        a.href = hit.href;
        a.innerHTML =
          '<span class="sr-title">' + escapeHtml(hit.title) + '</span>' +
          (hit.desc ? '<span class="sr-desc">' + escapeHtml(hit.desc.slice(0, 72)) + '</span>' : '') +
          '<span class="sr-go" aria-hidden="true">↗</span>';
        a.addEventListener('click', function () { close(); });
        frag.appendChild(a);
      });
      results.appendChild(frag);
    }
  }

  /* ========== 暴露 ========== */
  window.SiteSearch = { init: init, search: search };
})();

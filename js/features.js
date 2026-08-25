/* ==========================================================================
   太原理工大学 · 四年生涯规划指南 — 工具化功能
   核验卡 / 行动中心 / 推免去向 / 资源中心 / 阅读工具 / 方向探索 / 择校对比
   ========================================================================== */

(function () {
  'use strict';

  var STORAGE_PREFIX = 'tyutCareerGuide.v3.';

  function loadLocal(key, fallback) {
    try {
      var value = JSON.parse(localStorage.getItem(STORAGE_PREFIX + key));
      return value === null ? fallback : value;
    } catch (error) {
      return fallback;
    }
  }

  function saveLocal(key, value) {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } catch (error) {
      /* 浏览器禁用存储时保留当次会话可用性。 */
    }
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* ---------- 内容核验卡 ---------- */
  var VERIFICATION_CONFIG = {
    foundation: {
      updatedAt: '2026-08-25', applicable: '长期方法参考；政策按对应学年通知',
      source: '太原理工大学教务部、学生处公开文件', status: '官方入口已标注', official: true,
      warning: '转专业、评奖评优、重修与推免资格口径可能按学年调整，请以学院和学校最新通知为准。'
    },
    baoyan: {
      updatedAt: '2026-08-25', applicable: '2026—2027 学年参考',
      source: '学校推免办法、学院公开通知与公开案例', status: '动态政策需年度核验', official: true,
      warning: '学院名额、综合成绩算法、竞赛加分和接收院校要求均可能变化，实际申请前必须逐项核对。'
    },
    promotion: {
      updatedAt: '2026-08-23', applicable: '2026届公开推免喜报',
      source: '本科招生公众号推免喜报及公开原始文件', status: '匿名汇总 · 待最终人工复核', official: false,
      warning: '本页是去向记录而非推免率；未掌握各专业总人数时，不计算或暗示专业推免率。'
    },
    kaoyan: {
      updatedAt: '2026-08-25', applicable: '长期备考方法；年度节点按报考年度',
      source: '中国研招网、太原理工大学研究生院与公开经验', status: '官方入口已标注', official: true,
      warning: '招生人数、考试科目、报名时间、复试线和调剂缺额均可能变化，请按报考年度核验。'
    },
    kaogong: {
      updatedAt: '2026-08-25', applicable: '方法长期有效；职位与条件按当年公告',
      source: '国家公务员局、山西人事考试专栏及公开选调公告', status: '官方入口已标注', official: true,
      warning: '专业目录、应届身份、党员或学生干部条件、岗位数量与考试时间必须以当年职位表为准。'
    },
    jiuye: {
      updatedAt: '2026-08-25', applicable: '2025届数据参考；求职方法长期有效',
      source: '学校就业质量报告、就业信息网与企业公开招聘入口', status: '数据年份已标注', official: true,
      warning: '招聘批次、岗位、薪酬和工作地点会变化；签约前请核验招聘主体、合同条款和企业公告。'
    },
    'resource-hub': {
      updatedAt: '2026-08-25', applicable: '经验与资源持续维护',
      source: '学校官网、公开媒体、B站原视频与本站自制资料', status: '原始来源保留', official: false,
      warning: '经验只代表分享者个人观点；外部内容与视频版权归原作者，关键信息请交叉核验。'
    }
  };

  function initVerificationCards() {
    Object.keys(VERIFICATION_CONFIG).forEach(function (sectionId) {
      var section = document.getElementById(sectionId);
      if (!section || section.querySelector(':scope > .verification-card')) return;
      var config = VERIFICATION_CONFIG[sectionId];
      var anchor = section.querySelector('.section-head, .promotion-hero');
      if (!anchor) return;
      var card = document.createElement('aside');
      card.className = 'verification-card';
      card.setAttribute('aria-label', '内容核验信息');
      card.innerHTML =
        '<div class="verification-card__head">' +
          '<span class="verification-badge ' + (config.official ? 'official' : '') + '">' +
            (config.official ? '官方来源已标注' : '学生公益整理') +
          '</span>' +
          '<strong>' + escapeHtml(config.status) + '</strong>' +
        '</div>' +
        '<div class="verification-card__grid">' +
          '<div><span>最后更新</span><b>' + escapeHtml(config.updatedAt) + '</b></div>' +
          '<div><span>适用范围</span><b>' + escapeHtml(config.applicable) + '</b></div>' +
          '<div><span>信息来源</span><b>' + escapeHtml(config.source) + '</b></div>' +
        '</div>' +
        '<p>' + escapeHtml(config.warning) + '</p>';
      anchor.insertAdjacentElement('afterend', card);
    });
  }

  /* ---------- 年级 × 月份行动中心 ---------- */
  var GRADE_STAGES = [
    { title: '大一 · 打地基', desc: '稳住课程、英语和规则意识，同时保留探索空间。' },
    { title: '大二 · 定方向', desc: '把成绩、竞赛、项目和职业探索逐渐收束到主方向。' },
    { title: '大三 · 拼冲刺', desc: '围绕保研、考研、考公或就业形成清晰的主线与备选。' },
    { title: '大四 · 收成果', desc: '紧盯报名、考试、投递和签约节点，及时准备备选方案。' }
  ];

  var ACTION_TASKS = [
    [
      ['复盘上学期成绩并计算各科绩点', '整理本学期课程与考试时间表', '选定一项能持续推进的基础任务'],
      ['完成寒假学习复盘和新学期目标', '保持英语单词或听力训练不断档', '了解本专业培养方案与毕业要求'],
      ['为高学分课程建立每周复习计划', '确认四级报名与备考安排', '参加一次学院或社团方向介绍活动'],
      ['检查期中课程薄弱点并及时补救', '了解转专业和综测加分规则', '尝试一次竞赛、实验室或项目体验'],
      ['进入四六级和期末复习节奏', '整理课程作业与项目成果', '制定暑期学习或实践计划'],
      ['完成期末考试与四六级安排', '备份成绩、证书和课程成果', '复盘大一目标完成度'],
      ['用暑期补齐数学、英语或编程基础', '完成一项可展示的小项目或学习成果', '了解四条发展路线的基本要求'],
      ['确认新学期课程和作息计划', '选择一项长期竞赛或实践方向', '更新个人成果与能力清单'],
      ['建立本学期课程周计划', '关注四六级报名和学院通知', '主动认识导师、辅导员或高年级同学'],
      ['复盘期中成绩与学习方法', '核对奖学金、综测和竞赛信息', '为一个课程或项目留下过程证据'],
      ['进入四六级和期末冲刺', '整理本学期证书、项目与活动记录', '评估是否需要调整专业或发展方向'],
      ['完成考试并做年度复盘', '保存成绩和重要材料电子版', '写下下一年度三个可量化目标']
    ],
    [
      ['复盘专业排名和英语进度', '明确保研、考研、考公或就业的优先顺序', '为本学期安排一项核心项目'],
      ['整理寒假项目、竞赛或实践成果', '更新简历第一版和能力缺口', '核对目标方向的硬性要求'],
      ['稳定高学分专业课成绩', '确定一项科研、竞赛或职业探索任务', '参加一次宣讲或经验分享'],
      ['检查排名、英语和项目进度', '关注转专业或学院政策窗口', '开始收集目标院校或岗位信息'],
      ['完成四六级、竞赛或项目阶段成果', '为暑期实践准备简历与材料', '向直系学长学姐核验方向信息'],
      ['完成期末并更新排名记录', '整理证书、项目和课程证据', '制定暑期实习、科研或备考计划'],
      ['推进暑期科研、竞赛或实习', '完成简历和项目讲述初版', '建立目标院校或岗位清单'],
      ['为新学期确定主方向与备选方向', '整理暑期成果并形成可展示材料', '规划六级、专业课和项目节奏'],
      ['关注竞赛、奖学金和学院通知', '启动目标院校或岗位的系统调研', '每周保留固定时间推进核心任务'],
      ['复盘期中成绩和方向匹配度', '统计目标要求中的高频能力', '补齐一项最影响结果的短板'],
      ['准备四六级与期末考试', '更新简历、项目和材料清单', '确认寒假需要完成的关键成果'],
      ['完成年度复盘与成绩归档', '确定大三主线和重要时间节点', '为下一阶段准备第一版申请材料']
    ],
    [
      ['核对专业排名、资格与目标方向', '建立年度考试、申请和投递时间表', '确定主线与一个现实备选方案'],
      ['更新简历、成绩单和证明材料', '完成目标院校或岗位的第一轮筛选', '制定春季阶段周计划'],
      ['关注夏令营、实习和春季招录信息', '开始系统备考或申请材料准备', '完成一次模拟测试或简历反馈'],
      ['核验目标院校、岗位和官方要求', '形成可讲清个人贡献的项目材料', '参加一次导师、企业或经验交流'],
      ['准备夏令营、实习或考试申请材料', '完成阶段测评并调整复习计划', '记录所有截止时间与下一步动作'],
      ['完成期末并保存前六学期材料', '确认暑期冲刺安排和每日节奏', '为主线准备风险预案'],
      ['集中推进夏令营、实习或系统备考', '每周复盘申请、投递或测试结果', '持续更新简历与项目讲述'],
      ['关注夏令营、提前批和秋招', '完成简历与申请材料最终版', '参加一次线上或线下宣讲'],
      ['核验推免、报名和秋招公告', '建立投递或申请进度表', '按目标院校或岗位调整材料'],
      ['关注正式报名和秋招主季', '复盘笔试面试与模拟结果', '及时记录所有关键截止时间'],
      ['完成网上确认或校招后续', '整理错题、材料和面试复盘', '核验录取、合同和信息来源'],
      ['完成年度考试或阶段收尾', '保存本年度成果与申请记录', '为复试、春招或下一方案做准备']
    ],
    [
      ['跟进复试、国考面试或春招信息', '更新投递与录取进度表', '完成毕业论文阶段任务'],
      ['准备复试、调剂、省考或春招', '核验就业协议与录取材料', '整理个人档案和证明材料'],
      ['集中参加复试、面试和春招', '比较录取或 offer 的关键条件', '同步推进毕业论文与体检政审'],
      ['跟进调剂、补录和签约流程', '确认档案、党团关系和毕业手续', '对未确定去向准备备选方案'],
      ['完成毕业答辩和离校准备', '核验合同、录取与报到信息', '保存大学四年重要材料'],
      ['完成毕业、报到和档案转接', '整理账号、证书和材料备份', '为入学或入职制定首月计划'],
      ['熟悉新单位或研究生培养要求', '补齐岗位或研究方向基础知识', '建立新的学习与工作记录'],
      ['准备入职、入学或二次选择', '确认住宿、交通与材料要求', '保持英语和专业能力训练'],
      ['完成报到并适应新阶段', '建立导师或团队沟通机制', '设定第一学期或试用期目标'],
      ['复盘新阶段第一个月表现', '补齐最明显的能力短板', '更新长期发展计划'],
      ['整理阶段成果与反馈', '确认年度考核或培养要求', '制定年末收尾清单'],
      ['完成毕业后首个年度复盘', '保存工作或学习成果证据', '设定下一年度三个重点目标']
    ]
  ];

  var actionState = loadLocal('actionState', { grade: 0, todos: [] });
  if (!Array.isArray(actionState.todos)) actionState.todos = [];
  actionState.grade = Math.max(0, Math.min(3, Number(actionState.grade) || 0));

  function initActionCenter() {
    var root = document.getElementById('action-center');
    if (!root) return;
    var gradeSwitcher = document.getElementById('gradeSwitcher');
    var monthTaskList = document.getElementById('monthTaskList');
    var todoList = document.getElementById('todoList');
    var todoForm = document.getElementById('todoForm');
    var todoInput = document.getElementById('todoInput');
    var addAll = document.getElementById('addAllMonthTasks');
    var monthIndex = new Date().getMonth();

    function persist() {
      saveLocal('actionState', actionState);
    }

    function currentMonthTasks() {
      return ACTION_TASKS[actionState.grade][monthIndex];
    }

    function taskId(index) {
      return 'month-' + actionState.grade + '-' + (monthIndex + 1) + '-' + index;
    }

    function addMonthTask(index) {
      var id = taskId(index);
      if (actionState.todos.some(function (item) { return item.id === id; })) return;
      actionState.todos.push({
        id: id,
        text: currentMonthTasks()[index],
        grade: actionState.grade,
        month: monthIndex + 1,
        completed: false,
        createdAt: Date.now() + index
      });
      persist();
      render();
    }

    function renderMonthTasks() {
      monthTaskList.innerHTML = '';
      currentMonthTasks().forEach(function (text, index) {
        var added = actionState.todos.some(function (item) { return item.id === taskId(index); });
        var row = document.createElement('div');
        row.className = 'month-task';
        row.innerHTML = '<span>' + (index + 1) + '</span><p>' + escapeHtml(text) + '</p>' +
          '<button type="button" data-month-task="' + index + '" ' + (added ? 'disabled' : '') + '>' +
          (added ? '已加入' : '加入待办') + '</button>';
        monthTaskList.appendChild(row);
      });
    }

    function renderTodos() {
      var items = actionState.todos
        .filter(function (item) { return Number(item.grade) === actionState.grade; })
        .sort(function (a, b) { return Number(a.completed) - Number(b.completed) || a.createdAt - b.createdAt; });
      todoList.innerHTML = '';
      if (!items.length) {
        todoList.innerHTML = '<div class="todo-empty">还没有待办，可以从左侧本月建议加入一项。</div>';
      } else {
        items.forEach(function (item) {
          var row = document.createElement('div');
          row.className = 'todo-item' + (item.completed ? ' completed' : '');
          row.innerHTML =
            '<button type="button" class="todo-check" data-todo-toggle="' + escapeHtml(item.id) + '" aria-label="' +
              (item.completed ? '标记为未完成' : '标记为已完成') + '">' + (item.completed ? '✓' : '') + '</button>' +
            '<div><p>' + escapeHtml(item.text) + '</p><span>' + (item.month ? item.month + '月任务' : '自定义任务') + '</span></div>' +
            '<button type="button" class="todo-remove" data-todo-remove="' + escapeHtml(item.id) + '" aria-label="删除待办">×</button>';
          todoList.appendChild(row);
        });
      }
      var completed = items.filter(function (item) { return item.completed; }).length;
      document.getElementById('actionProgressText').textContent = completed + ' / ' + items.length;
      document.getElementById('actionProgressBar').style.width = (items.length ? Math.round(completed / items.length * 100) : 0) + '%';
    }

    function render() {
      document.getElementById('actionMonthLabel').textContent = GRADE_STAGES[actionState.grade].title + ' · ' + (monthIndex + 1) + '月建议';
      document.getElementById('actionStageTitle').textContent = GRADE_STAGES[actionState.grade].title;
      document.getElementById('actionStageDesc').textContent = GRADE_STAGES[actionState.grade].desc;
      gradeSwitcher.querySelectorAll('button').forEach(function (button) {
        var active = Number(button.dataset.grade) === actionState.grade;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
      renderMonthTasks();
      renderTodos();
      renderSavedSections();
    }

    gradeSwitcher.addEventListener('click', function (event) {
      var button = event.target.closest('[data-grade]');
      if (!button) return;
      actionState.grade = Number(button.dataset.grade);
      persist();
      render();
    });

    monthTaskList.addEventListener('click', function (event) {
      var button = event.target.closest('[data-month-task]');
      if (button) addMonthTask(Number(button.dataset.monthTask));
    });

    addAll.addEventListener('click', function () {
      currentMonthTasks().forEach(function (text, index) {
        var id = taskId(index);
        if (!actionState.todos.some(function (item) { return item.id === id; })) {
          actionState.todos.push({ id: id, text: text, grade: actionState.grade, month: monthIndex + 1, completed: false, createdAt: Date.now() + index });
        }
      });
      persist();
      render();
    });

    todoForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var text = todoInput.value.trim();
      if (!text) return;
      actionState.todos.push({ id: 'custom-' + Date.now(), text: text, grade: actionState.grade, month: null, completed: false, createdAt: Date.now() });
      todoInput.value = '';
      persist();
      render();
    });

    todoList.addEventListener('click', function (event) {
      var toggle = event.target.closest('[data-todo-toggle]');
      var remove = event.target.closest('[data-todo-remove]');
      if (toggle) {
        actionState.todos = actionState.todos.map(function (item) {
          return item.id === toggle.dataset.todoToggle ? Object.assign({}, item, { completed: !item.completed }) : item;
        });
      }
      if (remove) {
        actionState.todos = actionState.todos.filter(function (item) { return item.id !== remove.dataset.todoRemove; });
      }
      if (toggle || remove) {
        persist();
        render();
      }
    });

    render();
  }

  /* ---------- 六题方向探索 ---------- */
  var ASSESSMENT_QUESTIONS = [
    { title: '你更喜欢哪种学习方式？', options: [
      { text: '持续深入一个专业问题', scores: { baoyan: 2, kaoyan: 2 } },
      { text: '围绕目标考试系统训练', scores: { kaoyan: 3, kaogong: 2 } },
      { text: '在真实项目中边做边学', scores: { jiuye: 3 } },
      { text: '关注公共事务和社会议题', scores: { kaogong: 3 } }
    ] },
    { title: '你目前最有把握的优势是？', options: [
      { text: '成绩稳定、排名靠前', scores: { baoyan: 3 } },
      { text: '自律性强，能长期备考', scores: { kaoyan: 2, kaogong: 2 } },
      { text: '沟通协作和动手能力', scores: { jiuye: 3 } },
      { text: '表达、写作和信息分析', scores: { kaogong: 2, jiuye: 1 } }
    ] },
    { title: '你希望毕业后优先获得什么？', options: [
      { text: '继续研究和深造', scores: { baoyan: 3, kaoyan: 2 } },
      { text: '进入稳定的公共部门', scores: { kaogong: 3 } },
      { text: '尽快积累工作经验', scores: { jiuye: 3 } },
      { text: '先保留多种选择', scores: { kaoyan: 1, kaogong: 1, jiuye: 1 } }
    ] },
    { title: '你能接受的准备周期是？', options: [
      { text: '从大一开始持续积累', scores: { baoyan: 3 } },
      { text: '集中准备一年左右', scores: { kaoyan: 2, kaogong: 2 } },
      { text: '边实习边寻找机会', scores: { jiuye: 3 } },
      { text: '根据公告和机会灵活安排', scores: { kaogong: 2, jiuye: 1 } }
    ] },
    { title: '你更愿意把时间投入到哪里？', options: [
      { text: '课程成绩、科研和竞赛', scores: { baoyan: 3 } },
      { text: '数学、英语、政治和专业课', scores: { kaoyan: 3 } },
      { text: '实习、作品集和面试', scores: { jiuye: 3 } },
      { text: '行测、申论和公共事务积累', scores: { kaogong: 3 } }
    ] },
    { title: '如果计划发生变化，你通常会？', options: [
      { text: '根据成绩和政策重新评估', scores: { baoyan: 2, kaoyan: 1 } },
      { text: '坚持既定计划并调整节奏', scores: { kaoyan: 2 } },
      { text: '快速尝试新的岗位或项目', scores: { jiuye: 2 } },
      { text: '关注公告并保留备选岗位', scores: { kaogong: 2 } }
    ] }
  ];

  var ASSESSMENT_DIRECTIONS = {
    baoyan: { title: '保研 · 推免', href: '#baoyan', strength: '成绩、排名和持续积累可能是你的主要优势。', next: ['核对本学院推免办法和前六学期成绩', '整理竞赛、项目和证书证明材料', '向辅导员或导师确认当年口径'] },
    kaoyan: { title: '考研 · 统考', href: '#kaoyan', strength: '你可能更适合用明确目标和长期训练换取稳定进步。', next: ['建立 3—6 所目标院校清单', '做一次真题或阶段测试了解基础', '制定每周可执行的公共课与专业课计划'] },
    kaogong: { title: '考公 · 选调', href: '#kaogong', strength: '你对稳定性、公共事务和结构化训练可能有较强匹配度。', next: ['下载当年国考或省考职位表做筛选', '用真题测试行测与申论基础', '关注学校就业部门与选调正式通知'] },
    jiuye: { title: '直接就业', href: '#jiuye', strength: '你可能更适合通过项目、实习和反馈快速形成职业能力。', next: ['收集 20 份目标岗位 JD', '参加一次双选会或企业宣讲', '完成一版针对岗位的简历与项目说明'] }
  };

  function initAssessment() {
    var root = document.getElementById('assessmentCard');
    var start = document.getElementById('assessmentStart');
    if (!root || !start) return;
    var current = 0;
    var answers = [];
    var selected = -1;

    function renderQuestion() {
      var question = ASSESSMENT_QUESTIONS[current];
      root.innerHTML =
        '<div class="assessment-progress"><span>' + (current + 1) + ' / ' + ASSESSMENT_QUESTIONS.length + '</span><i><b style="width:' + ((current + 1) / ASSESSMENT_QUESTIONS.length * 100) + '%"></b></i></div>' +
        '<div class="assessment-question"><span>Q' + (current + 1) + '</span><h3>' + escapeHtml(question.title) + '</h3></div>' +
        '<div class="assessment-options">' + question.options.map(function (option, index) {
          return '<button type="button" class="' + (selected === index ? 'selected' : '') + '" data-assessment-option="' + index + '">' + escapeHtml(option.text) + '</button>';
        }).join('') + '</div>' +
        '<div class="assessment-actions">' +
          (current ? '<button type="button" data-assessment-back>上一步</button>' : '<span></span>') +
          '<button type="button" class="primary" data-assessment-next ' + (selected < 0 ? 'disabled' : '') + '>' + (current === ASSESSMENT_QUESTIONS.length - 1 ? '查看结果' : '下一题') + '</button>' +
        '</div>';
    }

    function renderResult() {
      var scores = { baoyan: 0, kaoyan: 0, kaogong: 0, jiuye: 0 };
      answers.forEach(function (answer, questionIndex) {
        var result = ASSESSMENT_QUESTIONS[questionIndex].options[answer].scores;
        Object.keys(result).forEach(function (key) { scores[key] += result[key]; });
      });
      var ranked = Object.keys(scores).sort(function (a, b) { return scores[b] - scores[a]; });
      var direction = ASSESSMENT_DIRECTIONS[ranked[0]];
      var runnerUp = ASSESSMENT_DIRECTIONS[ranked[1]];
      root.innerHTML =
        '<div class="assessment-result">' +
          '<span class="assessment-result-label">当前更匹配的准备方向</span>' +
          '<h3 class="serif">' + escapeHtml(direction.title) + '</h3>' +
          '<p>' + escapeHtml(direction.strength) + '</p>' +
          '<div class="assessment-next"><strong>接下来先做三件事</strong><ol>' + direction.next.map(function (item) { return '<li>' + escapeHtml(item) + '</li>'; }).join('') + '</ol></div>' +
          '<p class="assessment-runner">也可以同步了解：' + escapeHtml(runnerUp.title) + '，为自己保留备选。</p>' +
          '<div class="assessment-result-actions"><a href="' + direction.href + '">查看' + escapeHtml(direction.title) + '路径 →</a><button type="button" data-assessment-restart>重新评估</button></div>' +
        '</div>';
    }

    start.addEventListener('click', function () { renderQuestion(); });
    root.addEventListener('click', function (event) {
      var option = event.target.closest('[data-assessment-option]');
      if (option) {
        selected = Number(option.dataset.assessmentOption);
        renderQuestion();
        return;
      }
      if (event.target.closest('[data-assessment-back]')) {
        if (current > 0) {
          current -= 1;
          selected = answers[current] == null ? -1 : answers[current];
          renderQuestion();
        }
        return;
      }
      if (event.target.closest('[data-assessment-next]') && selected >= 0) {
        answers[current] = selected;
        if (current === ASSESSMENT_QUESTIONS.length - 1) renderResult();
        else {
          current += 1;
          selected = answers[current] == null ? -1 : answers[current];
          renderQuestion();
        }
        return;
      }
      if (event.target.closest('[data-assessment-restart]')) {
        current = 0;
        answers = [];
        selected = -1;
        renderQuestion();
      }
    });
  }

  /* ---------- 2026届推免去向查询 ---------- */
  function initPromotionQuery() {
    var data = window.PROMOTION_DATA;
    var root = document.getElementById('promotion');
    if (!root || !data) return;
    var collegeSelect = document.getElementById('promotionCollege');
    var majorSelect = document.getElementById('promotionMajor');
    var queryInput = document.getElementById('promotionQuery');
    var sortSelect = document.getElementById('promotionSort');
    var tableBody = document.getElementById('promotionTableBody');
    var topContainer = document.getElementById('promotionTop');
    var empty = document.getElementById('promotionEmpty');

    document.getElementById('promotionTotal').textContent = data.meta.total;
    document.getElementById('promotionCollegeCount').textContent = data.meta.collegeCount;
    document.getElementById('promotionMajorCount').textContent = data.meta.majorCount;
    document.getElementById('promotionUniversityCount').textContent = data.meta.universityCount;

    data.colleges.forEach(function (college) {
      var option = document.createElement('option');
      option.value = college.name;
      option.textContent = college.name + '（' + college.count + '人）';
      collegeSelect.appendChild(option);
    });

    function availableMajors() {
      var selectedCollege = collegeSelect.value;
      var colleges = selectedCollege === 'all' ? data.colleges : data.colleges.filter(function (college) { return college.name === selectedCollege; });
      var names = [];
      colleges.forEach(function (college) {
        college.majors.forEach(function (major) {
          if (names.indexOf(major.name) === -1) names.push(major.name);
        });
      });
      return names.sort(function (a, b) { return a.localeCompare(b, 'zh-CN'); });
    }

    function updateMajorOptions() {
      var current = majorSelect.value;
      majorSelect.innerHTML = '<option value="all">全部专业</option>';
      availableMajors().forEach(function (major) {
        var option = document.createElement('option');
        option.value = major;
        option.textContent = major;
        majorSelect.appendChild(option);
      });
      majorSelect.value = Array.prototype.some.call(majorSelect.options, function (option) { return option.value === current; }) ? current : 'all';
    }

    function flattenRows() {
      var rows = [];
      data.colleges.forEach(function (college) {
        college.majors.forEach(function (major) {
          major.destinations.forEach(function (destination) {
            rows.push({ college: college.name, major: major.name, university: destination.name, count: destination.count });
          });
        });
      });
      return rows;
    }

    var allRows = flattenRows();

    function renderTop(rows) {
      var counts = {};
      rows.forEach(function (row) { counts[row.university] = (counts[row.university] || 0) + row.count; });
      var top = Object.keys(counts).map(function (name) { return { name: name, count: counts[name] }; })
        .sort(function (a, b) { return b.count - a.count || a.name.localeCompare(b.name, 'zh-CN'); }).slice(0, 8);
      topContainer.innerHTML = '';
      if (!top.length) return;
      var max = top[0].count;
      var title = document.createElement('strong');
      title.textContent = '当前筛选 · 去向院校 Top ' + top.length;
      topContainer.appendChild(title);
      top.forEach(function (item) {
        var row = document.createElement('div');
        row.className = 'promotion-top-row';
        row.innerHTML = '<span>' + escapeHtml(item.name) + '</span><i><b style="width:' + Math.max(6, Math.round(item.count / max * 100)) + '%"></b></i><em>' + item.count + '人</em>';
        topContainer.appendChild(row);
      });
    }

    function render() {
      var query = queryInput.value.trim().toLowerCase();
      var rows = allRows.filter(function (row) {
        return (collegeSelect.value === 'all' || row.college === collegeSelect.value) &&
          (majorSelect.value === 'all' || row.major === majorSelect.value) &&
          (!query || (row.college + ' ' + row.major + ' ' + row.university).toLowerCase().indexOf(query) !== -1);
      });
      if (sortSelect.value === 'count') rows.sort(function (a, b) { return b.count - a.count || a.university.localeCompare(b.university, 'zh-CN'); });
      if (sortSelect.value === 'college') rows.sort(function (a, b) { return a.college.localeCompare(b.college, 'zh-CN') || a.major.localeCompare(b.major, 'zh-CN') || b.count - a.count; });
      if (sortSelect.value === 'university') rows.sort(function (a, b) { return a.university.localeCompare(b.university, 'zh-CN') || b.count - a.count; });

      var people = rows.reduce(function (total, row) { return total + row.count; }, 0);
      document.getElementById('promotionResultSummary').textContent = '找到 ' + rows.length + ' 组“专业—去向院校”记录，共 ' + people + ' 人次。';
      tableBody.innerHTML = '';
      rows.slice(0, 250).forEach(function (row) {
        var tr = document.createElement('tr');
        [row.college, row.major, row.university, row.count + '人'].forEach(function (value) {
          var td = document.createElement('td');
          td.textContent = value;
          tr.appendChild(td);
        });
        tableBody.appendChild(tr);
      });
      empty.hidden = rows.length !== 0;
      renderTop(rows);
    }

    collegeSelect.addEventListener('change', function () { updateMajorOptions(); render(); });
    majorSelect.addEventListener('change', render);
    queryInput.addEventListener('input', render);
    sortSelect.addEventListener('change', render);
    document.getElementById('promotionReset').addEventListener('click', function () {
      collegeSelect.value = 'all';
      updateMajorOptions();
      majorSelect.value = 'all';
      queryInput.value = '';
      sortSelect.value = 'count';
      render();
    });
    updateMajorOptions();
    render();
  }

  /* ---------- 择校对比 ---------- */
  function initSchoolCompare() {
    var form = document.getElementById('schoolForm');
    var list = document.getElementById('schoolList');
    var toggle = document.getElementById('schoolFormToggle');
    if (!form || !list || !toggle) return;
    var schools = loadLocal('targetSchools', []);
    if (!Array.isArray(schools)) schools = [];

    function persist() { saveLocal('targetSchools', schools); }

    function addField(parent, label, value) {
      var field = document.createElement('div');
      field.className = 'school-card-field';
      var labelEl = document.createElement('span');
      var valueEl = document.createElement('p');
      labelEl.textContent = label;
      valueEl.textContent = value || '待补充';
      field.appendChild(labelEl);
      field.appendChild(valueEl);
      parent.appendChild(field);
    }

    function render() {
      list.innerHTML = '';
      if (!schools.length) {
        list.innerHTML = '<div class="school-empty">还没有目标院校，先添加一所作为比较起点。</div>';
        return;
      }
      schools.forEach(function (school) {
        var card = document.createElement('article');
        card.className = 'school-card';
        var head = document.createElement('div');
        head.className = 'school-card-head';
        var title = document.createElement('div');
        var name = document.createElement('h4');
        var major = document.createElement('p');
        var remove = document.createElement('button');
        name.textContent = school.name;
        major.textContent = school.major;
        remove.type = 'button';
        remove.textContent = '×';
        remove.dataset.schoolRemove = school.id;
        remove.setAttribute('aria-label', '删除' + school.name);
        title.appendChild(name);
        title.appendChild(major);
        head.appendChild(title);
        head.appendChild(remove);
        card.appendChild(head);
        addField(card, '考试科目', school.subjects);
        addField(card, '目标分数', school.targetScore ? school.targetScore + '分' : '');
        addField(card, '年份、来源与备注', school.note);
        list.appendChild(card);
      });
    }

    function closeForm() {
      form.hidden = true;
      form.reset();
      toggle.setAttribute('aria-expanded', 'false');
    }

    toggle.addEventListener('click', function () {
      form.hidden = !form.hidden;
      toggle.setAttribute('aria-expanded', form.hidden ? 'false' : 'true');
      if (!form.hidden) form.querySelector('input').focus();
    });
    document.getElementById('schoolFormCancel').addEventListener('click', closeForm);
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (schools.length >= 6) {
        window.alert('建议最多保留 6 所候选院校，先删除一所再添加。');
        return;
      }
      var values = new FormData(form);
      schools.unshift({
        id: 'school-' + Date.now(),
        name: String(values.get('name') || '').trim(),
        major: String(values.get('major') || '').trim(),
        subjects: String(values.get('subjects') || '').trim(),
        targetScore: String(values.get('targetScore') || '').trim(),
        note: String(values.get('note') || '').trim(),
        createdAt: Date.now()
      });
      persist();
      closeForm();
      render();
    });
    list.addEventListener('click', function (event) {
      var button = event.target.closest('[data-school-remove]');
      if (!button) return;
      schools = schools.filter(function (school) { return school.id !== button.dataset.schoolRemove; });
      persist();
      render();
    });
    render();
  }

  /* ---------- 统一资源中心 ---------- */
  function classifyResource(text) {
    var value = String(text || '');
    if (/保研|推免|直博|夏令营/.test(value)) return 'baoyan';
    if (/考研|上岸|研究生|数学|英语真题/.test(value)) return 'kaoyan';
    if (/考公|公考|国考|省考|选调|公务员|行测|申论/.test(value)) return 'kaogong';
    if (/就业|求职|校招|秋招|招聘|简历|面试|实习/.test(value)) return 'jiuye';
    return 'campus';
  }

  function initResourceHub() {
    var grid = document.getElementById('resourceHubGrid');
    var tabs = document.getElementById('resourceTabs');
    var filters = document.getElementById('resourceFilters');
    if (!grid || !tabs || !filters) return;
    var templates = { stories: [], videos: [], files: [] };
    document.querySelectorAll('#seniors .quote-card').forEach(function (node) { templates.stories.push({ node: node.cloneNode(true), direction: classifyResource(node.textContent) }); });
    document.querySelectorAll('#videos .video-card').forEach(function (node) { templates.videos.push({ node: node.cloneNode(true), direction: classifyResource(node.textContent) }); });
    document.querySelectorAll('#resources .resource-card').forEach(function (node) { templates.files.push({ node: node.cloneNode(true), direction: classifyResource(node.textContent) }); });
    var state = { tab: 'stories', filter: 'all' };

    function render() {
      var items = templates[state.tab].filter(function (item) { return state.filter === 'all' || item.direction === state.filter; });
      grid.innerHTML = '';
      grid.className = 'resource-hub-grid resource-hub-grid--' + state.tab;
      items.forEach(function (item) {
        var clone = item.node.cloneNode(true);
        clone.classList.add('resource-hub-card');
        clone.dataset.direction = item.direction;
        grid.appendChild(clone);
      });
      document.getElementById('resourceResultCount').textContent = '找到 ' + items.length + ' 条相关内容';
      document.getElementById('resourceHubEmpty').hidden = items.length !== 0;
      tabs.querySelectorAll('button').forEach(function (button) {
        var active = button.dataset.resourceTab === state.tab;
        button.classList.toggle('active', active);
        button.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      filters.querySelectorAll('button').forEach(function (button) {
        button.classList.toggle('active', button.dataset.resourceFilter === state.filter);
      });
    }

    tabs.addEventListener('click', function (event) {
      var button = event.target.closest('[data-resource-tab]');
      if (!button) return;
      state.tab = button.dataset.resourceTab;
      state.filter = 'all';
      render();
    });
    filters.addEventListener('click', function (event) {
      var button = event.target.closest('[data-resource-filter]');
      if (!button) return;
      state.filter = button.dataset.resourceFilter;
      render();
    });

    document.querySelectorAll('.resource-source-section').forEach(function (section) {
      section.hidden = true;
      section.setAttribute('aria-hidden', 'true');
    });
    document.body.classList.add('resource-hub-ready');
    render();

    function routeLegacyHash() {
      var map = { '#seniors': 'stories', '#videos': 'videos', '#resources': 'files' };
      if (!map[location.hash]) return;
      state.tab = map[location.hash];
      state.filter = 'all';
      render();
      setTimeout(function () { document.getElementById('resource-hub').scrollIntoView(); }, 0);
    }
    window.addEventListener('hashchange', routeLegacyHash);
    routeLegacyHash();
  }

  /* ---------- 长文目录、收藏、进度与返回顶部 ---------- */
  var FAVORITE_SECTIONS = {
    foundation: '基础篇 · 学业基石', baoyan: '保研 · 推免', kaoyan: '考研 · 统考',
    kaogong: '考公 · 选调', jiuye: '直接就业', promotion: '2026届推免去向', 'resource-hub': '经验与资源中心'
  };

  function getFavorites() {
    var favorites = loadLocal('favoriteSections', []);
    return Array.isArray(favorites) ? favorites : [];
  }

  function renderSavedSections() {
    var row = document.getElementById('savedSectionRow');
    var list = document.getElementById('savedSectionList');
    if (!row || !list) return;
    var favorites = getFavorites();
    row.hidden = favorites.length === 0;
    list.innerHTML = favorites.map(function (id) {
      return '<a href="#' + escapeHtml(id) + '">' + escapeHtml(FAVORITE_SECTIONS[id] || id) + '</a>';
    }).join('');
  }

  function initReaderTools() {
    var sectionIds = ['foundation', 'baoyan', 'kaoyan', 'kaogong', 'jiuye'];
    var favorites = getFavorites();

    function toggleFavorite(id) {
      var index = favorites.indexOf(id);
      if (index === -1) favorites.push(id); else favorites.splice(index, 1);
      saveLocal('favoriteSections', favorites);
      document.querySelectorAll('[data-favorite-section="' + id + '"]').forEach(function (button) {
        var active = favorites.indexOf(id) !== -1;
        button.classList.toggle('active', active);
        button.textContent = active ? '★ 已收藏' : '☆ 收藏本板块';
      });
      renderSavedSections();
    }

    sectionIds.forEach(function (id) {
      var section = document.getElementById(id);
      if (!section) return;
      var headings = Array.prototype.slice.call(section.querySelectorAll('h3.block-title'));
      if (!headings.length) return;
      var tools = document.createElement('div');
      tools.className = 'section-reader-tools';
      var toc = document.createElement('nav');
      toc.className = 'section-toc';
      toc.setAttribute('aria-label', FAVORITE_SECTIONS[id] + '板块目录');
      headings.forEach(function (heading, index) {
        if (!heading.id) heading.id = id + '-part-' + (index + 1);
        var link = document.createElement('a');
        link.href = '#' + heading.id;
        link.textContent = heading.textContent.replace(/^◆\s*/, '').trim();
        toc.appendChild(link);
      });
      var favorite = document.createElement('button');
      favorite.type = 'button';
      favorite.dataset.favoriteSection = id;
      favorite.className = 'section-favorite' + (favorites.indexOf(id) !== -1 ? ' active' : '');
      favorite.textContent = favorites.indexOf(id) !== -1 ? '★ 已收藏' : '☆ 收藏本板块';
      tools.appendChild(toc);
      tools.appendChild(favorite);
      var verification = section.querySelector(':scope > .verification-card');
      var anchor = verification || section.querySelector('.section-head');
      if (anchor) anchor.insertAdjacentElement('afterend', tools);
    });

    document.addEventListener('click', function (event) {
      var favorite = event.target.closest('[data-favorite-section]');
      if (favorite) toggleFavorite(favorite.dataset.favoriteSection);
    });

    var progressBar = document.getElementById('readingProgressBar');
    var backTop = document.getElementById('backTop');
    function onScroll() {
      var total = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      if (progressBar) progressBar.style.width = Math.min(100, Math.round(window.scrollY / total * 100)) + '%';
      if (backTop) backTop.classList.toggle('show', window.scrollY > 800);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    if (backTop) backTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    onScroll();
    renderSavedSections();
  }

  function init() {
    initVerificationCards();
    initActionCenter();
    initAssessment();
    initPromotionQuery();
    initSchoolCompare();
    initResourceHub();
    initReaderTools();
  }

  init();
  window.TYUTFeatures = { renderSavedSections: renderSavedSections };
})();

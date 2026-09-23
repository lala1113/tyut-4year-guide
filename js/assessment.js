(function () {
  'use strict';
  var data = window.TYUT_ASSESSMENT;
  if (!data) return;

  function evaluate(answers) {
    var chosen = {};
    var scores = { study: 0, public: 0, work: 0 };
    var reasons = { study: [], public: [], work: [] };
    var answeredSignals = 0;
    data.questions.forEach(function (question) {
      var option = question.options.find(function (item) { return item.id === answers[question.id]; });
      if (!option) throw new Error('请先完成全部题目。');
      chosen[question.id] = option.id;
      if (option.scores) {
        if (option.id !== 'unsure' && option.id !== 'mixed') answeredSignals += 1;
        Object.keys(option.scores).forEach(function (key) {
          scores[key] += option.scores[key];
          reasons[key].push(question.dimension + '：' + option.text);
        });
      }
    });
    // 三类方向的最高分均为 10。阈值仅用于自编导航的保守分组，不代表量表常模或成功率。
    var ranked = Object.keys(scores).sort(function (a, b) { return scores[b] - scores[a]; });
    var exploratory = answeredSignals < 3 || scores[ranked[0]] < 4;
    var leading = exploratory ? [] : ranked.filter(function (key) { return scores[ranked[0]] - scores[key] <= 1; });
    var canApply = chosen.stage !== 'graduate' && chosen.eligibility !== 'unavailable';
    var studyPlan;
    if (chosen.motivation === 'no') {
      studyPlan = { text: '你目前不计划读研。专业兴趣也可以通过岗位项目继续发展，可先从实践验证下一步。', routes: ['jiuye'] };
    } else if (chosen.motivation === 'pressure' || chosen.motivation === 'unsure') {
      studyPlan = { text: '先确认读研能解决什么问题：比较目标岗位要求与研究生日常，再决定是否投入升学准备。', routes: ['kaoyan', 'jiuye'] };
    } else if (!canApply) {
      studyPlan = { text: '按你填写的阶段或时间窗口，升学可先了解统考路径，结合目标专业要求安排基础学习。', routes: ['kaoyan'] };
    } else if (chosen.eligibility === 'confirmed') {
      studyPlan = { text: '你自报已核对推免条件且仍在申请窗口，可优先了解推免申请；同时核实接收要求和统考备选安排。', routes: ['baoyan', 'kaoyan'] };
    } else {
      studyPlan = { text: '推免条件尚未确定。先查学校与学院当年要求、排名和时间窗口，再比较推免与统考的准备安排。', routes: ['baoyan', 'kaoyan'] };
    }
    var notes = [];
    if (chosen.stage === 'early') notes.push('当前阶段：优先稳住课程基础，多做短期体验，再逐步收敛方向。');
    if (chosen.stage === 'middle') notes.push('当前阶段：把目标要求、申请节点和每周可投入时间列到同一张计划表中。');
    if (chosen.stage === 'final') notes.push('当前阶段：先确认本届报名与招聘窗口，为升学、考试和求职安排好先后顺序。');
    if (chosen.stage === 'graduate') notes.push('当前阶段：根据毕业后的身份和实际岗位要求，核对统考与招聘条件。');
    if (chosen.motivation === 'change') notes.push('转向深造：先核实目标专业的先修知识、招生要求与培养内容，安排一次基础学习体验。');
    if (chosen.resources === 'income') notes.push('收入安排：优先衔接实习或求职；若仍考虑深造，先核实学制、资助与生活成本，再决定投入。');
    if (chosen.resources === 'limited') notes.push('时间安排：先选一条准备主线，每周安排能完成的小任务，避免同时启动多套高强度计划。');
    if (chosen.resources === 'unsure') notes.push('资源安排：先盘点每周时间和可承受的准备成本，再决定投入强度。');
    if (chosen.evidence === 'unsure') notes.push('经历依据：目前缺少亲身体验，建议完成一次小任务并获得反馈后，再回看这份结果。');
    if (chosen.evidence === 'mixed') notes.push('经历依据：你有多类正向体验，可以比较哪类任务在遇到困难后仍让你愿意继续。');
    return { scores: scores, ranked: ranked, leading: leading, exploratory: exploratory, reasons: reasons, studyPlan: studyPlan, notes: notes };
  }

  window.TYUTAssessment = { evaluate: evaluate };
  var root = document.getElementById('assessmentCard');
  if (!root) return;
  var current = 0;
  var answers = {};

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]; });
  }
  function focusHeading() {
    root.querySelector('[data-assessment-heading]').focus();
  }
  function renderQuestion() {
    var question = data.questions[current];
    var selected = answers[question.id];
    root.innerHTML =
      '<div class="assessment-progress"><span>第 ' + (current + 1) + ' / ' + data.questions.length + ' 题 · ' + escapeHtml(question.dimension) + '</span>' +
      '<i aria-hidden="true"><b style="width:' + (current / data.questions.length * 100) + '%"></b></i></div>' +
      '<form id="assessmentForm"><div class="assessment-question"><span aria-hidden="true">Q' + (current + 1) + '</span>' +
      '<h2 id="assessmentQuestion" tabindex="-1" data-assessment-heading>' + escapeHtml(question.title) + '</h2></div>' +
      '<p class="assessment-hint" id="assessmentHint">' + escapeHtml(question.hint) + '</p>' +
      '<div class="assessment-options" role="radiogroup" aria-labelledby="assessmentQuestion" aria-describedby="assessmentHint">' +
      question.options.map(function (option) {
        return '<label class="assessment-option"><input type="radio" name="answer" value="' + option.id + '" required ' + (selected === option.id ? 'checked' : '') + '><span>' + escapeHtml(option.text) + '</span></label>';
      }).join('') + '</div><div class="assessment-actions">' +
      (current ? '<button type="button" data-assessment-back>上一题</button>' : '<span></span>') +
      '<button type="submit" class="primary" ' + (!selected ? 'disabled' : '') + '>' + (current === data.questions.length - 1 ? '查看探索建议' : '下一题') + '</button></div></form>';
    focusHeading();
  }
  function routeLinks(keys) {
    return '<div class="assessment-route-links">' + keys.map(function (key) {
      var route = data.routes[key];
      return '<a href="' + route.href + '">了解' + route.title + ' →</a>';
    }).join('') + '</div>';
  }
  function renderResult() {
    var result = evaluate(answers);
    var candidates = result.exploratory ? ['study', 'public', 'work'] : result.leading;
    var title = result.exploratory ? '先用体验补充判断依据' : result.leading.length > 1 ? '这些方向值得并行了解' : '优先探索：' + data.domains[result.leading[0]].title;
    var intro = result.exploratory ? '目前的偏好信息较少，或几类任务的投入意愿都不强。先选择下面一项小体验，完成后再比较感受。' : result.leading.length > 1 ? '你的回答对这些方向提供了接近的支持。先各做一次小体验，再结合现实安排确定准备顺序。' : '这是你当前回答支持较多的探索方向。下面列出依据与可验证的下一步，供你结合实际经历判断。';
    root.innerHTML = '<div class="assessment-result"><span class="assessment-result-label">10 / 10 · 已完成</span>' +
      '<h2 class="serif" tabindex="-1" data-assessment-heading>' + escapeHtml(title) + '</h2><p>' + intro + '</p>' +
      candidates.map(function (key) {
        var plan = key === 'study' ? result.studyPlan : key === 'public' ?
          { text: '可先了解考公与选调的具体岗位，核对专业、身份及地域要求，再体验备考任务；公共服务兴趣也可在其他职业中实现。', routes: ['kaogong'] } :
          { text: '从感兴趣的岗位要求出发，用实习或小项目检验日常任务是否适合自己，再安排求职准备。', routes: ['jiuye'] };
        var reasons = result.reasons[key];
        return '<section class="assessment-direction"><h3>' + data.domains[key].title + '</h3>' +
          (reasons.length ? '<strong>你的回答依据</strong><ul>' + reasons.map(function (text) { return '<li>' + escapeHtml(text) + '</li>'; }).join('') + '</ul>' : '<p>暂时缺少这类方向的回答依据，可通过体验进一步了解。</p>') +
          '<p>' + escapeHtml(plan.text) + '</p>' + routeLinks(plan.routes) +
          '<p class="assessment-experiment"><strong>体验任务：</strong>' + escapeHtml(data.domains[key].experiment) + '</p></section>';
      }).join('') +
      '<div class="assessment-next"><strong>接下来两周，做一次小验证</strong><ol>' +
      '<li>从上面选择一项体验任务，安排可完成的时间；若要比较多个方向，可分周进行。</li>' +
      '<li>记录实际投入时间、遇到的困难，以及完成后是否愿意继续。</li>' +
      '<li>找老师、学长学姐或从业者核对你的理解，再选一条近期主线并保留备选。</li></ol></div>' +
      '<div class="assessment-context"><strong>结合你的实际安排</strong><ul>' + result.notes.map(function (note) { return '<li>' + escapeHtml(note) + '</li>'; }).join('') + '</ul></div>' +
      '<p class="assessment-runner">结果反映当前自报偏好，不是录取概率或能力评级。可以在获得新经历后重新作答。</p>' +
      '<details class="assessment-review"><summary>回看并修改我的回答</summary><ol>' + data.questions.map(function (question, index) {
        var option = question.options.find(function (item) { return item.id === answers[question.id]; });
        return '<li><strong>' + escapeHtml(question.dimension) + '</strong><p>' + escapeHtml(option.text) + '</p><button type="button" data-assessment-edit="' + index + '" aria-label="修改第 ' + (index + 1) + ' 题：' + escapeHtml(question.dimension) + '">修改</button></li>';
      }).join('') + '</ol></details><div class="assessment-result-actions"><a href="action-center.html#action-center">前往本月行动中心 →</a>' +
      '<button type="button" data-assessment-restart>重新探索</button></div></div>';
    focusHeading();
  }
  root.addEventListener('change', function (event) {
    if (event.target.name !== 'answer') return;
    answers[data.questions[current].id] = event.target.value;
    root.querySelector('[type="submit"]').disabled = false;
  });
  root.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!answers[data.questions[current].id]) return;
    if (current === data.questions.length - 1) renderResult();
    else { current += 1; renderQuestion(); }
  });
  root.addEventListener('click', function (event) {
    if (event.target.closest('#assessmentStart')) renderQuestion();
    if (event.target.closest('[data-assessment-back]') && current > 0) { current -= 1; renderQuestion(); }
    var edit = event.target.closest('[data-assessment-edit]');
    if (edit) { current = Number(edit.dataset.assessmentEdit); renderQuestion(); }
    if (event.target.closest('[data-assessment-restart]')) { current = 0; answers = {}; renderQuestion(); }
  });
})();

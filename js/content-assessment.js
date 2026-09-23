/* 自编生涯探索题：兴趣、价值取向与经历用于比较方向，现实条件用于安排路径。 */
window.TYUT_ASSESSMENT = {
  questions: [
    { id: 'stage', dimension: '当前阶段', title: '你目前处于哪个学习阶段？', hint: '用于调整准备节奏；五年制同学按距离毕业的时间选择。', options: [
      { id: 'early', text: '大一或大二，距离毕业至少两年' },
      { id: 'middle', text: '大三，距离毕业约一至两年' },
      { id: 'final', text: '毕业学年，正在落实升学或工作去向' },
      { id: 'graduate', text: '已经本科毕业' }
    ] },
    { id: 'priority', dimension: '价值取向', title: '考虑毕业后的第一段经历，你最希望优先获得什么？', hint: '如果几项都重要，选你目前最不愿意舍弃的一项。', options: [
      { id: 'study', text: '系统深化专业能力，为目标领域积累知识和研究训练', scores: { study: 3 } },
      { id: 'public', text: '参与公共服务，让工作与社会事务产生直接联系', scores: { public: 3 } },
      { id: 'work', text: '进入实际岗位，通过解决业务问题积累职业经验', scores: { work: 3 } },
      { id: 'unsure', text: '几项同样重要，暂时无法排出优先级', scores: {} }
    ] },
    { id: 'research', dimension: '专业与研究兴趣', title: '面对一个没有标准答案的专业问题，你愿意持续查资料、尝试方法，并解释结果吗？', hint: '可以联想课程设计、实验、论文阅读或专题调研中的真实感受。', options: [
      { id: 'high', text: '很愿意，即使进展慢，也想继续弄清楚', scores: { study: 3 } },
      { id: 'medium', text: '比较愿意，有指导或阶段目标时更容易投入', scores: { study: 2 } },
      { id: 'low', text: '偶尔愿意，但不想长期把这类任务作为主要投入', scores: { study: 1 } },
      { id: 'no', text: '目前不愿意，更希望任务和完成标准明确', scores: {} },
      { id: 'unsure', text: '还没有足够经历，暂时判断不了', scores: {} }
    ] },
    { id: 'public', dimension: '公共服务兴趣', title: '对解释政策、协调不同诉求、按程序处理公共事务这类日常工作，你有多大兴趣？', hint: '请考虑工作内容本身，包括重复沟通和流程要求。', options: [
      { id: 'high', text: '兴趣较强，愿意持续了解并亲自体验', scores: { public: 3 } },
      { id: 'medium', text: '有一定兴趣，想先了解具体岗位的日常', scores: { public: 2 } },
      { id: 'low', text: '兴趣一般，主要被工作保障等外部条件吸引', scores: { public: 1 } },
      { id: 'no', text: '目前兴趣不大，这类任务让我缺少投入感', scores: {} },
      { id: 'unsure', text: '接触太少，暂时判断不了', scores: {} }
    ] },
    { id: 'practice', dimension: '岗位实践兴趣', title: '在实际岗位中，围绕用户或业务需求协作，并根据反馈反复改进交付，你有多大兴趣？', hint: '可联想技术、产品、运营、设计等岗位；只按自己的体验判断。', options: [
      { id: 'high', text: '兴趣较强，喜欢把想法做成可使用的成果', scores: { work: 3 } },
      { id: 'medium', text: '有一定兴趣，愿意先通过实习或项目体验', scores: { work: 2 } },
      { id: 'low', text: '兴趣一般，更希望先积累知识再接触具体业务', scores: { work: 1 } },
      { id: 'no', text: '目前兴趣不大，不想以业务交付为主要任务', scores: {} },
      { id: 'unsure', text: '还没有相关经历，暂时判断不了', scores: {} }
    ] },
    { id: 'preparation', dimension: '持续投入意愿', title: '未来三个月，每周能留出固定时间时，你更愿意持续完成哪组任务？', hint: '选愿意坚持的投入，而不是看起来更有优势的答案。', options: [
      { id: 'study', text: '补专业基础，阅读资料，并完成一个有反馈的专题任务', scores: { study: 2 } },
      { id: 'public', text: '了解公共岗位，练习材料分析与表达，并复盘练习结果', scores: { public: 2 } },
      { id: 'work', text: '体验目标岗位，打磨项目或作品，并练习简历与面试', scores: { work: 2 } },
      { id: 'unsure', text: '还没有明显偏好，想先各尝试一次', scores: {} }
    ] },
    { id: 'motivation', dimension: '深造动机', title: '关于本科毕业后继续读研，哪项最接近你的真实想法？', hint: '这题用于判断升学建议需要先补充哪些依据。', options: [
      { id: 'clear', text: '已有感兴趣的领域或目标岗位，能说明读研对它的帮助' },
      { id: 'change', text: '希望调整专业方向，愿意了解课程要求和补基础的成本' },
      { id: 'pressure', text: '主要因为周围人读研，或暂时不想面对就业选择' },
      { id: 'no', text: '现阶段不计划读研，希望先工作或实践' },
      { id: 'unsure', text: '尚不清楚读研的日常与收获，需要进一步了解' }
    ] },
    { id: 'eligibility', dimension: '推免路径条件', title: '你对自己的推免条件和申请时间窗口，了解到了哪一步？', hint: '按当年学校、学院要求判断；这里的自报情况不代表资格认定。', options: [
      { id: 'confirmed', text: '已核对当年要求，具备申请条件或已获资格，且仍在申请窗口内' },
      { id: 'possible', text: '仍有准备时间，可能具备条件，但名额、排名等尚未确定' },
      { id: 'unavailable', text: '已确认当前不具备条件，或本届推免申请窗口已结束' },
      { id: 'unsure', text: '尚未了解，或暂时无法判断' }
    ] },
    { id: 'resources', dimension: '时间与现实安排', title: '哪项最能描述你接下来准备升学或求职时的现实安排？', hint: '只选择安排类型，无需提供收入、家庭或其他个人信息。', options: [
      { id: 'supported', text: '能安排持续的准备时间，也能评估继续学习的生活与资金安排' },
      { id: 'income', text: '毕业后需要优先获得收入，希望准备方案能与求职衔接' },
      { id: 'limited', text: '课程、实习或其他责任较多，目前每周可投入时间有限' },
      { id: 'unsure', text: '尚未盘点时间和成本，需要先做安排' }
    ] },
    { id: 'evidence', dimension: '已有经历', title: '过去一年，哪类经历最能支持你“愿意继续做下去”的判断？', hint: '选最能说明兴趣的一项；没有经历也可以如实作答。', options: [
      { id: 'study', text: '课程专题、实验、阅读或调研：遇到困难后仍愿意继续深入', scores: { study: 2 } },
      { id: 'public', text: '公共服务或事务协调：了解日常后仍愿意继续参与', scores: { public: 2 } },
      { id: 'work', text: '实习、项目或作品：收到使用者反馈后仍愿意继续改进', scores: { work: 2 } },
      { id: 'mixed', text: '有两类及以上类似体验，暂时难分先后', scores: {} },
      { id: 'unsure', text: '主要停留在想象或听说，还缺少亲身体验', scores: {} }
    ] }
  ],
  domains: {
    study: { title: '专业深造', experiment: '访谈一位目标专业研究生，了解日常任务，再完成一次阅读、实验或专题练习。' },
    public: { title: '公共服务与公共部门', experiment: '访谈一位公共部门从业者，记录岗位日常、服务对象和地域要求，再做一次材料分析练习。' },
    work: { title: '岗位实践与直接就业', experiment: '找三份感兴趣的岗位描述，尝试一项对应的小任务，请有经验的人给出反馈。' }
  },
  routes: {
    baoyan: { title: '保研 · 推免', href: 'baoyan.html#baoyan' },
    kaoyan: { title: '考研 · 统考', href: 'kaoyan.html#kaoyan' },
    kaogong: { title: '考公 · 选调', href: 'kaogong.html#kaogong' },
    jiuye: { title: '实习与就业', href: 'jiuye.html#jiuye' }
  }
};

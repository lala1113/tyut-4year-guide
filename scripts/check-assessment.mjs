import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const context = vm.createContext({ window: {}, document: { getElementById: () => null } });
for (const file of ['js/content-assessment.js', 'js/assessment.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
}
const { questions, routes } = context.window.TYUT_ASSESSMENT;
const evaluate = answers => JSON.parse(JSON.stringify(context.window.TYUTAssessment.evaluate(answers)));
const base = { stage: 'middle', priority: 'study', research: 'high', public: 'no', practice: 'no', preparation: 'study', motivation: 'clear', eligibility: 'confirmed', resources: 'supported', evidence: 'study' };

test('题数上限、唯一选项及三类方向分值上限一致', () => {
  assert.ok(questions.length > 6 && questions.length <= 10);
  assert.equal(new Set(questions.map(q => q.id)).size, questions.length);
  questions.forEach(q => assert.equal(new Set(q.options.map(o => o.id)).size, q.options.length));
  const maxima = ['study', 'public', 'work'].map(key => questions.reduce((sum, q) => sum + Math.max(...q.options.map(o => o.scores?.[key] || 0)), 0));
  assert.deepEqual(maxima, [10, 10, 10]);
});
test('三种明确兴趣画像均可优先呈现，深造按条件区分推免与统考', () => {
  for (const key of ['study', 'public', 'work']) {
    const answers = { ...base, priority: key, research: 'no', public: 'no', practice: 'no', preparation: key, evidence: key };
    answers[{ study: 'research', public: 'public', work: 'practice' }[key]] = 'high';
    assert.deepEqual(evaluate(answers).leading, [key]);
  }
  assert.deepEqual(evaluate(base).studyPlan.routes, ['baoyan', 'kaoyan']);
  assert.deepEqual(evaluate({ ...base, eligibility: 'unavailable' }).studyPlan.routes, ['kaoyan']);
});
test('同分和接近结果并列，不由固定排序产生唯一赢家', () => {
  const tie = { ...base, priority: 'study', research: 'high', public: 'high', practice: 'no', preparation: 'public', evidence: 'mixed' };
  assert.deepEqual(evaluate(tie).leading, ['study', 'public']);
  assert.deepEqual(evaluate({ ...tie, research: 'medium' }).leading, ['study', 'public']);
});
test('不知道或全无兴趣时不强制推荐，保留体验入口', () => {
  const unknown = Object.fromEntries(questions.map(q => [q.id, q.options.find(o => o.id === 'unsure')?.id || q.options[0].id]));
  assert.equal(evaluate(unknown).exploratory, true);
  assert.deepEqual(evaluate(unknown).leading, []);
  assert.equal(evaluate({ ...unknown, research: 'no', public: 'no', practice: 'no' }).exploratory, true);
});
test('各类现实条件不改变兴趣分，毕业或已无窗口时不引导推免申请', () => {
  const scores = evaluate(base).scores;
  for (const stage of ['early', 'middle', 'final', 'graduate']) {
    for (const eligibility of ['confirmed', 'possible', 'unavailable', 'unsure']) {
      for (const resources of ['supported', 'income', 'limited', 'unsure']) {
        const result = evaluate({ ...base, stage, eligibility, resources });
        assert.deepEqual(result.scores, scores);
        if (stage === 'graduate' || eligibility === 'unavailable') assert.ok(!result.studyPlan.routes.includes('baoyan'));
      }
    }
  }
});
test('不打算读研或动机尚未明确时提供对应建议', () => {
  assert.deepEqual(evaluate({ ...base, motivation: 'no' }).studyPlan.routes, ['jiuye']);
  for (const motivation of ['pressure', 'unsure']) assert.match(evaluate({ ...base, motivation }).studyPlan.text, /先确认读研/);
  assert.ok(evaluate({ ...base, resources: 'income' }).notes.some(note => note.includes('收入安排')));
  assert.ok(evaluate({ ...base, evidence: 'unsure' }).notes.some(note => note.includes('缺少亲身体验')));
});
test('未完成或无效答案不生成结果', () => {
  assert.throws(() => evaluate({}), /请先完成/);
  assert.throws(() => evaluate({ ...base, research: 'invalid' }), /请先完成/);
});
test('结果路径指向实际锚点，探索页按顺序加载题库和逻辑', () => {
  for (const route of Object.values(routes)) {
    const [file, id] = route.href.split('#');
    assert.ok(fs.readFileSync(path.join(root, file), 'utf8').includes(`id="${id}"`));
  }
  const html = fs.readFileSync(path.join(root, 'exploration.html'), 'utf8');
  assert.ok(html.indexOf('js/content-assessment.js') < html.indexOf('js/assessment.js'));
  assert.ok(html.includes('js/assessment.js'));
});

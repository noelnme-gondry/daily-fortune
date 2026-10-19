import test from 'node:test';
import assert from 'node:assert/strict';
import { ttiDay, ttiYear, ttiMonths, addDays } from '../src/engine/index.js';
import { zodiacOutlook, zodiacYearSummary } from '../src/domain/zodiac-outlook.js';
import { withLanguage } from '../src/i18n/runtime.js';

const JARGON = /천간|지지|오행|육합|삼합|원진|합충|도화|역마|홍란|천희|본명년/;
const START = { y: 2026, m: 10, d: 20 };

test('띠 일간·월간은 생활 속 운과 행동을 먼저 설명하고 전문용어를 나열하지 않는다', () => {
  for (let t = 0; t < 12; t++) {
    for (let d = 0; d < 60; d++) {
      const r = ttiDay(t, addDays(START, d));
      assert.ok(r.outlook?.length > 10);
      assert.ok(r.advice?.length > 10);
      assert.ok(r.caution?.length > 10);
      assert.equal(r.text, `${r.outlook} ${r.advice} ${r.caution}`);
      assert.match(r.text, /대인운|협업운|재물운|업무운|학업/);
      assert.doesNotMatch(r.text, JARGON);
      assert.equal(r.cats, undefined, '일간에 계산하지 않은 분야 점수를 추가하지 않는다');
    }
    for (const m of ttiMonths(t, 2026)) {
      assert.doesNotMatch(m.text, JARGON);
      assert.match(m.text, /대인운|협업운|재물운|업무운|학업/);
    }
  }
});

test('연간 요약의 최고·최저 분야와 점수는 실제 분야 계산과 일치한다', () => {
  for (let t = 0; t < 12; t++) for (const y of [2026, 2027]) {
    const r = ttiYear(t, y);
    const high = Math.max(...r.cats.map((c) => c.score)), low = Math.min(...r.cats.map((c) => c.score));
    assert.doesNotMatch(r.summary, JARGON);
    if (high === low) assert.ok(r.summary.includes(`모두 ${high}점`));
    else for (const c of r.cats.filter((c) => c.score === high || c.score === low)) {
      assert.ok(r.summary.includes(c.name), `${r.animal}: ${c.name}`);
      assert.ok(r.summary.includes(`${c.score}점`));
    }
    assert.ok(r.basis?.length > 0, '전문용어 근거는 별도로 보존');
  }
});

test('낮은 점수·동점·혼재한 근거를 좋은 운으로 포장하지 않는다', () => {
  const low = zodiacOutlook({ rel: '형', e: 1, es: 3, score: 40 });
  assert.match(low.outlook, /속도를 조절/);
  assert.doesNotMatch(low.outlook, /좋은|돋보|적극/);
  assert.match(low.caution, /업무운/);
  const mixed = zodiacOutlook({ rel: '충', e: 2, es: 3, score: 50 });
  assert.match(mixed.outlook, /재물운/);
  assert.match(mixed.caution, /이동·변화운/);
  assert.match(zodiacOutlook({ rel: '없음', e: 3, score: 50 }).caution, /업무운/);
  const cats = ['career', 'money', 'love', 'move', 'health'].map((key) => ({ key, name: key, score: 40 }));
  assert.match(zodiacYearSummary(cats), /어느 한 운이 더 높지는 않습니다/);
  assert.doesNotMatch(zodiacYearSummary(cats), /좋은/);
  cats[0].score = 50;
  assert.match(zodiacYearSummary(cats), /상대적으로 높지만/);
  cats.forEach((c) => { c.score += 30; });
  assert.match(zodiacYearSummary(cats), /낮은 점수대는 아닙니다/);
  assert.doesNotMatch(zodiacYearSummary(cats), /주의해서 살필/);
});

test('새 해설의 한영 대응과 새로고침 결과가 일치한다', () => {
  for (let t = 0; t < 12; t++) {
    const before = ttiDay(t, START);
    const en = withLanguage('en', () => ttiDay(t, START));
    assert.equal(en.score, before.score);
    assert.ok(en.outlook && en.advice && en.caution);
    assert.doesNotMatch(en.text, /[가-힣]/);
    assert.deepEqual(ttiDay(t, START), before);
  }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../src/engine/index.js';
import TABLE from '../src/content/rank-table.js';
import { ARCS } from '../src/content/story.js';
import { analyze } from '../src/engine/chart.js';
import { rankScore, allPillars } from '../src/engine/rank.js';
import { storyCode } from '../src/site/share-codec.js';
import { parseShare } from '../src/site/pages/share.js';

const TODAY = { y: 2026, m: 10, d: 14 };
const A = { name: '서윤', gender: 'F', calendar: 'solar', y: 1993, m: 1, d: 28, time: '03:40' };

test('랭킹 분포표: 전체 사주 수와 합계가 맞다', () => {
  const sum = (h) => h.reduce((a, b) => a + b, 0);
  assert.equal(TABLE.four.n, 518400);
  assert.equal(TABLE.three.n, 43200);
  assert.equal(sum(TABLE.four.total), 518400);
  assert.equal(sum(TABLE.three.total), 43200);
  for (const k of Object.keys(TABLE.four.cats)) assert.equal(sum(TABLE.four.cats[k]), 518400);
  assert.equal(TABLE.ilju.length, 60);
});

test('랭킹 분포표가 현재 점수 규칙과 일치한다 (3기둥 전수 재계산)', () => {
  const total = new Array(TABLE.three.total.length).fill(0);
  let n = 0;
  for (const p of allPillars(false)) { const s = rankScore(analyze(p)); total[Math.round(s.total * 10)]++; n++; }
  assert.equal(n, 43200);
  assert.deepEqual(total, TABLE.three.total, 'src/content/rank-table.js를 node scripts/gen-rank.mjs로 다시 생성하세요');
});

test('사주 랭킹: 순위·백분위·등급·근거', () => {
  const r = E.sajuRank(E.buildChart(A), TABLE);
  assert.ok(r.rank >= 1 && r.rank <= 518400);
  assert.equal(r.of, 518400);
  assert.ok(r.pct > 0 && r.pct <= 100);
  assert.ok(E.TIERS.some((t) => t[1] === r.tier.code));
  assert.ok(r.reasons.length >= 3);
  for (const x of r.reasons) assert.ok(x.text && !/undefined/.test(x.text));
  assert.equal(r.cats.length, 5);
  const noTime = E.sajuRank(E.buildChart({ ...A, time: null }), TABLE);
  assert.equal(noTime.of, 43200);
  assert.deepEqual(E.sajuRank(E.buildChart(A), TABLE), r);
});

test('사주로 본 내 인생: 세 시기 캐릭터와 곡선 유형', () => {
  const s = E.lifeStory(E.buildChart(A), TODAY);
  assert.equal(s.stages.length, 3);
  assert.ok(ARCS[s.arc.key]);
  for (const st of s.stages) {
    assert.ok(st.character.full.length > 4);
    assert.ok(st.skill.name && st.quest);
    for (const v of Object.values(st.stats)) assert.ok(v >= 0 && v <= 100);
    assert.ok(!/undefined/.test(st.story));
  }
  assert.equal(s.stages.filter((x) => x.now).length, 1);
  assert.equal(JSON.stringify(E.lifeStory(E.buildChart(A), TODAY)), JSON.stringify(s));
});

test('공유 카드: 허용된 값만 받고 생년월일은 받지 않는다', () => {
  const s = E.lifeStory(E.buildChart(A), TODAY);
  const q = new URLSearchParams({ k: 'story', n: '서윤', a: s.arc.key, c1: storyCode(s.stages[0].character.adj, s.stages[0].tg), c2: storyCode(s.stages[1].character.adj, s.stages[1].tg), c3: storyCode(s.stages[2].character.adj, s.stages[2].tg) });
  const card = parseShare(q);
  assert.equal(card.big, s.arc.name);
  assert.deepEqual(card.lines.map((l) => l[1]), s.stages.map((x) => x.character.full));
  const d = E.day(E.buildChart(A), TODAY);
  assert.ok(parseShare(new URLSearchParams({ k: 'today', n: '서윤', s: String(d.overall.score), h: d.overall.headline, d: '2026-10-14' })));
  assert.equal(parseShare(new URLSearchParams({ k: 'today', s: '50', h: '아무 말' })), null);
  assert.equal(parseShare(new URLSearchParams({ k: 'rank', s: '50', r: '999999', t: 'S' })), null);
  assert.equal(parseShare(new URLSearchParams({ k: 'evil' })), null);
  const named = parseShare(new URLSearchParams({ k: 'compat', n: '<script>홍길동', n2: 'http://x.y', s: '80', h: E.COMPAT_HEADLINES[1] }));
  assert.ok(!/[<>:/]/.test(named.kicker));
});

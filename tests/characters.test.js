import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import sharp from 'sharp';
import { ALL_JOBS, CHARACTER_JOBS, SETBACK_JOBS, JOB_BY_ID } from '../src/content/character-jobs.js';
import { ADJ, CLASSES } from '../src/content/story.js';
import { selectJob } from '../src/engine/story.js';
import { buildChart, lifeStory } from '../src/engine/index.js';
import { characterCode } from '../src/site/share-codec.js';
import { parseShare } from '../src/site/pages/share.js';

test('직업 도감: 50개 모험 직업과 10개 몰락형, 독립된 그림·스킬', async () => {
  assert.equal(CHARACTER_JOBS.length, 50);
  assert.equal(SETBACK_JOBS.length, 10);
  assert.equal(new Set(ALL_JOBS.map((j) => j.id)).size, ALL_JOBS.length);
  assert.equal(new Set(ALL_JOBS.map((j) => j.skill[0])).size, ALL_JOBS.length);
  for (const tg of Object.keys(CLASSES)) {
    assert.equal(CHARACTER_JOBS.filter((j) => j.tg === tg).length, 5);
    assert.equal(SETBACK_JOBS.filter((j) => j.tg === tg).length, 1);
  }
  const digests = new Set();
  for (const job of ALL_JOBS) {
    const data = fs.readFileSync(`public/characters/${job.id}.webp`);
    const meta = await sharp(data).metadata();
    assert.equal(meta.width, 640, job.id);
    assert.equal(meta.height, 640, job.id);
    assert.equal(meta.format, 'webp');
    digests.add(crypto.createHash('sha256').update(data).digest('hex'));
    // 카드·도감용 384px 썸네일(scripts/gen-thumbs.mjs)
    const thumb = await sharp(fs.readFileSync(new URL(`../public/characters/384/${job.id}.webp`, import.meta.url))).metadata();
    assert.equal(thumb.width, 384, `${job.id} 썸네일`);
    assert.ok(job.desc && job.quest && job.skill[1]);
  }
  assert.equal(digests.size, ALL_JOBS.length, '같은 그림을 다른 파일명으로 복제하면 안 된다');
});

test('직업 선택: 분야 특기·계열을 반영하고 같은 계열의 미등장 직업을 먼저 선택', () => {
  const raw = { drive: 90, wealth: 40, charm: 30, wisdom: 20, vital: 10 };
  assert.equal(selectJob('비견', 'good', raw).focus, 'drive');
  assert.equal(selectJob('비견', 'good', { ...raw, vital: 95 }).id, 'monk');
  for (const tg of Object.keys(CLASSES)) {
    const used = new Set();
    for (let i = 0; i < 5; i++) {
      const job = selectJob(tg, 'mid', raw, used, `chapter-${i}`);
      assert.equal(job.tg, tg);
      assert.ok(!used.has(job.id));
      used.add(job.id);
    }
    assert.equal(used.size, 5);
    assert.ok(used.has(selectJob(tg, 'mid', raw, used, 'next').id));
    const low = selectJob(tg, 'low', raw, used);
    assert.equal(low.tg, tg);
    assert.ok(low.setback);
  }
});

test('실제 사주 진입: 9개 챕터 직업·고유 스킬 구분 및 기존 흐름 점수 유지', () => {
  const input = { gender: 'F', calendar: 'solar', y: 1993, m: 1, d: 28, time: '03:40' };
  const now = { y: 2026, m: 10, d: 14 };
  const story = lifeStory(buildChart(input), now);
  assert.deepEqual(story.stages.map((s) => s.score), [59, 55, 55, 59, 65, 62, 69, 72, 67]);
  assert.equal(new Set(story.stages.map((s) => s.character.portrait)).size, 9);
  assert.equal(new Set(story.stages.map((s) => s.skill.name)).size, 9);
  for (const s of story.stages) {
    const job = JOB_BY_ID[s.character.portrait];
    assert.equal(s.skill.name, job.skill[0]);
    assert.ok(s.story.includes(job.desc));
    assert.equal(s.quest, job.quest);
  }
  assert.deepEqual(lifeStory(buildChart(input), now), story);
});

test('낮은 흐름에는 몰락 서사, 좋은 총점에도 낮은 분야의 난관을 숨기지 않는다', () => {
  const now = { y: 2026, m: 10, d: 14 };
  const low = lifeStory(buildChart({ gender: 'M', calendar: 'solar', y: 1980, m: 6, d: 1, timeBranch: '3' }), now).stages[4];
  assert.equal(low.score, 44);
  assert.ok(JOB_BY_ID[low.character.portrait].setback);
  assert.ok(low.cautions.length > 0);
  assert.ok(low.cautions.every((c) => c.score < 60 && c.text && c.title));
  assert.ok(!low.story.includes('걱정 없이'));
  const stages = lifeStory(buildChart({ gender: 'F', calendar: 'solar', y: 1993, m: 1, d: 28, time: '03:40' }), now).stages;
  assert.ok(stages.some((s) => s.score >= 60 && s.cautions.length > 0));
  for (const s of stages) assert.ok(s.cautions.every((c) => c.score < 60));
});

test('공유: 모든 직업 영구 ID 복원, 기존 3·9챕터 링크 유지, 잘못된 ID 거부', () => {
  for (const job of ALL_JOBS) {
    const adj = job.setback ? ADJ.low[0] : ADJ.good[0];
    const code = characterCode(adj, job.id);
    const card = parseShare(new URLSearchParams({ k: 'story', a: 'wave', c: Array(9).fill(code).join(',') }));
    assert.ok(card.lines.every(([, name]) => name === `${adj} ${job.name}`));
  }
  // 이전 3챕터 링크("형용사번호-십신번호")는 계속 읽고, 배포된 적 없는 "-b" 형식은 거부한다.
  assert.equal(parseShare(new URLSearchParams({ k: 'story', a: 'wave', c1: '7-4', c2: '0-1', c3: '3-9' })).lines.length, 3);
  assert.equal(parseShare(new URLSearchParams({ k: 'story', a: 'wave', c1: '7-4-b', c2: '0-1', c3: '3-9' })), null);
  const q = new URLSearchParams({ k: 'story', a: 'wave' });
  for (const bad of ['v2.8.shield', 'v2.1.missingjob', 'v2.1.__proto__', 'v2.1.constructor', 'v2.1.<script>']) {
    q.set('c', Array(9).fill(bad).join(','));
    assert.equal(parseShare(q), null, bad);
  }
});

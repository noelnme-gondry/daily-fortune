import test from 'node:test';
import assert from 'node:assert/strict';
import { withLanguage } from '../src/i18n/runtime.js';
import T from '../src/content/text.js';
import TT from '../src/content/tti.js';
import * as storyText from '../src/content/story.js';
import * as rankAdvice from '../src/content/rank-advice.js';
import { ALL_JOBS } from '../src/content/character-jobs.js';
import { buildChart } from '../src/engine/chart.js';
import { day, week, month, year, yearMonths } from '../src/engine/fortune.js';
import { lifetime, yearSignals } from '../src/engine/lifetime.js';
import { compat, compatReasons } from '../src/engine/compat.js';
import { lifeStory } from '../src/engine/story.js';
import { rankScore, rankReasons, RANK_CATS, PARTS, TIERS } from '../src/engine/rank.js';
import { rankGuidance } from '../src/engine/rank-guidance.js';
import { ttiYear, ttiDay, ttiMonths, ttiDayDetails, ttiCompat } from '../src/engine/tti.js';
import { birthTimeOptions, offsetNote } from '../src/domain/birth-time.js';
import { lifeEventDetails } from '../src/domain/life-event-detail.js';

const today = { y: 2026, m: 10, d: 16 };
const inputs = [
  { y: 1990, m: 5, d: 15, time: '14:30', gender: 'M' },
  { y: 1988, m: 7, d: 12, timeBranch: '0', gender: 'F' },
  { y: 1955, m: 8, d: 1, gender: 'M' },
];
const snapshot = (lang, fn) => withLanguage(lang, () => JSON.parse(JSON.stringify(fn())));
function numbers(value, path = '', result = {}) {
  if (typeof value === 'number') result[path] = value;
  else if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) numbers(child, `${path}/${key}`, result);
  }
  return result;
}
function assertEnglish(value, path = '') {
  if (typeof value === 'string') assert.doesNotMatch(value, /[가-힣]|\{[A-Za-z][^}]*\}/, path);
  else if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) assertEnglish(child, `${path}/${key}`);
  }
}
const displayStoryExports = ['CLASSES', 'ADJ', 'SKILL_BY_SS', 'STAGES', 'STAGE_BAND', 'ARCS', 'STAT_NAMES', 'CHAPTERS', 'CHAPTER_HAZARDS', 'CHAPTER_CAUTIONS'];

test('English content covers every Korean display leaf and keeps character identifiers stable', () => {
  const numericContent = () => ({ T, TT, story: storyText, rankAdvice, jobs: ALL_JOBS, RANK_CATS, PARTS, TIERS });
  assert.deepEqual(numbers(snapshot('en', numericContent)), numbers(snapshot('ko', numericContent)));
  const english = snapshot('en', () => ({ T, TT, story: Object.fromEntries(displayStoryExports.map((key) => [key, storyText[key]])), rankAdvice,
    jobs: ALL_JOBS.map(({ id, name, skill, desc, quest }) => ({ id, name, skill, desc, quest })) }));
  // Template variables are expected in content, but Korean fallback text is not.
  assert.doesNotMatch(JSON.stringify(english, (_key, value) => typeof value === 'string' ? value.replace(/\{[^}]+\}/g, '') : value).replace(/"[^"\n]+":/g, ''), /[가-힣]/);
  assert.equal(english.jobs.length, 60);
  assert.deepEqual(snapshot('en', () => ALL_JOBS.map(({ id, tg, focus, stats }) => ({ id, tg, focus, stats }))), snapshot('ko', () => ALL_JOBS.map(({ id, tg, focus, stats }) => ({ id, tg, focus, stats }))));
  assert.equal(snapshot('ko', () => T.dayMaster[0].title), '갑목(甲木)');
  assert.equal(english.T.dayMaster[0].title, 'Gap Wood (甲木)');
});

test('English reports preserve all calculated numbers and canonical chart keys', () => {
  for (const input of inputs) {
    const reports = () => {
      const chart = buildChart(input), partner = buildChart(inputs[1]);
      const life = lifetime(chart, today), rank = rankScore(chart);
      const average = Object.fromEntries(Object.keys(rank.parts).map((key) => [key, 5]));
      const reasons = rankReasons(rank, average);
      return { chart, day: day(chart, today), week: week(chart, today), month: month(chart, today.y, today.m), year: year(chart, today.y), months: yearMonths(chart, today.y), life,
        detail: lifeEventDetails(chart, life.events), compat: compat(chart, partner, today), story: lifeStory(chart, today), rank, reasons, guidance: rankGuidance(chart, { reasons }), signals: yearSignals(chart, today.y) };
    };
    const ko = snapshot('ko', reports), en = snapshot('en', reports);
    assert.deepEqual(numbers(en), numbers(ko));
    assert.equal(en.chart.key, ko.chart.key);
    assert.deepEqual(en.chart.tenGodCount, ko.chart.tenGodCount);
    assert.deepEqual(en.signals, ko.signals);
    assert.deepEqual(en.story.stages.map((s) => [s.tg, s.character.icon]), ko.story.stages.map((s) => [s.tg, s.character.icon]));
    for (const key of ['day', 'week', 'month', 'year']) {
      assertEnglish({ overall: en[key].overall, cats: en[key].cats, lucky: en[key].lucky });
    }
    assertEnglish({ persona: en.life.persona, career: en.life.career, wealth: en.life.wealth, love: en.life.love, health: en.life.health, events: en.life.events, strength: en.life.strength });
    assertEnglish(en.detail);
    assertEnglish(en.reasons);
    assertEnglish(en.guidance);
    assertEnglish(en.story.stages.map(({ story, character, skill, passive, quest, events, years, cautions }) => ({ story, character, skill, passive, quest, events, years, cautions })));
    assertEnglish({ lines: en.compat.lines, complement: en.compat.complement, cautions: en.compat.cautions, events: en.compat.events });
    assertEnglish(snapshot('en', () => compatReasons(buildChart(input), buildChart(inputs[1]))));
  }
});

test('All zodiac signs and birth-time variants produce English with unchanged scores', () => {
  for (let sign = 0; sign < 12; sign++) {
    const reports = () => ({ annual: ttiYear(sign, today.y), daily: ttiDay(sign, today), months: ttiMonths(sign, today.y), detail: ttiDayDetails(sign, today), compat: ttiCompat(sign, (sign + 3) % 12) });
    const ko = snapshot('ko', reports), en = snapshot('en', reports);
    assert.deepEqual(numbers(en), numbers(ko));
    assertEnglish({ summary: en.annual.summary, cats: en.annual.cats, headline: en.annual.headline, samjae: en.annual.samjae, cohorts: en.annual.cohorts.map(({ text }) => text), daily: en.daily.text, months: en.months.map(({ text }) => text), detail: en.detail, compat: en.compat.text });
  }
  for (const offset of [510, 540, 570, 600]) {
    assertEnglish(snapshot('en', () => ({ options: birthTimeOptions(offset), note: offsetNote(offset) })));
    assert.deepEqual(numbers(snapshot('en', () => birthTimeOptions(offset))), numbers(snapshot('ko', () => birthTimeOptions(offset))));
  }
});

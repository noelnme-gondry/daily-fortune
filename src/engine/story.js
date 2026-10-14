// 사주로 본 내 인생: 0~89세의 아홉 챕터를 각 시기의 기둥과 대운으로 캐릭터화한다.
import { ADJ, SKILL_BY_SS, STAGES, STAGE_BAND, ARCS, STAT_NAMES, CLASS_STATS, CHAPTERS, CHAPTER_HAZARDS, CHAPTER_CAUTIONS } from '../content/story.js';
import { CHARACTER_JOBS, SETBACK_JOBS } from '../content/character-jobs.js';
import T from '../content/text.js';
import { BR_MAIN, tenGod, pick, hash, pillarLabel } from './core.js';
import { CATS, evalPillar, combine, scoresOf, bandOf, year } from './fortune.js';
import { yearSignals } from './lifetime.js';

const RANGES = Array.from({ length: 9 }, (_, i) => [i * 10, i * 10 + 9]);
const NATAL = { early: ['year', 'month'], mid: ['day'], late: ['hour'] };
const SS_ORDER = ['천을귀인', '괴강살', '역마살', '도화살', '문창귀인', '화개살', '양인살', '백호살'];
const overlap = (a0, a1, b0, b1) => Math.max(0, Math.min(a1, b1) - Math.max(a0, b0) + 1);

// 주도 십신 → 직업 계열, 분야 점수 → 특기. 같은 모험에서는 새 직업을 우선한다.
// 동점만 결정론적 키로 푼다. 직업 선택 때문에 운세 점수를 바꾸지 않는다.
export function selectJob(tg, band, raw, used = new Set(), key = '') {
  if (band === 'low') return SETBACK_JOBS.find((job) => job.tg === tg);
  const family = CHARACTER_JOBS.filter((job) => job.tg === tg);
  const fresh = family.filter((job) => !used.has(job.id));
  return (fresh.length ? fresh : family).sort((a, b) => raw[b.focus] - raw[a.focus] || hash(`${key}|${a.id}`) - hash(`${key}|${b.id}`))[0];
}

// 나이 구간별 운 기둥: 대운 시작 전은 월주가 다스린다
function segments(c) {
  const segs = [];
  const first = c.daeun[0];
  if (first && first.age > 0) segs.push({ p: c.pillars.month, from: 0, to: first.age - 1, daeun: false });
  c.daeun.forEach((d, i) => segs.push({ p: d, from: d.age, to: (c.daeun[i + 1] ? c.daeun[i + 1].age : d.age + 10) - 1, daeun: true }));
  return segs;
}

export function lifeStory(c, today) {
  const segs = segments(c);
  const nowAge = today.y - c.birth.y - (today.m < c.birth.m || (today.m === c.birth.m && today.d < c.birth.d) ? 1 : 0);
  const key = c.key;
  const usedJobs = new Set();
  const stages = RANGES.map(([a0, a1], index) => {
    const sk = a0 < 30 ? 'early' : a0 < 60 ? 'mid' : 'late';
    const natalKeys = NATAL[sk].filter((k) => c.pillars[k]);
    if (!natalKeys.length) natalKeys.push('day');
    // 점수: 시기 대운(겹치는 햇수 비중) 70% + 그 시기의 원국 기둥 30%
    const parts = [];
    const tgW = {};
    const addTg = (t, w) => { if (t !== '일간') tgW[t] = (tgW[t] || 0) + w; };
    let tot = 0;
    for (const s of segs) {
      const w = overlap(a0, a1, s.from, s.to);
      if (!w) continue;
      parts.push([evalPillar(c, s.p), w]);
      tot += w;
      addTg(tenGod(c.dm, s.p.s), 0.8 * w / 10);
      addTg(tenGod(c.dm, BR_MAIN[s.p.b]), w / 10);
    }
    const natal = natalKeys.map((k) => c.pillars[k]);
    for (const k of natalKeys) {
      const p = c.pillars[k];
      if (k !== 'day') addTg(tenGod(c.dm, p.s), 1);
      addTg(tenGod(c.dm, BR_MAIN[p.b]), 1.2);
    }
    const luck = parts.length ? combine(parts.map(([e, w]) => [e, w / tot])) : null;
    const nat = combine(natal.map((p) => [evalPillar(c, p), 1 / natal.length]));
    const comb = luck ? combine([[luck, 0.7], [nat, 0.3]]) : nat;
    const sc = scoresOf(comb, 'daeun');
    const score = sc.overall;
    const band = bandOf(score);
    const tg = Object.entries(tgW).sort((x, y) => y[1] - x[1])[0][0];
    const adj = pick(ADJ[band], `${key}|${a0}|adj`);
    // 직업 고유 스킬과 신살의 보조 스킬을 별도로 보여 준다.
    const ss = c.natalSS.filter(([, pos]) => natalKeys.includes(pos)).map(([n]) => n).sort((x, y) => SS_ORDER.indexOf(x) - SS_ORDER.indexOf(y));
    const passive = ss.length && SKILL_BY_SS[ss[0]] ? { name: SKILL_BY_SS[ss[0]][0], desc: SKILL_BY_SS[ss[0]][1], from: ss[0] } : null;
    // 스탯 (0~100): 직장→추진력, 금전→재력, 연애·대인→매력, 학업→지혜, 건강→체력
    const cs = sc.cats;
    const rawStats = { drive: cs[0], wealth: cs[1], charm: Math.round((cs[2] + cs[5]) / 2), wisdom: cs[6], vital: cs[4] };
    const cautions = CATS.map((cat, i) => {
      const [title, text] = (cs[i] < 45 ? CHAPTER_HAZARDS : CHAPTER_CAUTIONS)[cat];
      return { key: cat, name: T.catName[cat], score: cs[i], title, text };
    })
      .filter((cat) => cat.score < 60).sort((a, b) => a.score - b.score).slice(0, 2);
    const job = selectJob(tg, band, rawStats, usedJobs, `${key}|${a0}`);
    usedJobs.add(job.id);
    const stats = gameStats(rawStats, tg, job.stats);
    const skill = { name: job.skill[0], desc: job.skill[1], from: job.name };
    const name = job.name;
    const years = Array.from({ length: 10 }, (_, i) => {
      const y = c.birth.y + a0 + i;
      const report = year(c, y);
      const sorted = report.cats.slice().sort((a, b) => b.score - a.score);
      return { y, age: a0 + i, score: report.overall.score, headline: report.overall.headline, strong: sorted[0].name, careful: sorted.at(-1).name };
    });
    // 그 시기의 주요 해 (과거는 "있었을", 미래는 "다가올")
    const ev = [];
    for (let age = a0; age <= a1; age++) {
      const y = c.birth.y + age;
      if (y < 1900 || y > 2100) continue;
      const s = yearSignals(c, y);
      if (s.marriage >= 4) ev.push({ y, age, kind: '결혼·인연', w: s.marriage });
      if (s.child >= 3.5) ev.push({ y, age, kind: '자녀', w: s.child });
      if (s.move >= 4.5) ev.push({ y, age, kind: '이동·변화', w: s.move });
    }
    const events = ['결혼·인연', '자녀', '이동·변화'].map((k) => ev.filter((e) => e.kind === k).sort((x, y) => y.w - x.w || x.y - y.y)[0]).filter(Boolean)
      .sort((x, y) => x.y - y.y).map((e) => ({ ...e, past: e.y < today.y }));
    const dSeg = segs.filter((s) => s.daeun && overlap(a0, a1, s.from, s.to) >= 5).map((s) => `${pillarLabel(s.p).slice(0, 2)} 대운(${s.from}세~)`);
    const meta = STAGES[sk];
    const story = [
      `${meta.root} ${STAGE_BAND[sk][band]}`,
      `제${index + 1}장, ${CHAPTERS[index]}. 이야기 속 당신은 "${adj} ${name}"입니다. ${job.desc}`,
      dSeg.length ? `이 시기를 지나는 대운은 ${dSeg.join(', ')}이며, 가장 강한 기운은 ${tg}(${T.tgKeyword[tg]})입니다.` : `가장 강한 기운은 ${tg}(${T.tgKeyword[tg]})입니다.`,
    ].join(' ');
    return {
      key: `decade-${a0}`, label: `${a0}대`, title: CHAPTERS[index], ages: `${a0}~${a1}세`, range: [a0, a1], now: nowAge >= a0 && nowAge <= a1,
      score, band, tg, character: { adj, name, full: `${adj} ${name}`, icon: job.id, portrait: job.id, focus: job.focus }, skill, passive, stats, rawStats, cautions, years, events, story, quest: job.quest,
    };
  });
  const [s1, s2, s3] = [0, 3, 6].map((i) => stages.slice(i, i + 3).reduce((n, s) => n + s.score, 0) / 3);
  const max = Math.max(s1, s2, s3), min = Math.min(s1, s2, s3);
  let arc;
  if (min >= 65) arc = 'triple';
  else if (max - min < 6) arc = 'steady';
  else if (s3 >= s2 && s2 >= s1 && s3 - s1 >= 8) arc = 'late';
  else if (s1 >= s2 && s2 >= s3 && s1 - s3 >= 8) arc = 'early';
  else if (s2 === max && s2 - Math.max(s1, s3) >= 4) arc = 'midpeak';
  else if (s2 === min && Math.min(s1, s3) - s2 >= 4) arc = 'comeback';
  else arc = 'wave';
  return { arc: { key: arc, ...ARCS[arc] }, stages, statNames: STAT_NAMES, nowAge };
}

export function gameStats(raw, tg, bonus = CLASS_STATS[tg]) {
  return Object.fromEntries(STAT_NAMES.map(([k], i) => [k, Math.max(1, Math.min(99, Math.round(50 + (raw[k] - 60) * 2.2 + bonus[i])))]));
}

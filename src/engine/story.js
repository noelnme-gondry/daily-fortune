// 사주로 본 내 인생: 초반(0~29세)·중반(30~59세)·후반(60세~)을 각 시기의 기둥과 대운으로 캐릭터화한다.
import { CLASSES, ADJ, SKILL_BY_SS, STAGES, STAGE_BAND, ARCS, STAT_NAMES } from '../content/story.js';
import T from '../content/text.js';
import { BR_MAIN, tenGod, pick, pillarLabel } from './core.js';
import { evalPillar, combine, scoresOf, bandOf } from './fortune.js';
import { yearSignals } from './lifetime.js';

const RANGES = { early: [0, 29], mid: [30, 59], late: [60, 89] };
const NATAL = { early: ['year', 'month'], mid: ['day'], late: ['hour'] };
const SS_ORDER = ['천을귀인', '괴강살', '역마살', '도화살', '문창귀인', '화개살', '양인살', '백호살'];
const overlap = (a0, a1, b0, b1) => Math.max(0, Math.min(a1, b1) - Math.max(a0, b0) + 1);

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
  const nowAge = today.y - c.birth.y;
  const key = c.key;
  const stages = Object.keys(RANGES).map((sk) => {
    const [a0, a1] = RANGES[sk];
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
    const cls = CLASSES[tg];
    const adj = pick(ADJ[band], `${key}|${sk}|adj`);
    // 스킬: 시기 원국 기둥에 붙은 신살 우선, 없으면 클래스 고유 스킬
    const ss = c.natalSS.filter(([, pos]) => natalKeys.includes(pos)).map(([n]) => n).sort((x, y) => SS_ORDER.indexOf(x) - SS_ORDER.indexOf(y));
    const skill = ss.length && SKILL_BY_SS[ss[0]] ? { name: SKILL_BY_SS[ss[0]][0], desc: SKILL_BY_SS[ss[0]][1], from: ss[0] } : { name: cls.skill[0], desc: `${cls.skill[1]}이 있습니다.`, from: tg };
    // 스탯 (0~100): 직장→추진력, 금전→재력, 연애·대인→매력, 학업→지혜, 건강→체력
    const cs = sc.cats;
    const stats = { drive: cs[0], wealth: cs[1], charm: Math.round((cs[2] + cs[5]) / 2), wisdom: cs[6], vital: cs[4] };
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
      `이 시기의 당신은 "${adj} ${cls.name}"입니다. ${cls.desc}`,
      dSeg.length ? `이 시기를 지나는 대운은 ${dSeg.join(', ')}이며, 가장 강한 기운은 ${tg}(${T.tgKeyword[tg]})입니다.` : `가장 강한 기운은 ${tg}(${T.tgKeyword[tg]})입니다.`,
    ].join(' ');
    return {
      key: sk, label: meta.label, title: meta.title, ages: meta.ages, range: [a0, a1], now: nowAge >= a0 && nowAge <= a1,
      score, band, tg, character: { adj, name: cls.name, full: `${adj} ${cls.name}`, icon: cls.icon }, skill, stats, events, story, quest: cls.quest,
    };
  });
  const [s1, s2, s3] = stages.map((s) => s.score);
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

// 기간 운세: 기간의 간지(일진·월운·세운·대운)가 원국과 맺는 관계를 7개 분야 점수와 해설로 바꾼다.
import T from '../content/text.js';
import {
  STEM_H, STEM_K, BR_H, BR_K, EL_K, EL_H, STEM_EL, BR_EL, BR_MAIN, STAGES, STAGE_W,
  pick, fill, josa, clamp, addDays, dow, daysIn, DOW_K, fmtDate, fmtShort,
  tenGod, stageOf, branchRels, stemHe, stemChung, pillarLabel, brHours,
} from './core.js';
import { dayPillar, monthPillar, yearPillar, yearPillarOfDate, lunarText } from './calendar.js';
import { daeunAt } from './chart.js';

export const CATS = ['career', 'money', 'love', 'move', 'health', 'social', 'study'];
const CAT_W = [1, 1, 1, 0.6, 0.9, 0.8, 0.6];
//            직장  금전  연애  이동  건강  대인  학업
const TG_EFF = {
  '비견': [0, -1, -0.5, 0, 1, 1.5, 0],
  '겁재': [-0.5, -2, -1, 0.5, 0.5, 0.5, 0],
  '식신': [1, 1.5, 1, 0, 1.5, 1, 0.5],
  '상관': [-1, 1, 1, 0.5, -0.5, -1, 0.5],
  '편재': [0.5, 2, 0.5, 1.5, 0, 1, -1],
  '정재': [0.5, 2, 0.5, -0.5, 0, 0.5, -0.5],
  '편관': [0.5, -0.5, -0.5, 0.5, -1.5, -0.5, 0],
  '정관': [2, 0.5, 0, -0.5, 0, 1, 0.5],
  '편인': [0, -1, -0.5, 1, 0, -0.5, 1.5],
  '정인': [1, 0, 0, -0.5, 1, 0.5, 2],
};
const LOVE_ADJ = {
  M: { '편재': 1, '정재': 1.2, '비견': -0.5, '겁재': -0.6 },
  F: { '편관': 2, '정관': 1.6, '상관': -1.2, '식신': -0.2 },
};
const POS_KO = { year: '년지', month: '월지', day: '일지', hour: '시지' };
const REL_EFF = {
  day: { '합': { love: 2, social: 1, health: 0.5 }, '삼합': { love: 1, social: 1 },
    '충': { love: -1.5, move: 2, health: -1.5, career: -0.5, money: -0.5 }, '형': { health: -1.5, social: -1, love: -1, study: -0.5 },
    '원진': { love: -1.5, social: -1 }, '해': { social: -0.5, love: -0.6 }, '파': { social: -0.5, money: -0.6 } },
  month: { '합': { career: 1.5, social: 0.5, money: 0.5 }, '삼합': { career: 0.8 }, '충': { career: -1, move: 1.5, social: -0.5 },
    '형': { career: -1, health: -0.5, study: -0.5 }, '원진': { career: -0.5, social: -0.5 }, '해': { career: -0.3 }, '파': { career: -0.5 } },
  year: { '합': { social: 0.6, money: 0.3 }, '삼합': { social: 0.3 }, '충': { move: 1.5, health: -0.5, social: -0.5, money: -0.4 },
    '형': { health: -0.5 }, '원진': { social: -0.3 } },
  hour: { '합': { social: 0.4, love: 0.3 }, '충': { move: 0.6, health: -0.4 }, '형': { health: -0.3 } },
};
// [평균, 폭] — 무작위 원국 300개 × 기간 표본의 원점수 분포로 맞춤 (평균 60점, 표준편차 약 13점)
const CAL = {
  day: { cat: [0.79, 4.5], all: [1.03, 4.4] }, week: { cat: [0.87, 2.4], all: [1.12, 2.2] },
  month: { cat: [0.89, 3.7], all: [1.16, 3.5] }, year: { cat: [1.0, 4.9], all: [1.28, 4.7] },
  ym: { cat: [0.89, 4.5], all: [1.18, 4.3] }, daeun: { cat: [0.98, 6.2], all: [1.26, 6.0] },
};

/* ── 기둥 평가 ───────────────────────────── */
export function evalPillar(c, p) {
  const acc = CATS.map(() => new Map());
  const add = (ci, key, v) => { if (!v || ci < 0) return; acc[ci].set(key, (acc[ci].get(key) || 0) + v); };
  const favS = c.fav[STEM_EL[p.s]], favB = c.fav[BR_EL[p.b]];
  const L = favS + 1.3 * favB;
  CATS.forEach((_, i) => add(i, '오행', 0.4 * L));
  const st = stageOf(c.dm, p.b);
  const stw = STAGE_W[STAGES.indexOf(st)];
  CATS.forEach((cat, i) => add(i, '운성', (cat === 'health' ? 0.55 : 0.2) * stw));
  const tgS = tenGod(c.dm, p.s), tgB = tenGod(c.dm, BR_MAIN[p.b]);
  [[tgS, 0.8, favS], [tgB, 1.0, favB]].forEach(([tg, w, f]) => {
    CATS.forEach((cat, i) => {
      let e = TG_EFF[tg][i];
      if (cat === 'love') e += LOVE_ADJ[c.gender][tg] || 0;
      if (e) add(i, tg, w * (e + 0.35 * f));
    });
  });
  for (const pos of c.positions) {
    for (const r of branchRels(p.b, c.pillars[pos].b)) {
      const eff = REL_EFF[pos][r];
      if (eff) for (const cat in eff) add(CATS.indexOf(cat), POS_KO[pos] + r, eff[cat]);
    }
  }
  if (stemHe(p.s, c.dm)) { add(2, '간합', 1.5); add(5, '간합', 1); add(0, '간합', 0.3); }
  if (stemChung(p.s, c.dm)) { add(4, '간충', -1); add(5, '간충', -1); add(0, '간충', -0.5); add(3, '간충', 0.5); }
  if (c.ss.dohwa.has(p.b)) { add(2, '도화', 2); add(5, '도화', 0.5); }
  if (c.ss.yeokma.has(p.b)) { add(3, '역마', 3); add(0, '역마', 0.5); add(1, '역마', 0.3); }
  if (c.ss.hwagae.has(p.b)) { add(6, '화개', 1); add(5, '화개', -0.5); }
  if (c.ss.gwiin.has(p.b)) { CATS.forEach((_, i) => add(i, '귀인', 0.5)); add(5, '귀인', 1); add(0, '귀인', 0.6); }
  if (c.ss.hongran.has(p.b)) add(2, '홍란', 1.5);
  if (c.ss.munchang === p.b) { add(6, '문창', 2); add(0, '문창', 0.4); }
  if (c.ss.yangin === p.b) { add(4, '양인', -1); add(1, '양인', -0.5); add(0, '양인', 0.4); }
  return { acc, L, stage: st, tgS, tgB, p };
}

export function combine(parts) {
  const acc = CATS.map(() => new Map());
  let L = 0;
  for (const [ev, w] of parts) {
    ev.acc.forEach((m, i) => m.forEach((v, k) => acc[i].set(k, (acc[i].get(k) || 0) + v * w)));
    L += ev.L * w;
  }
  return { acc, L };
}

const sumMap = (m) => { let s = 0; m.forEach((v) => { s += v; }); return s; };
const scoreOf = (raw, [mean, width]) => clamp(Math.round(60 + 40 * Math.tanh((raw - mean) / width)), 8, 99);
export function scoresOf(comb, kind) {
  const raws = comb.acc.map(sumMap);
  const cats = raws.map((r) => scoreOf(r, CAL[kind].cat));
  const wsum = CAT_W.reduce((a, b) => a + b, 0);
  const overallRaw = raws.reduce((s, r, i) => s + r * CAT_W[i], 0) / wsum * 1.35;
  return { raws, cats, overall: scoreOf(overallRaw, CAL[kind].all) };
}
export const bandOf = (s) => (s >= 75 ? 'high' : s >= 60 ? 'good' : s >= 45 ? 'mid' : 'low');

/* ── 문장 ───────────────────────────── */
function factorText(c, cat, k, sign) {
  const tbl = T.cat[cat].factor[k + c.gender] || T.cat[cat].factor[k] || T.generic[k];
  return tbl ? (tbl[sign > 0 ? 0 : 1] || '') : '';
}
const isGeneric = (c, cat, k) => !T.cat[cat].factor[k] && !T.cat[cat].factor[k + c.gender];
function topFactors(c, cat, m) {
  const list = [...m.entries()].sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
  const find = (sign, generic) => list.find(([k, v]) => v * sign > 0.25 && isGeneric(c, cat, k) === generic && factorText(c, cat, k, sign));
  const pos = find(1, false), neg = find(-1, false);
  return { pos, neg, posG: pos ? null : find(1, true), negG: neg ? null : find(-1, true) };
}
export function catText(c, cat, m, score, P, key, used) {
  const band = bandOf(score);
  const C = T.cat[cat];
  // 보조 문장(다만/그래도)은 같은 요인이 한 리포트 안에서 두 번까지만 나오게 한다
  const fresh = (f) => { if (!f || !used) return f; const n = used.get(f[0]) || 0; if (n >= 2) return null; used.set(f[0], n + 1); return f; };
  const { pos, neg, posG, negG } = topFactors(c, cat, m);
  const parts = [fill(pick(C.lead[band], key + cat + 'L'), { P })];
  if (band === 'high' || band === 'good') {
    const main = pos || posG;
    if (main) parts.push(factorText(c, cat, main[0], 1));
    if (neg && neg[1] < -0.6 && fresh(neg)) parts.push('다만 ' + factorText(c, cat, neg[0], -1));
  } else {
    const main = neg || negG;
    if (main) parts.push(factorText(c, cat, main[0], -1));
    if (pos && pos[1] > 0.6 && fresh(pos)) parts.push('그래도 ' + factorText(c, cat, pos[0], 1));
  }
  let adv = pick(C.advice[band], key + cat + 'A');
  if (cat === 'health' && (band === 'low' || band === 'mid')) adv += ` 특히 ${T.element[c.roles.gi].organ} 쪽을 살피세요.`;
  parts.push(adv);
  return parts.join(' ');
}
function favSentence(c, L) {
  const row = T.fav.find(([th]) => L >= th);
  return fill(row[1], { yong: `${EL_K[c.roles.yong]}(${EL_H[c.roles.yong]})`, gi: `${EL_K[c.roles.gi]}(${EL_H[c.roles.gi]})` });
}
function strongestSpecial(comb) {
  const tot = new Map();
  comb.acc.forEach((m) => m.forEach((v, k) => { if (T.relSummary[k]) tot.set(k, (tot.get(k) || 0) + Math.abs(v)); }));
  let best = null;
  tot.forEach((v, k) => { if (!best || v > best[1]) best = [k, v]; });
  return best && best[1] > 0.4 ? T.relSummary[best[0]] : '';
}
export function headline(sc, unit) {
  const idx = sc.cats.map((s, i) => [s, i]);
  if (sc.overall >= 58) {
    const top = idx.slice().sort((a, b) => b[0] - a[0])[0][1];
    return `${T.headTop[CATS[top]]} ${unit}`;
  }
  const low = idx.slice().sort((a, b) => a[0] - b[0])[0][1];
  return `${T.headLow[CATS[low]]} ${unit}`;
}
const LUCKY_BR = [[3], [5, 6], [4, 7, 10], [8, 9], [11]];
function lucky(c, key) {
  const el = pick([0, 0, 1], key + 'lucky') ? c.roles.hee : c.roles.yong;
  const E = T.element[el];
  const b = pick(LUCKY_BR[el], key + 'lt');
  return { el, color: pick(E.color, key + 'lc'), number: pick(E.number, key + 'ln'), dir: E.dir, time: `${BR_K[b]}시 ${brHours(b)}` };
}
function buildReport(c, comb, kind, ctx) {
  const sc = scoresOf(comb, kind);
  const key = c.key + '|' + ctx.key;
  const used = new Map();
  const cats = CATS.map((cat, i) => ({ key: cat, name: T.catName[cat], score: sc.cats[i], text: catText(c, cat, comb.acc[i], sc.cats[i], ctx.P, key, used) }));
  const ranked = cats.slice().sort((a, b) => b.score - a.score);
  const lines = [];
  if (ctx.intro) lines.push(ctx.intro);
  lines.push(favSentence(c, comb.L));
  const sp = strongestSpecial(comb);
  if (sp) lines.push(sp);
  const top = ranked[0], low = ranked[ranked.length - 1];
  lines.push(`${top.name}(${top.score}점)이 가장 돋보이고, ${josa(`${low.name}(${low.score}점)`, '은/는')} 한 번 더 살피는 편이 좋습니다.`);
  return {
    kind, key: ctx.key, label: ctx.label,
    overall: { score: sc.overall, headline: headline(sc, ctx.unit), text: lines.join(' ') },
    cats, lucky: lucky(c, key),
  };
}
function introFor(c, ev, first) {
  const dmName = `${STEM_K[c.dm]}${EL_K[STEM_EL[c.dm]]}`;
  const s = `${STEM_K[ev.p.s]}(${STEM_H[ev.p.s]})`, b = `${BR_K[ev.p.b]}(${BR_H[ev.p.b]})`;
  const tg = ev.tgS === ev.tgB
    ? `천간 ${josa(s, '과/와')} 지지 ${b} 모두 ${josa(ev.tgB, '이/가')} 됩니다.`
    : `천간 ${josa(s, '은/는')} ${ev.tgS}, 지지 ${josa(b, '은/는')} ${josa(ev.tgB, '이/가')} 됩니다.`;
  return `${first} ${dmName} 일간인 당신에게 ${tg} ${josa(ev.tgB, '은/는')} ${T.tgMeaning[ev.tgB]}입니다.`;
}

/* ── 기간별 운세 ───────────────────────────── */
function dayComb(c, o) {
  const dEv = evalPillar(c, dayPillar(o));
  return { dEv, comb: combine([[dEv, 0.7], [evalPillar(c, monthPillar(o)), 0.2], [evalPillar(c, yearPillarOfDate(o)), 0.1]]) };
}
export function day(c, o, which = 'today') {
  const { dEv, comb } = dayComb(c, o);
  const word = which === 'tomorrow' ? '내일' : '오늘';
  const r = buildReport(c, comb, 'day', {
    key: `d${o.y}-${o.m}-${o.d}`, P: `${word}은`, unit: '날', label: fmtDate(o),
    intro: introFor(c, dEv, `${word}은 ${pillarLabel(dEv.p)}일입니다.`),
  });
  r.date = o; r.pillar = dEv.p; r.pillarText = `${pillarLabel(dEv.p)}일`; r.lunar = lunarText(o);
  return r;
}
export function week(c, o) {
  const start = addDays(o, -((dow(o) + 6) % 7));
  const days = [];
  const parts = [];
  for (let i = 0; i < 7; i++) {
    const d = addDays(start, i);
    const { dEv, comb } = dayComb(c, d);
    const sc = scoresOf(comb, 'day');
    days.push({ date: d, label: DOW_K[dow(d)], short: fmtShort(d), pillar: dEv.p, pillarText: pillarLabel(dEv.p), score: sc.overall, cats: sc.cats });
    parts.push([comb, 1 / 7]);
  }
  const comb = combine(parts);
  const best = days.slice().sort((a, b) => b.score - a.score)[0];
  const worst = days.slice().sort((a, b) => a.score - b.score)[0];
  const end = addDays(start, 6);
  const r = buildReport(c, comb, 'week', {
    key: `w${start.y}-${start.m}-${start.d}`, P: '이번 주는', unit: '한 주', label: `${fmtShort(start)} ~ ${fmtShort(end)}`,
    intro: `이번 주 일곱 날 가운데 ${best.label}요일(${best.short}, ${best.pillarText}일)의 기운이 가장 좋고, ${worst.label}요일(${worst.short})은 한 템포 쉬어 가는 편이 좋습니다.`,
  });
  r.start = start; r.days = days;
  r.bestByCat = CATS.map((cat, i) => { const b = days.slice().sort((x, y) => y.cats[i] - x.cats[i])[0]; return { cat, name: T.catName[cat], day: b.label, short: b.short }; });
  return r;
}
export function month(c, y, m) {
  const mp = monthPillar({ y, m, d: 15 });
  const mEv = evalPillar(c, mp);
  const n = daysIn(y, m);
  const days = [];
  const dParts = [];
  for (let d = 1; d <= n; d++) {
    const o = { y, m, d };
    const { dEv, comb } = dayComb(c, o);
    days.push({ date: o, pillar: dEv.p, score: scoresOf(comb, 'day').overall, dow: dow(o) });
    dParts.push([dEv, 1 / n]);
  }
  const comb = combine([[mEv, 0.6], [combine(dParts), 0.25], [evalPillar(c, yearPillarOfDate({ y, m, d: 15 })), 0.15]]);
  const r = buildReport(c, comb, 'month', {
    key: `m${y}-${m}`, P: '이번 달은', unit: '한 달', label: `${y}년 ${m}월`,
    intro: introFor(c, mEv, `이번 달은 ${pillarLabel(mp)}월입니다.`),
  });
  r.pillar = mp; r.pillarText = `${pillarLabel(mp)}월`; r.days = days;
  const sorted = days.slice().sort((a, b) => b.score - a.score || a.date.d - b.date.d);
  r.goodDays = sorted.slice(0, 4).sort((a, b) => a.date.d - b.date.d);
  r.badDays = sorted.slice(-3).sort((a, b) => a.date.d - b.date.d);
  return r;
}
export function year(c, y, which = 'this') {
  const yp = yearPillar(y);
  const yEv = evalPillar(c, yp);
  const dy = daeunAt(c, y);
  const parts = [[yEv, dy ? 0.68 : 1]];
  if (dy) parts.push([evalPillar(c, dy), 0.32]);
  const comb = combine(parts);
  let intro = introFor(c, yEv, `${y}년은 ${pillarLabel(yp)}년입니다.`);
  if (dy) intro += ` 이 해는 ${dy.age}세부터 이어지는 ${pillarLabel(dy)} 대운(${tenGod(c.dm, dy.s)}·${tenGod(c.dm, BR_MAIN[dy.b])})의 영향 아래 있습니다.`;
  const r = buildReport(c, comb, 'year', { key: `y${y}`, P: which === 'next' ? '내년에는' : `${y}년에는`, unit: '한 해', label: `${y}년`, intro });
  r.year = y; r.pillar = yp; r.pillarText = `${pillarLabel(yp)}년`; r.daeun = dy;
  return r;
}
const firstTwo = (s) => s.split(/(?<=\.)\s+/).slice(0, 2).join(' ');
export function yearMonths(c, y) {
  const out = [];
  for (let m = 1; m <= 12; m++) {
    const mp = monthPillar({ y, m, d: 15 });
    const mEv = evalPillar(c, mp);
    const yEv = evalPillar(c, yearPillarOfDate({ y, m, d: 15 }));
    const comb = combine([[mEv, 0.65], [yEv, 0.35]]);
    const sc = scoresOf(comb, 'ym');
    const key = `${c.key}|ym${y}-${m}`;
    const ranked = CATS.map((cat, i) => [cat, sc.cats[i], i]).sort((a, b) => b[1] - a[1]);
    const top = ranked[0], low = ranked[ranked.length - 1];
    out.push({
      m, pillar: mp, pillarText: pillarLabel(mp), tgS: mEv.tgS, tgB: mEv.tgB, score: sc.overall,
      cats: CATS.map((cat, i) => ({ key: cat, name: T.catName[cat], score: sc.cats[i] })),
      headline: headline(sc, '달'),
      text: firstTwo(catText(c, top[0], comb.acc[top[2]], top[1], `${m}월은`, key)),
      best: { name: T.catName[top[0]], score: top[1] },
      worst: low[1] < 50 ? { name: T.catName[low[0]], score: low[1] } : null,
    });
  }
  return out;
}
export function daeunScores(c, d) {
  return scoresOf(combine([[evalPillar(c, d), 1]]), 'daeun');
}

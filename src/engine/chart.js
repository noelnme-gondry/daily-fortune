// 사주 원국 세우기: 년·월주는 절기 기준(UTC+8 라이브러리 시각으로 환산), 일·시주는 동경 127.5° 평균태양시 기준.
import {
  STEM_EL, BR_EL, BR_MAIN, HIDDEN, DOHWA, YEOKMA, HWAGAE, GWIIN, MUNCHANG, YANGIN, GWEGANG, BAEKHO,
  gz, pillarH, elRel, tenGod, stageOf, hongran, cheonhui,
} from './core.js';
import { Solar, lunarText, solarOfLunar, utcOffset } from './calendar.js';
import { birthTime } from '../domain/birth-time.js';

const PILLAR_KO = { year: '년주', month: '월주', day: '일주', hour: '시주' };

export class ChartInputError extends Error {}

export function buildChart(input) {
  let birth = { y: +input.y, m: +input.m, d: +input.d };
  if (input.calendar === 'lunar') {
    const s = solarOfLunar(birth.y, birth.m, birth.d, input.leap);
    if (!s) throw new ChartInputError('존재하지 않는 음력 날짜입니다.');
    birth = s;
  }
  if (!(birth.y >= 1900 && birth.y <= 2050)) throw new ChartInputError('1900~2050년 사이의 날짜만 계산할 수 있습니다.');
  const selected = input.timeBranch === undefined ? null : birthTime(input.timeBranch);
  if (input.timeBranch !== undefined && !selected) throw new ChartInputError('태어난 시진을 선택해 주세요.');
  const time = selected ? selected.time : input.time;
  const hasTime = typeof time === 'string' && /^\d{1,2}:\d{2}$/.test(time);
  const [hh, mi] = hasTime ? time.split(':').map(Number) : [12, 0];
  const { off, dst } = utcOffset(birth);
  const base = Date.UTC(birth.y, birth.m - 1, birth.d, hh, mi);
  const at = (shift) => {
    const t = new Date(base + shift * 60000);
    return Solar.fromYmdHms(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate(), t.getUTCHours(), t.getUTCMinutes(), 0);
  };
  const solA = selected ? at(-30) : hasTime ? at(480 - off) : at(0);
  const solB = selected ? at(0) : hasTime ? at(510 - off) : at(0);
  const ecA = solA.getLunar().getEightChar(); ecA.setSect(1);
  const ecB = solB.getLunar().getEightChar(); ecB.setSect(1);
  const pillars = { year: gz(ecA.getYear()), month: gz(ecA.getMonth()), day: gz(ecB.getDay()), hour: hasTime ? gz(ecB.getTime()) : null };
  const gender = input.gender === 'F' ? 'F' : 'M';
  const a = analyze(pillars, gender);
  // 대운 (표시 나이는 만 나이 기준)
  const yun = ecA.getYun(gender === 'M' ? 1 : 0);
  const daeun = yun.getDaYun().slice(1, 10).map((d) => ({ startYear: d.getStartYear(), age: d.getStartYear() - birth.y, ...gz(d.getGanZhi()) }));

  return {
    ...a, input, birth, hasTime, dst: !selected && dst, name: (input.name || '').trim(),
    lunarText: lunarText(birth, true), daeun,
  };
}

// 네 기둥(또는 세 기둥)만으로 하는 분석. 날짜 라이브러리를 쓰지 않아 전체 사주 집계(랭킹)에도 쓴다.
export function analyze(pillars, gender = 'M') {
  const positions = ['year', 'month', 'day', 'hour'].filter((p) => pillars[p]);
  const dm = pillars.day.s;

  // 오행 개수(겉글자)·가중치(지장간)·십신 그룹 가중치·일간을 돕는 힘
  const counts = [0, 0, 0, 0, 0];
  const weights = [0, 0, 0, 0, 0];
  const groupW = [0, 0, 0, 0, 0];
  let sup = 0, tot = 0;
  for (const pos of positions) {
    const p = pillars[pos];
    counts[STEM_EL[p.s]]++; counts[BR_EL[p.b]]++;
    weights[STEM_EL[p.s]] += 1;
    if (pos !== 'day') {
      const g = elRel(STEM_EL[dm], STEM_EL[p.s]);
      groupW[g] += 1;
      if (g === 0 || g === 4) sup += 1;
      tot += 1;
    }
    const bw = pos === 'month' ? 3 : pos === 'day' ? 1.5 : 1;
    for (const [hs, days] of HIDDEN[p.b]) {
      const w = bw * days / 30;
      weights[STEM_EL[hs]] += days / 30;
      const g = elRel(STEM_EL[dm], STEM_EL[hs]);
      groupW[g] += w;
      if (g === 0 || g === 4) sup += w;
      tot += w;
    }
  }
  const ratio = sup / tot;
  // 경계값은 무작위 원국 300개 분포의 10·35·65·90 백분위
  const strengthLabel = ratio >= 0.64 ? '극신강' : ratio >= 0.47 ? '신강' : ratio >= 0.35 ? '중화' : ratio >= 0.19 ? '신약' : '극신약';
  const strong = ratio >= 0.41;

  // 억부(강약 조절) + 조후(계절 온도)로 오행 선호도 산출
  let favG;
  if (strong) {
    favG = [-1.4, 1, 1.1, 1, -1.1];
    if (groupW[4] > groupW[0]) { favG[2] += 0.9; favG[4] -= 0.5; } else if (groupW[3] > 0.6) favG[3] += 0.9; else favG[1] += 0.9;
  } else {
    favG = [1.1, -1, -1.1, -1.1, 1.3];
    const drains = [1, 2, 3].sort((a, b) => groupW[b] - groupW[a]);
    if (drains[0] === 2) favG[0] += 0.9; else favG[4] += 0.7;
    favG[drains[0]] -= 0.5;
  }
  const tilt = Math.min(1, Math.abs(ratio - 0.41) / 0.15 + 0.35);
  favG = favG.map((v) => v * tilt);
  const fav = [0, 0, 0, 0, 0];
  favG.forEach((v, g) => { fav[(STEM_EL[dm] + g) % 5] = v; });
  const mb = pillars.month.b;
  if ([11, 0, 1].includes(mb) && counts[1] <= 1) fav[1] += 0.7;
  if ([5, 6, 7].includes(mb) && counts[4] <= 1) fav[4] += 0.7;
  const order = [0, 1, 2, 3, 4].sort((a, b) => fav[b] - fav[a]);
  const roles = { yong: order[0], hee: order[1], han: order[2], gu: order[3], gi: order[4] };

  // 신살
  const yb = pillars.year.b, db = pillars.day.b;
  const ss = {
    dohwa: new Set([DOHWA[yb % 4], DOHWA[db % 4]]),
    yeokma: new Set([YEOKMA[yb % 4], YEOKMA[db % 4]]),
    hwagae: new Set([HWAGAE[yb % 4], HWAGAE[db % 4]]),
    gwiin: new Set(GWIIN[dm]),
    hongran: new Set([hongran(yb), cheonhui(yb)]),
    munchang: MUNCHANG[dm],
    yangin: YANGIN[dm],
  };
  const natalSS = [];
  for (const pos of positions) {
    const b = pillars[pos].b;
    if (pos !== 'year' && ss.dohwa.has(b)) natalSS.push(['도화살', pos]);
    if (pos !== 'year' && ss.yeokma.has(b)) natalSS.push(['역마살', pos]);
    if (pos !== 'year' && ss.hwagae.has(b)) natalSS.push(['화개살', pos]);
    if (ss.gwiin.has(b)) natalSS.push(['천을귀인', pos]);
    if (ss.munchang === b) natalSS.push(['문창귀인', pos]);
    if (ss.yangin === b) natalSS.push(['양인살', pos]);
  }
  if (GWEGANG.includes(pillarH(pillars.day))) natalSS.push(['괴강살', 'day']);
  if (BAEKHO.includes(pillarH(pillars.day))) natalSS.push(['백호살', 'day']);

  const cols = positions.map((pos) => {
    const p = pillars[pos];
    return {
      pos, label: PILLAR_KO[pos], s: p.s, b: p.b,
      tgS: pos === 'day' ? '일간' : tenGod(dm, p.s),
      tgB: tenGod(dm, BR_MAIN[p.b]),
      hidden: HIDDEN[p.b].map(([h]) => h),
      stage: stageOf(dm, p.b),
    };
  });
  const tenGodCount = {};
  for (const c of cols) {
    if (c.pos !== 'day') tenGodCount[c.tgS] = (tenGodCount[c.tgS] || 0) + 1;
    tenGodCount[c.tgB] = (tenGodCount[c.tgB] || 0) + 1;
  }
  const key = `${positions.map((p) => pillarH(pillars[p])).join('')}|${gender}`;
  return {
    key, gender, pillars, positions, dm, cols, counts, weights, groupW, ratio, strengthLabel, strong,
    fav, roles, ss, natalSS, tenGodCount,
  };
}

export function daeunAt(c, y) {
  let cur = null;
  for (const d of c.daeun) if (d.startYear <= y) cur = d;
  return cur;
}

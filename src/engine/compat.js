// 궁합: 일간·일지·띠·월지 관계, 오행 보완, 강약 균형으로 평생 궁합을 매기고 결혼·자녀 시기와 길일을 고른다.
import T from '../content/text.js';
import {
  ANIMAL, EL_K, EL_H, STEM_EL, BR_EL, fill, josa, clamp, toUTC, fromUTC, dow, DAY_MS, fmtDate,
  elRel, stemHe, branchRels, relKey, pillarLabel,
} from './core.js';
import { dayPillar, lunarText } from './calendar.js';
import { year } from './fortune.js';
import { yearSignals } from './lifetime.js';

const DAY_REL_W = { '합': 3, '삼합': 2, '같음': 0.5, '없음': 0, '충': -3, '원진': -2.5, '형': -2, '해': -1.2, '파': -1 };
const YEAR_REL_W = { '합': 1.5, '삼합': 1.2, '같음': 0.3, '없음': 0, '충': -1.5, '원진': -1.2, '형': -1, '해': -0.6, '파': -0.5 };
const MONTH_REL_W = { '합': 1, '삼합': 0.8, '같음': 0.3, '없음': 0, '충': -1, '원진': -0.6, '형': -0.6, '해': -0.3, '파': -0.3 };
// [평균, 표준편차] — 무작위 원국 200쌍에서 측정
const COMP_CAL = { personality: [1.45, 1.59], love: [0.81, 1.85], talk: [0.68, 1.1], money: [0.21, 0.98], family: [0.06, 1.46], total: [1.46, 1.78] };
const compScore = (raw, k) => { const [m, sd] = COMP_CAL[k]; return clamp(Math.round(64 + 34 * Math.tanh((raw - m) / (2.6 * sd))), 20, 99); };
const CAT_NAMES = { personality: '성격', love: '애정', talk: '소통', money: '경제', family: '가정·자녀' };
export const COMPAT_CATEGORIES = [['total', '종합'], ...Object.entries(CAT_NAMES)];
export const COMPAT_HEADLINES = ['천생연분에 가까운 인연', '서로를 키워 주는 좋은 인연', '노력할수록 깊어지는 인연', '차이를 이해해야 하는 인연', '서로를 배워 가야 하는 인연'];

function compatBasis(a, b) {
  const eA = STEM_EL[a.dm], eB = STEM_EL[b.dm];
  let dmKey, dmW;
  if (stemHe(a.dm, b.dm)) { dmKey = '간합'; dmW = 3; } else {
    const r = elRel(eA, eB);
    dmKey = ['비화', '생AB', '극AB', '극BA', '생BA'][r];
    dmW = [0.5, 1.5, -1, -1, 1.5][r];
  }
  const male = a.gender === 'M' && b.gender === 'F' ? a : b.gender === 'M' && a.gender === 'F' ? b : null;
  const female = male === a ? b : male === b ? a : null;
  let jeongbae = false;
  if (male && female && elRel(STEM_EL[male.dm], STEM_EL[female.dm]) === 2) { jeongbae = true; dmW += 2; }
  const dayKey = relKey(a.pillars.day.b, b.pillars.day.b);
  const yearKey = relKey(a.pillars.year.b, b.pillars.year.b);
  const monthKey = relKey(a.pillars.month.b, b.pillars.month.b);
  const share = (c) => { const t = c.weights.reduce((x, y) => x + y, 0); return c.weights.map((w) => w / t); };
  const sA = share(a), sB = share(b);
  const compA = a.fav.reduce((s, f, e) => s + f * sB[e], 0);
  const compB = b.fav.reduce((s, f, e) => s + f * sA[e], 0);
  const balance = a.strong !== b.strong ? 1 : a.strong ? -0.8 : -0.3;
  const attract = (a.ss.dohwa.has(b.pillars.day.b) ? 0.8 : 0) + (b.ss.dohwa.has(a.pillars.day.b) ? 0.8 : 0);
  const helper = (a.ss.gwiin.has(b.pillars.day.b) ? 0.8 : 0) + (b.ss.gwiin.has(a.pillars.day.b) ? 0.8 : 0);
  const hourKey = a.pillars.hour && b.pillars.hour ? relKey(a.pillars.hour.b, b.pillars.hour.b) : null;
  const sangA = (a.tenGodCount['상관'] || 0) >= 2, sangB = (b.tenGodCount['상관'] || 0) >= 2;
  const geopA = (a.tenGodCount['겁재'] || 0) >= 2, geopB = (b.tenGodCount['겁재'] || 0) >= 2;

  const raw = {
    personality: dmW * 1.1 + balance + MONTH_REL_W[monthKey] * 0.5,
    love: DAY_REL_W[dayKey] + (dmKey === '간합' ? 1.5 : 0) + attract + dmW * 0.3,
    talk: MONTH_REL_W[monthKey] * 1.5 + (dmKey.startsWith('생') ? 1.2 : 0) + (dmKey === '간합' ? 1 : 0) - (sangA && sangB ? 1.2 : 0) + helper * 0.5,
    money: (compA + compB) * 1.4 - (geopA || geopB ? 0.8 : 0) + helper * 0.5,
    family: YEAR_REL_W[yearKey] * 1.4 + (hourKey ? MONTH_REL_W[hourKey] : 0) + DAY_REL_W[dayKey] * 0.3,
  };
  const cats = Object.keys(raw).map((k) => ({ key: k, name: CAT_NAMES[k], score: compScore(raw[k], k) }));
  const totalRaw = raw.personality + raw.love * 1.2 + raw.talk * 0.8 + raw.money * 0.9 + raw.family * 0.8;
  const total = compScore(totalRaw / 2.2, 'total');

  return { total, cats, eA, eB, dmKey, jeongbae, dayKey, yearKey, monthKey, sA, sB, geopA, geopB, sangA, sangB };
}

// 추천 검색에서도 기존 두 사람 궁합과 정확히 같은 산식을 사용한다.
export function compatScores(a, b) {
  const { total, cats } = compatBasis(a, b);
  return { total, cats };
}

// 추천 카드용 근거: 실제 두 원국의 관계와 오행 비중만 설명한다.
export function compatReasons(a, b) {
  const s = compatBasis(a, b);
  const relation = (label, key) => `${label} ${key === '없음' ? '주요 합·충 관계 없음' : key === '같음' ? '같은 지지' : key}`;
  const dm = { 간합: '두 일간이 천간합을 이룹니다.', 비화: '두 일간의 오행이 같습니다.', 생AB: '기준 인물의 일간이 추천 사주의 일간을 생합니다.', 생BA: '추천 사주의 일간이 기준 인물의 일간을 생합니다.', 극AB: '기준 인물의 일간이 추천 사주의 일간을 극합니다.', 극BA: '추천 사주의 일간이 기준 인물의 일간을 극합니다.' };
  const reasons = {
    personality: [dm[s.dmKey], `일간 강약: 기준 ${a.strengthLabel} · 추천 ${b.strengthLabel}`],
    love: [relation('두 일지:', s.dayKey), s.dmKey === '간합' ? '일간의 천간합이 애정 점수에 가산됩니다.' : dm[s.dmKey]],
    talk: [relation('두 월지:', s.monthKey), s.sangA && s.sangB ? '두 사주 모두 상관이 많아 소통 점수에 감점이 있습니다.' : dm[s.dmKey]],
    money: [`기준 인물의 용신 ${EL_K[a.roles.yong]} 기운이 추천 사주에서 ${Math.round(s.sB[a.roles.yong] * 100)}%를 차지합니다.`, `추천 사주의 용신 ${EL_K[b.roles.yong]} 기운이 기준 인물에서 ${Math.round(s.sA[b.roles.yong] * 100)}%를 차지합니다.`],
    family: [relation('두 년지:', s.yearKey), a.pillars.hour && b.pillars.hour ? relation('두 시지:', relKey(a.pillars.hour.b, b.pillars.hour.b)) : '출생 시간을 모르는 쪽은 시지 관계를 제외합니다.'],
  };
  reasons.total = s.cats.slice().sort((x, y) => y.score - x.score).slice(0, 2).map((c) => `${c.name} ${c.score}점 · ${reasons[c.key][0]}`);
  return reasons;
}

export function compat(a, b, today) {
  const nameA = a.name || '나', nameB = b.name || '상대';
  const { total, cats, eA, eB, dmKey, jeongbae, dayKey, yearKey, monthKey, sA, sB, geopA, geopB, sangA, sangB } = compatBasis(a, b);

  const lines = [
    fill(T.compat.dm[dmKey], { A: nameA, B: nameB }) + (jeongbae ? T.compat.dm['정배'] : ''),
    T.compat.dayBranch[dayKey],
    fill(T.compat.yearBranch[yearKey], { a: ANIMAL[a.pillars.year.b], b: ANIMAL[b.pillars.year.b] }),
  ];
  const elName = (e) => `${EL_K[e]}(${EL_H[e]})`;
  const compLine = (X, Y, cX, sY) => {
    const need = cX.roles.yong;
    if (sY[need] >= 0.24) return `${Y}의 사주에는 ${X}에게 필요한 ${elName(need)} 기운이 넉넉해, 함께 있으면 ${X}의 마음과 운이 안정됩니다.`;
    if (sY[need] <= 0.08) return `${Y}의 사주에는 ${X}의 용신인 ${elName(need)} 기운이 적어, 기대기보다 각자의 영역을 지켜 주는 관계가 잘 맞습니다.`;
    return `${josa(Y, '은/는')} ${X}에게 필요한 ${elName(need)} 기운을 적당히 갖고 있어 무리 없이 보완이 됩니다.`;
  };
  const complement = [compLine(nameA, nameB, a, sB), compLine(nameB, nameA, b, sA)];

  const cautions = [];
  const C = T.compat.cautions;
  const pushC = (k, o = {}) => { const [t, d] = C[k]; cautions.push({ title: fill(t, o), text: fill(d, o) }); };
  if (dayKey === '충') pushC('일지충');
  if (dayKey === '원진') pushC('일지원진');
  if (dayKey === '형') pushC('일지형');
  if (dayKey === '해') pushC('일지해');
  if (yearKey === '충') pushC('년지충');
  if (yearKey === '원진') pushC('년지원진');
  if (monthKey === '충') pushC('월지충');
  if (a.strong && b.strong) pushC('둘다신강');
  if (!a.strong && !b.strong) pushC('둘다신약');
  if (dmKey === '극AB') pushC('극', { X: nameA, Y: nameB });
  if (dmKey === '극BA') pushC('극', { X: nameB, Y: nameA });
  if ((eA === 1 && eB === 4) || (eA === 4 && eB === 1)) pushC('수화');
  if (geopA || geopB) pushC('겁재');
  if (sangA && sangB) pushC('상관');
  for (let e = 0; e < 5; e++) {
    if (sA[e] < 0.07 && sB[e] < 0.07) { const E = T.element[e]; pushC('부족', { el: E.name, elh: E.hanja, nature: E.nature, color: E.color[0], season: E.season }); break; }
  }
  if (cautions.length < 3 && eA !== eB) pushC('기본', { X: nameA, Y: nameB, xe: elName(eA), ye: elName(eB) });
  if (cautions.length < 3) cautions.push({ title: '익숙함 속의 소홀함', text: '관계가 편안해질수록 감사와 칭찬을 말로 표현하는 습관이 궁합을 지켜 줍니다.' });

  // 결혼·자녀·재물 시기
  const years = [];
  for (let y = today.y; y < today.y + 10; y++) {
    const sa = yearSignals(a, y), sb = yearSignals(b, y);
    let pen = 0;
    if (branchRels(sa.yp.b, a.pillars.day.b).includes('충')) pen -= 1;
    if (branchRels(sa.yp.b, b.pillars.day.b).includes('충')) pen -= 1;
    years.push({ y, yp: sa.yp, sa, sb, marriage: sa.marriage + sb.marriage + pen, money: year(a, y, 'next').cats[1].score + year(b, y, 'next').cats[1].score });
  }
  const why = (s, n) => (s.length ? `${n}: ${s.join('·')}` : '');
  const mYears = years.slice().sort((x, y) => y.marriage - x.marriage || x.y - y.y).slice(0, 3).sort((x, y) => x.y - y.y);
  const bestY = mYears[0]; // 결혼운 상위 3개 해 중 가장 가까운 해
  const marriageYears = mYears.map((r) => ({ y: r.y, pillar: r.yp, why: [why(r.sa.reasons.marriage, nameA), why(r.sb.reasons.marriage, nameB)].filter(Boolean).join(' / ') || '두 사람의 운이 고르게 받쳐 주는 해' }));
  const cand = [];
  for (let y = bestY.y; y <= bestY.y + 10; y++) { const sa = yearSignals(a, y), sb = yearSignals(b, y); cand.push({ y, yp: sa.yp, sa, sb, child: sa.child + sb.child }); }
  const childYears = cand.sort((x, y) => y.child - x.child || x.y - y.y).slice(0, 3).sort((x, y) => x.y - y.y)
    .map((r) => ({ y: r.y, pillar: r.yp, why: [why(r.sa.reasons.child, nameA), why(r.sb.reasons.child, nameB)].filter(Boolean).join(' / ') || '가정운이 안정되는 해' }));
  const moneyYears = years.slice().sort((x, y) => y.money - x.money || x.y - y.y).slice(0, 2).sort((x, y) => x.y - y.y)
    .map((r) => ({ y: r.y, pillar: r.yp, why: `두 사람 금전운 평균 ${Math.round(r.money / 2)}점` }));

  // 결혼 길일: 결혼운이 강한 가장 가까운 해의 주말 중 두 사람 일지·띠와 충돌이 없는 날
  const dScore = (c, p) => {
    let s = 0;
    const rd = branchRels(p.b, c.pillars.day.b), ry = branchRels(p.b, c.pillars.year.b);
    if (rd.includes('합')) s += 3; else if (rd.includes('삼합')) s += 2;
    if (rd.includes('충')) s -= 6;
    if (rd.includes('형')) s -= 3;
    if (rd.includes('원진')) s -= 3;
    if (rd.includes('해')) s -= 1.5;
    if (rd.includes('파')) s -= 1;
    if (ry.includes('충')) s -= 3;
    if (ry.includes('합')) s += 1;
    if (c.ss.gwiin.has(p.b)) s += 2;
    return s + 0.5 * (c.fav[STEM_EL[p.s]] + c.fav[BR_EL[p.b]]);
  };
  const dates = [];
  for (let t = toUTC({ y: bestY.y, m: 1, d: 1 }); t <= toUTC({ y: bestY.y, m: 12, d: 31 }); t += DAY_MS) {
    const o = fromUTC(t);
    if (toUTC(o) <= toUTC(today)) continue;
    const w = dow(o);
    if (w !== 0 && w !== 6) continue;
    const p = dayPillar(o);
    dates.push({ date: o, p, s: dScore(a, p) + dScore(b, p) });
  }
  const weddingDates = dates.sort((x, y) => y.s - x.s || toUTC(x.date) - toUTC(y.date)).slice(0, 6)
    .sort((x, y) => toUTC(x.date) - toUTC(y.date))
    .map((d) => ({ date: d.date, label: fmtDate(d.date), pillar: d.p, pillarText: pillarLabel(d.p), lunar: lunarText(d.date) }));

  const headline = COMPAT_HEADLINES[total >= 85 ? 0 : total >= 75 ? 1 : total >= 62 ? 2 : total >= 50 ? 3 : 4];
  return {
    nameA, nameB, total, headline, cats, lines, complement, cautions,
    keys: { dm: dmKey, day: dayKey, year: yearKey, month: monthKey },
    events: { marriageYears, bestYear: bestY.y, weddingDates, childYears, moneyYears },
  };
}

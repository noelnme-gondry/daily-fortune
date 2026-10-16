import { bilingual, isEnglish } from '../i18n/runtime.js';
import { term, elementName } from '../i18n/terms.js';
// 사주 랭킹: 원국 자체의 "균형·조화·길신"을 점수로 매기고, 가능한 모든 사주(4기둥 518,400가지, 시간 모름 3기둥 43,200가지)
// 분포표에서 순위를 찾는다. 대운·성별과 무관하게 여덟 글자만으로 계산한다.
import {
  EL_H, GWIIN, LIUHE, branchRels, stemHe, stemChung, josa, hongran, cheonhui,
} from './core.js';

const POS_KO = { year: '년지', month: '월지', day: '일지', hour: '시지' };
const STEM_POS_KO = { year: '년간', month: '월간', day: '일간', hour: '시간' };
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const peak = (x, c, w) => Math.max(0, 1 - Math.abs(x - c) / w);
const r1 = (x) => Math.round(x * 10) / 10;

const RANK_CATS_KO = [
  ['wealth', '재물'], ['honor', '명예·직장'], ['charm', '인기·매력'], ['health', '건강·균형'], ['wisdom', '지혜·학업'],
];
const TIERS_KO = [
  [1, 'S+', '천하제일 사주', '만 명 중 백 명 안에 드는 드문 균형과 길신을 갖췄습니다.'],
  [5, 'S', '왕후장상 사주', '조화와 길신이 뛰어나 타고난 그릇이 큰 사주입니다.'],
  [15, 'A', '귀인 사주', '도와주는 기운이 많아 사람과 운의 덕을 보는 사주입니다.'],
  [35, 'B', '복덕 사주', '장점이 뚜렷하고 큰 흠이 적은 안정적인 사주입니다.'],
  [65, 'C', '평온 사주', '좋고 나쁨이 고르게 섞인, 노력만큼 거두는 사주입니다.'],
  [85, 'D', '수련 사주', '한쪽으로 치우친 기운을 다듬을수록 크게 성장하는 사주입니다.'],
  [100, 'E', '역전 드라마 사주', '굴곡이 큰 만큼 운이 맞물리는 시기에 극적으로 도약하는 사주입니다.'],
];

// 원국 점수. parts는 항목별 점수, notes는 근거 문장 재료
const PARTS_KO = [
  ['balance', '오행 균형', 25], ['center', '일간 강약', 20], ['yong', '용신의 힘', 15], ['gil', '길신', 15],
  ['harmony', '조화(합)', 15], ['clash', '충돌(충·형)', 0], ['special', '특수 신살', 3],
];
export const RANK_CATS = bilingual(RANK_CATS_KO, [
  'Wealth', 'Recognition & career', 'Popularity & charm', 'Wellbeing & balance', 'Wisdom & study',
].map((name, i) => [RANK_CATS_KO[i][0], name]));
export const TIERS = bilingual(TIERS_KO, [
  ['Exceptional Balance', 'A rare combination of balance and helpful stars, within the top 100 of 10,000 charts in this model.'],
  ['Distinguished Chart', 'Strong harmony and helpful stars give this chart a favorable structure in the model.'],
  ['Supported Chart', 'Several supportive themes emphasize help through people and circumstances.'],
  ['Fortunate Chart', 'Clear strengths and relatively few major imbalances give this chart a steady structure.'],
  ['Even-Tempered Chart', 'Favorable and challenging features are fairly mixed, with steady effort emphasized.'],
  ['Growth through Practice', 'Working with the chart’s more uneven elements is a central theme.'],
  ['The Comeback Story', 'A more uneven structure highlights the possibility of pronounced shifts when supportive cycles arrive.'],
].map((text, i) => [...TIERS_KO[i].slice(0, 2), ...text]));
export const PARTS = bilingual(PARTS_KO, [
  'Element balance', 'Day Master strength', 'Useful element support', 'Helpful stars',
  'Harmony (combinations)', 'Friction (clashes & penalties)', 'Special stars',
].map((name, i) => [PARTS_KO[i][0], name, PARTS_KO[i][2]]));

export function rankScore(a) {
  const pos = a.positions;
  const P = pos.map((k) => ({ k, ...a.pillars[k] }));
  const wsum = a.weights.reduce((x, y) => x + y, 0);
  const share = a.weights.map((w) => w / wsum);
  const H = -share.reduce((s, p) => s + (p > 0 ? p * Math.log(p) : 0), 0) / Math.log(5);
  const gsum = a.groupW.reduce((x, y) => x + y, 0);
  const g = a.groupW.map((w) => w / gsum); // 비겁·식상·재성·관성·인성 비율
  const notes = { gil: [], harmony: [], clash: [], special: [] };

  const balance = 25 * clamp01((H - 0.6) / 0.36);
  const center = 20 * (1 - Math.min(1, Math.abs(a.ratio - 0.42) / 0.32));
  const ys = share[a.roles.yong] + share[a.roles.hee];
  const yong = 15 * clamp01((ys - 0.08) / 0.4);
  let gil = 0;
  const gwiin = P.filter((p) => GWIIN[a.dm].includes(p.b)).length;
  if (gwiin) { gil += Math.min(8, gwiin * 4); notes.gil.push(`천을귀인 ${gwiin}개`); }
  const munchang = P.some((p) => p.b === a.ss.munchang);
  if (munchang) { gil += 3; notes.gil.push('문창귀인'); }
  const tgc = a.tenGodCount;
  if (tgc['식신']) { gil += 2; notes.gil.push('식신'); }
  for (const t of ['정관', '정재', '정인']) if (tgc[t]) { gil += 1.5; notes.gil.push(t); }
  gil = Math.min(15, gil);
  let harmony = 0;
  const pairs = [];
  for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) pairs.push([P[i], P[j]]);
  const groupCount = [0, 0, 0, 0];
  new Set(P.map((p) => p.b)).forEach((b) => { groupCount[b % 4]++; });
  for (const [x, y] of pairs) {
    if (LIUHE[x.b] === y.b) { harmony += 4; notes.harmony.push(`${POS_KO[x.k]}·${POS_KO[y.k]} 육합`); }
    if (stemHe(x.s, y.s)) { harmony += x.k === 'day' || y.k === 'day' ? 2.5 : 2; notes.harmony.push(`${STEM_POS_KO[x.k]}·${STEM_POS_KO[y.k]} 천간합`); }
  }
  groupCount.forEach((n) => { if (n === 3) { harmony += 5; notes.harmony.push('지지 삼합 완성'); } else if (n === 2) harmony += 1.5; });
  harmony = Math.min(15, harmony);
  let clash = 0;
  for (const [x, y] of pairs) {
    const r = branchRels(x.b, y.b);
    const day = x.k === 'day' || y.k === 'day';
    if (r.includes('충')) { clash -= day ? 6.5 : 5; notes.clash.push(`${POS_KO[x.k]}·${POS_KO[y.k]} 충`); }
    if (r.includes('형')) { clash -= 3; notes.clash.push(`${POS_KO[x.k]}·${POS_KO[y.k]} 형`); }
    if (r.includes('원진')) { clash -= 2.5; notes.clash.push(`${POS_KO[x.k]}·${POS_KO[y.k]} 원진`); }
    if (r.includes('해') || r.includes('파')) clash -= 1;
    if (stemChung(x.s, y.s)) { clash -= 2; notes.clash.push(`${STEM_POS_KO[x.k]}·${STEM_POS_KO[y.k]} 천간충`); }
  }
  clash = Math.max(-18, clash);
  let special = 0;
  const names = a.natalSS.map(([n]) => n);
  if (names.includes('괴강살')) { special += 3; notes.special.push('괴강살(+)'); }
  if (names.includes('양인살')) { special -= 1; notes.special.push('양인살(−)'); }
  if (names.includes('백호살')) { special -= 1; notes.special.push('백호살(−)'); }

  const raw = 12 + balance + center + yong + gil + harmony + clash + special;
  const total = Math.max(0, Math.min(100, r1(raw)));

  // 분야별 (0~100)
  const hold = 1 - Math.min(1, Math.max(0, 0.45 - a.ratio) / 0.3);
  const doh = P.filter((p) => p.k !== 'year' && a.ss.dohwa.has(p.b)).length;
  const hong = P.some((p) => p.k !== 'year' && (p.b === hongran(a.pillars.year.b) || p.b === cheonhui(a.pillars.year.b)));
  const harmonyN = pairs.filter(([x, y]) => LIUHE[x.b] === y.b).length;
  const dayClash = pairs.some(([x, y]) => (x.k === 'day' || y.k === 'day') && branchRels(x.b, y.b).includes('충'));
  const cats = {
    wealth: 100 * (0.45 * peak(g[2], 0.3, 0.24) + 0.2 * clamp01(g[1] / 0.15) * (g[2] > 0.05 ? 1 : 0) + 0.25 * hold + 0.1 * (gwiin ? 1 : 0)) - (g[0] > 0.35 && g[2] < 0.12 ? 15 : 0),
    honor: 100 * (0.45 * peak(g[3], 0.25, 0.22) + 0.2 * peak(g[4], 0.22, 0.22) + 0.2 * (center / 20) + 0.15 * (tgc['정관'] ? 1 : 0)) - (tgc['상관'] && tgc['정관'] ? 12 : 0),
    charm: 100 * (0.4 * clamp01(doh / 2) + 0.25 * peak(g[1], 0.25, 0.22) + 0.2 * clamp01(harmonyN / 2) + 0.15 * (hong ? 1 : 0)),
    health: 100 * (0.5 * (balance / 25) + 0.3 * (center / 20) + 0.2 * (dayClash ? 0 : 1)),
    wisdom: 100 * (0.45 * peak(g[4], 0.28, 0.24) + 0.2 * (munchang ? 1 : 0) + 0.1 * (P.some((p) => p.k !== 'year' && a.ss.hwagae.has(p.b)) ? 1 : 0) + 0.25 * clamp01(share[4] / 0.25)),
  };
  for (const k in cats) cats[k] = Math.max(0, Math.min(100, Math.round(cats[k])));
  const lack = [0, 1, 2, 3, 4].filter((e) => a.counts[e] === 0);
  return { total, cats, parts: { balance, center, yong, gil, harmony, clash, special }, notes: { ...notes, lack }, ctx: { strengthLabel: a.strengthLabel, strong: a.strong, yong: a.roles.yong, hee: a.roles.hee } };
}

// 근거: 항목별 점수를 전체 사주 평균과 비교해 높거나 낮은 이유를 문장으로
export function rankReasons(s, avg) {
  const el = (e) => `${elementName(e)}(${EL_H[e]})`;
  const { notes: n, ctx } = s;
  const text = {
    balance: (up) => (up ? '오행이 고르게 퍼져 기운의 균형이 좋습니다.' : n.lack.length ? `${n.lack.map(el).join('·')} 기운이 없어 오행이 한쪽으로 기울었습니다.` : '일부 오행에 힘이 몰려 있습니다.'),
    center: (up) => (up ? (ctx.strengthLabel === '중화' ? '일간이 중화를 이뤄 어떤 운에도 잘 버팁니다.' : `일간이 ${ctx.strengthLabel} 쪽이지만 크게 치우치지 않았습니다.`) : `일간이 ${ctx.strengthLabel}해 ${ctx.strong ? '기운을 덜어 내는' : '기운을 채워 주는'} 운이 필요합니다.`),
    yong: (up) => (up ? `용신 ${josa(el(ctx.yong), '과/와')} 희신 ${josa(el(ctx.hee), '이/가')} 원국에 넉넉해 스스로 균형을 잡습니다.` : `용신 ${el(ctx.yong)}·희신 ${el(ctx.hee)} 기운이 적어 운에서 채워야 합니다.`),
    gil: (up) => (n.gil.length ? `${n.gil.join('·')}이(가) 있어 ${up ? '돕는 기운이 많습니다' : '기본은 갖췄습니다'}.`.replace('이(가)', josa(n.gil[n.gil.length - 1], '이/가').slice(-1)) : '천을귀인·문창 같은 길신이 적은 편입니다.'),
    harmony: (up) => (n.harmony.length ? `${n.harmony.join(', ')}으로 글자끼리 서로 돕습니다.` : '지지끼리 합이 적어 기운이 따로 움직입니다.'),
    clash: (up) => (up ? '원국 안에 충·형이 적어 안정적입니다.' : `${n.clash.join(', ')}으로 변동과 마찰이 생기기 쉽습니다.`),
    special: () => `${n.special.join(', ')}의 강한 기운이 있습니다.`,
  };
  if (isEnglish()) {
    const note = (value) => {
      const count = /^천을귀인 (\d+)개$/.exec(value);
      if (count) return `Noble Helper × ${count[1]}`;
      const pair = /^(년지|월지|일지|시지|년간|월간|일간|시간)·(년지|월지|일지|시지|년간|월간|일간|시간) (육합|천간합|충|형|원진|천간충)$/.exec(value);
      const pos = { 년간: 'Year stem', 월간: 'Month stem', 일간: 'Day stem', 시간: 'Hour stem' };
      const rel = { 육합: 'six-combination', 천간합: 'stem combination', 충: 'clash', 형: 'penalty', 원진: 'friction', 천간충: 'stem clash' };
      if (pair) return `${pos[pair[1]] || term(pair[1])} / ${pos[pair[2]] || term(pair[2])}: ${rel[pair[3]]}`;
      if (value === '지지 삼합 완성') return 'Complete branch trine';
      return value.replace(/(괴강살|양인살|백호살)/g, (star) => term(star)) === value ? term(value) : value.replace(/(괴강살|양인살|백호살)/g, (star) => term(star));
    };
    Object.assign(text, {
      balance: (up) => up ? 'The Five Elements are spread relatively evenly.' : n.lack.length ? `${n.lack.map(el).join(', ')} is absent from the visible characters, making the element pattern less even.` : 'Some elements hold a larger share of the chart’s energy.',
      center: (up) => up ? (ctx.strengthLabel === '중화' ? 'The Day Master is balanced, giving it a steady position across different cycles.' : `The Day Master is classified as ${term(ctx.strengthLabel).toLowerCase()}, without a large imbalance.`) : `The chart has a ${term(ctx.strengthLabel).toLowerCase()}; traditional interpretation favors cycles that ${ctx.strong ? 'channel excess energy' : 'provide support'}.`,
      yong: (up) => up ? `The useful element ${el(ctx.yong)} and supporting element ${el(ctx.hee)} are well represented in the natal chart.` : `The useful element ${el(ctx.yong)} and supporting element ${el(ctx.hee)} have limited presence, leaving more support to incoming cycles.`,
      gil: (up) => n.gil.length ? `${n.gil.map(note).join(', ')} ${up ? 'provide several supportive features' : 'provide some basic support'}.` : 'Helpful stars such as Noble Helper and Scholar Star are limited.',
      harmony: () => n.harmony.length ? `${n.harmony.map(note).join('; ')} connect the chart’s characters through supportive combinations.` : 'Few branch combinations are present, so the elements operate more separately.',
      clash: (up) => up ? 'Few clashes and penalties make the natal structure relatively stable.' : `${n.clash.map(note).join('; ')} highlight themes of change and friction.`,
      special: () => `${n.special.map(note).join(', ')} add strong special-star themes.`,
    });
  }
  return PARTS.map(([k, name]) => {
    const pts = Math.round((s.parts[k] - avg[k]) * 10) / 10;
    if (k === 'special' && !n.special.length) return null;
    return { key: k, name, pts, text: text[k](pts >= 0) };
  }).filter((x) => x && Math.abs(x.pts) >= 0.3).sort((x, y) => Math.abs(y.pts) - Math.abs(x.pts));
}

// 전체 사주 열거 (년주 60 × 월지 12 × 일주 60 × 시지 12). 월간·시간은 년간·일간에서 정해진다.
export function* allPillars(withHour = true) {
  for (let yn = 0; yn < 60; yn++) {
    const year = { s: yn % 10, b: yn % 12 };
    const s寅 = ((year.s % 5) * 2 + 2) % 10;
    for (let mb = 0; mb < 12; mb++) {
      const month = { s: (s寅 + ((mb - 2 + 12) % 12)) % 10, b: mb };
      for (let dn = 0; dn < 60; dn++) {
        const day = { s: dn % 10, b: dn % 12 };
        if (!withHour) { yield { year, month, day, hour: null }; continue; }
        for (let hb = 0; hb < 12; hb++) yield { year, month, day, hour: { s: ((day.s % 5) * 2 + hb) % 10, b: hb } };
      }
    }
  }
}

// 분포표로 순위 찾기. table: { n, total: 1001칸(0.1점 단위), cats: {key: 101칸} }
export function rankFromTable(score, table) {
  const idx = Math.round(score.total * 10);
  let higher = 0;
  for (let i = idx + 1; i < table.total.length; i++) higher += table.total[i];
  const rank = higher + 1;
  const pct = Math.max(0.01, Math.round((rank / table.n) * 10000) / 100);
  const tier = TIERS.find(([lim]) => pct <= lim);
  const cats = RANK_CATS.map(([k, name]) => {
    const h = table.cats[k];
    let above = 0;
    for (let i = score.cats[k] + 1; i < h.length; i++) above += h[i];
    return { key: k, name, score: score.cats[k], pct: Math.max(1, Math.round(((above + 1) / table.n) * 100)) };
  });
  return { rank, of: table.n, pct, tier: { code: tier[1], name: tier[2], text: tier[3] }, cats };
}

export function sajuRank(chart, tables) {
  const s = rankScore(chart);
  const table = chart.pillars.hour ? tables.four : tables.three;
  return { total: s.total, parts: s.parts, reasons: rankReasons(s, table.avg), ...rankFromTable(s, table), avgTotal: table.avgTotal, withHour: !!chart.pillars.hour };
}

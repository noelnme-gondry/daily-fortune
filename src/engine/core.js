// 간지·오행 기초 상수와 순수 함수. 모든 계산은 결정론적이다(난수 없음).
import { tr } from '../i18n/runtime.js';

export const STEM_H = '甲乙丙丁戊己庚辛壬癸'.split('');
export const STEM_K = '갑을병정무기경신임계'.split('');
export const BR_H = '子丑寅卯辰巳午未申酉戌亥'.split('');
export const BR_K = '자축인묘진사오미신유술해'.split('');
export const STEM_SLUG = ['gap', 'eul', 'byeong', 'jeong', 'mu', 'gi', 'gyeong', 'sin', 'im', 'gye'];
export const BR_SLUG = ['ja', 'chuk', 'in', 'myo', 'jin', 'sa', 'o', 'mi', 'sin', 'yu', 'sul', 'hae'];
export const ANIMAL = ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지'];
export const ANIMAL_SLUG = ['rat', 'ox', 'tiger', 'rabbit', 'dragon', 'snake', 'horse', 'sheep', 'monkey', 'rooster', 'dog', 'pig'];
export const EL_K = ['목', '화', '토', '금', '수'];
export const EL_H = ['木', '火', '土', '金', '水'];
export const EL_SLUG = ['wood', 'fire', 'earth', 'metal', 'water'];
export const STEM_EL = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4];
export const BR_EL = [4, 2, 0, 0, 2, 1, 1, 2, 3, 3, 2, 4];
export const BR_MAIN = [9, 5, 0, 1, 4, 2, 3, 5, 6, 7, 4, 8];
// 지장간 [천간, 일수] — 여기·중기·정기 순
export const HIDDEN = [
  [[8, 10], [9, 20]], [[9, 9], [7, 3], [5, 18]], [[4, 7], [2, 7], [0, 16]], [[0, 10], [1, 20]],
  [[1, 9], [9, 3], [4, 18]], [[4, 7], [6, 7], [2, 16]], [[2, 10], [5, 9], [3, 11]], [[3, 9], [1, 3], [5, 18]],
  [[4, 7], [8, 7], [6, 16]], [[6, 10], [7, 20]], [[7, 9], [3, 3], [4, 18]], [[4, 7], [0, 7], [8, 16]],
];
export const TG = ['비견', '겁재', '식신', '상관', '편재', '정재', '편관', '정관', '편인', '정인'];
export const TG_H = ['比肩', '劫財', '食神', '傷官', '偏財', '正財', '偏官', '正官', '偏印', '正印'];
export const TG_SLUG = ['bigyeon', 'geopjae', 'siksin', 'sanggwan', 'pyeonjae', 'jeongjae', 'pyeongwan', 'jeonggwan', 'pyeonin', 'jeongin'];
export const STAGES = ['장생', '목욕', '관대', '건록', '제왕', '쇠', '병', '사', '묘', '절', '태', '양'];
export const STAGES_H = ['長生', '沐浴', '冠帶', '建祿', '帝旺', '衰', '病', '死', '墓', '絶', '胎', '養'];
export const STAGE_W = [1.2, 0, 1, 1.6, 1.6, 0, -1, -1.2, -0.8, -1.6, 0, 0.6];
const CS_START = [11, 6, 2, 9, 2, 9, 5, 0, 8, 3];
export const LIUHE = [1, 0, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
const PA = [[0, 9], [1, 4], [2, 11], [3, 6], [5, 8], [7, 10]];
const HAE = [[0, 7], [1, 6], [2, 5], [3, 4], [8, 11], [9, 10]];
const WONJIN = [[0, 7], [1, 6], [2, 9], [3, 8], [4, 11], [5, 10]];
const XING3 = [[2, 5, 8], [1, 10, 7]];
const SELF_XING = [4, 6, 9, 11];
// 삼합 그룹(지지 % 4) 기준 신살
export const DOHWA = [9, 6, 3, 0];
export const YEOKMA = [2, 11, 8, 5];
export const HWAGAE = [4, 1, 10, 7];
export const GWIIN = [[1, 7], [0, 8], [11, 9], [11, 9], [1, 7], [0, 8], [1, 7], [2, 6], [3, 5], [3, 5]];
export const MUNCHANG = [5, 6, 8, 9, 8, 9, 11, 0, 2, 3];
export const YANGIN = [3, -1, 6, -1, 6, -1, 9, -1, 0, -1];
export const GWEGANG = ['庚辰', '庚戌', '壬辰', '壬戌', '戊戌'];
export const BAEKHO = ['甲辰', '乙未', '丙戌', '丁丑', '戊辰', '壬戌', '癸丑'];
export const hongran = (yb) => (3 - yb + 12) % 12;
export const cheonhui = (yb) => (9 - yb + 12) % 12;

/* ── 문자열·해시 ───────────────────────────── */
export function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
export const pick = (arr, key) => arr[hash(key) % arr.length];
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// 받침에 따라 조사 선택: josa('편관', '은/는') → '편관은'
export function josa(word, pair) {
  const [withJong, noJong] = pair.split('/');
  const m = String(word).replace(/[^가-힣0-9]+$/, '');
  const last = m.charAt(m.length - 1);
  let jong;
  if (/[0-9]/.test(last)) jong = '013678'.includes(last) ? (last === '1' || last === '7' || last === '8' ? 8 : 1) : 0;
  else {
    const ch = m.charCodeAt(m.length - 1);
    if (!(ch >= 0xac00 && ch <= 0xd7a3)) return word + noJong;
    jong = (ch - 0xac00) % 28;
  }
  const use = withJong === '으로' ? (jong && jong !== 8) : jong;
  return word + (use ? withJong : noJong);
}
// {A} 치환, {A:이/가}처럼 쓰면 받침에 맞는 조사까지 붙인다
export const fill = (s, o) => s.replace(/\{(\w+)(?::([^}]+))?\}/g, (_, k, j) => {
  const v = o[k] !== undefined ? String(o[k]) : '';
  return j ? josa(v, j) : v;
});

/* ── 날짜 ───────────────────────────── */
export const DAY_MS = 86400000;
export const toUTC = (o) => Date.UTC(o.y, o.m - 1, o.d);
export const fromUTC = (t) => { const d = new Date(t); return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate() }; };
export const addDays = (o, n) => fromUTC(toUTC(o) + n * DAY_MS);
export const dow = (o) => new Date(toUTC(o)).getUTCDay();
export const daysIn = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate();
export const DOW_K = ['일', '월', '화', '수', '목', '금', '토'];
export const fmtDate = (o) => tr(`${o.y}년 ${o.m}월 ${o.d}일 (${DOW_K[dow(o)]})`, `${o.y}-${String(o.m).padStart(2, '0')}-${String(o.d).padStart(2, '0')} (${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dow(o)]})`);
export const fmtShort = (o) => `${o.m}/${o.d}`;
export const isoDate = (o) => `${o.y}-${String(o.m).padStart(2, '0')}-${String(o.d).padStart(2, '0')}`;
export const parseISO = (s) => { const [y, m, d] = String(s).split('-').map(Number); return { y, m, d }; };
// 한국 시각 기준 오늘 (서버·빌드 환경의 시간대와 무관)
export function todayKST(now = Date.now()) { return fromUTC(now + 9 * 3600000); }

/* ── 관계 ───────────────────────────── */
export const elRel = (from, to) => (to - from + 5) % 5; // 0 비화 1 내가 생 2 내가 극 3 나를 극 4 나를 생
export const tenGod = (dm, s) => TG[elRel(STEM_EL[dm], STEM_EL[s]) * 2 + ((dm % 2) === (s % 2) ? 0 : 1)];
export const groupOf = (tg) => Math.floor(TG.indexOf(tg) / 2);
export function stageOf(dm, b) {
  const st = CS_START[dm];
  return STAGES[dm % 2 === 0 ? (b - st + 12) % 12 : (st - b + 12) % 12];
}
const inPairs = (list, a, b) => list.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
function isXing(a, b) {
  if (a === b) return SELF_XING.includes(a);
  if (inPairs([[0, 3]], a, b)) return true;
  return XING3.some((g) => g.includes(a) && g.includes(b));
}
export function branchRels(a, b) {
  const r = [];
  if (LIUHE[a] === b) r.push('합');
  if (a !== b && a % 4 === b % 4) r.push('삼합');
  if ((a - b + 12) % 12 === 6) r.push('충');
  if (isXing(a, b)) r.push('형');
  if (inPairs(WONJIN, a, b)) r.push('원진');
  if (inPairs(HAE, a, b)) r.push('해');
  if (inPairs(PA, a, b)) r.push('파');
  return r;
}
// 대표 관계 하나 (같은 지지는 '같음', 관계가 없으면 '없음')
export function relKey(a, b) {
  if (a === b) return '같음';
  const r = branchRels(a, b);
  for (const k of ['합', '삼합', '충', '원진', '형', '해', '파']) if (r.includes(k)) return k;
  return '없음';
}
export const stemHe = (a, b) => (a - b + 10) % 10 === 5;
export const stemChung = (a, b) => Math.abs(a - b) === 6 && Math.min(a, b) <= 3;
export const gz = (str) => ({ s: STEM_H.indexOf(str[0]), b: BR_H.indexOf(str[1]) });
export const pillarKo = (p) => `${STEM_K[p.s]}${BR_K[p.b]}`;
export const pillarH = (p) => `${STEM_H[p.s]}${BR_H[p.b]}`;
export const pillarLabel = (p) => tr(`${pillarKo(p)}(${pillarH(p)})`, `${STEM_SLUG[p.s]}-${BR_SLUG[p.b]} (${pillarH(p)})`);
export const elLabel = (e) => `${EL_K[e]}(${EL_H[e]})`;
// 60갑자 순번 ↔ 기둥
export const sexagenary = (n) => ({ s: n % 10, b: n % 12 });
export const sexIndex = (p) => [...Array(60).keys()].find((n) => n % 10 === p.s && n % 12 === p.b);
export const iljuSlug = (p) => `${STEM_SLUG[p.s]}${BR_SLUG[p.b]}`;
// 띠별 삼재가 드는 해의 지지 3개 (들·눌·날삼재)
export const samjaeBranches = (tti) => { const s = YEOKMA[tti % 4]; return [s, (s + 1) % 12, (s + 2) % 12]; };
// 2시간 단위 시진 경계 (평균태양시 30분 보정 반영)
export function brHours(b) {
  const s = (b * 2 - 1 + 24) % 24, e = (s + 2) % 24;
  const f = (h) => `${String(h).padStart(2, '0')}:30`;
  return `${f(s)}~${f(e)}`;
}

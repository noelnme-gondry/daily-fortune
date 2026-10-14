// 간지 달력: 일주는 날짜 차이로, 월주·년주는 절기(lunar-javascript)로, 음력은 한국천문연구원 기준(korean-lunar-calendar)으로 계산한다.
import LJ from 'lunar-javascript';
import KoreanLunarCalendar from 'korean-lunar-calendar';
import { gz, toUTC, DAY_MS, isoDate } from './core.js';

const { Solar } = LJ;
export { Solar };

export const solarAt = (o, h = 12, mi = 0) => Solar.fromYmdHms(o.y, o.m, o.d, h, mi, 0);

// 일주: 2000-01-01(戊午)을 기준으로 60일 주기
const DAY_BASE = (() => {
  const ref = { y: 2000, m: 1, d: 1 };
  const p = gz(solarAt(ref).getLunar().getDayInGanZhi());
  const idx = [...Array(60).keys()].find((n) => n % 10 === p.s && n % 12 === p.b);
  return ((idx - Math.round(toUTC(ref) / DAY_MS)) % 60 + 60) % 60;
})();
export function dayPillar(o) {
  const n = ((Math.round(toUTC(o) / DAY_MS) + DAY_BASE) % 60 + 60) % 60;
  return { s: n % 10, b: n % 12 };
}

const monthCache = new Map();
// 그 날 정오(한국시) 기준 절기 월주
export function monthPillar(o) {
  const k = isoDate(o);
  if (!monthCache.has(k)) monthCache.set(k, gz(solarAt(o, 11).getLunar().getMonthInGanZhiExact()));
  return monthCache.get(k);
}
const yearCache = new Map();
// 양력 연도의 대표 년주 (입춘 이후 기준)
export function yearPillar(y) {
  if (!yearCache.has(y)) yearCache.set(y, gz(solarAt({ y, m: 7, d: 1 }).getLunar().getYearInGanZhiByLiChun()));
  return yearCache.get(y);
}
export const yearPillarOfDate = (o) => gz(solarAt(o, 11).getLunar().getYearInGanZhiByLiChun());

/* ── 한국 음력 ───────────────────────────── */
const klc = new KoreanLunarCalendar();
// 양력 → 한국 음력 {y, m, d, leap}
export function lunarOf(o) {
  if (!klc.setSolarDate(o.y, o.m, o.d)) return null;
  const l = klc.getLunarCalendar();
  return { y: l.year, m: l.month, d: l.day, leap: !!l.intercalation };
}
export const lunarText = (o, withYear = false) => {
  const l = lunarOf(o);
  if (!l) return '';
  return `음력 ${withYear ? `${l.y}년 ` : ''}${l.leap ? '윤' : ''}${l.m}월 ${l.d}일`;
};
// 한국 음력 → 양력. 존재하지 않는 날짜(없는 윤달, 30일이 없는 달)는 null
export function solarOfLunar(y, m, d, leap) {
  if (!klc.setLunarDate(y, m, d, !!leap)) return null;
  const s = klc.getSolarCalendar();
  const o = { y: s.year, m: s.month, d: s.day };
  const back = lunarOf(o);
  if (!back || back.y !== y || back.m !== m || back.d !== d || back.leap !== !!leap) return null;
  return o;
}

/* ── 표준시·서머타임 ───────────────────────────── */
const DST = [
  ['1948-06-01', '1948-09-12'], ['1949-04-03', '1949-09-10'], ['1950-04-01', '1950-09-09'], ['1951-05-06', '1951-09-08'],
  ['1955-05-05', '1955-09-08'], ['1956-05-20', '1956-09-29'], ['1957-05-05', '1957-09-21'], ['1958-05-04', '1958-09-20'],
  ['1959-05-03', '1959-09-19'], ['1960-05-01', '1960-09-17'], ['1987-05-10', '1987-10-10'], ['1988-05-08', '1988-10-08'],
];
// 그 날짜에 한국에서 쓰던 UTC 오프셋(분)과 서머타임 여부
export function utcOffset(o) {
  const k = isoDate(o);
  const base = (k >= '1954-03-21' && k <= '1961-08-09') ? 510 : 540;
  const dst = DST.some(([a, b]) => k >= a && k <= b);
  return { off: base + (dst ? 60 : 0), dst };
}

/* ── 절기 ───────────────────────────── */
const TERM_KO = {
  '冬至': '동지', '小寒': '소한', '大寒': '대한', '立春': '입춘', '雨水': '우수', '惊蛰': '경칩', '驚蟄': '경칩', '春分': '춘분', '清明': '청명',
  '谷雨': '곡우', '立夏': '입하', '小满': '소만', '小滿': '소만', '芒种': '망종', '芒種': '망종', '夏至': '하지', '小暑': '소서', '大暑': '대서',
  '立秋': '입추', '处暑': '처서', '處暑': '처서', '白露': '백로', '秋分': '추분', '寒露': '한로', '霜降': '상강', '立冬': '입동', '小雪': '소설', '大雪': '대설',
  DONG_ZHI: '동지', XIAO_HAN: '소한', DA_HAN: '대한', LI_CHUN: '입춘', YU_SHUI: '우수', JING_ZHE: '경칩', DA_XUE: '대설',
};
const termCache = new Map();
// 양력 연도의 24절기 (한국 표준시 기준 시각)
export function solarTerms(y) {
  if (termCache.has(y)) return termCache.get(y);
  const seen = new Map();
  for (const probe of [{ y, m: 1, d: 10 }, { y, m: 7, d: 1 }, { y: y + 1, m: 1, d: 10 }]) {
    const table = solarAt(probe).getLunar().getJieQiTable();
    for (const key of Object.keys(table)) {
      const name = TERM_KO[key];
      if (!name) continue;
      const s = table[key];
      // 라이브러리는 UTC+8 기준 → 한국 표준시(+1시간)
      const t = new Date(Date.UTC(s.getYear(), s.getMonth() - 1, s.getDay(), s.getHour(), s.getMinute()) + 3600000);
      if (t.getUTCFullYear() !== y) continue;
      const o = { y, m: t.getUTCMonth() + 1, d: t.getUTCDate() };
      const id = `${name}-${isoDate(o)}`;
      if (!seen.has(id)) seen.set(id, { name, date: o, time: `${String(t.getUTCHours()).padStart(2, '0')}:${String(t.getUTCMinutes()).padStart(2, '0')}` });
    }
  }
  const list = [...seen.values()].sort((a, b) => toUTC(a.date) - toUTC(b.date) || a.time.localeCompare(b.time));
  termCache.set(y, list);
  return list;
}

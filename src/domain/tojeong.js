// 토정비결 작괘. 기존 사주 엔진과 분리하며 생시·성별·절입 시각을 사용하지 않는다.
// 수표/공식 참고: molpass/mcp-tojeong (MIT). 전거와 판본 정책: docs/tojeong.md.
import KoreanLunarCalendar from 'korean-lunar-calendar';

const EARLY_STEM = [9, 8, 7, 6, 5, 9, 8, 7, 6, 5];
const EARLY_BRANCH = [9, 8, 7, 6, 5, 4, 9, 8, 7, 6, 5, 4];
const MIDDLE_STEM = [11, 10, 9, 8, 7, 11, 10, 9, 8, 7];
const MIDDLE_BRANCH = [9, 11, 8, 8, 11, 7, 7, 11, 10, 10, 11, 9];
const STEMS = '甲乙丙丁戊己庚辛壬癸', BRANCHES = '子丑寅卯辰巳午未申酉戌亥';
export const TOJEONG_RANGE = { min: 1930, max: 2049 };
export class TojeongInputError extends Error {}
const fail = (message) => { throw new TojeongInputError(message); };

export function tojeongNumbers(ganji) {
  const s = STEMS.indexOf(ganji?.[0]), b = BRANCHES.indexOf(ganji?.[1]);
  if (ganji?.length !== 2 || s < 0 || b < 0 || s % 2 !== b % 2) fail('간지를 확인할 수 없습니다.');
  return { taese: MIDDLE_STEM[s] + MIDDLE_BRANCH[b], wolgeon: EARLY_STEM[s] + EARLY_BRANCH[b], iljin: EARLY_STEM[s] + MIDDLE_BRANCH[b] };
}

// 라이브러리가 없는 윤달을 평달로 간주하는 경우까지 왕복 값으로 검증한다.
function lunarDate(y, m, d, leap = false) {
  const cal = new KoreanLunarCalendar();
  if (!cal.setLunarDate(y, m, d, leap)) return null;
  const l = cal.getLunarCalendar();
  return l.year === y && l.month === m && l.day === d && l.intercalation === leap ? cal : null;
}

export function tojeongBirth(input) {
  if (!input || ![input.y, input.m, input.d].every(Number.isInteger)
    || input.y < TOJEONG_RANGE.min || input.y > TOJEONG_RANGE.max || input.m < 1 || input.m > 12 || input.d < 1 || input.d > 31
    || !['solar', 'lunar'].includes(input.calendar)) fail('달력 종류와 생년월일을 확인해 주세요.');
  let cal;
  if (input.calendar === 'lunar') cal = lunarDate(input.y, input.m, input.d, !!input.leap);
  else {
    cal = new KoreanLunarCalendar();
    if (!cal.setSolarDate(input.y, input.m, input.d)) cal = null;
    if (cal) {
      const s = cal.getSolarCalendar();
      if (s.year !== input.y || s.month !== input.m || s.day !== input.d) cal = null;
    }
  }
  if (!cal) fail('존재하지 않는 날짜입니다. 양력·음력과 윤달 여부를 확인해 주세요.');
  const l = cal.getLunarCalendar(), s = cal.getSolarCalendar();
  return { lunar: { y: l.year, m: l.month, d: l.day, leap: l.intercalation }, solar: { y: s.year, m: s.month, d: s.day } };
}

export function tojeongGwae({ age, monthDays, birthDay, taese, wolgeon, iljin }) {
  if (![age, monthDays, birthDay, taese, wolgeon, iljin].every(Number.isInteger)
    || age < 1 || ![29, 30].includes(monthDays) || birthDay < 1 || birthDay > monthDays
    || taese < 1 || wolgeon < 1 || iljin < 1) fail('괘를 계산할 수 있는 날짜와 수가 아닙니다.');
  const mod = (a, b) => a % b || b;
  const upper = mod(age + taese, 8), middle = mod(monthDays + wolgeon, 6), lower = mod(birthDay + iljin, 3);
  return { upper, middle, lower, code: `${upper}${middle}${lower}` };
}

export function calculateTojeong(input, targetYear) {
  if (!Number.isInteger(targetYear) || targetYear < TOJEONG_RANGE.min || targetYear > TOJEONG_RANGE.max) fail(`현재 음력 자료로 계산할 수 있는 해는 ${TOJEONG_RANGE.min}~${TOJEONG_RANGE.max}년입니다.`);
  const birth = tojeongBirth(input), l = birth.lunar;
  if (targetYear < l.y) fail('태어난 음력 연도보다 앞선 해의 운세는 계산할 수 없습니다.');
  const month = lunarDate(targetYear, l.m, 1);
  const monthDays = lunarDate(targetYear, l.m, 30) ? 30 : 29;
  const effectiveDay = Math.min(l.d, monthDays);
  const birthday = lunarDate(targetYear, l.m, effectiveDay);
  const year = lunarDate(targetYear, 1, 1);
  if (!month || !birthday || !year) fail('이 해의 음력 날짜를 확인할 수 없습니다.');
  const ganji = { year: year.getChineseGapja().year.slice(0, 2), month: month.getChineseGapja().month.slice(0, 2), day: birthday.getChineseGapja().day.slice(0, 2) };
  const values = { age: targetYear - l.y + 1, monthDays, birthDay: effectiveDay, taese: tojeongNumbers(ganji.year).taese, wolgeon: tojeongNumbers(ganji.month).wolgeon, iljin: tojeongNumbers(ganji.day).iljin };
  return {
    ...tojeongGwae(values), targetYear, birth, ganji, values,
    normalizedLeap: l.leap, adjustedDay: effectiveDay !== l.d,
    period: lunarYearPeriod(targetYear),
  };
}

// 음력 한 해(설날~다음 설날 전날)의 양력 범위
function lunarYearPeriod(targetYear) {
  const start = lunarDate(targetYear, 1, 1)?.getSolarCalendar(), end = lunarDate(targetYear + 1, 1, 1)?.getSolarCalendar();
  if (!start || !end) fail('음력 한 해의 범위를 확인할 수 없습니다.');
  const endDate = new Date(Date.UTC(end.year, end.month - 1, end.day) - 86400000);
  return { start: { y: start.year, m: start.month, d: start.day }, end: { y: endDate.getUTCFullYear(), m: endDate.getUTCMonth() + 1, d: endDate.getUTCDate() } };
}

// 보는 해의 작괘 기준표. 상괘는 음력 출생 연도(세는나이)로, 중괘는 음력 생월로 정해진다.
// 하괘는 생일의 일진으로 정해져 날마다 다르므로 표에 넣지 않는다.
export function tojeongYearTable(targetYear) {
  const first = lunarDate(targetYear, 1, 1);
  if (!first) fail('이 해의 음력 날짜를 확인할 수 없습니다.');
  const ganji = first.getChineseGapja().year.slice(0, 2);
  const { taese } = tojeongNumbers(ganji);
  const months = Array.from({ length: 12 }, (_, i) => {
    const m = i + 1, days = lunarDate(targetYear, m, 30) ? 30 : 29;
    const monthGanji = lunarDate(targetYear, m, 1).getChineseGapja().month.slice(0, 2);
    const { wolgeon } = tojeongNumbers(monthGanji);
    return { m, ganji: monthGanji, days, wolgeon, middle: (days + wolgeon) % 6 || 6 };
  });
  const uppers = Array.from({ length: 8 }, (_, i) => ({ upper: i + 1, years: [] }));
  for (let y = TOJEONG_RANGE.min; y <= targetYear; y++) uppers[((targetYear - y + 1 + taese) % 8 || 8) - 1].years.push(y);
  return { targetYear, ganji, taese, months, uppers, period: lunarYearPeriod(targetYear) };
}

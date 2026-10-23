// 개인 운세 입력의 날짜 검증. 연구용 원국 계산 엔진의 지원 범위는 바꾸지 않는다.
import { daysIn, isoDate, todayKST } from '../engine/core.js';
import { solarOfLunar } from '../engine/calendar.js';
import { tr, bilingual } from '../i18n/runtime.js';

export const BIRTH_YEAR_MIN = 1900;
export const BIRTH_YEAR_MAX = 2050;
export const BIRTH_TIME_HINT = bilingual({
  exact: '한국 출생 당시의 시계 시각을 넣으세요. 30분 보정과 과거 서머타임을 적용하며 해외 출생지·시간대는 변환하지 않습니다.',
  branch: '한국 출생 당시의 시계 기준 구간입니다. 해외 출생지·시간대는 변환하지 않습니다.',
  none: '시주 없이 세 기둥으로 계산합니다. 대운 시작은 정오 기준의 참고값이며 출생 시각에 따라 달라질 수 있습니다.',
}, {
  exact: 'Enter the clock time recorded at birth in Korea. The 30-minute adjustment and historical daylight saving are applied automatically. Birth-country and birth-location corrections are not included.',
  branch: 'Intervals follow the clock time used at birth in Korea. Overseas birth locations and time zones are not converted.',
  none: 'Uses three pillars without an hour pillar. The luck-cycle start uses noon as a reference and may change with the birth time.',
});

export function birthDateError(p, today = todayKST()) {
  if (!p.y || !p.m || !p.d) return tr('생년월일을 모두 선택해 주세요.', 'Select your birth year, month and day.');
  if (![p.y, p.m, p.d].every(Number.isInteger) || p.y < BIRTH_YEAR_MIN || p.m < 1 || p.m > 12 || p.d < 1) {
    return tr('생년월일을 확인해 주세요.', 'Check your birth date.');
  }
  const lunar = p.calendar === 'lunar';
  if (!lunar && p.d > daysIn(p.y, p.m)) return tr(`${p.y}년 ${p.m}월에는 ${p.d}일이 없습니다.`, `Day ${p.d} does not exist in ${p.y}-${p.m}.`);
  const birth = lunar ? solarOfLunar(p.y, p.m, p.d, !!p.leap) : p;
  if (!birth) return tr('존재하지 않는 음력 날짜입니다.', 'This lunar date does not exist.');
  if (isoDate(birth) > isoDate(today)) return tr('미래 날짜는 생일로 입력할 수 없습니다. 생년월일을 확인해 주세요.', 'A birth date cannot be in the future. Check your birth date.');
  return '';
}

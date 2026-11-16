// 개인 운세 입력의 날짜 검증. 연구용 원국 계산 엔진의 지원 범위는 바꾸지 않는다.
import { daysIn, isoDate, todayKST } from '../engine/core.js';
import { solarOfLunar } from '../engine/calendar.js';
import { tr, bilingual } from '../i18n/runtime.js';

export const BIRTH_YEAR_MIN = 1900;
export const BIRTH_YEAR_MAX = 2050;
export const BIRTH_TIME_HINT = bilingual({
  exact: '비워두면 시간 모름으로 계산해요.',
  branch: '한국 출생 당시의 시계 기준으로 골라주세요.',
  none: '태어난 시각을 제외한 세 기둥으로 읽어요.',
}, {
  exact: 'Leave blank if your birth time is unknown.',
  branch: 'Choose the clock interval recorded at birth in Korea.',
  none: 'Uses three pillars without the birth-hour pillar.',
});

export function birthDateError(p, today = todayKST()) {
  if (Number.isNaN(p.y)) return tr('태어난 해를 숫자 네 자리로 입력해 주세요.', 'Enter your birth year as four digits.');
  if (!p.y || !p.m || !p.d) return tr('생년월일을 모두 입력해 주세요.', 'Enter your birth year, month and day.');
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

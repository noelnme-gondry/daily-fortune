// 기존 계산값을 유지하면서 계산과 설명이 같은 기준을 참조한다.
export const STRENGTH_BANDS = [
  { min: 0, label: '극신약' }, { min: 0.19, label: '신약' },
  { min: 0.35, label: '중화' }, { min: 0.47, label: '신강' }, { min: 0.64, label: '극신강' },
];
export const BALANCE_THRESHOLD = 0.41;
export const BRANCH_STRENGTH_WEIGHT = { year: 1, month: 3, day: 1.5, hour: 1 };
export const SEASON_BONUS = 0.7;

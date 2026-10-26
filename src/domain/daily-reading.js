import { DAILY_OUTLOOK, DAILY_OVERVIEW } from '../content/daily-outlook.js';
import { tr } from '../i18n/runtime.js';

export const dailyOverview = (band) => tr(...DAILY_OVERVIEW[band]);

// 해석과 활용 예시를 구분한다. 요인·전날 대비는 엔진이 계산한 값을 그대로 받는다.
export function dailyReading(cat, band, { action, basis, change }) {
  const [outlook, opportunity, caution] = DAILY_OUTLOOK[cat][band].map(pair => tr(...pair));
  const reading = { outlook, opportunity, caution, action,
    basis: basis || tr('이 분야의 개별 일진 요인 해설은 제공되지 않습니다. 점수는 일진·월운·세운을 함께 반영한 값입니다.', 'No individual day-pillar factor explanation is available for this area. The score combines the day, month and year cycles.'),
    change,
  };
  return { ...reading, text: Object.values(reading).filter(Boolean).join(' ') };
}

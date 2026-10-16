// 화면·FAQ·소개·공개 예시가 공유하는 실제 입력 처리의 한계.
import { bilingual } from '../i18n/runtime.js';
export const UNKNOWN_TIME = bilingual({
  summary: '시간을 몰라요를 선택하면 시주와 시주에 속한 십신·지장간·12운성, 시주가 참여하는 관계를 제외합니다. 남은 세 기둥으로 오행·강약·용신과 운세를 다시 계산하므로 전체 점수와 해석이 달라질 수 있습니다.',
  boundary: '시간 미상일 때는 계산 라이브러리의 정오 기준값으로 년·월·일주와 대운을 구합니다. 실제 출생 시각을 알아낸 것이 아닙니다. 절기 전후나 날짜 경계에 태어났다면 원국이 달라질 수 있고, 대운 시작 시점도 출생 시각을 넣은 결과와 다를 수 있습니다.',
}, {
  summary: 'Choosing “Time unknown” excludes the hour pillar, its Ten Gods, hidden stems and life stage, and relationships involving it. Element balance, strength, useful elements and fortune scores are recalculated from three pillars, so the overall reading can change.',
  boundary: 'For an unknown birth time, the library uses a noon reference for the year, month and day pillars and decade cycles. This does not establish your actual birth time. Near solar-term or date boundaries, the chart and decade-cycle start may differ from results using the actual time.',
});

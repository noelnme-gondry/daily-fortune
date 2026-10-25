import { bilingual } from '../i18n/runtime.js';

export const GUIDE_CATEGORIES = [
  { id: 'start', copy: bilingual({ title: '처음 보는 사주와 만세력' }, { title: 'Start with your chart' }) },
  { id: 'input', copy: bilingual({ title: '생일·시간·달력 확인' }, { title: 'Dates, times and calendars' }) },
  { id: 'chart', copy: bilingual({ title: '오행·십신·원국 해석' }, { title: 'Elements and chart relationships' }) },
  { id: 'cycles', copy: bilingual({ title: '대운·세운·기간별 운세' }, { title: 'Major, annual and shorter cycles' }) },
  { id: 'life', copy: bilingual({ title: '일·돈·관계와 생활 속 질문' }, { title: 'Work, money, relationships and everyday questions' }) },
  { id: 'limits', copy: bilingual({ title: '결과 비교와 이용 기준' }, { title: 'Comparisons and responsible use' }) },
];

// 본문·검색 질문·관련 글·도구 연결을 같은 항목에서 관리한다.
export function defineGuide(slug, category, related, links, example, korean, english) {
  return { slug, category, related, links, example, published: '2026-10-25', copy: bilingual(korean, english) };
}

export const GUIDE_SOURCES = [
  { href: 'https://encykorea.aks.ac.kr/Article/E0025957', copy: bilingual({
    title: '한국민족문화대백과사전 · 사주',
    scope: '사주·간지·절기와 전통 해석의 배경 자료입니다. 이 서비스의 점수식이나 예측력을 검증하는 자료는 아닙니다.',
  }, {
    title: 'Encyclopedia of Korean Culture · Saju',
    scope: 'Background on pillars, calendar conventions and traditional interpretation. It does not validate this service’s scoring formula or predictive accuracy.',
  }) },
];

// 헤더·홈·푸터가 같은 목적별 분류와 실제 주소를 사용한다.
import { tr } from '../i18n/runtime.js';
import { esc } from './util.js';
export function navigationGroups(today) {
  const link = (path, ko, en) => ({ path, name: tr(ko, en) });
  return [
    { name: tr('날짜별 운세', 'Fortunes by date'), note: tr('오늘부터 한 해까지', 'From today to a whole year'), links: [link('/today/', '오늘의 운세', 'Today'), link('/tomorrow/', '내일의 운세', 'Tomorrow'), link('/week/', '이번 주', 'This week'), link('/month/', '이달', 'This month'), ...[today.y, today.y + 1].map(y => link(`/year/${y}/`, `${y}년`, String(y))), link('/tojeong/', '무료 토정비결', 'Tojeong'), link('/tti/today/', '띠별 운세', 'Zodiac fortunes')] },
    { name: tr('내 사주 이해', 'Understand your saju'), note: tr('성향·오행·인생 흐름', 'Traits, elements & life cycles'), links: [link('/lifetime/', '평생 사주', 'Lifetime saju'), link('/manseryeok/', '만세력·오행', 'Birth chart & elements')] },
    { name: tr('두 사람의 궁합', 'Two-person compatibility'), note: tr('닮은 점과 다른 점', 'Similarities & differences'), links: [link('/compatibility/', '사주 궁합', 'Saju compatibility'), link('/tti/compatibility/', '띠 궁합', 'Zodiac compatibility')] },
    { name: tr('재미로 보는 사주', 'Explore your saju'), note: tr('캐릭터·랭킹', 'Characters & rankings'), links: [link('/life-story/', '내 인생 캐릭터', 'Your life character'), link('/saju-ranking/', '내 사주 랭킹', 'Your saju ranking'), link('/saju/ilju-ranking/', '60일주 랭킹', '60 day-pillar rankings')] },
    { name: tr('사주 읽는 법', 'How to read saju'), note: tr('용어·계산 기준', 'Terms & calculation rules'), links: [link('/guides/', '풀이 이용 안내', 'Reading guides'), link('/saju/', '사주 백과', 'Saju reference'), link('/saju/glossary/', '용어 사전', 'Glossary'), link('/about/', '계산 방법과 범위', 'Methods & scope')] },
  ];
}
export function groupedLinks(today, currentPath = '', className = 'purpose-groups') {
  return `<div class="${className}">${navigationGroups(today).map(g => `<section><h3>${esc(g.name)}</h3><p>${esc(g.note)}</p><div class="purpose-links">${g.links.map(l => `<a href="${l.path}"${l.path === currentPath ? ' aria-current="page"' : ''}>${esc(l.name)}</a>`).join('')}</div></section>`).join('')}</div>`;
}

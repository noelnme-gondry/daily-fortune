// 헤더·홈·푸터가 같은 목적별 분류와 실제 주소를 사용한다.
import { tr } from '../i18n/runtime.js';
import { esc } from './util.js';
import { FORTUNE_PRODUCTS, productEdition } from '../domain/fortune-products.js';
import { productPath } from './product-path.js';
export function navigationGroups(today, paidReadings) {
  const link = (path, ko, en) => ({ path, name: tr(ko, en) });
  return [
    { name: tr('무료 운세', 'Free fortunes'), note: tr('오늘부터 한 해까지 · 무료 풀이', 'From today to a whole year · free readings'), links: [link('/today/', '오늘의 운세', 'Today’s fortune'), link('/tomorrow/', '내일의 운세', 'Tomorrow’s fortune'), link('/week/', '이번 주 운세', 'This week’s fortune'), link('/month/', '이달의 운세', 'This month’s fortune'), link(`/year/${today.y}/`, `${today.y}년 운세`, `${today.y} fortune`), link('/tti/', '띠별 운세', 'Zodiac fortunes')] },
    { name: tr('프리미엄 운세', 'Premium reports'), path: '/shop/', note: tr('각 990원 · 단건 결제 · 다운로드 포함', 'KRW 990 each · one-time payment · download included'), links: [...FORTUNE_PRODUCTS.map(product => {
      const p = productEdition(product, today.y + 1);
      return link(productPath(p.id, paidReadings, today.y + 1), `${p.name} · ${p.price}원`, `${p.nameEn} · KRW ${p.price}`);
    }), link('/shop/orders/', '구매 보관함', 'Purchased reports')] },
    { name: tr('무료 사주·궁합 도구', 'Free chart & compatibility tools'), navLabel: tr('무료 도구', 'Free tools'), note: tr('내 사주 원국·오행과 띠 궁합', 'Your birth chart, elements & zodiac compatibility'), links: [link('/manseryeok/', '만세력·오행', 'Birth chart & elements'), link('/tti/compatibility/', '띠 궁합', 'Zodiac compatibility')] },
    { name: tr('재미로 보는 사주', 'Explore your saju'), navLabel: tr('캐릭터·랭킹', 'Characters & ranks'), note: tr('캐릭터·랭킹', 'Characters & rankings'), links: [link('/life-story/', '내 인생 캐릭터', 'Your life character'), link('/saju-ranking/', '내 사주 랭킹', 'Your saju ranking'), link('/saju/ilju-ranking/', '60일주 랭킹', '60 day-pillar rankings')] },
    { name: tr('사주 읽는 법', 'How to read saju'), navLabel: tr('사주 읽는 법', 'Reading guide'), note: tr('용어·계산 기준', 'Terms & calculation rules'), links: [link('/guides/', '풀이 이용 안내', 'Reading guides'), link('/saju/', '사주 백과', 'Saju reference'), link('/saju/glossary/', '용어 사전', 'Glossary'), link('/about/', '계산 방법과 범위', 'Methods & scope')] },
  ];
}
export function groupedLinks(today, currentPath = '', className = 'purpose-groups', paidReadings) {
  return `<div class="${className}">${navigationGroups(today, paidReadings).map(g => `<section><h3>${esc(g.name)}</h3><p>${esc(g.note)}</p><div class="purpose-links">${g.links.map(l => `<a href="${l.path}"${l.path === currentPath ? ' aria-current="page"' : ''}>${esc(l.name)}</a>`).join('')}</div></section>`).join('')}</div>`;
}

export function headerGroups(groups, path) {
  return groups.map((group, index) => {
    const label = group.navLabel || group.name;
    const href = group.path || group.links[0].path;
    const current = href === path || group.links.some(link => link.path === path) || (index === 0 && path === '/');
    const panel = `nav-links-${index}`;
    return `<div class="nav-group">
      <a class="nav-main"${group.path === '/shop/' ? ' data-premium-menu' : ''} href="${href}"${current ? ' aria-current="' + (href === path ? 'page' : 'true') + '"' : ''}><b>${esc(label)}</b><small>${esc(group.note)}</small></a>
      <button type="button" class="nav-toggle" hidden aria-label="${esc(tr(label + ' 하위 메뉴', label + ' submenu'))}" aria-controls="${panel}" aria-expanded="false"></button>
      <ul class="nav-links" id="${panel}" hidden>${group.links.map(link => `<li><a href="${link.path}"${link.path === path ? ' aria-current="page"' : ''}>${esc(link.name)}</a></li>`).join('')}</ul>
    </div>`;
  }).join('');
}

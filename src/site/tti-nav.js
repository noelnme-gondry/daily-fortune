import { pillarLabel, yearPillar } from '../engine/index.js';
import { uiIcon } from './icons.js';
export function ttiNav(ctx, path) {
  const y = ctx.today.y;
  const items = [
    ['/tti/today/', '오늘의 운세', '내 띠의 오늘 흐름'],
    ...[y, y + 1].map((yr) => [`/tti/${yr}/`, `${yr}년 운세`, `${pillarLabel(yearPillar(yr))}년 월별 흐름`]),
    ['/tti/samjae/', '삼재 확인', '올해와 내년 삼재'],
    ['/tti/compatibility/', '띠 궁합', '12띠 관계 살펴보기'],
  ];
  return `<nav class="tti-nav" aria-label="띠별 운세 메뉴">${items.map(([href, name, description]) => `<a class="card link-card" href="${href}"${path.startsWith(href) || (href === '/tti/today/' && path === '/tti/') ? ' aria-current="page"' : ''}>${uiIcon(href.includes('compatibility') ? 'help' : 'book')}<b>${name}</b><span>${description}</span></a>`).join('')}</nav>`;
}

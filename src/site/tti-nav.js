import { siteText } from './copy.js';
import { pillarLabel, yearPillar } from '../engine/index.js';
import { uiIcon } from './icons.js';
export function ttiNav(ctx, path) {
  const y = ctx.today.y;
  const items = [
    ['/tti/today/', siteText('오늘의 운세'), siteText('내 띠의 오늘 흐름')],
    ...[y, y + 1, ...ctx.years.filter(yr => yr < y).reverse()].map((yr) => [`/tti/${yr}/`, `${yr}${siteText("년 운세")}`, `${pillarLabel(yearPillar(yr))}${siteText("년 월별 흐름")}`]),
    ['/tti/samjae/', siteText('삼재 확인'), siteText('올해와 내년 삼재')],
    ['/tti/compatibility/', siteText('띠 궁합'), siteText('12띠 관계 살펴보기')],
  ];
  const links = items.map(([href, name, description]) => {
    let current = '';
    if (path === href) current = ' aria-current="page"';
    else if (path.startsWith(href)) current = ' aria-current="location"';
    return `<a class="card link-card" href="${href}"${current}>${uiIcon(href.includes('compatibility') ? 'help' : 'book')}<b>${name}</b><span>${description}</span></a>`;
  });
  return `<nav class="tti-nav" aria-label="${siteText("띠별 운세 메뉴")}">${links.join('')}</nav>`;
}

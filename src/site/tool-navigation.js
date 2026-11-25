import { TOOLS, yearTool } from '../content/pages.js';
import { tr } from '../i18n/runtime.js';
import { esc } from './util.js';

// 도구의 주소·이름은 기존 콘텐츠 계약에서 파생한다.
export function toolNavigation(today) {
  return [
    ...['today', 'tomorrow', 'week', 'month'].map(key => ({ key, group: 'period', ...TOOLS[key] })),
    { key: `year${today.y}`, group: 'period', ...yearTool(today.y) },
    ...['lifetime', 'story', 'rank', 'compatibility', 'manseryeok'].map(key => ({ key, group: 'chart', ...TOOLS[key] })),
  ];
}
export function readingNavigation(mode, today) {
  const tools = toolNavigation(today);
  return `<section class="reading-navigation" aria-label="${tr('기간 선택', 'Choose a period')}"><nav class="period-switch" aria-label="${tr('날짜별 운세', 'Fortunes by date')}"><b>${tr('날짜별 운세', 'By date')}</b><div>${tools.filter(t => t.group === 'period').map(t => `<a href="${t.path}#reading-summary" data-period-link${t.key === mode ? ' aria-current="page"' : ''}>${esc(t.nav)}</a>`).join('')}</div></nav></section>`;
}
export function nextTools(mode, today) {
  const order = {
    home: ['story', 'rank', 'tomorrow'],
    today: ['story', 'rank', 'tomorrow'],
    tomorrow: ['week', 'today', 'month'],
    week: ['month', 'today', 'tomorrow'],
    month: [`year${today.y}`, 'week', 'today'],
    year: ['month', 'lifetime', 'manseryeok'],
    manseryeok: ['today', 'lifetime', 'rank'],
    lifetime: ['story', 'compatibility', `year${today.y}`],
    story: ['lifetime', 'rank', 'today'],
    rank: ['lifetime', 'manseryeok', 'today'],
    compatibility: ['lifetime', 'today', 'manseryeok'],
  }[mode] || ['today', 'month', 'lifetime'];
  const byKey = new Map(toolNavigation(today).map(t => [t.key, t]));
  return order.map(key => byKey.get(key)).filter(Boolean);
}
export function nextToolsHtml(mode, today) {
  return `<nav class="result-next" aria-label="${tr('이어서 볼 운세', 'Continue exploring')}"><h3>${tr('이어서 살펴보세요', 'Keep exploring')}</h3><div>${nextTools(mode, today).map(t => `<a href="${t.path}" data-ga-cta="result_next">${esc(t.nav)}</a>`).join('')}</div></nav>`;
}

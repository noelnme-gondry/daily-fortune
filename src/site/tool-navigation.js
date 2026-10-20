import { TOOLS, yearTool } from '../content/pages.js';
import { tr } from '../i18n/runtime.js';
import { esc } from './util.js';

// 도구의 주소·이름은 기존 콘텐츠 계약에서 파생한다.
export function toolNavigation(today) {
  return [
    ...['today', 'tomorrow', 'week', 'month'].map(key => ({ key, ...TOOLS[key] })),
    ...[today.y, today.y + 1].map(y => ({ key: `year${y}`, ...yearTool(y) })),
    ...['lifetime', 'story', 'rank', 'compatibility', 'manseryeok'].map(key => ({ key, ...TOOLS[key] })),
  ];
}
export function nextTools(mode, today) {
  const order = {
    home: ['tomorrow', 'week', 'month'],
    today: ['tomorrow', 'week', 'month'],
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

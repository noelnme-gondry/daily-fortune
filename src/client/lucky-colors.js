import T from '../content/text.js';
import { EL_SLUG } from '../engine/core.js';
import { LUCKY_BANNERS, LUCKY_BANNER_SIZE } from '../content/lucky-banners.js';
import { chartColorPalettes } from '../domain/lucky-colors.js';
import { tr } from '../i18n/runtime.js';
import { term, elementName } from '../i18n/terms.js';
import { esc } from '../site/util.js';

export function chartColors(chart) {
  const palettes = chartColorPalettes(chart);
  if (!palettes.length) return '';
  return `<section class="lucky-colors card" aria-label="${tr('나의 행운의 색', 'Your symbolic colors')}">
    <h3>${tr('나의 행운의 색', 'Your symbolic colors')}</h3>
    <dl class="lucky-palettes">${palettes.map(({ role, element, colorIndices }) => `<div class="lucky-palette el-${element}"><dt>${term(role === 'yong' ? '용신' : '희신')} · ${elementName(element)}</dt><dd>${colorIndices.map(i => esc(T.element[element].color[i])).join(' · ')}</dd></div>`).join('')}</dl>
    <p class="hint">${tr('용신·희신 오행에 연결된 전통 상징색입니다. 색이나 물건이 운세 점수를 바꾸지는 않습니다.', 'These traditional colors correspond to your balancing and supporting elements. Colors and objects do not change your fortune scores.')}</p>
  </section>`;
}

export function luckyBanner(palettes, banners = LUCKY_BANNERS) {
  if (!palettes.length) return '';
  // 기간 운세는 결과의 행운 오행, 평생운·만세력은 원국의 용신 배너를 사용한다.
  const { element, role } = palettes[0];
  const slug = EL_SLUG[element], banner = banners[slug];
  const configured = Number.isInteger(banner?.id) && banner.id > 0 && typeof banner.trackingCode === 'string' && banner.trackingCode.trim();
  const { maxWidth, height } = LUCKY_BANNER_SIZE;
  const config = configured ? { ...banner, template: banner.template || 'carousel', width: '100%', height: String(height), bordered: false, tsource: '' } : null;
  return `<section class="lucky-banner" aria-label="${tr('행운의 색 소품', 'Accessories in your symbolic colors')}" data-banner-state="${configured ? 'ready' : 'pending'}" style="--lucky-banner-max-width:${maxWidth}px;--lucky-banner-height:${height}px">
    ${configured ? `<p class="ad-label">${tr('광고 · 쿠팡 파트너스', 'Advertisement · Coupang Partners')}</p><p class="partner-ad-disclosure">${tr('이 영역은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.', 'This section is part of Coupang Partners. We may earn a commission from purchases made through this banner.')}</p>` : ''}
    <div class="lucky-banner-heading"><h3>${tr('이 색 계열을 담은 일상 소품', 'Everyday accessories in this color palette')}</h3><p>${role === 'yong' ? `${term('용신')} · ` : ''}${elementName(element)} · ${T.element[element].color.map(esc).join(' · ')}</p></div>
    <div class="lucky-banner-slot" data-lucky-banner-slot="${slug}"${config ? ` data-partner-ad-config="${esc(JSON.stringify(config))}"` : ''}>${configured ? '' : `<p>${tr('색에 어울리는 소품을 준비하고 있어요.', 'Accessories in these colors are coming soon.')}</p>`}</div>
  </section>`;
}

import { attr } from './util.js';

// 모바일·PC에서 같은 쿠팡 다이나믹 배너 하나를 사용하는 공통 지면.
export const PARTNER_AD_SIZE = Object.freeze({ width: '100%', height: 140 });
const BANNER = { id: 1039151, template: 'carousel', trackingCode: 'AF3219545', width: PARTNER_AD_SIZE.width, height: String(PARTNER_AD_SIZE.height), bordered: false, tsource: '' };

export function partnerAdSlot(page) {
  if (page.noAds || page.noindex) return '';
  const { height } = PARTNER_AD_SIZE;
  return `<aside class="partner-ad" aria-label="광고">
  <div class="partner-ad-inner wrap" style="--partner-ad-height:${height}px">
    <p class="ad-label">광고 · 쿠팡 파트너스</p>
    <p class="partner-ad-disclosure">이 배너는 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.</p>
    <div class="partner-ad-slot" data-partner-ad-slot="common" data-partner-ad-config="${attr(JSON.stringify(BANNER))}"></div>
  </div>
</aside>`;
}

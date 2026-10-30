import { tr } from '../i18n/runtime.js';
import { allowsAds } from './ad-policy.js';

// 일반 광고는 Adsterra 한 개로 교체하고, 결과의 행운 상품 쿠팡은 별도 유지한다.
export const PARTNER_AD_SIZE = Object.freeze({ width: '100%', height: 140 });

export function partnerAdSlot(page) {
  if (!allowsAds(page)) return '';
  const { height } = PARTNER_AD_SIZE;
  return `<aside class="partner-ad" aria-label="${tr('광고', 'Advertisement')}">
  <div class="partner-ad-inner wrap" style="--partner-ad-height:${height}px">
    <p class="ad-label">${tr("광고 · Adsterra", "Advertisement · Adsterra")}</p>
    <p class="partner-ad-disclosure">${tr("Adsterra에서 제공하는 디스플레이 광고입니다.", "Display advertising provided by Adsterra.")}</p>
    <div class="partner-ad-slot" data-partner-ad-slot="common" data-ad-provider="adsterra"></div>
  </div>
</aside>`;
}

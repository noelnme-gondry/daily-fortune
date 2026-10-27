import { EL_SLUG } from '../engine/core.js';

export const LUCKY_BANNER_SIZE = Object.freeze({ maxWidth: 784, height: 250 });

// 상품 선택·노출 개수·회전은 해당 배너의 쿠팡 설정을 따른다.
const bannerIds = { wood: 1043704, fire: 1043702, earth: 1043705, metal: 1043706, water: 1043707 };
export const LUCKY_BANNERS = Object.freeze(Object.fromEntries(EL_SLUG.map(slug => [slug, Object.freeze({
  id: bannerIds[slug], template: 'carousel', trackingCode: 'AF3219545',
})])));

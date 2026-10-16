// 화면·검색 메타데이터·공유 이미지가 함께 사용하는 브랜드 정보.
import { bilingual } from '../i18n/runtime.js';

export const BRAND = bilingual({
  name: 'make your own day',
  alt: '메이크 유어 오운 데이',
  descriptor: '무료 사주 · 오늘의 운세 · 궁합',
  logo: '/brand/logo-128.png',
}, {
  name: 'K-Fortune',
  alt: 'Korean Saju Fortune',
  descriptor: 'Free Korean saju, daily fortune & compatibility',
});

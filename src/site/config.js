// 배포 환경 변수 (Railway Variables에서 설정)
const env = (k, d = '') => (typeof process !== 'undefined' && process.env && process.env[k] !== undefined ? process.env[k] : d);

export function config() {
  const adClient = env('ADSENSE_CLIENT', 'ca-pub-3073450406371629').trim();
  const adsOn = adClient && adClient !== 'off';
  return {
    gaId: /^G-[A-Z0-9]+$/i.test(env('GA_MEASUREMENT_ID').trim()) ? env('GA_MEASUREMENT_ID').trim() : '',
    adsense: adsOn ? {
      client: adClient,
      pub: adClient.replace(/^ca-/, ''),
      slots: { inline: env('ADSENSE_SLOT_INLINE').trim(), bottom: env('ADSENSE_SLOT_BOTTOM').trim() },
    } : null,
    naverVerify: env('NAVER_SITE_VERIFICATION', 'b8891c3ebeb248742c25823689dcdb21019a7363').trim(),
    googleVerify: env('GOOGLE_SITE_VERIFICATION').trim(),
  };
}

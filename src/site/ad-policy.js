// 탐색·운영 안내 화면에는 광고를 게재하지 않는다. 언어판도 같은 정책을 쓴다.
const AD_FREE_PATHS = new Set([
  '/about/', '/privacy/', '/contact/', '/editorial/', '/year/', '/saju/',
  '/saju/ilju/', '/saju/ilgan/', '/saju/sipsin/', '/saju/ohaeng/', '/saju/sinsal/',
]);
export function allowsAds(page) {
  const path = page.path.replace(/^\/en(?=\/)/, '');
  return !page.noAds && !page.noindex && !AD_FREE_PATHS.has(path) && !path.startsWith('/guides/');
}

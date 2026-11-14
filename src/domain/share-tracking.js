// 공유 채널은 전송 직전에 붙인다. 개인 입력·결과는 UTM 값에 사용하지 않는다.
export function trackedShareUrl(value, method, kind = 'page') {
  const url = new URL(value);
  url.searchParams.set('utm_source', method);
  url.searchParams.set('utm_medium', 'share');
  url.searchParams.set('utm_campaign', kind);
  return url.href;
}

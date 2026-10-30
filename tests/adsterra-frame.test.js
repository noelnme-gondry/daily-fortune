import test from 'node:test';
import assert from 'node:assert/strict';
import { handleAdsterraFrame } from '../src/site/adsterra-frame.js';
import { ADSTERRA_FORMATS, ADSTERRA_FRAME_ORIGIN, adsterraSource } from '../src/domain/adsterra.js';
import { DEFAULT_SITE_URL } from '../src/site/util.js';

const adHost = new URL(ADSTERRA_FRAME_ORIGIN).host;
function request(url, host = adHost, method = 'GET') {
  const result = { headers: {}, setHeader(name, value) { this.headers[name] = value; }, end(body) { this.body = body; } };
  result.handled = handleAdsterraFrame({ url, method, headers: { host } }, result);
  return result;
}

test('광고 전용 호스트에서 발급 규격만 실행하며 부모 출처를 제한한다', () => {
  for (const [format, size] of Object.entries(ADSTERRA_FORMATS)) {
    const res = request(`/ad-frame/${format}`);
    assert.equal(res.statusCode, 200);
    assert.ok(res.body.includes(size.key));
    assert.equal(res.headers['Cache-Control'], 'no-store');
    assert.ok(res.headers['Content-Security-Policy'].startsWith(`frame-ancestors ${DEFAULT_SITE_URL} https://www.`));
    assert.notEqual(new URL(adsterraSource(format)).origin, DEFAULT_SITE_URL);
    assert.equal(request(`/ad-frame/${format}`, adHost, 'HEAD').body, '');
  }
});

test('앱·미리보기 호스트, 입력 쿼리, 미발급 규격에서는 SDK를 실행하지 않는다', () => {
  for (const host of [new URL(DEFAULT_SITE_URL).host, 'localhost', 'preview.up.railway.app', `${adHost}.evil.example`]) {
    const res = request('/ad-frame/compact', host);
    assert.equal(res.statusCode, 404);
    assert.doesNotMatch(res.body, /script/);
  }
  for (const path of ['/ad-frame/constructor', '/ad-frame/__proto__', '/ad-frame/unknown', '/ad-frame/compact?name=private']) assert.equal(request(path).statusCode, 404);
  assert.equal(request('/ad-frame/compact', adHost, 'POST').statusCode, 405);
  assert.equal(request('/today/').handled, false);
});

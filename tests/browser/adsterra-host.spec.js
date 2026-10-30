import { test, expect } from '@playwright/test';
import { ADSTERRA_FORMATS, ADSTERRA_FRAME_ORIGIN, ADSTERRA_SANDBOX, adsterraSource } from '../../src/domain/adsterra.js';
import { DEFAULT_SITE_URL } from '../../src/site/util.js';

test('실제 광고 문서 응답은 내부 프레임 쓰기를 허용하고 부모 입력을 차단한다', async ({ page, baseURL, request }) => {
  const sdkRequests = [];
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.origin === DEFAULT_SITE_URL || url.origin === 'https://untrusted.example') return route.fulfill({ contentType: 'text/html', body: '<!doctype html><body>Private app fixture</body>' });
    if (url.origin === ADSTERRA_FRAME_ORIGIN) {
      const response = await request.get(`${baseURL}${url.pathname}`, { headers: { host: url.host }, maxRedirects: 0 });
      expect(response.status()).toBe(200);
      return route.fulfill({ response });
    }
    if (url.origin === 'https://bauval.org') {
      sdkRequests.push({ url: url.href, referrer: route.request().headers().referer || '' });
      return route.fulfill({ contentType: 'application/javascript', body: `"use strict";const options=window.atOptions;delete window.atOptions;const f=document.createElement('iframe');f.width=options.width;f.height=options.height;document.body.append(f);f.contentWindow.document.open();f.contentWindow.document.write('<body>Nested creative</body>');f.contentWindow.document.close();` });
    }
    return route.abort();
  });
  await page.goto(`${DEFAULT_SITE_URL}/today/?name=private#private-birth`);
  for (const format of Object.keys(ADSTERRA_FORMATS)) {
    await page.evaluate(({ src, sandbox }) => {
      document.querySelector('iframe')?.remove();
      const f = document.createElement('iframe'); f.src = src; f.sandbox = sandbox; f.referrerPolicy = 'origin'; document.body.append(f);
    }, { src: adsterraSource(format), sandbox: ADSTERRA_SANDBOX });
    await expect(page.frameLocator('iframe').frameLocator('iframe').getByText('Nested creative')).toBeVisible();
    const frame = page.frames().find(f => f.url() === adsterraSource(format));
    expect(await frame.evaluate(() => {
      let documentBlocked = false, storageBlocked = false;
      try { void window.parent.document.body; } catch { documentBlocked = true; }
      try { void window.parent.localStorage.length; } catch { storageBlocked = true; }
      return { documentBlocked, storageBlocked, referrer: document.referrer };
    })).toEqual({ documentBlocked: true, storageBlocked: true, referrer: `${DEFAULT_SITE_URL}/` });
  }
  expect(sdkRequests).toHaveLength(Object.keys(ADSTERRA_FORMATS).length);
  expect(JSON.stringify(sdkRequests)).not.toContain('private');
  for (const r of sdkRequests) expect(['', `${ADSTERRA_FRAME_ORIGIN}/`]).toContain(r.referrer);
  const denied = await request.get(`${baseURL}/ad-frame/compact`);
  expect(denied.status()).toBe(404);
  expect(await denied.text()).not.toContain('script');
  await page.goto('https://untrusted.example/');
  const blocked = page.waitForEvent('console', { predicate: message => /frame-ancestors/.test(message.text()) });
  await page.evaluate(src => { const f = document.createElement('iframe'); f.src = src; document.body.append(f); }, adsterraSource('compact'));
  await blocked;
  expect(sdkRequests).toHaveLength(Object.keys(ADSTERRA_FORMATS).length);
});

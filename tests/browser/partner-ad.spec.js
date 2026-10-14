import { test, expect } from '@playwright/test';

test.beforeEach(async ({ context }) => {
  await context.route('https://**/*', (route) => route.abort());
  // 외부 광고 실적을 발생시키지 않고 공식 생성자의 입력·삽입 위치를 검증한다.
  await context.route('https://ads-partners.coupang.com/g.js', (route) => route.fulfill({
    contentType: 'application/javascript',
    body: `window.PartnersCoupang = { G: function(options) {
      window.partnerCalls = (window.partnerCalls || 0) + 1;
      window.partnerConfig = { ...options, container: undefined };
      const frame = document.createElement('iframe');
      frame.width = options.width; frame.height = options.height;
      const wrapper = document.createElement('ins');
      wrapper.append(frame);
      options.container.append(wrapper);
    } };`,
  }));
  await context.addInitScript(() => {
    window.adEvents = [];
    window.gtag = (...args) => window.adEvents.push(args);
  });
});

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`${width}px 화면에서 공통 배너는 본문 폭에 맞는 높이 140px 지면이다`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ['/', '/today/', '/tti/']) {
      await page.goto(path);
      const slot = page.locator('[data-partner-ad-slot="common"]');
      await expect(slot).toHaveCount(1);
      await expect(slot).toHaveAttribute('data-ad-state', 'initialized');
      await expect(page.locator('main + .partner-ad + .site-foot')).toBeVisible();
      const box = await slot.boundingBox();
      const expectedWidth = Math.min(width, 1160) - 32;
      expect(box.width).toBe(expectedWidth);
      expect(box.height).toBe(140);
      expect(box.x).toBe((width - expectedWidth) / 2);
      expect(box.x + box.width).toBeLessThanOrEqual(width);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      await expect(slot.locator('iframe')).toHaveCount(1);
      await expect(slot.locator('iframe')).toHaveAttribute('title', '쿠팡 파트너스 상품 광고');
      const frameBox = await slot.locator('iframe').boundingBox();
      expect(frameBox.width).toBe(expectedWidth);
      expect(frameBox.height).toBe(140);
      expect(await slot.boundingBox()).toEqual(box);
    }
  });
}

test('화면 폭을 줄여도 배너를 다시 요청하지 않고 지면과 iframe이 함께 줄어든다', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/today/');
  const slot = page.locator('[data-partner-ad-slot="common"]');
  await expect(slot).toHaveAttribute('data-ad-state', 'initialized');
  await page.setViewportSize({ width: 390, height: 844 });
  expect((await slot.boundingBox()).width).toBe(358);
  expect((await slot.locator('iframe').boundingBox()).width).toBe(358);
  expect(await page.evaluate(() => window.partnerCalls)).toBe(1);
});

test('띠 메뉴의 부분 이동에도 기존 광고 지면을 중복 생성하거나 교체하지 않는다', async ({ page }) => {
  await page.goto('/tti/');
  const slot = page.locator('[data-partner-ad-slot="common"]');
  await slot.evaluate((el) => el.setAttribute('data-test-instance', 'original'));
  const next = page.locator('.tti-nav a:not([aria-current])').first();
  const href = await next.getAttribute('href');
  await next.click();
  await expect(page).toHaveURL(new RegExp(`${href}$`));
  await expect(slot).toHaveCount(1);
  await expect(slot).toHaveAttribute('data-test-instance', 'original');
  expect(await page.evaluate(() => window.partnerCalls)).toBe(1);
});

const slotEvents = (page) => page.evaluate(() => window.adEvents.filter((e) => e[1] === 'ad_slot_view'));
async function showFraction(page, fraction) {
  await page.locator('[data-partner-ad-slot]').evaluate((el, fraction) => {
    const box = el.getBoundingClientRect();
    window.scrollTo(0, window.scrollY + box.top - window.innerHeight + box.height * fraction);
  }, fraction);
  // IntersectionObserver가 스크롤 후 레이아웃을 관찰할 기회를 준다.
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

test('발급 코드로 한 번만 초기화하고 절반 이상 노출 시 개인정보 없이 한 번 전송한다', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/today/?name=private-name#private-birth');
  await expect(page.locator('[data-partner-ad-slot]')).toHaveAttribute('data-ad-state', 'initialized');
  expect(await page.evaluate(() => window.partnerConfig)).toEqual({ id: 1039151, template: 'carousel', trackingCode: 'AF3219545', width: '100%', height: '140', bordered: false, tsource: '' });
  expect(await slotEvents(page)).toHaveLength(0);
  await showFraction(page, 0.4);
  expect(await slotEvents(page)).toHaveLength(0);
  await showFraction(page, 0.6);
  await expect.poll(async () => (await slotEvents(page)).length).toBe(1);
  const event = (await slotEvents(page))[0];
  expect(event.slice(0, 2)).toEqual(['event', 'ad_slot_view']);
  expect(event[2]).toEqual({ ad_provider: 'coupang', ad_slot: 'common', page_path: '/today/', page_location: 'http://127.0.0.1:4176/today/', page_title: await page.title() });
  expect(JSON.stringify(event)).not.toContain('private');
  await showFraction(page, 0);
  await showFraction(page, 0.8);
  expect(await slotEvents(page)).toHaveLength(1);
  expect(await page.evaluate(() => window.partnerCalls)).toBe(1);
});

test('띠 부분 이동의 새 경로는 측정하고 뒤로가기는 중복 측정하지 않는다', async ({ page }) => {
  await page.goto('/tti/');
  await showFraction(page, 0.6);
  await expect.poll(async () => (await slotEvents(page)).length).toBe(1);
  const next = page.locator('.tti-nav a:not([aria-current])').first();
  const href = await next.getAttribute('href');
  await next.click();
  await expect(page).toHaveURL(new RegExp(`${href}$`));
  await showFraction(page, 0.6);
  await expect.poll(async () => (await slotEvents(page)).length).toBe(2);
  expect((await slotEvents(page)).map((e) => e[2].page_path)).toEqual(['/tti/', href]);
  await page.goBack();
  await expect(page).toHaveURL(/\/tti\/$/);
  await showFraction(page, 0.6);
  expect(await slotEvents(page)).toHaveLength(2);
  expect(await page.evaluate(() => window.partnerCalls)).toBe(1);
});

test('비활성 탭은 집계하지 않고 활성화되면 보이는 지면을 집계한다', async ({ page }) => {
  await page.addInitScript(() => {
    window.testTabVisible = false;
    Object.defineProperty(document, 'visibilityState', { get: () => window.testTabVisible ? 'visible' : 'hidden' });
  });
  await page.goto('/today/');
  await showFraction(page, 0.6);
  expect(await slotEvents(page)).toHaveLength(0);
  await page.evaluate(() => { window.testTabVisible = true; document.dispatchEvent(new window.Event('visibilitychange')); });
  await expect.poll(async () => (await slotEvents(page)).length).toBe(1);
});

test('광고 로드 실패·GA 미설정에서도 운세를 계산하고 공유·404는 배너를 요청하지 않는다', async ({ page, context }) => {
  let requests = 0;
  await context.route('https://ads-partners.coupang.com/g.js', (route) => { requests++; return route.abort(); });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/today/');
  await expect(page.locator('[data-partner-ad-slot]')).toHaveAttribute('data-ad-state', 'unavailable');
  await showFraction(page, 0.6);
  await expect.poll(async () => (await slotEvents(page)).length).toBe(1);
  await page.evaluate(() => { delete window.gtag; });
  await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
  await page.locator('#a-y').selectOption('1993');
  await page.locator('#a-m').selectOption('1');
  await page.locator('#a-d').selectOption('28');
  await page.locator('#a-notime').check();
  await page.locator('button[type="submit"]').click();
  await expect(page.locator('#result .chart-card')).toBeVisible();
  await page.goto('/share/');
  await expect(page.locator('[data-partner-ad-slot]')).toHaveCount(0);
  await page.goto('/not-a-page/');
  await expect(page.locator('[data-partner-ad-slot]')).toHaveCount(0);
  expect(requests).toBe(1);
  expect(errors).toEqual([]);
});

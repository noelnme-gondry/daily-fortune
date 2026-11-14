import { completeProfile, editProfile } from './helpers/profile.js';
import { isoDate, todayKST } from '../../src/engine/core.js';
import { test, expect } from '@playwright/test';
import { AD_LAYOUT, AD_POSITION_EXPERIMENT } from '../../src/domain/ad-experiment.js';

test.beforeEach(async ({ context }) => {
  await context.route('https://**/*', (route) => route.abort());
  // 외부 광고 실적을 발생시키지 않고 공식 생성자의 입력·삽입 위치를 검증한다.
  await context.route('https://ads-partners.coupang.com/g.js', (route) => route.fulfill({
    contentType: 'application/javascript',
    body: `window.PartnersCoupang = { G: function(options) {
      if (options.container.dataset.partnerAdSlot === 'common') {
        window.partnerCalls = (window.partnerCalls || 0) + 1;
        window.partnerConfig = { ...options, container: undefined };
      }
      const frame = document.createElement('iframe');
      frame.width = options.width; frame.height = options.height;
      frame.src = 'https://ads-partners.coupang.com/mock-banner?id=' + options.id;
      const wrapper = document.createElement('ins');
      wrapper.append(frame);
      options.container.append(wrapper);
    } };`,
  }));
  await context.route('https://ads-partners.coupang.com/mock-banner?*', route => route.fulfill({
    contentType: 'text/html', body: '<!doctype html><body>Test Coupang ad</body>',
  }));
  await context.addInitScript((key) => {
    if (window.top !== window) return;
    try { if (!localStorage.getItem(key)) localStorage.setItem(key, 'A'); } catch { /* 저장 차단 테스트 */ }
    window.adEvents = [];
    window.gtag = (...args) => window.adEvents.push(args);
  }, AD_POSITION_EXPERIMENT.storageKey);
});

async function adGeometry(page, context) {
  return page.locator('[data-partner-ad-slot="common"]').evaluate((slot, context) => {
    const inner = slot.parentElement, ad = inner.parentElement;
    const style = window.getComputedStyle(inner);
    const left = parseFloat(style.getPropertyValue('--ad-safe-left')) || 0;
    const right = parseFloat(style.getPropertyValue('--ad-safe-right')) || 0;
    const box = element => element?.getBoundingClientRect().toJSON() || null;
    return {
      path: location.pathname, context, viewport: window.innerWidth, clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth, parentWidth: ad.parentElement.clientWidth,
      safeInsets: { left, right }, safeWidth: ad.getBoundingClientRect().width - left - right,
      padding: { left: parseFloat(style.paddingLeft), right: parseFloat(style.paddingRight) },
      slotClientWidth: slot.clientWidth, slot: box(slot), ad: box(ad), frame: box(slot.querySelector('iframe')),
      format: slot.dataset.adFormat, state: slot.dataset.adState, iframeCount: slot.querySelectorAll('iframe').length,
      mainPadding: window.getComputedStyle(document.querySelector('main')).paddingInline,
      formPadding: document.querySelector('.pform') ? window.getComputedStyle(document.querySelector('.pform')).paddingInline : null,
    };
  }, context);
}

async function recordGeometry(testInfo, rows) {
  await testInfo.attach('ad-geometry', { body: JSON.stringify(rows, null, 2), contentType: 'application/json' });
}

test('기존 B 저장값이 있어도 공통 광고는 결과 끝으로 내려가고 행운색 광고와 간격을 확보한다', async ({ page }) => {
  await page.addInitScript((key) => localStorage.setItem(key, 'B'), AD_POSITION_EXPERIMENT.storageKey);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/today/');
  await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
  await completeProfile(page);
  await page.locator('button[type="submit"]').click();
  await expect(page.locator('#tool + .partner-ad')).toHaveCount(1);
  await expect(page.locator('[data-partner-ad-slot]')).not.toBeInViewport();
  const bounds = await page.evaluate(() => ({
    result: document.querySelector('#result').getBoundingClientRect().bottom,
    lucky: document.querySelector('.lucky-banner').getBoundingClientRect().bottom,
    ad: document.querySelector('.partner-ad').getBoundingClientRect().top,
  }));
  expect(bounds.ad).toBeGreaterThanOrEqual(bounds.result);
  expect(bounds.ad - bounds.lucky).toBeGreaterThanOrEqual(24);
});

for (const width of [320, 360, 375, 390, 412, 768, 1024, 1440]) {
  test(`${width}px 화면에서 공통 배너는 화면 폭에 맞는 쿠팡 배너 하나를 표시한다`, async ({ page }, testInfo) => {
    const rows = [];
    await page.setViewportSize({ width, height: 900 });
    for (const path of ['/', '/today/', '/lifetime/', '/compatibility/', '/tojeong/', '/tti/', '/en/today/']) {
      await page.goto(path);
      const slot = page.locator('[data-partner-ad-slot="common"]');
      await expect(slot).toHaveCount(1);
      await expect(slot).toHaveAttribute('data-ad-state', 'initialized');
      // 공개 예시는 main 안에 있고, 공통 광고는 main 바로 다음이다.
      await expect(page.locator('main + .partner-ad')).toBeVisible();
      const box = await slot.boundingBox();
      const expectedWidth = Math.min(width, 1440) - 32;
      expect(box.width).toBe(expectedWidth);
      expect(box.height).toBeCloseTo(250, 2);
      expect(box.x).toBe((width - expectedWidth) / 2);
      expect(box.x + box.width).toBeLessThanOrEqual(width);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      await expect(slot.locator('iframe')).toHaveCount(1);
      await expect(slot.locator('iframe')).toHaveAttribute('title', path.startsWith('/en/') ? 'Coupang Partners product advertisement' : '쿠팡 파트너스 상품 광고');
      const frameBox = await slot.locator('iframe').boundingBox();
      expect(frameBox.width).toBe(expectedWidth);
      expect(frameBox.height).toBeCloseTo(250, 2);
      expect(await slot.boundingBox()).toEqual(box);
      rows.push(await adGeometry(page, 'before-result'));
    }
    await calculateResult(page, '/today/');
    const slot = page.locator('[data-partner-ad-slot]');
    await expect(slot).toHaveAttribute('data-ad-state', 'initialized');
    const geometry = await adGeometry(page, 'result-A');
    expect(geometry.frame.x).toBeGreaterThanOrEqual(0);
    expect(geometry.frame.right).toBeLessThanOrEqual(geometry.clientWidth);
    expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.clientWidth);
    expect(geometry.mainPadding).toBe('16px');
    expect(geometry.formPadding).toBe('20px');
    rows.push(geometry);
    await recordGeometry(testInfo, rows);
  });
}

test('화면 폭을 바꿔도 반응형 쿠팡 배너를 재생성하지 않는다', async ({ page }) => {
  await page.goto('/today/');
  const slot = page.locator('[data-partner-ad-slot="common"]'), frame = slot.locator('iframe');
  await expect(slot).toHaveAttribute('data-ad-state', 'initialized');
  await frame.evaluate(el => el.dataset.instance = 'original');
  for (const width of [1440, 390, 320, 319, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(frame).toHaveCount(1);
    await expect(frame).toHaveAttribute('width', '100%');
    await expect(frame).toHaveAttribute('data-instance', 'original');
    const box = await slot.boundingBox();
    expect((await frame.boundingBox()).width).toBe(box.width);
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(width);
  }
  expect(await page.evaluate(() => window.partnerCalls)).toBe(1);
});

async function calculateResult(page, path, variant = 'A') {
  await page.goto(path);
  const tojeong = /^\/(?:en\/)?tojeong\//.test(path);
  await expect(page.locator(tojeong ? '#tojeong-tool' : '#tool')).toHaveAttribute('data-ready', 'true');
  await completeProfile(page);
  await page.locator('button[type="submit"]').click();
  await expect(page.locator('#tool + .partner-ad, #tojeong-tool + .partner-ad')).toHaveCount(1);
  await expect(page.locator('[data-share-page]')).toHaveCount(0);
  if (/^\/(?:en\/)?saju-ranking\//.test(path)) {
    await page.getByRole('button', { name: /^(내 순위 공개|Reveal my rank)$/ }).click();
  }
  await expect(page.getByRole('button', { name: /^(링크 복사|Copy link)$/ })).toHaveCount(1);
}

for (const variant of ['A', 'B']) {
  test(`320px ${variant}: 모든 주요 결과·재계산·복원·회전에서 반응형 구좌를 유지한다`, async ({ page }, testInfo) => {
    await page.addInitScript(({ key, variant }) => localStorage.setItem(key, variant), { key: AD_POSITION_EXPERIMENT.storageKey, variant });
    await page.setViewportSize({ width: 320, height: 844 });
    const rows = [];
    for (const path of ['/today/', '/lifetime/', '/compatibility/', '/tojeong/', '/en/today/', '/en/tojeong/']) {
      await calculateResult(page, path, variant);
      const slot = page.locator('[data-partner-ad-slot]'), frame = slot.locator('iframe');
      await expect(slot).toHaveAttribute('data-ad-state', 'initialized');
      await expect(frame).toHaveCount(1);
      await expect(slot).not.toBeInViewport();
      await frame.scrollIntoViewIfNeeded();
      await expect(page.frameLocator('[data-partner-ad-slot] iframe').getByText('Test Coupang ad')).toBeVisible();
      const isolated = await frame.elementHandle().then(handle => handle.contentFrame());
      await isolated.evaluate(() => { window.mobileSentinel = 'retained'; });
      const geometry = await adGeometry(page, `result-${variant}`);
      expect(geometry.slot.width).toBe(288);
      expect(geometry.frame.width).toBe(288);
      expect(geometry.frame.height).toBe(250);
      expect(geometry.frame.x).toBe(16);
      expect(geometry.scrollWidth).toBe(320);
      rows.push(geometry);
      if (!path.includes('/tojeong/')) await editProfile(page);
      await page.locator(path.includes('/tojeong/') ? '#tj-d' : '#a-d').selectOption('2');
      await page.locator('button[type="submit"]').click();
      expect(await isolated.evaluate(() => window.mobileSentinel)).toBe('retained');
      await expect(frame).toHaveCount(1);
      await page.reload();
      await expect(page.locator('#tool + .partner-ad, #tojeong-tool + .partner-ad')).toHaveCount(1);
      await expect(frame).toHaveAttribute('width', '100%');
      rows.push(await adGeometry(page, `restored-${variant}`));
    }
    for (const width of [844, 319, 320]) {
      await page.setViewportSize({ width, height: width === 844 ? 320 : 844 });
      const slot = page.locator('[data-partner-ad-slot]');
      await expect(slot).toHaveAttribute('data-ad-state', 'initialized');
      await expect(slot.locator('iframe')).toHaveCount(1);
      rows.push(await adGeometry(page, `rotated-${variant}`));
    }
    await recordGeometry(testInfo, rows);
  });
}

test('부모·safe-area·스크롤바로 폭이 줄어도 배너는 지면 안에 유지된다', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 360, height: 844 });
  await page.goto('/tti/');
  const slot = page.locator('[data-partner-ad-slot]'), frame = slot.locator('iframe');
  await expect(slot).toHaveAttribute('data-ad-state', 'initialized');
  await frame.evaluate(el => el.dataset.instance = 'original');
  await page.locator('.partner-ad-inner').evaluate(el => {
    el.style.setProperty('--ad-safe-left', '30px');
    el.style.setProperty('--ad-safe-right', '11px');
  });
  const geometry = await adGeometry(page, 'safe-area');
  expect(geometry.frame.x).toBe(30);
  expect(geometry.frame.right).toBe(344);
  expect(geometry.frame.width).toBe(geometry.slot.width);
  const rows = [geometry];
  await page.locator('.partner-ad-inner').evaluate(el => {
    el.style.setProperty('--ad-safe-left', '0px');
    el.style.setProperty('--ad-safe-right', '0px');
  });
  await page.locator('.partner-ad').evaluate(el => { el.style.width = '319.75px'; });
  const fractional = await adGeometry(page, 'fractional-parent');
  expect(fractional.slot.width).toBe(287.75);
  expect(fractional.frame.width).toBe(fractional.slot.width);
  rows.push(fractional);
  await page.locator('.partner-ad').evaluate(el => { el.style.width = ''; });
  await page.addStyleTag({ content: 'html { overflow-y: scroll; scrollbar-gutter: stable; } ::-webkit-scrollbar { width: 12px; } body { padding-right: 12px; }' });
  await page.setViewportSize({ width: 320, height: 844 });
  const gutter = await adGeometry(page, 'reserved-scrollbar-space');
  expect(gutter.frame.width).toBe(gutter.slot.width);
  expect(gutter.frame.right).toBeLessThanOrEqual(gutter.clientWidth);
  expect(gutter.scrollWidth).toBeLessThanOrEqual(320);
  rows.push(gutter);
  await expect(frame).toHaveAttribute('data-instance', 'original');
  await showFraction(page, 0.8);
  await expect.poll(async () => (await slotEvents(page)).length).toBe(1);
  expect(await page.evaluate(() => window.partnerCalls)).toBe(1);
  await recordGeometry(testInfo, rows);
});

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`${width}px 공개 예시·기능 안내는 광고 앞에 읽히고 광고와 본문이 잘리지 않는다`, async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-10-15T12:00:00+09:00'));
    await page.setViewportSize({ width, height: 900 });
    for (const path of ['/today/', '/manseryeok/', '/year/2027/', '/tojeong/2027/', '/tti/2027/', '/manseryeok/2027/']) {
      await page.goto(path);
      const slot = page.locator('[data-partner-ad-slot]');
      await expect(slot).toHaveAttribute('data-ad-state', 'initialized');
      const ad = await page.locator('.partner-ad').boundingBox();
      const additions = page.locator('#public-example, section[aria-labelledby="year-guide-title"]');
      if (await additions.count()) {
        const firstAddition = await additions.first().boundingBox();
        expect(firstAddition.y + firstAddition.height).toBeLessThanOrEqual(ad.y);
      }
      {
        const frame = await slot.locator('iframe').boundingBox();
        expect(frame.height).toBe(250);
        expect(frame.width).toBe((await slot.boundingBox()).width);
        expect(frame.x).toBeGreaterThanOrEqual(0);
        expect(frame.x + frame.width).toBeLessThanOrEqual(width);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      for (const paragraph of await page.locator('.search-supplement p, .year-options dd').all()) {
        expect(await paragraph.evaluate((el) => parseFloat(window.getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(15);
        expect(await paragraph.evaluate((el) => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
      }
      if (width <= 390 && path === '/year/2027/') {
        const cards = await page.locator('.year-option').all();
        expect(cards).toHaveLength(4);
        expect((await cards[1].boundingBox()).y).toBeGreaterThan((await cards[0].boundingBox()).y);
      }
      if (width <= 390 && path === '/manseryeok/') {
        const table = page.getByRole('region', { name: '가상 사례 원국 상세 표' });
        await table.focus();
        await page.keyboard.press('ArrowRight', { delay: 100 });
        await expect.poll(() => table.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
      }
    }
  });
}

for (const variant of ['A', 'B']) {
  test(`360px 새 예시가 있는 계산기의 ${variant} 광고는 재계산·복원 때 한 개로 유지된다`, async ({ page }) => {
    await page.addInitScript(({ key, variant }) => localStorage.setItem(key, variant), { key: AD_POSITION_EXPERIMENT.storageKey, variant });
    await page.setViewportSize({ width: 360, height: 900 });
    for (const path of ['/today/', '/tomorrow/', '/manseryeok/', '/year/2027/', '/tojeong/2027/']) {
      await calculateResult(page, path, variant);
      const slot = page.locator('[data-partner-ad-slot]');
      await expect(slot).toHaveAttribute('data-ad-state', 'initialized');
      await slot.evaluate((el) => el.setAttribute('data-test-instance', 'original'));
      const slotBox = await slot.boundingBox(), frameBox = await slot.locator('iframe').boundingBox();
      expect(frameBox.width).toBe(slotBox.width);
      expect(frameBox.height).toBe(250);
      expect(frameBox.x).toBe(slotBox.x);
      await expect(slot).not.toBeInViewport();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
      await completeProfile(page);
      await page.locator('button[type="submit"]').click();
      await expect(slot).toHaveAttribute('data-test-instance', 'original');
      expect(await page.evaluate(() => window.partnerCalls || 0)).toBe(1);
      await page.reload();
      await expect(page.locator('#tool + .partner-ad, #tojeong-tool + .partner-ad')).toHaveCount(1);
    }
  });
}

test('띠별 부분 이동에서도 해당 연도 안내만 갱신하고 기존 광고를 유지한다', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-10-15T12:00:00+09:00'));
  await page.goto('/tti/2027/');
  await page.locator('[data-partner-ad-slot]').evaluate((el) => el.setAttribute('data-test-instance', 'original'));
  for (const path of ['/tti/2026/', '/tti/today/', '/tti/2027/']) {
    await page.locator(`.tti-nav a[href="${path}"]`).click();
    await expect(page).toHaveURL(new RegExp(`${path}$`));
    await expect(page.locator('[data-partner-ad-slot]')).toHaveAttribute('data-test-instance', 'original');
    if (path === '/tti/today/') await expect(page.locator('.search-supplement')).toHaveCount(0);
    else {
      await expect(page.locator('main > .search-supplement #year-guide-title')).toContainText(path.slice(5, 9));
      await expect(page.locator('.search-supplement')).toHaveCount(1);
    }
  }
  expect(await page.evaluate(() => window.partnerCalls || 0)).toBe(1);
});

for (const width of [390, 1440]) {
  test(`${width}px 주요 결과의 하단 광고는 폼과 결과를 합친 전체 폭으로 한 개만 유지된다`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ['/today/', '/compatibility/', '/life-story/', '/saju-ranking/', '/tojeong/']) {
      await calculateResult(page, path);
      const slot = page.locator('[data-partner-ad-slot="common"]');
      await expect(slot).toHaveAttribute('data-ad-state', 'initialized');
      await expect(page.locator('main + .partner-ad')).toHaveCount(0);
      const resultBox = await page.locator('#tool, #tojeong-tool').boundingBox();
      const box = await slot.boundingBox();
      expect(box.width).toBe(resultBox.width);
      expect(box.x).toBe(resultBox.x);
      expect(box.height).toBe(250);
      expect((await slot.locator('iframe').boundingBox()).width).toBe(box.width);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      await slot.scrollIntoViewIfNeeded();
      const formBox = await page.locator('.pform').first().boundingBox();
      const visibleAd = await slot.boundingBox();
      // PC의 sticky 입력 폼도 하단 지면 위에서 멈춰 광고·고지를 가리지 않는다.
      if (formBox) expect(formBox.y + formBox.height).toBeLessThanOrEqual(visibleAd.y);
      else await expect(page.locator('.pform').first()).toBeHidden();
      if (path === '/compatibility/') await expect(page.locator('.compat-matches')).toHaveCount(1);
      await slot.evaluate((el) => el.setAttribute('data-test-instance', 'original'));
      await editProfile(page);
      await page.locator(path === '/tojeong/' ? '#tj-d' : '#a-d').selectOption('2');
      await completeProfile(page);
      await page.locator('button[type="submit"]').click();
      await expect(page.locator('#tool + .partner-ad, #tojeong-tool + .partner-ad')).toHaveCount(1);
      await expect(page.locator('[data-share-page]')).toHaveCount(0);
      await expect(slot).toHaveCount(1);
      await expect(slot).toHaveAttribute('data-test-instance', 'original');
      await expect(slot.locator('iframe')).toHaveCount(1);
      expect(await page.evaluate(() => window.partnerCalls || 0)).toBe(1);
    }
  });
}

test('저장된 결과 복원에도 결과 끝에 배너를 놓고 이동한 위치에서 도달을 한 번 측정한다', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await calculateResult(page, '/today/');
  await expect(page.locator('[data-storage-status]')).toContainText('현재 탭에만');
  await page.reload();
  await expect(page.locator('#tool + .partner-ad, #tojeong-tool + .partner-ad')).toHaveCount(1);
  expect(await slotEvents(page)).toHaveLength(0);
  await showFraction(page, 0.4);
  expect(await slotEvents(page)).toHaveLength(0);
  await showFraction(page, 0.6);
  await expect.poll(async () => (await slotEvents(page)).length).toBe(1);
  await completeProfile(page);
  await page.locator('button[type="submit"]').click();
  await showFraction(page, 0.8);
  expect(await slotEvents(page)).toHaveLength(1);
});

for (const width of [390, 1440]) {
  test(`${width}px 기존 B 저장값의 계산·재계산·복원에서도 광고는 결과 아래 한 개다`, async ({ page }) => {
    await page.addInitScript((key) => localStorage.setItem(key, 'B'), AD_POSITION_EXPERIMENT.storageKey);
    await page.setViewportSize({ width, height: 900 });
    for (const path of ['/today/', '/compatibility/', '/life-story/', '/saju-ranking/', '/tojeong/']) {
      await calculateResult(page, path, 'B');
      const slot = page.locator('[data-partner-ad-slot]');
      await expect(slot).toHaveAttribute('data-ad-state', 'initialized');
      await expect(slot).not.toBeInViewport();
      expect((await slot.boundingBox()).width).toBe((await page.locator('#tool, #tojeong-tool').boundingBox()).width);
      await slot.evaluate((el) => el.setAttribute('data-test-instance', 'original'));
      await editProfile(page);
      await page.locator(path === '/tojeong/' ? '#tj-d' : '#a-d').selectOption('2');
      await completeProfile(page);
      await page.locator('button[type="submit"]').click();
      await expect(page.locator('#tool + .partner-ad, #tojeong-tool + .partner-ad')).toHaveCount(1);
      await expect(slot).toHaveAttribute('data-test-instance', 'original');
      await expect(slot.locator('iframe')).toHaveCount(1);
      expect(await page.evaluate(() => window.partnerCalls || 0)).toBe(1);
      await page.reload();
      await expect(page.locator('#tool + .partner-ad, #tojeong-tool + .partner-ad')).toHaveCount(1);
    }
  });
}

test('문서 이동에도 새 결과 하단 배치를 적용하고 일반 페이지는 결과 배치에서 구분한다', async ({ page }) => {
  await page.goto('/today/');
  await page.evaluate((key) => localStorage.setItem(key, 'B'), AD_POSITION_EXPERIMENT.storageKey);
  await page.reload();
  await expect(page.locator('#tool')).toHaveAttribute('data-ad-layout', AD_LAYOUT.id);
  await page.goto('/tomorrow/');
  await expect(page.locator('#tool')).toHaveAttribute('data-ad-layout', AD_LAYOUT.id);
  await page.goto('/tojeong/');
  await expect(page.locator('#tojeong-tool')).toHaveAttribute('data-ad-layout', AD_LAYOUT.id);
  await page.goto('/');
  await expect(page.locator('#tool')).toHaveAttribute('data-ad-layout', AD_LAYOUT.id);
  await page.goto('/about/');
  await expect(page.locator('[data-ad-variant], [data-partner-ad-slot]')).toHaveCount(0);
  await page.goto('/tti/');
  await expect(page.locator('[data-ad-variant]')).toHaveCount(0);
  await showFraction(page, 0.8);
  await expect.poll(async () => (await slotEvents(page)).length).toBe(1);
  expect((await slotEvents(page))[0][2]).not.toHaveProperty('experiment_id');
});

test('홈 계산 결과는 새 하단 배치로 복원하고 과거 배정 저장값과 실험 기록을 보존한다', async ({ page }) => {
  await page.addInitScript((key) => localStorage.setItem(key, 'B'), AD_POSITION_EXPERIMENT.storageKey);
  await page.goto('/');
  await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
  await completeProfile(page);
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/today\/$/);
  await expect(page.locator('#tool + .partner-ad')).toHaveCount(1);
  expect(await page.evaluate(() => window.adEvents.some(e => e[1] === 'ad_experiment_exposure'))).toBe(false);
  expect(await page.evaluate(key => localStorage.getItem(key), AD_POSITION_EXPERIMENT.storageKey)).toBe('B');
});

test('브라우저·탭 저장이 모두 막혀도 새 하단 배치와 계산이 유지된다', async ({ page }) => {
  await page.addInitScript(() => {
    for (const name of ['localStorage', 'sessionStorage']) Object.defineProperty(window, name, { get() { throw new Error('storage blocked'); } });
    Math.random = () => 0.75;
  });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/today/');
  await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
  for (const day of ['2', '3']) {
    await editProfile(page);
    await page.locator('#a-d').selectOption(day);
    await completeProfile(page);
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('#tool + .partner-ad')).toHaveCount(1);
    await expect(page.locator('#result .chart-card')).toBeAttached();
  }
  expect(await page.evaluate(() => window.adEvents.find((e) => e[1] === 'calc_result')?.[2])).toMatchObject({ ad_layout_version: AD_LAYOUT.id, ad_placement: AD_LAYOUT.placement });
  expect(errors).toEqual([]);
});

for (const variant of ['A', 'B']) {
  test(`기존 ${variant}: 광고·결과 도달을 구분하고 계산·공유에 새 배치 버전을 붙인다`, async ({ page }) => {
    await page.addInitScript(({ key, variant }) => localStorage.setItem(key, variant), { key: AD_POSITION_EXPERIMENT.storageKey, variant });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/today/?name=private-name#private-birth');
    await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
    await showFraction(page, 0.8);
    expect(await slotEvents(page)).toHaveLength(0);
    expect(await page.evaluate(() => window.adEvents.filter((e) => e[1] === 'ad_experiment_exposure'))).toHaveLength(0);
    await completeProfile(page);
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('#result .chart-card')).toBeAttached();
    await page.locator('[data-result-summary] [data-result-heading]').scrollIntoViewIfNeeded();
    await expect.poll(() => page.evaluate(() => window.adEvents.filter((e) => e[1] === 'result_view').length)).toBe(1);
    // 계산 후 자동 스크롤과 충돌하지 않도록 안정된 지면으로 이동하고 실제 노출을 확인한다.
    // 이 검사는 이벤트 구분·중복을 검증하며, 50% 경계는 아래 별도 검사에서 확인한다.
    const commonAd = page.locator('[data-partner-ad-slot="common"]');
    await commonAd.scrollIntoViewIfNeeded();
    await expect(commonAd).toBeInViewport({ ratio: 1 });
    await expect.poll(async () => (await slotEvents(page)).length).toBe(1);
    await page.getByRole('button', { name: '링크 복사', exact: true }).click();
    await completeProfile(page);
    await page.locator('button[type="submit"]').click();
    await commonAd.scrollIntoViewIfNeeded();
    await expect(commonAd).toBeInViewport({ ratio: 1 });
    const events = await page.evaluate(() => window.adEvents);
    expect(events.filter((e) => e[1] === 'result_view')).toHaveLength(1);
    expect(events.filter((e) => e[1] === 'ad_experiment_exposure')).toHaveLength(0);
    expect(await slotEvents(page)).toHaveLength(1);
    for (const name of ['ad_slot_view', 'result_view', 'calc_result', 'share']) {
      expect(events.find((e) => e[1] === name)?.[2]).toMatchObject({
        ad_layout_version: AD_LAYOUT.id, ad_placement: AD_LAYOUT.placement, tool: 'today',
      });
    }
    expect(JSON.stringify(events.filter((e) => ['ad_experiment_exposure', 'ad_slot_view', 'result_view'].includes(e[1])))).not.toContain('private');
  });
}

test('토정비결 결과를 오류로 비웠다가 다시 계산해도 광고가 사라지거나 복제되지 않는다', async ({ page }) => {
  await calculateResult(page, '/tojeong/');
  const slot = page.locator('[data-partner-ad-slot="common"]');
  await slot.evaluate((el) => el.setAttribute('data-test-instance', 'original'));
  await page.locator('#tj-m').selectOption('2');
  await page.locator('#tj-d').selectOption('31');
  await completeProfile(page);
  await page.locator('button[type="submit"]').click();
  await expect(page.locator('#tj-error')).toBeVisible();
  await expect(page.locator('.result-share')).toHaveCount(0);
  await expect(page.locator('main + .partner-ad')).toHaveCount(1);
  await expect(slot).toHaveAttribute('data-test-instance', 'original');
  await page.locator('#tj-d').selectOption('1');
  await completeProfile(page);
  await page.locator('button[type="submit"]').click();
  await expect(page.locator('#tool + .partner-ad, #tojeong-tool + .partner-ad')).toHaveCount(1);
  await expect(slot).toHaveCount(1);
  await expect(slot).toHaveAttribute('data-test-instance', 'original');
  expect(await page.evaluate(() => window.partnerCalls || 0)).toBe(1);
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
  expect(await page.evaluate(() => window.partnerCalls || 0)).toBe(1);
});

const slotEvents = (page, slot = 'common') => page.evaluate((slot) => window.adEvents.filter((e) => e[1] === 'ad_slot_view' && e[2].ad_slot === slot), slot);
async function showFraction(page, fraction, selector = '[data-partner-ad-slot]') {
  await page.locator(selector).evaluate(async (el, fraction) => {
    // 결과 등장 효과가 끝난 뒤 자동 스크롤을 취소하고 목표 노출률에 맞춘다.
    await Promise.all(document.getAnimations().filter(animation => animation.playState === 'running' && Number.isFinite(animation.effect.getTiming().iterations)).map(animation => animation.finished.catch(() => {})));
    const box = el.getBoundingClientRect();
    window.scrollTo({ top: window.scrollY + box.top - window.innerHeight + box.height * fraction, behavior: 'instant' });
  }, fraction);
  // IntersectionObserver가 스크롤 후 레이아웃을 관찰할 기회를 준다.
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

test('발급 코드로 한 번만 초기화하고 절반 이상 노출 시 개인정보 없이 한 번 전송한다', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/tti/?name=private-name#private-birth');
  await expect(page.locator('[data-partner-ad-slot]')).toHaveAttribute('data-ad-state', 'initialized');
  expect(await page.evaluate(() => window.partnerConfig)).toEqual({ id: 1039151, template: 'carousel', trackingCode: 'AF3219545', width: '100%', height: '250', bordered: false, tsource: 'myod_common_content' });
  expect(await slotEvents(page)).toHaveLength(0);
  await showFraction(page, 0.4);
  expect(await slotEvents(page)).toHaveLength(0);
  await showFraction(page, 0.6);
  await expect.poll(async () => (await slotEvents(page)).length).toBe(1);
  const event = (await slotEvents(page))[0];
  expect(event.slice(0, 2)).toEqual(['event', 'ad_slot_view']);
  expect(event[2]).toEqual({ measurement_version: '3', usage_date: isoDate(todayKST()), ad_measurement_version: '1', ad_provider: 'coupang', ad_slot: 'common', ad_context: 'content', page_path: '/tti/', page_location: 'http://127.0.0.1:4176/tti/', page_title: await page.title() });
  expect(JSON.stringify(event)).not.toContain('private');
  await showFraction(page, 0);
  await showFraction(page, 0.8);
  expect(await slotEvents(page)).toHaveLength(1);
  expect(await page.evaluate(() => window.partnerCalls || 0)).toBe(1);
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
  expect(await page.evaluate(() => window.partnerCalls || 0)).toBe(1);
});

test('비활성 탭은 집계하지 않고 활성화되면 보이는 지면을 집계한다', async ({ page }) => {
  await page.addInitScript(() => {
    window.testTabVisible = false;
    Object.defineProperty(document, 'visibilityState', { get: () => window.testTabVisible ? 'visible' : 'hidden' });
  });
  await page.goto('/tti/');
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
  await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
  await completeProfile(page);
  await page.locator('button[type="submit"]').click();
  await expect(page.locator('#result .chart-card')).toBeAttached();
  await expect(page.locator('.partner-ad')).toBeHidden();
  await expect(page.locator('[data-lucky-banner-slot]')).toHaveAttribute('data-ad-state', 'unavailable');
  await expect(page.locator('.lucky-banner')).toBeHidden();
  expect(await slotEvents(page)).toHaveLength(0);
  expect(await slotEvents(page, 'lucky')).toHaveLength(0);
  await page.evaluate(() => { delete window.gtag; });
  await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
  await editProfile(page);
  await page.locator('#a-y').fill('1993');
  await page.locator('#a-m').selectOption('1');
  await page.locator('#a-d').selectOption('28');
  await page.locator('#a-notime').check();
  await completeProfile(page);
  await page.locator('button[type="submit"]').click();
  await expect(page.locator('#result .chart-card')).toBeAttached();
  await page.goto('/share/');
  await expect(page.locator('[data-partner-ad-slot]')).toHaveCount(0);
  await page.goto('/not-a-page/');
  await expect(page.locator('[data-partner-ad-slot]')).toHaveCount(0);
  expect(requests).toBe(1);
  expect(errors).toEqual([]);
});

for (const lang of ['', '/en']) for (const variant of ['A', 'B']) {
  test(`${lang || 'KR'} ${variant}: 늦게 생성된 행운색 도달은 공통 도달과 독립적이고 재계산·다음 날짜에도 중복되지 않는다`, async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-10-29T12:00:00+09:00'));
    await page.addInitScript(({ key, variant }) => localStorage.setItem(key, variant), { key: AD_POSITION_EXPERIMENT.storageKey, variant });
    await page.setViewportSize({ width: 390, height: 844 });
    const path = `${lang}/today/`;
    await page.goto(`${path}?name=private-name#private-birth`);
    await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
    await expect(page.locator('[data-lucky-banner-slot]')).toHaveCount(0);
    await showFraction(page, 0.8);
    expect(await slotEvents(page)).toHaveLength(0);
    await completeProfile(page);
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('[data-lucky-banner-slot]')).toHaveAttribute('data-ad-state', 'initialized');
    await page.locator('[data-result-summary] [data-result-heading]').scrollIntoViewIfNeeded();
    await expect.poll(() => page.evaluate(() => window.adEvents.filter(e => e[1] === 'result_view').length)).toBe(1);
    await showFraction(page, 0.4, '[data-lucky-banner-slot]');
    expect(await slotEvents(page, 'lucky')).toHaveLength(0);
    await showFraction(page, 0.6, '[data-lucky-banner-slot]');
    await expect.poll(async () => (await slotEvents(page, 'lucky')).length).toBe(1);
    await showFraction(page, 0.8);
    await expect.poll(async () => (await slotEvents(page)).length).toBe(1);
    for (const slot of ['common', 'lucky']) {
      expect((await slotEvents(page, slot))[0][2]).toEqual({
        ad_layout_version: AD_LAYOUT.id, ad_placement: AD_LAYOUT.placement, tool: 'today',
        measurement_version: '3', usage_date: '2026-10-29', ad_measurement_version: '1',
        ad_provider: 'coupang', ad_slot: slot, ad_context: slot === 'common' ? 'result_footer' : 'result', page_path: path,
        page_location: `http://127.0.0.1:4176${path}`, page_title: await page.title(),
      });
    }
    await editProfile(page);
    await page.locator('#a-d').selectOption('2');
    await page.locator('button[type="submit"]').click();
    await showFraction(page, 0.8, '[data-lucky-banner-slot]');
    expect(await slotEvents(page, 'lucky')).toHaveLength(1);
    expect(await page.evaluate(() => window.adEvents.filter(e => e[1] === 'result_view').length)).toBe(1);
    await page.clock.setFixedTime(new Date('2026-10-30T12:00:00+09:00'));
    await editProfile(page);
    await page.locator('button[type="submit"]').click();
    const heading = '[data-result-summary] [data-result-heading]';
    await page.locator(heading).scrollIntoViewIfNeeded();
    await expect.poll(() => page.evaluate(() => window.adEvents.filter(e => e[1] === 'result_view').length)).toBe(2);
    expect(await page.evaluate(() => window.adEvents.filter(e => e[1] === 'result_view').map(e => e[2].reading_date))).toEqual(['2026-10-29', '2026-10-30']);
    await showFraction(page, 0.8, '[data-lucky-banner-slot]');
    await showFraction(page, 0.8);
    expect(await slotEvents(page, 'lucky')).toHaveLength(1);
    expect(await slotEvents(page)).toHaveLength(1);
    expect(await page.evaluate(() => window.adEvents.filter(e => e[1] === 'ad_experiment_exposure').length)).toBe(0);
    expect(await page.evaluate(() => window.partnerCalls || 0)).toBe(1);
  });
}

test('결과 교체는 이전 슬롯 관측·리스너를 정리하고 숨은/제거된 슬롯의 지연 콜백을 무시한다', async ({ page }) => {
  await page.addInitScript(() => {
    window.slotObservers = [];
    window.visibilityListeners = new Set();
    const add = document.addEventListener.bind(document), remove = document.removeEventListener.bind(document);
    document.addEventListener = (type, fn, ...rest) => { if (type === 'visibilitychange') window.visibilityListeners.add(fn); add(type, fn, ...rest); };
    document.removeEventListener = (type, fn, ...rest) => { if (type === 'visibilitychange') window.visibilityListeners.delete(fn); remove(type, fn, ...rest); };
    window.IntersectionObserver = class {
      constructor(callback) { this.callback = callback; window.slotObservers.push(this); }
      observe(target) { this.target = target; this.active = true; }
      disconnect() { this.active = false; }
    };
    window.emitSlot = (observer, ratio = 1) => observer.callback([{ target: observer.target, isIntersecting: ratio > 0, intersectionRatio: ratio }]);
  });
  await calculateResult(page, '/today/');
  await expect.poll(() => page.evaluate(() => window.slotObservers.filter(o => o.active && o.target.matches('[data-lucky-banner-slot]')).length)).toBe(1);
  await page.evaluate(() => { window.previousObservers = window.slotObservers.filter(o => o.active); window.previousListenerCount = window.visibilityListeners.size; });
  await editProfile(page);
  await page.locator('#a-d').selectOption('2');
  await page.locator('button[type="submit"]').click();
  expect(await page.evaluate(() => window.previousObservers.every(o => !o.active))).toBe(true);
  expect(await page.evaluate(() => window.visibilityListeners.size === window.previousListenerCount)).toBe(true);
  await page.evaluate(() => window.previousObservers.forEach(o => window.emitSlot(o)));
  expect(await slotEvents(page)).toHaveLength(0);
  expect(await slotEvents(page, 'lucky')).toHaveLength(0);
  for (const state of ['hidden', 'aria-hidden', 'zero', 'removed', 'document-hidden', 'partial']) {
    await page.evaluate((state) => {
      const observer = window.slotObservers.find(o => o.active && o.target.matches('[data-lucky-banner-slot]'));
      const slot = observer.target, parent = slot.parentElement;
      if (state === 'hidden') parent.hidden = true;
      if (state === 'aria-hidden') parent.setAttribute('aria-hidden', 'true');
      if (state === 'zero') slot.style.height = '0px';
      if (state === 'removed') slot.remove();
      if (state === 'document-hidden') Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
      window.emitSlot(observer, state === 'partial' ? 0.49 : 1);
      parent.hidden = false;
      parent.removeAttribute('aria-hidden');
      slot.style.height = '';
      if (state === 'removed') parent.append(slot);
      if (state === 'document-hidden') delete document.visibilityState;
    }, state);
    expect(await slotEvents(page, 'lucky')).toHaveLength(0);
  }
  await page.evaluate(() => window.emitSlot(window.slotObservers.find(o => o.active && o.target.matches('[data-lucky-banner-slot]')), 0.5));
  expect(await slotEvents(page, 'lucky')).toHaveLength(1);
  expect(await slotEvents(page)).toHaveLength(0);
  expect(await page.evaluate(() => window.slotObservers.filter(o => o.active && o.target.matches('[data-partner-ad-slot]')).length)).toBe(1);
});

test('관측 API가 없어도 계산·재계산·복원을 유지하고 도달은 추정하지 않는다', async ({ page }) => {
  await page.addInitScript(() => { delete window.IntersectionObserver; });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await calculateResult(page, '/today/');
  await showFraction(page, 0.8, '[data-lucky-banner-slot]');
  await editProfile(page);
  await page.locator('#a-d').selectOption('2');
  await page.locator('button[type="submit"]').click();
  await page.reload();
  await expect(page.locator('#result .chart-card')).toBeAttached();
  await showFraction(page, 0.8);
  expect(await slotEvents(page)).toHaveLength(0);
  expect(await slotEvents(page, 'lucky')).toHaveLength(0);
  expect(errors).toEqual([]);
});

test('쿠팡 SDK 하나로 공통·행운 배너를 로드하고 Adsterra를 요청하지 않는다', async ({ page, request }) => {
  const requests = [];
  page.on('request', request => requests.push(request.url()));
  await calculateResult(page, '/today/?name=private-name#private-birth');
  await expect(page.locator('[data-partner-ad-slot] iframe')).toHaveCount(1);
  await expect(page.locator('[data-lucky-banner-slot] iframe')).toHaveCount(1);
  expect(requests.filter(url => url === 'https://ads-partners.coupang.com/g.js')).toHaveLength(1);
  expect(requests.filter(url => /bauval\.org|adsterra|\/ad-frame\//i.test(url))).toEqual([]);
  expect(JSON.stringify(await page.evaluate(() => window.partnerConfig))).not.toContain('private');
  for (const format of ['compact', 'wide']) {
    const response = await request.get(`/ad-frame/${format}/`);
    expect(response.status()).toBe(404);
    expect(await response.text()).not.toMatch(/bauval\.org|window\.atOptions/);
  }
});

for (const variant of ['A', 'B']) {
  test(`${variant}: 재계산은 광고 프레임의 실행 상태와 요청 횟수를 유지한다`, async ({ page, context }) => {
    let requests = 0;
    await context.route('https://ads-partners.coupang.com/mock-banner?id=1039151', route => {
      requests++;
      return route.fulfill({ contentType: 'text/html', body: '<!doctype html><body>Test Coupang ad</body>' });
    });
    await page.addInitScript(({ key, variant }) => localStorage.setItem(key, variant), { key: AD_POSITION_EXPERIMENT.storageKey, variant });
    await page.setViewportSize({ width: 390, height: 844 });
    for (const path of ['/today/', '/lifetime/', '/compatibility/', '/tojeong/']) {
      await calculateResult(page, path, variant);
      const frame = page.locator('[data-partner-ad-slot] iframe');
      await frame.scrollIntoViewIfNeeded();
      await expect(page.frameLocator('[data-partner-ad-slot] iframe').getByText('Test Coupang ad')).toBeVisible();
      const isolated = await frame.elementHandle().then(handle => handle.contentFrame());
      await isolated.evaluate(() => { window.recalculationSentinel = 'preserved'; });
      const initialRequests = requests;
      await editProfile(page);
      await page.locator(path === '/tojeong/' ? '#tj-d' : '#a-d').selectOption('2');
      await page.locator('button[type="submit"]').click();
      await frame.scrollIntoViewIfNeeded();
      await expect(page.frameLocator('[data-partner-ad-slot] iframe').getByText('Test Coupang ad')).toBeVisible();
      expect(requests, path).toBe(initialRequests);
      expect(await isolated.evaluate(() => window.recalculationSentinel), path).toBe('preserved');
    }
  });
}

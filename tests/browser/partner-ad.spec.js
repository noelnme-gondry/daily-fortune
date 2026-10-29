import { completeProfile } from './helpers/profile.js';
import { isoDate, todayKST } from '../../src/engine/core.js';
import { test, expect } from '@playwright/test';
import { AD_POSITION_EXPERIMENT } from '../../src/domain/ad-experiment.js';

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
      const wrapper = document.createElement('ins');
      wrapper.append(frame);
      options.container.append(wrapper);
    } };`,
  }));
  await context.addInitScript((key) => {
    try { if (!localStorage.getItem(key)) localStorage.setItem(key, 'A'); } catch { /* 저장 차단 테스트 */ }
    window.adEvents = [];
    window.gtag = (...args) => window.adEvents.push(args);
  }, AD_POSITION_EXPERIMENT.storageKey);
});

test('B는 계산 결과 첫 부분에 광고를 두고 결과로 이동할 때 광고를 건너뛰지 않는다', async ({ page }) => {
  await page.addInitScript((key) => localStorage.setItem(key, 'B'), AD_POSITION_EXPERIMENT.storageKey);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/today/');
  await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
  await completeProfile(page);
  await page.locator('button[type="submit"]').click();
  await expect(page.locator('#result > .partner-ad:first-child')).toHaveCount(1);
  await expect(page.locator('[data-partner-ad-slot]')).toBeInViewport({ ratio: 1 });
  await expect.poll(async () => {
    const slot = await page.locator('[data-partner-ad-slot]').boundingBox();
    const headerBottom = await page.locator('.site-head').evaluate((el) => el.getBoundingClientRect().bottom);
    return slot.y >= Math.max(0, headerBottom);
  }).toBe(true);
  await expect(page.locator('[data-result-summary] + .partner-ad, .chart-card + .partner-ad, .tojeong-summary + .partner-ad, .story-hero + .partner-ad, .rank-hero + .partner-ad')).toHaveCount(0);
});

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`${width}px 화면에서 공통 배너는 본문 폭에 맞는 높이 140px 지면이다`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ['/', '/today/', '/tti/']) {
      await page.goto(path);
      const slot = page.locator('[data-partner-ad-slot="common"]');
      await expect(slot).toHaveCount(1);
      await expect(slot).toHaveAttribute('data-ad-state', 'initialized');
      // 공개 예시는 main 안에 있고, 공통 광고는 main 바로 다음이다.
      await expect(page.locator('main + .partner-ad')).toBeVisible();
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

async function calculateResult(page, path, variant = 'A') {
  await page.goto(path);
  const tojeong = path.startsWith('/tojeong/');
  await expect(page.locator(tojeong ? '#tojeong-tool' : '#tool')).toHaveAttribute('data-ready', 'true');
  await completeProfile(page);
  await page.locator('button[type="submit"]').click();
  await expect(page.locator(variant === 'B' ? '#result > .partner-ad:first-child, #tojeong-result > .partner-ad:first-child' : '[data-result-summary] + .partner-ad, .chart-card + .partner-ad, .tojeong-summary + .partner-ad, .story-hero + .partner-ad, .rank-hero + .partner-ad')).toHaveCount(1);
  await expect(page.locator('[data-share-page]')).toHaveCount(0);
  await expect(page.getByRole('button', { name: '링크 복사', exact: true })).toHaveCount(1);
}

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
      const frame = await slot.locator('iframe').boundingBox();
      expect(frame.height).toBe(140);
      expect(frame.width).toBe((await slot.boundingBox()).width);
      expect(frame.x).toBeGreaterThanOrEqual(0);
      expect(frame.x + frame.width).toBeLessThanOrEqual(width);
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
        await page.keyboard.press('ArrowRight');
        await expect.poll(() => table.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
      }
    }
  });
}

for (const variant of ['A', 'B']) {
  test(`320px 새 예시가 있는 계산기의 ${variant} 광고는 재계산·복원 때 한 개로 유지된다`, async ({ page }) => {
    await page.addInitScript(({ key, variant }) => localStorage.setItem(key, variant), { key: AD_POSITION_EXPERIMENT.storageKey, variant });
    await page.setViewportSize({ width: 320, height: 900 });
    for (const path of ['/today/', '/tomorrow/', '/manseryeok/', '/year/2027/', '/tojeong/2027/']) {
      await calculateResult(page, path, variant);
      const slot = page.locator('[data-partner-ad-slot]');
      await expect(slot).toHaveAttribute('data-ad-state', 'initialized');
      await slot.evaluate((el) => el.setAttribute('data-test-instance', 'original'));
      const result = page.locator('#result, #tojeong-result');
      const slotBox = await slot.boundingBox(), frameBox = await slot.locator('iframe').boundingBox();
      expect(frameBox.width).toBe((await result.boundingBox()).width);
      expect(frameBox.height).toBe(140);
      expect(frameBox.x).toBe(slotBox.x);
      if (variant === 'B') await expect(slot).toBeInViewport({ ratio: 1 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
      await completeProfile(page);
      await page.locator('button[type="submit"]').click();
      await expect(slot).toHaveAttribute('data-test-instance', 'original');
      expect(await page.evaluate(() => window.partnerCalls)).toBe(1);
      await page.reload();
      await expect(page.locator(variant === 'B' ? '#result > .partner-ad:first-child, #tojeong-result > .partner-ad:first-child' : '[data-result-summary] + .partner-ad, .chart-card + .partner-ad, .tojeong-summary + .partner-ad, .story-hero + .partner-ad, .rank-hero + .partner-ad')).toHaveCount(1);
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
  expect(await page.evaluate(() => window.partnerCalls)).toBe(1);
});

for (const width of [390, 1440]) {
  test(`${width}px에서 운세·궁합·캐릭터·랭킹·토정비결 광고는 결과 요약 바로 아래에 한 개만 유지된다`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ['/today/', '/compatibility/', '/life-story/', '/saju-ranking/', '/tojeong/']) {
      await calculateResult(page, path);
      const slot = page.locator('[data-partner-ad-slot="common"]');
      await expect(slot).toHaveAttribute('data-ad-state', 'initialized');
      await expect(page.locator('main + .partner-ad')).toHaveCount(0);
      const resultBox = await page.locator('#result, #tojeong-result').boundingBox();
      const box = await slot.boundingBox();
      expect(box.width).toBe(resultBox.width);
      expect(box.x).toBe(resultBox.x);
      expect(box.height).toBe(140);
      expect((await slot.locator('iframe').boundingBox()).width).toBe(box.width);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      if (path === '/compatibility/') await expect(page.locator('.compat-matches')).toHaveCount(1);
      await slot.evaluate((el) => el.setAttribute('data-test-instance', 'original'));
      await page.locator(path === '/tojeong/' ? '#tj-d' : '#a-d').selectOption('2');
      await completeProfile(page);
      await page.locator('button[type="submit"]').click();
      await expect(page.locator('[data-result-summary] + .partner-ad, .chart-card + .partner-ad, .tojeong-summary + .partner-ad, .story-hero + .partner-ad, .rank-hero + .partner-ad')).toHaveCount(1);
      await expect(page.locator('[data-share-page]')).toHaveCount(0);
      await expect(slot).toHaveCount(1);
      await expect(slot).toHaveAttribute('data-test-instance', 'original');
      await expect(slot.locator('iframe')).toHaveCount(1);
      expect(await page.evaluate(() => window.partnerCalls)).toBe(1);
    }
  });
}

test('저장된 결과 복원에도 요약 아래에 배너를 놓고, 이동한 위치에서 노출 이벤트를 한 번 측정한다', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await calculateResult(page, '/today/');
  await expect(page.locator('[data-storage-status]')).toContainText('현재 탭에만');
  await page.reload();
  await expect(page.locator('[data-result-summary] + .partner-ad, .chart-card + .partner-ad, .tojeong-summary + .partner-ad, .story-hero + .partner-ad, .rank-hero + .partner-ad')).toHaveCount(1);
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
  test(`${width}px B의 주요 계산기·재계산·복원에서도 광고는 결과 위 한 개다`, async ({ page }) => {
    await page.addInitScript((key) => localStorage.setItem(key, 'B'), AD_POSITION_EXPERIMENT.storageKey);
    await page.setViewportSize({ width, height: 900 });
    for (const path of ['/today/', '/compatibility/', '/life-story/', '/saju-ranking/', '/tojeong/']) {
      await calculateResult(page, path, 'B');
      const slot = page.locator('[data-partner-ad-slot]');
      await expect(slot).toHaveAttribute('data-ad-state', 'initialized');
      await expect(slot).toBeInViewport({ ratio: 1 });
      const result = page.locator('#result, #tojeong-result');
      expect((await slot.boundingBox()).width).toBe((await result.boundingBox()).width);
      await slot.evaluate((el) => el.setAttribute('data-test-instance', 'original'));
      await page.locator(path === '/tojeong/' ? '#tj-d' : '#a-d').selectOption('2');
      await completeProfile(page);
      await page.locator('button[type="submit"]').click();
      await expect(result.locator(':scope > .partner-ad:first-child')).toHaveCount(1);
      await expect(slot).toHaveAttribute('data-test-instance', 'original');
      await expect(slot.locator('iframe')).toHaveCount(1);
      expect(await page.evaluate(() => window.partnerCalls)).toBe(1);
      await page.reload();
      await expect(result.locator(':scope > .partner-ad:first-child')).toHaveCount(1);
    }
  });
}

test('A/B 배정은 새 문서 이동에도 유지되고 일반 페이지는 실험에 포함하지 않는다', async ({ page }) => {
  await page.goto('/today/');
  await page.evaluate((key) => localStorage.setItem(key, 'B'), AD_POSITION_EXPERIMENT.storageKey);
  await page.reload();
  await expect(page.locator('#tool')).toHaveAttribute('data-ad-variant', 'B');
  await page.goto('/tomorrow/');
  await expect(page.locator('#tool')).toHaveAttribute('data-ad-variant', 'B');
  await page.goto('/tojeong/');
  await expect(page.locator('#tojeong-tool')).toHaveAttribute('data-ad-variant', 'B');
  await page.goto('/');
  await expect(page.locator('#tool')).toHaveAttribute('data-ad-variant', 'B');
  await page.goto('/about/');
  await expect(page.locator('[data-ad-variant], [data-partner-ad-slot]')).toHaveCount(0);
  await page.goto('/tti/');
  await expect(page.locator('[data-ad-variant]')).toHaveCount(0);
  await showFraction(page, 0.8);
  await expect.poll(async () => (await slotEvents(page)).length).toBe(1);
  expect((await slotEvents(page))[0][2]).not.toHaveProperty('experiment_id');
});

test('홈에서 계산해 오늘의 운세로 진입해도 저장된 B 배정으로 결과를 복원한다', async ({ page }) => {
  await page.addInitScript((key) => localStorage.setItem(key, 'B'), AD_POSITION_EXPERIMENT.storageKey);
  await page.goto('/');
  await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
  await completeProfile(page);
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/today\/$/);
  await expect(page.locator('#result > .partner-ad:first-child')).toHaveCount(1);
  expect(await page.evaluate(() => window.adEvents.find((e) => e[1] === 'ad_experiment_exposure')?.[2].experiment_variant)).toBe('B');
});

test('브라우저·탭 저장이 모두 막혀도 같은 문서의 B 배정과 계산이 유지된다', async ({ page }) => {
  await page.addInitScript(() => {
    for (const name of ['localStorage', 'sessionStorage']) Object.defineProperty(window, name, { get() { throw new Error('storage blocked'); } });
    Math.random = () => 0.75;
  });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/today/');
  await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
  for (const day of ['2', '3']) {
    await page.locator('#a-d').selectOption(day);
    await completeProfile(page);
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('#result > .partner-ad:first-child')).toHaveCount(1);
    await expect(page.locator('#result .chart-card')).toBeAttached();
  }
  expect(await page.evaluate(() => window.adEvents.find((e) => e[1] === 'ad_experiment_exposure')?.[2])).toMatchObject({ experiment_variant: 'B', assignment_scope: 'page' });
  expect(errors).toEqual([]);
});

for (const variant of ['A', 'B']) {
  test(`${variant}는 계산 후 실험 진입·광고 도달·결과 도달을 한 번씩 구분하고 공유에 그룹을 붙인다`, async ({ page }) => {
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
    await expect.poll(() => page.evaluate(() => window.adEvents.filter((e) => e[1] === 'result_view').length)).toBe(1);
    await showFraction(page, 0.8);
    await expect.poll(async () => (await slotEvents(page)).length).toBe(1);
    await page.getByRole('button', { name: '링크 복사', exact: true }).click();
    await completeProfile(page);
    await page.locator('button[type="submit"]').click();
    await showFraction(page, 0.8);
    const events = await page.evaluate(() => window.adEvents);
    for (const name of ['ad_experiment_exposure', 'result_view']) expect(events.filter((e) => e[1] === name)).toHaveLength(1);
    expect(await slotEvents(page)).toHaveLength(1);
    for (const name of ['ad_experiment_exposure', 'ad_slot_view', 'result_view', 'calc_result', 'share']) {
      expect(events.find((e) => e[1] === name)?.[2]).toMatchObject({
        experiment_id: AD_POSITION_EXPERIMENT.id, experiment_variant: variant,
        ad_placement: AD_POSITION_EXPERIMENT.placements[variant], assignment_scope: 'browser', tool: 'today',
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
  await expect(page.locator('[data-result-summary] + .partner-ad, .chart-card + .partner-ad, .tojeong-summary + .partner-ad, .story-hero + .partner-ad, .rank-hero + .partner-ad')).toHaveCount(1);
  await expect(slot).toHaveCount(1);
  await expect(slot).toHaveAttribute('data-test-instance', 'original');
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
  expect(await page.evaluate(() => window.partnerConfig)).toEqual({ id: 1039151, template: 'carousel', trackingCode: 'AF3219545', width: '100%', height: '140', bordered: false, tsource: '' });
  expect(await slotEvents(page)).toHaveLength(0);
  await showFraction(page, 0.4);
  expect(await slotEvents(page)).toHaveLength(0);
  await showFraction(page, 0.6);
  await expect.poll(async () => (await slotEvents(page)).length).toBe(1);
  const event = (await slotEvents(page))[0];
  expect(event.slice(0, 2)).toEqual(['event', 'ad_slot_view']);
  expect(event[2]).toEqual({ measurement_version: '2', usage_date: isoDate(todayKST()), ad_measurement_version: '1', ad_provider: 'coupang', ad_slot: 'common', ad_context: 'content', page_path: '/tti/', page_location: 'http://127.0.0.1:4176/tti/', page_title: await page.title() });
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
  await showFraction(page, 0.6);
  await expect.poll(async () => (await slotEvents(page)).length).toBe(1);
  await expect(page.locator('[data-lucky-banner-slot]')).toHaveAttribute('data-ad-state', 'unavailable');
  await showFraction(page, 0.6, '[data-lucky-banner-slot]');
  await expect.poll(async () => (await slotEvents(page, 'lucky')).length).toBe(1);
  await page.evaluate(() => { delete window.gtag; });
  await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
  await page.locator('#a-y').selectOption('1993');
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
    await showFraction(page, 0.4, '[data-lucky-banner-slot]');
    expect(await slotEvents(page, 'lucky')).toHaveLength(0);
    await showFraction(page, 0.6, '[data-lucky-banner-slot]');
    await expect.poll(async () => (await slotEvents(page, 'lucky')).length).toBe(1);
    await showFraction(page, 0.8);
    await expect.poll(async () => (await slotEvents(page)).length).toBe(1);
    for (const slot of ['common', 'lucky']) {
      expect((await slotEvents(page, slot))[0][2]).toEqual({
        experiment_id: 'ad_position_v2', experiment_variant: variant,
        ad_placement: AD_POSITION_EXPERIMENT.placements[variant], assignment_scope: 'browser', tool: 'today',
        measurement_version: '2', usage_date: '2026-10-29', ad_measurement_version: '1',
        ad_provider: 'coupang', ad_slot: slot, ad_context: 'result', page_path: path,
        page_location: `http://127.0.0.1:4176${path}`, page_title: await page.title(),
      });
    }
    await page.locator('#a-d').selectOption('2');
    await page.locator('button[type="submit"]').click();
    await showFraction(page, 0.8, '[data-lucky-banner-slot]');
    expect(await slotEvents(page, 'lucky')).toHaveLength(1);
    expect(await page.evaluate(() => window.adEvents.filter(e => e[1] === 'result_view').length)).toBe(1);
    await page.clock.setFixedTime(new Date('2026-10-30T12:00:00+09:00'));
    await page.locator('button[type="submit"]').click();
    const heading = '[data-result-summary] [data-result-heading]';
    await page.locator(heading).scrollIntoViewIfNeeded();
    await expect.poll(() => page.evaluate(() => window.adEvents.filter(e => e[1] === 'result_view').length)).toBe(2);
    expect(await page.evaluate(() => window.adEvents.filter(e => e[1] === 'result_view').map(e => e[2].reading_date))).toEqual(['2026-10-29', '2026-10-30']);
    await showFraction(page, 0.8, '[data-lucky-banner-slot]');
    await showFraction(page, 0.8);
    expect(await slotEvents(page, 'lucky')).toHaveLength(1);
    expect(await slotEvents(page)).toHaveLength(1);
    expect(await page.evaluate(() => window.adEvents.filter(e => e[1] === 'ad_experiment_exposure').length)).toBe(1);
    expect(await page.evaluate(() => window.partnerCalls)).toBe(1);
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
  await page.locator('#a-d').selectOption('2');
  await page.locator('button[type="submit"]').click();
  await page.reload();
  await expect(page.locator('#result .chart-card')).toBeAttached();
  await showFraction(page, 0.8);
  expect(await slotEvents(page)).toHaveLength(0);
  expect(await slotEvents(page, 'lucky')).toHaveLength(0);
  expect(errors).toEqual([]);
});

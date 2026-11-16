import { test, expect } from '@playwright/test';
import { todayKST } from '../../src/engine/index.js';

const first = { name: '첫 예시', gender: 'F', calendar: 'solar', y: 1990, m: 5, d: 17, timeMode: 'exact', time: '12:00', noTime: false };
const second = { ...first, name: '다음 예시', y: 1985, m: 12, d: 31 };
const ready = async page => expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
async function seed(page) {
  await page.goto('/today/'); await ready(page);
  const ids = await page.evaluate(async ({ first, second }) => {
    const p = await import('/src/client/profile.js');
    const a = await p.save('a', first), b = await p.savePerson(second);
    await p.consumeProfileGuide();
    return [a.profileId, b.id];
  }, { first, second });
  await page.reload(); await ready(page);
  return ids;
}
test.beforeEach(async ({ context, page }) => {
  await context.route('https://**/*', route => route.abort());
  await page.emulateMedia({ reducedMotion: 'reduce' });
});
for (const width of [320, 390, 768, 1440]) test(`${width}px: 사람 선택·직접 입력은 기존 결과를 유지하고 보기 버튼으로 적용·접기·스크롤한다`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 });
  const [, id] = await seed(page);
  const result = page.locator('#result');
  await expect(page.locator('#tool-form')).toBeHidden();
  await expect(result.locator('.applied-profile')).toContainText(first.name);
  const original = await result.textContent();
  await result.locator('[data-edit-profile]').click();
  await page.locator('#a-saved-person').selectOption(id);
  await expect(page.locator('#a-y')).toHaveValue(String(second.y));
  expect(await result.textContent()).toBe(original);
  expect(await page.evaluate(async () => (await import('/src/client/profile.js')).sessionLoad('a').y)).toBe(first.y);
  await page.locator('#a-saved-person').selectOption('');
  await expect(page.locator('#a-y')).toHaveValue('');
  expect(await result.textContent()).toBe(original);
  await page.locator('#a-saved-person').selectOption(id);
  await expect(page.locator('#a-y')).toHaveValue(String(second.y));
  await page.locator('#a-y').fill('1986');
  expect(await result.textContent()).toBe(original);
  await page.locator('#tool-form [type=submit]').click();
  await expect(result.locator('.applied-profile')).toContainText('1986.12.31');
  await expect(result.locator('.applied-profile')).not.toContainText(first.name);
  await expect(page.locator('#tool-form')).toBeHidden();
  await expect(page.locator('#reading-summary')).toBeFocused();
  await expect(page.locator('#reading-summary')).toBeInViewport();
  const sizes = await page.locator('#tool').evaluate(tool => ({ tool: tool.clientWidth, result: tool.querySelector('#result').clientWidth }));
  expect(sizes.result).toBeGreaterThanOrEqual(sizes.tool - 2);
  await result.locator('[data-edit-profile]').click();
  await expect(page.locator('#a-y')).toBeFocused();
  await expect(page.locator('#a-y')).toHaveValue('1986');
});
test('홈에서 사람을 바꿔도 운세가 실행되거나 화면 구성이 바뀌지 않는다', async ({ page }) => {
  const [, id] = await seed(page);
  await page.goto('/'); await ready(page);
  await page.locator('[data-saved-entry] [data-edit-profile]').click();
  const classes = await page.locator('#tool').getAttribute('class');
  await page.locator('#a-saved-person').selectOption(id);
  await expect(page.locator('#a-y')).toHaveValue(String(second.y));
  await expect(page.locator('#tool')).toHaveAttribute('class', classes);
  await expect(page.locator('#result .report-head')).toHaveCount(0);
  await expect(page).toHaveURL(/\/$/);
  await page.locator('#tool-form [type=submit]').click();
  await expect(page).toHaveURL(/\/today\/$/);
  await expect(page.locator('#reading-summary')).toBeFocused();
  await expect(page.locator('#reading-summary')).toBeInViewport();
  await expect(page.locator('.applied-profile')).toContainText(second.name);
});
test('목록 관리에서 사람을 선택해도 기존 결과는 제출할 때까지 유지한다', async ({ page }) => {
  const [, id] = await seed(page);
  const original = await page.locator('#result').textContent();
  await page.locator('.profiles-tab').click();
  await page.locator(`[data-use-person="${id}"]`).click();
  await expect(page.locator('#tool-form')).toBeVisible();
  await expect(page.locator('#a-y')).toHaveValue(String(second.y));
  expect(await page.locator('#result').textContent()).toBe(original);
  await page.locator('#tool-form [type=submit]').click();
  await expect(page.locator('.applied-profile')).toContainText(second.name);
});
test('날짜 입력의 연·월·일은 좁은 화면에서도 글자와 화살표가 겹치지 않는다', async ({ page }) => {
  for (const width of [320, 390, 768, 1440]) for (const path of ['/year/2027/', '/shop/lifetime/', '/shop/compatibility/']) {
    await page.setViewportSize({ width, height: 900 }); await page.goto(path);
    await page.locator('#a-y').fill('1990');
    await page.locator('#a-m').selectOption('12'); await page.locator('#a-d').selectOption('31');
    const fields = await page.locator('#a-m,#a-d').evaluateAll(inputs => inputs.map(el => {
      const style = window.getComputedStyle(el), canvas = document.createElement('canvas'), ctx = canvas.getContext('2d'); ctx.font = style.font;
      return { width: el.clientWidth, needed: ctx.measureText(el.selectedOptions[0].text).width + parseFloat(style.paddingLeft) + parseFloat(style.paddingRight) + 18 };
    }));
    for (const field of fields) expect(field.width, `${path} at ${width}`).toBeGreaterThanOrEqual(field.needed);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  }
});
test('전체 메뉴의 무료·프리미엄 분류와 기간 이름이 일관되고 세 유료 상품으로 연결된다', async ({ page }) => {
  await page.goto('/'); await page.locator('[data-dialog="site-menu"]').click();
  const menu = page.locator('#site-menu');
  const premium = menu.locator('section').filter({ has: page.getByRole('heading', { name: '프리미엄 운세', exact: true }) });
  await expect(premium).toContainText('각 990원 · 단건 결제 · 다운로드 포함');
  for (const [id, label] of [['tojeong', '토정비결'], ['lifetime', '평생 사주'], ['compatibility', '궁합']]) await expect(premium.locator(`a[href="/shop/${id}/"]`)).toHaveText(`${label} · 990원`);
  const free = menu.locator('section').filter({ has: page.getByRole('heading', { name: '무료 운세', exact: true }) });
  await expect(free.locator('a')).toHaveText(['오늘의 운세', '내일의 운세', '이번 주 운세', '이달의 운세', `${todayKST().y}년 운세`, `${todayKST().y + 1}년 운세`, '띠별 운세']);
  await expect(menu).not.toContainText('무료 토정비결');
  await premium.locator('a[href="/shop/tojeong/"]').click();
  await expect(page.locator('[data-fortune-product]')).toHaveAttribute('data-ready', 'true');
});
for (const path of ['/tojeong/', '/lifetime/', '/compatibility/']) test(`${path}: 기존 주소에서도 무료 전체 풀이 대신 990원 미리보기·구매 화면을 연다`, async ({ page }) => {
  await page.goto(path);
  await expect(page.locator('[data-fortune-product]')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('#tool-form,#tojeong-form')).toHaveCount(0);
  await expect(page.locator('.shop-price')).toContainText('990');
  await page.locator('#a-y').fill('1990'); await page.locator('#a-m').selectOption('5'); await page.locator('#a-d').selectOption('17');
  if (path !== '/tojeong/') await page.locator('[name="a-gender"][value="F"]').check();
  if (path === '/compatibility/') {
    await page.locator('#b-y').fill('1991'); await page.locator('#b-m').selectOption('8'); await page.locator('#b-d').selectOption('2');
    await page.locator('[name="b-gender"][value="M"]').check();
  }
  await page.locator('#purchase-privacy').check(); await page.locator('#purchase-form [type=submit]').click();
  await expect(page.locator('[data-purchase-review]')).toBeVisible();
  await expect(page.locator('#purchase-form')).toBeHidden();
  await expect(page.locator('[data-purchase-review]')).toContainText('전체 풀이와 운세 파일은 결제 후 제공됩니다.');
});
for (const product of ['tojeong', 'lifetime', 'compatibility']) test(`${product}: 저장한 사람을 선택해도 제출 전에는 서버 미리보기를 요청하지 않는다`, async ({ page }) => {
  const [, id] = await seed(page);
  let previews = 0;
  page.on('request', request => { if (new URL(request.url()).pathname === '/api/commerce/preview') previews++; });
  await page.goto(`/shop/${product}/`);
  await expect(page.locator('[data-fortune-product]')).toHaveAttribute('data-ready', 'true');
  await page.locator('#a-saved-person').selectOption(id);
  await expect(page.locator('#a-y')).toHaveValue(String(second.y));
  expect(previews).toBe(0);
  await expect(page.locator('[data-purchase-review]')).toBeHidden();
  if (product === 'compatibility') { await page.locator('#b-saved-person').selectOption(id); await expect(page.locator('#b-y')).toHaveValue(String(second.y)); }
  await page.locator('#purchase-privacy').check(); await page.locator('#purchase-form [type=submit]').click();
  await expect(page.locator('[data-purchase-review]')).toBeVisible();
  await expect(page.locator('[data-purchase-details]')).toContainText(second.name);
  expect(previews).toBe(1);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createFortuneReport } from '../src/server/fortune-report.js';
import { presentStoredReport, tojeongPremium } from '../src/server/premium-report.js';
import { READING_CHAPTERS, READING_TOPICS, topicEvidence } from '../src/domain/premium-reading.js';
import { calculateTojeong } from '../src/domain/tojeong.js';
import { buildChart, lifetime, compat } from '../src/engine/index.js';
import { lifeView } from '../src/client/life-tool.js';
import { tojeongView } from '../src/client/tojeong-view.js';
import { compatView } from '../src/client/compat-tool.js';
import { trackPurchase, trackCommerceStep } from '../src/client/purchase-analytics.js';

const today = { y: 2026, m: 11, d: 16 };
const person = { name: '가나다', calendar: 'solar', y: 1990, m: 5, d: 17, gender: 'M', noTime: true, timeMode: 'exact' };
const partner = { ...person, name: '라마바', gender: 'F', y: 1991 };
const input = id => ({ productId: id, people: id === 'compatibility' ? [person, partner] : [person], targetYear: 2026, privacyConsent: true });
const readings = JSON.parse(readFileSync(new URL('../src/content/tojeong-144.json', import.meta.url), 'utf8'));
for (const id of Object.keys(READING_CHAPTERS)) test(`${id}: 판매 목차 모두 실제 해설로 제공하고 도움말·오프라인 펼침을 포함한다`, () => {
  const { html } = createFortuneReport(input(id), today);
  for (const chapter of READING_CHAPTERS[id]) assert.equal(html.split(`id="reading-${chapter.id}"`).length - 1, 1);
  assert.match(html, /좋지 않은 풀이가 마음에 남을 때/);
  assert.match(html, /이번 풀이와 함께 살펴볼 점/);
  assert.match(html, /<details class="reading-fold"/);
  assert.doesNotMatch(html, /<script\b|<dialog\b|<iframe\b/);
  assert.match(html, /fonts.googleapis.com/);
  assert.doesNotMatch(html, /:root\{color-scheme:light/);
});
test('보강된 사주·궁합 점수는 기존 엔진과 같고 전체 연도와 계산 근거를 읽을 수 있다', () => {
  const a = buildChart(person), b = buildChart(partner), life = lifetime(a, today), comp = compat(a, b, today);
  const l = createFortuneReport(input('lifetime'), today).html;
  for (const cycle of life.daeun) assert.ok(l.includes(`종합 ${cycle.score}점`));
  for (let y = 2026; y <= 2040; y++) assert.ok(l.includes(`<th scope="row">${y}</th>`));
  assert.match(l, /강약을 계산한 과정/); assert.match(l, /대운 시작과 방향/);
  const c = createFortuneReport(input('compatibility'), today).html;
  for (const cat of comp.cats) assert.ok(c.includes(`<strong>${cat.score}</strong>점`));
  assert.match(c, /출생 시각을 몰라 시주를 제외/);
  assert.doesNotMatch(c, /undefined|NaN/);
});
test('토정비결 분야 해설은 실제 원문을 인용하고, 없는 주제에 길흉을 만들지 않는다', () => {
  for (const reading of Object.values(readings)) for (const topic of READING_TOPICS) {
    for (const evidence of topicEvidence(reading, topic)) assert.ok([reading.chongun, ...Object.values(reading.months)].some(text => text.includes(evidence.text)));
  }
  assert.deepEqual(topicEvidence({ chongun: '푸른 하늘.', months: { 1: '밝은 달.' } }, READING_TOPICS[0]), []);
  const r = calculateTojeong(person, 2026);
  const html = tojeongPremium(r, readings['532']);
  assert.match(html, /이번 풀이와 함께 살펴볼 점/);
  assert.match(html, /확인할 수 있는 일정·약속·부담/);
  assert.match(html, /기대하는 돈과 이미 확보한 돈을 구분/);
  for (let m = 1; m <= 12; m++) assert.ok(html.includes(`id="tj-month-${m}"`));
});
for (const id of Object.keys(READING_CHAPTERS)) test(`${id}: 기존 주문 원본을 보존하며 테마·숨겨진 설명·마무리 안내를 갱신한다`, () => {
  const a = buildChart(person), b = buildChart(partner), r = calculateTojeong(person, 2026);
  const body = id === 'tojeong' ? tojeongView(r, readings[r.code], person.name) : id === 'lifetime' ? lifeView(lifetime(a, today), a, today) : compatView(compat(a, b, today), a, b, today);
  const order = { productId: id, title: '기존 구매', html: `<!doctype html><html><style>:root{color-scheme:light}</style><main class="download-report"><header>풀이 기준일 2026-11-16</header>${body}<footer>기존 안내</footer></main></html>` };
  const original = order.html, result = presentStoredReport(order);
  assert.equal(order.html, original);
  assert.match(result, /data-reading-version="2"/);
  assert.match(result, /풀이를 읽고 난 뒤/);
  assert.doesNotMatch(result, /:root\{color-scheme:light|<dialog\b/);
  if (id === 'lifetime') assert.match(result, /<details class="reading-fold" id="life-event-/);
  if (id === 'tojeong') assert.match(result, /생활 속 여섯 가지 이야기/);
  assert.equal(presentStoredReport({ ...order, html: result }), result);
});
test('구매 제목·이름은 해설과 문서에서 HTML로 실행되지 않는다', () => {
  const r = createFortuneReport({ ...input('compatibility'), people: [{ ...person, name: '<img src=x>' }, { ...partner, name: '<script>x' }] }, today);
  assert.doesNotMatch(r.html, /<img src=x>|<script>x/);
  assert.match(r.html, /&lt;img src=x&gt;/);
});
test('GA 구매: 승인된 실결제만 금액·통화·상품으로 기록하고 재방문·저장 차단·GA 미연결을 처리한다', t => {
  const events = [], storage = new Map(), oldWindow = globalThis.window, oldStorage = globalThis.localStorage;
  t.after(() => { globalThis.window = oldWindow; globalThis.localStorage = oldStorage; });
  globalThis.window = { gtag: (...args) => events.push(args) };
  globalThis.localStorage = { getItem: k => storage.get(k), setItem: (k, v) => storage.set(k, v) };
  const order = { id: 'fortune_00000000-0000-4000-8000-000000000001', productId: 'lifetime', title: '개인 이름의 사주', mode: 'live', status: 'PAID', amount: 990 };
  for (const changed of [{ mode: 'sandbox' }, { status: 'PENDING' }, { status: 'REVIEW' }, { status: 'CANCELLED' }, { amount: 1 }, { id: '' }]) assert.equal(trackPurchase({ ...order, ...changed }), false);
  assert.equal(trackPurchase(order), true); assert.equal(trackPurchase(order), false);
  assert.equal(events.length, 1);
  assert.equal(events[0][1], 'purchase'); assert.equal(events[0][2].value, 990); assert.equal(events[0][2].currency, 'KRW');
  assert.equal(events[0][2].items[0].item_name, '평생 사주');
  assert.ok(!JSON.stringify(events).includes('개인 이름'));
  window.gtag = undefined;
  const next = { ...order, id: 'fortune_00000000-0000-4000-8000-000000000002' };
  assert.equal(trackPurchase(next), false);
  window.gtag = (...args) => events.push(args);
  localStorage.getItem = () => { throw new Error('blocked'); }; localStorage.setItem = () => { throw new Error('blocked'); };
  assert.equal(trackPurchase(next), true); assert.equal(trackPurchase(next), false);
  trackCommerceStep('view_item', 'tojeong'); trackCommerceStep('begin_checkout', 'compatibility');
  assert.deepEqual(events.slice(-2).map(e => e[1]), ['view_item', 'begin_checkout']);
});

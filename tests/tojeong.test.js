import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { calculateTojeong, tojeongBirth, tojeongGwae, tojeongNumbers, TojeongInputError } from '../src/domain/tojeong.js';
import { createSite } from '../src/site/render.js';
import { tojeongView } from '../src/client/tojeong-view.js';

const birth = { calendar: 'lunar', y: 1976, m: 8, d: 26 };
const source = readFileSync(new URL('../src/content/tojeong-144.json', import.meta.url));
const readings = JSON.parse(source);

test('토정비결: 공개 예시 212와 당년 대월 예시 811을 재현한다', () => {
  const r = calculateTojeong(birth, 2005);
  assert.equal(r.code, '212');
  assert.deepEqual(r.ganji, { year: '乙酉', month: '乙酉', day: '丙辰' });
  assert.deepEqual(r.values, { age: 30, monthDays: 29, birthDay: 26, taese: 20, wolgeon: 14, iljin: 18 });
  const bigMonth = calculateTojeong({ calendar: 'lunar', y: 1975, m: 7, d: 25 }, 2024);
  assert.equal(bigMonth.code, '811');
  assert.equal(bigMonth.values.monthDays, 30);
});

test('토정비결: 조견표 기준값과 나머지 0은 각각 8·6·3이다', () => {
  assert.deepEqual(tojeongNumbers('甲子'), { taese: 20, wolgeon: 18, iljin: 18 });
  assert.deepEqual(tojeongNumbers('丙午'), { taese: 16, wolgeon: 16, iljin: 14 });
  assert.deepEqual(tojeongNumbers('癸巳'), { taese: 14, wolgeon: 9, iljin: 12 });
  assert.equal(tojeongGwae({ age: 4, monthDays: 30, birthDay: 12, taese: 20, wolgeon: 18, iljin: 18 }).code, '863');
  for (const ganji of [null, '', '甲丑', '가나', '甲子年']) assert.throws(() => tojeongNumbers(ganji), TojeongInputError);
  for (const patch of [{ age: 0 }, { monthDays: 31 }, { birthDay: 31 }, { birthDay: 0 }, { taese: 0 }, { wolgeon: 0 }, { iljin: 0 }, { age: 1.5 }]) {
    assert.throws(() => tojeongGwae({ age: 4, monthDays: 30, birthDay: 12, taese: 20, wolgeon: 18, iljin: 18, ...patch }), TojeongInputError);
  }
});

test('토정비결: 양력·음력 동일 생일은 같은 괘이며 시각·성별은 무관하다', () => {
  const solar = { calendar: 'solar', y: 1976, m: 9, d: 19 };
  assert.deepEqual(calculateTojeong(birth, 2005), calculateTojeong(solar, 2005));
  assert.deepEqual(calculateTojeong({ ...solar, gender: 'M', time: '23:40' }, 2005), calculateTojeong({ ...solar, gender: 'F', time: null }, 2005));
  const edge = calculateTojeong({ calendar: 'solar', y: 2024, m: 1, d: 1 }, 2026);
  assert.equal(edge.birth.lunar.y, 2023);
  assert.equal(edge.values.age, 4);
  assert.deepEqual(edge.period, { start: { y: 2026, m: 2, d: 17 }, end: { y: 2027, m: 2, d: 6 } });
});

test('토정비결: 윤달과 소월의 30일 조정이 결과에 명시된다', () => {
  const leap = calculateTojeong({ calendar: 'lunar', y: 1993, m: 3, d: 1, leap: true }, 2026);
  const regular = calculateTojeong({ calendar: 'lunar', y: 1993, m: 3, d: 1 }, 2026);
  assert.equal(leap.code, regular.code);
  assert.equal(leap.normalizedLeap, true);
  assert.equal(regular.normalizedLeap, false);
  const adjusted = calculateTojeong({ calendar: 'lunar', y: 2004, m: 8, d: 30 }, 2005);
  assert.equal(adjusted.adjustedDay, true);
  assert.equal(adjusted.values.birthDay, 29);
  assert.equal(adjusted.birth.lunar.d, 30);
  assert.ok(tojeongView(adjusted, readings[adjusted.code]).includes('생일 30일을 29일로 계산'));
  assert.ok(tojeongView(leap, readings[leap.code]).includes('윤달 생일을 같은 월의 평달로'));
});

test('토정비결: 없는 날짜·윤달·지원 범위 밖의 연도를 정상 결과로 만들지 않는다', () => {
  for (const p of [null, {}, { ...birth, calendar: 'unknown' }, { ...birth, y: 1929 }, { ...birth, m: 13 }, { ...birth, d: 0 }, { ...birth, y: 2021, m: 4, d: 1, leap: true }, { ...birth, y: 2005, m: 8, d: 30 }, { calendar: 'solar', y: 2026, m: 2, d: 30 }]) {
    assert.throws(() => tojeongBirth(p), TojeongInputError);
  }
  for (const year of [1929, 2050, 2026.5, NaN, '2026', 1975]) assert.throws(() => calculateTojeong(birth, year), TojeongInputError);
  assert.match(calculateTojeong(birth, 2049).code, /^[1-8][1-6][1-3]$/);
});

test('토정비결: MIT 원본 144괘와 1,728개 월별 해설이 손실 없이 포함된다', () => {
  assert.equal(createHash('sha256').update(source).digest('hex'), 'd92d0e984e6a30450a7a7e14191e9fdd425440f2e8c80b91f211d84cf923ccdd');
  assert.equal(Object.keys(readings).length, 144);
  for (let a = 1; a <= 8; a++) for (let b = 1; b <= 6; b++) for (let c = 1; c <= 3; c++) {
    const code = `${a}${b}${c}`, r = readings[code];
    assert.equal(r.code, code);
    assert.ok(r.chongun.length > 40, code);
    assert.equal(Object.keys(r.months).length, 12);
    for (let m = 1; m <= 12; m++) assert.ok(r.months[m].length > 20, `${code} / ${m}월`);
  }
  assert.ok(source.toString().includes('구설'));
  const result = calculateTojeong(birth, 2026), html = tojeongView(result, readings[result.code], '<img src=x onerror=alert(1)>');
  assert.ok(!html.includes('<img src=x'));
  assert.equal((html.match(/data-tojeong-month=/g) || []).length, 12);
  assert.equal((html.match(/role="region"/g) || []).length, 12);
  assert.throws(() => tojeongView(result, { chongun: '누락' }), /누락/);
});

test('토정비결: 공개 진입·SEO·무료 FAQ·새해 경로가 연결된다', () => {
  const site = createSite({ site: 'https://unse.example', assets: { css: '/a.css', js: '/a.js' }, now: Date.UTC(2026, 9, 14) });
  assert.ok(site.render('/').includes('<b>무료 토정비결</b>'));
  // 올해 연도 주소는 같은 내용이라 /tojeong/으로 보내고, 해마다 다른 작괘 기준표를 싣는다.
  assert.equal(site.has('/tojeong/2026/'), false);
  assert.equal(site.redirect('/tojeong/2026/'), '/tojeong/');
  assert.ok(site.render('/tojeong/').includes('병오(丙午)년') && site.render('/tojeong/').includes('태세수는 <b>16</b>'));
  assert.ok(site.render('/tojeong/2027/').includes('정미(丁未)년'));
  assert.ok(site.render('/tojeong/').includes('href="/tojeong/2027/"') && !site.render('/tojeong/2027/').includes('href="/tojeong/2026/"'));
  assert.ok(!site.llms().includes('/tojeong/2026/'));
  for (const path of ['/tojeong/', '/tojeong/2027/']) {
    const html = site.render(path);
    assert.ok(html.includes('id="tojeong-tool"'), path);
    assert.ok(html.includes(`href="https://unse.example${path}"`));
    assert.ok(site.sitemap().includes(`https://unse.example${path}`));
    const graph = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])['@graph'];
    assert.equal(graph.find((n) => n['@type'] === 'WebApplication').offers.price, '0');
    assert.ok(!html.includes('id="a-time"'));
  }
  assert.ok(!site.llms().includes('계산 기능은 제공하지 않습니다'));
  assert.ok(site.llmsFull().includes('무료 토정비결'));
  const next = createSite({ site: 'https://unse.example', assets: { css: '/a.css', js: '/a.js' }, now: Date.UTC(2026, 11, 31, 15) });
  assert.ok(next.has('/tojeong/2028/'));
  assert.ok(next.has('/tojeong/2026/') && !next.has('/tojeong/2027/'));
  assert.equal(next.redirect('/tojeong/2027/'), '/tojeong/');
  assert.ok(next.render('/tojeong/').includes('data-year="2027"'));
});

test('토정비결 공유 카드: 괘 번호와 연도만 담고, 잘못된 값은 거부한다', async () => {
  const { parseShare } = await import('../src/site/pages/share.js');
  const card = parseShare(new URLSearchParams({ k: 'tojeong', n: '서윤', y: '2026', g: '232' }));
  assert.equal(card.big, '232괘');
  assert.equal(card.kicker, '서윤님의 2026년 토정비결');
  assert.equal(card.title, readings['232'].chongun.split(/(?<=[.!?])\s+/)[0]);
  assert.equal(card.tool, '/tojeong/');
  for (const bad of [{ g: '932' }, { g: '171' }, { g: '23' }, { y: '1800' }, { g: '__proto__' }]) {
    assert.equal(parseShare(new URLSearchParams({ k: 'tojeong', y: '2026', g: '232', ...bad })), null, JSON.stringify(bad));
  }
});

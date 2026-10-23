import test from 'node:test';
import assert from 'node:assert/strict';
import { buildChart, compat, lifetime, day } from '../src/engine/index.js';
import { lifeView } from '../src/client/life-tool.js';
import { compatView } from '../src/client/compat-tool.js';
import { withLanguage } from '../src/i18n/runtime.js';

const input = (y, gender) => ({ y, m: 5, d: 15, gender, calendar: 'solar', time: '14:00' });

for (const lang of ['ko', 'en']) {
  test(`${lang}: 음수 시기 신호는 강한 해·결혼 날짜로 표시하지 않는다`, () => withLanguage(lang, () => {
    const a = buildChart(input(1940, 'F')), b = buildChart(input(1938, 'M'));
    const today = { y: 2026, m: 10, d: 24 };
    const html = compatView(compat(a, b, today), a, b, today);
    assert.match(html, lang === 'ko' ? /추천할 만한 신호가 없습니다/ : /No signal stands out/);
    assert.doesNotMatch(html, /class="date"/);
  }));

  test(`${lang}: 연말 빈 길일과 자녀 11개 연도 탐색을 명시한다`, () => withLanguage(lang, () => {
    const a = buildChart(input(1990, 'F'));
    const b = buildChart({ ...input(1988, 'M'), m: 8, d: 2, time: '09:00' });
    const today = { y: 2026, m: 12, d: 31 };
    const r = compat(a, b, today);
    assert.equal(r.events.weddingDates.length, 0);
    const html = compatView(r, a, b, today);
    assert.match(html, lang === 'ko' ? /남아 있는 추천 날짜가 없습니다/ : /No suggested dates remain/);
    assert.match(html, lang === 'ko' ? /11개 연도/ : /11 calendar years/);
  }));

  test(`${lang}: 개인 장기 상태와 대운에 따른 큰 결정을 단정하지 않는다`, () => withLanguage(lang, () => {
    const c = buildChart(input(1990, 'F')), today = { y: 2026, m: 10, d: 24 };
    const html = lifeView(lifetime(c, today), c, today);
    assert.doesNotMatch(html, /장기 과열|쪽의 과열|건강을 꾸준히 챙겨야|높은 대운에 큰 결정|strain around the/);
    assert.match(html, lang === 'ko' ? /건강 상태를 판단하지 않습니다/ : /does not assess your health/);
    for (let i = 1; i <= 28; i++) {
      const text = day(c, { ...today, d: i }, 'today').cats.find(cat => cat.key === 'health').text;
      assert.doesNotMatch(text, /건강 상태가 안정|회복력이 좋아|수술·주사|신경성 소화불량|좋은 의사나 치료법|finding helpful care or treatment/);
    }
  }));
}

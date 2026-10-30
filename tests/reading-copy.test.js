import test from 'node:test';
import assert from 'node:assert/strict';
import { DAILY_OUTLOOK } from '../src/content/daily-outlook.js';
import { READING_ACTIONS } from '../src/content/reading-actions.js';
import { READING_HEADLINES } from '../src/content/reading-headlines.js';
import { readingAction } from '../src/domain/reading.js';
import { parseShare } from '../src/site/pages/share.js';
import { withLanguage } from '../src/i18n/runtime.js';
import { zodiacOutlook } from '../src/domain/zodiac-outlook.js';

test('좋은 금전·대인운은 관리 지시보다 기대할 장면을 먼저 말한다', () => {
  for (const band of ['high', 'good']) {
    assert.match(DAILY_OUTLOOK.money[band][0][0], /선물|보답|수입|이득|횡재/);
    assert.match(DAILY_OUTLOOK.social[band][0][0], /연락|초대|내 편|도움|반가운/);
    assert.doesNotMatch(DAILY_OUTLOOK.money[band].slice(0, 2).flat().join(' '), /자동 결제|영수증|작은 낭비|recurring costs|automatic payments/);
  }
  for (const rows of Object.values(READING_ACTIONS)) for (const row of rows) {
    assert.ok(row[3][0].split('. ').length >= 2, '장면에 이어 가벼운 제안을 덧붙인다');
  }
  for (let cycle = 0; cycle < 180; cycle++) {
    const r = readingAction('money', 85, { cycle, identity: 'copy-regression' });
    assert.doesNotMatch(r.headline + r.text, /영수증|청구서|정기 결제|자동 결제|내역 확인/);
  }
  assert.doesNotMatch(JSON.stringify(READING_HEADLINES), /영수증|receipts/);
});

test('예전 영수증 제목으로 발급한 공유 링크도 한영으로 열린다', () => {
  const q = new URLSearchParams({ k: 'today', s: '80', h: '청구서와 영수증을 맞춰 볼 차례' });
  assert.equal(parseShare(q)?.title, q.get('h'));
  assert.equal(withLanguage('en', () => parseShare(q))?.title, 'Match the bill against your receipts');
});

test('띠별 풀이의 59·60점 경계에서 같은 재물·협업 요인도 다른 강도로 풀린다', () => {
  for (const lang of ['ko', 'en']) withLanguage(lang, () => {
    for (const rel of ['합', '삼합', '같음', '충', '형', '원진', '해', '파', '없음']) {
      for (let e = 0; e < 5; e++) for (let es = 0; es < 5; es++) {
        const low = zodiacOutlook({ rel, e, es, score: 59 });
        const good = zodiacOutlook({ rel, e, es, score: 60 });
        assert.notEqual(low.outlook, good.outlook);
        assert.equal(low.caution, good.caution, '관계·오행의 실제 주의 요인은 보존');
        assert.doesNotMatch(low.outlook, /횡재수|뜻밖의 선물|windfall|paid task/);
      }
    }
    const money = zodiacOutlook({ rel: '없음', e: 2, es: 2, score: 75 });
    assert.match(money.outlook, lang === 'ko' ? /보답|선물/ : /reward|gift/);
  });
});

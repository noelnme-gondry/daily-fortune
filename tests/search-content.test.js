import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { createSite } from '../src/site/render.js';
import { EXAMPLE_INPUT, MANSE_BOUNDARIES } from '../src/site/public-examples.js';
import { UNKNOWN_TIME } from '../src/content/calculation-notes.js';
import { SITE } from '../src/content/pages.js';
import { buildChart, day, addDays, isoDate, year, yearMonths, pillarKo, pillarLabel } from '../src/engine/index.js';
import { withLanguage } from '../src/i18n/runtime.js';
import { siteValue } from '../src/site/copy.js';
import { esc } from '../src/site/util.js';

const origin = 'https://makeyourownday-fortune.com';
const site = createSite({ site: origin, assets: { js: '/app.js', css: '/app.css' }, now: Date.UTC(2026, 9, 15, 3) });
const core = ['/today/', '/manseryeok/', '/year/2027/', '/tojeong/2027/', '/about/'];

test('핵심 5개는 초기 HTML·자기 canonical·색인 허용·사이트맵과 일관된 브랜드를 제공한다', () => {
  assert.equal(site.routes.filter((r) => !r.lang).length, 202, '기존 한국어 경로를 유지한다');
  assert.equal(site.routes.filter((r) => r.lang === 'en').length, 202, '각 경로에 대응하는 영어판을 제공한다');
  for (const path of core) {
    const html = site.render(path);
    assert.ok(html.includes(`<link rel="canonical" href="${origin}${path}">`));
    assert.ok(html.includes('content="index,follow'));
    assert.ok(site.sitemap().includes(`<loc>${origin}${path}</loc>`));
    const graph = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])['@graph'];
    assert.equal(graph.find((n) => n['@type'] === 'Organization').name, SITE.name);
    assert.equal((html.match(/<h1[ >]/g) || []).length, 1);
    assert.doesNotMatch(html, /자녀운과 말년운의 정확도만|undefined|NaN/);
  }
});

test('공개 가상 사례의 원국·연간·월별 값은 변경 전 엔진 기준값을 유지한다', () => {
  const c = buildChart({ ...EXAMPLE_INPUT }), r = year(c, 2027, 'next');
  assert.deepEqual(c.cols.map(pillarKo), ['경오', '신사', '임오', '정미']);
  assert.deepEqual(c.counts, [0, 4, 1, 2, 1]);
  assert.equal(r.overall.score, 58);
  assert.deepEqual(r.cats.map((c) => c.score), [60, 57, 75, 39, 53, 64, 49]);
  assert.deepEqual(yearMonths(c, 2027).map((m) => m.score), [45, 66, 63, 42, 46, 39, 56, 57, 65, 51, 79, 75]);
  const mhtml = site.render('/manseryeok/'), yhtml = site.render('/year/2027/');
  for (const p of c.cols) assert.ok(mhtml.includes(`<td>${pillarLabel(p)}</td>`));
  for (const m of yearMonths(c, 2027)) assert.ok(yhtml.includes(`<th scope="row">${m.m}월</th><td>${pillarLabel(m.pillar)}</td><td>${m.score}점</td>`));
  assert.ok(yhtml.includes(`<b data-example-overall>${r.overall.score}점</b>`));
  for (const html of [mhtml, yhtml]) {
    assert.match(html, /가상의 입력이며 실존 인물이나 이용자의 저장 정보가 아닙니다/);
    for (const heading of ['입력 예시', '실제 계산 결과', '읽는 방법', '해석의 한계']) assert.ok(html.includes(`<h3>${heading}</h3>`));
    assert.match(html, /href="#tool" data-ga-cta="public_example"/);
  }
});

test('만세력 경계 사례는 두 입력의 엔진값과 달라진 모든 기둥을 KR/EN 초기 HTML에 표시한다', () => {
  const golden = [
    [['기사', '정축', '경자', '신사'], ['경오', '무인', '경자', '임오']],
    [['기묘', '병자', '정사', '신해'], ['기묘', '병자', '무오', '임자']],
  ];
  for (const lang of ['ko', 'en']) withLanguage(lang, () => {
    const html = site.render(`${lang === 'en' ? '/en' : ''}/manseryeok/`);
    MANSE_BOUNDARIES.forEach(({ id, input, times }, n) => {
      const charts = times.map((time) => buildChart({ ...input, time }));
      assert.deepEqual(charts.map((c) => c.cols.map(pillarKo)), golden[n]);
      const section = html.match(new RegExp(`<section[^>]*data-boundary="${id}"[\\s\\S]*?</section>`))[0];
      charts[0].cols.forEach((p, i) => {
        const q = charts[1].cols[i], changed = p.s !== q.s || p.b !== q.b;
        assert.ok(section.includes(`<td>${pillarLabel(p)}</td><td>${pillarLabel(q)}</td>`));
        assert.equal((section.match(/data-changed="true"/g) || []).length, n === 0 ? 3 : 2);
        assert.ok(section.includes(`data-changed="${changed}"`));
      });
      for (const time of times) assert.ok(section.includes(time));
      assert.ok(section.includes(`aria-describedby="example-${id}-hint"`));
    });
    assert.ok(html.includes(`href="${lang === 'en' ? '/en' : ''}/about/#birth-rules"`));
    assert.match(html, lang === 'en' ? /do not move the birth date forward/ : /날짜를 다음 날로 바꾸지 않습니다/);
  });
});

test('월별 비교의 점수·십신·강점·해설은 현재·다음 연도의 기존 월별 결과에서 나온다', () => {
  for (const currentYear of [2026, 2027]) {
    const s = createSite({ site: origin, assets: {}, now: Date.UTC(currentYear, 9, 15, 3) });
    for (const y of [currentYear, currentYear + 1]) for (const lang of ['ko', 'en']) withLanguage(lang, () => {
      const prefix = lang === 'en' ? '/en' : '', points = lang === 'en' ? ' points' : '점';
      const html = s.render(`${prefix}/year/${y}/`);
      const months = yearMonths(buildChart({ ...EXAMPLE_INPUT }), y).filter((m) => [5, 11].includes(m.m));
      assert.equal((html.match(/data-example-month=/g) || []).length, 2);
      for (const m of months) {
        const section = html.match(new RegExp(`<section[^>]*data-example-month="${m.m}"[\\s\\S]*?</section>`))[0];
        assert.ok(section.includes(m.pillarText));
        assert.ok(section.includes(`data-month-score>${m.score}${points}</b>`));
        assert.ok(section.includes(`data-month-best>${m.best.name} ${m.best.score}${points}</b>`));
        assert.ok(section.includes(`<p data-month-explanation>${esc(m.text)}</p>`));
        for (const tg of [m.tgS, m.tgB]) assert.ok(section.includes(`>${siteValue(tg)}</a>`));
        for (const [, href] of section.matchAll(/href="([^"]+)"/g)) {
          assert.ok(href.startsWith(`${prefix}/saju/sipsin/`));
          assert.ok(s.routes.some((r) => r.path === href), href);
        }
        if (lang === 'en') assert.doesNotMatch(section, /[가-힣]/);
      }
      assert.match(html, lang === 'en' ? /not everyone’s best or worst months/ : /모든 사람의 최고·최저 월을 뜻하지 않습니다/);
    });
  }
});

test('시간 미상은 시주를 제외하며 전체 점수가 달라짐을 설명한다', () => {
  const c = buildChart({ ...EXAMPLE_INPUT, time: null });
  assert.equal(c.pillars.hour, null);
  assert.equal(c.cols.length, 3);
  assert.deepEqual(c.counts, [0, 3, 0, 2, 1]);
  assert.equal(year(c, 2027).overall.score, 62);
  for (const path of ['/manseryeok/', '/year/2027/', '/about/']) {
    assert.ok(site.render(path).includes(UNKNOWN_TIME.summary));
    assert.ok(site.render(path).includes(UNKNOWN_TIME.boundary));
  }
  // 절입 당일의 정오 대체값이 실제 오전 출생을 확정해 주지 않는다는 회귀 사례.
  const input = { ...EXAMPLE_INPUT, m: 2, d: 4 };
  const before = buildChart({ ...input, time: '10:30' });
  const unknown = buildChart({ ...input, time: null });
  assert.notDeepEqual(before.pillars.year, unknown.pillars.year);
});

test('오늘·내일의 공개 예시는 해당 날짜의 실제 개인 운세와 같고 한국 날짜 경계를 따른다', () => {
  const beforeMidnight = Date.UTC(2026, 11, 31, 14, 59);
  for (const now of [beforeMidnight, beforeMidnight + 60_000]) {
    const s = createSite({ site: origin, assets: {}, now });
    for (const lang of ['ko', 'en']) {
      withLanguage(lang, () => {
        const c = buildChart({ ...EXAMPLE_INPUT });
        for (const mode of ['today', 'tomorrow']) {
          const date = mode === 'today' ? s.ctx.today : addDays(s.ctx.today, 1);
          const result = day(c, date, mode);
          const path = `${lang === 'en' ? '/en' : ''}/${mode}/`;
          const html = s.render(path);
          assert.ok(html.includes(`data-example-date="${isoDate(date)}"`), path);
          assert.ok(html.includes(`<b data-example-overall>${result.overall.score}${lang === 'en' ? ' points' : '점'}</b>`), path);
          for (const cat of result.cats) {
            assert.ok(html.includes(`<th scope="row">${cat.name}</th><td>${cat.score}${lang === 'en' ? ' points' : '점'}</td>`), path);
          }
          assert.ok(html.includes(result.overall.text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')), path);
          assert.ok(html.includes('href="#public-example"'), path);
          assert.ok(html.includes('href="#tool" data-ga-cta="public_example"'), path);
          assert.ok(html.includes(lang === 'en' ? 'Scores are neither success probabilities' : '점수는 성공 확률이나 예측 정확도가 아닙니다'), path);
          assert.ok(html.indexOf('class="partner-ad"') < html.indexOf('id="public-example"'), path);
        }
      });
    }
  }
});

test('공개 설명을 추가해도 수동 AdSense와 공통 배너의 기존 본문 순서는 유지한다', () => {
  const keys = ['ADSENSE_CLIENT', 'ADSENSE_SLOT_INLINE', 'ADSENSE_SLOT_BOTTOM'];
  const previous = keys.map((key) => process.env[key]);
  try {
    process.env.ADSENSE_CLIENT = 'ca-pub-test';
    process.env.ADSENSE_SLOT_INLINE = 'inline-test';
    process.env.ADSENSE_SLOT_BOTTOM = 'bottom-test';
    const s = createSite({ site: origin, assets: {}, now: Date.UTC(2026, 9, 15, 3) });
    for (const path of ['/manseryeok/', '/year/2027/']) {
      const html = s.render(path);
      const tool = html.indexOf('id="tool"'), inline = html.indexOf('class="ad ad-inline"');
      const info = html.indexOf('class="info-panels"'), bottom = html.indexOf('class="ad ad-bottom"');
      const common = html.indexOf('class="partner-ad"'), example = html.indexOf('id="public-example"');
      assert.ok(tool < inline && inline < info && info < bottom && bottom < common && common < example);
    }
  } finally {
    keys.forEach((key, i) => { if (previous[i] === undefined) delete process.env[key]; else process.env[key] = previous[i]; });
  }
});

test('연간 네 기능의 제목·설명은 다르고 비교표는 같은 연도의 실제 라우트를 연결한다', () => {
  for (const y of [2026, 2027]) {
    const paths = [`/year/${y}/`, y === 2026 ? '/tojeong/' : `/tojeong/${y}/`, `/tti/${y}/`, `/manseryeok/${y}/`];
    assert.equal(new Set(paths.map((p) => site.page(p).title)).size, 4);
    assert.equal(new Set(paths.map((p) => site.page(p).description)).size, 4);
    for (const path of paths) {
      const html = site.render(path);
      assert.match(html, /신년운세·토정비결·띠별 운세·만세력의 차이/);
      for (const other of paths.filter((p) => p !== path)) assert.ok(html.includes(`href="${other}"`));
      for (const anchor of ['tojeong', 'limits']) {
        assert.ok(html.includes(`href="/about/#${anchor}"`));
        assert.ok(site.render('/about/').includes(`id="${anchor}"`));
      }
    }
  }
});

test('GA 설정은 공유 페이지와 referrer의 이름·개인 결과를 제거하고 표준 캠페인만 유지한다', () => {
  const previous = process.env.GA_MEASUREMENT_ID;
  process.env.GA_MEASUREMENT_ID = 'G-SEARCHTEST';
  try {
    const s = createSite({ site: origin, assets: {}, now: Date.UTC(2026, 9, 15, 3) });
    const html = s.renderShare(new URLSearchParams({ k: 'rank', n: '가상비밀', s: '67.1', r: '95445', w: '1', t: 'B' }));
    const script = html.match(/<script>(window.dataLayer=.*?)<\/script>/s)[1];
    const context = { window: {}, location: { href: `${origin}/share/?n=가상비밀&s=67.1&utm_birth=19900517&utm_source=test#14:30` }, document: { title: '가상비밀님의 결과', referrer: `${origin}/share/?n=가상비밀&s=67.1` }, URL, URLSearchParams };
    context.window = context;
    vm.runInNewContext(script, context);
    const config = context.dataLayer.find((a) => a[0] === 'config')[2];
    assert.equal(config.page_location, `${origin}/share/?utm_source=test`);
    assert.equal(config.page_referrer, `${origin}/share/`);
    assert.doesNotMatch(JSON.stringify(config), /가상비밀|67\.1|19900517|14:30/);
  } finally {
    if (previous === undefined) delete process.env.GA_MEASUREMENT_ID;
    else process.env.GA_MEASUREMENT_ID = previous;
  }
});

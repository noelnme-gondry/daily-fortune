// 사이트 렌더러: 경로 → HTML. 빌드(정적 생성), 개발 서버, 운영 서버가 모두 이 모듈을 쓴다.
import { todayKST, isoDate, ANIMAL_SLUG, STEM_SLUG, TG_SLUG, EL_SLUG, sexagenary, iljuSlug, pillarKo, pillarH, pillarLabel, yearPillar, ANIMAL } from '../engine/index.js';
import { SINSAL, ILJU_TAG, SIPSIN, GLOSSARY } from '../content/knowledge.js';
import T from '../content/text.js';
import { SITE, TOOLS, ABOUT, TTI_COPY, FREE_ACCESS } from '../content/pages.js';
import { TOJEONG } from '../content/tojeong.js';
import { layout } from './layout.js';
import { esc } from './util.js';
import * as tools from './pages/tools.js';
import * as saju from './pages/saju.js';
import * as tti from './pages/tti.js';
import * as manse from './pages/manse.js';
import * as info from './pages/info.js';
import { tojeongPage } from './pages/tojeong.js';
import { sharePage } from './pages/share.js';
import { config } from './config.js';

// 콘텐츠(백과·도구 문구)를 마지막으로 고친 날. 해설을 손보면 함께 올린다.
export const CONTENT_UPDATED = '2026-10-15';
export const PUBLISHED = '2026-10-14';

function routeTable(ctx) {
  const y = ctx.today.y;
  const years = [y, y + 1];
  const R = [];
  const add = (path, fn, o = {}) => R.push({ path, fn, priority: o.p ?? 0.6, changefreq: o.cf ?? 'monthly', daily: !!o.daily, feed: !!o.feed });
  add('/', tools.home, { p: 1, cf: 'daily', daily: true });
  add('/today/', tools.today, { p: 0.9, cf: 'daily', daily: true });
  add('/tomorrow/', tools.tomorrow, { p: 0.8, cf: 'daily', daily: true });
  add('/week/', tools.week, { p: 0.8, cf: 'weekly', daily: true });
  add('/month/', tools.month, { p: 0.8, cf: 'monthly', daily: true });
  add('/year/', tools.yearHub, { p: 0.7 });
  for (const yr of years) add(`/year/${yr}/`, (c) => tools.yearPage(yr, c), { p: 0.9 });
  add('/tojeong/', tojeongPage, { p: 0.9 });
  add(`/tojeong/${y + 1}/`, (c) => tojeongPage(c, y + 1), { p: 0.8 });
  add('/lifetime/', tools.lifetime, { p: 0.9 });
  add('/compatibility/', tools.compatibility, { p: 0.9 });
  add('/life-story/', tools.story, { p: 0.9 });
  add('/saju-ranking/', tools.rank, { p: 0.9 });
  add('/manseryeok/', tools.manseryeok, { p: 0.8 });
  for (const yr of years) {
    add(`/manseryeok/${yr}/`, (c) => manse.manseYear(yr, c), { p: 0.6 });
    for (let m = 1; m <= 12; m++) add(`/manseryeok/${yr}/${m}/`, (c) => manse.manseMonth(yr, m, c), { p: 0.5 });
  }
  add('/tti/', tti.hub, { p: 0.8, cf: 'daily', daily: true });
  add('/tti/today/', tti.today, { p: 0.8, cf: 'daily', daily: true });
  for (let t = 0; t < 12; t++) {
    add(`/tti/today/${ANIMAL_SLUG[t]}/`, (c) => tti.animalDay(t, c), { p: 0.7, cf: 'daily', daily: true });
    add(`/tti/tomorrow/${ANIMAL_SLUG[t]}/`, (c) => tti.animalDay(t, c, true), { p: 0.5, cf: 'daily', daily: true });
  }
  for (const yr of years) {
    add(`/tti/${yr}/`, (c) => tti.yearIndex(yr, c), { p: 0.8 });
    for (let t = 0; t < 12; t++) add(`/tti/${yr}/${ANIMAL_SLUG[t]}/`, (c) => tti.animalYear(t, yr, c), { p: 0.7 });
  }
  add('/tti/samjae/', tti.samjae, { p: 0.7 });
  add('/tti/compatibility/', tti.compat, { p: 0.7 });
  add('/saju/', saju.hub, { p: 0.7 });
  add('/saju/ilju/', saju.iljuIndex, { p: 0.7 });
  add('/saju/ilju-ranking/', saju.iljuRanking, { p: 0.7, feed: true });
  for (let n = 0; n < 60; n++) add(`/saju/ilju/${iljuSlug(sexagenary(n))}/`, (c) => saju.iljuPage(n, c), { p: 0.6, feed: true });
  add('/saju/ilgan/', saju.ilganIndex, { p: 0.6 });
  for (let s = 0; s < 10; s++) add(`/saju/ilgan/${STEM_SLUG[s]}/`, (c) => saju.ilganPage(s, c), { p: 0.6, feed: true });
  add('/saju/sipsin/', saju.sipsinIndex, { p: 0.6 });
  for (let i = 0; i < 10; i++) add(`/saju/sipsin/${TG_SLUG[i]}/`, (c) => saju.sipsinPage(i, c), { p: 0.6, feed: true });
  add('/saju/ohaeng/', saju.ohaengIndex, { p: 0.6 });
  for (let e = 0; e < 5; e++) add(`/saju/ohaeng/${EL_SLUG[e]}/`, (c) => saju.ohaengPage(e, c), { p: 0.6, feed: true });
  add('/saju/sinsal/', saju.sinsalIndex, { p: 0.6 });
  SINSAL.forEach((s, i) => add(`/saju/sinsal/${s.slug}/`, (c) => saju.sinsalPage(i, c), { p: 0.6, feed: true }));
  add('/saju/12unseong/', saju.unseong, { p: 0.5, feed: true });
  add('/saju/glossary/', saju.glossary, { p: 0.6, feed: true });
  add('/saju/guide/', saju.guide, { p: 0.6, feed: true });
  add('/about/', info.about, { p: 0.4 });
  add('/privacy/', info.privacy, { p: 0.2, cf: 'yearly' });
  return R;
}

export function createSite({ site, assets, now = Date.now() }) {
  const today = todayKST(now);
  const ctx = { site, assets, today, todayISO: isoDate(today), buildDate: CONTENT_UPDATED, published: PUBLISHED, cfg: config() };
  const routes = routeTable(ctx);
  const byPath = new Map(routes.map((r) => [r.path, r]));
  const pageCache = new Map();
  const page = (path) => {
    if (!pageCache.has(path)) {
      const r = byPath.get(path);
      const p = r.fn(ctx);
      if (r.daily) p.modified = ctx.todayISO;
      pageCache.set(path, p);
    }
    return pageCache.get(path);
  };
  const lastmod = (r) => (r.daily ? ctx.todayISO : CONTENT_UPDATED);

  // 같은 내용을 두 주소로 두지 않는다: 올해 연도의 토정비결 주소는 /tojeong/으로 보낸다.
  const redirects = new Map([[`/tojeong/${ctx.today.y}/`, '/tojeong/']]);
  return {
    ctx, routes,
    has: (path) => byPath.has(path),
    redirect: (path) => redirects.get(path) || null,
    page,
    render(path) {
      if (!byPath.has(path)) return null;
      return layout(page(path), ctx);
    },
    notFound: () => layout(info.notFound(), ctx),
    // 공유 카드: 쿼리마다 달라 캐시하지 않는다
    renderShare(searchParams) {
      const p = sharePage(searchParams, ctx);
      if (searchParams && [...searchParams.keys()].length) p.ogPath = `/share/?${searchParams.toString()}`;
      return layout(p, ctx);
    },
    adsTxt() {
      const a = ctx.cfg.adsense;
      return a ? `google.com, ${a.pub}, DIRECT, f08c47fec0942fa0\n` : '';
    },
    sitemap() {
      const urls = routes.map((r) => `  <url><loc>${site}${r.path}</loc><lastmod>${lastmod(r)}</lastmod><changefreq>${r.changefreq}</changefreq><priority>${r.priority.toFixed(1)}</priority></url>`).join('\n');
      return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
    },
    robots() {
      const bots = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended', 'Yeti', 'Daumoa', 'Bingbot'];
      return `# ${SITE.name} — 검색엔진과 AI 답변 엔진의 수집을 모두 허용합니다\nUser-agent: *\nAllow: /\n\n${bots.map((b) => `User-agent: ${b}\nAllow: /`).join('\n\n')}\n\nSitemap: ${site}/sitemap.xml\n`;
    },
    rss() {
      const items = routes.filter((r) => r.feed).map((r) => {
        const p = page(r.path);
        return `    <item><title>${esc(p.title)}</title><link>${site}${r.path}</link><guid isPermaLink="true">${site}${r.path}</guid><description>${esc(p.description)}</description><pubDate>${new Date(`${PUBLISHED}T09:00:00+09:00`).toUTCString()}</pubDate></item>`;
      }).join('\n');
      return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n  <channel>\n    <title>${SITE.name} 사주 백과</title>\n    <link>${site}/saju/</link>\n    <atom:link href="${site}/rss.xml" rel="self" type="application/rss+xml"/>\n    <description>${esc(SITE.description)}</description>\n    <language>ko</language>\n    <lastBuildDate>${new Date(`${CONTENT_UPDATED}T09:00:00+09:00`).toUTCString()}</lastBuildDate>\n${items}\n  </channel>\n</rss>\n`;
    },
    llms() { return llmsTxt(ctx, routes, page); },
    llmsFull() { return llmsFull(ctx); },
  };
}

/* ── 보조 요약: llms.txt (검색·AI 인용을 보장하는 규격은 아님) ───── */
function llmsTxt(ctx, routes, page) {
  const { site } = ctx;
  const y = ctx.today.y;
  const line = (path) => { const p = page(path); return `- [${p.h1 || p.title}](${site}${path}): ${p.description}`; };
  const pick = (pred) => routes.filter((r) => pred(r.path)).map((r) => line(r.path)).join('\n');
  return `# ${SITE.name} (${SITE.alt})

> ${SITE.description}

${SITE.name}는 한국어 사주명리 운세 사이트입니다. 생년월일시와 성별로 사주 원국(년주·월주·일주·시주)을 세우고, 기간의 간지(일진·월운·세운·대운)가 원국과 맺는 십신·합충형·12운성·신살·용신 관계를 0~100점 점수와 해설로 바꿉니다. 같은 입력이면 항상 같은 결과가 나오며(난수 미사용), 계산은 사용자의 브라우저에서 이루어집니다. 계산 규칙은 ${site}/about/ 에 공개되어 있습니다.

주요 사실:
- 이용 요금: ${FREE_ACCESS.description}
- 무료 토정비결은 음력 생년월일로 144괘를 구해 총운과 음력 12개월 한글 해설을 모두 제공합니다. 생시·성별을 사용하지 않으며 사주 신년운세와 별도 계산입니다. ${site}/tojeong/
- 년주는 입춘, 월주는 절기 절입 시각으로 바뀝니다. 시주는 동경 127.5° 평균태양시로 정하며, 현행 한국 표준시(UTC+9)·서머타임 미적용 기준으로 30분을 뺍니다. 이 기준에서 밤 11시 30분부터 다음 날 자시이며, 과거 표준시·서머타임 기간에는 경계가 달라집니다. 출생지별 진태양시는 계산하지 않습니다.
- 시간 미상 처리와 한계: ${site}/about/#unknown-time . 시주를 제외하면 전체 오행·용신·운세 점수가 달라질 수 있으며 예측 정확도를 보장하지 않습니다.
- 시진만 아는 경우 출생일의 표준시·서머타임에 맞춘 시계 기준 구간(평시 자시 23:30~01:30, 축시 01:30~03:30 …)에서 고르며, 구간 가운데 시각으로 같은 보정을 거쳐 계산합니다.
- 한국 서머타임(1948–51, 1955–60, 1987–88)과 1954–61년 UTC+8:30 표준시를 보정합니다. 음력은 한국천문연구원 기준입니다.
- ${y}년은 ${pillarLabel(yearPillar(y))}년, ${y + 1}년은 ${pillarLabel(yearPillar(y + 1))}년입니다.

## 운세 계산기
${pick((p) => ['/today/', '/tomorrow/', '/week/', '/month/', `/year/${y}/`, `/year/${y + 1}/`, '/tojeong/', `/tojeong/${y + 1}/`, '/lifetime/', '/compatibility/', '/manseryeok/'].includes(p))}

## 재미로 보는 사주
${pick((p) => ['/life-story/', '/saju-ranking/', '/saju/ilju-ranking/'].includes(p))}

## 띠별 운세
${pick((p) => p === '/tti/' || p === '/tti/today/' || p === `/tti/${y}/` || p === `/tti/${y + 1}/` || p === '/tti/samjae/' || p === '/tti/compatibility/')}

## 사주 백과
${pick((p) => /^\/saju\/[a-z0-9-]*\/?$/.test(p) && p.split('/').length <= 4)}

## 일주·십신·신살 상세
${pick((p) => /^\/saju\/(sipsin|sinsal|ohaeng|ilgan)\/[a-z-]+\/$/.test(p))}
- 60일주 상세: ${site}/saju/ilju/{slug}/ (예: ${site}/saju/ilju/gapja/ 갑자일주 … ${site}/saju/ilju/gyehae/ 계해일주)

## Optional
- [전체 요약본](${site}/llms-full.txt): 계산 규칙, 용어 사전, 십신·오행·신살·60일주 요약을 한 파일로 정리
- [사이트맵](${site}/sitemap.xml)
- [소개 · 계산 방법](${site}/about/)
`;
}

function llmsFull(ctx) {
  const { site } = ctx;
  const out = [`# ${SITE.name} 전체 요약`, '', `> ${SITE.description}`, '', `출처: ${site}/ · 최종 업데이트 ${CONTENT_UPDATED}`, ''];
  out.push('## 계산 방법', '', ABOUT.lead, '');
  for (const s of ABOUT.sections) { out.push(`### ${s.h}`, ...s.items.map((i) => `- ${i}`), ''); }
  out.push('## 무료 토정비결', '', TOJEONG.lead, TOJEONG.convention, TOJEONG.readingNote, TOJEONG.editionNote, `이용: ${site}/tojeong/`, `해설 출처 (MIT): ${TOJEONG.source}`, '');
  for (const f of TOJEONG.faq) out.push(`### ${f.q}`, f.a, '');
  out.push('## 사주 용어 사전', '');
  for (const g of GLOSSARY) out.push(`- **${g.term}(${g.hanja})**: ${g.def}`);
  out.push('', '## 일간 10가지', '');
  T.dayMaster.forEach((d, s) => out.push(`- **${d.title}** (${site}/saju/ilgan/${STEM_SLUG[s]}/): ${d.image}. ${d.summary}`));
  out.push('', '## 십신', '');
  Object.entries(SIPSIN).forEach(([t, d], i) => out.push(`- **${t}** (${site}/saju/sipsin/${TG_SLUG[i]}/): ${d.formula}. ${d.summary}`));
  out.push('', '## 오행', '');
  T.element.forEach((e, i) => out.push(`- **${e.name}(${e.hanja})** (${site}/saju/ohaeng/${EL_SLUG[i]}/): ${e.nature}. 색 ${e.color.join('·')}, 숫자 ${e.number.join('·')}, 방향 ${e.dir}, 신체 ${e.organ}.`));
  out.push('', '## 신살', '');
  SINSAL.forEach((s) => out.push(`- **${s.name}(${s.hanja})** (${site}/saju/sinsal/${s.slug}/): ${s.summary} 찾는 법: ${s.how}`));
  out.push('', '## 60일주', '');
  for (let n = 0; n < 60; n++) { const p = sexagenary(n); out.push(`- **${pillarKo(p)}일주(${pillarH(p)})** (${site}/saju/ilju/${iljuSlug(p)}/): ${ILJU_TAG[n]}`); }
  out.push('', '## 띠', '');
  ANIMAL.forEach((a, t) => out.push(`- **${a}띠**: ${site}/tti/${ctx.today.y}/${ANIMAL_SLUG[t]}/`));
  out.push('', `띠별 운세 개요: ${TTI_COPY.hub.lead}`, '', `운세 도구 목록: ${Object.values(TOOLS).map((t) => `${t.h1}(${site}${t.path})`).join(', ')}`, '');
  return out.join('\n');
}

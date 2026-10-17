// 공통 HTML 뼈대: 메타 태그, Open Graph, JSON-LD(@graph), 헤더 내비게이션, 이동 경로, 푸터
import { SITE } from '../content/pages.js';
import { BRAND } from '../content/brand.js';
import { esc, attr, abs } from './util.js';
import { uiIcon } from './icons.js';
import { ttiNav } from './tti-nav.js';
import { partnerAdSlot } from './partner-ad.js';
import { tr } from '../i18n/runtime.js';
import { languagePath, localizedLinks, localizedHref } from './locale.js';

const labels = {
  '오늘의 운세': 'Today', '내일 운세': 'Tomorrow', '내일의 운세': 'Tomorrow',
  '주간': 'Weekly', '월간': 'Monthly', '이번 주 운세': 'Weekly fortune', '이달의 운세': 'Monthly fortune',
  '평생 운세': 'Lifetime reading', '무료 토정비결': 'Tojeong reading', '내 인생 캐릭터': 'Life character',
  '사주 랭킹': 'Saju ranking', '궁합': 'Compatibility', '띠별 운세': 'Zodiac', '만세력': 'Birth chart',
  '사주 백과': 'Saju guide', '운세': 'Fortunes', '사주 궁합': 'Saju compatibility', '재미로 보는 사주': 'Explore your saju',
  '사주로 본 내 인생은?': 'Your life character', '내 사주 랭킹': 'Your saju ranking', '60일주 랭킹': '60 day-pillar rankings',
  '띠·만세력': 'Zodiac & calendar', '띠별 오늘의 운세': "Today's zodiac fortune", '삼재 띠 계산': 'Samjae years',
  '띠 궁합표': 'Zodiac compatibility', '만세력 계산기': 'Birth chart calculator', '60일주': '60 day pillars',
  '일간 10가지': '10 day masters', '십신': 'Ten Gods', '오행': 'Five Elements', '신살': 'Symbolic stars',
  '12운성': '12 life stages', '사주 용어 사전': 'Saju glossary', '사주 보는 법': 'How to read saju',
  '사이트': 'About', '소개 · 계산 방법': 'About & calculations', '개인정보처리방침': 'Privacy',
};
const label = (text) => tr(text, labels[text] || text.replace(/^(\d{4})년 (운세|띠별 운세|만세력)$/, (_, year, kind) => kind === '운세' ? year : `${year} ${kind === '띠별 운세' ? 'zodiac' : 'calendar'}`));

export function navItems(ctx) {
  const y = ctx.today.y;
  return [
    ['/today/', '오늘의 운세'], ['/tomorrow/', '내일 운세'], ['/week/', '주간'], ['/month/', '월간'],
    [`/year/${y}/`, `${y}년 운세`], [`/year/${y + 1}/`, `${y + 1}년 운세`], ['/lifetime/', '평생 운세'], ['/tojeong/', '무료 토정비결'], ['/life-story/', '내 인생 캐릭터'], ['/saju-ranking/', '사주 랭킹'],
    ['/compatibility/', '궁합'], ['/tti/', '띠별 운세'], ['/manseryeok/', '만세력'], ['/saju/', '사주 백과'],
  ];
}

function navHtml(page, ctx) {
  const current = (path) => page.path === path || page.section === path;
  return navItems(ctx).map(([path, name]) => `<a href="${path}"${current(path) ? ' aria-current="page"' : ''}>${esc(label(name))}</a>`).join('');
}

function footerGroups(ctx) {
  const y = ctx.today.y;
  return [
    ['운세', [['/today/', '오늘의 운세'], ['/tomorrow/', '내일의 운세'], ['/week/', '이번 주 운세'], ['/month/', '이달의 운세'], [`/year/${y}/`, `${y}년 운세`], [`/year/${y + 1}/`, `${y + 1}년 운세`], ['/lifetime/', '평생 운세'], ['/tojeong/', '무료 토정비결'], ['/compatibility/', '사주 궁합']]],
    ['재미로 보는 사주', [['/life-story/', '사주로 본 내 인생은?'], ['/saju-ranking/', '내 사주 랭킹'], ['/saju/ilju-ranking/', '60일주 랭킹']]],
    ['띠·만세력', [['/tti/', '띠별 운세'], ['/tti/today/', '띠별 오늘의 운세'], [`/tti/${y}/`, `${y}년 띠별 운세`], ['/tti/samjae/', '삼재 띠 계산'], ['/tti/compatibility/', '띠 궁합표'], ['/manseryeok/', '만세력 계산기'], [`/manseryeok/${y}/`, `${y}년 만세력`]]],
    ['사주 백과', [['/saju/ilju/', '60일주'], ['/saju/ilgan/', '일간 10가지'], ['/saju/sipsin/', '십신'], ['/saju/ohaeng/', '오행'], ['/saju/sinsal/', '신살'], ['/saju/12unseong/', '12운성'], ['/saju/glossary/', '사주 용어 사전'], ['/saju/guide/', '사주 보는 법']]],
    ['사이트', [['/about/', '소개 · 계산 방법'], ['/privacy/', '개인정보처리방침']]],
  ];
}

function crumbsHtml(crumbs) {
  if (!crumbs || !crumbs.length) return '';
  const all = [[tr('홈', 'Home'), '/'], ...crumbs];
  return `<nav class="crumbs" aria-label="${tr('이동 경로', 'Breadcrumbs')}"><ol>${all.map(([n, p], i) => (i === all.length - 1 ? `<li aria-current="page">${esc(n)}</li>` : `<li><a href="${attr(p)}">${esc(n)}</a></li>`)).join('')}</ol></nav>`;
}

export function graph(page, ctx) {
  const url = abs(ctx, page.canonicalPath || page.path);
  const org = { '@type': 'Organization', '@id': `${ctx.site}/#org`, name: BRAND.name, alternateName: BRAND.alt, url: `${ctx.site}/`, logo: { '@type': 'ImageObject', url: `${ctx.site}/icon-512.png?v=sun`, width: 512, height: 512 } };
  const nodes = [org];
  if (page.path === '/') {
    nodes.push({ '@type': 'WebSite', '@id': `${ctx.site}/#website`, url: `${ctx.site}/`, name: BRAND.name, alternateName: BRAND.alt, description: SITE.description, inLanguage: tr('ko-KR', 'en'), isAccessibleForFree: true, publisher: { '@id': `${ctx.site}/#org` } });
  }
  const webpage = {
    '@type': page.pageType || 'WebPage', '@id': `${url}#webpage`, url, name: page.title, description: page.description, inLanguage: tr('ko-KR', 'en'),
    isPartOf: { '@type': 'WebSite', '@id': `${ctx.site}/#website`, name: BRAND.name, url: `${ctx.site}/` },
    dateModified: page.modified || ctx.buildDate, isAccessibleForFree: true,
  };
  if (page.crumbs && page.crumbs.length) {
    const all = [[tr('홈', 'Home'), '/'], ...page.crumbs];
    webpage.breadcrumb = { '@id': `${url}#breadcrumb` };
    nodes.push({ '@type': 'BreadcrumbList', '@id': `${url}#breadcrumb`, itemListElement: all.map(([n, p], i) => ({ '@type': 'ListItem', position: i + 1, name: n, item: abs(ctx, p) })) });
  }
  nodes.push(webpage);
  for (const n of page.ld || []) if (n) nodes.push(n);
  const localize = (value, key) => {
    if (Array.isArray(value)) return value.map((item) => localize(item));
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, localize(item, key)]));
    if (ctx.lang === 'en' && key === 'inLanguage') return 'en';
    if (typeof value === 'string' && value.startsWith(`${ctx.site}/`)) return `${ctx.site}${localizedHref(value.slice(ctx.site.length), ctx)}`;
    return value;
  };
  return localize({ '@context': 'https://schema.org', '@graph': nodes });
}

function gaSnippet(id, page) {
  // 현재 URL과 이전 페이지의 공유 결과 쿼리를 제거한다. 캠페인 키는 표준 이름만 허용한다.
  return `<script async src="https://www.googletagmanager.com/gtag/js?id=${id}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());(function(){var u=new URL(location.href),k=new URLSearchParams(),ref='';u.searchParams.forEach(function(v,n){if(/^(utm_(source|medium|campaign|id|term|content)|gclid|fbclid)$/.test(n))k.set(n,v)});try{var r=new URL(document.referrer);ref=r.origin+r.pathname}catch(e){}var q=k.toString();gtag('config','${id}',{page_location:u.origin+u.pathname+(q?'?'+q:''),page_referrer:ref,page_title:${JSON.stringify(page.gaTitle || '')}||document.title});})();</script>
`;
}
export function adSlot(ctx, name) {
  const a = ctx.cfg.adsense;
  if (!a || !a.slots[name]) return '';
  return `<aside class="ad ad-${name}" aria-label="${tr('광고', 'Advertisement')}"><span class="ad-label">${tr('광고', 'Advertisement')}</span><ins class="adsbygoogle" style="display:block" data-ad-client="${attr(a.client)}" data-ad-slot="${attr(a.slots[name])}" data-ad-format="auto" data-full-width-responsive="true"></ins></aside>`;
}
function shareBar(page, url) {
  const t = encodeURIComponent(page.ogTitle || page.title);
  const u = encodeURIComponent(url);
  return `<section class="share-bar" aria-label="${tr("이 페이지 공유", "Share this page")}" data-share-page data-url="${attr(url)}" data-title="${attr(page.ogTitle || page.title)}" data-text="${attr(page.description)}">
  <span class="share-k">${tr("이 페이지 공유", "Share this page")}</span>
  <button class="sbtn kakao" type="button" data-share="kakao" hidden>${uiIcon('kakao')}${tr("카카오톡", "KakaoTalk")}</button>
  <button class="sbtn" type="button" data-share="native" hidden>${uiIcon('native')}${tr("공유하기", "Share")}</button>
  <button class="sbtn" type="button" data-share="copy">${uiIcon('copy')}${tr("링크 복사", "Copy link")}</button>
  <a class="sbtn" data-share="x" aria-label="${tr("X에 공유", "Share on X")}" href="https://twitter.com/intent/tweet?text=${t}&amp;url=${u}" target="_blank" rel="noopener">${uiIcon('x')}</a>
  <a class="sbtn" data-share="facebook" href="https://www.facebook.com/sharer/sharer.php?u=${u}" target="_blank" rel="noopener">${uiIcon('facebook')}${tr("페이스북", "Facebook")}</a>
  <a class="sbtn" data-share="band" href="https://band.us/plugin/share?body=${t}%0A${u}&amp;route=${encodeURIComponent(url.split('/').slice(0, 3).join('/'))}" target="_blank" rel="noopener">${uiIcon('band')}${tr("밴드", "BAND")}</a>
  <span class="toast" role="status" aria-live="polite"></span>
</section>`;
}

export function layout(page, ctx) {
  const url = abs(ctx, page.canonicalPath || page.path);
  const ogUrl = page.ogPath ? abs(ctx, page.ogPath) : url;
  const title = page.path === '/' ? page.title : `${page.title} | ${BRAND.name}`;
  const image = page.ogImage || '/og-default.png';
  const img = `${ctx.site}${ctx.lang === 'en' ? image.replace(/\.png$/, '-en.png') : image}?v=sun`;
  const cfg = ctx.cfg;
  const ads = cfg.adsense && !page.noAds;
  const nav = navHtml(page, ctx);
  const foot = footerGroups(ctx).map(([h, links]) => `<div><h2>${esc(label(h))}</h2><ul>${links.map(([p, n]) => `<li><a href="${p}">${esc(label(n))}</a></li>`).join('')}</ul></div>`).join('');
  const ld = JSON.stringify(graph(page, ctx)).replace(/</g, '\\u003c');
  return localizedLinks(`<!doctype html>
<html lang="${ctx.lang || 'ko'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${attr(page.description)}">
<link rel="canonical" href="${attr(url)}">
${page.noindex ? '' : `<link rel="alternate" hreflang="ko" href="${attr(`${ctx.site}${languagePath(page.canonicalPath || page.path, 'ko')}`)}">
<link rel="alternate" hreflang="en" href="${attr(`${ctx.site}${languagePath(page.canonicalPath || page.path, 'en')}`)}">
<link rel="alternate" hreflang="x-default" href="${attr(`${ctx.site}${languagePath(page.canonicalPath || page.path, 'ko')}`)}">`}
<meta name="robots" content="${page.noindex ? 'noindex,follow' : 'index,follow,max-snippet:-1,max-image-preview:large'}">
<meta property="og:type" content="${page.ogType || 'website'}">
<meta property="og:site_name" content="${BRAND.name}">
<meta property="og:locale" content="${tr('ko_KR', 'en_US')}">
<meta property="og:title" content="${attr(page.ogTitle || page.title)}">
<meta property="og:description" content="${attr(page.description)}">
<meta property="og:url" content="${attr(ogUrl)}">
<meta property="og:image" content="${img}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${attr(page.ogTitle || page.title)}">
<meta name="twitter:description" content="${attr(page.description)}">
<meta name="twitter:image" content="${img}">
${page.ogType === 'article' ? `<meta property="article:modified_time" content="${page.modified || ctx.buildDate}">\n` : ''}${cfg.naverVerify ? `<meta name="naver-site-verification" content="${attr(cfg.naverVerify)}">\n` : ''}${cfg.googleVerify ? `<meta name="google-site-verification" content="${attr(cfg.googleVerify)}">\n` : ''}<meta name="theme-color" content="#2b3a8f" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#101318" media="(prefers-color-scheme: dark)">
<link rel="icon" href="/favicon.ico?v=sun2" sizes="16x16 32x32 48x48">
<link rel="icon" href="/favicon.svg?v=sun2" type="image/svg+xml">
<link rel="icon" href="/favicon-48.png?v=sun2" type="image/png" sizes="48x48">
<link rel="icon" href="/favicon-32.png?v=sun2" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="/apple-touch-icon.png?v=sun">
<link rel="manifest" href="${ctx.lang === 'en' ? '/en' : ''}/site.webmanifest?v=sun">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Hahmlet:wght@500;700&family=IBM+Plex+Sans+KR:wght@400;500;600&family=Noto+Serif+KR:wght@600;900&display=swap">
<link rel="stylesheet" href="${ctx.assets.css}">
${page.tool && ctx.assets.tool ? `<link rel="modulepreload" href="${ctx.assets.tool}">\n` : ''}<script type="application/ld+json">${ld}</script>
${cfg.gaId ? gaSnippet(cfg.gaId, page) : ''}${ads ? `<meta name="google-adsense-account" content="${attr(cfg.adsense.client)}">
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${attr(cfg.adsense.client)}" crossorigin="anonymous"></script>\n` : ''}</head>
<body${page.tool ? ' class="has-tool"' : ''} data-page="${attr(languagePath(page.path, ctx.lang))}">
<a class="skip" href="#main">${tr('본문 바로가기', 'Skip to content')}</a>
<header class="site-head">
  <div class="wrap head-row">
    <a class="brand" href="/" aria-label="${attr(BRAND.name)} ${tr('홈', 'home')}"><img class="brand-logo" src="${BRAND.logo}" alt="" width="48" height="48"><span class="brand-name"><b>${BRAND.name}</b><small>${BRAND.descriptor}</small></span></a>
    <nav class="language-switch" aria-label="${tr('언어 선택', 'Language')}"><a data-set-language="ko" href="${attr(languagePath(page.path, 'ko'))}?lang=ko" lang="ko"${ctx.lang !== 'en' ? ' aria-current="true"' : ''}>한국어</a><a data-set-language="en" href="${attr(languagePath(page.path, 'en'))}?lang=en" lang="en"${ctx.lang === 'en' ? ' aria-current="true"' : ''}>English</a></nav>
  </div>
  <nav class="gnav" aria-label="${tr('주요 메뉴', 'Main navigation')}"><div class="wrap gnav-row">${nav}</div></nav>
</header>
<main id="main" class="wrap">
${crumbsHtml(page.crumbs)}
${page.section === '/tti/' ? `${ttiNav(ctx, page.path)}<div class="tti-content" data-tti-content>${page.body}</div>` : page.body}
${ads ? adSlot(ctx, 'bottom') : ''}
${page.share === false ? '' : shareBar(page, url)}
</main>
${partnerAdSlot(page)}
${page.supplement ? `<aside class="search-supplement wrap" aria-label="${tr('계산 예시와 이용 안내', 'Calculation examples and guidance')}">${page.supplement}</aside>` : ''}
<footer class="site-foot">
  <div class="wrap">
    <div class="foot-groups">${foot}</div>
    <p class="foot-note">${tr(`${BRAND.name}는 생년월일시와 성별만으로 사주 원국을 세우고 운세를 계산합니다. 같은 입력이면 언제나 같은 결과가 나오며, 입력한 정보는 서버로 전송되지 않습니다. 운세는 참고용 콘텐츠입니다.`, `${BRAND.name} uses your birth date, time and gender to calculate a Korean saju reading in your browser. The same inputs produce the same results. Your birth details are not sent to our server. Readings are for reflection and entertainment.`)}</p>
    <p class="foot-note">© ${ctx.today.y} ${BRAND.name}</p>
  </div>
</footer>
<script type="module" src="${ctx.assets.js}"></script>
</body>
</html>
`, ctx);
}

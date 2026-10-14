// 공통 HTML 뼈대: 메타 태그, Open Graph, JSON-LD(@graph), 헤더 내비게이션, 이동 경로, 푸터
import { SITE } from '../content/pages.js';
import { esc, attr, abs } from './util.js';

export function navItems(ctx) {
  const y = ctx.today.y;
  return [
    ['/today/', '오늘의 운세'], ['/tomorrow/', '내일 운세'], ['/week/', '주간'], ['/month/', '월간'],
    [`/year/${y}/`, `${y}년 운세`], [`/year/${y + 1}/`, `${y + 1}년 운세`], ['/lifetime/', '평생 운세'], ['/life-story/', '내 인생 캐릭터'], ['/saju-ranking/', '사주 랭킹'],
    ['/compatibility/', '궁합'], ['/tti/', '띠별 운세'], ['/manseryeok/', '만세력'], ['/saju/', '사주 백과'],
  ];
}

function footerGroups(ctx) {
  const y = ctx.today.y;
  return [
    ['운세', [['/today/', '오늘의 운세'], ['/tomorrow/', '내일의 운세'], ['/week/', '이번 주 운세'], ['/month/', '이달의 운세'], [`/year/${y}/`, `${y}년 운세`], [`/year/${y + 1}/`, `${y + 1}년 운세`], ['/lifetime/', '평생 운세'], ['/compatibility/', '사주 궁합']]],
    ['재미로 보는 사주', [['/life-story/', '사주로 본 내 인생은?'], ['/saju-ranking/', '내 사주 랭킹'], ['/saju/ilju-ranking/', '60일주 랭킹']]],
    ['띠·만세력', [['/tti/', '띠별 운세'], ['/tti/today/', '띠별 오늘의 운세'], [`/tti/${y}/`, `${y}년 띠별 운세`], ['/tti/samjae/', '삼재 띠 계산'], ['/tti/compatibility/', '띠 궁합표'], ['/manseryeok/', '만세력 계산기'], [`/manseryeok/${y}/`, `${y}년 만세력`]]],
    ['사주 백과', [['/saju/ilju/', '60일주'], ['/saju/ilgan/', '일간 10가지'], ['/saju/sipsin/', '십신'], ['/saju/ohaeng/', '오행'], ['/saju/sinsal/', '신살'], ['/saju/12unseong/', '12운성'], ['/saju/glossary/', '사주 용어 사전'], ['/saju/guide/', '사주 보는 법']]],
    ['사이트', [['/about/', '소개 · 계산 방법'], ['/privacy/', '개인정보처리방침'], ['/sitemap.xml', '사이트맵'], ['/llms.txt', 'llms.txt']]],
  ];
}

function crumbsHtml(crumbs) {
  if (!crumbs || !crumbs.length) return '';
  const all = [['홈', '/'], ...crumbs];
  return `<nav class="crumbs" aria-label="이동 경로"><ol>${all.map(([n, p], i) => (i === all.length - 1 ? `<li aria-current="page">${esc(n)}</li>` : `<li><a href="${attr(p)}">${esc(n)}</a></li>`)).join('')}</ol></nav>`;
}

export function graph(page, ctx) {
  const url = abs(ctx, page.canonicalPath || page.path);
  const org = { '@type': 'Organization', '@id': `${ctx.site}/#org`, name: SITE.name, alternateName: SITE.alt, url: `${ctx.site}/`, logo: { '@type': 'ImageObject', url: `${ctx.site}/icon-512.png`, width: 512, height: 512 } };
  const nodes = [org];
  if (page.path === '/') {
    nodes.push({ '@type': 'WebSite', '@id': `${ctx.site}/#website`, url: `${ctx.site}/`, name: SITE.name, alternateName: SITE.alt, description: SITE.description, inLanguage: 'ko-KR', publisher: { '@id': `${ctx.site}/#org` } });
  }
  const webpage = {
    '@type': page.pageType || 'WebPage', '@id': `${url}#webpage`, url, name: page.title, description: page.description, inLanguage: 'ko-KR',
    isPartOf: { '@type': 'WebSite', '@id': `${ctx.site}/#website`, name: SITE.name, url: `${ctx.site}/` },
    dateModified: page.modified || ctx.buildDate,
  };
  if (page.crumbs && page.crumbs.length) {
    const all = [['홈', '/'], ...page.crumbs];
    webpage.breadcrumb = { '@id': `${url}#breadcrumb` };
    nodes.push({ '@type': 'BreadcrumbList', '@id': `${url}#breadcrumb`, itemListElement: all.map(([n, p], i) => ({ '@type': 'ListItem', position: i + 1, name: n, item: abs(ctx, p) })) });
  }
  nodes.push(webpage);
  for (const n of page.ld || []) if (n) nodes.push(n);
  return { '@context': 'https://schema.org', '@graph': nodes };
}

function gaSnippet(id, page) {
  // page_location에서 # 뒤와 쿼리(이름 등)를 지우고 utm·광고 클릭 ID만 남긴다
  return `<script async src="https://www.googletagmanager.com/gtag/js?id=${id}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());(function(){var u=new URL(location.href),k=new URLSearchParams();u.searchParams.forEach(function(v,n){if(/^(utm_|gclid$|fbclid$)/.test(n))k.set(n,v)});var q=k.toString();gtag('config','${id}',{page_location:u.origin+u.pathname+(q?'?'+q:''),page_title:${JSON.stringify(page.gaTitle || '')}||document.title});})();</script>
`;
}
export function adSlot(ctx, name) {
  const a = ctx.cfg.adsense;
  if (!a || !a.slots[name]) return '';
  return `<aside class="ad ad-${name}" aria-label="광고"><span class="ad-label">광고</span><ins class="adsbygoogle" style="display:block" data-ad-client="${attr(a.client)}" data-ad-slot="${attr(a.slots[name])}" data-ad-format="auto" data-full-width-responsive="true"></ins></aside>`;
}
function shareBar(page, url) {
  const t = encodeURIComponent(page.ogTitle || page.title);
  const u = encodeURIComponent(url);
  return `<section class="share-bar" aria-label="이 페이지 공유" data-share-page data-url="${attr(url)}" data-title="${attr(page.ogTitle || page.title)}" data-text="${attr(page.description)}">
  <span class="share-k">이 페이지 공유</span>
  <button class="sbtn kakao" type="button" data-share="kakao" hidden>카카오톡</button>
  <button class="sbtn" type="button" data-share="native" hidden>공유하기</button>
  <button class="sbtn" type="button" data-share="copy">링크 복사</button>
  <a class="sbtn" data-share="x" href="https://twitter.com/intent/tweet?text=${t}&amp;url=${u}" target="_blank" rel="noopener">X</a>
  <a class="sbtn" data-share="facebook" href="https://www.facebook.com/sharer/sharer.php?u=${u}" target="_blank" rel="noopener">페이스북</a>
  <a class="sbtn" data-share="band" href="https://band.us/plugin/share?body=${t}%0A${u}&amp;route=${encodeURIComponent(url.split('/').slice(0, 3).join('/'))}" target="_blank" rel="noopener">밴드</a>
  <span class="toast" role="status" aria-live="polite"></span>
</section>`;
}

export function layout(page, ctx) {
  const url = abs(ctx, page.canonicalPath || page.path);
  const ogUrl = page.ogPath ? abs(ctx, page.ogPath) : url;
  const title = page.path === '/' ? page.title : `${page.title} | ${SITE.name}`;
  const img = `${ctx.site}${page.ogImage || '/og-default.png'}`;
  const cfg = ctx.cfg;
  const ads = cfg.adsense && !page.noAds;
  const nav = navItems(ctx).map(([p, n]) => `<a href="${p}"${page.path === p || (p !== '/' && page.section === p) ? ' aria-current="page"' : ''}>${esc(n)}</a>`).join('');
  const foot = footerGroups(ctx).map(([h, links]) => `<div><h2>${esc(h)}</h2><ul>${links.map(([p, n]) => `<li><a href="${p}">${esc(n)}</a></li>`).join('')}</ul></div>`).join('');
  const ld = JSON.stringify(graph(page, ctx)).replace(/</g, '\\u003c');
  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${attr(page.description)}">
<link rel="canonical" href="${attr(url)}">
<meta name="robots" content="${page.noindex ? 'noindex,follow' : 'index,follow,max-snippet:-1,max-image-preview:large'}">
<meta property="og:type" content="${page.ogType || 'website'}">
<meta property="og:site_name" content="${SITE.name}">
<meta property="og:locale" content="ko_KR">
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
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="alternate" type="application/rss+xml" title="${SITE.name} 사주 백과" href="/rss.xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Hahmlet:wght@500;700&family=IBM+Plex+Sans+KR:wght@400;500;600&family=Noto+Serif+KR:wght@600;900&display=swap">
<link rel="stylesheet" href="${ctx.assets.css}">
${page.tool && ctx.assets.tool ? `<link rel="modulepreload" href="${ctx.assets.tool}">\n` : ''}<script type="application/ld+json">${ld}</script>
${cfg.gaId ? gaSnippet(cfg.gaId, page) : ''}${ads ? `<meta name="google-adsense-account" content="${attr(cfg.adsense.client)}">
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${attr(cfg.adsense.client)}" crossorigin="anonymous"></script>\n` : ''}</head>
<body${page.tool ? ' class="has-tool"' : ''} data-page="${attr(page.path)}">
<a class="skip" href="#main">본문 바로가기</a>
<header class="site-head">
  <div class="wrap head-row">
    <a class="brand" href="/"><span class="seal" aria-hidden="true">運</span><span class="brand-name"><b>${SITE.name}</b><small>사주 오행 운세</small></span></a>
  </div>
  <nav class="gnav" aria-label="주요 메뉴"><div class="wrap gnav-row">${nav}</div></nav>
</header>
<main id="main" class="wrap">
${crumbsHtml(page.crumbs)}
${page.body}
${ads ? adSlot(ctx, 'bottom') : ''}
${page.share === false ? '' : shareBar(page, url)}
</main>
<footer class="site-foot">
  <div class="wrap">
    <div class="foot-groups">${foot}</div>
    <p class="foot-note">${SITE.name}는 생년월일시와 성별만으로 사주 원국을 세우고 운세를 계산합니다. 같은 입력이면 언제나 같은 결과가 나오며, 입력한 정보는 서버로 전송되지 않습니다. 운세는 참고용 콘텐츠입니다.</p>
    <p class="foot-note">© ${ctx.today.y} ${SITE.name}</p>
  </div>
</footer>
<script type="module" src="${ctx.assets.js}"></script>
</body>
</html>
`;
}

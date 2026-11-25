import { FORTUNE_PRODUCTS, fortuneProduct, productEdition } from '../../domain/fortune-products.js';
import { personFields } from '../birth-form.js';
import { esc } from '../util.js';
import { isEnglish } from '../../i18n/runtime.js';
import { productPath } from '../product-path.js';


function contentsBoard(product, compact = false) {
  return `<div class="reading-contents${compact ? ' is-compact' : ''}" aria-label="${product.name} 제공 내용">${product.chapters.map(c => `<div class="reading-contents-cell${c.id === 'closing' ? ' reading-contents-closing' : ''}"><strong>${c.title}</strong>${compact ? '' : `<span>${c.detail}</span>`}</div>`).join('')}<div class="reading-contents-file"><span>전체 상세 풀이</span><span>HTML 파일 보관</span></div></div>`;
}
function englishShop(path, title, product, year) {
  return { path, title, description: `${title}: Korean fortune reports at KRW 990 each, including a detailed reading and an HTML download.`, section: '/shop/', noAds: true, crumbs: [['Fortune reports', '/shop/'], ...(path === '/shop/' ? [] : [[title, path]])], body: `<section class="shop-guide" id="report-start"${product ? ` data-sale-product="${product.id}"` : ''}${year ? ` data-reading-year="${year}"` : ''}><h1>${title}</h1><p class="lead">Fortune products are currently provided in Korean. A one-time purchase of KRW 990 includes one person’s Tojeong, lifetime saju and next year’s annual reading together. A two-person compatibility reading costs KRW 990 separately. Each reading includes an HTML download.</p><p>Payments are handled by NICEPAY. There is no subscription or automatic renewal.</p><p><a class="btn" data-set-language="ko" href="${path}">Continue in Korean</a></p><p>Purchased reports are linked to this browser. Save a copy before clearing cookies or changing devices.</p></section>` };
}

export function productCards(ctx, listId = 'home_reports') {
  const year = ctx.today.y + 1;
  const products = FORTUNE_PRODUCTS.map(product => productEdition(product, year));
  if (isEnglish()) return `<div class="fortune-products">${products.map(p => `<article class="fortune-product" data-commerce-list="${listId}" data-commerce-item="${p.id}"><h3>${p.nameEn}</h3><p>Detailed Korean reading and an offline HTML report.</p><div class="fortune-product-bottom"><p><strong>KRW ${p.price}</strong><small>One-time payment</small></p><a class="btn" data-commerce-select href="${productPath(p.id, ctx.cfg.paidReadings, year)}">View report</a></div></article>`).join('')}</div>`;
  return `<div class="fortune-products">${products.map(p => `<article class="fortune-product" data-commerce-list="${listId}" data-commerce-item="${p.id}"><h3>${p.name}</h3><p>${p.description}</p>${contentsBoard(p, true)}<div class="fortune-product-bottom"><p><strong>${p.price}<span>원</span></strong><small>1회 결제</small></p><a class="btn" data-commerce-select href="${productPath(p.id, ctx.cfg.paidReadings, year)}">${p.name} 선택</a></div></article>`).join('')}</div>`;
}
const shell = (path, title, body) => ({ path, title, description: `${title}. 상품별 990원 단건 결제로 상세 풀이와 HTML 운세 다운로드를 제공합니다.`, section: '/shop/', noAds: true, crumbs: [['운세 상품', '/shop/'], ...(path === '/shop/' ? [] : [[title, path]])], body: `<div class="fortune-shop" lang="ko"><nav class="shop-nav" aria-label="운세 구매 메뉴"><a href="/shop/">운세 상품</a><a href="/shop/orders/">구매 보관함</a></nav>${body}</div>` });

export function shopPage(ctx) {
  if (isEnglish()) return englishShop('/shop/', 'Fortune bundle and compatibility');
  return shell('/shop/', '프리미엄 운세 상품', `<header class="shop-hero"><h1>프리미엄 운세 상품</h1><div><p class="lead">내 운세 세 가지를 한 번에 읽거나, 두 사람의 궁합을 따로 볼 수 있어요.</p><p class="shop-promise">상품별 990원 · 단건 결제 · 운세 다운로드 포함</p></div></header>${productCards(ctx, 'shop_catalog')}<section class="shop-guide"><h2>구매는 이렇게 이어져요</h2><ol><li>상품을 고르고 출생 정보를 입력해요. 무료 미리보기도 볼 수 있어요.</li><li>나이스페이에서 990원을 결제해요.</li><li>상세 풀이를 읽고 운세 파일을 다운로드해요.</li></ol><p>구독이나 자동 갱신은 없습니다. 묶음 한 건은 한 사람의 토정비결·평생 사주·내년 신년운세를 모두 엽니다. 궁합 한 건은 두 사람 한 쌍의 풀이입니다.</p><p>운세 파일은 HTML 형식입니다. 저장한 파일을 브라우저에서 열거나 인쇄 메뉴에서 PDF로 보관할 수 있습니다.</p></section>`);
}
export function productPage(id, ctx, year) {
  const p = productEdition(fortuneProduct(id), year);
  const bundle = id === 'bundle';
  const annualYear = ctx.today.y + 1;
  const pagePath = `/shop/${id}/`;
  if (isEnglish()) return englishShop(pagePath, p.nameEn, p, bundle ? annualYear : null);
  const yearField = bundle ? `<div class="field"><label for="purchase-year">토정비결을 볼 해</label><select class="input" id="purchase-year">${[ctx.today.y, ctx.today.y + 1].map(y => `<option value="${y}"${y === (year ?? annualYear) ? ' selected' : ''}>${y}년</option>`).join('')}</select></div><p class="hint">토정비결은 선택한 해의 음력 열두 달을 풀이합니다. 신년운세는 ${annualYear}년 기준입니다.</p>` : '';
  const people = Array.from({ length: p.people }, (_, i) => {
    const slot = i ? 'b' : 'a';
    const label = p.people === 2 ? (i ? '상대' : '나') : '운세 볼 사람';
    return `<details open data-purchase-person="${slot}"><summary><strong>${label}</strong> <span data-person-caption></span></summary>
      ${personFields(slot, p.people === 2 ? label : null)}</details>`;
  }).join('');
  const checkout = `<div class="shop-purchase-grid" id="report-start"><section>
    <form class="pform card" id="purchase-form" novalidate inert>
      <h2>누구의 운세를 볼까요?</h2>${yearField}${people}
      <button class="btn" type="submit">운세보기</button>
    </form>
    <section class="card box purchase-review" data-purchase-review hidden tabindex="-1" aria-labelledby="purchase-title">
      <h2 id="purchase-title">${p.name}</h2>
      <dl class="purchase-details" data-purchase-details></dl>
      <button class="sbtn" type="button" data-purchase-edit>대상 수정</button>
      <div class="field purchase-method"><label for="purchase-method">결제수단</label><select class="input" id="purchase-method" disabled></select></div>
      <p class="hint">결제에 동의하면 위 대상의 출생 정보를 서버에서 처리하고 주문과 운세를 보관합니다. 상세 풀이와 HTML 파일을 제공하는 1회 결제입니다. <a href="/privacy/#fortune-purchase">개인정보 처리 안내</a></p>
      <div class="form-actions"><button class="btn" type="button" data-purchase-pay disabled>동의하고 ${p.price}원 결제하기</button></div>
      <details data-preview-options><summary>무료로 한 줄 미리보기</summary>
        <p class="hint">미리보기에도 출생 정보의 서버 처리가 필요합니다.</p>
        <button class="sbtn" type="button" data-preview-request>정보 처리에 동의하고 미리보기</button>
        <p class="purchase-preview" data-preview-summary aria-live="polite" hidden></p>
      </details>
    </section>
    <p role="status" class="purchase-status" data-purchase-status></p><p role="alert" class="form-error" data-purchase-error hidden></p></section>`;
  return shell(pagePath, `${p.name} 990원`, `<div data-fortune-product="${p.id}"${bundle ? ` data-reading-year="${annualYear}"` : ''}><header class="shop-product-head"><div><a href="/shop/">운세 상품</a><h1>${p.name}</h1><p class="lead">${p.description}</p>${bundle ? `<p>${annualYear}년 신년운세는 한국 시간으로 ${annualYear}년 1월 1일부터 무료로 볼 수 있습니다.</p>` : ''}<p>출생 정보를 입력하면 바로 결제하거나 무료로 한 줄을 미리 읽을 수 있습니다. 아래 목차의 전체 풀이와 파일은 결제 후 제공됩니다. 구독·자동 갱신은 없습니다.</p></div><div class="shop-price"><strong>990<span>원</span></strong><p>단건 결제 · 다운로드 포함</p></div></header><details class="shop-contents"><summary>전체 풀이 목차 보기</summary>${contentsBoard(p)}</details>${checkout}<aside class="shop-order-summary card box"><h2>이 상품에 담긴 이야기</h2><ul>${p.includes.map(s => `<li>${esc(s)}</li>`).join('')}</ul><p><b>990원</b> / ${p.people === 2 ? '두 사람 한 쌍' : '한 사람'}${bundle ? ' · 풀이 3종' : ''}</p><p>상세 풀이와 운세 다운로드를 함께 제공합니다.</p><p class="hint">구매 보관함은 같은 브라우저에서 이용합니다. 쿠키를 지우거나 기기를 바꾸면 주문을 불러올 수 없으니 운세 파일도 저장해 주세요.</p><p class="hint">운세는 전통 해석을 참고하는 콘텐츠이며 미래의 사건이나 결과를 보장하지 않습니다.</p></aside></div></div>`);
}
export function ordersPage() {
  if (isEnglish()) return englishShop('/shop/orders/', 'Purchased reports');
  return shell('/shop/orders/', '구매 보관함', `<header class="shop-product-head"><div><h1>구매 보관함</h1><p class="lead">구매한 운세를 이어 읽고 파일로 보관하세요.</p></div></header><p class="hint">이 브라우저의 구매 내역을 표시합니다. 쿠키를 삭제하거나 다른 기기를 사용하면 내역을 불러올 수 없습니다.</p><div data-purchase-orders aria-live="polite"><p>주문을 불러오는 중입니다.</p></div><p role="alert" class="form-error" data-purchase-error hidden></p>`);
}
export function resultPage() {
  if (isEnglish()) return englishShop('/shop/result/', 'Your purchased reading');
  return shell('/shop/result/', '구매한 운세', `<section data-purchase-result><header class="shop-product-head"><div><p data-purchase-result-status>결제 상태를 확인하는 중입니다.</p><h1 data-purchase-result-title>구매한 운세</h1></div><a class="btn" data-purchase-download hidden>운세 다운로드</a></header><p data-purchase-result-note>승인이 확인되면 상세 풀이와 다운로드가 열립니다.</p><p role="alert" class="form-error" data-purchase-error hidden></p><iframe class="purchase-report" title="구매한 상세 운세" data-purchase-report sandbox="allow-same-origin" hidden></iframe></section>`);
}

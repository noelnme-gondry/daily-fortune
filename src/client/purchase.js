import { birthDateError } from '../domain/birth-input.js';
import { readForm, fillForm, wireBirthForm, syncTime, check } from './birth-form.js';
import { listPeople, profileLabel, sessionLoad, sessionSave, load, dateProfileSlots, withProfileReference } from './profile.js';
import { esc } from '../site/util.js';
import { NICEPAY_PAYMENT_METHODS } from '../domain/payment-methods.js';
import { trackCommerceStep, trackPurchase, trackCheckoutError } from './purchase-analytics.js';

const $ = s => document.querySelector(s);
async function api(path, body) {
  const response = await fetch(`/api/commerce${path}`, { credentials: 'same-origin', ...(body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {}) });
  const data = await response.json();
  if (!response.ok) throw Object.assign(new Error(data.message || '요청을 처리하지 못했습니다. 다시 시도해 주세요.'), { status: response.status });
  return data;
}
const error = message => { const el = $('[data-purchase-error]'); el.textContent = message; el.hidden = !message; };
const errorCode = e => e.status >= 500 ? 'http_5xx' : e.status >= 400 ? 'http_4xx' : 'request_failed';
let sdkPromise;
function nicepaySdk() {
  if (window.AUTHNICE) return Promise.resolve(window.AUTHNICE);
  if (!sdkPromise) sdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script'); script.src = 'https://pay.nicepay.co.kr/v1/js/';
    const timeout = setTimeout(() => { script.remove(); sdkPromise = null; reject(new Error('나이스페이를 불러오지 못했습니다. 다시 시도해 주세요.')); }, 15000);
    script.onload = () => { clearTimeout(timeout); if (window.AUTHNICE) resolve(window.AUTHNICE); else { sdkPromise = null; reject(new Error('나이스페이를 불러오지 못했습니다.')); } };
    script.onerror = () => { clearTimeout(timeout); script.remove(); sdkPromise = null; reject(new Error('나이스페이 연결을 확인한 뒤 다시 시도해 주세요.')); };
    document.head.append(script);
  });
  return sdkPromise;
}
function fillPaymentMethods(select, config) {
  const methods = NICEPAY_PAYMENT_METHODS.filter(m => config.methods?.includes(m.id));
  select.innerHTML = methods.length ? methods.map(m => `<option value="${m.id}">${m.label}</option>`).join('') : '<option value="">결제 준비 중</option>';
  select.disabled = !config.enabled || !methods.length;
}
async function payOrder(id, method, productId) {
  let stage = 'sdk_load';
  try {
    const sdk = await nicepaySdk();
    stage = 'payment_prepare';
    const payment = await api(`/orders/${encodeURIComponent(id)}/payment`, { method });
    stage = 'payment_window';
    trackCommerceStep('add_payment_info', productId, method);
    // SDK에 결제수단을 넘긴 시점이다. 결제창 표시 성공이나 승인으로 간주하지 않는다.
    return await new Promise((resolve, reject) => sdk.requestPay({ ...payment, fnError: () => reject(Object.assign(new Error('결제가 완료되지 않았습니다. 구매 보관함에서 결제 상태를 확인하거나 다시 시도해 주세요.'), { providerError: true })) }));
  } catch (e) {
    trackCheckoutError(productId, stage, e.providerError ? 'provider_error' : errorCode(e));
    throw e;
  }
}
async function mountProduct(root) {
  const id = root.dataset.fortuneProduct;
  const pair = id === 'compatibility', dateOnly = id === 'tojeong';
  const slots = pair ? ['a', 'b'] : ['a'];
  const form = $('#purchase-form'), review = $('[data-purchase-review]');
  const pay = $('[data-purchase-pay]'), preview = $('[data-preview-request]'), summary = $('[data-preview-summary]');
  const method = $('#purchase-method');
  let people = [], confirmed = null, busy = false, started = false;
  let config = { enabled: false };
  const picker = slot => form.querySelector(`[data-profile-picker="${slot}"]`);
  const panel = slot => form.querySelector(`[data-purchase-person="${slot}"]`);
  const slotName = slot => pair ? (slot === 'a' ? '나' : '상대') : '구매 대상';
  trackCommerceStep('view_item', id);

  function describe(p) {
    const parts = [p.name, p.calendar === 'lunar' ? (p.leap ? '음력 윤달' : '음력') : '양력', `${p.y}.${p.m}.${p.d}`];
    if (!dateOnly) parts.push(p.gender === 'M' ? '남성' : '여성', p.noTime ? '시간 모름' : p.timeMode === 'branch' ? `시진 ${p.timeBranch}` : p.time);
    return parts.filter(Boolean).join(' · ');
  }
  function populate(slot, p, collapse) {
    fillForm(form, slot, p);
    picker(slot).value = p.profileId || '';
    panel(slot).querySelector('[data-person-caption]').textContent = collapse ? describe(p) : '';
    panel(slot).open = !collapse;
  }
  async function refreshPeople() {
    people = await listPeople();
    for (const slot of slots) {
      const select = picker(slot), selected = select.value;
      select.closest('.profile-picker').hidden = people.length === 0;
      select.replaceChildren(new window.Option('직접 입력 · 새 사람', ''), ...people.map(person => new window.Option(person.profile.name ? profileLabel(person.profile) + ' · ' + [person.profile.y, person.profile.m, person.profile.d].join('.') : profileLabel(person.profile), person.id)));
      select.value = selected;
    }
  }
  function edit() {
    if (busy) return;
    confirmed = null;
    form.hidden = false; review.hidden = true;
    summary.hidden = true; summary.textContent = '';
    $('[data-preview-options]').open = false;
    error('');
    update();
  }
  function update() {
    pay.disabled = !confirmed || !config.enabled || !method.value || busy;
    method.disabled = !config.enabled || !config.methods?.length || busy;
    preview.disabled = busy;
    $('[data-purchase-edit]').disabled = busy;
  }
  function inputStarted() {
    if (!started) trackCommerceStep('checkout_input_start', id);
    started = true;
  }
  if (!dateOnly) wireBirthForm(form, slots);
  else form.addEventListener('change', e => {
    if (e.target.name !== 'a-cal') return;
    $('#a-leap').disabled = e.target.value !== 'lunar';
    if ($('#a-leap').disabled) $('#a-leap').checked = false;
  });
  for (const slot of slots) {
    picker(slot).addEventListener('change', () => {
      const person = people.find(p => p.id === picker(slot).value);
      populate(slot, person ? { ...person.profile, profileId: person.id } : { calendar: 'solar' }, false);
      inputStarted();
    });
    panel(slot).addEventListener('input', () => {
      panel(slot).querySelector('[data-person-caption]').textContent = '';
      inputStarted();
    });
  }
  document.addEventListener('profiles-changed', () => { refreshPeople().catch(() => {}); });
  document.addEventListener('profile-selected', event => {
    const { profile, slot } = event.detail;
    if (busy || !slots.includes(slot)) return;
    edit(); populate(slot, profile, true); inputStarted();
  });
  $('[data-purchase-edit]').addEventListener('click', () => {
    edit(); panel('a').querySelector('summary').focus();
  });
  method.addEventListener('change', update);
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (busy || confirmed) return;
    error('');
    const subjects = [];
    for (const slot of slots) {
      const p = dateOnly ? { name: $('#a-name').value.trim(), y: +$('#a-y').value, m: +$('#a-m').value, d: +$('#a-d').value, calendar: form.querySelector('[name="a-cal"]:checked').value, leap: !$('#a-leap').disabled && $('#a-leap').checked } : readForm(form, slot);
      const issue = dateOnly ? birthDateError(p) : check(p);
      if (issue) {
        error(pair ? slotName(slot) + ' · ' + issue : issue);
        trackCheckoutError(id, 'input', 'invalid_input');
        panel(slot).open = true;
        (birthDateError(p) ? $('#' + slot + '-y') : form.querySelector(`[name="${slot}-gender"]`)).focus();
        return;
      }
      subjects.push(p);
    }
    const targetYear = dateOnly ? +$('#purchase-year').value : Number(root.dataset.readingYear) || undefined;
    confirmed = { productId: id, people: subjects, targetYear };
    subjects.forEach((p, i) => {
      const selected = people.find(person => person.id === picker(slots[i]).value);
      const ref = selected && { ...selected.profile, profileId: selected.id };
      const matchesDate = ref && ['name', 'calendar', 'y', 'm', 'd'].every(key => ref[key] === p[key]) && !!ref.leap === !!p.leap;
      const recent = dateOnly && matchesDate ? { ...p, profileId: ref.profileId } : withProfileReference(p, ref);
      sessionSave(dateOnly ? 'tojeong' : slots[i], recent);
    });
    const rows = subjects.map((p, i) => [slotName(slots[i]), describe(p)]);
    if (targetYear) rows.push(['풀이 연도', targetYear + '년']);
    $('[data-purchase-details]').innerHTML = rows.map(([label, value]) => `<div><dt>${label}</dt><dd>${esc(value)}</dd></div>`).join('');
    form.hidden = true; review.hidden = false;
    trackCommerceStep('checkout_subject_confirm', id);
    update(); review.focus(); review.scrollIntoView({ block: 'start' });
  });
  preview.addEventListener('click', async () => {
    if (!confirmed || busy) return;
    busy = true; update(); error('');
    try {
      const p = await api('/preview', { ...confirmed, privacyConsent: true });
      summary.hidden = false; summary.textContent = p.summary;
      trackCommerceStep('begin_checkout', id);
    } catch (e) { trackCheckoutError(id, 'preview', errorCode(e)); error(e.message); }
    finally { busy = false; update(); }
  });
  pay.addEventListener('click', async () => {
    if (!confirmed || pay.disabled || busy) return;
    busy = true; update(); error('');
    trackCommerceStep('payment_attempt', id, method.value);
    let orderCreated = false;
    try {
      const order = await api('/orders', { ...confirmed, privacyConsent: true, purchaseConsent: true, consentVersion: '2026-11-23' });
      orderCreated = true;
      if (order.status === 'PAID') { location.assign(`/shop/result/?orderId=${encodeURIComponent(order.id)}`); return; }
      await payOrder(order.id, method.value, id);
    } catch (e) { if (!orderCreated) trackCheckoutError(id, 'order_create', errorCode(e)); error(e.message); }
    finally { busy = false; update(); }
  });
  try { await refreshPeople(); } catch { /* 세션 입력은 저장소 없이도 사용할 수 있다. */ }
  for (const slot of slots) {
    const keys = dateOnly ? dateProfileSlots() : [slot];
    const usable = p => p && !(dateOnly ? birthDateError(p) : check(p));
    const recent = keys.map(sessionLoad).find(usable)
      || (await Promise.all(keys.map(key => load(key).catch(() => null)))).find(usable);
    if (recent) populate(slot, recent, true);
    else if (!dateOnly) syncTime(form, slot);
  }
  form.inert = false;
  try {
    config = await api('/config');
    fillPaymentMethods(method, config);
    $('[data-purchase-status]').textContent = !config.enabled ? '결제 준비 중입니다. 미리보기는 이용할 수 있습니다.' : config.mode === 'sandbox' ? '나이스페이 테스트 결제 환경입니다. 실제로 청구되지 않습니다.' : '';
  } catch (e) { trackCheckoutError(id, 'configuration', errorCode(e)); $('[data-purchase-status]').textContent = '결제 연결을 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.'; }
  update(); root.dataset.ready = 'true';
}
async function mountOrders(root) {
  if (new URLSearchParams(location.search).get('payment') === 'check') trackCheckoutError(null, 'payment_return', 'provider_check_required');
  const orders = await api('/orders');
  root.innerHTML = orders.length ? orders.map(o => `<article class="card box purchase-order"><div><h2>${esc(o.title)}</h2><p>990원 · ${o.status === 'PAID' ? '결제 완료' : o.status === 'CANCELLED' ? '취소됨' : o.status === 'REVIEW' ? '결제 확인 필요' : '결제 대기'}</p><p class="hint">주문번호 ${esc(o.id)}</p></div><a class="btn ghost" href="/shop/result/?orderId=${encodeURIComponent(o.id)}">${o.status === 'PAID' ? '운세 보기·다운로드' : '주문 상태 확인'}</a></article>`).join('') : '<section class="card box"><h2>아직 구매한 운세가 없습니다.</h2><p><a href="/shop/">운세 상품 둘러보기</a></p></section>';
  if (new URLSearchParams(location.search).has('payment')) error('결제가 완료되지 않았거나 확인이 필요합니다. 주문 상태를 확인해 주세요. 같은 주문으로 결제를 반복하지 마세요.');
}
async function mountResult() {
  const id = new URLSearchParams(location.search).get('orderId');
  if (!id) throw new Error('구매 보관함에서 주문을 선택해 주세요.');
  const order = await api(`/orders/${encodeURIComponent(id)}`);
  $('[data-purchase-result-title]').textContent = order.title;
  if (order.status !== 'PAID') {
    $('[data-purchase-result-status]').textContent = '결제가 완료되지 않았습니다.';
    $('[data-purchase-result-note]').textContent = order.status === 'CANCELLED' ? '취소된 주문입니다. 상품을 다시 선택해 주세요.' : '결제 상태 확인이 필요합니다. 잠시 후 페이지를 새로고침하거나 주문번호와 함께 운영자에게 문의해 주세요.';
    if (order.freeAnnual && Number.isInteger(order.targetYear)) {
      const link = document.createElement('a');
      link.href = `/year/${order.targetYear}/`;
      link.textContent = `${order.targetYear}년 무료 상세 운세 보기`;
      $('[data-purchase-result-note]').replaceChildren(link);
    } else if (order.canPay) {
      const config = await api('/config'), field = document.createElement('div'); field.className = 'field purchase-method';
      field.innerHTML = '<label for="purchase-method">결제수단</label><select class="input" id="purchase-method" disabled></select>';
      const method = field.querySelector('select'); fillPaymentMethods(method, config);
      const retry = document.createElement('button'); retry.type = 'button'; retry.className = 'btn'; retry.textContent = '990원 결제 다시 시도';
      retry.disabled = method.disabled;
      retry.addEventListener('click', async () => { retry.disabled = true; method.disabled = true; error(''); trackCommerceStep('payment_attempt', order.productId, method.value); try { await payOrder(id, method.value, order.productId); } catch (e) { error(e.message); retry.disabled = false; method.disabled = false; } });
      $('[data-purchase-result-note]').after(field, retry);
    }
    return;
  }
  const url = `/api/commerce/orders/${encodeURIComponent(id)}/report`;
  // 승인 확인과 본문 응답까지 성공한 후에만 구매 완료·다운로드를 표시한다.
  let html;
  try {
    const response = await fetch(url, { credentials: 'same-origin' });
    if (!response.ok) { const body = await response.json(); throw Object.assign(new Error(body.message), { status: response.status }); }
    html = await response.text();
  } catch (e) { trackCheckoutError(order.productId, 'report_load', errorCode(e)); throw e; }
  const frame = $('[data-purchase-report]');
  trackPurchase(order);
  frame.addEventListener('load', () => {
    const doc = frame.contentDocument;
    if (!doc) return;
    doc.body.classList.add('report-embedded');
    const main = doc.querySelector('main');
    if (!main) return;
    const resize = () => { frame.style.height = `${Math.ceil(main.getBoundingClientRect().height) + 8}px`; };
    const observer = new window.ResizeObserver(resize);
    observer.observe(main);
    doc.fonts.ready.then(resize);
    // 큰 iframe 안에서도 목차 링크가 바깥 페이지의 해당 장으로 이동한다.
    doc.addEventListener('click', event => {
      const link = event.target.closest('a[href^="#"]');
      if (!link) return;
      const target = doc.getElementById(link.hash.slice(1));
      if (!target) return;
      event.preventDefault();
      if (target.tagName === 'DETAILS') target.open = true;
      resize();
      requestAnimationFrame(() => {
        window.scrollTo({ top: window.scrollY + frame.getBoundingClientRect().top + target.getBoundingClientRect().top - 16, behavior: 'instant' });
        target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true });
      });
    });
    resize();
    window.addEventListener('pagehide', () => observer.disconnect(), { once: true });
  }, { once: true });
  frame.srcdoc = html; frame.hidden = false;
  const download = $('[data-purchase-download]'); download.href = `${url}?download=1`; download.hidden = false;
  $('[data-purchase-result-status]').textContent = '구매가 완료되었습니다.';
  $('[data-purchase-result-note]').textContent = '목차에서 읽고 싶은 이야기를 골라보세요. 운세 파일을 저장하면 인터넷 없이도 이어 읽을 수 있습니다.';
}
export async function mountPurchase() {
  try {
    const product = $('[data-fortune-product]'), orders = $('[data-purchase-orders]');
    if (product) await mountProduct(product);
    else if (orders) await mountOrders(orders);
    else if ($('[data-purchase-result]')) await mountResult();
  } catch (e) { error(e.message); }
}

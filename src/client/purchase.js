import { readForm, fillForm, wireBirthForm, syncTime } from './birth-form.js';
import { listPeople, profileLabel } from './profile.js';
import { esc } from '../site/util.js';
import { NICEPAY_PAYMENT_METHODS } from '../domain/payment-methods.js';

const $ = s => document.querySelector(s);
async function api(path, body) {
  const response = await fetch(`/api/commerce${path}`, { credentials: 'same-origin', ...(body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {}) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || '요청을 처리하지 못했습니다. 다시 시도해 주세요.');
  return data;
}
const error = message => { const el = $('[data-purchase-error]'); el.textContent = message; el.hidden = !message; };
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
async function payOrder(id, method) {
  const sdk = await nicepaySdk();
  const payment = await api(`/orders/${encodeURIComponent(id)}/payment`, { method });
  return new Promise((resolve, reject) => sdk.requestPay({ ...payment, fnError: () => reject(new Error('결제가 완료되지 않았습니다. 구매 보관함에서 결제 상태를 확인하거나 다시 시도해 주세요.')) }));
}
async function mountProduct(root) {
  const id = root.dataset.fortuneProduct, pair = id === 'compatibility', dateOnly = id === 'tojeong';
  const form = $('#purchase-form'), review = $('[data-purchase-review]'), button = $('[data-purchase-pay]'), confirm = $('#purchase-confirm'), method = $('#purchase-method');
  let config = { enabled: false }, input, busy = false;
  const slots = pair ? ['a', 'b'] : ['a'];
  const picker = who => form.querySelector(`[data-profile-picker="${who}"]`);
  const populate = (profile, who) => { fillForm(form, who, profile); picker(who).value = profile.profileId || ''; };
  async function refreshPeople() {
    const people = await listPeople();
    for (const who of slots) {
      const select = picker(who), selected = select.value;
      select.closest('.profile-picker').hidden = people.length === 0;
      select.innerHTML = '<option value="">직접 입력 · 새 사람</option>' + people.map(p => `<option value="${esc(p.id)}">${esc(profileLabel(p.profile))} · ${p.profile.y}.${p.profile.m}.${p.profile.d}</option>`).join('');
      select.value = people.some(p => p.id === selected) ? selected : '';
    }
  }
  for (const who of slots) picker(who).addEventListener('change', async event => {
    const selected = event.target.value;
    if (!selected) { populate({ calendar: 'solar', gender: '', y: 0, m: 0, d: 0 }, who); return; }
    try {
      const person = (await listPeople()).find(p => p.id === selected);
      if (person && picker(who).value === selected && !busy) populate({ ...person.profile, profileId: person.id }, who);
    } catch { error('저장한 사람을 불러오지 못했습니다. 직접 입력하거나 다시 선택해 주세요.'); }
  });
  document.addEventListener('profiles-changed', () => { refreshPeople().catch(() => {}); });
  document.addEventListener('profile-selected', event => {
    const { profile, slot } = event.detail;
    if (busy || !slots.includes(slot)) return;
    if (!form.hidden) populate(profile, slot);
    else { $('[data-purchase-edit]').click(); populate(profile, slot); }
  });
  try { await refreshPeople(); } catch { /* 저장소 없이 직접 입력할 수 있다. */ }
  if (!dateOnly) { wireBirthForm(form, pair ? ['a', 'b'] : ['a']); for (const who of pair ? ['a', 'b'] : ['a']) syncTime(form, who); }
  else form.addEventListener('change', e => { if (e.target.name === 'a-cal') { $('#a-leap').disabled = e.target.value !== 'lunar'; if ($('#a-leap').disabled) $('#a-leap').checked = false; } });
  try {
    config = await api('/config');
    fillPaymentMethods(method, config);
    $('[data-purchase-status]').textContent = !config.enabled ? '결제 준비 중입니다. 미리보기는 이용할 수 있습니다.' : config.mode === 'sandbox' ? '나이스페이 테스트 결제 환경입니다. 실제로 청구되지 않습니다.' : '나이스페이에서 결제합니다.';
  } catch { $('[data-purchase-status]').textContent = '결제 연결을 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.'; }
  root.dataset.ready = 'true';
  const update = () => { method.disabled = !config.enabled || !config.methods?.length || busy; button.disabled = method.disabled || !method.value || !confirm.checked || busy; };
  confirm.addEventListener('change', update);
  method.addEventListener('change', update);
  form.addEventListener('submit', async e => {
    e.preventDefault(); if (busy) return;
    error('');
    if (!$('#purchase-privacy').checked) { error('출생 정보 처리에 동의해 주세요.'); $('#purchase-privacy').focus(); return; }
    const read = who => dateOnly ? { name: $('#a-name').value.trim(), y: +$('#a-y').value, m: +$('#a-m').value, d: +$('#a-d').value, calendar: form.querySelector('[name="a-cal"]:checked').value, leap: !$('#a-leap').disabled && $('#a-leap').checked } : readForm(form, who);
    input = { productId: id, people: [read('a'), ...(pair ? [read('b')] : [])], targetYear: dateOnly ? +$('#purchase-year').value : undefined, privacyConsent: true };
    busy = true; const submit = form.querySelector('[type="submit"]'); submit.disabled = true;
    try {
      const p = await api('/preview', input);
      $('[data-preview-title]').textContent = p.title; $('[data-preview-summary]').textContent = p.summary;
      $('[data-purchase-details]').innerHTML = `<div><dt>상품</dt><dd>${esc(p.title)}</dd></div>${p.people.map((v, i) => `<div><dt>${pair ? (i ? '상대' : '나') : '구매 대상'}</dt><dd>${esc(v.name || (i ? '상대' : '나'))} · ${v.calendar === 'lunar' ? '음력' : '양력'} ${v.leap ? '윤달 ' : ''}${v.y}.${v.m}.${v.d}${dateOnly ? '' : ` · ${v.gender === 'M' ? '남성' : '여성'} · ${v.noTime ? '시간 모름' : esc(v.timeMode === 'branch' ? `시진 ${v.timeBranch}` : v.time)}`}</dd></div>`).join('')}${p.targetYear ? `<div><dt>풀이 연도</dt><dd>${p.targetYear}년</dd></div>` : ''}<div><dt>제공 내용</dt><dd>전체 상세 풀이 + HTML 운세 파일</dd></div>`;
      form.hidden = true; review.hidden = false; confirm.checked = false;
      $('[data-purchase-step="input"]').removeAttribute('aria-current'); $('[data-purchase-step="review"]').setAttribute('aria-current', 'step');
      review.focus(); review.scrollIntoView({ block: 'start' });
    } catch (e) { error(e.message); } finally { busy = false; submit.disabled = false; update(); }
  });
  $('[data-purchase-edit]').addEventListener('click', () => { if (busy) return; review.hidden = true; form.hidden = false; input = null; error(''); $('[data-purchase-step="review"]').removeAttribute('aria-current'); $('[data-purchase-step="input"]').setAttribute('aria-current', 'step'); $('#a-y').focus(); });
  button.addEventListener('click', async () => {
    if (busy || !input || !confirm.checked || !config.enabled || !method.value) return;
    busy = true; update(); error('');
    try {
      const order = await api('/orders', { ...input, purchaseConsent: true });
      if (order.status === 'PAID') { location.assign(`/shop/result/?orderId=${encodeURIComponent(order.id)}`); return; }
      await payOrder(order.id, method.value);
    } catch (e) { error(e.message); } finally { busy = false; update(); }
  });
}
async function mountOrders(root) {
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
    if (order.canPay) {
      const config = await api('/config'), field = document.createElement('div'); field.className = 'field purchase-method';
      field.innerHTML = '<label for="purchase-method">결제수단</label><select class="input" id="purchase-method" disabled></select>';
      const method = field.querySelector('select'); fillPaymentMethods(method, config);
      const retry = document.createElement('button'); retry.type = 'button'; retry.className = 'btn'; retry.textContent = '990원 결제 다시 시도';
      retry.disabled = method.disabled;
      retry.addEventListener('click', async () => { retry.disabled = true; method.disabled = true; error(''); try { await payOrder(id, method.value); } catch (e) { error(e.message); retry.disabled = false; method.disabled = false; } });
      $('[data-purchase-result-note]').after(field, retry);
    }
    return;
  }
  const url = `/api/commerce/orders/${encodeURIComponent(id)}/report`;
  // 승인 확인과 본문 응답까지 성공한 후에만 구매 완료·다운로드를 표시한다.
  const response = await fetch(url, { credentials: 'same-origin' });
  if (!response.ok) { const body = await response.json(); throw new Error(body.message); }
  const html = await response.text(), frame = $('[data-purchase-report]');
  frame.srcdoc = html; frame.hidden = false;
  frame.addEventListener('load', () => { const doc = frame.contentDocument; if (doc) frame.style.height = `${doc.documentElement.scrollHeight + 24}px`; });
  const download = $('[data-purchase-download]'); download.href = `${url}?download=1`; download.hidden = false;
  $('[data-purchase-result-status]').textContent = '구매가 완료되었습니다.';
  $('[data-purchase-result-note]').textContent = '상세 풀이를 읽고 운세 파일을 다운로드하세요. 저장한 HTML 파일은 인터넷 없이도 열 수 있습니다.';
}
export async function mountPurchase() {
  try {
    const product = $('[data-fortune-product]'), orders = $('[data-purchase-orders]');
    if (product) await mountProduct(product);
    else if (orders) await mountOrders(orders);
    else if ($('[data-purchase-result]')) await mountResult();
  } catch (e) { error(e.message); }
}

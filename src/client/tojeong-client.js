import { calculateTojeong, TojeongInputError } from '../domain/tojeong.js';
import READINGS from '../content/tojeong-144.json';
import { tojeongView } from './tojeong-view.js';
import { load, save, removeSaved, sessionLoad, sessionSave, SAMPLE } from './profile.js';
import { track } from './analytics.js';

export async function mountTojeong(root) {
  const form = root.querySelector('form'), out = root.querySelector('#tojeong-result');
  const field = (id) => form.querySelector(`#tj-${id}`);
  const persist = field('save'), status = field('storage-status');
  const targetYear = Number(root.dataset.year);
  function fill(p) {
    if (!p) return;
    field('name').value = p.name || '';
    for (const k of ['y', 'm', 'd']) if ([...field(k).options].some((o) => +o.value === p[k])) field(k).value = p[k];
    form.querySelector(`input[name="tj-calendar"][value="${p.calendar === 'lunar' ? 'lunar' : 'solar'}"]`).checked = true;
    field('leap').checked = !!p.leap && p.calendar === 'lunar';
    field('leap').disabled = p.calendar !== 'lunar';
  }
  function read() {
    return { name: field('name').value.trim().slice(0, 12), y: +field('y').value, m: +field('m').value, d: +field('d').value, calendar: form.querySelector('[name="tj-calendar"]:checked').value, leap: !field('leap').disabled && field('leap').checked };
  }
  function render(p, source) {
    try {
      const result = calculateTojeong(p, targetYear);
      out.innerHTML = tojeongView(result, READINGS[result.code], p.name);
      field('error').hidden = true;
      track('calc_result', { tool: 'tojeong', source, calendar: p.calendar });
      return true;
    } catch (e) {
      field('error').textContent = e instanceof TojeongInputError ? e.message : '토정비결 해설을 불러오지 못했습니다. 새로고침해 주세요.';
      field('error').hidden = false;
      out.replaceChildren();
      return false;
    }
  }
  form.addEventListener('change', (e) => {
    if (e.target.name === 'tj-calendar') {
      field('leap').disabled = e.target.value !== 'lunar';
      if (field('leap').disabled) field('leap').checked = false;
    }
    if (e.target === persist) { try { sessionStorage.setItem('ohaeng:tojeong-save', String(persist.checked)); } catch { /* 저장이 제한되어도 계산 가능 */ } }
  });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const p = read();
    track('calc_submit', { tool: 'tojeong' });
    if (!render(p, 'form')) return;
    const temporary = sessionSave('tojeong', p);
    if (persist.checked) {
      try { await save('tojeong', p); status.textContent = '토정비결 생일을 이 기기의 IndexedDB에 저장했습니다.'; }
      catch { status.textContent = '기기 저장에 실패했습니다. 결과는 계산되었지만 다음 방문에 복원되지 않을 수 있습니다.'; }
    } else status.textContent = temporary ? '현재 탭에만 임시로 유지됩니다. 기존 기기 저장본은 삭제 버튼으로 지울 수 있습니다.' : '이 브라우저에서는 저장할 수 없습니다. 현재 화면에서 결과를 확인하세요.';
    out.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  form.querySelector('[data-tojeong-sample]').addEventListener('click', () => {
    fill(SAMPLE.a); render(SAMPLE.a, 'sample');
    out.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  form.querySelector('[data-tojeong-delete]').addEventListener('click', async () => {
    try {
      await removeSaved('tojeong'); persist.checked = false;
      try { sessionStorage.removeItem('ohaeng:tojeong-save'); } catch { /* 접근 제한 */ }
      status.textContent = '저장된 토정비결 정보를 삭제했습니다.';
    } catch { status.textContent = '삭제에 실패했습니다. 저장소 접근을 허용한 뒤 다시 시도해 주세요.'; }
  });
  out.addEventListener('click', (e) => {
    const button = e.target.closest('[data-tojeong-month]');
    if (!button) return;
    for (const b of out.querySelectorAll('[data-tojeong-month]')) {
      const selected = b === button;
      b.setAttribute('aria-pressed', String(selected));
      out.querySelector(`#${b.getAttribute('aria-controls')}`).hidden = !selected;
    }
  });
  form.inert = true;
  let stored, shared;
  try { stored = await load('tojeong'); shared = await load('a'); }
  catch { status.textContent = '저장소를 불러오지 못했습니다. 저장 없이 계산할 수 있습니다.'; }
  finally { form.inert = false; }
  persist.checked = !!stored;
  try { const preference = sessionStorage.getItem('ohaeng:tojeong-save'); if (preference !== null) persist.checked = preference === 'true'; } catch { /* 접근 제한 */ }
  const own = sessionLoad('tojeong') || stored;
  const p = own || sessionLoad('a') || shared;
  if (p && !own) status.textContent += ' 저장된 사주 생일을 불러왔으며, 토정비결 정보는 별도로 저장합니다.';
  if (p) { fill(p); render(p, 'saved'); }
  root.dataset.ready = 'true';
}

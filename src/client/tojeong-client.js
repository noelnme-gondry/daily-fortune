import { calculateTojeong, TojeongInputError } from '../domain/tojeong.js';
import { tojeongView } from './tojeong-view.js';
import { tojeongHeadline } from '../content/tojeong.js';
import { resultShareHtml, wireShare } from './share.js';
import { shareUrl, cleanName } from '../site/share-codec.js';
import { load, save, removeSaved, sessionLoad, sessionSave } from './profile.js';
import { track, trackInputStart } from './analytics.js';
import { renderResultWithPartnerAd, clearResultWithPartnerAd } from './partner-ad.js';
import { isEnglish, tr } from '../i18n/runtime.js';
import { todayKST, isoDate } from '../engine/core.js';

const inputError = (message) => tr(message, ({
  '간지를 확인할 수 없습니다.': 'The stem–branch designation could not be identified.',
  '달력 종류와 생년월일을 확인해 주세요.': 'Check the calendar type and your birth date.',
  '존재하지 않는 날짜입니다. 양력·음력과 윤달 여부를 확인해 주세요.': 'This date does not exist. Check the solar/lunar calendar and leap-month setting.',
  '괘를 계산할 수 있는 날짜와 수가 아닙니다.': 'The date or values are not valid for a Tojeong calculation.',
  '태어난 음력 연도보다 앞선 해의 운세는 계산할 수 없습니다.': 'The target year cannot be earlier than your lunar birth year.',
  '이 해의 음력 날짜를 확인할 수 없습니다.': 'Lunar dates for this year could not be identified.',
  '음력 한 해의 범위를 확인할 수 없습니다.': 'The date range of this lunar year could not be identified.',
})[message] || (/현재 음력 자료로 계산할 수 있는 해는 (\d+)~(\d+)년입니다\./.test(message)
  ? message.replace(/현재 음력 자료로 계산할 수 있는 해는 (\d+)~(\d+)년입니다\./, 'Available lunar calendar data supports years $1–$2.')
  : 'The Tojeong reading could not be calculated. Check your entries.'));

export async function mountTojeong(root) {
  const form = root.querySelector('form'), out = root.querySelector('#tojeong-result');
  trackInputStart(form, 'tojeong');
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
  // 해설은 자기 괘 하나만 받는다(vite.config.js의 tojeongData). 같은 괘는 다시 받지 않는다.
  const readings = new Map();
  const reading = (code) => {
    const key = `${isEnglish() ? 'en/' : ''}${code}`;
    if (!readings.has(key)) {
      readings.set(key, fetch(`/data/tojeong/${key}.json`).then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.json(); })
        .catch((e) => { readings.delete(key); throw e; }));
    }
    return readings.get(key);
  };
  const showError = (message, inputError = false) => {
    field('error').textContent = message; field('error').hidden = false; clearResultWithPartnerAd(out);
    if (inputError) {
      const inputs = ['y', 'm', 'd'].map(field);
      for (const input of inputs) { input.setAttribute('aria-invalid', 'true'); input.setAttribute('aria-errormessage', 'tj-error'); }
      (inputs.find(input => !input.value) || inputs[2]).focus();
    }
    track('form_error', { tool: 'tojeong', entry_point: 'tojeong' });
  };
  let latest = 0;
  async function render(p, source) {
    const token = ++latest;
    let result;
    out.removeAttribute('aria-busy');
    for (const input of form.querySelectorAll('[aria-invalid]')) { input.removeAttribute('aria-invalid'); input.removeAttribute('aria-errormessage'); }
    if (!p.y || !p.m || !p.d) { showError(tr('생년월일을 모두 선택해 주세요.', 'Select your birth year, month and day.'), true); return false; }
    try { result = calculateTojeong(p, targetYear); }
    catch (e) { showError(e instanceof TojeongInputError ? inputError(e.message) : tr('토정비결을 계산하지 못했습니다. 입력을 확인해 주세요.', 'The Tojeong reading could not be calculated. Check your entries.'), true); return false; }
    out.setAttribute('aria-busy', 'true');
    try {
      const r = await reading(result.code);
      if (token !== latest) return false;
      renderResultWithPartnerAd(out, tojeongView(result, r, p.name) + resultShareHtml(), { tool: 'tojeong', calc_origin: source, reading_date: isoDate(todayKST()) });
      wireShare(out.querySelector('.result-share'), shareFor(result, r, p.name));
      field('error').hidden = true;
      track('calc_result', { tool: 'tojeong', calc_origin: source, entry_point: 'tojeong', reading_date: isoDate(todayKST()) });
      return true;
    } catch {
      if (token === latest) showError(tr('토정비결 해설을 불러오지 못했습니다. 네트워크 연결을 확인한 뒤 다시 시도해 주세요.', 'The Tojeong reading could not be loaded. Check your network connection and try again.'));
      return false;
    } finally {
      if (token === latest) out.removeAttribute('aria-busy');
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
    track('calc_submit', { tool: 'tojeong', entry_point: 'tojeong' });
    if (!(await render(p, 'form'))) return;
    const temporary = sessionSave('tojeong', p);
    if (persist.checked) {
      try { await save('tojeong', p); status.textContent = tr('토정비결 생일을 이 기기에 저장했습니다.', 'Your Tojeong birth date has been saved on this device.'); }
      catch { status.textContent = tr('기기 저장에 실패했습니다. 결과는 계산되었지만 다음 방문에 복원되지 않을 수 있습니다.', 'The result was calculated, but could not be saved on this device. It may not be restored on your next visit.'); }
    } else status.textContent = temporary ? tr('현재 탭에만 임시로 유지됩니다. 기존 기기 저장본은 삭제 버튼으로 지울 수 있습니다.', 'Kept temporarily in this tab only. Use the delete button to remove an older copy saved on this device.') : tr('이 브라우저에서는 저장할 수 없습니다. 현재 화면에서 결과를 확인하세요.', 'This browser cannot save your information. You can still read your result on this screen.');
    out.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  form.querySelector('[data-tojeong-delete]').addEventListener('click', async () => {
    try {
      await removeSaved('tojeong'); persist.checked = false;
      try { sessionStorage.removeItem('ohaeng:tojeong-save'); } catch { /* 접근 제한 */ }
      status.textContent = tr('저장된 토정비결 정보를 삭제했습니다.', 'Your saved Tojeong information has been deleted.');
    } catch { status.textContent = tr('삭제에 실패했습니다. 저장소 접근을 허용한 뒤 다시 시도해 주세요.', 'Deletion failed. Allow storage access and try again.'); }
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
  catch { status.textContent = tr('저장소를 불러오지 못했습니다. 저장 없이 계산할 수 있습니다.', 'Saved information could not be loaded. You can calculate a reading without saving.'); }
  finally { form.inert = false; }
  persist.checked = !!stored;
  try { const preference = sessionStorage.getItem('ohaeng:tojeong-save'); if (preference !== null) persist.checked = preference === 'true'; } catch { /* 접근 제한 */ }
  const own = sessionLoad('tojeong') || stored;
  const p = own || sessionLoad('a') || shared;
  if (p && !own) status.textContent += tr(' 저장된 사주 생일을 불러왔으며, 토정비결 정보는 별도로 저장합니다.', ' Your saved Saju birth date was loaded. Tojeong information is saved separately.');
  root.dataset.ready = 'true';
  if (p) { fill(p); await render(p, sessionLoad('tojeong') || sessionLoad('a') ? 'session_restore' : 'device_restore'); }
}

const ymd = (d) => `${d.y}.${d.m}.${d.d}`;
function shareFor(result, reading, name) {
  const n = cleanName(name), who = n ? tr(`${n}님`, n) : tr('나', 'My');
  const headline = tojeongHeadline(reading);
  return {
    kind: 'tojeong', url: shareUrl(location.origin, { k: 'tojeong', n, y: result.targetYear, g: result.code }),
    title: tr(`${who}의 ${result.targetYear}년 토정비결 ${result.code}괘`, `${n ? `${who}’s` : who} ${result.targetYear} Tojeong reading ${result.code}`), text: headline,
    card: { kicker: tr(`${who}의 ${result.targetYear}년 토정비결`, `${n ? `${who}’s` : who} ${result.targetYear} Tojeong reading`), big: tr(`${result.code}괘`, result.code), title: headline,
      lines: [[tr('상괘 · 중괘 · 하괘', 'Upper · Middle · Lower'), `${result.upper} · ${result.middle} · ${result.lower}`], [tr('풀이 기간', 'Reading period'), `${ymd(result.period.start)}~${ymd(result.period.end)}`]] },
  };
}

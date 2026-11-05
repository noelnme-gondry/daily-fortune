import { tr } from '../i18n/runtime.js';
const KEY = 'myod:reading-preferences';
const preferences = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
export function readingControls({ chart = true } = {}) {
  return `<div class="reading-controls" role="group" aria-label="${tr('읽기 설정', 'Reading settings')}"><label>${tr('글자 크기', 'Text size')}<select class="input" data-reading-size><option value="normal">${tr('기본', 'Default')}</option><option value="large">${tr('크게', 'Larger')}</option></select></label>${chart ? `<label>${tr('만세력 표기', 'Chart labels')}<select class="input" data-reading-script><option value="hanja">${tr('한자 · 한글', 'Hanja + names')}</option><option value="hangul">${tr('한글 중심', 'Names first')}</option></select></label>` : ''}<button type="button" class="link-btn" data-manage-profiles aria-controls="profile-manager" aria-haspopup="dialog">${tr('다른 사람 선택', 'Choose a person')}</button></div>`;
}
export function applyReadingPreferences(root) {
  const p = preferences();
  root.classList.toggle('reading-large', p.size === 'large');
  root.classList.toggle('reading-hangul', p.script === 'hangul');
  const size = root.querySelector('[data-reading-size]'), script = root.querySelector('[data-reading-script]');
  if (size) size.value = p.size === 'large' ? 'large' : 'normal';
  if (script) script.value = p.script === 'hangul' ? 'hangul' : 'hanja';
}
export function wireReadingPreferences(root) {
  root.addEventListener('change', event => {
    if (!event.target.matches('[data-reading-size], [data-reading-script]')) return;
    const p = { ...preferences(), size: root.querySelector('[data-reading-size]').value };
    const script = root.querySelector('[data-reading-script]');
    if (script) p.script = script.value;
    // 저장 제한 환경에서도 현재 화면의 읽기 설정은 적용한다.
    root.classList.toggle('reading-large', p.size === 'large');
    root.classList.toggle('reading-hangul', p.script === 'hangul');
    try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* Preferences are optional. */ }
  });
}

import { tr, isEnglish } from '../i18n/runtime.js';
import { esc } from '../site/util.js';
import { languagePath } from '../site/locale.js';
import { personFields } from '../site/birth-form.js';
import { buildChart } from '../engine/index.js';
import { wireBirthForm, fillForm, readForm, check, syncTime } from './birth-form.js';
import { listPeople, savePerson, deletePerson, selectPerson, profileLabel, toEngine } from './profile.js';
import { showProfileGuide } from './profile-navigation.js';

export async function openProfiles(opener) {
  const dialog = document.getElementById('profile-manager');
  dialog.innerHTML = `<div class="profile-manager-head"><div><p class="eyebrow">${tr('나와 가족의 운세', 'Readings for you and your family')}</p><h2 id="profile-manager-title">${tr('저장한 사람', 'Saved people')}</h2></div><button class="sbtn" type="button" data-close-dialog autofocus>${tr('닫기 ×', 'Close ×')}</button></div><p class="hint">${tr('이 브라우저에만 저장합니다. 다른 기기와 동기화되지 않으며 사이트 데이터를 지우면 사라집니다.', 'Saved only in this browser. People do not sync across devices and are removed if you clear site data.')}</p><div data-profile-content></div><p class="profile-feedback" role="status" data-profile-feedback></p>`;
  dialog.onclose = () => { if (opener.isConnected) opener.focus({ preventScroll: true }); };
  if (!dialog.open) dialog.showModal();
  const content = dialog.querySelector('[data-profile-content]');
  const feedback = dialog.querySelector('[data-profile-feedback]');
  let people = [], busy = false;
  const failure = () => { feedback.textContent = tr('저장소에 접근하지 못했습니다. 다른 탭을 닫거나 브라우저 저장 설정을 확인한 뒤 다시 시도해 주세요.', 'Could not access storage. Close other tabs or check browser storage settings, then try again.'); };
  const summary = p => `${p.calendar === 'lunar' ? tr('음력', 'Lunar') + (p.leap ? tr(' 윤달', ' leap month') : '') : tr('양력', 'Solar')} ${p.y}.${p.m}.${p.d} · ${p.gender === 'M' ? tr('남성', 'Male') : tr('여성', 'Female')} · ${p.noTime ? tr('시간 모름', 'Unknown time') : p.timeMode === 'branch' ? tr('시진 저장', 'Hour interval') : p.time}`;
  async function renderList() {
    people = await listPeople();
    content.innerHTML = `<div class="profile-list-toolbar"><p>${tr(`${people.length}명 저장됨`, `${people.length} saved`)}</p><button type="button" class="btn" data-add-person>${tr('사람 추가', 'Add person')}</button></div>${people.length ? `<ul class="profile-list">${people.map(person => `<li data-person-id="${esc(person.id)}"><div><h3>${esc(profileLabel(person.profile))}</h3><p>${esc(summary(person.profile))}</p></div><div class="profile-row-actions"><button type="button" class="sbtn" data-use-person="${esc(person.id)}">${tr('선택', 'Select')}</button><button type="button" class="link-btn" data-edit-person="${esc(person.id)}">${tr('수정', 'Edit')}</button><button type="button" class="link-btn" data-delete-person="${esc(person.id)}">${tr('삭제', 'Delete')}</button></div><div class="profile-delete-confirm" data-confirm-person="${esc(person.id)}" hidden><p>${tr('이 사람의 저장 정보를 삭제할까요?', 'Delete this saved person?')}</p><button type="button" class="sbtn" data-confirm-delete="${esc(person.id)}">${tr('삭제하기', 'Delete person')}</button><button type="button" class="link-btn" data-cancel-delete>${tr('취소', 'Cancel')}</button></div></li>`).join('')}</ul>` : `<div class="profile-empty"><h3>${tr('가족의 생일, 한 번만 입력하세요', 'Enter family birthdays once')}</h3><p>${tr('나·부모님·친구를 이름으로 저장하고, 운세와 궁합에서 바로 선택할 수 있어요.', 'Save yourself, family and friends by name, then choose them in readings and compatibility.')}</p></div>`}`;
  }
  function edit(person) {
    feedback.textContent = '';
    content.innerHTML = `<form id="person-editor" class="pform" novalidate><h3>${person ? tr('저장 정보 수정', 'Edit saved details') : tr('새로운 사람', 'New person')}</h3>${personFields('person')}<p class="form-error" data-person-error role="alert" hidden></p><div class="profile-editor-actions"><button class="btn" type="submit">${tr('저장', 'Save')}</button><button class="sbtn" type="button" data-cancel-edit>${tr('취소', 'Cancel')}</button></div><p class="hint">${tr('저장을 누르면 표시 이름과 출생 정보를 이 기기에 보관합니다.', 'Save keeps this display name and birth details on this device.')}</p></form>`;
    const form = content.querySelector('form');
    wireBirthForm(form, ['person']);
    if (person) fillForm(form, 'person', person.profile); else syncTime(form, 'person');
    form.querySelector('#person-name').focus();
    form.onsubmit = async event => {
      event.preventDefault();
      if (busy) return;
      const input = readForm(form, 'person'), error = form.querySelector('[data-person-error]');
      let message = check(input);
      if (!message) { try { buildChart(toEngine(input)); } catch (e) { message = e.message; } }
      error.textContent = message; error.hidden = !message;
      if (message) { error.tabIndex = -1; error.focus(); return; }
      busy = true; form.inert = true;
      try {
        await savePerson(input, person?.id);
        await renderList();
        feedback.textContent = tr('이 기기에 저장했습니다.', 'Saved on this device.');
        content.querySelector('[data-add-person]').focus();
        await showProfileGuide();
      } catch { failure(); } finally { busy = false; form.inert = false; }
    };
  }
  content.onclick = async event => {
    const button = event.target.closest('button');
    if (!button || busy) return;
    const data = button.dataset;
    try {
      if ('addPerson' in data) edit();
      else if (data.editPerson) edit(people.find(person => person.id === data.editPerson));
      else if ('cancelEdit' in data) { await renderList(); content.querySelector('[data-add-person]').focus(); }
      else if (data.deletePerson) {
        const panel = button.closest('li').querySelector('[data-confirm-person]'); panel.hidden = false; panel.querySelector('button').focus();
      } else if ('cancelDelete' in data) {
        button.closest('li').querySelector('[data-delete-person]').focus(); button.closest('[data-confirm-person]').hidden = true;
      } else if (data.confirmDelete) {
        busy = true; await deletePerson(data.confirmDelete); await renderList();
        feedback.textContent = tr('저장 정보를 삭제했습니다.', 'Saved person deleted.'); content.querySelector('[data-add-person]').focus();
      } else if (data.usePerson) {
        busy = true;
        const tojeong = document.getElementById('tojeong-tool');
        const saved = people.find(person => person.id === data.usePerson);
        const profile = tojeong ? { ...saved.profile, profileId: saved.id } : await selectPerson(data.usePerson);
        dialog.close();
        if (document.getElementById('tool') || tojeong) document.dispatchEvent(new globalThis.CustomEvent('profile-selected', { detail: { profile, slot: 'a' } }));
        else location.href = languagePath('/today/', isEnglish() ? 'en' : 'ko');
      }
    } catch { failure(); } finally { busy = false; }
  };
  try { await renderList(); } catch { failure(); content.innerHTML = `<button type="button" class="sbtn" data-retry-people>${tr('다시 시도', 'Try again')}</button>`; content.querySelector('button').onclick = () => openProfiles(opener); }
}

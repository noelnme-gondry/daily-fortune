import { tr } from '../i18n/runtime.js';
import { esc } from './util.js';
import { birthTimeOptions } from '../domain/birth-time.js';
import { BIRTH_TIME_HINT } from '../domain/birth-input.js';

export const profilePicker = p => `<div class="profile-picker" hidden><label for="${p}-saved-person">${tr('저장한 사람 선택', 'Choose a saved person')}</label><select class="input" id="${p}-saved-person" data-profile-picker="${p}"><option value="">${tr('직접 입력 · 새 사람', 'Enter details · new person')}</option></select><button class="link-btn" type="button" data-manage-profiles aria-controls="profile-manager" aria-haspopup="dialog">${tr('목록 관리', 'Manage people')}</button></div>`;

export function personFields(p, legend) {
  const ms = [...Array(12).keys()].map((i) => `<option value="${i + 1}">${i + 1}${tr("월", "")}</option>`).join('');
  const ds = [...Array(31).keys()].map((i) => `<option value="${i + 1}">${i + 1}${tr("일", "")}</option>`).join('');
  return `<fieldset class="person" data-person="${p}">
    ${legend ? `<legend class="person-legend">${esc(legend)}</legend>` : ''}
    ${['a', 'b'].includes(p) ? profilePicker(p) : ''}
    <fieldset class="field field-birth"><legend>${tr("생년월일", "Birth date")}</legend>
      <div class="seg"><label><input type="radio" name="${p}-cal" value="solar" checked><span>${tr("양력", "Solar")}</span></label><label><input type="radio" name="${p}-cal" value="lunar"><span>${tr("음력", "Korean lunar")}</span></label></div>
      <div class="ymd"><input class="input" type="text" id="${p}-y" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" autocomplete="section-${p} bday-year" aria-label="${tr("태어난 해", "Birth year")}" placeholder="${tr('예시 1990', 'e.g. 1990')}" required><select class="input" id="${p}-m" aria-label="${tr("태어난 달", "Birth month")}" required><option value="">${tr('월', 'Month')}</option>${ms}</select><select class="input" id="${p}-d" aria-label="${tr("태어난 날", "Birth day")}" required><option value="">${tr('일', 'Day')}</option>${ds}</select></div>
      <label class="check"><input type="checkbox" id="${p}-leap" disabled>${tr(" 음력 윤달", " Lunar leap month")}</label>
    </fieldset>
    <fieldset class="field field-gender"><legend>${tr("성별", "Gender")}</legend>
      <div class="seg"><label><input type="radio" name="${p}-gender" value="F"><span>${tr("여성", "Female")}</span></label><label><input type="radio" name="${p}-gender" value="M" checked><span>${tr("남성", "Male")}</span></label></div>
    </fieldset>
    <fieldset class="field field-time"><legend>${tr("태어난 시각", "Birth time")}</legend>
      <div class="seg seg-time"><label><input type="radio" name="${p}-tmode" value="exact" checked><span>${tr("시각 입력", "Enter a time")}</span></label><label><input type="radio" name="${p}-tmode" value="branch"><span>${tr("시진만 알아요", "I know the birth period")}</span></label></div>
      <input class="input" type="time" id="${p}-time" aria-label="${tr("태어난 시각", "Birth time")}" aria-describedby="${p}-time-hint">
      <select class="input" id="${p}-branch" aria-label="${tr("태어난 시진", "Two-hour birth period")}" aria-describedby="${p}-time-hint" hidden>${birthTimeOptions().map((t) => `<option value="${t.value}"${t.value === '6' ? ' selected' : ''}>${t.label}</option>`).join('')}</select>
      <label class="check"><input type="checkbox" id="${p}-notime">${tr(" 시간을 몰라요", " Time unknown")}</label>
      <p class="hint" id="${p}-time-hint" data-time-hint>${BIRTH_TIME_HINT.exact}</p>
    </fieldset>
    <div class="field field-name"><label for="${p}-name">${tr('표시 이름 (선택)', 'Display name (optional)')}</label><input class="input" id="${p}-name" maxlength="12" autocomplete="off" placeholder="${tr('예: 나, 엄마, 동생', 'e.g. Me, Mum, Alex')}"><span class="hint">${tr('저장 목록과 결과에 표시합니다. 실명은 필요 없어요.', 'Used in your saved list and results. A nickname is fine.')}</span></div>
  </fieldset>`;
}

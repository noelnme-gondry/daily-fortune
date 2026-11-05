import { birthTimesFor } from '../engine/chart.js';
import { tr } from '../i18n/runtime.js';
import { birthTimeOptions, normalizeBranch, branchOfTime } from '../domain/birth-time.js';
import { birthDateError, BIRTH_TIME_HINT as TIME_HINT } from '../domain/birth-input.js';
const $ = (s, el = document) => el.querySelector(s);

// 시각 입력 방식(정확한 시각 / 시진)과 날짜에 맞는 시계 기준 시진 구간을 화면에 반영한다.
export function syncTime(form, who, want) {
  const f = (id) => $(`#${who}-${id}`, form);
  if (!f('branch')) return;
  const mode = $(`input[name="${who}-tmode"]:checked`, form).value;
  const noTime = f('notime').checked;
  const { off, note } = f('y').value && f('m').value && f('d').value
    ? birthTimesFor({ calendar: $(`input[name="${who}-cal"]:checked`, form).value, leap: f('leap').checked, y: +f('y').value, m: +f('m').value, d: +f('d').value })
    : { off: 540, note: '' };
  const opts = birthTimeOptions(off);
  const current = normalizeBranch(want ?? f('branch').value);
  const sameBranch = (v) => v != null && opts.find((o) => o.branch === +String(v).replace(/^[np]/, ''));
  const pick = opts.find((o) => o.value === current) || sameBranch(current) || opts.find((o) => o.value === '6');
  f('branch').innerHTML = opts.map((o) => `<option value="${o.value}">${o.label}</option>`).join('');
  f('branch').value = pick.value;
  f('time').hidden = mode !== 'exact';
  f('branch').hidden = mode !== 'branch';
  f('time').disabled = f('branch').disabled = noTime;
  form.querySelectorAll(`input[name="${who}-tmode"]`).forEach((r) => { r.disabled = noTime; });
  $(`#${who}-time-hint`, form).textContent = noTime ? TIME_HINT.none : mode === 'exact' ? TIME_HINT.exact : `${TIME_HINT.branch}${note ? ` ${note}` : ''}`;
  return off;
}
export function fillForm(form, who, p) {
  if (!p) return;
  const f = (id) => $(`#${who}-${id}`, form);
  f('name').value = p.name || '';
  const g = $(`input[name="${who}-gender"][value="${p.gender}"]`, form); if (g) g.checked = true;
  const c = $(`input[name="${who}-cal"][value="${p.calendar}"]`, form); if (c) c.checked = true;
  if ([...f('y').options].some((o) => +o.value === p.y)) f('y').value = String(p.y);
  f('m').value = String(p.m); f('d').value = String(p.d);
  f('leap').checked = !!p.leap; f('leap').disabled = p.calendar !== 'lunar';
  const branch = p.timeMode === 'branch';
  $(`input[name="${who}-tmode"][value="${branch ? 'branch' : 'exact'}"]`, form).checked = true;
  f('time').value = !branch && p.time ? p.time : '12:00';
  f('notime').checked = !!p.noTime;
  syncTime(form, who, branch ? p.timeBranch : undefined);
}
export function readForm(form, who) {
  const f = (id) => $(`#${who}-${id}`, form);
  const mode = $(`input[name="${who}-tmode"]:checked`, form).value;
  return {
    name: f('name').value.trim().slice(0, 12),
    gender: $(`input[name="${who}-gender"]:checked`, form).value,
    calendar: $(`input[name="${who}-cal"]:checked`, form).value,
    leap: f('leap').checked,
    y: +f('y').value, m: +f('m').value, d: +f('d').value,
    timeMode: mode,
    time: mode === 'exact' ? f('time').value : null,
    timeBranch: mode === 'branch' ? f('branch').value : null,
    noTime: f('notime').checked,
  };
}
export const check = (p) => birthDateError(p) || (!p.noTime && p.timeMode === 'exact' && !/^\d{1,2}:\d{2}$/.test(p.time || '') ? tr("태어난 시각을 입력하거나 ‘시간을 몰라요’를 선택해 주세요.", "Enter a birth time or select “I don’t know the time”.") : '');

export function wireBirthForm(form, people) {
  people.forEach((p) => {
    if (!$(`#${p}-name`, form)) return;
    form.addEventListener('change', (e) => {
      if (e.target.name === `${p}-cal`) $(`#${p}-leap`, form).disabled = e.target.value !== 'lunar';
      if (!e.target.closest(`[data-person="${p}"]`)) return;
      if (e.target.name === `${p}-tmode`) {
        // 방식을 바꿔도 같은 시간대를 유지한다: 시각 → 그 시각의 시진, 시진 → 구간의 가운데 시각
        const off = birthTimesFor(readForm(form, p)).off;
        const time = $(`#${p}-time`, form), branch = $(`#${p}-branch`, form);
        if (e.target.value === 'branch') { syncTime(form, p, branchOfTime(time.value, off)?.value); return; }
        if (branchOfTime(time.value, off)?.value !== branch.value) time.value = birthTimeOptions(off).find((o) => o.value === branch.value)?.time || time.value;
      }
      if (e.target.id !== `${p}-time`) syncTime(form, p);
    });
  });
}

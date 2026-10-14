// 계산기 페이지: 폼 ↔ 저장된 입력값 ↔ 결과 렌더링
import {
  buildChart, ChartInputError, day, week, month, year, yearMonths, lifetime, compat, todayKST, addDays, daysIn,
} from '../engine/index.js';
import { load, save, toHash, fromHash, toEngine, SAMPLE } from './profile.js';
import { chartCard, dayView, weekView, monthView, yearView, lifeView, compatView, manseView } from './views.js';
import { shareBlock, wireShare } from './share.js';

const $ = (s, el = document) => el.querySelector(s);

function fillForm(form, who, p) {
  if (!p) return;
  const f = (id) => $(`#${who}-${id}`, form);
  f('name').value = p.name || '';
  const g = $(`input[name="${who}-gender"][value="${p.gender}"]`, form); if (g) g.checked = true;
  const c = $(`input[name="${who}-cal"][value="${p.calendar}"]`, form); if (c) c.checked = true;
  if ([...f('y').options].some((o) => +o.value === p.y)) f('y').value = String(p.y);
  f('m').value = String(p.m); f('d').value = String(p.d);
  f('leap').checked = !!p.leap; f('leap').disabled = p.calendar !== 'lunar';
  f('time').value = p.time || '12:00'; f('time').disabled = !!p.noTime;
  f('notime').checked = !!p.noTime;
}
function readForm(form, who) {
  const f = (id) => $(`#${who}-${id}`, form);
  return {
    name: f('name').value.trim().slice(0, 12),
    gender: $(`input[name="${who}-gender"]:checked`, form).value,
    calendar: $(`input[name="${who}-cal"]:checked`, form).value,
    leap: f('leap').checked,
    y: +f('y').value, m: +f('m').value, d: +f('d').value,
    time: f('time').value || '12:00', noTime: f('notime').checked,
  };
}
function check(p) {
  if (p.calendar === 'solar' && p.d > daysIn(p.y, p.m)) return `${p.y}년 ${p.m}월에는 ${p.d}일이 없습니다.`;
  return '';
}
function navTabs(mode, today) {
  const y = today.y;
  const items = [['today', '/today/', '오늘'], ['tomorrow', '/tomorrow/', '내일'], ['week', '/week/', '이번 주'], ['month', '/month/', '이번 달'], [`year${y}`, `/year/${y}/`, `${y}년`], [`year${y + 1}`, `/year/${y + 1}/`, `${y + 1}년`], ['lifetime', '/lifetime/', '평생'], ['compatibility', '/compatibility/', '궁합'], ['manseryeok', '/manseryeok/', '만세력']];
  return `<nav class="tabs" aria-label="다른 운세 보기">${items.map(([k, h, n]) => `<a href="${h}"${k === mode ? ' aria-current="page"' : ''}>${n}</a>`).join('')}</nav>`;
}

export function mount(root) {
  const mode = root.dataset.tool;
  const form = $('#tool-form', root);
  const out = $('#result', root);
  const today = todayKST();
  const pair = mode === 'compatibility';
  const yr = +(root.dataset.year || today.y);
  const tabMode = mode === 'year' ? `year${yr}` : mode;

  ['a', 'b'].forEach((who) => {
    if (!$(`#${who}-name`, form)) return;
    form.addEventListener('change', (e) => {
      if (e.target.name === `${who}-cal`) $(`#${who}-leap`, form).disabled = e.target.value !== 'lunar';
      if (e.target.id === `${who}-notime`) $(`#${who}-time`, form).disabled = e.target.checked;
    });
  });

  function showError(msg) {
    let el = $('.form-error', form);
    if (!el) { el = document.createElement('p'); el.className = 'form-error'; el.setAttribute('role', 'alert'); $('.form-actions', form).after(el); }
    el.textContent = msg;
    el.hidden = !msg;
  }

  function render(a, b, opts = {}) {
    let ca, cb;
    try {
      ca = buildChart(toEngine(a));
      if (pair) cb = buildChart(toEngine(b));
    } catch (e) {
      showError(e instanceof ChartInputError ? e.message : '입력한 날짜를 확인해 주세요.');
      return false;
    }
    showError('');
    let html = '';
    if (!pair) html += chartCard(ca, a, today);
    html += navTabs(tabMode, today);
    if (mode === 'today') html += dayView(day(ca, today, 'today'));
    else if (mode === 'tomorrow') html += dayView(day(ca, addDays(today, 1), 'tomorrow'));
    else if (mode === 'week') html += weekView(week(ca, today), today);
    else if (mode === 'month') html += monthView(month(ca, today.y, today.m), today);
    else if (mode === 'year') html += yearView(year(ca, yr, yr === today.y + 1 ? 'next' : 'this'), yearMonths(ca, yr), today);
    else if (mode === 'lifetime') html += lifeView(lifetime(ca, today), ca, today);
    else if (mode === 'compatibility') html += compatView(compat(ca, cb, today), ca, cb, today);
    else if (mode === 'manseryeok') html += manseView(ca);
    if (opts.sample) html = `<p class="chip" style="justify-self:start">예시 인물의 결과입니다. 내 정보를 입력하면 내 운세로 바뀝니다.</p>${html}`;
    html += shareBlock();
    out.innerHTML = html;
    root.classList.add('has-result');
    wireShare(out, { mode, hash: toHash(a, pair ? b : null), title: document.title.split(' | ')[0], name: ca.name });
    return true;
  }

  // 시작 상태: 공유 링크 > 저장된 입력값 > 빈 폼
  const shared = fromHash(location.hash);
  const a0 = shared.a || load('a');
  const b0 = shared.b || load('b');
  fillForm(form, 'a', a0);
  if (pair) fillForm(form, 'b', b0);
  if (mode !== 'home' && a0 && (!pair || b0)) render(a0, b0);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const a = readForm(form, 'a');
    const b = pair ? readForm(form, 'b') : null;
    const err = check(a) || (b && check(b));
    if (err) { showError(err); return; }
    if (mode === 'home') {
      try { buildChart(toEngine(a)); } catch (er) { showError(er.message || '입력한 날짜를 확인해 주세요.'); return; }
      save('a', a);
      location.href = '/today/';
      return;
    }
    if (render(a, b)) {
      save('a', a);
      if (pair) save('b', b);
      if (location.hash) history.replaceState(null, '', location.pathname);
      out.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
  const sample = $('[data-sample]', form);
  if (sample) sample.addEventListener('click', () => {
    fillForm(form, 'a', SAMPLE.a);
    if (pair) fillForm(form, 'b', SAMPLE.b);
    if (mode === 'home') { location.href = `/today/${toHash(SAMPLE.a)}`; return; }
    render(SAMPLE.a, SAMPLE.b, { sample: true });
    out.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

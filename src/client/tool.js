// 계산기 페이지: 폼 ↔ 저장된 입력값 ↔ 결과 렌더링 ↔ 결과 공유
import {
  buildChart, birthTimesFor, ChartInputError, day, week, month, year, yearMonths, lifetime, compat, lifeStory, sajuRank,
  todayKST, addDays, daysIn, isoDate, iljuSlug, pillarKo, pillarLabel, pillarH, josa,
} from '../engine/index.js';
import { tr, bilingual, isEnglish } from '../i18n/runtime.js';
import { term } from '../i18n/terms.js';
import { languagePath } from '../site/locale.js';
import RANK_TABLE from '../content/rank-table.js';
import { ILJU_TAG } from '../content/knowledge.js';
import { load, save, removeSaved, sessionLoad, sessionSave, takeLegacy, toEngine } from './profile.js';
import { chartCard, dayView, weekView, monthView, yearView, lifeView, compatView, manseView, storyView, rankView } from './views.js';
import { resultShareHtml, wireShare } from './share.js';
import { shareUrl, characterCode, SHARE_KINDS, cleanName } from '../site/share-codec.js';
import { track, trackInputStart } from './analytics.js';
import { birthTimeOptions, normalizeBranch, branchOfTime } from '../domain/birth-time.js';
import { compatMatchesShell, mountCompatMatches } from './compat-matches-view.js';
import { mountRankLeaders } from './rank-leaders-view.js';
import { renderResultWithPartnerAd, clearResultWithPartnerAd } from './partner-ad.js';
import { toolNavigation, nextToolsHtml } from '../site/tool-navigation.js';
import { esc } from '../site/util.js';
import { refreshPeriodContext } from './period-context.js';

const $ = (s, el = document) => el.querySelector(s);
const sexIdx = (p) => [...Array(60).keys()].find((n) => n % 10 === p.s && n % 12 === p.b);

// 시각 입력 방식(정확한 시각 / 시진)과 날짜에 맞는 시계 기준 시진 구간을 화면에 반영한다.
const TIME_HINT = bilingual({
  exact: '출생 당시 시계 시각 그대로 넣으세요. 30분 보정과 서머타임은 자동으로 계산합니다.',
  branch: '출생 당시 시계 기준 구간입니다.',
  none: '시주 없이 년·월·일 세 기둥으로 계산합니다.',
}, {
  exact: 'Enter the clock time recorded at birth in Korea. The 30-minute adjustment and historical daylight saving are applied automatically. Birth-country and birth-location time conversion is not included.',
  branch: 'Intervals follow the clock time used at birth in Korea.',
  none: 'Uses the year, month and day pillars without an hour pillar.',
});
function syncTime(form, who, want) {
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
function fillForm(form, who, p) {
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
function readForm(form, who) {
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
const check = (p) => (!p.y || !p.m || !p.d ? tr('생년월일을 모두 선택해 주세요.', 'Select your birth year, month and day.')
  : p.calendar === 'solar' && p.d > daysIn(p.y, p.m) ? tr(`${p.y}년 ${p.m}월에는 ${p.d}일이 없습니다.`, `Day ${p.d} does not exist in ${p.y}-${p.m}.`)
  : !p.noTime && p.timeMode === 'exact' && !/^\d{1,2}:\d{2}$/.test(p.time || '') ? tr("태어난 시각을 입력하거나 ‘시간을 몰라요’를 선택해 주세요.", "Enter a birth time or select “I don’t know the time”.") : '');
function navTabs(mode, today) {
  return `<nav class="tabs" aria-label="${tr("다른 운세 보기", "More fortunes")}">${toolNavigation(today).map(t => `<a href="${t.path}"${t.key === mode ? ' aria-current="page"' : ''}>${esc(t.nav)}</a>`).join('')}</nav>`;
}
const who = (name) => cleanName(name) ? tr(`${cleanName(name)}님`, cleanName(name)) : tr('나', 'Me');
const owner = (name) => isEnglish() ? (cleanName(name) ? `${cleanName(name)}’s` : 'My') : `${who(name)}의`;
const points = (score) => tr(`${score}점`, `${score} pts`);

// 결과 → 공유 카드 주소 + 이미지 카드 데이터
function shareFor(mode, res, ca, cb, today, yr) {
  const n = cleanName(ca.name);
  const o = location.origin;
  const label = (k) => SHARE_KINDS[k].label;
  if (mode === 'today' || mode === 'tomorrow') {
    const r = res; const k = mode;
    return { kind: k, url: shareUrl(o, { k, n, s: r.overall.score, h: r.overall.headline, d: isoDate(r.date) }), title: tr(`${who(n)}의 ${r.date.m}월 ${r.date.d}일 운세 ${r.overall.score}점`, `${owner(n)} fortune for ${isoDate(r.date)}: ${r.overall.score} pts`), text: r.overall.headline,
      card: { kicker: tr(`${who(n)}의 ${r.date.m}월 ${r.date.d}일 운세`, `${owner(n)} fortune · ${isoDate(r.date)}`), big: points(r.overall.score), title: r.overall.headline, lines: r.cats.slice().sort((a, b) => b.score - a.score).slice(0, 3).map((c) => [c.name, points(c.score)]) } };
  }
  if (mode === 'week' || mode === 'month' || mode === 'year') {
    const r = res.report || res; const k = mode;
    const what = mode === 'year' ? tr(`${yr}년 운세`, `${yr} fortune`) : label(k);
    return { kind: k, url: shareUrl(o, { k, n, s: r.overall.score, h: r.overall.headline, y: mode === 'year' ? yr : '' }), title: `${owner(n)} ${what} ${points(r.overall.score)}`, text: r.overall.headline,
      card: { kicker: `${owner(n)} ${what}`, big: points(r.overall.score), title: r.overall.headline, lines: r.cats.slice().sort((a, b) => b.score - a.score).slice(0, 3).map((c) => [c.name, points(c.score)]) } };
  }
  if (mode === 'lifetime' || mode === 'manseryeok') {
    const p = ca.pillars.day; const k = mode === 'lifetime' ? 'life' : 'manse';
    const tag = ILJU_TAG[sexIdx(p)];
    return { kind: k, url: shareUrl(o, { k, n, i: iljuSlug(p) }), title: tr(`${josa(who(n), '은/는')} ${pillarKo(p)}일주 — ${tag.split(' — ')[0]}`, `${owner(n)} day pillar: ${pillarLabel(p)} — ${tag.split(' — ')[0]}`), text: tag,
      card: { kicker: tr(`${who(n)}의 사주`, `${owner(n)} saju`), big: tr(`${pillarKo(p)}일주 ${pillarH(p)}`, pillarLabel(p)), title: tag, lines: [[tr('원국', 'Birth chart'), ca.cols.slice().reverse().map((x) => pillarH(x)).join(' ')], [tr('일간 강약', 'Day Master strength'), term(ca.strengthLabel)]] } };
  }
  if (mode === 'compatibility') {
    const r = res; const n2 = cleanName(cb.name);
    return { kind: 'compat', url: shareUrl(o, { k: 'compat', n, n2, s: r.total, h: r.headline }), title: tr(`${n || '나'} × ${n2 || '상대'} 궁합 ${r.total}점`, `${n || 'Me'} × ${n2 || 'Partner'} compatibility: ${r.total} pts`), text: r.headline, image: '/og-compat.png',
      card: { kicker: tr(`${n || '나'} × ${n2 || '상대'} 사주 궁합`, `${n || 'Me'} × ${n2 || 'Partner'} saju compatibility`), big: points(r.total), title: r.headline, lines: r.cats.slice(0, 4).map((c) => [`${c.name}`, points(c.score)]) } };
  }
  if (mode === 'story') {
    const st = res;
    const codes = st.stages.map((s) => characterCode(s.character.adj, s.character.portrait));
    return { kind: 'story', url: shareUrl(o, { k: 'story', n, a: st.arc.key, c: codes.join(',') }), title: tr(`사주로 본 ${who(n)}의 인생: ${st.arc.name}`, `${owner(n)} saju life story: ${st.arc.name}`), text: st.stages.map((s) => `${s.label} ${s.character.full}`).join(' → '), image: '/og-story.png',
      card: { kicker: tr(`사주로 본 ${who(n)}의 인생은`, `${owner(n)} saju life story`), big: st.arc.name, title: st.arc.desc.split('. ')[0] + '.', lines: st.stages.filter((_, i) => [0, 4, 8].includes(i)).map((s) => [s.ages, s.character.full]) } };
  }
  if (mode === 'rank') {
    const r = res;
    return { kind: 'rank', url: shareUrl(o, { k: 'rank', n, s: r.total, r: r.rank, w: r.withHour ? 1 : 0, t: r.tier.code }), title: tr(`${who(n)}의 사주는 ${r.of.toLocaleString('ko-KR')}가지 중 ${r.rank.toLocaleString('ko-KR')}위 (상위 ${r.pct}%)`, `${owner(n)} saju ranks #${r.rank.toLocaleString('en-US')} of ${r.of.toLocaleString('en-US')} (top ${r.pct}%)`), text: r.tier.name, image: '/og-rank.png',
      card: { kicker: tr(`${who(n)}의 사주 랭킹`, `${owner(n)} saju ranking`), big: tr(`${r.rank.toLocaleString('ko-KR')}위`, `#${r.rank.toLocaleString('en-US')}`), title: tr(`${r.tier.name} · 상위 ${r.pct}%`, `${r.tier.name} · top ${r.pct}%`), lines: [[tr('사주 점수', 'Saju score'), tr(`${r.total}점 (평균 ${r.avgTotal}점)`, `${r.total} pts (average ${r.avgTotal})`)], [tr('전체', 'Total'), tr(`${r.of.toLocaleString('ko-KR')}가지 사주 중`, `${r.of.toLocaleString('en-US')} chart combinations`)], ...r.cats.slice().sort((a, b) => a.pct - b.pct).slice(0, 2).map((k) => [k.name, tr(`상위 ${k.pct}%`, `Top ${k.pct}%`)])] } };
  }
  return null;
}

export async function mount(root) {
  const entryPoint = root.dataset.tool;
  let originEntry = entryPoint;
  const mode = entryPoint === 'home' ? 'today' : entryPoint;
  const form = $('#tool-form', root);
  trackInputStart(form, mode, entryPoint);
  const out = $('#result', root);
  let today = todayKST();
  const pair = mode === 'compatibility';
  const yr = +(root.dataset.year || today.y);
  const tabMode = mode === 'year' ? `year${yr}` : mode;
  let stopMatches;
  let currentInputs;
  let currentChart;
  let selectedDateButton;
  let submitting = false;

  ['a', 'b'].forEach((p) => {
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

  function showError(msg, person = 'a') {
    let el = $('.form-error', form);
    if (!el) { el = document.createElement('p'); el.id = 'tool-form-error'; el.className = 'form-error'; el.setAttribute('role', 'alert'); $('.form-actions', form).after(el); }
    form.querySelectorAll('[aria-invalid]').forEach(input => { input.removeAttribute('aria-invalid'); input.removeAttribute('aria-errormessage'); });
    el.textContent = msg;
    el.hidden = !msg;
    if (msg) {
      stopMatches?.();
      clearResultWithPartnerAd(out);
      root.classList.remove('has-result');
      currentInputs = null;
      const dateInputs = ['y', 'm', 'd'].map(id => $(`#${person}-${id}`, form));
      const emptyInputs = dateInputs.filter(input => !input.value);
      const input = readForm(form, person);
      const invalid = emptyInputs.length ? emptyInputs : check({ ...input, noTime: true })
        ? dateInputs : !input.noTime && input.timeMode === 'exact' && !input.time ? [$(`#${person}-time`, form)] : dateInputs;
      for (const input of invalid) { input.setAttribute('aria-invalid', 'true'); input.setAttribute('aria-errormessage', el.id); }
      (invalid.find(input => !input.value) || invalid.at(-1)).focus();
      track('form_error', { tool: mode, entry_point: originEntry });
    }
  }

  function render(a, b, source) {
    const fresh = todayKST();
    const changed = isoDate(fresh) !== root.dataset.date;
    today = fresh;
    root.dataset.date = isoDate(today);
    if (changed) refreshPeriodContext(root, mode, today);
    let ca, cb;
    let calculatingPerson = 'a';
    try {
      ca = buildChart(toEngine(a));
      if (pair) { calculatingPerson = 'b'; cb = buildChart(toEngine(b)); }
    } catch (e) {
      showError(e instanceof ChartInputError ? e.message : tr("입력한 날짜를 확인해 주세요.", "Please check the date you entered."), calculatingPerson);
      return false;
    }
    showError('');
    let html = '';
    let res;
    let leaderRank;
    if (mode === 'manseryeok') html += chartCard(ca, a, today);
    if (mode === 'today') { res = day(ca, today, 'today'); html += dayView(res); }
    else if (mode === 'tomorrow') { res = day(ca, addDays(today, 1), 'tomorrow'); html += dayView(res); }
    else if (mode === 'week') { res = week(ca, today); html += weekView(res, today); }
    else if (mode === 'month') { res = month(ca, today.y, today.m); html += monthView(res, today); }
    else if (mode === 'year') { res = year(ca, yr, yr === today.y + 1 ? 'next' : 'this'); html += yearView(res, yearMonths(ca, yr), today); }
    else if (mode === 'lifetime') { res = lifetime(ca, today); html += lifeView(res, ca, today); }
    else if (mode === 'compatibility') { res = compat(ca, cb, today); html += compatView(res, ca, cb, today); }
    else if (mode === 'manseryeok') { html += manseView(ca); }
    else if (mode === 'story') { res = lifeStory(ca, today); html += storyView(res, ca); }
    else if (mode === 'rank') {
      res = sajuRank(ca, RANK_TABLE);
      // 밤 자시·절기 경계도 시간 제외 입력과 일치하도록 생년월일에서 다시 계산한다.
      leaderRank = sajuRank(buildChart(toEngine({ ...a, noTime: true })), RANK_TABLE);
      html += rankView(res, ca, leaderRank);
    }
    if (!pair && mode !== 'manseryeok') html += `<details class="chart-disclosure"><summary>${tr('내 사주 원국과 오행 자세히', 'Explore your birth chart and Five Elements')}</summary>${chartCard(ca, a, today)}</details>`;
    html += nextToolsHtml(mode, today) + navTabs(tabMode, today);
    html += `<div class="result-actions"><button type="button" class="link-btn" data-edit-profile>${tr('입력 정보 수정·저장', 'Edit or save your details')}</button><span class="hint">${tr('이 기기에 저장하면 다음 방문에 바로 볼 수 있어요.', 'Save on this device for quicker access next time.')}</span></div>`;
    const share = shareFor(mode, res, ca, cb, today, yr);
    if (share) html += resultShareHtml();
    if (pair) html += compatMatchesShell(ca, cb);
    stopMatches?.();
    const readingDate = isoDate(res?.date || today);
    renderResultWithPartnerAd(out, html, { tool: mode, calc_origin: source, reading_date: readingDate });
    currentInputs = { a, b };
    currentChart = ca;
    if (mode === 'rank') mountRankLeaders($('.rank-leaders', out), leaderRank);
    if (pair) stopMatches = mountCompatMatches($('.compat-matches', out), { a: toEngine(a), b: toEngine(b) }, { a: ca, b: cb }, today);
    root.classList.add('has-result');
    if (share) wireShare($('.result-share', out), share);
    const ev = { tool: mode, calc_origin: source, entry_point: originEntry, reading_date: readingDate };
    track('calc_result', ev);
    // 기존 이벤트 이름은 유지하되 개인 결과·등급은 분석 도구로 보내지 않는다.
    if (mode === 'story') track('story_result');
    if (mode === 'rank') track('rank_result');
    if (mode === 'compatibility') track('compat_result');
    return true;
  }

  const storageStatus = $('[data-storage-status]', form);
  const persist = $('#save-device', form);
  form.inert = true;
  let savedA, savedB;
  try { [savedA, savedB] = await Promise.all([load('a'), load('b')]); }
  catch { storageStatus.textContent = tr("저장소를 불러오지 못했습니다. 저장 없이 계산할 수 있습니다.", "Could not load saved details. You can still calculate without saving."); }
  finally { form.inert = false; }
  persist.checked = !!savedA;
  try { const preference = sessionStorage.getItem('ohaeng:save-device'); if (preference !== null) persist.checked = preference === 'true'; } catch { /* 접근 제한 */ }
  persist.addEventListener('change', () => { try { sessionStorage.setItem('ohaeng:save-device', String(persist.checked)); } catch { /* 접근 제한 */ } });
  const legacy = ['a', 'b'].map(takeLegacy);
  if (legacy.some(Boolean)) storageStatus.textContent = tr("이전 버전에서 자동 저장된 입력을 불러왔습니다. 다음 방문에도 쓰려면 ‘이 기기에 저장’을 선택하세요.", "Loaded details saved by an earlier version. Select “Save on this device” to keep them for future visits.");
  const a0 = sessionLoad('a') || savedA || legacy[0];
  const b0 = sessionLoad('b') || savedB || legacy[1];
  fillForm(form, 'a', a0);
  if (pair) fillForm(form, 'b', b0);
  for (const p of pair ? ['a', 'b'] : ['a']) syncTime(form, p);
  let restoreOrigin = sessionLoad('a') ? 'session_restore' : savedA ? 'device_restore' : 'legacy_restore';
  try {
    const handoff = JSON.parse(sessionStorage.getItem('myod:calc-handoff'));
    sessionStorage.removeItem('myod:calc-handoff');
    if (handoff?.path === location.pathname && Date.now() - handoff.at >= 0 && Date.now() - handoff.at < 60000) { restoreOrigin = 'form'; originEntry = 'home'; }
  } catch { /* 분석용 출처 전달 실패는 계산을 막지 않는다. */ }
  if (entryPoint !== 'home' && a0 && (!pair || b0)) render(a0, b0, restoreOrigin);
  const savedEntry = $('[data-saved-entry]', root);
  if (savedEntry && a0) {
    savedEntry.hidden = false;
    $('[data-saved-summary]', savedEntry).textContent = tr(`저장한 생일: ${a0.y}.${a0.m}.${a0.d} · 정보가 맞는지 확인해 주세요.`, `Saved birth date: ${a0.y}.${a0.m}.${a0.d}. Check that these details are yours.`);
    $('[data-saved-result]', savedEntry).addEventListener('click', () => {
      track('saved_result_open', { tool: mode });
      if (render(a0, null, restoreOrigin)) out.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
  root.addEventListener('click', event => {
    if (event.target.closest('[data-edit-profile]')) {
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      $('#a-y', form).focus({ preventScroll: true });
    }
    const dateButton = event.target.closest('[data-reading-date]');
    if (dateButton && currentChart) {
      const [y, m, d] = dateButton.dataset.readingDate.split('-').map(Number);
      const panel = $('#calendar-day-detail', out);
      selectedDateButton = dateButton;
      out.querySelectorAll('[data-reading-date]').forEach(button => button.setAttribute('aria-pressed', String(button === dateButton)));
      panel.innerHTML = `<button type="button" class="link-btn" data-close-day>${tr('날짜 상세 닫기', 'Close daily detail')}</button>${dayView(day(currentChart, { y, m, d }))}`;
      panel.hidden = false;
      panel.focus({ preventScroll: true });
      panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      track('calendar_day_open', { tool: mode });
    }
    if (event.target.closest('[data-close-day]')) {
      $('#calendar-day-detail', out).hidden = true;
      selectedDateButton?.setAttribute('aria-pressed', 'false');
      selectedDateButton?.focus();
    }
  });
  const checkDate = () => {
    const detail = $('#calendar-day-detail', out);
    if (document.visibilityState !== 'visible' || submitting || !currentInputs || document.querySelector('dialog[open]') || (detail && !detail.hidden)) return;
    if (isoDate(todayKST()) !== root.dataset.date) render(currentInputs.a, currentInputs.b, 'date_refresh');
  };
  document.addEventListener('visibilitychange', checkDate);
  window.addEventListener('pageshow', checkDate);
  window.addEventListener('focus', checkDate);

  $('[data-delete-profile]', form).addEventListener('click', async () => {
    try { await removeSaved(); persist.checked = false; if (savedEntry) savedEntry.hidden = true; try { sessionStorage.removeItem('ohaeng:save-device'); } catch { /* 접근 제한 */ } storageStatus.textContent = tr("이 기기의 나·상대 저장 정보를 삭제했습니다. 토정비결 정보는 유지됩니다. 화면의 입력은 다음 이동까지만 남습니다.", "Deleted both saved saju profiles. Your Tojeong details are unchanged. The current form remains until you leave this page."); }
    catch { storageStatus.textContent = tr("삭제에 실패했습니다. 저장소 접근을 허용한 뒤 다시 시도해 주세요.", "Could not delete saved details. Allow browser storage and try again."); }
  });
  async function remember(a, b) {
    const temporary = sessionSave('a', a) && (!b || sessionSave('b', b));
    if (!persist.checked) { storageStatus.textContent = temporary ? tr("현재 탭에만 임시로 유지됩니다. 기존 기기 저장본은 삭제 버튼으로 지울 수 있습니다.", "Kept temporarily in this tab. Use Delete to remove any existing saved profiles.") : tr("이 브라우저는 저장을 제한하고 있습니다. 현재 화면에서만 결과를 볼 수 있습니다.", "This browser restricts storage. Results are available on this page only."); return temporary; }
    try {
      await save('a', a); if (b) await save('b', b);
      storageStatus.textContent = tr("이 기기에 저장했습니다.", "Saved on this device.");
      return true;
    } catch { storageStatus.textContent = tr("기기 저장에 실패했습니다. 결과는 계산되었지만 새로 방문하면 입력이 사라질 수 있습니다.", "Could not save on this device. Your result is ready, but your details may be lost when you return."); return false; }
  }
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (submitting) return;
    const a = readForm(form, 'a');
    const b = pair ? readForm(form, 'b') : null;
    const errA = check(a), errB = b && check(b);
    if (errA || errB) { showError(errA || errB, errA ? 'a' : 'b'); return; }
    track('calc_submit', { tool: mode, entry_point: originEntry });
    submitting = true;
    try {
    if (entryPoint === 'home') {
      try { buildChart(toEngine(a)); } catch (er) { showError(er.message || tr("입력한 날짜를 확인해 주세요.", "Please check the date you entered.")); return; }
      if (await remember(a)) {
        const path = languagePath('/today/', isEnglish() ? 'en' : 'ko');
        try { sessionStorage.setItem('myod:calc-handoff', JSON.stringify({ path, at: Date.now() })); } catch { /* 접근 제한 */ }
        location.href = path;
      } else if (render(a, null, 'form')) out.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    if (render(a, b, 'form')) {
      await remember(a, b);
      out.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    } finally { submitting = false; }
  });
  root.dataset.ready = 'true';
}

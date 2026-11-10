// 계산기 페이지: 폼 ↔ 저장된 입력값 ↔ 결과 렌더링 ↔ 결과 공유
import {
  buildChart, ChartInputError, day, week, month, year, yearMonths,
  todayKST, addDays, isoDate, iljuSlug, pillarKo, pillarLabel, pillarH, josa,
} from '../engine/index.js';
import { tr, isEnglish } from '../i18n/runtime.js';
import { term } from '../i18n/terms.js';
import { languagePath } from '../site/locale.js';
import { ILJU_TAG } from '../content/knowledge.js';
import { load, save, removeSaved, sessionLoad, sessionSave, takeLegacy, toEngine, listPeople, selectPerson, profileLabel } from './profile.js';
import { showProfileGuide } from './profile-navigation.js';
import { readingControls, applyReadingPreferences, wireReadingPreferences } from './reading-preferences.js';
import { chartCard, dayView, weekView, monthView, yearView, manseOverview, manseView } from './views.js';
import { resultShareHtml, wireShare } from './share.js';
import { shareUrl, characterCode, SHARE_KINDS, cleanName } from '../site/share-codec.js';
import { track, trackInputStart } from './analytics.js';
import { syncTime, fillForm, readForm, check, wireBirthForm } from './birth-form.js';
import { renderResultWithPartnerAd, clearResultWithPartnerAd } from './partner-ad.js';
import { readingNavigation, nextToolsHtml } from '../site/tool-navigation.js';
import { wireReadingNavigation, syncReadingNavigation } from './reading-navigation.js';
import { esc } from '../site/util.js';
import { refreshPeriodContext } from './period-context.js';
import { wireReadingExplorer } from './reading-explorer.js';

const $ = (s, el = document) => el.querySelector(s);
const sexIdx = (p) => [...Array(60).keys()].find((n) => n % 10 === p.s && n % 12 === p.b);

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
  const rankTool = mode === 'rank' ? await import('./rank-tool.js') : null;
  const storyTool = mode === 'story' ? await import('./story-tool.js') : null;
  const compatTool = mode === 'compatibility' ? await import('./compat-tool.js') : null;
  const lifeTool = mode === 'lifetime' ? await import('./life-tool.js') : null;
  const form = $('#tool-form', root);
  trackInputStart(form, mode, entryPoint);
  const out = $('#result', root);
  wireReadingExplorer(out);
  wireReadingPreferences(out);
  wireReadingNavigation(out);
  let today = todayKST();
  const pair = mode === 'compatibility';
  const yr = +(root.dataset.year || today.y);
  const tabMode = mode === 'year' ? `year${yr}` : mode;
  let stopMatches;
  let currentInputs;
  let currentChart;
  let selectedDateButton;
  let submitting = false;

  wireBirthForm(form, pair ? ['a', 'b'] : ['a']);

  function showError(msg, person = 'a') {
    let el = $('.form-error', form);
    if (!el) { el = document.createElement('p'); el.id = 'tool-form-error'; el.className = 'form-error'; el.setAttribute('role', 'alert'); $('.form-actions', form).after(el); }
    form.querySelectorAll('[aria-invalid]').forEach(input => { input.removeAttribute('aria-invalid'); input.removeAttribute('aria-errormessage'); });
    el.textContent = msg;
    el.hidden = !msg;
    if (msg) {
      form.hidden = false;
      root.querySelectorAll('[data-edit-profile]').forEach(button => button.setAttribute('aria-expanded', 'true'));
      stopMatches?.();
      clearResultWithPartnerAd(out);
      root.classList.remove('has-result');
      currentInputs = null;
      const dateInputs = ['y', 'm', 'd'].map(id => $(`#${person}-${id}`, form));
      const emptyInputs = dateInputs.filter(input => !input.value);
      const input = readForm(form, person);
      const invalid = dateInputs[0].validity.patternMismatch ? [dateInputs[0]] : emptyInputs.length ? emptyInputs : check({ ...input, noTime: true })
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
    const errA = check(a), errB = b && check(b);
    if (errA || errB) { showError(errA || errB, errA ? 'a' : 'b'); return false; }
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
    let html = readingNavigation(tabMode, today) + readingControls();
    let res;
    let leaderRank;
    if (mode === 'today') { res = day(ca, today, 'today'); html += dayView(res, { scope: 'reading' }); }
    else if (mode === 'tomorrow') { res = day(ca, addDays(today, 1), 'tomorrow'); html += dayView(res, { scope: 'reading' }); }
    else if (mode === 'week') { res = week(ca, today); html += weekView(res, today); }
    else if (mode === 'month') { res = month(ca, today.y, today.m); html += monthView(res, today); }
    else if (mode === 'year') { res = year(ca, yr, yr === today.y + 1 ? 'next' : 'this'); html += yearView(res, yearMonths(ca, yr), today); }
    else if (mode === 'lifetime') { res = lifeTool.lifetime(ca, today); html += lifeTool.lifeView(res, ca, today); }
    else if (mode === 'compatibility') { res = compatTool.compat(ca, cb, today); html += compatTool.compatView(res, ca, cb, today); }
    else if (mode === 'manseryeok') { html += manseOverview(ca, a, today) + manseView(ca); }
    else if (mode === 'story') { res = storyTool.lifeStory(ca, today); html += storyTool.storyView(res, ca); }
    else if (mode === 'rank') {
      res = rankTool.sajuRank(ca, rankTool.RANK_TABLE);
      // 밤 자시·절기 경계도 시간 제외 입력과 일치하도록 생년월일에서 다시 계산한다.
      leaderRank = rankTool.sajuRank(buildChart(toEngine({ ...a, noTime: true })), rankTool.RANK_TABLE);
      html += rankTool.rankView(res, ca, leaderRank);
    }
    if (!pair && mode !== 'manseryeok') html += `<details class="chart-disclosure"><summary>${tr('내 사주 원국과 오행 자세히', 'Explore your birth chart and Five Elements')}</summary>${chartCard(ca, a, today)}</details>`;
    html += nextToolsHtml(mode, today);
    html += `<div class="result-actions"><button type="button" class="link-btn" data-edit-profile aria-controls="tool-form" aria-expanded="${!form.hidden}">${tr('입력 정보 수정·저장', 'Edit or save your details')}</button><span class="hint">${tr('이 기기에 저장하면 다음 방문에 바로 볼 수 있어요.', 'Save on this device for quicker access next time.')}</span></div>`;
    const share = shareFor(mode, res, ca, cb, today, yr);
    if (share) html += resultShareHtml();
    if (pair) html += compatTool.compatMatchesShell(ca, cb);
    stopMatches?.();
    const readingDate = isoDate(res?.date || today);
    renderResultWithPartnerAd(out, html, { tool: mode, calc_origin: source, reading_date: readingDate });
    applyReadingPreferences(out);
    syncReadingNavigation(out);
    currentInputs = { a, b };
    currentChart = ca;
    if (mode === 'rank') rankTool.mountRankLeaders($('.rank-leaders', out), leaderRank);
    if (pair) stopMatches = compatTool.mountCompatMatches($('.compat-matches', out), { a: toEngine(a), b: toEngine(b) }, { a: ca, b: cb }, today);
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
  try { await listPeople(); [savedA, savedB] = await Promise.all([load('a'), load('b')]); }
  catch { storageStatus.textContent = tr("저장소를 불러오지 못했습니다. 저장 없이 계산할 수 있습니다.", "Could not load saved details. You can still calculate without saving."); }
  finally { form.inert = false; }
  persist.checked = !!savedA;
  try { const preference = sessionStorage.getItem('ohaeng:save-device'); if (preference !== null) persist.checked = preference === 'true'; } catch { /* 접근 제한 */ }
  persist.addEventListener('change', () => { try { sessionStorage.setItem('ohaeng:save-device', String(persist.checked)); } catch { /* 접근 제한 */ } });
  const legacy = ['a', 'b'].map(takeLegacy);
  if (legacy.some(Boolean)) storageStatus.textContent = tr("이전 버전에서 자동 저장된 입력을 불러왔습니다. 다음 방문에도 쓰려면 ‘이 기기에 저장’을 선택하세요.", "Loaded details saved by an earlier version. Select “Save on this device” to keep them for future visits.");
  let a0 = sessionLoad('a') || savedA || legacy[0];
  let b0 = sessionLoad('b') || savedB || legacy[1];
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
  if (savedEntry && a0 && !check(a0)) {
    savedEntry.hidden = false;
    form.hidden = true;
    const calendar = a0.calendar === 'lunar' ? tr('음력', 'Lunar') : tr('양력', 'Solar');
    const gender = a0.gender === 'F' ? tr('여성', 'Female') : tr('남성', 'Male');
    const time = a0.noTime ? tr('시간 모름', 'Time unknown') : a0.timeMode === 'branch' ? tr('시진 입력', 'Hour-period input') : a0.time;
    $('[data-saved-summary]', savedEntry).textContent = `${calendar} ${a0.y}.${a0.m}.${a0.d} · ${gender} · ${time} · ${tr('불러온 정보가 맞는지 확인해 주세요.', 'Check that these restored details are yours.')}`;
    $('[data-saved-result]', savedEntry).addEventListener('click', () => {
      track('saved_result_open', { tool: mode });
      if (render(readForm(form, 'a'), null, restoreOrigin)) out.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
  const slots = pair ? ['a', 'b'] : ['a'];
  const picker = slot => $(`[data-profile-picker="${slot}"]`, form);
  async function refreshPeople(change = {}) {
    const people = await listPeople();
    for (const slot of slots) {
      const select = picker(slot), selected = select.value || (slot === 'a' ? a0 : b0)?.profileId;
      select.closest('.profile-picker').hidden = people.length === 0;
      select.innerHTML = `<option value="">${tr('직접 입력 · 새 사람', 'Enter details · new person')}</option>${people.map(person => `<option value="${esc(person.id)}">${esc(profileLabel(person.profile))} · ${person.profile.y}.${person.profile.m}.${person.profile.d}</option>`).join('')}`;
      select.value = people.some(person => person.id === selected) ? selected : '';
      if (selected && change.deleted === selected) {
        if (slot === 'a') a0 = null; else b0 = null;
        currentInputs = null; currentChart = null; stopMatches?.();
        clearResultWithPartnerAd(out); root.classList.remove('has-result');
        if (savedEntry) savedEntry.hidden = true;
        form.hidden = false;
        storageStatus.textContent = tr('저장 정보가 삭제되었습니다. 화면의 입력은 직접 바꾸거나 새로 저장할 수 있습니다.', 'Saved person deleted. You can change the current form or save it again.');
      }
      if (selected && change.edited === selected) {
        const person = people.find(person => person.id === selected);
        if (person) applyPerson({ ...person.profile, profileId: selected }, slot);
      }
    }
  }
  function applyPerson(profile, slot) {
    if (slot === 'a') a0 = profile; else b0 = profile;
    fillForm(form, slot, profile); picker(slot).value = profile.profileId || '';
    if (savedEntry) savedEntry.hidden = true;
    form.hidden = false;
    const a = readForm(form, 'a'), b = pair ? readForm(form, 'b') : null;
    sessionSave(slot, profile);
    if (!check(a) && (!pair || !check(b))) render(a, b, 'device_restore');
    else { stopMatches?.(); clearResultWithPartnerAd(out); currentInputs = null; currentChart = null; root.classList.remove('has-result'); }
    storageStatus.textContent = tr('저장한 사람을 불러왔습니다. 내용을 바꿔 계산·저장하면 새 항목으로 보관합니다. 기존 항목 수정은 목록 관리에서 할 수 있어요.', 'Loaded a saved person. Calculating and saving changed details creates a new entry. Edit an existing person in Manage people.');
  }
  for (const slot of slots) picker(slot).addEventListener('change', async event => {
    if (!event.target.value) {
      fillForm(form, slot, { gender: 'M', calendar: 'solar', y: 0, m: 0, d: 0 });
      $(`#${slot}-time`, form).value = '';
      if (slot === 'a') a0 = null; else b0 = null;
      currentInputs = null; currentChart = null; stopMatches?.(); clearResultWithPartnerAd(out); root.classList.remove('has-result');
      return;
    }
    try { applyPerson(await selectPerson(event.target.value, slot), slot); }
    catch { storageStatus.textContent = tr('선택한 사람을 불러오지 못했습니다. 목록 관리에서 다시 확인해 주세요.', 'Could not load this person. Check Manage people and try again.'); }
  });
  document.addEventListener('profile-selected', event => applyPerson(event.detail.profile, event.detail.slot));
  document.addEventListener('profiles-changed', event => { refreshPeople(event.detail).catch(() => {}); });
  try { await refreshPeople(); } catch { /* 계산은 저장소 없이도 동작한다. */ }
  await showProfileGuide();
  root.addEventListener('click', event => {
    if (event.target.closest('[data-edit-profile]')) {
      form.hidden = false;
      root.querySelectorAll('[data-edit-profile]').forEach(button => button.setAttribute('aria-expanded', 'true'));
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      $('#a-y', form).focus({ preventScroll: true });
    }
    const dateButton = event.target.closest('[data-reading-date]');
    if (dateButton && currentChart) {
      const [y, m, d] = dateButton.dataset.readingDate.split('-').map(Number);
      const panel = $('#calendar-day-detail', out);
      selectedDateButton = dateButton;
      out.querySelectorAll('[data-reading-date]').forEach(button => button.setAttribute('aria-pressed', String(button === dateButton)));
      panel.innerHTML = `<button type="button" class="link-btn" data-close-day>${tr('날짜 상세 닫기', 'Close daily detail')}</button>${dayView(day(currentChart, { y, m, d }), { banner: false, scope: `detail-${isoDate({ y, m, d })}` })}`;
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

  $('[data-delete-profile]', form).addEventListener('click', () => { $('[data-delete-all-confirm]', form).hidden = false; $('[data-confirm-delete-all]', form).focus(); });
  $('[data-cancel-delete-all]', form).addEventListener('click', () => { $('[data-delete-all-confirm]', form).hidden = true; $('[data-delete-profile]', form).focus(); });
  $('[data-confirm-delete-all]', form).addEventListener('click', async () => {
    try { await removeSaved(); a0 = b0 = null; persist.checked = false; if (savedEntry) savedEntry.hidden = true; try { sessionStorage.removeItem('ohaeng:save-device'); } catch { /* 접근 제한 */ } storageStatus.textContent = tr("이 기기의 저장한 사람과 나·상대 정보를 모두 삭제했습니다. 토정비결 정보는 유지됩니다. 화면의 입력은 다음 이동까지만 남습니다.", "Deleted all saved people and both saju profiles. Your Tojeong details are unchanged. The current form remains until you leave this page."); $('[data-delete-all-confirm]', form).hidden = true; $('[data-delete-profile]', form).focus(); }
    catch { storageStatus.textContent = tr("삭제에 실패했습니다. 저장소 접근을 허용한 뒤 다시 시도해 주세요.", "Could not delete saved details. Allow browser storage and try again."); }
  });
  async function remember(a, b) {
    const temporary = sessionSave('a', a) && (!b || sessionSave('b', b));
    if (!persist.checked) { storageStatus.textContent = temporary ? tr("현재 탭에만 임시로 유지됩니다. 기존 기기 저장본은 삭제 버튼으로 지울 수 있습니다.", "Kept temporarily in this tab. Use Delete to remove any existing saved profiles.") : tr("이 브라우저는 저장을 제한하고 있습니다. 현재 화면에서만 결과를 볼 수 있습니다.", "This browser restricts storage. Results are available on this page only."); return temporary; }
    try {
      a0 = await save('a', a); if (b) b0 = await save('b', b);
      await refreshPeople();
      picker('a').value = a0.profileId; if (b) picker('b').value = b0.profileId;
      storageStatus.textContent = tr("이 기기에 저장했습니다.", "Saved on this device.");
      if (entryPoint !== 'home') await showProfileGuide();
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
  if (location.hash.startsWith('#reading-')) requestAnimationFrame(() => syncReadingNavigation(out, location.hash, true));
}

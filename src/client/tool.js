// 계산기 페이지: 폼 ↔ 저장된 입력값 ↔ 결과 렌더링 ↔ 결과 공유
import {
  buildChart, birthTimesFor, ChartInputError, day, week, month, year, yearMonths, lifetime, compat, lifeStory, sajuRank,
  todayKST, addDays, daysIn, isoDate, iljuSlug, pillarKo, pillarH, josa,
} from '../engine/index.js';
import RANK_TABLE from '../content/rank-table.js';
import { ILJU_TAG } from '../content/knowledge.js';
import { load, save, removeSaved, sessionLoad, sessionSave, takeLegacy, toEngine } from './profile.js';
import { chartCard, dayView, weekView, monthView, yearView, lifeView, compatView, manseView, storyView, rankView } from './views.js';
import { resultShareHtml, wireShare } from './share.js';
import { shareUrl, characterCode, SHARE_KINDS, cleanName } from '../site/share-codec.js';
import { track } from './analytics.js';
import { birthTimeOptions, normalizeBranch, branchOfTime } from '../domain/birth-time.js';
import { compatMatchesShell, mountCompatMatches } from './compat-matches-view.js';
import { mountRankLeaders } from './rank-leaders-view.js';

const $ = (s, el = document) => el.querySelector(s);
const sexIdx = (p) => [...Array(60).keys()].find((n) => n % 10 === p.s && n % 12 === p.b);

// 시각 입력 방식(정확한 시각 / 시진)과 날짜에 맞는 시계 기준 시진 구간을 화면에 반영한다.
const TIME_HINT = {
  exact: '출생 당시 시계 시각 그대로 넣으세요. 30분 보정과 서머타임은 자동으로 계산합니다.',
  branch: '출생 당시 시계 기준 구간입니다.',
  none: '시주 없이 년·월·일 세 기둥으로 계산합니다.',
};
function syncTime(form, who, want) {
  const f = (id) => $(`#${who}-${id}`, form);
  if (!f('branch')) return;
  const mode = $(`input[name="${who}-tmode"]:checked`, form).value;
  const noTime = f('notime').checked;
  const { off, note } = birthTimesFor({ calendar: $(`input[name="${who}-cal"]:checked`, form).value, leap: f('leap').checked, y: +f('y').value, m: +f('m').value, d: +f('d').value });
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
const check = (p) => (p.calendar === 'solar' && p.d > daysIn(p.y, p.m) ? `${p.y}년 ${p.m}월에는 ${p.d}일이 없습니다.`
  : !p.noTime && p.timeMode === 'exact' && !/^\d{1,2}:\d{2}$/.test(p.time || '') ? '태어난 시각을 입력하거나 ‘시간을 몰라요’를 선택해 주세요.' : '');
function navTabs(mode, today) {
  const y = today.y;
  const items = [['today', '/today/', '오늘'], ['tomorrow', '/tomorrow/', '내일'], ['week', '/week/', '이번 주'], ['month', '/month/', '이번 달'], [`year${y}`, `/year/${y}/`, `${y}년`], [`year${y + 1}`, `/year/${y + 1}/`, `${y + 1}년`], ['lifetime', '/lifetime/', '평생'], ['story', '/life-story/', '인생 캐릭터'], ['rank', '/saju-ranking/', '사주 랭킹'], ['compatibility', '/compatibility/', '궁합'], ['manseryeok', '/manseryeok/', '만세력']];
  return `<nav class="tabs" aria-label="다른 운세 보기">${items.map(([k, h, n]) => `<a href="${h}"${k === mode ? ' aria-current="page"' : ''}>${n}</a>`).join('')}</nav>`;
}
const who = (name) => (cleanName(name) ? `${cleanName(name)}님` : '나');

// 결과 → 공유 카드 주소 + 이미지 카드 데이터
function shareFor(mode, res, ca, cb, today, yr) {
  const n = cleanName(ca.name);
  const o = location.origin;
  const label = (k) => SHARE_KINDS[k].label;
  if (mode === 'today' || mode === 'tomorrow') {
    const r = res; const k = mode;
    return { kind: k, url: shareUrl(o, { k, n, s: r.overall.score, h: r.overall.headline, d: isoDate(r.date) }), title: `${who(n)}의 ${r.date.m}월 ${r.date.d}일 운세 ${r.overall.score}점`, text: r.overall.headline,
      card: { kicker: `${who(n)}의 ${r.date.m}월 ${r.date.d}일 운세`, big: `${r.overall.score}점`, title: r.overall.headline, lines: r.cats.slice().sort((a, b) => b.score - a.score).slice(0, 3).map((c) => [c.name, `${c.score}점`]) } };
  }
  if (mode === 'week' || mode === 'month' || mode === 'year') {
    const r = res.report || res; const k = mode;
    const what = mode === 'year' ? `${yr}년 운세` : label(k);
    return { kind: k, url: shareUrl(o, { k, n, s: r.overall.score, h: r.overall.headline, y: mode === 'year' ? yr : '' }), title: `${who(n)}의 ${what} ${r.overall.score}점`, text: r.overall.headline,
      card: { kicker: `${who(n)}의 ${what}`, big: `${r.overall.score}점`, title: r.overall.headline, lines: r.cats.slice().sort((a, b) => b.score - a.score).slice(0, 3).map((c) => [c.name, `${c.score}점`]) } };
  }
  if (mode === 'lifetime' || mode === 'manseryeok') {
    const p = ca.pillars.day; const k = mode === 'lifetime' ? 'life' : 'manse';
    const tag = ILJU_TAG[sexIdx(p)];
    return { kind: k, url: shareUrl(o, { k, n, i: iljuSlug(p) }), title: `${josa(who(n), '은/는')} ${pillarKo(p)}일주 — ${tag.split(' — ')[0]}`, text: tag,
      card: { kicker: `${who(n)}의 사주`, big: `${pillarKo(p)}일주 ${pillarH(p)}`, title: tag, lines: [['원국', ca.cols.slice().reverse().map((x) => pillarH(x)).join(' ')], ['일간 강약', ca.strengthLabel]] } };
  }
  if (mode === 'compatibility') {
    const r = res; const n2 = cleanName(cb.name);
    return { kind: 'compat', url: shareUrl(o, { k: 'compat', n, n2, s: r.total, h: r.headline }), title: `${n || '나'} × ${n2 || '상대'} 궁합 ${r.total}점`, text: r.headline, image: '/og-compat.png',
      card: { kicker: `${n || '나'} × ${n2 || '상대'} 사주 궁합`, big: `${r.total}점`, title: r.headline, lines: r.cats.slice(0, 4).map((c) => [`${c.name}`, `${c.score}점`]) } };
  }
  if (mode === 'story') {
    const st = res;
    const codes = st.stages.map((s) => characterCode(s.character.adj, s.character.portrait));
    return { kind: 'story', url: shareUrl(o, { k: 'story', n, a: st.arc.key, c: codes.join(',') }), title: `사주로 본 ${who(n)}의 인생: ${st.arc.name}`, text: st.stages.map((s) => `${s.label} ${s.character.full}`).join(' → '), image: '/og-story.png',
      card: { kicker: `사주로 본 ${who(n)}의 인생은`, big: st.arc.name, title: st.arc.desc.split('. ')[0] + '.', lines: st.stages.filter((_, i) => [0, 4, 8].includes(i)).map((s) => [s.ages, s.character.full]) } };
  }
  if (mode === 'rank') {
    const r = res;
    return { kind: 'rank', url: shareUrl(o, { k: 'rank', n, s: r.total, r: r.rank, w: r.withHour ? 1 : 0, t: r.tier.code }), title: `${who(n)}의 사주는 ${r.of.toLocaleString('ko-KR')}가지 중 ${r.rank.toLocaleString('ko-KR')}위 (상위 ${r.pct}%)`, text: r.tier.name, image: '/og-rank.png',
      card: { kicker: `${who(n)}의 사주 랭킹`, big: `${r.rank.toLocaleString('ko-KR')}위`, title: `${r.tier.name} · 상위 ${r.pct}%`, lines: [['사주 점수', `${r.total}점 (평균 ${r.avgTotal}점)`], ['전체', `${r.of.toLocaleString('ko-KR')}가지 사주 중`], ...r.cats.slice().sort((a, b) => a.pct - b.pct).slice(0, 2).map((k) => [k.name, `상위 ${k.pct}%`])] } };
  }
  return null;
}

export async function mount(root) {
  const mode = root.dataset.tool;
  const form = $('#tool-form', root);
  const out = $('#result', root);
  const today = todayKST();
  const pair = mode === 'compatibility';
  const yr = +(root.dataset.year || today.y);
  const tabMode = mode === 'year' ? `year${yr}` : mode;
  let stopMatches;

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

  function showError(msg) {
    let el = $('.form-error', form);
    if (!el) { el = document.createElement('p'); el.className = 'form-error'; el.setAttribute('role', 'alert'); $('.form-actions', form).after(el); }
    el.textContent = msg;
    el.hidden = !msg;
    if (msg) track('form_error', { tool: mode });
  }

  function render(a, b, source) {
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
    let res;
    if (!pair) html += chartCard(ca, a, today);
    html += navTabs(tabMode, today);
    if (mode === 'today') { res = day(ca, today, 'today'); html += dayView(res); }
    else if (mode === 'tomorrow') { res = day(ca, addDays(today, 1), 'tomorrow'); html += dayView(res); }
    else if (mode === 'week') { res = week(ca, today); html += weekView(res, today); }
    else if (mode === 'month') { res = month(ca, today.y, today.m); html += monthView(res, today); }
    else if (mode === 'year') { res = year(ca, yr, yr === today.y + 1 ? 'next' : 'this'); html += yearView(res, yearMonths(ca, yr), today); }
    else if (mode === 'lifetime') { res = lifetime(ca, today); html += lifeView(res, ca, today); }
    else if (mode === 'compatibility') { res = compat(ca, cb, today); html += compatView(res, ca, cb, today); }
    else if (mode === 'manseryeok') { html += manseView(ca); }
    else if (mode === 'story') { res = lifeStory(ca, today); html += storyView(res, ca); }
    else if (mode === 'rank') { res = sajuRank(ca, RANK_TABLE); html += rankView(res, ca); }
    const share = shareFor(mode, res, ca, cb, today, yr);
    if (share) html += resultShareHtml();
    if (pair) html += compatMatchesShell(ca, cb);
    stopMatches?.();
    out.innerHTML = html;
    if (mode === 'rank') mountRankLeaders($('.rank-leaders', out), res);
    if (pair) stopMatches = mountCompatMatches($('.compat-matches', out), { a: toEngine(a), b: toEngine(b) }, { a: ca, b: cb }, today);
    root.classList.add('has-result');
    if (share) wireShare($('.result-share', out), share);
    const ev = { tool: mode, source, has_time: ca.hasTime ? 'yes' : 'no', calendar: a.calendar };
    track('calc_result', ev);
    if (mode === 'story') track('story_result', { arc: res.arc.key });
    if (mode === 'rank') track('rank_result', { tier: res.tier.code, pct_bucket: res.pct <= 1 ? 'top1' : res.pct <= 5 ? 'top5' : res.pct <= 15 ? 'top15' : res.pct <= 50 ? 'top50' : 'bottom50' });
    if (mode === 'compatibility') track('compat_result', { score_band: res.total >= 85 ? '85+' : res.total >= 75 ? '75-84' : res.total >= 62 ? '62-74' : res.total >= 50 ? '50-61' : '<50' });
    return true;
  }

  const storageStatus = $('[data-storage-status]', form);
  const persist = $('#save-device', form);
  form.inert = true;
  let savedA, savedB;
  try { [savedA, savedB] = await Promise.all([load('a'), load('b')]); }
  catch { storageStatus.textContent = '저장소를 불러오지 못했습니다. 저장 없이 계산할 수 있습니다.'; }
  finally { form.inert = false; }
  persist.checked = !!savedA;
  try { const preference = sessionStorage.getItem('ohaeng:save-device'); if (preference !== null) persist.checked = preference === 'true'; } catch { /* 접근 제한 */ }
  persist.addEventListener('change', () => { try { sessionStorage.setItem('ohaeng:save-device', String(persist.checked)); } catch { /* 접근 제한 */ } });
  const legacy = ['a', 'b'].map(takeLegacy);
  if (legacy.some(Boolean)) storageStatus.textContent = '이전 버전에서 자동 저장된 입력을 불러왔습니다. 다음 방문에도 쓰려면 ‘이 기기에 저장’을 선택하세요.';
  const a0 = sessionLoad('a') || savedA || legacy[0];
  const b0 = sessionLoad('b') || savedB || legacy[1];
  fillForm(form, 'a', a0);
  if (pair) fillForm(form, 'b', b0);
  for (const p of pair ? ['a', 'b'] : ['a']) syncTime(form, p);
  if (mode !== 'home' && a0 && (!pair || b0)) render(a0, b0, 'saved');

  $('[data-delete-profile]', form).addEventListener('click', async () => {
    try { await removeSaved(); persist.checked = false; try { sessionStorage.removeItem('ohaeng:save-device'); } catch { /* 접근 제한 */ } storageStatus.textContent = '이 기기의 나·상대 저장 정보를 삭제했습니다. 화면의 입력은 다음 이동까지만 남습니다.'; }
    catch { storageStatus.textContent = '삭제에 실패했습니다. 저장소 접근을 허용한 뒤 다시 시도해 주세요.'; }
  });
  async function remember(a, b) {
    const temporary = sessionSave('a', a) && (!b || sessionSave('b', b));
    if (!persist.checked) { storageStatus.textContent = temporary ? '현재 탭에만 임시로 유지됩니다. 기존 기기 저장본은 삭제 버튼으로 지울 수 있습니다.' : '이 브라우저는 저장을 제한하고 있습니다. 현재 화면에서만 결과를 볼 수 있습니다.'; return temporary; }
    try {
      await save('a', a); if (b) await save('b', b);
      storageStatus.textContent = '이 기기에 저장했습니다.';
      return true;
    } catch { storageStatus.textContent = '기기 저장에 실패했습니다. 결과는 계산되었지만 새로 방문하면 입력이 사라질 수 있습니다.'; return false; }
  }
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const a = readForm(form, 'a');
    const b = pair ? readForm(form, 'b') : null;
    const err = check(a) || (b && check(b));
    if (err) { showError(err); return; }
    track('calc_submit', { tool: mode });
    if (mode === 'home') {
      try { buildChart(toEngine(a)); } catch (er) { showError(er.message || '입력한 날짜를 확인해 주세요.'); return; }
      if (await remember(a)) location.href = '/today/';
      else showError('저장에 실패했습니다. 기기 저장 선택을 해제하고 다시 계산하거나 오늘의 운세 페이지에서 직접 입력해 주세요.');
      return;
    }
    if (render(a, b, 'form')) {
      await remember(a, b);
      out.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
  root.dataset.ready = 'true';
}

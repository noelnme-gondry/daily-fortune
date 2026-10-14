// 계산기 페이지: 폼 ↔ 저장된 입력값 ↔ 결과 렌더링 ↔ 결과 공유
import {
  buildChart, ChartInputError, day, week, month, year, yearMonths, lifetime, compat, lifeStory, sajuRank,
  todayKST, addDays, daysIn, isoDate, iljuSlug, pillarKo, pillarH, josa,
} from '../engine/index.js';
import RANK_TABLE from '../content/rank-table.js';
import { ILJU_TAG } from '../content/knowledge.js';
import { load, save, toEngine, SAMPLE } from './profile.js';
import { chartCard, dayView, weekView, monthView, yearView, lifeView, compatView, manseView, storyView, rankView } from './views.js';
import { resultShareHtml, wireShare } from './share.js';
import { shareUrl, storyCode, SHARE_KINDS, cleanName } from '../site/share-codec.js';
import { track } from './analytics.js';

const $ = (s, el = document) => el.querySelector(s);
const sexIdx = (p) => [...Array(60).keys()].find((n) => n % 10 === p.s && n % 12 === p.b);

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
const check = (p) => (p.calendar === 'solar' && p.d > daysIn(p.y, p.m) ? `${p.y}년 ${p.m}월에는 ${p.d}일이 없습니다.` : '');
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
    const codes = st.stages.map((s) => storyCode(s.character.adj, s.tg));
    return { kind: 'story', url: shareUrl(o, { k: 'story', n, a: st.arc.key, c1: codes[0], c2: codes[1], c3: codes[2] }), title: `사주로 본 ${who(n)}의 인생: ${st.arc.name}`, text: st.stages.map((s) => `${s.label} ${s.character.full}`).join(' → '), image: '/og-story.png',
      card: { kicker: `사주로 본 ${who(n)}의 인생은`, big: st.arc.name, title: st.arc.desc.split('. ')[0] + '.', lines: st.stages.map((s) => [s.label, s.character.full]) } };
  }
  if (mode === 'rank') {
    const r = res;
    return { kind: 'rank', url: shareUrl(o, { k: 'rank', n, s: r.total, r: r.rank, w: r.withHour ? 1 : 0, t: r.tier.code }), title: `${who(n)}의 사주는 ${r.of.toLocaleString('ko-KR')}가지 중 ${r.rank.toLocaleString('ko-KR')}위 (상위 ${r.pct}%)`, text: r.tier.name, image: '/og-rank.png',
      card: { kicker: `${who(n)}의 사주 랭킹`, big: `${r.rank.toLocaleString('ko-KR')}위`, title: `${r.tier.name} · 상위 ${r.pct}%`, lines: [['사주 점수', `${r.total}점 (평균 ${r.avgTotal}점)`], ['전체', `${r.of.toLocaleString('ko-KR')}가지 사주 중`], ...r.cats.slice().sort((a, b) => a.pct - b.pct).slice(0, 2).map((k) => [k.name, `상위 ${k.pct}%`])] } };
  }
  return null;
}

export function mount(root) {
  const mode = root.dataset.tool;
  const form = $('#tool-form', root);
  const out = $('#result', root);
  const today = todayKST();
  const pair = mode === 'compatibility';
  const yr = +(root.dataset.year || today.y);
  const tabMode = mode === 'year' ? `year${yr}` : mode;

  ['a', 'b'].forEach((p) => {
    if (!$(`#${p}-name`, form)) return;
    form.addEventListener('change', (e) => {
      if (e.target.name === `${p}-cal`) $(`#${p}-leap`, form).disabled = e.target.value !== 'lunar';
      if (e.target.id === `${p}-notime`) $(`#${p}-time`, form).disabled = e.target.checked;
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
    if (source === 'sample') html = `<p class="chip sample-note">예시 인물의 결과입니다. 내 정보를 입력하면 내 결과로 바뀝니다.</p>${html}`;
    const share = shareFor(mode, res, ca, cb, today, yr);
    if (share) html += resultShareHtml();
    out.innerHTML = html;
    root.classList.add('has-result');
    if (share) wireShare($('.result-share', out), share);
    const ev = { tool: mode, source, has_time: ca.hasTime ? 'yes' : 'no', calendar: a.calendar };
    track('calc_result', ev);
    if (mode === 'story') track('story_result', { arc: res.arc.key });
    if (mode === 'rank') track('rank_result', { tier: res.tier.code, pct_bucket: res.pct <= 1 ? 'top1' : res.pct <= 5 ? 'top5' : res.pct <= 15 ? 'top15' : res.pct <= 50 ? 'top50' : 'bottom50' });
    if (mode === 'compatibility') track('compat_result', { score_band: res.total >= 85 ? '85+' : res.total >= 75 ? '75-84' : res.total >= 62 ? '62-74' : res.total >= 50 ? '50-61' : '<50' });
    return true;
  }

  const a0 = load('a');
  const b0 = load('b');
  fillForm(form, 'a', a0);
  if (pair) fillForm(form, 'b', b0);
  if (mode !== 'home' && a0 && (!pair || b0)) render(a0, b0, 'saved');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const a = readForm(form, 'a');
    const b = pair ? readForm(form, 'b') : null;
    const err = check(a) || (b && check(b));
    if (err) { showError(err); return; }
    track('calc_submit', { tool: mode });
    if (mode === 'home') {
      try { buildChart(toEngine(a)); } catch (er) { showError(er.message || '입력한 날짜를 확인해 주세요.'); return; }
      save('a', a);
      location.href = '/today/';
      return;
    }
    if (render(a, b, 'form')) {
      save('a', a);
      if (pair) save('b', b);
      out.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
  const sample = $('[data-sample]', form);
  if (sample) sample.addEventListener('click', () => {
    track('sample_click', { tool: mode });
    fillForm(form, 'a', SAMPLE.a);
    if (pair) fillForm(form, 'b', SAMPLE.b);
    if (mode === 'home') { save('a', SAMPLE.a); location.href = '/today/'; return; }
    render(SAMPLE.a, SAMPLE.b, 'sample');
    out.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

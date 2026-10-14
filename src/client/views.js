// 계산 결과를 HTML로 그리는 함수들 (브라우저 전용, 순수 문자열 생성)
import {
  STEM_H, BR_H, EL_K, EL_H, STEM_EL, BR_EL, TG, TG_SLUG, iljuSlug, pillarKo, isoDate,
} from '../engine/index.js';

import { TIPS } from '../content/tips.js';
import { storyDeck } from './story-view.js';
import { rankPlay } from './rank-view.js';
import { rankGuidanceView } from './rank-guidance-view.js';
import { pillarTable } from './pillar-table.js';
import { characterImg } from '../site/util.js';

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const hz = (p) => `${STEM_H[p.s]}${BR_H[p.b]}`;
const bandKey = (s) => (s >= 75 ? 'high' : s >= 60 ? 'good' : s >= 45 ? 'mid' : 'low');
const BAND = { high: '대길', good: '길', mid: '평', low: '주의' };
export const band = (s) => `<span class="band band-${bandKey(s)}">${BAND[bandKey(s)]}</span>`;
const tgLink = (t) => (TG.includes(t) ? `<a href="/saju/sipsin/${TG_SLUG[TG.indexOf(t)]}/">${t}</a>` : t);
const STRENGTHS = ['극신약', '신약', '중화', '신강', '극신강'];
const elChip = (role, el) => `<span class="chip el el-${el}"><em>${role}</em><b>${EL_K[el]}(${EL_H[el]})</b></span>`;
const SS_LINK = { '도화살': 'dohwa', '역마살': 'yeokma', '화개살': 'hwagae', '천을귀인': 'cheoneul-gwiin', '문창귀인': 'munchang-gwiin', '양인살': 'yangin', '괴강살': 'gwegang', '백호살': 'baekho' };

// 정보 아이콘 (서버 util.tip과 같은 마크업)
let tipSeq = 0;
export function tip(text, label = '설명 보기') {
  const id = `tip-c${++tipSeq}`;
  return `<span class="tipwrap"><button type="button" class="info" aria-label="${esc(label)}" aria-describedby="${id}" data-tip-id="${id}">i</button><span role="tooltip" id="${id}" class="tip">${esc(text)}</span></span>`;
}

export function ring(score) {
  const r = 54, C = 2 * Math.PI * r;
  return `<div class="ring" role="img" aria-label="종합 ${score}점"><svg viewBox="0 0 132 132" aria-hidden="true"><circle class="bg" cx="66" cy="66" r="${r}"></circle><circle class="fg" cx="66" cy="66" r="${r}" stroke-dasharray="${(C * score / 100).toFixed(1)} ${C.toFixed(1)}"></circle></svg><div class="val"><b>${score}</b>${band(score)}</div></div>`;
}

/* ── 원국 카드 ───────────────────────────── */
export function chartCard(c, profile, today) {
  const max = Math.max(...c.counts, 3);
  const elbars = c.counts.map((n, e) => `<div class="elbar el-${e}"><b>${EL_K[e]} ${EL_H[e]}</b><div class="track"><i style="width:${(n / max) * 100}%"></i></div><span class="num">${n}</span></div>`).join('');
  const si = STRENGTHS.indexOf(c.strengthLabel);
  const ss = [...new Set(c.natalSS.map(([n]) => n))];
  const cur = c.daeun.filter((d) => d.startYear <= today.y).pop();
  const p = profile;
  const birth = `${p.calendar === 'lunar' ? `음력 ${p.leap ? '윤' : ''}` : '양력 '}${p.y}.${String(p.m).padStart(2, '0')}.${String(p.d).padStart(2, '0')} · ${esc(c.timeLabel)}`;
  const day = c.pillars.day;
  return `<section class="chart-card card" aria-label="사주 원국">
    <div class="chart-head"><h2>${esc(c.name || '나')}의 사주 원국 ${tip(TIPS.chart, '사주 원국 보는 법')}</h2><span class="muted">${birth}${p.calendar === 'lunar' ? ` (양력 ${isoDate(c.birth)})` : ` · ${c.lunarText}`} · ${c.gender === 'F' ? '여성' : '남성'}${c.dst ? ' · 서머타임 보정' : ''}</span></div>
    <div class="chart-body">
      ${pillarTable(c, tip)}
      <div class="meta">
        <div><h3>오행 분포 (겉글자 ${c.hasTime ? 8 : 6}자) ${tip(TIPS.elements, '오행 분포 설명')}</h3><div class="elbars">${elbars}</div></div>
        <div><h3>일간 강약 — ${c.strengthLabel} ${tip(TIPS.strength, '일간 강약 설명')}</h3><div class="gauge">${STRENGTHS.map((_, i) => `<span class="${i === si ? 'on' : ''}"></span>`).join('')}</div><div class="gauge-labels">${STRENGTHS.map((s, i) => `<span class="${i === si ? 'on' : ''}">${s}</span>`).join('')}</div></div>
        <div><h3>용신 · 희신 · 기신 ${tip(TIPS.roles, '용신 설명')}</h3><div class="chips">${elChip('용신', c.roles.yong)}${elChip('희신', c.roles.hee)}${elChip('기신', c.roles.gi)}</div></div>
        <div><h3>일주 · 신살 · 대운 ${tip(TIPS.extras, '일주·신살·대운 설명')}</h3><div class="chips"><a class="chip" href="/saju/ilju/${iljuSlug(day)}/"><em>일주</em><b class="hz">${hz(day)}</b> ${pillarKo(day)}일주</a>${ss.map((n) => (SS_LINK[n] ? `<a class="chip" href="/saju/sinsal/${SS_LINK[n]}/">${n}</a>` : `<span class="chip">${n}</span>`)).join('')}${cur ? `<span class="chip"><em>현재 대운</em><b class="hz">${hz(cur)}</b> ${cur.age}세~</span>` : ''}</div></div>
      </div>
    </div>
  </section>`;
}

/* ── 공통 리포트 ───────────────────────────── */
export function reportHead(r, when) {
  return `<section class="report-head card">${ring(r.overall.score)}<div class="report-text"><div class="when">${when}</div><h2>${esc(r.overall.headline)}</h2><p>${esc(r.overall.text)}</p></div></section>`;
}
export function catList(cats, withText = true) {
  return `<section class="cats">${cats.map((c) => `<article class="cat"><div class="cat-top"><h3>${c.name}</h3>${band(c.score)}<div class="track"><i style="width:${c.score}%"></i></div><span class="num">${c.score}</span></div>${withText && c.text ? `<p>${esc(c.text)}</p>` : ''}</article>`).join('')}</section>`;
}
export function luckyRow(l) {
  return `<section class="lucky card" aria-label="행운 요소"><div><span>행운의 색</span><b>${l.color}</b></div><div><span>행운의 숫자</span><b class="num">${l.number}</b></div><div><span>좋은 방향</span><b>${l.dir}</b></div><div><span>좋은 시간</span><b>${l.time}</b></div></section>`;
}
const same = (a, b) => a.y === b.y && a.m === b.m && a.d === b.d;

export function dayView(r) {
  return reportHead(r, `<span>${r.label}</span><span class="hz">${hz(r.pillar)}日</span><span>${r.lunar}</span>`) + catList(r.cats) + luckyRow(r.lucky);
}
export function weekView(r, today) {
  const best = Math.max(...r.days.map((d) => d.score));
  const strip = r.days.map((d) => `<div class="wd${d.score === best ? ' best' : ''}${same(d.date, today) ? ' today' : ''}"><span class="d">${d.label} ${d.short}</span><span class="p">${hz(d.pillar)}</span><span class="bar"><i style="height:${d.score}%"></i></span><b>${d.score}</b></div>`).join('');
  return reportHead(r, `<span>${r.label}</span>`) +
    `<section class="box card"><div class="box-head"><h3>요일별 흐름</h3><span class="muted">빨간 테두리 = 오늘</span></div><div class="week">${strip}</div><div class="chips">${r.bestByCat.map((b) => `<span class="chip"><em>${b.name}</em>${b.day}요일</span>`).join('')}</div></section>` +
    catList(r.cats) + luckyRow(r.lucky);
}
export function monthView(r, today) {
  const lead = (r.days[0].dow + 6) % 7;
  const cells = ['월', '화', '수', '목', '금', '토', '일'].map((d) => `<div class="h">${d}</div>`).join('') + '<div class="c blank"></div>'.repeat(lead) +
    r.days.map((d) => { const s = Math.max(0, Math.round((d.score - 30) * 1.25)); return `<div class="c${s > 52 ? ' hot' : ''}${same(d.date, today) ? ' today' : ''}" style="--s:${Math.min(85, s)}" title="${d.date.m}/${d.date.d} ${d.score}점"><span class="dn">${d.date.d}</span><span class="ps">${hz(d.pillar)}</span></div>`; }).join('');
  const dl = (arr) => arr.map((d) => `<span class="chip"><b class="num">${d.date.m}/${d.date.d}</b> ${hz(d.pillar)} · ${d.score}점</span>`).join('');
  return reportHead(r, `<span>${r.label}</span><span class="hz">${hz(r.pillar)}月</span>`) +
    `<section class="box card"><div class="box-head"><h3>날짜별 기운</h3><span class="legend">낮음 <i style="background:var(--paper)"></i><i style="background:color-mix(in srgb, var(--accent) 45%, var(--paper))"></i><i style="background:color-mix(in srgb, var(--accent) 85%, var(--paper))"></i> 높음</span></div><div class="cal">${cells}</div>
      <div class="split"><div><h4>힘을 쓰기 좋은 날</h4><div class="chips">${dl(r.goodDays)}</div></div><div><h4>조심할 날</h4><div class="chips">${dl(r.badDays)}</div></div></div></section>` +
    catList(r.cats) + luckyRow(r.lucky);
}
function ymChart(months, curM) {
  const W = 600, H = 200, L = 30, R = 8, Tp = 20, B = 26;
  const iw = W - L - R, ih = H - Tp - B, bw = iw / 12;
  const y = (v) => Tp + ih * (1 - v / 100);
  let g = '';
  for (const v of [25, 50, 75, 100]) g += `<line class="grid" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"></line><text x="${L - 6}" y="${y(v) + 4}" text-anchor="end">${v}</text>`;
  const bars = months.map((m, i) => {
    const x = L + i * bw + bw * 0.22, w = bw * 0.56;
    const cls = m.m === curM ? 'cur' : m.score < 50 ? 'dim' : '';
    return `<rect class="bar ${cls}" x="${x.toFixed(1)}" y="${y(m.score).toFixed(1)}" width="${w.toFixed(1)}" height="${(ih * m.score / 100).toFixed(1)}" rx="3"></rect><text class="v" x="${(x + w / 2).toFixed(1)}" y="${(y(m.score) - 5).toFixed(1)}" text-anchor="middle">${m.score}</text><text x="${(x + w / 2).toFixed(1)}" y="${H - 8}" text-anchor="middle">${m.m}월</text>`;
  }).join('');
  return `<svg class="chart-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="월별 종합 점수">${g}${bars}</svg>`;
}
export function yearView(yr, months, today) {
  const curM = yr.year === today.y ? today.m : -1;
  const dy = yr.daeun ? `<span>대운 <span class="hz">${hz(yr.daeun)}</span></span>` : '';
  return reportHead(yr, `<span>${yr.year}년 총운</span><span class="hz">${hz(yr.pillar)}年</span>${dy}`) + catList(yr.cats) + luckyRow(yr.lucky) +
    `<section class="box card"><div class="box-head"><h3>${yr.year}년 월별 흐름</h3><span class="muted">각 달 15일의 절기 월주 기준</span></div>${ymChart(months, curM)}</section>` +
    `<div class="months">${months.map((m) => `<article class="mcard card${m.m === curM ? ' cur' : ''}"><div class="mcard-top"><h3>${m.m}월<small>${hz(m.pillar)}</small></h3><span class="num">${m.score}</span></div><h4>${esc(m.headline)}</h4><p>${esc(m.text)}</p><div class="chips"><span class="chip"><em>강점</em>${m.best.name} ${m.best.score}</span>${m.worst ? `<span class="chip"><em>주의</em>${m.worst.name} ${m.worst.score}</span>` : ''}</div></article>`).join('')}</div>`;
}

/* ── 평생 ───────────────────────────── */
function daeunChart(list) {
  const W = 640, H = 210, L = 30, R = 16, Tp = 26, B = 46;
  const iw = W - L - R, ih = H - Tp - B, n = list.length;
  const x = (i) => L + (n === 1 ? iw / 2 : (iw * i) / (n - 1));
  const y = (v) => Tp + ih * (1 - v / 100);
  let g = '';
  for (const v of [25, 50, 75, 100]) g += `<line class="grid" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"></line><text x="${L - 6}" y="${y(v) + 4}" text-anchor="end">${v}</text>`;
  const pts = list.map((d, i) => `${x(i).toFixed(1)},${y(d.score).toFixed(1)}`).join(' ');
  const area = `${x(0).toFixed(1)},${y(0)} ${pts} ${x(n - 1).toFixed(1)},${y(0)}`;
  const marks = list.map((d, i) => `<circle class="pt${d.current ? ' cur' : ''}" cx="${x(i).toFixed(1)}" cy="${y(d.score).toFixed(1)}" r="${d.current ? 6 : 4.5}"></circle><text class="v" x="${x(i).toFixed(1)}" y="${(y(d.score) - 10).toFixed(1)}" text-anchor="middle">${d.score}</text><text class="hzt" x="${x(i).toFixed(1)}" y="${H - 24}" text-anchor="middle">${hz(d)}</text><text x="${x(i).toFixed(1)}" y="${H - 8}" text-anchor="middle">${d.age}세</text>`).join('');
  return `<div class="scroll-x"><svg class="chart-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="대운별 점수">${g}<polygon class="area" points="${area}"></polygon><polyline class="line" points="${pts}"></polyline>${marks}</svg></div>`;
}
export function lifeView(L, c, today) {
  const dm = L.dayMaster;
  const y = (it) => `<li><span class="y">${it.y}</span><span>${it.age}세 · <span class="hz">${hz(it.pillar)}</span>年</span><span class="why">${esc(it.why)}</span></li>`;
  const ev = L.events.map((g) => `<div class="ev"><h4>${g.name}</h4>${g.items.length ? `<ul>${g.items.map(y).join('')}</ul>` : '<p class="muted">앞으로 15년 안에 두드러진 해가 없습니다.</p>'}</div>`).join('');
  const dlist = L.daeun.map((d) => `<div class="dcard${d.current ? ' cur' : ''}"><span class="muted">${d.age}세 · ${d.startYear}년~</span><b>${hz(d)} 대운</b><span>${d.tgS}·${d.tgB} · ${d.keyword}</span><span class="muted">${d.score}점 · ${d.best} 강세</span></div>`).join('');
  const yong = L.roles.yong;
  return `<div class="life">
    <section class="box card wide"><div class="dm-hero"><span class="char el-${STEM_EL[c.dm]}">${STEM_H[c.dm]}</span><div><h3>${dm.title}<small>${dm.image}</small></h3></div></div><p>${dm.summary}</p>
      <div class="pros"><div><h4>타고난 강점</h4><ul>${dm.strengths.map((s) => `<li>${s}</li>`).join('')}</ul></div><div><h4>다듬을 점</h4><ul>${dm.weaknesses.map((s) => `<li>${s}</li>`).join('')}</ul></div></div><p class="muted">${dm.advice}</p></section>
    <section class="box card"><h3>오행의 균형</h3><p>${L.strength.text}</p>${L.elements.excess.map((t) => `<p>${t}</p>`).join('')}${L.elements.lack.map((t) => `<p>${t}</p>`).join('')}<p>운을 끌어올리는 용신은 <a href="/saju/ohaeng/${['wood', 'fire', 'earth', 'metal', 'water'][yong]}/"><b>${EL_K[yong]}(${EL_H[yong]})</b></a>입니다.</p></section>
    <section class="box card"><h3>성향과 적성</h3><p>${L.persona}</p><p><b>맞는 일:</b> ${L.career.jobs}</p><p><b>용신 업종:</b> ${L.career.industry}</p><p class="muted">${L.career.note}</p></section>
    <section class="box card"><h3>재물운</h3>${L.wealth.map((t) => `<p>${t}</p>`).join('')}</section>
    <section class="box card"><h3>애정·결혼운</h3>${L.love.map((t) => `<p>${t}</p>`).join('')}</section>
    <section class="box card"><h3>건강</h3>${L.health.map((t) => `<p>${t}</p>`).join('')}</section>
    <section class="box card"><h3>인생의 리듬</h3><p>대운은 10년마다 바뀌는 큰 계절입니다. 점수가 높은 대운에 큰 결정을, 낮은 대운에 내실을 다지는 것이 좋습니다. 빨간 점이 지금의 대운입니다.</p></section>
    <section class="box card wide"><div class="box-head"><h3>대운 흐름</h3><span class="muted">10년 단위 · 만 나이</span></div>${daeunChart(L.daeun)}<div class="daeun-list">${dlist}</div></section>
    <section class="box card wide"><div class="box-head"><h3>앞으로 15년의 주요 시기</h3><span class="muted">${today.y}–${today.y + 14}년 세운 기준</span></div><div class="events">${ev}</div></section>
  </div>`;
}

/* ── 궁합 ───────────────────────────── */
export function compatView(r, a, b, today) {
  const ma = Math.max(...a.counts, ...b.counts, 3);
  const rows = [0, 1, 2, 3, 4].map((e) => `<div class="cmp-row el-${e}"><b>${EL_K[e]} ${EL_H[e]}</b><div class="side l"><span class="num">${a.counts[e]}</span><div class="track"><i style="width:${(a.counts[e] / ma) * 100}%"></i></div></div><div class="side"><div class="track"><i style="width:${(b.counts[e] / ma) * 100}%"></i></div><span class="num">${b.counts[e]}</span></div></div>`).join('');
  const yl = (arr) => arr.map((it) => `<li><span class="y">${it.y}</span><span><span class="hz">${hz(it.pillar)}</span>年</span><span class="why">${esc(it.why)}</span></li>`).join('');
  const mini = (c) => c.cols.slice().reverse().map((x) => `${STEM_H[x.s]}${BR_H[x.b]}`).join(' ');
  return `<section class="report-head card">${ring(r.total)}<div class="report-text"><div class="when"><span>${esc(r.nameA)} <span class="hz">${mini(a)}</span></span><span>×</span><span>${esc(r.nameB)} <span class="hz">${mini(b)}</span></span></div><h2>${r.headline}</h2><p>${esc(r.lines.join(' '))}</p></div></section>
    ${catList(r.cats.map((c) => ({ ...c, name: `${c.name} 궁합` })), false)}
    <div class="split">
      <section class="box card"><h3>오행 보완</h3><div class="cmp-head"><span></span><span>${esc(r.nameA)}</span><span>${esc(r.nameB)}</span></div><div>${rows}</div>${r.complement.map((t) => `<p>${esc(t)}</p>`).join('')}<div class="chips">${elChip(`${esc(r.nameA)} 용신`, a.roles.yong)}${elChip(`${esc(r.nameB)} 용신`, b.roles.yong)}</div></section>
      <section class="box card"><h3>두 사람이 조심할 점</h3><ul class="cautions">${r.cautions.map((c) => `<li><b>${esc(c.title)}</b><span>${esc(c.text)}</span></li>`).join('')}</ul></section>
    </div>
    <section class="box card"><div class="box-head"><h3>함께 맞을 주요 시기</h3><span class="muted">결혼·재물 ${today.y}–${today.y + 9}년, 자녀는 첫 결혼운 해부터 10년</span></div>
      <div class="events"><div class="ev"><h4>결혼운이 강한 해</h4><ul>${yl(r.events.marriageYears)}</ul></div><div class="ev"><h4>자녀운이 강한 해</h4><ul>${yl(r.events.childYears)}</ul></div><div class="ev"><h4>함께 재물이 모이는 해</h4><ul>${yl(r.events.moneyYears)}</ul></div></div></section>
    <section class="box card"><div class="box-head"><h3>${r.events.bestYear}년 결혼 길일 추천</h3><span class="muted">결혼운이 강한 가장 가까운 해 · 두 사람의 일지·띠와 충돌 없는 주말</span></div>
      <div class="dates">${r.events.weddingDates.map((d) => `<div class="date"><b>${d.label}</b><span><span class="hz">${hz(d.pillar)}</span>日 · ${d.lunar}</span></div>`).join('')}</div></section>`;
}

/* ── 만세력 ───────────────────────────── */
export function manseView(c) {
  const rows = c.daeun.map((d) => `<div class="dcard"><span class="muted">${d.age}세 · ${d.startYear}년~</span><b>${hz(d)} 대운</b></div>`).join('');
  const tgRows = c.cols.slice().reverse().map((x) => `<tr><th scope="row">${x.label}</th><td><span class="hz el-${STEM_EL[x.s]}">${STEM_H[x.s]}</span> ${tgLink(x.tgS)}</td><td><span class="hz el-${BR_EL[x.b]}">${BR_H[x.b]}</span> ${tgLink(x.tgB)}</td><td class="hz">${x.hidden.map((h) => STEM_H[h]).join(' ')}</td><td>${x.stage}</td></tr>`).join('');
  return `<section class="box card"><h3>기둥별 상세</h3><div class="table-wrap"><table><thead><tr><th scope="col">기둥</th><th scope="col">천간 · 십신</th><th scope="col">지지 · 십신</th><th scope="col">지장간</th><th scope="col">12운성</th></tr></thead><tbody>${tgRows}</tbody></table></div></section>
    <section class="box card"><div class="box-head"><h3>대운</h3><span class="muted">10년 단위 · 만 나이</span></div><div class="daeun-list">${rows}</div></section>`;
}

/* ── 사주로 본 내 인생 ───────────────────────────── */
function arcChart(stages) {
  // 아홉 구간도 휴대폰에서 읽히도록 좁은 좌표계(글자 13단위 ≈ 화면 11px)를 쓴다.
  const W = 380, H = 168, L = 36, R = 16, Tp = 28, B = 30;
  const iw = W - L - R, ih = H - Tp - B;
  const x = (i) => L + (iw * i) / (stages.length - 1);
  const y = (v) => Tp + ih * (1 - (Math.max(20, Math.min(90, v)) - 20) / 70);
  const pts = stages.map((s, i) => `${x(i)},${y(s.score).toFixed(1)}`).join(' ');
  return `<svg class="chart-svg arc" viewBox="0 0 ${W} ${H}" role="img" aria-label="인생 곡선: ${stages.map((s) => `${s.label} ${s.score}점`).join(', ')}">
    <line class="grid" x1="${L}" x2="${W - R}" y1="${y(60)}" y2="${y(60)}"></line><text class="axis" x="2" y="${y(60) + 4}">60점</text>
    <polyline class="line" points="${pts}"></polyline>
    ${stages.map((s, i) => `<circle class="pt${s.now ? ' cur' : ''}" cx="${x(i)}" cy="${y(s.score).toFixed(1)}" r="5"></circle><text class="v" x="${x(i)}" y="${(y(s.score) - 10).toFixed(1)}" text-anchor="middle">${s.score}</text><text x="${x(i)}" y="${H - 9}" text-anchor="middle">${s.label}</text>`).join('')}
  </svg>`;
}
export function storyView(st, c) {
  return `<section class="report-head card story-head"><div class="arc-badge" aria-hidden="true">${characterImg((st.stages.find((s) => s.now) || st.stages[0]).character.portrait, '', { thumb: true, sizes: '96px', size: 96 })}</div><div class="report-text"><div class="when"><span>사주로 본 ${esc(c.name || '나')}의 인생은</span></div><h2>${esc(st.arc.name)}</h2><p>${esc(st.arc.desc)}</p></div></section>
    <section class="box card"><div class="box-head"><h3>인생 곡선</h3><span class="muted">빨간 점 = 지금 시기 (만 ${st.nowAge}세)</span></div>${arcChart(st.stages)}</section>
    ${storyDeck(st)}`;
}

/* ── 사주 랭킹 ───────────────────────────── */
export function rankView(r, c) {
  const of = r.of.toLocaleString('ko-KR');
  const reasons = r.reasons.map((x) => `<li class="${x.pts >= 0 ? 'up' : 'down'}"><span class="pts num">${x.pts >= 0 ? '+' : ''}${x.pts}</span><span><b>${x.name}</b> ${esc(x.text)}</span></li>`).join('');
  return `<section class="report-head card rank-head"><div class="tier tier-${r.tier.code.replace('+', 'p')}"><b>${r.tier.code}</b><span>등급</span></div><div class="report-text">
      <div class="when"><span>${esc(c.name || '나')}의 사주 랭킹</span><span>${r.withHour ? '4기둥' : '3기둥(시간 모름)'} 기준</span></div>
      <h2><span class="rank-num num">${r.rank.toLocaleString('ko-KR')}위</span> <small>/ ${of}가지 사주</small></h2>
      <p><b>상위 ${r.pct}%</b> · ${esc(r.tier.name)} — ${esc(r.tier.text)} ${tip(TIPS.rankPct, '순위 계산 설명')}</p>
    </div></section>
    <section class="box card"><div class="box-head"><h3>사주 점수 <b class="num">${r.total}</b>점 <span class="muted">(전체 평균 ${r.avgTotal}점)</span> ${tip(TIPS.rankScore, '사주 점수 설명')}</h3></div>
      <div class="pct-bar" aria-label="상위 ${r.pct}%"><i style="left:${Math.min(99, 100 - r.pct)}%"></i><span>하위</span><span>상위</span></div>
      <h4 class="sub-h">이 순위가 나온 이유 (전체 사주 평균과 비교)</h4><ul class="reasons">${reasons}</ul></section>
    <section class="box card"><h3>분야별 순위</h3><div class="rank-cats">${r.cats.map((k) => `<div class="rank-cat"><span>${k.name}</span><div class="track"><i style="width:${Math.max(2, 100 - k.pct)}%"></i></div><b>상위 ${k.pct}%</b></div>`).join('')}</div>
      <p class="hint">사주 랭킹은 여덟 글자의 균형과 조화만 본 재미 지표입니다. 실제 삶은 대운·세운과 노력에 따라 크게 달라집니다.</p></section>${rankGuidanceView(c, r)}${rankPlay(r)}`;
}

// 계산 결과를 HTML로 그리는 함수들 (브라우저 전용, 순수 문자열 생성)
import {
  STEM_H, BR_H, EL_H, STEM_EL, BR_EL, TG, TG_SLUG, iljuSlug, pillarKo, pillarLabel, isoDate,
} from '../engine/index.js';

import { TIPS } from '../content/tips.js';
import { pillarTable } from './pillar-table.js';
import { chartRelations } from './reading-explorer.js';
import { tr } from '../i18n/runtime.js';
import { term, elementName, weekdayName } from '../i18n/terms.js';

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const hz = (p) => `${STEM_H[p.s]}${BR_H[p.b]}`;
const bandKey = (s) => (s >= 75 ? 'high' : s >= 60 ? 'good' : s >= 45 ? 'mid' : 'low');
const BAND = { high: '대길', good: '길', mid: '평', low: '주의' };
export const band = (s) => `<span class="band band-${bandKey(s)}">${term(BAND[bandKey(s)])}</span>`;
const tgLink = (t) => (TG.includes(t) ? `<a href="/saju/sipsin/${TG_SLUG[TG.indexOf(t)]}/">${term(t)}</a>` : term(t));
const STRENGTHS = ['극신약', '신약', '중화', '신강', '극신강'];
export const elChip = (role, el) => `<span class="chip el el-${el}"><em>${term(role)}</em><b>${elementName(el)}(${EL_H[el]})</b></span>`;
const SS_LINK = { '도화살': 'dohwa', '역마살': 'yeokma', '화개살': 'hwagae', '천을귀인': 'cheoneul-gwiin', '문창귀인': 'munchang-gwiin', '양인살': 'yangin', '괴강살': 'gwegang', '백호살': 'baekho' };

// 정보 아이콘 (서버 util.tip과 같은 마크업)
let tipSeq = 0;
export function tip(text, label = tr('설명 보기', 'Read explanation')) {
  const id = `tip-c${++tipSeq}`;
  return `<span class="tipwrap"><button type="button" class="info" aria-label="${esc(label)}" aria-describedby="${id}" data-tip-id="${id}">i</button><span role="tooltip" id="${id}" class="tip">${esc(text)}</span></span>`;
}

export function ring(score) {
  const r = 54, C = 2 * Math.PI * r;
  return `<div class="ring" role="img" aria-label="${tr(`종합 ${score}점`, `Overall ${score} out of 100`)}"><svg viewBox="0 0 132 132" aria-hidden="true"><circle class="bg" cx="66" cy="66" r="${r}"></circle><circle class="fg" cx="66" cy="66" r="${r}" stroke-dasharray="${(C * score / 100).toFixed(1)} ${C.toFixed(1)}"></circle></svg><div class="val"><b>${score}</b>${band(score)}</div></div>`;
}

/* ── 원국 카드 ───────────────────────────── */
export function chartCard(c, profile, today) {
  const max = Math.max(...c.counts, 3);
  const elbars = c.counts.map((n, e) => `<div class="elbar el-${e}"><b>${elementName(e)} ${EL_H[e]}</b><div class="track"><i style="width:${(n / max) * 100}%"></i></div><span class="num">${n}</span></div>`).join('');
  const si = STRENGTHS.indexOf(c.strengthLabel);
  const ss = [...new Set(c.natalSS.map(([n]) => n))];
  const cur = c.daeun.filter((d) => d.startYear <= today.y).pop();
  const p = profile;
  const birth = `${p.calendar === 'lunar' ? tr(`음력 ${p.leap ? '윤' : ''}`, `Lunar ${p.leap ? 'leap ' : ''}`) : tr('양력 ', 'Solar ')}${p.y}.${String(p.m).padStart(2, '0')}.${String(p.d).padStart(2, '0')} · ${esc(c.timeLabel)}`;
  const day = c.pillars.day;
  return `<section class="chart-card card" aria-label="${tr('사주 원국', 'Saju birth chart')}">
    <div class="chart-head"><h2>${tr(`${esc(c.name || '나')}의 사주 원국`, c.name ? `${esc(c.name)}'s saju birth chart` : 'Your saju birth chart')} ${tip(TIPS.chart, tr('사주 원국 보는 법', 'How to read your birth chart'))}</h2><span class="muted">${birth}${p.calendar === 'lunar' ? tr(` (양력 ${isoDate(c.birth)})`, ` (Solar ${isoDate(c.birth)})`) : ` · ${c.lunarText}`} · ${c.gender === 'F' ? tr('여성', 'Female') : tr('남성', 'Male')}${c.dst ? tr(' · 서머타임 보정', ' · Daylight saving adjustment') : ''}</span></div>
    <div class="chart-body">
      ${pillarTable(c, tip)}
      <div class="meta">
        <div><h3>${tr(`오행 분포 (겉글자 ${c.hasTime ? 8 : 6}자)`, `Five Elements (${c.hasTime ? 8 : 6} visible characters)`)} ${tip(TIPS.elements, tr('오행 분포 설명', 'Element distribution'))}</h3><div class="elbars">${elbars}</div></div>
        <div><h3>${tr('일간 강약', 'Day Master strength')} — ${term(c.strengthLabel)} ${tip(TIPS.strength, tr('일간 강약 설명', 'Day Master strength explained'))}</h3><div class="gauge">${STRENGTHS.map((_, i) => `<span class="${i === si ? 'on' : ''}"></span>`).join('')}</div><div class="gauge-labels">${STRENGTHS.map((s, i) => `<span class="${i === si ? 'on' : ''}">${term(s)}</span>`).join('')}</div></div>
        <div><h3>${tr('용신 · 희신 · 기신', 'Useful, supporting & challenging elements')} ${tip(TIPS.roles, tr('용신 설명', 'Element roles'))}</h3><div class="chips">${elChip('용신', c.roles.yong)}${elChip('희신', c.roles.hee)}${elChip('기신', c.roles.gi)}</div></div>
        <div><h3>${tr('일주 · 신살 · 대운', 'Day pillar, symbolic stars & luck cycle')} ${tip(TIPS.extras, tr('일주·신살·대운 설명', 'Pillars, stars and cycles'))}</h3><div class="chips"><a class="chip" href="/saju/ilju/${iljuSlug(day)}/"><em>${tr('일주', 'Day pillar')}</em><b class="hz">${hz(day)}</b> ${tr(`${pillarKo(day)}일주`, pillarLabel(day))}</a>${ss.map((n) => (SS_LINK[n] ? `<a class="chip" href="/saju/sinsal/${SS_LINK[n]}/">${term(n)}</a>` : `<span class="chip">${term(n)}</span>`)).join('')}${cur ? `<span class="chip"><em>${tr('현재 대운', 'Current luck cycle')}</em><b class="hz">${hz(cur)}</b> ${tr(`${cur.age}세~`, `Age ${cur.age}+`)}</span>` : ''}</div></div>
      </div>
    </div>
    ${chartRelations(c)}
  </section>`;
}

/* ── 공통 리포트 ───────────────────────────── */
export function reportHead(r, when) {
  const low = [...r.cats].sort((a, b) => a.score - b.score)[0];
  const lead = r.overall.outlook || low?.text?.split(/(?<=[.!?])\s+/)[0] || r.overall.text;
  return `<section class="report-head card" data-result-summary>${ring(r.overall.score)}<div class="report-text"><div class="when">${when}</div><h2 data-result-heading>${esc(r.overall.headline)}</h2><p>${esc(lead)}</p><details class="reading-basis"><summary>${tr('이 흐름이 나온 이유', 'How this reading was calculated')}</summary><p>${esc(r.overall.text)}</p></details><p class="score-note">${tr('점수는 이 서비스의 계산 기준이며, 성공 확률을 뜻하지 않습니다.', 'Scores reflect this service’s calculation rules, not a probability of success.')}</p></div></section>`;
}
export function catList(cats, withText = true) {
  return `<section class="cats">${cats.map((c) => `<article class="cat"><div class="cat-top"><h3>${c.name}</h3>${band(c.score)}<div class="track"><i style="width:${c.score}%"></i></div><span class="num">${c.score}</span></div>${withText && c.text ? `<p>${esc(c.text)}</p>` : ''}</article>`).join('')}</section>`;
}
let categorySequence = 0;
function dailyCategories(cats) {
  const id = `daily-reading-${++categorySequence}`;
  return `<section class="daily-cats" aria-labelledby="${id}-title"><div class="daily-intro"><h2 id="${id}-title">${tr('분야별 운세 자세히', 'Your reading in each area')}</h2><p class="muted">${tr('각 운의 흐름과 기회, 주의할 점을 함께 살펴보세요.', 'Explore the outlook, opportunities and cautions for each area.')}</p></div>
    <nav class="daily-links" aria-label="${tr('분야별 운세 바로가기', 'Jump to a reading area')}">${cats.map(cat => `<a href="#${id}-${cat.key}">${esc(cat.name)}<b>${cat.score}${tr('점', ' pts')}</b></a>`).join('')}</nav>
    ${cats.map(cat => `<article class="daily-cat card" id="${id}-${cat.key}" tabindex="-1" aria-labelledby="${id}-${cat.key}-title"><div class="daily-cat-head"><h3 id="${id}-${cat.key}-title">${esc(cat.name)}</h3>${band(cat.score)}<b class="num">${cat.score}${tr('점', ' points')}</b></div>
      <p class="daily-outlook" data-daily-outlook>${esc(cat.reading.outlook)}</p>
      <div class="daily-aspects"><div><h4>${tr('활용할 기회', 'Opportunities')}</h4><p data-daily-opportunity>${esc(cat.reading.opportunity)}</p></div><div><h4>${tr('주의할 점', 'Take care')}</h4><p data-daily-caution>${esc(cat.reading.caution)}</p></div></div>
      <div class="daily-action"><h4>${tr('하루의 제안', 'A suggestion for the day')}</h4><p data-daily-action>${esc(cat.reading.action)}</p></div>
      <details class="reading-basis"><summary>${tr('해석 근거와 전날 비교', 'Reading basis and change from the previous day')}</summary>${cat.reading.basis ? `<p data-daily-basis>${esc(cat.reading.basis)}</p>` : ''}<p data-daily-change>${esc(cat.reading.change)}</p></details>
    </article>`).join('')}</section>`;
}
export function luckyRow(l) {
  return `<section class="lucky card" aria-label="${tr('오행 상징에 따른 참고 요소', 'Five Element symbolic references')}"><div><span>${tr('행운의 색', 'Lucky color')}</span><b>${l.color}</b></div><div><span>${tr('행운의 숫자', 'Lucky number')}</span><b class="num">${l.number}</b></div><div><span>${tr('참고 방향', 'Symbolic direction')}</span><b>${l.dir}</b></div><div><span title="${tr('용신·희신 오행에 연결된 시진이며 시간대별 운세 비교 결과가 아닙니다.', 'An interval associated with your useful or supporting element, not a comparison of hourly fortunes.')}">${tr('오행 참고 시간', 'Symbolic time')}</span><b>${l.time}</b></div></section>`;
}
const same = (a, b) => a.y === b.y && a.m === b.m && a.d === b.d;

export function dayView(r) {
  return reportHead(r, `<span>${r.label}</span><span class="hz">${hz(r.pillar)}日</span><span>${r.lunar}</span>`) + dailyCategories(r.cats) + luckyRow(r.lucky);
}
export function weekView(r, today) {
  const best = Math.max(...r.days.map((d) => d.score));
  const strip = r.days.map((d) => `<button type="button" data-reading-date="${isoDate(d.date)}" aria-controls="calendar-day-detail" aria-pressed="false" aria-label="${esc(d.short)} ${d.score}${tr('점 상세', ' points, details')}" class="wd${d.score === best ? ' best' : ''}${same(d.date, today) ? ' today' : ''}"><span class="d">${d.label} ${d.short}</span><span class="p">${hz(d.pillar)}</span><span class="bar"><i style="height:${d.score}%"></i></span><b>${d.score}</b></button>`).join('');
  return reportHead(r, `<span>${r.label}</span>`) +
    `<section class="box card"><div class="box-head"><h3>${tr('요일별 흐름', 'Your week at a glance')}</h3><span class="muted">${tr('빨간 테두리 = 오늘', 'Red outline = today')}</span></div><div class="week">${strip}</div><div class="chips">${r.bestByCat.map((b) => `<span class="chip"><em>${b.name}</em>${b.day}${tr('요일', '')}</span>`).join('')}</div></section>` +
    calendarDetail() + catList(r.cats) + luckyRow(r.lucky);
}
const calendarDetail = () => `<section class="calendar-day-detail" id="calendar-day-detail" role="region" aria-label="${tr('선택한 날짜의 운세', 'Reading for the selected date')}" tabindex="-1" hidden></section>`;
export function monthView(r, today) {
  const lead = (r.days[0].dow + 6) % 7;
  const cells = [1, 2, 3, 4, 5, 6, 0].map((d) => `<div class="h">${weekdayName(d)}</div>`).join('') + '<div class="c blank"></div>'.repeat(lead) +
    r.days.map((d) => { const s = Math.max(0, Math.round((d.score - 30) * 1.25)); return `<button type="button" data-reading-date="${isoDate(d.date)}" aria-controls="calendar-day-detail" aria-pressed="false" class="c${s > 52 ? ' hot' : ''}${same(d.date, today) ? ' today' : ''}" style="--s:${Math.min(85, s)}" aria-label="${d.date.m}/${d.date.d} ${d.score}${tr("점 상세", " points, details")}"><span class="dn">${d.date.d}</span><span class="ps">${hz(d.pillar)}</span><b class="day-score" aria-label="${tr("종합", "Overall")} ${d.score}${tr("점", " pts")}">${d.score}${tr("점", " pts")}</b></button>`; }).join('');
  const dl = (arr) => arr.map((d) => `<span class="chip"><b class="num">${d.date.m}/${d.date.d}</b> ${hz(d.pillar)} · ${d.score}${tr("점", " pts")}</span>`).join('');
  return reportHead(r, `<span>${r.label}</span><span class="hz">${hz(r.pillar)}月</span>`) +
    `<section class="box card"><div class="box-head"><h3>${tr("날짜별 기운", "Daily scores")}</h3><span class="legend">${tr("낮음", "Low")} <i style="background:var(--paper)"></i><i style="background:color-mix(in srgb, var(--accent) 45%, var(--paper))"></i><i style="background:color-mix(in srgb, var(--accent) 85%, var(--paper))"></i> ${tr("높음", "High")}</span></div><div class="cal">${cells}</div>
      <div class="split"><div><h4>${tr("힘을 쓰기 좋은 날", "Days to make progress")}</h4><div class="chips">${dl(r.goodDays)}</div></div><div><h4>${tr("조심할 날", "Days to take care")}</h4><div class="chips">${dl(r.badDays)}</div></div></div></section>` +
    calendarDetail() + catList(r.cats) + luckyRow(r.lucky);
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
    return `<rect class="bar ${cls}" x="${x.toFixed(1)}" y="${y(m.score).toFixed(1)}" width="${w.toFixed(1)}" height="${(ih * m.score / 100).toFixed(1)}" rx="3"></rect><text class="v" x="${(x + w / 2).toFixed(1)}" y="${(y(m.score) - 5).toFixed(1)}" text-anchor="middle">${m.score}</text><text x="${(x + w / 2).toFixed(1)}" y="${H - 8}" text-anchor="middle">${tr(`${m.m}월`, `M${m.m}`)}</text>`;
  }).join('');
  return `<svg class="chart-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${tr("월별 종합 점수", "Monthly overall scores")}">${g}${bars}</svg>`;
}
export function yearView(yr, months, today) {
  const curM = yr.year === today.y ? today.m : -1;
  const dy = yr.daeun ? `<span>${tr("대운", "Luck cycle")} <span class="hz">${hz(yr.daeun)}</span></span>` : '';
  return reportHead(yr, `<span>${tr(`${yr.year}년 총운`, `${yr.year} annual reading`)}</span><span class="hz">${hz(yr.pillar)}年</span>${dy}`) + catList(yr.cats) + luckyRow(yr.lucky) +
    `<section class="box card"><div class="box-head"><h3>${tr(`${yr.year}년 월별 흐름`, `Monthly scores for ${yr.year}`)}</h3><span class="muted">${tr("각 달 15일의 절기 월주 기준", "Based on the solar-term month pillar on the 15th")}</span></div>${ymChart(months, curM)}</section>` +
    `<div class="months">${months.map((m) => `<article class="mcard card${m.m === curM ? ' cur' : ''}"><div class="mcard-top"><h3>${tr(`${m.m}월`, `M${m.m}`)}<small>${hz(m.pillar)}</small></h3><span class="num">${m.score}</span></div><h4>${esc(m.headline)}</h4><p>${esc(m.text)}</p><div class="chips"><span class="chip"><em>${tr("강점", "Strength")}</em>${m.best.name} ${m.best.score}</span>${m.worst ? `<span class="chip"><em>${tr("주의", "Take care")}</em>${m.worst.name} ${m.worst.score}</span>` : ''}</div></article>`).join('')}</div>`;
}

/* ── 만세력 ───────────────────────────── */
export function manseView(c) {
  const rows = c.daeun.map((d) => `<div class="dcard"><span class="muted">${tr(`${d.age}세 · ${d.startYear}년~`, `Age ${d.age} · ${d.startYear} onward`)}</span><b>${hz(d)}${tr(" 대운", " cycle")}</b></div>`).join('');
  const tgRows = c.cols.slice().reverse().map((x) => `<tr><th scope="row">${term(x.label)}</th><td><span class="hz el-${STEM_EL[x.s]}">${STEM_H[x.s]}</span> ${tgLink(x.tgS)}</td><td><span class="hz el-${BR_EL[x.b]}">${BR_H[x.b]}</span> ${tgLink(x.tgB)}</td><td class="hz">${x.hidden.map((h) => STEM_H[h]).join(' ')}</td><td>${term(x.stage)}</td></tr>`).join('');
  return `<section class="box card"><h3>${tr("기둥별 상세", "Pillar details")}</h3><div class="table-wrap"><table><thead><tr><th scope="col">${tr("기둥", "Pillar")}</th><th scope="col">${tr("천간 · 십신", "Heavenly stem · Ten God")}</th><th scope="col">${tr("지지 · 십신", "Earthly branch · Ten God")}</th><th scope="col">${tr("지장간", "Hidden stems")}</th><th scope="col">${tr("12운성", "Life stage")}</th></tr></thead><tbody>${tgRows}</tbody></table></div></section>
    <section class="box card"><div class="box-head"><h3>${tr("대운", "Ten-year luck cycle")}</h3><span class="muted">${tr("10년 단위 · 만 나이", "Ten-year periods · age in years")}</span></div><div class="daeun-list">${rows}</div></section>`;
}

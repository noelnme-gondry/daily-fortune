// 두 사람 궁합과 추천 탐색 코드는 궁합 도구에서만 로드한다.
import { STEM_H, BR_H, EL_H, pillarH as hz } from '../engine/core.js';
import { tr } from '../i18n/runtime.js';
import { term, elementName } from '../i18n/terms.js';
import { esc, ring, catList, elChip } from './views.js';
export { compat } from '../engine/compat.js';
export { compatMatchesShell, mountCompatMatches } from './compat-matches-view.js';

/* ── 궁합 ───────────────────────────── */
export function compatView(r, a, b, today) {
  const ma = Math.max(...a.counts, ...b.counts, 3);
  const rows = [0, 1, 2, 3, 4].map((e) => `<div class="cmp-row el-${e}"><b>${elementName(e)} ${EL_H[e]}</b><div class="side l"><span class="num">${a.counts[e]}</span><div class="track"><i style="width:${(a.counts[e] / ma) * 100}%"></i></div></div><div class="side"><div class="track"><i style="width:${(b.counts[e] / ma) * 100}%"></i></div><span class="num">${b.counts[e]}</span></div></div>`).join('');
  const positive = arr => arr.filter(it => Number.isFinite(it.signal) && it.signal > 0);
  const marriages = positive(r.events.marriageYears), children = positive(r.events.childYears);
  const yl = (arr) => arr.length ? arr.map((it) => `<li><span class="y">${it.y}</span><span><span class="hz">${hz(it.pillar)}</span>年</span><span class="why">${esc(it.why)}</span></li>`).join('') : `<li>${tr('비교 기간에 추천할 만한 신호가 없습니다. 실제 결혼·출산 가능성을 뜻하지 않습니다.', 'No signal stands out in the comparison period. This does not assess the possibility of marriage or childbirth.')}</li>`;
  const mini = (c) => c.cols.slice().reverse().map((x) => `${STEM_H[x.s]}${BR_H[x.b]}`).join(' ');
  return `<section class="report-head card">${ring(r.total)}<div class="report-text"><div class="when"><span>${esc(r.nameA)} <span class="hz">${mini(a)}</span></span><span>×</span><span>${esc(r.nameB)} <span class="hz">${mini(b)}</span></span></div><h2>${r.headline}</h2><p>${esc(r.lines.join(' '))}</p></div></section>
    ${catList(r.cats.map((c) => ({ ...c, name: `${c.name}${tr(" 궁합", " compatibility")}` })), false)}
    <div class="split">
      <section class="box card"><h3>${tr("오행 보완", "Element balance together")}</h3><div class="cmp-head"><span></span><span>${esc(r.nameA)}</span><span>${esc(r.nameB)}</span></div><div>${rows}</div>${r.complement.map((t) => `<p>${esc(t)}</p>`).join('')}<div class="chips">${elChip(`${esc(r.nameA)} ${term("용신")}`, a.roles.yong)}${elChip(`${esc(r.nameB)} ${term("용신")}`, b.roles.yong)}</div></section>
      <section class="box card"><h3>${tr("두 사람이 조심할 점", "What to watch together")}</h3><ul class="cautions">${r.cautions.map((c) => `<li><b>${esc(c.title)}</b><span>${esc(c.text)}</span></li>`).join('')}</ul></section>
    </div>
    <section class="box card"><div class="box-head"><h3>${tr("함께 맞을 주요 시기", "Shared periods to explore")}</h3><span class="muted">${tr(`결혼·재물 ${today.y}–${today.y + 9}년, 자녀는 ${r.events.bestYear}–${r.events.bestYear + 10}년의 11개 연도 비교. 사건 발생의 예측이 아닙니다.`, `Marriage & wealth: ${today.y}–${today.y + 9}. Family: 11 calendar years, ${r.events.bestYear}–${r.events.bestYear + 10}. Not a prediction of events.`)}</span></div>
      <div class="events"><div class="ev"><h4>${tr("기간 내 결혼 신호 비교", "Marriage signals within the period")}</h4><ul>${yl(marriages)}</ul></div><div class="ev"><h4>${tr("기간 내 자녀 신호 비교", "Family signals within the period")}</h4><ul>${yl(children)}</ul></div><div class="ev"><h4>${tr("금전 점수가 상대적으로 높은 해", "Relatively higher money scores")}</h4><ul>${yl(r.events.moneyYears)}</ul></div></div></section>
    <section class="box card"><div class="box-head"><h3>${tr(`${r.events.bestYear}년 결혼 날짜 참고`, `Wedding date references for ${r.events.bestYear}`)}</h3><span class="muted">${tr("두 사람의 일지·띠와 충돌 없는 주말을 비교한 참고값입니다. 결혼 결과를 보장하지 않습니다.", "A comparison of weekends without a clash with either person's day or year branch. It does not guarantee marriage outcomes.")}</span></div>
      <div class="dates">${!marriages.some(it => it.y === r.events.bestYear) ? `<p class="muted">${tr('비교 기간에 추천할 만한 신호가 없습니다. 결혼 날짜를 추천하지 않습니다.', 'No signal stands out in the comparison period. Wedding dates are not suggested.')}</p>` : r.events.weddingDates.length ? r.events.weddingDates.map((d) => `<div class="date"><b>${d.label}</b><span><span class="hz">${hz(d.pillar)}</span>日 · ${d.lunar}</span></div>`).join('') : `<p class="muted">${tr(`${r.events.bestYear}년에 남아 있는 추천 날짜가 없습니다. 다음 연도의 일정은 새로 비교해야 합니다.`, `No suggested dates remain in ${r.events.bestYear}. Dates in the next year need a separate comparison.`)}</p>`}</div></section>`;
}

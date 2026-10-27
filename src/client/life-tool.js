// 평생 해설과 주요 시기 상세는 평생 운세에서만 로드한다.
import { STEM_EL, STEM_H, EL_H, pillarH as hz } from '../engine/core.js';
import { tr } from '../i18n/runtime.js';
import { term, elementName } from '../i18n/terms.js';
import { lifeEventsView } from './life-events-view.js';
import { chartColors, luckyBanner } from './lucky-colors.js';
import { chartColorPalettes } from '../domain/lucky-colors.js';
export { lifetime } from '../engine/lifetime.js';

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
  const marks = list.map((d, i) => `<circle class="pt${d.current ? ' cur' : ''}" cx="${x(i).toFixed(1)}" cy="${y(d.score).toFixed(1)}" r="${d.current ? 6 : 4.5}"></circle><text class="v" x="${x(i).toFixed(1)}" y="${(y(d.score) - 10).toFixed(1)}" text-anchor="middle">${d.score}</text><text class="hzt" x="${x(i).toFixed(1)}" y="${H - 24}" text-anchor="middle">${hz(d)}</text><text x="${x(i).toFixed(1)}" y="${H - 8}" text-anchor="middle">${tr(`${d.age}세`, `Age ${d.age}`)}</text>`).join('');
  return `<div class="scroll-x"><svg class="chart-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${tr("대운별 점수", "Scores by ten-year luck cycle")}">${g}<polygon class="area" points="${area}"></polygon><polyline class="line" points="${pts}"></polyline>${marks}</svg></div>`;
}
export function lifeView(L, c, today) {
  const dm = L.dayMaster;
  const dlist = L.daeun.map((d) => `<div class="dcard${d.current ? ' cur' : ''}"><span class="muted">${tr(`${d.age}세 · ${d.startYear}년~`, `Age ${d.age} · ${d.startYear} onward`)}</span><b>${hz(d)}${tr(" 대운", " cycle")}</b><span>${term(d.tgS)}·${term(d.tgB)} · ${d.keyword}</span><span class="muted">${tr(`${d.score}${tr("점", " pts")} · ${d.best} 강세`, `${d.score} points · strength: ${d.best}`)}</span></div>`).join('');
  const yong = L.roles.yong;
  return `<div class="life">
    <div class="reading-overview wide" data-result-summary>
    <section class="box card wide"><div class="dm-hero"><span class="char el-${STEM_EL[c.dm]}">${STEM_H[c.dm]}</span><div><h3>${dm.title}<small>${dm.image}</small></h3></div></div><p>${dm.summary}</p>
      <div class="pros"><div><h4>${tr("타고난 강점", "Natural strengths")}</h4><ul>${dm.strengths.map((s) => `<li>${s}</li>`).join('')}</ul></div><div><h4>${tr("다듬을 점", "Room to grow")}</h4><ul>${dm.weaknesses.map((s) => `<li>${s}</li>`).join('')}</ul></div></div><p class="muted">${dm.advice}</p></section>
    ${chartColors(c)}${luckyBanner(chartColorPalettes(c))}</div>
    <section class="box card"><h3>${tr("오행의 균형", "Element balance")}</h3><p>${L.strength.text}</p>${L.elements.excess.map((t) => `<p>${t}</p>`).join('')}${L.elements.lack.map((t) => `<p>${t}</p>`).join('')}<p>${tr("운을 끌어올리는 용신은 ", "Your useful element: ")}<a href="/saju/ohaeng/${['wood', 'fire', 'earth', 'metal', 'water'][yong]}/"><b>${elementName(yong)}(${EL_H[yong]})</b></a>${tr("입니다.", ".")}</p></section>
    <section class="box card"><h3>${tr("성향과 적성", "Personality & interests")}</h3><p>${L.persona}</p><p><b>${tr("맞는 일:", "Suggested work:")}</b> ${L.career.jobs}</p><p><b>${tr("용신 업종:", "Fields linked to your useful element:")}</b> ${L.career.industry}</p><p class="muted">${L.career.note}</p></section>
    <section class="box card"><h3>${tr("재물운", "Wealth")}</h3>${L.wealth.map((t) => `<p>${t}</p>`).join('')}</section>
    <section class="box card"><h3>${tr("애정·결혼운", "Love & marriage")}</h3>${L.love.map((t) => `<p>${t}</p>`).join('')}</section>
    <section class="box card"><h3>${tr("건강", "Wellbeing")}</h3>${L.health.map((t) => `<p>${t}</p>`).join('')}</section>
    <section class="box card"><h3>${tr("인생의 리듬", "Life rhythm")}</h3><p>${tr("대운은 10년 단위의 전통 해석입니다. 점수는 이 서비스의 비교 기준이며 중요한 결정을 내릴 시기나 결과를 보장하지 않습니다. 빨간 점이 지금의 대운입니다.", "Ten-year luck cycles are a traditional interpretation. Scores are comparisons within this service and do not determine when to make major decisions or guarantee outcomes. The red dot marks the current cycle.")}</p></section>
    <section class="box card wide"><div class="box-head"><h3>${tr("대운 흐름", "Ten-year luck cycles")}</h3><span class="muted">${tr("10년 단위 · 만 나이", "Ten-year periods · age in years")}</span></div>${daeunChart(L.daeun)}<div class="daeun-list">${dlist}</div></section>
    ${lifeEventsView(L.events, c, today)}
  </div>`;
}

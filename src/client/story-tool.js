// 캐릭터 결과와 도감은 캐릭터 도구에서만 로드한다.
import { tr } from '../i18n/runtime.js';
import { esc, characterImg } from '../site/util.js';
import { storyDeck } from './story-view.js';
export { lifeStory } from '../engine/story.js';

/* ── 사주로 본 내 인생 ───────────────────────────── */
function arcChart(stages) {
  // 아홉 구간도 휴대폰에서 읽히도록 좁은 좌표계(글자 13단위 ≈ 화면 11px)를 쓴다.
  const W = 380, H = 168, L = 36, R = 16, Tp = 28, B = 30;
  const iw = W - L - R, ih = H - Tp - B;
  const x = (i) => L + (iw * i) / (stages.length - 1);
  const y = (v) => Tp + ih * (1 - (Math.max(20, Math.min(90, v)) - 20) / 70);
  const pts = stages.map((s, i) => `${x(i)},${y(s.score).toFixed(1)}`).join(' ');
  return `<svg class="chart-svg arc" viewBox="0 0 ${W} ${H}" role="img" aria-label="${tr("인생 곡선:", "Life arc:")} ${stages.map((s) => `${s.label} ${s.score}${tr("점", " pts")}`).join(', ')}">
    <line class="grid" x1="${L}" x2="${W - R}" y1="${y(60)}" y2="${y(60)}"></line><text class="axis" x="2" y="${y(60) + 4}">60${tr("점", " pts")}</text>
    <polyline class="line" points="${pts}"></polyline>
    ${stages.map((s, i) => `<circle class="pt${s.now ? ' cur' : ''}" cx="${x(i)}" cy="${y(s.score).toFixed(1)}" r="5"></circle><text class="v" x="${x(i)}" y="${(y(s.score) - 10).toFixed(1)}" text-anchor="middle">${s.score}</text><text x="${x(i)}" y="${H - 9}" text-anchor="middle">${s.label}</text>`).join('')}
  </svg>`;
}
export function storyView(st, c) {
  return `<section class="report-head card story-head"><div class="arc-badge" aria-hidden="true">${characterImg((st.stages.find((s) => s.now) || st.stages[0]).character.portrait, '', { thumb: true, sizes: '96px', size: 96 })}</div><div class="report-text"><div class="when"><span>${tr(`사주로 본 ${esc(c.name || "나")}의 인생은`, `${esc(c.name || "Your life")} through saju`)}</span></div><h2>${esc(st.arc.name)}</h2><p>${esc(st.arc.desc)}</p></div></section>
    <section class="box card"><div class="box-head"><h3>${tr("인생 곡선", "Your life arc")}</h3><span class="muted">${tr(`빨간 점 = 지금 시기 (만 ${st.nowAge}세)`, `Red dot = current chapter (age ${st.nowAge})`)}</span></div>${arcChart(st.stages)}</section>
    ${storyDeck(st)}`;
}

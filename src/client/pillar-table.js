import { STEM_H, STEM_K, BR_H, BR_K, STEM_EL, BR_EL, TG, TG_SLUG } from '../engine/core.js';
import { TIPS } from '../content/tips.js';
const tg = (name) => TG.includes(name) ? `<a href="/saju/sipsin/${TG_SLUG[TG.indexOf(name)]}/">${name}</a>` : name;
const char = (hanja, label, el) => `<span class="char el-${el}">${hanja}<small>${label}</small></span>`;

export function pillarTable(chart, tip) {
  const cols = chart.cols.slice().reverse();
  if (!chart.hasTime) cols.unshift({ pos: 'hour', label: '시주', unknown: true });
  const rows = [
    ['십신', TIPS.sipsin, '십신 설명', (c) => `<span class="tg">${tg(c.tgS)}</span>`],
    ['천간', TIPS.stem, '천간 설명', (c) => char(STEM_H[c.s], STEM_K[c.s], STEM_EL[c.s])],
    ['지지', TIPS.branch, '지지 설명', (c) => char(BR_H[c.b], BR_K[c.b], BR_EL[c.b])],
    ['십신', null, '', (c) => `<span class="tg">${tg(c.tgB)}</span>`],
    ['지장간', TIPS.hidden, '지장간 설명', (c) => `<span class="hidden-stems">${c.hidden.map((s) => STEM_H[s]).join(' ')}</span>`],
    ['12운성', TIPS.stage, '12운성 설명', (c) => `<span class="stage">${c.stage}</span>`],
  ];
  return `<div class="pillar-table-wrap"><table class="pillar-table" aria-label="사주 원국의 년월일시주"><thead><tr><th scope="col">구분</th>${cols.map((c) => `<th scope="col"${c.pos === 'day' ? ' class="is-day"' : ''}>${c.label}${c.pos === 'day' ? '<em>나</em>' : ''}</th>`).join('')}</tr></thead><tbody>${rows.map(([label, info, title, render], i) => `<tr><th scope="row"><span>${label}${info ? tip(info, title) : ''}</span></th>${cols.map((c) => `<td${c.pos === 'day' ? ' class="is-day"' : ''}>${c.unknown ? `<span class="muted">${i === 0 ? '시간 모름' : '—'}</span>` : render(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

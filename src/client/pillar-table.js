import { STEM_H, BR_H, STEM_EL, BR_EL, TG, TG_SLUG } from '../engine/core.js';
import { tr } from '../i18n/runtime.js';
import { term, stemName, branchName } from '../i18n/terms.js';
import { TIPS } from '../content/tips.js';
const tg = (name) => TG.includes(name) ? `<a href="/saju/sipsin/${TG_SLUG[TG.indexOf(name)]}/">${term(name)}</a>` : term(name);
const char = (hanja, label, el) => `<span class="char el-${el}">${hanja}<small>${label}</small></span>`;

export function pillarTable(chart, tip) {
  const cols = chart.cols.slice().reverse();
  if (!chart.hasTime) cols.unshift({ pos: 'hour', label: '시주', unknown: true });
  const rows = [
    [tr('십신', 'Ten Gods'), TIPS.sipsin, tr('십신 설명', 'Ten Gods explained'), (c) => `<span class="tg">${tg(c.tgS)}</span>`],
    [tr('천간', 'Heavenly stem'), TIPS.stem, tr('천간 설명', 'Heavenly stems explained'), (c) => char(STEM_H[c.s], stemName(c.s), STEM_EL[c.s])],
    [tr('지지', 'Earthly branch'), TIPS.branch, tr('지지 설명', 'Earthly branches explained'), (c) => char(BR_H[c.b], branchName(c.b), BR_EL[c.b])],
    [tr('십신', 'Ten Gods'), null, '', (c) => `<span class="tg">${tg(c.tgB)}</span>`],
    [tr('지장간', 'Hidden stems'), TIPS.hidden, tr('지장간 설명', 'Hidden stems explained'), (c) => `<span class="hidden-stems">${c.hidden.map((s) => STEM_H[s]).join(' ')}</span>`],
    [tr('12운성', 'Life stage'), TIPS.stage, tr('12운성 설명', 'Twelve life stages explained'), (c) => `<span class="stage">${term(c.stage)}</span>`],
  ];
  return `<div class="pillar-table-wrap"><table class="pillar-table" aria-label="${tr("사주 원국의 년월일시주", "Year, month, day and hour pillars")}"><thead><tr><th scope="col">${tr("구분", "Type")}</th>${cols.map((c) => `<th scope="col"${c.pos === 'day' ? ' class="is-day"' : ''}>${term(c.label)}${c.pos === 'day' ? tr('<em>나</em>', '<em>You</em>') : ''}</th>`).join('')}</tr></thead><tbody>${rows.map(([label, info, title, render], i) => `<tr><th scope="row"><span>${label}${info ? tip(info, title) : ''}</span></th>${cols.map((c) => `<td${c.pos === 'day' ? ' class="is-day"' : ''}>${c.unknown ? `<span class="muted">${i === 0 ? tr('시간 모름', 'Unknown time') : '—'}</span>` : render(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

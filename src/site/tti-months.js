import { esc } from './util.js';
import { tr } from '../i18n/runtime.js';
import { term } from '../i18n/terms.js';
export const ttiMonthCards = (months) => months.map((m) => `<article class="card"><header><h3>${tr(`${m.m}월`, `Month ${m.m}`)}</h3><b class="num">${tr(`${m.score}점`, `${m.score} points`)}</b></header><p>${esc(m.text)}</p><details class="tti-reading-basis"><summary>${tr('해석 근거', 'Reading basis')}</summary><p class="hint">${m.pillarText}${tr('월', '')} · ${term(m.rel)}</p></details></article>`).join('');

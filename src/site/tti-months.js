import { esc } from './util.js';
export const ttiMonthCards = (months) => months.map((m) => `<article class="card"><header><h3>${m.m}월</h3><b class="num">${m.score}점</b></header><span class="hint">${m.pillarText}월 · ${m.rel}</span><p>${esc(m.text)}</p></article>`).join('');

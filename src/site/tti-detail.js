import { ttiDay, ttiDayDetails, ANIMAL_SLUG, fmtDate } from '../engine/index.js';
import { esc } from './util.js';
import { animalIcon } from './icons.js';
export function ttiDailyDetail(t, o, word = '오늘') {
  const r = ttiDay(t, o), details = ttiDayDetails(t, o);
  return `<div class="tti-detail-head">${animalIcon(t)}<div><p class="eyebrow">${fmtDate(o)} · 띠별 ${word}의 운세</p><h2 id="tti-detail-title-${ANIMAL_SLUG[t]}">${r.animal}띠의 ${word} · ${r.score}점</h2></div></div><p>${esc(r.text)}</p><div class="chips"><span class="chip">행운의 색 ${r.color}</span><span class="chip">행운의 숫자 ${r.number}</span></div><div class="tti-factors">${details.map((d) => `<section><h3>${d.label.replace('오늘', word)}</h3><p>${esc(d.text)}</p><small>점수 기여 ${d.value > 0 ? '+' : ''}${d.value.toFixed(1)}</small></section>`).join('')}</div><p class="hint">같은 띠는 같은 결과를 봅니다. 개인의 생년월일과 시진은 반영하지 않은 재미용 해석입니다.</p><a class="btn" href="/today/">내 사주로 오늘의 운세 보기</a>`;
}

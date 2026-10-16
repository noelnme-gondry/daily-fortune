import { siteText, siteValue } from './copy.js';
import { ttiDay, ttiDayDetails, ANIMAL_SLUG, fmtDate } from '../engine/index.js';
import { esc } from './util.js';
import { animalIcon } from './icons.js';
export function ttiDailyDetail(t, o, word = siteText('오늘')) {
  const r = ttiDay(t, o), details = ttiDayDetails(t, o);
  return `<div class="tti-detail-head">${animalIcon(t)}<div><p class="eyebrow">${fmtDate(o)}${siteText(" · 띠별 ")}${word}${siteText("의 운세")}</p><h2 id="tti-detail-title-${ANIMAL_SLUG[t]}">${siteValue(r.animal)}${siteText("띠의 ")}${word} · ${r.score}${siteText("점")}</h2></div></div><p>${esc(r.text)}</p><div class="chips"><span class="chip">${siteText("행운의 색 ")}${r.color}</span><span class="chip">${siteText("행운의 숫자 ")}${r.number}</span></div><div class="tti-factors">${details.map((d) => `<section><h3>${d.label.replace(siteText('오늘'), word)}</h3><p>${esc(d.text)}</p><small>${siteText("점수 기여 ")}${d.value > 0 ? '+' : ''}${d.value.toFixed(1)}</small></section>`).join('')}</div><p class="hint">${siteText("기본 60점에 위 요인을 더한 점수입니다. 같은 띠는 같은 결과를 보며, 개인의 생년월일시는 반영하지 않은 재미용 해석입니다.")}</p><a class="btn" href="/today/">${siteText("내 사주로 오늘의 운세 보기")}</a>`;
}

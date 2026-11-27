import { siteText, siteValue } from './copy.js';
import { ttiDay, ttiDayDetails, ANIMAL_SLUG, BR_K, BR_H, BR_EL, EL_K, dayPillar, pillarKo, pillarLabel, josa, fmtDate, isoDate } from '../engine/index.js';
import { zodiacDayDetail } from '../domain/zodiac-day-detail.js';
import { term } from '../i18n/terms.js';
import T from '../content/text.js';
import { esc } from './util.js';
import { animalIcon } from './icons.js';
import { tr } from '../i18n/runtime.js';
function personalAreaLabel(key) {
  return tr(`내 ${T.catName[key]}부터 보기`, `Start with my ${T.catName[key]}`);
}

export function zodiacPersonalLinks(reading, date, period) {
  const tomorrow = period === 'tomorrow';
  const stamp = isoDate(date);
  const href = '/' + period + '/?zodiac_date=' + stamp + '&amp;zodiac_area=' + reading.focus;
  const data = `data-zodiac-handoff="${reading.focus}" data-reading-period="${period}" data-reading-date-iso="${stamp}"`;
  return `<nav class="tti-personal-next" data-default-area="${reading.focus}" aria-label="${tomorrow ? tr('개인 내일 운세', 'Personal fortune for tomorrow') : tr('개인 오늘 운세', 'Personal fortune for today')}">
    <a class="btn" ${data} data-reading-target="overview" href="${href}#reading-summary">${tomorrow ? tr('내 생일로 내일 운세 전체 보기', 'Read my full fortune for tomorrow') : tr('내 생일로 오늘 운세 전체 보기', 'Read my full fortune for today')}</a>
    <a class="sbtn" ${data} data-reading-target="area" href="${href}#reading-${reading.focus}">${personalAreaLabel(reading.focus)}</a>
  </nav>`;
}

function dayInterpretation(reading, date) {
  const day = dayPillar(date);
  const field = T.catName[reading.focus];
  const sign = reading.tti;
  if (reading.rel === '없음') {
    return tr(
      `${pillarKo(day)}일에는 ${reading.animal}띠와 뚜렷한 합충이 없어요. 띠의 오행(${EL_K[BR_EL[sign]]})과 이날의 오행을 함께 살펴 ${josa(field, '을/를')} 먼저 읽어요.`,
      `On this ${pillarLabel(day)} day, ${reading.animal} has no major branch relationship. The interaction of the sign’s ${term(EL_K[BR_EL[sign]]).toLowerCase()} element with the day brings ${field.toLowerCase()} into focus.`
    );
  }
  if (reading.rel === '같음') return tr(
    `${pillarKo(day)}일은 ${reading.animal}띠와 같은 지지 ${josa(`${BR_K[sign]}(${BR_H[sign]})`, '을/를')} 쓰는 날이에요. 익숙한 사람을 대하는 내 모습에 주목해 대인운을 먼저 읽어요.`,
    `This ${pillarLabel(day)} day shares its branch with ${reading.animal}. The relationship reading looks at familiar patterns between people.`
  );
  const signBranch = `${BR_K[sign]}(${BR_H[sign]})`;
  const dayBranch = `${BR_K[day.b]}(${BR_H[day.b]})`;
  return tr(
    `${reading.animal}띠의 ${josa(signBranch, '과/와')} ${pillarKo(day)}일의 ${josa(dayBranch, '은/는')} ${reading.rel} 관계예요. 이 관계를 바탕으로 ${josa(field, '을/를')} 먼저 읽어요.`,
    `The ${reading.animal} branch and this ${pillarLabel(day)} day form a ${term(reading.rel).toLowerCase()} relationship. This puts ${field.toLowerCase()} at the center of the reading.`
  );
}

export function ttiDailyDetail(t, o, period = 'today', { preview = false } = {}) {
  const word = period === 'tomorrow' ? siteText('내일') : siteText('오늘');
  const r = ttiDay(t, o), details = ttiDayDetails(t, o);
  const { story, areas } = zodiacDayDetail(r);
  const id = (key) => `zodiac-${ANIMAL_SLUG[t]}-${key}`;
  const fieldTitle = tr('분야별 운세', 'Fortune by area');
  const header = preview ? `<div class="tti-detail-head">${animalIcon(t)}<div><p class="eyebrow">${fmtDate(o)}${siteText(" · 띠별 ")}${word}${siteText("의 운세")}</p><h2 id="tti-detail-title-${ANIMAL_SLUG[t]}">${siteValue(r.animal)}${siteText("띠의 ")}${word} · ${r.score}${siteText("점")}</h2></div></div>
    <h3 class="tti-reading-headline">${esc(r.headline)}</h3>`
    : `<h2 class="tti-reading-headline" id="tti-detail-title-${ANIMAL_SLUG[t]}">${esc(r.headline)}</h2>`;
  return `${header}
    <p class="tti-story">${esc(story)}</p>
    <p class="tti-day-context">${esc(dayInterpretation(r, o))}</p>
    ${preview ? '' : `<section class="tti-daily-fields" aria-labelledby="${id('areas')}">
      <h3 id="${id('areas')}">${fieldTitle}</h3>
      <nav class="chips" aria-label="${tr('읽고 싶은 분야', 'Jump to a reading')}">${areas.map(({ key }) => `<a class="chip" data-zodiac-area="${key}" data-personal-label="${esc(personalAreaLabel(key))}" href="#${id(key)}">${T.catName[key]}</a>`).join('')}</nav>
      ${areas.map(({ key, text }) => `<section class="tti-daily-field" aria-labelledby="${id(key)}"><h4 id="${id(key)}" tabindex="-1">${T.catName[key]}</h4><p>${esc(text)}</p></section>`).join('')}
    </section>`}
    <div class="chips"><span class="chip">${siteText("행운의 색 ")}${r.color}</span><span class="chip">${siteText("행운의 숫자 ")}${r.number}</span></div>
    <section class="tti-reading-basis"><h3>${tr('점수와 해석의 근거 보기', 'How the score and reading were derived')}</h3><div class="tti-factors">${details.map((d) => `<section><h3>${d.label.replace(siteText('오늘'), word)}</h3><p>${esc(d.text)}</p><small>${siteText("점수 기여 ")}${d.value > 0 ? '+' : ''}${d.value.toFixed(1)}</small></section>`).join('')}</div><p class="hint">${siteText("기본 60점에 위 요인을 더한 점수입니다. 같은 띠는 같은 결과를 보며, 개인의 생년월일시는 반영하지 않은 재미용 해석입니다.")}</p></section>
    ${preview && period === "today" ? `<a class="btn" href="/today/">${siteText("내 사주로 오늘의 운세 보기")}</a>` : ""}`;
}

import { esc } from '../site/util.js';
import { TOJEONG } from '../content/tojeong.js';
import { tr } from '../i18n/runtime.js';

const date = (d) => `${d.y}.${d.m}.${d.d}`;
function paragraphs(text) {
  const sentences = text.split(/(?<=[.!?])\s+/), groups = [];
  for (let i = 0; i < sentences.length; i += 3) groups.push(`<p>${esc(sentences.slice(i, i + 3).join(' '))}</p>`);
  return groups.join('');
}

export function tojeongView(result, reading, name = '') {
  const r = result, v = r.values, l = r.birth.lunar;
  if (!reading?.chongun || !Array.from({ length: 12 }, (_, i) => reading.months?.[i + 1]).every(Boolean)) throw new Error(tr('토정비결 해설이 누락되었습니다.', 'The Tojeong reading is incomplete.'));
  const adjustments = [
    r.normalizedLeap ? tr('윤달 생일을 같은 월의 평달로 계산했습니다.', 'Your leap-month birthday was treated as the regular month with the same number.') : '',
    r.adjustedDay ? tr(`보는 해의 음력 ${l.m}월은 29일까지 있어 생일 ${l.d}일을 29일로 계산했습니다.`, `Lunar month ${l.m} has only 29 days in the target year, so birthday day ${l.d} was calculated as day 29.`) : '',
  ].filter(Boolean);
  return `<header class="card box tojeong-summary"><p class="eyebrow">${tr(`${r.targetYear}년 · 144괘 중 나의 괘`, `${r.targetYear} · Your reading from 144 combinations`)}</p>
    <div class="tojeong-heading"><span class="tojeong-code" aria-label="${tr(`괘 번호 ${r.code}`, `Reading number ${r.code}`)}">${r.code}</span><div><h2>${tr(`${esc(name || '나')}의 토정비결`, name ? `${esc(name)}’s Tojeong reading` : 'Your Tojeong reading')}</h2><p>${tr(`상괘 ${r.upper} · 중괘 ${r.middle} · 하괘 ${r.lower}`, `Upper ${r.upper} · Middle ${r.middle} · Lower ${r.lower}`)}</p></div></div>
    <p class="muted">${tr(`음력 ${l.y}년 ${l.leap ? '윤' : ''}${l.m}월 ${l.d}일생 · 세는나이 ${v.age}세`, `Lunar birth date: ${l.y}, ${l.leap ? 'leap ' : ''}month ${l.m}, day ${l.d} · Traditional counting age: ${v.age}`)}</p>
    <p class="hint">${tr(`풀이 기간: 양력 ${date(r.period.start)}~${date(r.period.end)}<br>설날부터 다음 설날 전날까지, 월별 풀이는 음력 기준입니다.`, `Reading period: ${date(r.period.start)}–${date(r.period.end)} (solar calendar)<br>From Lunar New Year to the day before the next. Monthly readings follow the lunar calendar.`)}</p>
    ${adjustments.length ? `<div class="note">${adjustments.map((t) => `<p>${esc(t)}</p>`).join('')}<p>${tr('이 사이트의 날짜 처리 기준이며 다른 판본과 결과가 달라질 수 있습니다.', 'These are this site’s date conventions. Other editions may give a different result.')}</p></div>` : ''}
  </header>
  <section class="card box tojeong-reading"><h2>${tr('한 해의 총운', 'Your annual outlook')}</h2><p class="hint">${esc(TOJEONG.readingNote)}</p><div class="prose">${paragraphs(reading.chongun)}</div></section>
  <section class="card box"><div><h2>${tr('음력 열두 달의 흐름', 'The twelve lunar months')}</h2><p class="hint">${tr('달을 누르면 상세 풀이가 아래에 나타납니다. 윤달은 같은 월의 풀이를 읽습니다.', 'Select a month to read its interpretation below. A leap month uses the reading for the regular month with the same number.')}</p></div>
    <div class="tojeong-months" role="group" aria-label="${tr('음력 월 선택', 'Select a lunar month')}">${Array.from({ length: 12 }, (_, i) => `<button type="button" id="tj-month-button-${i + 1}" data-tojeong-month="${i + 1}" aria-controls="tj-month-${i + 1}" aria-pressed="${i === 0}"><span>${tr('음력', 'Lunar')}</span><b>${tr(`${i + 1}월`, `${i + 1}`)}</b></button>`).join('')}</div>
    <div class="tojeong-month-detail">${Array.from({ length: 12 }, (_, i) => `<section id="tj-month-${i + 1}" role="region" aria-labelledby="tj-month-button-${i + 1}"${i ? ' hidden' : ''}><h3>${tr(`음력 ${i + 1}월 풀이`, `Lunar month ${i + 1}`)}</h3><div class="prose">${paragraphs(reading.months[i + 1])}</div></section>`).join('')}</div>
  </section>
  <section class="card box"><h2>${tr('내 괘가 나온 과정', 'How your reading was calculated')}</h2><dl class="tojeong-calculation">
    <div><dt>${tr(`상괘 ${r.upper}`, `Upper ${r.upper}`)}</dt><dd>${tr(`(세는나이 ${v.age} + 태세수 ${v.taese}) ÷ 8의 나머지`, `Remainder of (counting age ${v.age} + year value ${v.taese}) ÷ 8`)}</dd><dd>${tr(`${esc(r.ganji.year)}년 · 나머지 0이면 8`, `${esc(r.ganji.year)} year · A remainder of 0 becomes 8`)}</dd></div>
    <div><dt>${tr(`중괘 ${r.middle}`, `Middle ${r.middle}`)}</dt><dd>${tr(`(음력 ${l.m}월 날수 ${v.monthDays} + 월건수 ${v.wolgeon}) ÷ 6의 나머지`, `Remainder of (${v.monthDays} days in lunar month ${l.m} + month value ${v.wolgeon}) ÷ 6`)}</dd><dd>${tr(`${esc(r.ganji.month)}월 · 나머지 0이면 6`, `${esc(r.ganji.month)} month · A remainder of 0 becomes 6`)}</dd></div>
    <div><dt>${tr(`하괘 ${r.lower}`, `Lower ${r.lower}`)}</dt><dd>${tr(`(음력 생일 ${v.birthDay} + 일진수 ${v.iljin}) ÷ 3의 나머지`, `Remainder of (lunar birthday ${v.birthDay} + day value ${v.iljin}) ÷ 3`)}</dd><dd>${tr(`${esc(r.ganji.day)}일 · 나머지 0이면 3`, `${esc(r.ganji.day)} day · A remainder of 0 becomes 3`)}</dd></div>
  </dl><p class="hint">${tr('음력 월의 간지로 계산하며 사주의 절기 월주를 사용하지 않습니다.', 'This uses the stem–branch designation of the lunar month, rather than Saju’s solar-term month pillar.')}</p></section>
  <p class="hint">${tr('해설:', 'Reading source:')} <a href="${TOJEONG.source}" target="_blank" rel="noopener">molpass/mcp-tojeong</a> · © 2026 Lee, JungHoon · <a href="/licenses/mcp-tojeong.txt">${tr('MIT 라이선스', 'MIT license')}</a></p>`;
}

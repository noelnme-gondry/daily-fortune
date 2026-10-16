import { FREE_ACCESS, SITE } from '../../content/pages.js';
import { TOJEONG } from '../../content/tojeong.js';
import { TOJEONG_RANGE, tojeongYearTable } from '../../domain/tojeong.js';
import { esc, faqBlock, faqLd, disclosure } from '../util.js';
import { hero } from './tools.js';
import { yearGuide } from '../year-guide.js';
import { isEnglish, tr } from '../../i18n/runtime.js';

function birthForm(ctx) {
  const years = Array.from({ length: Math.min(ctx.today.y, TOJEONG_RANGE.max) - TOJEONG_RANGE.min + 1 }, (_, i) => Math.min(ctx.today.y, TOJEONG_RANGE.max) - i);
  const options = (values, selected, suffix) => values.map((n) => `<option value="${n}"${n === selected ? ' selected' : ''}>${n}${suffix}</option>`).join('');
  return `<form class="pform card" id="tojeong-form" novalidate>
    <h2 class="form-title">${tr('내 토정비결 보기', 'Get your Tojeong reading')}</h2>
    <p class="hint">${tr('태어난 시간과 성별은 필요하지 않습니다.', 'Birth time and gender are not needed.')}</p>
    <div class="field"><label for="tj-name">${tr('이름 (선택)', 'Name (optional)')}</label><input class="input" id="tj-name" maxlength="12" autocomplete="off" placeholder="${tr('결과에 표시할 이름', 'Name to show on your result')}"></div>
    <fieldset class="field"><legend>${tr('생일 달력', 'Birth-date calendar')}</legend><div class="seg"><label><input type="radio" name="tj-calendar" value="solar" checked><span>${tr('양력', 'Solar')}</span></label><label><input type="radio" name="tj-calendar" value="lunar"><span>${tr('음력', 'Lunar')}</span></label></div></fieldset>
    <fieldset class="field"><legend>${tr('생년월일', 'Birth date')}</legend><div class="ymd">
      <select class="input" id="tj-y" aria-label="${tr('태어난 해', 'Birth year')}">${options(years, 1990, tr('년', ''))}</select>
      <select class="input" id="tj-m" aria-label="${tr('태어난 달', 'Birth month')}">${options(Array.from({ length: 12 }, (_, i) => i + 1), 1, tr('월', ''))}</select>
      <select class="input" id="tj-d" aria-label="${tr('태어난 날', 'Birth day')}">${options(Array.from({ length: 31 }, (_, i) => i + 1), 1, tr('일', ''))}</select>
    </div><label class="check"><input type="checkbox" id="tj-leap" disabled> ${tr('음력 윤달에 태어났어요', 'I was born in a lunar leap month')}</label></fieldset>
    <div class="form-actions"><button class="btn" type="submit">${tr('무료 토정비결 보기', 'See my free Tojeong reading')}</button></div>
    <p class="form-error" role="alert" id="tj-error" hidden></p>
    <div class="storage-options"><label class="check"><input type="checkbox" id="tj-save"> ${tr('이 기기에 저장', 'Save on this device')}</label><button class="link-btn" type="button" data-tojeong-delete>${tr('저장된 토정비결 정보 삭제', 'Delete saved Tojeong information')}</button><p class="hint" id="tj-storage-status" role="status">${tr('생일은 서버로 보내지 않습니다. 저장을 선택하면 이 기기에 보관합니다.', 'Your birth date is not sent to a server. If you choose to save it, it stays on this device.')}</p></div>
  </form>`;
}

const KO = Object.fromEntries([...'甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥'].map((h, i) => [h, '갑을병정무기경신임계자축인묘진사오미신유술해'[i]]));
const ko = (ganji) => tr([...ganji].map((h) => KO[h]).join(''), ganji);
const ymd = (d) => tr(`${d.y}년 ${d.m}월 ${d.d}일`, `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`);
// 올해는 /tojeong/, 내년은 /tojeong/{내년}/ 한 주소만 둔다(올해 연도 주소는 /tojeong/으로 301).
export const tojeongPath = (ctx, y) => (y === ctx.today.y ? '/tojeong/' : `/tojeong/${y}/`);

// 연도마다 다른 작괘 기준표: 검색에 노출되는 해마다 고유한 내용이자 결과를 검산하는 표
function yearTable(y) {
  const t = tojeongYearTable(y);
  return `<section class="card box tojeong-year-table" aria-labelledby="tj-table-h">
    <h2 id="tj-table-h">${tr(`${y}년 토정비결 작괘 기준표`, `${y} Tojeong calculation reference`)}</h2>
    <p>${tr(`${y}년은 음력 <b>${ko(t.ganji)}(${t.ganji})년</b>으로 태세수는 <b>${t.taese}</b>입니다. 풀이 기간은 양력 ${ymd(t.period.start)}부터 ${ymd(t.period.end)}까지입니다.`, `The lunar year ${y} is <b>${t.ganji}</b>, with a year value of <b>${t.taese}</b>. The reading covers ${ymd(t.period.start)} to ${ymd(t.period.end)} in the solar calendar.`)}</p>
    <h3>${tr('음력 생월로 정해지는 중괘', 'Middle number by lunar birth month')}</h3>
    <div class="scroll-x"><table class="tj-table">
      <thead><tr><th scope="col">${tr('음력 생월', 'Lunar birth month')}</th><th scope="col">${tr('그 달 간지', 'Month stem–branch')}</th><th scope="col">${tr('날수', 'Days')}</th><th scope="col">${tr('월건수', 'Month value')}</th><th scope="col">${tr('중괘', 'Middle')}</th></tr></thead>
      <tbody>${t.months.map((m) => `<tr><th scope="row">${tr(`${m.m}월`, `Month ${m.m}`)}</th><td>${isEnglish() ? m.ganji : `${ko(m.ganji)} <small>${m.ganji}</small>`}</td><td>${tr(`${m.days}일`, `${m.days} days`)} <small>${m.days === 30 ? tr('큰달', 'long month') : tr('작은달', 'short month')}</small></td><td>${m.wolgeon}</td><td><b>${m.middle}</b></td></tr>`).join('')}</tbody>
    </table></div>
    <h3>${tr('음력 출생 연도로 정해지는 상괘', 'Upper number by lunar birth year')}</h3>
    <ul class="tj-uppers">${t.uppers.map((u) => `<li><b>${tr(`상괘 ${u.upper}`, `Upper ${u.upper}`)}</b><span>${tr(`${u.years.slice().reverse().join(' · ')}년생`, `Born in ${u.years.slice().reverse().join(' · ')}`)}</span></li>`).join('')}</ul>
    <p class="hint">${tr(`하괘는 음력 생일과 ${y}년 그 생일의 일진수로 정해져 날마다 다르므로 위 계산기에서 확인하세요. 윤달 생일은 같은 월의 평달로 봅니다.`, `The lower number depends on your lunar birthday and its day value in ${y}, so it varies by date. Use the calculator above to find it. Leap-month birthdays are treated as the regular month with the same number.`)}</p>
  </section>`;
}

export function tojeongPage(ctx, year) {
  const y = year ?? ctx.today.y, path = tojeongPath(ctx, y), next = y > ctx.today.y;
  const { ganji } = tojeongYearTable(y);
  const title = next ? tr(`${y}년 토정비결 — 내년 총운과 12개월 월별 풀이 미리 보기`, `${y} Tojeong — preview next year and all 12 lunar months`) : tr(`${y}년 ${TOJEONG.title}`, `${y} ${TOJEONG.title}`);
  const description = next
    ? tr(`${y}년 ${ko(ganji)}년 토정비결을 미리 확인하세요. 생년월일로 144괘 중 나의 괘를 구해 내년 총운과 음력 1~12월 풀이를 보여 드리고, ${y}년 작괘 기준표도 함께 싣습니다.`, `Preview your ${y} (${ganji}) Tojeong reading. Your birth date selects one of 144 readings with next year’s annual outlook and all 12 lunar months, alongside the ${y} calculation reference.`)
    : tr(`${y}년 ${ko(ganji)}년 ${TOJEONG.description}`, `${y} (${ganji}). ${TOJEONG.description}`);
  const faq = TOJEONG.faq;
  return {
    path, title, description, section: '/tojeong/', share: false,
    supplement: yearGuide(y, ctx, path),
    crumbs: next ? [[tr('무료 토정비결', 'Free Tojeong reading'), '/tojeong/'], [tr(`${y}년 토정비결`, `${y} Tojeong`), path]] : [[tr('무료 토정비결', 'Free Tojeong reading'), path]],
    ld: [faqLd(faq), { '@type': 'WebApplication', name: `${SITE.name} ${next ? tr(`${y}년 토정비결`, `${y} Tojeong`) : TOJEONG.h1}`, description, url: `${ctx.site}${path}`, applicationCategory: 'LifestyleApplication', operatingSystem: 'Web', inLanguage: tr('ko-KR', 'en'), isAccessibleForFree: true, offers: { '@type': 'Offer', price: FREE_ACCESS.price, priceCurrency: FREE_ACCESS.currency }, publisher: { '@id': `${ctx.site}/#org` } }],
    body: `${hero(next ? tr(`${y}년 토정비결`, `${y} Tojeong`) : TOJEONG.h1, TOJEONG.lead, FREE_ACCESS.summary)}
      <nav class="tojeong-years" aria-label="${tr('토정비결 연도 선택', 'Select a Tojeong year')}">${[ctx.today.y, ctx.today.y + 1].map((yr) => `<a class="btn ${yr === y ? '' : 'ghost'}" href="${tojeongPath(ctx, yr)}"${yr === y ? ' aria-current="page"' : ''}>${tr(`${yr}년`, `${yr}`)} · ${yr === ctx.today.y ? tr('올해', 'This year') : tr('내년', 'Next year')}</a>`).join('')}</nav>
      <section class="tojeong-layout" id="tojeong-tool" data-year="${y}" aria-label="${tr('토정비결 계산기', 'Tojeong calculator')}">
        ${birthForm(ctx)}
        <div id="tojeong-result" class="tojeong-result" aria-live="polite"><section class="card tojeong-empty"><p class="eyebrow">${tr(`${y}년의 이야기`, `Your story for ${y}`)}</p><h2>${tr('총운부터 열두 달의 흐름까지', 'An annual outlook and twelve lunar months')}</h2><p>${tr('내 생일로 상괘·중괘·하괘를 구하면, 나에게 해당하는 한 해의 풀이가 펼쳐집니다.', 'Your birth date determines the upper, middle, and lower numbers that select your reading for the year.')}</p><ul><li>${tr('한 해를 아우르는 총운', 'An outlook for the whole year')}</li><li>${tr('음력 1~12월의 기회와 주의할 점', 'Opportunities and cautions for lunar months 1–12')}</li><li>${tr('내 괘가 나온 계산 근거', 'The calculation behind your reading')}</li></ul><p class="hint">${esc(TOJEONG.readingNote)}</p><noscript><p>${tr('계산하려면 자바스크립트를 켜 주세요.', 'Enable JavaScript to calculate your reading.')}</p></noscript></section></div>
      </section>
      ${yearTable(y)}
      <div class="info-panels">${disclosure('tojeong-method', tr('토정비결 계산 방법', 'How Tojeong is calculated'), `<section class="prose"><h2>${tr('144괘는 어떻게 구하나요?', 'How are the 144 combinations calculated?')}</h2><ol><li>${tr('음력 출생 연도로 세는나이를 구하고 보는 해의 태세수를 더해 8로 나눈 나머지를 상괘로 씁니다.', 'Calculate traditional counting age from the lunar birth year, add the target year’s year value, and divide by 8. The remainder gives the upper number.')}</li><li>${tr('보는 해의 음력 생월 날수(29일 또는 30일)에 월건수를 더해 6으로 나눈 나머지를 중괘로 씁니다.', 'Add the month value to the number of days (29 or 30) in the lunar birth month of the target year, then divide by 6. The remainder gives the middle number.')}</li><li>${tr('음력 생일에 보는 해 해당 생일의 일진수를 더해 3으로 나눈 나머지를 하괘로 씁니다.', 'Add the day value for the birthday in the target year to the lunar birthday number, then divide by 3. The remainder gives the lower number.')}</li></ol><p>${tr('나머지가 0이면 각각 8·6·3으로 바꾸며, 조합은 8×6×3=144가지입니다.', 'A remainder of 0 becomes 8, 6, or 3 respectively. This gives 8 × 6 × 3 = 144 combinations.')}</p><p>${esc(TOJEONG.convention)}</p><p>${tr('계산법 출처:', 'Calculation reference:')} <a href="${TOJEONG.encyclopedia}" target="_blank" rel="noopener">${tr('한국민족문화대백과사전 · 토정비결', 'Encyclopedia of Korean Culture · Tojeong Bigyeol')}</a></p></section>`)}
      ${disclosure('tojeong-faq', tr('자주 묻는 질문', 'Frequently asked questions'), faqBlock(faq), 'help')}
      ${disclosure('tojeong-source', tr('해설 출처와 이용 안내', 'Reading source and usage notes'), `<section class="prose"><h2>${tr('이곳의 해설은 어디서 왔나요?', 'Where do these readings come from?')}</h2><p>${tr(`<a href="${TOJEONG.source}" target="_blank" rel="noopener">molpass/mcp-tojeong</a>의 MIT 공개 한글 해설 144괘를 사용합니다.`, `These are English translations of the 144 Korean readings published under the MIT license by <a href="${TOJEONG.source}" target="_blank" rel="noopener">molpass/mcp-tojeong</a>.`)} ${esc(TOJEONG.editionNote)}</p><p>${tr('계산식은 한국민족문화대백과사전의 설명을 확인하고 구현을 테스트했습니다. 이 검증은 해설의 원전 정확성이나 미래 예측력을 보증하지 않습니다. 외부 MCP 서버에 연결하지 않으며 생년월일은 브라우저 안에서 처리합니다.', 'We checked the calculation method against the Encyclopedia of Korean Culture and tested its implementation. This does not establish the historical accuracy or predictive ability of the interpretations. We do not connect to an external MCP server; your birth date is processed in your browser.')}</p><p>Copyright © 2026 Lee, JungHoon. <a href="/licenses/mcp-tojeong.txt">${tr('MIT 라이선스 전문', 'Full MIT license')}</a></p><p>${esc(TOJEONG.readingNote)} ${tr('이 계산기는 운세를 확률이나 100점 점수로 바꾸지 않습니다.', 'This calculator does not convert fortune into probabilities or scores out of 100.')}</p><p>${tr(`<a href="/year/">사주로 보는 무료 신년운세</a>도 함께 살펴보세요.`, `You can also explore your <a href="/year/">free Saju annual reading</a>.`)}</p></section>`)}</div>`,
  };
}

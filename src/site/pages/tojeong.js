import { FREE_ACCESS } from '../../content/pages.js';
import { TOJEONG } from '../../content/tojeong.js';
import { TOJEONG_RANGE } from '../../domain/tojeong.js';
import { esc, faqBlock, faqLd, disclosure } from '../util.js';
import { hero } from './tools.js';

function birthForm(ctx) {
  const years = Array.from({ length: Math.min(ctx.today.y, TOJEONG_RANGE.max) - TOJEONG_RANGE.min + 1 }, (_, i) => Math.min(ctx.today.y, TOJEONG_RANGE.max) - i);
  const options = (values, selected, suffix) => values.map((n) => `<option value="${n}"${n === selected ? ' selected' : ''}>${n}${suffix}</option>`).join('');
  return `<form class="pform card" id="tojeong-form" novalidate>
    <h2 class="form-title">내 토정비결 보기</h2>
    <p class="hint">태어난 시간과 성별은 필요하지 않습니다.</p>
    <div class="field"><label for="tj-name">이름 (선택)</label><input class="input" id="tj-name" maxlength="12" autocomplete="off" placeholder="결과에 표시할 이름"></div>
    <fieldset class="field"><legend>생일 달력</legend><div class="seg"><label><input type="radio" name="tj-calendar" value="solar" checked><span>양력</span></label><label><input type="radio" name="tj-calendar" value="lunar"><span>음력</span></label></div></fieldset>
    <fieldset class="field"><legend>생년월일</legend><div class="ymd">
      <select class="input" id="tj-y" aria-label="태어난 해">${options(years, 1990, '년')}</select>
      <select class="input" id="tj-m" aria-label="태어난 달">${options(Array.from({ length: 12 }, (_, i) => i + 1), 1, '월')}</select>
      <select class="input" id="tj-d" aria-label="태어난 날">${options(Array.from({ length: 31 }, (_, i) => i + 1), 1, '일')}</select>
    </div><label class="check"><input type="checkbox" id="tj-leap" disabled> 음력 윤달에 태어났어요</label></fieldset>
    <div class="form-actions"><button class="btn" type="submit">무료 토정비결 보기</button><button class="link-btn" type="button" data-tojeong-sample>예시 보기</button></div>
    <p class="form-error" role="alert" id="tj-error" hidden></p>
    <div class="storage-options"><label class="check"><input type="checkbox" id="tj-save"> 이 기기에 저장</label><button class="link-btn" type="button" data-tojeong-delete>저장된 토정비결 정보 삭제</button><p class="hint" id="tj-storage-status" role="status">생일은 서버로 보내지 않습니다. 저장을 선택하면 이 기기에 보관합니다.</p></div>
  </form>`;
}

export function tojeongPage(ctx, year) {
  const y = year ?? ctx.today.y, path = year ? `/tojeong/${y}/` : '/tojeong/';
  const title = year ? `${y}년 무료 토정비결 — 총운과 12개월 월별 풀이` : TOJEONG.title;
  const description = year ? `${y}년 토정비결을 무료로 확인하세요. 생년월일로 구한 144괘의 총운과 음력 1~12월 해설을 회원가입이나 결제 없이 모두 볼 수 있습니다.` : TOJEONG.description;
  const faq = TOJEONG.faq;
  return {
    path, title, description, section: '/tojeong/',
    crumbs: year ? [['무료 토정비결', '/tojeong/'], [`${y}년 토정비결`, path]] : [['무료 토정비결', path]],
    ld: [faqLd(faq), { '@type': 'WebApplication', name: year ? `${y}년 무료 토정비결` : TOJEONG.h1, description, url: `${ctx.site}${path}`, applicationCategory: 'LifestyleApplication', operatingSystem: 'Web', inLanguage: 'ko-KR', isAccessibleForFree: true, offers: { '@type': 'Offer', price: FREE_ACCESS.price, priceCurrency: FREE_ACCESS.currency }, publisher: { '@id': `${ctx.site}/#org` } }],
    body: `${hero(year ? `${y}년 무료 토정비결` : TOJEONG.h1, TOJEONG.lead, FREE_ACCESS.summary)}
      <nav class="tojeong-years" aria-label="토정비결 연도 선택">${[ctx.today.y, ctx.today.y + 1].map((yr) => `<a class="btn ${yr === y ? '' : 'ghost'}" href="/tojeong/${yr}/"${yr === y ? ' aria-current="page"' : ''}>${yr}년 · ${yr === ctx.today.y ? '올해' : '내년'}</a>`).join('')}</nav>
      <section class="tojeong-layout" id="tojeong-tool" data-year="${y}" aria-label="토정비결 계산기">
        ${birthForm(ctx)}
        <div id="tojeong-result" class="tojeong-result" aria-live="polite"><section class="card tojeong-empty"><p class="eyebrow">${y}년의 이야기</p><h2>총운부터 열두 달의 흐름까지</h2><p>내 생일로 상괘·중괘·하괘를 구하면, 나에게 해당하는 한 해의 풀이가 펼쳐집니다.</p><ul><li>한 해를 아우르는 총운</li><li>음력 1~12월의 기회와 주의할 점</li><li>내 괘가 나온 계산 근거</li></ul><p class="hint">${esc(TOJEONG.readingNote)}</p><noscript><p>계산하려면 자바스크립트를 켜 주세요.</p></noscript></section></div>
      </section>
      <div class="info-panels">${disclosure('tojeong-method', '토정비결 계산 방법', `<section class="prose"><h2>144괘는 어떻게 구하나요?</h2><ol><li>음력 출생 연도로 세는나이를 구하고 보는 해의 태세수를 더해 8로 나눈 나머지를 상괘로 씁니다.</li><li>보는 해의 음력 생월 날수(29일 또는 30일)에 월건수를 더해 6으로 나눈 나머지를 중괘로 씁니다.</li><li>음력 생일에 보는 해 해당 생일의 일진수를 더해 3으로 나눈 나머지를 하괘로 씁니다.</li></ol><p>나머지가 0이면 각각 8·6·3으로 바꾸며, 조합은 8×6×3=144가지입니다.</p><p>${esc(TOJEONG.convention)}</p><p>계산법 출처: <a href="${TOJEONG.encyclopedia}" target="_blank" rel="noopener">한국민족문화대백과사전 · 토정비결</a></p></section>`)}
      ${disclosure('tojeong-faq', '자주 묻는 질문', faqBlock(faq), 'help')}
      ${disclosure('tojeong-source', '해설 출처와 이용 안내', `<section class="prose"><h2>이곳의 해설은 어디서 왔나요?</h2><p><a href="${TOJEONG.source}" target="_blank" rel="noopener">molpass/mcp-tojeong</a>의 MIT 공개 한글 해설 144괘를 사용합니다. ${esc(TOJEONG.editionNote)}</p><p>계산식은 한국민족문화대백과사전의 설명을 확인하고 구현을 테스트했습니다. 이 검증은 해설의 원전 정확성이나 미래 예측력을 보증하지 않습니다. 외부 MCP 서버에 연결하지 않으며 생년월일은 브라우저 안에서 처리합니다.</p><p>Copyright © 2026 Lee, JungHoon. <a href="/licenses/mcp-tojeong.txt">MIT 라이선스 전문</a></p><p>${esc(TOJEONG.readingNote)} 이 계산기는 운세를 확률이나 100점 점수로 바꾸지 않습니다.</p><p><a href="/year/">사주로 보는 무료 신년운세</a>도 함께 살펴보세요.</p></section>`)}</div>`,
  };
}

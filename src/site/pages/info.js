import { siteText } from '../copy.js';
// 소개·계산 방법, 개인정보처리방침, 404
import { ABOUT, PRIVACY, SITE } from '../../content/pages.js';
import { esc } from '../util.js';
import { hero } from './tools.js';
import { TOJEONG } from '../../content/tojeong.js';
import { PUBLISHER } from '../../content/publisher.js';
import { tr } from '../../i18n/runtime.js';

const publisherLinks = () => `<section class="prose" id="contact"><h2>${tr('운영·문의', 'Operator and contact')}</h2><p>${esc(PUBLISHER.name)} · <a href="mailto:${PUBLISHER.email}">${PUBLISHER.email}</a></p><p><a href="/contact/">${tr('오류 제보·개인정보 문의 안내', 'Corrections and privacy enquiries')}</a> · <a href="/editorial/">${tr('콘텐츠 작성·출처 기준', 'Editorial and source policy')}</a></p></section>`;

export function about(ctx) {
  return {
    path: '/about/', title: ABOUT.title, description: `${SITE.name}${siteText("의 무료 이용 범위와 사주 계산 규칙을 안내합니다. 사주 신년운세와 토정비결의 차이, 절기 기준 원국, 용신과 운세 점수 계산 근거를 확인하세요.")}`,
    crumbs: [[siteText('소개 · 계산 방법'), '/about/']], section: '/about/', pageType: 'AboutPage', ogType: 'article',
    ld: [{ '@type': 'Article', headline: ABOUT.h1, inLanguage: siteText('ko-KR'), datePublished: ctx.published, dateModified: ctx.buildDate, author: { '@id': `${ctx.site}/#org` }, publisher: { '@id': `${ctx.site}/#org` }, mainEntityOfPage: { '@id': `${ctx.site}/about/#webpage` } }],
    body: `<article class="article">${hero(ABOUT.h1, ABOUT.lead)}${ABOUT.sections.map((s) => `<section class="prose"${s.id ? ` id="${esc(s.id)}"` : ''}><h2>${esc(s.h)}</h2><ul>${s.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul></section>`).join('')}
      <p class="note">${siteText("토정비결 설명 출처: ")}<a href="https://encykorea.aks.ac.kr/Article/E0059207" target="_blank" rel="noopener">${siteText("한국민족문화대백과사전 · 토정비결")}</a></p><section class="prose"><h2>${siteText("사용 데이터와 라이브러리")}</h2><ul><li>${siteText("절기·간지 계산: lunar-javascript (천문 알고리즘 기반)")}</li><li>${siteText("한국 음력 변환: korean-lunar-calendar (한국천문연구원 음력 기준)")}</li><li>${siteText("사주 해설 문장: ")}${esc(SITE.publisher)} · ${tr("사이트의 콘텐츠 데이터와 계산 관계에 따라 제공. 개별 문헌의 직접 인용과 구분합니다.", "Provided from the site’s content data and calculated relationships, distinct from direct quotations from individual texts.")}</li><li>${siteText("토정비결 해설: ")}<a href="${TOJEONG.source}" target="_blank" rel="noopener">molpass/mcp-tojeong</a>${siteText("의 MIT 공개 한글 판본. ")}${esc(TOJEONG.editionNote)}</li></ul></section>
      ${publisherLinks()}<p class="note">${esc(ABOUT.note)}</p><p class="updated">${siteText("최종 업데이트 ")}${ctx.buildDate}</p></article>`,
  };
}
export function privacy(ctx) {
  return {
    path: '/privacy/', title: PRIVACY.title, description: `${SITE.name}${siteText(" 개인정보처리방침. 생년월일시 등 입력 정보는 서버로 전송되지 않으며 사용자 기기에만 저장됩니다.")}`,
    crumbs: [[PRIVACY.h1, '/privacy/']], section: '/privacy/',
    body: `<article class="article">${hero(PRIVACY.h1, tr('출생 정보는 브라우저에서 계산하며, 광고·방문 통계의 외부 접속과 기기 저장 범위를 아래에 설명합니다.', 'Birth details are processed in your browser. External advertising and analytics requests and device storage are described below.'))}${PRIVACY.sections.map((s) => `<section class="prose"><h2>${esc(s.h)}</h2><p>${esc(s.text)}</p></section>`).join('')}${publisherLinks()}<p class="updated">${siteText("시행일 ")}${ctx.published} · ${tr('최종 수정', 'Last revised')} ${ctx.buildDate}</p></article>`,
  };
}

export function contact(ctx) {
  const title = tr('운영자·문의와 오류 제보', 'Contact and corrections');
  return {
    path: '/contact/', title, description: tr('Gondry Workshop이 운영하는 Fortune의 콘텐츠 오류, 계산 문제, 개인정보 문의 방법을 안내합니다.', 'Contact Gondry Workshop about Fortune content, calculation issues or privacy enquiries.'),
    pageType: 'ContactPage', section: '/contact/', crumbs: [[title, '/contact/']],
    body: `<article class="article">${hero(title, tr('make your own day는 Gondry Workshop이 운영합니다. 결과를 읽다가 설명이 맞지 않거나 기능이 작동하지 않으면 아래 이메일로 알려주세요.', 'make your own day is operated by Gondry Workshop. Email us if an explanation appears incorrect or a feature does not work.'))}${publisherLinks()}<section class="prose"><h2>${tr('문제를 재현하는 데 필요한 정보', 'Information that helps reproduce an issue')}</h2><ul><li>${tr('문제가 있는 페이지 주소와 발생한 날짜', 'The page URL and date the issue occurred')}</li><li>${tr('기대했던 동작과 실제로 표시된 내용', 'What you expected and what appeared instead')}</li><li>${tr('브라우저 종류와 기기, 선택한 달력·시간 입력 방식', 'Browser, device, and calendar/time input options')}</li></ul><p>${tr('실제 생년월일시나 이름을 먼저 보내지 마세요. 가상 날짜에서도 재현되는지 확인해 주시면 좋습니다. 화면을 첨부할 때는 개인 정보를 가려주세요.', 'Please avoid sending your real birth details or name initially. Check whether fictional details reproduce the issue, and redact personal information in screenshots.')}</p></section><section class="prose"><h2>${tr('콘텐츠 수정과 개인정보 문의', 'Content corrections and privacy enquiries')}</h2><p>${tr('잘못된 문장이나 출처 문제는 해당 문장과 페이지 주소를 함께 알려주세요. 확인 후 콘텐츠와 계산 기준을 구분해 수정합니다. 기기에 저장한 출생 정보는 해당 브라우저의 저장된 정보 삭제 버튼이나 사이트 데이터 삭제로 지울 수 있습니다.', 'For a correction or source concern, include the sentence and page URL. We distinguish content changes from calculation-rule changes when reviewing it. Birth details stored on your device can be removed with the saved-details deletion button or your browser’s site-data controls.')}</p><p><a href="/privacy/">${tr('개인정보처리방침', 'Privacy policy')}</a> · <a href="/editorial/">${tr('작성·수정 기준', 'Editorial policy')}</a></p></section><p class="updated">${tr('최종 업데이트', 'Last updated')} ${ctx.buildDate}</p></article>`,
  };
}

export function editorial(ctx) {
  const title = tr('콘텐츠 작성·출처·수정 기준', 'Editorial, source and correction policy');
  return {
    path: '/editorial/', title, description: tr('날짜 계산, 서비스 점수, 전통 해석을 구분하고 공개 예시·토정비결 판본·AI 활용·오류 수정 기준을 안내합니다.', 'How Fortune distinguishes calendar calculations, model scores and traditional interpretations, with examples, editions, AI assistance and correction policies.'),
    section: '/editorial/', crumbs: [[title, '/editorial/']],
    body: `<article class="article">${hero(title, tr('이 사이트의 숫자가 어디에서 나왔고, 해설이 무엇을 설명하는지 확인할 수 있도록 작성 기준을 공개합니다.', 'These standards explain where the numbers come from and what the readings describe.'))}
      <section class="prose"><h2>${tr('날짜 계산·점수·해석을 구분합니다', 'Separate dates, scores and interpretations')}</h2><p>${tr('만세력의 날짜 변환과 간지 계산은 명시된 달력·시간 규칙으로 재현하는 계산입니다. 운세·궁합·랭킹 점수는 서비스가 정한 가중치의 환산값입니다. 성격·직업·관계·신살 설명은 전통 용어를 풀어 쓴 해석 콘텐츠로, 개인의 실제 능력·건강·미래를 측정한 결과가 아닙니다.', 'Calendar conversions and pillars are reproducible under stated date and time rules. Fortune, compatibility and ranking scores express this service’s weights. Personality, career, relationship and symbolic-star readings interpret traditional terms; they do not measure real ability, health or future events.')}</p><p><a href="/about/#birth-rules">${tr('원국 계산 기준', 'Chart conventions')}</a> · <a href="/about/#limits">${tr('검증 범위와 한계', 'Validation and limits')}</a></p></section>
      <section class="prose"><h2>${tr('예시는 현재 엔진으로 생성합니다', 'Examples use the current engine')}</h2><p>${tr('공개 예시는 설명을 위해 정한 가상 입력입니다. 계산기와 같은 함수를 실행해 원국·날짜·점수를 생성하며, 이용자의 저장 정보를 읽지 않습니다. 실제 상담·경험·성공 사례로 제시하지 않습니다. 고정된 설명의 수정일과 매일 바뀌는 계산 기준일을 구분합니다.', 'Worked examples use fictional inputs and the same functions as the calculator. They do not read saved user details and are not presented as consultations, experiences or success stories. Editorial dates are distinct from the daily reference date of a calculation.')}</p></section>
      <section class="prose"><h2>${tr('사용 자료와 판본을 밝힙니다', 'Identify data and editions')}</h2><ul><li>${tr('절기·간지: lunar-javascript, 한국 음력 변환: korean-lunar-calendar. 지원 범위와 보정 방식은 소개 페이지에 설명합니다.', 'Solar terms and pillars: lunar-javascript. Korean lunar conversion: korean-lunar-calendar. The About page explains supported ranges and adjustments.')}</li><li>${tr('백과·분야별 해설은 사이트의 콘텐츠 데이터와 계산 관계를 조합해 제공합니다. 개별 문헌의 직접 인용이 표시되지 않은 문장을 고전 원문으로 보지 않습니다.', 'Encyclopedia and area readings combine this site’s content data with calculated relationships. Unless explicitly identified as a quotation, wording is not presented as text from a classical source.')}</li><li>${tr('토정비결 한글 해설은 molpass/mcp-tojeong의 MIT 공개 판본을 사용합니다. 이 사이트의 추가 설명과 공개 판본의 괘사를 구분하며, 판본별 내용과 작괘 관습은 다를 수 있습니다.', 'Korean Tojeong readings use the MIT-licensed molpass/mcp-tojeong edition. This site’s guidance is separate from that edition’s readings, and text and code conventions can differ across editions.')}</li></ul><p><a href="${TOJEONG.source}" rel="noopener" target="_blank">molpass/mcp-tojeong</a> · <a href="/licenses/mcp-tojeong.txt">${tr('사용 판본의 라이선스', 'Edition license')}</a> · <a href="/about/">${tr('사용 자료와 계산 설명', 'Data and calculations')}</a></p></section>
      <section class="prose"><h2>${tr('AI 활용과 자동 생성의 범위', 'AI assistance and automated generation')}</h2><p>${tr('이 서비스의 개발과 해설 작성에는 AI 도구를 활용합니다. 화면의 계산 결과는 정해진 엔진에서 생성하며 방문할 때마다 AI가 새로 점치는 방식이 아닙니다. 자동 조합된 해설과 번역에도 오류가 있을 수 있으며, 전문가가 개인별 감정을 제공한다는 뜻은 아닙니다.', 'AI tools assist development and writing. Results come from a defined engine rather than a new AI prediction on every visit. Generated combinations and translations can contain errors; they do not constitute a personal assessment by an expert.')}</p></section>
      <section class="prose"><h2>${tr('수정과 광고의 원칙', 'Corrections and advertising')}</h2><p>${tr('계산 규칙을 바꿀 때에는 날짜 경계와 기존 결과의 회귀를 확인합니다. 글의 오류는 해당 페이지의 내용 수정일을 갱신하고, 단순 재배포만으로 모든 글의 수정일을 올리지 않습니다. Google 광고와 쿠팡 파트너스 배너는 광고로 표시하며, 운영·문의·개인정보·오류 화면과 이용 가이드에는 광고를 넣지 않습니다.', 'Changes to calculation rules require boundary and regression checks. Editorial changes update the affected content date; a redeployment alone does not refresh every article. Google ads and Coupang Partners banners are labelled. Operational, contact, privacy, error and reading-guide pages do not carry ads.')}</p></section>${publisherLinks()}<p class="updated">${tr('최종 업데이트', 'Last updated')} ${ctx.buildDate}</p></article>`,
  };
}
export function notFound() {
  return {
    path: '/404/', title: siteText('페이지를 찾을 수 없습니다'), description: siteText('요청한 페이지가 없거나 주소가 바뀌었습니다.'), noindex: true, crumbs: [],
    body: `${hero(siteText('페이지를 찾을 수 없습니다'), siteText('주소가 바뀌었거나 없는 페이지입니다. 아래에서 원하는 운세를 찾아보세요.'))}<div class="cards"><a class="card link-card" href="/today/"><b>${siteText("오늘의 운세")}</b><span>${siteText("내 사주로 보는 오늘")}</span></a><a class="card link-card" href="/tti/today/"><b>${siteText("띠별 오늘의 운세")}</b><span>${siteText("12띠 오늘 점수")}</span></a><a class="card link-card" href="/saju/"><b>${siteText("사주 백과")}</b><span>${siteText("일주·십신·오행·신살")}</span></a></div>`,
  };
}

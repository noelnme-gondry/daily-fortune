// 소개·계산 방법, 개인정보처리방침, 404
import { ABOUT, PRIVACY, SITE } from '../../content/pages.js';
import { esc } from '../util.js';
import { hero } from './tools.js';

export function about(ctx) {
  return {
    path: '/about/', title: ABOUT.title, description: '오행 운세가 사주 원국을 세우고 운세 점수를 계산하는 규칙을 공개합니다. 절기 기준 년·월주, 30분 보정, 서머타임, 신강·신약과 용신, 점수 보정 방식까지 설명합니다.',
    crumbs: [['소개 · 계산 방법', '/about/']], section: '/about/', pageType: 'AboutPage', ogType: 'article',
    ld: [{ '@type': 'Article', headline: ABOUT.h1, inLanguage: 'ko-KR', datePublished: ctx.published, dateModified: ctx.buildDate, author: { '@id': `${ctx.site}/#org` }, publisher: { '@id': `${ctx.site}/#org` }, mainEntityOfPage: { '@id': `${ctx.site}/about/#webpage` } }],
    body: `<article class="article">${hero(ABOUT.h1, ABOUT.lead)}${ABOUT.sections.map((s) => `<section class="prose"><h2>${esc(s.h)}</h2><ul>${s.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul></section>`).join('')}
      <section class="prose"><h2>사용 데이터와 라이브러리</h2><ul><li>절기·간지 계산: lunar-javascript (천문 알고리즘 기반)</li><li>한국 음력 변환: korean-lunar-calendar (한국천문연구원 음력 기준)</li><li>해설 문장: ${esc(SITE.publisher)}이 명리학 문헌의 일반적인 해석을 바탕으로 작성</li></ul></section>
      <p class="note">${esc(ABOUT.note)}</p><p class="updated">최종 업데이트 ${ctx.buildDate}</p></article>`,
  };
}
export function privacy(ctx) {
  return {
    path: '/privacy/', title: PRIVACY.title, description: '오행 운세 개인정보처리방침. 생년월일시 등 입력 정보는 서버로 전송되지 않으며 사용자 기기에만 저장됩니다.',
    crumbs: [[PRIVACY.h1, '/privacy/']], section: '/privacy/',
    body: `<article class="article">${hero(PRIVACY.h1, '오행 운세는 개인정보를 수집하지 않는 것을 원칙으로 합니다.')}${PRIVACY.sections.map((s) => `<section class="prose"><h2>${esc(s.h)}</h2><p>${esc(s.text)}</p></section>`).join('')}<p class="updated">시행일 ${ctx.published}</p></article>`,
  };
}
export function notFound() {
  return {
    path: '/404/', title: '페이지를 찾을 수 없습니다', description: '요청한 페이지가 없거나 주소가 바뀌었습니다.', noindex: true, crumbs: [],
    body: `${hero('페이지를 찾을 수 없습니다', '주소가 바뀌었거나 없는 페이지입니다. 아래에서 원하는 운세를 찾아보세요.')}<div class="cards"><a class="card link-card" href="/today/"><b>오늘의 운세</b><span>내 사주로 보는 오늘</span></a><a class="card link-card" href="/tti/today/"><b>띠별 오늘의 운세</b><span>12띠 오늘 점수</span></a><a class="card link-card" href="/saju/"><b>사주 백과</b><span>일주·십신·오행·신살</span></a></div>`,
  };
}

import { siteText } from './copy.js';
import { esc } from './util.js';

// 연간 기능의 입력·결과·목적은 한 목록에서 파생한다. 새 라우트를 만들지 않는다.
export function yearChoices(y, currentYear) {
  return [
    { path: `/year/${y}/`, name: `${y}${siteText("년 사주 신년운세")}`, question: siteText('내 사주로 한 해와 월별 흐름을 보고 싶어요.'), input: siteText('생년월일·양력/음력·윤달·성별·출생 시각(모름 선택 가능)'), output: siteText('사주 원국·세운·대운을 반영한 총운, 7개 분야 점수, 1~12월 운세') },
    { path: y === currentYear ? '/tojeong/' : `/tojeong/${y}/`, name: `${y}${siteText("년 토정비결")}`, question: siteText('144괘로 한 해와 음력 열두 달의 풀이를 읽고 싶어요.'), input: siteText('생년월일·양력/음력·윤달. 생시·성별 불필요'), output: siteText('음력 생일과 나이로 구한 괘, 총운·음력 12개월 해설. 점수 없음') },
    { path: `/tti/${y}/`, name: `${y}${siteText("년 띠별 운세")}`, question: siteText('개인 생일 입력 없이 내 띠의 공통 흐름을 보고 싶어요.'), input: siteText('12띠 선택, 상세 페이지에서 출생 연도 선택 가능'), output: siteText('띠와 해당 연도의 관계에 따른 점수·해설. 개인 원국 전체는 반영하지 않음') },
    { path: `/manseryeok/${y}/`, name: `${y}${siteText("년 만세력 달력")}`, question: siteText('날짜별 간지·음력·절기 시각을 확인하고 싶어요.'), input: siteText('연도·월 선택. 개인 정보 입력 불필요'), output: siteText('24절기 절입 시각, 월건, 날짜별 일진·음력. 개인 신년운세가 아닌 달력 자료') },
  ];
}

export function yearGuide(y, ctx, currentPath) {
  return `<section class="prose year-guide" aria-labelledby="year-guide-title"><h2 id="year-guide-title">${y}${siteText("년, 어떤 정보를 찾고 있나요?")}</h2><p>${siteText("신년운세·토정비결·띠별 운세·만세력의 차이")}</p><div class="year-options">${yearChoices(y, ctx.today.y).map((r) => `<article class="card box year-option"><h3>${r.path === currentPath ? `${esc(r.name)}${siteText(" (현재 페이지)")}` : `<a href="${r.path}">${esc(r.name)}</a>`}</h3><p>${esc(r.question)}</p><dl><dt>${siteText("입력")}</dt><dd>${esc(r.input)}</dd><dt>${siteText("결과와 계산 방식")}</dt><dd>${esc(r.output)}</dd></dl></article>`).join('')}</div><p>${siteText("개인의 사주팔자부터 확인하려면 ")}<a href="/manseryeok/">${siteText("만세력 원국 계산기")}</a>${siteText("를 이용하세요. ")}<a href="/about/#tojeong">${siteText("계산 방식의 차이")}</a>${siteText("와 ")}<a href="/about/#limits">${siteText("해석의 한계")}</a>${siteText("도 확인할 수 있습니다.")}</p></section>`;
}

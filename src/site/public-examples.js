import { elementName } from '../i18n/terms.js';
import { tr } from '../i18n/runtime.js';
import { siteText, siteValue } from './copy.js';
// 공개 설명에만 쓰는 가상 입력. 개인 저장소·요청 매개변수를 읽지 않는다.
// 결과를 전사하지 않고 실제 계산기와 같은 엔진으로 HTML을 생성한다.
import { buildChart, day, isoDate, year, yearMonths, pillarLabel } from '../engine/index.js';
import { UNKNOWN_TIME } from '../content/calculation-notes.js';
import { esc } from './util.js';

export const EXAMPLE_INPUT = Object.freeze({ gender: 'M', calendar: 'solar', y: 1990, m: 5, d: 17, time: '14:30' });
const inputText = (p) => `${p.calendar === 'solar' ? siteText('양력') : siteText('음력')} ${p.y}${siteText("년 ")}${p.m}${siteText("월 ")}${p.d}${siteText("일, ")}${p.time || siteText('시간 모름')}, ${p.gender === 'M' ? siteText('남성') : siteText('여성')}`;
const start = (title, date) => `<section class="card box public-example" id="public-example" aria-labelledby="example-title"${date ? ` data-example-date="${isoDate(date)}"` : ''}><p class="eyebrow">${siteText("실제 엔진으로 계산한 가상 사례")}</p><h2 id="example-title">${title}</h2><p>${siteText("이 사례는 기능 설명을 위해 정한 가상의 입력이며 실존 인물이나 이용자의 저장 정보가 아닙니다.")}</p><h3>${siteText("입력 예시")}</h3><p>${inputText(EXAMPLE_INPUT)}${siteText(". 출생 당시 한국 시계 시각을 입력한 사례입니다.")}</p>`;
const end = () => `<h3>${siteText("해석의 한계")}</h3><p>${siteText("간지와 점수는 이 서비스의 계산 규칙에 따른 결과입니다. 성격이나 미래 사건이 사실로 확인되었다는 뜻이 아니며, 점수는 성공 확률이나 예측 정확도가 아닙니다.")}</p><p><a href="/about/#birth-rules">${siteText("입력·시간 경계 기준")}</a> · <a href="/about/#limits">${siteText("검증 범위와 해석의 한계")}</a></p><p class="cta"><a class="btn" href="#tool" data-ga-cta="public_example">${siteText("내 정보로 직접 이용하기")}</a></p></section>`;

export function dayExample(date, which) {
  const c = buildChart({ ...EXAMPLE_INPUT });
  const r = day(c, date, which);
  const title = which === 'tomorrow' ? tr('내일의 운세 결과 예시와 읽는 법', 'Tomorrow’s Fortune: Worked Example') : tr('오늘의 운세 결과 예시와 읽는 법', 'Today’s Fortune: Worked Example');
  const points = tr('점', ' points');
  return `${start(title, date)}
    <h3>${siteText('실제 계산 결과')}</h3><p>${tr('기준 날짜: ', 'Reference date: ')}<time datetime="${isoDate(date)}">${r.label}</time> · ${tr('일진: ', 'Day pillar: ')}${pillarLabel(r.pillar)}.</p>
    <p>${tr('이 가상 사례의 종합 점수는 ', 'The overall score for this fictional example is ')}<b data-example-overall>${r.overall.score}${points}</b>${tr('입니다.', '.')}</p>
    <div class="table-wrap"><table class="grid-table"><caption>${title}</caption><thead><tr><th scope="col">${siteText('분야')}</th><th scope="col">${siteText('점수')}</th></tr></thead><tbody>${r.cats.map((cat) => `<tr><th scope="row">${cat.name}</th><td>${cat.score}${points}</td></tr>`).join('')}</tbody></table></div>
    <p>${siteText('계산된 총운 해설: ')}${esc(r.overall.text)}</p>
    <h3>${siteText('읽는 방법')}</h3><p>${tr('오늘·내일 운세는 해당 날짜의 일진 70%, 절기 기준 월운 20%, 세운 10%로 내 사주와의 관계를 합산한 뒤 점수로 환산합니다. 종합 점수는 분야별 점수의 단순 평균이 아닙니다. 점수의 높고 낮음과 함께 총운과 각 분야의 설명을 읽어 보세요.', 'Daily readings combine relationships with the day cycle at 70%, solar-term month cycle at 20% and annual cycle at 10%, then convert them to scores. The overall score is not a simple average of the area scores. Read the explanations alongside the numbers.')}</p>
    <h3>${tr('생일이나 띠가 같아도 결과가 다른 이유', 'Why the same birthday or zodiac sign can give different results')}</h3><p>${tr('띠별 운세는 태어난 해의 지지 하나를 비교하지만, 개인 운세는 출생 연·월·일·시로 세운 원국을 함께 봅니다. 같은 생일도 태어난 해와 시각이 다르면 결과가 달라질 수 있습니다. 시간을 모르면 시주를 제외해 다시 계산하며, 기준 날짜가 바뀌면 같은 입력의 점수도 달라질 수 있습니다.', 'Zodiac readings compare one birth-year branch. Personal readings use the natal year, month, day and hour pillars. People sharing a birthday can have different birth years or times. Choosing Time unknown omits the hour pillar, and changing the reference date can also change the scores.')}</p>
    <p><a href="/manseryeok/">${tr('내 사주 원국 확인하기', 'Check my natal chart')}</a> · <a href="${which === 'tomorrow' ? '/today/' : '/tomorrow/'}">${which === 'tomorrow' ? tr('오늘의 운세와 비교하기', 'Compare with today’s fortune') : tr('내일의 운세도 확인하기', 'Explore tomorrow’s fortune')}</a></p>${end()}`;
}

export function manseExample() {
  const c = buildChart({ ...EXAMPLE_INPUT });
  const unknown = buildChart({ ...EXAMPLE_INPUT, time: null });
  return `${start(siteText('만세력 결과는 이렇게 읽습니다'))}
    <h3>${siteText("실제 계산 결과")}</h3><p>${c.cols.map((p) => `${siteValue(p.label)} ${pillarLabel(p)}`).join(' · ')}${siteText("입니다.")}</p><p class="example-scroll-hint" id="example-scroll-hint">${siteText("좁은 화면에서는 표를 좌우로 밀어 십신과 12운성을 확인하세요.")}</p><div class="table-wrap" tabindex="0" role="region" aria-label="${siteText("가상 사례 원국 상세 표")}" aria-describedby="example-scroll-hint"><table class="grid-table example-pillars"><caption>${siteText("가상 사례의 사주 원국")}</caption><thead><tr><th scope="col">${siteText("기둥")}</th><th scope="col">${siteText("간지")}</th><th scope="col">${siteText("천간 십신")}</th><th scope="col">${siteText("지지 십신")}</th><th scope="col">${siteText("12운성")}</th></tr></thead><tbody>${c.cols.map((p) => `<tr><th scope="row">${siteValue(p.label)}</th><td>${pillarLabel(p)}</td><td>${siteValue(p.tgS)}</td><td>${siteValue(p.tgB)}</td><td>${siteValue(p.stage)}</td></tr>`).join('')}</tbody></table></div>
    <p>${siteText("겉글자의 오행 개수: ")}${c.counts.map((n, i) => `${elementName(i)} ${siteValue(n)}${siteText("개")}`).join(' · ')}.</p>
    <h3>${siteText("읽는 방법")}</h3><p>${siteText("년주·월주·일주·시주는 출생 년·월·일·시의 간지입니다. 일주의 천간을 일간이라 하고, 십신은 일간과 다른 글자의 관계를 나타냅니다. 오행 개수는 겉글자를 센 값으로, 지장간과 월지 가중치를 반영하는 강약·용신 계산과 구분합니다.")}</p>
    <h3>${siteText("같은 생일에 시간을 모른다면")}</h3><p>${siteText("시간 모름으로 다시 계산하면 ")}${unknown.cols.map((p) => `${siteValue(p.label)} ${pillarLabel(p)}`).join(' · ')}${siteText("이며 시주는 없습니다. 겉글자는 ")}${unknown.counts.reduce((a, b) => a + b, 0)}${siteText("개입니다.")}</p><p>${esc(UNKNOWN_TIME.summary)}</p>${end()}`;
}

export function yearExample(y, ctx) {
  const c = buildChart({ ...EXAMPLE_INPUT });
  const which = y === ctx.today.y + 1 ? 'next' : 'this';
  const r = year(c, y, which), months = yearMonths(c, y);
  const unknown = year(buildChart({ ...EXAMPLE_INPUT, time: null }), y, which);
  return `${start(`${y}${siteText("년 신년운세 계산 예시")}`)}
    <h3>${siteText("실제 계산 결과")}</h3><p>${siteText("대상 연도: ")}${y}${siteText("년 · 세운 ")}${pillarLabel(r.pillar)}${r.daeun ? `${siteText(" · 대운 ")}${pillarLabel(r.daeun)}` : ''}${siteText(". 종합 점수는 ")}<b data-example-overall>${r.overall.score}${siteText("점")}</b>${siteText("입니다.")}</p>
    <div class="table-wrap"><table class="grid-table"><caption>${siteText("가상 사례의 ")}${y}${siteText("년 분야별 점수")}</caption><thead><tr><th scope="col">${siteText("분야")}</th><th scope="col">${siteText("점수")}</th></tr></thead><tbody>${r.cats.map((cat) => `<tr><th scope="row">${cat.name}</th><td>${cat.score}${siteText("점")}</td></tr>`).join('')}</tbody></table></div>
    <p>${siteText("계산된 총운 해설: ")}${esc(r.overall.text)}</p>
    <div class="table-wrap"><table class="grid-table"><caption>${siteText("가상 사례의 ")}${y}${siteText("년 월별 점수")}</caption><thead><tr><th scope="col">${siteText("월")}</th><th scope="col">${siteText("대표 월주")}</th><th scope="col">${siteText("점수")}</th></tr></thead><tbody>${months.map((m) => `<tr><th scope="row">${m.m}${siteText("월")}</th><td>${pillarLabel(m.pillar)}</td><td>${m.score}${siteText("점")}</td></tr>`).join('')}</tbody></table></div>
    <h3>${siteText("읽는 방법")}</h3><p>${siteText("이 사례의 연간 점수는 세운 68%와 대운 32%를 합친 뒤 환산한 값입니다. 월별 점수는 각 달 15일의 절기 월주 65%와 그날의 년주 35%로 별도 계산하므로, 열두 달 점수의 단순 평균이 연간 점수가 되지는 않습니다. 입춘 전인 1월에는 전년도 년주가 반영됩니다.")}</p>
    <h3>${siteText("시간 모름으로 바꾸면")}</h3><p>${siteText("나머지 입력을 유지하고 시간 모름을 선택하면 이 사례의 종합 점수는 ")}${unknown.overall.score}${siteText("점입니다. 시주를 제외하면 전체 오행과 관계 계산이 달라질 수 있어, 영향이 자녀운·말년운에만 한정되지 않습니다.")}</p><p>${esc(UNKNOWN_TIME.summary)}</p>${end()}`;
}

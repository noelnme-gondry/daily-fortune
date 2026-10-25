import { buildChart, pillarLabel, isoDate } from '../engine/index.js';
import { elementName, stemName, branchName, term } from '../i18n/terms.js';
import { tr } from '../i18n/runtime.js';
import { GUIDE_SOURCES } from '../content/guide-catalog.js';
import { EXAMPLE_INPUT, MANSE_BOUNDARIES } from './public-examples.js';
import { esc } from './util.js';

function exampleTable(caption, headers, rows) {
  return `<div class="table-wrap" tabindex="0" role="region" aria-label="${esc(caption)}"><table class="grid-table"><caption>${esc(caption)}</caption><thead><tr>${headers.map(h => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr><th scope="row">${esc(row[0])}</th>${row.slice(1).map(v => `<td>${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

function calculatedExample(kind) {
  const p = EXAMPLE_INPUT, c = buildChart({ ...p });
  const input = tr(`가상 입력 · 양력 ${isoDate(p)} · ${p.time} · 남성 · 한국 출생 당시 시계 시각`, `Fictional input · solar ${isoDate(p)} · ${p.time} · male · original Korean clock time`);
  const item = tr('항목', 'Item'), value = tr('계산 결과', 'Calculated value');
  let caption, headers, rows, note;
  if (kind === 'ipchun' || kind === 'night') {
    const b = MANSE_BOUNDARIES.find(b => b.id === kind);
    const charts = b.times.map(time => buildChart({ ...b.input, time }));
    caption = tr('경계 전후 실제 원국', 'Calculated pillars around the boundary');
    headers = [tr('기둥', 'Pillar'), ...b.times];
    rows = charts[0].cols.map((col, i) => [term(col.label), ...charts.map(c => pillarLabel(c.cols[i]))]);
    note = tr(`가상 양력 입력 ${isoDate(b.input)} · 남성. 날짜·성별을 유지하고 시각만 ${b.times.join(' / ')}로 바꿨습니다. 실제 인물의 출생 기록이 아닙니다.`, `Fictional solar input ${isoDate(b.input)} · male. Only the clock time changes to ${b.times.join(' / ')}. This is not a real birth record.`);
  } else {
    note = input;
    if (kind === 'chart') {
      caption = tr('네 기둥과 일간 찾기', 'Locate the four pillars and Day Master');
      headers = [tr('기둥', 'Pillar'), tr('간지', 'Pair'), tr('천간', 'Stem'), tr('지지', 'Branch')];
      rows = c.cols.map(col => [term(col.label), pillarLabel(col), `${stemName(col.s)}${col.pos === 'day' ? ` · ${term('일간')}` : ''}`, branchName(col.b)]);
    } else if (kind === 'elements') {
      caption = tr('겉글자 개수와 지장간 포함 가중값', 'Visible counts and hidden-stem element weights');
      headers = [tr('오행', 'Element'), tr('겉글자 개수', 'Visible count'), tr('지장간 포함 가중값', 'Hidden-stem weight')];
      rows = c.counts.map((n, i) => [elementName(i), n, c.weights[i].toFixed(2)]);
      note += tr('. 가중값은 천간 1과 지장간 배분을 합한 값이며, 월지·일지 배수까지 적용하는 강약 계산의 도움 비율과는 다릅니다.', '. Weights combine stem units with hidden-stem proportions; they differ from the strength support ratio, which also applies month/day branch multipliers.');
    } else if (kind === 'gods') {
      caption = tr('일간 기준 천간·지지 십신', 'Stem and principal-branch Ten Gods');
      headers = [tr('기둥', 'Pillar'), tr('간지', 'Pair'), tr('천간 십신', 'Stem relationship'), tr('지지 본기 십신', 'Principal branch relationship')];
      rows = c.cols.map(col => [term(col.label), pillarLabel(col), term(col.tgS), term(col.tgB)]);
    } else if (kind === 'hidden') {
      caption = tr('기둥별 지장간', 'Hidden stems by pillar');
      headers = [tr('기둥', 'Pillar'), tr('간지', 'Pair'), tr('지장간', 'Hidden stems')];
      rows = c.cols.map(col => [term(col.label), pillarLabel(col), col.hidden.map(stemName).join(' · ')]);
    } else if (kind === 'strength') {
      caption = tr('일간 도움 비율과 강약 분류', 'Day Master support ratio and label');
      headers = [item, value];
      rows = [[tr('원국', 'Pillars'), c.cols.map(pillarLabel).join(' · ')], [tr('도움 비율', 'Support ratio'), `${(c.ratio * 100).toFixed(2)}%`], [tr('강약', 'Strength'), term(c.strengthLabel)]];
    } else if (kind === 'roles') {
      caption = tr('현행 모델의 용신·희신·기신', 'Element roles in the current model');
      headers = [item, value];
      rows = ['yong', 'hee', 'gi'].map((key, i) => [term(['용신', '희신', '기신'][i]), elementName(c.roles[key])]);
    } else if (kind === 'cycles') {
      caption = tr('가상 원국의 첫 네 대운', 'First four major cycles for the fictional chart');
      headers = [tr('시작 연도', 'Starting year'), tr('표시 나이 · 연도 차이', 'Displayed age · year difference'), tr('대운 간지', 'Cycle pair')];
      rows = c.daeun.slice(0, 4).map(d => [d.startYear, d.age, pillarLabel(d)]);
    } else if (kind === 'calendar') {
      caption = tr('입력 날짜와 계산된 달력 표기', 'Input date and calculated calendar label');
      headers = [item, value];
      rows = [[tr('양력 입력', 'Solar input'), isoDate(p)], [tr('변환 음력', 'Lunar equivalent'), c.lunarText], [tr('원국', 'Pillars'), c.cols.map(pillarLabel).join(' · ')]];
    } else if (kind === 'same') {
      const again = buildChart({ ...p });
      caption = tr('같은 가상 입력의 반복 계산', 'Repeated calculation of identical fictional inputs');
      headers = [item, tr('첫 계산', 'First'), tr('반복 계산', 'Repeated')];
      rows = [[tr('원국', 'Pillars'), c.cols.map(pillarLabel).join(' · '), again.cols.map(pillarLabel).join(' · ')], [term('용신'), elementName(c.roles.yong), elementName(again.roles.yong)]];
    } else throw new Error(`Unknown guide example: ${kind}`);
  }
  return `<section class="prose guide-calculation" id="calculated-example"><h2>${tr('계산기로 직접 확인하는 예시', 'Worked example from the calculator')}</h2><p class="note">${esc(note)}</p>${exampleTable(caption, headers, rows)}<p>${tr('표의 값은 현재 서비스의 엔진에서 생성합니다. 날짜·글자 계산의 재현성을 실제 성격·미래 사건의 예측력과 구분해 읽으세요.', 'Values come from the current engine. Reproducible calendar and character calculations are distinct from validated personality or event prediction.')}</p></section>`;
}

export function guideArticleBody(g) {
  const sections = g.copy.sections;
  return `<nav class="box guide-toc" aria-label="${tr('이 글의 순서', 'On this page')}"><b>${tr('이 글에서 확인할 내용', 'In this guide')}</b><ol>${sections.map((s, i) => `<li><a href="#section-${i + 1}">${esc(s.title)}</a></li>`).join('')}${g.example ? `<li><a href="#calculated-example">${tr('실제 계산 예시', 'Worked calculation')}</a></li>` : ''}<li><a href="#checklist">${tr('확인 체크리스트', 'Checklist')}</a></li></ol></nav>
    ${sections.map((s, i) => `<section class="prose" id="section-${i + 1}"><h2>${esc(s.title)}</h2>${s.paragraphs.map(p => `<p>${esc(p)}</p>`).join('')}</section>`).join('')}
    ${g.example ? calculatedExample(g.example) : ''}
    <section class="prose" id="checklist"><h2>${tr('내 결과에서 확인할 것', 'Check your own result')}</h2><ul>${g.copy.checklist.map(s => `<li>${esc(s)}</li>`).join('')}</ul></section>
    <section class="prose"><h2>${tr('관련 계산기와 백과', 'Related tools and references')}</h2><ul>${g.links.map(href => `<li><a href="${esc(href)}">${esc(toolLabel(href))}</a></li>`).join('')}</ul></section>
    <section class="prose"><h2>${tr('전통 용어의 참고 자료', 'Background for traditional terminology')}</h2>${GUIDE_SOURCES.map(s => `<p><a href="${esc(s.href)}" target="_blank" rel="noopener">${esc(s.copy.title)}</a> · ${esc(s.copy.scope)}</p>`).join('')}</section>`;
}

function toolLabel(href) {
  const labels = {
    '/manseryeok/': ['내 만세력 계산하기', 'Calculate my birth chart'],
    '/manseryeok/#public-example': ['만세력 경계 계산 예시', 'Worked chart boundary examples'],
    '/lifetime/': ['내 평생 사주와 대운 보기', 'My lifetime chart and major cycles'],
    '/lifetime/#public-example': ['평생 사주 공개 계산 예시', 'Worked lifetime chart example'],
    '/today/': ['오늘 운세 계산하기', 'Calculate a daily reading'], '/month/': ['월간 운세', 'Monthly reading'],
    '/week/': ['주간 운세', 'Weekly reading'], '/year/': ['연간 운세', 'Annual readings'],
    '/compatibility/': ['두 사람의 궁합', 'Compatibility for two charts'], '/life-story/': ['인생 캐릭터', 'Life character'],
    '/tti/': ['띠별 운세', 'Zodiac readings'], '/tti/samjae/': ['삼재 연도표', 'Samjae year table'],
    '/saju/guide/': ['사주 보는 법 7단계', 'Seven steps to read a chart'], '/saju/ilgan/': ['일간 10가지 백과', 'Ten Day Masters'],
    '/saju/ilju/': ['60일주 백과', 'Sixty day pillars'], '/saju/glossary/': ['사주 용어 사전', 'Saju glossary'],
    '/saju/ohaeng/': ['오행 백과', 'Five Elements'], '/saju/sipsin/': ['십신 10가지 백과', 'Ten Gods'],
    '/saju/sinsal/': ['대표 신살 백과', 'Special stars'], '/saju/12unseong/': ['12운성 백과', 'Twelve life stages'],
    '/about/': ['공개 계산 방법', 'Published calculation method'], '/about/#birth-rules': ['출생 입력·시간 보정 기준', 'Birth input and time conventions'],
    '/about/#limits': ['검증 범위와 해석의 한계', 'Validation and interpretation limits'],
    '/editorial/': ['작성·출처 정책', 'Editorial and source policy'], '/privacy/': ['개인정보처리방침', 'Privacy policy'],
    '/contact/': ['문의·오류 제보', 'Contact and corrections'],
  };
  if (!labels[href]) throw new Error(`Missing guide link label: ${href}`);
  return tr(...labels[href]);
}

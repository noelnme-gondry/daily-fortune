import { READINGS as readings } from '../content/tojeong-readings.js';
import { periodPractice } from '../domain/period-practice.js';
import { readFileSync } from 'node:fs';
import { READING_CHAPTERS, READING_TOPICS, topicEvidence, monthPractices, readingSentences, ELEMENT_PRACTICE, TEN_GOD_PRACTICE, COMPAT_PRACTICE } from '../domain/premium-reading.js';
import { lifeEventDetails } from '../domain/life-event-detail.js';
import { chartCard } from '../client/views.js';
import { STEM_EL, pillarLabel } from '../engine/core.js';
import { year } from '../engine/fortune.js';
import { compatReasons } from '../engine/compat.js';
import T from '../content/text.js';
import { esc } from '../site/util.js';
import { TOJEONG } from '../content/tojeong.js';

const stylesheet = readFileSync(new URL('../styles/main.css', import.meta.url), 'utf8');
const reportStyle = readFileSync(new URL('../styles/premium-report.css', import.meta.url), 'utf8');
const fonts = 'https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&family=Gowun+Dodum&display=swap';
export const REPORT_CSP = "default-src 'none'; style-src 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src data:; base-uri 'none'; form-action 'none'";
const p = text => `<p>${esc(text)}</p>`;
const prose = text => {
  const sentences = readingSentences(text), groups = [];
  for (let i = 0; i < sentences.length; i += 2) groups.push(p(sentences.slice(i, i + 2).join(' ')));
  return groups.join('');
};
const list = lines => `<ul>${lines.map(line => `<li>${esc(line)}</li>`).join('')}</ul>`;
const chapter = (product, id, body) => `<section class="reading-chapter" id="reading-${id}"><h2>${READING_CHAPTERS[product].find(c => c.id === id).title}</h2>${body}</section>`;
const exercise = (action, question) => `<aside class="reading-exercise"><h4>생활에 적용해 보기</h4>${p(action)}<p class="reading-question">${esc(question)}</p></aside>`;
const fold = (title, subtitle, body, open = false, id = '') => `<details class="reading-fold"${open ? ' open' : ''}${id ? ` id="${id}"` : ''}><summary><strong>${esc(title)}</strong>${subtitle ? `<span>${esc(subtitle)}</span>` : ''}</summary><div class="reading-fold-body">${body}</div></details>`;
const timeNote = c => c.hasTime ? '입력한 출생 시각을 반영했습니다. 원국의 날짜·시각 기준은 아래 계산 근거에서 확인할 수 있습니다.' : '출생 시각을 몰라 시주를 제외했습니다. 시간에 따른 성향과 자녀궁 관계는 확인하지 않았으며, 출생 시각을 알게 되면 결과가 달라질 수 있습니다.';

export function reportToc(productId) {
  return `<nav class="reading-toc" aria-label="운세 목차">${READING_CHAPTERS[productId].map(c => `<a href="#reading-${c.id}">${c.title}</a>`).join('')}</nav>`;
}

function topicsView(reading) {
  return READING_TOPICS.map(topic => {
    const evidence = topicEvidence(reading, topic);
    return `<article class="reading-topic"><h3>${topic.name}</h3>${evidence.length ? evidence.map(s => `<blockquote>${p(s.text)}<cite><a href="#${s.anchor}">${s.label}</a>에서</cite></blockquote>`).join('') : p('이 주제를 직접 다룬 대목은 이번 괘의 원문에서 확인되지 않습니다. 별도의 길흉을 붙이지 않고 생활을 돌아보는 질문을 함께 둡니다.')}${p(topic.meaning)}${exercise(topic.action, topic.question)}</article>`;
  }).join('');
}

export function closingView(productId, points = []) {
  const prompts = {
    tojeong: ['한 해의 총운은 큰 주제, 월별 풀이는 그 주제를 다시 살펴보는 단위로 읽어 보세요. 서로 다른 표현이 있으면 한쪽을 정답으로 고르기보다 실제 상황과 대조해 보세요.', '월별 풀이는 음력입니다. 양력 달과 바로 대응하지 않으며 윤달은 같은 월의 풀이를 읽습니다. 다른 판본은 날짜 처리와 해설이 다를 수 있습니다.'],
    lifetime: ['원국은 타고난 성향의 해석, 대운은 10년 단위의 흐름, 세운은 한 해의 해석입니다. 한 대운이 좋다고 모든 해·모든 분야가 좋다는 뜻은 아닙니다.', '부족한 오행은 성격의 결함이 아니고, 신강·신약도 사람의 강함·약함이나 건강을 평가한 말이 아닙니다. 용신은 이 모델이 고른 균형 보완 오행으로 읽어 주세요.'],
    compatibility: ['종합 점수 하나보다 분야별 차이와 근거를 함께 읽어 보세요. 높은 점수는 노력을 대신하지 않고, 낮은 점수는 관계의 실패를 정하지 않습니다.', '두 사람의 점수는 관계를 비교하는 전통 해석입니다. 상대의 행동을 단정하거나 책임을 돌리는 말로 쓰기보다, 각자가 느끼는 차이를 확인하는 대화의 출발점으로 사용해 보세요.'],
  };
  return chapter(productId, 'closing', `<div class="reading-closing"><h3>좋지 않은 풀이가 마음에 남을 때</h3>${p('불편한 말을 읽으면 실제로 무슨 일이 생길까 걱정될 수 있습니다. 하지만 이 풀이는 앞으로 겪을 사건의 목록이 아닙니다. 중요한 결정을 서두르기보다, 지금 확인할 수 있는 일로 바꿔 읽어 보세요.')}${points.length ? `<div class="reading-watch"><h4>이번 풀이와 함께 살펴볼 점</h4>${points.map(point => `<div>${p(point.basis)}${p(point.action)}</div>`).join('')}</div>` : ''}<ol class="reading-next"><li><b>지금 할 일</b><span>마음에 걸린 표현 하나를 고르고, 실제로 확인할 수 있는 일정·약속·부담으로 바꿔 적어 보세요.</span></li><li><b>신중히 할 일</b><span>운세만으로 퇴사·이별·큰 지출 같은 결정을 서두르지 마세요. 현실에서 확인된 사실과 선택지를 따로 살펴보세요.</span></li><li><b>도움받을 일</b><span>혼자 해결하기 어려운 고민은 믿을 만한 사람과 나누세요. 몸 상태·돈·계약처럼 전문 판단이 필요한 일은 해당 분야의 실제 자료와 상담을 기준으로 확인하세요.</span></li></ol><h3>다음에 다시 읽을 때</h3>${prompts[productId].map(p).join('')}${p('점수는 이 서비스의 해석 기준이며 실제 사건의 확률이 아닙니다. 맞았던 일만 골라 기억하기보다 맞지 않았던 부분도 함께 적어 두세요. 좋고 나쁨의 판정보다 나에게 필요한 질문 한 가지를 얻는 데 의미를 두어도 충분합니다.')}<div class="reading-notes"><h4>내가 남길 세 가지</h4><p>이어갈 습관 __________</p><p>조절할 부담 __________</p><p>함께 이야기할 사람 __________</p><small>파일을 인쇄하거나 개인 메모에 옮겨 적어 보세요.</small></div></div>`);
}

function tojeongCautions(reading) {
  return READING_TOPICS.map(topic => {
    const source = topicEvidence(reading, topic, Infinity).find(s => /손재|구설|실패|욕심|경솔|분주|불리|조심|근심|신중/.test(s.text));
    return source ? { basis: `${source.label}의 ${topic.name} 관련 표현이 마음에 걸린다면`, action: topic.action } : null;
  }).filter(Boolean).slice(0, 3);
}
export function tojeongPremium(r, reading) {
  const l = r.birth.lunar, v = r.values;
  const cautions = tojeongCautions(reading);
  const practices = monthPractices(reading, r.code);
  const months = Array.from({ length: 12 }, (_, i) => {
    const text = reading.months[i + 1], practice = practices[i];
    return fold(`음력 ${i + 1}월 풀이`, practice?.name || '월별 원문', prose(text) + (practice ? `<div class="reading-month-help"><h4>이 달을 내 생활에 비춰 보기</h4>${p('원문의 ‘' + practice.source + '’에서 골라 본 행동입니다.')}${p(practice.action)}</div>` : ''), i === 0, `tj-month-${i + 1}`);
  }).join('');
  return chapter('tojeong', 'annual', `<p class="reading-intro">나의 괘 <b class="tojeong-code">${r.code}</b> · ${r.targetYear}년</p><p class="hint">${esc(TOJEONG.readingNote)}</p>${reading.interpretation ? p(reading.interpretation) + '<h3>원문</h3>' : ''}<div class="reading-prose">${prose(reading.chongun)}</div>${exercise('총운에서 내 상황과 닮은 대목 하나와 아직 맞지 않는 대목 하나를 골라 보세요. 어떤 조건이 달라지면 생각이 바뀔지도 함께 적으면 한 해를 돌아볼 기준이 됩니다.', '올해 가장 신경 쓰이는 일은 무엇이고, 그중 내가 바꿀 수 있는 것은 무엇인가요?')}`)
    + chapter('tojeong', 'themes', p('같은 괘의 총운과 월별 원문을 여섯 주제로 모았습니다. 인용된 대목과 생활 질문을 함께 읽어 보세요. 원문에 없는 분야의 운을 새로 만들어 판단하지 않습니다.') + topicsView(reading))
    + chapter('tojeong', 'months', p('달을 펼치면 원문 전체와 원문 주제에 맞는 생활 예시를 읽을 수 있습니다. 월별 풀이는 음력 기준이며, 윤달은 같은 월의 풀이를 읽습니다.') + months)
    + chapter('tojeong', 'plan', `<div class="reading-plan"><article><h3>시작하기 전</h3>${p('총운에서 고른 주제를 지금의 일정에 대입해 보세요. 이루고 싶은 결과와 이미 갖춘 준비를 구분하면 막연한 기대나 걱정을 줄이는 데 도움이 됩니다.')}</article><article><h3>달이 바뀔 때</h3>${p('그달의 풀이에서 내게 필요한 행동을 하나 골라 해보세요. 일이 잘 풀리면 도움이 된 행동을 남기고, 어렵다면 상황과 방법 중 무엇을 조정할 수 있는지 살펴보세요.')}</article><article><h3>한 해를 돌아볼 때</h3>${p('운세가 맞았는지뿐 아니라 실제로 어떤 선택을 했는지 돌아보세요. 계속할 습관, 그만둘 부담, 도움을 받은 사람을 남기면 다음 계획에 쓸 수 있습니다.')}</article></div>`)
    + chapter('tojeong', 'basis', `<dl class="reading-facts"><div><dt>풀이 기간</dt><dd>${r.period.start.y}.${r.period.start.m}.${r.period.start.d} ~ ${r.period.end.y}.${r.period.end.m}.${r.period.end.d} (양력)</dd></div><div><dt>음력 생일</dt><dd>${l.y}년 ${l.leap ? '윤' : ''}${l.m}월 ${l.d}일 · 세는나이 ${v.age}세</dd></div><div><dt>상괘 ${r.upper}</dt><dd>(세는나이 ${v.age} + 태세수 ${v.taese}) ÷ 8의 나머지 · ${esc(r.ganji.year)}년</dd></div><div><dt>중괘 ${r.middle}</dt><dd>(음력 생월 날수 ${v.monthDays} + 월건수 ${v.wolgeon}) ÷ 6의 나머지 · ${esc(r.ganji.month)}월</dd></div><div><dt>하괘 ${r.lower}</dt><dd>(음력 생일 ${v.birthDay} + 일진수 ${v.iljin}) ÷ 3의 나머지 · ${esc(r.ganji.day)}일</dd></div></dl>${p('나머지가 0이면 각각 8·6·3을 사용합니다. 음력 월의 간지를 사용하며 사주의 절기 월주와 다릅니다.')}${r.normalizedLeap ? p('윤달 생일을 같은 월의 평달로 계산했습니다.') : ''}${r.adjustedDay ? p('보는 해의 생일 달이 29일까지 있어 생일을 29일로 조정했습니다.') : ''}<p class="hint">해설: <a href="${TOJEONG.source}">molpass/mcp-tojeong</a> · © 2026 Lee, JungHoon · <a href="https://makeyourownday-fortune.com/licenses/mcp-tojeong.txt">MIT 라이선스</a></p>`)
    + closingView('tojeong', cautions);
}

function elementTable(charts, names) {
  return `<div class="reading-table-wrap"><table class="reading-table"><caption>원국 글자에 나타난 오행 개수</caption><thead><tr><th scope="col">오행</th>${names.map(n => `<th scope="col">${esc(n)}</th>`).join('')}</tr></thead><tbody>${ELEMENT_PRACTICE.map((e, i) => `<tr><th scope="row">${e.name}</th>${charts.map(c => `<td>${c.counts[i]}개</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
function annualTable(charts, names, today, count) {
  return `<div class="reading-table-wrap" tabindex="0" role="region" aria-label="연도별 점수 비교"><table class="reading-table"><caption>${today.y}–${today.y + count - 1}년 전체 흐름 · 모델 점수이며 사건 확률이 아닙니다</caption><thead><tr><th scope="col">연도</th>${names.map(n => `<th scope="col">${esc(n)} 종합</th><th scope="col">금전</th><th scope="col">애정</th>`).join('')}</tr></thead><tbody>${Array.from({ length: count }, (_, i) => { const y = today.y + i; return `<tr><th scope="row">${y}</th>${charts.map(c => { const r = year(c, y, 'next'); return `<td>${r.overall.score}</td><td>${r.cats.find(v => v.key === 'money').score}</td><td>${r.cats.find(v => v.key === 'love').score}</td>`; }).join('')}</tr>`; }).join('')}</tbody></table></div>`;
}
export function lifetimePremium(r, c, person, today) {
  const dm = r.dayMaster, nature = ELEMENT_PRACTICE[STEM_EL[c.dm]], balance = ELEMENT_PRACTICE[r.roles.yong];
  const living = [
    { title: '나에게 맞는 일의 방식', lines: [r.persona, `적성으로 제시된 일: ${r.career.jobs}`, `균형 보완 오행과 연결한 분야: ${r.career.industry}`, r.career.note], action: '직업 이름을 정답으로 고르기보다 지금 하는 일에서 좋아하는 역할과 지치는 역할을 나눠 보세요. 제시된 적성과 겹치는 작은 업무를 직접 경험해 보는 방법도 있습니다.', question: '지금 가진 경험 중 다시 맡고 싶은 일은 무엇인가요?' },
    { title: '재물을 대하는 태도', lines: r.wealth, action: '재물에 관한 성향을 수입·소비·공유의 습관과 대조해 보세요. 새로운 약속을 하기 전에는 감당할 범위와 서로 기대하는 책임을 분명히 해 두세요.', question: '돈과 관련해 내가 지키기 쉬운 규칙 하나는 무엇인가요?' },
    { title: '애정과 가까운 관계', lines: r.love, action: '인연에 관한 표현을 실제 상대의 성격으로 단정하기보다, 내가 편안한 관계에서 기대하는 것을 살펴보세요. 중요한 기대는 구체적인 말로 전해 보는 편이 좋습니다.', question: '함께 있을 때 지키고 싶은 거리와 나누고 싶은 시간은 어느 정도인가요?' },
    { title: '몸과 마음의 생활 리듬', lines: r.health, action: '일정이 몰리는 때와 쉴 수 있는 때를 함께 적어 보세요. 오행으로 몸 상태를 판단하지 말고 실제 피로와 생활 여건을 기준으로 리듬을 조절해 보세요.', question: '무리하지 않고 지속할 수 있는 하루의 습관은 무엇인가요?' },
  ];
  const cycles = r.daeun.map(d => fold(`${d.startYear}년부터 · ${d.pillarText} 대운${d.current ? ' (현재)' : ''}`, `${d.age}세부터 · ${d.keyword} · 종합 ${d.score}점`, p(`${d.tgS}은 ${T.tgMeaning[d.tgS]}, ${d.tgB}은 ${T.tgMeaning[d.tgB]}으로 해석합니다. 이 시기의 키워드는 ‘${d.keyword}’이며, 계산상 상대적으로 두드러지는 분야는 ${d.best}입니다.`) + p('대운은 긴 배경을 읽는 단위입니다. 이 기간 안에서도 해마다 흐름이 다르므로, 점수 하나로 중요한 결정의 날짜를 정하지 않고 아래 연도별 해설과 함께 살펴보세요.') + exercise(TEN_GOD_PRACTICE[d.tgB], '이 시기의 주제와 내 현재 역할 사이에 닮은 점은 무엇인가요?'), d.current)).join('');
  const events = lifeEventDetails(c, r.events).map(group => `<article class="reading-event-group"><h3>${group.name}</h3>${group.items.length ? group.items.map(item => fold(`${item.y}년 · ${item.badge}`, `${item.age}세 · ${item.why}`, p(item.summary) + p(item.selection) + (item.reasons.length ? `<dl class="reading-terms">${item.reasons.map(reason => `<div><dt>${esc(reason.term)}</dt><dd>${esc(reason.text)}</dd></div>`).join('')}</dl>` : '') + `<dl class="reading-score-list">${item.scores.map(s => `<div><dt>${s.name}</dt><dd>${s.score}점 · ${s.label}</dd></div>`).join('')}</dl>` + (item.timeNote ? `<p class="hint">${esc(item.timeNote)}</p>` : ''))).join('') : p('비교하는 15년 안에서 이 항목의 선정 기준에 해당하는 해가 없습니다. 실제 사건의 가능성이 없다는 뜻은 아닙니다.')}</article>`).join('');
  return chapter('lifetime', 'nature', `<p class="reading-intro">${esc(dm.title)} · ${esc(dm.image)}</p>${prose(dm.summary)}<div class="reading-duo"><div><h3>타고난 강점</h3>${list(dm.strengths)}</div><div><h3>다듬을 점</h3>${list(dm.weaknesses)}</div></div>${p(dm.advice)}${exercise(nature.text, nature.question)}`)
    + chapter('lifetime', 'balance', elementTable([c], [person.name || '나']) + p(r.strength.text) + r.elements.excess.map(p).join('') + r.elements.lack.map(p).join('') + p(`이 모델이 고른 균형 보완 오행은 ${balance.name}입니다. 생활에 비춰 볼 주제는 ‘${balance.focus}’입니다. 특정 색이나 물건으로 운이 바뀐다는 뜻은 아닙니다.`) + exercise(balance.text, balance.question))
    + chapter('lifetime', 'living', living.map(item => `<article class="reading-topic"><h3>${item.title}</h3>${item.lines.map(p).join('')}${exercise(item.action, item.question)}</article>`).join(''))
    + chapter('lifetime', 'cycles', p('대운은 10년 단위로 읽는 흐름입니다. 나이는 대운 시작 나이이며 계산 기준과 원국은 마지막 장에서 확인할 수 있습니다. 각 시기를 펼치면 십신의 뜻과 생활에 적용할 방법을 볼 수 있습니다.') + cycles)
    + chapter('lifetime', 'years', fold('15년 전체 흐름 비교', '선정된 해뿐 아니라 모든 해의 종합·금전·애정 점수', annualTable([c], [person.name || '나'], today, 15)) + events)
    + chapter('lifetime', 'basis', p(timeNote(c)) + chartCard(c, person, today))
    + closingView('lifetime', [{ basis: `내 성향에서 다듬을 점: ${dm.weaknesses.join(', ')}`, action: dm.advice }, { basis: `균형을 살펴볼 주제: ${balance.focus}`, action: periodPractice(['study-routine', 'study-explain', 'career-priority', 'career-scope', 'love-listening'][r.roles.yong], c.dm) }]);
}

export function compatibilityPremium(r, a, b, people, today) {
  const reasons = compatReasons(a, b);
  // 추천 탐색용 근거의 호칭을 실제 구매 대상 이름으로 바꾼다. 계산값은 그대로 둔다.
  const reasonText = text => text.replaceAll('기준 인물', r.nameA).replaceAll('추천 사주', `${r.nameB}의 사주`).replaceAll('기준 ', `${r.nameA} `).replaceAll('추천 ', `${r.nameB} `).replaceAll('기준 사주', `${r.nameA}의 사주`);
  const areas = r.cats.map(cat => { const guide = COMPAT_PRACTICE[cat.key]; return `<article class="reading-topic"><div class="reading-score-head"><h3>${cat.name} 궁합</h3><p><strong>${cat.score}</strong>점</p></div>${p(guide.meaning)}<dl class="reading-terms"><div><dt>두 사람의 계산 근거</dt><dd>${reasons[cat.key].map(reasonText).map(p).join('')}</dd></div></dl>${exercise(guide.agreement, guide.question)}</article>`; }).join('');
  const positives = items => items.filter(item => Number.isFinite(item.signal) && item.signal > 0);
  const marriage = positives(r.events.marriageYears), child = positives(r.events.childYears);
  const eventList = items => items.length ? items.map(item => `<div class="reading-year"><h4>${item.y}년 · ${pillarLabel(item.pillar)}</h4>${p(item.why)}</div>`).join('') : p('비교 기간에 선정 기준을 넘는 신호가 없습니다. 실제 결혼·출산의 가능성이나 결과를 뜻하지 않습니다.');
  const dates = marriage.some(v => v.y === r.events.bestYear) ? (r.events.weddingDates.length ? list(r.events.weddingDates.map(d => `${d.label} · ${pillarLabel(d.pillar)}일 · ${d.lunar}`)) : p('해당 연도에 남아 있는 추천 날짜가 없습니다.')) : p('결혼 신호가 선정 기준을 넘지 않아 날짜를 추천하지 않습니다.');
  const minimum = Math.min(...r.cats.map(cat => cat.score));
  const topics = { love: 'love-plans', talk: 'social-reply', personality: 'social-boundary', money: 'money-shared', family: 'social-roles' };
  const lowest = r.cats.filter(cat => cat.score === minimum).map(cat => ({
    basis: `${cat.name} ${cat.score}점 · 다섯 분야 중 가장 낮은 점수`,
    action: periodPractice(topics[cat.key], [a.dm, b.dm, cat.key].join('|')),
  }));
  return chapter('compatibility', 'together', `<div class="reading-score-head"><p class="reading-intro">${esc(r.headline)}</p><p><strong>${r.total}</strong>점</p></div>${r.lines.map(p).join('')}<div class="reading-duo">${[a, b].map((c, i) => `<article><h3>${esc(people[i].name || (i ? '상대' : '나'))}의 기본 성향</h3>${p(T.dayMaster[c.dm].summary)}${p(T.dayMaster[c.dm].advice)}</article>`).join('')}</div><p class="hint">종합과 분야별 점수는 원국 관계를 해석한 값이며 관계 만족도나 결혼 성공 확률이 아닙니다.</p>`)
    + chapter('compatibility', 'areas', areas)
    + chapter('compatibility', 'balance', elementTable([a, b], [r.nameA, r.nameB]) + r.complement.map(p).join('') + `<div class="reading-duo">${[a, b].map((c, i) => { const e = ELEMENT_PRACTICE[c.roles.yong]; return `<article><h3>${esc(i ? r.nameB : r.nameA)}에게 필요한 균형</h3>${p(`${e.name} · ${e.focus}`)}${p(e.text)}</article>`; }).join('')}</div>` + p('한쪽이 다른 쪽에게 필요한 오행을 갖고 있다는 해석과 실제로 상대를 돌볼 책임은 별개입니다. 각자의 생활을 지키면서 서로 원하는 도움을 확인해 보세요.'))
    + chapter('compatibility', 'practice', r.cautions.map(item => `<article class="reading-topic"><h3>${esc(item.title)}</h3>${p(item.text)}</article>`).join('') + exercise('의견이 갈리는 일 하나를 정해 각자의 이유를 먼저 말해 보세요. 바로 합의하기 어렵다면 지금 동의할 수 있는 작은 약속부터 정하고, 다시 이야기할 시간을 남겨 두세요.', '이번 주에 서로에게 덜 부담스럽게 바꿀 수 있는 약속은 무엇인가요?'))
    + chapter('compatibility', 'years', p(`결혼·재물은 ${today.y}–${today.y + 9}년, 자녀는 ${r.events.bestYear}–${r.events.bestYear + 10}년의 11개 연도를 비교했습니다. 신호는 전통 해석의 비교값이며 실제 사건의 예측이 아닙니다.`) + fold('두 사람의 10년 흐름 비교', '각자의 종합·금전·애정 점수를 나란히 보기', annualTable([a, b], [r.nameA, r.nameB], today, 10)) + `<article class="reading-event-group"><h3>결혼·인연의 신호</h3>${eventList(marriage)}${p('두 사람 중 한쪽에만 두드러지는 신호가 있을 수도 있습니다. 일정과 의사를 함께 확인하는 참고로 읽어 주세요.')}</article><article class="reading-event-group"><h3>자녀·돌봄의 신호</h3>${eventList(child)}${p('자녀에 관한 신호는 임신 가능성을 나타내는 점수가 아닙니다. 실제 계획은 두 사람의 의사와 생활 여건을 먼저 살펴보세요.')}</article><article class="reading-event-group"><h3>금전 점수가 상대적으로 높은 해</h3>${eventList(r.events.moneyYears)}${p('비교 기간 안에서 상대적으로 높다는 뜻이며 실제 수익을 보장하지 않습니다.')}</article>` + fold(`${r.events.bestYear}년 결혼 날짜 참고`, '두 사람의 일지·띠와 충돌 없는 주말 비교', dates + p('날짜의 전통적 조건만 비교한 값입니다. 실제 일정과 두 사람의 선택을 우선하며 결혼 결과를 보장하지 않습니다.')))
    + chapter('compatibility', 'basis', [a, b].map((c, i) => p(`${people[i].name || (i ? '상대' : '나')}: ${timeNote(c)}`) + chartCard(c, people[i], today)).join(''))
    + closingView('compatibility', [...lowest, ...r.cautions.slice(0, 1).map(c => ({ basis: c.title, action: c.text }))]);
}

export function reportDocument(title, body, date, productId) {
  body = body.replace(/<dialog[^>]*id="([^"]+)"[^>]*>\s*<div class="dialog-bar"><h2[^>]*>([\s\S]*?)<\/h2><button[\s\S]*?<\/button><\/div>([\s\S]*?)<\/dialog>/g, (_, id, heading, content) => `<details class="reading-fold" id="${id}"><summary>${heading}</summary>${content}</details>`)
    .replace(/href="\/(?!\/)/g, 'href="https://makeyourownday-fortune.com/');
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="referrer" content="no-referrer"><meta http-equiv="Content-Security-Policy" content="${REPORT_CSP}"><title>${esc(title)}</title><link rel="stylesheet" href="${fonts}"><style>${stylesheet}\n${reportStyle}</style></head><body><main class="download-report" data-reading-version="2"><header class="reading-cover"><p>make your own day</p><h1>${esc(title)}</h1><p>풀이 기준일 ${esc(date)} · 상세 풀이와 운세 파일</p></header>${reportToc(productId)}${body}<footer class="reading-footer"><p>이 파일에는 출생 정보가 포함되어 있습니다. 개인적으로 보관해 주세요.</p><p>인터넷 없이 본문을 읽고 접힌 내용을 펼칠 수 있습니다. 인쇄 메뉴에서 PDF로 보관할 수도 있습니다.</p></footer></main></body></html>`;
}

// 저장된 구매 원본은 불변으로 보존한다. 응답 시 스타일 갱신 및 복구 가능한 해설만 보강한다.
export function presentStoredReport(order) {
  if (order.html.includes('data-reading-version="2"')) return order.html.replace(/<style>[\s\S]*?<\/style>/, () => `<style>${stylesheet}\n${reportStyle}</style>`);
  let body = order.html.match(/<main class="download-report">([\s\S]*)<\/main>/)?.[1];
  if (!body) return order.html;
  const date = body.match(/풀이 기준일 (\d{4}-\d{2}-\d{2})/)?.[1] || '구매 당시 기준';
  body = body.replace(/^<header>[\s\S]*?<\/header>/, '').replace(/<footer>[\s\S]*?<\/footer>$/, '');
  // 예전 내보내기에서 숨겨졌던 주요 시기 설명을 스크립트 없는 펼침 보기로 복구한다.
  body = body.replace(/<dialog[^>]*id="([^"]+)"[^>]*>\s*<div class="dialog-bar"><h2[^>]*>([\s\S]*?)<\/h2><button[\s\S]*?<\/button><\/div>([\s\S]*?)<\/dialog>/g, (_, id, title, content) => `<details class="reading-fold" id="${id}"><summary>${title}</summary>${content}</details>`);
  body = body.replace(/<button[^>]*class="life-event-trigger"[^>]*>([\s\S]*?)<\/button>/g, '<div class="life-event-trigger">$1</div>');
  body = body.replace(/(<section id="tj-month-\d+")[^>]*>/g, '$1>');
  body = body.replace('class="card box tojeong-reading"', 'class="card box tojeong-reading" id="reading-annual"');
  // 중복 상품 제목은 이미 바깥 화면에 있고, 내부 링크는 다운로드 파일에서도 유효해야 한다.
  body = body.replace(/href="\/(?!\/)/g, 'href="https://makeyourownday-fortune.com/');
  const code = body.match(/class="tojeong-code"[^>]*>([1-8][1-6][1-3])</)?.[1];
  const extra = order.productId === 'tojeong' && readings[code] ? `<section class="reading-chapter"><h2>생활 속 여섯 가지 이야기</h2>${topicsView(readings[code])}</section>` : '';
  // 이전 주문에는 입력 원본이 없으므로 사주·점수를 다시 계산하지 않는다.
  return reportDocument(order.title, `<div class="reading-legacy">${body}</div>${extra}${closingView(order.productId, order.productId === 'tojeong' && readings[code] ? tojeongCautions(readings[code]) : [])}`, date, order.productId).replace(reportToc(order.productId), '<nav class="reading-toc" aria-label="운세 목차"><a href="#reading-original">구매 당시 풀이</a><a href="#reading-closing">풀이를 읽고 난 뒤</a></nav>').replace('class="reading-legacy"', 'class="reading-legacy" id="reading-original"');
}

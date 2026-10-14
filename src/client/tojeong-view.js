import { esc } from '../site/util.js';
import { TOJEONG } from '../content/tojeong.js';

const date = (d) => `${d.y}.${d.m}.${d.d}`;
function paragraphs(text) {
  const sentences = text.split(/(?<=[.!?])\s+/), groups = [];
  for (let i = 0; i < sentences.length; i += 3) groups.push(`<p>${esc(sentences.slice(i, i + 3).join(' '))}</p>`);
  return groups.join('');
}

export function tojeongView(result, reading, name = '') {
  const r = result, v = r.values, l = r.birth.lunar;
  if (!reading?.chongun || !Array.from({ length: 12 }, (_, i) => reading.months?.[i + 1]).every(Boolean)) throw new Error('토정비결 해설이 누락되었습니다.');
  const adjustments = [
    r.normalizedLeap ? '윤달 생일을 같은 월의 평달로 계산했습니다.' : '',
    r.adjustedDay ? `보는 해의 음력 ${l.m}월은 29일까지 있어 생일 ${l.d}일을 29일로 계산했습니다.` : '',
  ].filter(Boolean);
  return `<header class="card box tojeong-summary"><p class="eyebrow">${r.targetYear}년 · 144괘 중 나의 괘</p>
    <div class="tojeong-heading"><span class="tojeong-code" aria-label="괘 번호 ${r.code}">${r.code}</span><div><h2>${esc(name || '나')}의 토정비결</h2><p>상괘 ${r.upper} · 중괘 ${r.middle} · 하괘 ${r.lower}</p></div></div>
    <p class="muted">음력 ${l.y}년 ${l.leap ? '윤' : ''}${l.m}월 ${l.d}일생 · 세는나이 ${v.age}세</p>
    <p class="hint">풀이 기간: 양력 ${date(r.period.start)}~${date(r.period.end)}<br>설날부터 다음 설날 전날까지, 월별 풀이는 음력 기준입니다.</p>
    ${adjustments.length ? `<div class="note">${adjustments.map((t) => `<p>${esc(t)}</p>`).join('')}<p>이 사이트의 날짜 처리 기준이며 다른 판본과 결과가 달라질 수 있습니다.</p></div>` : ''}
  </header>
  <section class="card box tojeong-reading"><h2>한 해의 총운</h2><p class="hint">${esc(TOJEONG.readingNote)}</p><div class="prose">${paragraphs(reading.chongun)}</div></section>
  <section class="card box"><div><h2>음력 열두 달의 흐름</h2><p class="hint">달을 누르면 상세 풀이가 아래에 나타납니다. 윤달은 같은 월의 풀이를 읽습니다.</p></div>
    <div class="tojeong-months" role="group" aria-label="음력 월 선택">${Array.from({ length: 12 }, (_, i) => `<button type="button" id="tj-month-button-${i + 1}" data-tojeong-month="${i + 1}" aria-controls="tj-month-${i + 1}" aria-pressed="${i === 0}"><span>음력</span><b>${i + 1}월</b></button>`).join('')}</div>
    <div class="tojeong-month-detail">${Array.from({ length: 12 }, (_, i) => `<section id="tj-month-${i + 1}" role="region" aria-labelledby="tj-month-button-${i + 1}"${i ? ' hidden' : ''}><h3>음력 ${i + 1}월 풀이</h3><div class="prose">${paragraphs(reading.months[i + 1])}</div></section>`).join('')}</div>
  </section>
  <section class="card box"><h2>내 괘가 나온 과정</h2><dl class="tojeong-calculation">
    <div><dt>상괘 ${r.upper}</dt><dd>(세는나이 ${v.age} + 태세수 ${v.taese}) ÷ 8의 나머지</dd><dd>${esc(r.ganji.year)}년 · 나머지 0이면 8</dd></div>
    <div><dt>중괘 ${r.middle}</dt><dd>(음력 ${l.m}월 날수 ${v.monthDays} + 월건수 ${v.wolgeon}) ÷ 6의 나머지</dd><dd>${esc(r.ganji.month)}월 · 나머지 0이면 6</dd></div>
    <div><dt>하괘 ${r.lower}</dt><dd>(음력 생일 ${v.birthDay} + 일진수 ${v.iljin}) ÷ 3의 나머지</dd><dd>${esc(r.ganji.day)}일 · 나머지 0이면 3</dd></div>
  </dl><p class="hint">음력 월의 간지로 계산하며 사주의 절기 월주를 사용하지 않습니다.</p></section>
  <p class="hint">해설: <a href="${TOJEONG.source}" target="_blank" rel="noopener">molpass/mcp-tojeong</a> · © 2026 Lee, JungHoon · <a href="/licenses/mcp-tojeong.txt">MIT 라이선스</a></p>`;
}

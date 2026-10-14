import LEADERS from '../content/rank-leaders.js';
import TABLE from '../content/rank-table.js';
import { RANK_CATS } from '../engine/rank.js';
import { analyze, birthTimesFor } from '../engine/chart.js';
import { rankHighlights } from '../engine/rank-guidance.js';
import { pillarKo, pillarH } from '../engine/core.js';
import { resolveBirthTime } from '../domain/birth-time.js';
import { esc } from '../site/util.js';

const PILLAR_LABELS = [['year', '년주'], ['month', '월주'], ['day', '일주'], ['hour', '시주']];
const dateText = (p) => `${p.y}년 ${p.m}월 ${p.d}일`;
const timeText = (p) => p.timeBranch ? resolveBirthTime(p.timeBranch, birthTimesFor(p).off)?.label || '시진 확인 필요' : '시간 모름 · 3기둥';
const pillars = (p) => `<dl class="leader-pillars">${PILLAR_LABELS.map(([key, name]) => `<div><dt>${name}</dt><dd>${p[key] ? `${pillarH(p[key])}<small>${pillarKo(p[key])}</small>` : '—<small>시간 모름</small>'}</dd></div>`).join('')}</dl>`;
const highlightList = (items, empty) => items.length ? `<ul>${items.map((i) => `<li><b>${i.name} · 평균 대비 ${i.pts > 0 ? '+' : ''}${i.pts}점</b><p>${esc(i.text)}</p></li>`).join('')}</ul>` : `<p>${empty}</p>`;

export function rankLeadersView(r) {
  const kind = r.withHour ? 'four' : 'three';
  const categories = [['total', '종합'], ...RANK_CATS];
  return `<section class="box card rank-leaders"><div class="sec-head"><h3>명예의 전당 · 상위 대표 5개</h3><label class="leader-filter">분야<select class="input" data-leader-category aria-label="명예의 전당 분야">${categories.map(([k, n]) => `<option value="${k}">${n}</option>`).join('')}</select></label></div>
    <p class="hint">양력 출생일과 시진을 입력해 같은 원국이 나오는지 확인한 조합입니다. 순위는 전체 이론 조합 기준이며, 같은 점수는 공동 순위입니다. 실제 인물의 생년월일을 수집한 자료가 아닙니다.</p>
    ${categories.map(([key, name]) => `<div data-leader-panel="${key}"${key !== 'total' ? ' hidden' : ''}><ol class="leader-list">${LEADERS[kind][key].map((s, i) => {
      const id = `leader-${key}-${i}`;
      const h = rankHighlights(analyze(s.pillars), TABLE[kind].avg);
      const first = s.examples[0];
      return `<li><button class="leader-button" type="button" data-dialog="${id}" aria-haspopup="dialog" aria-controls="${id}"><b class="leader-place">${s.rank}위</b><span class="leader-summary"><b>${pillarKo(s.pillars.day)}일주</b><span class="leader-date">양력 ${dateText(first)}</span><small>${timeText(first)}</small></span><strong class="leader-score">${s.score}<small>점</small></strong><span class="leader-preview"><span>강점 · ${h.strengths[0]?.name || '분야별 점수 확인'}</span><span>보완 · ${h.weaknesses[0]?.name || `${h.weakest.name} ${h.weakest.score}점`}</span></span><span class="leader-open">년월일시주·장단점 보기</span></button>
        <dialog class="character-dialog rank-dialog" id="${id}" aria-labelledby="${id}-title"><div class="dialog-bar"><h2 id="${id}-title">${name} ${s.rank}위 · ${pillarKo(s.pillars.day)}일주</h2><button class="sbtn" type="button" data-close-dialog autofocus>닫기 ×</button></div><div class="leader-detail">
        <section class="leader-birth"><h3>계산기에 넣어 볼 출생 정보</h3>${s.examples.map((p) => `<p><b>양력 ${dateText(p)}</b><span>${timeText(p)}</span></p>`).join('')}<p class="hint">사이트의 시진 선택 기준으로 검증했습니다. 성별은 원국 랭킹 점수에 영향을 주지 않습니다.</p></section>
        ${pillars(s.pillars)}
        <div class="comparison"><div><span>대표 조합</span><b>${s.score}점</b></div><div><span>내 ${name} 점수</span><b>${key === 'total' ? r.total : r.cats.find((c) => c.key === key).score}점</b></div></div>
        <div class="leader-traits"><section><h3>이 사주의 장점</h3>${highlightList(h.strengths, '평균보다 뚜렷하게 높은 항목은 없습니다.')}</section><section><h3>단점·보완할 점</h3>${highlightList(h.weaknesses, '평균보다 낮은 종합 평가 항목은 없습니다. 분야별 강약도 함께 살펴보세요.')}<p class="weakest-category">상대적으로 약한 분야: ${h.weakest.name} ${h.weakest.score}점</p></section></div>
        <dl class="leader-categories">${RANK_CATS.map(([k, n]) => `<div><dt>${n}</dt><dd>${s.cats[k]}점</dd></div>`).join('')}</dl>
        <p class="hint">동점 ${s.tied.toLocaleString('ko-KR')}개 이론 조합 · 종합 ${s.tier}등급. 출생 정보는 같은 간지 조합의 입력 예시이며, 운세·건강·성공을 보장하지 않습니다.</p></div></dialog></li>`;
    }).join('')}</ol></div>`).join('')}</section>`;
}

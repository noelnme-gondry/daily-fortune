import { tr } from '../i18n/runtime.js';
import { term } from '../i18n/terms.js';
import LEADERS from '../content/rank-leaders.js';
import TABLE from '../content/rank-table.js';
import { RANK_CATS, PARTS, rankScore } from '../engine/rank.js';
import { analyze } from '../engine/chart.js';
import { rankHighlights } from '../engine/rank-guidance.js';
import { pillarKo, pillarH, pillarLabel } from '../engine/core.js';
import { esc } from '../site/util.js';
import { RANKING_LIMIT, rankingPage } from '../domain/ranking-list.js';
import { rankingPagination, restorePaginationFocus } from './ranking-pagination.js';

const PILLAR_LABELS = [['year', '년주'], ['month', '월주'], ['day', '일주']];
const dateText = (p) => tr(`${p.y}년 ${p.m}월 ${p.d}일`, `${p.y}-${String(p.m).padStart(2, '0')}-${String(p.d).padStart(2, '0')}`);
const pillars = (p) => `<dl class="leader-pillars">${PILLAR_LABELS.map(([key, name]) => `<div><dt>${term(name)}</dt><dd>${pillarH(p[key])}<small>${tr(pillarKo(p[key]), pillarLabel(p[key]))}</small></dd></div>`).join('')}</dl>`;
const highlightList = (items, empty) => items.length ? `<ul>${items.map((i) => `<li><b>${i.name} · ${tr("평균 대비", "vs. average")} ${i.pts > 0 ? '+' : ''}${i.pts}${tr("점", " pts")}</b><p>${esc(i.text)}</p></li>`).join('')}</ul>` : `<p>${empty}</p>`;

export function rankLeadersView(r) {
  const categories = [['total', tr("종합", "Overall")], ...RANK_CATS];
  return `<section class="box card rank-leaders"><div class="sec-head"><h3>${tr(`명예의 전당 · 상위 대표 ${RANKING_LIMIT}개`, `Hall of Fame · Top ${RANKING_LIMIT} examples`)}</h3><label class="leader-filter">${tr("분야", "Category")}<select class="input" data-leader-category aria-label="${tr("명예의 전당 분야", "Hall of Fame category")}">${categories.map(([k, n]) => `<option value="${k}">${n}</option>`).join('')}</select></label></div>
    <p class="hint">${tr(`출생시간을 제외한 년·월·일주(3기둥) ${TABLE.three.n.toLocaleString('ko-KR')}개 조합에서 뽑았습니다. 내 시간 입력 여부와 관계없이 같은 목록을 보여주며, 나와의 궁합은 반영하지 않습니다. 선택한 분야의 1위부터 보여주고 같은 점수는 공동 순위입니다. 양력 출생일은 같은 원국이 재현되는 경우에만 표시하며, 실제 인물의 생년월일을 수집한 자료가 아닙니다.`, `Selected from ${TABLE.three.n.toLocaleString('en-US')} year–month–day (three-pillar) combinations without birth time. Everyone sees the same list, regardless of time input or personal compatibility. Each category starts at rank 1, with ties sharing a rank. Solar birth dates appear only when they reproduce the chart; these are not collected records of real people.`)}</p>
    ${categories.map(([key]) => `<div data-leader-panel="${key}"${key !== 'total' ? ' hidden' : ''}>${key === 'total' ? rankLeadersPage(r, key) : ''}</div>`).join('')}</section>`;
}

function rankLeadersPage(r, key, requested = 1) {
  const name = key === 'total' ? tr("종합", "Overall") : RANK_CATS.find(([k]) => k === key)[1];
  const page = rankingPage(LEADERS.three[key], requested);
  const listId = `leader-${key}-list`;
  return `<ol class="leader-list" id="${listId}" start="${page.start + 1}">${page.items.map((s, offset) => {
      const i = page.start + offset;
      const id = `leader-${key}-${i}`;
      const h = rankHighlights(analyze(s.pillars), TABLE.three.avg);
      const calculation = rankScore(analyze(s.pillars));
      const first = s.examples[0];
      return `<li><button class="leader-button" type="button" data-dialog="${id}" aria-haspopup="dialog" aria-controls="${id}"><b class="leader-place">${tr(`${s.rank}위`, `#${s.rank}`)}</b><span class="leader-summary"><b>${tr(`${pillarKo(s.pillars.day)}일주`, `${pillarLabel(s.pillars.day)} day pillar`)}</b><span class="leader-date">${first ? tr(`양력 ${dateText(first)}`, `Solar date ${dateText(first)}`) : tr("양력 출생일 미확인", "Solar birth date unverified")}</span></span><strong class="leader-score">${s.score}<small>${tr("점", "pts")}</small></strong><span class="leader-preview"><span>${tr("강점", "Strength")} · ${h.strengths[0]?.name || tr("분야별 점수 확인", "See category scores")}</span><span>${tr("보완", "Support")} · ${h.weaknesses[0]?.name || `${h.weakest.name} ${h.weakest.score}${tr("점", " pts")}`}</span></span><span class="leader-open">${tr("사주 구성·장단점 보기", "View chart, strengths and weaknesses")}</span></button>
        <dialog class="character-dialog rank-dialog" id="${id}" aria-labelledby="${id}-title"><div class="dialog-bar"><h2 id="${id}-title">${name} ${tr(`${s.rank}위`, `#${s.rank}`)} · ${tr(`${pillarKo(s.pillars.day)}일주`, `${pillarLabel(s.pillars.day)} day pillar`)}</h2><button class="sbtn" type="button" data-close-dialog autofocus>${tr("닫기 ×", "Close ×")}</button></div><div class="leader-detail">
        <section class="leader-birth"><h3>${tr("출생 정보", "Birth details")}</h3>${first ? `${s.examples.map((p) => `<p><b>${tr("양력", "Solar date")} ${dateText(p)}</b></p>`).join('')}<p class="hint">${tr("출생시간을 제외한 입력으로 검증했습니다. 성별은 원국 랭킹 점수에 영향을 주지 않습니다.", "Verified using inputs without birth time. Gender does not affect birth-chart ranking scores.")}</p>` : `<p>${tr('이 원국과 일치하는 양력 출생일은 미확인입니다.', 'No solar birth date has been verified for this chart.')}</p><p class="hint">${tr('점수와 순위는 아래 원국 조합으로 계산했습니다.', 'Scores and ranks were calculated from the pillar combination below.')}</p>`}</section>
        ${pillars(s.pillars)}
        <section><div class="comparison"><div><span>${tr("대표 조합", "Example combination")}</span><b>${s.score}${tr("점", " pts")}</b></div><div><span>${tr(`내 ${name} 점수 (시간 제외)`, `My ${name} score (no birth time)`)}</span><b>${key === 'total' ? r.total : r.cats.find((c) => c.key === key).score}${tr('점', ' pts')}</b></div></div><p class="hint">${tr("두 점수 모두 출생시간을 제외한 기준입니다. 시간을 반영한 위의 개인 분석 점수와는 다를 수 있습니다.", "Both scores exclude birth time. They may differ from the personal analysis above when it includes a birth time.")}</p></section>
        <div class="leader-traits"><section><h3>${tr("이 사주의 장점", "Strengths of this chart")}</h3>${highlightList(h.strengths, tr("평균보다 뚜렷하게 높은 항목은 없습니다.", "No components stand clearly above average."))}</section><section><h3>${tr("단점·보완할 점", "Weaknesses and areas to support")}</h3>${highlightList(h.weaknesses, tr("평균보다 낮은 종합 평가 항목은 없습니다. 분야별 강약도 함께 살펴보세요.", "No overall assessment components fall below average. Also check the strengths and weaknesses of each category."))}<p class="weakest-category">${tr("상대적으로 약한 분야:", "Relatively weaker area:")} ${h.weakest.name} ${h.weakest.score}${tr("점", " pts")}</p></section></div>
        <dl class="leader-categories">${RANK_CATS.map(([k, n]) => `<div><dt>${n}</dt><dd>${s.cats[k]}${tr("점", " pts")}</dd></div>`).join('')}</dl>
        <section class="rank-calculation"><h3>${tr(`종합 ${calculation.total}점은 어떻게 계산했나요?`, `How was the overall score of ${calculation.total} calculated?`)}</h3><p>${tr("종합은 위 5개 분야의 평균이 아닙니다. 기본 12점에 아래 항목을 더하고, 충돌 등 감점까지 반영한 별도 점수입니다.", "The overall score is separate from the average of the five categories. It starts at 12 points, adds the components below, and includes deductions such as clashes.")}</p><dl><div><dt>${tr("기본 점수", "Base score")}</dt><dd>12${tr("점", " pts")}</dd></div>${PARTS.map(([k, n]) => `<div><dt>${n}</dt><dd data-rank-part="${k}">${calculation.parts[k].toLocaleString('ko-KR', { maximumFractionDigits: 2 })}${tr('점', ' pts')}</dd></div>`).join('')}</dl><p class="hint">${tr("합산 후 0~100점 범위에서 소수 첫째 자리까지 반올림합니다. 항목별 표시는 소수 둘째 자리까지이며, 실제 계산에는 반올림 전 값을 사용합니다. 재물·매력 등 분야별 점수는 각 분야의 별도 기준으로 계산합니다.", "The sum is capped at 0–100 and rounded to one decimal place. Components display two decimal places, but calculations use unrounded values. Category scores such as wealth and attraction use separate criteria.")}</p></section>
        <p class="hint">${tr(`동점 ${s.tied.toLocaleString('ko-KR')}개 이론 조합 · 종합 ${s.tier}등급. 운세·건강·성공을 보장하지 않습니다.`, `${s.tied.toLocaleString('en-US')} theoretical combinations share this score · Overall tier ${s.tier}. No guarantee of fortune, health or success.`)}</p></div></dialog></li>`;
    }).join('')}</ol>${rankingPagination(page, listId, tr("명예의 전당", "Hall of Fame"))}`;
}

export function mountRankLeaders(root, rank) {
  const filter = root.querySelector('[data-leader-category]');
  const show = (page = 1) => {
    root.querySelectorAll('[data-leader-panel]').forEach((panel) => {
      panel.hidden = panel.dataset.leaderPanel !== filter.value;
      panel.innerHTML = panel.hidden ? '' : rankLeadersPage(rank, filter.value, page);
    });
  };
  filter.addEventListener('change', () => show());
  root.addEventListener('click', (event) => {
    const button = event.target.closest('[data-ranking-page]');
    if (!button || button.disabled) return;
    show(Number(button.dataset.rankingPage));
    restorePaginationFocus(root, button);
  });
}

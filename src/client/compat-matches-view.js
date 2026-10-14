import { COMPAT_CATEGORIES } from '../engine/compat.js';
import { pillarH, pillarKo } from '../engine/core.js';
import { esc } from '../site/util.js';
import { matchYearRange } from '../domain/compat-matches.js';
import { RANKING_LIMIT, rankingPage } from '../domain/ranking-list.js';
import { rankingPagination, restorePaginationFocus } from './ranking-pagination.js';

const categoryName = (key) => COMPAT_CATEGORIES.find(([k]) => k === key)?.[1];
const dateText = (p) => `${p.y}년 ${p.m}월 ${p.d}일`;

export function compatMatchesShell(a, b) {
  return `<section class="box card compat-matches" aria-labelledby="compat-matches-title">
    <h3 id="compat-matches-title">나와 잘 맞는 사주 · 상위 ${RANKING_LIMIT}개</h3>
    <p class="hint">누구를 기준으로 볼까요? 위의 두 사람 궁합은 그대로 두고, 선택한 사람과 잘 맞는 사주를 찾습니다.</p>
    <div class="compat-match-controls"><div class="compat-match-person" role="group" aria-label="추천 기준 인물">${[['a', '나', a], ['b', '상대', b]].map(([key, label, chart]) => `<button type="button" class="sbtn" data-match-base="${key}" aria-pressed="${key === 'a'}" aria-controls="compat-match-results">${label}${chart.name ? ` · ${esc(chart.name)}` : ''}</button>`).join('')}</div>
    <label class="leader-filter">분야<select class="input" data-match-category aria-label="궁합 추천 분야" aria-controls="compat-match-results">${COMPAT_CATEGORIES.map(([k, n]) => `<option value="${k}">${n}</option>`).join('')}</select></label></div>
    <p class="hint" data-match-scope></p><p class="compat-match-status" data-match-status role="status" aria-live="polite"></p>
    <button type="button" class="sbtn" data-match-retry hidden>다시 찾기</button>
    <div id="compat-match-results" data-match-results aria-busy="true"></div>
    <p class="hint">입력한 다른 사람의 성별을 추천 조건으로 사용합니다. 출생연도 전후 10년 중 1930년부터 오늘까지, 12시진 원국을 검토해 출생일이 확인된 조합을 보여줍니다. 실제 인물 목록이 아니며, 점수는 관계의 성공 확률이 아닙니다.</p>
    <div data-match-pagination></div>
  </section>`;
}

function rowsHtml(result, category, side, page) {
  const rows = page.items;
  if (!rows.length) return '<p>이 범위에서 출생일이 확인되는 추천 사주를 찾지 못했습니다.</p>';
  return `<ol class="leader-list" id="compat-match-list" start="${page.start + 1}">${rows.map((r, i) => {
    const id = `compat-match-${side}-${category}-${page.start + i}`;
    const weakest = COMPAT_CATEGORIES.filter(([k]) => k !== 'total').slice().sort(([a], [b]) => r.scores[a] - r.scores[b])[0];
    return `<li><button type="button" class="leader-button" data-dialog="${id}" aria-haspopup="dialog" aria-controls="${id}">
      <b class="leader-place">${r.rank}위</b><span class="leader-summary"><b>${r.input.y}년생 · 만 ${r.age}세</b><span class="leader-date">양력 ${dateText(r.input)}</span><small>${pillarKo(r.pillars.day)}일주 · ${esc(r.timeLabel)}</small></span>
      <strong class="leader-score">${r.score}<small>점</small></strong>
      <span class="leader-preview compat-match-reasons">${r.reasons[category].map((t) => `<span>${esc(t)}</span>`).join('')}</span><span class="leader-open">사주·분야별 궁합 자세히 보기</span></button>
      <dialog class="character-dialog rank-dialog" id="${id}" aria-labelledby="${id}-title"><div class="dialog-bar"><h2 id="${id}-title">${categoryName(category)} 궁합 ${r.rank}위 · ${r.score}점</h2><button type="button" class="sbtn" data-close-dialog autofocus>닫기 ×</button></div>
      <div class="leader-detail"><section class="leader-birth"><h3>${r.input.y}년생 · 만 ${r.age}세</h3><p>양력 ${dateText(r.input)}<span>${esc(r.timeLabel)} · ${result.candidateGender === 'F' ? '여성' : '남성'}</span></p></section>
      <dl class="leader-pillars">${[['year', '년주'], ['month', '월주'], ['day', '일주'], ['hour', '시주']].map(([k, n]) => `<div><dt>${n}</dt><dd>${pillarH(r.pillars[k])}<small>${pillarKo(r.pillars[k])}</small></dd></div>`).join('')}</dl>
      <dl class="leader-categories compat-match-scores">${COMPAT_CATEGORIES.map(([k, n]) => `<div><dt>${n}</dt><dd data-match-score="${k}">${r.scores[k]}점</dd></div>`).join('')}</dl>
      <section><h3>이 분야에서 잘 맞는 이유</h3><ul class="compat-match-detail-reasons">${r.reasons[category].map((t) => `<li>${esc(t)}</li>`).join('')}</ul></section>
      <p class="hint">상대적으로 낮은 분야: ${weakest[1]} ${r.scores[weakest[0]]}점. 종합과 분야별 궁합은 각각의 기준으로 계산합니다.</p></div></dialog></li>`;
  }).join('')}</ol>`;
}

export function mountCompatMatches(root, inputs, charts, today) {
  const status = root.querySelector('[data-match-status]');
  const scope = root.querySelector('[data-match-scope]');
  const results = root.querySelector('[data-match-results]');
  const filter = root.querySelector('[data-match-category]');
  const retry = root.querySelector('[data-match-retry]');
  const pagination = root.querySelector('[data-match-pagination]');
  const cache = new Map();
  let side = 'a', worker, generation = 0, currentPage = 1;
  const stop = () => { generation++; worker?.terminate(); worker = null; };
  const show = () => {
    const result = cache.get(side);
    if (!result) return;
    const page = rankingPage(result.rankings[filter.value], currentPage);
    currentPage = page.page;
    results.innerHTML = rowsHtml(result, filter.value, side, page);
    pagination.innerHTML = rankingPagination(page, 'compat-match-list', '궁합 추천');
    results.setAttribute('aria-busy', 'false');
    status.textContent = `${categoryName(filter.value)} 상위 ${result.rankings[filter.value].length}개 · 같은 점수는 공동 순위입니다.`;
  };
  const search = () => {
    stop();
    currentPage = 1;
    const active = generation;
    const other = side === 'a' ? 'b' : 'a';
    const base = charts[side];
    const range = matchYearRange(base.birth.y, today);
    root.querySelector('h3').textContent = `${side === 'a' ? '나' : '상대'}와 잘 맞는 사주 · 상위 ${RANKING_LIMIT}개`;
    root.querySelectorAll('[data-match-base]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.matchBase === side)));
    scope.textContent = `양력 ${base.birth.y}년생 기준 · ${range.from}~${range.to}년생 · ${charts[other].gender === 'F' ? '여성' : '남성'} 사주 · 나이는 ${dateText(today)} 기준${base.hasTime ? '' : ' · 기준 인물은 출생 시간 제외'}`;
    retry.hidden = true;
    if (cache.has(side)) { show(); return; }
    results.innerHTML = '';
    pagination.innerHTML = '';
    results.setAttribute('aria-busy', 'true');
    status.textContent = '범위 안에서 잘 맞는 사주를 찾고 있습니다…';
    const fail = () => {
      if (generation !== active) return;
      stop();
      status.textContent = '추천을 계산하지 못했습니다. 다시 시도해 주세요.';
      results.setAttribute('aria-busy', 'false');
      retry.hidden = false;
    };
    try {
      worker = new Worker(new URL('./compat-matches.worker.js', import.meta.url), { type: 'module' });
      worker.onerror = fail;
      worker.onmessage = ({ data }) => {
        if (generation !== active) return;
        if (data.type === 'progress') status.textContent = data.progress.phase === 'verify' ? `${categoryName(data.progress.category)} 상위 사주의 출생일을 확인하고 있습니다…` : '범위 안에서 분야별 궁합을 계산하고 있습니다…';
        else if (data.type === 'result') { cache.set(side, data.result); stop(); show(); }
        else fail();
      };
      worker.postMessage({ base: inputs[side], gender: charts[other].gender, today });
    } catch { fail(); }
  };
  root.querySelectorAll('[data-match-base]').forEach((b) => b.addEventListener('click', () => {
    if (b.dataset.matchBase === side) return;
    side = b.dataset.matchBase;
    search();
  }));
  filter.addEventListener('change', () => { currentPage = 1; show(); });
  root.addEventListener('click', (event) => {
    const button = event.target.closest('[data-ranking-page]');
    if (!button || button.disabled) return;
    currentPage = Number(button.dataset.rankingPage);
    show();
    restorePaginationFocus(root, button);
  });
  retry.addEventListener('click', search);
  search();
  return stop;
}

import { tr, isEnglish } from '../i18n/runtime.js';
import { term } from '../i18n/terms.js';
import { COMPAT_CATEGORIES } from '../engine/compat.js';
import { pillarH, pillarKo, pillarLabel } from '../engine/core.js';
import { esc } from '../site/util.js';
import { matchYearRange } from '../domain/compat-matches.js';
import { RANKING_LIMIT, rankingPage } from '../domain/ranking-list.js';
import { rankingPagination, restorePaginationFocus } from './ranking-pagination.js';

const categoryName = (key) => COMPAT_CATEGORIES.find(([k]) => k === key)?.[1];
const dateText = (p) => tr(`${p.y}년 ${p.m}월 ${p.d}일`, `${p.y}-${String(p.m).padStart(2, '0')}-${String(p.d).padStart(2, '0')}`);

export function compatMatchesShell(a, b) {
  return `<section class="box card compat-matches" aria-labelledby="compat-matches-title">
    <h3 id="compat-matches-title">${tr(`나와 잘 맞는 사주 · 상위 ${RANKING_LIMIT}개`, `Saju matches for me · Top ${RANKING_LIMIT}`)}</h3>
    <p class="hint">${tr("누구를 기준으로 볼까요? 위의 두 사람 궁합은 그대로 두고, 선택한 사람과 잘 맞는 사주를 찾습니다.", "Choose a person to find compatible charts for. The two-person compatibility result above stays the same.")}</p>
    <div class="compat-match-controls"><div class="compat-match-person" role="group" aria-label="${tr("추천 기준 인물", "Person to match")}">${[['a', tr('나', 'Me'), a], ['b', tr('상대', 'Partner'), b]].map(([key, label, chart]) => `<button type="button" class="sbtn" data-match-base="${key}" aria-pressed="${key === 'a'}" aria-controls="compat-match-results">${label}${chart.name ? ` · ${esc(chart.name)}` : ''}</button>`).join('')}</div>
    <label class="leader-filter">${tr("분야", "Category")}<select class="input" data-match-category aria-label="${tr("궁합 추천 분야", "Compatibility category")}" aria-controls="compat-match-results">${COMPAT_CATEGORIES.map(([k, n]) => `<option value="${k}">${n}</option>`).join('')}</select></label></div>
    <p class="hint" data-match-scope></p><p class="compat-match-status" data-match-status role="status" aria-live="polite"></p>
    <button type="button" class="sbtn" data-match-retry hidden>${tr("다시 찾기", "Try again")}</button>
    <div id="compat-match-results" data-match-results aria-busy="true"></div>
    <p class="hint">${tr("입력한 다른 사람의 성별을 추천 조건으로 사용합니다. 출생연도 전후 10년 중 1930년부터 오늘까지, 12시진 원국을 검토해 출생일이 확인된 조합을 보여줍니다. 실제 인물 목록이 아니며, 점수는 관계의 성공 확률이 아닙니다.", "Candidates use the other person’s entered gender. We examine all 12 birth-hour branches within 10 years of the selected birth year, limited to 1930 through today, and show combinations with verified birth dates. This is not a list of real people, and scores are not probabilities of relationship success.")}</p>
    <div data-match-pagination></div>
  </section>`;
}

function rowsHtml(result, category, side, page) {
  const rows = page.items;
  if (!rows.length) return `<p>${tr('이 범위에서 출생일이 확인되는 추천 사주를 찾지 못했습니다.', 'No matching charts with verified birth dates were found in this range.')}</p>`;
  return `<ol class="leader-list" id="compat-match-list" start="${page.start + 1}">${rows.map((r, i) => {
    const id = `compat-match-${side}-${category}-${page.start + i}`;
    const weakest = COMPAT_CATEGORIES.filter(([k]) => k !== 'total').slice().sort(([a], [b]) => r.scores[a] - r.scores[b])[0];
    return `<li><button type="button" class="leader-button" data-dialog="${id}" aria-haspopup="dialog" aria-controls="${id}">
      <b class="leader-place">${tr(`${r.rank}위`, `#${r.rank}`)}</b><span class="leader-summary"><b>${tr(`${r.input.y}년생 · 만 ${r.age}세`, `Born ${r.input.y} · age ${r.age}`)}</b><span class="leader-date">${tr("양력", "Solar date")} ${dateText(r.input)}</span><small>${tr(`${pillarKo(r.pillars.day)}일주`, `${pillarLabel(r.pillars.day)} day pillar`)} · ${esc(r.timeLabel)}</small></span>
      <strong class="leader-score">${r.score}<small>${tr("점", "pts")}</small></strong>
      <span class="leader-preview compat-match-reasons">${r.reasons[category].map((t) => `<span>${esc(t)}</span>`).join('')}</span><span class="leader-open">${tr("사주·분야별 궁합 자세히 보기", "View chart and compatibility details")}</span></button>
      <dialog class="character-dialog rank-dialog" id="${id}" aria-labelledby="${id}-title"><div class="dialog-bar"><h2 id="${id}-title">${categoryName(category)} ${tr("궁합", "compatibility")} ${tr(`${r.rank}위`, `#${r.rank}`)} · ${r.score}${tr("점", " pts")}</h2><button type="button" class="sbtn" data-close-dialog autofocus>${tr("닫기 ×", "Close ×")}</button></div>
      <div class="leader-detail"><section class="leader-birth"><h3>${tr(`${r.input.y}년생 · 만 ${r.age}세`, `Born ${r.input.y} · age ${r.age}`)}</h3><p>${tr("양력", "Solar date")} ${dateText(r.input)}<span>${esc(r.timeLabel)} · ${result.candidateGender === 'F' ? tr("여성", "Female") : tr("남성", "Male")}</span></p></section>
      <dl class="leader-pillars">${[['year', '년주'], ['month', '월주'], ['day', '일주'], ['hour', '시주']].map(([k, n]) => `<div><dt>${term(n)}</dt><dd>${pillarH(r.pillars[k])}<small>${tr(pillarKo(r.pillars[k]), pillarLabel(r.pillars[k]))}</small></dd></div>`).join('')}</dl>
      <dl class="leader-categories compat-match-scores">${COMPAT_CATEGORIES.map(([k, n]) => `<div><dt>${term(n)}</dt><dd data-match-score="${k}">${r.scores[k]}${tr("점", " pts")}</dd></div>`).join('')}</dl>
      <section><h3>${tr("이 분야에서 잘 맞는 이유", "Why this category matches")}</h3><ul class="compat-match-detail-reasons">${r.reasons[category].map((t) => `<li>${esc(t)}</li>`).join('')}</ul></section>
      <p class="hint">${tr(`상대적으로 낮은 분야: ${weakest[1]} ${r.scores[weakest[0]]}점. 종합과 분야별 궁합은 각각의 기준으로 계산합니다.`, `Lower-scoring area: ${weakest[1]} ${r.scores[weakest[0]]} pts. Overall and category compatibility use separate criteria.`)}</p></div></dialog></li>`;
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
    pagination.innerHTML = rankingPagination(page, 'compat-match-list', tr("궁합 추천", "Compatibility matches"));
    results.setAttribute('aria-busy', 'false');
    status.textContent = tr(`${categoryName(filter.value)} 상위 ${result.rankings[filter.value].length}개 · 같은 점수는 공동 순위입니다.`, `${categoryName(filter.value)} top ${result.rankings[filter.value].length} · Equal scores share a rank.`);
  };
  const search = () => {
    stop();
    currentPage = 1;
    const active = generation;
    const other = side === 'a' ? 'b' : 'a';
    const base = charts[side];
    const range = matchYearRange(base.birth.y, today);
    root.querySelector('h3').textContent = tr(`${side === 'a' ? '나' : '상대'}와 잘 맞는 사주 · 상위 ${RANKING_LIMIT}개`, `Saju matches for ${side === 'a' ? 'me' : 'my partner'} · Top ${RANKING_LIMIT}`);
    root.querySelectorAll('[data-match-base]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.matchBase === side)));
    scope.textContent = tr(`양력 ${base.birth.y}년생 기준 · ${range.from}~${range.to}년생 · ${charts[other].gender === 'F' ? tr("여성", "Female") : tr("남성", "Male")} 사주 · 나이는 ${dateText(today)} 기준${base.hasTime ? '' : ' · 기준 인물은 출생 시간 제외'}`, `Based on birth year ${base.birth.y} · Candidates born ${range.from}–${range.to} · ${charts[other].gender === 'F' ? 'Female' : 'Male'} charts · Ages as of ${dateText(today)}${base.hasTime ? '' : ' · Base chart excludes birth time'}`);
    retry.hidden = true;
    if (cache.has(side)) { show(); return; }
    results.innerHTML = '';
    pagination.innerHTML = '';
    results.setAttribute('aria-busy', 'true');
    status.textContent = tr("범위 안에서 잘 맞는 사주를 찾고 있습니다…", "Finding compatible charts in this range…");
    const fail = () => {
      if (generation !== active) return;
      stop();
      status.textContent = tr("추천을 계산하지 못했습니다. 다시 시도해 주세요.", "Could not calculate matches. Please try again.");
      results.setAttribute('aria-busy', 'false');
      retry.hidden = false;
    };
    try {
      worker = new Worker(new URL('./compat-matches.worker.js', import.meta.url), { type: 'module' });
      worker.onerror = fail;
      worker.onmessage = ({ data }) => {
        if (generation !== active) return;
        if (data.type === 'progress') status.textContent = data.progress.phase === 'verify' ? tr(`${categoryName(data.progress.category)} 상위 사주의 출생일을 확인하고 있습니다…`, `Checking birth dates for the top ${categoryName(data.progress.category)} charts…`) : tr("범위 안에서 분야별 궁합을 계산하고 있습니다…", "Calculating compatibility by category…");
        else if (data.type === 'result') { cache.set(side, data.result); stop(); show(); }
        else fail();
      };
      worker.postMessage({ language: isEnglish() ? 'en' : 'ko', base: inputs[side], gender: charts[other].gender, today });
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

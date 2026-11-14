import { tr } from '../i18n/runtime.js';
import { track } from './analytics.js';
import { JOB_BY_ID } from '../content/character-jobs.js';
import { TIPS } from '../content/tips.js';
import { rankDistribution } from '../domain/rank-distribution.js';
import { characterImg, esc, tip } from '../site/util.js';

const TIER_CHARACTERS = {
  'S+': 'stargazer', S: 'magistrate', A: 'scribe', B: 'ranger', C: 'gardener', D: 'potter', E: 'tinkerer',
};

function distributionView(histogram, score) {
  const { points, maxCount, markerCount } = rankDistribution(histogram, score);
  const height = (count) => 94 - count / maxCount * 88;
  const line = points.map(([x, count]) => `${x},${height(count).toFixed(2)}`).join(' ');
  const plotDescription = tr('가로축은 0~100점, 세로축은 2점 구간별 사주 조합 수입니다.', 'The horizontal axis is the score from 0 to 100. The vertical axis is the number of chart combinations per two-point range.');
  return `<figure class="rank-distribution">
    <figcaption><b>${tr('사주 점수 분포', 'Chart score distribution')}</b><span class="rank-score-marker" data-rank-locked hidden>${tr(`내 점수 ${score}점`, `Your score: ${score}`)}</span></figcaption>
    <div class="rank-plot">
      <svg viewBox="0 0 100 94" preserveAspectRatio="none" role="img" aria-label="${esc(plotDescription)}">
        <polygon class="rank-plot-fill" points="0,94 ${line} 100,94"/>
        <polyline class="rank-plot-curve" points="${line}" vector-effect="non-scaling-stroke"/>
      </svg>
      <span class="rank-plot-marker" data-rank-locked hidden aria-hidden="true" style="--rank-x:${score}%;--rank-y:${(height(markerCount) / 94 * 100).toFixed(4)}%"></span>
    </div>
    <div class="rank-plot-scale num" aria-hidden="true"><span>0</span><span>25</span><span>50</span><span>75</span><span>100</span></div>
    <p class="hint rank-plot-unit">${tr('사주 점수', 'Chart score')}</p>
  </figure>`;
}

export function rankRevealView(r, name, histogram) {
  const locale = tr('ko-KR', 'en-US');
  const of = r.of.toLocaleString(locale);
  const rank = r.rank.toLocaleString(locale);
  const job = JOB_BY_ID[TIER_CHARACTERS[r.tier.code]];
  // 백분위가 같으면 분야별 순위의 기존 표시 순서를 따른다.
  const specialty = r.cats.reduce((best, current) => current.pct < best.pct ? current : best);
  const basis = r.withHour ? tr('4기둥 기준', 'Four pillars') : tr('3기둥 기준 · 시간 모름', 'Three pillars · birth time unknown');
  return `<section class="report-head card rank-head" aria-labelledby="rank-title">
    <header class="rank-heading">
      <p class="rank-eyebrow">${basis}</p>
      <h2 id="rank-title" data-result-heading>${esc(name ? tr(`${name}님의 사주 랭킹`, `${name}’s saju ranking`) : tr('내 사주 랭킹', 'Your saju ranking'))}</h2>
      <p class="rank-intro" data-rank-intro>${tr('곡선 어디에 있을까요? 순위를 열면 내 캐릭터와 특기가 함께 나와요.', 'Where do you land on the curve? Reveal your rank to meet your character and see your specialty.')}</p>
    </header>
    <div class="rank-identity" id="rank-identity" data-rank-locked hidden>
      ${characterImg(job.id, '', { thumb: true, sizes: '(max-width: 560px) 72px, 112px', size: 112 })}
      <div class="rank-identity-text">
        <p class="rank-tier"><b>${tr(`${r.tier.code} 등급`, `Tier ${r.tier.code}`)}</b><span>${tr(`상위 ${r.pct}%`, `Top ${r.pct}%`)}</span></p>
        <h3 class="rank-num num" tabindex="-1">${tr(`${rank}위`, `#${rank}`)}</h3>
        <p class="rank-pool">${tr(`이론상 ${of}가지 사주 조합 중`, `Out of ${of} theoretical chart combinations`)} ${tip(TIPS.rankPct, tr('순위 계산 설명', 'Ranking method'))}</p>
        <p class="rank-character">${esc(job.name)}</p>
        <p class="rank-specialty">${tr('내 특기', 'My specialty')} <b>${esc(specialty.name)} · ${tr(`상위 ${specialty.pct}%`, `Top ${specialty.pct}%`)}</b></p>
      </div>
    </div>
    ${distributionView(histogram, r.total)}
    <div class="rank-reveal-actions">
      <button class="btn" type="button" data-rank-reveal aria-controls="rank-identity rank-details rank-share" aria-expanded="false">${tr('내 순위 공개', 'Reveal my rank')}</button>
    </div>
  </section>`;
}

export function wireRankReveal(out) {
  out.addEventListener('click', (event) => {
    const button = event.target.closest('[data-rank-reveal]');
    if (!button || button.getAttribute('aria-expanded') === 'true') return;
    track('rank_reveal', { tool: 'rank' });
    out.querySelectorAll('[data-rank-locked]').forEach((el) => { el.hidden = false; });
    out.querySelector('[data-rank-intro]').hidden = true;
    button.setAttribute('aria-expanded', 'true');
    button.parentElement.hidden = true;
    out.querySelector('.rank-num').focus();
  });
}

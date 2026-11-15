// 랭킹에서만 필요한 표와 명예의 전당은 다른 계산기에 로드하지 않는다.
import { tr } from '../i18n/runtime.js';
import { TIPS } from '../content/tips.js';
import RANK_TABLE from '../content/rank-table.js';
import { PARTS, rankScore } from '../engine/rank.js';
import { detailDialog } from '../site/util.js';
import { elementName } from '../i18n/terms.js';
import { esc, tip } from './views.js';
import { rankPlay } from './rank-view.js';
import { rankGuidanceView } from './rank-guidance-view.js';
import { rankRevealView } from './rank-reveal.js';
import { rankLeadersView } from './rank-leaders-view.js';
export { RANK_TABLE };
export { wireRankReveal } from './rank-reveal.js';
export { sajuRank } from '../engine/rank.js';
export { mountRankLeaders } from './rank-leaders-view.js';

/* ── 사주 랭킹 ───────────────────────────── */
export function rankView(r, c, leaderRank) {
  const table = r.withHour ? RANK_TABLE.four : RANK_TABLE.three;
  const definitions = [
    tr('겉글자에 다섯 오행이 얼마나 고르게 있는지 비교해요.', 'Compares how evenly the five elements occur in visible characters.'),
    tr('일간을 돕는 가중 비율이 이 모델의 중앙 구간과 얼마나 가까운지 봐요.', 'Compares the weighted support ratio with this model’s central range.'),
    tr('이 모델이 고른 용신·희신이 원국에서 받는 힘을 봐요.', 'Measures the natal presence of the model’s useful and supporting elements.'),
    tr('귀인 등 특정 글자 조합의 가점을 더해요.', 'Adds bonuses for defined helpful character patterns.'),
    tr('글자를 잇는 천간합·지지합 등의 가점을 합쳐요.', 'Combines bonuses for defined stem and branch combinations.'),
    tr('서로 맞서는 충·긴장을 나타내는 형의 감점을 합쳐요.', 'Combines deductions for defined clashes and penalties.'),
    tr('별도로 정한 신살 조합의 가감점을 반영해요.', 'Includes adjustments for specifically defined symbolic-star patterns.'),
  ];
  const facts = rankScore(c);
  const observations = {
    balance: c.counts.map((n, e) => `${elementName(e)} ${n}`).join(' · '),
    center: tr(`나를 돕는 가중 비율 ${(c.ratio * 100).toFixed(1)}% · ${c.strengthLabel}`, `Weighted support ratio ${(c.ratio * 100).toFixed(1)}%`),
    yong: tr(`용신 ${elementName(c.roles.yong)} · 희신 ${elementName(c.roles.hee)}`, `Useful: ${elementName(c.roles.yong)} · Supporting: ${elementName(c.roles.hee)}`),
    gil: tr(`가점에 반영한 길신 ${facts.notes.gil.length}개`, `${facts.notes.gil.length} helpful patterns counted`),
    harmony: tr(`가점에 반영한 합 관계 ${facts.notes.harmony.length}개`, `${facts.notes.harmony.length} combination patterns counted`),
    clash: tr(`감점에 반영한 충·형 관계 ${facts.notes.clash.length}개`, `${facts.notes.clash.length} clash or penalty patterns counted`),
    special: tr(`별도 반영한 신살 ${facts.notes.special.length}개`, `${facts.notes.special.length} special-star patterns counted`),
  };
  const reasons = PARTS.map(([key, name], i) => {
    const raw = r.parts[key], avg = table.avg[key], delta = Math.round((raw - avg) * 10) / 10;
    const evidence = r.reasons.find(reason => reason.key === key);
    const result = evidence?.text || tr('전체 조합 평균과 차이가 작아 별도 강조 요인으로 고르지 않았어요.', 'This factor is close to the combination average and was not selected as a major difference.');
    return `<article class="rank-factor"><h4>${esc(name)}</h4><b>${delta > 0 ? '+' : ''}${delta.toFixed(1)}${tr('점', ' pts')}</b><p>${tr('전체 조합 평균과 차이', 'Difference from the combination average')}</p>${detailDialog(`rank-factor-${key}`, name, `<p>${esc(definitions[i])}</p><h3>${tr('내 사주에서는', 'In your chart')}</h3><p>${esc(observations[key])}</p><p>${esc(result)}</p><p>${tr(`항목 점수 ${raw.toFixed(1)}점 − 항목 평균 ${avg.toFixed(1)}점 = 평균 대비 ${delta > 0 ? '+' : ''}${delta.toFixed(1)}점.`, `Factor score ${raw.toFixed(1)} − average ${avg.toFixed(1)} = difference ${delta > 0 ? '+' : ''}${delta.toFixed(1)}.`)}</p><p class="hint">${tr('평균보다 낮은 항목이 인생의 문제나 능력 부족을 뜻하지는 않아요. 모든 항목은 같은 이론상 조합을 비교한 값이에요.', 'A below-average factor does not imply a life problem or lack of ability. Every factor uses the same set of theoretical combinations.')}</p>`, tr('뜻과 내 결과 보기', 'Meaning & my result'))}</article>`;
  }).join('');
  return `${rankRevealView(r, c.name, table.total)}
    <div id="rank-details" class="rank-details" data-rank-locked hidden>
    <section class="box card"><div class="box-head"><h3>${tr("사주 점수", "Chart score")} <b class="num">${r.total}</b>${tr("점", " pts")} <span class="muted">${tr(`(전체 평균 ${r.avgTotal}점)`, `(Average ${r.avgTotal} points)`)}</span> ${tip(TIPS.rankScore, tr('사주 점수 설명', 'Chart score explained'))}</h3></div>
      <h4 class="sub-h">${tr("점수에 반영된 일곱 가지", "Seven factors behind your score")}</h4><div class="rank-evidence">${reasons}</div></section>
    <section class="box card"><h3>${tr("분야별 순위", "Category rankings")}</h3><div class="rank-cats">${r.cats.map((k) => `<div class="rank-cat"><span>${k.name}</span><div class="track"><i style="width:${Math.max(2, 100 - k.pct)}%"></i></div><b>${tr("상위", "Top")} ${k.pct}%</b></div>`).join('')}</div>
      <p class="hint">${tr("사주 랭킹은 여덟 글자의 균형과 조화만 본 재미 지표입니다. 실제 삶은 대운·세운과 노력에 따라 크게 달라집니다.", "This ranking is an entertainment measure of chart balance. It is not a ranking of people or a prediction of success.")}</p></section>${rankGuidanceView(c, r)}${rankPlay(r)}</div>${rankLeadersView(leaderRank)}`;
}

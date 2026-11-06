import { tr } from '../i18n/runtime.js';
import { stemName, branchName, term } from '../i18n/terms.js';
import { displayPillar } from './copy.js';
import { esc } from './util.js';
import { sexagenary, iljuSlug, tenGod, stageOf, BR_MAIN, HIDDEN, STEM_H, TG } from '../engine/index.js';

const label = (p) => `${displayPillar(p)}${tr('일주', ' day pillar')}`;
const link = (p) => `<a href="/saju/ilju/${iljuSlug(p)}/">${esc(label(p))}</a>`;
const relationship = (p) => tenGod(p.s, BR_MAIN[p.b]);

// 편집용 비교만 파생한다. 간지·십신·12운성은 기존 엔진의 계산을 그대로 쓴다.
export function iljuPerspective(n) {
  const p = sexagenary(n), sameStem = sexagenary((n + 10) % 60), sameBranch = sexagenary((n + 12) % 60);
  const god = relationship(p);
  const principal = `${stemName(BR_MAIN[p.b])}(${STEM_H[BR_MAIN[p.b]]})`;
  const hidden = HIDDEN[p.b].map(([s]) => `${stemName(s)} · ${term(tenGod(p.s, s))}`).join(', ');
  const basis = tr(
    `${label(p)}는 일간 ${stemName(p.s)}를 기준으로 ${branchName(p.b)}의 본기 ${principal}를 비교하므로 ${term(god)}로 분류합니다. 지장간을 모두 펼치면 ${hidden}입니다. 본기 하나로 붙인 대표 십신과 지장간 전체의 관계는 구분해서 읽습니다.`,
    `${label(p)} compares the principal hidden stem ${principal} in ${branchName(p.b)} with the Day Master ${stemName(p.s)}, giving ${term(god)}. Its hidden stems are ${hidden}. The principal relationship is a summary, not the complete set of hidden-stem relationships.`,
  );
  const contrast = tr(
    `같은 일간인 ${label(sameStem)}는 일지가 ${branchName(sameStem.b)}로 바뀌어 본기 십신이 ${term(relationship(sameStem))}입니다. 같은 일지인 ${label(sameBranch)}도 일간이 ${stemName(sameBranch.s)}로 달라지면 ${term(relationship(sameBranch))}로 읽습니다. 일간이나 띠 하나가 같다는 이유로 같은 해석을 적용할 수 없는 이유입니다.`,
    `${label(sameStem)} shares this Day Master, but its branch ${branchName(sameStem.b)} gives ${term(relationship(sameStem))}. ${label(sameBranch)} shares the branch, but changing the Day Master to ${stemName(sameBranch.s)} gives ${term(relationship(sameBranch))}. Sharing one stem or zodiac branch does not make the full reading identical.`,
  );
  const work = tr(
    `${label(p)}의 일지 본기 관계는 ${term(god)}입니다. 이 전통 용어는 실제 직무 능력이나 채용 가능성을 측정하지 않습니다. 같은 일지의 ${label(sameBranch)}에서는 ${term(relationship(sameBranch))}로 분류가 달라지므로, 직업명을 일주 하나에 고정하지 말고 내가 맡는 업무·성과 근거·필요한 자격을 따로 확인하세요.`,
    `The principal relationship in ${label(p)} is ${term(god)}. This traditional label does not measure job skills or hiring prospects. Even the same branch gives ${term(relationship(sameBranch))} in ${label(sameBranch)}. Review actual duties, evidence of performance and required qualifications rather than assigning a profession from one pillar.`,
  );
  const rows = [p, sameStem, sameBranch].map((q) => `<tr data-comparison-pillar="${iljuSlug(q)}"><th scope="row">${link(q)}</th><td>${esc(stemName(q.s))}</td><td>${esc(branchName(q.b))}</td><td>${esc(term(relationship(q)))}</td><td>${esc(term(stageOf(q.s, q.b)))}</td></tr>`).join('');
  const comparison = `<section class="prose" data-ilju-comparison data-principal-relationship="${TG.indexOf(god)}"><h2>${tr('같은 일간·같은 일지와 비교해서 읽기', 'Compare shared stems and branches')}</h2><p>${esc(basis)}</p><div class="table-wrap" tabindex="0" role="region" aria-label="${tr('일간과 일지의 관계 비교', 'Day Master and branch comparison')}"><table class="grid-table"><caption>${esc(label(p))} · ${tr('한 글자를 바꾼 비교', 'Changing one character')}</caption><thead><tr><th scope="col">${tr('일주', 'Day pillar')}</th><th scope="col">${tr('일간', 'Day Master')}</th><th scope="col">${tr('일지', 'Day branch')}</th><th scope="col">${tr('본기 십신', 'Principal relationship')}</th><th scope="col">${tr('12운성', 'Life stage')}</th></tr></thead><tbody>${rows}</tbody></table></div><p>${esc(contrast)}</p><p>${tr('이 표는 실제 인물 세 명의 비교가 아니라 간지 조합의 계산 비교입니다. 년주·월주·시주, 계절과 전체 분포가 빠져 있어 성격·직업·관계의 결과를 판정하지 않습니다.', 'This compares calculated character combinations, not three real people. Year, month and hour pillars, season and the full chart are absent; the table does not establish personality, career fit or relationship outcomes.')}</p></section>`;
  return { comparison, work, basis, personality: tr(
    `${label(p)}는 ${stemName(p.s)}와 ${branchName(p.b)}의 조합이며 본기 십신은 ${term(god)}, 12운성은 ${term(stageOf(p.s, p.b))}입니다. 성격 설명은 이 조합의 전통적 비유이며 실제 성격 검사 결과가 아닙니다.`,
    `${label(p)} combines ${stemName(p.s)} and ${branchName(p.b)}, with ${term(god)} and ${term(stageOf(p.s, p.b))}. Personality descriptions are traditional metaphors for that combination, not a personality assessment.`,
  ) };
}

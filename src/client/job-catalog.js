import { tr } from '../i18n/runtime.js';
import { term } from '../i18n/terms.js';
import { ALL_JOBS, CHARACTER_JOBS, SETBACK_JOBS } from '../content/character-jobs.js';
import { STAT_NAMES } from '../content/story.js';
import T from '../content/text.js';
import { esc, characterImg } from '../site/util.js';

const families = [...new Set(CHARACTER_JOBS.map((job) => job.tg))];
const statName = (key) => STAT_NAMES.find(([k]) => k === key)[1];

export function jobCatalog(stages) {
  const encountered = new Set(stages.map((s) => s.character.portrait));
  const card = (job) => `<button type="button" class="job-card" data-dialog="job-${job.id}" aria-haspopup="dialog" aria-controls="job-${job.id}">
    ${characterImg(job.id, '', { thumb: true, sizes: '(max-width: 640px) 45vw, 180px' })}
    <span class="job-tag${job.setback ? ' setback' : ''}">${job.setback ? tr("몰락형", "Setback class") : tr(`${statName(job.focus)} 특화`, `${statName(job.focus)} specialist`)}${encountered.has(job.id) ? tr(" · 이번 모험에서 만남", " · Met on this adventure") : ''}</span>
    <b>${esc(job.name)}</b><span class="muted">${esc(job.skill[0])} ↗</span>
  </button>`;
  const dialogs = ALL_JOBS.map((job) => `<dialog class="character-dialog" id="job-${job.id}" aria-labelledby="job-title-${job.id}">
    <div class="dialog-bar"><span>${tr("직업 도감", "Class collection")} · ${term(job.tg)}</span><button type="button" class="sbtn" data-close-dialog aria-label="${tr("직업 도감 상세 닫기", "Close class details")}" autofocus>${tr("닫기 ×", "Close ×")}</button></div>
    <div class="character-sheet"><div class="portrait${job.setback ? ' portrait-low' : ''}">${characterImg(job.id, tr(`${job.name} 캐릭터`, `${job.name} character`))}</div>
      <section class="character-status"><p class="eyebrow">${job.setback ? tr("시련 속 몰락", "A fall through adversity") : tr("동양 판타지 모험가", "East Asian fantasy adventurer")}</p><h2 id="job-title-${job.id}">${esc(job.name)}</h2><p>${esc(job.desc)}</p>
        <p class="skill"><b>${tr("고유 스킬", "Signature skill")} · ${esc(job.skill[0])}</b>${esc(job.skill[1])}</p>
        <h3>${tr("직업 특성", "Class traits")}</h3><dl class="job-bonuses">${STAT_NAMES.map(([k, name], i) => `<div><dt>${name}</dt><dd>${job.stats[i] > 0 ? '+' : ''}${job.stats[i]}</dd></div>`).join('')}</dl>
        <p class="hint">${tr("개인의 능력치가 아닌 게임용 보정값입니다. 실제 챕터에서는 해당 시기의 분야 점수와 합산합니다.", "These are game bonuses, not measures of personal ability. In each chapter, they are added to that period’s category scores.")}</p>
        <p class="quest"><b>${tr("직업 퀘스트", "Class quest")}</b>${esc(job.quest)}</p>
      </section></div>
  </dialog>`).join('');
  return `<section class="job-catalog"><button type="button" class="disclosure-button" data-disclosure aria-expanded="false" aria-controls="job-catalog-body"><span>${tr(`캐릭터 도감 · ${ALL_JOBS.length}종`, `Character collection · ${ALL_JOBS.length} classes`)}</span><span aria-hidden="true">＋</span></button>
    <div id="job-catalog-body" class="disclosure-body" hidden>
      <p>${tr(`모험 직업 ${CHARACTER_JOBS.length}종과 시련 속 몰락형 ${SETBACK_JOBS.length}종. 이번 모험에서는 ${encountered.size}종을 만났습니다.`, `${CHARACTER_JOBS.length} adventure classes and ${SETBACK_JOBS.length} setback classes. You met ${encountered.size} on this adventure.`)}</p>
      <p class="hint">${tr("십신은 직업 계열을, 분야 점수는 특기를 정합니다. 같은 계열에서는 아직 만나지 않은 직업을 우선하며, 흐름 점수가 45점 미만이면 계열별 몰락형이 등장합니다.", "The Ten Gods determine class families, and category scores determine specialties. Unseen classes in the same family take priority. Below a flow score of 45, a setback class appears.")}</p>
      <label class="job-filter">${tr("직업 계열", "Class family")}<select data-job-family>${families.map((tg) => `<option value="${tg}">${term(tg)} · ${T.tgKeyword[tg]}</option>`).join('')}</select></label>
      ${families.map((tg, i) => `<div class="job-grid" data-job-panel="${tg}"${i ? ' hidden' : ''}>${ALL_JOBS.filter((job) => job.tg === tg).map(card).join('')}</div>`).join('')}
    </div></section>${dialogs}`;
}

import { ALL_JOBS, CHARACTER_JOBS, SETBACK_JOBS } from '../content/character-jobs.js';
import { STAT_NAMES } from '../content/story.js';
import T from '../content/text.js';
import { esc } from '../site/util.js';

const families = [...new Set(CHARACTER_JOBS.map((job) => job.tg))];
const statName = (key) => STAT_NAMES.find(([k]) => k === key)[1];

export function jobCatalog(stages) {
  const encountered = new Set(stages.map((s) => s.character.portrait));
  const card = (job) => `<button type="button" class="job-card" data-dialog="job-${job.id}" aria-haspopup="dialog" aria-controls="job-${job.id}">
    <img src="/characters/${job.id}.webp" alt="" width="640" height="640" loading="lazy">
    <span class="job-tag${job.setback ? ' setback' : ''}">${job.setback ? '몰락형' : `${statName(job.focus)} 특화`}${encountered.has(job.id) ? ' · 이번 모험에서 만남' : ''}</span>
    <b>${esc(job.name)}</b><span class="muted">${esc(job.skill[0])} ↗</span>
  </button>`;
  const dialogs = ALL_JOBS.map((job) => `<dialog class="character-dialog" id="job-${job.id}" aria-labelledby="job-title-${job.id}">
    <div class="dialog-bar"><span>직업 도감 · ${job.tg} 계열</span><button type="button" class="sbtn" data-close-dialog aria-label="직업 도감 상세 닫기" autofocus>닫기 ×</button></div>
    <div class="character-sheet"><div class="portrait${job.setback ? ' portrait-low' : ''}"><img src="/characters/${job.id}.webp" alt="${esc(job.name)} 캐릭터" width="640" height="640" loading="lazy"></div>
      <section class="character-status"><p class="eyebrow">${job.setback ? '시련 속 몰락' : '동양 판타지 모험가'}</p><h2 id="job-title-${job.id}">${esc(job.name)}</h2><p>${esc(job.desc)}</p>
        <p class="skill"><b>고유 스킬 · ${esc(job.skill[0])}</b>${esc(job.skill[1])}</p>
        <h3>직업 특성</h3><dl class="job-bonuses">${STAT_NAMES.map(([k, name], i) => `<div><dt>${name}</dt><dd>${job.stats[i] > 0 ? '+' : ''}${job.stats[i]}</dd></div>`).join('')}</dl>
        <p class="hint">개인의 능력치가 아닌 게임용 보정값입니다. 실제 챕터에서는 해당 시기의 분야 점수와 합산합니다.</p>
        <p class="quest"><b>직업 퀘스트</b>${esc(job.quest)}</p>
      </section></div>
  </dialog>`).join('');
  return `<section class="job-catalog"><button type="button" class="disclosure-button" data-disclosure aria-expanded="false" aria-controls="job-catalog-body"><span>캐릭터 도감 · ${ALL_JOBS.length}종</span><span aria-hidden="true">＋</span></button>
    <div id="job-catalog-body" class="disclosure-body" hidden>
      <p>모험 직업 ${CHARACTER_JOBS.length}종과 시련 속 몰락형 ${SETBACK_JOBS.length}종. 이번 모험에서는 ${encountered.size}종을 만났습니다.</p>
      <p class="hint">십신은 직업 계열을, 분야 점수는 특기를 정합니다. 같은 계열에서는 아직 만나지 않은 직업을 우선하며, 흐름 점수가 45점 미만이면 계열별 몰락형이 등장합니다.</p>
      <label class="job-filter">직업 계열<select data-job-family>${families.map((tg) => `<option value="${tg}">${tg} · ${T.tgKeyword[tg]}</option>`).join('')}</select></label>
      ${families.map((tg, i) => `<div class="job-grid" data-job-panel="${tg}"${i ? ' hidden' : ''}>${ALL_JOBS.filter((job) => job.tg === tg).map(card).join('')}</div>`).join('')}
    </div></section>${dialogs}`;
}

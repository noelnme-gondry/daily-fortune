import { tr } from '../i18n/runtime.js';
import { lifeEventDetails } from '../domain/life-event-detail.js';
import { pillarH } from '../engine/core.js';
import { esc } from '../site/util.js';

const badge = (item) => `<span class="life-event-badge life-event-${item.tone}">${item.badge}</span>`;

function detailDialog(group, item, id) {
  return `<dialog class="character-dialog life-event-dialog" id="${id}" aria-labelledby="${id}-title">
    <div class="dialog-bar"><h2 id="${id}-title">${item.y}${tr("년", "")} · ${group.name}</h2><button type="button" class="sbtn" data-close-dialog autofocus>${tr("닫기", "Close")}</button></div>
    <div class="life-event-body">
      <div class="life-event-meta">${badge(item)}<span>${tr(`${item.age}세`, `Age ${item.age}`)} · <span class="hz">${pillarH(item.pillar)}</span>年</span></div>
      <p>${esc(item.summary)}</p>
      <section><h3>${tr("목록에 표시된 이유", "Why this year is listed")}</h3><p>${esc(item.selection)}</p><p class="muted">${esc(item.why)}</p></section>
      ${item.reasons.length ? `<section><h3>${tr("표시된 용어", "Terms in this reading")}</h3><dl class="life-event-terms">${item.reasons.map((reason) => `<div><dt>${esc(reason.term)}</dt><dd>${esc(reason.text)}</dd></div>`).join('')}</dl></section>` : ''}
      <section><h3>${tr(`${item.y}년 분야별 흐름`, `Category scores for ${item.y}`)}</h3><dl class="life-event-scores">${item.scores.map((score) => `<div data-score="${score.key}"><dt>${score.name}</dt><dd><b>${score.score}${tr("점", " pts")}</b><span class="life-score-${score.tone}">${score.label}</span></dd></div>`).join('')}</dl>
        <p class="hint">${tr("75점 이상 매우 좋음 · 60–74점 좋음 · 45–59점 보통 · 44점 이하 주의", "75+ very favorable · 60–74 favorable · 45–59 steady · 44 or below: take care")}</p>
      </section>
      <p class="hint life-event-note">${tr("점수는 사주 해석을 수치화한 값이며 실제 사건의 확률이 아닙니다. 나이는 해당 연도에서 출생 연도를 뺀 값입니다.", "Scores represent saju interpretations, not the probability of real events. Age is the calendar year minus the birth year.")}${item.timeNote ? ` ${esc(item.timeNote)}` : ''}</p>
    </div>
  </dialog>`;
}

export function lifeEventsView(events, chart, today) {
  const groups = lifeEventDetails(chart, events);
  const dialogs = [];
  const cards = groups.map((group) => `<div class="ev"><h4>${group.name}</h4>${group.items.length ? `<ul>${group.items.map((item) => {
    const id = `life-event-${group.key}-${item.y}`;
    dialogs.push(detailDialog(group, item, id));
    return `<li><button type="button" class="life-event-trigger" data-dialog="${id}" aria-controls="${id}" aria-haspopup="dialog" aria-label="${item.y}${tr("년", "")} ${group.name} · ${item.badge} · ${tr("상세 보기", "View details")}">
      <span class="life-event-year">${item.y}<small>${tr("년", "year")}</small></span>${badge(item)}
      <span class="life-event-age">${tr(`${item.age}세`, `Age ${item.age}`)} · <span class="hz">${pillarH(item.pillar)}</span>年</span>
      <span class="life-event-reason">${esc(item.why)}</span><span class="life-event-more">${tr("상세 보기", "View details")} <span aria-hidden="true">↗</span></span>
    </button></li>`;
  }).join('')}</ul>` : tr('<p class="muted">앞으로 15년 안에 두드러진 해가 없습니다.</p>', '<p class="muted">No year stands out in this category over the next 15 years.</p>')}</div>`).join('');
  return `<section class="box card wide"><div class="box-head"><h3>${tr("앞으로 15년의 주요 시기", "Key periods over the next 15 years")}</h3><span class="muted">${tr(`${today.y}–${today.y + 14}년 세운 기준`, `Annual cycles for ${today.y}–${today.y + 14}`)}</span></div>
    <p class="hint">${tr("연도를 누르면 선정 이유와 해당 해의 점수를 볼 수 있습니다. ‘변화’와 ‘관심’은 좋고 나쁨을 뜻하지 않습니다.", "Select a year to see its scores and why it was chosen. “Change” and “Attention” do not mean good or bad outcomes.")}</p>
    <div class="events life-events">${cards}</div>${dialogs.join('')}</section>`;
}

// Reconstruct the same calendar for a first visit, a refresh, or an earlier date.
// Bound cold-start work to one traditional 60-day cycle. At its boundary the
// schedule starts anew; the rolling-window audit includes those dates.
const WINDOW = 14;
const BLOCK = 60;

// Count nearby actions together even when the specific method differs.
const similarActions = [
  ['state-role-preference', 'record-preferred-role', 'exchange-role-preferences'],
  ['agree-budget-ceiling', 'limit-commitment'],
  ['choose-stopping-point', 'narrow-finish-line', 'narrow-next-task'],
  ['send-location-update', 'send-arrival-update', 'share-map-pin'],
  ['choose-meeting-landmark', 'describe-arrival-landmark', 'note-return-landmark'],
  ['schedule-restart', 'prepare-next-session', 'leave-restart-note'],
  ['assign-cleanup', 'divide-start-and-finish'],
  ['locate-sticking-point', 'select-blocking-question'],
  ['introduce-two-people', 'offer-introduction'],
  ['open-with-shared-memory', 'share-memory-object'],
  ['offer-call-time', 'switch-to-voice'],
  ['compare-total-cost', 'price-time-and-travel'],
  ['adjust-before-replacing', 'find-repair-option'],
  ['credit-contribution', 'thank-for-specific-kindness'],
  ['offer-smaller-role', 'agree-scope-and-date'],
  ['choose-break-activity', 'choose-closing-ritual'],
  ['schedule-followup', 'set-reply-time'],
  ['show-example', 'demonstrate-first-step'],
  ['check-change-deadline', 'plan-departure'],
];
const families = new Map(similarActions.flatMap(group => group.map(id => [id, group[0]])));
export const practiceFamily = id => families.get(id) || id;

export function practiceCalendar(candidatesForDate) {
  const blocks = new Map();
  return cycle => {
    const start = Math.floor(cycle / BLOCK) * BLOCK;
    let block = blocks.get(start);
    if (!block) {
      block = { next: start, history: [], days: [] };
      if (blocks.size === 2) blocks.delete(blocks.keys().next().value);
      blocks.set(start, block);
    }
    while (block.next <= cycle) {
      const date = block.next++;
      const choices = candidatesForDate(date).map((candidates, i) => {
        const recent = block.history[i] ??= new Map();
        let choice = candidates[0], oldest = Infinity;
        for (const candidate of candidates) {
          const last = recent.get(practiceFamily(candidate[2])) ?? -Infinity;
          if (last < date - WINDOW) { choice = candidate; break; }
          if (last < oldest) { choice = candidate; oldest = last; }
        }
        recent.set(practiceFamily(choice[2]), date);
        return choice;
      });
      block.days.push(choices);
    }
    return block.days[cycle - start];
  };
}

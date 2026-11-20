// Reconstruct the same calendar for a first visit, a refresh, or an earlier date.
// Bound cold-start work to one traditional 60-day cycle. At its boundary the
// schedule starts anew; the rolling-window audit includes those dates.
const WINDOW = 14;
const BLOCK = 60;

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
          const last = recent.get(candidate[2]) ?? -Infinity;
          if (last < date - WINDOW) { choice = candidate; break; }
          if (last < oldest) { choice = candidate; oldest = last; }
        }
        recent.set(choice[2], date);
        return choice;
      });
      block.days.push(choices);
    }
    return block.days[cycle - start];
  };
}

import { hash } from '../engine/core.js';
import { ZODIAC_DAY_AREAS } from '../content/zodiac-day-areas.js';
import { ZODIAC_DAY_STORIES } from '../content/zodiac-day-stories.js';
import { tr } from '../i18n/runtime.js';

// Match the relationship of the two branches to a social reading. Element-based
// fields use the existing day-branch and day-stem relationships, without extra scores.
const relationshipTheme = {
  합: 0, 삼합: 0, 같음: 1, 형: 1, 원진: 2, 해: 2, 충: 3, 파: 3, 없음: 4,
};

export function zodiacDayDetail({ tti, rel, detailContext: { theme, branch, stem, cycle } }) {
  const relationship = relationshipTheme[rel];
  const fields = {
    money: branch, career: stem, love: relationship, social: relationship,
    study: stem, health: branch, move: relationship === 3 ? 3 : branch,
  };
  const storyEdition = cycle % 2 === 0 ? 1 : 0;
  return {
    story: tr(...ZODIAC_DAY_STORIES[theme][storyEdition]),
    areas: Object.entries(fields).map(([key, index]) => {
      // Stagger the two editions across signs and alternate each day. Both describe
      // the same calculated theme, even when it carries over into the next day.
      const offset = hash(`zodiac-area|${tti}|${key}`) % 7;
      const edition = Math.abs((cycle + offset) % 2);
      return { key, text: tr(...ZODIAC_DAY_AREAS[key][index][edition]) };
    }),
  };
}

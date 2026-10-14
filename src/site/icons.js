import { ANIMAL_SLUG } from '../engine/core.js';
const PATHS = {
  native: '<path d="M12 16V3m-4 4 4-4 4 4M5 12v8h14v-8"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M15 4H4v11"/>',
  x: '<path d="m4 4 16 16M20 4 4 20"/>',
  facebook: '<path d="M14 21V11h4l1-4h-5V5c0-2 1-3 4-2M10 11H7V7h3V5c0-4 3-5 7-5"/>',
  band: '<path d="M6 3h7a5 5 0 0 1 0 10H6m0-1h8a4 4 0 0 1 0 8H6V3"/>',
  kakao: '<path d="M21 10c0 5-5 8-10 7l-5 3 1-5C-3 5 16-4 21 10Z"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1"/><path d="m4 18 6-7 4 4 3-3 4 5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  book: '<path d="M12 5v15M3 4c4-1 6 0 9 2 3-2 5-3 9-2v15c-4-1-6 0-9 2-3-2-5-3-9-2Z"/>',
  trophy: '<path d="M7 3h10v7a5 5 0 0 1-10 0V3ZM7 5H3v3c0 3 2 4 5 4m9-7h4v3c0 3-2 4-5 4M12 15v6m-5 0h10"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9 8c0-4 7-4 7 0 0 3-4 2-4 6m0 3v1"/>',
};
export const uiIcon = (key) => `<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${PATHS[key] || PATHS.book}</svg>`;
export const animalIcon = (t) => `<svg class="animal-icon" viewBox="0 0 64 64" aria-hidden="true"><use href="/zodiac.svg#${ANIMAL_SLUG[t]}"></use></svg>`;

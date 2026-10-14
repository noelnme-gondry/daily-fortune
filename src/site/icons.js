import { ANIMAL_SLUG } from '../engine/core.js';
import { ICON_PATHS, BRAND_PATHS } from '../content/ui-icon-paths.js';
export const uiIcon = (key) => BRAND_PATHS[key]
  ? `<svg class="ui-icon brand-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor">${BRAND_PATHS[key]}</svg>`
  : `<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICON_PATHS[key] || ICON_PATHS.book}</svg>`;
export const animalIcon = (t) => `<img class="animal-icon" src="/zodiac/${ANIMAL_SLUG[t]}.webp" width="64" height="64" alt="" loading="lazy" decoding="async">`;

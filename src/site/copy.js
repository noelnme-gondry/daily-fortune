import { isEnglish } from '../i18n/runtime.js';
import COPY from '../content/en/site-copy.js';
import { term, animalName } from '../i18n/terms.js';
import { ANIMAL, STEM_SLUG, BR_SLUG, pillarKo, josa } from '../engine/core.js';

// Translate only explicitly marked static display text; interpolated values stay untouched.
export const siteText = (text) => isEnglish() ? (COPY[text] ?? text) : text;

export const siteValue = (value) => {
  if (!isEnglish() || typeof value !== 'string') return value;
  const animal = ANIMAL.indexOf(value);
  return animal >= 0 ? animalName(animal) : term(value);
};
export const displayPillar = (p) => isEnglish() ? `${STEM_SLUG[p.s]}-${BR_SLUG[p.b]}` : pillarKo(p);
export const displayJosa = (word, pair) => isEnglish() ? siteValue(word) : josa(word, pair);

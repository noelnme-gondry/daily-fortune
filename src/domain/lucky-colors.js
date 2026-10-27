import { EL_SLUG } from '../engine/core.js';
import T from '../content/text.js';

const validElement = element => Number.isInteger(element) && element >= 0 && element < EL_SLUG.length;

export function reportColorPalettes(lucky) {
  if (!validElement(lucky?.el)) return [];
  const colorIndex = T.element[lucky.el].color.indexOf(lucky.color);
  return colorIndex < 0 ? [] : [{ element: lucky.el, colorIndices: [colorIndex] }];
}

export function chartColorPalettes(chart) {
  return ['yong', 'hee'].flatMap(role => {
    const element = chart?.roles?.[role];
    return validElement(element) ? [{ role, element, colorIndices: T.element[element].color.map((_, i) => i) }] : [];
  });
}

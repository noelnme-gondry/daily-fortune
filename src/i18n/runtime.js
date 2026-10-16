// Server rendering and calculations are synchronous. Scope the language to each
// render; browsers keep the language declared by the document for their session.
let language = typeof document === 'undefined' ? 'ko' : document.documentElement.lang === 'en' ? 'en' : 'ko';

export const isEnglish = () => language === 'en';
export const tr = (korean, english) => isEnglish() ? english : korean;

export function withLanguage(next, render) {
  const previous = language;
  language = next;
  try {
    const result = render();
    if (result && typeof result.then === 'function') throw new TypeError('withLanguage requires a synchronous render');
    return result;
  } finally {
    language = previous;
  }
}

// Keep Korean object keys and array positions intact: the engine also uses them
// as identifiers. Only translated display values are selected when accessed.
export function bilingual(korean, english) {
  if (!korean || typeof korean !== 'object') return tr(korean, english);
  const children = new Map();
  return new Proxy(korean, {
    get(target, property, receiver) {
      const value = Reflect.get(target, property, receiver);
      if (typeof value === 'function' || typeof property === 'symbol') return value;
      const translated = english?.[property];
      if (value && typeof value === 'object') {
        if (!children.has(property)) children.set(property, bilingual(value, translated));
        return children.get(property);
      }
      return isEnglish() && translated !== undefined ? translated : value;
    },
  });
}

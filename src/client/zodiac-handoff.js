import T from '../content/text.js';
import { CATS, fmtDate, isoDate, parseReadingDate } from '../engine/index.js';
import { tr } from '../i18n/runtime.js';

// The query keeps the original date and area even when the reader switches the active fragment.
export function zodiacHandoff(search, hash = '') {
  const params = new URLSearchParams(search);
  const key = params.get('zodiac_area');
  const date = parseReadingDate(params.get('zodiac_date'));
  if (!CATS.includes(key) || !date) return null;
  const overview = hash === '#reading-summary';
  const name = T.catName[key];
  return {
    key, date,
    notice: overview ? tr(`${fmtDate(date)} 개인 종합운과 7개 분야`, `Your full reading for ${fmtDate(date)} · all seven areas`) : tr(`띠별 풀이에서 이어서 · ${fmtDate(date)} 개인 ${name}`, `From the zodiac reading · ${fmtDate(date)} · personal ${name}`),
    buttonLabel: overview ? tr(`${date.m}월 ${date.d}일 내 운세 전체 보기`, `Read my full fortune for ${isoDate(date)}`) : tr(`${date.m}월 ${date.d}일 내 ${name} 보기`, `Read my ${name} for ${isoDate(date)}`),
  };
}

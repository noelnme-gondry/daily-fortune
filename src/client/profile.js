// 입력값 보관(이 기기의 localStorage). 생년월일시는 공유 링크에 담지 않는다.
const KEY = { a: 'ohaeng:profile', b: 'ohaeng:partner' };

export const SAMPLE = {
  a: { name: '서윤', gender: 'F', calendar: 'solar', leap: false, y: 1993, m: 1, d: 28, time: '03:40', noTime: false },
  b: { name: '도현', gender: 'M', calendar: 'solar', leap: false, y: 1991, m: 8, d: 14, time: '10:30', noTime: false },
};

export function load(who) {
  try { const v = JSON.parse(localStorage.getItem(KEY[who])); return valid(v) ? v : null; } catch (e) { return null; }
}
export function save(who, p) {
  try { localStorage.setItem(KEY[who], JSON.stringify(p)); } catch (e) { /* 저장할 수 없는 환경(사생활 보호 모드 등) */ }
}
function valid(p) {
  return p && (p.gender === 'M' || p.gender === 'F') && Number.isInteger(p.y) && Number.isInteger(p.m) && Number.isInteger(p.d);
}

export const toEngine = (p) => ({ name: p.name, gender: p.gender, calendar: p.calendar, leap: p.leap, y: p.y, m: p.m, d: p.d, time: p.noTime ? null : p.time });

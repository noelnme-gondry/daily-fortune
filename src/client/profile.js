// 입력값 보관(이 기기의 localStorage)과 공유 링크(# 뒤 파라미터) 변환
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

// #y=1993&m=1&d=28&t=0340&g=F&c=s&n=이름 (상대는 y2·m2… 접미사)
export function toHash(a, b) {
  const q = new URLSearchParams();
  const put = (p, sfx) => {
    q.set(`y${sfx}`, p.y); q.set(`m${sfx}`, p.m); q.set(`d${sfx}`, p.d);
    q.set(`t${sfx}`, p.noTime ? 'x' : p.time.replace(':', ''));
    q.set(`g${sfx}`, p.gender); q.set(`c${sfx}`, p.calendar === 'lunar' ? (p.leap ? 'll' : 'l') : 's');
    if (p.name) q.set(`n${sfx}`, p.name);
  };
  put(a, '');
  if (b) put(b, '2');
  return `#${q.toString()}`;
}
export function fromHash(hash) {
  if (!hash || hash.length < 3) return {};
  const q = new URLSearchParams(hash.slice(1));
  const get = (sfx) => {
    if (!q.get(`y${sfx}`)) return null;
    const t = q.get(`t${sfx}`) || 'x';
    const c = q.get(`c${sfx}`) || 's';
    const p = {
      name: (q.get(`n${sfx}`) || '').slice(0, 12), gender: q.get(`g${sfx}`) === 'F' ? 'F' : 'M',
      calendar: c === 's' ? 'solar' : 'lunar', leap: c === 'll',
      y: parseInt(q.get(`y${sfx}`), 10), m: parseInt(q.get(`m${sfx}`), 10), d: parseInt(q.get(`d${sfx}`), 10),
      time: /^\d{4}$/.test(t) ? `${t.slice(0, 2)}:${t.slice(2)}` : '12:00', noTime: !/^\d{4}$/.test(t),
    };
    return valid(p) ? p : null;
  };
  return { a: get(''), b: get('2') };
}
export const toEngine = (p) => ({ name: p.name, gender: p.gender, calendar: p.calendar, leap: p.leap, y: p.y, m: p.m, d: p.d, time: p.noTime ? null : p.time });

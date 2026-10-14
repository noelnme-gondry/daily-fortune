// 영구 보관은 사용자가 선택한 IndexedDB. 미선택 입력은 현재 탭의 세션에만 유지한다.
const KEY = { a: 'ohaeng:profile', b: 'ohaeng:partner', tojeong: 'ohaeng:tojeong' };
const DB_NAME = 'ohaeng-profiles';
const STORE = 'profiles';

export const SAMPLE = {
  a: { name: '서윤', gender: 'F', calendar: 'solar', leap: false, y: 1993, m: 1, d: 28, time: '03:40', noTime: false },
  b: { name: '도현', gender: 'M', calendar: 'solar', leap: false, y: 1991, m: 8, d: 14, time: '10:30', noTime: false },
};

function database() {
  return new Promise((resolve, reject) => {
    if (!globalThis.indexedDB) { reject(new Error('IndexedDB를 사용할 수 없습니다.')); return; }
    const req = indexedDB.open(DB_NAME, 1);
    let expired = false;
    const timer = setTimeout(() => { expired = true; reject(new Error('저장소 연결이 지연되고 있습니다. 다른 탭을 닫고 다시 시도해 주세요.')); }, 3000);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => { clearTimeout(timer); if (expired) { req.result.close(); return; } req.result.onversionchange = () => req.result.close(); resolve(req.result); };
    req.onerror = () => { clearTimeout(timer); reject(req.error); };
    req.onblocked = () => { clearTimeout(timer); expired = true; reject(new Error('다른 탭에서 저장소를 사용 중입니다.')); };
  });
}
async function transact(mode, action) {
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const request = action(tx.objectStore(STORE));
    tx.oncomplete = () => { db.close(); resolve(request?.result); };
    tx.onabort = tx.onerror = () => { db.close(); reject(tx.error || new Error('저장에 실패했습니다.')); };
  });
}
export function valid(p) {
  return p && (p.gender === 'M' || p.gender === 'F') && Number.isInteger(p.y) && Number.isInteger(p.m) && Number.isInteger(p.d);
}
const validFor = (who, p) => who === 'tojeong'
  ? p && ['solar', 'lunar'].includes(p.calendar) && [p.y, p.m, p.d].every(Number.isInteger)
  : valid(p);

export async function load(who) {
  const p = await transact('readonly', (s) => s.get(who));
  return validFor(who, p) ? p : null;
}
// 이전 버전이 동의 없이 자동 저장한 localStorage 입력은 현재 탭으로만 옮기고 바로 지운다.
// 다시 기기에 남기려면 사용자가 저장을 선택해야 한다.
export function takeLegacy(who) {
  let legacy;
  try { legacy = JSON.parse(localStorage.getItem(KEY[who])); localStorage.removeItem(KEY[who]); } catch { return null; }
  if (!validFor(who, legacy)) return null;
  sessionSave(who, legacy);
  return legacy;
}
export async function save(who, p) {
  if (!validFor(who, p)) throw new Error('올바른 생년월일을 입력해 주세요.');
  await transact('readwrite', (s) => s.put(p, who));
  try { localStorage.removeItem(KEY[who]); } catch { /* 이전 저장소 접근 제한 */ }
}
export async function removeSaved(who) {
  await transact('readwrite', (s) => who ? s.delete(who) : s.clear());
  for (const key of who ? [KEY[who]] : Object.values(KEY)) {
    try { localStorage.removeItem(key); } catch { /* 접근 제한 */ }
    try { sessionStorage.removeItem(key); } catch { /* 접근 제한 */ }
  }
}
export function sessionLoad(who) {
  try { const p = JSON.parse(sessionStorage.getItem(KEY[who])); if (validFor(who, p)) return p; } catch { /* 접근 제한 */ }
  return takeLegacy(who);
}
export function sessionSave(who, p) {
  try { sessionStorage.setItem(KEY[who], JSON.stringify(p)); return true; } catch { return false; }
}
export const toEngine = (p) => ({
  name: p.name, gender: p.gender, calendar: p.calendar, leap: p.leap, y: p.y, m: p.m, d: p.d,
  time: p.noTime || p.timeMode === 'branch' ? null : p.time,
  ...(!p.noTime && p.timeMode === 'branch' ? { timeBranch: p.timeBranch } : {}),
});

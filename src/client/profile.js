// 영구 보관은 사용자가 선택한 IndexedDB. 미선택 입력은 현재 탭의 세션에만 유지한다.
import { tr } from '../i18n/runtime.js';
const KEY = { a: 'ohaeng:profile', b: 'ohaeng:partner', tojeong: 'ohaeng:tojeong' };
const DB_NAME = 'ohaeng-profiles';
const STORE = 'profiles';

function database() {
  return new Promise((resolve, reject) => {
    if (!globalThis.indexedDB) { reject(new Error(tr("IndexedDB를 사용할 수 없습니다.", "IndexedDB is unavailable."))); return; }
    const req = indexedDB.open(DB_NAME, 1);
    let expired = false;
    const timer = setTimeout(() => { expired = true; reject(new Error(tr("저장소 연결이 지연되고 있습니다. 다른 탭을 닫고 다시 시도해 주세요.", "Storage is taking too long to connect. Close other tabs and try again."))); }, 3000);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => { clearTimeout(timer); if (expired) { req.result.close(); return; } req.result.onversionchange = () => req.result.close(); resolve(req.result); };
    req.onerror = () => { clearTimeout(timer); reject(req.error); };
    req.onblocked = () => { clearTimeout(timer); expired = true; reject(new Error(tr("다른 탭에서 저장소를 사용 중입니다.", "Storage is in use in another tab."))); };
  });
}
async function transact(mode, action) {
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const request = action(tx.objectStore(STORE));
    tx.oncomplete = () => { db.close(); resolve(request?.result); };
    tx.onabort = tx.onerror = () => { db.close(); reject(tx.error || new Error(tr("저장에 실패했습니다.", "Could not save your details."))); };
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
  if (!validFor(who, p)) throw new Error(tr("올바른 생년월일을 입력해 주세요.", "Please enter a valid birth date."));
  if (who === 'a' || who === 'b') {
    const saved = await directory((data, store) => {
      // 계산 화면에서 다른 사람을 입력해도 기존 인물을 덮어쓰지 않는다. 수정은 관리 화면에서 명시적으로 한다.
      let person = data.people.find(person => signature(person.profile) === signature(p));
      if (!person) { person = entry(p); data.people.push(person); }
      const profile = { ...person.profile, profileId: person.id };
      store.put(profile, who);
      if (!data.guided) { data.guided = true; data.guidePending = true; }
      return profile;
    });
    try { localStorage.removeItem(KEY[who]); } catch { /* 이전 저장소 접근 제한 */ }
    sessionSave(who, saved);
    changed();
    return saved;
  }
  await transact('readwrite', (s) => s.put(p, who));
  try { localStorage.removeItem(KEY[who]); } catch { /* 이전 저장소 접근 제한 */ }
}
export async function removeSaved(who) {
  const people = who ? [who] : ['a', 'b'];
  // 사주의 나·상대 삭제는 별도 토정비결 입력을 건드리지 않는다.
  await directory((data, s) => {
    for (const person of people) s.delete(person);
    if (!who) { data.people = []; data.guidePending = false; }
  });
  for (const key of people.map(person => KEY[person])) {
    try { localStorage.removeItem(key); } catch { /* 접근 제한 */ }
    try { sessionStorage.removeItem(key); } catch { /* 접근 제한 */ }
  }
  changed();
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

// 같은 저장소에 이름별 목록을 추가하고 기존 DB 버전과 a/b 읽기 계약을 유지한다.
const DIRECTORY = 'people:v1';
const clean = p => ({
  name: String(p.name || '').trim().slice(0, 12), gender: p.gender, calendar: p.calendar || 'solar',
  leap: !!p.leap, y: p.y, m: p.m, d: p.d, noTime: !!p.noTime,
  timeMode: p.timeMode === 'branch' ? 'branch' : 'exact', time: p.time || null, timeBranch: p.timeBranch ?? null,
});
const signature = p => {
  const value = clean(p);
  if (value.noTime) { value.timeMode = 'exact'; value.time = value.timeBranch = null; }
  else if (value.timeMode === 'branch') value.time = null;
  else value.timeBranch = null;
  return JSON.stringify(value);
};
const entry = (profile, id = globalThis.crypto.randomUUID()) => ({ id, profile: clean(profile), updatedAt: Date.now() });
export const profileLabel = p => p.name || `${p.y}.${p.m}.${p.d}`;
export function changed(detail = {}) { document.dispatchEvent(new globalThis.CustomEvent('profiles-changed', { detail })); }

async function directory(action) {
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite'), store = tx.objectStore(STORE);
    const list = store.get(DIRECTORY), a = store.get('a'), b = store.get('b');
    let result, failure;
    b.onsuccess = () => {
      try {
        const data = list.result || { people: [], guided: false, guidePending: false };
        if (!list.result) {
          // 저장 동의를 받은 IndexedDB 정보만 목록으로 옮긴다. localStorage는 옮기지 않는다.
          for (const [slot, req] of [['a', a], ['b', b]]) {
            if (!valid(req.result)) continue;
            let person = data.people.find(person => signature(person.profile) === signature(req.result));
            if (!person) { person = entry(req.result, `legacy-${slot}`); data.people.push(person); }
            store.put({ ...person.profile, profileId: person.id }, slot);
          }
        }
        result = action(data, store);
        store.put(data, DIRECTORY);
      } catch (error) { failure = error; tx.abort(); }
    };
    tx.oncomplete = () => { db.close(); resolve(result); };
    tx.onabort = tx.onerror = () => { db.close(); reject(failure || tx.error || new Error('Profile storage failed')); };
  });
}

export async function listPeople() { return directory(data => data.people); }
export async function savePerson(profile, id) {
  if (!valid(profile)) throw new Error('Invalid birth profile');
  const person = await directory((data, store) => {
    const index = id ? data.people.findIndex(person => person.id === id) : -1;
    if (id && index < 0) throw new Error('Profile no longer exists');
    const next = entry(profile, id);
    if (index < 0) data.people.push(next); else data.people[index] = next;
    for (const slot of ['a', 'b']) {
      const req = store.get(slot);
      req.onsuccess = () => { if (id && req.result?.profileId === id) store.put({ ...next.profile, profileId: next.id }, slot); };
    }
    if (!data.guided) { data.guided = true; data.guidePending = true; }
    return next;
  });
  for (const slot of ['a', 'b']) if (id && sessionLoad(slot)?.profileId === id) sessionSave(slot, { ...person.profile, profileId: id });
  changed({ edited: id });
  return person;
}
export async function selectPerson(id, slot = 'a') {
  if (!['a', 'b'].includes(slot)) throw new Error('Invalid profile slot');
  const profile = await directory((data, store) => {
    const person = data.people.find(person => person.id === id);
    if (!person) throw new Error('Profile no longer exists');
    const p = { ...person.profile, profileId: id };
    store.put(p, slot);
    return p;
  });
  sessionSave(slot, profile);
  return profile;
}
export async function deletePerson(id) {
  await directory((data, store) => {
    data.people = data.people.filter(person => person.id !== id);
    for (const slot of ['a', 'b']) {
      const req = store.get(slot);
      req.onsuccess = () => { if (req.result?.profileId === id) store.delete(slot); };
    }
  });
  for (const slot of ['a', 'b']) {
    if (sessionLoad(slot)?.profileId !== id) continue;
    try { sessionStorage.removeItem(KEY[slot]); } catch { /* Storage may be restricted. */ }
  }
  changed({ deleted: id });
}
export async function consumeProfileGuide() {
  return directory(data => { const pending = data.guidePending; data.guidePending = false; return pending; });
}

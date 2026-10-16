import { tr } from '../i18n/runtime.js';
import { branchName } from '../i18n/terms.js';
// 시진(時辰) 선택: 동경 127.5° 평균태양시(UTC+8:30)의 두 시간 구간을 출생 당시의 시계 시각으로 바꿔 보여 준다.
// 고른 시진은 그 구간 가운데의 시계 시각으로 바꿔 정확한 시각 입력과 같은 보정 경로(30분·서머타임)로 계산한다.
const LMT = 510;
const mod = (a, b) => ((a % b) + b) % b;
const hhmm = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

// off: 출생일의 표준시(UTC 기준 분). 일반 540(UTC+9), 서머타임 600, 1954~61년 510, 그 기간의 서머타임 570.
// 시계로 본 하루(00:00~24:00)를 평균태양시 시진 경계(홀수 시 정각)로 자른다.
// shift는 일주가 시계 날짜와 같은지(0), 다음 날인지(1), 전날인지(-1)를 뜻한다(밤 11시 자시는 다음 날 일주).
export function birthTimeOptions(off = 540) {
  const delta = off - LMT;
  const out = [];
  for (let start = 0; start < 1440;) {
    const m = start - delta;
    const end = Math.min(1440, 60 + 120 * (Math.floor((m - 60) / 120) + 1) + delta);
    const branch = mod(Math.floor((m + 60) / 120), 12);
    const shift = Math.floor(m / 1440) + (mod(m, 1440) >= 1380 ? 1 : 0);
    const value = `${shift > 0 ? 'n' : shift < 0 ? 'p' : ''}${branch}`;
    const note = shift > 0 ? tr(' (다음 날 일주)', ' (next day pillar)') : shift < 0 ? tr(' (전날 일주)', ' (previous day pillar)') : '';
    out.push({ value, branch, shift, start, end, time: hhmm(Math.floor((start + end) / 2)), label: `${branchName(branch)}${tr('시', ' hour')} · ${hhmm(start)}~${hhmm(end)}${note}` });
    start = end;
  }
  return out;
}

// 이전 버전의 저장값(zi-early·zi-late)도 읽는다.
const LEGACY = { 'zi-early': '0', 'zi-late': 'n0' };
export const normalizeBranch = (value) => LEGACY[value] ?? (value == null ? null : String(value));
export const resolveBirthTime = (value, off) => birthTimeOptions(off).find((o) => o.value === normalizeBranch(value)) || null;
// 시계 시각(HH:MM)이 속한 시진
export function branchOfTime(time, off) {
  const [h, mi] = String(time || '').split(':').map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(mi)) return null;
  const t = h * 60 + mi;
  return birthTimeOptions(off).find((o) => t >= o.start && t < o.end) || null;
}
// 구간이 평소(UTC+9)와 다른 날짜의 안내
export function offsetNote(off) {
  if (off === 600) return tr('서머타임 기간이라 시진 구간이 평소보다 1시간 늦습니다.', 'Daylight saving time places these intervals one hour later than usual.');
  if (off === 570) return tr('동경 127.5° 표준시에 서머타임이 더해진 기간이라 구간이 평소보다 30분 늦습니다.', 'The historical 127.5°E time zone with daylight saving places these intervals 30 minutes later than usual.');
  if (off === 510) return tr('동경 127.5° 표준시를 쓰던 기간이라 구간이 평소보다 30분 이릅니다.', 'The historical 127.5°E time zone places these intervals 30 minutes earlier than usual.');
  return '';
}

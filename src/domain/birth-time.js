// 시진 선택은 이미 지지를 알고 있는 입력이다. 표준시 보정을 다시 적용하지 않는다.
const NAMES = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
const pad = (n) => String(n).padStart(2, '0');
export const BIRTH_TIMES = [
  { value: 'zi-early', branch: 0, time: '00:00', label: '자시 · 새벽 00:00~01:00' },
  ...NAMES.slice(1).map((name, i) => ({ value: String(i + 1), branch: i + 1, time: `${pad((i + 1) * 2)}:00`, label: `${name}시 · ${pad(i * 2 + 1)}:00~${pad(i * 2 + 3)}:00` })),
  { value: 'zi-late', branch: 0, time: '23:30', label: '자시 · 밤 23:00~24:00 (다음 날 일주)' },
];
export const birthTime = (value) => BIRTH_TIMES.find((t) => t.value === value);
export const birthTimeLabel = (p) => p.noTime ? '시간 모름' : p.timeMode === 'branch' ? birthTime(p.timeBranch)?.label || '시진 미선택' : `${p.time} (기존 시각)`;

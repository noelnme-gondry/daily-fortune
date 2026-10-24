import test from 'node:test';
import assert from 'node:assert/strict';
import { birthDateError, BIRTH_YEAR_MIN, BIRTH_YEAR_MAX } from '../src/domain/birth-input.js';
import { buildChart, ChartInputError } from '../src/engine/chart.js';
import { solarOfLunar } from '../src/engine/calendar.js';
import { withLanguage } from '../src/i18n/runtime.js';

const today = { y: 2026, m: 10, d: 24 };
test('현재 날짜를 기준으로 양력·음력 생일을 검증한다', () => {
  assert.equal(birthDateError({ calendar: 'solar', ...today }, today), '');
  assert.match(birthDateError({ calendar: 'solar', y: 2026, m: 10, d: 25 }, today), /미래/);
  const lunar = { calendar: 'lunar', y: 2026, m: 10, d: 1 };
  const converted = solarOfLunar(lunar.y, lunar.m, lunar.d, false);
  assert.equal(birthDateError(lunar, converted), '');
  assert.match(birthDateError(lunar, today), /미래/);
  assert.match(birthDateError({ calendar: 'lunar', y: 2021, m: 4, d: 10, leap: true }, today), /존재하지 않는 음력/);
  assert.match(birthDateError({ calendar: 'solar', y: 2026, m: 2, d: 30 }, today), /없습니다/);
  assert.match(birthDateError({ calendar: 'solar', y: 2026, m: 0, d: 0 }, today), /모두 선택/);
  assert.match(birthDateError({ calendar: 'solar', y: 1990, m: 13, d: 1 }, today), /확인/);
  assert.match(birthDateError({ calendar: 'solar', y: 1899, m: 1, d: 1 }, today), /확인/);
  assert.match(withLanguage('en', () => birthDateError({ ...today, d: 25 }, today)), /future/);
});

test('연도 입력 범위와 연구용 원국 계산 범위가 일치하며 미래 원국 엔진은 보존된다', () => {
  const profile = { gender: 'F', calendar: 'solar', m: 5, d: 15, time: '14:00' };
  for (const y of [BIRTH_YEAR_MIN, BIRTH_YEAR_MAX]) assert.ok(buildChart({ ...profile, y }).pillars.day);
  for (const y of [BIRTH_YEAR_MIN - 1, BIRTH_YEAR_MAX + 1]) assert.throws(() => buildChart({ ...profile, y }), ChartInputError);
});

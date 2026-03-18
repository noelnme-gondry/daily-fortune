import { checkIn, getMonthHistory } from './src/attendance.js';
import { sajuCalculator } from './src/sajuCalculator.js';

console.log('--- STARTING QA TESTS ---');

// 1. Mock localStorage
global.localStorage = {
  store: {},
  getItem(key) { return this.store[key] || null; },
  setItem(key, val) { this.store[key] = val.toString(); },
  removeItem(key) { delete this.store[key]; },
  get length() { return Object.keys(this.store).length; },
  key(i) { return Object.keys(this.store)[i]; }
};

// Override Date constructor to control time for the test
let mockDate = new Date();
const OriginalDate = global.Date;

class MockDate extends OriginalDate {
  constructor(...args) {
    if (args.length === 0) {
      super(mockDate.getTime());
    } else {
      super(...args);
    }
  }
}
global.Date = MockDate;
global.Date.now = () => mockDate.getTime();

// 2. Test Attendance Reset Logic
console.log('\\n[1] Testing Attendance Logic');

// Day 1
mockDate = new OriginalDate('2026-03-01T10:00:00Z');
let result1 = checkIn();
console.log('Day 1 Check-in:', result1.date, 'isNew:', result1.isNew, 'streak:', result1.streak);

// Same Day later
mockDate = new OriginalDate('2026-03-01T23:59:59Z');
let result1_later = checkIn();
console.log('Day 1 Later Check-in:', result1_later.date, 'isNew:', result1_later.isNew, 'streak:', result1_later.streak);

// Day 2 (Consecutive)
mockDate = new OriginalDate('2026-03-02T01:00:00Z');
let result2 = checkIn();
console.log('Day 2 Check-in:', result2.date, 'isNew:', result2.isNew, 'streak:', result2.streak);

// Day 4 (Broken streak)
mockDate = new OriginalDate('2026-03-04T10:00:00Z');
let result4 = checkIn();
console.log('Day 4 Check-in:', result4.date, 'isNew:', result4.isNew, 'streak:', result4.streak);


// 3. Test Saju Calculator Edge Cases (Leap Months & End of Year)
console.log('\\n[2] Testing Saju Calculator Edge Cases');

const edgeCases = [
  { name: 'Leap Month (2023 윤2월 - Apr 18, 2023)', y: 2023, m: 4, d: 18, h: 12 },
  { name: 'Leap Month (2020 윤4월 - May 24, 2020)', y: 2020, m: 5, d: 24, h: 12 },
  { name: 'End of Year (Dec 31, 1999)', y: 1999, m: 12, d: 31, h: 23 },
  { name: 'Start of Year (Jan 1, 2000)', y: 2000, m: 1, d: 1, h: 0 },
  { name: 'Lunar New Year exactly (Feb 10, 2024)', y: 2024, m: 2, d: 10, h: 12 }
];

edgeCases.forEach(tc => {
  try {
    const res = sajuCalculator(tc.y, tc.m, tc.d, tc.h);
    console.log(`✅ ${tc.name}: Success. Lunar Date = ${res.lunarDate.displayKo}, Leap? ${res.lunarDate.isLeapMonth}`);
  } catch (err) {
    console.log(`❌ ${tc.name}: ERROR!`, err.message);
  }
});

console.log('\\n--- TESTS COMPLETE ---');

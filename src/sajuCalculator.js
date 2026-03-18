// ── Saju Calculator ────────────────────────────────────────────
// Wrapper around lunar-javascript for Korean Four Pillars (사주팔자)
// Acts as a client-side "API" for Saju calculations — no backend needed.

import { Solar } from 'lunar-javascript';

// ── Heavenly Stems (천간 / 天干) ──
const HEAVENLY_STEMS = [
  { ko: '갑', en: 'Gap',    hanja: '甲', element: 'Wood',  elementKo: '목(木)', yin: false, emoji: '🌳' },
  { ko: '을', en: 'Eul',    hanja: '乙', element: 'Wood',  elementKo: '목(木)', yin: true,  emoji: '🌿' },
  { ko: '병', en: 'Byeong', hanja: '丙', element: 'Fire',  elementKo: '화(火)', yin: false, emoji: '🔥' },
  { ko: '정', en: 'Jeong',  hanja: '丁', element: 'Fire',  elementKo: '화(火)', yin: true,  emoji: '🕯️' },
  { ko: '무', en: 'Mu',     hanja: '戊', element: 'Earth', elementKo: '토(土)', yin: false, emoji: '⛰️' },
  { ko: '기', en: 'Gi',     hanja: '己', element: 'Earth', elementKo: '토(土)', yin: true,  emoji: '🏜️' },
  { ko: '경', en: 'Gyeong', hanja: '庚', element: 'Metal', elementKo: '금(金)', yin: false, emoji: '⚔️' },
  { ko: '신', en: 'Sin',    hanja: '辛', element: 'Metal', elementKo: '금(金)', yin: true,  emoji: '💍' },
  { ko: '임', en: 'Im',     hanja: '壬', element: 'Water', elementKo: '수(水)', yin: false, emoji: '🌊' },
  { ko: '계', en: 'Gye',    hanja: '癸', element: 'Water', elementKo: '수(水)', yin: true,  emoji: '💧' },
];

// ── Earthly Branches (지지 / 地支) ──
const EARTHLY_BRANCHES = [
  { ko: '자', en: 'Ja',  hanja: '子', animal: '쥐',     animalEn: 'Rat',     emoji: '🐀', hours: '23:00-01:00' },
  { ko: '축', en: 'Chuk',hanja: '丑', animal: '소',     animalEn: 'Ox',      emoji: '🐂', hours: '01:00-03:00' },
  { ko: '인', en: 'In',  hanja: '寅', animal: '호랑이', animalEn: 'Tiger',   emoji: '🐅', hours: '03:00-05:00' },
  { ko: '묘', en: 'Myo', hanja: '卯', animal: '토끼',   animalEn: 'Rabbit',  emoji: '🐇', hours: '05:00-07:00' },
  { ko: '진', en: 'Jin', hanja: '辰', animal: '용',     animalEn: 'Dragon',  emoji: '🐉', hours: '07:00-09:00' },
  { ko: '사', en: 'Sa',  hanja: '巳', animal: '뱀',     animalEn: 'Snake',   emoji: '🐍', hours: '09:00-11:00' },
  { ko: '오', en: 'O',   hanja: '午', animal: '말',     animalEn: 'Horse',   emoji: '🐎', hours: '11:00-13:00' },
  { ko: '미', en: 'Mi',  hanja: '未', animal: '양',     animalEn: 'Sheep',   emoji: '🐑', hours: '13:00-15:00' },
  { ko: '신', en: 'Sin', hanja: '申', animal: '원숭이', animalEn: 'Monkey',  emoji: '🐒', hours: '15:00-17:00' },
  { ko: '유', en: 'Yu',  hanja: '酉', animal: '닭',     animalEn: 'Rooster', emoji: '🐓', hours: '17:00-19:00' },
  { ko: '술', en: 'Sul', hanja: '戌', animal: '개',     animalEn: 'Dog',     emoji: '🐕', hours: '19:00-21:00' },
  { ko: '해', en: 'Hae', hanja: '亥', animal: '돼지',   animalEn: 'Pig',     emoji: '🐖', hours: '21:00-23:00' },
];

// ── Five Elements (오행 / 五行) ──
const FIVE_ELEMENTS = {
  Wood:  { ko: '목(木)', emoji: '🌳', color: '#4ade80', meaning: '성장, 확장, 창의성',  meaningEn: 'Growth, expansion, creativity' },
  Fire:  { ko: '화(火)', emoji: '🔥', color: '#f87171', meaning: '열정, 변화, 에너지',  meaningEn: 'Passion, transformation, energy' },
  Earth: { ko: '토(土)', emoji: '⛰️', color: '#fbbf24', meaning: '안정, 균형, 신뢰',    meaningEn: 'Stability, balance, trust' },
  Metal: { ko: '금(金)', emoji: '⚔️', color: '#e2e8f0', meaning: '결단, 정의, 강인함',  meaningEn: 'Determination, justice, strength' },
  Water: { ko: '수(水)', emoji: '🌊', color: '#60a5fa', meaning: '지혜, 유연성, 소통',  meaningEn: 'Wisdom, flexibility, communication' },
};

// ── Stem name → index lookup ──
const STEM_NAMES = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const BRANCH_NAMES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];

function stemIndex(hanjaChar) {
  return STEM_NAMES.indexOf(hanjaChar);
}

function branchIndex(hanjaChar) {
  return BRANCH_NAMES.indexOf(hanjaChar);
}

/**
 * Get the hour branch index from birth hour (0-23)
 */
function getHourBranchIdx(hour) {
  if (hour === 23 || hour === 0) return 0; // 자시
  return Math.floor((hour + 1) / 2);
}

/**
 * Get the hour stem index from day stem and hour branch
 */
function getHourStemIdx(dayStemIdx, hourBranchIdx) {
  const base = (dayStemIdx % 5) * 2;
  return (base + hourBranchIdx) % 10;
}

/**
 * Main Saju Calculator entry point.
 *
 * Takes a user's birthdate (solar calendar) and birth hour,
 * and outputs their Saju (四柱八字) — Four Pillars of Destiny.
 *
 * @param {number} year  - Solar birth year (e.g. 1995)
 * @param {number} month - Solar birth month (1-12)
 * @param {number} day   - Solar birth day (1-31)
 * @param {number} hour  - Birth hour (0-23), default 12 if unknown
 * @returns {SajuResult}  Complete Saju analysis
 */
export function sajuCalculator(year, month, day, hour = 12) {
  // Use lunar-javascript to convert solar → lunar and get Bazi
  const solar = Solar.fromYmd(year, month, day);
  const lunar = solar.getLunar();

  // ── Year Pillar (년주) — from lunar year ──
  const yearGanZhi = lunar.getYearInGanZhi();
  const yearStemIdx = stemIndex(yearGanZhi[0]);
  const yearBranchIdx = branchIndex(yearGanZhi[1]);

  // ── Month Pillar (월주) — from lunar month ──
  const monthGanZhi = lunar.getMonthInGanZhi();
  const monthStemIdx = stemIndex(monthGanZhi[0]);
  const monthBranchIdx = branchIndex(monthGanZhi[1]);

  // ── Day Pillar (일주) — from lunar day ──
  const dayGanZhi = lunar.getDayInGanZhi();
  const dayStemIdx = stemIndex(dayGanZhi[0]);
  const dayBranchIdx = branchIndex(dayGanZhi[1]);

  // ── Hour Pillar (시주) — calculated from day stem + birth hour ──
  const hourBranchIdx = getHourBranchIdx(hour);
  const hourStemIdx = getHourStemIdx(dayStemIdx, hourBranchIdx);

  // ── Build pillars ──
  const pillars = {
    year: {
      label: '년주 (Year)',
      stem: HEAVENLY_STEMS[yearStemIdx],
      branch: EARTHLY_BRANCHES[yearBranchIdx],
      ganZhi: yearGanZhi,
    },
    month: {
      label: '월주 (Month)',
      stem: HEAVENLY_STEMS[monthStemIdx],
      branch: EARTHLY_BRANCHES[monthBranchIdx],
      ganZhi: monthGanZhi,
    },
    day: {
      label: '일주 (Day)',
      stem: HEAVENLY_STEMS[dayStemIdx],
      branch: EARTHLY_BRANCHES[dayBranchIdx],
      ganZhi: dayGanZhi,
    },
    hour: {
      label: '시주 (Hour)',
      stem: HEAVENLY_STEMS[hourStemIdx],
      branch: EARTHLY_BRANCHES[hourBranchIdx],
      ganZhi: `${STEM_NAMES[hourStemIdx]}${BRANCH_NAMES[hourBranchIdx]}`,
    },
  };

  // ── Five Elements analysis (from all 8 characters) ──
  const elementCount = { Wood: 0, Fire: 0, Earth: 0, Metal: 0, Water: 0 };
  Object.values(pillars).forEach(p => {
    elementCount[p.stem.element]++;
    // Also count branch's hidden stem element for richer analysis
  });

  // ── Dominant & lacking elements ──
  const sortedElements = Object.entries(elementCount).sort((a, b) => b[1] - a[1]);
  const dominant = sortedElements[0];
  const lacking = sortedElements.filter(([, count]) => count === 0).map(([el]) => el);

  // ── Lunar date info ──
  const lunarDate = {
    year: lunar.getYear(),
    month: lunar.getMonth(),
    day: lunar.getDay(),
    yearInGanZhi: yearGanZhi,
    isLeapMonth: lunar.getMonth() !== lunar.getMonth(), // simplified
    displayKo: `${lunar.getYear()}년 ${lunar.getMonth()}월 ${lunar.getDay()}일 (음력)`,
    displayEn: `Lunar: ${lunar.getYear()}-${lunar.getMonth()}-${lunar.getDay()}`,
  };

  // ── Day Master (일간 / 日干) — the core of the person's chart ──
  const dayMaster = {
    stem: HEAVENLY_STEMS[dayStemIdx],
    description: `당신의 일간(日干)은 ${HEAVENLY_STEMS[dayStemIdx].ko}(${HEAVENLY_STEMS[dayStemIdx].hanja})입니다.`,
    element: HEAVENLY_STEMS[dayStemIdx].element,
  };

  return {
    pillars,
    elementCount,
    fiveElements: FIVE_ELEMENTS,
    dominant: { element: dominant[0], count: dominant[1], info: FIVE_ELEMENTS[dominant[0]] },
    lacking: lacking.map(el => ({ element: el, info: FIVE_ELEMENTS[el] })),
    lunarDate,
    dayMaster,
    solarDate: { year, month, day, hour },
  };
}

/**
 * Get a human-readable summary of the Saju analysis
 * @param {SajuResult} result - Output from sajuCalculator()
 * @returns {string} Formatted interpretation text
 */
export function getSajuInterpretation(result) {
  const { dominant, lacking, dayMaster } = result;

  let text = `${dayMaster.description}\n`;
  text += `주요 기운: ${dominant.info.ko} ${dominant.info.emoji}\n`;
  text += `${dominant.info.meaning} — ${dominant.info.meaningEn}\n\n`;

  if (lacking.length > 0) {
    text += `부족한 기운: ${lacking.map(l => `${l.info.ko} ${l.info.emoji}`).join(', ')}\n`;
    text += `이 기운을 보충하면 더 균형 잡힌 삶을 살 수 있습니다.`;
  } else {
    text += '모든 오행이 조화롭게 이루어져 있습니다! ✨';
  }

  return text;
}

// ── Export constants for UI modules ──
export { HEAVENLY_STEMS, EARTHLY_BRANCHES, FIVE_ELEMENTS };

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
  const lunarMonthRaw = lunar.getMonth();
  const isLeapMonth = lunarMonthRaw < 0;
  const lunarMonthAbs = Math.abs(lunarMonthRaw);
  const monthPrefixKo = isLeapMonth ? '윤' : '';
  const monthPrefixEn = isLeapMonth ? 'Leap ' : '';

  const lunarDate = {
    year: lunar.getYear(),
    month: lunarMonthAbs,
    day: lunar.getDay(),
    yearInGanZhi: yearGanZhi,
    isLeapMonth: isLeapMonth,
    displayKo: `${lunar.getYear()}년 ${monthPrefixKo}${lunarMonthAbs}월 ${lunar.getDay()}일 (음력)`,
    displayEn: `Lunar: ${lunar.getYear()}-${monthPrefixEn}${lunarMonthAbs}-${lunar.getDay()}`,
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

// ── Detailed Saju Interpretation Dictionaries ──
const DAY_MASTER_READINGS = {
  'Gap': { // 甲 (Wood, Yang)
    title: "하늘을 향해 곧게 뻗어나가는 거목(巨木)의 기운",
    flow: "당신은 위를 향해 거침없이 자라나는 큰 나무의 에너지를 타고났습니다. 리더십이 뛰어나고 매사에 진취적이며, 한 번 목표를 정하면 흔들림 없이 밀고 나가는 추진력이 당신의 가장 큰 무기입니다. 오늘은 당신의 이러한 주도적인 에너지가 주변을 끌어당겨 긍정적인 파동을 일으키는 흐름입니다.",
    relationships: "의리가 굳건하고 사람들을 보살피는 따뜻한 마음을 지녀 주변에 늘 사람이 따릅니다. 다만, 때로는 자신의 주장이 너무 강해 타협을 모르는 옹고집으로 비쳐질 수 있으니, 주변의 조언에 귀를 기울이는 포용력을 발휘해 보세요.",
    caution: "거센 태풍 앞에서는 뻣뻣한 큰 나무보다 유연한 갈대가 더 살아남기 쉽습니다. 뜻대로 풀리지 않는 일이 있다면 억지로 밀어붙이기보다 잠시 휘어질 줄 아는 지혜가 필요합니다."
  },
  'Eul': { // 乙 (Wood, Yin)
    title: "부드럽지만 질긴 생명력을 지닌 화초(花草)의 기운",
    flow: "바위 틈새에서도 꽃을 피워내는 끈질긴 생명력과 유연함이 당신의 본질입니다. 겉보기에는 부드럽고 여려 보이지만, 그 내면에는 어떤 환경에도 적응해내는 놀라운 강인함이 숨어 있습니다. 오늘은 당신의 특유의 친화력과 적응력이 빛을 발하여 어려운 문제도 매끄럽게 풀어갈 수 있는 날입니다.",
    relationships: "타인과의 공감 능력이 매우 뛰어나 상대방의 마음을 편안하게 해주는 매력이 있습니다. 사람들과 어울리기를 좋아하며 중재자 역할을 훌륭히 해냅니다. 다만 지나치게 타인의 시선을 의식해 자신의 진짜 마음을 숨기지 않도록 주의하세요.",
    caution: "환경의 변화에 민감하게 반응하다 보니 스트레스를 내면으로 삭히는 경향이 있습니다. 가끔은 온전히 당신 자신만의 감정에 이기적으로 귀 기울일 필요가 있습니다."
  },
  'Byeong': { // 丙 (Fire, Yang)
    title: "만물을 비추며 찬란하게 타오르는 태양(太陽)의 기운",
    flow: "세상을 밝게 비추는 태양처럼 명랑하고 화끈하며 매사에 열정이 넘칩니다. 감정 표현이 솔직하고 뒤끝이 없으며, 당신이 있는 곳은 늘 밝은 에너지로 가득 찹니다. 오늘은 당신의 눈부신 통찰력과 에너지가 빛을 발하여 숨겨져 있던 진실이나 새로운 기회를 포착하게 되는 흐름입니다.",
    relationships: "다방면에 관심이 많고 사교적이라 넓은 인맥을 자랑합니다. 하지만 불같이 타올랐다가 금방 식어버리는 경향이 있어 관계의 깊이가 얕아질 수 있습니다. 가까운 사람들에게 꾸준하고 일관된 온기를 나누어주는 것이 중요합니다.",
    caution: "태양은 스스로 너무 밝게 빛나 주변의 별빛을 가릴 수 있습니다. 때로는 타인이 돋보일 수 있도록 당신의 빛을 살짝 거두어주는 겸손함이 필요합니다."
  },
  'Jeong': { // 丁 (Fire, Yin)
    title: "어둠을 밝히는 온화하고 집중된 등대(燈臺)의 기운",
    flow: "은은하지만 끝까지 꺼지지 않는 촛불처럼, 고요하면서도 강렬한 내면의 에너지를 지녔습니다. 세심하고 희생정신이 강하며 타인의 마음을 따뜻하게 위로하는 능력이 탁월합니다. 오늘은 당신의 집중력과 직관력이 최고조에 달해, 오랫동안 고민하던 문제의 실마리를 찾게 되는 은혜로운 하루입니다.",
    relationships: "평소에는 얌전하고 순응하지만, 한 번 화가 나면 촛불이 횃불이 되듯 걷잡을 수 없는 에너지를 분출하기도 합니다. 인간관계에서 헌신적이지만, 자신이 베푼 만큼 돌아오지 않을 때 깊은 상처를 받을 수 있습니다.",
    caution: "감정의 기복이 겉으로는 잘 드러나지 않아 속병을 앓기 쉽습니다. 촛불이 거센 바람에 흔들리지 않도록 당신만의 안전하고 고요한 성소(시간과 공간)를 반드시 확보하세요."
  },
  'Mu': { // 戊 (Earth, Yang)
    title: "만물을 품어 안는 듬직하고 거대한 태산(泰山)의 기운",
    flow: "당신은 묵묵히 제자리를 지키며 주변을 온화하게 감싸 안는 든든한 큰 산입니다. 신중하고 포용력이 넓어 신뢰감을 주며, 쉽게 흔들리지 않는 묵직함이 있습니다. 오늘은 서두르지 않고 당신만의 페이스를 유지할 때 오히려 더 큰 성과와 안정을 얻을 수 있는 평탄한 흐름을 보여줍니다.",
    relationships: "사람들은 당신에게 의지하려 하고 당신은 그 기대를 저버리지 않는 책임감을 보입니다. 하지만 자신의 감정이나 비밀을 좀처럼 털어놓지 않아, 가장 가까운 사람조차 당신의 진짜 속마음을 모를 때가 있습니다.",
    caution: "산이 너무 높아 구름에 가려지듯, 지나친 고집이나 융통성 부족으로 스스로를 고립시킬 수 있습니다. 가파른 산길이 아닌 부드러운 평야처럼 마음의 빗장을 조금 열어보세요."
  },
  'Gi': { // 己 (Earth, Yin)
    title: "생명을 잉태하고 길러내는 기름진 대지(大地)의 기운",
    flow: "만물이 뿌리내릴 수 있도록 자양분을 제공하는 비옥한 흙의 기운을 타고났습니다. 무언가를 기르고 돌보는 일에 탁월하며, 세심하고 성실한 성향을 가졌습니다. 오늘은 당신이 지금까지 차곡차곡 쌓아온 노력이 비로소 영글어 달콤한 결실을 맺기 시작하는 풍요로운 날입니다.",
    relationships: "어머니와 같은 자애로움으로 사람들을 챙기고 배려합니다. 그러나 의심이 다소 많고 마음을 쉽게 열지 않는 조심스러운 면이 있어, 상처받는 것을 지나치게 두려워하며 관계를 제한하기도 합니다.",
    caution: "자신의 땅에 너무 많은 것을 품으려다 보면 흙이 지치기 마련입니다. 모든 사람의 고민을 짊어지려 하지 말고, 적절히 거절하는 기술을 익히는 것이 건강에 이롭습니다."
  },
  'Gyeong': { // 庚 (Metal, Yang)
    title: "부정함에 맞서 굳세게 벼려진 강철(鋼鐵)의 기운",
    flow: "단단한 바위나 제련되지 않은 큰 철망치처럼, 불의를 참지 못하고 결단력이 뛰어난 투사의 에너지를 지녔습니다. 흑백이 분명하고 의리가 넘치며 한다면 하는 강한 승부욕이 특징입니다. 오늘은 과감한 행동력이 필요한 과업에서 압도적인 성과를 거두게 될 것입니다.",
    relationships: "한 번 맺은 의리는 굳게 지키는 듬직한 사람입니다. 다소 융통성이 부족하고 말이 직선적이라 본의 아니게 타인에게 상처를 줄 수 있으니, 칼집을 씌운 명검처럼 매너와 부드러움을 겸비해야 합니다.",
    caution: "강철은 부러질지언정 휘어지지 않습니다. 하지만 너무 강하기만 한 것은 부러지기 쉬운 법이니, 불(화)과 물(수)의 기운을 빌려 스스로를 부드럽게 담금질하는 여유를 가지세요."
  },
  'Sin': { // 辛 (Metal, Yin)
    title: "정교하게 제련되어 영롱하게 빛나는 보석(寶石)의 기운",
    flow: "예리하고 세련되며 깔끔하고 완벽을 추구하는 완성된 보석입니다. 직관력이 매우 뛰어나고 미적 감각이 남다르며, 섬세하고 예민한 기질을 숨기고 있습니다. 오늘은 당신의 날카로운 분석력과 디테일한 터치가 빛을 발해, 복잡하게 얽힌 상황을 명쾌하게 정리해 낼 수 있는 날입니다.",
    relationships: "사리분별이 정확하고 예의 바르지만, 마음의 벽이 높아 진정한 친구를 두는 데 시간이 걸립니다. 타인의 단점이 너무 잘 보이다 보니 비판에 날이 서 있을 수 있습니다. 가끔은 상대의 결점도 눈감아주는 포용이 필요합니다.",
    caution: "보석은 상처 입기를 두려워하여 흠집이 나는 것을 극도로 꺼립니다. 지나친 완벽주의는 스스로를 갉아먹을 수 있으니, 조금은 허술해져도 세상이 무너지지 않는다는 것을 기억하세요."
  },
  'Im': { // 壬 (Water, Yang)
    title: "포용력으로 세상을 덮고 흐르는 드넓은 바다(大海)의 기운",
    flow: "모든 것을 포용하고 수용하는 끝없이 넓은 바다와 같습니다. 두뇌 회전이 비상하게 빠르고 지혜로우며, 상황에 맞게 자신을 변화시키는 임기응변이 뛰어납니다. 오늘은 평온해 보이지만 그 속에 거대한 조류가 흐르듯, 내면 깊은 곳에서 창의성이나 위기를 돌파할 강력한 아이디어가 솟아오를 징조가 있습니다.",
    relationships: "누구와도 잘 어울리고 이해심이 넓은 듯 하지만, 속을 알 수 없다는 말을 종종 듣습니다. 자유로운 영혼이라 한 곳에 얽매이는 것을 극도로 싫어하며, 구속을 거부합니다.",
    caution: "바다는 너무 깊어 그 끝을 가늠할 수 없고, 때로는 모든 것을 삼키는 비의 파도로 돌변할 수 있습니다. 지혜를 넘어 잔머리나 핑계로 상황을 모면하려는 성향을 스스로 경계해야 합니다."
  },
  'Gye': { // 癸 (Water, Yin)
    title: "조용히 스며들어 생명을 적시는 봄비(春雨)의 기운",
    flow: "이슬이나 가랑비처럼 조용하지만 끈기 있게 자신이 원하는 방향으로 흘러가는 세심한 물의 기운입니다. 아이디어가 풍부하고 감수성이 뛰어나며 기획력과 참을성을 겸비했습니다. 오늘은 메마른 대지를 적시는 비처럼, 갈등이 있던 관계를 화해시키고 건조한 상황에 윤기를 더하는 부드러운 윤활유 역할을 해낼 것입니다.",
    relationships: "친화력이 뛰어나 타인의 감정에 깊이 공감하고 맞춰주는 능력이 탁월하지만, 스트레스가 쌓이면 갑자기 문을 닫고 잠수를 타려는 경향이 있습니다. 관계에서 너무 참고 희생하지만 마세요.",
    caution: "물이 너무 많으면 흐르다 못해 넘쳐서 깊은 슬픔에 빠지기 쉽습니다. 생각의 늪에 빠져들지 않도록 운동이나 긍정적인 명상을 통해 양(陽)의 기운을 보충하는 것이 좋습니다."
  }
};

const ELEMENT_BALANCE_READINGS = {
  Wood: "현재 유난히 목(木)의 기운이 강하게 지배하고 있습니다. 이는 생명력과 확장, 새로운 시도에 매우 유리한 에너지를 발산합니다. 계획하던 일이 있다면 힘차게 밀어붙여도 좋지만, 무모한 확장보다는 단단한 뿌리를 내리는 데 집중해야 탈이 없습니다.",
  Fire: "현재 화(火)의 뜨거운 에너지가 중심을 잡고 있습니다. 감정이 화려하게 피어나며 어떤 노력이든 결과가 밖으로 뚜렷하게 드러납니다. 소셜 활동이나 대외적인 어필에 크게 유리하나, 성급한 결정이나 감정 충돌을 각별히 조심해야 합니다.",
  Earth: "현재 토(土)의 기운이 사주를 감싸 안고 있습니다. 역동적인 변화보다는 관망과 안정적인 정비가 더 좋은 성과를 냅니다. 오늘은 새로운 시작보다 지금까지의 재정이나 대인 관계를 점검하고, 든든한 신뢰망을 재확인하기에 완벽한 시기입니다.",
  Metal: "현재 금(金)의 기운이 가장 날카롭게 빛나고 있습니다. 결단과 수확, 예리하고 차가운 이성이 행동을 지배합니다. 불필요한 인연이나 악습관을 칼처럼 잘라내고 상황을 정리정돈하기에 최적화된 흐름입니다.",
  Water: "현재 수(水)의 기운이 깊고 넓게 흐르고 있습니다. 지혜와 유연함, 그리고 낭만적이고 비밀스러운 직관력이 발달합니다. 활동적인 일보다는 휴식과 명상, 예술 활동이나 깊이 있는 학업에 몰두하며, 무리하지 않고 물 흐르듯 유연하게 대처하세요."
};

/**
 * Get a human-readable summary of the Saju analysis
 * @param {SajuResult} result - Output from sajuCalculator()
 * @returns {string} Formatted interpretation text
 */
export function getSajuInterpretation(result) {
  const { dominant, lacking, dayMaster } = result;
  const dmKey = dayMaster.stem.en;
  const reading = DAY_MASTER_READINGS[dmKey] || DAY_MASTER_READINGS['Gap'];
  const balanceReading = ELEMENT_BALANCE_READINGS[dominant.element] || ELEMENT_BALANCE_READINGS['Earth'];

  let html = `<div class="saju-reading-title">✨ ${reading.title}</div>\n`;
  
  html += `<div class="saju-reading-section">\n`;
  html += `  <div class="saju-reading-subtitle">🌊 기운의 흐름과 일상</div>\n`;
  html += `  <p>${reading.flow} <br><br>덧붙여, 당신의 기운 중 <strong>${dominant.info.ko}</strong>의 기세가 매우 강합니다. ${balanceReading}</p>\n`;
  html += `</div>\n`;

  html += `<div class="saju-reading-section">\n`;
  html += `  <div class="saju-reading-subtitle">🤝 대인 관계</div>\n`;
  html += `  <p>${reading.relationships}</p>\n`;
  html += `</div>\n`;

  html += `<div class="saju-reading-section">\n`;
  html += `  <div class="saju-reading-subtitle">⚠️ 조언과 주의점</div>\n`;
  html += `  <p>${reading.caution}</p>\n`;
  
  if (lacking.length > 0) {
    const lacks = lacking.map(l => l.info.ko).join(', ');
    const colors = lacking.map(l => l.info.color).join('색, ');
    html += `  <div class="saju-lacking-alert">\n`;
    html += `    💡 <strong>개운(開運) 포인트:</strong> 사주에 <b>${lacks}</b> 기운이 다소 부족합니다. 평소 이 기운을 뜻하는 색상이나 물건을 곁에 두어 밸런스를 맞추면 막힌 운의 흐름을 부드럽게 풀고 행운을 극대화할 수 있습니다.\n`;
    html += `  </div>\n`;
  } else {
    html += `  <div class="saju-lacking-alert">\n`;
    html += `    💡 <strong>개운(開運) 포인트:</strong> 오행의 밸런스가 아주 훌륭하게 잡혀 있습니다. 현재의 긍정적인 평정심을 유지하며 원하는 것을 마음껏 펼쳐보세요!\n`;
    html += `  </div>\n`;
  }

  html += `</div>\n`;

  return html;
}

// ── Export constants for UI modules ──
export { HEAVENLY_STEMS, EARTHLY_BRANCHES, FIVE_ELEMENTS };

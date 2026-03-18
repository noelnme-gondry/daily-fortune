// ── Saju Module ────────────────────────────────────────────────
// Korean Four Pillars (사주팔자) calculator using lunar calendar
import KoreanLunarCalendar from 'korean-lunar-calendar';

// ── Heavenly Stems (천간) ──
const STEMS = [
  { name: '갑', nameEn: 'Gap', element: '목(木)', elementEn: 'Wood', yin: false, emoji: '🌳' },
  { name: '을', nameEn: 'Eul', element: '목(木)', elementEn: 'Wood', yin: true, emoji: '🌿' },
  { name: '병', nameEn: 'Byeong', element: '화(火)', elementEn: 'Fire', yin: false, emoji: '🔥' },
  { name: '정', nameEn: 'Jeong', element: '화(火)', elementEn: 'Fire', yin: true, emoji: '🕯️' },
  { name: '무', nameEn: 'Mu', element: '토(土)', elementEn: 'Earth', yin: false, emoji: '⛰️' },
  { name: '기', nameEn: 'Gi', element: '토(土)', elementEn: 'Earth', yin: true, emoji: '🏜️' },
  { name: '경', nameEn: 'Gyeong', element: '금(金)', elementEn: 'Metal', yin: false, emoji: '⚔️' },
  { name: '신', nameEn: 'Sin', element: '금(金)', elementEn: 'Metal', yin: true, emoji: '💍' },
  { name: '임', nameEn: 'Im', element: '수(水)', elementEn: 'Water', yin: false, emoji: '🌊' },
  { name: '계', nameEn: 'Gye', element: '수(水)', elementEn: 'Water', yin: true, emoji: '💧' },
];

// ── Earthly Branches (지지) ──
const BRANCHES = [
  { name: '자', nameEn: 'Ja', animal: '쥐', animalEn: 'Rat', emoji: '🐀', hours: '23:00-01:00' },
  { name: '축', nameEn: 'Chuk', animal: '소', animalEn: 'Ox', emoji: '🐂', hours: '01:00-03:00' },
  { name: '인', nameEn: 'In', animal: '호랑이', animalEn: 'Tiger', emoji: '🐅', hours: '03:00-05:00' },
  { name: '묘', nameEn: 'Myo', animal: '토끼', animalEn: 'Rabbit', emoji: '🐇', hours: '05:00-07:00' },
  { name: '진', nameEn: 'Jin', animal: '용', animalEn: 'Dragon', emoji: '🐉', hours: '07:00-09:00' },
  { name: '사', nameEn: 'Sa', animal: '뱀', animalEn: 'Snake', emoji: '🐍', hours: '09:00-11:00' },
  { name: '오', nameEn: 'O', animal: '말', animalEn: 'Horse', emoji: '🐎', hours: '11:00-13:00' },
  { name: '미', nameEn: 'Mi', animal: '양', animalEn: 'Sheep', emoji: '🐑', hours: '13:00-15:00' },
  { name: '신', nameEn: 'Sin', animal: '원숭이', animalEn: 'Monkey', emoji: '🐒', hours: '15:00-17:00' },
  { name: '유', nameEn: 'Yu', animal: '닭', animalEn: 'Rooster', emoji: '🐓', hours: '17:00-19:00' },
  { name: '술', nameEn: 'Sul', animal: '개', animalEn: 'Dog', emoji: '🐕', hours: '19:00-21:00' },
  { name: '해', nameEn: 'Hae', animal: '돼지', animalEn: 'Pig', emoji: '🐖', hours: '21:00-23:00' },
];

// ── Five Elements Analysis ──
const ELEMENTS = {
  Wood: { ko: '목(木)', emoji: '🌳', color: '#4ade80', meaning: '성장, 확장, 창의성 — Growth, expansion, creativity' },
  Fire: { ko: '화(火)', emoji: '🔥', color: '#f87171', meaning: '열정, 변화, 에너지 — Passion, transformation, energy' },
  Earth: { ko: '토(土)', emoji: '⛰️', color: '#fbbf24', meaning: '안정, 균형, 신뢰 — Stability, balance, trust' },
  Metal: { ko: '금(金)', emoji: '⚔️', color: '#e2e8f0', meaning: '결단, 정의, 강인함 — Determination, justice, strength' },
  Water: { ko: '수(水)', emoji: '🌊', color: '#60a5fa', meaning: '지혜, 유연성, 소통 — Wisdom, flexibility, communication' },
};

/**
 * Get the hour branch index (시주 지지) from birth hour
 */
function getHourBranch(hour) {
  if (hour === 23 || hour === 0) return 0;
  return Math.floor((hour + 1) / 2);
}

/**
 * Get the hour stem (시주 천간) from day stem and hour branch
 */
function getHourStem(dayStemIndex, hourBranchIndex) {
  const base = (dayStemIndex % 5) * 2;
  return (base + hourBranchIndex) % 10;
}

/**
 * Calculate the Four Pillars from a solar date and hour
 */
export function calculateSaju(year, month, day, hour) {
  const calendar = new KoreanLunarCalendar();
  calendar.setSolarDate(year, month, day);

  const lunarYear = calendar.lunarYear;
  const lunarMonth = calendar.lunarMonth;
  const lunarDay = calendar.lunarDay;

  // Year Pillar (년주)
  const yearStemIdx = (lunarYear - 4) % 10;
  const yearBranchIdx = (lunarYear - 4) % 12;

  // Month Pillar (월주) — simplified using lunar month
  const monthStemIdx = ((lunarYear % 5) * 2 + lunarMonth) % 10;
  const monthBranchIdx = (lunarMonth + 1) % 12;

  // Day Pillar (일주) — using a simplified calculation based on Julian Day Number
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  const jdn = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  const dayStemIdx = (jdn - 1) % 10;
  const dayBranchIdx = (jdn + 1) % 12;

  // Hour Pillar (시주)
  const hourBranchIdx = getHourBranch(hour);
  const hourStemIdx = getHourStem(dayStemIdx < 0 ? dayStemIdx + 10 : dayStemIdx, hourBranchIdx);

  const pillars = {
    year: {
      label: '년주 (Year)',
      stem: STEMS[(yearStemIdx + 10) % 10],
      branch: BRANCHES[(yearBranchIdx + 12) % 12],
    },
    month: {
      label: '월주 (Month)',
      stem: STEMS[(monthStemIdx + 10) % 10],
      branch: BRANCHES[(monthBranchIdx + 12) % 12],
    },
    day: {
      label: '일주 (Day)',
      stem: STEMS[(dayStemIdx + 10) % 10],
      branch: BRANCHES[(dayBranchIdx + 12) % 12],
    },
    hour: {
      label: '시주 (Hour)',
      stem: STEMS[hourStemIdx % 10],
      branch: BRANCHES[hourBranchIdx % 12],
    },
  };

  // Element analysis
  const elementCount = { Wood: 0, Fire: 0, Earth: 0, Metal: 0, Water: 0 };
  Object.values(pillars).forEach(p => {
    elementCount[p.stem.elementEn]++;
  });

  const lunarDateStr = `${lunarYear}년 ${lunarMonth}월 ${lunarDay}일 (음력)`;

  return { pillars, elementCount, lunarDate: lunarDateStr };
}

/**
 * Generate element analysis interpretation
 */
function getElementInterpretation(elementCount) {
  const sorted = Object.entries(elementCount).sort((a, b) => b[1] - a[1]);
  const dominant = sorted[0];
  const lacking = sorted.filter(e => e[1] === 0).map(e => e[0]);

  let interpretation = `당신의 주요 기운은 **${ELEMENTS[dominant[0]].ko}** ${ELEMENTS[dominant[0]].emoji}입니다.\n`;
  interpretation += ELEMENTS[dominant[0]].meaning + '\n\n';

  if (lacking.length > 0) {
    interpretation += `부족한 기운: ${lacking.map(e => `${ELEMENTS[e].ko} ${ELEMENTS[e].emoji}`).join(', ')}\n`;
    interpretation += `이 기운을 보충하면 더 균형 잡힌 삶을 살 수 있습니다.`;
  } else {
    interpretation += '모든 오행이 조화롭게 이루어져 있습니다! ✨';
  }

  return interpretation;
}

/**
 * Render Saju form and results into container
 */
export function renderSaju(container) {
  container.innerHTML = `
    <div class="saju-intro">
      <p class="saju-desc">생년월일과 태어난 시간을 입력하면<br>사주팔자(四柱八字)를 분석합니다.</p>
    </div>
    <form class="saju-form" id="sajuForm">
      <div class="form-row">
        <div class="form-group">
          <label for="birthYear">출생년도</label>
          <input type="number" id="birthYear" min="1920" max="2026" value="1995" required>
        </div>
        <div class="form-group">
          <label for="birthMonth">월</label>
          <select id="birthMonth">
            ${Array.from({ length: 12 }, (_, i) => `<option value="${i + 1}">${i + 1}월</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label for="birthDay">일</label>
          <input type="number" id="birthDay" min="1" max="31" value="15" required>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group full">
          <label for="birthHour">태어난 시 (0-23)</label>
          <select id="birthHour">
            ${BRANCHES.map((b, i) => {
              const startH = i === 0 ? 23 : (i * 2) - 1;
              const endH = i === 0 ? 1 : (i * 2) + 1;
              return `<option value="${i === 0 ? 0 : startH}">${b.emoji} ${b.name}시 (${b.hours})</option>`;
            }).join('')}
          </select>
        </div>
      </div>
      <button type="submit" class="saju-btn">사주 분석하기 ✨</button>
    </form>
    <div class="saju-result" id="sajuResult"></div>
  `;

  const form = container.querySelector('#sajuForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const year = parseInt(document.getElementById('birthYear').value);
    const month = parseInt(document.getElementById('birthMonth').value);
    const day = parseInt(document.getElementById('birthDay').value);
    const hour = parseInt(document.getElementById('birthHour').value);

    try {
      const result = calculateSaju(year, month, day, hour);
      renderSajuResult(result);
    } catch (err) {
      document.getElementById('sajuResult').innerHTML = `
        <div class="saju-error">⚠️ 날짜를 확인해주세요. 유효한 날짜를 입력하세요.</div>
      `;
    }
  });
}

/**
 * Render Saju calculation results
 */
function renderSajuResult(result) {
  const resultEl = document.getElementById('sajuResult');
  const { pillars, elementCount, lunarDate } = result;
  const interpretation = getElementInterpretation(elementCount);

  resultEl.innerHTML = `
    <div class="saju-lunar-date">📅 ${lunarDate}</div>
    <div class="pillars-grid">
      ${Object.values(pillars).reverse().map(p => `
        <div class="pillar">
          <div class="pillar-label">${p.label}</div>
          <div class="pillar-stem">
            <span class="pillar-char">${p.stem.name}</span>
            <span class="pillar-element">${p.stem.element}</span>
            <span class="pillar-emoji">${p.stem.emoji}</span>
          </div>
          <div class="pillar-branch">
            <span class="pillar-char">${p.branch.name}</span>
            <span class="pillar-animal">${p.branch.emoji} ${p.branch.animal}</span>
          </div>
        </div>
      `).join('')}
    </div>
    <div class="element-chart">
      <h3>오행 분석 (Five Elements)</h3>
      <div class="element-bars">
        ${Object.entries(elementCount).map(([el, count]) => `
          <div class="element-row">
            <span class="element-label">${ELEMENTS[el].emoji} ${ELEMENTS[el].ko}</span>
            <div class="element-bar-wrapper">
              <div class="element-bar" style="width: ${count * 25}%; background: ${ELEMENTS[el].color}"></div>
            </div>
            <span class="element-count">${count}</span>
          </div>
        `).join('')}
      </div>
    </div>
    <div class="saju-interpretation">
      <h3>✨ 해석</h3>
      <p>${interpretation.replace(/\n/g, '<br>')}</p>
    </div>
  `;

  resultEl.classList.add('show');
}

// ── Fortune Module ─────────────────────────────────────────────
// Date-seeded tarot card randomizer with categorized fortunes

let tarotData = null;
let categoryData = null;

/**
 * Load tarot database (Major Arcana) from static JSON
 */
async function loadTarotData() {
  if (tarotData) return tarotData;
  const res = await fetch('/tarot_db.json');
  tarotData = await res.json();
  return tarotData;
}

/**
 * Load categorized fortune database (Love, Wealth, Career)
 */
async function loadCategoryData() {
  if (categoryData) return categoryData;
  const res = await fetch('/data/tarot_db.json');
  categoryData = await res.json();
  return categoryData;
}

/**
 * Seeded pseudo-random number generator (mulberry32)
 * Same seed = same sequence every time
 */
function seededRandom(seed) {
  let t = seed + 0x6D2B79F5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/**
 * Generate a numeric seed from today's date string
 */
function dateSeed() {
  const d = new Date();
  const dateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Get today's deterministic fortune card + category fortunes
 */
export async function getDailyFortune() {
  const [tarot, categories] = await Promise.all([loadTarotData(), loadCategoryData()]);
  const seed = dateSeed();

  const cardIndex = Math.floor(seededRandom(seed) * tarot.majorArcana.length);
  const msgIndex = Math.floor(seededRandom(seed + 1) * tarot.fortuneMessages.length);
  const isReversed = seededRandom(seed + 2) > 0.7;

  // Pick one fortune from each category (deterministic per day)
  const loveFortune = categories.love[Math.floor(seededRandom(seed + 10) * categories.love.length)];
  const wealthFortune = categories.wealth[Math.floor(seededRandom(seed + 20) * categories.wealth.length)];
  const careerFortune = categories.career[Math.floor(seededRandom(seed + 30) * categories.career.length)];

  return {
    card: tarot.majorArcana[cardIndex],
    message: tarot.fortuneMessages[msgIndex],
    isReversed,
    categories: { love: loveFortune, wealth: wealthFortune, career: careerFortune },
    date: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }),
  };
}

/**
 * Render fortune card + category readings into container
 */
export async function renderFortune(container) {
  const fortune = await getDailyFortune();
  const card = fortune.card;
  const { love, wealth, career } = fortune.categories;

  container.innerHTML = `
    <div class="fortune-date">${fortune.date}의 운세</div>
    <div class="fortune-card-wrapper">
      <div class="fortune-card" id="fortuneCard">
        <div class="card-inner">
          <div class="card-front">
            <div class="card-back-design">
              <div class="card-back-pattern"></div>
              <span class="card-back-symbol">✦</span>
              <div class="card-back-text">TAP TO REVEAL</div>
            </div>
          </div>
          <div class="card-back">
            <div class="card-numeral">${card.numeral}</div>
            <div class="card-emoji">${card.emoji}</div>
            <div class="card-name">${card.name}</div>
            <div class="card-name-ko">${card.nameKo}${fortune.isReversed ? ' (역방향)' : ''}</div>
            <div class="card-element">${card.element}</div>
            <div class="card-meaning">${fortune.isReversed ? card.reversed : card.meaning}</div>
            <div class="card-divider"></div>
            <div class="card-description">${card.descriptionKo}</div>
            <div class="card-advice">💡 ${card.advice}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="category-fortunes">
      <div class="category-card love">
        <div class="category-header">
          <span class="category-icon">💕</span>
          <span class="category-title">연애운 (Love)</span>
          <span class="category-level level-${love.level}">${love.level}</span>
        </div>
        <h4 class="category-heading">${love.emoji} ${love.title}</h4>
        <p class="category-summary"><strong>${love.summary}</strong></p>
        <p class="category-detail">${love.detailed_interpretation}</p>
        <div class="category-advice">
          <strong>💡 조언:</strong> ${love.actionable_advice}
        </div>
        <div class="category-lucky">
          <span>🎨 색상: <strong>${love.lucky_elements.color}</strong></span> | 
          <span>🔢 숫자: <strong>${love.lucky_elements.number}</strong></span> | 
          <span>🛍️ 아이템: <strong>${love.lucky_elements.item}</strong></span>
        </div>
      </div>
      <div class="category-card wealth">
        <div class="category-header">
          <span class="category-icon">💰</span>
          <span class="category-title">재물운 (Wealth)</span>
          <span class="category-level level-${wealth.level}">${wealth.level}</span>
        </div>
        <h4 class="category-heading">${wealth.emoji} ${wealth.title}</h4>
        <p class="category-summary"><strong>${wealth.summary}</strong></p>
        <p class="category-detail">${wealth.detailed_interpretation}</p>
        <div class="category-advice">
          <strong>💡 조언:</strong> ${wealth.actionable_advice}
        </div>
        <div class="category-lucky">
          <span>🎨 색상: <strong>${wealth.lucky_elements.color}</strong></span> | 
          <span>🔢 숫자: <strong>${wealth.lucky_elements.number}</strong></span> | 
          <span>🛍️ 아이템: <strong>${wealth.lucky_elements.item}</strong></span>
        </div>
      </div>
      <div class="category-card career">
        <div class="category-header">
          <span class="category-icon">💼</span>
          <span class="category-title">직장운 (Career)</span>
          <span class="category-level level-${career.level}">${career.level}</span>
        </div>
        <h4 class="category-heading">${career.emoji} ${career.title}</h4>
        <p class="category-summary"><strong>${career.summary}</strong></p>
        <p class="category-detail">${career.detailed_interpretation}</p>
        <div class="category-advice">
          <strong>💡 조언:</strong> ${career.actionable_advice}
        </div>
        <div class="category-lucky">
          <span>🎨 색상: <strong>${career.lucky_elements.color}</strong></span> | 
          <span>🔢 숫자: <strong>${career.lucky_elements.number}</strong></span> | 
          <span>🛍️ 아이템: <strong>${career.lucky_elements.item}</strong></span>
        </div>
      </div>
    </div>

    <div class="fortune-message">
      <div class="fortune-cookie">🥠</div>
      <p>${fortune.message}</p>
    </div>
  `;

  // Add flip interaction
  const cardEl = container.querySelector('#fortuneCard');
  cardEl.addEventListener('click', () => {
    cardEl.classList.toggle('flipped');
  });
}

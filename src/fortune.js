// ── Fortune Module ─────────────────────────────────────────────
// Date-seeded tarot card randomizer

let tarotData = null;

/**
 * Load tarot database from static JSON
 */
async function loadTarotData() {
  if (tarotData) return tarotData;
  const res = await fetch('/tarot_db.json');
  tarotData = await res.json();
  return tarotData;
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
 * Get today's deterministic fortune card + message
 */
export async function getDailyFortune() {
  const data = await loadTarotData();
  const seed = dateSeed();
  const rng = seededRandom(seed);

  const cardIndex = Math.floor(rng * data.majorArcana.length);
  const msgIndex = Math.floor(seededRandom(seed + 1) * data.fortuneMessages.length);
  const isReversed = seededRandom(seed + 2) > 0.7;

  return {
    card: data.majorArcana[cardIndex],
    message: data.fortuneMessages[msgIndex],
    isReversed,
    date: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }),
  };
}

/**
 * Render fortune card into container with flip animation
 */
export async function renderFortune(container) {
  const fortune = await getDailyFortune();
  const card = fortune.card;

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

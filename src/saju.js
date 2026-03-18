// ── Saju Module (UI) ───────────────────────────────────────────
// UI layer for Saju — uses sajuCalculator.js for all computation
import { sajuCalculator, getSajuInterpretation, EARTHLY_BRANCHES, FIVE_ELEMENTS } from './sajuCalculator.js';

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
            ${EARTHLY_BRANCHES.map((b, i) => {
              const val = i === 0 ? 0 : (i * 2) - 1;
              return `<option value="${val}">${b.emoji} ${b.ko}시 (${b.hours})</option>`;
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
      const result = sajuCalculator(year, month, day, hour);
      renderSajuResult(result);
    } catch (err) {
      console.error('Saju calculation error:', err);
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
  const { pillars, elementCount, lunarDate, dayMaster } = result;
  const interpretation = getSajuInterpretation(result);

  resultEl.innerHTML = `
    <div class="saju-lunar-date">📅 ${lunarDate.displayKo}</div>
    <div class="saju-day-master">
      <span>${dayMaster.stem.emoji}</span> ${dayMaster.description}
    </div>
    <div class="pillars-grid">
      ${Object.values(pillars).reverse().map(p => `
        <div class="pillar">
          <div class="pillar-label">${p.label}</div>
          <div class="pillar-ganzi">${p.ganZhi}</div>
          <div class="pillar-stem">
            <span class="pillar-char">${p.stem.ko}</span>
            <span class="pillar-element">${p.stem.elementKo}</span>
            <span class="pillar-emoji">${p.stem.emoji}</span>
          </div>
          <div class="pillar-branch">
            <span class="pillar-char">${p.branch.ko}</span>
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
            <span class="element-label">${FIVE_ELEMENTS[el].emoji} ${FIVE_ELEMENTS[el].ko}</span>
            <div class="element-bar-wrapper">
              <div class="element-bar" style="width: ${count * 25}%; background: ${FIVE_ELEMENTS[el].color}"></div>
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

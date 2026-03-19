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
      <div class="saju-interpretation-content">${interpretation}</div>
    </div>
    
    <!-- Kakao Share Button -->
    <div class="kakao-share-container" style="margin-top: 2rem; text-align: center;">
      <button id="btnKakaoShareSaju" style="background: #FEE500; color: #000; padding: 0.8rem 1.5rem; border: none; border-radius: 50px; font-weight: bold; font-size: 1rem; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; width: 100%; max-width: 300px;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3c-5.52 0-10 3.51-10 7.84 0 2.8 1.83 5.26 4.67 6.6l-.99 3.6c-.1.35.31.62.61.42l4.28-2.81c.46.06.94.09 1.43.09 5.52 0 10-3.51 10-7.84S17.52 3 12 3z"/>
        </svg>
        카카오톡으로 내 사주 공유하기
      </button>
    </div>
  `;

  // Attach Kakao share event
  const btnKakaoSaju = resultEl.querySelector('#btnKakaoShareSaju');
  if (btnKakaoSaju) {
    btnKakaoSaju.addEventListener('click', () => {
      if (window.Kakao && window.Kakao.isInitialized()) {
        window.Kakao.Share.sendDefault({
          objectType: 'feed',
          content: {
            title: '소름 돋게 정확한 나의 사주팔자 결과 ✨',
            description: '당신의 타고난 기운과 오행 분석을 확인해보세요. 나는 어떤 운명을 타고 났을까?',
            imageUrl: 'https://daily-fortune.example.com/og-image.png',
            link: {
              mobileWebUrl: window.location.href,
              webUrl: window.location.href,
            },
          },
          buttons: [
            {
              title: '결과 확인하기',
              link: {
                mobileWebUrl: window.location.href,
                webUrl: window.location.href,
              },
            }
          ],
        });
      } else {
        alert('카카오톡 공유 기능을 불러오지 못했습니다. 카카오 SDK 초기화 상태를 확인해주세요.');
      }
    });
  }

  resultEl.classList.add('show');
}

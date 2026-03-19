import { getDailyFortune } from './fortune.js';

export async function renderTomorrow(container) {
  const fortune = await getDailyFortune(1);
  const card = fortune.card;
  const { love, wealth, career } = fortune.categories;

  container.innerHTML = `
    <div class="tomorrow-header" style="text-align: center; margin-bottom: 1rem;">
      <h2 style="font-size: 1.5rem; color: #f9d877; margin: 0;">🍀 내일의 운세</h2>
      <p style="color: #bbb; font-size: 0.9rem;">${fortune.date} 미리보기</p>
    </div>
    
    <div class="fortune-card-wrapper">
      <div class="fortune-card" id="tomorrowCard">
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

    <!-- Coupang Partners Native Ad -->
    <div class="coupang-ad-native" style="margin-top: 2rem; padding: 1.5rem; border-radius: 16px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); text-align: center;">
      <h3 style="margin-top:0; font-size:1.1rem; color: #f9d877; margin-bottom: 0.5rem;">🍀 내일의 행운을 끌어올릴 추천 아이템</h3>
      <p style="font-size:0.95rem; color: #ddd; margin-bottom: 1.2rem; line-height: 1.5;">내일은 ${fortune.isReversed ? '마음을 차분하게 가라앉히는 게' : '적극적인 에너지를 발산하는 게'} 좋을 것 같네요.<br/>당신의 기운을 북돋아줄 맞춤 아이템을 확인해보세요!</p>
      <a href="https://link.coupang.com/a/mockup_link" target="_blank" rel="noopener noreferrer" style="display:inline-block; padding: 0.8rem 1.5rem; background: #f9d877; color: #0a0a1a; text-decoration: none; border-radius: 50px; font-weight: bold; transition: all 0.2s; box-shadow: 0 4px 12px rgba(249,216,119,0.3);">행운 아이템 구경하기 (쿠팡)</a>
      <div style="font-size: 0.7rem; color: #666; margin-top: 1rem;">이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.</div>
    </div>

    <!-- Kakao Share Button -->
    <div class="kakao-share-container" style="margin-top: 1.5rem; margin-bottom: 2rem; text-align: center;">
      <button id="btnKakaoShareTomorrow" style="background: #FEE500; color: #000; padding: 0.8rem 1.5rem; border: none; border-radius: 50px; font-weight: bold; font-size: 1rem; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; width: 100%; max-width: 300px;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3c-5.52 0-10 3.51-10 7.84 0 2.8 1.83 5.26 4.67 6.6l-.99 3.6c-.1.35.31.62.61.42l4.28-2.81c.46.06.94.09 1.43.09 5.52 0 10-3.51 10-7.84S17.52 3 12 3z"/>
        </svg>
        카카오톡으로 공유하기
      </button>
    </div>
  `;

  // Flip interaction
  const cardEl = container.querySelector('#tomorrowCard');
  cardEl.addEventListener('click', () => {
    cardEl.classList.toggle('flipped');
  });

  // Kakao Share interaction
  const btnKakao = container.querySelector('#btnKakaoShareTomorrow');
  btnKakao.addEventListener('click', () => {
    if (window.Kakao && window.Kakao.isInitialized()) {
      window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: '내일의 운세에 엄청난 행운이 찾아왔대요! 🍀',
          description: '나는 내일 어떤 하루를 보내게 될까요? 지금 바로 나의 운세와 행운 아이템을 확인하고, 우리 둘의 궁합도 테스트해보세요!',
          imageUrl: 'https://daily-fortune.example.com/og-image.png',
          link: {
            mobileWebUrl: window.location.href,
            webUrl: window.location.href,
          },
        },
        buttons: [
          {
            title: '내 운세 확인하기',
            link: {
              mobileWebUrl: window.location.href,
              webUrl: window.location.href,
            },
          },
          {
            title: '우리의 궁합 보기',
            link: {
              mobileWebUrl: window.location.href,
              webUrl: window.location.href,
            },
          }
        ],
      });
    } else {
      alert('카카오톡 공유 기능을 불러오지 못했습니다. 카카오 SDK 초기화를 확인해주세요.');
    }
  });
}

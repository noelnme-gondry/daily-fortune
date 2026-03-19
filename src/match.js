export function renderMatch(container) {
  container.innerHTML = `
    <div class="match-header" style="text-align: center; margin-bottom: 2rem;">
      <h2 style="font-size: 1.5rem; color: #ff8fa3; margin: 0;">💕 이름 궁합 테스트</h2>
      <p style="color: #bbb; font-size: 0.9rem; margin-top: 0.5rem;">우리 둘의 궁합 점수는 몇 점일까?</p>
    </div>

    <div class="match-form" style="background: rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); margin-bottom: 2rem;">
      <div style="display: flex; gap: 1rem; align-items: center; justify-content: center; margin-bottom: 1.5rem;">
        <input type="text" id="matchName1" placeholder="나의 이름" style="flex: 1; min-width: 0; padding: 0.8rem; border-radius: 8px; border: 1px solid #444; background: #1a1a2e; color: #fff; text-align: center; font-size: 1rem;" />
        <span style="font-size: 1.5rem; color: #ff8fa3; flex-shrink: 0;">+</span>
        <input type="text" id="matchName2" placeholder="상대방 이름" style="flex: 1; min-width: 0; padding: 0.8rem; border-radius: 8px; border: 1px solid #444; background: #1a1a2e; color: #fff; text-align: center; font-size: 1rem;" />
      </div>
      <button id="btnCalcMatch" style="width: 100%; padding: 1rem; background: linear-gradient(135deg, #ff8fa3, #ff4d6d); color: #fff; border: none; border-radius: 8px; font-weight: bold; font-size: 1.1rem; cursor: pointer; box-shadow: 0 4px 15px rgba(255,77,109,0.3); transition: all 0.2s;">궁합 보기</button>
    </div>

    <div id="matchResult" style="display: none; text-align: center; animation: fadeIn 0.5s ease-out; margin-bottom: 2rem;">
      <div style="font-size: 4rem; font-weight: bold; color: #f9d877; margin-bottom: 0.5rem; text-shadow: 0 0 20px rgba(249,216,119,0.5);" id="matchScore"></div>
      <h3 style="font-size: 1.2rem; color: #fff; margin-bottom: 1rem;" id="matchTitle"></h3>
      <p style="color: #ddd; line-height: 1.6; background: rgba(0,0,0,0.2); padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem;" id="matchDesc"></p>

      <div class="kakao-share-container">
        <button id="btnKakaoShareMatch" style="background: #FEE500; color: #000; padding: 0.8rem 1.5rem; border: none; border-radius: 50px; font-weight: bold; font-size: 1rem; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; width: 100%; max-width: 300px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3c-5.52 0-10 3.51-10 7.84 0 2.8 1.83 5.26 4.67 6.6l-.99 3.6c-.1.35.31.62.61.42l4.28-2.81c.46.06.94.09 1.43.09 5.52 0 10-3.51 10-7.84S17.52 3 12 3z"/>
          </svg>
          결과 공유하고 친구 찾기
        </button>
      </div>
    </div>
  `;

  const btnCalc = container.querySelector('#btnCalcMatch');
  btnCalc.addEventListener('click', () => {
    const name1 = container.querySelector('#matchName1').value.trim();
    const name2 = container.querySelector('#matchName2').value.trim();
    if (!name1 || !name2) {
      alert('두 사람의 이름을 모두 입력해주세요!');
      return;
    }

    // Hash algorithm logic
    const combined = [name1, name2].sort().join('|');
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
        hash = ((hash << 5) - hash) + combined.charCodeAt(i);
        hash |= 0;
    }
    const seedHash = Math.abs(hash);
    
    // Generate score between 50 and 100
    const score = 50 + (seedHash % 51);

    let title, desc;
    if (score >= 95) {
      title = "천생연분! 하늘이 맺어준 완벽한 짝 ✨";
      desc = "서로의 부족한 점을 채워주는 완벽한 균형을 이루고 있습니다. 함께일 때 더 큰 시너지가 나는 운명적인 관계네요.";
    } else if (score >= 80) {
      title = "기분 좋은 찰떡궁합 💕";
      desc = "비슷한 가치관을 공유하며, 대화가 잘 통하는 좋은 인연입니다. 약간의 이해심만 더하면 평생 갈 반쪽이 될 수 있어요.";
    } else if (score >= 60) {
      title = "서서히 맞춰가는 현실적인 인연 🤝";
      desc = "서로 다른 매력에 끌렸지만 그만큼 맞춰가야 할 부분도 있습니다. 대화를 통해 서로를 알아가는 과정이 중요해요.";
    } else {
      title = "노력이 필요한 아슬아슬한 관계 🧩";
      desc = "자석의 같은 극처럼 자꾸 부딪힐 수 있습니다. 하지만 다름을 인정하고 배려한다면 오히려 특별한 사이가 될 수 있습니다.";
    }

    container.querySelector('#matchScore').innerText = score + "점";
    container.querySelector('#matchTitle').innerText = title;
    container.querySelector('#matchDesc').innerText = desc;
    container.querySelector('#matchResult').style.display = 'block';

    // Update global state for kakao share
    window.__lastMatchNames = `${name1} & ${name2}`;
  });

  const btnKakao = container.querySelector('#btnKakaoShareMatch');
  btnKakao.addEventListener('click', () => {
    if (window.Kakao && window.Kakao.isInitialized()) {
      window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: '앗! 찰떡궁합인 인연이 근처에 있을지도 몰라요. 💕',
          description: '나는 내일 어떤 하루를 보내게 될까요? 지금 바로 나의 운세를 확인하고, 우리 둘의 이름 궁합도 테스트해보세요!',
          imageUrl: 'https://daily-fortune.example.com/og-image.png',
          link: {
            mobileWebUrl: window.location.href,
            webUrl: window.location.href,
          },
        },
        buttons: [
          {
            title: '우리의 궁합 보기',
            link: {
              mobileWebUrl: window.location.href,
              webUrl: window.location.href,
            },
          },
          {
            title: '내 운세 확인하기',
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

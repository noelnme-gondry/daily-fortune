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
      desc = `
        <div style="font-size: 0.95rem; text-align: left; padding: 0.5rem;">
          <h4 style="color: #f9d877; margin-top: 0; margin-bottom: 0.8rem;">[AI 심층 이름 궁합 분석 결과]</h4>
          <p style="margin-bottom: 1rem;"><strong style="color: #ff8fa3;">종합 파동 에너지:</strong> 두 분의 이름에서 흘러나오는 주파수 대역이 완벽하게 일치합니다. 마치 오랜 기간 맞춰온 톱니바퀴처럼 서로의 부족한 점을 자연스럽게 채워주는 완벽한 균형을 이루고 있습니다.</p>
          <p style="margin-bottom: 1rem;"><strong style="color: #ff8fa3;">성향 및 소통:</strong> 한 사람이 아이디어를 내면 다른 한 사람이 실행에 옮기는 긍정적인 시너지가 엄청납니다. 말하지 않아도 눈빛만으로 서로의 기분을 알아채는 소울메이트 수준의 교감이 가능합니다.</p>
          <p style="margin-bottom: 1rem;"><strong style="color: #ff8fa3;">관계 발전 조언:</strong> 함께일 때 발휘되는 에너지가 크기 때문에, 공동의 목표(여행, 취미, 스터디 등)를 세우면 더욱 돈독해집니다. 이 특별한 인연을 소중히 여기며 평생의 동반자 또는 최고의 파트너로 발전시켜 보세요.</p>
        </div>
      `;
    } else if (score >= 80) {
      title = "기분 좋은 찰떡궁합 💕";
      desc = `
        <div style="font-size: 0.95rem; text-align: left; padding: 0.5rem;">
          <h4 style="color: #f9d877; margin-top: 0; margin-bottom: 0.8rem;">[AI 심층 이름 궁합 분석 결과]</h4>
          <p style="margin-bottom: 1rem;"><strong style="color: #ff8fa3;">종합 파동 에너지:</strong> 성향 기저에 흐르는 에너지가 매우 비슷하여, 서로 강하게 끌어당기는 자력을 지니고 있습니다. 만난 지 얼마 되지 않았더라도 묘한 친근감과 편안함을 느꼈을 확률이 높습니다.</p>
          <p style="margin-bottom: 1rem;"><strong style="color: #ff8fa3;">성향 및 소통:</strong> 비슷한 가치관을 공유하며, 유머 코드가 잘 맞아 대화가 끊이지 않는 좋은 인연입니다. 하지만 가끔 두 사람 모두 고집을 부릴 때 양보의 타이밍을 놓칠 수 있으니 주의가 필요합니다.</p>
          <p style="margin-bottom: 1rem;"><strong style="color: #ff8fa3;">관계 발전 조언:</strong> 가끔은 익숙함에 속아 소중함을 잃지 않도록 작은 서프라이즈나 새로운 데이트 코스로 환기시켜 주세요. 약간의 이해심과 배려만 꾸준히 유지된다면 흔들림 없이 평생 갈 인연으로 성장할 것입니다.</p>
        </div>
      `;
    } else if (score >= 60) {
      title = "서로 맞춰가는 긍정적 현실 인연 🤝";
      desc = `
        <div style="font-size: 0.95rem; text-align: left; padding: 0.5rem;">
          <h4 style="color: #f9d877; margin-top: 0; margin-bottom: 0.8rem;">[AI 심층 이름 궁합 분석 결과]</h4>
          <p style="margin-bottom: 1rem;"><strong style="color: #ff8fa3;">종합 파동 에너지:</strong> 음양의 조화 측면에서 서로 완전히 다른 빛을 띠고 있어 처음에는 이끌림이 덜할 수 있으나, 서로의 차이점 자체가 큰 매력으로 작용하는 현실적이고 단단한 인연입니다.</p>
          <p style="margin-bottom: 1rem;"><strong style="color: #ff8fa3;">성향 및 소통:</strong> 세상을 바라보는 관점이나 일을 처리하는 방식이 달라 종종 의견 충돌이 발생할 수 있습니다. 하지만 이는 틀린 것이 아니라 '다름'일 뿐이며, 이를 수용했을 때 당신의 시야가 두 배로 넓어지는 경험을 하게 됩니다.</p>
          <p style="margin-bottom: 1rem;"><strong style="color: #ff8fa3;">관계 발전 조언:</strong> 상대방을 나의 틀에 맞추려고 하기보다는, 있는 그대로 존중하는 연습이 절대적으로 필요합니다. 대화를 통해 서서히 맞춰가는 과정을 거친다면 어떤 위기에도 무너지지 않는 성숙한 관계로 발전할 수 있습니다.</p>
        </div>
      `;
    } else {
      title = "노력과 이해가 필요한 아슬아슬한 인연 🧩";
      desc = `
        <div style="font-size: 0.95rem; text-align: left; padding: 0.5rem;">
          <h4 style="color: #f9d877; margin-top: 0; margin-bottom: 0.8rem;">[AI 심층 이름 궁합 분석 결과]</h4>
          <p style="margin-bottom: 1rem;"><strong style="color: #ff8fa3;">종합 파동 에너지:</strong> 두 이름의 오행 에너지 대립이 다소 강하게 나타납니다. 자석의 같은 극처럼 자꾸 밀어내거나 엇나가는 상황이 발생할 수 있어, 각별한 이해와 노력이 요구되는 척박하지만 특별한 파동입니다.</p>
          <p style="margin-bottom: 1rem;"><strong style="color: #ff8fa3;">성향 및 소통:</strong> 같은 사건을 겪어도 느끼는 감정과 반응이 판이하게 다릅니다. 이로 인해 사소한 오해가 큰 다툼으로 번지기 쉬우며, 감정적인 대화보다는 이성적이고 차분하게 소통하려는 의도적인 노력이 필요합니다.</p>
          <p style="margin-bottom: 1rem;"><strong style="color: #ff8fa3;">관계 발전 조언:</strong> 궁합 점수는 절대적인 미래가 아닌 성향 분석일 뿐입니다. 서로가 완전히 다르다는 점을 깔끔하게 인정하고, 상대의 부족함을 채워주는 '방패' 역할을 자처한다면 그 어떤 관계보다 드라마틱하고 견고한 사이로 거듭날 수 있습니다.</p>
        </div>
      `;
    }

    container.querySelector('#matchScore').innerText = score + "점";
    container.querySelector('#matchTitle').innerText = title;
    container.querySelector('#matchDesc').innerHTML = desc; // LLM 스타일 HTML 출력을 위해 innerHTML 적용
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

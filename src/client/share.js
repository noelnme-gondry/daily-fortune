// 결과 공유: 링크 복사, 휴대폰 공유 시트, 카카오톡(키가 있을 때만)
const KAKAO_KEY = import.meta.env.VITE_KAKAO_JS_KEY || '';
const KAKAO_SDK = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js';

export function shareBlock() {
  return `<section class="share" aria-label="결과 공유">
    <button class="btn ghost" type="button" data-share="copy">결과 링크 복사</button>
    ${typeof navigator !== 'undefined' && navigator.share ? '<button class="btn ghost" type="button" data-share="native">공유하기</button>' : ''}
    ${KAKAO_KEY ? '<button class="btn kakao" type="button" data-share="kakao">카카오톡 공유</button>' : ''}
    <span class="toast" role="status" aria-live="polite"></span>
  </section>
  <p class="hint">공유 링크에는 생년월일시가 주소의 # 뒤에 담깁니다. 이 부분은 서버로 전송되지 않지만, 링크를 받은 사람은 볼 수 있습니다.</p>`;
}

let kakaoReady = null;
function loadKakao() {
  if (kakaoReady) return kakaoReady;
  kakaoReady = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = KAKAO_SDK; s.async = true;
    s.onload = () => { try { if (!window.Kakao.isInitialized()) window.Kakao.init(KAKAO_KEY); resolve(window.Kakao); } catch (e) { reject(e); } };
    s.onerror = reject;
    document.head.appendChild(s);
  });
  return kakaoReady;
}

export function wireShare(root, { hash, title, name }) {
  const url = `${location.origin}${location.pathname}${hash}`;
  const toast = root.querySelector('.share .toast');
  const say = (m) => { if (toast) toast.textContent = m; };
  root.querySelectorAll('[data-share]').forEach((btn) => btn.addEventListener('click', async () => {
    const kind = btn.dataset.share;
    const text = `${name ? `${name}님의 ` : ''}${title} 결과`;
    if (kind === 'copy') {
      try { await navigator.clipboard.writeText(url); say('링크를 복사했습니다.'); } catch (e) { window.prompt('아래 링크를 복사하세요', url); }
    } else if (kind === 'native') {
      try { await navigator.share({ title: text, url }); } catch (e) { /* 사용자가 취소 */ }
    } else if (kind === 'kakao') {
      try {
        const Kakao = await loadKakao();
        Kakao.Share.sendDefault({
          objectType: 'feed',
          content: { title: text, description: '생년월일시로 보는 사주 오행 운세', imageUrl: `${location.origin}/og-default.png`, link: { mobileWebUrl: url, webUrl: url } },
          buttons: [{ title: '결과 보기', link: { mobileWebUrl: url, webUrl: url } }],
        });
      } catch (e) { say('카카오톡 공유를 불러오지 못했습니다. 링크 복사를 이용해 주세요.'); }
    }
  }));
}

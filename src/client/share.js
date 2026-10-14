// 공유: 페이지 공유 바(모든 페이지)와 결과 공유(카드 주소 + 이미지 저장). 카카오는 키가 있을 때만 켠다.
import { track } from './analytics.js';

const KAKAO_KEY = import.meta.env.VITE_KAKAO_JS_KEY || '';
const KAKAO_SDK = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js';

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

const enc = encodeURIComponent;
export function resultShareHtml() {
  return `<section class="share-bar result-share" aria-label="결과 공유">
    <span class="share-k">결과 공유</span>
    ${KAKAO_KEY ? '<button class="sbtn kakao" type="button" data-share="kakao">카카오톡</button>' : ''}
    ${navigator.share ? '<button class="sbtn" type="button" data-share="native">공유하기</button>' : ''}
    <button class="sbtn" type="button" data-share="copy">링크 복사</button>
    <a class="sbtn" data-share="x" target="_blank" rel="noopener">X</a>
    <a class="sbtn" data-share="facebook" target="_blank" rel="noopener">페이스북</a>
    <button class="sbtn strong" type="button" data-share="image">이미지 저장</button>
    <span class="toast" role="status" aria-live="polite"></span>
  </section>
  <p class="hint">공유 링크에는 생년월일시가 담기지 않고, 결과 요약(점수·제목·입력한 이름)만 담깁니다.</p>`;
}

// el: 공유 바, opts: { url, title, text, kind, card }
export function wireShare(el, opts) {
  const say = (m) => { const t = el.querySelector('.toast'); if (t) t.textContent = m; };
  const x = el.querySelector('[data-share="x"]');
  if (x) x.href = `https://twitter.com/intent/tweet?text=${enc(opts.title)}&url=${enc(opts.url)}`;
  const fb = el.querySelector('[data-share="facebook"]');
  if (fb) fb.href = `https://www.facebook.com/sharer/sharer.php?u=${enc(opts.url)}`;
  if (KAKAO_KEY) { const k = el.querySelector('[data-share="kakao"]'); if (k) k.hidden = false; }
  if (navigator.share) { const n = el.querySelector('[data-share="native"]'); if (n) n.hidden = false; }
  el.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-share]');
    if (!b) return;
    const method = b.dataset.share;
    track('share', { method, content_type: opts.kind || 'page', item_id: location.pathname });
    if (method === 'x' || method === 'facebook' || method === 'band') return; // 링크로 새 창
    e.preventDefault();
    if (method === 'copy') {
      try { await navigator.clipboard.writeText(opts.url); say('링크를 복사했습니다.'); } catch (er) { window.prompt('아래 링크를 복사하세요', opts.url); }
    } else if (method === 'native') {
      try { await navigator.share({ title: opts.title, text: opts.text, url: opts.url }); } catch (er) { /* 취소 */ }
    } else if (method === 'kakao') {
      try {
        const Kakao = await loadKakao();
        Kakao.Share.sendDefault({
          objectType: 'feed',
          content: { title: opts.title, description: opts.text || '생년월일시로 보는 사주 오행 운세', imageUrl: `${location.origin}${opts.image || '/og-default.png'}`, link: { mobileWebUrl: opts.url, webUrl: opts.url } },
          buttons: [{ title: opts.card ? '결과 보기' : '바로 가기', link: { mobileWebUrl: opts.url, webUrl: opts.url } }],
        });
      } catch (er) { say('카카오톡 공유를 불러오지 못했습니다. 링크 복사를 이용해 주세요.'); }
    } else if (method === 'image' && opts.card) {
      say('이미지를 만드는 중입니다…');
      try {
        const { drawCard } = await import('./card.js');
        const blob = await drawCard(opts.card);
        const file = new File([blob], `ohaeng-${opts.kind || 'result'}.png`, { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try { await navigator.share({ files: [file], title: opts.title }); say(''); return; } catch (er) { /* 취소 시 저장으로 */ }
        }
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob); a.download = file.name;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 4000);
        say('이미지를 저장했습니다.');
        track('share_image', { content_type: opts.kind });
      } catch (er) { say('이미지를 만들지 못했습니다.'); }
    }
  });
}

// 서버가 그린 페이지 공유 바
export function initPageShare() {
  document.querySelectorAll('[data-share-page]').forEach((el) => wireShare(el, { url: el.dataset.url, title: el.dataset.title, text: el.dataset.text, kind: 'page' }));
}

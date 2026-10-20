// 공유: 페이지 공유 바(모든 페이지)와 결과 공유(카드 주소 + 이미지 저장). 카카오는 키가 있을 때만 켠다.
import { tr, isEnglish } from '../i18n/runtime.js';
import { track } from './analytics.js';
import { uiIcon } from '../site/icons.js';
import { BRAND } from '../content/brand.js';

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
  return `<section class="share-bar result-share" aria-label="${tr("결과 공유", "Share your result")}">
    <span class="share-k">${tr("결과 공유", "Share your result")}</span>
    ${KAKAO_KEY ? `<button class="sbtn kakao" type="button" data-share="kakao">${tr('카카오톡', 'KakaoTalk')}</button>` : ''}
    ${navigator.share ? `<button class="sbtn" type="button" data-share="native">${tr('공유하기', 'Share')}</button>` : ''}
    <button class="sbtn" type="button" data-share="copy">${tr("링크 복사", "Copy link")}</button>
    <button class="sbtn" type="button" data-share="x" aria-label="${tr("X에 공유", "Share on X")}"></button>
    <button class="sbtn" type="button" data-share="facebook">${tr("페이스북", "Facebook")}</button>
    <button class="sbtn strong" type="button" data-share="image">${tr("이미지 저장", "Save image")}</button>
    <span class="toast" role="status" aria-live="polite"></span>
  </section>
  <p class="hint">${tr("공유 링크에는 생년월일시가 담기지 않고, 결과 요약(점수·제목·입력한 이름)만 담깁니다.", "Shared links contain only your result summary (score, title and entered name), never your birth date or time.")}</p>`;
}

// el: 공유 바, opts: { url, title, text, kind, card }
export function wireShare(el, opts) {
  el.querySelectorAll('[data-share]').forEach((button) => { if (!button.querySelector('svg')) button.insertAdjacentHTML('afterbegin', uiIcon(button.dataset.share)); });
  const say = (m) => { const t = el.querySelector('.toast'); if (t) t.textContent = m; };
  const socialUrls = {
    x: `https://twitter.com/intent/tweet?text=${enc(opts.title)}&url=${enc(opts.url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${enc(opts.url)}`,
  };
  // 공개 페이지 링크는 유지하되, 개인 결과 URL은 GA 자동 이탈 클릭 수집 대상인 href에 넣지 않는다.
  for (const [method, url] of Object.entries(socialUrls)) {
    const link = el.querySelector(`a[data-share="${method}"]`);
    if (link) link.href = url;
  }
  if (KAKAO_KEY) { const k = el.querySelector('[data-share="kakao"]'); if (k) k.hidden = false; }
  if (navigator.share) { const n = el.querySelector('[data-share="native"]'); if (n) n.hidden = false; }
  el.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-share]');
    if (!b) return;
    const method = b.dataset.share;
    track('share', { method, content_type: opts.kind || 'page', item_id: location.pathname });
    const outcome = (status, completionType) => track(`share_${status}`, {
      method, content_type: opts.kind || 'page', item_id: location.pathname,
      ...(completionType ? { completion_type: completionType } : {}),
    });
    if (socialUrls[method] && b.tagName === 'BUTTON') {
      window.open(socialUrls[method], '_blank', 'noopener,noreferrer');
      outcome('handoff', 'external_window');
      return;
    }
    if (method === 'x' || method === 'facebook' || method === 'band') { outcome('handoff', 'external_link'); return; }
    e.preventDefault();
    if (method === 'copy') {
      try { await navigator.clipboard.writeText(opts.url); say(tr("링크를 복사했습니다.", "Link copied.")); outcome('complete', 'clipboard'); }
      catch (er) { outcome('failed'); window.prompt(tr("아래 링크를 복사하세요", "Copy the link below"), opts.url); }
    } else if (method === 'native') {
      try { await navigator.share({ title: opts.title, text: opts.text, url: opts.url }); outcome('complete', 'native_api'); }
      catch (er) { outcome(er.name === 'AbortError' ? 'cancel' : 'failed'); }
    } else if (method === 'kakao') {
      try {
        const Kakao = await loadKakao();
        Kakao.Share.sendDefault({
          objectType: 'feed',
          content: { title: opts.title, description: opts.text || BRAND.descriptor, imageUrl: `${location.origin}${isEnglish() ? (opts.image || '/og-default.png').replace(/\.png$/, '-en.png') : (opts.image || '/og-default.png')}?v=sun`, link: { mobileWebUrl: opts.url, webUrl: opts.url } },
          buttons: [{ title: opts.card ? tr("결과 보기", "View result") : tr("바로 가기", "Open page"), link: { mobileWebUrl: opts.url, webUrl: opts.url } }],
        });
        outcome('handoff', 'kakao_sdk');
      } catch (er) { outcome('failed'); say(tr("카카오톡 공유를 불러오지 못했습니다. 링크 복사를 이용해 주세요.", "Could not load KakaoTalk sharing. Please copy the link instead.")); }
    } else if (method === 'image' && opts.card) {
      say(tr("이미지를 만드는 중입니다…", "Creating your image…"));
      try {
        const { drawCard } = await import('./card.js');
        const blob = await drawCard(opts.card);
        const file = new File([blob], `${BRAND.name.replaceAll(' ', '-')}-${opts.kind || 'result'}.png`, { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try { await navigator.share({ files: [file], title: opts.title }); say(''); outcome('complete', 'native_file_api'); return; }
          catch (er) { if (er.name === 'AbortError') { outcome('cancel'); say(''); return; } }
        }
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob); a.download = file.name;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 4000);
        say(tr("이미지 다운로드를 시작했습니다.", "Image download started."));
        outcome('handoff', 'download_started');
        track('share_image', { content_type: opts.kind });
      } catch (er) { outcome('failed'); say(tr("이미지를 만들지 못했습니다.", "Could not create the image.")); }
    }
  });
}

// 서버가 그린 페이지 공유 바
export function initPageShare() {
  document.querySelectorAll('[data-share-page]').forEach((el) => wireShare(el, { url: el.dataset.url, title: el.dataset.title, text: el.dataset.text, kind: 'page' }));
}

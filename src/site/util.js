// HTML 생성 도우미
import { uiIcon } from './icons.js';
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
export const attr = esc;

export const DEFAULT_SITE_URL = 'https://makeyourownday-fortune.com';
// 배포 주소: SITE_URL > 공개 서비스 도메인
export function siteUrl(env = process.env) {
  const raw = env.SITE_URL || DEFAULT_SITE_URL;
  return raw.replace(/\/+$/, '');
}
export const abs = (ctx, path) => `${ctx.site}${path}`;

export const list = (items, cls = '') => `<ul${cls ? ` class="${cls}"` : ''}>${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;
export const link = (href, text, cls = '') => `<a href="${attr(href)}"${cls ? ` class="${cls}"` : ''}>${text}</a>`;

export function faqBlock(faq, title = '자주 묻는 질문') {
  if (!faq || !faq.length) return '';
  return `<section class="faq" aria-labelledby="faq-h"><h2 id="faq-h">${esc(title)}</h2>${faq.map((f, i) => `<div class="faq-item"><h3><button type="button" class="faq-button" data-disclosure aria-expanded="true" aria-controls="faq-answer-${i}">${esc(f.q)}${uiIcon('plus')}</button></h3><p id="faq-answer-${i}">${esc(f.a)}</p></div>`).join('')}</section>`;
}
export function disclosure(id, title, body, icon = 'book') {
  return `<section class="disclosure"><h2><button class="disclosure-button" type="button" data-disclosure aria-expanded="true" aria-controls="${id}">${uiIcon(icon)}<span>${esc(title)}</span>${uiIcon('plus')}</button></h2><div class="disclosure-body" id="${id}">${body}</div></section>`;
}
export function faqLd(faq) {
  if (!faq || !faq.length) return null;
  return { '@type': 'FAQPage', mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) };
}
// 핵심 요약 표 (AEO: 정의형 질문에 바로 인용되는 형태)
export function factTable(rows, caption = '') {
  return `<table class="facts">${caption ? `<caption>${esc(caption)}</caption>` : ''}<tbody>${rows.map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${v}</td></tr>`).join('')}</tbody></table>`;
}
export const elSpan = (e, text) => `<span class="el el-${e}">${text}</span>`;

// 정보 아이콘: 마우스를 올리거나(포커스·탭) 하면 설명이 보인다
let tipSeq = 0;
export function tip(text, label = '설명 보기') {
  const id = `tip-s${++tipSeq}`;
  return `<span class="tipwrap"><button type="button" class="info" aria-label="${attr(label)}" aria-describedby="${id}" data-tip-id="${id}">i</button><span role="tooltip" id="${id}" class="tip">${esc(text)}</span></span>`;
}

// 캐릭터 그림: 카드·목록은 384px 썸네일(고해상도 화면은 원본), 상세 창은 640px 원본
export function characterImg(id, alt = '', { thumb = false, sizes = '(max-width: 640px) 31vw, 220px', size = thumb ? 384 : 640 } = {}) {
  const a = `alt="${attr(alt)}" loading="lazy" decoding="async"`;
  return thumb
    ? `<img src="/characters/384/${id}.webp" srcset="/characters/384/${id}.webp 384w, /characters/${id}.webp 640w" sizes="${sizes}" width="${size}" height="${size}" ${a}>`
    : `<img src="/characters/${id}.webp" width="${size}" height="${size}" ${a}>`;
}

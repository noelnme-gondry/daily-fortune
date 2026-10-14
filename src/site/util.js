// HTML 생성 도우미
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
export const attr = esc;

// 배포 주소: SITE_URL > Railway 공개 도메인 > 로컬
export function siteUrl(env = process.env) {
  const raw = env.SITE_URL || (env.RAILWAY_PUBLIC_DOMAIN ? `https://${env.RAILWAY_PUBLIC_DOMAIN}` : 'http://localhost:3000');
  return raw.replace(/\/+$/, '');
}
export const abs = (ctx, path) => `${ctx.site}${path}`;

export const list = (items, cls = '') => `<ul${cls ? ` class="${cls}"` : ''}>${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;
export const link = (href, text, cls = '') => `<a href="${attr(href)}"${cls ? ` class="${cls}"` : ''}>${text}</a>`;

export function faqBlock(faq, title = '자주 묻는 질문') {
  if (!faq || !faq.length) return '';
  return `<section class="faq" aria-labelledby="faq-h"><h2 id="faq-h">${esc(title)}</h2>${faq.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('')}</section>`;
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

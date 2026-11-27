import { productEdition, fortuneProduct } from '../domain/fortune-products.js';
import { productPath } from './product-path.js';
import { tr } from '../i18n/runtime.js';
import { esc } from './util.js';

// 무료 본문을 읽은 뒤 이어 볼 한 권. 상품 가격·목차는 판매 화면과 같은 기준을 쓴다.
export function premiumEntry(page, ctx) {
  if (page.section === '/shop/' || page.noindex || page.path === '/') return '';
  if (page.path.startsWith('/tti/tomorrow/')) return '';
  if (!page.tool && !['/tti/', '/saju/', '/guides/'].includes(page.section)) return '';
  const id = /compatibility/.test(page.path) ? 'compatibility' : 'bundle';
  const p = productEdition(fortuneProduct(id), ctx.today.y + 1);
  const chapters = id === 'bundle' ? p.chapters : [p.chapters[0], p.chapters[1], p.chapters.find(c => c.id === 'closing')].filter(Boolean);
  const card = `<section class="premium-entry" aria-labelledby="premium-entry-title" data-commerce-list="reading_footer" data-commerce-item="${id}">
    <div><p class="eyebrow">${tr('프리미엄 운세', 'Premium report in Korean')}</p><h2 id="premium-entry-title">${tr('내 이야기로 더 깊이 읽어보세요', 'Continue with your own birth chart')}</h2><p>${tr(p.description, 'Explore a detailed Korean reading based on your birth details, with practical guidance and an offline copy.')}</p></div>
    <div class="premium-entry-contents"><h3>${esc(tr(p.name, p.nameEn))}</h3><ul>${chapters.map(c => `<li>${esc(tr(c.title, c.titleEn))}</li>`).join('')}</ul></div>
    <div class="premium-entry-action"><p><strong>${p.price}${tr('원', ' KRW')}</strong><span>${tr('단건 결제 · 운세 파일 포함', 'One-time purchase · download included')}</span></p><a class="btn" data-commerce-select href="${productPath(id, ctx.cfg.paidReadings, ctx.today.y + 1)}">${tr('제공 내용·미리보기 확인', 'View contents & preview')}</a></div>
  </section>`;
  return page.tool ? `<template data-premium-result>${card}</template>` : card;
}

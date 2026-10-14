// 정보 아이콘(ⓘ) 툴팁: 마우스를 올리면, 터치·키보드는 누르거나 포커스하면 설명을 보여 준다.
import { track } from './analytics.js';

let open = null;
const seen = new Set();

function place(btn, tip) {
  const r = btn.getBoundingClientRect();
  const w = tip.offsetWidth, h = tip.offsetHeight;
  const left = Math.max(8, Math.min(r.left + r.width / 2 - w / 2, window.innerWidth - w - 8));
  let top = r.bottom + 8;
  if (top + h > window.innerHeight - 8) top = Math.max(8, r.top - h - 8);
  tip.style.left = `${left}px`;
  tip.style.top = `${top}px`;
}
function show(btn) {
  const tip = document.getElementById(btn.dataset.tipId);
  if (!tip) return;
  if (open && open.tip !== tip) hide();
  tip.classList.add('show');
  btn.setAttribute('aria-expanded', 'true');
  place(btn, tip);
  open = { btn, tip };
  const label = btn.getAttribute('aria-label') || '';
  if (!seen.has(label)) { seen.add(label); track('tooltip_open', { tip: label }); }
}
function hide() {
  if (!open) return;
  open.tip.classList.remove('show');
  open.btn.setAttribute('aria-expanded', 'false');
  open = null;
}

export function initTips() {
  const hoverable = window.matchMedia('(hover: hover)').matches;
  document.addEventListener('mouseover', (e) => { const b = e.target.closest('.info'); if (b && hoverable) show(b); });
  document.addEventListener('mouseout', (e) => {
    const b = e.target.closest('.info');
    if (b && hoverable && open && open.btn === b && !b.contains(e.relatedTarget) && document.activeElement !== b) hide();
  });
  document.addEventListener('focusin', (e) => { const b = e.target.closest('.info'); if (b) show(b); });
  document.addEventListener('focusout', (e) => { if (open && e.target === open.btn) hide(); });
  document.addEventListener('click', (e) => {
    const b = e.target.closest('.info');
    if (b) { e.preventDefault(); if (open && open.btn === b && !hoverable) hide(); else show(b); return; }
    if (open && !e.target.closest('.tip')) hide();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hide(); });
  window.addEventListener('scroll', () => { if (open) place(open.btn, open.tip); }, { passive: true });
  window.addEventListener('resize', hide);
}

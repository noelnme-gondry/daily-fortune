import { track } from './analytics.js';
// 본문은 바로 읽고, 상세한 근거와 도감은 별도 창에서 확인한다.
export function initInteractions() {
  document.addEventListener('change', (event) => {
    if (event.target.matches('[data-job-family]')) document.querySelectorAll('[data-job-panel]').forEach((panel) => { panel.hidden = panel.dataset.jobPanel !== event.target.value; });
  });
  const openers = new WeakMap();
  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-dialog]');
    if (trigger) {
      const dialog = document.getElementById(trigger.dataset.dialog);
      if (dialog) { event.preventDefault(); openers.set(dialog, trigger); dialog.showModal(); if (dialog.matches('.explanation-dialog') && trigger.closest('#result')) track('reading_detail_open', { tool: trigger.closest('[data-tool]')?.dataset.tool || 'content', detail_type: trigger.closest('.daily-cat') ? 'area_detail' : trigger.closest('.chart-basis') ? 'chart_detail' : 'basis' }); }
    }
    const close = event.target.closest('[data-close-dialog]');
    if (close) close.closest('dialog').close();
    if (event.target instanceof HTMLDialogElement) {
      const r = event.target.getBoundingClientRect();
      if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) event.target.close();
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;
    const dialogs = [...document.querySelectorAll('dialog[open]')];
    const dialog = dialogs.find(el => el.contains(document.activeElement)) || dialogs.at(-1);
    if (!dialog) return;
    const focusable = [...dialog.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])')].filter((el) => el.getClientRects().length);
    const first = focusable[0], last = focusable.at(-1);
    if (!first) return;
    if (!dialog.contains(document.activeElement) || (!event.shiftKey && document.activeElement === last)) { event.preventDefault(); first.focus(); }
    else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  });
  document.addEventListener('close', (event) => {
    const opener = openers.get(event.target);
    openers.delete(event.target);
    const dialogs = [...document.querySelectorAll('dialog[open]')];
    if (opener?.isConnected && dialogs.every(dialog => dialog.contains(opener))) opener.focus();
  }, true);
}

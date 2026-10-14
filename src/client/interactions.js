// 공통 펼침 버튼과 라이트박스. 서버 본문은 JS 없이도 읽을 수 있다.
export function collapseDisclosures(root = document) {
  root.querySelectorAll('[data-disclosure]').forEach((button) => {
    const panel = document.getElementById(button.getAttribute('aria-controls'));
    if (panel) { panel.hidden = true; button.setAttribute('aria-expanded', 'false'); }
  });
}
export function initInteractions() {
  collapseDisclosures();
  document.addEventListener('change', (event) => {
    if (event.target.matches('[data-leader-category]')) document.querySelectorAll('[data-leader-panel]').forEach((panel) => { panel.hidden = panel.dataset.leaderPanel !== event.target.value; });
    if (event.target.matches('[data-job-family]')) document.querySelectorAll('[data-job-panel]').forEach((panel) => { panel.hidden = panel.dataset.jobPanel !== event.target.value; });
  });
  let opener = null;
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-disclosure]');
    if (button) {
      const panel = document.getElementById(button.getAttribute('aria-controls'));
      if (panel) { panel.hidden = !panel.hidden; button.setAttribute('aria-expanded', String(!panel.hidden)); }
    }
    const trigger = event.target.closest('[data-dialog]');
    if (trigger) {
      const dialog = document.getElementById(trigger.dataset.dialog);
      if (dialog) { event.preventDefault(); opener = trigger; dialog.showModal(); }
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
    const dialog = document.querySelector('dialog[open]');
    if (!dialog) return;
    const focusable = [...dialog.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])')].filter((el) => el.getClientRects().length);
    const first = focusable[0], last = focusable.at(-1);
    if (!first) return;
    if (!dialog.contains(document.activeElement) || (!event.shiftKey && document.activeElement === last)) { event.preventDefault(); first.focus(); }
    else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  });
  document.addEventListener('close', () => { if (opener?.isConnected) opener.focus(); opener = null; }, true);
}

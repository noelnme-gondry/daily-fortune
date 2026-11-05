import { tr } from '../i18n/runtime.js';

export async function showProfileGuide() {
  try {
    const { consumeProfileGuide } = await import('./profile.js');
    if (await consumeProfileGuide()) document.querySelector('[data-profile-coach]').hidden = false;
  } catch { /* 저장 안내 실패가 운세 이용을 막지 않는다. */ }
}
export function initProfileNavigation() {
  let opening = false;
  document.addEventListener('click', async event => {
    if (event.target.closest('[data-dismiss-profile-guide]')) document.querySelector('[data-profile-coach]').hidden = true;
    const trigger = event.target.closest('[data-manage-profiles]');
    if (!trigger || opening) return;
    opening = true;
    document.querySelector('[data-profile-coach]').hidden = true;
    try { await (await import('./profile-manager.js')).openProfiles(trigger); }
    catch {
      const panel = document.getElementById('profile-manager');
      panel.textContent = tr('저장 목록을 열지 못했습니다. 새로고침 후 다시 시도해 주세요. Esc 키로 닫을 수 있습니다.', 'Could not open People. Refresh and try again. Press Escape to close.');
      panel.showModal();
    } finally { opening = false; }
  });
}

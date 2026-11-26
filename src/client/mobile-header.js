function initNavigationMenus(header) {
  let active;
  let pinned = false;
  function close() {
    if (!active) return;
    active.querySelector('.nav-toggle').setAttribute('aria-expanded', 'false');
    active.querySelector('.nav-links').hidden = true;
    active = null;
    pinned = false;
  }
  function open(group) {
    if (active === group) return;
    close();
    active = group;
    group.querySelector('.nav-toggle').setAttribute('aria-expanded', 'true');
    group.querySelector('.nav-links').hidden = false;
  }
  for (const group of header.querySelectorAll('.nav-group')) {
    const toggle = group.querySelector('.nav-toggle');
    toggle.hidden = false;
    toggle.addEventListener('click', () => {
      if (active === group && pinned) return close();
      open(group);
      pinned = true;
    });
    group.addEventListener('pointerenter', event => {
      if (event.pointerType === 'mouse') open(group);
    });
    group.addEventListener('pointerleave', event => {
      if (event.pointerType === 'mouse' && active === group && !pinned && !group.contains(document.activeElement)) close();
    });
    group.addEventListener('focusout', event => {
      if (active === group && !group.contains(event.relatedTarget)) close();
    });
  }
  document.addEventListener('pointerdown', event => {
    if (active && !active.contains(event.target)) close();
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !active) return;
    if (active.contains(document.activeElement)) active.querySelector('.nav-toggle').focus();
    close();
  });
  window.addEventListener('pagehide', close);
}

// 상단 메뉴를 복제하지 않고 기존 헤더를 모바일에서만 스크롤 방향에 따라 표시한다.
export function initMobileHeader() {
  const header = document.querySelector('.site-head');
  if (!header) return;
  initNavigationMenus(header);
  const mobile = window.matchMedia('(max-width: 900px)');
  let previousY = window.scrollY, direction = 0, distance = 0, scheduled = false;
  const reveal = () => header.classList.remove('is-hidden');
  const measure = () => {
    if (mobile.matches) document.documentElement.style.setProperty('--site-head-height', `${header.offsetHeight}px`);
  };
  const reset = () => {
    header.toggleAttribute('data-scroll-header', mobile.matches);
    reveal();
    previousY = window.scrollY; direction = 0; distance = 0;
    if (mobile.matches) measure();
    else document.documentElement.style.removeProperty('--site-head-height');
  };
  const update = () => {
    scheduled = false;
    const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const y = Math.min(maxY, Math.max(0, window.scrollY));
    const delta = y - previousY;
    previousY = y;
    if (!mobile.matches) return;
    if (y <= header.offsetHeight || header.contains(document.activeElement) || header.querySelector('.nav-toggle[aria-expanded="true"]')) {
      reveal(); distance = 0; direction = 0; return;
    }
    if (!delta) return;
    const nextDirection = Math.sign(delta);
    distance = nextDirection === direction ? distance + Math.abs(delta) : Math.abs(delta);
    direction = nextDirection;
    // 손떨림이나 모바일 주소창의 작은 변화로 헤더가 깜빡이지 않도록 한다.
    if (distance >= 12) header.classList.toggle('is-hidden', direction > 0);
  };
  window.addEventListener('scroll', () => {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(update);
  }, { passive: true });
  header.addEventListener('focusin', reveal);
  mobile.addEventListener('change', reset);
  window.addEventListener('pageshow', reset);
  if (window.ResizeObserver) new window.ResizeObserver(measure).observe(header);
  reset();
}

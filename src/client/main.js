// 모든 페이지 공통 진입점: 툴팁·공유·분석·광고. 계산기 페이지에서만 엔진(만세력 라이브러리 포함)을 지연 로딩한다.
import { initTips } from './tips.js';
import { initPageShare } from './share.js';
import { initAutoEvents } from './analytics.js';
import { initInteractions } from './interactions.js';
import { initTtiNavigation } from './tti-navigation.js';

initTips();
initPageShare();
initAutoEvents();
initInteractions();
initTtiNavigation();
if (document.querySelector('[data-cohort]')) import('./tti-client.js').then((m) => m.mountTti()).catch(() => {});

// 수동 광고 단위(ADSENSE_SLOT_*)가 있으면 채운다
document.querySelectorAll('ins.adsbygoogle:not([data-adsbygoogle-status])').forEach(() => {
  try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) { /* 광고 차단 등 */ }
});

const tool = document.getElementById('tool');
if (tool) {
  import('./tool.js').then((m) => m.mount(tool)).catch((e) => {
    console.error(e);
    const out = document.getElementById('result');
    if (out) out.innerHTML = '<div class="result-empty card"><p>계산기를 불러오지 못했습니다. 새로고침해 주세요.</p></div>';
  });
}

// ── Main App Entry ─────────────────────────────────────────────
import { renderCalendar } from './attendance.js';
import { renderFortune } from './fortune.js';
import { renderSaju } from './saju.js';
import { renderTomorrow } from './tomorrow.js';
import { renderMatch } from './match.js';
import './style.css';

const TABS = ['attendance', 'fortune', 'tomorrow', 'saju', 'match'];
let activeTab = 'fortune';

/**
 * Initialize the application
 */
function init() {
  // Initialize Kakao SDK
  if (window.Kakao && !Kakao.isInitialized()) {
    try {
      Kakao.init(import.meta.env.VITE_KAKAO_JS_KEY);
      console.log('Kakao SDK initialized');
    } catch (err) {
      console.error('Kakao SDK init failed:', err);
    }
  }

  renderTabs();
  switchTab(activeTab);
  addParticles();
}

/**
 * Set up tab click handlers
 */
function renderTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      switchTab(tab);
    });
  });
}

/**
 * Switch active tab and render content
 */
function switchTab(tab) {
  activeTab = tab;

  // Update tab button states
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });

  // Update panel visibility
  TABS.forEach(t => {
    const panel = document.getElementById(`${t}Panel`);
    if (panel) {
      panel.classList.toggle('active', t === tab);
    }
  });

  // Render content for the active tab
  const panel = document.getElementById(`${tab}Panel`);
  if (!panel) return;

  switch (tab) {
    case 'attendance':
      renderCalendar(panel);
      break;
    case 'fortune':
      renderFortune(panel);
      break;
    case 'tomorrow':
      renderTomorrow(panel);
      break;
    case 'saju':
      renderSaju(panel);
      break;
    case 'match':
      renderMatch(panel);
      break;
  }
}

/**
 * Add floating particles for ambiance
 */
function addParticles() {
  const container = document.querySelector('.particles');
  if (!container) return;

  const symbols = ['✦', '✧', '⋆', '✶', '⊹', '✺', '❋', '✵'];
  for (let i = 0; i < 30; i++) {
    const particle = document.createElement('span');
    particle.className = 'particle';
    particle.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    particle.style.cssText = `
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      animation-delay: ${Math.random() * 6}s;
      animation-duration: ${4 + Math.random() * 8}s;
      font-size: ${6 + Math.random() * 14}px;
      opacity: ${0.1 + Math.random() * 0.3};
    `;
    container.appendChild(particle);
  }
}

// ── Boot ──
document.addEventListener('DOMContentLoaded', init);

import { ttiMonths, ttiYear, buildChart } from '../engine/index.js';
import { ttiMonthCards } from '../site/tti-months.js';
import { sessionLoad, load, toEngine } from './profile.js';
export async function mountTti() {
  const select = document.querySelector('[data-cohort]');
  if (!select) return;
  const t = +select.dataset.tti, y = +select.dataset.year;
  const report = ttiYear(t, y);
  const text = document.querySelector('[data-cohort-text]');
  let touched = false;
  function update() {
    const birth = select.value ? +select.value : null;
    document.querySelector('[data-monthly-flow]').innerHTML = ttiMonthCards(ttiMonths(t, y, birth));
    const cohort = report.cohorts.find((c) => c.birthYear === birth);
    text.textContent = cohort ? `${birth}년생 · 연간 ${cohort.score}점. ${cohort.text}` : '출생 연도를 선택하면 해당 연생의 해석과 월별 점수만 보여드립니다.';
  }
  select.addEventListener('change', () => { touched = true; update(); });
  // 모듈을 불러오는 동안 이미 선택한 값도 반영한다.
  if (select.value) { touched = true; update(); }
  select.dataset.ready = 'true';
  try {
    const p = sessionLoad('a') || await load('a');
    if (!p || touched || !select.isConnected) return;
    const chart = buildChart(toEngine(p));
    // 입춘 이전에는 양력 출생 연도와 띠의 기준 해가 다를 수 있어 오인 연결하지 않는다.
    if (chart.pillars.year.b === t && report.cohorts.some((c) => c.birthYear === chart.birth.y)) { select.value = String(chart.birth.y); update(); }
  } catch { /* 저장 정보가 없거나 읽기 불가해도 수동 선택은 계속 가능 */ }
}

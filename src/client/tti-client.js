// 띠 연도 페이지: 출생 연도를 고르면 서버가 넣어 둔 연생별 월간 흐름을 보여 준다(사주 엔진을 불러오지 않는다).
import { tr } from '../i18n/runtime.js';
import { ttiMonthCards } from '../site/tti-months.js';
import { sessionLoad, load } from './profile.js';

// 저장된 생일이 이 띠의 출생 연도인지: 띠는 입춘(2월 3~5일) 기준이라 경계가 애매한 날짜는 연결하지 않는다.
function birthYearOf(p) {
  if (!p || !Number.isInteger(p.y)) return null;
  if (p.calendar === 'solar') return p.m > 2 || (p.m === 2 && p.d >= 6) ? p.y : null;
  // 음력 2~10월은 같은 양력 연도의 입춘 뒤에 있다
  return p.m >= 2 && p.m <= 10 ? p.y : null;
}

export async function mountTti() {
  const select = document.querySelector('[data-cohort]');
  const source = document.getElementById('tti-cohort-data');
  if (!select || !source) return;
  const data = JSON.parse(source.textContent);
  const text = document.querySelector('[data-cohort-text]');
  let touched = false;
  function update() {
    const cohort = data.cohorts[select.value];
    document.querySelector('[data-monthly-flow]').innerHTML = ttiMonthCards(cohort ? cohort.months : data.all);
    text.textContent = cohort ? tr(`${select.value}년생 · 연간 ${cohort.score}점. ${cohort.text}`, `Born ${select.value} · Annual score ${cohort.score}. ${cohort.text}`) : tr("출생 연도를 선택하면 해당 연생의 해석과 월별 점수만 보여드립니다.", "Choose a birth year to see its reading and monthly scores.");
  }
  select.addEventListener('change', () => { touched = true; update(); });
  // 모듈을 불러오는 동안 이미 선택한 값도 반영한다.
  if (select.value) { touched = true; update(); }
  select.dataset.ready = 'true';
  try {
    const birth = birthYearOf(sessionLoad('a') || await load('a'));
    if (touched || !select.isConnected || !data.cohorts[birth]) return;
    select.value = String(birth);
    update();
  } catch { /* 저장 정보가 없거나 읽기 불가해도 수동 선택은 계속 가능 */ }
}

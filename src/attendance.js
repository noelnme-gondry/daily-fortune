// ── Attendance Module ──────────────────────────────────────────
// Tracks daily check-ins using localStorage

const STORAGE_PREFIX = 'fortune_attendance_';
const STREAK_KEY = 'fortune_streak';

/**
 * Get today's date key in YYYY-MM-DD format
 */
function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Check in for today. Returns { isNew, streak, totalDays }
 */
export function checkIn() {
  const today = getTodayKey();
  const key = STORAGE_PREFIX + today;
  const isNew = !localStorage.getItem(key);

  if (isNew) {
    localStorage.setItem(key, Date.now().toString());
  }

  const streak = calculateStreak();
  const totalDays = getTotalDays();

  return { isNew, streak, totalDays, date: today };
}

/**
 * Calculate consecutive day streak ending today
 */
function calculateStreak() {
  let streak = 0;
  const d = new Date();

  // If today is not attended yet, we should start counting the streak from yesterday.
  const todayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  if (!localStorage.getItem(STORAGE_PREFIX + todayKey)) {
    d.setDate(d.getDate() - 1);
  }

  while (true) {
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (localStorage.getItem(STORAGE_PREFIX + key)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Get total number of attendance days
 */
function getTotalDays() {
  let count = 0;
  for (let i = 0; i < localStorage.length; i++) {
    if (localStorage.key(i).startsWith(STORAGE_PREFIX)) {
      count++;
    }
  }
  return count;
}

/**
 * Get attendance history for the current month
 * Returns array of { date, attended }
 */
export function getMonthHistory(year, month) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const history = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    history.push({
      date: dateStr,
      day,
      attended: !!localStorage.getItem(STORAGE_PREFIX + dateStr),
    });
  }

  return history;
}

/**
 * Render attendance calendar into a container element
 */
export function renderCalendar(container) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const info = checkIn();
  const history = getMonthHistory(year, month);
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  container.innerHTML = `
    <div class="attendance-header">
      <div class="attendance-stats">
        <div class="stat-card streak">
          <span class="stat-emoji">🔥</span>
          <span class="stat-value">${info.streak}</span>
          <span class="stat-label">연속 출석</span>
        </div>
        <div class="stat-card total">
          <span class="stat-emoji">⭐</span>
          <span class="stat-value">${info.totalDays}</span>
          <span class="stat-label">총 출석</span>
        </div>
      </div>
      ${info.isNew ? '<div class="checkin-toast show">✨ 오늘 출석 완료! Today\'s check-in complete!</div>' : ''}
    </div>
    <div class="calendar">
      <div class="calendar-title">${year}년 ${monthNames[month]}</div>
      <div class="calendar-grid">
        ${dayNames.map(d => `<div class="calendar-day-name">${d}</div>`).join('')}
        ${Array(firstDayOfWeek).fill('<div class="calendar-cell empty"></div>').join('')}
        ${history.map(h => {
          const isToday = h.date === info.date;
          const classes = ['calendar-cell'];
          if (h.attended) classes.push('attended');
          if (isToday) classes.push('today');
          return `<div class="${classes.join(' ')}">
            <span class="cell-day">${h.day}</span>
            ${h.attended ? '<span class="cell-check">✓</span>' : ''}
          </div>`;
        }).join('')}
      </div>
    </div>
  `;
}

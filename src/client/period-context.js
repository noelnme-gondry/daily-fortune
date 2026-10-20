import { addDays, isoDate } from '../engine/index.js';
import { dayBox, weekBox, monthBox } from '../site/period-boxes.js';
import { dayExample } from '../site/public-examples.js';
import { tr } from '../i18n/runtime.js';
import { localizeClientLinks } from './language.js';

// 최초 SSR과 자정 뒤 화면에서 같은 날짜 조각을 사용한다.
export function refreshPeriodContext(root, mode, today) {
  const box = document.querySelector('main .daybox');
  const html = mode === 'today' || mode === 'tomorrow'
    ? dayBox(mode === 'tomorrow' ? addDays(today, 1) : today, mode === 'tomorrow' ? tr('내일', 'Tomorrow') : tr('오늘', 'Today'))
    : mode === 'week' ? weekBox(today) : mode === 'month' ? monthBox(today) : '';
  if (box && html) {
    box.outerHTML = html;
    localizeClientLinks(document.querySelector('main .daybox'));
  }
  const example = document.querySelector('#public-example[data-example-date]');
  if (example && (mode === 'today' || mode === 'tomorrow')) {
    example.outerHTML = dayExample(mode === 'tomorrow' ? addDays(today, 1) : today, mode);
    localizeClientLinks(document.querySelector('#public-example'));
  }
  let note = root.querySelector('[data-period-notice]');
  if (!note) {
    note = document.createElement('p');
    note.className = 'period-notice';
    note.dataset.periodNotice = '';
    note.setAttribute('role', 'status');
    root.prepend(note);
  }
  note.textContent = tr(`날짜가 바뀌어 ${isoDate(today)} 기준으로 다시 계산했어요.`, `The date changed. Your reading now uses ${isoDate(today)}.`);
}

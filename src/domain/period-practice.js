import { DAILY_ACTION_ALTERNATIVES } from '../content/daily-scenes.js';
import { hash } from '../engine/core.js';
import { tr } from '../i18n/runtime.js';

// A weekly, monthly or annual report stays tied to its subject and reference period.
export function periodPractice(topic, key, used = new Set()) {
  const topics = Array.isArray(topic) ? topic : [topic];
  const options = topics.flatMap(id => DAILY_ACTION_ALTERNATIVES[id]).filter(([ko, en]) => !/오늘|내일|어제|하루/.test(ko) && !/\b(today|tomorrow|yesterday)\b/i.test(en));
  const start = hash(String(key) + '|' + topic) % options.length;
  const ordered = [...options.slice(start), ...options.slice(0, start)];
  const row = ordered.find(option => !used.has(option[2])) || ordered[0];
  used.add(row[2]);
  return tr(row[0], row[1]);
}

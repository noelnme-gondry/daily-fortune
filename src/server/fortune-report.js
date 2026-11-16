import { readFileSync } from 'node:fs';
import { buildChart, lifetime, compat, todayKST, isoDate } from '../engine/index.js';
import { calculateTojeong } from '../domain/tojeong.js';
import { birthDateError } from '../domain/birth-input.js';
import { resolveBirthTime } from '../domain/birth-time.js';
import { birthTimesFor } from '../engine/chart.js';
import { fortuneProduct } from '../domain/fortune-products.js';
import { chartCard } from '../client/views.js';
import { lifeView } from '../client/life-tool.js';
import { compatView } from '../client/compat-tool.js';
import { tojeongView } from '../client/tojeong-view.js';
import { esc } from '../site/util.js';
import { withLanguage } from '../i18n/runtime.js';

const readings = JSON.parse(readFileSync(new URL('../content/tojeong-144.json', import.meta.url), 'utf8'));
const stylesheet = readFileSync(new URL('../styles/main.css', import.meta.url), 'utf8');
export class PurchaseError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}
function person(raw, dateOnly, today) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new PurchaseError('출생 정보를 입력해 주세요.');
  const p = { name: typeof raw.name === 'string' ? raw.name.trim().slice(0, 12) : '', calendar: raw.calendar, leap: raw.leap === true, y: raw.y, m: raw.m, d: raw.d };
  if (!['solar', 'lunar'].includes(p.calendar) || (p.calendar === 'solar' && p.leap)) throw new PurchaseError('달력과 윤달 여부를 확인해 주세요.');
  const error = birthDateError(p, today);
  if (error) throw new PurchaseError(error);
  if (dateOnly) return p;
  if (!['M', 'F'].includes(raw.gender)) throw new PurchaseError('성별을 선택해 주세요.');
  p.gender = raw.gender;
  p.noTime = raw.noTime === true;
  p.timeMode = raw.timeMode === 'branch' ? 'branch' : 'exact';
  p.time = null;
  if (!p.noTime && p.timeMode === 'exact') {
    if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(raw.time || '')) throw new PurchaseError('태어난 시각을 확인해 주세요.');
    p.time = raw.time;
  } else if (!p.noTime) {
    const branch = resolveBirthTime(raw.timeBranch, birthTimesFor(p).off);
    if (!branch) throw new PurchaseError('태어난 시진을 확인해 주세요.');
    p.timeBranch = branch.value;
  }
  return p;
}
const engineInput = p => ({ ...p, time: p.noTime || p.timeMode === 'branch' ? null : p.time, ...(!p.noTime && p.timeMode === 'branch' ? { timeBranch: p.timeBranch } : { timeBranch: undefined }) });

// 계산 엔진을 수정하지 않고 기존 상세 보기와 같은 결과를 한 번 생성한다.
export function createFortuneReport(input, today = todayKST()) {
  return withLanguage('ko', () => {
    const product = fortuneProduct(input?.productId);
    if (!product) throw new PurchaseError('상품을 다시 선택해 주세요.');
    if (input.privacyConsent !== true) throw new PurchaseError('출생 정보 처리에 동의해 주세요.');
    if (!Array.isArray(input.people) || input.people.length !== product.people) throw new PurchaseError('상품에 필요한 출생 정보를 모두 입력해 주세요.');
    const people = input.people.map(p => person(p, product.id === 'tojeong', today));
    let targetYear = null, title, summary, body;
    if (product.id === 'tojeong') {
      targetYear = input.targetYear;
      if (![today.y, today.y + 1].includes(targetYear)) throw new PurchaseError('올해 또는 내년을 선택해 주세요.');
      const r = calculateTojeong(people[0], targetYear), reading = readings[r.code];
      title = `${people[0].name || '나'}의 ${targetYear}년 토정비결`;
      summary = reading.chongun.split(/(?<=[.!?])\s+/)[0];
      body = tojeongView(r, reading, people[0].name);
    } else {
      const charts = people.map(p => buildChart(engineInput(p)));
      if (product.id === 'lifetime') {
        const r = lifetime(charts[0], today);
        title = `${people[0].name || '나'}의 평생 사주`;
        summary = r.dayMaster.summary;
        body = lifeView(r, charts[0], today) + chartCard(charts[0], people[0], today);
      } else {
        const r = compat(charts[0], charts[1], today);
        title = `${people[0].name || '나'}와 ${people[1].name || '상대'}의 궁합`;
        summary = r.headline;
        body = compatView(r, charts[0], charts[1], today) + charts.map((c, i) => chartCard(c, people[i], today)).join('');
      }
    }
    const normalized = { productId: product.id, people, targetYear };
    const html = `<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src 'none'; base-uri 'none'; form-action 'none'"><title>${esc(title)}</title><style>${stylesheet}\n:root{color-scheme:light;--bg:#fcf8f5;--paper:#fffdfa;--sunk:#f1e8e1;--ink:#352e2b;--ink-2:#685c55;--line:#ded0c5;--accent:#79513e;--accent-soft:#f3e5d9;--on-accent:#fff;--seal:#b4362b;--wood:#2a6f55;--fire:#c2412d;--earth:#815b12;--metal:#68717a;--water:#27345a}body{background:var(--bg);color:var(--ink)}.download-report{max-width:1040px;margin:24px auto;padding:20px}.download-report>header{margin-bottom:28px}.download-report .box,.download-report .card{margin-block:16px}.download-report button,.download-report dialog,.download-report .tojeong-months{display:none!important}.download-report .tojeong-month-detail>section[hidden]{display:block!important}.download-report .tojeong-month-detail>section{margin-block:24px}.download-report .tip{border:0}.download-report footer{margin-top:32px;border-top:1px solid #d2d6ce;padding-top:16px}@media print{.download-report{padding:0;margin:0}.card,section{break-inside:auto}.chart-card{break-before:page}body{color-scheme:light}}</style><main class="download-report"><header><p>make your own day</p><h1>${esc(title)}</h1><p>풀이 기준일 ${isoDate(today)} · ${product.price}원 단건 구매</p></header>${body}<footer><p>사주는 전통 해석을 참고하는 콘텐츠입니다. 점수는 사건의 확률이나 사람의 가치를 뜻하지 않습니다.</p><p>이 파일에는 출생 정보가 포함되어 있습니다. 개인적으로 보관해 주세요.</p></footer></main></html>`;
    return { product, normalized, title, summary, html };
  });
}

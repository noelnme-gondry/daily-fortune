import { READINGS as readings } from '../content/tojeong-readings.js';
import { buildChart, year, yearMonths, lifetime, compat, todayKST, isoDate } from '../engine/index.js';
import { calculateTojeong } from '../domain/tojeong.js';
import { yearView } from '../client/views.js';
import { birthDateError } from '../domain/birth-input.js';
import { resolveBirthTime } from '../domain/birth-time.js';
import { birthTimesFor } from '../engine/chart.js';
import { bundleReadings, fortuneProduct } from '../domain/fortune-products.js';
import { tojeongPremium, lifetimePremium, compatibilityPremium, reportDocument } from './premium-report.js';
import { withLanguage } from '../i18n/runtime.js';

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
    if (product.id === 'bundle') {
      const targetYear = input.targetYear;
      if (targetYear !== today.y + 1) throw new PurchaseError('신년운세 연도가 바뀌었습니다. 상품 페이지를 새로 열어 주세요.', 409);
      const tojeongYear = input.tojeongYear ?? targetYear;
      const reports = {};
      let summary;
      for (const { id } of bundleReadings) {
        const reading = createFortuneReport({ ...input, productId: id, targetYear: id === 'tojeong' ? tojeongYear : targetYear }, today);
        reports[id] = reading.html;
        if (id === 'tojeong') summary = reading.summary;
      }
      return { product, normalized: { productId: product.id, people, targetYear, tojeongYear }, title: `${people[0].name || '나'}의 운세 3종 묶음 · ${targetYear}년 신년운세 포함`, summary, reports };
    }
    let targetYear = null, title, summary, body;
    if (product.id === 'tojeong') {
      targetYear = input.targetYear;
      if (![today.y, today.y + 1].includes(targetYear)) throw new PurchaseError('올해 또는 내년을 선택해 주세요.');
      const r = calculateTojeong(people[0], targetYear), reading = readings[r.code];
      title = `${people[0].name || '나'}의 ${targetYear}년 토정비결`;
      summary = reading.interpretation || reading.chongun.split(/(?<=[.!?])\s+/)[0];
      body = tojeongPremium(r, reading);
    } else {
      const charts = people.map(p => buildChart(engineInput(p)));
      if (product.id === 'annual') {
        targetYear = input.targetYear;
        if (targetYear !== today.y + 1) throw new PurchaseError('구매 가능한 연도가 바뀌었습니다. 최신 운세 목록을 확인해 주세요.', 409);
        const annual = year(charts[0], targetYear);
        title = `${people[0].name || '나'}의 ${targetYear}년 신년운세`;
        summary = annual.overall.headline;
        body = yearView(annual, yearMonths(charts[0], targetYear), today, { detailed: true, offline: true });
      } else if (product.id === 'lifetime') {
        const r = lifetime(charts[0], today);
        title = `${people[0].name || '나'}의 평생 사주`;
        summary = r.dayMaster.summary;
        body = lifetimePremium(r, charts[0], people[0], today);
      } else {
        const r = compat(charts[0], charts[1], today);
        title = `${people[0].name || '나'}와 ${people[1].name || '상대'}의 궁합`;
        summary = r.headline;
        body = compatibilityPremium(r, charts[0], charts[1], people, today);
      }
    }
    const normalized = { productId: product.id, people, targetYear };
    const html = reportDocument(title, body, isoDate(today), product.id);
    return { product, normalized, title, summary, html };
  });
}

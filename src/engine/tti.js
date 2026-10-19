import { tr, isEnglish } from '../i18n/runtime.js';
import { term, animalName } from '../i18n/terms.js';
// 띠별 운세: 해·날의 간지와 띠(년지)의 관계만으로 계산하는 대중용 운세. 개인 사주보다 단순하지만 같은 규칙으로 결정론적이다.
import T from '../content/text.js';
import TT from '../content/tti.js';
import {
  BR_EL, STEM_EL, DOHWA, YEOKMA, fill, pick, clamp, elRel, tenGod, relKey, pillarLabel, samjaeBranches, hongran, cheonhui,
} from './core.js';
import { yearPillar, monthPillar, dayPillar } from './calendar.js';
import { bandOf } from './fortune.js';
import { readingAction, readingCycle, zodiacReading, zodiacRelationText, zodiacElementText } from '../domain/reading.js';

const REL_W = { '합': 14, '삼합': 10, '같음': -3, '없음': 0, '충': -14, '형': -8, '원진': -8, '해': -5, '파': -4 };
const ELEM_W = [2, -2, 4, -5, 6];
const COHORT_W = { '비견': 0, '겁재': -3, '식신': 4, '상관': -1, '편재': 3, '정재': 4, '편관': -4, '정관': 3, '편인': -2, '정인': 4 };
const SAMJAE_NAME = ['들삼재', '눌삼재', '날삼재'];
const SAMJAE_W = [-5, -8, -4];

// 같은 해석 근거를 가진 띠끼리는 활용 장면을 순서대로 배정한다.
// 띠 이름만 바꾸거나 점수에 임의 가산점을 넣어 차이를 만들지 않는다.
function sceneOffset(tti, p) {
  const signature = (t) => [relKey(p.b, t), elRel(BR_EL[t], BR_EL[p.b]), elRel(BR_EL[t], STEM_EL[p.s])].join('|');
  const current = signature(tti);
  let offset = 0;
  for (let t = 0; t < tti; t++) if (signature(t) === current) offset++;
  return offset;
}

export function samjaeOf(tti, y) {
  const idx = samjaeBranches(tti).indexOf(yearPillar(y).b);
  return idx < 0 ? null : { idx, name: term(SAMJAE_NAME[idx]) };
}
// 그 해에 삼재가 드는 띠 3개와 단계
export function samjaeYear(y) {
  const out = [];
  for (let t = 0; t < 12; t++) { const s = samjaeOf(t, y); if (s) out.push({ tti: t, ...s }); }
  return out;
}

export function ttiYear(tti, y) {
  const yp = yearPillar(y);
  const rel = relKey(yp.b, tti);
  const e = elRel(BR_EL[tti], BR_EL[yp.b]);
  const es = elRel(BR_EL[tti], STEM_EL[yp.s]);
  const sj = samjaeOf(tti, y);
  const base = 62 + REL_W[rel] + ELEM_W[e] + ELEM_W[es] * 0.5 + (sj ? SAMJAE_W[sj.idx] : 0);
  const dohwa = DOHWA[tti % 4] === yp.b, yeokma = YEOKMA[tti % 4] === yp.b;
  const hong = hongran(tti) === yp.b || cheonhui(tti) === yp.b;
  const raw = {
    career: base + (e === 3 ? 5 : 0) + (es === 3 ? 3 : 0) + (rel === '충' ? -4 : 0),
    money: base + (e === 2 ? 8 : 0) + (e === 1 ? -3 : 0) + (sj ? -3 : 0),
    love: base + (dohwa ? 10 : 0) + (hong ? 8 : 0) + (rel === '원진' ? -5 : 0),
    move: base + (yeokma ? 12 : 0) + (rel === '충' ? 18 : 0),
    health: base + (rel === '충' || rel === '형' ? -6 : 0) + (sj ? -4 : 0) + (e === 4 ? 4 : 0),
  };
  const score = clamp(Math.round(base), 28, 95);
  const P = tr(`${y}년에는`, `In ${y}`);
  const context = { cycle: y, offset: sceneOffset(tti, yp), identity: `zodiac-year|${rel}|${e}|${es}` };
  const cats = Object.entries(raw).map(([cat, v]) => {
    const s = clamp(Math.round(v), 25, 96);
    const factor = cat === 'love' && (dohwa || hong) ? '도화' : cat === 'move' && yeokma ? '역마'
      : rel === '없음' || rel === '같음' ? ['비견', '식신', '정재', '정관', '정인'][e] : rel;
    const action = readingAction(cat, s, { ...context, factor });
    return { key: cat, name: T.catName[cat], score: s, text: tr(`${P} 살펴볼 주제는 ‘${action.title}’입니다. ${action.text}`, `${P}, consider ${action.title.toLowerCase()}. ${action.text}`) };
  });
  const a = animalName(tti), Y = tr(`${pillarLabel(yp).slice(0, 2)}년`, `${pillarLabel(yp)} year`);
  const parts = [fill(TT.yearRel[rel], { a, Y }), fill(TT.yearElem[e], { a })];
  if (sj) parts.push(tr(`${a}띠에게 ${y}년은 ${TT.samjae[sj.idx]}`, `For ${a}, ${y} is ${TT.samjae[sj.idx]}`));
  if (dohwa) parts.push(tr('도화가 드는 해라 이성의 관심과 인기가 높아집니다.', 'Peach Blossom highlights romantic attention and popularity.'));
  if (yeokma) parts.push(tr('역마가 드는 해라 이동·출장·이사 등 움직임이 많습니다.', 'Travel Horse highlights trips, moving and changes of place.'));
  if (hong) parts.push(tr('홍란·천희가 드는 해라 연애와 혼사에 경사가 생기기 쉽습니다.', 'Red Matchmaker and Heavenly Joy highlight happy relationship and marriage themes.'));
  const good = [], caution = [];
  for (let m = 1; m <= 12; m++) {
    const r = relKey(monthPillar({ y, m, d: 15 }).b, tti);
    if (r === '합' || r === '삼합') good.push(m);
    if (r === '충' || r === '형' || r === '원진') caution.push(m);
  }
  const luckyEl = (BR_EL[tti] + 4) % 5;
  const E = T.element[luckyEl];
  // 기준 해에서 100년 전까지의 출생 연도를 매년 다시 구성한다.
  const cohorts = [];
  for (let by = y - 100; by <= y; by++) {
    const bp = yearPillar(by);
    if (bp.b !== tti) continue;
    const tg = tenGod(bp.s, yp.s);
    const age = y - by;
    const focus = TT.ageFocus.find(([max]) => age <= max)[1];
    cohorts.push({ birthYear: by, pillar: bp, pillarText: pillarLabel(bp), age, tg, score: clamp(Math.round(base + COHORT_W[tg]), 25, 96), text: `${TT.cohort[tg]} ${focus}` });
  }
  const focus = zodiacReading({ rel, e, es, score, ...context });
  const headline = tr(`한 해의 초점 · ${focus.title}`, `Annual focus · ${focus.title}`);
  return {
    tti, animal: a, year: y, pillar: yp, pillarText: pillarLabel(yp), rel, samjae: sj, score, headline,
    summary: parts.join(' '), cats, goodMonths: good, cautionMonths: caution,
    lucky: { el: luckyEl, color: E.color.join('·'), number: E.number.join('·'), dir: E.dir }, cohorts,
  };
}

export function ttiDay(tti, o) {
  const dp = dayPillar(o);
  const rel = relKey(dp.b, tti);
  const e = elRel(BR_EL[tti], BR_EL[dp.b]);
  const es = elRel(BR_EL[tti], STEM_EL[dp.s]);
  const mrel = relKey(monthPillar(o).b, tti);
  const score = clamp(Math.round(60 + REL_W[rel] * 0.95 + ELEM_W[e] * 0.9 + ELEM_W[es] * 0.5 + REL_W[mrel] * 0.25), 22, 97);
  const key = `ttid${tti}|${o.y}-${o.m}-${o.d}`;
  const a = animalName(tti);
  const band = bandOf(score);
  const { text } = zodiacReading({ rel, e, es, score, cycle: readingCycle(o), offset: sceneOffset(tti, dp), identity: 'zodiac-day' });
  const E = T.element[(BR_EL[tti] + 4) % 5];
  return { tti, animal: a, score, band, rel, text, color: pick(E.color, key + 'c'), number: pick(E.number, key + 'n') };
}

// 일별 총점과 같은 요인을 상세 화면에 그대로 공개한다.
export function ttiDayDetails(tti, o) {
  const dp = dayPillar(o), mp = monthPillar(o);
  const rel = relKey(dp.b, tti), mrel = relKey(mp.b, tti);
  const e = elRel(BR_EL[tti], BR_EL[dp.b]), es = elRel(BR_EL[tti], STEM_EL[dp.s]);
  if (isEnglish()) return [
    { label: 'Today’s branch relationship', value: REL_W[rel] * 0.95, text: `${pillarLabel(dp)} day · ${term(rel)}. ${zodiacRelationText(rel)}` },
    { label: 'Today’s elements', value: ELEM_W[e] * 0.9 + ELEM_W[es] * 0.5, text: `${zodiacElementText(e, es)} This describes how the elements of the ${pillarLabel(dp)} day relate to ${animalName(tti)}.` },
    { label: 'This month’s background', value: REL_W[mrel] * 0.25, text: mrel === '없음' ? `The ${pillarLabel(mp)} month has no major combination or clash with ${animalName(tti)}, leaving the daily pattern more apparent.` : `The branch of the ${pillarLabel(mp)} month forms ${term(mrel).toLowerCase()} with ${animalName(tti)}. This is a background theme throughout the month.` },
  ];
  return [
    { label: '오늘의 지지 관계', value: REL_W[rel] * 0.95, text: `${pillarLabel(dp)}일 · 관계: ${rel}. ${zodiacRelationText(rel)}` },
    { label: '오늘의 오행', value: ELEM_W[e] * 0.9 + ELEM_W[es] * 0.5, text: `${zodiacElementText(e, es)} ${pillarLabel(dp)}일의 오행이 ${animalName(tti)}띠의 오행과 맺는 관계입니다.` },
    { label: '이번 달의 바탕', value: REL_W[mrel] * 0.25, text: mrel === '없음' ? `${pillarLabel(mp)}월은 ${animalName(tti)}띠와 특별한 합충이 없어 오늘 하루의 흐름이 그대로 드러납니다.` : `${pillarLabel(mp)}월의 지지와 ${animalName(tti)}띠의 관계는 ${mrel}입니다. 한 달 내내 은은하게 깔리는 기운입니다.` },
  ];
}

export function ttiMonths(tti, y, birthYear = null) {
  const annual = ttiYear(tti, y);
  const cohort = birthYear === null ? null : annual.cohorts.find((c) => c.birthYear === birthYear);
  if (birthYear !== null && !cohort) throw new RangeError(tr('해당 띠의 출생 연도를 선택해 주세요.', 'Select a birth year that belongs to this zodiac sign.'));
  const adjustment = cohort ? COHORT_W[cohort.tg] : 0;
  return Array.from({ length: 12 }, (_, i) => {
    const m = i + 1, mp = monthPillar({ y, m, d: 15 });
    const rel = relKey(mp.b, tti), e = elRel(BR_EL[tti], BR_EL[mp.b]);
    const score = clamp(Math.round(annual.score * 0.35 + (60 + REL_W[rel] + ELEM_W[e]) * 0.65 + adjustment), 22, 97);
    const reading = zodiacReading({ rel, e, score, cycle: y * 12 + m, offset: sceneOffset(tti, mp), identity: `zodiac-month|${birthYear ?? 'all'}` });
    return { m, score, pillarText: pillarLabel(mp), rel, text: reading.text };
  });
}

export function ttiCompat(a, b) {
  const rel = relKey(a, b);
  const e = elRel(BR_EL[a], BR_EL[b]);
  const base = { '합': 90, '삼합': 86, '같음': 70, '없음': 72, '충': 46, '원진': 48, '형': 53, '해': 58, '파': 60 }[rel];
  const adj = [0, 3, -2, -2, 3][e];
  return { a, b, rel, score: clamp(base + adj, 30, 97), text: fill(TT.compat[rel], { a: animalName(a), b: animalName(b) }) };
}
// 띠별로 잘 맞는 띠(육합·삼합)와 조심할 띠(충·원진·형)
export function ttiMatches(tti) {
  const good = [], bad = [];
  for (let t = 0; t < 12; t++) {
    if (t === tti) continue;
    const r = relKey(tti, t);
    if (r === '합' || r === '삼합') good.push({ tti: t, rel: r });
    if (r === '충' || r === '원진' || r === '형') bad.push({ tti: t, rel: r });
  }
  return { good, bad };
}

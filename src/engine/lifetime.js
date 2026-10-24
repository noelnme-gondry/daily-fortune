import { tr, isEnglish } from '../i18n/runtime.js';
import { term, elementName } from '../i18n/terms.js';
// 평생 운세: 원국 해석 + 대운 흐름 + 앞으로 15년의 주요 시기.
import T from '../content/text.js';
import { EL_H, BR_MAIN, tenGod, branchRels, pillarLabel } from './core.js';
import { yearPillar } from './calendar.js';
import { daeunAt } from './chart.js';
import { CATS, year, daeunScores } from './fortune.js';

export const SPOUSE = { M: ['정재', '편재'], F: ['정관', '편관'] };
const CHILD = { M: ['편관', '정관'], F: ['식신', '상관'] };

export function signalLabel(value) {
  if (!isEnglish()) return value;
  if (value.endsWith('운')) return `${term(value.slice(0, -1))} period`;
  return ({ '일지 육합': 'Day-branch six-combination', '일지 삼합': 'Day-branch trine', '자녀궁(시지) 합': 'Hour-branch combination', '일지 충': 'Day-branch clash', '월지 충': 'Month-branch clash', '년지 충': 'Year-branch clash' })[value] || term(value);
}

// 한 해의 결혼·자녀·이동 신호 (궁합에서도 재사용)
export function yearSignals(c, y) {
  const yp = yearPillar(y);
  const tgS = tenGod(c.dm, yp.s), tgB = tenGod(c.dm, BR_MAIN[yp.b]);
  const age = y - c.birth.y;
  const dy = daeunAt(c, y);
  const relDay = branchRels(yp.b, c.pillars.day.b);
  const reasons = { marriage: [], child: [], move: [] };
  let marriage = 0, child = 0, move = 0;
  if (SPOUSE[c.gender].includes(tgS)) { marriage += 2; reasons.marriage.push(`${tgS}운`); }
  if (SPOUSE[c.gender].includes(tgB)) { marriage += 1.5; if (tgB !== tgS) reasons.marriage.push(`${tgB}운`); }
  if (relDay.includes('합')) { marriage += 2; reasons.marriage.push('일지 육합'); } else if (relDay.includes('삼합')) { marriage += 1; reasons.marriage.push('일지 삼합'); }
  if (c.ss.hongran.has(yp.b)) { marriage += 2; reasons.marriage.push('홍란·천희'); }
  if (c.ss.dohwa.has(yp.b)) { marriage += 1; reasons.marriage.push('도화'); }
  if (dy && SPOUSE[c.gender].includes(tenGod(c.dm, dy.s))) marriage += 1;
  if (age < 22 || age > 46) marriage -= 10;
  if (CHILD[c.gender].includes(tgS)) { child += 2; reasons.child.push(`${tgS}운`); }
  if (CHILD[c.gender].includes(tgB)) { child += 1.5; if (tgB !== tgS) reasons.child.push(`${tgB}운`); }
  if (c.pillars.hour) {
    const rh = branchRels(yp.b, c.pillars.hour.b);
    if (rh.includes('합') || rh.includes('삼합')) { child += 1.5; reasons.child.push('자녀궁(시지) 합'); }
  }
  if (age < 22 || age > (c.gender === 'F' ? 45 : 55)) child -= 10;
  if (c.ss.yeokma.has(yp.b)) { move += 3; reasons.move.push('역마'); }
  if (relDay.includes('충')) { move += 2; reasons.move.push('일지 충'); }
  if (branchRels(yp.b, c.pillars.month.b).includes('충')) { move += 1.5; reasons.move.push('월지 충'); }
  if (branchRels(yp.b, c.pillars.year.b).includes('충')) { move += 1; reasons.move.push('년지 충'); }
  return { y, yp, age, marriage, child, move, reasons };
}

export function lifetime(c, today) {
  const total = c.counts.reduce((a, b) => a + b, 0);
  const excess = [], lack = [];
  c.counts.forEach((n, e) => { if (n >= Math.max(3, total * 0.38)) excess.push(e); if (n === 0) lack.push(e); });
  const domGroup = c.groupW.map((w, g) => [w, g]).sort((a, b) => b[0] - a[0])[0][1];
  const careerG = T.groupCareer[domGroup === 0 ? (c.groupW[1] >= c.groupW[3] ? 1 : 3) : domGroup];

  const jae = c.groupW[2], sik = c.groupW[1], bi = c.groupW[0];
  const wealth = [jae < 0.3 ? T.wealth.none : jae < 1.2 ? T.wealth.weak : jae < 2.6 ? T.wealth.balanced : T.wealth.strong];
  if (sik >= 1 && jae >= 1) wealth.push(T.wealth.sikjae);
  if (bi >= 3 && jae < 1.2) wealth.push(T.wealth.gunjeop);

  const spouseCount = SPOUSE[c.gender].reduce((n, t) => n + (c.tenGodCount[t] || 0), 0);
  const love = [T.spouseStar[c.gender][spouseCount === 0 ? 'none' : spouseCount === 1 ? 'one' : 'many']];
  if (c.gender === 'F' && c.tenGodCount['정관'] && c.tenGodCount['편관']) love.push(T.mixedGwan);
  love.push(T.spousePalace[tenGod(c.dm, BR_MAIN[c.pillars.day.b])]);
  if (branchRels(c.pillars.day.b, c.pillars.month.b).includes('충')) love.push(tr('일지와 월지가 충하여 결혼 후 생활 환경이나 가족 관계에 큰 변화가 생기기 쉽습니다. 독립된 생활 공간을 확보하는 것이 좋습니다.', 'A clash between the day and month branches highlights changes in home or family relationships after marriage. Having your own living space may help.'));
  if (c.natalSS.some(([n]) => n === '도화살')) love.push(tr('원국에 도화가 있어 타고난 매력으로 이성의 관심을 받기 쉽습니다.', 'Peach Blossom in the natal chart traditionally highlights natural charm and romantic attention.'));

  const byWeight = [0, 1, 2, 3, 4].sort((a, b) => c.weights[a] - c.weights[b]);
  const weakEl = byWeight[0], strongEl = byWeight[4];
  const health = [
    tr(`이 원국에서 가장 적게 반영된 오행은 ${elementName(weakEl)}(${EL_H[weakEl]})입니다. 전통적인 균형 해석이며 개인의 장기 기능이나 건강 상태를 판단하지 않습니다.`, `The least prominent element in this chart is ${elementName(weakEl)} (${EL_H[weakEl]}). This is a traditional interpretation of balance and does not assess your health or organ function.`),
    tr(`가장 많이 반영된 오행은 ${elementName(strongEl)}(${EL_H[strongEl]})입니다. 오행의 많고 적음과 실제 몸 상태는 구분하고, 생활 리듬은 현재 느끼는 피로와 일정을 기준으로 살펴보세요.`, `The most prominent element is ${elementName(strongEl)} (${EL_H[strongEl]}). Element weights do not describe your physical condition. Review your routine using your actual energy and schedule.`),
  ];

  const cur = daeunAt(c, today.y);
  const daeun = c.daeun.map((d) => {
    const sc = daeunScores(c, d);
    const tS = tenGod(c.dm, d.s), tB = tenGod(c.dm, BR_MAIN[d.b]);
    const best = CATS.map((cat, i) => [cat, sc.cats[i]]).sort((a, b) => b[1] - a[1])[0];
    return { ...d, pillarText: pillarLabel(d), tgS: tS, tgB: tB, score: sc.overall, keyword: T.tgKeyword[tB], best: T.catName[best[0]], current: d === cur };
  });

  const sig = [];
  for (let y = today.y; y < today.y + 15; y++) {
    const s = yearSignals(c, y);
    const yr = year(c, y, 'next');
    s.money = yr.cats[1].score; s.overall = yr.overall.score;
    sig.push(s);
  }
  const top = (k, n, min) => sig.filter((s) => s[k] >= min).sort((a, b) => b[k] - a[k] || a.y - b.y).slice(0, n).sort((a, b) => a.y - b.y);
  const item = (s, why) => ({ y: s.y, age: s.age, pillar: s.yp, why });
  const events = [
    { key: 'marriage', name: tr('결혼·인연', 'Marriage & relationships'), items: top('marriage', 3, 2).map((s) => item(s, s.reasons.marriage.map(signalLabel).join(' · '))) },
    { key: 'child', name: tr('자녀', 'Children'), items: top('child', 3, 2).map((s) => item(s, s.reasons.child.map(signalLabel).join(' · '))) },
    { key: 'money', name: tr('재물 상승', 'Financial highlights'), items: top('money', 3, 0).map((s) => item(s, tr(`금전운 ${s.money}점`, `Money: ${s.money}`))) },
    { key: 'move', name: tr('이사·이동', 'Moving & travel'), items: top('move', 3, 1.5).map((s) => item(s, s.reasons.move.map(signalLabel).join(' · '))) },
    { key: 'caution', name: tr('건강·신중', 'Wellbeing & care'), items: sig.slice().sort((a, b) => a.overall - b.overall || a.y - b.y).slice(0, 2).sort((a, b) => a.y - b.y).map((s) => item(s, tr(`종합 ${s.overall}점`, `Overall: ${s.overall}`))) },
  ];

  return {
    dayMaster: T.dayMaster[c.dm],
    elements: { counts: c.counts, excess: excess.map((e) => T.element[e].excess), lack: lack.map((e) => T.element[e].lack) },
    strength: { label: term(c.strengthLabel), ratio: c.ratio, text: T.strength[c.strengthLabel] },
    roles: c.roles,
    persona: T.groupPersona[domGroup],
    career: { jobs: careerG.jobs, note: careerG.note, industry: T.elementIndustry[c.roles.yong] },
    wealth, love, health, daeun, events,
  };
}

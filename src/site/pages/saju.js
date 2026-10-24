import { isEnglish, tr, withLanguage } from '../../i18n/runtime.js';
import { stemName as stemDisplay, elementName, branchName, animalName } from '../../i18n/terms.js';
import { siteText, displayPillar, siteValue, displayJosa } from '../copy.js';
// 사주 백과: 60일주·일간·십신·오행·신살·12운성·용어 사전·사주 보는 법
import T from '../../content/text.js';
import { SITE } from '../../content/pages.js';
import { ILJU_TAG, STEM_COLOR, BRANCH_TG_NOTE, STAGE_NOTE, GANJI_REL, STAGE_INFO, SIPSIN, OHAENG, SINSAL, GLOSSARY, GUIDE_STEPS } from '../../content/knowledge.js';
import {
  STEM_H, BR_H, EL_H, EL_SLUG, STEM_EL, BR_EL, BR_MAIN, HIDDEN, TG, TG_H, TG_SLUG, STEM_SLUG, STAGES, STAGES_H,
  LIUHE, DOHWA, YEOKMA, HWAGAE, GWIIN, MUNCHANG, YANGIN, GWEGANG, BAEKHO, hongran, cheonhui,
  tenGod, groupOf, stageOf, elRel, sexagenary, iljuSlug, pillarH, dayPillar, toUTC, fromUTC, DAY_MS,
} from '../../engine/index.js';
import { esc, faqBlock, faqLd, factTable, elSpan } from '../util.js';
import { hero } from './tools.js';
import { adSlot } from '../layout.js';
import RANK from '../../content/rank-table.js';

const article = (ctx, page, extra = {}) => ({
  '@type': 'Article', headline: page.h1 || page.title, description: page.description, inLanguage: siteText('ko-KR'),
  datePublished: ctx.published, dateModified: ctx.buildDate, author: { '@id': `${ctx.site}/#org` }, publisher: { '@id': `${ctx.site}/#org` },
  mainEntityOfPage: { '@id': `${ctx.site}${page.path}#webpage` }, image: `${ctx.site}/og-default.png?v=sun`, ...extra,
});
function articlePage(ctx, p) {
  const page = { ogType: 'article', modified: ctx.buildDate, section: '/saju/', ...p };
  page.ld = [article(ctx, page, p.about ? { about: p.about } : {}), faqLd(p.faq), ...(p.ld || [])];
  page.body = `<article class="article">${hero(p.h1, p.lead, p.eyebrow)}<p class="note editorial-note">${tr('전통 명리 용어와 이 서비스의 해석을 설명하는 글입니다. 성격·직업·관계·건강을 판정하거나 미래 사건을 보장하지 않습니다.', 'This article explains traditional saju terms and this service’s interpretations. It does not establish personality, career fit, relationships, health or future events.')} <a href="/editorial/">${tr('작성·출처 기준', 'Editorial and source policy')}</a></p>${p.content}${adSlot(ctx, 'inline')}${faqBlock(p.faq)}${p.after || ''}<p class="note"><a href="/guides/">${tr('실제 계산 예시로 읽는 이용 가이드', 'Reading guides with worked calculations')}</a> · <a href="/contact/">${tr('오류·출처 문제 제보', 'Report a correction or source concern')}</a></p><p class="updated">${siteText("최종 업데이트 ")}${ctx.buildDate} · ${esc(SITE.publisher)} · <a href="/about/">${siteText("계산 방법")}</a></p></article>`;
  return page;
}
const tool = (href, text) => `<p class="cta"><a class="btn" href="${href}">${esc(text)}</a></p>`;
const stemName = (s) => `${stemDisplay(s)}${tr('', ' ')}${elementName(STEM_EL[s])}(${STEM_H[s]}${EL_H[STEM_EL[s]]})`;
const brName = (b) => `${branchName(b)}${tr('', ' ')}${elementName(BR_EL[b])}(${BR_H[b]}${EL_H[BR_EL[b]]})`;
const iljuName = (p) => `${displayPillar(p)}${siteText("일주")}`;
const iljuLink = (p) => `<a href="/saju/ilju/${iljuSlug(p)}/">${iljuName(p)}(${pillarH(p)})</a>`;
const yinYang = (i) => (i % 2 === 0 ? siteText('양(陽)') : siteText('음(陰)'));

/* ── 허브 ───────────────────────────── */
export function hub(ctx) {
  const secs = [
    ['/saju/ilju/', siteText('60일주 총정리'), siteText('태어난 날의 간지 60가지. 성격·연애·직업·궁합을 일주별로 정리했습니다.')],
    ['/saju/ilgan/', siteText('일간 10가지'), siteText('사주에서 "나"를 뜻하는 일간. 갑목부터 계수까지 성격과 강점을 봅니다.')],
    ['/saju/sipsin/', siteText('십신'), siteText('비견·겁재·식신·상관·편재·정재·편관·정관·편인·정인의 뜻과 찾는 법.')],
    ['/saju/ohaeng/', siteText('오행'), siteText('목·화·토·금·수의 성격, 상생과 상극, 부족할 때 보완하는 법.')],
    ['/saju/sinsal/', siteText('신살'), siteText('도화살·역마살·화개살·천을귀인·양인·괴강 등 대표 신살 10가지.')],
    ['/saju/12unseong/', siteText('12운성'), siteText('장생부터 양까지, 일간의 기운이 지지에서 어떻게 변하는지.')],
    ['/saju/glossary/', siteText('사주 용어 사전'), siteText('만세력·용신·대운·세운·지장간 등 꼭 알아야 할 용어 30개.')],
    ['/saju/guide/', siteText('사주 보는 법'), siteText('원국 세우기부터 대운·세운 읽기까지 7단계.')],
  ];
  return {
    path: '/saju/', title: siteText('사주 백과 — 일주·십신·오행·신살 쉽게 정리'), description: siteText('사주명리의 기본 개념을 쉽게 정리한 사주 백과입니다. 60일주 성격, 일간 10가지, 십신과 오행, 도화살·역마살 같은 신살, 12운성, 용어 사전과 사주 보는 법을 담았습니다.'),
    crumbs: [[siteText('사주 백과'), '/saju/']], section: '/saju/',
    ld: [{ '@type': 'ItemList', name: siteText('사주 백과'), itemListElement: secs.map(([h, t], i) => ({ '@type': 'ListItem', position: i + 1, name: t, url: `${ctx.site}${h}` })) }],
    body: `${hero(siteText('사주 백과'), `${siteText("사주(四柱)는 태어난 연·월·일·시를 천간과 지지 여덟 글자로 나타낸 것이고, 명리학은 이 여덟 글자의 오행 관계로 기질과 운의 흐름을 읽는 학문입니다. 사주 백과는 ")}${SITE.name}${siteText("의 계산에 쓰이는 개념을 하나씩 풀어 설명합니다.")}`)}
      <div class="cards">${secs.map(([h, t, d]) => `<a class="card link-card" href="${h}"><b>${siteValue(t)}</b><span>${d}</span></a>`).join('')}</div>
      <section class="box-sec"><div class="sec-head"><h2>${siteText("60일주 바로 가기")}</h2></div>${iljuGrid()}</section>`,
  };
}
function iljuGrid() {
  return `<ol class="ilju-grid">${[...Array(60).keys()].map((n) => { const p = sexagenary(n); return `<li><a href="/saju/ilju/${iljuSlug(p)}/"><span class="hz el-${STEM_EL[p.s]}">${pillarH(p)}</span><span>${displayPillar(p)}</span></a></li>`; }).join('')}</ol>`;
}

/* ── 60일주 ───────────────────────────── */
export function iljuIndex(ctx) {
  const groups = [...Array(10).keys()].map((s) => {
    const rows = [...Array(60).keys()].map(sexagenary).filter((p) => p.s === s);
    return `<section class="ilju-group"><h2><a href="/saju/ilgan/${STEM_SLUG[s]}/">${stemName(s)}${siteText(" 일주")}</a></h2><ul class="plain">${rows.map((p) => `<li>${iljuLink(p)} — ${esc(ILJU_TAG[[...Array(60).keys()].find((n) => n % 10 === p.s && n % 12 === p.b)])}</li>`).join('')}</ul></section>`;
  }).join('');
  return {
    path: '/saju/ilju/', title: siteText('60일주 총정리 — 갑자일주부터 계해일주까지'), section: '/saju/',
    description: siteText('60갑자 일주 60가지의 성격, 연애·결혼, 직업, 궁합을 한눈에 정리했습니다. 내 일주가 무엇인지 모르면 만세력에서 바로 확인할 수 있습니다.'),
    crumbs: [[siteText('사주 백과'), '/saju/'], [siteText('60일주'), '/saju/ilju/']],
    ld: [{ '@type': 'ItemList', name: siteText('60일주'), numberOfItems: 60, itemListElement: [...Array(60).keys()].map((n) => { const p = sexagenary(n); return { '@type': 'ListItem', position: n + 1, name: `${iljuName(p)}(${pillarH(p)})`, url: `${ctx.site}/saju/ilju/${iljuSlug(p)}/` }; }) }],
    body: `${hero(siteText('60일주 총정리'), siteText('일주(日柱)는 태어난 날의 천간과 지지 한 쌍으로, 사주에서 나 자신(일간)과 배우자 자리(일지)를 함께 보여 주는 가장 중요한 기둥입니다. 천간 10개와 지지 12개가 짝을 이뤄 60가지 일주가 있으며, 같은 일주라도 나머지 기둥에 따라 해석이 달라집니다.'))}
      ${tool('/manseryeok/', siteText('내 일주 확인하기'))}${iljuGrid()}${groups}`,
  };
}
function datesOf(p, y) {
  const out = [];
  for (let t = toUTC({ y, m: 1, d: 1 }); t <= toUTC({ y, m: 12, d: 31 }); t += DAY_MS) {
    const o = fromUTC(t);
    const d = dayPillar(o);
    if (d.s === p.s && d.b === p.b) out.push(o);
  }
  return out;
}
export function iljuPage(n, ctx) {
  const p = sexagenary(n);
  const name = iljuName(p);
  const tg = tenGod(p.s, BR_MAIN[p.b]);
  const stage = stageOf(p.s, p.b);
  const rel = elRel(STEM_EL[p.s], BR_EL[p.b]);
  const dm = T.dayMaster[p.s];
  const hz = pillarH(p);
  const ss = [];
  if (GWEGANG.includes(hz)) ss.push([siteText('괴강살'), '/saju/sinsal/gwegang/']);
  if (BAEKHO.includes(hz)) ss.push([siteText('백호살'), '/saju/sinsal/baekho/']);
  if (YANGIN[p.s] === p.b) ss.push([siteText('양인살'), '/saju/sinsal/yangin/']);
  if (GWIIN[p.s].includes(p.b)) ss.push([siteText('일귀(천을귀인)'), '/saju/sinsal/cheoneul-gwiin/']);
  if (MUNCHANG[p.s] === p.b) ss.push([siteText('문창귀인'), '/saju/sinsal/munchang-gwiin/']);
  if ([0, 3, 6, 9].includes(p.b)) ss.push([siteText('도화의 자리(자오묘유)'), '/saju/sinsal/dohwa/']);
  if ([2, 5, 8, 11].includes(p.b)) ss.push([siteText('역마의 자리(인신사해)'), '/saju/sinsal/yeokma/']);
  if ([1, 4, 7, 10].includes(p.b)) ss.push([siteText('화개의 자리(진술축미)'), '/saju/sinsal/hwagae/']);
  const g = groupOf(tg);
  const career = T.groupCareer[g];
  const best = { s: (p.s + 5) % 10, b: LIUHE[p.b] };
  const goods = [...Array(10).keys()].filter((s) => s % 2 === LIUHE[p.b] % 2 && s !== best.s).map((s) => ({ s, b: LIUHE[p.b] }))
    .filter((q) => [1, 4].includes(elRel(STEM_EL[p.s], STEM_EL[q.s])) || elRel(STEM_EL[p.s], STEM_EL[q.s]) === 0).slice(0, 3);
  const ctrl = (STEM_EL[p.s] + 3) % 5;
  const bad = { s: ctrl * 2 + (p.s % 2), b: (p.b + 6) % 12 };
  const symbol = `${STEM_COLOR[p.s]} ${animalName(p.b)}`;
  const spouseM = ['정재', '편재'].includes(tg), spouseF = ['정관', '편관'].includes(tg);
  const love = [T.spousePalace[tg]];
  if (spouseM) love.push(`${siteText("남성에게는 배우자 자리(일지)에 아내의 별인 ")}${displayJosa(tg, '이/가')}${siteText(" 앉아 있어 배우자 인연이 뚜렷한 편입니다.")}`);
  if (spouseF) love.push(`${siteText("여성에게는 배우자 자리(일지)에 남편의 별인 ")}${displayJosa(tg, '이/가')}${siteText(" 앉아 있어 배우자 인연이 뚜렷한 편입니다.")}`);
  if (stage === '목욕') love.push(siteText('일지가 목욕지라 감수성과 매력이 커서 이성의 관심을 자주 받습니다.'));
  const y = ctx.today.y;
  const dates = [y, y + 1].map((yy) => `<p><b>${yy}${siteText("년:")}</b> ${datesOf(p, yy).map((o) => `${o.m}/${o.d}`).join(', ')}</p>`).join('');
  const lead = `${name}(${hz}${siteText("日柱)는 천간 ")}${displayJosa(stemName(p.s), '과/와')}${siteText(" 지지 ")}${displayJosa(brName(p.b), '이/가')}${siteText(" 만난 일주로, ")}"${ILJU_TAG[n]}"${siteText("으로 상징됩니다. 일지에 ")}${displayJosa(tg, '을/를')}${siteText(" 깔고 있고 12운성으로는 ")}${siteValue(stage)}${siteText("에 해당합니다. ")}${GANJI_REL[rel]}`;
  const faq = [
    { q: `${name}${siteText("의 성격은 어떤가요?")}`, a: `${ILJU_TAG[n].split(' — ')[1]}${siteText("입니다. ")}${dm.summary.split('. ')[0]}. ${BRANCH_TG_NOTE[tg].split('. ')[1] || ''}`.trim() },
    { q: `${name}${siteText("에게 맞는 직업은 무엇인가요?")}`, a: `${siteText("일지 ")}${siteValue(tg)}${siteText("의 성향으로 ")}${career.jobs}${siteText(" 같은 분야가 잘 맞습니다. ")}${career.note}` },
    { q: `${name}${siteText("의 연애와 결혼 스타일은?")}`, a: T.spousePalace[tg] },
    { q: `${displayJosa(name, '과/와')}${siteText(" 잘 맞는 일주는?")}`, a: `${iljuName(best)}(${pillarH(best)})${tr("는 천간합·육합 관계, ", " has a stem/branch combination relationship; ")}${iljuName(bad)}(${pillarH(bad)})${tr("는 극·충 관계로 분류합니다. 전통적인 글자 관계이며 실제 두 사람의 관계를 판정하지 않습니다.", " has a control/clash relationship. These are traditional character relationships, not verdicts on a real couple.")}` },
    { q: `${siteText("내 일주가 ")}${name}${siteText("인지 어떻게 알 수 있나요?")}`, a: `${siteText("일주는 태어난 날짜의 간지로 정해지며 띠와 상관이 없습니다. ")}${SITE.name}${siteText(" 만세력에 생년월일을 넣으면 바로 확인할 수 있습니다.")}` },
  ];
  const prev = sexagenary((n + 59) % 60), next = sexagenary((n + 1) % 60);
  const content = `
    ${factTable([
      [siteText('60갑자 순서'), `${n + 1}${siteText("번째")}`],
      [siteText('천간 (일간)'), `${elSpan(STEM_EL[p.s], stemName(p.s))} · ${yinYang(p.s)}`],
      [siteText('지지 (일지)'), `${elSpan(BR_EL[p.b], brName(p.b))} · ${animalName(p.b)}`],
      [siteText('상징'), `${symbol} (${hz})`],
      [siteText('일지 십신'), `<a href="/saju/sipsin/${TG_SLUG[TG.indexOf(tg)]}/">${siteValue(tg)}(${TG_H[TG.indexOf(tg)]})</a>`],
      [siteText('12운성'), `<a href="/saju/12unseong/">${siteValue(stage)}(${STAGES_H[STAGES.indexOf(stage)]})</a>`],
      [siteText('지장간'), HIDDEN[p.b].map(([h]) => `${STEM_H[h]}(${siteValue(tenGod(p.s, h))})`).join(' · ')],
      [siteText('관련 신살'), ss.length ? ss.map(([t, h]) => `<a href="${h}">${siteValue(t)}</a>`).join(', ') : '없음'],
    ], `${name}${siteText(" 핵심 정리")}`)}
    <section class="prose"><h2>${name}${siteText("의 성격")}</h2><p>${dm.summary}</p><p>${BRANCH_TG_NOTE[tg]}</p><p>${STAGE_NOTE[stage]}</p><p>${GANJI_REL[rel]}</p>
      <div class="pros"><div><h3>${siteText("강점")}</h3><ul>${dm.strengths.map((s) => `<li>${s}</li>`).join('')}<li>${SIPSIN[tg].keywords.slice(0, 2).join('·')}${siteText("의 기질")}</li></ul></div><div><h3>${siteText("다듬을 점")}</h3><ul>${dm.weaknesses.map((s) => `<li>${s}</li>`).join('')}</ul></div></div></section>
    <section class="prose"><h2>${name}${siteText("의 연애와 결혼")}</h2>${love.map((t) => `<p>${siteValue(t)}</p>`).join('')}</section>
    <section class="prose"><h2>${name}${siteText("에게 맞는 직업과 적성")}</h2><p>${isEnglish() ? SIPSIN[tg].summary : `${siteText("일지의 ")}${displayJosa(tg, '은/는')} ${SIPSIN[tg].summary.split('. ')[1] || SIPSIN[tg].summary}`}</p><p><b>${siteText("잘 맞는 분야:")}</b> ${career.jobs}. ${career.note}</p><p><b>${siteText("일간 오행으로 본 업종:")}</b> ${T.elementIndustry[(STEM_EL[p.s] + 1) % 5]}${siteText(" (일간이 생하는 ")}${elementName((STEM_EL[p.s] + 1) % 5)}${siteText(" 기운의 분야에서 재능이 드러납니다)")}</p></section>
    <section class="prose"><h2>${name} · ${tr("일주 간 합·충 관계", "Combinations and clashes between day pillars")}</h2>
      <p><b>${tr("천간합·육합:", "Stem and branch combinations:")}</b> ${iljuLink(best)}${siteText(" — 천간 ")}${STEM_H[p.s]}${STEM_H[best.s]}${siteText("합과 지지 ")}${BR_H[p.b]}${BR_H[best.b]}${siteText("육합을 함께 이루는 천지합(天地合) 관계입니다.")}</p>
      <p><b>${siteText("잘 맞는 일주:")}</b> ${goods.map(iljuLink).join(', ')}${siteText(" — 배우자 자리끼리 육합을 이룹니다.")}</p>
      <p><b>${siteText("노력이 필요한 일주:")}</b> ${iljuLink(bad)}${siteText(" — 천간이 극하고 지지가 충하는 관계입니다.")}</p>
      <p>${tr("일주 관계는 원국의 일부만 비교합니다. 전체 원국을 비교한 점수도 실제 관계의 성공 확률은 아닙니다. ", "A day-pillar comparison uses only part of the chart. Full-chart scores are not probabilities of relationship success either. ")}<a href="/compatibility/">${siteText("사주 궁합 보기")}</a></p></section>
    <section class="prose"><h2>${y}·${y + 1}${siteText("년의 ")}${hz}${siteText("일")}</h2><p>${hz}${siteText("일은 60일마다 돌아옵니다. ")}${tr("아래는 달력에서 같은 일주가 돌아오는 날짜이며, 자신감이나 사건의 결과가 달라진다는 검증 자료는 아닙니다.", "These dates show the same pillar recurring in the calendar, not evidence of changed confidence or event outcomes.")}</p>${dates}</section>
    ${tool('/manseryeok/', siteText('내 사주 원국에서 일주 확인하기'))}`;
  return articlePage(ctx, {
    path: `/saju/ilju/${iljuSlug(p)}/`, h1: `${name}(${hz}日柱)`, eyebrow: `${siteText("60일주 · ")}${n + 1}${siteText("번째")}`,
    title: `${name}${siteText(" 성격·연애·직업·궁합 총정리")}`,
    description: `${name}(${hz}${siteText(")는 ")}${ILJU_TAG[n].replace(' — ', ', ')}${siteText(". 일지 ")}${siteValue(tg)}${siteText(", 12운성 ")}${siteValue(stage)}${siteText("로 보는 성격과 연애·결혼, 맞는 직업, 궁합이 좋은 일주를 정리했습니다.")}`,
    crumbs: [[siteText('사주 백과'), '/saju/'], [siteText('60일주'), '/saju/ilju/'], [name, `/saju/ilju/${iljuSlug(p)}/`]],
    lead, content, faq, about: { '@type': 'Thing', name: `${name}(${hz}日柱)` },
    after: `<nav class="pager" aria-label="${siteText("이전·다음 일주")}"><a href="/saju/ilju/${iljuSlug(prev)}/">← ${iljuName(prev)}</a><a href="/saju/ilju/">${siteText("60일주 목록")}</a><a href="/saju/ilju/${iljuSlug(next)}/">${iljuName(next)} →</a></nav>`,
  });
}

/* ── 일간 ───────────────────────────── */
export function ilganIndex(ctx) {
  return {
    path: '/saju/ilgan/', title: siteText('일간 10가지 — 갑목부터 계수까지 성격 정리'), section: '/saju/',
    description: siteText('사주에서 나 자신을 뜻하는 일간 10가지(갑목·을목·병화·정화·무토·기토·경금·신금·임수·계수)의 성격, 강점과 약점, 잘 맞는 일간을 정리했습니다.'),
    crumbs: [[siteText('사주 백과'), '/saju/'], [siteText('일간'), '/saju/ilgan/']],
    body: `${hero(siteText('일간 10가지'), siteText('일간(日干)은 태어난 날의 천간으로, 사주 여덟 글자 가운데 "나 자신"을 뜻합니다. 사주 해석은 모두 일간을 기준으로 다른 글자와의 관계를 따지는 것에서 시작합니다.'))}
      <div class="cards">${[...Array(10).keys()].map((s) => `<a class="card link-card" href="/saju/ilgan/${STEM_SLUG[s]}/"><b><span class="hz el-${STEM_EL[s]}">${STEM_H[s]}</span> ${T.dayMaster[s].title}</b><span>${T.dayMaster[s].image}</span></a>`).join('')}</div>`,
  };
}
export function ilganPage(s, ctx) {
  const dm = T.dayMaster[s];
  const e = STEM_EL[s];
  const partner = (s + 5) % 10;
  const iljus = [...Array(60).keys()].map(sexagenary).filter((p) => p.s === s);
  const name = dm.title.replace(/\(.+\)/, '').trim();
  const faq = [
    { q: `${name}${siteText(" 일간의 성격은?")}`, a: dm.summary },
    { q: `${name}${siteText(" 일간과 잘 맞는 일간은?")}`, a: `${siteText("천간합을 이루는 ")}${T.dayMaster[partner].title}${siteText("과 자연스럽게 끌립니다. 또 ")}${elementName((e + 4) % 5)}${siteText(" 기운의 일간은 나를 도와주고, ")}${elementName((e + 1) % 5)}${siteText(" 기운의 일간은 내가 도와주는 관계입니다.")}` },
    { q: `${name}${siteText(" 일간에게 좋은 오행은?")}`, a: `${siteText("일간의 힘이 약하면 ")}${elementName((e + 4) % 5)}${siteText("(인성)과 ")}${elementName(e)}${siteText("(비겁)이, 강하면 ")}${elementName((e + 1) % 5)}${siteText("(식상)·")}${elementName((e + 2) % 5)}${siteText("(재성)·")}${elementName((e + 3) % 5)}${siteText("(관성)이 용신이 됩니다. 정확한 용신은 사주 전체로 판단합니다.")}` },
  ];
  return articlePage(ctx, {
    path: `/saju/ilgan/${STEM_SLUG[s]}/`, h1: `${dm.title}${siteText(" 일간 — ")}${dm.image}`, eyebrow: siteText('일간 10가지'),
    title: `${name}${siteText(" 일간 성격·강점·궁합")}`, description: `${dm.title}${siteText(" 일간은 ")}${dm.image}${siteText("에 비유됩니다. ")}${dm.summary.split('. ')[0]}${siteText(". 강점과 약점, 잘 맞는 일간, ")}${name}${siteText("의 6가지 일주를 정리했습니다.")}`,
    crumbs: [[siteText('사주 백과'), '/saju/'], [siteText('일간'), '/saju/ilgan/'], [name, `/saju/ilgan/${STEM_SLUG[s]}/`]],
    lead: `${dm.title}${siteText("은 천간 열 개 가운데 ")}${s + 1}${siteText("번째로, 오행은 ")}${elementName(e)}(${EL_H[e]}${siteText("), 음양은 ")}${yinYang(s)}${siteText("입니다. ")}${dm.summary}`,
    content: `${factTable([[siteText('오행'), elSpan(e, `${elementName(e)}(${EL_H[e]})`)], [siteText('음양'), yinYang(s)], [siteText('상징'), dm.image], [siteText('천간합'), `${STEM_H[s]}${STEM_H[partner]}${siteText("합 → ")}<a href="/saju/ilgan/${STEM_SLUG[partner]}/">${T.dayMaster[partner].title}</a>`], [siteText('계절'), T.element[e].season], [siteText('방향 · 색'), `${T.element[e].dir} · ${T.element[e].color.join('·')}`]], `${name}${siteText(" 일간 핵심 정리")}`)}
      <section class="prose"><h2>${siteText("타고난 강점")}</h2><ul>${dm.strengths.map((x) => `<li>${siteValue(x)}</li>`).join('')}</ul><h2>${siteText("다듬을 점")}</h2><ul>${dm.weaknesses.map((x) => `<li>${siteValue(x)}</li>`).join('')}</ul><p>${dm.advice}</p></section>
      <section class="prose"><h2>${name}${siteText(" 일간의 일주 6가지")}</h2><ul>${iljus.map((p) => `<li>${iljuLink(p)} — ${esc(ILJU_TAG[[...Array(60).keys()].find((n) => n % 10 === p.s && n % 12 === p.b)])}</li>`).join('')}</ul></section>
      <section class="prose"><h2>${elementName(e)}(${EL_H[e]}${siteText(") 기운 더 알아보기")}</h2><p>${OHAENG[e].persona} <a href="/saju/ohaeng/${EL_SLUG[e]}/">${elementName(e)}${siteText(" 오행 자세히 보기")}</a></p></section>`,
    faq,
  });
}

/* ── 십신 ───────────────────────────── */
export function sipsinIndex(ctx) {
  return {
    path: '/saju/sipsin/', title: siteText('십신 뜻 총정리 — 비견부터 정인까지'), section: '/saju/',
    description: siteText('사주 십신(十神) 10가지의 뜻과 찾는 법, 많을 때와 없을 때의 특징, 육친 관계를 정리했습니다. 비견·겁재·식신·상관·편재·정재·편관·정관·편인·정인.'),
    crumbs: [[siteText('사주 백과'), '/saju/'], [siteText('십신'), '/saju/sipsin/']],
    body: `${hero(siteText('십신 총정리'), siteText('십신(十神)은 일간(나)을 기준으로 다른 글자가 어떤 관계인지를 열 가지로 나눈 것입니다. 오행의 상생·상극과 음양이 같은지에 따라 비견·겁재(같은 오행), 식신·상관(내가 생), 편재·정재(내가 극), 편관·정관(나를 극), 편인·정인(나를 생)으로 나뉩니다.'))}
      <div class="table-wrap"><table class="grid-table"><thead><tr><th scope="col">${siteText("관계")}</th><th scope="col">${siteText("음양 같음")}</th><th scope="col">${siteText("음양 다름")}</th></tr></thead><tbody>
      ${[siteText('나와 같은 오행'), siteText('내가 생하는 오행'), siteText('내가 극하는 오행'), siteText('나를 극하는 오행'), siteText('나를 생하는 오행')].map((r, g) => `<tr><th scope="row">${r}</th><td><a href="/saju/sipsin/${TG_SLUG[g * 2]}/">${siteValue(TG[g * 2])}</a></td><td><a href="/saju/sipsin/${TG_SLUG[g * 2 + 1]}/">${siteValue(TG[g * 2 + 1])}</a></td></tr>`).join('')}</tbody></table></div>
      <div class="cards">${TG.map((t, i) => `<a class="card link-card" href="/saju/sipsin/${TG_SLUG[i]}/"><b>${siteValue(t)}(${TG_H[i]})</b><span>${SIPSIN[t].keywords.join(' · ')}</span></a>`).join('')}</div>`,
  };
}
export function sipsinPage(i, ctx) {
  const t = TG[i];
  const d = SIPSIN[t];
  const rows = [...Array(10).keys()].map((dm) => {
    const st = [...Array(10).keys()].find((s) => tenGod(dm, s) === t);
    const brs = [...Array(12).keys()].filter((b) => tenGod(dm, BR_MAIN[b]) === t);
    return `<tr><th scope="row">${stemDisplay(dm)}${tr('', ' ')}${elementName(STEM_EL[dm])}(${STEM_H[dm]})</th><td>${stemDisplay(st)}(${STEM_H[st]})</td><td>${brs.map((b) => `${branchName(b)}(${BR_H[b]})`).join(', ')}</td></tr>`;
  }).join('');
  const faq = [
    { q: `${displayJosa(t, '이란/란')}${siteText(" 무엇인가요?")}`, a: d.summary },
    { q: `${siteText("사주에 ")}${displayJosa(t, '이/가')}${siteText(" 많으면 어떤가요?")}`, a: d.many },
    { q: `${siteText("사주에 ")}${displayJosa(t, '이/가')}${siteText(" 없으면 어떤가요?")}`, a: d.none },
    { q: `${siteText("운에서 ")}${displayJosa(t, '이/가')}${siteText(" 들어오면?")}`, a: d.luck },
  ];
  return articlePage(ctx, {
    path: `/saju/sipsin/${TG_SLUG[i]}/`, h1: `${siteValue(t)}(${TG_H[i]}${siteText(")의 뜻")}`, eyebrow: siteText('십신'),
    title: `${siteValue(t)}${siteText(" 뜻 — 많을 때·없을 때·운에서 올 때")}`, description: `${isEnglish() ? `${d.summary} Learn how to identify ${siteValue(t)} and interpret its prominence, absence and cycle themes.` : `${d.summary} ${displayJosa(t, '이/가')}${siteText(" 많을 때와 없을 때, 운에서 들어올 때의 의미와 일간별 ")}${siteValue(t)}${siteText(" 찾는 법을 정리했습니다.")}`}`,
    crumbs: [[siteText('사주 백과'), '/saju/'], [siteText('십신'), '/saju/sipsin/'], [siteValue(t), `/saju/sipsin/${TG_SLUG[i]}/`]],
    lead: d.summary,
    content: `${factTable([[siteText('정의'), d.formula], [siteText('육친 (남성)'), d.family.M], [siteText('육친 (여성)'), d.family.F], [siteText('키워드'), d.keywords.join(' · ')], [siteText('잘 맞는 분야'), d.career]], `${siteValue(t)}${siteText(" 핵심 정리")}`)}
      <section class="prose"><h2>${displayJosa(t, '이/가')}${siteText(" 많을 때")}</h2><p>${d.many}</p><h2>${displayJosa(t, '이/가')}${siteText(" 없을 때")}</h2><p>${d.none}</p><h2>${siteText("운에서 ")}${displayJosa(t, '이/가')}${siteText(" 들어올 때")}</h2><p>${d.luck}</p><p>${T.tgMeaning[t]}${siteText("이라는 점을 기억하면 해석이 쉬워집니다.")}</p></section>
      <section class="prose"><h2>${siteText("일간별 ")}${siteValue(t)}${siteText(" 찾기")}</h2><p>${siteText("아래 표는 일간마다 ")}${displayJosa(t, '이/가')}${siteText(" 되는 천간과 지지(지장간 정기 기준)입니다.")}</p><div class="table-wrap"><table class="grid-table"><thead><tr><th scope="col">${siteText("일간")}</th><th scope="col">${siteText("천간")}</th><th scope="col">${siteText("지지")}</th></tr></thead><tbody>${rows}</tbody></table></div></section>
      <nav class="chips">${TG.map((x, j) => `<a class="chip${j === i ? ' on' : ''}" href="/saju/sipsin/${TG_SLUG[j]}/">${siteValue(x)}</a>`).join('')}</nav>`,
    faq,
  });
}

/* ── 오행 ───────────────────────────── */
export function ohaengIndex(ctx) {
  return {
    path: '/saju/ohaeng/', title: siteText('오행 상생상극 — 목화토금수 쉽게 이해하기'), section: '/saju/',
    description: siteText('오행(목·화·토·금·수)의 성격과 상생·상극 관계, 오행이 부족하거나 넘칠 때의 특징과 보완 방법을 정리했습니다.'),
    crumbs: [[siteText('사주 백과'), '/saju/'], [siteText('오행'), '/saju/ohaeng/']],
    body: `${hero(siteText('오행 상생상극'), siteText('오행(五行)은 목(木)·화(火)·토(土)·금(金)·수(水) 다섯 기운입니다. 목→화→토→금→수→목 순서로 서로 살리는 것을 상생, 목→토→수→화→금→목 순서로 서로 누르는 것을 상극이라 합니다. 사주는 이 다섯 기운의 균형으로 기질과 운을 읽습니다.'))}
      <div class="table-wrap"><table class="grid-table"><thead><tr><th scope="col">${siteText("오행")}</th><th scope="col">${siteText("생해 주는 것")}</th><th scope="col">${siteText("극하는 것")}</th><th scope="col">${siteText("천간")}</th><th scope="col">${siteText("지지")}</th></tr></thead><tbody>${[0, 1, 2, 3, 4].map((e) => `<tr><th scope="row"><a href="/saju/ohaeng/${EL_SLUG[e]}/">${elSpan(e, `${elementName(e)}(${EL_H[e]})`)}</a></th><td>${elementName((e + 1) % 5)}</td><td>${elementName((e + 2) % 5)}</td><td>${OHAENG[e].stems}</td><td>${OHAENG[e].branches}</td></tr>`).join('')}</tbody></table></div>
      <div class="cards">${[0, 1, 2, 3, 4].map((e) => `<a class="card link-card" href="/saju/ohaeng/${EL_SLUG[e]}/"><b>${elSpan(e, `${elementName(e)}(${EL_H[e]})`)}</b><span>${T.element[e].nature}</span></a>`).join('')}</div>`,
  };
}
export function ohaengPage(e, ctx) {
  const E = T.element[e];
  const O = OHAENG[e];
  const nm = `${elementName(e)}(${EL_H[e]})`;
  const faq = [
    { q: `${siteText("사주에 ")}${elementName(e)}${siteText(" 기운이 많으면?")}`, a: E.excess },
    { q: `${siteText("사주에 ")}${elementName(e)}${siteText(" 기운이 없거나 부족하면?")}`, a: E.lack },
    { q: `${elementName(e)}${siteText(" 기운을 보충하는 방법은?")}`, a: `${O.supplement}${siteText(" 등이 ")}${elementName(e)}${siteText(" 기운을 북돋습니다. 행운의 색은 ")}${E.color.join('·')}${siteText(", 숫자는 ")}${E.number.join('·')}${siteText(", 방향은 ")}${E.dir}${siteText("입니다.")}` },
  ];
  return articlePage(ctx, {
    path: `/saju/ohaeng/${EL_SLUG[e]}/`, h1: `${nm}${siteText(" 오행의 성격과 보완법")}`, eyebrow: siteText('오행'),
    title: `${elementName(e)}${siteText(" 오행 성격·많을 때·부족할 때 보완법")}`, description: `${nm}${siteText(" 오행은 ")}${E.nature}${siteText("을 뜻합니다. ")}${elementName(e)}${siteText(" 기운이 많을 때와 부족할 때의 특징, 건강, 행운의 색과 숫자, 보완 방법을 정리했습니다.")}`,
    crumbs: [[siteText('사주 백과'), '/saju/'], [siteText('오행'), '/saju/ohaeng/'], [`${elementName(e)}(${EL_H[e]})`, `/saju/ohaeng/${EL_SLUG[e]}/`]],
    lead: tr(`${nm}${siteText(" 오행은 ")}${E.season}${siteText("의 기운으로 ")}${E.nature}${siteText("을 뜻합니다. ")}${O.persona}`, `${nm} is associated with ${E.season} and symbolizes ${E.nature.toLowerCase()}. ${O.persona}`),
    content: `${factTable([[siteText('상징'), E.nature], [siteText('계절'), E.season], [siteText('방향'), E.dir], [siteText('색'), E.color.join(' · ')], [siteText('숫자'), E.number.join(' · ')], [tr('신체 대응(전통 상징)', 'Body association (traditional symbolism)'), E.organ], [siteText('천간'), O.stems], [siteText('지지'), O.branches], [siteText('상생'), tr(`${elementName((e + 4) % 5)}${siteText("이 ")}${elementName(e)}${siteText("을 생하고, ")}${elementName(e)}${siteText("은 ")}${elementName((e + 1) % 5)}${siteText("을 생합니다")}`, `${elementName((e + 4) % 5)} generates ${elementName(e)}; ${elementName(e)} generates ${elementName((e + 1) % 5)}`)], [siteText('상극'), tr(`${elementName((e + 3) % 5)}${siteText("이 ")}${elementName(e)}${siteText("을 극하고, ")}${elementName(e)}${siteText("은 ")}${elementName((e + 2) % 5)}${siteText("을 극합니다")}`, `${elementName((e + 3) % 5)} controls ${elementName(e)}; ${elementName(e)} controls ${elementName((e + 2) % 5)}`)]], `${elementName(e)}${siteText(" 오행 핵심 정리")}`)}
      <section class="prose"><h2>${elementName(e)}${siteText(" 기운이 많을 때")}</h2><p>${E.excess}</p><h2>${elementName(e)}${siteText(" 기운이 부족할 때")}</h2><p>${E.lack}</p><h2>${siteText("보완하는 방법")}</h2><p>${O.supplement}</p><p class="note">${tr("색·숫자·신체 대응은 전통적인 상징입니다. 특정 색이나 물건이 운을 바꾸거나 질환을 예방한다는 근거로 사용하지 않습니다.", "Colors, numbers and body associations are traditional symbols. They are not evidence that a color or object changes luck or prevents illness.")}</p><h2>${elementName(e)}${siteText(" 기운과 어울리는 일")}</h2><p>${T.elementIndustry[e]}</p></section>`,
    faq,
  });
}

/* ── 신살 ───────────────────────────── */
function sinsalTable(slug) {
  const groups = [siteText('신자진(申子辰)'), siteText('사유축(巳酉丑)'), siteText('인오술(寅午戌)'), siteText('해묘미(亥卯未)')];
  const byGroup = (tbl) => `<div class="table-wrap"><table class="grid-table"><thead><tr><th scope="col">${siteText("년지·일지")}</th><th scope="col">${siteText("해당 지지")}</th></tr></thead><tbody>${groups.map((g, i) => `<tr><th scope="row">${g}</th><td>${branchName(tbl[i])}(${BR_H[tbl[i]]})</td></tr>`).join('')}</tbody></table></div>`;
  const byStem = (fn) => `<div class="table-wrap"><table class="grid-table"><thead><tr><th scope="col">${siteText("일간")}</th><th scope="col">${siteText("해당 지지")}</th></tr></thead><tbody>${[...Array(10).keys()].map((s) => `<tr><th scope="row">${stemDisplay(s)}(${STEM_H[s]})</th><td>${fn(s)}</td></tr>`).join('')}</tbody></table></div>`;
  if (slug === 'dohwa') return byGroup(DOHWA);
  if (slug === 'yeokma') return byGroup(YEOKMA);
  if (slug === 'hwagae') return byGroup(HWAGAE);
  if (slug === 'cheoneul-gwiin') return byStem((s) => GWIIN[s].map((b) => `${branchName(b)}(${BR_H[b]})`).join(', '));
  if (slug === 'munchang-gwiin') return byStem((s) => `${branchName(MUNCHANG[s])}(${BR_H[MUNCHANG[s]]})`);
  if (slug === 'yangin') return byStem((s) => (YANGIN[s] >= 0 ? `${branchName(YANGIN[s])}(${BR_H[YANGIN[s]]})` : siteText('음간은 보지 않음')));
  if (slug === 'gwegang') return `<p>${GWEGANG.map((h) => { const p = { s: STEM_H.indexOf(h[0]), b: BR_H.indexOf(h[1]) }; return iljuLink(p); }).join(', ')}</p>`;
  if (slug === 'baekho') return `<p>${BAEKHO.map((h) => { const p = { s: STEM_H.indexOf(h[0]), b: BR_H.indexOf(h[1]) }; return iljuLink(p); }).join(', ')}</p>`;
  if (slug === 'hongran') return `<div class="table-wrap"><table class="grid-table"><thead><tr><th scope="col">${siteText("띠(년지)")}</th><th scope="col">${siteText("홍란")}</th><th scope="col">${siteText("천희")}</th></tr></thead><tbody>${[...Array(12).keys()].map((b) => `<tr><th scope="row">${animalName(b)}${siteText("띠 ")}${branchName(b)}(${BR_H[b]})</th><td>${branchName(hongran(b))}(${BR_H[hongran(b)]})</td><td>${branchName(cheonhui(b))}(${BR_H[cheonhui(b)]})</td></tr>`).join('')}</tbody></table></div>`;
  if (slug === 'wonjin') return siteText('<p>자(子)↔미(未), 축(丑)↔오(午), 인(寅)↔유(酉), 묘(卯)↔신(申), 진(辰)↔해(亥), 사(巳)↔술(戌)</p>');
  return '';
}
export function sinsalIndex(ctx) {
  return {
    path: '/saju/sinsal/', title: siteText('신살 총정리 — 도화살·역마살·화개살·천을귀인'), section: '/saju/',
    description: siteText('사주의 대표 신살 10가지(도화살, 역마살, 화개살, 천을귀인, 문창귀인, 양인살, 괴강살, 백호살, 홍란·천희, 원진살)의 뜻과 찾는 법, 현대적 해석을 정리했습니다.'),
    crumbs: [[siteText('사주 백과'), '/saju/'], [siteText('신살'), '/saju/sinsal/']],
    body: `${hero(siteText('신살 총정리'), siteText('신살(神煞)은 사주의 특정 글자 조합에 붙이는 별칭으로, 길한 것을 길신(吉神), 조심할 것을 흉살(凶煞)이라 부릅니다. 신살은 원국의 오행·십신 해석을 보충하는 양념 같은 개념이며, 같은 신살도 현대에는 장점으로 해석되는 경우가 많습니다.'))}
      <div class="cards">${SINSAL.map((s) => `<a class="card link-card" href="/saju/sinsal/${s.slug}/"><b>${siteValue(s.name)}(${s.hanja})</b><span>${esc(s.summary.split('. ')[0])}.</span></a>`).join('')}</div>`,
  };
}
export function sinsalPage(i, ctx) {
  const s = SINSAL[i];
  const faq = [
    { q: `${displayJosa(s.name, '이란/란')}${siteText(" 무엇인가요?")}`, a: s.summary },
    { q: `${siteValue(s.name)}${siteText(" 찾는 법은?")}`, a: s.how },
    { q: `${displayJosa(s.name, '이/가')}${siteText(" 있으면 나쁜가요?")}`, a: `${s.meaning} ${s.caution}` },
    { q: `${siteText("운에서 ")}${displayJosa(s.name, '이/가')}${siteText(" 들어오면?")}`, a: s.luck },
  ];
  return articlePage(ctx, {
    path: `/saju/sinsal/${s.slug}/`, h1: `${siteValue(s.name)}(${s.hanja})`, eyebrow: siteText('신살'),
    title: `${siteValue(s.name)}${siteText(" 뜻과 찾는 법, 현대적 해석")}`, description: `${s.summary}${siteText(" 찾는 법과 의미, 운에서 들어올 때와 주의할 점을 정리했습니다.")}`,
    crumbs: [[siteText('사주 백과'), '/saju/'], [siteText('신살'), '/saju/sinsal/'], [s.name, `/saju/sinsal/${s.slug}/`]],
    lead: s.summary,
    content: `<section class="prose"><h2>${siteValue(s.name)}${siteText(" 찾는 법")}</h2><p>${s.how}</p>${sinsalTable(s.slug)}<h2>${siteText("의미와 현대적 해석")}</h2><p>${s.meaning}</p><h2>${siteText("운에서 들어올 때")}</h2><p>${s.luck}</p><h2>${siteText("주의할 점")}</h2><p>${s.caution}</p></section>${tool('/manseryeok/', siteText('내 사주에 있는 신살 확인하기'))}`,
    faq,
  });
}

/* ── 12운성 ───────────────────────────── */
export function unseong(ctx) {
  const head = `<tr><th scope="col">${siteText("일간＼지지")}</th>${BR_H.map((b, i) => `<th scope="col">${branchName(i)}(${b})</th>`).join('')}</tr>`;
  const rows = [...Array(10).keys()].map((s) => `<tr><th scope="row">${stemDisplay(s)}(${STEM_H[s]})</th>${[...Array(12).keys()].map((b) => `<td>${siteValue(stageOf(s, b))}</td>`).join('')}</tr>`).join('');
  const faq = [
    { q: siteText('12운성이란 무엇인가요?'), a: siteText('12운성(十二運星)은 일간의 기운이 각 지지에서 얼마나 강한지를 사람의 일생에 빗대어 장생·목욕·관대·건록·제왕·쇠·병·사·묘·절·태·양의 12단계로 나눈 것입니다.') },
    { q: siteText('12운성은 어떻게 찾나요?'), a: siteText('양간(갑·병·무·경·임)은 장생 자리에서 순서대로 나아가고, 음간(을·정·기·신·계)은 장생 자리에서 거꾸로 돌아갑니다. 아래 표에서 일간과 지지가 만나는 칸을 보면 됩니다.') },
    { q: siteText('제왕이 가장 좋은 운성인가요?'), a: siteText('제왕은 기운이 가장 강한 단계일 뿐, 좋고 나쁨은 사주 전체의 균형에 달려 있습니다. 신약한 사주에게는 강한 운성이, 신강한 사주에게는 오히려 약한 운성이 도움이 되기도 합니다.') },
  ];
  return articlePage(ctx, {
    path: '/saju/12unseong/', h1: siteText('12운성 표와 뜻'), eyebrow: siteText('사주 백과'), title: siteText('12운성 표 — 장생부터 양까지 뜻과 찾는 법'),
    description: siteText('12운성(장생·목욕·관대·건록·제왕·쇠·병·사·묘·절·태·양)의 뜻과 일간별 12운성 조견표를 정리했습니다.'),
    crumbs: [[siteText('사주 백과'), '/saju/'], [siteText('12운성'), '/saju/12unseong/']],
    lead: faq[0].a,
    content: `<section class="prose"><h2>${siteText("12단계의 뜻")}</h2><dl class="dl">${STAGES.map((st, i) => `<dt>${siteValue(st)}(${STAGES_H[i]})</dt><dd>${STAGE_INFO[st]}</dd>`).join('')}</dl></section>
      <section class="prose"><h2>${siteText("12운성 조견표")}</h2><div class="table-wrap"><table class="grid-table small"><thead>${head}</thead><tbody>${rows}</tbody></table></div></section>`,
    faq,
  });
}

/* ── 용어 사전 ───────────────────────────── */
export function glossary(ctx) {
  const id = (t) => `t-${encodeURIComponent(withLanguage('ko', () => t.term))}`;
  return {
    ...articlePage(ctx, {
      path: '/saju/glossary/', h1: siteText('사주 용어 사전'), eyebrow: siteText('사주 백과'), title: siteText('사주 용어 사전 — 만세력·용신·대운 등 30개 핵심 용어'),
      description: siteText('사주팔자, 만세력, 일간, 십신, 지장간, 용신, 대운, 세운, 절기, 야자시, 합충형, 삼재 등 사주를 볼 때 꼭 알아야 할 용어 30개를 쉽게 풀었습니다.'),
      crumbs: [[siteText('사주 백과'), '/saju/'], [siteText('용어 사전'), '/saju/glossary/']],
      lead: siteText('사주 해석에 자주 나오는 용어를 한 문장 정의로 정리했습니다. 각 용어를 누르면 더 자세한 설명 페이지로 이동합니다.'),
      content: `<dl class="glossary">${GLOSSARY.map((g) => `<div id="${id(g)}"><dt>${g.term} <span class="muted">${g.hanja}</span></dt><dd>${g.def}${g.link ? ` <a href="${g.link}">${siteText("자세히")}</a>` : ''}</dd></div>`).join('')}</dl>`,
      ld: [{ '@type': 'DefinedTermSet', '@id': `${ctx.site}/saju/glossary/#terms`, name: siteText('사주 용어 사전'), inLanguage: siteText('ko-KR'), hasDefinedTerm: GLOSSARY.map((g) => ({ '@type': 'DefinedTerm', name: g.term, alternateName: g.hanja, description: g.def, url: `${ctx.site}/saju/glossary/#${id(g)}`, inDefinedTermSet: `${ctx.site}/saju/glossary/#terms` })) }],
    }),
  };
}

/* ── 사주 보는 법 ───────────────────────────── */
export function guide(ctx) {
  return articlePage(ctx, {
    path: '/saju/guide/', h1: siteText('사주 보는 법 7단계'), eyebrow: siteText('사주 백과'), title: siteText('사주 보는 법 — 원국 세우기부터 대운 읽기까지 7단계'),
    description: siteText('처음 사주를 보는 사람을 위한 7단계 안내입니다. 생년월일시 확인, 만세력으로 원국 세우기, 일간과 오행, 십신, 용신, 대운과 세운 읽는 법을 차례로 설명합니다.'),
    crumbs: [[siteText('사주 백과'), '/saju/'], [siteText('사주 보는 법'), '/saju/guide/']],
    lead: siteText('사주는 생년월일시로 네 기둥을 세우고, 일간을 기준으로 오행의 균형과 십신의 관계를 읽은 뒤, 대운과 세운이 원국에 어떤 영향을 주는지 보는 순서로 해석합니다.'),
    content: `<ol class="steps">${GUIDE_STEPS.map((s) => `<li><h2>${esc(s.title)}</h2><p>${esc(s.text)}</p></li>`).join('')}</ol>${tool('/manseryeok/', siteText('만세력으로 내 원국 세우기'))}`,
    ld: [{ '@type': 'HowTo', name: siteText('사주 보는 법'), inLanguage: siteText('ko-KR'), step: GUIDE_STEPS.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: s.title, text: s.text })) }],
    faq: [{ q: siteText('사주를 혼자 공부할 수 있나요?'), a: `${siteText("오행·십신·합충의 기본 규칙만 익히면 원국의 큰 그림은 혼자서도 읽을 수 있습니다. ")}${SITE.name}${siteText("의 만세력과 사주 백과로 내 원국을 보며 하나씩 대입해 보세요.")}` }],
  });
}

/* ── 60일주 랭킹 ───────────────────────────── */
export function iljuRanking(ctx) {
  const rows = RANK.ilju.map((x, n) => ({ n, p: sexagenary(n), mean: x.mean })).sort((a, b) => b.mean - a.mean || a.n - b.n);
  const avg = RANK.four.avgTotal;
  const top = rows.slice(0, 3), bottom = rows.slice(-3);
  const why = (r) => {
    const p = r.p, hz = pillarH(p), out = [];
    if (GWIIN[p.s].includes(p.b)) out.push(siteText('일지에 천을귀인'));
    if (MUNCHANG[p.s] === p.b) out.push(siteText('일지에 문창귀인'));
    if (GWEGANG.includes(hz)) out.push(siteText('괴강의 리더십'));
    if (YANGIN[p.s] === p.b) out.push(siteText('양인의 날카로움'));
    if (BAEKHO.includes(hz)) out.push(siteText('백호의 강한 기운'));
    if (STEM_EL[p.s] === BR_EL[p.b]) out.push(siteText('간여지동(한 오행에 치우침)'));
    const rel = elRel(STEM_EL[p.s], BR_EL[p.b]);
    if (rel === 4) out.push(siteText('지지가 일간을 생함'));
    if (rel === 3) out.push(siteText('지지가 일간을 극함'));
    return out.join(' · ') || siteText('두드러진 특징 없음');
  };
  const faq = [
    { q: siteText('가장 좋은 일주는 무엇인가요?'), a: `${siteText("모든 사주를 같은 규칙으로 계산한 평균 점수로는 ")}${top.map((r) => `${iljuName(r.p)}(${r.mean}${siteText("점)")}`).join(', ')}${siteText(" 순으로 높습니다. 일지에 천을귀인이 있거나 지지가 일간을 생해 주는 일주가 상위권에 많습니다.")}` },
    { q: siteText('점수가 낮은 일주는 나쁜 일주인가요?'), a: `${siteText("아닙니다. ")}${bottom.map((r) => iljuName(r.p)).join('·')}${siteText("처럼 평균이 낮은 일주는 기운이 한쪽으로 강하게 모인 경우가 많아 균형 점수에서 손해를 볼 뿐, 그만큼 개성과 추진력이 강합니다. 실제 삶은 나머지 기둥과 대운에 따라 크게 달라집니다.")}` },
    { q: siteText('일주 랭킹은 어떻게 계산했나요?'), a: `${siteText("가능한 모든 사주 518,400가지를 사주 랭킹과 같은 규칙(오행 균형·일간 강약·용신·길신·합·충형)으로 점수화한 뒤, 같은 일주를 가진 8,640가지 사주의 평균을 냈습니다. 전체 평균은 ")}${avg}${siteText("점입니다.")}` },
  ];
  return articlePage(ctx, {
    path: '/saju/ilju-ranking/', h1: siteText('60일주 랭킹'), eyebrow: siteText('재미로 보는 사주'), title: siteText('60일주 랭킹 — 평균 사주 점수가 가장 높은 일주는?'),
    description: `${siteText("60갑자 일주별 평균 사주 점수 순위. 1위 ")}${iljuName(top[0].p)}(${top[0].mean}${siteText("점)부터 60위까지, 518,400가지 사주를 같은 규칙으로 계산한 결과와 이유를 정리했습니다.")}`,
    crumbs: [[siteText('사주 백과'), '/saju/'], [siteText('60일주 랭킹'), '/saju/ilju-ranking/']],
    lead: `${siteText("60일주 랭킹은 가능한 모든 사주 518,400가지를 같은 규칙으로 점수화한 뒤 일주별 평균을 비교한 순위입니다. 1위는 ")}${iljuName(top[0].p)}(${top[0].mean}${siteText("점), 2위는 ")}${iljuName(top[1].p)}(${top[1].mean}${siteText("점), 3위는 ")}${iljuName(top[2].p)}(${top[2].mean}${siteText("점)이며 전체 평균은 ")}${avg}${siteText("점입니다.")}`,
    content: `<div class="table-wrap"><table class="grid-table"><thead><tr><th scope="col">${siteText("순위")}</th><th scope="col">${siteText("일주")}</th><th scope="col">${siteText("평균 점수")}</th><th scope="col">${siteText("특징")}</th></tr></thead><tbody>${rows.map((r, i) => `<tr><td class="num">${i + 1}</td><th scope="row"><a href="/saju/ilju/${iljuSlug(r.p)}/"><span class="hz el-${STEM_EL[r.p.s]}">${pillarH(r.p)}</span> ${iljuName(r.p)}</a></th><td class="num">${r.mean}</td><td>${why(r)}</td></tr>`).join('')}</tbody></table></div>
      <section class="prose"><h2>${siteText("점수 계산 기준")}</h2><p>${siteText("오행 균형(25점), 일간 강약의 중화(20점), 용신·희신의 힘(15점), 천을귀인·문창·식신 등 길신(15점), 지지의 합(15점)을 더하고 충·형·원진을 뺍니다. 일주 하나만으로는 사주가 정해지지 않으므로, 같은 일주의 모든 조합을 평균했습니다.")}</p>
      <p class="cta"><a class="btn" href="/saju-ranking/">${siteText("내 사주는 518,400가지 중 몇 위?")}</a></p></section>`,
    faq,
  });
}

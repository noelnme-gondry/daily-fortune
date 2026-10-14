// 공유 카드 착지 페이지 (/share/?k=…). 허용된 값만 받아 카드로 보여 주고 "나도 해 보기"로 연결한다.
// 생년월일시는 받지 않으며, 검색 색인에서 제외한다.
import T from '../../content/text.js';
import { BRAND } from '../../content/brand.js';
import { ILJU_TAG } from '../../content/knowledge.js';
import { CLASSES, ARCS } from '../../content/story.js';
import { JOB_BY_ID } from '../../content/character-jobs.js';
import { READINGS } from '../../content/tojeong-readings.js';
import { tojeongHeadline } from '../../content/tojeong.js';
import { TOJEONG_RANGE } from '../../domain/tojeong.js';
import { TG, sexagenary, iljuSlug, pillarKo, pillarH, COMPAT_HEADLINES, TIERS, parseISO } from '../../engine/index.js';
import { SHARE_KINDS, cleanName, ADJ_FLAT } from '../share-codec.js';
import { esc } from '../util.js';

const UNITS = { today: '날', tomorrow: '날', week: '한 주', month: '한 달', year: '한 해' };
const headlinesFor = (unit) => new Set([...Object.values(T.headTop), ...Object.values(T.headLow)].map((h) => `${h} ${unit}`));
const ILJU = new Map([...Array(60).keys()].map((n) => { const p = sexagenary(n); return [iljuSlug(p), { n, p }]; }));
const int = (v, lo, hi) => { const x = Number(v); return Number.isFinite(x) && x >= lo && x <= hi ? x : null; };

function storyChar(code) {
  const current = /^v2\.(\d)\.([a-z]+)$/.exec(code || '');
  if (current) {
    const job = JOB_BY_ID[current[2]], adj = ADJ_FLAT[+current[1]];
    return job && adj ? `${adj} ${job.name}` : null;
  }
  const m = /^(\d)-(\d)$/.exec(code || '');
  if (!m || !ADJ_FLAT[+m[1]] || !TG[+m[2]]) return null;
  return `${ADJ_FLAT[+m[1]]} ${CLASSES[TG[+m[2]]].name}`;
}

export function parseShare(q) {
  const k = q.get('k');
  const kind = SHARE_KINDS[k];
  if (!kind) return null;
  const name = cleanName(q.get('n'));
  const who = name ? `${name}님` : '나';
  const card = { kind: k, tool: kind.tool, label: kind.label, name, lines: [] };
  if (UNITS[k]) {
    const s = int(q.get('s'), 0, 100), h = q.get('h');
    if (s === null || !headlinesFor(UNITS[k]).has(h)) return null;
    const d = q.get('d') && /^\d{4}-\d{2}-\d{2}$/.test(q.get('d')) ? parseISO(q.get('d')) : null;
    const y = int(q.get('y'), 1950, 2100);
    if (k === 'year' && y) card.tool = `/year/${y}/`;
    card.kicker = `${who}의 ${k === 'year' && y ? `${y}년 운세` : d && (k === 'today' || k === 'tomorrow') ? `${d.m}월 ${d.d}일 운세` : kind.label}`;
    card.big = `${s}점`; card.title = h;
  } else if (k === 'life' || k === 'manse') {
    const il = ILJU.get(q.get('i'));
    if (!il) return null;
    card.kicker = `${who}의 일주`; card.big = `${pillarKo(il.p)}일주`; card.title = ILJU_TAG[il.n]; card.hz = pillarH(il.p);
    card.more = [`/saju/ilju/${iljuSlug(il.p)}/`, `${pillarKo(il.p)}일주 풀이 보기`];
  } else if (k === 'compat') {
    const s = int(q.get('s'), 0, 100), h = q.get('h'), n2 = cleanName(q.get('n2'));
    if (s === null || !COMPAT_HEADLINES.includes(h)) return null;
    card.kicker = `${name || '나'} × ${n2 || '상대'} 궁합`; card.big = `${s}점`; card.title = h;
  } else if (k === 'story') {
    const arc = ARCS[q.get('a')];
    const modern = q.has('c');
    const chars = modern ? q.get('c').split(',').map(storyChar) : ['c1', 'c2', 'c3'].map((x) => storyChar(q.get(x)));
    if (modern && chars.length !== 9) return null;
    if (!arc || chars.some((c) => !c)) return null;
    card.kicker = `사주로 본 ${who}의 인생은`; card.big = arc.name; card.title = arc.desc.split('. ')[0] + '.';
    card.lines = modern ? chars.map((c, i) => [`${i * 10}~${i * 10 + 9}세`, c]) : [['초반', chars[0]], ['중반', chars[1]], ['후반', chars[2]]];
  } else if (k === 'rank') {
    const s = int(q.get('s'), 0, 100), r = int(q.get('r'), 1, 518400), w = q.get('w') === '0' ? 0 : 1;
    const tier = TIERS.find((t) => t[1] === q.get('t'));
    if (s === null || r === null || !tier) return null;
    const of = w ? 518400 : 43200;
    if (r > of) return null;
    const pct = Math.max(0.01, Math.round((r / of) * 10000) / 100);
    card.kicker = `${who}의 사주 랭킹`; card.big = `${r.toLocaleString('ko-KR')}위`; card.title = `${tier[2]} · 상위 ${pct}%`;
    card.lines = [['사주 점수', `${s}점`], ['전체', `${of.toLocaleString('ko-KR')}가지 사주 중`]];
  } else if (k === 'tojeong') {
    const y = int(q.get('y'), TOJEONG_RANGE.min, TOJEONG_RANGE.max), g = q.get('g');
    if (y === null || !/^[1-8][1-6][1-3]$/.test(g || '') || !READINGS[g]) return null;
    card.kicker = `${who}의 ${y}년 토정비결`; card.big = `${g}괘`; card.title = tojeongHeadline(READINGS[g]);
    card.lines = [['상괘 · 중괘 · 하괘', g.split('').join(' · ')]];
    card.foot = `${BRAND.name} · 같은 생년월일이면 언제나 같은 괘`;
  }
  return card;
}

const OG = { story: '/og-story.png', rank: '/og-rank.png', compat: '/og-compat.png' };

export function sharePage(q, ctx) {
  const card = q ? parseShare(q) : null;
  const generic = !card;
  const c = card || { kind: 'today', tool: '/', label: BRAND.name, kicker: '친구가 보낸 운세 결과', big: BRAND.name, title: '생년월일시로 보는 나의 사주 운세', lines: [] };
  const title = generic ? '공유된 운세 결과' : `${c.kicker} — ${c.big}`;
  const desc = generic ? '친구가 공유한 사주 운세 결과입니다. 내 생년월일시로 나의 운세도 확인해 보세요.' : `${c.title} · 나의 결과도 확인해 보세요. 생년월일시로 보는 무료 사주 운세, ${BRAND.name}.`;
  const others = [['/life-story/', '사주로 본 내 인생은?'], ['/saju-ranking/', '내 사주 랭킹'], ['/today/', '오늘의 운세'], ['/tojeong/', '무료 토정비결'], ['/compatibility/', '사주 궁합']].filter(([h]) => h !== c.tool).slice(0, 4);
  return {
    path: '/share/', canonicalPath: c.tool, title, ogTitle: title, description: desc, noindex: true, noAds: true, crumbs: [], share: false,
    gaTitle: `공유 카드 — ${SHARE_KINDS[c.kind] ? SHARE_KINDS[c.kind].label : '일반'}`, ogImage: OG[c.kind] || '/og-default.png',
    body: `<section class="share-land">
      <article class="share-card card" aria-label="공유된 결과">
        <img class="brand-logo" src="${BRAND.logo}" alt="" width="48" height="48">
        <p class="sc-kicker">${esc(c.kicker)}</p>
        <p class="sc-big">${esc(c.big)}${c.hz ? ` <span class="hz">${esc(c.hz)}</span>` : ''}</p>
        <h1 class="sc-title">${esc(c.title)}</h1>
        ${c.lines.length ? `<dl class="sc-lines">${c.lines.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>` : ''}
        <p class="sc-foot">${esc(c.foot || `${BRAND.name} · 같은 생년월일시면 언제나 같은 결과`)}</p>
      </article>
      <div class="share-cta">
        <a class="btn" href="${c.tool}" data-ga-cta="share_landing">${generic ? '내 운세 보기' : `나의 ${esc(c.label)} 보기`}</a>
        ${c.more ? `<a class="btn ghost" href="${c.more[0]}">${esc(c.more[1])}</a>` : ''}
        <p class="muted">생년월일시만 넣으면 바로 계산됩니다. 입력한 정보는 서버로 전송되지 않습니다.</p>
        <div class="cards">${others.map(([h, t]) => `<a class="card link-card" href="${h}"><b>${t}</b><span>무료로 바로 확인</span></a>`).join('')}</div>
      </div>
    </section>`,
  };
}

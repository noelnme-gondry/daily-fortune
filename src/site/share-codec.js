// 공유 카드 주소 만들기·읽기. 생년월일시는 담지 않고 결과 요약(점수·제목·이름)만 담는다.
import { bilingual, withLanguage, isEnglish } from '../i18n/runtime.js';
import { ADJ } from '../content/story.js';

const adjectives = () => [...ADJ.high, ...ADJ.good, ...ADJ.mid, ...ADJ.low];
export const ADJ_FLAT = bilingual(withLanguage('ko', adjectives), withLanguage('en', adjectives));
// 공유 캐릭터 코드: v2부터 직업 영구 ID를 담아 도감 확장 뒤에도 같은 캐릭터를 복원한다.
// (이전 형식 "형용사번호-십신번호"는 공유 페이지에서 읽기만 한다)
export const characterCode = (adj, jobId) => `v2.${ADJ_FLAT.indexOf(adj)}.${jobId}`;
export const SHARE_KINDS = bilingual({
  today: { tool: '/today/', label: '오늘의 운세' },
  tomorrow: { tool: '/tomorrow/', label: '내일의 운세' },
  week: { tool: '/week/', label: '이번 주 운세' },
  month: { tool: '/month/', label: '이달의 운세' },
  year: { tool: '/year/', label: '신년운세' },
  life: { tool: '/lifetime/', label: '평생 운세' },
  compat: { tool: '/compatibility/', label: '사주 궁합' },
  story: { tool: '/life-story/', label: '사주로 본 내 인생' },
  rank: { tool: '/saju-ranking/', label: '사주 랭킹' },
  manse: { tool: '/manseryeok/', label: '만세력' },
  tojeong: { tool: '/tojeong/', label: '토정비결' },
}, {
 today: { label: 'Daily fortune' }, tomorrow: { label: 'Tomorrow’s fortune' }, week: { label: 'Weekly fortune' }, month: { label: 'Monthly fortune' }, year: { label: 'Yearly fortune' }, life: { label: 'Lifetime fortune' }, compat: { label: 'Saju compatibility' }, story: { label: 'My saju life story' }, rank: { label: 'Saju ranking' }, manse: { label: 'Four Pillars calendar' }, tojeong: { label: 'Tojeong fortune' },
});
const NAME_RE = /[^가-힣a-zA-Z0-9 ]/g;
export const cleanName = (s) => String(s || '').replace(NAME_RE, '').trim().slice(0, 10);

export function shareUrl(origin, data) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(data)) if (v !== undefined && v !== null && v !== '') q.set(k, String(v));
  return `${origin}${isEnglish() ? '/en' : ''}/share/?${q.toString()}`;
}

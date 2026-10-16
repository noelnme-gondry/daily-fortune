import { isEnglish, tr } from './runtime.js';
import { STEM_K, STEM_SLUG, BR_K, BR_SLUG, EL_K, ANIMAL, ANIMAL_SLUG } from '../engine/core.js';

export const EN_TERMS = {
  '오늘': 'Today', '내일': 'Tomorrow', '이번 주': 'This week', '이번 달': 'This month',
  '평생': 'Lifetime', '인생 캐릭터': 'Life character', '사주 랭킹': 'Saju ranking', '궁합': 'Compatibility', '만세력': 'Birth chart',
  '비견': 'Peer', '겁재': 'Rival', '식신': 'Eating God', '상관': 'Hurting Officer',
  '편재': 'Indirect Wealth', '정재': 'Direct Wealth', '편관': 'Seven Killings', '정관': 'Direct Officer',
  '편인': 'Indirect Resource', '정인': 'Direct Resource', '일간': 'Day Master',
  '비겁': 'Peers', '식상': 'Expression', '재성': 'Wealth', '관성': 'Authority', '인성': 'Resources',
  '장생': 'Birth', '목욕': 'Bathing', '관대': 'Coming of age', '건록': 'Established strength',
  '제왕': 'Peak strength', '쇠': 'Decline', '병': 'Weakening', '사': 'Rest', '묘': 'Storage',
  '절': 'Release', '태': 'Conception', '양': 'Nurturing',
  '극신강': 'Very strong Day Master', '신강': 'Strong Day Master', '중화': 'Balanced Day Master',
  '신약': 'Weak Day Master', '극신약': 'Very weak Day Master',
  '목': 'Wood', '화': 'Fire', '토': 'Earth', '금': 'Metal', '수': 'Water',
  '합': 'Combination', '삼합': 'Trine', '충': 'Clash', '형': 'Penalty', '해': 'Harm', '파': 'Break',
  '원진': 'Friction', '같음': 'Same branch', '없음': 'None', '상생': 'Generating', '상극': 'Controlling',
  '용신': 'Useful element', '희신': 'Supporting element', '기신': 'Challenging element',
  '도화': 'Peach Blossom', '도화살': 'Peach Blossom', '역마': 'Travel Horse', '역마살': 'Travel Horse',
  '화개': 'Canopy', '화개살': 'Canopy', '천을귀인': 'Noble Helper', '귀인': 'Noble Helper',
  '문창': 'Scholar Star', '문창귀인': 'Scholar Star', '양인': 'Yang Blade', '양인살': 'Yang Blade',
  '괴강살': 'Commanding Star', '백호살': 'White Tiger', '홍란': 'Red Matchmaker', '천희': 'Heavenly Joy',
  '홍란·천희': 'Red Matchmaker / Heavenly Joy', '년주': 'Year pillar', '월주': 'Month pillar',
  '일주': 'Day pillar', '시주': 'Hour pillar', '년지': 'Year branch', '월지': 'Month branch',
  '일지': 'Day branch', '시지': 'Hour branch', '오행': 'Five Elements', '운성': 'Life stage',
  '간합': 'Stem combination', '간충': 'Stem clash', '들삼재': 'Entering Samjae',
  '눌삼재': 'Middle Samjae year', '날삼재': 'Leaving Samjae',
  '재물': 'Wealth', '명예': 'Recognition', '매력': 'Charm', '건강': 'Wellbeing', '지혜': 'Wisdom',
  '직장운': 'Career', '금전운': 'Money', '연애운': 'Love', '이동운': 'Travel & change',
  '건강운': 'Wellbeing', '대인운': 'Relationships', '학업·문서운': 'Study & paperwork',
  '종합': 'Overall', '대길': 'Very favorable', '길': 'Favorable', '평': 'Steady', '주의': 'Take care',
  '전성기': 'Peak chapter', '성장기': 'Growth chapter', '수련기': 'Practice chapter', '시련기': 'Challenging chapter',
  '초년': 'Early life', '중년': 'Midlife', '말년': 'Later life',
  '입춘': 'Start of Spring', '우수': 'Rain Water', '경칩': 'Awakening of Insects', '춘분': 'Spring Equinox',
  '청명': 'Clear and Bright', '곡우': 'Grain Rain', '입하': 'Start of Summer', '소만': 'Grain Buds',
  '망종': 'Grain in Ear', '하지': 'Summer Solstice', '소서': 'Minor Heat', '대서': 'Major Heat',
  '입추': 'Start of Autumn', '처서': 'End of Heat', '백로': 'White Dew', '추분': 'Autumn Equinox',
  '한로': 'Cold Dew', '상강': 'Frost Descent', '입동': 'Start of Winter', '소설': 'Minor Snow',
  '대설': 'Major Snow', '동지': 'Winter Solstice', '소한': 'Minor Cold', '대한': 'Major Cold',
};

export function term(value) {
  if (!isEnglish() || typeof value !== 'string') return value;
  if (EN_TERMS[value]) return EN_TERMS[value];
  const relation = /^(년지|월지|일지|시지|일간)(삼합|합|충|형|해|파|원진)$/.exec(value);
  if (relation) return `${EN_TERMS[relation[1]]} ${EN_TERMS[relation[2]].toLowerCase()}`;
  return value;
}

const capital = (value) => value.charAt(0).toUpperCase() + value.slice(1);
export const stemName = (index) => tr(STEM_K[index], capital(STEM_SLUG[index]));
export const branchName = (index) => tr(BR_K[index], capital(BR_SLUG[index]));
export const elementName = (index) => tr(EL_K[index], EN_TERMS[EL_K[index]]);
export const animalName = (index) => tr(ANIMAL[index], capital(ANIMAL_SLUG[index]));
export const stageName = term;
export const tenGodName = term;
export const weekdayName = (index) => tr(['일', '월', '화', '수', '목', '금', '토'][index], ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index]);

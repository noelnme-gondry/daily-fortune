// 십신은 직업의 계열이다. 실제 직업·고유 스킬·장비는 계열 아래에서 고른다.
import { CLASSES, CLASS_STATS } from './story.js';

// id는 그림과 공유 링크의 영구 식별자이므로 순서 변경과 무관하게 유지한다.
const EXTRA = {
  비견: [
    ['ranger', '숲길의 정찰꾼', 'drive', '길 없는 길', '덩굴 속 지름길을 발견한다', '남이 그린 지도 밖에서 나만의 길을 찾습니다.', '오늘은 익숙한 길에서 한 걸음만 벗어나 보세요.', 'forest ranger with a leaf hood, short bow and tiny binoculars'],
    ['monk', '맨손의 무도가', 'vital', '백 번의 발차기', '작은 수련을 모아 단단하게 버틴다', '화려한 무기 없이도 매일의 수련으로 버텨 냅니다.', '무리한 한 번보다 가벼운 수련을 이어 가세요.', 'barehanded martial artist with headband, bandaged fists and training dummy'],
    ['ferryman', '강나루의 뱃사공', 'wealth', '흐름 읽기', '급류를 피해 사람과 짐을 건넨다', '큰 파도보다 물밑의 흐름을 보고 방향을 정합니다.', '서두르기 전에 지금의 흐름부터 살펴보세요.', 'river ferryman with broad straw hat, bamboo pole and tiny wooden boat'],
    ['beastkeeper', '산짐승의 친구', 'charm', '든든한 동행', '겁먹은 동료의 마음을 진정시킨다', '혼자 힘으로 버티던 모험에 믿을 만한 동료가 생깁니다.', '도움을 청할 사람 한 명을 떠올려 보세요.', 'friendly beast keeper with a fluffy baby tiger companion and food pouch'],
  ],
  겁재: [
    ['rogue', '지붕 위의 의적', 'drive', '빈틈 한 칸', '막힌 길의 작은 틈을 찾아 빠져나온다', '정면 돌파가 막히면 누구도 생각하지 못한 길을 찾습니다.', '규칙을 깨기 전에 다른 방법부터 찾아보세요.', 'mischievous rooftop folk rogue with eye mask, hook rope and jingling pouch'],
    ['gambler', '주사위의 승부사', 'wealth', '마지막 패', '욕심을 멈추고 가진 것을 지킨다', '기회가 많을수록 판을 접을 때를 아는 눈이 필요합니다.', '오늘의 지출 한도를 먼저 정하세요.', 'comical dice player with oversized wooden dice, fan and empty betting bowl, no modern casino'],
    ['wrestler', '장터의 씨름꾼', 'vital', '한판 뒤집기', '중심을 낮춰 넘어질 순간을 버틴다', '상대의 힘을 따라가기보다 내 중심을 지키는 시기입니다.', '비교를 멈추고 내 페이스를 지켜 보세요.', 'stocky Korean folk wrestler with red belt, rice cake snack and determined eyebrows'],
    ['corsair', '돛단배의 해적', 'charm', '선원 모집', '개성 강한 동료들을 한배에 태운다', '혼자서는 못 건널 바다를 동료들과 함께 건넙니다.', '경쟁자에게서도 배울 점 하나를 찾아보세요.', 'tiny playful fantasy pirate captain with patchwork sail, spyglass and toy-sized saber'],
  ],
  식신: [
    ['chef', '솥단지의 요리사', 'vital', '따뜻한 한 그릇', '먹고 쉬는 일부터 체력을 회복한다', '작은 즐거움과 규칙적인 생활이 모험의 연료가 됩니다.', '한 끼를 천천히 챙겨 먹어 보세요.', 'cheerful dumpling chef with enormous steaming pot, ladle and flour dust'],
    ['gardener', '복숭아밭의 정원사', 'wealth', '씨앗 저축', '작은 노력을 심어 결실을 기다린다', '당장 눈에 띄지 않는 노력도 땅속에서는 자라고 있습니다.', '오래 키울 일 하나에 시간을 남겨 두세요.', 'peach orchard gardener with straw bonnet, watering can and basket of peaches'],
    ['potter', '달빛의 도예가', 'wisdom', '깨진 그릇 수선', '실패한 결과를 다음 작품의 재료로 쓴다', '손으로 만들고 다시 고치면서 나만의 감각이 생깁니다.', '완성보다 한 번 더 만들어 보는 데 집중하세요.', 'ceramic potter with small pottery wheel, clay-covered hands and lopsided moon jar'],
    ['brewer', '주막의 양조사', 'charm', '느긋한 숙성', '기다림을 나누며 사람을 이어 준다', '사람 사이의 좋은 대화가 뜻밖의 기회로 익어 갑니다.', '결과를 재촉하지 말고 이야기를 들어 보세요.', 'traditional rice brew maker with earthen jars, grain basket and cheerful round face'],
  ],
  상관: [
    ['jester', '탈춤의 광대', 'charm', '분위기 반전', '어색한 자리에 웃음 한 번을 더한다', '독특한 표현이 사람들의 시선을 끄는 무대가 열립니다.', '재치 있는 말에도 상대의 표정을 살펴보세요.', 'Korean mask dance jester holding a grinning wooden mask, bells and ribbon sleeves'],
    ['inventor', '태엽의 발명가', 'wisdom', '엉뚱한 조립', '서로 다른 도구를 합쳐 새 방법을 만든다', '낯선 아이디어를 작은 실험으로 바꾸는 시기입니다.', '크게 벌이기 전에 작동하는 작은 모형부터 만드세요.', 'eccentric clockwork inventor with tiny wooden robot, goggles and wind-up key'],
    ['painter', '먹구름의 화가', 'drive', '판 다시 그리기', '막힌 생각을 다른 색으로 바꿔 본다', '기존 답이 맞지 않을 때 새로운 표현이 길을 냅니다.', '설명하기 어려운 생각을 그림이나 메모로 남기세요.', 'ink painter with oversized brush, ink pot and mischievous ink splash on cheek'],
    ['acrobat', '줄 위의 곡예사', 'vital', '아슬아슬 균형', '긴장 속에서도 호흡과 중심을 유지한다', '눈에 띄는 성과보다 균형을 잃지 않는 일이 중요합니다.', '할 일을 하나 줄여 여유를 만들어 보세요.', 'cute tightrope acrobat with balancing fan, colorful ribbon and low practice rope'],
  ],
  편재: [
    ['treasurehunter', '유적의 보물사냥꾼', 'drive', '숨은 상자 찾기', '남들이 지나친 기회를 발견한다', '새로운 곳에서 쓸모 있는 경험과 기회를 주워 옵니다.', '기회를 고를 때 비용과 시간을 함께 적어 보세요.', 'ruins treasure hunter with shovel, crumpled treasure map and tiny ancient chest'],
    ['caravan', '비단길의 대상인', 'wealth', '거래의 눈', '큰 거래의 조건을 차분히 비교한다', '넓은 관계와 정보가 자원이 되지만 관리도 필요합니다.', '좋은 조건일수록 약속을 글로 확인하세요.', 'silk road caravan merchant with rolled fabrics, abacus and small overloaded cart'],
    ['seacaptain', '별바다의 선장', 'wisdom', '별자리 항해', '멀리 있는 목적지를 작은 항로로 나눈다', '큰 계획을 실제로 움직일 수 있는 순서로 바꿉니다.', '다음 한 달에 갈 수 있는 항로부터 정하세요.', 'star navigating sea captain with compass, star chart and miniature ship wheel'],
    ['innkeeper', '사거리의 주막지기', 'charm', '소문 수집', '지나가는 이야기에서 기회의 실마리를 찾는다', '사람을 연결하는 일이 새로운 흐름을 만들 수 있습니다.', '가까운 사람의 필요를 한 번 물어보세요.', 'warm crossroads innkeeper carrying food tray, wooden sign without lettering and lantern'],
  ],
  정재: [
    ['smith', '쇳불의 대장장이', 'drive', '한 번 더 두드리기', '어설픈 초안을 쓸 만한 도구로 다듬는다', '반복되는 작업 속에서 오래 쓸 실력이 만들어집니다.', '새 일보다 하던 일을 한 단계 다듬어 보세요.', 'blacksmith with chunky hammer, small anvil and comical soot marks'],
    ['tailor', '비단실의 재봉사', 'wisdom', '빈틈 꿰매기', '작은 누수를 찾아 꼼꼼하게 메운다', '사소한 디테일을 챙긴 만큼 결과의 완성도가 높아집니다.', '눈에 띄지 않는 불편 하나를 고쳐 보세요.', 'silk tailor with giant spool, pincushion and patterned patchwork robe'],
    ['farmer', '황금들판의 농부', 'vital', '꾸준한 수확', '매일의 일을 빠뜨리지 않고 쌓는다', '생활의 리듬을 잡을수록 마음과 기반이 안정됩니다.', '반복할 수 있는 작은 습관 하나를 정하세요.', 'rice farmer with straw hat, rice bundle and hoe, muddy boots'],
    ['accountant', '장부의 회계관', 'wealth', '새는 동전 찾기', '숫자를 맞춰 보이지 않는 낭비를 줄인다', '흩어진 자원과 약속을 정리하면 다음 선택이 쉬워집니다.', '이번 달의 작은 지출부터 살펴보세요.', 'meticulous ledger accountant with large abacus, scroll accounts without writing and tiny spectacles'],
  ],
  편관: [
    ['demonhunter', '새벽의 퇴마사', 'wisdom', '겁먹은 마음 봉인', '문제를 이름 붙이고 하나씩 정리한다', '막연한 걱정의 정체를 알면 대응할 방법도 보입니다.', '가장 걱정되는 일을 한 문장으로 적어 보세요.', 'friendly dawn exorcist with paper talismans without text, bell and tiny harmless ghost'],
    ['guard', '성문의 수호병', 'vital', '오늘도 경계 근무', '중요한 것의 경계를 꾸준히 지킨다', '책임이 늘어날 때 나를 지킬 선도 함께 필요합니다.', '오늘 거절해도 되는 부탁 하나를 구분하세요.', 'castle gate guard with oversized spear, padded armor and heavy keyring'],
    ['firefighter', '불길의 구조대원', 'drive', '먼저 탈출로', '급한 상황에서 우선순위를 세운다', '모든 문제를 한 번에 해결하기보다 급한 일부터 다룹니다.', '가장 급한 일 하나를 먼저 끝내세요.', 'historical fantasy fire rescuer with water bucket, rope coil and soot-covered helmet'],
    ['courier', '천리길의 역참꾼', 'charm', '약속한 도착', '어려운 길에서도 필요한 소식을 전달한다', '사람 사이의 약속을 지키는 일이 신뢰를 쌓습니다.', '지키기 어려운 일정은 미리 조율하세요.', 'swift relay courier with scroll satchel, small horse hobby stick and windblown scarf'],
  ],
  정관: [
    ['magistrate', '고을의 판관', 'wisdom', '양쪽 이야기 듣기', '서로 다른 입장을 듣고 기준을 세운다', '공정한 판단이 필요한 순간에 신뢰가 힘이 됩니다.', '결론을 내리기 전에 빠진 정보를 확인하세요.', 'village magistrate with traditional official hat, wooden seal and balance scales'],
    ['diplomat', '화해의 사절', 'charm', '말의 다리', '멀어진 사람 사이에 대화의 자리를 만든다', '잘 설명하고 잘 듣는 태도가 협력의 길을 엽니다.', '부탁할 때 상대가 얻는 것도 함께 설명하세요.', 'peace envoy in neat silk robe carrying olive-like branch, ceremonial fan and document tube'],
    ['architect', '성벽의 설계사', 'drive', '무너지지 않는 설계', '큰 목표를 버틸 수 있는 구조로 나눈다', '안정적인 틀을 만들면 오래 이어 갈 일이 편해집니다.', '계획에서 빠진 준비 단계 하나를 찾아보세요.', 'fortress architect with rolled blueprints without writing, ruler and tiny castle model'],
    ['steward', '왕실의 집사', 'wealth', '보이지 않는 준비', '필요한 물건과 사람을 미리 챙긴다', '작은 준비가 주변의 일을 매끄럽게 이어 줍니다.', '내일의 번거로움 하나를 오늘 줄여 보세요.', 'royal steward with neat uniform hanbok, keyring and carefully balanced tea tray'],
  ],
  편인: [
    ['stargazer', '별탑의 점성술사', 'wisdom', '패턴 발견', '흩어진 단서 사이의 연결을 찾아본다', '넓게 관찰하던 것에서 나만의 질문이 생겨납니다.', '눈에 띈 패턴은 결론보다 질문으로 남기세요.', 'star tower astrologer with oversized telescope, moon hat and star globe'],
    ['puppeteer', '그림자의 인형사', 'charm', '숨은 줄 조율', '드러나지 않은 연결을 조심스럽게 맞춘다', '정면에 서지 않아도 나만의 방식으로 이야기를 이끕니다.', '혼자 알고 있던 아이디어를 한 사람에게 들려주세요.', 'shadow puppet performer with two tiny wooden marionettes and string controls'],
    ['herbalist', '안개숲의 약초꾼', 'vital', '숨 고르는 향', '복잡한 하루에 쉬어 갈 틈을 만든다', '바깥의 속도보다 내 상태를 살피는 시간이 필요합니다.', '새로운 일을 더하기 전에 쉬는 시간을 확보하세요.', 'mist forest herbalist with mushroom hat, herb basket and tiny mortar'],
    ['tinkerer', '고물상 연금술사', 'wealth', '고철의 두 번째 삶', '버려진 재료에서 새로운 쓸모를 찾는다', '이미 가진 것을 새롭게 보는 눈이 기회가 됩니다.', '새로 사기 전에 가진 도구를 다시 살펴보세요.', 'scrap alchemist with odd pots, patched apron and quirky recycled mechanical bird'],
  ],
  정인: [
    ['librarian', '금서고의 사서', 'wisdom', '필요한 한 권', '쌓인 정보에서 지금 필요한 것을 골라낸다', '많이 아는 것보다 알맞게 꺼내 쓰는 힘이 자랍니다.', '지금 해결할 문제에 필요한 자료 하나만 고르세요.', 'secret library librarian with tall stack of books, large glasses and rolling ladder'],
    ['teacher', '마을의 훈장', 'charm', '함께 익히기', '어려운 내용을 쉬운 말로 나눈다', '배운 것을 나누면서 내 이해도 한 단계 깊어집니다.', '새로 배운 것을 누군가에게 설명해 보세요.', 'village school teacher with gentle face, large blank primer and bamboo pointer'],
    ['healer', '숲샘의 치유사', 'vital', '쉬어 가는 자리', '지친 동료가 숨을 돌릴 자리를 마련한다', '돌봄과 회복을 챙길 때 다시 움직일 힘이 모입니다.', '다른 사람을 챙기는 만큼 나도 쉬게 해주세요.', 'forest spring healer with water gourd, herb bandages and small bird companion'],
    ['scribe', '역사의 기록관', 'drive', '흔적 보관', '지나간 경험을 다음 선택의 자료로 남긴다', '쌓인 경험을 정리하면 같은 실수를 줄일 수 있습니다.', '오늘 배운 것 한 줄을 기록해 보세요.', 'history scribe with large brush, scroll backpack and small seal stamp'],
  ],
};

const SETBACKS = [
  ['비견', 'beggar', '빈 주머니의 거지 모험가', 'drive', '빈손 재출발', '가벼운 짐으로 다시 일어난다', '모아 둔 돈이 바닥나 여관에서도 쫓겨났습니다. 낡은 지팡이 하나와 빈 주머니만 남은 밤, 다음 끼니부터 걱정해야 합니다.', '가진 것 세 가지부터 다시 세어 보세요.', 'penniless wandering adventurer with patched clothes, empty purse and walking stick'],
  ['겁재', 'brokenblade', '목검으로 버티는 낭인', 'vital', '부러져도 한 번 더', '남은 장비로 할 수 있는 일을 찾는다', '무리하게 덤빈 결투에서 패하고 검까지 부러졌습니다. 자신감도 장비도 잃은 채, 남의 도움을 구해야 하는 처지가 됩니다.', '승부를 잠시 내려놓고 실력을 다듬어 보세요.', 'comical defeated wandering swordsman with snapped wooden sword, patched robe and embarrassed smile'],
  ['식신', 'hungrychef', '솥만 남은 배고픈 요리사', 'charm', '냉장고 없는 만찬', '작은 재료를 모아 한 끼를 만든다', '손님은 끊기고 식재료마저 떨어졌습니다. 문을 열어도 내놓을 음식이 없어 빈 솥만 바라보는 날이 이어집니다.', '있는 재료로 끝낼 수 있는 일부터 해보세요.', 'hungry chef holding a completely empty cooking pot and single tiny radish, hopeful funny face'],
  ['상관', 'booedjester', '관객 한 명의 무명 광대', 'charm', '혼자라도 커튼콜', '작은 반응을 모아 다음 무대를 준비한다', '야심 차게 준비한 무대가 썰렁하게 끝났습니다. 동전 한 닢도 벌지 못하고, 구경하던 닭 한 마리만 남았습니다.', '반응보다 표현하는 연습 자체에 집중하세요.', 'unpopular street jester performing for one tiny chicken, patched mask and drooping bells'],
  ['편재', 'bankrupt', '수레만 남은 빈털터리 상인', 'wealth', '재고 다시 세기', '손실을 멈추고 남은 자원을 정리한다', '큰 거래가 엎어지고 외상값도 돌려받지 못했습니다. 물건과 여비를 잃어 빈 수레를 끌며 다음 모험을 미뤄야 합니다.', '새로운 판보다 지금의 지출부터 정리하세요.', 'bankrupt merchant with empty broken handcart, inside-out pockets and optimistic sheepish face'],
  ['정재', 'jobseeker', '합격을 기다리는 백수 선비', 'wisdom', '오늘도 출석', '결과가 없어도 생활의 리듬을 지킨다', '과거 시험에 연달아 낙방하고 일자리 소식도 끊겼습니다. 쌓이는 지원서와 빈 쌀독 앞에서 자존심을 내려놓아야 합니다.', '결과와 별개로 오늘 끝낼 일 하나를 정하세요.', 'unemployed scholar in rumpled hanbok holding blank application scroll, patched socks and instant-looking rice bowl'],
  ['편관', 'woundedguard', '깁스한 휴가병', 'vital', '갑옷 벗는 용기', '잠시 물러나 다음 걸음을 준비한다', '무리한 출정을 이어 가다 다쳐 전열에서 빠졌습니다. 동료들이 앞서가는 동안 갑옷을 벗고 회복에 시간을 써야 합니다.', '잠시 멈춰도 괜찮은 일을 구분해 보세요.', 'resting soldier with bandaged leg, crutch, oversized helmet and tiny flower tucked in armor'],
  ['정관', 'exiledknight', '훈장을 잃어버린 기사', 'drive', '이름 없이 돕기', '체면보다 할 수 있는 일을 선택한다', '잘못된 판단으로 임무를 망치고 신뢰를 잃었습니다. 훈장을 반납한 뒤 성문 밖에서 이름 없는 일부터 다시 맡아야 합니다.', '인정받을 일보다 필요한 일 하나를 해보세요.', 'exiled knight with dented empty medal ribbon, rusty toy sword and patched cape, comical hopeful face'],
  ['편인', 'exploded', '실험실을 날린 연금술사', 'wisdom', '실패 노트', '실패한 실험에서 다음 조건을 찾는다', '무리한 실험이 터지며 장비와 비싼 재료가 함께 날아갔습니다. 얼굴은 새까맣고 연구비는 바닥나, 실험을 멈춰야 합니다.', '무엇이 안 됐는지 한 가지씩 분리해 보세요.', 'alchemist after harmless cartoon explosion with soot face, singed hair, cracked goggles and smoking flask'],
  ['정인', 'pennilesssage', '책값도 없는 떠돌이 현자', 'charm', '기억 속 도서관', '가진 지식을 나누며 도움을 구한다', '공들인 원고는 퇴짜를 맞고 책을 살 돈도 남지 않았습니다. 아는 것은 많아도 당장 머물 곳을 구하는 데 애를 먹습니다.', '혼자 버티지 말고 배운 것을 나눠 보세요.', 'penniless wandering sage with threadbare robe, one worn book, empty coin purse and warm smile'],
];

const FOCUS_BONUS = { drive: [6, 0, -2, -2, 0], wealth: [-2, 6, 0, 0, -2], charm: [0, -2, 6, 0, -2], wisdom: [-2, 0, -2, 6, 0], vital: [0, -2, -2, 0, 6] };
const entry = (tg, [id, name, focus, skill, effect, desc, quest, art], setback = false) => ({ id, tg, name, focus, skill: [skill, effect], desc, quest, art, setback, stats: CLASS_STATS[tg].map((n, i) => n + FOCUS_BONUS[focus][i]) });
const BASE_FOCUS = ['drive', 'drive', 'charm', 'charm', 'wealth', 'wealth', 'drive', 'wisdom', 'wisdom', 'wisdom'];
export const CHARACTER_JOBS = Object.entries(CLASSES).flatMap(([tg, cls], i) => [
  entry(tg, [cls.icon, cls.name, BASE_FOCUS[i], ...cls.skill, cls.desc, cls.quest, '']),
  ...EXTRA[tg].map((row) => entry(tg, row)),
]);
export const SETBACK_JOBS = SETBACKS.map(([tg, ...row]) => entry(tg, row, true));
export const ALL_JOBS = [...CHARACTER_JOBS, ...SETBACK_JOBS];
export const JOB_BY_ID = Object.assign(Object.create(null), Object.fromEntries(ALL_JOBS.map((job) => [job.id, job])));

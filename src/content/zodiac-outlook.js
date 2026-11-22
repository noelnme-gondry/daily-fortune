// 전문용어의 정의 대신 일상에서 활용할 운과 주의점을 설명한다.
// 점수·사건의 확률을 추가하지 않으며, [KR, EN]을 같은 근거에서 선택한다.
export const ZODIAC_OPPORTUNITY = {
  agreement: ['대인운에 반가운 도움이 기대됩니다. 혼자 풀리지 않던 일에 손을 보태 주거나 내 편이 되어 주는 사람을 만날 수 있습니다.', 'Relationships offer the possibility of welcome help. Someone may lend a hand with a problem or stand in your corner.'],
  teamwork: ['협업운이 돋보입니다. 마음 맞는 사람과 함께한 일이 진척되거나 모임에서 다시 보고 싶은 인연을 만날 수 있습니다.', 'Teamwork stands out. A shared task may progress, or a gathering may bring someone you look forward to seeing again.'],
  peers: ['대인운에서는 반가운 연락과 새로운 연결을 기대해 볼 만합니다. 뜸했던 사람과 대화가 이어지거나 동료에게 유용한 제안을 들을 수 있습니다.', 'Relationships offer room for welcome contact. An old acquaintance may get in touch, or a colleague may share a useful idea.'],
  money: ['재물운에서는 작은 횡재수나 노력에 대한 보답을 기대해 볼 만합니다. 뜻밖의 선물이나 대접, 내 재능을 알아주는 일거리처럼 기분 좋은 이득에 눈길이 갑니다.', 'Money themes suggest a possible small windfall or reward for effort. A gift, a treat or a paid task that values your skill fits the reading.'],
  learning: ['학업·업무운에서는 막힌 내용이 풀리는 실마리를 기대해 볼 만합니다. 경험 있는 사람의 한마디나 내게 맞는 자료가 새로운 자신감을 줄 수 있습니다.', 'Study and work offer the prospect of a useful breakthrough. Experienced advice or a suitable resource may renew your confidence.'],
};

// 같은 상징도 종합 점수가 낮으면 기대를 부풀리지 않고 여유와 관계 회복으로 풀이한다.
export const ZODIAC_CAREFUL_OPPORTUNITY = {
  agreement: ['대인운은 도움이 필요하다는 말을 혼자 삼키지 않는 것이 과제입니다. 답이 늦어도 혼자 버텨야 한다고 단정하지 마세요.', 'Relationships invite you to speak when you need support. A slow reply need not mean you must cope alone.'],
  teamwork: ['협업운은 모두의 몫을 혼자 떠안지 않는 데 초점을 둡니다. 함께하는 일일수록 내가 감당할 만큼을 말해도 괜찮습니다.', 'Teamwork calls for sharing the load. It is fine to say what you can reasonably take on.'],
  peers: ['대인운에서는 반응 하나에 마음이 쓰일 수 있습니다. 연락의 속도만으로 관계를 재지 말고 편하게 이야기할 사람을 떠올려 보세요.', 'A response may feel sensitive. Do not measure a relationship only by reply speed; think of someone you can speak with comfortably.'],
  money: ['재물운은 기대한 보상이 늦어져도 조급하게 움직이지 않는 데 초점을 둡니다. 남의 씀씀이보다 내 생활의 여유를 기준으로 삼아 보세요.', 'Money themes call for patience if a reward takes time. Let your own needs guide spending instead of comparison with others.'],
  learning: ['학업·업무운에서는 막힌 부분을 능력의 한계로 받아들이지 않는 것이 필요합니다. 질문 하나를 해결하는 정도로 속도를 줄여도 괜찮습니다.', 'A block in study or work need not define your ability. It is fine to slow down and resolve one question at a time.'],
};

export const ZODIAC_CAUTION = {
  합: ['도움을 받더라도 서로 맡을 일과 약속은 분명히 정하세요.', 'Even with support, be clear about roles and commitments.'],
  삼합: ['사람이 많아질수록 결정할 사람과 마감 시점을 먼저 맞추세요.', 'With more people involved, agree on decision-making and deadlines first.'],
  같음: ['대인관계에서는 익숙한 내 방식만 밀어붙이지 말고 다른 의견도 들어 보세요.', 'In relationships, hear other views instead of insisting on your usual approach.'],
  충: ['이동·변화운은 속도 조절이 필요합니다. 이사나 출장처럼 큰 일정은 이동 경로와 바뀔 조건부터 확인하세요.', 'Travel and changes call for a measured pace. For a move or work trip, check routes and the terms that may change.'],
  형: ['업무운에서는 말과 문서의 정확성을 챙기는 편이 좋습니다. 요청 사항과 마감을 확인한 뒤 답하세요.', 'At work, precision matters. Check requests and deadlines before responding.'],
  원진: ['애정·대인운에서는 상대의 마음을 짐작해 결론내리지 않는 것이 중요합니다. 서운한 일이 있다면 뜻을 직접 확인하세요.', 'In love and relationships, avoid assuming what someone feels. If something bothers you, ask what they meant.'],
  해: ['대인운에서는 부탁과 기대를 맞추는 데 신경 쓰세요. 도와줄 수 있는 범위를 먼저 말하면 좋겠습니다.', 'Relationships call for aligning requests and expectations. State how much help you can offer first.'],
  파: ['약속·이동운은 일정 관리에 신경 쓸 때입니다. 바뀐 장소나 예약 조건을 다시 확인하고 사이에 여유를 남기세요.', 'Plans and travel need careful scheduling. Recheck changed venues or booking terms and leave time between commitments.'],
};

export const ZODIAC_ELEMENT_CAUTION = {
  1: ['아이디어를 실행하는 일은 작게 시작해 보세요. 의욕만큼 시간과 비용을 쓰지 않도록 범위를 정하는 편이 좋습니다.', 'Start small when putting an idea into practice. Set a scope so enthusiasm does not overextend your time or budget.'],
  3: ['업무운은 맡은 책임과 마감을 관리하는 쪽에 무게가 실립니다. 새 일을 늘리기 전에 현재 할 수 있는 양부터 확인하세요.', 'Work centers on managing responsibilities and deadlines. Check your capacity before adding more tasks.'],
};

// 연간에는 실제 분야 점수에 맞춰 강점·보통·주의를 설명한다.
// [75점 이상, 60~74점, 60점 미만]이며 수치 자체는 엔진에서 받는다.
export const ZODIAC_CATEGORY_OUTLOOK = {
  career: [
    ['직장·사업운은 준비한 실력을 알아주는 사람과 새로운 역할을 기대해 볼 만합니다. 해낸 일을 자신 있게 이야기하세요.', 'Work offers room for recognition and a new role. Speak confidently about what you have achieved.'],
    ['직장·사업운은 작은 성과가 신뢰로 이어지는 흐름입니다. 동료의 도움이나 함께 일하자는 반가운 이야기에서 다음 걸음을 찾을 수 있습니다.', 'Work favors small achievements that build trust. A colleague’s help or a welcome invitation to collaborate may suggest your next step.'],
    ['직장·사업운은 일을 넓히기보다 요청 사항과 마감을 조율하는 편이 좋습니다.', 'Work calls for clarifying requests and deadlines before expanding commitments.'],
  ],
  money: [
    ['재물운은 보답과 수입의 기회를 기대해 볼 만합니다. 작은 횡재수는 뜻밖의 선물이나 내 재능을 알아주는 제안처럼 찾아올 수 있습니다.', 'Money themes welcome rewards and possible income opportunities. A small windfall may take the form of a gift or an offer that values your talent.'],
    ['재물운은 작지만 기분 좋은 이득에 눈길이 가는 흐름입니다. 원하던 것을 좋은 조건에 만나거나 누군가의 보답으로 여유를 느낄 수 있습니다.', 'Money themes favor modest, pleasing gains. A wanted item on appealing terms or someone’s thank-you may bring a sense of ease.'],
    ['재물운은 지출 관리가 우선입니다. 추가 구매나 공동 지출은 감당할 범위와 조건부터 확인하세요.', 'Money matters call for managing spending first. Check limits and terms before extra purchases or shared costs.'],
  ],
  love: [
    ['애정운은 가까워질 계기를 기대해 볼 만합니다. 반가운 연락이나 다음 약속으로 이어지는 만남, 연인의 다정한 말이 설렘을 줄 수 있습니다.', 'Love offers the possibility of greater closeness. A welcome message, a meeting that leads to another date or a partner’s kind words may bring excitement.'],
    ['애정운은 사소한 배려에서 서로의 마음을 느끼는 흐름입니다. 기억해 준 약속이나 편한 대화가 관계를 더 소중하게 느끼게 할 수 있습니다.', 'Love favors care found in small gestures. A remembered promise or easy conversation may make a connection feel more precious.'],
    ['애정운은 서두르기보다 서로의 사정을 확인할 때입니다. 답장이나 말투만으로 마음을 단정하지 마세요.', 'Love calls for understanding each other’s circumstances before rushing. Avoid judging feelings from a reply or tone alone.'],
  ],
  move: [
    ['이동운은 낯선 장소의 반가운 발견을 기대해 볼 만합니다. 직접 만난 사람과 이야기가 풀리거나 궁금했던 공간에서 영감을 얻을 수 있습니다.', 'Travel offers room for a welcome discovery. A conversation in person may flow well, or a place you were curious about may offer inspiration.'],
    ['이동운은 가벼운 외출에서 새로운 기분을 찾는 흐름입니다. 가까운 나들이나 오랜만의 방문이 다녀오길 잘했다는 기억으로 남을 수 있습니다.', 'Travel favors a fresh feeling in a simple outing. A nearby excursion or a long-delayed visit may leave you glad you went.'],
    ['이동운은 일정을 촘촘히 잡기보다 여유를 두는 편이 좋습니다. 출발 전에 시간과 장소를 다시 확인하세요.', 'Travel calls for room between plans. Recheck times and places before setting off.'],
  ],
  health: [
    ['건강운은 내 몸을 몰아붙이기보다 즐겁게 돌보는 주제로 읽습니다. 좋아하는 취미와 편안한 활동을 누리며 나를 위한 시간을 가져 보세요.', 'Wellbeing is read as enjoyment in caring for yourself. Make room for favorite pastimes and comfortable activities rather than pushing your body.'],
    ['건강운은 익숙한 일상에서 나를 챙기는 만족을 찾는 흐름입니다. 편한 한 끼와 느긋한 저녁도 충분히 소중한 시간이 될 수 있습니다.', 'Wellbeing favors satisfaction in ordinary care. A comfortable meal or an unhurried evening can be worthwhile time for yourself.'],
    ['건강운은 일정을 덜어 내고 쉬는 시간을 확보하는 데 초점을 둡니다. 피곤할 때는 다른 사람의 속도를 따라가지 마세요.', 'Wellbeing calls for easing the schedule and making time to rest. Avoid matching someone else’s pace when tired.'],
  ],
};

// 월운은 같은 월지라도 띠와 맺는 관계에 따라 분야와 강약이 달라진다.
export const ZODIAC_MONTH = {
  social: [
    '이번 달 대인운은 끊겼던 이야기를 다시 이어 가는 쪽으로 열려 있어요. 마지막으로 만났을 때는 별것 아니었던 말이 뒤늦게 떠오를 수 있겠어요. 그런 사람이 있다면 미안한 마음부터 길게 설명하기보다 그때 나눴던 이야기로 말을 건네 보세요. 다시 가까워지는 데 필요한 것이 근사한 약속보다 가벼운 안부일 수 있는 달이에요.',
    '이번 달은 가까운 사람의 반응에 평소보다 마음이 쓰일 수 있어요. 답이 늦으면 내가 뭘 잘못했나 싶다가도, 막상 만나 보면 그동안 바빴다는 이야기부터 듣게 되는 식이에요. 대인운을 살필 때는 한 번의 답장보다 최근 몇 번의 만남을 함께 떠올려 보세요. 그래도 같은 서운함이 남는다면 “요즘 어떻게 지내?” 하고 먼저 말을 걸어 볼 만해요. 서로 몰랐던 사정을 듣고 나면 마음을 어디에 둘지도 조금 더 분명해지겠어요.',
  ],
  career: [
    '이번 달 업무운은 오래 손에 익힌 일에서 힘을 얻는 흐름이에요. 내게는 쉬워서 굳이 말하지 않았던 일이 누군가에게는 꼭 필요한 경험일 수 있어요. 비슷한 고민을 들으면 결과가 좋았다는 말보다 어떤 대목에서 애를 먹었는지 들려주세요. 그렇게 시작한 대화가 서로 믿고 일을 나누는 계기가 될 만합니다.',
    '이번 달 업무운에서는 일하는 순서를 두고 손발이 어긋나기 쉬워요. 나는 먼저 시작해야 마음이 놓이는데 함께하는 사람은 끝을 정해야 움직일 수 있는 식이지요. 같은 자리에서 자꾸 막힌다면 누가 더 부지런한지 따지기보다 각자 무엇을 기다리고 있는지 물어보세요. 서로의 기준을 알면 다음 일을 시작할 때 같은 설명을 되풀이할 부담이 덜해집니다.',
  ],
  move: [
    '이번 달 이동운에는 평소 다니던 반경을 조금 넓히는 즐거움이 있어요. 새로 가는 장소만큼이나 그곳에서 누구와 무엇을 나눌지가 기억에 남기 쉬운 달이에요. 가 보고 싶던 곳이 있다면 많은 일정을 한꺼번에 넣기보다 가장 기대되는 자리에 시간을 남겨 보세요. 그래야 뜻밖에 반가운 순간이 와도 서둘러 떠나지 않을 수 있어요.',
    '이번 달 이동운은 일정 하나의 변화가 다음 약속까지 흔들기 쉬운 흐름이에요. 갈 곳이 많을수록 가까운 거리인지보다 그 사이에 마음을 놓을 시간이 있는지가 더 크게 느껴질 수 있어요. 조정이 필요하다면 가장 기다려 온 약속부터 남겨 보세요. 빈 시간이 조금 생겨야 꼭 가고 싶은 곳에서 마음까지 서두르지 않을 수 있어요.',
  ],
  money: [
    '이번 달 재물운은 공들인 일의 가치를 이야기하기 좋은 쪽에 놓여 있어요. 남들은 금방 끝난 일로 보아도 내 쪽에서는 여러 번 손을 본 일일 수 있지요. 보답이나 비용을 상의할 일이 있다면 숫자부터 꺼내기보다 어디에 시간과 수고가 들었는지 나눠 보세요. 서로 기대하는 몫을 알아야 반가운 제안인지도 가늠하기 쉬워집니다.',
    '이번 달 재물운에서는 기다린 보답이 더디게 느껴질 수 있어요. 특히 주변 사람들이 무언가를 시작하거나 샀다는 얘기가 자주 들리면 내 계획도 앞당기고 싶어져요. 그럴 때는 다음 달까지 이어져도 편한 지출인지 생각해 보세요. 남과 같은 때를 맞추는 것보다 내 생활에 여유가 남는 선택이 오래 마음을 놓이게 하겠습니다.',
  ],
  study: [
    '이번 달 학업운에서는 따로 배운 것들이 한 가지 이야기로 이어질 만해요. 지난번에는 외워야만 했던 내용이 다른 예시를 만나면서 비로소 이해되는 식이에요. 오래 걸렸던 질문이 떠오르면 예전 답을 바로 펼치기 전에 지금이라면 어떻게 설명할지 생각해 보세요. 어느 부분이 내 것이 됐는지 스스로 느낄 수 있겠어요.',
    '이번 달 학업운은 진도보다 자꾸 돌아오게 되는 질문에 눈길을 두는 편이 좋겠어요. 여러 번 읽어도 같은 곳에서 막힌다면 앞부분 전체를 모른다는 뜻은 아닐 수 있어요. 설명이 끊기는 한 대목을 짚어 다른 예로 물어보세요. 그 고리가 풀리면 이미 익힌 내용까지 새롭게 이어져 보일 수 있습니다.',
  ],
};

// 전문용어의 정의 대신 일상에서 활용할 운과 주의점을 설명한다.
// 점수·사건의 확률을 추가하지 않으며, [KR, EN]을 같은 근거에서 선택한다.
export const ZODIAC_OPPORTUNITY = {
  agreement: ['대인운에서는 도움을 구하거나 미뤄 둔 제안을 꺼내기 좋은 흐름입니다.', 'Support from others is a favorable theme for asking for help or raising a proposal you have put off.'],
  teamwork: ['협업운이 돋보여 공동 과제나 모임을 함께 준비해 볼 만합니다.', 'Teamwork stands out for preparing a shared task or gathering.'],
  peers: ['대인운은 동료와 정보를 나누고 필요한 도움을 주고받는 쪽으로 활용하기 좋습니다.', 'Connections with peers favor exchanging information and practical help.'],
  money: ['재물운은 받을 돈과 돌려받을 비용을 챙기고 구매 조건을 비교하는 쪽으로 활용하기 좋습니다.', 'Money matters favor following up on money owed, reimbursements and comparisons of purchase terms.'],
  learning: ['학업·업무운은 경험 있는 사람에게 조언을 구하고 막힌 부분을 배우는 쪽이 좋습니다.', 'Study and work favor seeking experienced guidance and learning through a difficulty.'],
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
    ['직장·사업운은 제안과 업무 협의를 적극적으로 진행해 볼 만한 흐름입니다.', 'Work favors taking initiative with proposals and discussions.'],
    ['직장·사업운은 맡은 일을 마무리하고 다음 제안을 준비하는 데 활용하기 좋습니다.', 'Work favors finishing current tasks and preparing the next proposal.'],
    ['직장·사업운은 일을 넓히기보다 요청 사항과 마감을 조율하는 편이 좋습니다.', 'Work calls for clarifying requests and deadlines before expanding commitments.'],
  ],
  money: [
    ['재물운은 돈의 흐름을 살피고 조건을 비교하는 데 적극성을 가져 볼 만합니다. 받을 돈과 정산할 비용을 챙겨 보세요.', 'Money matters favor an active review of cash flow and terms. Follow up on money owed and expenses to settle.'],
    ['재물운은 예산을 정리하고 불필요한 지출을 줄이는 쪽으로 활용하기 좋습니다.', 'Money matters favor organizing your budget and reducing unnecessary spending.'],
    ['재물운은 지출 관리가 우선입니다. 추가 구매나 공동 지출은 감당할 범위와 조건부터 확인하세요.', 'Money matters call for managing spending first. Check limits and terms before extra purchases or shared costs.'],
  ],
  love: [
    ['애정운은 먼저 안부를 묻거나 만남을 제안해 볼 만합니다. 가까운 사이에서는 함께할 계획을 꺼내 보세요.', 'Love favors reaching out or suggesting a meeting. In a close relationship, discuss something to do together.'],
    ['애정운은 대화를 이어 가고 작은 약속을 지키는 데 힘을 보태는 흐름입니다.', 'Love favors keeping a conversation going and following through on small promises.'],
    ['애정운은 서두르기보다 서로의 사정을 확인할 때입니다. 답장이나 말투만으로 마음을 단정하지 마세요.', 'Love calls for understanding each other’s circumstances before rushing. Avoid judging feelings from a reply or tone alone.'],
  ],
  move: [
    ['이동운은 방문·출장처럼 목적이 분명한 계획을 구체화해 볼 만합니다. 예약 조건과 동선을 정리해 보세요.', 'Travel favors developing plans with a clear purpose, such as a visit or work trip. Review bookings and routes.'],
    ['이동운은 필요한 외출과 방문을 준비하는 데 활용하기 좋습니다. 무리 없는 일정부터 잡아 보세요.', 'Travel favors preparing necessary outings and visits. Start with a manageable schedule.'],
    ['이동운은 일정을 촘촘히 잡기보다 여유를 두는 편이 좋습니다. 출발 전에 시간과 장소를 다시 확인하세요.', 'Travel calls for room between plans. Recheck times and places before setting off.'],
  ],
  health: [
    ['건강운은 생활 리듬을 가꾸는 주제로 읽습니다. 편안한 활동과 충분한 휴식을 일정에 넣어 보세요.', 'Wellbeing favors tending to daily routines. Make room for comfortable activity and enough rest.'],
    ['건강운은 식사·수면·휴식을 꾸준히 챙기는 데 초점을 둡니다.', 'Wellbeing centers on regular meals, sleep and rest.'],
    ['건강운은 일정을 덜어 내고 쉬는 시간을 확보하는 데 초점을 둡니다. 피곤할 때는 다른 사람의 속도를 따라가지 마세요.', 'Wellbeing calls for easing the schedule and making time to rest. Avoid matching someone else’s pace when tired.'],
  ],
};

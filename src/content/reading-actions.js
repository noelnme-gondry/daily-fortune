// 해석 요인에 맞는 생활 장면. 점수나 사건 예측이 아니라 활용할 행동 예시다.
// [id, 관련 주제, 제목(KR/EN), 활용(KR/EN), 신중한 활용(KR/EN)]
export const SHORT_READING_LABELS = {
  day: ['하루의 초점', 'Daily focus'],
  steady: ['고른 흐름의 한 주', 'A relatively even week'],
  rising: ['후반에 힘이 실리는 한 주', 'A stronger finish to the week'],
  falling: ['초반을 활용할 한 주', 'Make use of the start of the week'],
  mixed: ['강약을 나눠 볼 한 주', 'A week with contrasting days'],
};

export const READING_ACTIONS = {
  career: [
    ['brief', ['expression', 'duty'], ['보고의 핵심', 'The point of your report'], ['보고할 내용에서 결론과 요청 사항을 먼저 적어 보세요.', 'Put the conclusion and your request first in a report.'], ['설명을 늘리기 전에 상대가 결정해야 할 항목부터 확인하세요.', 'Check what the other person needs to decide before adding more detail.']],
    ['handoff', ['peer', 'change'], ['업무를 넘기는 기준', 'A clear handoff'], ['함께 하는 일의 담당자와 완료 기준을 한곳에 정리해 보세요.', 'Keep the owner and completion criteria for shared work in one place.'], ['일을 넘길 때 남은 작업과 마감 시각을 글로 남기세요.', 'Write down unfinished tasks and deadlines when handing work over.']],
    ['draft', ['expression', 'learning'], ['초안으로 시작하기', 'Start with a draft'], ['아이디어 하나를 짧은 초안으로 만들어 의견을 받아 보세요.', 'Turn one idea into a short draft and ask for feedback.'], ['전체를 고치기보다 한 부분만 시험하고 반응을 살펴보세요.', 'Try changing one part and review the response before revising everything.']],
    ['priority', ['duty', 'change'], ['마감의 우선순위', 'Deadline priorities'], ['가장 먼저 끝낼 과제를 정하고 집중할 시간을 비워 두세요.', 'Choose the first task to finish and reserve time for it.'], ['요청이 겹치면 가능한 마감부터 알리고 순서를 조율하세요.', 'When requests overlap, explain feasible deadlines and agree on the order.']],
    ['record', ['wealth', 'learning'], ['해낸 일의 기록', 'A record of your work'], ['완료한 일의 결과와 배운 점을 다음 제안에 쓸 수 있게 정리하세요.', 'Record outcomes and lessons from completed work for your next proposal.'], ['기억에 기대기보다 합의한 조건과 변경 이력을 찾아보세요.', 'Check agreed terms and the history of changes instead of relying on memory.']],
    ['scope', ['wealth', 'peer'], ['맡을 일의 범위', 'The scope of a task'], ['새 제안을 받으면 할 일과 필요한 지원을 함께 이야기하세요.', 'Discuss both the work and the support needed when a proposal arrives.'], ['바로 수락하기 전에 현재 업무와 겹치는 부분을 짚어 보세요.', 'Check where a new request overlaps with your current workload before accepting.']],
  ],
  money: [
    ['recurring', ['wealth', 'duty'], ['정기 결제 점검', 'Recurring payments'], ['정기 결제 목록에서 계속 쓸 것과 끝낼 것을 구분해 보세요.', 'Separate recurring payments you still use from those you can end.'], ['자동 결제일과 잔액을 먼저 확인해 예상 밖의 출금을 줄이세요.', 'Check payment dates and balances to reduce unexpected withdrawals.']],
    ['comparison', ['learning', 'expression'], ['구매 조건 비교', 'Compare purchase terms'], ['필요한 물건이 있다면 배송비와 유지비까지 함께 비교하세요.', 'For a planned purchase, compare delivery and upkeep costs too.'], ['할인율보다 실제로 쓸지, 반품이 가능한지부터 확인하세요.', 'Check whether you will use an item and can return it before looking at the discount.']],
    ['shared', ['peer', 'change'], ['함께 쓴 돈의 정산', 'Shared expenses'], ['공동 지출은 내역이 기억날 때 항목별로 정리해 보세요.', 'Itemize shared expenses while the details are fresh.'], ['대신 낼 비용이 있다면 금액과 정산 시점을 먼저 맞추세요.', 'Agree on the amount and reimbursement timing before covering a shared cost.']],
    ['receipt', ['duty', 'learning'], ['청구 내역 확인', 'Check a bill'], ['청구서와 영수증을 맞춰 보고 빠진 환불이나 정산이 있는지 살피세요.', 'Match bills with receipts and check for pending refunds or reimbursements.'], ['낯선 결제 내역은 추측해서 넘기지 말고 사용처부터 확인하세요.', 'Verify an unfamiliar charge with its merchant instead of guessing.']],
    ['budget', ['wealth', 'change'], ['쓸 돈의 경계', 'A spending boundary'], ['예정된 지출과 남겨 둘 금액을 나눠 적어 보세요.', 'Write down planned spending separately from the amount you want to keep.'], ['계획에 없던 소비는 이번에 쓸 수 있는 범위를 확인한 뒤 결정하세요.', 'Check your available spending limit before making an unplanned purchase.']],
    ['value', ['expression', 'peer'], ['시간과 비용의 균형', 'Time and cost'], ['작은 일을 맡거나 부탁할 때 필요한 시간과 비용을 함께 계산하세요.', 'Consider both time and cost when taking on or requesting a small task.'], ['싸다는 이유만으로 고르기보다 추가로 드는 수고까지 따져 보세요.', 'Consider the extra effort involved instead of choosing only by price.']],
  ],
  love: [
    ['invitation', ['expression', 'peer'], ['부담 없는 초대', 'A simple invitation'], ['함께 하고 싶은 일을 구체적으로 제안하고 상대가 고를 여지를 주세요.', 'Suggest a specific activity together and leave room for the other person to choose.'], ['만남을 서두르기보다 가능한 시간과 편한 방식을 먼저 물어보세요.', 'Ask about a comfortable time and format before pushing for a meeting.']],
    ['listening', ['learning', 'change'], ['마음을 확인하는 질문', 'A question that listens'], ['최근 마음에 남은 일이 있는지 묻고 답을 끝까지 들어 보세요.', 'Ask what has been on their mind lately and listen to the full answer.'], ['짧은 답장에 의미를 붙이기 전에 지금 이야기할 여유가 있는지 확인하세요.', 'Before interpreting a short reply, ask whether there is time to talk.']],
    ['promise', ['duty', 'wealth'], ['작은 약속 지키기', 'Keep a small promise'], ['함께 정한 작은 약속 하나를 행동으로 옮겨 보세요.', 'Follow through on one small promise you made together.'], ['지키기 어려운 약속은 늦기 전에 사정을 설명하고 다시 정하세요.', 'Explain and reschedule a promise you cannot keep before it becomes overdue.']],
    ['thanks', ['peer', 'expression'], ['구체적인 고마움', 'Specific appreciation'], ['고마웠던 행동을 하나 짚어 짧게 전해 보세요.', 'Mention one specific thing they did that you appreciated.'], ['상대의 반응을 기대하며 떠보기보다 내 마음을 짧고 분명하게 말하세요.', 'State your feelings clearly instead of testing for a particular response.']],
    ['space', ['change', 'learning'], ['각자의 시간', 'Room for each other'], ['함께할 시간과 각자 쉬는 시간을 미리 나눠 이야기해 보세요.', 'Discuss time together and time to rest separately.'], ['연락 간격이 다르다면 서운함을 쌓기 전에 편한 빈도를 맞춰 보세요.', 'If contact habits differ, agree on a comfortable frequency before resentment builds.']],
    ['plans', ['wealth', 'duty'], ['다음 만남의 준비', 'Plan the next meeting'], ['다음 만남에서 장소와 비용 등 현실적인 부분을 함께 정해 보세요.', 'Decide practical details such as place and cost for your next meeting together.'], ['상대가 원할 것이라 단정하지 말고 계획에서 바꾸고 싶은 점을 물어보세요.', 'Ask what they would change in a plan instead of assuming their preferences.']],
  ],
  move: [
    ['route', ['change', 'learning'], ['동선 미리 보기', 'Preview your route'], ['방문할 곳을 지도에 모아 보고 이동 순서를 정리하세요.', 'Mark your destinations on a map and plan their order.'], ['가장 빠른 길만 고집하지 말고 돌아갈 경로도 하나 확인하세요.', 'Check an alternative route as well as the fastest one.']],
    ['booking', ['wealth', 'duty'], ['예약 조건 확인', 'Check booking terms'], ['예약이 필요한 일정은 시간과 변경 조건을 함께 기록하세요.', 'Record times and change terms for appointments that need booking.'], ['확정 전에 취소 조건과 추가 비용을 확인하세요.', 'Check cancellation terms and extra costs before confirming a booking.']],
    ['buffer', ['duty', 'change'], ['이동 사이의 여유', 'Space between trips'], ['일정 사이에 짐을 챙기고 쉬어 갈 시간을 남겨 두세요.', 'Leave time between appointments to pack and take a break.'], ['연속된 약속은 이동 시간을 다시 계산하고 무리한 간격을 줄이세요.', 'Recheck travel times between appointments and avoid overly tight connections.']],
    ['meeting', ['peer', 'expression'], ['만날 장소 맞추기', 'Agree on a meeting point'], ['약속 장소는 출입구나 눈에 띄는 지점까지 구체적으로 정하세요.', 'Agree on a specific entrance or landmark for a meeting.'], ['장소가 바뀌면 모두가 새 주소를 확인했는지 살펴보세요.', 'When a venue changes, check that everyone has the new address.']],
    ['packing', ['wealth', 'learning'], ['챙길 물건 줄이기', 'Pack what you need'], ['목적에 맞는 준비물만 추려 이동을 가볍게 해 보세요.', 'Choose only the supplies needed for the purpose of your trip.'], ['출발 전에 필수 물건과 귀가에 필요한 수단부터 확인하세요.', 'Before leaving, check essential items and how you will get home.']],
    ['visit', ['expression', 'peer'], ['방문의 목적', 'A purpose for your visit'], ['직접 찾아갈 일이 있다면 만나서 확인할 질문을 미리 적으세요.', 'Write down questions to check in person before a visit.'], ['굳이 이동하지 않아도 되는 일인지 먼저 연락해 확인하세요.', 'Contact the destination first to see whether a trip is necessary.']],
  ],
  health: [
    ['rest', ['duty', 'change'], ['일정 사이의 휴식', 'Rest between tasks'], ['집중하는 시간 사이에 잠깐 일어나 쉬는 시간을 넣어 보세요.', 'Add brief breaks to get up between periods of focused work.'], ['피곤한데 계속 밀어붙이고 있다면 덜 급한 일부터 줄이세요.', 'If you are pushing through fatigue, reduce less urgent tasks first.']],
    ['sleep', ['wealth', 'learning'], ['잠들기 전의 정리', 'Wind down before sleep'], ['잠들기 전 끝낼 일을 정해 두고 휴식 시간을 확보하세요.', 'Set an endpoint for tasks before bed and protect time to rest.'], ['늦게까지 남은 일을 붙잡기보다 쉬기 전에 해야 할 것만 추리세요.', 'Before resting, narrow unfinished work to what truly needs doing.']],
    ['meal', ['expression', 'wealth'], ['식사 시간 챙기기', 'Make room for meals'], ['바쁜 일정에도 식사할 시간을 미리 남겨 두세요.', 'Leave time for meals even in a busy schedule.'], ['일정에 쫓겨 식사를 자꾸 미룬다면 약속 사이의 간격을 조정하세요.', 'If your schedule keeps delaying meals, adjust the gaps between appointments.']],
    ['pace', ['peer', 'change'], ['내 몸에 맞는 속도', 'Your own pace'], ['가벼운 활동은 몸 상태를 살피며 편한 강도로 이어 가세요.', 'Keep light activity at a comfortable level and notice how you feel.'], ['다른 사람의 속도를 따라가기보다 지금 편안한 범위에서 움직이세요.', 'Move within a comfortable range instead of matching someone else’s pace.']],
    ['desk', ['duty', 'learning'], ['오래 머무는 자리', 'Your everyday space'], ['오래 앉아 있는 자리의 높이와 자주 쓰는 물건의 위치를 살펴보세요.', 'Review the height of your seat and the placement of frequently used items.'], ['한 자세로 오래 버티고 있다면 작업을 잠시 끊고 자세를 바꿔 보세요.', 'If you have held one position for a long time, pause and change position.']],
    ['unwind', ['expression', 'peer'], ['긴장을 푸는 시간', 'Time to unwind'], ['즐거운 활동 하나를 짧게라도 일정에 넣어 보세요.', 'Make a little time for an activity you enjoy.'], ['쉬는 시간까지 할 일로 채우지 말고 아무 일정 없는 틈을 남기세요.', 'Leave some unscheduled time instead of filling every break with tasks.']],
  ],
  social: [
    ['request', ['duty', 'expression'], ['부탁을 명확하게', 'Make a clear request'], ['부탁할 일이 있다면 원하는 도움과 기한을 구체적으로 말해 보세요.', 'When asking for help, state what you need and by when.'], ['상대가 알아줄 것이라 기대하기보다 필요한 부분을 직접 설명하세요.', 'Explain what you need instead of expecting the other person to infer it.']],
    ['roles', ['peer', 'wealth'], ['서로의 역할', 'Each person’s role'], ['여럿이 하는 일에서는 잘할 수 있는 역할부터 나눠 보세요.', 'In a group task, start by sharing roles that fit each person.'], ['모두의 몫을 떠안지 않도록 맡을 범위를 먼저 정하세요.', 'Set the scope of your role so you do not take on everyone’s share.']],
    ['reply', ['learning', 'change'], ['답장 전에 확인', 'Check before replying'], ['연락이 뜸했던 사람에게 구체적인 안부 하나를 물어보세요.', 'Ask a specific question about how someone you have not contacted recently is doing.'], ['뜻이 모호한 메시지는 바로 반응하기보다 어떤 의미인지 되물어 보세요.', 'Ask what an unclear message means before reacting.']],
    ['credit', ['peer', 'expression'], ['도움에 대한 답례', 'Acknowledge help'], ['도움을 받은 일이 있다면 무엇이 유용했는지 구체적으로 전하세요.', 'Tell someone exactly how their help was useful.'], ['내 의도를 길게 해명하기보다 상대가 불편했던 지점을 먼저 들어 보세요.', 'Hear what made the other person uncomfortable before explaining your intentions.']],
    ['agreement', ['duty', 'wealth'], ['합의 내용 남기기', 'Record an agreement'], ['대화에서 정한 내용은 짧게 정리해 함께 확인해 보세요.', 'Summarize what was agreed in a conversation and confirm it together.'], ['기억이 다르면 누가 맞는지 따지기 전에 남아 있는 기록을 확인하세요.', 'If recollections differ, check available records before debating who is right.']],
    ['boundary', ['change', 'learning'], ['대화의 경계', 'Boundaries in conversation'], ['서로 편한 연락 시간이나 이야기할 범위를 맞춰 보세요.', 'Agree on comfortable contact times or the scope of a conversation.'], ['바로 답하기 어려운 부탁에는 생각할 시간이 필요하다고 말하세요.', 'Say you need time to consider a request you cannot answer immediately.']],
  ],
  study: [
    ['question', ['learning', 'expression'], ['질문 하나 깊게 보기', 'Explore one question'], ['궁금한 점 하나를 정해 자료를 읽고 내 말로 설명해 보세요.', 'Choose one question, read about it and explain it in your own words.'], ['자료를 계속 늘리기보다 지금 풀어야 할 질문을 먼저 좁히세요.', 'Narrow the question you need to answer before gathering more material.']],
    ['practice', ['duty', 'wealth'], ['배운 내용 써 보기', 'Use what you learned'], ['읽은 내용과 연결되는 문제나 작은 실습을 하나 해 보세요.', 'Try one exercise or small practice task connected to what you read.'], ['분량을 채우려 서두르기보다 한 문제의 풀이 과정을 확인하세요.', 'Review the steps of one problem instead of rushing to cover more material.']],
    ['review', ['learning', 'change'], ['헷갈린 지점 복습', 'Review a confusing point'], ['틀리거나 헷갈렸던 부분을 다시 보고 이유를 적어 보세요.', 'Revisit a mistake or confusing point and note the reason.'], ['안다고 느끼는 내용도 답을 가린 채 직접 떠올려 보세요.', 'Test familiar material by recalling it without looking at the answer.']],
    ['explain', ['peer', 'expression'], ['설명하며 배우기', 'Learn by explaining'], ['배운 것을 다른 사람에게 짧게 설명하고 질문을 받아 보세요.', 'Briefly explain what you learned to someone and invite questions.'], ['모르는 부분을 넘기지 말고 어디서 이해가 끊겼는지 질문하세요.', 'Ask where your understanding broke down instead of skipping an unclear part.']],
    ['routine', ['duty', 'change'], ['집중할 구간 정하기', 'Set a focus interval'], ['끝낼 범위를 작게 정하고 방해받지 않는 시간을 확보하세요.', 'Choose a small amount to finish and protect uninterrupted time.'], ['계획이 밀리면 전부 만회하려 하지 말고 다음 한 단계를 정하세요.', 'If you fall behind, choose the next step instead of trying to catch up all at once.']],
    ['source', ['wealth', 'peer'], ['자료의 근거 확인', 'Check the source'], ['참고한 자료의 출처와 핵심 근거를 함께 남겨 두세요.', 'Keep the source and key evidence alongside your notes.'], ['요약만 보고 판단하지 말고 원문에서 조건과 예외를 찾아보세요.', 'Check conditions and exceptions in the original instead of relying only on a summary.']],
  ],
};

export const ZODIAC_RELATION = {
  합: ['육합은 상대와 협의하고 도움을 주고받는 주제로 읽습니다.', 'Six Combination is read as a theme of agreement and mutual help.'],
  삼합: ['삼합은 여러 사람의 역할과 공통 목표를 맞추는 주제로 읽습니다.', 'Three Combination is read as aligning people’s roles and shared goals.'],
  같음: ['같은 지지가 겹쳐 자기 방식을 돌아보는 데 초점을 둡니다.', 'The repeated branch puts the focus on reviewing your usual approach.'],
  충: ['충은 일정과 환경의 변화를 점검하는 주제로 읽습니다.', 'Clash is read as a theme of reviewing changes in plans and surroundings.'],
  형: ['형은 절차와 말의 정확성을 점검하는 주제로 읽습니다.', 'Penalty is read as checking procedures and precise communication.'],
  원진: ['원진은 감정을 짐작하기보다 의도를 확인하는 주제로 읽습니다.', 'Resentment is read as checking intentions instead of guessing feelings.'],
  해: ['해는 부탁과 기대가 엇갈리지 않도록 살피는 주제로 읽습니다.', 'Harm is read as checking for mismatched requests and expectations.'],
  파: ['파는 바뀐 약속과 미완료된 일을 정리하는 주제로 읽습니다.', 'Break is read as reviewing changed agreements and unfinished tasks.'],
  없음: ['뚜렷한 합충이 없어 오행 관계를 중심으로 해석합니다.', 'With no major branch relationship, the reading centers on the elements.'],
};

export const ELEMENT_THEME = [
  ['동료·역할 분담', 'peers and shared roles'],
  ['표현·실행', 'expression and execution'],
  ['비용·관리', 'costs and management'],
  ['책임·절차', 'responsibility and procedures'],
  ['배움·지원', 'learning and support'],
];

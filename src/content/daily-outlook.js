// 개인 일간 운세의 분야별 해석. 점수대는 기존 엔진의 bandOf 결과를 받는다.
// 각 행은 [흐름, 활용할 기회, 주의할 점]이며 각 문장은 [KR, EN]이다.
// 실제 사건·수익·건강 상태를 예측하는 문구는 쓰지 않는다.
export const DAILY_OVERVIEW = {
  high: ['여러 일에 힘을 나누기보다 중요한 일 하나에 적극성을 발휘해 볼 만한 하루입니다. 미뤄 둔 제안이나 대화를 꺼내되, 분야마다 흐름이 다르므로 강점이 있는 운부터 활용해 보세요.', 'The day favors putting initiative into one important matter. Revisit a proposal or conversation you have delayed, starting with the stronger areas of your reading.'],
  good: ['익숙한 일에서 한 걸음 더 나아가 보기 좋은 하루입니다. 큰 변화를 한꺼번에 만들기보다 진행 중인 일과 관계를 이어 가는 쪽에 무게를 두면 좋겠습니다.', 'The day favors taking a manageable step forward in familiar matters. Give attention to work and relationships already underway rather than changing everything at once.'],
  mid: ['순조롭게 풀어 갈 부분과 조율이 필요한 부분이 함께 있는 하루입니다. 모든 일에 같은 속도를 내기보다, 힘을 쓸 분야와 여유를 둘 분야를 나누어 보세요.', 'The day combines room for progress with matters that need adjustment. Choose where to put your effort and where to leave more room, instead of keeping the same pace everywhere.'],
  low: ['새로운 일을 늘리기보다 지금 가진 것과 진행 중인 일을 살피는 쪽에 무게가 실리는 하루입니다. 답이나 결론을 서두르지 말고, 약속의 범위와 내 여유를 확인하며 움직여 보세요.', 'The day calls for tending to existing commitments before taking on more. Allow time for answers and decisions, and check both the scope of your promises and your available capacity.'],
};

export const DAILY_OUTLOOK = {
  career: {
    high: [
      ['일에서 주도권을 잡고 준비한 내용을 드러내는 쪽에 힘이 실립니다. 맡은 역할 안에만 머무르기보다, 그동안 쌓아 둔 의견이나 결과물을 한 단계 앞으로 내놓아 볼 만합니다.', 'Work favors taking initiative and showing what you have prepared. There is room to bring an idea or completed piece of work forward beyond your usual responsibilities.'],
      ['기획안 제안, 업무 협의, 성과 공유처럼 내 생각을 구체적으로 전하는 자리를 활용해 보세요. 새 일을 벌이는 것보다 이미 준비한 내용을 꺼내는 쪽이 이 흐름에 어울립니다.', 'Make use of proposals, work discussions and opportunities to share completed work. Bring forward something prepared rather than launching an entirely new undertaking.'],
      ['적극성이 강해질수록 혼자 결론을 내리거나 다른 사람의 몫까지 떠안기 쉽습니다. 의견을 내는 것과 책임을 확정하는 것은 구분하고, 마감과 담당 범위를 맞춰 보세요.', 'Initiative can turn into deciding alone or taking on someone else’s share. Separate a suggestion from a commitment, and agree on deadlines and responsibilities.'],
    ],
    good: [
      ['직장운은 새로운 판을 크게 벌이기보다 지금 하는 일에서 신뢰를 쌓는 흐름입니다. 작은 진척이라도 마무리해 보여주는 쪽에 무게가 실리며, 익숙한 업무를 다음 단계로 이어 가기 좋겠습니다.', 'Work favors building trust through tasks already in progress. Finishing and sharing a small piece of work fits the reading better than opening a large new project.'],
      ['협업 중 막힌 부분을 묻거나 중간 결과를 공유해 보세요. 혼자 완성할 때까지 기다리기보다 필요한 피드백을 받으며 움직이는 쪽으로 활용할 만합니다.', 'Ask about a blocked task or share an interim result. Seek useful feedback while moving forward rather than waiting until everything is finished alone.'],
      ['무난하게 진행된다는 이유로 확인 절차를 건너뛰지 마세요. 특히 구두로 바뀐 요청은 기존에 합의한 내용과 다른 부분이 없는지 짚어 두는 편이 좋습니다.', 'Keep the usual checks even when work feels straightforward. For a changed verbal request, check how it differs from the original agreement.'],
    ],
    mid: [
      ['일을 밀고 나가는 힘과 주변에 맞춰야 하는 요구를 함께 살필 때입니다. 성과를 크게 넓히기보다 진행 중인 업무의 순서와 완성도를 다듬는 쪽으로 읽는 하루입니다.', 'Work calls for balancing progress with the demands around you. The reading favors refining the order and quality of current tasks before expanding the outcome.'],
      ['수정할 부분이 명확한 일, 마감이 가까운 일부터 정리해 보세요. 새 제안은 바로 확정하기보다 초안으로 의견을 받아 보는 식으로 여지를 남길 수 있습니다.', 'Start with tasks that have clear revisions or approaching deadlines. Keep a new proposal open as a draft while gathering views.'],
      ['업무 속도나 표현 방식이 다르다고 의도를 단정하면 협의가 더 어려워질 수 있습니다. 답이 늦은 일은 재촉하기 전에 상대가 필요한 정보부터 확인해 보세요.', 'Avoid treating a different pace or style as evidence of someone’s intentions. Before pressing for an answer, check what information the other person needs.'],
    ],
    low: [
      ['직장운은 성과를 더 얹기보다 부담을 조절하고 실수를 줄이는 쪽에 무게가 실립니다. 평가나 결과를 빨리 끌어내려 하기보다, 맡은 일의 기준을 다시 맞추는 하루로 활용해 보세요.', 'Work favors managing pressure and reducing avoidable mistakes. Use the day to clarify the standards for your tasks rather than pressing for quick recognition or results.'],
      ['모호한 요청을 구체화하거나 누락된 자료를 보완하는 데 집중할 만합니다. 다른 사람의 확인이 필요한 부분을 분리하면 지금 처리할 수 있는 일이 더 분명해집니다.', 'Focus on clarifying vague requests or filling gaps in materials. Separate matters awaiting another person’s confirmation from what you can handle now.'],
      ['부담을 느낀 상태에서 약속을 늘리거나 감정적으로 답하지 않도록 여유를 두세요. 처리할 수 있는 양을 먼저 밝히고, 일정 조율이 필요한 일은 미리 이야기하는 편이 좋습니다.', 'Leave room before adding commitments or replying under pressure. State your capacity and raise scheduling needs early.'],
    ],
  },
  money: {
    high: [
      ['금전운은 돈의 흐름을 적극적으로 정리하고 실속을 챙기는 쪽에 힘이 실립니다. 막연히 큰 이익을 기대하기보다 이미 받을 몫과 거래 조건을 살피는 데 활용해 볼 만합니다.', 'Money matters favor actively reviewing cash flow and practical value. Focus on money already due and the terms in front of you rather than expecting a large windfall.'],
      ['미뤄 둔 정산, 환급, 비용 청구를 확인하거나 같은 구매의 조건을 비교해 보세요. 새 지출을 늘리는 것보다 놓치고 있던 몫을 챙기는 데 초점을 둘 수 있습니다.', 'Follow up on settlements, refunds or expense claims, or compare terms for a planned purchase. Give attention to overlooked amounts before adding spending.'],
      ['높은 점수가 실제 수익이나 당첨을 보장하지는 않습니다. 좋은 조건처럼 보여도 총비용과 환불 조건을 확인하고, 감당할 수 있는 예산 안에서 판단하세요.', 'A high score does not guarantee profit or a prize. Check total costs and refund terms even when an offer looks attractive, and stay within your budget.'],
    ],
    good: [
      ['금전운은 크게 불리기보다 들어오고 나가는 돈의 균형을 맞추는 흐름입니다. 필요한 지출과 미뤄도 되는 지출을 나누고, 작은 낭비를 정리하는 쪽에 무게가 실립니다.', 'Money matters favor balancing what comes in and goes out. Distinguish necessary purchases from those that can wait, and attend to small recurring costs.'],
      ['예정된 구매의 가격과 사용 기간을 함께 비교하거나 자동 결제 내역을 살펴보세요. 생활에 실제로 쓰는 것의 가치를 따져 보는 데 활용하기 좋겠습니다.', 'Compare price alongside likely use for a planned purchase, or review automatic payments. Consider the value of what you actually use.'],
      ['할인이나 주변의 추천 때문에 원래 없던 지출을 만들지 않도록 하세요. 함께 내는 돈은 금액뿐 아니라 나누는 기준까지 먼저 맞춰 두는 편이 좋습니다.', 'Avoid creating an unplanned expense just because of a discount or recommendation. For shared costs, agree on how they will be divided as well as the amount.'],
    ],
    mid: [
      ['금전운은 수입에 대한 기대와 실제 지출을 구분해 살피는 흐름입니다. 여유가 생길 것이라는 예상만으로 먼저 쓰기보다, 확정된 금액 안에서 움직이는 쪽이 어울립니다.', 'Money matters call for separating expected income from actual spending. Work with confirmed amounts rather than spending ahead of a hoped-for surplus.'],
      ['아직 결정하지 않은 구매를 다시 비교하고 가까운 결제 일정을 확인해 보세요. 작은 금액이라도 여러 건이 겹치는 부분을 정리하는 데 의미가 있습니다.', 'Revisit a purchase you have not decided on and check upcoming payment dates. Review places where several small charges add up.'],
      ['급한 권유나 한정된 시간 때문에 결정을 서두르지 마세요. 공동 지출이나 돈을 빌려주는 일은 관계에 대한 기대와 실제 조건을 나누어 살피는 편이 좋습니다.', 'Allow time for decisions under urgent or time-limited offers. For shared spending or lending, distinguish hopes about the relationship from the actual terms.'],
    ],
    low: [
      ['금전운은 확장보다 지키는 쪽에 무게가 실립니다. 새로운 수입원을 서둘러 찾거나 손해를 만회하려 하기보다, 이미 정해진 지출과 약속을 차분히 살피는 하루로 읽습니다.', 'Money matters favor preserving resources before expansion. Review existing expenses and commitments calmly rather than rushing after new income or trying to recoup a loss.'],
      ['수수료, 중복 결제, 잊고 있던 구독처럼 확인만으로 정리할 수 있는 부분을 살펴보세요. 필요하지 않은 구매를 보류하는 것도 이 흐름을 활용하는 방법입니다.', 'Check fees, duplicate payments and forgotten subscriptions. Deferring an unnecessary purchase is another way to use this reading.'],
      ['낮은 점수가 실제 손실을 예고하는 것은 아닙니다. 불안해서 급하게 움직이지 말고, 금액이 큰 약속은 예산과 조건을 확인한 뒤 판단하세요.', 'A low score does not predict an actual loss. Avoid acting hastily out of worry, and check your budget and the terms before a large commitment.'],
    ],
  },
  love: {
    high: [
      ['연애운은 마음을 표현하고 서로의 거리를 좁혀 보는 쪽에 힘이 실립니다. 관계를 한 번에 바꾸려 하기보다, 관심을 드러내고 대화를 이어 갈 계기를 만드는 데 활용해 보세요.', 'Love favors expressing interest and exploring closeness. Create an opening for conversation rather than trying to change the relationship all at once.'],
      ['새로운 인연을 알아가는 중이라면 부담 없는 만남을 제안해 볼 만합니다. 연인이 있다면 함께 즐길 작은 계획이나 평소 고마웠던 마음을 꺼내 보세요.', 'When getting to know someone, consider suggesting a low-pressure meeting. With a partner, discuss a small shared plan or express appreciation.'],
      ['내 마음이 앞서도 상대의 속도와 의사는 따로 확인해야 합니다. 호의 하나를 확답으로 받아들이거나 높은 점수만으로 관계를 확정하지 않도록 하세요.', 'Check the other person’s pace and wishes even when you feel ready. A kind gesture or a high score does not settle the status of a relationship.'],
    ],
    good: [
      ['연애운은 강한 자극보다 편안한 교류와 꾸준한 관심에 무게가 실립니다. 특별한 말을 준비하기보다 서로의 일상을 묻고 작은 약속을 지키는 쪽으로 관계를 이어 가기 좋겠습니다.', 'Love favors comfortable exchanges and consistent interest. Asking about everyday life and keeping small promises fits better than preparing a dramatic gesture.'],
      ['알아가는 사이에서는 공통 관심사로 대화를 이어 보세요. 가까운 사이에서는 상대가 원하는 배려를 묻고, 함께하기 편한 일정을 맞춰 볼 만합니다.', 'Explore a shared interest with someone you are getting to know. In a close relationship, ask what support is welcome and find a convenient time together.'],
      ['익숙한 사이라고 마음을 다 안다고 생각하지 마세요. 답장의 길이나 속도보다 실제로 나눈 말과 약속을 기준으로 보는 편이 좋습니다.', 'Familiarity does not mean knowing every feeling. Give more weight to what was actually said and agreed than to the length or speed of a reply.'],
    ],
    mid: [
      ['연애운은 다가가고 싶은 마음과 서로의 사정을 함께 살필 때입니다. 관계의 결론을 내리기보다 대화의 온도와 기대를 맞추는 쪽에 무게가 실리는 하루입니다.', 'Love calls for balancing a wish for closeness with each person’s circumstances. Attend to the tone of conversation and shared expectations before seeking a conclusion.'],
      ['연락을 이어 가는 중이라면 답하기 편한 안부부터 건네 보세요. 연인과는 미뤄 둔 작은 불편을 한 가지씩 꺼내며 원하는 바를 구체적으로 이야기할 수 있습니다.', 'If staying in touch, begin with an easy check-in. With a partner, discuss one small unresolved concern and describe what you would like.'],
      ['모호한 말에 의미를 더해 혼자 결론내리지 않도록 하세요. 서운함이 올라오면 바로 따지기보다 어떤 말이나 행동이 불편했는지 나누어 보는 편이 좋습니다.', 'Avoid filling in an ambiguous message with assumptions. If upset, identify the particular words or actions that bothered you before responding.'],
    ],
    low: [
      ['연애운은 관계의 진도를 서두르기보다 감정의 여유를 되찾는 쪽에 무게가 실립니다. 확인받고 싶은 마음이 크더라도 상대의 반응 하나로 내 가치나 관계 전체를 판단하지 마세요.', 'Love favors emotional room before moving the relationship forward. Even when reassurance feels important, one response does not define your worth or the whole relationship.'],
      ['새로운 만남에서는 서로 편한 거리부터 살피고, 연인이 있다면 대화할 여건을 먼저 맞춰 보세요. 당장 답을 얻는 것보다 차분히 이야기할 시간을 잡는 데 의미가 있습니다.', 'In a new connection, explore a comfortable distance. With a partner, arrange a calm time to talk instead of seeking an immediate answer.'],
      ['확답을 재촉하거나 서운함을 시험하는 표현은 피하는 편이 좋습니다. 낮은 점수가 이별이나 거절을 뜻하는 것은 아니니, 중요한 대화는 실제 상황을 기준으로 이어 가세요.', 'Avoid pressing for certainty or testing affection through hurt feelings. A low score does not mean rejection or separation; ground important conversations in the actual situation.'],
    ],
  },
  move: {
    high: [
      ['이동운은 익숙한 자리에서 벗어나 목적 있는 변화를 시도하는 쪽에 힘이 실립니다. 방문이나 출장처럼 필요한 이동을 구체화하고, 새로운 환경을 직접 살펴보는 데 활용해 볼 만합니다.', 'Travel and changes favor purposeful movement beyond a familiar setting. Develop a necessary visit or work trip, or explore a new environment firsthand.'],
      ['미뤄 둔 방문, 답사, 활동 장소 변경처럼 이유가 분명한 계획을 살펴보세요. 큰 결정을 바로 내리기보다 실제 동선과 환경을 확인하는 단계에 어울립니다.', 'Consider a delayed visit, a site inspection or a purposeful change of venue. Use it to check routes and surroundings before making a major decision.'],
      ['움직일 의욕이 생겨도 일정을 촘촘히 채우지 마세요. 높은 이동운이 교통 상황이나 안전을 보장하지 않으므로 날씨와 예약 조건은 별도로 확인해야 합니다.', 'Keep space between plans even when eager to go. A high score does not guarantee traffic conditions or safety; check the weather and booking terms separately.'],
    ],
    good: [
      ['이동운은 일상의 동선을 다듬고 필요한 외출을 준비하는 흐름입니다. 먼 곳으로 크게 움직이기보다, 목적이 정해진 방문이나 익숙한 길의 작은 변화를 살펴보기 좋겠습니다.', 'Travel favors refining everyday routes and preparing necessary outings. Consider a purposeful visit or a small change to a familiar route.'],
      ['가까운 방문 일정을 맞추거나 이동 수단을 비교해 보세요. 장소를 바꿔 집중할 일이 있다면 비용과 시간을 감당할 수 있는 범위에서 시도할 만합니다.', 'Arrange a nearby visit or compare transport options. If a change of setting would help with a task, keep the time and cost manageable.'],
      ['익숙한 장소라도 운영 시간이나 만날 위치가 바뀌지 않았는지 확인하세요. 이동 자체보다 도착해서 해야 할 일까지 고려해 시간을 잡는 편이 좋습니다.', 'Even for a familiar place, check opening hours and the meeting point. Allow time for what you need to do on arrival as well as the journey.'],
    ],
    mid: [
      ['이동운은 움직이는 것 자체보다 계획에 여유가 있는지를 살필 때입니다. 큰 변화를 한꺼번에 추진하기보다 필요한 일정의 순서와 경로를 조율하는 쪽으로 읽습니다.', 'Travel calls for examining how much room your plans allow. Adjust the order and route of necessary journeys before attempting several major changes.'],
      ['방문 목적이 겹치는 곳을 묶거나 예약 내용을 다시 정리해 보세요. 이동이 꼭 필요하지 않은 일은 다른 방식으로 처리할 수 있는지도 살펴볼 만합니다.', 'Group visits with related purposes or review bookings. Consider whether a task really needs a journey or can be handled another way.'],
      ['시간을 빠듯하게 잡고 다음 약속까지 연달아 넣지 마세요. 변경이 생겼을 때 연락할 곳과 대안을 미리 확인하면 일정에 여지를 둘 수 있습니다.', 'Avoid stacking appointments with tight travel times. Identify whom to contact and an alternative if plans change.'],
    ],
    low: [
      ['이동운은 넓게 움직이기보다 꼭 필요한 일정에 집중하는 쪽에 무게가 실립니다. 멀리 갈수록 좋다고 해석하기보다, 이동의 이유와 부담을 함께 살피는 하루로 활용해 보세요.', 'Travel favors concentrating on necessary plans. Weigh the purpose and burden of a journey rather than assuming that going farther is better.'],
      ['불필요한 왕복을 줄이고 꼭 가야 하는 장소의 위치와 준비물을 확인해 보세요. 급하지 않은 변경은 정보를 더 모은 뒤 정해도 좋겠습니다.', 'Reduce unnecessary return trips and check locations and what to bring. For a change that is not urgent, gather more information before deciding.'],
      ['낮은 점수가 사고나 이동 실패를 예고하는 것은 아닙니다. 운세 때문에 필요한 일정을 취소하기보다 실제 교통·날씨·예약 상황을 확인하며 여유를 두세요.', 'A low score does not predict an accident or failed journey. Check actual traffic, weather and booking conditions, and allow room in your schedule.'],
    ],
  },
  health: {
    high: [
      ['건강운은 몸을 더 몰아붙이기보다 생활의 균형을 가꾸는 주제로 읽습니다. 활동과 쉼을 고르게 배치하고, 나에게 편안한 하루의 리듬을 만들어 보는 데 초점을 둘 수 있습니다.', 'Wellbeing is read as tending to balance in daily life. Give attention to a comfortable rhythm that includes both activity and rest.'],
      ['평소 무리 없이 해 오던 활동을 이어 가거나 식사와 쉬는 시간을 일정에 넣어 보세요. 한꺼번에 바꾸기보다 유지할 수 있는 작은 습관을 고르는 편이 좋습니다.', 'Continue a familiar, comfortable activity and make time for meals and breaks. Choose a small sustainable habit instead of changing everything at once.'],
      ['점수가 높아도 실제 몸 상태나 회복력을 뜻하지 않습니다. 피곤하거나 불편하다면 계획보다 몸의 신호를 우선하고, 무리한 활동을 추가하지 마세요.', 'A high score does not indicate physical condition or recovery. If tired or uncomfortable, give those signals priority over plans and avoid adding strain.'],
    ],
    good: [
      ['건강운은 특별한 변화를 만들기보다 기본적인 생활 리듬을 꾸준히 챙기는 주제입니다. 해야 할 일 사이에 쉼을 두고, 익숙한 돌봄을 이어 가는 쪽에 무게를 둡니다.', 'Wellbeing centers on keeping a steady daily routine. Leave breaks between responsibilities and continue familiar ways of looking after yourself.'],
      ['놓치기 쉬운 식사 시간이나 잠자리에 들기 전의 여유를 돌아보세요. 바쁜 일정 속에서도 내가 조절할 수 있는 한 가지를 챙기는 데 의미가 있습니다.', 'Review meals that are easy to miss or the time available before bed. Focus on one part of a busy day that you can adjust.'],
      ['다른 사람의 활동량이나 생활 방식에 맞추려 무리하지 마세요. 이 점수로 건강의 좋고 나쁨을 판단할 수 없으므로 실제 컨디션에 맞춰 계획하세요.', 'Avoid stretching yourself to match someone else’s activity or routine. This score cannot assess health; plan around how you actually feel.'],
    ],
    mid: [
      ['건강운은 일정의 밀도와 쉬는 시간을 함께 돌아보는 주제로 읽습니다. 더 많은 일을 해내는 것보다 하루를 무리 없이 이어 갈 여유가 있는지 살피는 쪽에 초점을 둡니다.', 'Wellbeing invites a review of schedule density and time to rest. Focus on having room to get through the day comfortably rather than fitting in more.'],
      ['연달아 잡힌 약속 사이를 비우거나 늦게까지 미룬 일을 줄여 보세요. 짧게라도 업무에서 벗어나는 시간을 따로 정해 둘 수 있습니다.', 'Leave room between consecutive appointments or reduce tasks pushed late into the day. Set aside a brief period away from work.'],
      ['피로를 참아야 할 신호로 받아들이거나 점수에 맞춰 몸 상태를 짐작하지 마세요. 이 해석은 생활을 돌아보는 참고이며 건강 상태나 질환을 판단하지 않습니다.', 'Avoid treating tiredness as something to push through or guessing your condition from the score. This is a reflection on routines, not an assessment of health or illness.'],
    ],
    low: [
      ['건강운은 일을 더 얹기보다 부담을 덜고 쉬는 자리를 확보하는 주제입니다. 하루의 목표를 낮추라는 뜻보다는, 내 여유 안에서 할 일의 양과 순서를 정해 보는 쪽으로 읽습니다.', 'Wellbeing centers on easing demands and making room to rest. Consider the amount and order of tasks that fit your capacity.'],
      ['미뤄도 되는 약속과 꼭 해야 할 일을 나누고, 식사나 휴식이 밀리지 않게 일정을 살펴보세요. 도움을 구하거나 역할을 나누는 방법도 생각해 볼 만합니다.', 'Separate commitments that can wait from essential tasks, leaving room for meals and breaks. Consider asking for help or sharing responsibilities.'],
      ['낮은 점수는 질병이나 컨디션 저하를 예측하지 않습니다. 실제로 불편한 증상이 있다면 운세로 원인을 찾지 말고, 몸 상태에 맞는 도움을 구하세요.', 'A low score does not predict illness or a decline in physical condition. If you have symptoms, seek appropriate help rather than looking to the reading for a cause.'],
    ],
  },
  social: {
    high: [
      ['대인운은 혼자 해결하기보다 사람과 연결되며 길을 넓혀 보는 쪽에 힘이 실립니다. 도움을 요청하거나 서로의 경험을 나누는 자리를 활용하되, 관계의 넓이보다 주고받는 내용에 집중해 보세요.', 'Relationships favor seeking connections rather than solving everything alone. Ask for help or exchange experience, focusing on the substance of an exchange rather than the number of contacts.'],
      ['협업 제안, 미뤄 둔 안부, 경험 있는 사람에게 묻는 일을 꺼내 볼 만합니다. 부탁할 내용과 내가 보탤 수 있는 부분을 함께 전해 보세요.', 'Consider a collaboration, a delayed check-in or a question for someone experienced. Explain both what you need and what you can contribute.'],
      ['좋은 분위기에서도 모든 부탁을 받아들일 필요는 없습니다. 친밀함과 업무상 책임을 구분하고, 다른 사람의 이야기를 옮길 때는 동의를 먼저 확인하세요.', 'A warm atmosphere does not oblige you to accept every request. Distinguish closeness from work responsibilities and check consent before sharing someone else’s story.'],
    ],
    good: [
      ['대인운은 넓은 인맥을 새로 만들기보다 가까운 관계의 신뢰를 이어 가는 흐름입니다. 작은 약속을 지키고 필요한 소식을 나누는 교류에 무게가 실립니다.', 'Relationships favor maintaining trust in existing connections. Small commitments and useful exchanges fit this reading better than widening a network rapidly.'],
      ['함께 일하는 사람에게 진행 상황을 알리거나 오랫동안 연락하지 못한 사람에게 안부를 전해 보세요. 거창한 만남보다 부담 없이 이어 갈 수 있는 교류에 어울립니다.', 'Update a colleague or check in with someone you have not contacted for a while. Choose an exchange that is easy to continue.'],
      ['잘 아는 사이라도 서로 기대하는 도움의 크기는 다를 수 있습니다. 부탁을 받으면 가능한 범위와 답할 시점을 먼저 이야기해 두는 편이 좋습니다.', 'Even familiar people may expect different amounts of help. When asked for something, state what you can offer and when you can respond.'],
    ],
    mid: [
      ['대인운은 사람마다 다른 입장과 표현을 조율하는 쪽에 무게가 실립니다. 많은 대화를 나누기보다 필요한 말을 정확히 주고받고, 내 몫과 상대의 몫을 나누어 보는 하루입니다.', 'Relationships call for accommodating different viewpoints and styles. Focus on clear exchanges and distinguishing your responsibilities from someone else’s.'],
      ['오해가 남은 약속이나 역할 분담을 차분히 확인해 보세요. 여러 사람의 의견을 한꺼번에 맞추기보다 당사자와 한 가지씩 이야기해 볼 만합니다.', 'Clarify an agreement or division of work that remains unclear. Discuss one matter at a time with the person involved.'],
      ['짧은 말투나 표정만으로 나를 대하는 태도를 단정하지 마세요. 남의 평가를 전달받았을 때도 바로 반응하기보다 맥락을 확인하는 편이 좋습니다.', 'Avoid judging someone’s attitude from a brief remark or expression. Check context before responding to secondhand comments about you.'],
    ],
    low: [
      ['대인운은 관계를 넓히기보다 내 경계와 여유를 지키는 쪽에 무게가 실립니다. 누구와도 거리를 두라는 뜻은 아니며, 감당하기 어려운 부탁이나 역할을 정리하는 데 활용해 보세요.', 'Relationships favor protecting your limits and capacity. Review requests or roles that feel difficult to manage while keeping useful connections.'],
      ['바로 답하기 어려운 부탁에는 생각할 시간을 요청해 보세요. 꼭 필요한 대화는 짧고 분명하게 이어 가며, 도와줄 수 있는 범위를 구체적으로 전할 만합니다.', 'Ask for time to consider a difficult request. Keep necessary conversations clear and state specifically what help you can offer.'],
      ['서운함을 쌓아 두었다가 한꺼번에 꺼내거나 남의 갈등을 대신 떠안지 않도록 하세요. 낮은 점수가 배신이나 불화를 뜻하지 않으므로 실제 관계를 기준으로 판단하세요.', 'Avoid storing up grievances or taking on someone else’s conflict. A low score does not mean betrayal or discord; judge relationships by what actually happens.'],
    ],
  },
  study: {
    high: [
      ['학업·문서운은 배운 내용을 정리해 내 것으로 만들고, 준비한 것을 드러내는 쪽에 힘이 실립니다. 읽는 데서 그치기보다 쓰고 설명하며 이해를 확인하는 데 활용해 볼 만합니다.', 'Study and documents favor consolidating knowledge and showing prepared work. Go beyond reading by writing or explaining what you understand.'],
      ['발표 준비, 복습한 내용의 적용, 작성 중인 서류의 마무리에 집중해 보세요. 막힌 부분은 질문을 구체적으로 만들어 도움을 구하는 방식도 어울립니다.', 'Focus on a presentation, applying reviewed material or finishing a draft document. Turn a difficult point into a specific question when seeking help.'],
      ['자신 있는 내용도 제출 조건이나 요구 형식을 다시 확인하세요. 높은 점수가 합격이나 승인 결과를 보장하지 않으므로 실제 평가 기준을 함께 살펴야 합니다.', 'Recheck submission conditions and required formats even for familiar material. A high score does not guarantee a pass or approval; consult the actual criteria.'],
    ],
    good: [
      ['학업·문서운은 낯선 범위를 크게 늘리기보다 익힌 내용을 차근차근 쌓아 가는 흐름입니다. 꾸준히 이어 온 공부나 문서 작업을 한 단계 마무리하는 쪽에 무게가 실립니다.', 'Study and documents favor building on familiar material. Move an ongoing course of study or writing task toward a manageable completion.'],
      ['오답을 다시 풀거나 여러 곳에 흩어진 메모를 한 가지 주제로 정리해 보세요. 문서는 핵심 주장과 근거가 이어지는지 살피는 데 활용할 만합니다.', 'Revisit a wrong answer or organize scattered notes around one topic. In a document, examine how the main point connects to its evidence.'],
      ['읽어서 익숙한 것과 스스로 설명할 수 있는 것은 다릅니다. 이해했다고 넘기기 전에 직접 써 보고, 제출할 문서는 빠진 항목이 없는지 확인하세요.', 'Familiarity from reading differs from being able to explain something yourself. Write it out and check for missing items before submission.'],
    ],
    mid: [
      ['학업·문서운은 집중할 범위를 좁히고 흐트러진 내용을 정돈하는 쪽에 무게가 실립니다. 진도를 빨리 나가기보다 어디서 이해가 끊기는지 살피는 하루로 활용해 보세요.', 'Study and documents call for narrowing focus and organizing scattered material. Look for where understanding breaks down before speeding ahead.'],
      ['분량이 작은 과제나 기준이 명확한 수정부터 마무리해 보세요. 모호한 설명은 예시 하나로 풀어 쓰고, 필요한 질문을 남겨 두는 방식이 어울립니다.', 'Finish a small task or a revision with clear criteria. Work through an unclear explanation using one example and note the question that remains.'],
      ['준비하는 자료만 늘리거나 여러 일을 번갈아 하며 시간을 쓰지 않도록 하세요. 서류의 이름·날짜·첨부 항목처럼 단순해 보이는 부분도 따로 확인하는 편이 좋습니다.', 'Avoid spending the whole session collecting material or switching tasks. Check names, dates and attachments separately even when they seem routine.'],
    ],
    low: [
      ['학업·문서운은 분량을 늘리기보다 놓친 부분을 찾아 보완하는 쪽에 무게가 실립니다. 결과를 서둘러 확인하려 하기보다 이미 배운 내용과 작성한 문서의 빈틈을 살펴보는 하루입니다.', 'Study and documents favor filling gaps before adding volume. Review what you have learned or drafted rather than rushing toward an outcome.'],
      ['기본 개념 한 가지를 다시 짚거나 제출 전 확인 목록을 따라 검토해 보세요. 막히는 내용을 그대로 반복하기보다 다른 설명이나 질문을 통해 접근할 만합니다.', 'Revisit one basic concept or review a draft against a submission checklist. Try another explanation or ask a question when repetition is not helping.'],
      ['이 점수로 시험 결과나 문서 승인을 단정하지 마세요. 마감이 있는 일은 운세 때문에 미루지 말고, 실제 요구 사항과 남은 시간을 기준으로 준비하세요.', 'This score cannot determine an exam result or document approval. Prepare for deadlines using actual requirements and available time.'],
    ],
  },
};

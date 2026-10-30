// 개인 일간 운세의 분야별 해석. 점수대는 기존 엔진의 bandOf 결과를 받는다.
// 각 행은 [흐름, 활용할 기회, 주의할 점]이며 각 문장은 [KR, EN]이다.
// 점수대에 어울리는 운세 장면으로 풀되 사건·수익·건강 상태를 확정하거나 확률로 바꾸지 않는다.
export const DAILY_OVERVIEW = {
  high: ['기다리던 답이나 반가운 제안에 기대를 걸어 볼 만한 하루입니다. 내가 해 온 일과 주변 인연에서 기분 좋은 계기를 찾을 수 있으니, 가장 기대되는 분야에 한 걸음 다가가 보세요.', 'A reply you have awaited or a welcome proposal offers something to look forward to. Your work and connections may bring a pleasant opening; take a step toward the area that matters most to you.'],
  good: ['작은 진전이나 다정한 말 한마디가 하루를 기분 좋게 만들 수 있습니다. 큰일이 아니어도 나를 알아봐 주는 반응과 일상의 즐거움을 충분히 누려 보세요.', 'A little progress or a kind word may brighten the day. Let yourself enjoy being noticed and the ordinary pleasures that do not need to be grand.'],
  mid: ['잘 풀리는 일도, 조금 기다려야 하는 일도 있을 수 있는 하루입니다. 모든 것을 바꾸려 애쓰지 말고 끝낸 일 하나, 즐거웠던 대화 하나에서 내 몫의 만족을 찾아보세요.', 'Some things may flow while others take time. There is no need to change everything; find satisfaction in one completed task or one conversation you enjoyed.'],
  low: ['마음만큼 일이 따라주지 않아도 나를 탓하지 않았으면 합니다. 오늘은 더 해내려는 힘을 잠시 덜고, 편한 사람과 익숙한 일에서 여유를 되찾아도 괜찮은 하루입니다.', 'If things do not match your hopes, try not to blame yourself. Ease the pressure to achieve more and let familiar activities or comfortable company give you some room.'],
};

export const DAILY_OUTLOOK = {
  career: {
    high: [
      ['준비해 온 실력을 보여 주고 좋은 평가를 기대해 볼 만한 날입니다. 회의에서 내 의견이 받아들여지거나, 해 온 일을 보고 새로운 역할을 제안하는 사람이 있을 수 있습니다.', 'Your preparation has room to shine, with a chance of encouraging feedback. An idea may find support in a meeting, or someone may suggest a new role after seeing your work.'],
      ['미뤄 둔 지원이나 제안이 있다면 자신 있는 경험을 앞세워 보세요. 이미 해낸 일을 말로 꺼내는 것이 나를 알아봐 줄 사람과 만나는 계기가 될 수 있습니다.', 'For an application or proposal you have put off, lead with an experience you feel good about. Talking about completed work may help the right person notice you.'],
      ['적극성이 강해질수록 혼자 결론을 내리거나 다른 사람의 몫까지 떠안기 쉽습니다. 의견을 내는 것과 책임을 확정하는 것은 구분하고, 마감과 담당 범위를 맞춰 보세요.', 'Initiative can turn into deciding alone or taking on someone else’s share. Separate a suggestion from a commitment, and agree on deadlines and responsibilities.'],
    ],
    good: [
      ['작은 성과를 알아봐 주는 말 한마디가 힘이 될 수 있는 날입니다. 막혀 있던 일이 동료의 도움으로 풀리거나, 함께 일하자는 반가운 이야기가 오갈 수 있습니다.', 'A word of recognition for a small achievement may lift your spirits. A colleague could help with a stuck task, or a welcome conversation about working together may begin.'],
      ['혼자 잘 끝내야 한다는 부담을 조금 덜어 보세요. 중간 결과를 보여 주거나 궁금한 것을 물으면 다음 단계로 나아갈 힌트를 얻을 수 있습니다.', 'Ease the pressure to finish perfectly on your own. Showing progress or asking a question may give you a useful clue for the next step.'],
      ['무난하게 진행된다는 이유로 확인 절차를 건너뛰지 마세요. 특히 구두로 바뀐 요청은 기존에 합의한 내용과 다른 부분이 없는지 짚어 두는 편이 좋습니다.', 'Keep the usual checks even when work feels straightforward. For a changed verbal request, check how it differs from the original agreement.'],
    ],
    mid: [
      ['크게 주목받는 일보다 한 가지를 끝냈다는 만족이 남을 수 있는 날입니다. 반응이 늦은 일도 있으니, 지금 손에 잡히는 진척부터 보며 자신감을 이어 가세요.', 'The satisfaction of finishing one thing may matter more than a big moment in the spotlight. Some responses may take time, so let tangible progress support your confidence.'],
      ['수정할 부분이 분명한 일부터 손대면 시작하기가 한결 편합니다. 새 아이디어는 가까운 동료에게 먼저 이야기하며 부담 없이 반응을 살펴보세요.', 'A task with a clear revision can be easier to begin. Try a new idea with a trusted colleague and explore the response without pressure.'],
      ['업무 속도나 표현 방식이 다르다고 의도를 단정하면 협의가 더 어려워질 수 있습니다. 답이 늦은 일은 재촉하기 전에 상대가 필요한 정보부터 확인해 보세요.', 'Avoid treating a different pace or style as evidence of someone’s intentions. Before pressing for an answer, check what information the other person needs.'],
    ],
    low: [
      ['애쓴 만큼 반응이 돌아오지 않아 서운할 수 있는 날입니다. 일이 더디다고 내 실력이 부족한 것은 아니니, 결과 하나로 나를 평가하지 않았으면 합니다.', 'It may feel disappointing if the response does not match your effort. Slow progress does not mean a lack of ability; one result need not define your work.'],
      ['모호한 요청을 다시 묻거나 도움을 청하는 일부터 해도 괜찮습니다. 혼자 해결하려던 부담을 나누고, 끝낼 수 있는 일 하나에서 작은 안도감을 찾아보세요.', 'It is fine to start by clarifying a vague request or asking for help. Share a burden you were carrying alone and find some relief in one manageable finish.'],
      ['부담을 느낀 상태에서 약속을 늘리거나 감정적으로 답하지 않도록 여유를 두세요. 처리할 수 있는 양을 먼저 밝히고, 일정 조율이 필요한 일은 미리 이야기하는 편이 좋습니다.', 'Leave room before adding commitments or replying under pressure. State your capacity and raise scheduling needs early.'],
    ],
  },
  money: {
    high: [
      ['뜻밖의 작은 횡재수나 수고에 대한 보답을 기대해 볼 만한 날입니다. 예상하지 못한 선물, 누군가의 대접, 기다리던 돈의 소식처럼 기분이 넉넉해지는 장면이 어울립니다.', 'The reading welcomes the possibility of a small windfall or a reward for your effort. An unexpected gift, a treat from someone or news about awaited money could bring a feeling of abundance.'],
      ['잘하는 일을 눈여겨본 사람이 일거리나 보상을 제안할 수도 있습니다. 기회가 오면 내 몫을 당당히 이야기하고, 작은 호의는 고맙게 받아도 좋겠습니다.', 'Someone who values your skill may suggest a paid task or reward. Speak up for your contribution when an opportunity appears, and let yourself enjoy a small kindness.'],
      ['높은 점수가 실제 수익이나 당첨을 보장하지는 않습니다. 좋은 조건처럼 보여도 총비용과 환불 조건을 확인하고, 감당할 수 있는 예산 안에서 판단하세요.', 'A high score does not guarantee profit or a prize. Check total costs and refund terms even when an offer looks attractive, and stay within your budget.'],
    ],
    good: [
      ['작지만 기분 좋은 이득을 기대해 볼 만한 날입니다. 눈여겨본 물건을 좋은 조건에 만나거나, 누군가의 선물과 보답이 생각보다 오래 기분을 좋게 해 줄 수 있습니다.', 'A modest but pleasing gain fits this day’s reading. A wanted item on appealing terms, or a gift or thank-you from someone, may brighten your mood longer than expected.'],
      ['원래 필요했던 것을 고르거나 나를 위한 작은 보상을 생각해 보세요. 평소 잘하는 일을 이야기하는 자리에서는 새로운 수입의 단서를 만날 수도 있습니다.', 'Consider something you already needed or a small reward for yourself. A conversation about what you do well may also offer a clue to a new income opportunity.'],
      ['할인이나 주변의 추천 때문에 원래 없던 지출을 만들지 않도록 하세요. 함께 내는 돈은 금액뿐 아니라 나누는 기준까지 먼저 맞춰 두는 편이 좋습니다.', 'Avoid creating an unplanned expense just because of a discount or recommendation. For shared costs, agree on how they will be divided as well as the amount.'],
    ],
    mid: [
      ['들어올 돈이 반가운 만큼 쓰고 싶은 곳도 눈에 들어올 수 있는 날입니다. 큰 행운을 기다리기보다 지금 가진 여유 안에서 만족스러운 선택을 찾아보세요.', 'The prospect of money coming in may be matched by things you want to spend it on. Look for a satisfying choice within what you have rather than waiting for a major windfall.'],
      ['꼭 갖고 싶었던 것 하나를 골라 보는 정도의 즐거움은 괜찮습니다. 아직 받지 않은 돈은 따로 생각하고, 쓰고 나서도 마음 편할 금액을 기준으로 삼으세요.', 'There is room for the pleasure of choosing one thing you truly wanted. Keep expected money separate and choose an amount that still feels comfortable afterward.'],
      ['급한 권유나 한정된 시간 때문에 결정을 서두르지 마세요. 공동 지출이나 돈을 빌려주는 일은 관계에 대한 기대와 실제 조건을 나누어 살피는 편이 좋습니다.', 'Allow time for decisions under urgent or time-limited offers. For shared spending or lending, distinguish hopes about the relationship from the actual terms.'],
    ],
    low: [
      ['돈 이야기에 마음이 예민해지거나 남과 비교하며 조급해질 수 있는 날입니다. 당장 더 벌어야 한다는 압박을 내려놓고, 내 생활을 지키는 선택에 점수를 주세요.', 'Money may feel sensitive, and comparison with others could make you impatient. Ease the pressure to earn more immediately and give yourself credit for protecting your own needs.'],
      ['분위기에 맞춰 큰돈을 쓰거나 아쉬운 마음에 무리한 제안을 받아들일 필요는 없습니다. 마음에 걸리는 구매를 미뤄 두는 것만으로도 오늘의 부담이 줄 수 있습니다.', 'You need not spend heavily to fit in or accept an uncomfortable offer out of disappointment. Postponing a purchase that worries you can lighten the day’s burden.'],
      ['낮은 점수가 실제 손실을 예고하는 것은 아닙니다. 불안해서 급하게 움직이지 말고, 금액이 큰 약속은 예산과 조건을 확인한 뒤 판단하세요.', 'A low score does not predict an actual loss. Avoid acting hastily out of worry, and check your budget and the terms before a large commitment.'],
    ],
  },
  love: {
    high: [
      ['서로를 더 알고 싶어지는 설렘을 기대해 볼 만한 날입니다. 먼저 오는 연락이나 다시 만나자는 말처럼, 마음의 거리가 가까워지는 계기가 생길 수 있습니다.', 'There is room for the excitement of wanting to know each other better. A message initiated by the other person or a wish to meet again may bring a sense of closeness.'],
      ['알아가는 사이라면 함께 좋아할 만한 식사나 산책을 제안해 보세요. 연인이 있다면 평소 들려주지 못한 고마운 마음이 다정한 대화의 시작이 될 수 있습니다.', 'With a new connection, suggest a meal or walk you might both enjoy. With a partner, appreciation you have not yet expressed could begin a tender conversation.'],
      ['내 마음이 앞서도 상대의 속도와 의사는 따로 확인해야 합니다. 호의 하나를 확답으로 받아들이거나 높은 점수만으로 관계를 확정하지 않도록 하세요.', 'Check the other person’s pace and wishes even when you feel ready. A kind gesture or a high score does not settle the status of a relationship.'],
    ],
    good: [
      ['사소한 배려에서 나를 생각하는 마음을 느낄 수 있는 날입니다. 기억해 준 취향이나 약속 하나가 반갑고, 편한 대화 속에서 호감이 조금씩 자랄 수 있습니다.', 'A small kindness may make you feel remembered. A preference or promise someone kept in mind can feel lovely, while easy conversation offers room for affection to grow.'],
      ['특별한 이벤트를 준비하지 않아도 괜찮습니다. 알아가는 사이에는 공통 관심사를, 가까운 사이에는 함께 웃었던 순간을 꺼내며 자연스럽게 시간을 나눠 보세요.', 'You do not need an elaborate event. Explore a shared interest in a new connection, or revisit a moment you laughed about together in a close relationship.'],
      ['익숙한 사이라고 마음을 다 안다고 생각하지 마세요. 답장의 길이나 속도보다 실제로 나눈 말과 약속을 기준으로 보는 편이 좋습니다.', 'Familiarity does not mean knowing every feeling. Give more weight to what was actually said and agreed than to the length or speed of a reply.'],
    ],
    mid: [
      ['다가가고 싶다가도 반응이 신경 쓰이는 하루가 될 수 있습니다. 관계를 빨리 정의하기보다 함께 있을 때 편안한지, 대화가 즐거운지를 천천히 느껴 보세요.', 'You may want to reach out and still feel uncertain about the response. Before defining the relationship, notice whether time together feels comfortable and conversation enjoyable.'],
      ['연락을 이어 가는 중이라면 답하기 편한 안부를 건네 보세요. 연인과는 미뤄 둔 불편을 한 가지씩 이야기하며 다시 편해질 접점을 찾을 수 있습니다.', 'If you are keeping in touch, send an easy check-in. With a partner, talking through one small concern at a time can help you find a more comfortable connection.'],
      ['모호한 말에 의미를 더해 혼자 결론내리지 않도록 하세요. 서운함이 올라오면 바로 따지기보다 어떤 말이나 행동이 불편했는지 나누어 보는 편이 좋습니다.', 'Avoid filling in an ambiguous message with assumptions. If upset, identify the particular words or actions that bothered you before responding.'],
    ],
    low: [
      ['작은 반응에도 마음이 쓰여 평소보다 서운해질 수 있는 날입니다. 답장이 늦거나 약속이 미뤄져도 내 매력이나 관계의 전부를 의심할 필요는 없습니다.', 'Small responses may feel more sensitive than usual. A late reply or postponed plan does not require you to doubt your appeal or the whole relationship.'],
      ['확답을 얻으려 애쓰기보다 내 기분을 편하게 하는 시간을 먼저 가져 보세요. 이야기를 나누고 싶다면 서로 여유 있는 때를 정하는 것만으로도 한 걸음입니다.', 'Make time for what helps you feel at ease before pressing for certainty. If you want a conversation, simply agreeing on a calm time together is a step forward.'],
      ['확답을 재촉하거나 서운함을 시험하는 표현은 피하는 편이 좋습니다. 낮은 점수가 이별이나 거절을 뜻하는 것은 아니니, 중요한 대화는 실제 상황을 기준으로 이어 가세요.', 'Avoid pressing for certainty or testing affection through hurt feelings. A low score does not mean rejection or separation; ground important conversations in the actual situation.'],
    ],
  },
  move: {
    high: [
      ['익숙한 자리에서 벗어나면 반가운 발견을 기대해 볼 만한 날입니다. 찾아간 곳에서 마음에 드는 공간을 만나거나, 직접 만난 사람과 이야기가 잘 풀릴 수 있습니다.', 'A change of setting offers room for a welcome discovery. You may find a place you like or enjoy a conversation that flows more easily in person.'],
      ['가 보고 싶던 장소나 미뤄 둔 방문이 있다면 작은 외출부터 생각해 보세요. 먼 여행이 아니어도 평소와 다른 풍경이 새로운 생각을 떠올리게 할 수 있습니다.', 'If there is a place you wanted to see or a visit you put off, start with a manageable outing. Even a nearby change of scenery may inspire a fresh thought.'],
      ['움직일 의욕이 생겨도 일정을 촘촘히 채우지 마세요. 높은 이동운이 교통 상황이나 안전을 보장하지 않으므로 날씨와 예약 조건은 별도로 확인해야 합니다.', 'Keep space between plans even when eager to go. A high score does not guarantee traffic conditions or safety; check the weather and booking terms separately.'],
    ],
    good: [
      ['가벼운 외출이 기분 전환으로 이어질 수 있는 날입니다. 익숙한 길에서 괜찮은 가게를 발견하거나, 오랜만에 만난 사람 덕분에 다녀오길 잘했다고 느낄 수 있습니다.', 'A simple outing may offer a refreshing change. A shop along a familiar route or a person you have not seen in a while could make you glad you went.'],
      ['가까운 산책이나 짧은 방문처럼 부담 없는 계획이 잘 어울립니다. 꼭 해야 할 일만 채우기보다 내가 즐거워할 장소도 하나 넣어 보세요.', 'A nearby walk or short visit suits the reading. Alongside necessary stops, leave room for one place you would enjoy.'],
      ['익숙한 장소라도 운영 시간이나 만날 위치가 바뀌지 않았는지 확인하세요. 이동 자체보다 도착해서 해야 할 일까지 고려해 시간을 잡는 편이 좋습니다.', 'Even for a familiar place, check opening hours and the meeting point. Allow time for what you need to do on arrival as well as the journey.'],
    ],
    mid: [
      ['움직이고 싶은 마음과 편히 쉬고 싶은 마음이 함께 들 수 있습니다. 멀리 가야 알찬 하루가 되는 것은 아니니, 다녀온 뒤에도 여유가 남을 계획을 골라 보세요.', 'You may want both a change of scene and a quiet rest. A worthwhile day does not require a long trip; choose a plan that leaves you comfortable afterward.'],
      ['가까운 곳에서 새 풍경을 찾거나 짧은 약속 하나를 즐겨 보세요. 여러 곳을 다 둘러보기보다 가장 궁금한 곳에 시간을 쓰면 부담을 덜 수 있습니다.', 'Look for a new view nearby or enjoy one short meeting. Spending time at the place you are most curious about can be easier than fitting in every stop.'],
      ['시간을 빠듯하게 잡고 다음 약속까지 연달아 넣지 마세요. 변경이 생겼을 때 연락할 곳과 대안을 미리 확인하면 일정에 여지를 둘 수 있습니다.', 'Avoid stacking appointments with tight travel times. Identify whom to contact and an alternative if plans change.'],
    ],
    low: [
      ['이동이나 약속이 평소보다 번거롭게 느껴질 수 있는 날입니다. 계획이 바뀌더라도 하루를 망쳤다고 생각하지 말고, 조금 편한 쪽으로 다시 골라도 괜찮습니다.', 'Travel or arrangements may feel more cumbersome than usual. A changed plan need not ruin the day; it is fine to choose an easier option.'],
      ['꼭 필요한 방문만 남기거나 익숙한 가까운 곳에서 시간을 보내 보세요. 멀리 움직이지 않고도 좋아하는 장소에서 기분을 환기할 여지는 있습니다.', 'Keep only the necessary visits, or spend time somewhere familiar nearby. A favorite place can still offer a change of mood without a long journey.'],
      ['낮은 점수가 사고나 이동 실패를 예고하는 것은 아닙니다. 운세 때문에 필요한 일정을 취소하기보다 실제 교통·날씨·예약 상황을 확인하며 여유를 두세요.', 'A low score does not predict an accident or failed journey. Check actual traffic, weather and booking conditions, and allow room in your schedule.'],
    ],
  },
  health: {
    high: [
      ['나를 위해 시간을 써도 좋겠다는 마음에 힘이 실리는 날입니다. 좋아하는 취미나 가벼운 산책처럼 즐겁게 움직이고 쉬는 시간을 넉넉히 누려 보세요.', 'The reading makes room for giving time to yourself. Enjoy a favorite pastime, a gentle walk or an easy break without having to make it productive.'],
      ['한동안 미뤄 둔 즐거움을 다시 꺼내 볼 만합니다. 기분 좋게 시작할 수 있는 활동을 고르고, 실제 몸 상태에 맞춰 편안한 만큼만 해 보세요.', 'Consider returning to a pleasure you have put aside. Choose an activity you can enjoy starting, and let your actual condition determine a comfortable amount.'],
      ['점수가 높아도 실제 몸 상태나 회복력을 뜻하지 않습니다. 피곤하거나 불편하다면 계획보다 몸의 신호를 우선하고, 무리한 활동을 추가하지 마세요.', 'A high score does not indicate physical condition or recovery. If tired or uncomfortable, give those signals priority over plans and avoid adding strain.'],
    ],
    good: [
      ['거창한 계획 없이도 나를 잘 챙겼다는 만족을 느낄 수 있는 날입니다. 편하게 먹는 한 끼, 서두르지 않는 저녁 같은 익숙한 즐거움을 놓치지 마세요.', 'Simple care may bring the satisfaction of having treated yourself well. Notice familiar pleasures such as an unhurried meal or a comfortable evening.'],
      ['좋아하는 음식이나 취미에 시간을 조금 내어 보세요. 누군가의 속도를 따라가기보다 내가 편한 방식을 고르면 쉬는 시간도 더 내 것처럼 느껴질 수 있습니다.', 'Make a little time for food or a pastime you enjoy. Choosing your own pace can make free time feel more like it belongs to you.'],
      ['다른 사람의 활동량이나 생활 방식에 맞추려 무리하지 마세요. 이 점수로 건강의 좋고 나쁨을 판단할 수 없으므로 실제 컨디션에 맞춰 계획하세요.', 'Avoid stretching yourself to match someone else’s activity or routine. This score cannot assess health; plan around how you actually feel.'],
    ],
    mid: [
      ['해야 할 일과 쉬고 싶은 마음 사이에서 균형을 찾는 날입니다. 크게 바꾸려 애쓰기보다 식사나 휴식 한 번을 편하게 챙기는 정도로도 충분합니다.', 'The day invites a balance between obligations and the wish to rest. A comfortable meal or a single proper break is enough without attempting a major change.'],
      ['일정 가운데 짧게 비워 둘 시간을 찾아보세요. 잠깐 자리를 옮기거나 좋아하는 음악을 들으며 마음이 쉴 틈을 주는 것도 좋은 선택입니다.', 'Find a brief opening in your schedule. Stepping away or listening to music you like can give your mind a little room.'],
      ['피로를 참아야 할 신호로 받아들이거나 점수에 맞춰 몸 상태를 짐작하지 마세요. 이 해석은 생활을 돌아보는 참고이며 건강 상태나 질환을 판단하지 않습니다.', 'Avoid treating tiredness as something to push through or guessing your condition from the score. This is a reflection on routines, not an assessment of health or illness.'],
    ],
    low: [
      ['모든 일정을 잘 해내야 한다는 마음을 잠시 내려놓아도 되는 날입니다. 쉬고 싶다는 생각이 든다면 나약함으로 여기지 말고 내 시간을 먼저 돌봐 주세요.', 'You can put aside the pressure to handle every plan perfectly. If you want rest, treat that wish with care rather than calling it weakness.'],
      ['덜 급한 약속을 줄이거나 아무 계획 없는 시간을 남겨 보세요. 무언가를 더 해내는 것보다 편하게 쉬었다는 느낌을 오늘의 작은 성과로 삼아도 괜찮습니다.', 'Reduce a less urgent commitment or leave some time unplanned. Feeling that you rested comfortably can count as a small accomplishment today.'],
      ['낮은 점수는 질병이나 컨디션 저하를 예측하지 않습니다. 실제로 불편한 증상이 있다면 운세로 원인을 찾지 말고, 몸 상태에 맞는 도움을 구하세요.', 'A low score does not predict illness or a decline in physical condition. If you have symptoms, seek appropriate help rather than looking to the reading for a cause.'],
    ],
  },
  social: {
    high: [
      ['나를 반겨 주거나 내 편이 되어 주는 사람을 기대해 볼 만한 날입니다. 먼저 오는 연락, 반가운 초대, 어려운 일을 함께 풀어 주는 도움처럼 사람을 통해 기분 좋은 일이 생길 수 있습니다.', 'There is room to look forward to someone who welcomes you or stands beside you. A message, an invitation or help with a difficulty may bring a pleasant moment through other people.'],
      ['부탁하기 미안해 혼자 품었던 일이 있다면 믿을 만한 사람에게 말해 보세요. 새로운 모임에서도 애써 돋보이려 하기보다 관심 가는 이야기에 자연스럽게 참여해 보세요.', 'If you have held back from asking for help, try someone you trust. In a new group, join a conversation that interests you without having to stand out.'],
      ['좋은 분위기에서도 모든 부탁을 받아들일 필요는 없습니다. 친밀함과 업무상 책임을 구분하고, 다른 사람의 이야기를 옮길 때는 동의를 먼저 확인하세요.', 'A warm atmosphere does not oblige you to accept every request. Distinguish closeness from work responsibilities and check consent before sharing someone else’s story.'],
    ],
    good: [
      ['가벼운 안부가 반가운 대화로 이어질 수 있는 날입니다. 잊고 지낸 사람의 연락이나 내 배려를 기억해 주는 말 한마디에 사람 만나는 즐거움을 느낄 수 있습니다.', 'A simple hello may lead to a welcome conversation. Hearing from an old connection or learning that someone remembers your kindness could make company feel rewarding.'],
      ['문득 생각나는 사람에게 요즘 어떻게 지내는지 물어보세요. 함께 좋아하는 이야기를 나누거나 소소한 약속을 잡으면 편안하게 가까워질 계기가 될 수 있습니다.', 'Ask someone who comes to mind how they have been. A shared interest or a small plan offers an easy way to reconnect.'],
      ['잘 아는 사이라도 서로 기대하는 도움의 크기는 다를 수 있습니다. 부탁을 받으면 가능한 범위와 답할 시점을 먼저 이야기해 두는 편이 좋습니다.', 'Even familiar people may expect different amounts of help. When asked for something, state what you can offer and when you can respond.'],
    ],
    mid: [
      ['사람을 만나 반갑다가도 혼자 있고 싶어질 수 있는 날입니다. 모든 자리에서 분위기를 맞추려 애쓰기보다, 대화가 편한 사람과 시간을 나눠 보세요.', 'You may enjoy company and still want time alone. Rather than keeping every gathering lively, spend time with someone whose conversation feels easy.'],
      ['넓은 모임보다 한 사람과 나누는 짧은 안부가 더 마음에 남을 수 있습니다. 내 이야기도 조금 꺼내며 서로 부담 없는 거리에서 관계를 이어 가세요.', 'A short exchange with one person may stay with you more than a large gathering. Share a little of your own story and keep a distance that feels comfortable to both.'],
      ['짧은 말투나 표정만으로 나를 대하는 태도를 단정하지 마세요. 남의 평가를 전달받았을 때도 바로 반응하기보다 맥락을 확인하는 편이 좋습니다.', 'Avoid judging someone’s attitude from a brief remark or expression. Check context before responding to secondhand comments about you.'],
    ],
    low: [
      ['상대의 말이 평소보다 마음에 오래 남거나 나만 애쓰는 것처럼 느낄 수 있는 날입니다. 모두에게 좋은 사람이 되려 하지 않아도 괜찮고, 잠시 거리를 두어도 됩니다.', 'Someone’s words may linger, or you may feel you are doing all the work in a relationship. You do not have to please everyone, and a little distance is allowed.'],
      ['만남을 늘리기보다 내 말을 편하게 들어 주는 사람과 시간을 보내 보세요. 서운한 일이 있다면 감정이 가라앉은 뒤 한 가지씩 이야기하는 편이 마음을 덜 소모합니다.', 'Choose someone who listens comfortably instead of adding more meetings. If something upset you, discussing one point at a time after settling may feel less draining.'],
      ['서운함을 쌓아 두었다가 한꺼번에 꺼내거나 남의 갈등을 대신 떠안지 않도록 하세요. 낮은 점수가 배신이나 불화를 뜻하지 않으므로 실제 관계를 기준으로 판단하세요.', 'Avoid storing up grievances or taking on someone else’s conflict. A low score does not mean betrayal or discord; judge relationships by what actually happens.'],
    ],
  },
  study: {
    high: [
      ['막혔던 내용이 연결되거나 준비한 것을 자신 있게 보여 줄 기회를 기대해 볼 만합니다. 발표와 과제에서 내 생각을 또렷하게 전하며 배운 보람을 느낄 수 있는 날입니다.', 'A difficult topic may begin to connect, or you may find a chance to show what you prepared. A presentation or assignment offers room to express your thinking and enjoy what you have learned.'],
      ['관심 있던 주제나 설명해 보고 싶던 내용을 먼저 잡아 보세요. 다른 사람에게 알려 주거나 실제 문제에 써 보면 생각보다 많이 알고 있다는 자신감을 얻을 수 있습니다.', 'Start with a topic you care about or wanted to explain. Teaching someone or applying it to a problem may help you notice how much you already know.'],
      ['자신 있는 내용도 제출 조건이나 요구 형식을 다시 확인하세요. 높은 점수가 합격이나 승인 결과를 보장하지 않으므로 실제 평가 기준을 함께 살펴야 합니다.', 'Recheck submission conditions and required formats even for familiar material. A high score does not guarantee a pass or approval; consult the actual criteria.'],
    ],
    good: [
      ['다시 본 내용이 전보다 쉽게 이해되거나 필요한 자료를 만날 수 있는 날입니다. 작은 진전이 쌓이며 공부하는 재미와 해낼 수 있다는 마음이 살아날 수 있습니다.', 'Review may feel clearer than before, or you may find a useful resource. A little progress can renew both your interest and your confidence in learning.'],
      ['헷갈리던 문제 하나를 다시 보거나 추천받은 설명을 읽어 보세요. 혼자 막혀 있던 부분을 물어보면 다음 공부를 이어 갈 힌트를 얻을 수 있습니다.', 'Revisit a confusing problem or try an explanation someone recommended. Asking about a point where you got stuck may offer a useful lead for what to learn next.'],
      ['읽어서 익숙한 것과 스스로 설명할 수 있는 것은 다릅니다. 이해했다고 넘기기 전에 직접 써 보고, 제출할 문서는 빠진 항목이 없는지 확인하세요.', 'Familiarity from reading differs from being able to explain something yourself. Write it out and check for missing items before submission.'],
    ],
    mid: [
      ['집중이 잘되는 부분과 유독 어렵게 느껴지는 부분이 함께 있을 수 있습니다. 한 번에 전부 이해하려 하기보다 익숙한 내용부터 연결하며 리듬을 찾아보세요.', 'Some material may hold your attention while another part feels unusually difficult. Begin with what is familiar and build connections instead of mastering everything at once.'],
      ['분량을 크게 잡지 않아도 됩니다. 작은 문제 하나를 풀거나 핵심 내용을 내 말로 설명하며 어디까지 알고 있는지 확인하는 데 의미가 있습니다.', 'You do not need a large study target. One problem or a short explanation in your own words can help you see what you understand.'],
      ['준비하는 자료만 늘리거나 여러 일을 번갈아 하며 시간을 쓰지 않도록 하세요. 서류의 이름·날짜·첨부 항목처럼 단순해 보이는 부분도 따로 확인하는 편이 좋습니다.', 'Avoid spending the whole session collecting material or switching tasks. Check names, dates and attachments separately even when they seem routine.'],
    ],
    low: [
      ['공들인 만큼 머리에 남지 않는 것 같아 답답할 수 있는 날입니다. 잠깐의 막힘을 재능의 한계로 받아들이지 말고, 배우는 속도를 조금 늦춰도 괜찮습니다.', 'It may feel as though less is sticking than the effort you put in. A temporary block need not define your ability; it is fine to learn a little more slowly.'],
      ['새로운 내용을 많이 넣기보다 익숙한 한 부분을 다시 살펴보세요. 질문 하나를 해결하거나 짧게 복습한 것만으로도 공부를 놓지 않았다는 의미가 있습니다.', 'Revisit one familiar part before adding lots of new material. Resolving one question or doing a short review still means you stayed connected with learning.'],
      ['이 점수로 시험 결과나 문서 승인을 단정하지 마세요. 마감이 있는 일은 운세 때문에 미루지 말고, 실제 요구 사항과 남은 시간을 기준으로 준비하세요.', 'This score cannot determine an exam result or document approval. Prepare for deadlines using actual requirements and available time.'],
    ],
  },
};

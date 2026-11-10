// 일간 풀이 전용. [제목 후보, 60점 이상 흐름, 60점 미만 흐름, 활용, 주의]의 한영 문장.
// 일진이 같은 날에도 같은 분야에 배정된 띠 수만큼 서로 다른 장면을 쓸 수 있어야 한다.
export const ZODIAC_DAY_SCENES = {
  social: [
    [
      [['오랜만에 꺼내는 안부', 'A message after a long silence'], ['뜸했던 연락을 잇는 말', 'A line that renews contact'], ['안부부터 건네는 날', 'Start by asking how they are']],
      ['한동안 소식이 뜸했던 사람과 다시 이야기하기 좋은 흐름입니다.', 'The reading favors getting back in touch with someone you have not heard from in a while.'],
      ['가까운 사이에도 무슨 말을 먼저 꺼낼지 망설여질 수 있습니다.', 'Even with someone close, it may be hard to know how to begin.'],
      ['공통으로 아는 사람이나 장소가 떠오르면 그 얘기로 안부를 건네세요.', 'If a shared friend or place comes to mind, let that be your opening.'],
      ['답장이 늦어도 같은 메시지를 거듭 보내지는 마세요.', 'Give a slow reply time before sending the same message again.'],
    ],
    [
      [['손이 필요한 자리', 'A place for an extra hand'], ['혼자 하던 일에 손을 빌릴 때', 'A moment to ask for another pair of hands'], ['도움을 청할 한 가지', 'One specific thing to ask for']],
      ['혼자 붙잡고 있던 일에 누군가 손을 보태기 쉬운 흐름입니다.', 'Someone may be willing to help with a task you have been doing alone.'],
      ['주변에서 도울 마음이 있어도 어디가 막혔는지 모를 수 있습니다.', 'People around you may want to help without knowing where you are stuck.'],
      ['자료를 찾아 달라거나 문장 하나를 봐 달라는 식으로 부탁을 좁혀 보세요.', 'Make a specific request, such as finding a reference or reading one sentence.'],
      ['도움을 청하기 전에 언제까지 답이 필요한지 생각해 두세요.', 'Work out when you need a reply before asking for help.'],
    ],
    [
      [['한 테이블에 앉는 날', 'Around the same table'], ['식탁에서 듣는 새 이야기', 'A new story at the table'], ['짧은 모임에서 건질 대화', 'A worthwhile conversation at a brief gathering']],
      ['식사나 짧은 모임에서 평소 못 듣던 이야기가 오갈 만합니다.', 'A meal or brief gathering may bring a conversation you would not usually have.'],
      ['사람이 모이면 이야기 속도가 달라 말할 틈을 놓치기 쉽습니다.', 'At a gathering, a fast-moving conversation can leave little room to speak.'],
      ['처음 만난 사람에게는 그 자리에 오게 된 계기부터 물어보세요.', 'Ask someone new what brought them to the gathering.'],
      ['사적인 질문은 상대가 먼저 말을 꺼낼 때까지 기다리세요.', 'Wait for the other person to bring up more personal topics.'],
    ],
    [
      [['돌아오는 작은 호의', 'A small kindness returned'], ['누군가 기억한 내 수고', 'Someone remembers what you did'], ['고마움을 건넬 차례', 'A chance to say thanks']],
      ['전에 건넨 도움을 누군가 기억하고 있다는 걸 알게 될 수 있습니다.', 'You may discover that someone remembers a kindness you once offered.'],
      ['내 수고에 바로 반응이 없으면 괜히 나섰나 싶을 수 있습니다.', 'When there is no immediate response to your help, you may wonder if you overstepped.'],
      ['고마운 일이 떠오르면 어떤 점이 도움이 됐는지 한 문장으로 전하세요.', 'If you feel grateful, send one sentence about what helped.'],
      ['가벼운 호의를 무거운 빚처럼 받아들이지 않아도 됩니다.', 'A small favor need not feel like a large debt.'],
    ],
    [
      [['말뜻을 다시 맞추는 날', 'Checking what was meant'], ['한 줄만으로 알 수 없는 마음', 'What one line cannot tell you'], ['짐작보다 직접 묻는 편이 빠른 날', 'Ask before guessing']],
      ['짧게 엇갈렸던 이야기도 마주 앉으면 맥락이 보일 수 있습니다.', 'A brief misunderstanding may make more sense in a direct conversation.'],
      ['메시지 한 줄로 상대의 표정까지 짐작하기 쉬운 때입니다.', 'It may be tempting to infer someone’s expression from a single message.'],
      ['마음에 걸린 표현이 있으면 어떤 뜻으로 한 말인지 먼저 물으세요.', 'If a phrase bothers you, ask what the person meant by it.'],
      ['지난 일까지 한꺼번에 꺼내면 오늘 풀려던 이야기에서 멀어집니다.', 'Bringing up every past issue can distract from what you meant to resolve today.'],
    ],
    [
      [['역할을 나누면 가벼워지는 일', 'A lighter load when roles are shared'], ['빈자리를 먼저 찾는 협업', 'Look for what nobody has covered'], ['누가 끝까지 챙길지 정하는 날', 'Agree on who sees it through']],
      ['같이 일할 사람과 역할이 맞으면 생각보다 빠르게 진도가 납니다.', 'A shared task may move faster when everyone knows their role.'],
      ['같은 일을 두 사람이 챙기고 정작 빈자리는 남을 수 있습니다.', 'Two people may cover the same task while another remains unattended.'],
      ['누가 시작하고 누가 마지막으로 확인할지 정해 두면 편합니다.', 'Agree on who starts and who gives the final check.'],
      ['상대의 여유를 확인한 뒤에 일을 더 나누세요.', 'Check the other person’s availability before handing over more work.'],
    ],
    [
      [['다음 약속으로 이어지는 대화', 'A conversation worth continuing'], ['공통 관심사에서 찾는 약속', 'A shared interest becomes a plan'], ['한 번 더 만나고 싶은 이유', 'A reason to meet again']],
      ['가볍게 꺼낸 관심사가 다음에 만날 이유가 될 수 있습니다.', 'An interest mentioned in passing may give you a reason to meet again.'],
      ['좋은 대화 뒤에도 다음 일정을 바로 잡기는 어려울 수 있습니다.', 'Even after a good conversation, finding the next date may take time.'],
      ['공통 관심사가 나오면 함께 가 볼 만한 곳 하나만 제안하세요.', 'When a shared interest comes up, suggest one place you might visit together.'],
      ['일정을 확정하기 전에 비용이나 이동 거리가 부담스럽지 않은지 확인하세요.', 'Before committing, make sure the cost and travel distance are manageable.'],
    ],
  ],
  career: [
    [
      [['첫 줄에 담는 결론', 'Put the conclusion first'], ['보고서 맨 앞에 둘 말', 'What to put at the top of the update'], ['설명보다 먼저 보낼 요청', 'Send the request before the background']],
      ['준비한 내용을 짧게 정리하면 제안이 눈에 띄기 좋습니다.', 'A concise summary can help a prepared proposal stand out.'],
      ['설명이 길어질수록 정작 부탁할 일이 뒤로 밀리기 쉽습니다.', 'A long explanation can push the actual request out of sight.'],
      ['보고 첫 줄에는 결론 하나, 그 아래에는 필요한 결정만 적어 보세요.', 'Start the update with one conclusion, then state the decision you need.'],
      ['배경 설명은 상대가 물어볼 때 꺼낼 수 있게 따로 남겨 두세요.', 'Keep the background handy for when someone asks.'],
    ],
    [
      [['마감 앞에서 고를 일', 'Choosing what makes the deadline'], ['끝낼 일과 미룰 일', 'What to finish and what can wait'], ['오래 붙든 일을 마무리할 때', 'Time to wrap up a lingering task']],
      ['오래 붙들고 있던 과제를 끝내기에 힘이 실리는 흐름입니다.', 'The reading favors bringing a long-running task to a close.'],
      ['사소한 수정이 길어지면 큰 마감이 밀릴 수 있습니다.', 'Small revisions can consume time needed for the main deadline.'],
      ['완료해야 할 항목과 다음에 손볼 항목을 한 줄씩 나눠 적으세요.', 'Write one line each for what must be finished and what can wait.'],
      ['보내기 직전에는 새로운 일을 시작하기보다 첨부 파일부터 확인하세요.', 'Before sending, check the attachment before starting something new.'],
    ],
    [
      [['초안이 먼저 할 일', 'What a first draft can do'], ['다듬기 전에 보여 줄 한 장', 'One page to show before polishing'], ['아이디어를 시험하는 첫 화면', 'A first screen that tests an idea']],
      ['다듬기 전의 아이디어도 보여 줄 자리가 생길 수 있습니다.', 'There may be a good chance to show an idea before it is polished.'],
      ['마음속에서만 고치다 보면 무엇이 부족한지 더 흐려집니다.', 'Reworking an idea only in your head can obscure what it is missing.'],
      ['초안의 첫 화면만 보여 주고 이해하기 어려운 곳 하나를 물어보세요.', 'Share just the first screen of the draft and ask what was hard to follow.'],
      ['처음 나온 의견을 모두 반영하기 전에 가장 중요한 목적을 다시 보세요.', 'Revisit the main purpose before acting on every first reaction.'],
    ],
    [
      [['기록이 남기는 신뢰', 'Trust built by a clear record'], ['왜 바꿨는지 남겨 두는 날', 'Leave a record of why it changed'], ['나중에 읽힐 작업 메모', 'A work note for later']],
      ['평소 눈에 잘 띄지 않던 작업도 정리해 두면 설명할 기회가 생깁니다.', 'A record can give overlooked work a chance to be noticed.'],
      ['여러 사람이 손댄 일은 나중에 바뀐 이유부터 헷갈리기 쉽습니다.', 'When many hands change a task, it can be hard to remember why.'],
      ['오늘 바꾼 내용과 바꾼 이유를 파일 옆에 짧게 남기세요.', 'Leave a short note by the file explaining what changed and why.'],
      ['최종본과 검토본은 이름을 달리해 두어 혼선을 줄이세요.', 'Give final and review copies distinct names to avoid a mix-up.'],
    ],
    [
      [['일을 넘기기 전 한 번', 'Before handing a task over'], ['다음 사람이 바로 시작할 수 있게', 'Help the next person get started'], ['말로 넘긴 일을 글로 정리할 때', 'Put a spoken handover in writing']],
      ['역할을 넘기면서 막혀 있던 일에도 새 방법이 보일 수 있습니다.', 'A handover may bring a fresh approach to work that has stalled.'],
      ['내용을 잘 아는 사람에게는 쉬운 지시도 처음 받는 사람에게는 모호합니다.', 'Instructions that seem obvious to you may be unclear to someone new.'],
      ['인수인계에는 다음 행동과 확인할 사람을 함께 적어 두세요.', 'Include the next action and who to check with in the handover.'],
      ['말로만 합의한 마감은 받은 사람이 확인할 수 있게 남기세요.', 'Write down any deadline that was agreed only in conversation.'],
    ],
    [
      [['새 요청에 답하는 순서', 'How to answer a new request'], ['수락하기 전에 물어볼 것', 'What to ask before saying yes'], ['새 부탁의 조건부터', 'Start with the terms of a new request']],
      ['내 경험을 써 볼 만한 부탁이 들어오면 조건을 조율하기 좋습니다.', 'A request that fits your experience may give you room to agree on terms.'],
      ['괜찮아 보이는 부탁도 지금 일정에 들어오면 부담이 커질 수 있습니다.', 'An appealing request can still strain the schedule you already have.'],
      ['바로 수락하기 전에 필요한 결과물과 제출일을 한 번에 물어보세요.', 'Ask about both the deliverable and its due date before accepting.'],
      ['할 수 있는 범위를 정하기 전에는 완료일을 약속하지 마세요.', 'Avoid promising a finish date before settling what you can take on.'],
    ],
  ],
  money: [
    [
      [['장바구니를 다시 볼 때', 'A second look at your cart'], ['할인가 밖의 비용', 'The cost beyond the discount'], ['결제 버튼을 누르기 전', 'Before pressing checkout']],
      ['눈여겨보던 물건을 계획한 예산 안에서 찾기 좋은 흐름입니다.', 'The reading favors finding a planned purchase within your budget.'],
      ['좋아 보이는 할인도 결제 직전에 붙는 비용까지 보면 달라질 수 있습니다.', 'An attractive discount may look different once checkout fees appear.'],
      ['같은 물건이라면 배송비와 반품 조건까지 넣어 두 곳을 비교하세요.', 'For the same item, compare two sellers including delivery and returns.'],
      ['할인 기간이 짧다는 이유만으로 예정에 없던 물건을 담지 마세요.', 'A short sale is no reason to add an unplanned item.'],
    ],
    [
      [['정산을 챙기는 날', 'Time to settle the bill'], ['미뤄 둔 비용 이야기를 꺼낼 때', 'Bring up an expense you put off'], ['영수증으로 맞추는 정산', 'Use the receipt to settle up']],
      ['미뤄 둔 정산이나 부탁하기 어려웠던 비용 이야기를 꺼내기 좋습니다.', 'The reading favors bringing up a delayed reimbursement or an awkward expense.'],
      ['받기로 한 돈도 서로 기억하는 날짜나 금액이 다를 수 있습니다.', 'Even when a payment is agreed, people may recall a different amount or date.'],
      ['영수증이 남아 있으면 날짜와 내역을 정리해 함께 보내세요.', 'Send the receipt with a clear date and itemized note if you have it.'],
      ['입금이 확인되기 전에는 그 돈을 다음 지출에 미리 보태지 마세요.', 'Wait for the payment to arrive before counting it toward another expense.'],
    ],
    [
      [['작은 보답이 반가운 때', 'A small reward is welcome'], ['수고의 값을 말할 자리', 'A chance to name the value of your work'], ['일거리 제안에 답하기 전', 'Before answering an offer of work']],
      ['꾸준히 해 온 일이 작은 일거리나 기분 좋은 보답으로 돌아올 만합니다.', 'Steady effort may bring a small paid task or a welcome reward.'],
      ['좋아하는 일이라도 대가가 정해지지 않으면 나중에 아쉬움이 남습니다.', 'Even enjoyable work can leave regret if compensation is never discussed.'],
      ['일거리 제안을 받으면 필요한 시간과 비용을 적어 보고 답하세요.', 'If offered work, estimate the time and cost before replying.'],
      ['구두로 정한 금액은 시작하기 전에 글로 한 번 확인하세요.', 'Confirm a verbally agreed amount in writing before you start.'],
    ],
  ],
  move: [
    [
      [['약속 사이의 여유', 'Room between appointments'], ['도착보다 출발 시간을 먼저', 'Set departure before arrival'], ['동선에 남겨 둘 빈 시간', 'Leave a gap in the route']],
      ['동선을 가볍게 정리하면 오래 미뤄 둔 방문을 다녀오기 좋습니다.', 'A simple route may make a long-delayed visit easier to fit in.'],
      ['한 약속이 늦어지면 뒤 일정도 함께 밀리기 쉬운 흐름입니다.', 'A delay in one appointment could push back the rest.'],
      ['도착 시간보다 출발 시간을 먼저 정하고 사이에 여유를 남겨 두세요.', 'Set your departure time first and leave room between plans.'],
      ['같은 이름의 장소가 여러 곳이면 주소와 지점을 대조하세요.', 'If places share a name, check the address and branch.'],
    ],
    [
      [['다른 길이 보이는 때', 'A different route comes into view'], ['평소 길이 막혔을 때', 'When the usual route is blocked'], ['지도에 남겨 둘 두 번째 길', 'A second route to save']],
      ['낯선 길로 돌아가다 반가운 곳을 하나 발견할 수 있습니다.', 'Taking an unfamiliar route may lead to a welcome discovery.'],
      ['평소 쓰던 길이나 교통편이 여의치 않아 계획을 바꿀 수 있습니다.', 'A familiar route or service may be unavailable, calling for a change of plan.'],
      ['출발 전에 대체 경로 하나를 지도에 저장해 두면 마음이 놓입니다.', 'Save one alternate route on your map before setting off.'],
      ['시간이 부족할 때는 확인하지 않은 지름길로 서두르지 마세요.', 'When time is short, avoid rushing down a shortcut you have not checked.'],
    ],
  ],
  study: [
    [
      [['답을 바꾸는 질문 하나', 'One question that changes the answer'], ['처음 막힌 단계부터', 'Start at the first step that stopped you'], ['모르는 곳을 표시하는 날', 'Mark what you do not understand']],
      ['막혔던 곳을 질문으로 바꾸면 풀 실마리가 보일 만합니다.', 'Turning a sticking point into a question may reveal a way forward.'],
      ['모르는 부분을 넓게 잡으면 어디서 시작할지 더 어려워집니다.', 'A broad sense of confusion can make it harder to find a starting point.'],
      ['답이 막힌 문제에서 처음 이해하지 못한 단계에 표시를 남기세요.', 'Mark the first step you did not understand in the problem that stopped you.'],
      ['풀이를 읽은 뒤에는 책을 덮고 그 단계만 다시 설명해 보세요.', 'After reading the solution, close the book and explain just that step.'],
    ],
    [
      [['찾아 둔 자료를 쓰는 날', 'Using a reference you saved'], ['오래된 메모의 새 쓰임', 'A new use for an old note'], ['답에 가까운 자료부터', 'Start with the source closest to an answer']],
      ['전에 메모해 둔 자료가 지금 하려는 일에 뜻밖에 잘 맞을 수 있습니다.', 'A reference you saved earlier may fit the work you are doing now.'],
      ['자료가 많으면 골라 읽는 데만 시간을 쓰기 쉽습니다.', 'With too many sources, choosing what to read can take all the time.'],
      ['오늘 답하려는 질문 하나를 적고 그 질문에 닿는 자료부터 여세요.', 'Write down one question and open the source most likely to answer it.'],
      ['인용하려는 내용은 요약본만 보고 옮기지 말고 원문을 확인하세요.', 'Check the original before quoting a point you found in a summary.'],
    ],
    [
      [['배운 것을 내 말로', 'What you learned in your own words'], ['설명해 보면 드러나는 빈틈', 'Explaining reveals what is missing'], ['개념 하나를 예로 풀어 보는 날', 'Give one concept an example']],
      ['최근 배운 것을 누군가에게 설명하며 이해를 넓히기 좋습니다.', 'The reading favors deepening your understanding by explaining something you learned.'],
      ['익숙한 말도 예를 들려 하면 정확히 모르는 부분이 드러날 수 있습니다.', 'Trying to give an example can reveal gaps behind familiar words.'],
      ['개념 하나를 처음 듣는 사람에게 설명하듯 메모로 써 보세요.', 'Write a note explaining one concept as if to a first-time listener.'],
      ['정의와 예시가 서로 맞는지 확인한 뒤 메모를 공유하세요.', 'Check that the definition fits the example before sharing your note.'],
    ],
  ],
};

export const ZODIAC_DAY_TOPICS = {
  social: ['대인운', 'Relationships'],
  career: ['업무운', 'Work'],
  money: ['재물운', 'Money'],
  move: ['이동운', 'Travel and plans'],
  study: ['학업운', 'Study'],
};

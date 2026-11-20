// 일간 풀이 전용. [제목 후보, 60점 이상 흐름, 60점 미만 흐름, 활용, 주의]의 한영 문장.
// 일진이 같은 날에도 같은 분야에 배정된 띠 수만큼 서로 다른 장면을 쓸 수 있어야 한다.
export const ZODIAC_DAY_SCENES = {
  social: [
    [
      [['오랜만에 꺼내는 안부', 'A message after a long silence'], ['뜸했던 연락을 잇는 말', 'A line that renews contact'], ['안부부터 건네는 날', 'Start by asking how they are']],
      ['한동안 소식이 뜸했던 사람과 다시 이야기하기 좋은 흐름입니다.', 'The reading favors getting back in touch with someone you have not heard from in a while.'],
      ['가까운 사이에도 무슨 말을 먼저 꺼낼지 망설여질 수 있습니다.', 'Even with someone close, it may be hard to know how to begin.'],
      [
        ['공통으로 아는 사람이나 장소가 떠오르면 그 얘기로 안부를 건네세요.', 'If a shared friend or place comes to mind, let that be your opening.', 'open-with-shared-memory'],
        ['함께 찍은 사진이나 들었던 노래가 남아 있다면 하나만 골라 보내 보세요.', 'If you have a photo or a song you shared, choose one to send.', 'share-memory-object'],
        ['글보다 목소리가 편한 사이라면 통화할 수 있는 시간을 하나 제안해 보세요.', 'If you both prefer talking, offer a time for a call.', 'offer-call-time'],
      ],
      ['답장이 늦어도 같은 메시지를 거듭 보내지는 마세요.', 'Give a slow reply time before sending the same message again.'],
    ],
    [
      [['손이 필요한 자리', 'A place for an extra hand'], ['혼자 하던 일에 손을 빌릴 때', 'A moment to ask for another pair of hands'], ['도움을 청할 한 가지', 'One specific thing to ask for']],
      ['혼자 붙잡고 있던 일에 누군가 손을 보태기 쉬운 흐름입니다.', 'Someone may be willing to help with a task you have been doing alone.'],
      ['주변에서 도울 마음이 있어도 어디가 막혔는지 모를 수 있습니다.', 'People around you may want to help without knowing where you are stuck.'],
      [
        ['자료를 찾아 달라거나 문장 하나를 봐 달라는 식으로 부탁을 좁혀 보세요.', 'Make a specific request, such as finding a reference or reading one sentence.', 'specify-help-needed'],
        ['어디서 막혔는지 설명하기 어렵다면 해본 흔적을 그대로 보여 주세요.', 'If the sticking point is hard to explain, show the attempt you already made.', 'show-work-in-progress'],
        ['서로 어려워하는 일이 다르다면 한 가지씩 바꿔 맡아 보세요.', 'If different tasks come easily to each of you, try swapping one small task.', 'trade-small-tasks'],
      ],
      ['도움을 청하기 전에 언제까지 답이 필요한지 생각해 두세요.', 'Work out when you need a reply before asking for help.'],
    ],
    [
      [['한 테이블에 앉는 날', 'Around the same table'], ['식탁에서 듣는 새 이야기', 'A new story at the table'], ['짧은 모임에서 건질 대화', 'A worthwhile conversation at a brief gathering']],
      ['식사나 짧은 모임에서 평소 못 듣던 이야기가 오갈 만합니다.', 'A meal or brief gathering may bring a conversation you would not usually have.'],
      ['사람이 모이면 이야기 속도가 달라 말할 틈을 놓치기 쉽습니다.', 'At a gathering, a fast-moving conversation can leave little room to speak.'],
      [
        ['처음 만난 사람에게는 그 자리에 오게 된 계기부터 물어보세요.', 'Ask someone new what brought them to the gathering.', 'ask-opening-question'],
        ['서로 모르는 사람이 있다면 두 사람이 함께 즐길 만한 주제로 소개해 보세요.', 'Introduce two people through something you know they both enjoy.', 'introduce-two-people'],
        ['말이 겹치면 내가 하려던 얘기를 잠시 멈추고 먼저 시작한 사람이 마저 말하게 해 주세요.', 'If voices overlap, pause and let the person who started speaking finish.', 'leave-room-to-speak'],
      ],
      ['사적인 질문은 상대가 먼저 말을 꺼낼 때까지 기다리세요.', 'Wait for the other person to bring up more personal topics.'],
    ],
    [
      [['돌아오는 작은 호의', 'A small kindness returned'], ['누군가 기억한 내 수고', 'Someone remembers what you did'], ['고마움을 건넬 차례', 'A chance to say thanks']],
      ['전에 건넨 도움을 누군가 기억하고 있다는 걸 알게 될 수 있습니다.', 'You may discover that someone remembers a kindness you once offered.'],
      ['내 수고에 바로 반응이 없으면 괜히 나섰나 싶을 수 있습니다.', 'When there is no immediate response to your help, you may wonder if you overstepped.'],
      [
        ['고마운 일이 떠오르면 어떤 점이 도움이 됐는지 한 문장으로 전하세요.', 'If you feel grateful, send one sentence about what helped.', 'thank-for-specific-kindness'],
        ['빌려 두었던 물건이 있다면 찾아서 돌려줄 때를 잡아 보세요.', 'If you still have something on loan, find it and arrange its return.', 'return-borrowed-item'],
        ['받은 도움이 유용했다면 같은 일에 막힌 사람에게 그 방법을 알려 주세요.', 'If a tip helped you, pass the method along to someone facing the same problem.', 'pass-help-forward'],
      ],
      ['가벼운 호의를 무거운 빚처럼 받아들이지 않아도 됩니다.', 'A small favor need not feel like a large debt.'],
    ],
    [
      [['말뜻을 다시 맞추는 날', 'Checking what was meant'], ['한 줄만으로 알 수 없는 마음', 'What one line cannot tell you'], ['짐작보다 직접 묻는 편이 빠른 날', 'Ask before guessing']],
      ['짧게 엇갈렸던 이야기도 마주 앉으면 맥락이 보일 수 있습니다.', 'A brief misunderstanding may make more sense in a direct conversation.'],
      ['메시지 한 줄로 상대의 표정까지 짐작하기 쉬운 때입니다.', 'It may be tempting to infer someone’s expression from a single message.'],
      [
        ['마음에 걸린 표현이 있으면 어떤 뜻으로 한 말인지 먼저 물으세요.', 'If a phrase bothers you, ask what the person meant by it.', 'clarify-personal-meaning'],
        ['글로 주고받을수록 말이 꼬이면 통화로 바꿔도 괜찮은지 물어보세요.', 'If a written exchange keeps getting tangled, ask if a quick call would work.', 'switch-to-voice'],
        ['마음에 걸린 말은 실제로 들은 부분과 내가 덧붙인 짐작을 따로 적어 보세요.', 'Write down the words you heard separately from what you inferred.', 'separate-quote-from-inference'],
      ],
      ['지난 일까지 한꺼번에 꺼내면 오늘 풀려던 이야기에서 멀어집니다.', 'Bringing up every past issue can distract from what you meant to resolve today.'],
    ],
    [
      [['역할을 나누면 가벼워지는 일', 'A lighter load when roles are shared'], ['빈자리를 먼저 찾는 협업', 'Look for what nobody has covered'], ['누가 끝까지 챙길지 정하는 날', 'Agree on who sees it through']],
      ['같이 일할 사람과 역할이 맞으면 생각보다 빠르게 진도가 납니다.', 'A shared task may move faster when everyone knows their role.'],
      ['같은 일을 두 사람이 챙기고 정작 빈자리는 남을 수 있습니다.', 'Two people may cover the same task while another remains unattended.'],
      [
        ['누가 시작하고 누가 마지막으로 확인할지 정해 두면 편합니다.', 'Agree on who starts and who gives the final check.', 'divide-start-and-finish'],
        ['같이 맡은 일에 내가 빠져야 한다면 아직 시간이 있을 때 빈자리를 알려 주세요.', 'If you need to drop out of a shared task, flag the gap while others can still adjust.', 'warn-of-uncovered-role'],
        ['다음 사람이 이어받을 작업물이나 물건을 어디에 둘지 한 곳을 정해 보세요.', 'Agree on one place to leave what the next person needs.', 'set-handoff-location'],
      ],
      ['상대의 여유를 확인한 뒤에 일을 더 나누세요.', 'Check the other person’s availability before handing over more work.'],
    ],
    [
      [['다음 약속으로 이어지는 대화', 'A conversation worth continuing'], ['공통 관심사에서 찾는 약속', 'A shared interest becomes a plan'], ['한 번 더 만나고 싶은 이유', 'A reason to meet again']],
      ['가볍게 꺼낸 관심사가 다음에 만날 이유가 될 수 있습니다.', 'An interest mentioned in passing may give you a reason to meet again.'],
      ['좋은 대화 뒤에도 다음 일정을 바로 잡기는 어려울 수 있습니다.', 'Even after a good conversation, finding the next date may take time.'],
      [
        ['공통 관심사가 나오면 함께 가 볼 만한 곳 하나만 제안하세요.', 'When a shared interest comes up, suggest one place you might visit together.', 'invite-to-activity'],
        ['다음에 무엇을 하면 좋을지 각자 하나씩 골라 보고 겹치는 취향을 찾아보세요.', 'Each suggest one thing to do next time and look for common ground.', 'exchange-preferences'],
        ['대화에서 서로 궁금해한 것이 있다면 나중에 찾아볼 자료 하나를 건네 보세요.', 'Send one useful reference about something you were both curious about.', 'share-useful-reference'],
      ],
      ['일정을 확정하기 전에 비용이나 이동 거리가 부담스럽지 않은지 확인하세요.', 'Before committing, make sure the cost and travel distance are manageable.'],
    ],
    [
      [['조용히 건네는 환영', 'A quiet welcome'], ['처음 온 사람 곁의 한 자리', 'Room for a newcomer'], ['낯선 자리에서 통하는 한마디', 'A word that helps someone settle in']],
      ['낯선 자리에 함께 있다면 먼저 와본 사람이 건네는 작은 설명이 반가울 수 있어요.', 'In an unfamiliar setting, a small tip from someone who knows the place can feel welcoming.'],
      ['처음 온 사람에게 관심이 몰리면 인사를 받는 일도 부담스러울 수 있어요.', 'Too much attention can make a welcome feel like a performance.'],
      [
        ['처음 온 사람이 있다면 물건을 어디에 두면 되는지처럼 바로 쓸 수 있는 정보 하나만 알려 주세요.', 'If someone is new, offer one useful detail, such as where they can put their things.', 'orient-newcomer'],
        ['처음 오는 사람이 있다면 찾기 쉬운 자리를 하나 비워 두세요.', 'If someone new is coming, keep an easy-to-find seat for them.', 'save-a-seat'],
        ['낯선 사람이 적응하고 싶어 한다면 얘기가 통할 만한 한 사람에게 소개해 주세요.', 'If a newcomer wants to meet someone, offer an introduction to one person with a shared interest.', 'offer-introduction'],
      ],
      ['소개하고 싶은 이야기가 있어도 당사자가 직접 꺼낼 몫을 남겨 두세요.', 'Leave room for a newcomer to decide what to share about themselves.'],
    ],
    [
      [['뜸했던 대화에 이어지는 뒷이야기', 'The rest of an old story'], ['지난번 얘기를 기억해 주는 마음', 'Remembering what mattered'], ['결과가 궁금했던 그 일', 'Wondering how it worked out']],
      ['전에 들었던 이야기를 기억해 주면 오래 알던 사이에도 새 대화가 열릴 수 있어요.', 'Remembering an earlier conversation can open a fresh one, even between old friends.'],
      ['결과를 묻는 말이 뜻하지 않게 재촉처럼 들릴 수도 있어요.', 'A question about the outcome can sound like pressure even when it is well meant.'],
      [
        ['지난번 들은 일이 떠오르면 요즘은 어떤지 가볍게 물어보세요. 짧은 답이면 그만큼만 들어도 좋아요.', 'If an earlier story comes to mind, ask how things are going and let a short answer be enough.', 'follow-up-old-story'],
        ['결과를 이야기하기 힘들어하면 조언을 보태기 전에 함께 있어도 좋은지 물어보세요.', 'If an outcome is hard to talk about, ask whether company would be welcome.', 'offer-company'],
        ['나중에 소식을 전하고 싶다고 하면 그 사람이 말한 때를 기억해 두세요.', 'If they would like to share news later, make a note of the time they suggested.', 'remember-next-checkpoint'],
      ],
      ['상대가 더 말하고 싶어 하는지 보기 전에 해결책부터 꺼내지 마세요.', 'Wait to see whether they want to say more before offering a solution.'],
    ],
  ],
  career: [
    [
      [['첫 줄에 담는 결론', 'Put the conclusion first'], ['보고서 맨 앞에 둘 말', 'What to put at the top of the update'], ['설명보다 먼저 보낼 요청', 'Send the request before the background']],
      ['준비한 내용을 짧게 정리하면 제안이 눈에 띄기 좋습니다.', 'A concise summary can help a prepared proposal stand out.'],
      ['설명이 길어질수록 정작 부탁할 일이 뒤로 밀리기 쉽습니다.', 'A long explanation can push the actual request out of sight.'],
      [
        ['보고 첫 줄에는 결론 하나, 그 아래에는 필요한 결정만 적어 보세요.', 'Start the update with one conclusion, then state the decision you need.', 'lead-with-conclusion'],
        ['설명을 마쳤다면 상대가 이해한 다음 단계를 한번 들어 보세요.', 'After explaining something, hear what the other person thinks the next step is.', 'ask-for-teachback'],
        ['말이 너무 길어지면 실제 예 하나를 골라 보여 주세요.', 'When an explanation grows long, show a single worked example.', 'show-example'],
      ],
      ['배경 설명은 상대가 물어볼 때 꺼낼 수 있게 따로 남겨 두세요.', 'Keep the background handy for when someone asks.'],
    ],
    [
      [['마감 앞에서 고를 일', 'Choosing what makes the deadline'], ['끝낼 일과 미룰 일', 'What to finish and what can wait'], ['오래 붙든 일을 마무리할 때', 'Time to wrap up a lingering task']],
      ['오래 붙들고 있던 과제를 끝내기에 힘이 실리는 흐름입니다.', 'The reading favors bringing a long-running task to a close.'],
      ['끝내려던 일에 자꾸 작은 수정이 붙을 수 있어요.', 'Small changes may keep finding their way into something you hoped to finish.'],
      [
        ['완료해야 할 항목과 다음에 손볼 항목을 한 줄씩 나눠 적으세요.', 'Write one line each for what must be finished and what can wait.', 'narrow-finish-line'],
        ['여러 일이 남았다면 내 몫을 기다리는 사람이 있는 일부터 골라 보세요.', 'Of the unfinished tasks, identify one that is holding someone else up.', 'prioritize-who-is-waiting'],
        ['시간이 모자라면 없어도 쓸 수 있는 부분 하나를 이번 범위에서 빼 보세요.', 'If time is short, leave out one part the result can work without.', 'drop-optional-task'],
      ],
      ['보낼 것이 있다면 파일이나 준비물만 마지막으로 한 번 살펴보세요.', 'If you have something to send or take along, give the file or item one last look.'],
    ],
    [
      [['초안이 먼저 할 일', 'What a first draft can do'], ['다듬기 전에 보여 줄 한 장', 'One page to show before polishing'], ['아이디어를 시험하는 첫 화면', 'A first screen that tests an idea']],
      ['다듬기 전의 아이디어도 보여 줄 자리가 생길 수 있습니다.', 'There may be a good chance to show an idea before it is polished.'],
      ['마음속에서만 고치다 보면 무엇이 부족한지 더 흐려집니다.', 'Reworking an idea only in your head can obscure what it is missing.'],
      [
        ['초안의 첫 화면만 보여 주고 이해하기 어려운 곳 하나를 물어보세요.', 'Share just the first screen of the draft and ask what was hard to follow.', 'request-targeted-feedback'],
        ['어느 방식이 나을지 모르겠다면 쉽게 되돌릴 수 있는 쪽으로 짧게 시험해 보세요.', 'For an uncertain choice, run a small trial of the option that is easy to undo.', 'try-reversible-option'],
        ['초안 두 개가 있다면 달라진 부분만 나란히 놓고 읽어 보세요.', 'Place two drafts side by side and read only the part that changed.', 'compare-before-after'],
      ],
      ['처음 나온 의견을 모두 반영하기 전에 가장 중요한 목적을 다시 보세요.', 'Revisit the main purpose before acting on every first reaction.'],
    ],
    [
      [['기록이 남기는 신뢰', 'Trust built by a clear record'], ['왜 바꿨는지 남겨 두는 날', 'Leave a record of why it changed'], ['나중에 읽힐 작업 메모', 'A work note for later']],
      ['평소 눈에 잘 띄지 않던 작업도 정리해 두면 설명할 기회가 생깁니다.', 'A record can give overlooked work a chance to be noticed.'],
      ['여러 사람이 손댄 일은 나중에 바뀐 이유부터 헷갈리기 쉽습니다.', 'When many hands change a task, it can be hard to remember why.'],
      [
        ['오늘 바꾼 내용과 바꾼 이유를 파일 옆에 짧게 남기세요.', 'Leave a short note by the file explaining what changed and why.', 'record-change-reason'],
        ['되돌아갈 일이 있을 것 같다면 고치기 전 원본을 따로 남겨 두세요.', 'Keep an original copy if you may want to undo an edit later.', 'save-original-version'],
        ['여럿이 낸 생각이라면 누가 어떤 부분을 냈는지 결과물에 함께 남겨 보세요.', 'For a shared idea, credit who contributed which part in the result.', 'credit-contribution'],
      ],
      ['최종본과 검토본은 이름을 달리해 두어 혼선을 줄이세요.', 'Give final and review copies distinct names to avoid a mix-up.'],
    ],
    [
      [['일을 넘기기 전 한 번', 'Before handing a task over'], ['다음 사람이 바로 시작할 수 있게', 'Help the next person get started'], ['말로 넘긴 일을 글로 정리할 때', 'Put a spoken handover in writing']],
      ['역할을 넘기면서 막혀 있던 일에도 새 방법이 보일 수 있습니다.', 'A handover may bring a fresh approach to work that has stalled.'],
      ['내용을 잘 아는 사람에게는 쉬운 지시도 처음 받는 사람에게는 모호합니다.', 'Instructions that seem obvious to you may be unclear to someone new.'],
      [
        ['인수인계에는 다음 행동과 확인할 사람을 함께 적어 두세요.', 'Include the next action and who to check with in the handover.', 'leave-restart-note'],
        ['설명만으로 넘기기 어렵다면 첫 단계는 함께 해보고 다음 단계부터 맡겨 보세요.', 'If a handoff is hard to explain, do the first step together.', 'demonstrate-first-step'],
        ['누군가 이어받을 자료가 있다면 그 사람도 열어 볼 수 있는지 확인해 주세요.', 'If someone will need a resource, check whether they can actually open it.', 'verify-access'],
      ],
      ['말로만 합의한 마감은 받은 사람이 확인할 수 있게 남기세요.', 'Write down any deadline that was agreed only in conversation.'],
    ],
    [
      [['새 요청에 답하는 순서', 'How to answer a new request'], ['수락하기 전에 물어볼 것', 'What to ask before saying yes'], ['새 부탁의 조건부터', 'Start with the terms of a new request']],
      ['내 경험을 써 볼 만한 부탁이 들어오면 조건을 조율하기 좋습니다.', 'A request that fits your experience may give you room to agree on terms.'],
      ['괜찮아 보이는 부탁도 지금 일정에 들어오면 부담이 커질 수 있습니다.', 'An appealing request can still strain the schedule you already have.'],
      [
        ['도와 달라는 사람이 있다면 무엇을 언제까지 해주면 좋을지 먼저 물어보세요.', 'If someone asks for help, find out what they need and when they need it.', 'agree-scope-and-date'],
        ['새 부탁을 맡았을 때 어떤 일이 미뤄지는지 먼저 짚어 보세요.', 'Before accepting a request, identify which existing task would have to wait.', 'check-displaced-task'],
        ['전부 맡기 어렵다면 오늘 해줄 수 있는 작은 부분만 제안해도 좋아요.', 'If you cannot take on the whole request, offer one piece you can do today.', 'offer-smaller-role'],
      ],
      ['할 수 있는 범위를 정하기 전에는 완료일을 약속하지 마세요.', 'Avoid promising a finish date before settling what you can take on.'],
    ],
    [
      [['누구나 찾을 수 있는 자리', 'A place anyone can find'], ['다음 사람이 덜 헤매는 준비', 'Helping the next person find their way'], ['작은 정리가 살리는 시간', 'A little order saves time']],
      ['찾는 데 시간을 쓰던 것을 눈에 잘 띄게 두면 다음 일이 수월해질 수 있어요.', 'Putting something frequently sought in plain sight can make the next task easier.'],
      ['내 눈에 반듯해 보여도 남이 쓰는 순서와 다를 수 있어요.', 'A tidy arrangement may not follow the order someone else uses.'],
      [
        ['함께 쓰는 것이 있다면 자주 찾는 하나의 자리를 정하고 쓰는 사람에게 알려 보세요.', 'For something you share, agree on a home for one frequently needed item.', 'agree-storage-location'],
        ['이름이 비슷한 물건은 겉에서 구분할 수 있는 표시를 하나 붙여 보세요.', 'Mark similar items so someone can tell them apart without opening them.', 'label-shared-item'],
        ['같은 자료가 여러 군데 있다면 현재 쓰는 판본을 골라 오래된 것과 구분해 두세요.', 'If several copies are in circulation, distinguish the current version from the old ones.', 'remove-obsolete-copy'],
      ],
      ['누군가 쓰고 있는 것을 묻지 않고 옮기면 한 번 더 찾게 될 수 있어요.', 'Check before moving something another person is using.'],
    ],
  ],
  money: [
    [
      [['장바구니를 다시 볼 때', 'A second look at your cart'], ['할인가 밖의 비용', 'The cost beyond the discount'], ['결제 버튼을 누르기 전', 'Before pressing checkout']],
      ['눈여겨보던 물건을 계획한 예산 안에서 찾기 좋은 흐름입니다.', 'The reading favors finding a planned purchase within your budget.'],
      ['좋아 보이는 할인도 결제 직전에 붙는 비용까지 보면 달라질 수 있습니다.', 'An attractive discount may look different once checkout fees appear.'],
      [
        ['같은 물건이라면 배송비와 반품 조건까지 넣어 두 곳을 비교하세요.', 'For the same item, compare two sellers including delivery and returns.', 'compare-total-cost'],
        ['구매하기 전에 이미 가진 물건으로 같은 일을 할 수 있는지 확인해 보세요.', 'Before buying, check whether something you own could do the same job.', 'check-owned-substitute'],
        ['자주 쓸지 모르는 물건은 직접 써볼 기회가 있는지 알아보세요.', 'For something you may seldom use, ask whether you can try it first.', 'try-before-buying'],
      ],
      ['할인 기간이 짧다는 이유만으로 예정에 없던 물건을 담지 마세요.', 'A short sale is no reason to add an unplanned item.'],
    ],
    [
      [['정산을 챙기는 날', 'Time to settle the bill'], ['미뤄 둔 비용 이야기를 꺼낼 때', 'Bring up an expense you put off'], ['영수증으로 맞추는 정산', 'Use the receipt to settle up']],
      ['미뤄 둔 정산이나 부탁하기 어려웠던 비용 이야기를 꺼내기 좋습니다.', 'The reading favors bringing up a delayed reimbursement or an awkward expense.'],
      ['받기로 한 돈도 서로 기억하는 날짜나 금액이 다를 수 있습니다.', 'Even when a payment is agreed, people may recall a different amount or date.'],
      [
        ['영수증이 남아 있으면 날짜와 내역을 정리해 함께 보내세요.', 'Send the receipt with a clear date and itemized note if you have it.', 'reconcile-receipts'],
        ['함께 비용을 낼 일이 있다면 주문하기 전에 각자 편한 범위를 맞춰 보세요.', 'If you will share a cost, agree on a comfortable range before ordering.', 'agree-budget-ceiling'],
        ['서로 기억하는 금액이 다르면 차이가 나는 항목 하나만 골라 확인해 보세요.', 'If the amounts you remember differ, check the one item that explains the gap.', 'query-discrepancy'],
      ],
      ['입금이 확인되기 전에는 그 돈을 다음 지출에 미리 보태지 마세요.', 'Wait for the payment to arrive before counting it toward another expense.'],
    ],
    [
      [['작은 보답이 반가운 때', 'A small reward is welcome'], ['수고의 값을 말할 자리', 'A chance to name the value of your work'], ['일거리 제안에 답하기 전', 'Before answering an offer of work']],
      ['꾸준히 해 온 일이 작은 일거리나 기분 좋은 보답으로 돌아올 만합니다.', 'Steady effort may bring a small paid task or a welcome reward.'],
      ['좋아하는 일이라도 대가가 정해지지 않으면 나중에 아쉬움이 남습니다.', 'Even enjoyable work can leave regret if compensation is never discussed.'],
      [
        ['일거리 제안을 받으면 필요한 시간과 비용을 적어 보고 답하세요.', 'If offered work, estimate the time and cost before replying.', 'price-time-and-travel'],
        ['작은 일이라도 보상을 약속했다면 무엇까지 포함하는지 글로 남겨 두세요.', 'If payment has been agreed, write down what the task includes.', 'write-scope'],
        ['대가를 나중에 받기로 했다면 언제 다시 확인할지 정해 보세요.', 'If payment is due later, choose when to follow up.', 'schedule-followup'],
      ],
      ['구두로 정한 금액은 시작하기 전에 글로 한 번 확인하세요.', 'Confirm a verbally agreed amount in writing before you start.'],
    ],
    [
      [['오래 쓴 물건의 다음 쓰임', 'Another use for an old favourite'], ['사기 전에 들여다볼 서랍', 'The drawer worth checking first'], ['손에 익은 것의 값어치', 'The value of the familiar']],
      ['이미 가진 것에서 바라던 쓰임을 찾으면 사야 할 목록이 가벼워질 수 있어요.', 'Finding a new use for something you own can shorten a shopping list.'],
      ['예전에 아꼈다는 이유만으로 불편한 물건을 계속 쓸 필요는 없어요.', 'An old favourite need not stay in use if it no longer works for you.'],
      [
        ['교체하고 싶은 물건이 있다면 고치고 싶은 점 하나를 적고, 지금 가진 것으로 해결할 수 있는지 보세요.', 'For an item you want to replace, name the one thing you would change and see whether it can be adjusted.', 'adjust-before-replacing'],
        ['당장 필요하지만 오래 쓸지 모르겠다면 잠깐 빌릴 곳을 찾아보세요.', 'If you need it briefly but long-term use is uncertain, see whether you could borrow one.', 'borrow-before-replacing'],
        ['아끼던 물건이 고장 났다면 같은 것을 사기 전에 수리가 가능한지 물어보세요.', 'For a broken item you value, ask whether it can be repaired before replacing it.', 'find-repair-option'],
      ],
      ['바꾸기로 했다면 새 물건을 둘 자리도 한 번 살펴보세요.', 'If you decide to replace it, check where the new item will go.'],
    ],
  ],
  move: [
    [
      [['약속 사이의 여유', 'Room between appointments'], ['도착보다 출발 시간을 먼저', 'Set departure before arrival'], ['동선에 남겨 둘 빈 시간', 'Leave a gap in the route']],
      ['동선을 가볍게 정리하면 오래 미뤄 둔 방문을 다녀오기 좋습니다.', 'A simple route may make a long-delayed visit easier to fit in.'],
      ['한 약속이 늦어지면 뒤 일정도 함께 밀리기 쉬운 흐름입니다.', 'A delay in one appointment could push back the rest.'],
      [
        ['도착 시간보다 출발 시간을 먼저 정하고 사이에 여유를 남겨 두세요.', 'Set your departure time first and leave room between plans.', 'plan-departure'],
        ['늦어질 것 같으면 먼저 기다릴 사람에게 도착 예상 시각을 알려 주세요.', 'If you are running late, send an arrival estimate to the person waiting.', 'send-arrival-update'],
        ['일찍 도착할 수 있다면 편하게 기다릴 곳 하나를 미리 골라 보세요.', 'If you may arrive early, choose a comfortable place to wait.', 'choose-waiting-place'],
      ],
      ['같은 이름의 장소가 여러 곳이면 주소와 지점을 대조하세요.', 'If places share a name, check the address and branch.'],
    ],
    [
      [['다른 길이 보이는 때', 'A different route comes into view'], ['평소 길이 막혔을 때', 'When the usual route is blocked'], ['지도에 남겨 둘 두 번째 길', 'A second route to save']],
      ['낯선 길로 돌아가다 반가운 곳을 하나 발견할 수 있습니다.', 'Taking an unfamiliar route may lead to a welcome discovery.'],
      ['평소 쓰던 길이나 교통편이 여의치 않아 계획을 바꿀 수 있습니다.', 'A familiar route or service may be unavailable, calling for a change of plan.'],
      [
        ['출발 전에 대체 경로 하나를 지도에 저장해 두면 마음이 놓입니다.', 'Save one alternate route on your map before setting off.', 'save-alternative-route'],
        ['여럿이 다른 길로 간다면 다시 만날 지점 하나를 지도에 표시해 나누세요.', 'If you take different routes, share a map pin for where you will meet again.', 'share-map-pin'],
        ['낯선 길에 들어설 때 돌아오는 쪽에서도 보일 표지를 하나 기억해 두세요.', 'On an unfamiliar route, pick a landmark you will recognise coming back.', 'note-return-landmark'],
      ],
      ['시간이 부족할 때는 확인하지 않은 지름길로 서두르지 마세요.', 'When time is short, avoid rushing down a shortcut you have not checked.'],
    ],
  ],
  study: [
    [
      [['답을 바꾸는 질문 하나', 'One question that changes the answer'], ['처음 막힌 단계부터', 'Start at the first step that stopped you'], ['모르는 곳을 표시하는 날', 'Mark what you do not understand']],
      ['막혔던 곳을 질문으로 바꾸면 풀 실마리가 보일 만합니다.', 'Turning a sticking point into a question may reveal a way forward.'],
      ['모르는 부분을 넓게 잡으면 어디서 시작할지 더 어려워집니다.', 'A broad sense of confusion can make it harder to find a starting point.'],
      [
        ['답이 막힌 문제에서 처음 이해하지 못한 단계에 표시를 남기세요.', 'Mark the first step you did not understand in the problem that stopped you.', 'locate-sticking-point'],
        ['설명만으로 막혔다면 같은 원리를 쓰는 완성된 예 하나를 찾아보세요.', 'If the explanation alone is not clicking, find one worked example of the same principle.', 'find-worked-example'],
        ['도움을 구할 수 있다면 풀이 전체 대신 막힌 한 단계만 직접 보여 달라고 해보세요.', 'If help is available, ask for a demonstration of the single step that stopped you.', 'ask-for-demonstration'],
      ],
      ['풀이를 읽은 뒤에는 책을 덮고 그 단계만 다시 설명해 보세요.', 'After reading the solution, close the book and explain just that step.'],
    ],
    [
      [['찾아 둔 자료를 쓰는 날', 'Using a reference you saved'], ['오래된 메모의 새 쓰임', 'A new use for an old note'], ['답에 가까운 자료부터', 'Start with the source closest to an answer']],
      ['전에 메모해 둔 자료가 지금 하려는 일에 뜻밖에 잘 맞을 수 있습니다.', 'A reference you saved earlier may fit the work you are doing now.'],
      ['자료가 많으면 골라 읽는 데만 시간을 쓰기 쉽습니다.', 'With too many sources, choosing what to read can take all the time.'],
      [
        ['오늘 답하려는 질문 하나를 적고 그 질문에 닿는 자료부터 여세요.', 'Write down one question and open the source most likely to answer it.', 'select-blocking-question'],
        ['자료 둘이 달라 보인다면 각각 어떤 조건에서 나온 설명인지 표시해 보세요.', 'When two references disagree, mark the conditions each assumes.', 'compare-assumptions'],
        ['다시 쓸 문장이 있다면 어디서 봤는지 출처와 함께 남겨 두세요.', 'Save a useful passage with its source so you can return to it.', 'save-source-and-quote'],
      ],
      ['인용하려는 내용은 요약본만 보고 옮기지 말고 원문을 확인하세요.', 'Check the original before quoting a point you found in a summary.'],
    ],
    [
      [['배운 것을 내 말로', 'What you learned in your own words'], ['설명해 보면 드러나는 빈틈', 'Explaining reveals what is missing'], ['개념 하나를 예로 풀어 보는 날', 'Give one concept an example']],
      ['최근 배운 것을 누군가에게 설명하며 이해를 넓히기 좋습니다.', 'The reading favors deepening your understanding by explaining something you learned.'],
      ['익숙한 말도 예를 들려 하면 정확히 모르는 부분이 드러날 수 있습니다.', 'Trying to give an example can reveal gaps behind familiar words.'],
      [
        ['개념 하나를 처음 듣는 사람에게 설명하듯 메모로 써 보세요.', 'Write a note explaining one concept as if to a first-time listener.', 'use-everyday-language'],
        ['말로 옮기기 어려운 관계는 두 대상을 그리고 연결선을 하나 그어 보세요.', 'When a relationship is hard to express, draw the two things and connect them.', 'draw-connections'],
        ['설명이 어디까지 맞는지 보려면 들어맞지 않는 예를 하나 만들어 보세요.', 'To test the limits of an explanation, construct an example where it fails.', 'find-counterexample'],
      ],
      ['정의와 예시가 서로 맞는지 확인한 뒤 메모를 공유하세요.', 'Check that the definition fits the example before sharing your note.'],
    ],
    [
      [['기억을 불러오는 작은 단서', 'A small cue that brings an idea back'], ['책을 덮고 떠올리는 한 가지', 'One thing to recall with the book closed'], ['낯익음과 기억 사이', 'Between recognition and recall']],
      ['자료를 덮은 뒤 기억에 남은 예가 무엇인지 보면 오래 남을 부분을 찾기 쉬워요.', 'Noticing which example stays with you after you close the material can show what is taking root.'],
      ['눈에 익었다는 느낌만으로 나중에도 바로 떠오른다고 단정하기 쉬워요.', 'Familiarity while reading can make later recall seem easier than it is.'],
      [
        ['읽은 것이 있다면 제목만 보고 떠오르는 예를 하나 말한 뒤 다시 펼쳐 보세요.', 'After reading, look only at the heading, recall an example, then open the material again.', 'recall-before-reopening'],
        ['다시 펼칠 쪽에 다음번에 답해 보고 싶은 질문 하나를 남겨 보세요.', 'Leave a question on the page to answer the next time you open it.', 'leave-recall-question'],
        ['기억한 예제의 조건 하나를 바꾸고 답도 달라지는지 확인해 보세요.', 'Change one condition in the example you remember and see whether the answer changes.', 'vary-one-condition'],
      ],
      ['잊힌 부분을 찾았을 때 처음부터 전부 다시 볼 필요는 없어요.', 'One missing detail need not send you back to the beginning.'],
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

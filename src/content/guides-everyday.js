import { defineGuide as guide } from './guide-catalog.js';

export const EVERYDAY_GUIDES = [
  guide('career', 'life', ['ten-gods-reading', 'major-cycles', 'study-family'], ['/lifetime/', '/today/'], '', {
    title: '직업운·이직운 보는 법: 사주를 진로 질문으로 바꾸기',
    description: '관성·식상·재성과 직업 해석의 관계, 취업·이직·사업운의 구분, 실제 선택 전에 확인할 질문을 정리합니다.',
    lead: '사주에는 창의적인 일이 맞는다고 나오는데 현재 직장은 안정적이라면 무엇을 기준으로 판단해야 할까요? 직업 상징을 곧바로 직종 추천이나 퇴사 날짜로 바꾸지 말고, 실제 업무 조건과 나란히 읽어보세요.',
    topics: ['직업운과 적성', '취업·이직운', '사업·동업운', '관성·식상과 직업'],
    sections: [
      { title: '직업 상징은 능력 검사와 다릅니다', paragraphs: ['전통 해석은 관성을 규칙·책임, 식상을 표현·산출, 재성을 자원 관리 등과 연결합니다. 이 명칭은 채용 가능성이나 실제 직무 능력을 측정한 결과가 아닙니다. 관성이 없다고 조직 생활을 못 하는 것도 아닙니다.', '같은 직종 안에도 기획·분석·설득·운영처럼 다른 일이 있습니다. “무슨 직업이 맞을까”라는 질문을 실제로 좋아하고 잘하는 업무, 성과 근거, 필요한 자격으로 나누면 해설에 과도하게 의존하지 않고 읽을 수 있습니다.'] },
      { title: '취업·이직·창업은 서로 다른 선택입니다', paragraphs: ['취업은 지원 요건과 전형, 이직은 제안 조건과 현재 역할, 창업은 고객 수요와 운영 자원이 중요합니다. 하나의 직장운 점수로 이 세 선택의 결과를 같게 평가할 수 없습니다.', '예를 들어 “표현을 점검하라”는 해설은 포트폴리오의 핵심 설명을 다시 읽는 계기로 쓸 수 있습니다. 점수가 높은 날에 지원하면 합격률이 높아진다는 증거로 읽지는 않습니다.'] },
      { title: '선택지를 같은 항목으로 비교합니다', paragraphs: ['현재 자리와 제안을 업무·보상·근무 조건·학습 기회·시작 기한으로 나란히 적어보세요. 동업이라면 역할과 의사결정·정산·종료 조건을 당사자끼리 확인해야 합니다. 출생 정보는 이 조건을 대신 설명하지 못합니다.', '대운이나 연간 해설이 마음에 걸리더라도 실제 지원·협상 기한을 놓칠 이유는 아닙니다. 불확실한 미래 문장보다 확인 가능한 제안과 준비 상태를 우선해 결정하세요.'] },
    ], checklist: ['직종 이름 대신 실제 업무와 성과를 적었나요?', '취업·이직·창업의 조건을 따로 확인했나요?', '운세 점수를 합격률이나 퇴사 근거로 쓰지 않았나요?'],
  }, {
    title: 'Career and job-change readings: turn symbols into questions',
    description: 'Separate career symbolism from skills, distinguish employment, job changes and business decisions, and compare real conditions.',
    lead: 'A creative-career description cannot decide whether to leave a stable job. Read it alongside actual responsibilities and evidence of your skills.',
    topics: ['Career and aptitude', 'Employment and job changes', 'Business and partnerships', 'Authority and Expression at work'],
    sections: [
      { title: 'Career symbols are not aptitude tests', paragraphs: ['Traditional readings associate Authority with rules and responsibility, Expression with output, and Wealth with resources. These labels do not measure employability or job performance. Missing Authority does not establish difficulty working in an organization.', 'Break a job into planning, analysis, communication and operations. Compare what you enjoy, demonstrated results and required qualifications before using a broad occupation label.'] },
      { title: 'Employment, changing jobs and starting a business differ', paragraphs: ['Applications involve requirements and selection; job changes involve an offer and current role; businesses involve customers and resources. One career score cannot evaluate all three outcomes.', 'A reminder about expression can prompt a portfolio review. It does not establish that applying on a high-scoring day raises acceptance probability.'] },
      { title: 'Compare choices using the same practical criteria', paragraphs: ['Write down responsibilities, pay, work conditions, learning opportunities and start dates for each choice. For partnerships, discuss roles, decisions, settlement and exit conditions.', 'Cycle descriptions do not justify missing actual deadlines. Decide from verifiable offers and readiness rather than an uncertain future statement.'] },
    ], checklist: ['Record actual tasks and performance evidence.', 'Separate employment, change and business conditions.', 'Do not treat scores as acceptance rates or resignation instructions.'],
  }),
  guide('money', 'life', ['ten-gods-reading', 'fortune-scores', 'career'], ['/lifetime/', '/today/'], '', {
    title: '재물운·정재·편재: 돈복과 실제 재무 상황 구분하기',
    description: '정재·편재·무재성의 전통 의미, 재물운 점수의 한계, 복권·투자·사업 수익과 구별해 읽는 방법을 설명합니다.',
    lead: '재물운이 좋다는 결과를 보면 평소보다 큰 결정을 해도 될 것처럼 느낄 수 있습니다. 하지만 이 점수에는 현재 소득·자산·부채나 시장 상황이 들어 있지 않습니다.',
    topics: ['재물운과 돈복', '정재 편재 차이', '무재성 사주', '투자·복권운의 한계'],
    sections: [
      { title: '재성은 일간과의 관계 이름입니다', paragraphs: ['정재·편재는 일간이 극하는 오행을 음양 관계로 나눈 십신입니다. 안정적인 관리나 유동적인 자원 같은 상징으로 설명하지만 실제 월급·자산을 조회한 값이 아닙니다. 편재가 있다는 이유로 사업이나 투자가 유리하다고 확정할 수 없습니다.', '재성이 보이지 않는 원국도 실제 경제활동과 별개입니다. 지장간·시간 미상 등 집계 범위를 확인하되, 그 여부로 부유함이나 빈곤을 단정하지 마세요.'] },
      { title: '재물운 점수는 수익률이나 당첨 확률이 아닙니다', paragraphs: ['이 사이트는 개인의 금융 계좌, 현금 흐름, 시장 가격이나 추첨 결과를 입력받지 않습니다. 점수가 높아도 예상 수익·손실·복권 당첨 확률을 계산한 것이 아닙니다.', '금전 해설이 “정리”를 권한다면 실제로 잊은 지출이나 결제 일정을 확인하는 계기로 사용할 수 있습니다. 좋은 운세를 근거로 지출·투자 금액을 늘리는 해석은 계산 범위를 벗어납니다.'] },
      { title: '현실의 숫자를 별도 기록합니다', paragraphs: ['관심 있는 선택이 있다면 확정된 비용과 기한, 현재 부담, 확인하지 못한 조건을 따로 적으세요. 사업이라면 실제 고객·매출·비용 자료가 필요하며, 운세 문장이 그 숫자를 채워주지는 못합니다.', '이 가이드는 금융상품이나 자산 배분을 추천하지 않습니다. 사주 결과와 실제 재무 판단을 구분하기 위한 설명이며, 큰 선택은 확인 가능한 자료와 필요한 전문 검토를 바탕으로 진행하세요.'] },
    ], checklist: ['재성을 실제 자산 금액과 구별했나요?', '운세 점수를 수익률·당첨 확률로 해석하지 않았나요?', '실제 비용·기한·미확인 조건을 별도로 적었나요?'],
  }, {
    title: 'Wealth readings, Direct Wealth and Indirect Wealth',
    description: 'Separate traditional Wealth labels from assets, returns and lottery probabilities, and keep real financial facts distinct.',
    lead: 'A favorable money reading contains no account balances, debts or market conditions. It cannot justify a larger financial commitment.',
    topics: ['Wealth symbolism', 'Direct and Indirect Wealth', 'Missing Wealth', 'Investment and lottery limits'],
    sections: [
      { title: 'Wealth is a relationship label', paragraphs: ['Direct and Indirect Wealth classify the element controlled by the Day Master according to yin/yang. Traditional resource metaphors do not establish actual income or a business advantage.', 'An absent visible Wealth label does not establish poverty or inability to earn. Check hidden-stem and unknown-time scope without turning the pattern into an economic verdict.'] },
      { title: 'The score is not a return or winning probability', paragraphs: ['The site receives no financial account data, cash flows, market prices or drawing results. Its score does not calculate return, loss or lottery odds.', 'A reminder to organize can prompt checking payment dates. Increasing spending or investment because of a favorable score exceeds the model’s scope.'] },
      { title: 'Record real numbers separately', paragraphs: ['List confirmed costs, deadlines, existing commitments and unknown terms. A business needs actual customer, revenue and cost evidence; a reading cannot supply it.', 'This guide does not recommend financial products or allocations. It explains the separation between a reading and a financial decision, which needs relevant facts and any appropriate professional review.'] },
    ], checklist: ['Separate Wealth labels from asset values.', 'Do not infer returns or winning odds.', 'Record actual costs, deadlines and unknown terms.'],
  }),
  guide('love-marriage', 'life', ['compatibility', 'special-stars', 'ten-gods-reading'], ['/compatibility/', '/lifetime/'], '', {
    title: '연애운·결혼운과 배우자궁: 점수보다 먼저 나눌 대화',
    description: '일지 배우자궁·배우자성·도화·홍란의 차이, 연애 시기·재회·결혼운 해석의 범위와 실제 대화 질문을 정리합니다.',
    lead: '연애운이 좋다는데 새로운 만남이 없거나, 궁합이 낮아 결혼이 걱정될 수 있습니다. 사주가 표시하는 글자 관계와 두 사람의 실제 의사·생활 조건은 다른 정보입니다.',
    topics: ['배우자궁과 배우자성', '연애·결혼 시기', '재회운의 한계', '연애운과 궁합 차이'],
    sections: [
      { title: '배우자궁과 배우자성은 같은 항목이 아닙니다', paragraphs: ['배우자궁은 전통적으로 일지를 가리키는 자리 이름이고, 배우자성은 십신에 관계 상징을 배정한 설명입니다. 이 사이트는 입력 성별에 따라 전통 규칙을 적용하지만 실제 관계 형태·성적 지향·배우자의 유무를 알아내는 계산은 아닙니다.', '도화·홍란·천희 같은 신살도 만남이나 결혼 성립을 확인한 표시가 아닙니다. 서로 다른 분류를 모두 “결혼 확률”로 합산하지 마세요.'] },
      { title: '시기 설명은 상대의 선택을 예측하지 못합니다', paragraphs: ['개인 연애운은 본인 원국과 대상 시점을, 궁합은 두 원국을 비교합니다. 어느 쪽도 상대가 연락할지, 재회에 동의할지, 언제 결혼할지를 확정하지 못합니다.', '낮은 점수 때문에 이별을 결정하거나 높은 점수 때문에 거절한 상대에게 다시 연락을 강요하지 마세요. 상대의 의사와 이미 표현한 경계를 먼저 존중해야 합니다.'] },
      { title: '함께 정할 수 있는 질문을 고릅니다', paragraphs: ['소통이 궁금하면 갈등 때 바로 이야기할지 생각할 시간을 둘지 묻습니다. 결혼을 준비한다면 돈 관리·거주·가사·각자의 가족과의 경계처럼 실제로 합의할 주제를 적어보세요.', '관계의 어려움이 있다면 글자 하나에 원인을 돌리기보다 실제 행동과 상황을 확인합니다. 안전이나 강요의 문제가 있다면 궁합이 좋다는 말로 그 문제를 축소하지 않습니다.'] },
    ], checklist: ['자리인 배우자궁과 십신인 배우자성을 구별했나요?', '재회·결혼을 상대 의사 없이 확정하지 않았나요?', '실제로 합의할 생활 질문을 정했나요?'],
  }, {
    title: 'Love, marriage and the spouse palace: conversations before scores',
    description: 'Distinguish spouse-palace, spouse-star and attraction labels, and separate relationship timing from mutual choices.',
    lead: 'A favorable love reading and a quiet social life can coexist. Character relationships do not reveal another person’s intentions or practical circumstances.',
    topics: ['Spouse palace versus spouse stars', 'Relationship and marriage timing', 'Reconciliation limits', 'Love readings versus compatibility'],
    sections: [
      { title: 'Palace and star describe different things', paragraphs: ['The spouse palace traditionally refers to the day branch; spouse stars assign relationship symbolism to Ten Gods. The service applies traditional input-gender rules, without establishing actual relationship form, orientation or partner status.', 'Attraction and matchmaker stars do not confirm a meeting or marriage. Do not combine distinct labels into a marriage probability.'] },
      { title: 'A timing label cannot predict another person’s consent', paragraphs: ['A personal love reading compares your chart with a period; compatibility compares two charts. Neither establishes contact, reconciliation or a wedding date.', 'A low score does not decide a breakup. A high score does not justify pressuring someone who declined contact. Respect expressed wishes and boundaries.'] },
      { title: 'Choose questions you can agree on together', paragraphs: ['Discuss whether to talk immediately after conflict or take time. For marriage, discuss finances, residence, chores and family boundaries.', 'Examine behavior and circumstances rather than attributing a difficulty to one character. Favorable compatibility does not minimize coercion or safety concerns.'] },
    ], checklist: ['Distinguish the spouse position from Ten Gods symbolism.', 'Do not establish reconciliation without mutual consent.', 'Choose practical questions to discuss together.'],
  }),
  guide('moving-dates', 'life', ['special-stars', 'annual-monthly', 'zodiac-samjae'], ['/today/', '/month/', '/manseryeok/'], '', {
    title: '이사운·이동운·택일: 좋은 날짜를 묻기 전 확인할 것',
    description: '역마·이동운·손 없는 날·택일의 차이와 이사·개업·결혼 날짜 비교에서 운세 계산기가 제공하는 범위를 설명합니다.',
    lead: '이사 날짜를 정하려는데 손 없는 날과 개인 운세 점수가 다르면 기준이 헷갈립니다. 서로 다른 전통 분류와 실제 계약·예약 조건을 나누어 보세요.',
    topics: ['이사운·이동운', '택일과 날짜 비교', '손 없는 날 차이', '개업·결혼 날짜'],
    sections: [
      { title: '이동운과 택일은 같은 계산이 아닙니다', paragraphs: ['이동운은 이 사이트가 원국과 시점 관계를 이동·변화 분야로 환산한 값입니다. 역마살은 별도의 글자 관계입니다. 두 값이 함께 나타나도 특정 도시나 이사 날짜의 성공을 검증한 것은 아닙니다.', '손 없는 날은 전통적인 날짜 관습이며 개인 원국 점수와는 기준이 다릅니다. 이 사이트는 별도의 전문 택일이나 모든 길일·흉일 규칙을 계산하는 도구가 아닙니다.'] },
      { title: '가능한 날짜의 현실 조건을 먼저 정합니다', paragraphs: ['이사라면 실제 입주 가능일, 기존·새 일정의 연결, 예약 가능 여부와 비용을 적습니다. 개업이나 결혼이라면 당사자·장소·기관의 가능한 날짜를 먼저 확인해야 합니다.', '후보 날짜가 정해진 뒤 운세를 참고하더라도 입력 인물·기간·계산 기준을 유지하세요. 후보를 바꿀 때 대상 날짜가 실제로 바뀌었는지도 확인해야 합니다.'] },
      { title: '날짜 점수로 위험이 없어지지는 않습니다', paragraphs: ['점수가 높은 날짜에도 계약 조건·안전·준비 상태 확인은 필요합니다. 점수가 낮다는 이유로 이미 합의한 일정을 무조건 취소하면 실제 비용이나 불편이 생길 수 있습니다.', '운세 설명은 “일정표를 다시 확인할까” 같은 확인 질문으로 활용하세요. 어느 날이 사고를 막거나 사업 성공을 보장한다는 근거로 사용하지 않습니다.'] },
    ], checklist: ['이동운·역마·손 없는 날·택일을 구별했나요?', '예약·입주·기관 일정 등 가능한 조건을 적었나요?', '비교할 때 같은 입력과 실제 대상 날짜를 사용했나요?'],
  }, {
    title: 'Moving, travel and auspicious-date selection',
    description: 'Separate movement scores, Travel Horse and traditional auspicious dates, and check practical moving, opening or wedding schedules.',
    lead: 'A traditional auspicious day and a personal movement score can use different rules. Compare them separately from booking and contract conditions.',
    topics: ['Movement readings', 'Date comparisons', 'Traditional auspicious days', 'Opening and wedding dates'],
    sections: [
      { title: 'Movement scores and date selection differ', paragraphs: ['The movement area translates this model’s chart/time relationships. Travel Horse is a separate pattern. Neither validates a particular city or moving date.', 'Traditional auspicious-day customs use other rules. This site does not provide comprehensive professional date-selection calculations.'] },
      { title: 'Identify feasible dates first', paragraphs: ['For moving, record availability, connected schedules, booking options and costs. For openings or weddings, confirm participants, venues and institutional dates first.', 'If comparing readings afterward, keep the same person and method and verify that the reference date actually changed.'] },
      { title: 'A date score cannot remove real risks', paragraphs: ['High scores do not replace checking terms, safety and readiness. Cancelling agreed dates over a lower score can have actual costs.', 'Use the text as a prompt to recheck a schedule. It does not establish accident prevention or business success.'] },
    ], checklist: ['Separate movement, star and date-selection rules.', 'Record feasible bookings and schedules.', 'Match inputs and verify the actual comparison dates.'],
  }),
  guide('study-family', 'life', ['ten-gods-reading', 'career', 'consultation'], ['/today/', '/lifetime/'], '', {
    title: '학업운·시험운·자녀운: 능력을 단정하지 않고 읽기',
    description: '인성·식상·문창귀인의 전통 해석과 학업 점수의 한계, 시험·문서 일정과 자녀 관련 결과를 읽는 기준을 안내합니다.',
    lead: '시험을 앞두고 학업운이 낮게 나오거나 아이 사주에 낯선 단어가 보이면 걱정될 수 있습니다. 출생 글자와 점수는 학습 능력이나 아이의 장래를 측정하지 않습니다.',
    topics: ['학업운·시험운', '인성·문창귀인', '문서운과 합격', '자녀운·아이 사주'],
    sections: [
      { title: '공부의 상징과 학습 능력은 다릅니다', paragraphs: ['전통 해석은 인성을 학습·보호, 식상을 표현, 문창귀인을 학문 상징으로 설명합니다. 어느 글자가 있거나 없다는 사실로 성적·지능·집중력을 평가하지 않습니다.', '현재 학업·문서운 점수에는 실제 시험 범위·준비량·채점·지원 경쟁률이 반영되지 않습니다. 합격 확률이나 학습장애 검사 결과로 해석할 수 없습니다.'] },
      { title: '시험과 문서는 확인 가능한 순서로 준비합니다', paragraphs: ['시험이라면 일정·응시 조건·제출 서류를 확인하고, 남은 학습 범위와 실제 연습 결과를 적습니다. 문서라면 버전·수신처·제출 기한·필수 항목을 확인하세요.', '운세가 “정리”를 강조하면 계획과 자료를 다시 보는 계기로 쓸 수 있습니다. 점수가 낮다고 시험을 포기하거나 높은 점수만 믿고 검토를 생략하지 마세요.'] },
      { title: '자녀 해석은 아이의 가능성을 제한하지 않습니다', paragraphs: ['시주나 식상에 붙이는 자녀 상징은 자녀 수·임신 여부·아이의 성격과 성취를 확인하는 근거가 아닙니다. 시간 미상이라면 시주 정보도 빠집니다.', '아이의 결과를 형제·친구와 비교해 우열을 매기거나 진로를 고정하지 마세요. 관심사와 관찰된 학습 경험을 듣고, 출생 정보와 결과 공유에도 보호받아야 할 개인정보가 있다는 점을 고려하세요.'] },
    ], checklist: ['학업운을 성적·지능·합격 확률과 구별했나요?', '시험·문서의 실제 조건과 기한을 확인했나요?', '아이에게 운명이나 진로의 낙인을 붙이지 않았나요?'],
  }, {
    title: 'Study, exams and children: readings without ability labels',
    description: 'Separate Resources and Scholar Star symbolism from ability, exam outcomes and a child’s future.',
    lead: 'A lower study score cannot measure learning ability, and an unfamiliar label cannot establish a child’s future.',
    topics: ['Study and exam readings', 'Resources and Scholar Star', 'Paperwork and acceptance', 'Children and birth charts'],
    sections: [
      { title: 'Study symbolism is not a measure of ability', paragraphs: ['Resources, Expression and Scholar Star carry traditional learning-related meanings. Their presence or absence does not assess intelligence, attention or grades.', 'The study/paperwork score does not use exam content, preparation, marking or competition. It cannot provide an acceptance probability or a learning-disability assessment.'] },
      { title: 'Prepare exams and documents using actual requirements', paragraphs: ['Check dates, eligibility and documents, then remaining material and practice results. For paperwork, verify version, recipient, deadline and required fields.', 'A reminder to organize can prompt reviewing materials. A lower score does not justify abandoning an exam, and a higher score does not replace checking work.'] },
      { title: 'Do not limit a child’s possibilities', paragraphs: ['Traditional child symbolism in hour pillars or Expression does not establish child count, pregnancy or a child’s attainment. Unknown time also excludes the hour pillar.', 'Do not rank siblings or fix a child’s career from a chart. Listen to interests and observed learning experiences, and consider privacy before sharing birth details.'] },
    ], checklist: ['Separate readings from ability and exam probabilities.', 'Check actual requirements and deadlines.', 'Avoid fixed labels about a child’s future.'],
  }),
  guide('health-reading', 'life', ['life-stages', 'five-elements-balance', 'fortune-scores'], ['/about/#limits', '/editorial/'], '', {
    title: '건강운은 건강검진이 아닙니다: 오행·수명 해석의 한계',
    description: '건강운 점수와 오행 신체 상징, 12운성의 병·사, 임신·수명 예측을 실제 건강 상태와 구별하는 기준을 설명합니다.',
    lead: '건강운이 낮거나 오행 설명에 특정 장기가 나오면 실제 병이 있는지 걱정될 수 있습니다. 이 서비스는 증상·검사·진료 기록을 받지 않으며 건강 상태를 판정하지 않습니다.',
    topics: ['건강운 점수', '오행과 신체 상징', '사주와 수명', '임신·질병 예측의 한계'],
    sections: [
      { title: '건강운은 전통 관계를 환산한 분야 이름입니다', paragraphs: ['건강운 점수는 이 서비스의 해석 규칙에서 나온 값입니다. 실제 질병 유무, 건강검진 결과, 발병 위험이나 회복 가능성을 계산하지 않습니다. 높은 점수가 정상 소견을 뜻하지도 않습니다.', '목·화·토·금·수와 신체를 연결하는 설명은 전통적 상징입니다. 오행 하나가 적다고 특정 장기에 문제가 있다는 결론으로 옮길 수 없습니다.'] },
      { title: '낯선 용어로 진단이나 수명을 추정하지 않습니다', paragraphs: ['12운성의 병·사·절, 신살의 백호 같은 이름은 실제 진단이나 사망 시점을 알려주지 않습니다. 임신 여부나 출산 가능성도 출생 글자와 운세 점수로 확인할 수 없습니다.', '이 사이트에는 수명·질병·임신 확률 계산을 추가하지 않습니다. 계산할 자료와 검증 근거가 없는 수치를 만들어 보여주는 것은 이용자가 확인할 수 있는 정보를 늘리지 못합니다.'] },
      { title: '실제 몸 상태는 별도의 경로로 확인합니다', paragraphs: ['몸 상태가 궁금한 경우 사주 화면을 새로 계산하는 것으로 해결하지 말고 실제 증상과 필요한 의료 확인을 기준으로 판단하세요. 운세 때문에 이미 필요한 진료나 검사를 미루지 않습니다.', '일상 해설은 잠시 쉬거나 일정을 점검할 계기로 읽을 수 있습니다. 약·치료·식단·진료 시점을 운세 점수로 바꾸는 안내는 이 서비스의 범위가 아닙니다.'] },
    ], checklist: ['건강운을 실제 진단·위험 확률과 구별했나요?', '전통 신체 상징을 검사 결과로 읽지 않았나요?', '운세로 진료·약·치료 결정을 바꾸지 않았나요?'],
  }, {
    title: 'A wellbeing reading is not a health assessment',
    description: 'Separate wellbeing scores, element-body metaphors and alarming stage names from diagnosis, pregnancy and lifespan.',
    lead: 'A lower wellbeing score cannot reveal illness. The service receives no symptoms, tests or medical records.',
    topics: ['Wellbeing scores', 'Element-body symbolism', 'Lifespan claims', 'Pregnancy and disease prediction limits'],
    sections: [
      { title: 'The area name describes a traditional scoring model', paragraphs: ['The wellbeing area expresses this service’s interpretation rules. It does not calculate disease, clinical findings, onset risk or recovery probability. A higher score does not establish normal health.', 'Associations between elements and body parts are traditional metaphors. A lower element count cannot establish a problem in an organ.'] },
      { title: 'Do not infer diagnosis or lifespan from labels', paragraphs: ['Stage names associated with illness, death or release, and stars such as White Tiger, do not reveal diagnoses or death dates. Birth characters cannot establish pregnancy status or reproductive outcomes.', 'The site does not add disease, lifespan or pregnancy probability calculators. Invented values without data or validation would not provide useful evidence.'] },
      { title: 'Check actual health through appropriate channels', paragraphs: ['Use actual symptoms and appropriate medical assessment when health is in question. Recalculating a reading cannot resolve it, and a score should not delay needed care.', 'Everyday text can prompt a break or schedule review. Changing medication, treatment, diet or care timing based on a fortune score is outside this service’s scope.'] },
    ], checklist: ['Separate scores from diagnoses and risk estimates.', 'Do not treat body symbolism as a test result.', 'Do not change care or treatment based on a reading.'],
  }),
  guide('naming-remedies', 'limits', ['useful-elements', 'five-elements-balance', 'consultation'], ['/saju/ohaeng/', '/editorial/'], '', {
    title: '개운법·행운의 색·작명: 상징과 효과를 구별하는 법',
    description: '오행 색·방향·이름·행운 숫자와 개운법을 전통 상징으로 읽고, 실제 효과·이름 판정·구매 결정과 구별하는 기준을 설명합니다.',
    lead: '용신에 맞는 색을 쓰거나 이름을 바꾸면 일이 더 잘 풀리는지 궁금할 수 있습니다. 전통적인 연결을 설명하는 것과 실제 효과를 입증하는 것은 다른 일입니다.',
    topics: ['오행 행운의 색·방향', '개운법과 부적', '작명·이름 오행', '행운 숫자·물건'],
    sections: [
      { title: '색과 방향은 전통적인 대응표입니다', paragraphs: ['오행에 색·방향·계절을 연결하는 설명은 전통 상징 체계입니다. 좋아하는 색을 고르는 참고로 쓸 수 있지만 그 색이 합격·수익·관계 회복을 가져온다는 증거는 아닙니다.', '용신이 같더라도 실제 생활에 필요한 선택은 사람마다 다릅니다. 색·방향·숫자를 계산 결과와 연결해 보여주더라도 사건 확률이나 물건의 효능으로 표현하지 않습니다.'] },
      { title: '이름과 원국은 별도의 입력·해석입니다', paragraphs: ['이 사이트의 원국은 출생 정보로 계산하며 이름의 한자·획수·발음으로 원국을 바꾸지 않습니다. 표시 이름을 바꿨는데 글자 배치가 같다면 정상적인 동작입니다.', '작명에는 발음·한자·획수·오행 등 여러 기준이 사용되지만 현재 서비스는 작명 판정기가 아닙니다. 이름만으로 재물·건강·운명을 확정하거나 법적 변경의 효과를 약속하지 않습니다.'] },
      { title: '불안을 근거로 구매를 서두르지 않습니다', paragraphs: ['부적이나 물건을 구매하면 불운이 사라진다는 주장은 이 사이트의 계산으로 확인할 수 없습니다. 무료 풀이에서 불안을 만든 뒤 추가 지출을 요구하는 경우에는 근거와 조건을 따로 확인하세요.', '운세를 읽고 행동을 바꾸고 싶다면 할 일을 하나 정리하거나 대화할 질문을 적는 등 직접 확인할 수 있는 행동을 골라보세요. 그 행동이 운세를 바꿨다고 인과관계를 만들어 설명하지 않습니다.'] },
    ], checklist: ['상징 대응표와 실제 효과를 구별했나요?', '표시 이름과 원국 계산 입력을 구별했나요?', '불운 제거를 이유로 지출을 서두르지 않았나요?'],
  }, {
    title: 'Lucky colors, naming and remedies: symbolism versus effects',
    description: 'Understand element colors, directions, names and objects without treating symbolism as proven effects or purchasing advice.',
    lead: 'Using a useful-element color or changing a name does not by itself establish improved outcomes. A traditional association and evidence of an effect are different things.',
    topics: ['Element colors and directions', 'Remedies and charms', 'Names and element systems', 'Lucky numbers and objects'],
    sections: [
      { title: 'Colors and directions form a traditional correspondence', paragraphs: ['Element associations can inform a personal color preference. They do not establish acceptance, returns or reconciliation.', 'People sharing a useful element still have different practical needs. Associating a color, direction or number with a chart does not provide an event probability or product effect.'] },
      { title: 'Names and birth charts use different inputs', paragraphs: ['This site calculates pillars from birth details, without changing them based on a name’s characters, strokes or sound. Changing a display name should leave the pillars intact.', 'Naming traditions use several methods, but this service does not evaluate names. It cannot establish financial, health or life effects from a name or promise effects from a legal change.'] },
      { title: 'Do not let an alarming claim create spending pressure', paragraphs: ['The calculation cannot verify that a charm or purchase removes misfortune. Check evidence and terms separately when an alarming free reading leads to a payment request.', 'If a reading prompts action, choose something observable such as organizing a task or preparing a conversation. Do not invent a causal claim that the action changed your fortune.'] },
    ], checklist: ['Separate symbolic associations from proven effects.', 'Distinguish display names from chart inputs.', 'Avoid rushed purchases based on removing misfortune.'],
  }),
];

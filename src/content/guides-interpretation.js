import { defineGuide as guide } from './guide-catalog.js';

export const INTERPRETATION_GUIDES = [
  guide('five-elements-balance', 'chart', ['hidden-stems', 'strength', 'useful-elements'], ['/saju/ohaeng/', '/manseryeok/'], 'elements', {
    title: '오행이 없거나 많으면 나쁜 사주일까요? 개수와 균형 읽기',
    description: '목화토금수의 겉글자 개수와 지장간 가중치를 실제 예시로 비교하고, 무오행·오행 과다를 해석할 때의 한계를 설명합니다.',
    lead: '오행 그래프에서 화가 0개라고 나오면 자신에게 무언가 부족하다고 느끼기 쉽습니다. 먼저 그 그래프가 어떤 글자를 세는지 확인해야 합니다.',
    topics: ['오행 부족과 과다', '무오행 뜻', '오행 개수와 가중치', '상생상극 읽기'],
    sections: [
      { title: '겉글자 개수와 지장간을 나누어 봅니다', paragraphs: ['이 사이트의 오행 개수는 원국에 드러난 천간과 지지의 대표 오행을 센 값입니다. 시간이 있으면 여덟 글자, 없으면 여섯 글자를 셉니다. 0개는 그 집계에서 보이지 않는다는 뜻입니다.', '지지 안의 지장간까지 반영하는 값은 겉글자 개수와 다릅니다. 아래 표는 같은 원국의 두 집계를 보여줍니다. 시간 미상인 결과를 완성된 팔자의 오행 분포로 설명해서는 안 됩니다.'] },
      { title: '상생과 상극은 관계의 이름입니다', paragraphs: ['목생화처럼 생하는 관계와 금극목처럼 극하는 관계는 전통 오행의 연결 방식입니다. 생은 무조건 좋은 사건, 극은 무조건 나쁜 사건이라는 등식이 아닙니다. 일간·계절·다른 관계를 함께 보는 해석과 단순 개수 세기를 구분하세요.', '다섯 오행을 정확히 같은 개수로 맞추는 것이 이 서비스의 용신 선정 방식은 아닙니다. 강약과 계절 보정을 거치므로 가장 적은 오행과 용신이 반드시 같지는 않습니다.'] },
      { title: '없는 글자를 없는 능력으로 바꾸지 않습니다', paragraphs: ['수가 없다고 지혜나 특정 신체 기능이 없다는 뜻이 아닙니다. 재성 오행이 안 보인다고 돈을 벌 수 없다는 뜻도 아닙니다. 실제 능력과 상태는 출생 글자 수로 측정되지 않습니다.', '부족한 색을 입는 활동은 개인적인 상징이나 취향으로 즐길 수 있습니다. 오행 그래프만으로 식단·약·투자·물품 구매를 결정하거나 결과가 보장된다고 설명하지 마세요.'] },
    ], checklist: ['겉글자 개수인지 지장간 포함 값인지 확인했나요?', '0개를 능력·건강의 결핍으로 해석하지 않았나요?', '가장 적은 오행과 용신을 구별했나요?'],
  }, {
    title: 'Missing or abundant elements: reading counts and balance',
    description: 'Compare visible element counts with hidden-stem weights and understand what a missing element does and does not mean.',
    lead: 'A zero on an element chart can feel alarming. First establish which characters the chart counts.',
    topics: ['Missing and abundant elements', 'Zero visible elements', 'Counts versus weights', 'Generating and controlling cycles'],
    sections: [
      { title: 'Separate visible counts from hidden stems', paragraphs: ['Visible counts use each displayed stem and the representative element of each branch: eight characters with a known time, six without. A zero describes that particular count.', 'Hidden-stem weights are a different aggregation. The table shows both for one chart. A time-unknown chart does not establish the complete eight-character distribution.'] },
      { title: 'Generating and controlling describe relationships', paragraphs: ['Wood generating Fire and Metal controlling Wood are traditional element relationships. They do not translate directly into good or bad events. Interpretation considers more than a count.', 'This service does not choose useful elements by making all five counts equal. Its strength and seasonal adjustments can select an element other than the least frequent one.'] },
      { title: 'An absent character does not establish an absent ability', paragraphs: ['No visible Water does not mean missing wisdom or impaired bodily function. No visible Wealth element does not establish an inability to earn. Character counts do not measure real abilities.', 'Enjoy symbolic colors as personal preferences. An element graph does not justify a diet, medicine, investment or purchase, or establish guaranteed benefits.'] },
    ], checklist: ['Identify visible counts versus hidden-stem values.', 'Do not infer incapacity or illness from zero.', 'Distinguish least frequent from useful element.'],
  }),
  guide('ten-gods-reading', 'chart', ['chart-reading', 'hidden-stems', 'career'], ['/saju/sipsin/', '/manseryeok/'], 'gods', {
    title: '십신·십성 보는 법: 재성·관성·인성이 없다는 말의 의미',
    description: '일간을 기준으로 십신을 찾는 방법과 비겁·식상·재성·관성·인성의 범위, 무재성·무관성·무인성의 해석 한계를 안내합니다.',
    lead: '“재성이 없다”는 설명을 보고 돈복이 없다고 단정하기 쉽습니다. 십신은 실제 재산이나 능력의 보유 여부가 아니라 일간과 다른 글자의 관계를 붙인 이름입니다.',
    topics: ['십신과 십성', '비겁·식상·재성·관성·인성', '무재성·무관성·무인성', '십신 찾는 법'],
    sections: [
      { title: '일간과 비교해야 이름이 정해집니다', paragraphs: ['같은 글자라도 기준 일간이 달라지면 십신이 달라집니다. 나와 같은 오행은 비겁, 내가 생하는 오행은 식상, 내가 극하는 오행은 재성, 나를 극하는 오행은 관성, 나를 생하는 오행은 인성으로 묶습니다.', '각 묶음에서 음양 관계에 따라 비견·겁재처럼 두 이름으로 나뉩니다. “정”이 붙으면 좋고 “편”이 붙으면 나쁘다는 등급표가 아닙니다. 개별 이름과 음양 관계는 십신 백과에서 확인할 수 있습니다.'] },
      { title: '표가 세는 범위를 먼저 확인합니다', paragraphs: ['천간에 표시된 십신, 지지 본기에 붙인 십신, 지장간 전체의 십신은 범위가 다릅니다. 아래 표는 현행 원국의 천간·지지 대표 십신입니다. 일주의 천간 자체는 비교 대상이 아닌 기준 일간으로 표시합니다.', '천간에 재성이 없더라도 지장간에 나타날 수 있고, 시간 미상이라면 시주의 정보도 빠져 있습니다. “없다”는 말은 어느 집계에서 없는지까지 적어야 의미가 분명해집니다.'] },
      { title: '관계 명칭을 인생의 결핍으로 바꾸지 않습니다', paragraphs: ['무관성은 취업 불가, 무인성은 공부 불가, 무재성은 평생 빈곤이라는 결론이 아닙니다. 전통적인 가족·직업 상징도 실제 사람의 유무와 가치를 판정하지 못합니다.', '십신을 읽고 관심이 생긴 분야가 있다면 일·돈·학업 가이드의 실제 확인 질문으로 이어가세요. 설명에 공감하는 것과 능력이나 성과가 측정된 것은 별개입니다.'] },
    ], checklist: ['기준 일간을 먼저 찾았나요?', '천간·본기·지장간 중 집계 범위를 확인했나요?', '없는 십신을 실제 능력이나 관계의 부재로 단정하지 않았나요?'],
  }, {
    title: 'Reading the Ten Gods and apparently missing groups',
    description: 'Find Ten Gods relative to the Day Master and distinguish Peers, Expression, Wealth, Authority and Resources from real-life outcomes.',
    lead: '“No Wealth” can sound like a financial verdict. Ten Gods label relationships between characters, not assets or abilities.',
    topics: ['Ten Gods terminology', 'The five relationship groups', 'Missing Wealth, Authority or Resources', 'Finding Ten Gods'],
    sections: [
      { title: 'The Day Master determines the label', paragraphs: ['The same character can receive a different label with a different Day Master. The same element forms Peers; what the Day Master generates is Expression, controls is Wealth, is controlled by is Authority, and is generated by is Resources.', 'Yin/yang relationships split each group into two names. Direct and Indirect are classifications rather than good and bad grades. Individual entries explain the distinctions.'] },
      { title: 'Identify what the table includes', paragraphs: ['Visible stems, principal branch stems and all hidden stems describe different scopes. The example shows stem and principal-branch relationships. The day stem itself is the reference Day Master.', 'A missing visible group may appear in hidden stems; unknown time also excludes an hour pillar. State the aggregation before saying a group is absent.'] },
      { title: 'A missing label is not a missing life opportunity', paragraphs: ['Missing Authority cannot establish unemployment, missing Resources cannot establish inability to learn, and missing Wealth cannot establish poverty. Family symbolism does not establish whether a person exists.', 'Use the relevant work, money or study guide to turn the symbolism into questions you can check. Resonance with a description is not a measurement of ability.'] },
    ], checklist: ['Find the reference Day Master.', 'Identify visible, principal or hidden-stem scope.', 'Do not equate absent labels with absent abilities or relationships.'],
  }),
  guide('hidden-stems', 'chart', ['five-elements-balance', 'ten-gods-reading', 'strength'], ['/saju/glossary/', '/manseryeok/'], 'hidden', {
    title: '지장간·본기·통근·투간: 겉글자와 해석이 다른 이유',
    description: '지지 안의 지장간과 본기, 통근·투간의 의미를 구분하고 실제 원국에서 지장간과 오행 개수의 차이를 확인합니다.',
    lead: '겉으로는 보이지 않는 오행이 해설에 등장하면 계산이 잘못됐다고 느낄 수 있습니다. 지지 한 글자에 대응하는 지장간을 별도로 보기 때문에 생기는 차이인지 먼저 살펴보세요.',
    topics: ['지장간 뜻', '본기·중기·여기', '통근과 투간', '숨은 오행'],
    sections: [
      { title: '지장간은 지지 안에 배정하는 천간입니다', paragraphs: ['전통 명리에서는 각 지지에 하나 이상의 천간을 배정해 지장간이라 부릅니다. 본기·중기·여기 등으로 구분하기도 합니다. 지장간이 여러 개여도 원국이 여덟 글자를 넘는 별도의 사주가 되는 것은 아닙니다.', '지지 대표 오행 한 개만 세는 표와 지장간을 포함한 분석의 값은 다를 수 있습니다. 아래 표에서 각 기둥의 지지 안에 어떤 천간을 사용하는지 확인할 수 있습니다.'] },
      { title: '통근과 투간은 배치의 관계를 설명합니다', paragraphs: ['통근은 천간이 지지 속 관련 기운에 뿌리를 둔다고 설명하는 용어이고, 투간은 지장간의 글자가 천간에도 드러난 배치를 말합니다. 구체적인 인정 범위와 해석 비중은 설명 방식에 따라 다를 수 있습니다.', '이 사이트는 지장간과 월지·일지 가중치를 강약 계산에 사용합니다. 모든 전통 격국·통근 이론을 완전하게 자동 판정하는 서비스는 아니므로 용어 설명과 실제 구현 범위를 구분해야 합니다.'] },
      { title: '글자 수와 가중값을 합쳐 세지 않습니다', paragraphs: ['겉글자 개수에 지장간 개수를 그대로 더해 오행 비율을 만들면 원래 그래프와 다른 집계가 됩니다. 어떤 표를 비교하든 천간·지지·지장간의 포함 범위와 가중치를 먼저 맞추세요.', '시간 미상은 시주와 그 안의 지장간까지 빠진 결과입니다. 남은 세 기둥의 표에서 특정 글자가 보이지 않더라도 완성된 팔자 전체에 없다고 단정할 수 없습니다.'] },
    ], checklist: ['지지 대표 오행과 지장간을 구별했나요?', '통근·투간 설명과 자동 계산 범위를 나누었나요?', '시간 미상일 때 시지 지장간도 제외된다는 점을 확인했나요?'],
  }, {
    title: 'Hidden stems, roots and revealed stems in a chart',
    description: 'Read hidden stems within branches and distinguish principal qi, rooting and revealed stems from visible element counts.',
    lead: 'An element can appear in an interpretation even when absent from the visible count. Hidden stems can explain that difference.',
    topics: ['Hidden stems', 'Principal and other qi', 'Rooting and revealed stems', 'Hidden elements'],
    sections: [
      { title: 'Hidden stems are assigned within branches', paragraphs: ['Traditional saju assigns one or more stems to each branch. These can be described as principal and other qi. Additional hidden stems do not create additional natal pillars.', 'Counting one representative element per branch differs from analyzing its hidden stems. The example lists the hidden stems used for each pillar.'] },
      { title: 'Rooting and revealing describe placement relationships', paragraphs: ['Rooting describes a visible stem receiving support from related qi within branches. Revealing describes a hidden stem also appearing visibly. Definitions and interpretation weights can vary.', 'This engine uses hidden stems and month/day branch weights in strength analysis. It does not comprehensively classify every traditional structure or rooting theory.'] },
      { title: 'Do not combine incompatible counts', paragraphs: ['Adding raw hidden-stem counts to the visible graph creates a different aggregation. Match included characters and weights before comparing tables.', 'Unknown time removes both the hour pillar and its hidden stems. Absence from the remaining three pillars does not establish absence from the complete chart.'] },
    ], checklist: ['Distinguish representative branch elements from hidden stems.', 'Separate terminology from automated implementation.', 'Account for excluded hour-branch hidden stems.'],
  }),
  guide('strength', 'chart', ['hidden-stems', 'useful-elements', 'five-elements-balance'], ['/lifetime/#public-example', '/about/'], 'strength', {
    title: '신강·신약·중화 뜻: 강한 사주가 더 좋은가요?',
    description: '일간 강약의 의미, 계절·지장간 가중치와 실제 계산 비율, 신강·신약을 건강·성격의 등급으로 읽지 않는 방법을 설명합니다.',
    lead: '신약이라는 단어 때문에 몸이나 마음이 약하다고 걱정할 필요는 없습니다. 여기서 강약은 원국 안에서 일간을 돕는 관계를 어떻게 집계했는지 나타내는 용어입니다.',
    topics: ['신강 신약 뜻', '중화 사주', '강약 계산', '신강과 건강·성격'],
    sections: [
      { title: '강약은 일간을 기준으로 계산합니다', paragraphs: ['신강·신약은 일간을 돕는 기운과 다른 관계의 균형을 설명하는 전통 용어입니다. 오행 막대에서 일간 오행 하나의 개수가 많다는 이유만으로 같은 결론이 나오는 것은 아닙니다.', '이 서비스는 비겁·인성의 도움 비율에 월지·일지 지장간 가중치를 반영합니다. 월지의 계절 배경과 지장간이 들어가므로 겉글자 개수 비율과 달라집니다.'] },
      { title: '표의 비율은 모델 내부의 지표입니다', paragraphs: ['아래는 실제 엔진이 만든 도움 비율과 분류입니다. 표의 비율은 사용자 집단의 상위 비율이나 정신력·체력 점수가 아닙니다. 임계값과 보정 방식이 다르면 다른 서비스의 강약 표현도 달라질 수 있습니다.', '중화도 완벽한 인생을 보장하는 등급이 아닙니다. 강약 분류는 용신 선호도 등 다음 계산의 입력 중 하나이며 전체 운세를 한 단어로 확정하는 결론이 아닙니다.'] },
      { title: '시간 미상이나 경계 결과는 조건을 함께 적습니다', paragraphs: ['시주를 제외하면 도움 비율과 강약 분류가 달라질 수 있습니다. 다만 모든 사람에게 같은 방향의 변화가 생기지는 않습니다. 시간을 모르는 결과에는 남은 세 기둥 기준이라는 조건을 붙이세요.', '두 서비스의 신강·신약이 다르다면 원국부터 비교하고 집계·가중치·임계값을 확인합니다. “더 강하다”는 표현을 근거로 건강·회복력·대인관계 능력을 평가하지 않습니다.'] },
    ], checklist: ['강약을 일간에 대한 관계로 읽었나요?', '내부 도움 비율을 체력·정신력 점수와 구별했나요?', '원국·가중치·임계값을 맞춘 뒤 비교했나요?'],
  }, {
    title: 'Strong, weak and balanced Day Masters: what they mean',
    description: 'Understand Day Master support, hidden-stem weights and strength ratios without treating the labels as health or personality grades.',
    lead: 'A “weak” Day Master is not a diagnosis of physical or emotional weakness. It labels a particular calculation of chart relationships.',
    topics: ['Day Master strength', 'Balanced charts', 'Strength calculation', 'Strength versus wellbeing'],
    sections: [
      { title: 'Strength uses the Day Master as reference', paragraphs: ['Strength describes support relative to other chart relationships. Counting only the Day Master’s visible element is insufficient.', 'This service uses Peer and Resource support with month/day branch hidden-stem weights. Its ratio therefore differs from a visible-character percentage.'] },
      { title: 'The ratio is internal to the model', paragraphs: ['The example shows the calculated support ratio and label. It is not a population percentile or a score for stamina or resilience. Different thresholds and weights can produce different labels elsewhere.', 'Balanced is not a promise of a perfect life. Strength informs later calculations such as useful-element preferences rather than determining an entire reading.'] },
      { title: 'Keep uncertain inputs attached to the label', paragraphs: ['Removing an unknown hour can change the support ratio or label, with no universal direction of change. State that the result uses three pillars.', 'Compare pillars before weights and thresholds when calculators disagree. Do not assess health, emotional capacity or relationships from a strength label.'] },
    ], checklist: ['Read strength as a chart relationship.', 'Separate internal ratios from physical and emotional capacity.', 'Match pillars, weights and thresholds when comparing.'],
  }),
  guide('useful-elements', 'chart', ['strength', 'five-elements-balance', 'major-cycles'], ['/lifetime/#public-example', '/about/'], 'roles', {
    title: '용신·희신·기신 찾는 법: 부족한 오행과 같은가요?',
    description: '억부·조후·격국의 차이와 이 사이트의 용신 계산 범위, 실제 원국의 용신·희신·기신 결과와 비교 순서를 안내합니다.',
    lead: '어떤 곳에서는 화가 용신이고 다른 곳에서는 수가 용신이라고 하면 무엇을 따라야 할지 어렵습니다. 우선 같은 원국을 서로 다른 해석 규칙으로 평가한 것인지 확인해야 합니다.',
    topics: ['용신 희신 기신 뜻', '용신 찾기', '억부·조후·격국 차이', '용신이 다른 이유'],
    sections: [
      { title: '용신은 단순히 가장 적은 오행이 아닙니다', paragraphs: ['용신은 전통 해석에서 원국을 조정하는 데 필요하다고 보는 기운입니다. 희신은 돕는 기운, 기신은 부담으로 해석하는 기운으로 설명하지만 선정 방식은 학파와 모델에 따라 다릅니다.', '강약을 조절하는 억부, 계절의 한난을 보는 조후, 구조를 중심으로 보는 격국은 같은 질문을 완전히 같은 방식으로 푸는 절차가 아닙니다. 그래서 오행 개수만으로 용신을 확정하기 어렵습니다.'] },
      { title: '이 사이트는 억부 선호와 계절 보정을 합칩니다', paragraphs: ['현재 엔진은 일간 강약과 십신 그룹의 비중으로 오행 선호도를 구하고 계절 보정을 더해 순서를 정합니다. 아래 표는 그 규칙으로 계산한 용신·희신·기신입니다. 별도의 격국·종격 판정 전체를 구현한 결과는 아닙니다.', '기신이라고 표시된 오행이 실생활의 특정 사람·직업·색을 피하라는 명령은 아닙니다. 모델 내부의 선호도 순서와 실제 선택의 유불리는 구분해야 합니다.'] },
      { title: '차이가 나면 원국과 규칙을 함께 비교합니다', paragraphs: ['달력·시각·네 기둥이 같은지 확인하고, 시간 미상인지, 지장간과 월지 가중치를 어떻게 반영하는지 봅니다. 그다음 억부·조후·격국 등 어떤 방식을 썼는지 비교하세요.', '용신에 맞는 물건을 사거나 기신에 해당하는 사람을 멀리한다고 결과가 좋아진다는 근거를 이 계산기는 제공하지 않습니다. 해석이 불일치하면 불일치 상태를 남기고 중요한 결정을 그 한 값에 맡기지 마세요.'] },
    ], checklist: ['가장 적은 오행을 곧바로 용신으로 정하지 않았나요?', '억부·조후와 격국 판정의 범위를 확인했나요?', '다른 결과와 원국·입력·해석 규칙을 함께 비교했나요?'],
  }, {
    title: 'Useful, supporting and challenging elements: why results differ',
    description: 'Separate strength balancing, seasonal adjustment and structure classification, and inspect this service’s useful-element model.',
    lead: 'Two services can choose opposing useful elements. First establish whether they share the same chart and interpretation rules.',
    topics: ['Useful and supporting elements', 'Finding a useful element', 'Balancing versus seasonal or structure methods', 'Disagreement between services'],
    sections: [
      { title: 'Useful does not mean least frequent', paragraphs: ['A useful element is considered helpful for adjusting a chart within a traditional method. Supporting and challenging elements describe related preferences, but selection varies across schools and models.', 'Strength balancing, seasonal temperature adjustment and structure classification are different procedures. Visible counts alone cannot establish a universal useful element.'] },
      { title: 'This engine combines balancing and seasonal adjustments', paragraphs: ['The engine ranks element preferences using Day Master strength, relationship-group weights and seasonal adjustment. The example comes from that calculation, without comprehensive special-structure classification.', 'A challenging-element label does not instruct you to avoid a person, career or color. An internal preference rank is distinct from a real-life advantage.'] },
      { title: 'Compare charts and methods together', paragraphs: ['Match calendar, time and pillars first. Then check unknown-hour handling, hidden-stem and month weights, and the type of useful-element method.', 'This calculator provides no evidence that buying an object or avoiding a person based on an element improves outcomes. Preserve unresolved disagreement rather than letting one value decide a major choice.'] },
    ], checklist: ['Do not automatically select the least frequent element.', 'Identify balancing, seasonal and structure scope.', 'Compare input, chart and interpretation rules together.'],
  }),
  guide('combinations-clashes', 'chart', ['compatibility', 'ten-gods-reading', 'special-stars'], ['/saju/glossary/', '/compatibility/'], '', {
    title: '합·충·형·파·해·원진 뜻: 충이 있으면 나쁜가요?',
    description: '천간합·육합·삼합과 충형파해·원진의 비교 단위, 합화 해석의 조건, 원국과 궁합에서의 읽는 순서를 정리합니다.',
    lead: '원국에 충이나 원진이 표시되면 사고나 이별을 걱정하기 쉽습니다. 이 표시는 우선 정해진 글자 관계에 해당한다는 뜻이며 실제 사건이 확인됐다는 뜻은 아닙니다.',
    topics: ['천간합·육합·삼합', '충형파해 뜻', '원진 관계', '합화 조건'],
    sections: [
      { title: '어떤 글자끼리의 관계인지 찾습니다', paragraphs: ['천간끼리의 합과 지지끼리의 육합·삼합은 비교 대상이 다릅니다. 충·형·파·해·원진도 각각 정해진 배치를 가리킵니다. 표시가 보이면 해당 글자가 어느 기둥에 있는지부터 확인하세요.', '원국 안의 관계와 원국에 대운·세운을 더해 보는 관계, 두 사람의 원국을 비교한 관계는 범위가 다릅니다. 같은 “충”이라는 단어라도 어느 두 글자를 비교했는지 적어야 합니다.'] },
      { title: '합이 있다고 곧바로 모든 오행이 바뀌지는 않습니다', paragraphs: ['합 관계를 찾는 것과 합화가 성립해 다른 오행으로 본다는 해석은 다른 단계입니다. 계절·주변 글자·학파별 조건을 생략하고 원래 글자를 마음대로 바꿔 오행 개수를 다시 세지 마세요.', '합의 개수가 많다는 이유로 전체 점수가 높아야 한다고 기대할 수도 없습니다. 이 사이트의 점수는 여러 관계와 가중치를 함께 사용하므로 단일 표시와 종합 결과는 일대일로 대응하지 않습니다.'] },
      { title: '관계 이름에서 실제 사건으로 건너뛰지 않습니다', paragraphs: ['충이 있다는 사실만으로 이혼·사고·퇴사를 예측하지 않습니다. 실제 갈등이 있다면 어떤 상황에서 생겼는지, 일정·역할·기대가 어떻게 다른지 확인하는 편이 구체적입니다.', '궁합에서는 두 사람의 동의와 대화가 먼저입니다. 합을 이유로 관계를 강요하거나 원진을 이유로 상대를 위험한 사람으로 규정하지 마세요.'] },
    ], checklist: ['어느 기둥의 어떤 두 글자를 비교했나요?', '관계 탐지와 합화 판단을 구별했나요?', '사고·이별을 글자 관계만으로 확정하지 않았나요?'],
  }, {
    title: 'Combinations, clashes and other branch relationships',
    description: 'Distinguish stem combinations, branch combinations and clashes, and separate matching a pattern from interpreting transformation or events.',
    lead: 'A clash or friction label can sound like a forecast. It first identifies a character pattern, not an established accident or separation.',
    topics: ['Stem combinations and branch trines', 'Clash and other branch relationships', 'Friction patterns', 'Element transformation conditions'],
    sections: [
      { title: 'Identify the characters being compared', paragraphs: ['Stem combinations and branch combinations use different characters. Clashes, penalties, breaks, harms and friction patterns each describe defined arrangements. Locate the relevant pillars first.', 'Within-chart, cycle-to-chart and person-to-person comparisons have different scopes. Record which characters are involved rather than reading the label alone.'] },
      { title: 'Matching a combination does not automatically transform elements', paragraphs: ['Finding a combination and concluding that it transforms into another element are separate steps. Do not replace natal characters and recount elements without the relevant conditions and method.', 'More combinations do not automatically require a higher overall score. This service uses several weighted relationships, so one pattern does not determine the total.'] },
      { title: 'Do not jump from a pattern to an event', paragraphs: ['A clash alone cannot establish divorce, an accident or resignation. For real conflict, examine circumstances, expectations and responsibilities.', 'Respect consent and conversation in compatibility. A combination does not justify pressure to stay together; friction does not establish a dangerous person.'] },
    ], checklist: ['Locate the characters and comparison scope.', 'Separate pattern detection from transformation.', 'Do not establish accidents or breakups from a label.'],
  }),
  guide('life-stages', 'chart', ['strength', 'special-stars', 'chart-reading'], ['/saju/12unseong/', '/manseryeok/'], '', {
    title: '12운성의 병·사·절은 무슨 뜻일까요?',
    description: '장생·목욕·관대·건록·제왕·쇠·병·사·묘·절·태·양의 전통 상징과 일간 기준, 건강·수명과의 구분을 안내합니다.',
    lead: '만세력에서 병이나 사라는 글자를 처음 보면 건강이나 죽음을 떠올릴 수 있습니다. 12운성은 일간과 지지의 관계를 생애의 단계에 빗댄 전통 분류입니다.',
    topics: ['12운성 순서', '병·사·묘·절 뜻', '일간과 운성', '제왕·건록 해석'],
    sections: [
      { title: '단계 이름은 실제 나이나 수명이 아닙니다', paragraphs: ['12운성은 장생·목욕·관대·건록·제왕·쇠·병·사·묘·절·태·양이라는 이름을 사용합니다. 여기서 병·사·묘·절은 의학적 상태, 사망 시점이나 묘지를 확인한 표시가 아닙니다.', '제왕·건록이라는 이름도 성공을 보장하는 등급이 아닙니다. 어느 단계든 그 이름만 떼어 사람의 우열이나 미래를 판정하지 않습니다.'] },
      { title: '이 서비스는 일간과 각 지지를 비교합니다', paragraphs: ['현행 원국 표의 운성은 일간을 기준으로 각 기둥의 지지를 비교해 계산합니다. 같은 지지라도 일간이 다르면 운성이 달라질 수 있으므로 지지 하나만 보고 목록을 찾으면 혼동하기 쉽습니다.', '다른 설명에서 다른 기준 천간이나 음간 순서를 쓰면 결과가 달라질 수 있습니다. 비교하려면 기준 천간과 계산 표를 먼저 맞추세요. 시주 미상일 때는 시지 운성도 제외됩니다.'] },
      { title: '다른 층의 설명과 나란히 읽습니다', paragraphs: ['운성은 원국·계절·십신·강약과 나란히 읽는 보조적인 분류입니다. 운성 하나를 다시 점수로 바꿔 기존 종합 점수에 더하면 이 서비스와 다른 계산이 됩니다.', '낯선 용어가 신경 쓰이면 백과에서 해당 단계의 상징을 읽고, 실제 생활의 상태는 별도로 확인하세요. 불편한 단어를 질병이나 운명으로 번역하지 않는 것이 핵심입니다.'] },
    ], checklist: ['단계 명칭을 실제 질병·수명과 구별했나요?', '기준 일간과 비교 지지를 확인했나요?', '하나의 운성으로 전체 결과를 판정하지 않았나요?'],
  }, {
    title: 'The twelve life stages: why “illness” and “death” are symbols',
    description: 'Understand the twelve traditional stage labels, their Day Master basis and their distinction from health, lifespan or success.',
    lead: 'Some stage labels sound alarming. They are traditional analogies for relationships between a stem and branch, not medical findings.',
    topics: ['The twelve-stage sequence', 'Alarming stage names', 'Day Master reference', 'Peak and established-strength stages'],
    sections: [
      { title: 'Stage names are not ages or lifespans', paragraphs: ['The sequence uses imagery from birth through maturity, decline, storage and renewal. Labels often translated as illness, death or extinction do not establish a diagnosis or death date.', 'Peak or established-strength labels do not guarantee success either. No stage alone grades a person or establishes a future outcome.'] },
      { title: 'This chart compares the Day Master with each branch', paragraphs: ['The natal table uses the Day Master as reference for each branch. A different Day Master can give the same branch a different stage.', 'Other methods can differ in reference stems or sequences. Match the basis before comparing. An unknown hour also excludes its branch stage.'] },
      { title: 'Read stages alongside other layers', paragraphs: ['Stages are supplementary to pillars, season, Ten Gods and strength. Adding a self-invented stage score to the overall score creates a different model.', 'Read the reference entry when a label is unfamiliar. Check real-life health or circumstances separately instead of translating a symbolic name into a diagnosis.'] },
    ], checklist: ['Separate symbols from illness or lifespan.', 'Identify the Day Master and branch.', 'Avoid judging the full chart from one stage.'],
  }),
  guide('special-stars', 'chart', ['combinations-clashes', 'life-stages', 'love-marriage'], ['/saju/sinsal/', '/manseryeok/'], '', {
    title: '도화·역마·화개·귀인·백호: 신살 이름을 읽는 기준',
    description: '대표 신살과 공망의 전통 의미, 기준 글자·계산 범위 확인법, 신살 하나로 연애·직업·사고를 단정하지 않는 방법을 안내합니다.',
    lead: '도화살이 있으면 인기가 많고 백호살이 있으면 위험하다는 식의 짧은 설명은 기억에 남습니다. 하지만 그 이름이 어떤 기준 글자로 계산됐는지 빠져 있으면 자신의 원국에 적용하기 어렵습니다.',
    topics: ['도화·홍염 해석', '역마·화개·천을귀인', '양인·괴강·백호', '공망과 신살 범위'],
    sections: [
      { title: '기준 글자와 찾는 자리를 확인합니다', paragraphs: ['신살은 정해진 글자 조합이나 위치에 이름을 붙인 전통 분류입니다. 도화·역마·화개처럼 기준 지지와 비교 지지를 쓰는 것과 일주 조합을 확인하는 것이 섞여 있으므로 이름만 모아 세지 마세요.', '한 글자가 자오묘유에 있다는 설명과 특정 기준에서 도화가 성립한다는 설명도 구분해야 합니다. 년지 기준인지 일지 기준인지, 어떤 기둥을 탐색하는지에 따라 표시가 달라질 수 있습니다.'] },
      { title: '모든 신살을 계산하는 것은 아닙니다', paragraphs: ['이 사이트는 백과와 원국 화면에서 안내하는 대표 신살을 계산합니다. 홍염·공망 등 다른 글에서 접한 항목이 보이지 않는다고 해당 조건이 없다고 확정할 수는 없습니다. 항목 미표시와 실제 부재는 다릅니다.', '공망은 간지 순환과 관련된 별도 전통 개념으로 설명되지만 공망이라는 말만으로 한 기둥 전체가 사라진다고 처리하면 안 됩니다. 미지원 항목을 임의 계산으로 현재 결과에 덧붙이지 마세요.'] },
      { title: '매력·이동·위험을 실제 사실로 확정하지 않습니다', paragraphs: ['도화·홍란·천희는 연애 성사율이나 외도 여부를 측정하지 않고, 역마는 해외 취업이나 이사 성공을 보장하지 않습니다. 백호·양인 같은 이름도 사고나 폭력성을 확인한 진단이 아닙니다.', '좋은 이름의 신살이 많아도 중요한 확인을 생략할 이유가 되지 않습니다. 불안한 단어가 보이면 먼저 기준과 범위를 읽고 실제 관계·일정·안전 문제는 현실 자료로 확인하세요.'] },
    ], checklist: ['기준 글자와 탐색 기둥을 확인했나요?', '계산 미지원과 조건 부재를 구별했나요?', '매력·외도·사고를 신살 이름으로 확정하지 않았나요?'],
  }, {
    title: 'Peach Blossom, Travel Horse and other special-star labels',
    description: 'Check reference characters, supported star rules and the limits of inferring attraction, movement or danger from a label.',
    lead: 'Memorable star names can hide their calculation conditions. Locate the reference character before applying the description to your chart.',
    topics: ['Peach Blossom and attraction symbols', 'Travel Horse, Canopy and Noble Helper', 'Blade, Commanding and White Tiger', 'Void and unsupported labels'],
    sections: [
      { title: 'Find the reference character and target position', paragraphs: ['Special stars label traditional combinations or positions. Some compare reference branches with other branches; others use a particular day-pillar pair.', 'A branch belonging to a familiar set does not automatically establish every star associated with it. Year-branch versus day-branch rules and target pillars can produce different displays.'] },
      { title: 'The site does not implement every named pattern', paragraphs: ['The site calculates the representative stars described in its encyclopedia and chart. Absence of another label, including Hongyeom or Void, does not establish absence of its traditional condition.', 'Void is a separate cycle-related concept, not a reason to erase an entire pillar. Do not silently add an unsupported calculation to the current result.'] },
      { title: 'Labels do not establish attraction, travel or danger', paragraphs: ['Attraction symbols do not measure romantic success or infidelity. Travel Horse does not guarantee overseas employment. White Tiger or Blade is not a diagnosis of accidents or violence.', 'A favorable name does not remove the need for ordinary checks. Read conditions first and assess real relationships, schedules and safety from relevant facts.'] },
    ], checklist: ['Identify the reference and target pillars.', 'Separate unsupported labels from absent conditions.', 'Do not establish behavior or accidents from names.'],
  }),
  guide('major-cycles', 'cycles', ['annual-monthly', 'useful-elements', 'birth-time'], ['/lifetime/', '/life-story/'], 'cycles', {
    title: '대운 보는 법: 대운수·순행·역행과 교운기 확인',
    description: '대운 시작 나이와 방향, 대운·세운의 차이, 현재 서비스의 시작 연도 표시와 시간 미상 결과의 한계를 실제 표로 설명합니다.',
    lead: '“대운이 바뀐다”는 말을 들으면 그날부터 인생이 달라지는지 궁금해집니다. 먼저 대운표의 간지와 시작 연도가 어떻게 정해졌는지 확인해 보세요.',
    topics: ['대운수와 시작 나이', '대운 순행 역행', '교운기·대운 교체', '대운과 세운 차이'],
    sections: [
      { title: '대운은 원국에 비교하는 장기 간지입니다', paragraphs: ['대운은 전통 명리에서 약 10년 단위로 비교하는 간지의 흐름입니다. “큰 행운”이라는 일상 표현과 달리 좋은 운만을 뜻하지 않습니다. 대운이 바뀐다고 출생 원국의 여덟 글자가 바뀌지는 않습니다.', '대운의 방향은 현재 라이브러리에서 연간 음양과 입력 성별 규칙을 사용하며, 시작은 출생 시점과 절입 간격을 반영합니다. 시각·성별·경계 기준이 다르면 방향이나 시작 표시가 달라질 수 있습니다.'] },
      { title: '시작 연도 표시는 정확한 교체 시각과 다릅니다', paragraphs: ['아래 표는 이 사이트가 실제 계산한 대운의 시작 연도·나이·간지입니다. 표시 나이는 시작 연도에서 출생 연도를 뺀 연도 차이이며, 생일과 정확한 교운 시각을 반영한 만 나이의 일 단위 확정값은 아닙니다.', '시간 미상은 내부 기준 시각을 사용하므로 대운 시작도 참고값입니다. 다른 서비스의 세는나이·만 나이·소수점 대운수를 비교할 때는 표시 방식부터 맞추세요.'] },
      { title: '교운기의 감정을 사건 예측으로 바꾸지 않습니다', paragraphs: ['관심사나 생활이 달라졌다고 대운이 바뀌었다는 사실을 역으로 증명할 수는 없습니다. 교운기 전조라는 설명을 퇴사·이별·질병의 확정 신호로 읽지 마세요.', '장기 흐름은 원국과 함께, 해당 연도의 설명은 세운과 함께 읽습니다. 실제 장기 계획은 일정·비용·준비 상태로 세우고, 좋거나 나쁘다는 문장 하나로 몇 년의 선택을 중단하지 않습니다.'] },
    ], checklist: ['대운과 큰 행운이라는 표현을 구별했나요?', '시작 나이가 연도 차이 표시임을 확인했나요?', '시간 미상·표시 나이·교체 시각의 차이를 기록했나요?'],
  }, {
    title: 'Major cycles: starting ages, direction and transition periods',
    description: 'Read calculated major-cycle years and pairs, distinguish year-based age labels from exact transition instants and account for unknown times.',
    lead: 'A new major cycle can sound like a guaranteed turning point. First inspect how its pair and starting year are calculated.',
    topics: ['Starting age and cycle number', 'Forward and reverse cycles', 'Transition periods', 'Major versus annual cycles'],
    sections: [
      { title: 'Major cycles add a long-term comparison pair', paragraphs: ['A major cycle is a traditional pair used for roughly ten-year comparisons. It does not mean only good fortune and does not replace the natal eight characters.', 'The library uses year-stem polarity and the input gender rule for direction, and the birth-to-term interval for the start. Different inputs or boundary conventions can change the display.'] },
      { title: 'A starting-year label is not an exact transition instant', paragraphs: ['The table is generated by the current engine. Displayed age is starting year minus birth year; it is not an exact birthday-aware age or a day-level transition time.', 'Unknown time uses an internal reference, so the start remains provisional. Match counting-age, birthday-age and fractional-age conventions when comparing services.'] },
      { title: 'Do not use feelings as proof of a predicted event', paragraphs: ['Changing interests does not independently establish a cycle transition. A transition narrative cannot confirm resignation, separation or illness.', 'Read long cycles alongside the natal chart and annual cycles. Build actual plans from schedules, costs and readiness rather than suspending years of choices over one favorable or unfavorable label.'] },
    ], checklist: ['Distinguish major cycles from guaranteed good luck.', 'Identify the year-difference age convention.', 'Record unknown-time and exact-transition limitations.'],
  }),
  guide('annual-monthly', 'cycles', ['fortune-scores', 'major-cycles', 'tojeong'], ['/year/', '/month/', '/week/', '/today/'], '', {
    title: '세운·월운·일진: 신년운세와 오늘 운세를 함께 읽는 법',
    description: '대운·세운·월운·일진의 비교 범위, 주간·월간·연간 화면의 집계 차이와 신년운세를 읽을 때 확인할 기준을 설명합니다.',
    lead: '올해 운세는 좋은데 이번 달은 낮게 나와도 두 결과가 모순인 것은 아닙니다. 어떤 기간과 간지를 어떤 방식으로 요약했는지 먼저 확인하세요.',
    topics: ['세운·월운·일진 뜻', '신년운세 읽기', '주간·월간·연간 차이', '기간별 운세 비교'],
    sections: [
      { title: '기간 이름과 계산의 기준 날짜를 구별합니다', paragraphs: ['세운은 연도, 월운은 달, 일진은 날의 간지를 원국과 비교하는 표현입니다. 원국은 출생 조건으로 고정하고 대상 시점의 간지를 바꾸어 읽습니다. 대운은 그보다 긴 주기의 별도 비교입니다.', '연간 페이지의 양력 월별 묶음과 절입 기준 월주가 같은 경계라고 가정하지 마세요. 표에 표시된 대상 연도·월·기준일을 먼저 확인해야 서로 다른 기간을 혼동하지 않습니다.'] },
      { title: '이 사이트의 기간별 점수는 단순 확대가 아닙니다', paragraphs: ['오늘 운세는 일진·월운·세운 관계를 함께 사용하고, 주간은 월요일부터 일요일까지 일별 원점수를 집계합니다. 월간은 대표 월운과 일진 평균·세운을 합치는 별도 요약입니다.', '연간 안의 월별 비교와 월간 계산기는 사용하는 조합이 달라 점수가 같지 않을 수 있습니다. 날짜별 최종 점수를 단순 평균해 다른 기간의 점수를 재현하려 하지 마세요. 자세한 비율과 실제 표는 점수 가이드에서 확인할 수 있습니다.'] },
      { title: '연도만 바꾼 복제 글보다 실제 기간을 확인합니다', paragraphs: ['신년운세는 제목의 연도만 볼 것이 아니라 실제 대상 간지와 월별 설명을 확인하세요. 지난 연도 자료는 당시의 기록이며 올해의 결과로 재해석하지 않습니다.', '특정 달 점수가 높더라도 취업·계약·결혼의 성공 확률을 뜻하지 않습니다. 한 해의 관심사를 정리하는 참고로 쓰고, 실제 중요한 일정은 당사자와 기관의 기한을 기준으로 준비합니다.'] },
    ], checklist: ['대상 연도·월·기준일을 확인했나요?', '월간과 연간의 월별 집계 차이를 구별했나요?', '높은 점수를 사건의 성공 확률로 읽지 않았나요?'],
  }, {
    title: 'Annual, monthly and daily cycles: reading different periods together',
    description: 'Distinguish cycle units, reference dates and daily, weekly, monthly and annual score aggregation.',
    lead: 'A favorable annual reading and a lower monthly reading need not contradict each other. They summarize different periods and combinations.',
    topics: ['Annual, monthly and daily pairs', 'New-year readings', 'Weekly and annual aggregation', 'Comparing periods'],
    sections: [
      { title: 'Separate period names from reference dates', paragraphs: ['Annual, monthly and daily cycles compare time-specific pairs with the fixed natal chart. Major cycles are a separate longer comparison.', 'A solar-calendar month panel does not necessarily share a boundary with a solar-term month pillar. Check the target year, month and reference date first.'] },
      { title: 'Period scores are not simple enlargements', paragraphs: ['Daily readings combine day, month and year relationships. Weekly readings aggregate daily raw values from Monday to Sunday. Monthly readings combine a representative month cycle, daily average and year cycle.', 'An annual report’s monthly panels use a different summary from the monthly calculator. Averaging final displayed daily scores need not reproduce another period’s score. The score guide provides worked examples.'] },
      { title: 'Verify the actual year and content', paragraphs: ['Check the year’s pair and explanations rather than the title alone. An archived year is a record for that year, not a current forecast.', 'A higher month score does not establish a probability of employment, a contract or marriage. Prepare important dates from the real participants and institutions involved.'] },
    ], checklist: ['Check target year, month and reference date.', 'Distinguish annual month panels from monthly calculations.', 'Do not read scores as success probabilities.'],
  }),
  { ...guide('zodiac-samjae', 'cycles', ['ipchun-boundary', 'major-cycles', 'special-stars'], ['/today/', '/tti/today/', '/tti/', '/tti/samjae/'], '', {
    title: '띠별 운세와 삼재: 개인 사주 운세와 무엇이 다른가요?',
    description: '띠별 공통 해설과 개인 원국의 차이, 들삼재·눌삼재·날삼재·복삼재의 해석 범위와 입춘 경계 확인법을 설명합니다.',
    lead: '같은 띠의 사람에게 같은 운세가 보이는데 개인 사주 점수는 다를 수 있습니다. 두 화면은 쓰는 출생 정보의 범위가 다릅니다.',
    topics: ['띠별 운세와 개인 사주', '들삼재·눌삼재·날삼재', '복삼재 뜻', '삼재와 대운 차이'],
    sections: [
      { title: '띠별 운세는 출생 연도 지지로 묶습니다', paragraphs: ['띠별 공통 해설은 같은 년지를 공유하는 집단의 전통 관계를 읽습니다. 개인 사주는 생년월일시의 더 많은 글자를 사용합니다. 입력이 많다고 실제 사건의 예측력이 입증된 것은 아닙니다.', '입춘 전후 출생은 일상적으로 부르는 띠와 원국의 년지가 다를 수 있습니다. 개인 사주와 띠별 운세를 비교하기 전에 어떤 기준의 띠인지 확인하세요.'] },
      { title: '삼재는 전통적인 연도 분류입니다', paragraphs: ['삼재는 띠의 묶음과 대상 연도를 연결해 세 해를 분류하는 관습이며, 그 순서를 들삼재·눌삼재·날삼재라고 부릅니다. 실제 사고·질병의 빈도를 측정해 정한 위험률이 아닙니다.', '복삼재처럼 삼재를 다르게 해석하는 표현도 있지만 삼재 여부만으로 길흉을 확정하지 않습니다. 개인의 대운은 별도 계산이며, 삼재가 아니라고 모든 위험이 사라지는 것도 아닙니다.'] },
      { title: '불안한 분류보다 확인할 일을 정합니다', paragraphs: ['삼재라는 이유로 필요한 진료·계약·일정을 무조건 미루거나, 이를 없애기 위한 지출이 필요하다고 단정하지 마세요. 사이트의 연도표는 전통 분류를 확인하는 자료입니다.', '띠별 문장이 궁금하면 해당 띠의 설명을 읽고, 개인 입력이 필요한 질문은 만세력과 개인 운세로 이동하세요. 어느 쪽도 현실의 안전·건강·금전 판단을 대신하지 않습니다.'] },
    ], checklist: ['띠별 공통 해설과 개인 원국의 범위를 구별했나요?', '삼재를 실제 위험 확률로 해석하지 않았나요?', '삼재와 개인 대운을 별도 계산으로 읽었나요?'],
  }, {
    title: 'Zodiac readings and Samjae versus personal saju',
    description: 'Understand shared zodiac readings, the three Samjae labels and their distinction from personal major cycles or measured risk.',
    lead: 'People sharing an animal can see the same zodiac text while receiving different personal chart results. The inputs have different scopes.',
    topics: ['Zodiac versus personal charts', 'The three Samjae years', 'Favorable Samjae interpretations', 'Samjae versus major cycles'],
    sections: [
      { title: 'Zodiac readings group people by year branch', paragraphs: ['Shared readings use the birth-year branch; personal saju uses more birth characters. More input does not establish validated event prediction.', 'Near Ipchun, everyday zodiac naming can differ from the natal year branch. Match the convention before comparing.'] },
      { title: 'Samjae is a traditional year classification', paragraphs: ['Samjae connects groups of zodiac branches with three target years, described as entering, middle and leaving. It is not a risk rate measured from accidents or illness.', 'Alternative favorable interpretations do not establish outcomes either. Personal major cycles use a separate calculation, and being outside Samjae cannot establish absence of real risk.'] },
      { title: 'Choose practical checks rather than alarming conclusions', paragraphs: ['The label does not justify delaying needed care or commitments, or establish that spending removes misfortune. The year table documents a traditional classification.', 'Read the relevant animal entry for a shared explanation and use personal tools for chart-specific questions. Neither replaces actual safety, health or financial assessment.'] },
    ], checklist: ['Distinguish shared zodiac text from a personal chart.', 'Do not treat Samjae as a measured risk.', 'Separate Samjae from personal major cycles.'],
  }), linkSection: 0 },
];

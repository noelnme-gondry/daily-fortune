// 서버에서만 생성하는 게임형 공개 예시. 일간 예시를 사용하는 브라우저 모듈과 분리한다.
import { buildChart, lifeStory, sajuRank } from '../engine/index.js';
import RANK from '../content/rank-table.js';
import { tr } from '../i18n/runtime.js';
import { esc } from './util.js';
import { EXAMPLE_INPUT, exampleStart as start, exampleEnd as end } from './public-examples.js';

export function playExample(mode, date) {
  const c = buildChart({ ...EXAMPLE_INPUT });
  if (mode === 'rank') {
    const r = sajuRank(c, RANK);
    return `${start(tr('사주 랭킹은 무엇을 비교하나요?', 'What does the saju ranking compare?'))}<h3>${tr('실제 계산 결과', 'Calculated result')}</h3><p>${tr('모델 점수', 'Model score')}: <b data-example-overall>${r.total}</b> · ${r.of.toLocaleString('en-US')}${tr('개 조합 중', ' combinations; rank')} ${r.rank.toLocaleString('en-US')}${tr('위', '')}</p><p>${tr('오행 분포·일간 강약·용신·길신·합충에 점수를 부여하고, 서비스가 정한 네 기둥 조합 집합의 분포와 비교한 결과입니다. 실제 인구를 조사한 순위나 살아온 삶의 성적표가 아닙니다. 출생 시각이 없으면 비교 집합도 세 기둥 조합으로 바뀝니다.', 'The score combines element balance, strength, useful elements, symbolic helpers, combinations and clashes, then compares it with the service’s four-pillar combination set. It is not a population survey or a grade for someone’s life. With no birth time, the comparison set changes to three-pillar combinations.')}</p>${end()}`;
  }
  const r = lifeStory(c, date);
  return `${start(tr('인생 캐릭터가 만들어지는 과정', 'How life characters are selected'))}<h3>${tr('실제 계산 결과', 'Calculated result')}</h3><div class="table-wrap"><table class="grid-table"><caption>${tr('같은 가상 입력의 아홉 이야기', 'Nine chapters for the fictional chart')}</caption><thead><tr><th scope="col">${tr('나이', 'Ages')}</th><th scope="col">${tr('캐릭터', 'Character')}</th><th scope="col">${tr('점수', 'Score')}</th></tr></thead><tbody>${r.stages.map(s => `<tr><th scope="row">${esc(s.ages)}</th><td>${esc(s.character.full)}</td><td>${s.score}</td></tr>`).join('')}</tbody></table></div><p>${tr('0~89세를 아홉 구간으로 나누고 겹치는 대운과 원국 관계에서 점수를 계산합니다. 십신과 분야별 상대 강점으로 직업군과 세부 캐릭터를 선택합니다. 나이는 이야기의 구간이며 실제 직업 이력이나 미래의 사건을 뜻하지 않습니다.', 'Ages 0–89 are divided into nine chapters, scored from overlapping cycles and natal relationships. Ten Gods and relative area strengths select a job family and character. These are story chapters, not a real career history or predictions of future events.')}</p>${end()}`;
}

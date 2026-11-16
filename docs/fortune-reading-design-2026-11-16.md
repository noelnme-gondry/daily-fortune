# 운세를 먼저 읽을 수 있는 화면

사용자가 첨부한 `Website_Design_Anti_AI_Slop_GitHub_Guide.md`를 기준으로 홈과 운세 결과를 수정했다. 기존 unslop 체크리스트 외에 가이드가 소개한 다섯 저장소의 실제 문서·구현을 확인했다. 계산 엔진과 골든값은 변경하지 않았다.

## 가이드와 구현의 연결

| 참고한 원문 | 적용한 내용 | Fortune에서의 판단 |
| --- | --- | --- |
| [Impeccable layout](https://github.com/pbakaus/impeccable/blob/d41d9860b0094dcb68030657da63461212835aaa/.agents/skills/impeccable/reference/layout.md), [typeset](https://github.com/pbakaus/impeccable/blob/d41d9860b0094dcb68030657da63461212835aaa/.agents/skills/impeccable/reference/typeset.md) | 입력 → 실제 예시 → 다른 서비스의 순서. 분야별 풀이의 중첩 카드를 걷고 제목·점수와 본문을 나눔. 본문 16px, 긴 풀이 70ch, FAQ 75ch, 제목의 균형 있는 줄바꿈. | 읽는 도구의 예측 가능한 순서와 충분한 정보량을 우선한다. 기존 고운 서체와 종이·갈색 계열을 유지한다. |
| [Taste Skill](https://github.com/Leonxlnx/taste-skill/blob/f6b76575f949707b4e3c37cd86cb44b0b98643e8/skills/taste-skill/SKILL.md) | 추상적인 소개 대신 동일한 가상 입력으로 실제 계산한 종합·일곱 분야의 운세를 첫 화면에 배치. 실제 캐릭터 결과와 이미지 사용. 320·390·768·820·1024·1440px에서 확인. | 가이드가 경고한 대로 모든 섹션을 화면 한 장 높이로 강제하지 않는다. 가상 사례 표시는 계산 결과를 사용자 자신의 운세로 오인하지 않도록 유지한다. |
| [Codrops OnScrollLayoutFormations](https://github.com/codrops/OnScrollLayoutFormations/blob/68910ecf85275bdd7e4d0e47013ba4bf9ec94bde/js/index.js) | 이미지의 크기와 배치로 시선을 나누는 구성을 참고. 인생 이야기의 0·40·80대 실제 캐릭터 세 장면을 작은 그림–큰 그림–작은 그림 순으로 배치하고, 랭킹은 별도 크기의 보조 영역으로 구성. | 긴 운세 본문에 GSAP pin·scrub·무작위 진입을 적용하지 않는다. 본문이 스크롤 효과 때문에 숨겨지거나 읽는 속도를 강제하지 않도록 정적 구성을 쓴다. |
| [React Bits AnimatedList](https://github.com/DavidHDev/react-bits/blob/cf2801031f07f53d4684e65b961bde7c2e2a6921/src/content/Components/AnimatedList/AnimatedList.jsx) | 현재 선택의 강조와 스크롤 영역 안에서 선택 항목을 드러내는 방식을 참고. 분야 목차를 고정하고, 작은 화면에서는 기본 가로 스크롤을 사용하며 선택한 분야를 목차 안에 표시. | React나 애니메이션 의존성을 추가하지 않고 기존 링크·포커스·주소 해시 계약에 맞춰 구현. 모든 본문을 계속 표시하고 키보드 기본 동작을 유지한다. |
| [Emil design engineering](https://github.com/emilkowalski/skills/blob/64eb3deb9a5fbfa041faf783e0bc3fd635872e9c/skills/emil-design-eng/SKILL.md), [mobile-native](https://github.com/emilkowalski/skills/blob/64eb3deb9a5fbfa041faf783e0bc3fd635872e9c/skills/mobile-native/SKILL.md) | 버튼·미리보기·분야 링크의 hover를 마우스 환경으로 제한. 클릭 시 짧은 누름 반응, 키보드와 동작 줄이기 설정에서는 입력 수정·날짜 상세를 즉시 이동. | 전체 본문 선택이나 확대를 막지 않는다. 브라우저 에뮬레이션과 실제 휴대전화 검증을 구분한다. |

참고 구현의 코드를 복사하거나 해당 저장소의 설치 스크립트·hook을 프로젝트에 설치하지 않았다. 기존 구조에 맞춰 필요한 원칙을 구현했다.

## 더 많이 보여주는 운세

- 홈은 1990-05-17 14:30, 남성, 양력이라는 기존 공개 가상 입력을 사용한다. 날짜와 분야별 점수·문장은 현재 계산 결과에서 가져온다. 개인 입력이나 저장소를 사용하지 않는다.
- 오늘·내일의 일곱 분야에서 흐름, 드러날 수 있는 모습, 치우칠 때의 주의점, 행동 제안, 해석 근거, 전날 비교를 본문에 표시한다. 근거와 흐름이 같은 문장인 경우 한 번만 보여준다.
- 종합 운세의 계산 설명을 본문에 둔다. 원국의 전문 계산 근거 창은 유지한다.
- 긴 결과의 목차는 읽는 동안 유지된다. 분야를 바꾸고 기간을 이동해도 선택한 분야와 출생 정보가 이어진다.

## 함께 고친 PR 문제

기기 저장을 해제하고 다시 계산한 결과에 원래 저장 인물의 참조가 사라져, 인물을 삭제한 후에도 현재 탭에 출생 정보가 남아 복원되는 문제가 있었다. 동일한 입력에만 저장 인물 참조를 유지하고, 삭제 시 실제 결과에 적용된 인물을 기준으로 결과를 비운다. 다른 인물을 편집 중인 경우와 저장본에서 출생일을 바꾼 독립 입력의 경우도 브라우저 회귀 테스트에 포함했다.

입력 접기와 요약 포커스가 도입되기 전의 경로를 사용하던 테스트는 실제 입력 수정 버튼과 현재 결과 영역을 사용하도록 갱신했다.

## 검증 기록

- `npm run test:all` 통과: 단위·사이트·결제·계산 214개, 일반 브라우저 241개, 프리미엄 브라우저 14개.
- `npm run lint`, `npm run build:release` 통과. 482개 페이지를 생성하고 이전 릴리스 자산 복원을 검증했다.
- Impeccable CLI 4.8.1의 `detect --json --scope type,layout`로 로컬 홈 390×844, 1440×900을 검사했고 수정 후 지적 0건이다. 프로젝트 의존성이나 설정은 변경하지 않았다.
- 390px 검사에서 찾은 11px 입력 안내문을 14px로 수정했다. 1440px 검사에서 찾은 긴 FAQ 본문은 75ch로 제한했다.
- 브라우저 검증은 실제 계산값과 표시값, KR/EN, 밝은·어두운 화면, 가로 넘침, 캐릭터 이미지 로딩, 키보드 이동, 고정 목차, 동작 줄이기, 삭제 후 복원을 다룬다.
- 실제 iOS/Android 기기에서 키보드·주소창·노치 동작은 미확인이다.

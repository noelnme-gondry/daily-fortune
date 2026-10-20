# Fortune 이용 흐름 개선

기준: 2026-10-20 SEO·제품 성장 점검, `80410d3`. 검토 HTML의 18개 항목을 구현 범위와 외부 관측으로 구분한다. 운영 배포·관리자 설정·외부 발행은 실제 확인과 별도로 기록한다.

## 화면 방향

- 색: 기존 종이 `#f8f9f5`, 바탕 `#eceee9`, 본문 `#1a1d21`, 쪽빛 `#2b3a8f`를 유지하고 실제 CSS 토큰을 재사용한다.
- 글꼴: 기존 IBM Plex Sans KR 본문과 Hahmlet 표제. 새 폰트 요청 없이 현재 자산을 사용한다.
- 정렬: 결과 문장을 왼쪽 정렬한다. 점수는 보조 정보로 두고 일상적인 해설 제목을 먼저 읽게 한다.
- 입력: 생일 → 성별 → 시간 → 선택 이름. 빈 생일은 결과를 만들지 않는다. 기기 저장은 선택이다.
- 결과: 요약 → 광고 A → 날짜 탐색·분야별 해설 → 원국 펼치기 → 관련 기능·공유. 광고 B는 결과 시작 위치를 유지한다.
- 기존 `ad_position_v1`과 수치를 섞지 않도록 `ad_position_v2`로 새로 배정한다. A/B 승자는 결정하지 않는다.

```text
검색 페이지 / 홈
  저장 정보 있음: 오늘 결과 바로 보기 · 입력 수정
  처음 방문: 생일 입력 · 시간 모름 · 선택 저장

결과 요약 (실제 날짜와 계산값)
광고 A (140px, 기존 광고 인스턴스 유지)
날짜 탐색 / 분야별 해설
사주 원국 펼치기
지금 보고 있는 내용에 맞는 다음 기능
선택 저장 / 공유
```

검토: 큰 수치 대시보드·카드 장식을 늘리지 않는다. 원국을 없애지 않고 만세력에서는 먼저 보여준다. 요약과 광고 사이에 클릭 버튼을 몰아넣지 않는다. 기존 JS·CSS 구성에 맞추며 React나 새로운 UI 라이브러리는 도입하지 않는다.

## 구현·검증 항목

1. 결과 순서, 입력 기본값, 홈 재진입, 날짜 상세, 맥락별 다음 기능.
2. 실패 후 이전 결과, KST 날짜 변경, 사주/토정비결 삭제 범위, 저장소 차단 복구.
3. 광고 배치 v2, 실제 결과 노출, 공유 시도/완료/취소/실패, 입력 출처·기능·날짜 측정.
4. 콘텐츠 수정일 단일 관리, 2026년부터의 연도 주소 보존, KR/EN·사이트맵·canonical.
5. 기존 콘텐츠 두 주제의 내부 진입 연결. 외부 게시 자료는 작성·배포 상태를 구분한다.
6. Google·네이버 상태와 AI 인용은 로컬 구현으로 완료 처리하지 않는다. 기존 수집 결과를 유지하고 필요한 운영 확인을 따로 기록한다.

성과 상승률·수익·D1/D7은 아직 추정하지 않는다. 수학 엔진·골든값·기존 제작물은 변경하지 않는다.

## 18개 항목 반영 상태

| 항목 | 반영 내용 | 확인 범위 / 남은 일 |
| --- | --- | --- |
| 1 결과 우선 | 요약 문장·실제 점수 우선, 원국은 기본 접힘. 만세력 원국은 유지 | KR/EN·모바일 실제 계산 경로 |
| 2 입력 구분 | 생일 우선, 사주·토정비결 모두 빈 생일. 시간 미입력과 시간 모름 구분 | 미입력·실제 날짜·시간 오류 필드 연결 |
| 3 재방문 | 홈에 저장한 생일 확인과 오늘 결과 바로 보기, 결과에서 입력 수정·저장 연결 | 세션·기기 복원을 별도 출처로 기록 |
| 4 날짜 상세 | 주·월 달력 버튼에서 해당 날짜의 실제 분야별 해설 | 키보드·선택 상태·닫기 후 포커스 복귀 |
| 5 다음 행동 | 도구 정의에서 파생한 맥락별 다음 기능, KR/EN 링크 | 기존 도구 ID 유지 |
| 6 실패 상태 | 잘못된 새 입력이면 이전 결과·공유 제거 | 정상 입력으로 복구, 광고 인스턴스 보존 |
| 7 날짜 갱신 | 재계산·화면 복귀 때 KST 기준 갱신, 날짜 상자·일별 공개 예시·결과·공유 갱신 | 열린 상세/대화상자는 유지. 고정 연도 URL은 대상 연도 유지 |
| 8 삭제 범위 | 사주 나·상대 삭제가 토정비결을 보존 | 양방향 저장·삭제 회귀 |
| 9 저장 제한 | 홈에서도 저장소가 막히면 현재 화면에 계산 결과 | 생일을 URL이나 분석 도구로 우회 전송하지 않음 |
| 10 광고 | v2 A=결과 요약 직후, B=결과 시작. 기존 배너 한 개 유지 | v1과 분리. 실제 운영 성과·수익·승자 미확인 |
| 11 공유 | 시도/복사 완료/네이티브 API 완료/취소/실패/외부 전달 구분 | 공유받은 페이지→계산 유입 표시. 실제 상대 전달·열람 보장 아님 |
| 12 측정 | GA4 맞춤 정의 12개 등록, 기존 3개와 변환 규칙 유지 | 로컬 이벤트 검증. 새 코드 운영 수신·D1/D7은 배포 후 확인 |
| 13 Google | canonical·hreflang·내부 링크·sitemap 계약 검증 | 운영 색인 완료는 미확인. 2027 토정비결 실시간 가져오기 성공과 구분 |
| 14 네이버 | 제외 대상 favicon.ico로 범위 유지, 로컬 아이콘 제공 회귀 확인 | 운영 응답·재수집·노출·클릭은 배포 후 재확인 |
| 15 수정일 | 콘텐츠 수정일 SSOT→페이지·JSON-LD·article·sitemap | 수정하지 않은 백과를 전체 갱신하지 않음 |
| 16 연도 보존 | 2026년부터 주소 보존·과거 안내·현재 연도 링크 | 새해 기존 54개 연도 URL, KR/EN·canonical·sitemap 검증 |
| 17 콘텐츠 연결 | 시간 미상 만세력 / 다음 해 월별 해설을 홈에서 직접 연결 | 기존 콘텐츠 재사용. 외부 게시하지 않음 |
| 18 AI 노출 | 공개 설명·표준 검색 링크·색인 구조 유지 | 별도 AI 파일 증설 없음. 인용·노출 성과는 미확인 |

## 측정 계약

Fortune GA4 속성 `558902906`에서 2026-10-20 실제 확인했다. 기존 수정 규칙은 `calc_result → fortune_view`, `fortune_type = [[tool]]`이다. 규칙과 기존 주요 이벤트를 변경하지 않았다. 따라서 GA 보고서의 계산 성공은 **fortune_view**, 로컬 전송 이름은 **calc_result**로 읽는다. 두 이벤트를 더해 중복 계산하지 않는다. 기존 `share` 주요 이벤트는 시도이므로 공유 완료로 해석하지 않는다.

추가한 이벤트 범위 맞춤 정의:

- `calc_origin`, `tool`, `experiment_id`, `experiment_variant`, `ad_placement`, `assignment_scope`
- `measurement_version`, `usage_date`, `reading_date`, `entry_point`, `entry_source`, `completion_type`

기존 `source`, `fortune_type`, `zodiac_content`는 유지했다. 새 정의는 과거 이벤트를 소급해서 채우지 않는다. 등록 근거는 Funnel 프로젝트의 `Product Growth Analysis/implementations/fortune-20261020/custom-definitions.txt`와 `.png`, 기존 변환 규칙은 `event-modification.txt`에 보존했다.

| 이벤트 | 의미 | 핵심 구분 |
| --- | --- | --- |
| calc_start | 첫 입력 변경 또는 제출 | tool=today, entry_point=home으로 홈 구분 |
| calc_submit | 직접 제출 | calc_start와 같은 사용자·세션에서 순서 확인 |
| calc_result → fortune_view | 계산 결과 생성 | form / session_restore / device_restore / legacy_restore / date_refresh |
| result_view | 결과 제목이 50% 이상 보임 | 같은 문서의 경로·reading_date당 한 번. 계산 생성과 별개 |
| ad_experiment_exposure | 계산 후 실험 배치 적용 | v2만 분석. 실제 배너 조회 아님 |
| ad_slot_view | 광고 영역이 50% 이상 보임 | 경로당 한 번. 광고 송출·클릭·구매가 아님 |
| share | 공유 시도 | 기존 이벤트 유지 |
| share_complete | 복사 또는 네이티브 API 성공 | completion_type으로 확인 범위 명시 |
| share_handoff | 외부 창·SDK 전달 또는 다운로드 시작 | 실제 공유 전달·파일 저장 완료 아님 |
| share_cancel / share_failed | 취소 / 실패 | 성공 분자에서 제외 |
| share_landing_view | 공유 결과 페이지 방문 | CTA 뒤 계산에 entry_source=shared_result. 세션 저장 제한 시 연계 불가 |

모든 이벤트의 `measurement_version=2`, `usage_date=KST YYYY-MM-DD`를 공통으로 넣는다. 이름·생일·입력 시간·개인 점수·등급·공유 쿼리는 이벤트에 추가하지 않는다. 공개 예시는 계산 성공 이벤트를 만들지 않는다. 로컬 검증은 외부 HTTPS를 차단했으므로 운영 광고·GA 실적에 합산하지 않았다.

### 배포 후 읽을 지표

1. 순서 퍼널: 같은 사용자·세션에서 `calc_start → calc_submit → fortune_view(calc_origin=form) → result_view`. 복원 경로는 별도 `fortune_view → result_view`로 본다. 전체 사용자 대비 이벤트 사용자 비중을 순서 전환율이라 부르지 않는다.
2. KST 이용일: `fortune_view` 또는 `result_view` 사용자와 `usage_date`를 사용해 사용자·날짜를 중복 제거한다. `reading_date`는 내일 운세/과거 선택과 달라질 수 있으므로 재이용 날짜로 쓰지 않는다. 저장 복원 횟수 자체는 재방문이 아니다.
3. D1: 최초 **관측된** 이용일 d의 사용자 중 정확히 d+1에 다시 이용한 비율. D7: 정확히 d+7. 7일 이내 재이용: d+1~d+7 중 한 번 이상. 관측 종료일이 각각 d+1/d+7을 지나 완전히 수집된 코호트만 분모에 포함한다. 관측 시작 전 이용 이력이 없다는 것은 증명할 수 없으므로 '서비스 생애 최초'로 표현하지 않는다.
4. 실험: `experiment_id=ad_position_v2`, `assignment_scope=browser` 중심으로 A/B를 비교한다. session/page 배정은 따로 본다. 결과 실제 노출·오류·공유·다른 날 재이용과 광고 슬롯 도달을 함께 읽는다. 양언어·국가·도구·기간을 일치시키고 v1과 합산하지 않는다. 동일 브라우저 단위 배정이며 실제 사람/기기 간 식별은 보장하지 않는다.
5. 광고 수익: 현재 이벤트만으로 추정 불가. 별도 수익 데이터와 연결되기 전에는 슬롯 도달 증가를 매출 증가로 표현하지 않는다. 승자를 정할 표본·효과 크기도 아직 미확인이다.

GA 탐색의 기간·필터와 내부 트래픽 제외 설정은 배포 후 실제 수신을 확인하며 확정한다. 사용자 단위·일별 원자료가 없는 현재 상태에서 D1/D7 수치를 만들지 않았다.

## 운영 확인 순서

1. 배포 후 대표 경로의 200 응답, 본문·canonical·hreflang·robots·사이트맵과 favicon MIME/파일 내용을 확인한다.
2. Google URL 검사에서 `/tojeong/2027/`의 배포 버전을 확인한 뒤 색인 여부를 관찰한다. 가져오기 성공을 색인 완료로 간주하지 않는다.
3. 네이버 제외 1건은 favicon.ico였다. 본문 페이지 제외로 확대하지 않고 아이콘 응답·재수집을 확인한다. 검색 성과는 데이터가 실제 표시될 때 확인한다.
4. GA DebugView/실시간에서 변환 후 fortune_view와 v2 파라미터를 확인한다. 실제 수신을 확인한 날짜부터 비교 기간을 설정한다.
5. 기존 외부 콘텐츠가 발행될 경우 시간 미상 글은 `/manseryeok/#public-example`, 연간 월별 글은 `/year/2027/#public-example`로 연결한다. 외부 링크에만 매체·소재별 UTM을 사용한다. 이번 작업에서 게시·메일 발송은 하지 않았다.

## 검증 기록

아래 Git·배포 상태는 2026-10-20 구현 검증을 끝낸 시점의 기록이다. 이후 병합 결과는 연결된 PR을 기준으로 확인한다.

- 수정 전 새 회귀 시나리오 5개 모두 실패를 재현했고, 수정 후 모두 통과했다.
- 최종 `npm run test:all`: 단위 123개 + 브라우저 112개 모두 통과. `npm run lint` 통과. `npm run build` 통과, 404개 페이지 생성.
- 빌드에는 500kB 초과 청크 경고가 남는다(계산 도구 청크 705.02kB, gzip 226.20kB). 실제 운영 Core Web Vitals·로딩 속도는 이번 로컬 검증으로 단정하지 않는다.
- 브랜치 `codex/fortune-growth-flow-20261020`, HEAD와 origin/main은 `80410d3` 동일(0 ahead / 0 behind). 변경은 미커밋 상태다.
- 시작 당시 AGENTS.md·START_HERE.txt·Creative/·docs/search-audit/·output/·videos/의 사용자 미추적 자료를 보존했다. 기존 검토 HTML은 덮어쓰지 않고 새 output/fortune-growth-implemented-20261020/에 작성했다.
- Chrome 설치 경로를 지정해 로컬 브라우저 검증. 운영 광고·검색 관리자 실적을 실제 테스트로 발생시키지 않았다.
- 기존 계산 엔진·골든값과 제작 자료는 수정하지 않았다. 커밋·push·PR·운영 배포는 수행하지 않았다.

## 주요 파일

- `src/client/tool.js`, `src/client/views.js`, `src/styles/main.css`: 입력·결과·재방문·달력 상세·접근성.
- `src/client/tojeong-client.js`, `src/site/pages/tojeong.js`, `src/client/profile.js`: 토정비결 빈 입력·오류 복구·삭제 범위.
- `src/client/period-context.js`, `src/site/period-boxes.js`: 날짜 상자 SSR/클라이언트 공통 생성과 날짜 변경.
- `src/site/tool-navigation.js`, `src/site/pages/tools.js`: 공통 도구 정의 파생·맥락별 다음 행동·홈 콘텐츠 연결.
- `src/client/analytics.js`, `src/client/share.js`, `src/client/partner-ad.js`, `src/client/ad-experiment.js`, `src/domain/ad-experiment.js`: 측정·공유·광고 v2.
- `src/site/content-revisions.js`, `src/site/render.js`, `src/site/pages/manse.js`, `src/site/tti-nav.js`: 수정일·연도 주소 보존.
- `tests/browser/growth-flow.spec.js`, `tests/growth-contracts.test.js` 및 관련 기존 시나리오: 회귀와 실제 UI 연결 검증.

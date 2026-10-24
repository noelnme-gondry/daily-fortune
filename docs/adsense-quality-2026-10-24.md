# Fortune AdSense 콘텐츠 품질 개선 기록

2026-10-24 KST의 구현·검증 기록이다. 아래 미배포 표기는 최초 검증 시점의 상태다. 이후 사용자가 커밋·PR·배포를 승인했으며, 해당 진행과 운영 접속 진단은 아래 후속 기록에서 구분한다. 승인 가능성이나 검색 성과 개선은 아직 측정할 수 없다.

## 확인한 상태와 판단

사용자 제공 화면은 Fortune의 승인 상태가 ‘주의 필요’, 사유가 ‘가치가 별로 없는 콘텐츠’, ads.txt는 ‘승인됨’이다. 따라서 ads.txt를 재작성하는 문제로 보지 않았다. Google이 문제 삼은 개별 URL·문장·필수 콘텐츠 수·재검토 가능일은 미확인이다.

[AdSense 페이지 품질 안내](https://support.google.com/adsense/answer/7299563?hl=ko)는 고유 가치와 쉬운 탐색을 설명한다. [게시자 정책](https://support.google.com/adsense/answer/9335564?hl=ko)은 게시자 콘텐츠가 없거나 저가치·미완성·탐색용인 화면의 광고와 부가 가치 없는 복제를 제한한다. 아래 수정은 확인된 서비스 품질 문제에 대응하며, 개별 거절 원인으로 확정한 것은 아니다.

운영 도메인은 내부 브라우저에서 새 탭을 포함한 2회 접속이 ERR_CONNECTION_REFUSED였다. 이 환경의 접속 실패만으로 전체 서비스 장애를 확정하지 않는다. 실제 운영 HTML·서버/WAF·Google 크롤러 접근은 미확인이다.

## 실제 변경

- 한국어·영어 이용 가이드 4편을 추가했다. 출생 시각 미상·점수·궁합·토정비결을 서로 다른 이용 질문으로 다루고, 고정 가상 입력을 실제 엔진에 넣은 표와 읽는 방법·범위·한계를 함께 제공한다.
- 주간·월간·캐릭터·랭킹 도구에 공개 계산 예시를 추가했다. 기존 오늘·내일·연간·평생·궁합·만세력 예시도 main 안에서 수동·공통 광고보다 먼저 읽도록 옮겼다.
- 홈페이지·전체 메뉴·푸터에서 가이드로 이동한다. 기존 404개 경로에 7개 신규 경로와 영어 대응을 추가해 418개를 렌더링한다. canonical·hreflang·사이트맵·RSS·llms 목록을 함께 연결했다. 새 가이드의 발행일은 2026-10-24로 표시한다.
- 소개·개인정보·문의·편집·가이드·탐색 화면과 noindex·오류 화면의 Google 광고와 파트너 광고를 공통 정책으로 제외했다. 기존 ads.txt 발급 정보는 보존했다. 자동 광고가 콘텐츠 페이지에서 실제로 어디에 삽입되는지는 운영 확인이 필요하다.
- Gondry Workshop 운영 표기와 사용자가 제공한 gondry.montauk@gmail.com 문의를 소개·개인정보·문의·푸터·구조화 데이터에 연결했다. 별도 비즈니스 사이트를 만들어야 승인된다는 근거는 확인되지 않아 Fortune 안의 운영 정보를 보강했다.
- 작성·출처·수정 정책에 날짜 계산·모델 점수·전통 해석을 구분하고, 가상 사례·토정비결 판본·AI 활용 범위를 설명했다. 일주 상세의 천생연분·날짜별 자신감 단정을 완화하고 오행 신체 대응을 전통 상징으로 표시했다.
- 수학 엔진·점수 규칙·골든값·개인정보 저장 계약은 변경하지 않았다. 개인 경험·자격·상담 실적·승인 효과를 만들어 넣지 않았다.

## 주요 파일

| 범위 | 파일 |
|---|---|
| 이용 가이드와 목록 | src/content/reading-guides.js, src/site/pages/guides.js |
| 운영·문의·출처 기준 | src/content/publisher.js, src/site/pages/info.js, src/content/pages.js, src/content/en/pages.js |
| 공개 예시·도구 연결 | src/site/public-examples.js, src/site/play-examples.js, src/site/pages/tools.js |
| 광고·탐색·검색 메타 | src/site/ad-policy.js, src/site/partner-ad.js, src/site/layout.js, src/site/render.js, src/site/content-revisions.js |
| 백과 표현·모바일 배치 | src/site/pages/saju.js, src/site/pages/tti.js, src/client/tti-navigation.js, src/styles/main.css |
| 새 검증 | tests/content-quality.test.js, tests/browser/content-quality.spec.js |

## 검증 결과와 회귀 수정

- npm run test:all 통과: 단위·사이트 137개 + 브라우저 134개 = 271개.
- npm run lint 통과.
- npm run build 통과: 418페이지와 sitemap·robots·RSS·llms 생성.
- git diff --check 통과.
- 모바일 320·390·768·1024·1440px 광고·본문 배치, 띠별 부분 이동, 계산·재계산·복원, 새 가이드 진입·영어 전환·JavaScript 없는 본문을 검사했다. 외부 광고·분석은 차단하거나 대역을 사용했다.
- origin/main의 별도 임시 복사본에서 예시 위치와 광고 제외 검사 2개가 실패했고 현재 코드에서는 통과한다.
- 첫 전체 브라우저 검사에서 3건이 실패했다. 메뉴 수·광고 제외에 맞지 않는 기존 기대값 2건을 수정했고, 공용 일간 예시 모듈에 랭킹 자료를 추가해 발생한 실제 선로딩 회귀 1건은 랭킹 예시를 서버 전용 모듈로 분리해 해결했다. 최종 전체 재실행은 모두 통과했다.
- 내부 브라우저에서 이용 가이드 목록의 실제 배치를 한 차례 확인했다. 로컬 미리보기는 http://127.0.0.1:4180/guides/ 이다.
- 빌드의 도구 번들 약 504KB 경고는 남는다. 실제 현장 성능·자동 광고 송출·Google 승인·검색 반영은 이번 로컬 검증으로 확인하지 않았다.

## 운영 반영과 남은 확인

현재 브랜치는 codex/adsense-content-quality다. 작업 시작과 마지막 확인에서 HEAD와 origin/main의 커밋 차이는 앞섬 0·뒤처짐 0이며, 변경은 미커밋이다. 브랜치 원격은 만들지 않았다. 커밋·push·PR·배포·AdSense 재심사는 실행하지 않았다.

배포 전 운영 도메인 접근을 확인하고, 승인된 배포 이후 대표 계산기·새 가이드·문의·영어 대응·오류 페이지의 실제 응답과 광고 제외를 점검해야 한다. 그 다음 관리자 상세 안내를 확인하고 사이트 전체 수정이 반영된 상태에서 재검토를 진행한다. 임의의 합격 기한이나 페이지 수를 보장하지 않는다.

기존 AGENTS.md, START_HERE.txt, Creative/, videos/, output/, docs/search-audit-2026-10-15/는 보존했다. .agents/와 .legacy-local/, 이전 원본 폴더는 수정하지 않았다. GrowthOptPlaybook 코드는 수정하지 않았다.

새 수집·분석 자료는 output/seo-aeo-geo/2026-10-24_214335_5dde4bfc/에 독립 보관했다. 스크린샷 임시 원본은 다시 열리지 않아 대화 화면을 전사했으며, 계정 전체의 GSC·GA4·네이버 성과는 이번 범위에 포함하지 않았다.

## 후속 운영 접속 진단

2026-10-24 22:31 KST 기준 이 실행환경의 기본 DNS(127.0.2.2)는 도메인의 A 레코드를 0.0.0.0으로 반환했다. 외부 DNS 두 곳(1.1.1.1·8.8.8.8)은 모두 69.46.46.0을 반환했다. /etc/hosts에는 이 도메인에 대한 항목이 없었다.

외부 DNS에서 확인한 주소로 같은 도메인·SNI·인증서 검증을 유지해 요청하니 홈페이지는 HTTP 200, /healthz는 ok였다. 응답 서버는 railway-hikari였고 기존 production 배포도 GitHub에서 success로 확인됐다. 따라서 앞서 내부 브라우저에서 본 접속 거부는 이 실행환경의 DNS 응답과 연결되며 운영 서버 전체 장애로 볼 근거는 없다. 기본 DNS가 차단 주소를 반환하는 세부 이유와 모든 사용자 환경의 접근성은 미확인이다. 시스템 DNS나 보안 설정은 변경하지 않았다.

사용자는 이 진단과 별도로 개선 코드의 커밋·PR·배포를 승인했다. AdSense 재심사 제출은 별도 작업으로 남는다.

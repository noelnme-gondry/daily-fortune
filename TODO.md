# 오행 운세 — 해야 할 작업

코드는 준비되어 있고, 아래는 **사람이 콘솔·대시보드에서 해야 하는 설정**과 출시 후 점검, 다음 개발 후보입니다.
환경 변수의 전체 목록과 설명은 [`.env.example`](.env.example), 기술 설명은 [`README.md`](README.md)를 참고하세요.

---

## 1. Railway 배포 (필수)

- [ ] Railway에서 이 저장소(`main` 브랜치)로 서비스 생성 — `railway.json`에 빌드·시작·헬스 체크가 들어 있어 추가 명령 설정은 필요 없음
- [ ] **Settings → Networking**에서 Railway 도메인 생성(또는 커스텀 도메인 연결 + DNS 설정)
- [ ] 배포 후 아래 주소가 열리는지 확인
  - [ ] `/healthz` → `ok`
  - [ ] `/` · `/today/` · `/life-story/` · `/saju-ranking/`
  - [ ] `/sitemap.xml` · `/robots.txt` · `/ads.txt` · `/llms.txt` · `/rss.xml`
- [ ] 커스텀 도메인이 **실제로 열린 뒤** `SITE_URL=https://도메인` 설정 → 재배포
  - 먼저 넣으면 railway.app 주소로 들어온 방문자가 아직 열리지 않는 도메인으로 이동합니다.
  - 넣지 않으면 Railway 기본 도메인이 canonical·사이트맵 주소로 쓰입니다.

## 2. Google Analytics 4 (필수)

- [ ] GA4 속성 생성 → 웹 데이터 스트림 추가 → 측정 ID(`G-…`) 확인
- [ ] Railway Variables에 `GA_MEASUREMENT_ID` 입력 → 재배포
- [ ] GA4 **실시간** 보고서에서 `page_view`, `calc_result` 들어오는지 확인
- [ ] **관리 → 맞춤 정의**에서 이벤트 범위 측정기준 등록
  - [ ] `tool`, `source`, `has_time`, `calendar`
  - [ ] `arc`, `tier`, `pct_bucket`, `score_band`
  - [ ] `method`, `content_type`, `item_id`, `tip`, `question`
- [ ] **관리 → 이벤트**에서 `calc_result`, `share`를 주요 이벤트(전환)로 표시
- [ ] (선택) 데이터 보관 기간 14개월로 변경
- 이벤트 전체 목록: README의 "GA4 이벤트" 표

## 3. Google AdSense (필수)

- [ ] 배포 도메인에서 `/ads.txt`가 `google.com, pub-3073450406371629, DIRECT, f08c47fec0942fa0`로 보이는지 확인
- [ ] 애드센스 **사이트** 메뉴에 새 도메인 추가·승인 상태 확인(사이트 내용이 바뀌었으니 재검토가 필요할 수 있음)
- [ ] 자동 광고 켜기(코드에는 이미 스크립트가 들어 있음)
- [ ] (선택) 디스플레이 광고 단위 2개 생성 → 슬롯 ID를 Variables에 입력 → 재배포
  - [ ] `ADSENSE_SLOT_INLINE` — 계산기 아래, 백과 본문 중간
  - [ ] `ADSENSE_SLOT_BOTTOM` — 페이지 하단
- [ ] **개인정보 보호 및 메시지**에서 유럽(EEA·영국·스위스) 동의 메시지(CMP) 켜기
- 광고를 잠시 끄려면 `ADSENSE_CLIENT=off`

## 4. 카카오톡 공유 (권장)

- [ ] [Kakao Developers](https://developers.kakao.com)에서 앱 생성 → **JavaScript 키** 확인
- [ ] 앱 설정 → 플랫폼 → **Web**에 사이트 도메인 등록(Railway 도메인과 커스텀 도메인 모두)
- [ ] Railway Variables에 `VITE_KAKAO_JS_KEY` 입력 → **재배포**(빌드 시점에 들어가는 값)
- [ ] 결과 화면에 카카오톡 버튼이 보이고 미리보기 이미지·제목이 나오는지 확인

## 5. 검색 등록 (SEO · AEO · GEO)

- [ ] **Google Search Console**: 도메인 속성 추가 → 소유 확인(DNS 또는 `GOOGLE_SITE_VERIFICATION`) → `sitemap.xml` 제출
  - [ ] URL 검사로 주요 페이지 색인 요청: `/`, `/today/`, `/year/{올해}/`, `/saju-ranking/`, `/life-story/`, `/saju/ilju/`, `/tti/{올해}/`
- [ ] **네이버 서치어드바이저**: 사이트 등록 → 소유 확인(기존 인증값이 기본값, 새 값이면 `NAVER_SITE_VERIFICATION`) → `sitemap.xml`·`rss.xml` 제출
- [ ] **Bing 웹마스터 도구**: Search Console에서 가져오기 → 사이트맵 확인(Copilot·ChatGPT 검색 노출에도 영향)
- [ ] **Daum 검색 등록**: 사이트 등록 신청
- [ ] 공유 미리보기 캐시 확인
  - [ ] [카카오 공유 디버거](https://developers.kakao.com/tool/debugger/sharing)에서 `/`, `/share/?…` 주소 확인
  - [ ] [Facebook 공유 디버거](https://developers.facebook.com/tools/debug/)

## 6. 출시 후 점검

- [ ] 모바일(아이폰 사파리·안드로이드 크롬)에서 입력 → 결과 → 공유 → 이미지 저장 흐름 확인
- [ ] PageSpeed Insights(Lighthouse)로 `/`, `/today/`, `/saju/ilju/gapja/` 점수 확인
- [ ] Search Console **페이지 색인** 보고서에서 제외·오류 페이지 확인(1~2주 뒤)
- [ ] GA4에서 유입 경로별 `calc_result`·`share` 전환율 확인(1~2주 뒤)

## 7. 운영 · 유지보수

- [ ] 해설·백과 문장을 고치면 `src/site/render.js`의 `CONTENT_UPDATED` 날짜 올리기(sitemap `lastmod`·`dateModified` 반영)
- [ ] 사주 랭킹 점수 규칙(`src/engine/rank.js`)을 바꾸면 `node scripts/gen-rank.mjs` 실행 후 함께 커밋(테스트가 불일치를 잡아냄)
- [ ] 분기마다 `npm audit`, 의존성 업데이트
- 날짜·연도 페이지(오늘·내일·띠별 오늘의 운세·올해/내년)는 서버가 한국 날짜 기준으로 자동 갱신 — 해가 바뀌어도 재배포 불필요(단, Railway 서버로 운영할 때)

---

## 8. 다음 개발 후보 (게이미피케이션)

우선순위는 제안이며, 고르시면 진행합니다.

| 우선 | 기능 | 내용 | 기대 효과 | 서버 저장 |
|:--:|------|------|-----------|:--:|
| 1 | 출석 도장·연속 방문 | 오늘의 운세를 볼 때마다 도장, 7일·30일 배지 | 재방문 | 불필요(기기 저장) |
| 2 | 60일주 도감 | 친구 사주·궁합을 볼 때마다 일주 카드 수집, 60칸 채우기 | 공유·바이럴 | 불필요 |
| 3 | 오늘의 행운 미션 | 용신 기반 행동 미션(예: 초록 소품 지니기) 체크 → 포인트 | 체류·재방문 | 불필요 |
| 4 | 캐릭터 레벨업 | 대운이 바뀔 때 인생 캐릭터 진화, 다음 진화 D-day | 재방문·공유 | 불필요 |
| 5 | 띠별 주간 리그 | 이번 주 12띠 순위표, 내 띠 응원 | 재방문·공유 | 불필요 |
| 6 | 친구 궁합 리더보드 | 초대 링크로 들어온 친구들 중 궁합 순위 | 바이럴 | **필요**(DB) |
| 7 | 운세 적중 투표 | "오늘 운세 맞았나요?" → 일주별 적중률 랭킹 | 참여·콘텐츠 생성 | **필요**(DB) |

## 9. 그 밖의 개선 후보

- [ ] 결과별 동적 OG 이미지(현재는 기능별 고정 이미지 + 동적 제목)
- [ ] 해설 문장 변형 확대(분야·요인별 표현 2배), 60일주 페이지 문단 보강
- [ ] 영어 페이지(해외 한국 사주 수요) 검토
- [ ] 음력 입력 범위(1900~2050년) 밖 날짜 안내 문구 개선

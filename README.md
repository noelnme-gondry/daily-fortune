# 오행 운세

> 배포·GA·애드센스·검색 등록 등 남은 설정은 [TODO.md](TODO.md)에 체크리스트로 정리되어 있습니다.

생년월일시와 성별로 사주 원국을 세우고 오늘·내일·이번 주·이번 달·올해(월별)·내년(월별)·평생 운세와 두 사람의 궁합을 계산하는 사주 오행 운세 사이트입니다. **같은 입력(생년월일시·성별·기준 날짜)이면 언제나 같은 결과**가 나오며, 난수를 쓰지 않습니다.

## 실행

```bash
npm install
npm run dev      # 개발 서버 (http://localhost:5173) — 페이지를 운영과 같은 렌더러로 즉석 생성
npm test         # 엔진·사이트 테스트 (node:test)
npm run test:all # 엔진 + 브라우저(Chromium) 사용자 흐름 검증
npm run lint     # 소스·테스트 정적 검사
npm run build    # vite build + 전 페이지 정적 생성(dist/)
npm start        # 운영 서버 (dist 자산 + 날짜별 즉석 렌더링)
```

브라우저 검증은 Playwright 번들 Chromium을 씁니다. 처음 한 번 `npx playwright install chromium`으로 설치하고, 이미 설치된 브라우저를 쓰려면 `PLAYWRIGHT_CHROMIUM_PATH=/경로/chrome npm run test:browser`처럼 실행 파일 경로를 넘깁니다.

GitHub Actions(`.github/workflows/ci.yml`)가 PR과 `main` 푸시마다 lint → 단위 테스트 → 빌드 → 브라우저 테스트를 실행합니다.

캐릭터 그림을 추가·교체하면 `node scripts/gen-thumbs.mjs`로 카드용 384px 썸네일(`public/characters/384/`)을 다시 만듭니다.

### 환경 변수

`.env.example`에 전체 목록과 설명이 있습니다. Railway에서는 서비스 → **Variables**에 같은 이름으로 넣습니다.

| 이름 | 용도 |
|------|------|
| `SITE_URL` | 정식 사이트 주소(canonical·sitemap·공유 카드). 지정하면 다른 호스트(예: `*.up.railway.app`)로 들어온 요청을 이 주소로 301 이동합니다. 비우면 `https://makeyourownday-fortune.com`을 씁니다 |
| `GA_MEASUREMENT_ID` | GA4 측정 ID(`G-…`). 비우면 GA를 넣지 않습니다 |
| `ADSENSE_CLIENT` | 애드센스 게시자 ID(기본 `ca-pub-3073450406371629`). `off`면 광고 스크립트와 `ads.txt`를 끕니다 |
| `ADSENSE_SLOT_INLINE` · `ADSENSE_SLOT_BOTTOM` | 수동 광고 단위 슬롯 ID. 비우면 자동 광고만 씁니다 |
| `VITE_KAKAO_JS_KEY` | 카카오톡 공유 키(**빌드 시점**에 필요). 없으면 카카오 버튼을 숨깁니다 |
| `NAVER_SITE_VERIFICATION` · `GOOGLE_SITE_VERIFICATION` | 검색엔진 소유 확인 메타 태그 |
| `PORT` | 서버 포트 (Railway가 자동 지정) |

## Railway 배포

1. Railway에서 이 GitHub 저장소로 서비스를 만듭니다. `railway.json`에 빌드(`npm run build`)·시작(`npm start`)·헬스 체크(`/healthz`)가 들어 있어 추가 설정이 필요 없습니다. Node 버전은 `.nvmrc`(22)와 `package.json`의 `engines`로 지정됩니다.
2. **Settings → Networking**에서 도메인을 만들거나 커스텀 도메인을 연결합니다.
3. **Variables**에 `SITE_URL`(커스텀 도메인이 실제로 연결된 뒤에), `GA_MEASUREMENT_ID`, `VITE_KAKAO_JS_KEY` 등을 넣고 재배포합니다. `VITE_`로 시작하는 값은 빌드에 들어가므로 바꾸면 재배포해야 합니다.
4. 서버는 gzip 압축, 해시 자산 1년 캐시, 페이지 5분 캐시, 한국 날짜 기준 하루 단위 렌더 캐시를 씁니다.

## 광고(애드센스)

- 모든 페이지 `<head>`에 애드센스 스크립트가 들어가 **자동 광고**가 바로 동작합니다. `ads.txt`는 `ADSENSE_CLIENT`에서 자동 생성됩니다.
- 수동 광고 단위를 쓰려면 애드센스에서 디스플레이 광고 단위를 2개 만들고 슬롯 ID를 `ADSENSE_SLOT_INLINE`(계산기 아래·백과 본문 중간), `ADSENSE_SLOT_BOTTOM`(페이지 하단)에 넣습니다. 자리는 레이아웃이 흔들리지 않도록 최소 높이를 잡아 둡니다.
- 공유 카드 페이지(`/share/`)에는 광고를 넣지 않습니다(주소에 이름이 들어가기 때문).
- 유럽 방문자에게 맞춤 광고를 내보내려면 애드센스 → 개인정보 보호 및 메시지에서 동의 메시지(CMP)를 켜세요(코드 수정 불필요).

## 공유

- **결과 공유**(모든 계산기): 카카오톡 · 공유 시트 · 링크 복사 · X · 페이스북 · **이미지 저장**(1080×1350 PNG, 모바일은 공유 시트로 바로 전송).
- 공유 링크는 `/share/?k=…` 카드 페이지로 연결되며 **생년월일시는 담지 않고** 결과 요약(점수·제목·이름)만 담습니다. 서버가 허용된 값(정해진 제목 목록, 점수 범위, 이름 10자)만 받아 카드와 Open Graph를 만들고, 검색 색인에서는 제외합니다.
- **페이지 공유**(모든 페이지 하단): 카카오톡 · 공유 시트 · 링크 복사 · X · 페이스북 · 밴드.

## GA4 이벤트

`page_location`에서 쿼리·`#`를 지우고(utm·gclid는 유지) 공유 카드의 페이지 제목도 일반 제목으로 바꿔 보내므로, 이름·생년월일은 GA로 가지 않습니다. GA4 → 관리 → 맞춤 정의에서 아래 매개변수를 이벤트 범위 측정기준으로 등록하면 보고서에서 볼 수 있습니다.

| 이벤트 | 매개변수 | 시점 |
|--------|----------|------|
| `calc_submit` | `tool` | 계산기 폼 제출 |
| `calc_result` | `tool`, `source`(form·saved·sample), `has_time`, `calendar` | 결과 표시 |
| `form_error` | `tool` | 날짜 오류 |
| `sample_click` | `tool` | 예시 인물로 보기 |
| `story_result` | `arc` | 인생 캐릭터 결과 |
| `rank_result` | `tier`, `pct_bucket` | 사주 랭킹 결과 |
| `compat_result` | `score_band` | 궁합 결과 |
| `share` | `method`(kakao·native·copy·x·facebook·band·image), `content_type`, `item_id` | 공유 버튼 클릭 (GA4 권장 이벤트) |
| `share_image` | `content_type` | 결과 이미지 저장 완료 |
| `tooltip_open` | `tip` | 정보 아이콘 설명 열기 |
| `faq_open` | `question` | FAQ 펼치기 |
| `select_content` | `content_type`(card·fun_card·cta·result_tab·share_landing), `item_id` | 카드·CTA·결과 탭·공유 카드 CTA 클릭 |

`calc_result`·`share`를 GA4에서 **주요 이벤트(전환)**로 표시해 두면 유입 채널별 계산·공유 전환율을 볼 수 있습니다.

## 구조

```
src/engine/     사주 계산 엔진 (순수 함수, Node·브라우저 공용)
  core.js         간지·오행·십신·12운성·합충형 테이블, 조사(josa) 처리, 날짜 도우미
  calendar.js     일진·월건·세차, 24절기, 한국 음력(KASI), 서머타임
  chart.js        원국 세우기, 신강·신약, 용신, 신살, 대운
  fortune.js      기간 운세 점수(오늘·주간·월간·연간·월별)와 해설 생성
  lifetime.js     평생 운세, 결혼·자녀·재물·이사 시기
  compat.js       궁합 점수, 조심할 점, 결혼·자녀 시기, 결혼 길일
  tti.js          띠별 운세(연·일), 삼재, 띠 궁합
src/content/    사람이 읽는 문장 데이터 (운세 해설, 백과, 페이지 문구·FAQ)
src/site/       페이지 생성기 (layout·JSON-LD·sitemap·robots·rss·llms.txt)
src/client/     계산기 페이지의 브라우저 코드 (엔진은 계산기 페이지에서만 지연 로딩)
src/styles/     전체 스타일
scripts/build-site.mjs  정적 HTML 생성
server.js       Railway 운영 서버
tests/          node:test 테스트
```

## 페이지 구조 (SEO · AEO · GEO)

| 경로 | 내용 |
|------|------|
| `/` | 홈: 입력 폼, 오늘의 일진, 띠별 오늘의 운세, 운세 종류 |
| `/today/` `/tomorrow/` `/week/` `/month/` | 기간 운세 계산기 + 날짜 정보 + 계산 방법 + FAQ |
| `/year/{올해}/` `/year/{내년}/` | 연간 총운 + 1~12월 월별 운세 |
| `/lifetime/` `/compatibility/` `/manseryeok/` | 평생 운세, 사주 궁합, 만세력(원국 계산기) |
| `/life-story/` | 0~89세의 10년 단위 캐릭터 9개, 카툰 일러스트 상세창, 게임 능력치·연도별 흐름 |
| `/saju-ranking/` `/saju/ilju-ranking/` | 518,400가지 사주 중 내 순위와 근거, 60일주 평균 점수 랭킹 |
| `/share/` | 공유 카드 착지 페이지 (noindex) |
| `/manseryeok/{연}/` `/manseryeok/{연}/{월}/` | 24절기 시각, 날짜별 일진·음력 표 |
| `/tti/` `/tti/today/` `/tti/{연}/` `/tti/{연}/{띠}/` | 기본은 오늘의 운세, 선택한 출생 연도의 연간 해석·12개월 흐름 |
| `/tti/today/{띠}/` `/tti/tomorrow/{띠}/` | 해당 날짜의 띠 상세 해석 (목록에서는 확대창으로 표시) |
| `/tti/samjae/` `/tti/compatibility/` | 삼재 계산표, 12띠 궁합표 |
| `/saju/…` | 사주 백과: 60일주, 일간 10, 십신 10, 오행 5, 신살 10, 12운성, 용어 사전, 사주 보는 법 |
| `/about/` `/privacy/` | 계산 방법 공개, 개인정보처리방침 |

- **SEO**: 페이지마다 고유한 `title`·`description`·`canonical`, Open Graph·Twitter 카드, 이동 경로, 내부 링크(푸터 메뉴·관련 페이지), `sitemap.xml`, 의미 있는 h1~h2 구조. 검색 수집용 파일은 화면 메뉴에 노출하지 않습니다. 404는 실제 404 상태 코드로 응답합니다.
- **AEO(답변 엔진)**: 각 페이지 첫 문단을 질문에 바로 답하는 정의형 문장으로 쓰고, 핵심 정리 표와 질문형 FAQ(`FAQPage` 구조화 데이터)를 둡니다.
- **GEO(생성형 엔진)**: `llms.txt`·`llms-full.txt`로 사이트 요약과 핵심 사실을 제공하고, `robots.txt`에서 GPTBot·ClaudeBot·PerplexityBot·Google-Extended·Yeti(네이버) 등을 명시적으로 허용합니다. 계산 규칙을 `/about/`에 공개해 인용 가능한 근거를 둡니다.
- **구조화 데이터(JSON-LD @graph)**: Organization, WebSite, WebPage, BreadcrumbList, WebApplication(계산기), Article(백과·띠), FAQPage, DefinedTermSet(용어 사전), HowTo(사주 보는 법), ItemList, Dataset(만세력).
- **네이버**: `naver-site-verification` 메타 유지, `rss.xml`(사주 백과 피드) 제공.

### 날짜와 연도

운영 서버는 한국 날짜가 바뀌면 렌더러를 새로 만들어 오늘·내일·띠별 오늘의 운세와 올해/내년 연도 페이지를 자동으로 갱신합니다(재배포 불필요). 정적 호스팅에 `dist/`만 올릴 경우에는 날짜가 바뀌는 페이지를 위해 매일 다시 빌드해야 합니다.

### 검색 등록 체크리스트

1. `SITE_URL`을 실제 도메인으로 설정하고 재배포
2. Google Search Console·네이버 서치어드바이저·Bing 웹마스터 도구에 `https://도메인/sitemap.xml` 제출
3. 네이버 서치어드바이저에 `https://도메인/rss.xml` 제출
4. 해설·백과 문장을 고치면 `src/site/render.js`의 `CONTENT_UPDATED` 날짜를 올려 `lastmod`·`dateModified`에 반영

## 계산 원리 요약

- 년주는 입춘, 월주는 절기 절입 시각(한국 표준시로 환산)으로 바뀝니다. 일주는 60일 주기입니다. 새 입력은 자·축·인·묘 등 시진을 선택하며, 대표 시각을 사용하고 밤 자시는 다음 날 일주로 계산합니다. 기존 정확한 시각 입력은 동경 127.5° 평균태양시(표준시 −30분) 보정 후 밤 11시 30분부터 다음 날 자시로 계산합니다.
- 기존 정확한 시각 입력에는 1948~51·1955~60·1987~88년 서머타임과 1954~61년 UTC+8:30 표준시를 보정합니다. 음력 입력은 한국천문연구원 기준으로 변환합니다.
- 기간 간지의 십신·용신 여부·12운성, 원국 지지와의 합·충·형·원진·해·파, 천간합·충, 신살을 분야별 가중치로 더하고, `round(60 + 40 × tanh((원점수 − 기준값) / 폭))`으로 환산하고 8~99점으로 제한합니다. 기간별 평균과 상쇄로 중앙에 모일 수 있으며 성공 확률을 의미하지 않습니다.
- 자세한 규칙은 사이트의 `/about/` 페이지에 있습니다.

### 사주 랭킹

- 점수 = 오행 균형(엔트로피, 25) + 일간 강약 중화(20) + 용신·희신 비중(15) + 길신(천을귀인·문창·식신·정관·정재·정인, 15) + 합(육합·천간합·삼합, 15) + 충·형·원진 감점(최대 −18) + 특수 신살(괴강 +3, 양인·백호 −1) + 기본 12.
- `scripts/gen-rank.mjs`가 가능한 모든 원국(4기둥 518,400가지, 3기둥 43,200가지)을 계산해 `src/content/rank-table.js`(분포표·항목 평균·60일주 평균)를 만듭니다. 규칙을 바꾸면 다시 실행하세요. 테스트가 3기둥 표를 전수 재계산해 규칙과 표가 어긋나면 실패합니다.
- 순위 = 내 점수보다 높은 사주 수 + 1. 근거는 항목별 점수를 전체 평균과 비교해 보여 줍니다.

### 사주로 본 내 인생

- 0~29세는 년주·월주, 30~59세는 일주, 60세 이후는 시주를 뿌리로 보고, 그 시기를 지나는 대운(대운 시작 전은 월주)을 겹치는 햇수만큼 반영합니다(대운 70%·원국 30%).
- 시기에서 가장 강한 십신 → 직업 계열, 분야 점수와 앞선 챕터의 직업 → 세부 직업. `src/content/character-jobs.js`의 모험 직업 50종·몰락형 10종을 사용하며 직업별 실제 일러스트·고유 스킬·퀘스트가 있다. 같은 계열의 새 직업을 우선하고 동점만 결정론적 키로 푼다.
- 시기 점수 → 수식어(45점 미만이면 계열별 몰락형), 신살 → 보조 스킬, 분야별 점수에 게임 전용 직업 보정 → 능력치(1~99), 아홉 구간을 세 시기로 묶은 평균 → 인생 곡선 유형(7종). 운세 원점수·랭킹 산식은 변경하지 않는다.
- 캐릭터 도감에서 전체 직업의 그림·스킬·보정값을 살펴볼 수 있다. 공유 코드는 `v2.<수식어 번호>.<직업 ID>`로 저장하고 기존 십신 코드·3시기 공유 주소도 계속 읽는다. 이미지 생성 도구·프롬프트·원본 경로는 `docs/character-art.json`에 기록한다.

- 실제 화면은 0~9세부터 80~89세까지 3×3 카드로 표시합니다. 직업·몰락형별 카툰 이미지 60종과 접두사별 배지를 조합합니다. 생성 프롬프트는 `docs/character-art.json`에 있습니다.
- 게임 능력치 = `50 + (분야 점수 − 60) × 2.2 + 직업 보정`을 반올림해 1~99로 제한합니다. 일반 운세·랭킹 산식에는 적용하지 않습니다.

### 기기 저장 및 순위 데이터

- `이 기기에 저장`을 선택할 때만 IndexedDB에 나·상대 입력을 보관합니다. 미선택 입력은 같은 탭의 sessionStorage에만 남습니다. 이전 버전이 자동 저장한 localStorage 입력은 현재 탭으로만 옮기고 바로 지웁니다(저장은 다시 선택해야 함). 삭제 버튼은 두 사람의 저장본을 함께 지웁니다.
- `npm run generate:leaders`는 기존 랭킹 산식으로 종합·5개 분야의 상위 후보를 구하고, 1930년 이후 양력 날짜·시진을 역산해 실제 입력 경로로 원국이 재현되는 대표 조합 5개씩을 저장합니다. 같은 점수의 순위는 동일하며, 실제 사람의 순위가 아닙니다. 날짜를 확인하지 못한 조합은 목록에서 제외하되 순위는 기존 이론 분포표 기준을 유지합니다.
- 개인 랭킹의 개운 가이드는 평균 대비 낮은 항목의 근거와 용신·희신·기신을 사용합니다. 색·방향은 공통 오행 데이터에서 가져오며, 소품이나 행동으로 원래 점수를 바꾸지 않습니다.
- UI·캐릭터 배지는 Lucide SVG, X·Facebook·KakaoTalk은 Simple Icons의 로고를 사용합니다. 출처와 라이선스는 `docs/icon-licenses.md`에 기록합니다.

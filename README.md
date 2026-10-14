# 오행 운세

생년월일시와 성별로 사주 원국을 세우고 오늘·내일·이번 주·이번 달·올해(월별)·내년(월별)·평생 운세와 두 사람의 궁합을 계산하는 사주 오행 운세 사이트입니다. **같은 입력(생년월일시·성별·기준 날짜)이면 언제나 같은 결과**가 나오며, 난수를 쓰지 않습니다.

## 실행

```bash
npm install
npm run dev      # 개발 서버 (http://localhost:5173) — 페이지를 운영과 같은 렌더러로 즉석 생성
npm test         # 엔진·사이트 테스트 (node:test)
npm run build    # vite build + 전 페이지 정적 생성(dist/)
npm start        # 운영 서버 (dist 자산 + 날짜별 즉석 렌더링)
```

### 환경 변수

| 이름 | 용도 |
|------|------|
| `SITE_URL` | canonical·sitemap·Open Graph에 쓰는 사이트 주소 (예: `https://example.com`). 없으면 Railway의 `RAILWAY_PUBLIC_DOMAIN`, 그것도 없으면 localhost |
| `VITE_KAKAO_JS_KEY` | 카카오톡 공유 버튼용 JavaScript 키 (빌드 시점에 필요, 없으면 버튼을 숨김) |
| `PORT` | 운영 서버 포트 (기본 3000) |

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
| `/manseryeok/{연}/` `/manseryeok/{연}/{월}/` | 24절기 시각, 날짜별 일진·음력 표 |
| `/tti/` `/tti/today/` `/tti/{연}/` `/tti/{연}/{띠}/` | 띠별 운세 (출생 연도별 운세 포함) |
| `/tti/samjae/` `/tti/compatibility/` | 삼재 계산표, 12띠 궁합표 |
| `/saju/…` | 사주 백과: 60일주, 일간 10, 십신 10, 오행 5, 신살 10, 12운성, 용어 사전, 사주 보는 법 |
| `/about/` `/privacy/` | 계산 방법 공개, 개인정보처리방침 |

- **SEO**: 페이지마다 고유한 `title`·`description`·`canonical`, Open Graph·Twitter 카드, 이동 경로, 내부 링크(푸터 사이트맵·관련 페이지), `sitemap.xml`, 의미 있는 h1~h2 구조. 404는 실제 404 상태 코드로 응답합니다.
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

- 년주는 입춘, 월주는 절기 절입 시각(한국 표준시로 환산)으로 바뀝니다. 일주는 60일 주기, 시주는 동경 127.5° 평균태양시(표준시 −30분)이며 밤 11시 30분 이후는 다음 날 자시입니다.
- 1948~51·1955~60·1987~88년 서머타임과 1954~61년 UTC+8:30 표준시를 보정합니다. 음력 입력은 한국천문연구원 기준으로 변환합니다.
- 기간 간지의 십신·용신 여부·12운성, 원국 지지와의 합·충·형·원진·해·파, 천간합·충, 신살을 분야별 가중치로 더하고, 무작위 원국 표본 분포로 보정해 평균 60점의 0~100점으로 환산합니다.
- 자세한 규칙은 사이트의 `/about/` 페이지에 있습니다.

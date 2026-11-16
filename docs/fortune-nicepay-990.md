# 운세 상품과 나이스페이 결제

토정비결·평생 사주·궁합을 각각 990원(KRW) 단건 구매로 제공한다. 구독·빌링·자동 갱신을 구현하지 않는다. 미리보기 → 주문 확인 → 나이스페이 카드 결제 → 상세 풀이·운세 다운로드로 이어진다.

## 진입점

- 홈의 상품 3개, `/shop/`, `/shop/tojeong/`, `/shop/lifetime/`, `/shop/compatibility/`
- 주문 내역 `/shop/orders/`, 구매 결과 `/shop/result/?orderId=...`
- 상품과 운세 파일은 한국어다. 영어판에는 한국어 상품 화면으로 이동하는 안내를 제공한다.
- `FORTUNE_PAID_READINGS=1`이면 기존 `/tojeong/`, `/lifetime/`, `/compatibility/`와 내년 토정비결 진입점도 구매 화면을 사용한다. 기본값은 기존 진입점 보존이다. 실결제 키와 지속 저장소를 설정하고 검증한 뒤 전환한다. 과거 연도 아카이브는 보존한다.

## 필요한 운영 설정

| 변수 | 값·용도 |
| --- | --- |
| `SITE_URL` | 결제창에서 돌아올 정식 HTTPS origin. 샌드박스 로컬 검증만 localhost HTTP 허용 |
| `NICEPAY_CLIENT_ID` | REST JS SDK의 **Server 승인 모델** 클라이언트 키 |
| `NICEPAY_SECRET_KEY` | 같은 상점의 **Basic 인증** 시크릿 키. 서버 전용 |
| `NICEPAY_MODE` | `sandbox` 또는 `live`. 기본 sandbox |
| `NICEPAY_APPROVAL_MODEL` | `server`. Client 승인 모델은 지원하지 않음 |
| `NICEPAY_METHODS` | `card`. 현재 카드 결제창만 제공 |
| `PAYMENTS_PROVIDER` | `nicepay` |
| `PAYMENTS_LIVE_ENABLED` | 운영 실결제에서만 `true` 또는 `1`로 명시. 기본값은 비활성 |
| `DATABASE_URL` | Fortune 앱 서비스에서 `${{Postgres.DATABASE_URL}}` 참조로 연결 |
| `FORTUNE_ORDERS_DIR` | 기존 파일 저장 호환용. `DATABASE_URL`이 있으면 사용하지 않음 |
| `FORTUNE_PAID_READINGS` | 검증 후 기존 세 진입점을 구매 화면으로 바꿀 때 `1` |

필수 설정이 없으면 서버는 주문·결제를 503으로 차단하고 화면은 미리보기만 제공한다. 가짜 결제 성공이나 브라우저 저장 값으로 권한을 열지 않는다. v3 MID/MerchantKey 기반 API나 Client 승인 모델과는 키·인터페이스가 다르다. 샌드박스와 운영 상점의 키를 혼용하지 않는다. 시크릿 키를 프런트엔드 환경 변수나 소스에 넣지 않는다.

개발 서버는 `node --env-file=.env node_modules/vite/bin/vite.js --host 127.0.0.1`로 환경 파일을 명시할 수 있다. 운영 변수는 Railway에 설정한다. `DATABASE_URL`이 있으면 Postgres를 사용하며, 잘못된 URL이나 DB 장애가 있어도 파일 저장으로 우회하지 않는다. 주문 생성·승인·조회에는 DB 세션 잠금을 사용하고, 승인 직전 거래번호를 즉시 커밋해 프로세스 재시작에도 보존한다. 운세 파일은 구매 시점 원문을 DB에 저장한다.

첫 주문 저장소 확인 때 `fortune_commerce.orders` 전용 스키마·테이블과 인덱스를 멱등적으로 만든다. 같은 DB 안의 Library 기존 테이블을 변경하지 않는다. DB 연결 계정에는 해당 스키마를 만들 수 있는 권한이 필요하다. 출생 정보가 포함되므로 DB 접속·백업 권한을 제한한다. DB를 사용하는 Fortune 앱에는 별도 파일 볼륨이 필요하지 않다.

이전 파일 저장 방식은 `DATABASE_URL`을 설정하지 않고 `FORTUNE_ORDERS_DIR`을 지정했을 때만 유지된다. 기존 파일을 삭제하거나 자동 이관하지 않는다. 파일 주문이 실제로 있는 배포를 전환한다면 먼저 원본 백업·DB 이관 검증이 필요하다. DB에서 발생한 새 주문은 URL을 제거한다고 파일 저장소로 복사되지 않으므로, 되돌릴 때도 DB와 주문 데이터를 보존한다.

## 승인과 다운로드

### Railway 적용 순서

1. Fortune와 같은 Railway 프로젝트에 Postgres 서비스를 준비한다. Fortune 앱 서비스 Variables에 `DATABASE_URL=${{Postgres.DATABASE_URL}}`을 연결한다. DB 서비스 이름이 다르면 실제 이름으로 참조한다. 다른 프로젝트의 MKT_Library 연결 그림만으로 Fortune 연결이 완료되지는 않는다.
2. `SITE_URL=https://makeyourownday-fortune.com`, 같은 샌드박스 상점의 `NICEPAY_CLIENT_ID`와 `NICEPAY_SECRET_KEY`, `NICEPAY_MODE=sandbox`, `NICEPAY_APPROVAL_MODEL=server`, `NICEPAY_METHODS=card`, `PAYMENTS_PROVIDER=nicepay`, `PAYMENTS_LIVE_ENABLED=false`, `FORTUNE_PAID_READINGS=0`을 설정하고 배포한다. 기존 `NICEPAY_CLIENT_KEY`는 `NICEPAY_CLIENT_ID`로 맞춘다.
3. `/healthz` 응답과 `/api/commerce/config`의 `enabled: true`, `mode: sandbox`를 확인한다. `/shop/`에서 PC·모바일 테스트 결제, 취소, 주문 재조회와 다운로드를 검증한다.
4. 실제 판매를 열 때 운영 상점 키로 교체하고 `NICEPAY_MODE=live`, `PAYMENTS_LIVE_ENABLED=true`, `FORTUNE_PAID_READINGS=1`을 설정한 뒤 다시 배포한다. 후자는 기존 세 운세 진입점도 구매 화면으로 전환하는 설정이다.
5. 저장소의 Railway 빌드는 `npm run build:release`, 실행은 `npm start`다. GitHub 자동 배포가 연결되어 있으면 main 변경으로 배포가 시작되지만 환경변수와 볼륨은 코드 머지만으로 설정되지 않는다. 현재 계정에서 자동 배포·변수·볼륨이 설정되어 있는지는 별도 확인이 필요하다.

### 주문 처리

1. 서버가 상품·동의·출생 입력을 검증하고 고정 가격 990원으로 주문과 결과 스냅샷을 저장한다. 동일 브라우저·동일 상품·동일 대상의 중복 주문은 재사용한다.
2. 브라우저는 `https://pay.nicepay.co.kr/v1/js/`의 `AUTHNICE.requestPay`를 호출한다. 서버가 돌려준 주문번호·금액·상품명·returnUrl만 사용한다.
3. 나이스페이의 외부 POST 콜백은 별도 state와 SHA-256 인증 서명, 금액·상점·주문번호를 검증한다. PG 거래 조회의 주문번호도 대조한 후 승인 API를 호출한다.
4. 승인 응답의 서명·거래번호·주문번호·KRW·990원·paid·잔액을 확인하고 구매 완료를 기록한다. 동시·중복 콜백은 한 번만 승인한다.
5. 승인 응답이 유실되면 먼저 같은 거래를 재조회한다. 승인이 확인되면 복구하고, 여전히 불확실하면 망취소를 시도한다. 망취소도 실패하면 REVIEW 상태를 보존한다. 이미 저장한 거래번호는 재시작 후 PG 조회로 복구할 수 있다. REVIEW가 남으면 운영자가 상점 거래 내역과 주문번호를 대조한다.
6. 주문 조회와 파일 제공 시 소유권 및 PG의 현재 결제 상태를 확인한다. 취소·부분취소는 차단한다. 나이스페이 상태 조회에 실패해도 파일을 열지 않는다.

콜백은 외부 POST에 SameSite=Lax 쿠키가 없음을 고려해 구매자 쿠키를 생성·교체하지 않는다. 승인 후 GET으로 돌아오면 기존 HttpOnly 구매자 쿠키로 소유권을 확인한다. 쿠키는 최대 1년이며, 삭제하거나 기기를 바꾸면 로그인 없는 보관함을 복원할 수 없다. 주문번호만으로는 타인의 운세를 받지 못한다. 운영 중 구매 복원·환불·개인정보 삭제 요청은 운영자가 처리한다.

운세 파일은 CSS를 포함한 HTML이며 인터넷 없이 읽고 브라우저 인쇄로 PDF 저장할 수 있다. 토정비결 열두 달을 모두 담는다. 구매 시점의 기준일과 계산 결과를 고정해 다시 다운로드해도 풀이가 바뀌지 않는다. 기존 계산 엔진·골든값은 수정하지 않았다.

## 검증과 출시 전 남은 작업

- 2026-11-16 Postgres 변경 최종 검증: 단위·사이트 208건, lint, 482페이지 릴리스 빌드 및 과거 해시 자산 복원 통과. 계산 엔진과 골든값은 변경하지 않았다.
- `tests/postgres-orders.test.js`: 내장 PostgreSQL 엔진(PGlite)에서 스키마 초기화·기존 테이블 보존·JSONB 파일 보존·소유권·불변 필드·거래번호 고유 제약·커밋·잠금 해제·취소 차단·DB 실패를 검증한다. PGlite는 단일 세션이므로 외부 Postgres의 다중 세션 잠금 경합과 Railway 접속 자체는 별도 검증이 필요하다.
- `tests/fortune-commerce.test.js`: 가격, 입력, 동의, 중복 주문·승인, 서명·금액 위변조, 소유권, 미승인 차단, 재시작, 망취소, 취소 차단, 외부 콜백 쿠키, 실제 Express 다운로드 응답.
- `tests/browser/purchase.spec.js`: 홈 진입, 세 상품 미리보기, 입력 수정, 동의·날짜 오류, 모의 승인 후 HTML 다운로드, 미승인 차단, 320px 화면.
- 새 브라우저 검증 8건은 테스트 수집만 확인했다. 실행 통과로 보고하지 않는다.
- 이 실행 환경에서는 `npm run test:all`의 단위·사이트 검증은 가능하지만 로컬 포트 listen과 Chromium 기동이 EPERM으로 제한되어 브라우저 검증은 실행되지 않았다.
- 나이스페이 실제 테스트 상점 키로 PC·모바일 인증/승인/취소·콜백 재시도·다운로드를 검증해야 한다. 실제 PG 요청은 수행하지 않았다.
- 운영자 사업자 정보·상품 제공 및 환불 안내·개인정보 보관 기간을 확정하고, Fortune의 DB 참조 연결을 검증한 뒤 운영 전환해야 한다. 실제 PG 결제 및 운영 결제 전환은 별도 검증 후 진행한다.

## 공식 연동 근거

- [나이스페이 공식 REST Server 승인 모델](https://github.com/nicepayments/nicepay-manual/blob/main/api/payment-window-server.md)
- [공식 API·키·Basic 인증 안내](https://github.com/nicepayments/nicepay-manual/blob/main/common/api.md)
- [공식 망취소](https://github.com/nicepayments/nicepay-manual/blob/main/api/cancel.md#망취소)
- [Railway Postgres 연결](https://docs.railway.com/databases/postgresql)
- [node-postgres 연결 풀](https://node-postgres.com/features/pooling)
- [Postgres advisory locks](https://www.postgresql.org/docs/current/functions-admin.html#FUNCTIONS-ADVISORY-LOCKS)

2026-11-16 확인. REST JS SDK 기준이며 다른 계약/API 모델의 키를 그대로 사용할 수 있다고 가정하지 않는다.

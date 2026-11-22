# 프리미엄 구매 측정 계약

2026-11-22 FOR-007 변경. `commerce_version=3`, 공통 `measurement_version=4`.
토정비결·평생 사주·궁합에 동일하게 적용한다. 운세 계산 엔진과 가격은 변경하지 않는다.

## 무료 콘텐츠에서 상품으로

띠별·사주·가이드 본문 하단과 개인 무료 계산 결과 하단에 관련 상품의 실제 목차 3개, 가격, 미리보기 링크를 표시한다. 개인 결과에서는 계산 전에는 표시하지 않는다. 목차·이름·가격은 상품 도메인 정의에서 가져온다.

| 이벤트 | 실제 발생 조건 | 해석 한계 |
| --- | --- | --- |
| `premium_menu_click` | 상단 프리미엄 메뉴 클릭 | 목록 직접 방문과 본문 링크 제외 |
| `view_item_list` | 상품 CTA의 절반 이상이 활성 탭 화면에 보임 | 카드 전체를 읽었다는 뜻은 아님. 문서 내 pathname·지면·상품별 1회 |
| `select_item` | 해당 CTA 클릭 | 클릭한 상품을 구매했다는 뜻은 아님 |
| `view_item` | 상품 구매 화면 초기화 | 개인 정보 입력 완료가 아님 |
| `checkout_input_start` | 출생 폼 첫 입력 또는 저장 프로필 선택, 화면당 1회 | 입력값·이름 전송 없음 |
| `begin_checkout` | 선택한 무료 미리보기 응답 성공 | 직접 결제하면 발생하지 않음 |
| `payment_attempt` | 확인 동의 후 결제 버튼 클릭 또는 미결제 주문 재시도 | 승인 요청 성공이 아님 |
| `add_payment_info` | 결제 준비 API 성공 후 SDK에 결제수단 전달 | 결제창 표시·카드 입력·승인 성공을 보장하지 않음 |
| `purchase` | live PAID 주문·금액 확인 및 보고서 권한 재검증 응답 성공 | 브라우저에서 전송하므로 광고 차단·창 종료 등으로 누락 가능 |
| `purchase_error` | 아래 진단 단계에서 실패 또는 확인 필요 상태 관측 | 결제 실패 건수·고유 주문 수와 동일하지 않음 |

`item_list_id`는 `home_reports`, `shop_catalog`, `reading_footer`다.
`purchase`는 주문 ID를 `transaction_id`로 사용하며 기존 메모리·로컬 저장 중복 방지를 유지한다. 테스트 주문, 단순 클릭, 대기 주문은 매출로 보내지 않는다.

## 지면별 조회와 구매

| 지면 | 페이지 조회 | 상품별 구매 완료 |
| --- | --- | --- |
| 상품 목록 /shop/ | `view_shop` | — |
| 토정비결 | `view_tojeong` | `purchase_tojeong` |
| 궁합 | `view_compatibility` | `purchase_compatibility` |
| 평생 사주 | `view_lifetime` | `purchase_lifetime` |
| 내년 신년운세 /year/{연도}/premium/ | `view_annual` | `purchase_annual` |

각 조회는 해당 문서 진입 시 전송한다. 연간 상품은 `reading_year`에 대상 연도를 담아 같은 이벤트 이름으로 매년 이어서 측정한다. 상품별 구매는 표준 `purchase`와 같은 승인·중복 방지 조건에서 한 번 전송한다. 매출 금액과 거래 ID는 표준 이벤트에만 담는다. 구매 전체 건수는 `purchase`, 개별 상품 건수는 위의 상품별 이벤트로 확인한다.

## 오류 진단

`checkout_stage`: `configuration`, `preview`, `order_create`, `sdk_load`, `payment_prepare`, `payment_window`, `payment_return`, `report_load`.

`error_code`: `consent_required`, `http_4xx`, `http_5xx`, `request_failed`, `provider_error`, `provider_check_required`.

PG 복귀 후 `/shop/orders/?payment=check`는 `payment_return / provider_check_required`로 기록한다. 새로고침하면 다시 기록될 수 있으며 승인 실패로 확정하지 않는다. 상세 원인은 서버의 기존 `fortune_payment_failed` 진단과 대조한다.
오류 이벤트에는 원본 오류 메시지·출생 정보·개인 이름·주문 ID·인증 값을 넣지 않는다. HTTP 응답 본문을 읽지 못하면 `request_failed`로 분류할 수 있다.

GA 맞춤 이벤트 차원은 `checkout_stage`, `error_code`, `commerce_version`을 사용한다. 내부 계산 동작명 `form/saved/sample/shared_result`를 `source`로 전달하려 하면 `calc_origin`으로 옮긴다. 실제 캠페인 source는 보존한다. 이 방어 처리는 과거 데이터와 이미 캐시된 구버전 코드를 수정하지 않는다.

## GA에서 해석할 때

11월 18일판의 직접 구매 퍼널은 닫힌 퍼널 `view_item → begin_checkout → purchase`로 설정한다. 장바구니가 없으므로 `add_to_cart`를 필수 단계로 쓰지 않는다. 단계 사이 다른 이벤트를 허용하며 기기별로 나눈다. 동일 세션·특정 제한 시간 조건은 별도로 적용하지 않았다. 기간과 조건이 다른 퍼널끼리 직접 비교하지 않는다.

11월 22일판은 같은 세션에서 상단 메뉴 클릭 → 목록 도착 → 상품 선택(`item_list_id=shop_catalog`) → 상품 열기 → 입력 시작 → 결제 시도 → PG 전달 → 구매를 순서대로 센다. 상품 직접 진입은 상품 열기부터 따로 집계한다. 미리보기는 선택 분기다. 이전판과 비교할 공통 구간은 상품 열기 → 결제 시도 → 구매이며 배포 당일과 내부 QA를 구분한다. 직접 결제에서 발생한 입력 오류는 `input / invalid_input`으로 기록한다. PG 승인 성공은 서버 승인 기록으로 대조한다.

기존 GA 수정 규칙 `calc_result → fortune_view`, `fortune_type=[[tool]]`는 유지한다. `fortune_view`, `zodiac_fortune_view` 같은 이용 주요 이벤트를 구매 수와 합산하지 않는다. 구매 주요 이벤트 이름은 `purchase`다.

띠별 조회 생성 규칙은 KR/EN, www 유무, 오늘·내일·연간 허브와 띠 상세를 포함한다. 궁합표·삼재는 제외한다. 설정 변경 이전 누락 건은 복원하지 않는다.

당일 GA는 처리 중 데이터다. 이벤트별 총 사용자 수를 나눈 값을 사용자 순서 퍼널로 간주하지 않는다. DB의 `created_at`은 주문 생성 시각으로 승인 시각과 다르다. 실제 승인일 매출 대조는 PG 승인 기록을 기준으로 해야 한다.

## 검증

`tests/browser/premium-funnel.spec.js`는 320/390/768/1440px, KR/EN 연결, SPA 이동, 실제 노출·중복 방지, 무료 결과 후 진입, 3상품 결제 단계, HTTP·PG 오류와 개인정보 제외를 검사한다. 외부 통신과 결제 SDK를 가로채 실제 결제·GA 실적을 만들지 않는다. 운영 GA 수신과 다음 실제 승인 거래의 대조는 별도 관찰 대상이다.

모바일 무료 운세 본문은 기본 17px·큰 글자 19px, 구매한 운세 본문은 18px로 표시한다. 좁은 상품 화면은 목차와 가격·버튼을 세로로 배치하고, 구매 버튼 높이는 52px 이상을 확보한다. 구매한 운세의 목차는 눌러 이동하는 박스로 제공하며, 궁합 비교표는 가로로 이동해도 연도 열을 유지한다. KR/EN 무료 결과와 가이드, 세 상품의 밝은·어두운 테마에서 본문 크기·터치 영역·가로 넘침·표 키보드 스크롤을 검사한다.

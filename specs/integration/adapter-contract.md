# Integration Adapter Contract

## 1. 목적

이 문서는 이제너두 전사 CRM OS Integration Hub에서 외부 시스템 어댑터가 준수해야 하는 공통 계약을 정의한다. 대상은 베네카페, 결제, 온누리, 외부 공급사 API, 정산/포인트 관련 시스템이다.

본 문서는 상세 API 문서 수령 전 초안이며, 외부 API 필드, 인증 방식, 개인정보 처리범위, 아키텍처 확정은 PM 김권일 승인 후 확정한다.

인당 생산성/마진 기여: 어댑터 계약을 먼저 고정해 외부 시스템별 중복 구현을 줄이고 장애 대응 자동화의 재사용성을 높인다.

## 2. 설계 원칙

| 원칙 | 계약 |
|---|---|
| 멱등성 | 모든 쓰기 요청은 `idempotencyKey`를 필수로 가진다. |
| 추적성 | 모든 요청은 `requestId`, `correlationId`, `tenantId`, `externalSystem`을 가진다. |
| 상태 기계 | 외부 연동 상태는 허용된 상태 전이만 가능하다. |
| 재시도 분리 | 재시도 가능 오류와 수동 확인 오류를 명확히 분리한다. |
| 감사 가능성 | 요청, 응답, 재시도, 수동 보정, 폐기 판단을 이벤트로 기록한다. |
| 개인정보 최소화 | 어댑터는 업무 처리에 필요한 최소 식별자와 속성만 전달한다. |

인당 생산성/마진 기여: 공통 원칙을 계약화해 장애가 발생해도 담당자가 매번 판단 기준을 새로 만들지 않게 한다.

## 3. 공통 식별자

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `requestId` | string | Y | CRM OS가 생성하는 단일 요청 식별자 |
| `correlationId` | string | Y | 하나의 업무 흐름을 묶는 추적 ID |
| `idempotencyKey` | string | 조건부 Y | 쓰기성 요청 필수, 조회 요청 선택 |
| `tenantId` | string | Y | 고객사 또는 테넌트 식별자 |
| `actorId` | string | Y | 요청 주체 사용자/시스템 ID |
| `externalSystem` | enum | Y | `benefit_cafe`, `payment`, `onnuri`, `supplier`, `settlement_point` |
| `operationType` | enum | Y | `read`, `create`, `update`, `cancel`, `refund`, `reconcile`, `webhook` |
| `sourceEntityType` | enum | Y | `customer`, `employee`, `order`, `payment`, `point_transaction`, `settlement`, `supplier` |
| `sourceEntityId` | string | Y | 내부 기준 엔티티 ID |
| `externalEntityId` | string | N | 외부 시스템 엔티티 ID |

인당 생산성/마진 기여: 공통 식별자를 통일해 장애 추적, 대사, 고객/공급사별 비용 분석을 자동화할 수 있게 한다.

## 4. 공통 요청 계약

```json
{
  "requestId": "req_20260607_000001",
  "correlationId": "corr_order_123",
  "idempotencyKey": "idem_payment_order_123_attempt_1",
  "tenantId": "tenant_001",
  "actorId": "system_integration_hub",
  "externalSystem": "payment",
  "operationType": "create",
  "sourceEntityType": "order",
  "sourceEntityId": "order_123",
  "externalEntityId": null,
  "occurredAt": "2026-06-07T03:00:00Z",
  "payloadVersion": "2026-06-07",
  "payload": {},
  "metadata": {
    "priority": "P1",
    "containsPersonalData": false,
    "requiresReconciliation": true
  }
}
```

### 인수조건

- `requestId`는 전역 유일해야 한다.
- 같은 `idempotencyKey`와 `operationType`은 같은 업무 결과를 반환해야 한다.
- `payloadVersion` 변경 시 하위 호환 또는 마이그레이션 기준이 있어야 한다.
- `containsPersonalData=true`인 요청은 로그 마스킹 정책을 적용해야 한다.

인당 생산성/마진 기여: 요청 형식을 표준화해 모니터링, 재처리, 장애 분석 도구를 모든 어댑터에 공통 적용한다.

## 5. 공통 응답 계약

```json
{
  "requestId": "req_20260607_000001",
  "correlationId": "corr_order_123",
  "idempotencyKey": "idem_payment_order_123_attempt_1",
  "externalSystem": "payment",
  "operationType": "create",
  "status": "succeeded",
  "externalEntityId": "pay_987",
  "externalStatus": "approved",
  "processedAt": "2026-06-07T03:00:03Z",
  "retryable": false,
  "reconciliationRequired": true,
  "error": null,
  "result": {}
}
```

### `status` 값

| 상태 | 의미 |
|---|---|
| `accepted` | 외부 시스템 접수 완료, 최종 처리 대기 |
| `succeeded` | 외부 처리 성공 |
| `failed_retryable` | 일시 오류, 자동 재시도 가능 |
| `failed_non_retryable` | 입력/정책/권한 오류, 자동 재시도 불가 |
| `unknown` | 외부 처리 여부 불명확, 상태 조회 필요 |
| `needs_review` | 운영자 확인 필요 |

인당 생산성/마진 기여: 응답 상태를 표준화해 자동 재시도와 운영자 개입을 빠르게 분기한다.

## 6. 오류 계약

```json
{
  "code": "EXTERNAL_TIMEOUT",
  "message": "External system did not respond within timeout.",
  "category": "network",
  "retryable": true,
  "safeToRetryWrite": false,
  "externalCode": "504",
  "externalMessage": "Gateway Timeout",
  "requiresManualCorrection": false
}
```

| `category` | 재시도 | 예외 큐 | 설명 |
|---|---|---|---|
| `network` | 가능 | 반복 실패 시 | 타임아웃, 연결 실패, 5xx |
| `auth` | 불가 | 즉시 | 인증 실패, 인증서 만료, 권한 오류 |
| `validation` | 불가 | 즉시 | 필드 누락, 포맷 오류 |
| `business_policy` | 불가 | 즉시 | 취소 기간 만료, 한도 초과, 정책 제한 |
| `duplicate` | 조건부 | 상태 불일치 시 | 외부 중복 요청 |
| `state_conflict` | 불가 | 즉시 | 내부/외부 상태 전이 충돌 |
| `reconciliation_mismatch` | 불가 | 즉시 | 금액/수량/상태 대사 불일치 |

인당 생산성/마진 기여: 오류 카테고리를 통일해 자동 복구 가능한 장애와 사람 판단이 필요한 장애를 즉시 구분한다.

## 7. 상태 전이 계약

```text
created
  -> requested
  -> accepted
  -> succeeded
  -> reconciled

created
  -> requested
  -> failed_retryable
  -> pending_retry
  -> requested

created
  -> requested
  -> unknown
  -> status_check_required
  -> succeeded | needs_review

created
  -> requested
  -> failed_non_retryable
  -> needs_review
  -> manual_correction_required
  -> resolved | discarded
```

### 인수조건

- `succeeded` 이후 금액/포인트/정산 값 변경은 보정 이벤트로만 가능하다.
- `unknown` 상태에서는 동일 쓰기 요청을 즉시 재전송하지 않고 외부 상태 조회를 먼저 수행한다.
- `discarded`는 승인자와 사유 없이는 사용할 수 없다.

인당 생산성/마진 기여: 상태 전이 제약으로 중복 처리와 임의 보정을 막아 금전 손실과 감사 리스크를 줄인다.

## 8. 재시도 계약

| 항목 | 기준 초안 |
|---|---|
| 최대 재시도 | 기본 3회 |
| 간격 | 1분, 5분, 15분 지수 백오프 |
| 쓰기 요청 재시도 | `safeToRetryWrite=true` 또는 외부 상태 조회 후 가능 |
| 조회 요청 재시도 | 네트워크/5xx 오류는 자동 재시도 가능 |
| 재시도 초과 | `needs_review` 예외 큐로 이동 |
| 금액 거래 | 처리 여부 불명확 시 상태 조회 우선 |

PM 승인 필요: 외부 시스템별 SLA, 업무별 허용 지연 시간, 재시도 횟수와 간격의 최종 기준.

인당 생산성/마진 기여: 일시 장애는 자동 복구하고 위험한 중복 쓰기는 차단해 운영자 개입을 줄이면서 손실을 막는다.

## 9. 어댑터별 최소 오퍼레이션

### 9.1 `benefitCafeAdapter`

| 오퍼레이션 | 목적 | 입력 | 출력 | 인수조건 |
|---|---|---|---|---|
| `syncMember` | 임직원/회원 매핑 동기화 | `tenantId`, `employeeId`, 외부 회원 식별자 | 외부 회원 상태 | 개인정보 필드는 PM 승인 전 확정하지 않는다. |
| `grantPoint` | 복지포인트 지급 | 포인트 거래 ID, 금액, 사유 | 외부 포인트 거래 ID | 동일 멱등 키 중복 지급 금지 |
| `deductPoint` | 포인트 차감/회수 | 포인트 거래 ID, 금액, 사유 | 외부 차감 거래 ID | 잔액 부족/정책 오류는 수동 검토 |
| `getOrderStatus` | 주문 상태 조회 | 내부 주문 ID 또는 외부 주문 ID | 외부 주문 상태 | 상태 불일치 시 예외 큐 |

의존성: 베네카페 API 문서, 회원 식별자 매핑, 개인정보 처리범위.

담당: A6, A1, A2, A7.

KPI 영향: 포인트 지급/차감 문의 감소, 운영자 수동 조회 시간 감소.

인당 생산성/마진 기여: 베네카페 상태 조회와 보정을 CRM OS 예외 큐에 연결해 담당자 화면 왕복을 줄인다.

### 9.2 `paymentAdapter`

| 오퍼레이션 | 목적 | 입력 | 출력 | 인수조건 |
|---|---|---|---|---|
| `authorizePayment` | 결제 승인 | 주문 ID, 금액, 결제수단 토큰 | 승인번호, 승인 상태 | 승인 결과 불명확 시 지급 보류 |
| `cancelPayment` | 결제 취소 | 결제 ID, 취소 금액, 사유 | 취소번호, 취소 상태 | 부분취소 정책 오류는 수동 검토 |
| `handleWebhook` | 결제 결과 수신 | 외부 웹훅 페이로드 | 내부 결제 상태 이벤트 | 중복/역순 웹훅에도 상태 일관성 유지 |
| `reconcilePayment` | 결제 대사 | 외부 대사 파일/API 결과 | 차이 목록 | 금액 차이 자동 폐기 금지 |

의존성: PG API 문서, 웹훅 서명 검증 방식, 재무 대사 기준.

담당: A6, A2, A4, A7.

KPI 영향: 결제 오류 손실 감소, 환불/취소 처리 시간 감소.

인당 생산성/마진 기여: 결제 상태와 정산 대사를 자동 연결해 금액 오류를 조기에 발견하고 재무 확인 시간을 줄인다.

### 9.3 `onnuriAdapter`

| 오퍼레이션 | 목적 | 입력 | 출력 | 인수조건 |
|---|---|---|---|---|
| `authorizeOnnuri` | 온누리 거래 승인 | 거래 ID, 금액, 사용자/고객사 식별자 | 외부 승인번호 | 승인 미확인 시 내부 지급 보류 |
| `cancelOnnuri` | 온누리 거래 취소 | 승인번호, 취소 금액, 사유 | 취소 상태 | 취소 불가 정책은 예외 큐 |
| `reconcileOnnuri` | 온누리 대사 | 외부 거래 목록 | 차이 목록 | 금액/상태 불일치 시 수동 확인 |

의존성: 온누리 API 문서, 거래 정책, 취소 가능 기간.

담당: A6, A2, A4.

KPI 영향: 온누리 거래 문의와 정산 차이 처리 시간 감소.

인당 생산성/마진 기여: 온누리 승인/취소/대사를 동일 흐름으로 관리해 예외 처리 담당자의 반복 확인을 줄인다.

### 9.4 `supplierApiAdapter`

| 오퍼레이션 | 목적 | 입력 | 출력 | 인수조건 |
|---|---|---|---|---|
| `syncCatalog` | 상품/가격/재고 동기화 | 공급사 상품 데이터 | 내부 상품 후보 이벤트 | 가격 급변 또는 필수 필드 누락은 검토 큐 |
| `submitOrder` | 공급사 주문 접수 | 주문 ID, 상품, 수량, 배송 정보 | 공급사 접수번호 | 접수 실패 시 고객 확정 상태로 전환 금지 |
| `getFulfillmentStatus` | 배송/처리 상태 조회 | 공급사 접수번호 | 배송/처리 상태 | 장기 지연은 운영 알림 |
| `submitClaim` | 취소/반품/교환 요청 | 주문 ID, 클레임 유형, 사유 | 클레임 접수번호 | 공급사 정책 제한은 수동 검토 |
| `reconcileSupplierSettlement` | 공급사 정산 대사 | 공급사 정산 데이터 | 차이 목록 | 정산 기준일 불일치 표시 |

의존성: 공급사별 API/SFTP/파일 양식, 상품/주문 원천 정책, 계약별 정산 기준.

담당: A6, A3, A4, A7.

KPI 영향: 공급사 문의 감소, 주문/정산 파일 수작업 감소.

인당 생산성/마진 기여: 공급사별 연동 차이를 표준 오퍼레이션으로 흡수해 공급사 추가 비용과 운영 예외 처리를 낮춘다.

### 9.5 `settlementPointAdapter`

| 오퍼레이션 | 목적 | 입력 | 출력 | 인수조건 |
|---|---|---|---|---|
| `postPointTransaction` | 포인트 원장 반영 | 거래 ID, 금액, 유형, 사유 | 원장 반영 상태 | 원장 합계 검증 실패 시 예외 큐 |
| `reversePointTransaction` | 포인트 회수/취소 | 원거래 ID, 금액, 사유 | 취소 거래 ID | 원거래 없는 취소 금지 |
| `runSettlementBatch` | 정산 배치 실행 | 기간, 고객사/공급사, 기준일 | 정산 후보/확정 상태 | 차이 금액 존재 시 확정 금지 |
| `reconcilePointLedger` | 포인트 원장 대사 | 외부/내부 원장 스냅샷 | 차이 목록 | 차이 사유 없는 자동 조정 금지 |

의존성: 포인트 원장 데이터 모델, 회계/외감 기준, 보정 승인 정책.

담당: A6, A4, A7.

KPI 영향: 정산 오류와 외감 자료 취합 시간 감소.

인당 생산성/마진 기여: 포인트와 정산의 금액 검증을 자동화해 고비용 재무/운영 확인 시간을 줄인다.

## 10. 예외 큐 이벤트 계약

```json
{
  "exceptionId": "ex_20260607_000001",
  "requestId": "req_20260607_000001",
  "correlationId": "corr_order_123",
  "tenantId": "tenant_001",
  "externalSystem": "payment",
  "operationType": "create",
  "severity": "P1",
  "status": "needs_review",
  "failureCategory": "network",
  "amountImpact": {
    "currency": "KRW",
    "amount": 50000
  },
  "recommendedAction": "Check external payment status before retrying write request.",
  "assignedTeam": "operations",
  "createdAt": "2026-06-07T03:05:00Z",
  "slaDueAt": "2026-06-07T03:35:00Z"
}
```

### 필수 인수조건

- 금액 영향이 있는 예외는 `amountImpact`를 가져야 한다.
- 예외 상태 변경은 감사로그에 남아야 한다.
- `manual_correction_required`는 증적 첨부 또는 외부 보정 참조번호를 가져야 한다.
- `discarded`는 승인자와 사유가 없으면 허용하지 않는다.

인당 생산성/마진 기여: 예외 큐 이벤트를 구조화해 SLA, 금액 영향, 담당 배정을 자동화하고 미처리 비용을 줄인다.

## 11. 보안 및 감사 계약

| 항목 | 기준 초안 | PM 승인 필요 |
|---|---|---|
| 로그 마스킹 | 이름, 전화번호, 이메일, 계좌/카드 유사 정보 마스킹 | 개인정보 항목 확정 |
| 원문 저장 | 기본 비저장 또는 마스킹 저장 | 원문 보관 필요 여부 |
| 접근 권한 | 예외 조회, 재처리, 수동 보정, 폐기 권한 분리 | RBAC 정책 |
| 웹훅 검증 | 서명, 타임스탬프, 재전송 방지 검증 | 벤더별 방식 |
| 키 관리 | API Key/Secret 주기적 교체와 접근 제한 | 운영 프로세스 |
| 감사 로그 | 요청, 응답 요약, 상태 변경, 승인, 보정 기록 | 보존기간 |

인당 생산성/마진 기여: 보안/감사 기준을 초기 계약에 포함해 사후 보완 비용과 감사 대응 시간을 줄인다.

## 12. 모니터링 계약

| 메트릭 | 라벨 | 설명 |
|---|---|---|
| `integration_request_total` | `externalSystem`, `operationType`, `status` | 외부 요청 수 |
| `integration_request_duration_ms` | `externalSystem`, `operationType` | 응답시간 |
| `integration_retry_total` | `externalSystem`, `failureCategory` | 재시도 수 |
| `integration_exception_queue_size` | `externalSystem`, `severity`, `status` | 예외 큐 적체 |
| `integration_idempotency_conflict_total` | `externalSystem`, `operationType` | 멱등 충돌 수 |
| `integration_reconciliation_mismatch_total` | `externalSystem`, `sourceEntityType` | 대사 불일치 수 |
| `integration_amount_mismatch_krw` | `externalSystem` | 대사 차이 금액 |

인당 생산성/마진 기여: 공통 메트릭으로 외부 연동 품질을 수치화해 장애 대응 인력 투입과 저마진 연동을 식별한다.

## 13. 상세 API 미확정 가정

| 항목 | 현재 가정 | 확인 필요 |
|---|---|---|
| 베네카페 | API 또는 배치로 회원/포인트/주문 상태 조회 가능 | 공식 API 문서와 호출 한도 |
| 결제 | PG 웹훅과 일별 대사 데이터 제공 | 결제수단, 웹훅 서명, 취소 정책 |
| 온누리 | 승인/취소/대사성 API 또는 파일 제공 | 실제 업무 범위와 API 제공자 |
| 공급사 | 공급사별 API/SFTP/파일 혼재 | 공급사 등급과 표준 연동 우선순위 |
| 정산/포인트 | 내부 원장과 외부 대사 데이터를 비교 가능 | 원장 모델, 전표/외감 기준 |

인당 생산성/마진 기여: 가정을 공개적으로 관리해 불명확한 API에 대한 과잉 설계를 줄이고 확인된 연동부터 빠르게 표준화한다.

## 14. 완료 기준

- 각 어댑터가 목적, 입력, 출력, 인수조건, 의존성, 담당, KPI 영향을 가진다.
- 실패 시 안전 폴백, 재시도, 예외 큐 전환 기준이 정의되어 있다.
- 모니터링 메트릭과 알림 우선순위가 정의되어 있다.
- 상세 API 문서가 없는 항목은 가정과 PM/담당자 확인 필요로 분리되어 있다.
- PM 승인 필요 항목이 별도 목록으로 관리된다.

인당 생산성/마진 기여: 완료 기준을 명확히 해 A6 산출물이 후속 설계/개발의 재사용 가능한 기준선이 되게 한다.

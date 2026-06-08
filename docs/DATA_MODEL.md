# 이제너두 전사 CRM OS 통합 데이터 모델 초안

## 1. 목적

본 문서는 A4 데이터 초안과 유통회사 표준 업무 프로세스 요구사항을 취합한 팀장 통합 데이터 모델 초안이다. 개인정보/민감정보 항목, 회계 기준, 외부 연동 원천 필드는 PM 승인 전 확정하지 않는다.

인당 생산성/마진 기여: 고객, 상품, 영업, 주문, 매출, 로그 데이터를 한 기준으로 연결해 낮은 이익 원인을 빠르게 추적한다.

## 2. 핵심 데이터 흐름

```text
customer_account
  -> sales_activity
  -> sales_pipeline
  -> quote
  -> contract
  -> sales_order
  -> outbound_shipment
  -> delivery_tracking
  -> tax_invoice / transaction_statement
  -> revenue_recognition
  -> operating_profit_snapshot
```

인당 생산성/마진 기여: 흐름별 참조 ID를 고정해 부서별 수기 매칭과 엑셀 대사 시간을 줄인다.

## 3. 핵심 엔티티

| 엔티티 | 목적 | 핵심 식별자 | 주 담당 |
|---|---|---|---|
| `customer_account` | 고객 기준정보 | `customer_account_id` | A2, A4 |
| `employee_account` | 임직원/사용자 참조 | `employee_account_id` | A2, A4, A7 |
| `employee_customer_assignment` | 임직원-거래처 담당 배정 | `assignment_id` | A2, A3, A4, A7 |
| `supplier_account` | 공급사/입점사 기준정보 | `supplier_account_id` | A2, A4 |
| `product` | 판매상품 기준정보 | `product_id` | A2, A4 |
| `sales_price` | 판매가격 기준정보 | `sales_price_id` | A2, A4 |
| `sales_activity` | 영업활동 기록 | `sales_activity_id` | A2, A3 |
| `sales_pipeline` | 영업기회/단계 | `pipeline_id` | A2, A4 |
| `quote` | 견적 문서/버전 | `quote_id` | A2, A7 |
| `approval_document` | 결재 문건 | `approval_document_id` | A2, A7 |
| `approval_line` | 결재 라인 | `approval_line_id` | A2, A7 |
| `contract` | 계약 | `contract_id` | A2, A4, A7 |
| `sales_order` | 주문 | `sales_order_id` | A2 |
| `outbound_shipment` | 출고 | `outbound_shipment_id` | A2, A6 |
| `delivery_tracking` | 배송/입출고 현황 | `delivery_tracking_id` | A6 |
| `tax_invoice` | 세금계산서 | `tax_invoice_id` | A2, A7 |
| `transaction_statement` | 거래명세표 | `transaction_statement_id` | A2, A7 |
| `revenue_recognition` | 매출인식 | `revenue_recognition_id` | A4, A7 |
| `operating_profit_snapshot` | 영업이익 스냅샷 | `operating_profit_snapshot_id` | A3, A4 |
| `time_log` | 업무 타임로그 | `time_log_id` | A7, A9 |
| `audit_log` | 감사로그 | `audit_log_id` | A7, A9 |

인당 생산성/마진 기여: 엔티티를 업무 단계와 지표 산출 단위로 맞춰 화면, API, 대시보드가 같은 기준을 사용하게 한다.

## 4. 주요 필드 초안

### 4.1 판매상품/가격

| 필드 | 설명 |
|---|---|
| `product_id` | 상품 식별자 |
| `product_name` | 상품명 |
| `supplier_account_id` | 공급사 |
| `status` | 판매상태 |
| `sales_price_id` | 판매가격 식별자 |
| `list_price` | 기본 판매가격 |
| `effective_from` | 가격 적용 시작일 |
| `effective_to` | 가격 적용 종료일 |

인당 생산성/마진 기여: 판매가격을 별도 구조로 두어 견적/주문 시 가격 확인 시간을 줄이고 할인 오류를 낮춘다.

### 4.2 임직원-거래처 담당 배정

임직원 한 명은 여러 거래처를 담당할 수 있고, 거래처 하나도 여러 담당자를 가질 수 있다. 따라서 `employee_account`와 `customer_account`는 직접 1:1로 묶지 않고 `employee_customer_assignment`로 연결한다.

| 필드 | 설명 |
|---|---|
| `assignment_id` | 담당 배정 식별자 |
| `employee_account_id` | 담당 임직원 |
| `customer_account_id` | 담당 거래처 |
| `assignment_role` | 주담당, 부담당, 승인담당, 참조담당 등 |
| `is_primary` | 대표 담당자 여부 |
| `effective_from` | 배정 시작일 |
| `effective_to` | 배정 종료일 |
| `assignment_status` | 활성, 보류, 종료 |
| `assigned_by` | 배정한 사용자 |

인당 생산성/마진 기여: 한 직원이 여러 거래처를 처리하는 구조를 지원해 인력 활용도를 높이고, 거래처별 담당 공백을 줄인다.

### 4.3 결재

| 필드 | 설명 |
|---|---|
| `approval_document_id` | 결재 문건 식별자 |
| `requester_employee_id` | 로그인 사용자, 문건 상신자 |
| `approval_target_type` | 견적, 계약, 발행, 매출조정 등 |
| `approval_status` | 초안, 상신, 검토, 승인, 반려, 회수 |
| `approval_line_id` | 결재라인 식별자 |
| `approver_employee_id` | 결재자 |
| `approval_order` | 결재 순서 |
| `approved_at` | 결재 시각 |

인당 생산성/마진 기여: 결재라인과 상태를 데이터로 관리해 승인 지연과 책임소재 확인 시간을 줄인다.

### 4.4 배송/입출고

| 필드 | 설명 |
|---|---|
| `outbound_shipment_id` | 출고 식별자 |
| `sales_order_id` | 주문 참조 |
| `carrier_code` | 택배사 코드 후보 |
| `tracking_number_ref` | 송장번호 참조 |
| `delivery_status` | 배송상태 |
| `current_location` | 현재 위치 후보 |
| `last_checked_at` | 최종 조회 시각 |
| `exception_reason` | 지연, 오배송, 반송 등 |

인당 생산성/마진 기여: 배송 상태를 주문과 연결해 문의 대응과 지연 손실 대응 시간을 줄인다.

## 5. 영업이익 산식

MVP 기준 산식은 다음으로 둔다.

| 항목 | 산식 |
|---|---|
| 매출금액 | `salesAmount` |
| 원가 | `salesAmount * 0.5` |
| 판매관리비 및 일반관리비 | `salesAmount * 0.5` |
| 영업이익 | `salesAmount - costAmount - sgnaAmount` |
| 영업이익률 | `operatingProfit / salesAmount` |

주의: 원가 50%와 판매관리비/일반관리비 50%를 동시에 적용하면 기본 영업이익은 0이다. 따라서 대시보드는 할인, 반품, 배송비, 처리시간, 결재 지연, 정산 지연, 예외 처리 건수를 함께 보여야 한다.

인당 생산성/마진 기여: 단순 기준선으로 즉시 비교를 가능하게 하고, 실제 이익 저하 원인을 별도 KPI로 분해해 경영 대응을 빠르게 한다.

## 6. KPI

| KPI | 산식/기준 | 주요 차원 |
|---|---|---|
| `sales_amount` | 매출인식 금액 합계 | 고객, 상품, 담당자, 파이프라인 |
| `fixed_cost_amount` | `salesAmount * 0.5` | 고객, 상품, 기간 |
| `fixed_sgna_amount` | `salesAmount * 0.5` | 고객, 상품, 기간 |
| `fixed_operating_profit_amount` | `salesAmount - fixedCost - fixedSgna` | 고객, 상품, 담당자 |
| `quote_conversion_rate` | 계약된 견적 / 발행 견적 | 담당자, 고객, 상품 |
| `approval_cycle_time` | 승인 완료 시각 - 상신 시각 | 문건유형, 담당자 |
| `order_fulfillment_lead_time` | 출고 완료 시각 - 주문 생성 시각 | 상품, 고객 |
| `delivery_exception_rate` | 배송 예외 / 전체 배송 | 택배사, 고객 |
| `invoice_issue_delay` | 발행 시각 - 매출인식 준비 시각 | 고객, 주문 |
| `time_log_event_count` | 타임로그 이벤트 수 | 엔티티, 담당자, 권한 |

인당 생산성/마진 기여: 매출뿐 아니라 결재, 출고, 배송, 발행 지연까지 이익 저하 원인으로 추적한다.

## 7. 로그 모델

모든 핵심 엔티티는 생성, 수정, 삭제, 승인, 상태 변경, 발행, 조회 이력을 남긴다.

| 로그 | 대상 | 필수 필드 후보 |
|---|---|---|
| `time_log` | 업무 처리 흐름 | `actor_id`, `target_entity`, `target_id`, `event_type`, `occurred_at` |
| `audit_log` | 권한/개인정보/회계 증적 | `actor_id`, `tenant_scope`, `before_ref`, `after_ref`, `reason_code`, `request_id` |

인당 생산성/마진 기여: 로그를 별도 메뉴에서 확인하게 해 문제 원인 조사와 외감 자료 수집 시간을 줄인다.

## 8. 승인 필요 데이터

| 항목 | 이유 |
|---|---|
| 임직원 개인정보 상세 필드 | 개인정보 처리범위 미확정 |
| 민감정보/건강정보/가족정보 | 민감정보 가능성 |
| 택배사 API 응답 원문 | 외부계약, 개인정보 포함 가능성 |
| 세금계산서/거래명세표 외부 발행 원문 | 회계/전자문서 보존정책 필요 |
| 공식 매출인식 기준 | 회계 정책 및 외감 대응 필요 |
| 영업이익 산식 공식화 | 현재 산식은 MVP 운영 지표 후보 |

인당 생산성/마진 기여: 승인 전 민감 데이터와 회계 정책을 확정하지 않아 재설계와 규제 리스크 비용을 줄인다.

## 9. 인수조건

1. 영업활동부터 매출인식까지 각 단계가 이전 단계 참조 ID를 가져야 한다.
2. 판매상품 등록 시 판매가격을 즉시 표시할 수 있는 `sales_price` 구조가 있어야 한다.
3. 결재 문건은 로그인 사용자를 상신자로 저장하고 임의 결재라인을 연결할 수 있어야 한다.
4. 임직원 한 명은 여러 거래처 담당자로 배정될 수 있어야 하며 거래처 화면에서 담당자가 보여야 한다.
5. 슈퍼바이저 대시보드는 영업이익 산식과 원인 KPI를 조회할 수 있어야 한다.
6. 고객, 임직원, 매출, 상품, 결재, 발행, 매출인식 변경은 타임로그 또는 감사로그 대상이어야 한다.

인당 생산성/마진 기여: 데이터 인수조건을 업무 처리와 경영지표 산출 가능성에 맞춰 후속 개발의 해석 비용을 줄인다.

## 10. PM 승인 항목

1. 임직원정보와 슈퍼바이저 대시보드 상세 접근 범위를 별도 개인정보 승인 게이트로 둘지 승인 필요.
2. 원가 50%, 판매관리비 및 일반관리비 50% 산식을 MVP 운영 지표로 사용할지 승인 필요.
3. 공식 매출인식 기준과 세금계산서/거래명세표 보존 범위를 별도 회계 승인 게이트로 둘지 승인 필요.

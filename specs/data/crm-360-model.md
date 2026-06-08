# CRM 360 개념 데이터 모델

## 1. 목적

`CRM Core`가 고객사, 공급사, 임직원, 임직원-거래처 담당 배정, 상품, 영업활동, 파이프라인, 견적, 계약, 주문, 출고, 배송, 세금계산서, 거래명세표, 매출인식, 제원원가/판관비/일반관리비 입력, 포인트, 정산, CS, 타임로그를 같은 식별자 체계로 연결하고, `Profitability Dashboard`가 고객사/공급사/상품/담당자/산식 버전별 수익성, 운영 투입량, 이탈 위험, LTV 후보 지표를 산출할 수 있게 하는 개념 데이터 모델을 정의한다.

본 문서는 백엔드 스키마 설계를 위한 입력이며, 실제 DBMS, 물리 테이블, 인덱스, 개인정보 처리범위, 암호화 방식은 확정하지 않는다.

인당 생산성/마진 기여: 공통 식별자와 지표 산출 단위를 먼저 통일해 담당자별 수기 매칭과 엑셀 집계를 줄인다.

## 2. 입력

| 입력 | 필수 여부 | 설명 | 원천 후보 |
|---|---:|---|---|
| `customer_account` | 필수 | 고객사 기준 마스터 | 레거시 CRM, 계약 관리 |
| `supplier_account` | 필수 | 공급사/입점사 기준 마스터 | 입점사 관리, 상품/정산 |
| `employee_account` | 조건부 | 임직원 참조 계정 | 임직원 원장, 포인트 시스템 |
| `employee_customer_assignment` | 필수 | 임직원-거래처 담당 배정 | 임직원 관리, 거래처 관리, 담당자 배정 화면 |
| `employee_customer_assignment_history` | 조건부 | 담당 배정 생성, 역할 변경, 대표 담당 변경, 종료 이력 | 담당자 배정 이벤트, 타임로그 |
| `product` | 필수 | 판매상품 기준 마스터 | 상품 관리, 공급사 상품 원장 |
| `sales_price` | 필수 | 상품 판매가격, 할인 기준, 적용기간 | 상품/가격 관리, 견적 시스템 |
| `sales_activity` | 필수 | 방문, 통화, 미팅, 제안 활동 | CRM, 영업 타임로그 |
| `sales_pipeline` | 필수 | 영업기회 단계, 예상금액, 확률 | 영업 파이프라인 |
| `quote` | 필수 | 견적서, 견적 버전, 승인 상태 | 견적 관리, 결재 시스템 |
| `contract` | 필수 | 고객/공급 계약 | 계약 관리, 영업 관리 |
| `sales_order` | 필수 | 계약 기반 주문 | 주문 관리 |
| `outbound_shipment` | 조건부 | 출고 지시와 출고 완료 | 출고/재고 시스템 |
| `delivery_tracking` | 조건부 | 택배사, 송장, 배송 상태, 예외 | 택배사 연동, 수동 배송 입력 |
| `tax_invoice` | 조건부 | 세금계산서 발행 상태와 금액 | 세금계산서 시스템, 회계 보조 |
| `transaction_statement` | 조건부 | 거래명세표 발행 상태와 품목 | 거래명세표 발행 시스템 |
| `revenue_recognition` | 필수 | 매출인식 기준과 금액 | 주문, 출고, 청구, 회계 기준 |
| `profit_cost_formula_version` | 필수 | 영업이익 산식 버전 | 설정 메뉴, 수익성 비용 입력 |
| `profit_cost_input` | 조건부 | 제원원가, 판관비, 일반관리비 입력값 | 설정 메뉴, Master 또는 `ProfitCostInputManager` 입력 |
| `profit_cost_input_history` | 조건부 | 비용 입력 생성/수정/삭제 변경 이력 | 비용 입력 이벤트, 결재, 감사로그 |
| `point_transaction` | 조건부 | 포인트 지급/차감/사용/소멸 | 포인트 시스템, 베네카페 |
| `settlement_record` | 조건부 | 정산 금액과 상태 | 정산 시스템, 회계 보조 |
| `cs_case` | 조건부 | CS 문의와 처리 상태 | CS 툴, 메일, 콜센터 |
| `work_item` | 필수 | 운영 업무 접수/배정/처리 | Operations Console |
| `activity_log` | 필수 | 영업/AM/운영 활동 이력 | CRM, Operations Console |
| `time_log` | 필수 | 생성, 수정, 삭제, 승인, 상태 변경, 발행, 조회 이력 | CRM OS 전 모듈 |

인당 생산성/마진 기여: 필수 입력을 계정·계약·업무 이력으로 제한해 P0 구현에서 지표 산출에 필요한 최소 데이터부터 확보한다.

## 3. 출력

| 출력 | 설명 | 소비 모듈 |
|---|---|---|
| `crm_360_profile` | 계정 단위 통합 조회 모델 | CRM Core, Operations Console |
| `customer_assignment_view` | 거래처별 현재 담당자 목록, 대표 담당자, 담당 역할, 배정 기간 | CRM Core, Operations Console |
| `employee_assignment_view` | 임직원별 담당 거래처 목록, 역할, 대표 담당 여부, 변경 이력 | CRM Core, 관리자 화면 |
| `lead_to_cash_timeline` | 영업활동부터 매출인식까지 단계별 상태와 병목 | CRM Core, Operations Console, Profitability Dashboard |
| `profitability_snapshot` | 월별 고객사/공급사 수익성 후보 집계 | Profitability Dashboard |
| `operating_profit_snapshot` | 산식 버전별 제원원가, 판관비, 일반관리비 기준 영업이익 후보 | Profitability Dashboard, 슈퍼바이저 대시보드 |
| `profit_cost_change_report` | 비용 입력값, 산식 버전, 적용 범위, 적용일, 변경 전후 값, 변경 사유 | 설정, 감사/재무, Profitability Dashboard |
| `operational_load_snapshot` | 업무유형/담당자/계정별 처리량과 처리시간 | Operations Console, Profitability Dashboard |
| `risk_signal_snapshot` | 이탈 위험, 정산 예외, CS 과다 등 위험 신호 | CRM Core, Profitability Dashboard |
| `approval_required_register` | 개인정보/민감정보/정책 승인 필요 항목 | Security & Audit Baseline, PM |

인당 생산성/마진 기여: 출력 모델을 화면과 대시보드 소비 단위로 정의해 중복 API와 중복 집계를 줄인다.

## 4. 엔티티 정의

### 4.1 `customer_account`

| 항목 | 내용 |
|---|---|
| 목적 | 고객사 단위의 계약, 임직원, 업무, CS, 수익성 지표를 묶는 기준 엔티티 |
| 기본 식별자 | `customer_account_id` |
| 후보 속성 | `customer_name`, `status`, `segment`, `industry_code`, `employee_count_band`, `account_owner_id`, `created_at`, `updated_at` |
| 상태 후보 | `lead`, `active`, `paused`, `churned`, `archived` |
| 입력 | 레거시 CRM, 계약 관리, 영업/AM 자료 |
| 출력 | `crm_360_profile`, `profitability_snapshot`, `risk_signal_snapshot` |
| 인수조건 | 동일 고객사는 하나의 `customer_account_id`로 식별되어야 하며, 계약/업무/CS가 해당 ID를 참조할 수 있어야 한다. |
| 의존성 | A1/A2 CRM Core, A3 Dashboard, A4 데이터 기준 |
| KPI 영향 | 고객사별 매출, 마진, 운영 투입량, 이탈 위험 산출의 기준 축 |

인당 생산성/마진 기여: 고객사 기준 ID를 통일해 영업, 운영, 정산 데이터의 수기 병합 시간을 줄인다.

### 4.2 `supplier_account`

| 항목 | 내용 |
|---|---|
| 목적 | 공급사/입점사 단위의 계약, 정산, CS, 운영 예외, 수익성 지표를 묶는 기준 엔티티 |
| 기본 식별자 | `supplier_account_id` |
| 후보 속성 | `supplier_name`, `status`, `supplier_type`, `category_group`, `settlement_cycle`, `supplier_owner_id`, `created_at`, `updated_at` |
| 상태 후보 | `onboarding`, `active`, `suspended`, `offboarding`, `archived` |
| 입력 | 입점사 관리, 상품/정산 시스템 |
| 출력 | `crm_360_profile`, `profitability_snapshot`, `risk_signal_snapshot` |
| 인수조건 | 정산/상품/CS/활동 데이터가 가능한 경우 `supplier_account_id`를 참조해야 한다. |
| 의존성 | A1/A2 CRM Core, A6 Integration Hub, A4 데이터 기준 |
| KPI 영향 | 공급사별 매출 기여, 정산 예외율, 운영 투입량, 마진 산출의 기준 축 |

인당 생산성/마진 기여: 공급사별 예외와 정산 품질을 계량화해 운영 문의와 정산 재작업이 큰 공급사를 우선 개선한다.

### 4.3 `employee_account`

| 항목 | 내용 |
|---|---|
| 목적 | 고객사 소속 임직원을 포인트, CS, 자격 상태와 연결하는 참조 엔티티 |
| 기본 식별자 | `employee_account_id` |
| 후보 속성 | `eligibility_status`, `point_policy_id`, `joined_at`, `left_at`, `created_at`, `updated_at` |
| 상태 후보 | `eligible`, `inactive`, `suspended`, `terminated` |
| 입력 | 임직원 원장, 포인트 시스템 |
| 출력 | `crm_360_profile`, `employee_assignment_view`, `cs_case_rate`, 포인트 관련 지표 |
| 인수조건 | 개인정보 원문 없이도 임직원 참조 계정이 담당 거래처 배정, 포인트 계정, CS 건과 연결 가능해야 한다. 거래처 담당 관계는 직접 FK가 아니라 `employee_customer_assignment`를 통해 관리해야 한다. |
| 의존성 | A7 개인정보 승인, A2 CRM Core, A4 데이터 기준 |
| KPI 영향 | 담당 거래처 수, 담당자별 영업/운영 생산성, 고객사 규모, CS 발생률, 포인트 운영량 산출의 분모 후보 |

인당 생산성/마진 기여: 임직원 원문 개인정보를 최소화하면서 고객사 규모와 운영 부하를 계산해 보안 리스크와 처리 비용을 함께 낮춘다.

### 4.3.1 `employee_customer_assignment`

| 항목 | 내용 |
|---|---|
| 목적 | 임직원과 거래처의 다대다 담당 배정, 대표 담당자, 담당 역할, 배정 기간을 관리하는 엔티티 |
| 기본 식별자 | `assignment_id` |
| 후보 속성 | `employee_account_id`, `customer_account_id`, `assignment_role`, `is_primary`, `assignment_status`, `effective_from`, `effective_to`, `assigned_by_employee_id`, `assignment_reason_ref`, `created_at`, `updated_at` |
| 담당 역할 후보 | `primary_owner`, `secondary_owner`, `approval_owner`, `observer` |
| 상태 후보 | `active`, `pending`, `ended`, `suspended` |
| 입력 | 임직원 ID, 거래처 ID, 담당 역할, 대표 담당자 여부, 배정 시작일, 배정 종료일, 배정 사유 |
| 출력 | 거래처별 담당자 목록, 임직원별 담당 거래처 목록, 대표 담당자 표시, 담당 역할 표시 |
| 인수조건 | 임직원 한 명은 여러 거래처에 배정될 수 있고, 거래처 하나는 여러 임직원을 담당자로 가질 수 있어야 한다. `is_primary`는 대표 담당자 후보를 표시하되 거래처별 1명 제한은 PM 승인 전 확정하지 않는다. |
| 의존성 | A2 CRM Core, A3 담당자 배정 UI, A7 권한/개인정보, PM 대표 담당자 정책 승인 |
| 담당 | A4 |
| KPI 영향 | 담당 거래처 수, 거래처별 담당 공백, 대표 담당자 누락, 담당자 변경 빈도 산출 |

인당 생산성/마진 기여: 다대다 담당 배정으로 실제 영업/운영 분담을 반영해 담당자 공백과 중복 문의를 줄인다.

### 4.3.2 `employee_customer_assignment_history`

| 항목 | 내용 |
|---|---|
| 목적 | 담당 배정 생성, 역할 변경, 대표 담당 변경, 배정 종료 이력을 추적하는 엔티티 |
| 기본 식별자 | `assignment_history_id` |
| 후보 속성 | `assignment_id`, `change_type`, `previous_role`, `new_role`, `previous_is_primary`, `new_is_primary`, `previous_status`, `new_status`, `changed_by_employee_id`, `changed_at`, `change_reason_ref`, `time_log_id` |
| 변경 유형 후보 | `created`, `role_changed`, `primary_changed`, `period_changed`, `ended`, `reactivated` |
| 입력 | 담당 배정 변경 이벤트, 변경자, 변경 사유, 변경 전/후 값 |
| 출력 | 배정 이력, 변경 로그, 타임로그 참조 |
| 인수조건 | 담당자 배정, 변경, 종료는 변경 전/후 핵심 값과 변경자, 변경 시각을 남겨야 하며 `time_log`와 연결 가능해야 한다. |
| 의존성 | A2 CRM Core, A7 감사/권한, A9 로그 보존 |
| 담당 | A4 |
| KPI 영향 | 배정 변경 건수, 인수인계 부담, 담당 공백 원인 분석 |

인당 생산성/마진 기여: 담당 변경 이력을 남겨 인수인계 누락과 책임소재 확인 시간을 줄인다.

### 4.4 `contract`

| 항목 | 내용 |
|---|---|
| 목적 | 고객사/공급사의 과금, 서비스 범위, 기간, 갱신 상태를 정의하는 계약 기준 엔티티 |
| 기본 식별자 | `contract_id` |
| 후보 속성 | `account_type`, `account_id`, `contract_type`, `billing_model`, `start_date`, `end_date`, `renewal_status`, `status`, `created_at`, `updated_at` |
| 상태 후보 | `draft`, `active`, `renewal_pending`, `expired`, `terminated` |
| 입력 | 계약 관리, 영업/AM 관리 자료 |
| 출력 | 매출 산출, 갱신 위험, LTV 후보 |
| 인수조건 | 모든 `revenue_record`는 가능한 경우 `contract_id`를 참조해야 한다. |
| 의존성 | A1/A2 CRM Core, PM 계약 기준 승인 |
| KPI 영향 | 계약별 매출, 갱신 위험, LTV 후보 산출의 기준 |

인당 생산성/마진 기여: 계약 기준으로 매출과 운영 이슈를 묶어 갱신 대응과 저마진 계약 조정을 빠르게 한다.

### 4.5 `point_account`

| 항목 | 내용 |
|---|---|
| 목적 | 임직원별 포인트 정책과 포인트 거래를 연결하는 참조 엔티티 |
| 기본 식별자 | `point_account_id` |
| 후보 속성 | `employee_account_id`, `point_policy_id`, `status`, `opened_at`, `closed_at` |
| 상태 후보 | `active`, `paused`, `closed` |
| 입력 | 포인트 시스템 |
| 출력 | 포인트 잔액/거래 참조, 포인트 운영량 |
| 인수조건 | 포인트 거래는 `point_account_id`를 통해 임직원 참조 계정과 연결 가능해야 한다. |
| 의존성 | A5/A6 포인트 연동, A7 개인정보 승인 |
| KPI 영향 | 포인트 운영량, 고객사별 사용량, 정산 근거 추적 |

인당 생산성/마진 기여: 포인트 문의와 정산 확인을 계정 기준으로 추적해 운영자 확인 시간을 줄인다.

### 4.6 `point_transaction`

| 항목 | 내용 |
|---|---|
| 목적 | 포인트 지급, 차감, 사용, 취소, 소멸의 원장성 이벤트 후보 |
| 기본 식별자 | `point_transaction_id` |
| 후보 속성 | `point_account_id`, `transaction_type`, `amount`, `occurred_at`, `source_system`, `source_record_id`, `reference_id`, `created_at` |
| 상태 후보 | `posted`, `cancelled`, `reversed`, `pending` |
| 입력 | 포인트 시스템, 베네카페 연동 |
| 출력 | 정산 근거, 포인트 운영량, 고객사별 사용 지표 |
| 인수조건 | 거래별 원천 시스템과 원천 레코드 후보를 추적할 수 있어야 한다. |
| 의존성 | A5/A6 연동, A7 감사/보안 |
| KPI 영향 | 포인트 처리량, 정산 금액, 예외 원인 분석 |

인당 생산성/마진 기여: 포인트 거래 근거를 표준화해 문의 대응과 정산 검산 시간을 줄인다.

### 4.7 `settlement_record`

| 항목 | 내용 |
|---|---|
| 목적 | 공급사/고객사 정산 금액, 수수료, 예외 상태를 관리하는 엔티티 |
| 기본 식별자 | `settlement_id` |
| 후보 속성 | `account_type`, `account_id`, `period`, `gross_amount`, `fee_amount`, `net_amount`, `currency`, `status`, `exception_reason_code`, `source_system`, `created_at`, `updated_at` |
| 상태 후보 | `calculated`, `review_required`, `approved`, `paid`, `failed`, `adjusted` |
| 입력 | 정산 시스템, 회계 보조 자료 |
| 출력 | 정산 예외율, 공급사 수익성, 회계 근거 후보 |
| 인수조건 | 정산 상태와 예외 사유가 공급사 또는 고객사 기준으로 집계 가능해야 한다. |
| 의존성 | A2/A5 Settlement Ops, A6 연동, A7 외감/감사 |
| KPI 영향 | 정산 예외율, 정산 처리시간, 공급사별 마진 후보 |

인당 생산성/마진 기여: 정산 예외를 계정별로 측정해 반복 오류 공급사와 수작업 보정 구간을 줄인다.

### 4.8 `revenue_record`

| 항목 | 내용 |
|---|---|
| 목적 | 계약 또는 정산 기준 매출 후보 금액을 보관하는 지표 산출 엔티티 |
| 기본 식별자 | `revenue_id` |
| 후보 속성 | `contract_id`, `account_type`, `account_id`, `period`, `revenue_type`, `amount`, `currency`, `source_system`, `source_record_id`, `recognized_at` |
| 상태 후보 | `estimated`, `confirmed`, `adjusted`, `excluded` |
| 입력 | 계약 관리, 정산 시스템, 회계 보조 자료 |
| 출력 | `gross_revenue`, 마진 지표, LTV 후보 |
| 인수조건 | 매출 금액은 기간, 계정, 계약 기준으로 집계 가능해야 하며 확정/추정 상태를 구분해야 한다. |
| 의존성 | PM/재무 회계 기준 승인, A4 지표 정의 |
| KPI 영향 | 고객사/공급사별 매출과 마진 산출의 분자 |

인당 생산성/마진 기여: 매출 후보와 확정값을 구분해 의사결정은 빠르게 하되 재무 검산 재작업을 줄인다.

### 4.9 `cost_record`

| 항목 | 내용 |
|---|---|
| 목적 | 직접 원가와 운영 배부 원가 후보를 지표 산출에 연결하는 엔티티 |
| 기본 식별자 | `cost_id` |
| 후보 속성 | `account_type`, `account_id`, `period`, `cost_type`, `allocation_key`, `amount`, `currency`, `source_system`, `source_record_id` |
| 상태 후보 | `estimated`, `confirmed`, `adjusted`, `excluded` |
| 입력 | 정산, 결제 수수료, 인건비/운영비 배부 기준 |
| 출력 | `direct_cost`, `allocated_ops_cost`, 마진 지표 |
| 인수조건 | 비용은 직접 비용과 배부 비용을 구분하고, 배부 정책 승인 여부를 표시해야 한다. |
| 의존성 | PM/재무 원가 배부 정책 승인 |
| KPI 영향 | 저마진 고객사/공급사 식별 |

인당 생산성/마진 기여: 비용을 계정별로 연결해 매출은 크지만 인력과 원가를 많이 쓰는 대상을 드러낸다.

### 4.9.1 `profit_cost_formula_version`

| 항목 | 내용 |
|---|---|
| 목적 | 영업이익 산식과 비용 입력 조합의 버전, 적용 기간, 승인 상태를 관리하는 엔티티 |
| 기본 식별자 | `formula_version_id` |
| 후보 속성 | `formula_name`, `formula_expression_ref`, `formula_status`, `effective_from`, `effective_to`, `approved_status`, `approved_by_employee_id`, `approved_at`, `created_by_employee_id`, `created_at`, `updated_at` |
| 상태 후보 | `draft`, `pending_approval`, `active`, `retired`, `rejected` |
| 입력 | 설정 메뉴, 비용 입력 권한 사용자, 결재 결과 |
| 출력 | 산식 버전 표시, 영업이익 스냅샷 참조, 비용 변경 리포트 |
| 인수조건 | 비용 입력 변경 후 영업이익 대시보드는 적용된 `formula_version_id`를 표시해야 하며, 승인 전 산식은 공식 대시보드에 적용하지 않는 후보 정책을 가져야 한다. |
| 의존성 | A3 설정 UI, A7 권한/결재/감사, PM 산식 적용 승인 |
| 담당 | A4 |
| KPI 영향 | 산식 버전별 영업이익 비교, 비용 변경 영향 추적 |

인당 생산성/마진 기여: 산식 버전을 명시해 비용 변경 전후 수익성 지표를 재현하고 재검산 시간을 줄인다.

### 4.9.2 `profit_cost_input`

| 항목 | 내용 |
|---|---|
| 목적 | `제원원가`, `판관비`, `일반관리비` 입력값과 적용 범위, 적용일을 관리하는 엔티티 |
| 기본 식별자 | `profit_cost_input_id` |
| 후보 속성 | `formula_version_id`, `cost_component`, `display_name`, `input_method`, `input_value`, `currency`, `ratio_basis`, `scope_type`, `scope_ref_id`, `effective_date`, `effective_from`, `effective_to`, `input_status`, `created_by_employee_id`, `created_at`, `updated_at` |
| 비용 항목 후보 | `jaewon_cost` 표시명 `제원원가`, `selling_admin_expense` 표시명 `판관비`, `general_admin_expense` 표시명 `일반관리비` |
| 입력 방식 후보 | `amount`, `ratio_to_sales` |
| 적용 범위 후보 | `company`, `product`, `customer`, `period` |
| 입력 | Master 또는 `ProfitCostInputManager` 후보 권한 사용자의 비용 입력 |
| 출력 | 산식 버전별 비용 금액, 영업이익 산식 입력값, 비용 변경 리포트 |
| 인수조건 | 비용 입력은 산식 버전, 비용 항목, 입력 방식, 입력값, 적용 범위, 적용일, 입력 상태를 가져야 한다. `제원원가`의 정확한 회계 의미는 제조원가/상품원가/기타 원가 중 PM 승인 전 확정하지 않는다. |
| 의존성 | A3 설정 UI, A7 권한, PM `제원원가` 의미 및 입력 권한 승인 |
| 담당 | A4 |
| KPI 영향 | 제원원가/판관비/일반관리비별 영업이익 영향 분해 |

인당 생산성/마진 기여: 비용 입력값을 항목과 적용 범위별로 구조화해 고객/상품별 이익 저하 원인 추적을 빠르게 한다.

### 4.9.3 `profit_cost_input_history`

| 항목 | 내용 |
|---|---|
| 목적 | 비용 입력 생성, 수정, 삭제의 변경 전후 값, 적용일, 적용 범위, 산식 버전, 변경 사유, 변경자를 추적하는 엔티티 |
| 기본 식별자 | `profit_cost_input_history_id` |
| 후보 속성 | `profit_cost_input_id`, `formula_version_id`, `change_type`, `before_value_ref`, `after_value_ref`, `before_scope_ref`, `after_scope_ref`, `effective_date`, `changed_by_employee_id`, `change_reason_ref`, `changed_at`, `approval_document_id`, `time_log_id`, `audit_log_ref` |
| 변경 유형 후보 | `created`, `updated`, `deleted`, `approved`, `rejected`, `retired` |
| 입력 | 비용 입력 이벤트, 결재 결과, 감사로그 |
| 출력 | 비용 입력 변경 이력, 감사/재무 검증 자료, 산식 버전 변경 근거 |
| 인수조건 | 비용 입력 생성/수정/삭제는 변경 전후 값, 적용일, 적용 범위, 산식 버전, 변경 사유, 변경자, 로그 참조를 가져야 한다. |
| 의존성 | A7 감사/권한, A9 로그 보존, A2 설정 API |
| 담당 | A4 |
| KPI 영향 | 비용 변경 빈도, 변경 영향 범위, 수익성 지표 신뢰도 |

인당 생산성/마진 기여: 비용 입력 변경 이력을 재현 가능하게 만들어 잘못된 비용 입력으로 인한 경영 판단 오류와 검산 시간을 줄인다.

### 4.10 `cs_case`

| 항목 | 내용 |
|---|---|
| 목적 | 고객사/공급사/임직원 관련 문의와 이슈 처리 상태를 추적하는 엔티티 |
| 기본 식별자 | `case_id` |
| 후보 속성 | `account_type`, `account_id`, `employee_account_id`, `case_type`, `priority`, `status`, `opened_at`, `closed_at`, `source_channel`, `work_item_id` |
| 상태 후보 | `open`, `assigned`, `waiting`, `resolved`, `closed`, `reopened` |
| 입력 | CS 툴, 메일, 콜센터, Operations Console |
| 출력 | CS 처리량, 이슈율, 이탈 위험 후보 |
| 인수조건 | CS 건은 처리 상태와 계정 참조를 가져야 하며, 처리시간 산출이 가능해야 한다. |
| 의존성 | A2/A3 Operations Console, A7 개인정보 승인 |
| KPI 영향 | 고객사/공급사별 운영 부하와 이탈 위험 산출 |

인당 생산성/마진 기여: CS를 계정별 비용 신호로 전환해 고비용 고객과 자동화 후보 업무를 식별한다.

### 4.11 `work_item`

| 항목 | 내용 |
|---|---|
| 목적 | 운영 업무의 접수, 배정, 처리, 보류, 완료, 반려 상태를 표준화하는 엔티티 |
| 기본 식별자 | `work_item_id` |
| 후보 속성 | `work_type`, `account_type`, `account_id`, `contract_id`, `case_id`, `status`, `assignee_id`, `priority`, `sla_due_at`, `started_at`, `completed_at`, `created_at`, `updated_at` |
| 상태 후보 | `received`, `assigned`, `in_progress`, `waiting`, `completed`, `rejected`, `cancelled` |
| 입력 | Operations Console |
| 출력 | 운영 처리량, 평균 처리시간, SLA 준수율, 배부 운영 원가 |
| 인수조건 | 모든 P0 운영 업무는 상태, 담당자, 시작/완료 시각 후보를 가져야 한다. |
| 의존성 | A2/A3/A8 Operations Console |
| KPI 영향 | 인당 처리 건수, 평균 처리시간, 운영 원가 배부 |

인당 생산성/마진 기여: 업무 상태와 시간을 표준화해 담당자 1인당 처리량과 고투입 업무를 측정한다.

### 4.12 `activity_log`

| 항목 | 내용 |
|---|---|
| 목적 | 계정, 계약, 업무와 관련된 영업/AM/운영 접촉 및 변경 이력을 남기는 엔티티 |
| 기본 식별자 | `activity_id` |
| 후보 속성 | `actor_id`, `activity_type`, `account_type`, `account_id`, `contract_id`, `work_item_id`, `occurred_at`, `source_system`, `summary_ref` |
| 상태 후보 | 해당 없음 |
| 입력 | CRM, Operations Console, 연동 이벤트 |
| 출력 | CRM 360 타임라인, 갱신 위험, 감사 후보 |
| 인수조건 | 활동 이력은 행위자, 대상, 시각, 유형을 가져야 한다. 원문 내용 저장은 개인정보 승인 후 결정한다. |
| 의존성 | A1/A2 CRM Core, A7 Audit Baseline |
| KPI 영향 | AM 활동량, 미접촉 고객, 이탈 위험 후보 |

인당 생산성/마진 기여: 활동 이력을 표준화해 담당자 변경 시 히스토리 탐색 시간을 줄이고 갱신 리스크 대응을 빠르게 한다.

### 4.13 유통 프로세스 추가 엔티티

| 엔티티 | 목적 | 기본 식별자 | 입력 | 출력 | 인수조건 | 의존성 | 담당 | KPI 영향 |
|---|---|---|---|---|---|---|---|---|
| `product` | 판매상품 기준 정보와 공급사 연결 | `product_id` | 상품 관리, 공급사 상품 원장 | 상품별 매출/이익 지표, 견적/주문 품목 | 판매 가능한 상품은 `product_id`, `supplier_account_id`, `status`를 가져야 한다. | A2, A6 | A4 | 상품별 이익률, 배송/반품 원인 분석 |
| `sales_price` | 상품 판매가격, 할인 기준, 적용기간 관리 | `sales_price_id` | 가격 관리, 견적 시스템 | 견적/주문 가격 참조 | 가격은 `product_id`, 적용기간, 통화, 기준가 후보를 가져야 한다. | A2, A3 | A4 | 할인 원인, 견적 전환율, 영업이익 훼손 원인 |
| `sales_activity` | 방문, 통화, 미팅, 제안 활동 기록 | `sales_activity_id` | 고객, 담당자, 활동내용, 다음 액션 | 활동 타임로그, 파이프라인 후보 | 활동은 고객, 담당자, 활동유형, 발생시각, 다음 액션 후보를 가져야 한다. 원문 활동내용은 개인정보 승인 후 확정한다. | A2, A3, A7 | A4 | 담당자 활동량, 미접촉 고객, 파이프라인 생성률 |
| `sales_pipeline` | 영업기회 단계, 예상금액, 확률 관리 | `pipeline_id` | 고객, 상품, 수량, 예상금액, 확률 | 파이프라인 상태, 견적 후보 | 파이프라인은 고객, 단계, 예상금액, 확률, 예상마감일을 가져야 한다. | A2, A3 | A4 | 예상매출, 단계별 전환율, 담당자별 생산성 |
| `quote` | 견적서, 버전, 승인 상태 관리 | `quote_id` | 상품, 판매가격, 할인, 수량, 유효기간 | 견적서, 승인 문건, 계약 후보 | 견적은 버전, 상태, 유효기간, 총액, 승인 상태를 가져야 한다. | A2, A3, A7 | A4 | 견적 전환율, 승인 소요시간, 할인 영향 |
| `quote_line` | 견적 품목별 수량, 가격, 할인 관리 | `quote_line_id` | 상품, 판매가격, 할인, 수량 | 견적 총액, 할인 원인 지표 | 견적 품목은 상품, 수량, 단가, 할인금액 후보를 가져야 한다. | A2, A3 | A4 | 상품별 견적금액, 할인율 |
| `sales_order` | 계약 기반 주문 등록 | `sales_order_id` | 고객, 계약, 상품, 수량, 납기, 배송지 참조 | 주문 레코드, 출고 요청 | 주문은 고객, 계약, 상태, 요청납기, 총액을 가져야 한다. 배송지 원문은 승인 전 확정하지 않는다. | A2, A3, A7 | A4 | 주문 전환율, 매출인식 후보, 납기 리스크 |
| `sales_order_line` | 주문 상품별 수량, 단가, 금액 관리 | `sales_order_line_id` | 주문, 상품, 판매가격, 수량 | 출고 대상 품목, 매출 품목 | 주문 품목은 상품, 수량, 단가, 금액을 가져야 한다. | A2 | A4 | 상품별 매출, 출고 리드타임 |
| `outbound_shipment` | 출고 지시, 출고 완료, 창고/출고처 상태 관리 | `outbound_shipment_id` | 주문, 창고/출고처, 수량 | 출고 상태, 배송 요청 | 출고는 주문, 상태, 출고시각, 출고수량 후보를 가져야 한다. | A2, A6 | A4 | 출고 리드타임, 미출고 예외 |
| `delivery_tracking` | 배송 상태, 현재 위치 후보, 예외 추적 | `delivery_tracking_id` | 송장번호, 택배사, 출고정보 | 배송 상태, 예외 알림 | 배송은 출고 참조, 택배사, 송장 참조, 상태, 마지막 확인시각을 가져야 한다. 송장 원문과 실시간 API는 승인 필요다. | A3, A6 | A4 | 배송 지연율, 배송 예외율, 문의 감소 |
| `tax_invoice` | 세금계산서 발행 상태와 이력 관리 | `tax_invoice_id` | 주문, 공급가, 세액, 거래처 참조 | 세금계산서, 발행 로그 | 세금계산서는 주문, 공급가, 세액, 발행상태, 발행시각 후보를 가져야 한다. | A2, A7 | A4 | 청구 지연, 발행 오류, 외감 근거 |
| `transaction_statement` | 거래명세표 발행 상태와 품목 관리 | `transaction_statement_id` | 주문, 품목, 수량, 금액 | 거래명세표, 발행 로그 | 거래명세표는 주문, 품목 요약, 총액, 발행상태를 가져야 한다. | A2, A7 | A4 | 발행 누락률, 청구 대응 시간 |
| `revenue_recognition` | 출고/검수/청구 기준 매출 확정 후보 | `revenue_recognition_id` | 주문, 출고, 청구, 회계 기준 | 매출 레코드, 수익성 지표 | 매출인식은 주문, 인식기준, 인식금액, 인식일, 상태를 가져야 한다. 공식 회계 기준은 승인 필요다. | A4, A7, 재무 | A4 | 실시간 매출, 영업이익 산식의 기준 금액 |
| `operating_profit_snapshot` | 산식 버전 기반 영업이익 후보 집계 | `operating_profit_snapshot_id` | 매출금액, 제원원가, 판관비, 일반관리비, 산식 버전 | 영업이익, 이익률, 원인 지표 | 스냅샷은 매출금액, 적용된 `formula_version_id`, 제원원가, 판관비, 일반관리비, 영업이익을 구분 저장해야 한다. | A3, A4, PM | A4 | 슈퍼바이저 이익률 모니터링, 원인 지표 분석 |
| `time_log` | 생성, 수정, 삭제, 승인, 상태 변경, 발행, 조회 이력 | `time_log_id` | 전 모듈 이벤트, 로그인 사용자 참조 | 타임라인, 감사 후보, 병목 지표 | 로그는 행위자, 대상 엔티티, 대상 ID, 이벤트 유형, 발생시각을 가져야 한다. | A2, A7, A9 | A4 | 결재 지연, 처리시간, 내부통제 추적 |

인당 생산성/마진 기여: 영업부터 매출인식까지 같은 데이터 흐름으로 연결해 재입력, 누락, 수기 검산을 줄이고 이익 저하 원인을 단계별로 찾는다.

## 5. 관계 정의

| 관계 ID | 출발 | 도착 | 관계수 | 설명 |
|---|---|---|---|---|
| `R-001` | `customer_account` | `employee_customer_assignment` | 1:N | 한 거래처는 여러 임직원 담당 배정을 가질 수 있다. |
| `R-001A` | `employee_account` | `employee_customer_assignment` | 1:N | 한 임직원은 여러 거래처 담당 배정을 가질 수 있다. |
| `R-001B` | `employee_customer_assignment` | `employee_customer_assignment_history` | 1:N | 담당 배정은 여러 변경 이력을 가진다. |
| `R-001C` | `employee_customer_assignment_history` | `time_log` | N:1 | 담당 배정 변경 이력은 타임로그 이벤트와 연결된다. |
| `R-002` | `customer_account` | `contract` | 1:N | 한 고객사는 여러 계약을 가질 수 있다. |
| `R-003` | `supplier_account` | `contract` | 1:N | 한 공급사는 여러 입점/정산 계약을 가질 수 있다. |
| `R-004` | `employee_account` | `point_account` | 1:N | 임직원 참조 계정은 복수 포인트 계정 후보를 가질 수 있다. |
| `R-005` | `point_account` | `point_transaction` | 1:N | 포인트 계정은 여러 거래를 가진다. |
| `R-006` | `contract` | `revenue_record` | 1:N | 계약은 기간별 매출 후보를 가진다. |
| `R-007` | `customer_account` 또는 `supplier_account` | `settlement_record` | 1:N | 정산은 계정 단위로 집계된다. |
| `R-008` | `customer_account` 또는 `supplier_account` | `work_item` | 1:N | 운영 업무는 처리 대상 계정에 연결된다. |
| `R-009` | `cs_case` | `work_item` | 0:N | CS 건은 하나 이상의 운영 업무를 생성할 수 있다. |
| `R-010` | `customer_account` 또는 `supplier_account` | `activity_log` | 1:N | 활동 이력은 대상 계정의 타임라인을 구성한다. |
| `R-011` | `work_item` | `cost_record` | 0:N | 업무 처리시간은 운영 배부 원가 후보로 전환될 수 있다. |
| `R-012` | `supplier_account` | `product` | 1:N | 공급사는 여러 판매상품을 제공할 수 있다. |
| `R-013` | `product` | `sales_price` | 1:N | 상품은 적용기간별 판매가격을 가진다. |
| `R-014` | `customer_account` | `sales_activity` | 1:N | 고객사는 여러 영업활동을 가진다. |
| `R-015` | `sales_activity` | `sales_pipeline` | 0:N | 영업활동은 파이프라인 후보를 생성할 수 있다. |
| `R-016` | `sales_pipeline` | `quote` | 0:N | 파이프라인은 여러 견적 버전을 가질 수 있다. |
| `R-017` | `quote` | `quote_line` | 1:N | 견적은 하나 이상의 상품/가격 품목을 가진다. |
| `R-018` | `quote` | `contract` | 0:1 | 승인된 견적은 계약 후보가 될 수 있다. |
| `R-019` | `contract` | `sales_order` | 0:N | 계약은 여러 주문을 생성할 수 있다. |
| `R-020` | `sales_order` | `sales_order_line` | 1:N | 주문은 하나 이상의 상품 품목을 가진다. |
| `R-021` | `sales_order` | `outbound_shipment` | 0:N | 주문은 하나 이상의 출고 지시를 가질 수 있다. |
| `R-022` | `outbound_shipment` | `delivery_tracking` | 0:N | 출고 건은 배송 추적 정보를 가질 수 있다. |
| `R-023` | `sales_order` | `tax_invoice` | 0:N | 주문은 세금계산서 발행 이력을 가질 수 있다. |
| `R-024` | `sales_order` | `transaction_statement` | 0:N | 주문은 거래명세표 발행 이력을 가질 수 있다. |
| `R-025` | `sales_order` | `revenue_recognition` | 0:N | 주문은 회계 기준에 따라 매출인식 레코드를 가질 수 있다. |
| `R-026` | `revenue_recognition` | `operating_profit_snapshot` | N:1 | 매출인식 금액은 기간별 영업이익 스냅샷에 집계된다. |
| `R-026A` | `profit_cost_formula_version` | `profit_cost_input` | 1:N | 산식 버전은 여러 비용 입력값을 가진다. |
| `R-026B` | `profit_cost_input` | `profit_cost_input_history` | 1:N | 비용 입력은 여러 변경 이력을 가진다. |
| `R-026C` | `profit_cost_formula_version` | `operating_profit_snapshot` | 1:N | 영업이익 스냅샷은 적용된 산식 버전을 참조한다. |
| `R-026D` | `profit_cost_input_history` | `time_log` | N:1 | 비용 입력 변경 이력은 타임로그 이벤트와 연결된다. |
| `R-027` | 모든 핵심 엔티티 | `time_log` | 1:N | 핵심 엔티티의 생성, 수정, 승인, 상태 변경, 발행, 조회는 타임로그를 남긴다. |

인당 생산성/마진 기여: 관계를 계정과 계약 중심으로 고정해 대시보드 산출 시 수기 조인과 예외 매핑을 줄인다.

## 6. KPI 지표 사전

| Metric ID | 이름 | 산식 초안 | 집계 단위 | 필수 차원 | 원천 후보 | 상태 |
|---|---|---|---|---|---|---|
| `gross_revenue` | 총매출 후보 | `sum(revenue_record.amount where status in confirmed, estimated)` | 월, 계정, 계약 | `account_type`, `account_id`, `contract_id`, `period` | `revenue_record` | 후보 |
| `sales_amount` | 매출금액 후보 | `sum(revenue_recognition.recognized_amount)` | 월, 고객, 상품, 담당자, 파이프라인 | `customer_account_id`, `product_id`, `employee_account_id`, `pipeline_id`, `period` | `revenue_recognition`, `sales_order_line` | 회계 기준 승인 필요 |
| `fixed_cost_amount` | 고정 원가 | `salesAmount * 0.5` | 월, 고객, 상품, 담당자, 파이프라인 | `period`, `customer_account_id`, `product_id`, `employee_account_id` | `revenue_recognition`, 고정 산식 | PM 승인 필요 |
| `fixed_sgna_amount` | 고정 판관비/일반관리비 | `salesAmount * 0.5` | 월, 고객, 상품, 담당자, 파이프라인 | `period`, `customer_account_id`, `product_id`, `employee_account_id` | `revenue_recognition`, 고정 산식 | PM 승인 필요 |
| `fixed_operating_profit_amount` | 고정 영업이익 | `salesAmount - fixed_cost_amount - fixed_sgna_amount` | 월, 고객, 상품, 담당자, 파이프라인 | `period`, `customer_account_id`, `product_id`, `employee_account_id`, `pipeline_id` | `operating_profit_snapshot` | PM 승인 필요 |
| `fixed_operating_profit_rate` | 고정 영업이익률 | `fixed_operating_profit_amount / nullif(salesAmount, 0)` | 월, 고객, 상품, 담당자, 파이프라인 | `period`, `customer_account_id`, `product_id`, `employee_account_id`, `pipeline_id` | `operating_profit_snapshot` | PM 승인 필요 |
| `jaewon_cost_amount` | 제원원가 후보 | `amount_or_ratio(profit_cost_input where cost_component = jaewon_cost)` | 월, 전사, 고객, 상품, 산식 버전 | `formula_version_id`, `scope_type`, `scope_ref_id`, `period` | `profit_cost_input` | 의미 PM 승인 필요 |
| `selling_admin_expense_amount` | 판관비 후보 | `amount_or_ratio(profit_cost_input where cost_component = selling_admin_expense)` | 월, 전사, 고객, 상품, 산식 버전 | `formula_version_id`, `scope_type`, `scope_ref_id`, `period` | `profit_cost_input` | PM 승인 필요 |
| `general_admin_expense_amount` | 일반관리비 후보 | `amount_or_ratio(profit_cost_input where cost_component = general_admin_expense)` | 월, 전사, 고객, 상품, 산식 버전 | `formula_version_id`, `scope_type`, `scope_ref_id`, `period` | `profit_cost_input` | PM 승인 필요 |
| `versioned_operating_profit_amount` | 산식 버전 영업이익 후보 | `sales_amount - jaewon_cost_amount - selling_admin_expense_amount - general_admin_expense_amount` | 월, 전사, 고객, 상품, 담당자, 산식 버전 | `formula_version_id`, `customer_account_id`, `product_id`, `employee_account_id`, `period` | `revenue_recognition`, `profit_cost_input` | PM 승인 필요 |
| `profit_cost_change_count` | 비용 입력 변경 건수 | `count(profit_cost_input_history_id)` | 월, 비용항목, 변경자, 적용범위 | `cost_component`, `changed_by_employee_id`, `scope_type`, `period` | `profit_cost_input_history` | 후보 |
| `direct_cost` | 직접원가 후보 | `sum(cost_record.amount where cost_type = direct)` | 월, 계정 | `account_type`, `account_id`, `period` | `cost_record`, 정산/결제 | 정책 승인 필요 |
| `allocated_ops_cost` | 운영배부원가 후보 | `sum(work_minutes * approved_cost_rate)` | 월, 계정, 업무유형 | `account_type`, `account_id`, `work_type`, `period` | `work_item`, 비용 배부 기준 | 정책 승인 필요 |
| `gross_margin_amount` | 마진액 후보 | `gross_revenue - direct_cost - allocated_ops_cost` | 월, 계정 | `account_type`, `account_id`, `period` | 매출/원가/업무 | 후보 |
| `gross_margin_rate` | 마진율 후보 | `gross_margin_amount / nullif(gross_revenue, 0)` | 월, 계정 | `account_type`, `account_id`, `period` | 위 산식 | 후보 |
| `work_item_count` | 운영 처리건수 | `count(work_item_id)` | 일/월, 담당자, 업무유형, 계정 | `assignee_id`, `work_type`, `account_id` | `work_item` | 후보 |
| `avg_handling_time_minutes` | 평균 처리시간 | `avg(completed_at - started_at)` | 업무유형, 계정, 담당자 | `work_type`, `account_id`, `assignee_id` | `work_item` | 후보 |
| `sla_breach_rate` | SLA 위반율 | `count(completed_at > sla_due_at) / count(work_item_id)` | 업무유형, 계정 | `work_type`, `account_id` | `work_item` | 후보 |
| `cs_case_count` | CS 건수 | `count(case_id)` | 월, 계정, 유형 | `account_id`, `case_type`, `period` | `cs_case` | 후보 |
| `cs_case_rate` | CS 발생률 | `cs_case_count / active_employee_count` | 월, 고객사 | `customer_account_id`, `period` | `cs_case`, `employee_account` | 분모 승인 필요 |
| `settlement_exception_rate` | 정산 예외율 | `count(status in failed, review_required, adjusted) / count(settlement_id)` | 월, 공급사 | `supplier_account_id`, `period` | `settlement_record` | 후보 |
| `renewal_risk_score` | 갱신 위험 점수 후보 | `weighted(margin, cs_rate, activity_gap, contract_days_left)` | 고객사, 계약 | `customer_account_id`, `contract_id` | 계약, 마진, CS, 활동 | 후보 |
| `ltv_candidate` | LTV 후보 | `avg_margin_per_period * expected_retention_period` | 고객사, 세그먼트 | `customer_account_id`, `segment` | 마진, 갱신 이력 | 후보 |
| `activity_to_pipeline_rate` | 파이프라인 생성률 | `created_pipeline_count / sales_activity_count` | 월, 담당자, 고객 | `employee_account_id`, `customer_account_id`, `period` | `sales_activity`, `sales_pipeline` | 후보 |
| `pipeline_weighted_amount` | 가중 파이프라인 금액 | `sum(expected_amount * probability)` | 월, 담당자, 고객, 단계 | `employee_account_id`, `customer_account_id`, `stage`, `period` | `sales_pipeline` | 후보 |
| `quote_conversion_rate` | 견적 전환율 | `contracted_quote_count / issued_quote_count` | 월, 담당자, 고객, 상품 | `employee_account_id`, `customer_account_id`, `product_id`, `period` | `quote`, `contract` | 후보 |
| `quote_discount_rate` | 견적 할인율 | `sum(discount_amount) / sum(list_price * quantity)` | 월, 고객, 상품, 담당자 | `customer_account_id`, `product_id`, `employee_account_id`, `period` | `quote_line`, `sales_price` | 후보 |
| `assigned_customer_count` | 담당 거래처 수 | `count(distinct customer_account_id where assignment_status = active)` | 월, 임직원, 담당 역할 | `employee_account_id`, `assignment_role`, `period` | `employee_customer_assignment` | 후보 |
| `customer_assignee_count` | 거래처별 담당자 수 | `count(distinct employee_account_id where assignment_status = active)` | 월, 거래처, 담당 역할 | `customer_account_id`, `assignment_role`, `period` | `employee_customer_assignment` | 후보 |
| `primary_assignee_missing_count` | 대표 담당자 누락 거래처 수 | `count(customer_account_id where active primary assignment is null)` | 월, 거래처, 조직 | `customer_account_id`, `period` | `employee_customer_assignment` | 대표 담당자 정책 승인 필요 |
| `assignment_change_count` | 담당 배정 변경 건수 | `count(assignment_history_id)` | 월, 거래처, 임직원, 변경유형 | `customer_account_id`, `employee_account_id`, `change_type`, `period` | `employee_customer_assignment_history`, `time_log` | 후보 |
| `order_fulfillment_lead_time` | 주문-출고 리드타임 | `avg(outbound_shipment.shipped_at - sales_order.created_at)` | 월, 고객, 상품, 주문 | `customer_account_id`, `product_id`, `period` | `sales_order`, `outbound_shipment` | 후보 |
| `delivery_exception_rate` | 배송 예외율 | `delivery_exception_count / delivery_count` | 월, 고객, 택배사, 상품 | `customer_account_id`, `carrier_code`, `product_id`, `period` | `delivery_tracking` | 외부 연동 승인 필요 |
| `invoice_issue_delay_days` | 발행 지연일 | `avg(issued_at - revenue_recognition_trigger_at)` | 월, 고객, 주문 | `customer_account_id`, `sales_order_id`, `period` | `tax_invoice`, `transaction_statement`, `revenue_recognition` | 후보 |
| `approval_cycle_time_minutes` | 결재 소요시간 | `avg(approval_completed_at - approval_requested_at)` | 월, 문건유형, 담당자 | `document_type`, `employee_account_id`, `period` | 결재, `time_log` | 후보 |
| `time_log_event_count` | 타임로그 이벤트 수 | `count(time_log_id)` | 월, 엔티티, 이벤트유형, 담당자 | `target_entity`, `event_type`, `actor_id`, `period` | `time_log` | 후보 |
| `profit_loss_driver_count` | 이익 저하 원인 건수 | `count(driver_event where driver_type in discount, return, delivery_cost, handling_time, approval_delay, settlement_delay, exception)` | 월, 고객, 상품, 담당자 | `driver_type`, `customer_account_id`, `product_id`, `employee_account_id`, `period` | 견적, 배송, 타임로그, 정산, CS | 후보 |

인당 생산성/마진 기여: 지표별 집계 단위와 원천을 명시해 잘못된 집계로 인한 의사결정 오류와 검산 시간을 줄인다.

### 6.1 고정 영업이익 산식

| 산식 항목 | 정의 | 의미 | 한계 |
|---|---|---|---|
| `salesAmount` | `sum(revenue_recognition.recognized_amount)` | 매출인식 기준 실시간 매출 후보 | 공식 회계 매출은 재무/PM 승인 전 확정하지 않는다. |
| `costAmount` | `salesAmount * 0.5` | 원가 50% 고정 기준선 | 상품, 공급사, 물류, 반품, 정산 조건별 실제 원가를 반영하지 못한다. |
| `sgnaAmount` | `salesAmount * 0.5` | 판매관리비 및 일반관리비 50% 고정 기준선 | 담당자 처리시간, 결재 지연, CS, 예외 처리, 조직별 비용 차이를 반영하지 못한다. |
| `operatingProfit` | `salesAmount - costAmount - sgnaAmount` | MVP 영업이익 후보 | 원가 50%와 판관비/일반관리비 50%를 동시에 적용하면 기본 영업이익은 0이다. |
| `operatingProfitRate` | `operatingProfit / nullif(salesAmount, 0)` | MVP 영업이익률 후보 | 매출이 0이면 산출할 수 없고 실제 손익률로 오해하면 안 된다. |

고정 산식은 슈퍼바이저가 고객별/상품별/담당자별/파이프라인별 비교 기준선을 즉시 확인하기 위한 MVP 운영 지표다. 실제 영업이익 판단에는 할인, 반품, 배송비, 처리시간, 결재 지연, 정산 지연, 예외 처리 건수, 상품별 원가와 회계 인식 기준을 추가해야 한다.

인당 생산성/마진 기여: 고정 산식의 한계를 명시해 잘못된 손익 해석을 막고 개선 가능한 원인 지표로 관리 대상을 좁힌다.

### 6.2 비용 입력 기반 산식 버전

| 항목 | 후보 값 | 의미 | 승인 필요 |
|---|---|---|---|
| 비용 항목 | `jaewon_cost`, `selling_admin_expense`, `general_admin_expense` | 화면 표시명은 `제원원가`, `판관비`, `일반관리비`로 둔다. | `제원원가`가 제조원가, 상품원가, 기타 원가 중 무엇인지 PM 승인 필요 |
| 입력 방식 | `amount`, `ratio_to_sales` | 금액 직접 입력 또는 매출 대비 비율 입력 | 항목별 허용 방식 PM/재무 승인 필요 |
| 적용 범위 | `company`, `product`, `customer`, `period` | 전사, 상품, 고객, 기간별 비용 입력 적용 | 범위 우선순위와 중복 적용 정책 승인 필요 |
| 적용일 | `effective_date`, `effective_from`, `effective_to` | 비용 입력 또는 산식 버전의 적용 기준일 | 소급 적용 허용 여부 승인 필요 |
| 산식 버전 | `formula_version_id`, `formula_status`, `approved_status` | 영업이익 산식과 비용 입력 조합의 버전 | 승인 전 대시보드 적용 여부 승인 필요 |
| 변경 이력 | `profit_cost_input_history`, `time_log`, `audit_log_ref` | 변경 전후 값, 변경자, 변경 사유, 적용 범위, 적용일 저장 | 로그 보존기간과 감사 접근권한 승인 필요 |

비용 입력 기반 산식은 고정 50% 산식을 대체하거나 보완할 수 있는 후보 모델이다. 공식 손익 산식으로 확정하기 전까지 대시보드는 적용된 산식 버전과 후보 상태를 함께 표시해야 한다.

인당 생산성/마진 기여: 비용 입력값과 산식 버전을 분리해 잘못된 비용 입력이 전사 영업이익을 왜곡하는 일을 줄이고 변경 영향 추적 시간을 낮춘다.

## 7. 데이터 품질 규칙

| Rule ID | 규칙 | 검증 예 | 실패 처리 후보 |
|---|---|---|---|
| `DQ-001` | 계정 기본 식별자는 중복될 수 없다. | `count(distinct customer_account_id) = count(*)` | 중복 후보를 `data_quality_report`에 등록 |
| `DQ-002` | `contract.account_id`는 존재하는 고객사 또는 공급사를 참조해야 한다. | orphan contract 검출 | 계약 매핑 보류 |
| `DQ-003` | `work_item.completed_at`은 `started_at`보다 빠를 수 없다. | 음수 처리시간 검출 | 처리시간 KPI 제외 |
| `DQ-004` | `revenue_record.amount`와 `cost_record.amount`는 통화와 기간을 가져야 한다. | `currency is null` 또는 `period is null` | 마진 KPI 제외 |
| `DQ-005` | `settlement_record.status`는 허용 상태 코드만 사용해야 한다. | 미등록 상태 코드 검출 | 정산 예외 후보 등록 |
| `DQ-006` | 개인정보 승인 전 원문 개인정보 필드는 CRM 확정 모델에 포함하지 않는다. | 승인 없는 `resident_registration_number` 등 | 모델 반려 및 PM 승인 요청 |
| `DQ-007` | 지표 산출 레코드는 가능한 경우 `source_system`과 `source_record_id`를 가진다. | 원천 추적 불가 레코드 검출 | 신뢰도 낮음 표시 |
| `DQ-008` | `quote`, `contract`, `sales_order`, `revenue_recognition`의 참조 흐름은 가능한 경우 끊기지 않아야 한다. | 매출인식은 있으나 주문/계약 참조 없음 | 영업-매출인식 매핑 보류 |
| `DQ-009` | `sales_price`는 적용기간과 상품 참조를 가져야 한다. | 가격은 있으나 `product_id` 또는 적용기간 없음 | 견적/주문 가격 KPI 제외 |
| `DQ-010` | `time_log`는 핵심 이벤트의 행위자, 대상, 이벤트유형, 발생시각을 가져야 한다. | 발행 상태 변경은 있으나 누가 변경했는지 없음 | 감사 후보 결함 등록 |
| `DQ-011` | `operating_profit_snapshot`은 고정 산식의 적용 버전과 산출 시각을 가져야 한다. | 영업이익 값은 있으나 50% 기준 적용 여부 불명확 | 슈퍼바이저 대시보드 제외 |
| `DQ-012` | 활성 `employee_customer_assignment`는 존재하는 임직원과 거래처를 참조해야 한다. | 삭제/퇴사 임직원이 활성 담당자로 남아 있음 | 담당 배정 품질 결함 등록 |
| `DQ-013` | `is_primary = true`인 활성 대표 담당자는 거래처별 정책 기준을 만족해야 한다. | 한 거래처에 활성 대표 담당자가 2명 이상 존재 | PM 승인 전 경고, 승인 후 제약 적용 |
| `DQ-014` | 담당 배정 생성, 역할 변경, 대표 담당 변경, 종료는 `employee_customer_assignment_history`와 `time_log`를 가져야 한다. | 담당 역할은 바뀌었으나 변경자/변경 시각 없음 | 감사 후보 결함 등록 |
| `DQ-015` | 담당 배정 기간은 `effective_from <= effective_to` 조건을 만족해야 한다. | 종료일이 시작일보다 빠름 | 배정 이력 KPI 제외 |
| `DQ-016` | `profit_cost_input`은 비용 항목, 입력 방식, 입력값, 적용 범위, 적용일, 산식 버전을 가져야 한다. | 판관비 값은 있으나 적용 범위 또는 산식 버전 없음 | 영업이익 KPI 제외 |
| `DQ-017` | `profit_cost_input_history`는 변경 전후 값, 변경자, 변경 사유, 변경 시각을 가져야 한다. | 제원원가 값은 바뀌었으나 변경 사유 없음 | 감사 후보 결함 등록 |
| `DQ-018` | `operating_profit_snapshot`은 적용된 `formula_version_id`를 가져야 한다. | 스냅샷은 있으나 어떤 산식 버전인지 불명확 | 대시보드 후보 신뢰도 낮음 표시 |
| `DQ-019` | `제원원가`는 표시명으로 유지하되 회계 의미 매핑은 승인 전 확정 필드로 사용하지 않는다. | `제원원가 = 제조원가`로 확정 표기 | PM 승인 요청 |

인당 생산성/마진 기여: 품질 실패를 지표 제외 또는 보류 상태로 관리해 대시보드 신뢰 하락과 운영 재확인을 줄인다.

## 8. 승인 필요 필드 등록부

다음 필드는 확정 필드가 아니며, PM 김권일 및 보안/개인정보 담당 승인 전 모델에 포함하지 않는다.

| 등록 ID | 후보 영역 | 후보 필드 예 | 승인 필요 사유 | 승인 전 대체 |
|---|---|---|---|---|
| `APR-PII-001` | 임직원 식별 | `employee_name`, `personal_email`, `mobile_number`, `birth_date` | 개인정보 처리범위 미확정 | `employee_account_id`, 집계 수치 |
| `APR-SENS-001` | 민감/건강/가족 정보 | `health_info`, `family_member_info`, `medical_claim_detail` | 민감정보 가능성 | CRM Core에서 제외 |
| `APR-PII-002` | 고객사 담당자 | `contact_name`, `contact_email`, `contact_mobile` | 개인정보 및 영업정보 | `account_owner_id`, 역할 참조 |
| `APR-RBAC-001` | 담당 배정 변경 권한 | 담당자 배정 생성/변경/종료 권한 | 담당 배정은 고객 접근권한과 책임소재에 영향을 준다. | 권한 없는 사용자의 변경 금지 후보, 관리자 이상 제한은 PM/A7 승인 후 확정 |
| `APR-ASSIGN-001` | 대표 담당자 1명 제한 | `is_primary` 유일성 제약 | 조직 정책에 따라 단일 대표 또는 복수 대표가 달라질 수 있다. | 후보 필드로만 관리하고 물리 제약은 승인 후 적용 |
| `APR-ASSIGN-002` | 담당 역할 코드 | `primary_owner`, `secondary_owner`, `approval_owner`, `observer` | 역할 명칭과 권한 영향 확정 필요 | 후보 코드로만 정의하고 권한 매핑은 PM/A7 승인 후 확정 |
| `APR-FIN-001` | 공급사 금융정보 | `bank_account_number`, `account_holder_name` | 금융정보 접근통제 필요 | 정산 상태/금액만 사용 |
| `APR-HR-001` | 인건비 단가 | `employee_cost_rate`, `salary_band` | 인사/재무 정책 정보 | 승인된 배부율 또는 익명화 비용률 |
| `APR-FIN-002` | 고정 영업이익 산식 | `costRate = 0.5`, `sgnaRate = 0.5` | PM 제시 MVP 기준이나 공식 회계 산식은 아님 | 후보 지표로만 표시 |
| `APR-FIN-003` | `제원원가` 의미 | `jaewon_cost` 회계 매핑 | PM 표현은 유지하되 제조원가/상품원가/기타 원가 중 의미 미확정 | 표시명과 후보 코드만 사용 |
| `APR-FIN-004` | 비용 입력 권한 | `Master`, `ProfitCostInputManager` | 비용 입력은 영업이익 산식과 경영 판단에 직접 영향 | 권한 후보만 정의하고 범위는 PM/A7 승인 후 확정 |
| `APR-FIN-005` | 산식 버전 적용 정책 | `formula_version_id`, `effective_date`, `scope_type` | 적용일, 적용 범위, 소급 적용, 결재 필요 여부 확정 필요 | 승인 전 후보 산식으로 표시 |
| `APR-LOGI-001` | 배송 실시간 연동 | `tracking_number`, `carrier_api_response`, `current_location` | 택배사 API, 비용, 계약, 위탁 범위 승인 필요 | 수동 송장 참조와 상태 후보만 사용 |
| `APR-TAX-001` | 세금계산서/거래명세표 연동 | 외부 발행 ID, 수신처, 전송 결과 | 인증, 위탁, 회계 통제 확인 필요 | 발행 상태와 금액 참조만 사용 |
| `APR-ADDR-001` | 배송지 정보 | `recipient_name`, `recipient_mobile`, `delivery_address` | 개인정보 및 배송 위탁 범위 승인 필요 | 배송지 참조 ID 또는 승인된 최소 필드 |
| `APR-EXT-001` | 외부 데이터 결합 | 외부 신용/평판/로그 데이터 | 목적 외 이용 및 위탁 검토 필요 | 내부 운영 데이터만 사용 |

인당 생산성/마진 기여: 승인 전 필드를 분리해 규제 리스크를 낮추고 데이터 모델 재작업을 예방한다.

## 9. 인수조건

1. 백엔드는 `customer_account`, `employee_account`, `employee_customer_assignment`, `employee_customer_assignment_history`, `product`, `sales_price`, `sales_activity`, `sales_pipeline`, `quote`, `contract`, `sales_order`, `outbound_shipment`, `delivery_tracking`, `tax_invoice`, `transaction_statement`, `revenue_recognition`, `profit_cost_formula_version`, `profit_cost_input`, `profit_cost_input_history`, `operating_profit_snapshot`, `time_log`의 기본 식별자와 주요 관계를 ERD로 전환할 수 있어야 한다.
2. `Profitability Dashboard`는 KPI 지표 사전의 `Metric ID`, 산식, 집계 단위, 차원, 원천 후보를 기준으로 API 또는 집계 테이블 후보를 설계할 수 있어야 한다.
3. 개인정보/민감정보 후보는 `approval_required_register`에만 존재해야 하며, 확정 모델로 오해될 수 없게 표시되어야 한다.
4. 각 엔티티는 목적, 입력, 출력, 인수조건, 의존성, 담당 또는 관련 담당, KPI 영향을 포함해야 한다.
5. `employee_customer_assignment`는 임직원-거래처 다대다 관계, 대표 담당자, 담당 역할, 배정 기간, 변경 이력, 타임로그 관계를 표현해야 한다.
6. 제원원가, 판관비, 일반관리비 입력값, 산식 버전, 적용 범위, 적용일, 변경 이력 모델이 표현되어야 한다.
7. `제원원가` 용어는 PM 표현 그대로 두고 제조원가/상품원가/기타 원가 중 정확한 의미는 PM 승인 필요로 표시되어야 한다.
8. 원가 50%, 판관비/일반관리비 50% 고정 산식의 의미와 한계가 `operating_profit_snapshot` 및 KPI 지표 사전에 명시되어야 한다.
9. 원천 미확정, 산식 미확정, 정책 미승인 항목은 `가정`, `후보`, `승인 필요` 중 하나로 표시되어야 한다.

인당 생산성/마진 기여: 인수조건을 스키마 전환 가능성과 지표 산출 가능성에 맞춰 후속 설계자의 재질문과 재작업을 줄인다.

## 10. 의존성 및 담당

| 영역 | 담당 | 필요한 결정 |
|---|---|---|
| CRM Core 엔티티/API | A1, A2 | 계정/계약/활동 조회 단위 |
| 임직원-거래처 담당 배정 | A2, A3, A4, A7 | 다대다 배정, 대표 담당자, 담당 역할, 배정 변경 권한, 타임로그 |
| Operations Console | A2, A3, A8 | `work_item` 상태, SLA, 업무유형 코드 |
| 데이터 모델/KPI | A4 | 엔티티 관계, KPI 지표 사전, 품질 규칙 |
| 수익성 비용 입력 설정 | A3, A7, A2, A4, A8, A9 | 제원원가/판관비/일반관리비 입력값, 산식 버전, 적용 범위, 변경 이력, 입력 권한 |
| 유통 프로세스 API | A2 | 영업활동, 파이프라인, 견적, 계약, 주문, 출고, 발행, 매출인식 API 경계 |
| 유통 프로세스 UI | A3 | 고정 헤더 목록, 권한별 메뉴, 슈퍼바이저 대시보드 |
| Settlement & Point Ops | A2, A4, A5, A6, A7 | 포인트/정산 상태 코드와 원천 추적 |
| Security & Audit | A1, A2, A7, A9 | 개인정보 승인 게이트, 접근로그, 감사로그 |
| 원가/회계 정책 | PM 김권일, 재무 | `제원원가` 의미, 비용 입력 권한, 산식 버전 적용 정책, 고정 영업이익 산식 적용, 원가 배부율, 공식 손익 산식 |
| 외부 연동 | A6, PM 김권일 | 택배사 API, 세금계산서/거래명세표 연동, 적재 주기, 위탁 범위 |

인당 생산성/마진 기여: 담당 경계를 명확히 해 A4 데이터 초안이 정책 확정 전에도 P0 설계 입력으로 쓰이게 한다.

## 11. 가정

- 가정: `account_type`은 `customer` 또는 `supplier`를 우선 후보로 사용한다.
- 가정: `account_id`는 구현 단계에서 다형 참조 또는 별도 FK로 재설계될 수 있다.
- 가정: 임직원과 거래처의 담당 관계는 `employee_account.customer_account_id` 같은 직접 FK가 아니라 `employee_customer_assignment`를 통한 다대다 배정으로 관리한다.
- 가정: 담당 역할은 `primary_owner`, `secondary_owner`, `approval_owner`, `observer` 후보 코드로 시작하되 역할 명칭과 권한 효과는 PM/A7 승인 후 확정한다.
- 가정: 거래처별 대표 담당자 1명 제한은 후보 품질 규칙이며 PM 승인 전 물리 유일성 제약으로 확정하지 않는다.
- 가정: `제원원가`는 PM 표현 그대로 사용하며, 제조원가/상품원가/기타 원가 중 정확한 회계 의미는 PM 승인 전 확정하지 않는다.
- 가정: 비용 입력은 `Master` 또는 `ProfitCostInputManager` 후보 권한을 가진 사용자만 가능하되, 실제 권한 범위와 결재 필요 여부는 PM/A7 승인 후 확정한다.
- 가정: 비용 입력 기반 산식 버전은 공식 손익 산식이 아니라 승인 전 대시보드 후보 지표다.
- 가정: 공식 회계 기준 매출/원가가 제공되기 전까지 `revenue_record`와 `cost_record`는 운영 의사결정용 후보 데이터로 취급한다.
- 가정: 운영 원가 배부는 초기에는 `work_item` 처리시간과 승인된 비용률 후보를 기반으로 한다.
- 가정: 임직원 개인정보 원문은 PM 승인 전 저장하지 않고 참조 ID와 집계 수치로 대체한다.
- 가정: 레거시 시스템별 실제 코드값은 아직 제공되지 않아 상태 코드는 MVP 후보값이다.
- 가정: `PROCESS_REQUIREMENTS.md`의 유통형 흐름은 기존 CRM Core에 추가되는 영업-매출인식 프로세스 확장으로 해석한다.
- 가정: 원가 50%와 판관비/일반관리비 50%는 PM 제시 MVP 기준선이며 공식 회계 손익 산식이 아니다.
- 가정: 택배사 실시간 위치, 세금계산서, 거래명세표 외부 연동은 계약/API/비용 확인 전까지 수동 참조와 상태 모델만 정의한다.

인당 생산성/마진 기여: 구현 전제를 가정으로 분리해 잘못된 확정값에 맞춘 개발비 지출을 줄인다.

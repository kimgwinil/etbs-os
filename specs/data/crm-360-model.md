# CRM 360 Conceptual Data Model

## 1. 목적

`CRM Core`가 고객사, 공급사, 임직원, 계약, 포인트, 정산, CS, 활동 이력을 같은 식별자 체계로 연결하고, `Profitability Dashboard`가 고객사/공급사별 수익성, 운영 투입량, 이탈 위험, LTV 후보 지표를 산출할 수 있게 하는 개념 데이터 모델을 정의한다.

본 문서는 백엔드 스키마 설계를 위한 입력이며, 실제 DBMS, 물리 테이블, 인덱스, 개인정보 처리범위, 암호화 방식은 확정하지 않는다.

인당 생산성/마진 기여: 공통 식별자와 지표 산출 단위를 먼저 통일해 담당자별 수기 매칭과 엑셀 집계를 줄인다.

## 2. 입력

| 입력 | 필수 여부 | 설명 | 원천 후보 |
|---|---:|---|---|
| `customer_account` | 필수 | 고객사 기준 마스터 | 레거시 CRM, 계약 관리 |
| `supplier_account` | 필수 | 공급사/입점사 기준 마스터 | 입점사 관리, 상품/정산 |
| `employee_account` | 조건부 | 임직원 참조 계정 | 임직원 원장, 포인트 시스템 |
| `contract` | 필수 | 고객/공급 계약 | 계약 관리, 영업 관리 |
| `point_transaction` | 조건부 | 포인트 지급/차감/사용/소멸 | 포인트 시스템, 베네카페 |
| `settlement_record` | 조건부 | 정산 금액과 상태 | 정산 시스템, 회계 보조 |
| `cs_case` | 조건부 | CS 문의와 처리 상태 | CS 툴, 메일, 콜센터 |
| `work_item` | 필수 | 운영 업무 접수/배정/처리 | Operations Console |
| `activity_log` | 필수 | 영업/AM/운영 활동 이력 | CRM, Operations Console |

인당 생산성/마진 기여: 필수 입력을 계정·계약·업무 이력으로 제한해 P0 구현에서 지표 산출에 필요한 최소 데이터부터 확보한다.

## 3. 출력

| 출력 | 설명 | 소비 모듈 |
|---|---|---|
| `crm_360_profile` | 계정 단위 통합 조회 모델 | CRM Core, Operations Console |
| `profitability_snapshot` | 월별 고객사/공급사 수익성 후보 집계 | Profitability Dashboard |
| `operational_load_snapshot` | 업무유형/담당자/계정별 처리량과 처리시간 | Operations Console, Profitability Dashboard |
| `risk_signal_snapshot` | 이탈 위험, 정산 예외, CS 과다 등 위험 신호 | CRM Core, Profitability Dashboard |
| `approval_required_register` | 개인정보/민감정보/정책 승인 필요 항목 | Security & Audit Baseline, PM |

인당 생산성/마진 기여: 출력 모델을 화면과 대시보드 소비 단위로 정의해 중복 API와 중복 집계를 줄인다.

## 4. 엔티티 정의

### 4.1 `customer_account`

| 항목 | 내용 |
|---|---|
| 목적 | 고객사 단위의 계약, 임직원, 업무, CS, 수익성 지표를 묶는 기준 엔티티 |
| Primary Key | `customer_account_id` |
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
| Primary Key | `supplier_account_id` |
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
| Primary Key | `employee_account_id` |
| 후보 속성 | `customer_account_id`, `eligibility_status`, `point_policy_id`, `joined_at`, `left_at`, `created_at`, `updated_at` |
| 상태 후보 | `eligible`, `inactive`, `suspended`, `terminated` |
| 입력 | 임직원 원장, 포인트 시스템 |
| 출력 | `crm_360_profile`, `cs_case_rate`, 포인트 관련 지표 |
| 인수조건 | 개인정보 원문 없이도 고객사별 활성 임직원 수와 포인트 계정 참조가 가능해야 한다. |
| 의존성 | A7 개인정보 승인, A2 CRM Core, A4 데이터 기준 |
| KPI 영향 | 고객사 규모, CS 발생률, 포인트 운영량 산출의 분모 후보 |

인당 생산성/마진 기여: 임직원 원문 개인정보를 최소화하면서 고객사 규모와 운영 부하를 계산해 보안 리스크와 처리 비용을 함께 낮춘다.

### 4.4 `contract`

| 항목 | 내용 |
|---|---|
| 목적 | 고객사/공급사의 과금, 서비스 범위, 기간, 갱신 상태를 정의하는 계약 기준 엔티티 |
| Primary Key | `contract_id` |
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
| Primary Key | `point_account_id` |
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
| Primary Key | `point_transaction_id` |
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
| Primary Key | `settlement_id` |
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
| Primary Key | `revenue_id` |
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
| Primary Key | `cost_id` |
| 후보 속성 | `account_type`, `account_id`, `period`, `cost_type`, `allocation_key`, `amount`, `currency`, `source_system`, `source_record_id` |
| 상태 후보 | `estimated`, `confirmed`, `adjusted`, `excluded` |
| 입력 | 정산, 결제 수수료, 인건비/운영비 배부 기준 |
| 출력 | `direct_cost`, `allocated_ops_cost`, 마진 지표 |
| 인수조건 | 비용은 직접 비용과 배부 비용을 구분하고, 배부 정책 승인 여부를 표시해야 한다. |
| 의존성 | PM/재무 원가 배부 정책 승인 |
| KPI 영향 | 저마진 고객사/공급사 식별 |

인당 생산성/마진 기여: 비용을 계정별로 연결해 매출은 크지만 인력과 원가를 많이 쓰는 대상을 드러낸다.

### 4.10 `cs_case`

| 항목 | 내용 |
|---|---|
| 목적 | 고객사/공급사/임직원 관련 문의와 이슈 처리 상태를 추적하는 엔티티 |
| Primary Key | `case_id` |
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
| Primary Key | `work_item_id` |
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
| Primary Key | `activity_id` |
| 후보 속성 | `actor_id`, `activity_type`, `account_type`, `account_id`, `contract_id`, `work_item_id`, `occurred_at`, `source_system`, `summary_ref` |
| 상태 후보 | 해당 없음 |
| 입력 | CRM, Operations Console, 연동 이벤트 |
| 출력 | CRM 360 타임라인, 갱신 위험, 감사 후보 |
| 인수조건 | 활동 이력은 행위자, 대상, 시각, 유형을 가져야 한다. 원문 내용 저장은 개인정보 승인 후 결정한다. |
| 의존성 | A1/A2 CRM Core, A7 Audit Baseline |
| KPI 영향 | AM 활동량, 미접촉 고객, 이탈 위험 후보 |

인당 생산성/마진 기여: 활동 이력을 표준화해 담당자 변경 시 히스토리 탐색 시간을 줄이고 갱신 리스크 대응을 빠르게 한다.

## 5. 관계 정의

| 관계 ID | From | To | Cardinality | 설명 |
|---|---|---|---|---|
| `R-001` | `customer_account` | `employee_account` | 1:N | 한 고객사는 여러 임직원 참조 계정을 가진다. |
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

인당 생산성/마진 기여: 관계를 계정과 계약 중심으로 고정해 대시보드 산출 시 수기 조인과 예외 매핑을 줄인다.

## 6. KPI Metric Dictionary

| Metric ID | 이름 | 산식 초안 | Grain | 필수 차원 | 원천 후보 | 상태 |
|---|---|---|---|---|---|---|
| `gross_revenue` | 총매출 후보 | `sum(revenue_record.amount where status in confirmed, estimated)` | 월, 계정, 계약 | `account_type`, `account_id`, `contract_id`, `period` | `revenue_record` | 후보 |
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

인당 생산성/마진 기여: 지표별 Grain과 원천을 명시해 잘못된 집계로 인한 의사결정 오류와 검산 시간을 줄인다.

## 7. 데이터 품질 규칙

| Rule ID | 규칙 | 검증 예 | 실패 처리 후보 |
|---|---|---|---|
| `DQ-001` | 계정 Primary Key는 중복될 수 없다. | `count(distinct customer_account_id) = count(*)` | 중복 후보를 `data_quality_report`에 등록 |
| `DQ-002` | `contract.account_id`는 존재하는 고객사 또는 공급사를 참조해야 한다. | orphan contract 검출 | 계약 매핑 보류 |
| `DQ-003` | `work_item.completed_at`은 `started_at`보다 빠를 수 없다. | 음수 처리시간 검출 | 처리시간 KPI 제외 |
| `DQ-004` | `revenue_record.amount`와 `cost_record.amount`는 통화와 기간을 가져야 한다. | `currency is null` 또는 `period is null` | 마진 KPI 제외 |
| `DQ-005` | `settlement_record.status`는 허용 상태 코드만 사용해야 한다. | 미등록 상태 코드 검출 | 정산 예외 후보 등록 |
| `DQ-006` | 개인정보 승인 전 원문 개인정보 필드는 CRM 확정 모델에 포함하지 않는다. | 승인 없는 `resident_registration_number` 등 | 모델 반려 및 PM 승인 요청 |
| `DQ-007` | 지표 산출 레코드는 가능한 경우 `source_system`과 `source_record_id`를 가진다. | 원천 추적 불가 레코드 검출 | 신뢰도 낮음 표시 |

인당 생산성/마진 기여: 품질 실패를 지표 제외 또는 보류 상태로 관리해 대시보드 신뢰 하락과 운영 재확인을 줄인다.

## 8. 승인 필요 필드 Register

다음 필드는 확정 필드가 아니며, PM 김권일 및 보안/개인정보 담당 승인 전 모델에 포함하지 않는다.

| Register ID | 후보 영역 | 후보 필드 예 | 승인 필요 사유 | 승인 전 대체 |
|---|---|---|---|---|
| `APR-PII-001` | 임직원 식별 | `employee_name`, `personal_email`, `mobile_number`, `birth_date` | 개인정보 처리범위 미확정 | `employee_account_id`, 집계 수치 |
| `APR-SENS-001` | 민감/건강/가족 정보 | `health_info`, `family_member_info`, `medical_claim_detail` | 민감정보 가능성 | CRM Core에서 제외 |
| `APR-PII-002` | 고객사 담당자 | `contact_name`, `contact_email`, `contact_mobile` | 개인정보 및 영업정보 | `account_owner_id`, 역할 참조 |
| `APR-FIN-001` | 공급사 금융정보 | `bank_account_number`, `account_holder_name` | 금융정보 접근통제 필요 | 정산 상태/금액만 사용 |
| `APR-HR-001` | 인건비 단가 | `employee_cost_rate`, `salary_band` | 인사/재무 정책 정보 | 승인된 배부율 또는 익명화 비용률 |
| `APR-EXT-001` | 외부 데이터 결합 | 외부 신용/평판/로그 데이터 | 목적 외 이용 및 위탁 검토 필요 | 내부 운영 데이터만 사용 |

인당 생산성/마진 기여: 승인 전 필드를 분리해 규제 리스크를 낮추고 데이터 모델 재작업을 예방한다.

## 9. 인수조건

1. 백엔드는 `customer_account`, `supplier_account`, `employee_account`, `contract`, `work_item`, `cs_case`, `activity_log`의 Primary Key와 주요 관계를 ERD로 전환할 수 있어야 한다.
2. `Profitability Dashboard`는 Metric Dictionary의 `Metric ID`, 산식, Grain, 차원, 원천 후보를 기준으로 API 또는 집계 테이블 후보를 설계할 수 있어야 한다.
3. 개인정보/민감정보 후보는 `approval_required_register`에만 존재해야 하며, 확정 모델로 오해될 수 없게 표시되어야 한다.
4. 각 엔티티는 목적, 입력, 출력, 인수조건, 의존성, 담당 또는 관련 담당, KPI 영향을 포함해야 한다.
5. 원천 미확정, 산식 미확정, 정책 미승인 항목은 `가정`, `후보`, `승인 필요` 중 하나로 표시되어야 한다.

인당 생산성/마진 기여: 인수조건을 스키마 전환 가능성과 지표 산출 가능성에 맞춰 후속 설계자의 재질문과 재작업을 줄인다.

## 10. 의존성 및 담당

| 영역 | 담당 | 필요한 결정 |
|---|---|---|
| CRM Core 엔티티/API | A1, A2 | 계정/계약/활동 조회 단위 |
| Operations Console | A2, A3, A8 | `work_item` 상태, SLA, 업무유형 코드 |
| 데이터 모델/KPI | A4 | 엔티티 관계, Metric Dictionary, 품질 규칙 |
| Settlement & Point Ops | A2, A4, A5, A6, A7 | 포인트/정산 상태 코드와 원천 추적 |
| Security & Audit | A1, A2, A7, A9 | 개인정보 승인 게이트, 접근로그, 감사로그 |
| 원가/회계 정책 | PM 김권일, 재무 | 원가 배부율, 공식 손익 산식 |
| 외부 연동 | A6, PM 김권일 | API 원천, 적재 주기, 위탁 범위 |

인당 생산성/마진 기여: 담당 경계를 명확히 해 A4 데이터 초안이 정책 확정 전에도 P0 설계 입력으로 쓰이게 한다.

## 11. 가정

- 가정: `account_type`은 `customer` 또는 `supplier`를 우선 후보로 사용한다.
- 가정: `account_id`는 구현 단계에서 다형 참조 또는 별도 FK로 재설계될 수 있다.
- 가정: 공식 회계 기준 매출/원가가 제공되기 전까지 `revenue_record`와 `cost_record`는 운영 의사결정용 후보 데이터로 취급한다.
- 가정: 운영 원가 배부는 초기에는 `work_item` 처리시간과 승인된 비용률 후보를 기반으로 한다.
- 가정: 임직원 개인정보 원문은 PM 승인 전 저장하지 않고 참조 ID와 집계 수치로 대체한다.
- 가정: 레거시 시스템별 실제 코드값은 아직 제공되지 않아 상태 코드는 MVP 후보값이다.

인당 생산성/마진 기여: 구현 전제를 가정으로 분리해 잘못된 확정값에 맞춘 개발비 지출을 줄인다.


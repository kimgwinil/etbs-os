# A4 CRM 360 데이터 모델 및 수익성 지표 초안

## 1. 문서 목적

이 문서는 이제너두 전사 CRM OS의 P0 모듈 중 `CRM Core`와 `Profitability Dashboard`를 위한 개념 데이터 모델, KPI 정의, 원천 데이터 후보, 데이터 품질 기준을 정리하는 A4 초안이다.

본 문서는 개발 확정안이 아니며, 개인정보/민감정보 처리범위, 보관기간, 외부계약, 아키텍처 확정은 PM 김권일 승인 후 별도 확정한다.

인당 생산성/마진 기여: 고객사/공급사별 수익성, 운영 투입량, 이탈 위험, LTV를 같은 기준으로 판단하게 해 저마진 업무와 고투입 고객을 빠르게 식별한다.

## 2. 적용 범위

| 구분 | 포함 | 제외 또는 승인 필요 |
|---|---|---|
| `CRM Core` | 고객사, 공급사, 임직원 기준 식별자, 계약, 담당자, 활동 이력, 운영 업무 참조 구조 | 개인정보/민감정보 필드 확정, 원본 개인정보 저장 방식 확정 |
| `Profitability Dashboard` | 고객사/공급사별 매출, 원가, 마진, 운영 투입량, CS/정산 예외, 이탈 위험, LTV 후보 지표 | 회계 기준 확정, 원가 배부 정책 확정, 공식 손익 산식 확정 |
| 데이터 품질 | 식별자 중복, 누락, 참조 무결성, 최신성, 지표 산출 가능성 기준 | 자동 정제 도구 또는 MDM 솔루션 도입 확정 |
| 승인 게이트 | 개인정보 후보 필드, 민감정보 후보 필드, 외부 데이터 결합 범위 분리 | PM 승인 없는 처리범위 확정 |

인당 생산성/마진 기여: MVP 범위를 기준 데이터와 지표 산출 가능성으로 제한해 불확실한 개인정보/회계 정책 때문에 개발이 지연되는 리스크를 줄인다.

## 3. 주요 입력

| 입력 | 설명 | 원천 데이터 후보 | 확정 상태 |
|---|---|---|---|
| `company_master` | 고객사 기준 정보 | 레거시 CRM, 계약 관리, 고객사 운영 엑셀 | 후보 |
| `supplier_master` | 공급사/입점사 기준 정보 | 입점사 관리, 상품/정산 시스템 | 후보 |
| `employee_reference` | 임직원 참조 식별자 | 고객사 임직원 원장, 복지 포인트 시스템 | 개인정보 범위 승인 필요 |
| `contract_record` | 계약 기간, 계약 유형, 과금 기준 | 계약서 관리, 영업/AM 관리 자료 | 후보 |
| `point_transaction` | 포인트 지급/차감/사용/소멸 | 포인트 시스템, 베네카페 연동 | 후보 |
| `settlement_record` | 정산 금액, 정산 상태, 예외 | 정산 시스템, 회계 보조 자료 | 후보 |
| `cs_case` | CS 접수, 처리 상태, 업무 유형 | CS 툴, 콜센터/메일, 운영 큐 | 후보 |
| `activity_log` | 영업/AM/운영 접촉 및 처리 이력 | CRM 활동 기록, 메신저/메일 요약, 수기 이력 | 후보 |
| `work_item` | 운영 업무 접수, 배정, 처리시간 | Operations Console | P0 신규 기준 |
| `cost_allocation_basis` | 인건비/운영비 배부 기준 | 재무/인사/운영 리포트 | 정책 승인 필요 |

인당 생산성/마진 기여: 원천 후보를 미리 분리하면 백엔드와 데이터 담당자가 수집 우선순위를 매출·원가·처리량 산출 가능성에 맞춰 정렬할 수 있다.

## 4. 주요 출력

| 출력 | 사용자 | 설명 |
|---|---|---|
| `crm_360_profile` | 영업/AM, 운영, 경영진 | 고객사/공급사/임직원/계약/활동 이력을 하나의 프로필로 조회 |
| `profitability_snapshot` | 경영진, PM, 재무 | 고객사/공급사별 매출, 원가, 마진, 운영 투입량, 위험 신호 요약 |
| `data_quality_report` | PM, 백엔드, 데이터 담당 | 지표 산출 불가, 중복, 누락, 참조 오류 목록 |
| `approval_required_register` | PM, 보안/개인정보 담당 | 개인정보/민감정보/회계 정책 승인 필요 항목 목록 |

인당 생산성/마진 기여: 반복 조회와 수작업 집계를 줄이고, 수익성 판단에 필요한 결측 항목을 초기에 드러내 재작업 비용을 낮춘다.

## 5. 핵심 결정

| 결정 ID | 결정 | 근거 | 인당 생산성/마진 기여 |
|---|---|---|---|
| `D-A4-001` | CRM 360의 최상위 운영 단위는 `customer_account`, `supplier_account`, `employee_account`로 분리한다. | 고객사, 공급사, 임직원의 수익성과 운영 투입량 산식이 다르다. | 운영 담당자가 대상 유형별로 다른 화면과 엑셀을 오가지 않게 해 조회 시간을 줄인다. |
| `D-A4-002` | 모든 업무/정산/CS/활동 데이터는 가능한 경우 `account_id`와 `contract_id`를 참조한다. | 수익성 지표는 계약과 계정 단위로 묶여야 한다. | 지표 산출 시 수기 매칭 시간을 줄이고 저마진 계약을 빠르게 찾는다. |
| `D-A4-003` | `Profitability Dashboard`는 공식 회계 손익이 아니라 MVP 운영 손익 후보 지표로 시작한다. | 원가 배부와 회계 기준은 PM/재무 승인 전 확정할 수 없다. | 초기에는 의사결정 속도를 높이고, 회계 확정 전 과도한 개발을 막는다. |
| `D-A4-004` | 개인정보/민감정보 후보 필드는 본문 모델에서 분리해 `approval_required_register`로 관리한다. | PRD상 개인정보 처리범위는 PM 승인 대상이다. | 승인 전 불필요한 개인정보 저장 설계를 막아 보안 보완 비용과 규제 리스크를 줄인다. |
| `D-A4-005` | 운영 투입량은 `work_item`, `cs_case`, `activity_log`의 처리 건수와 시간으로 측정한다. | 인당 생산성 판단에는 매출뿐 아니라 처리량과 소요시간이 필요하다. | 고투입 고객/공급사를 찾아 인력 배치와 자동화 우선순위를 정할 수 있다. |

## 6. CRM 360 개념 엔티티

상세 필드와 관계 정의는 [crm-360-model.md](/Users/kimgwonil/Documents/앱개발/specs/data/crm-360-model.md)에 둔다.

| 엔티티 | 목적 | 주요 식별자 | 핵심 속성 후보 | 주요 관계 |
|---|---|---|---|---|
| `customer_account` | 고객사 기준 단위 | `customer_account_id` | `status`, `segment`, `industry_code`, `employee_count_band`, `account_owner_id` | `contract`, `employee_account`, `work_item`, `cs_case`, `activity_log` |
| `supplier_account` | 공급사/입점사 기준 단위 | `supplier_account_id` | `status`, `supplier_type`, `category_group`, `settlement_cycle`, `supplier_owner_id` | `contract`, `settlement_record`, `work_item`, `cs_case`, `activity_log` |
| `employee_account` | 임직원 참조 단위 | `employee_account_id` | `customer_account_id`, `eligibility_status`, `point_policy_id` | `customer_account`, `point_account`, `cs_case` |
| `contract` | 고객사/공급사 계약 기준 | `contract_id` | `account_type`, `account_id`, `contract_type`, `start_date`, `end_date`, `billing_model`, `renewal_status` | `customer_account` 또는 `supplier_account`, `revenue_record`, `settlement_record` |
| `point_account` | 포인트 잔액/정책 참조 | `point_account_id` | `employee_account_id`, `point_policy_id`, `status` | `employee_account`, `point_transaction` |
| `point_transaction` | 포인트 변동 근거 | `point_transaction_id` | `transaction_type`, `amount`, `occurred_at`, `source_system`, `reference_id` | `point_account`, `settlement_record` |
| `settlement_record` | 정산 산출 및 상태 | `settlement_id` | `account_type`, `account_id`, `period`, `gross_amount`, `fee_amount`, `net_amount`, `status` | `supplier_account`, `customer_account`, `point_transaction` |
| `revenue_record` | 매출 인식 후보 | `revenue_id` | `contract_id`, `period`, `revenue_type`, `amount`, `source_system` | `contract`, `profitability_snapshot` |
| `cost_record` | 원가/운영비 후보 | `cost_id` | `cost_type`, `allocation_key`, `amount`, `period`, `source_system` | `customer_account`, `supplier_account`, `work_item` |
| `cs_case` | 문의/이슈 처리 | `case_id` | `account_type`, `account_id`, `case_type`, `priority`, `status`, `opened_at`, `closed_at` | `customer_account`, `supplier_account`, `employee_account`, `work_item` |
| `work_item` | 운영 업무 큐 | `work_item_id` | `work_type`, `status`, `assignee_id`, `sla_due_at`, `started_at`, `completed_at` | `customer_account`, `supplier_account`, `contract`, `cs_case` |
| `activity_log` | 접촉/변경/처리 이력 | `activity_id` | `actor_id`, `activity_type`, `account_type`, `account_id`, `occurred_at` | `customer_account`, `supplier_account`, `contract`, `work_item` |

인당 생산성/마진 기여: 엔티티를 운영 대상과 지표 산출 단위 중심으로 정리해 조회, 배정, 정산, 수익성 분석의 공통 기준을 만든다.

## 7. Profitability Dashboard KPI 정의

| KPI | 산식 초안 | 차원 | 원천 데이터 후보 | 확정 상태 | KPI 영향 |
|---|---|---|---|---|---|
| `gross_revenue` | `sum(revenue_record.amount)` | 고객사, 공급사, 계약, 월 | 계약/매출/정산 | 후보 | 매출 기여 고객과 공급사를 식별 |
| `direct_cost` | `sum(cost_record.amount where cost_type in direct_cost)` | 고객사, 공급사, 월 | 정산, 결제 수수료, 상품 원가 | 정책 승인 필요 | 저마진 거래 구조 식별 |
| `allocated_ops_cost` | `sum(work_minutes * cost_rate)` | 고객사, 공급사, 업무유형, 월 | `work_item`, 인건비 배부 기준 | 정책 승인 필요 | 고투입 운영 대상을 식별 |
| `gross_margin_amount` | `gross_revenue - direct_cost - allocated_ops_cost` | 고객사, 공급사, 계약, 월 | 매출/원가/업무시간 | 후보 | 마진 개선 우선순위 산정 |
| `gross_margin_rate` | `gross_margin_amount / gross_revenue` | 고객사, 공급사, 월 | 위 산식 | 후보 | 저마진 계정 경보 |
| `work_item_count` | `count(work_item_id)` | 고객사, 공급사, 업무유형, 담당자, 월 | Operations Console | 후보 | 담당자 1인당 처리량 측정 |
| `avg_handling_time_minutes` | `avg(completed_at - started_at)` | 업무유형, 고객사, 공급사 | Operations Console | 후보 | 자동화/프로세스 개선 후보 식별 |
| `cs_case_rate` | `cs_case_count / active_employee_count` 또는 계약 단위 분모 | 고객사, 월 | CS, 임직원 참조 | 분모 승인 필요 | 이슈 과다 고객 식별 |
| `settlement_exception_rate` | `exception_settlement_count / settlement_count` | 공급사, 월 | 정산 시스템 | 후보 | 정산 자동화와 공급사 품질 개선 |
| `renewal_risk_score` | 가중치 기반 후보 점수 | 고객사, 계약 | 계약 만료, CS, 마진, 활동 | 후보 | 이탈 위험 대응 우선순위 |
| `ltv_candidate` | `expected_margin_per_period * expected_retention_period` | 고객사, 세그먼트 | 마진, 계약기간, 갱신 이력 | 후보 | 유지/확장 투자 우선순위 |

인당 생산성/마진 기여: 매출만 보지 않고 원가와 운영 투입량까지 결합해 같은 인력으로 더 높은 마진을 낼 수 있는 계정 운영 정책을 만든다.

## 8. 데이터 품질 기준

| 품질 항목 | 기준 | 실패 예 | 담당 |
|---|---|---|---|
| 식별자 유일성 | `customer_account_id`, `supplier_account_id`, `contract_id`는 중복 없어야 한다. | 같은 고객사가 영업/정산 시스템에서 다른 이름으로 중복 등록 | A4, 백엔드 |
| 참조 무결성 | 업무, CS, 정산, 활동 이력은 가능한 경우 계정 또는 계약을 참조해야 한다. | `work_item.account_id`가 없는 처리 이력 | A4, A2 |
| 최신성 | 대시보드 지표는 산출 기준일과 원천 반영 시각을 표시해야 한다. | 월 매출은 최신이나 CS는 2개월 전 데이터 | A4, A3 |
| 산식 재현성 | KPI는 산식, 필터, 분모, 제외 조건을 문서화해야 한다. | 마진율 산출에 어떤 비용이 들어갔는지 불명확 | A4, 재무 |
| 개인정보 최소화 | 승인 전 개인정보/민감정보 원문 필드는 모델 확정에서 제외한다. | 주민등록번호, 건강정보 등 원문 저장 전제 설계 | A4, A7, PM |
| 데이터 계보 | 지표는 `source_system`, `source_record_id`, `loaded_at` 후보를 가져야 한다. | 정산 금액의 원천 거래를 추적할 수 없음 | A4, A6 |

인당 생산성/마진 기여: 품질 기준을 먼저 세워 대시보드 불신으로 인한 수기 검산과 재작업을 줄인다.

## 9. 승인 필요 항목

| 항목 | 승인 필요 사유 | 승인 전 처리 원칙 |
|---|---|---|
| 임직원 개인정보 필드 | 개인정보 처리범위 미확정 | `employee_account_id` 중심의 참조 식별자만 사용하고 원문 필드는 확정하지 않는다. |
| 민감정보/건강정보/가족정보 | 민감정보 가능성 및 법적 리스크 | CRM Core 기본 모델에서 제외하고 별도 승인 후 최소 필드만 정의한다. |
| 고객사 담당자 연락처 | 개인정보 및 영업정보 가능성 | `contact_profile` 후보로만 두고 저장 필드, 열람권한, 보관기간은 승인 후 정의한다. |
| 공급사 정산 계좌정보 | 금융정보 및 접근통제 필요 | 정산 상태와 금액 모델은 정의하되 계좌 원문 필드는 승인 전 제외한다. |
| 원가 배부율과 인건비 단가 | 재무/인사 정책 정보 | KPI 후보 산식에만 두고 공식 지표로 확정하지 않는다. |
| 외부 데이터 결합 | 위탁/재위탁 및 목적 외 이용 검토 필요 | 결합 목적, 보관기간, 접근권한 승인 전 구현하지 않는다. |

인당 생산성/마진 기여: 승인 게이트를 분리해 보안 사고 가능성과 사후 재설계 비용을 줄인다.

## 10. 인수조건

1. `CRM Core` 백엔드 설계자가 엔티티, 주요 식별자, 관계, 상태 값을 ERD 초안으로 전환할 수 있어야 한다.
2. `Profitability Dashboard` 담당자가 KPI별 산식, 차원, 원천 데이터 후보, 확정 상태를 확인할 수 있어야 한다.
3. 개인정보/민감정보 후보 필드는 확정 모델과 분리되어 PM 승인 필요 항목으로 표시되어야 한다.
4. 각 KPI는 최소 하나 이상의 원천 데이터 후보와 산출 불확실성을 가져야 한다.
5. 모든 추측성 내용은 `가정` 또는 `후보`로 표시되어야 한다.
6. 각 주요 결정은 인당 생산성/마진 기여 문장을 포함해야 한다.

인당 생산성/마진 기여: 인수조건을 데이터 모델 전환 가능성과 지표 검증 가능성에 맞춰 후속 개발자의 해석 비용을 줄인다.

## 11. 의존성 및 담당

| 의존 항목 | 담당 | A4 관점 필요 산출 |
|---|---|---|
| P0 `CRM Core` 화면/백엔드 경계 | A1, A2 | 엔티티 ID, 조회 단위, 권한 참조 단위 |
| P0 `Operations Console` | A2, A3, A8 | `work_item`, 처리시간, SLA, 업무유형 코드 |
| P0 `Security & Audit Baseline` | A1, A2, A7, A9 | 개인정보 승인 게이트, 접근로그 참조 기준 |
| P0 `Profitability Dashboard` | A3, A4 | KPI 산식, 집계 차원, 데이터 품질 기준 |
| P1 `Settlement & Point Ops` | A2, A4, A5, A6, A7 | 포인트/정산 원천 데이터와 예외 상태 코드 |
| 연동 현황 | A6 | `source_system`, `source_record_id`, 적재 주기 후보 |
| PM 승인 | PM 김권일 | 개인정보 범위, 원가 배부 정책, 외부계약, 아키텍처 확정 |

인당 생산성/마진 기여: 의존성을 명확히 해 A4가 확정할 수 없는 정책 항목 때문에 P0 데이터 설계가 멈추지 않게 한다.

## 12. 가정

- 가정: 고객사 약 2,800개와 임직원 약 260만 명 이상 규모를 고려해 조회/집계는 계정과 계약 단위 식별자를 중심으로 설계한다.
- 가정: 레거시 CRM, 포인트, 정산, CS, 외부 연동의 실제 스키마와 API 명세는 아직 제공되지 않았다.
- 가정: MVP의 수익성 지표는 재무제표 확정 수치가 아니라 운영 의사결정용 후보 지표로 시작한다.
- 가정: 임직원 원문 개인정보는 PM 승인 전 CRM 360 모델에 확정 필드로 포함하지 않는다.
- 가정: 운영 투입량은 초기에는 `work_item` 상태 전환 시각과 담당자 배정 이력을 기준으로 측정한다.

인당 생산성/마진 기여: 가정을 명시해 불확실한 원천 시스템과 정책을 확정값처럼 개발하는 낭비를 줄인다.


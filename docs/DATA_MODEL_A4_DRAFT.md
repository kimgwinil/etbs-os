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
| `employee_customer_assignment` | 임직원-거래처 담당 배정 | 임직원 관리, 거래처 관리, 담당자 배정 화면 | 후보 |
| `employee_customer_assignment_history` | 담당 배정 변경 이력 | 담당자 배정 변경 이벤트, 타임로그 | 후보 |
| `product_master` | 판매상품 기준 정보 | 상품 관리, 공급사 상품 원장 | 후보 |
| `sales_price_master` | 상품별 판매가격과 할인 기준 | 상품/가격 관리, 견적 시스템 | 후보 |
| `sales_activity_record` | 방문, 통화, 미팅, 제안 활동 | CRM 활동 기록, 영업 타임로그 | 후보 |
| `sales_pipeline_record` | 영업기회 단계, 예상금액, 확률 | 영업 파이프라인 | 후보 |
| `quote_record` | 견적서, 견적 버전, 승인 상태 | 견적 관리, 결재 시스템 | 후보 |
| `contract_record` | 계약 기간, 계약 유형, 과금 기준 | 계약서 관리, 영업/AM 관리 자료 | 후보 |
| `sales_order_record` | 계약 기반 주문, 수량, 납기 | 주문 관리 | 후보 |
| `outbound_shipment_record` | 출고 지시와 출고 완료 상태 | 출고/재고 시스템 | 후보 |
| `delivery_tracking_record` | 배송 상태, 송장, 예외 | 택배사 연동, 수동 배송 입력 | 외부 연동 승인 필요 |
| `tax_invoice_record` | 세금계산서 발행 상태와 금액 | 세금계산서 시스템, 회계 보조 | 후보 |
| `transaction_statement_record` | 거래명세표 발행 상태와 품목 | 거래명세표 발행 시스템 | 후보 |
| `revenue_recognition_record` | 매출인식 기준과 금액 | 주문/출고/청구/회계 기준 | 회계 기준 승인 필요 |
| `point_transaction` | 포인트 지급/차감/사용/소멸 | 포인트 시스템, 베네카페 연동 | 후보 |
| `settlement_record` | 정산 금액, 정산 상태, 예외 | 정산 시스템, 회계 보조 자료 | 후보 |
| `cs_case` | CS 접수, 처리 상태, 업무 유형 | CS 툴, 콜센터/메일, 운영 큐 | 후보 |
| `activity_log` | 영업/AM/운영 접촉 및 처리 이력 | CRM 활동 기록, 메신저/메일 요약, 수기 이력 | 후보 |
| `time_log` | 생성, 수정, 승인, 상태 변경, 발행, 조회 이력 | CRM OS 전 모듈 | P0 신규 기준 |
| `work_item` | 운영 업무 접수, 배정, 처리시간 | Operations Console | P0 신규 기준 |
| `profit_cost_formula_version` | 영업이익 산식 버전 | 설정 메뉴, 수익성 비용 입력 | PM 승인 필요 |
| `profit_cost_input` | 제원원가, 판관비, 일반관리비 입력값 | 설정 메뉴, Master 또는 `ProfitCostInputManager` 입력 | PM 승인 필요 |
| `profit_cost_input_history` | 비용 입력 변경 이력 | 비용 입력 생성/수정/삭제 이벤트, 결재/감사로그 | PM 승인 필요 |
| `cost_allocation_basis` | 인건비/운영비 배부 기준 | 재무/인사/운영 리포트 | 정책 승인 필요 |

인당 생산성/마진 기여: 원천 후보를 미리 분리하면 백엔드와 데이터 담당자가 수집 우선순위를 매출·원가·처리량 산출 가능성에 맞춰 정렬할 수 있다.

## 4. 주요 출력

| 출력 | 사용자 | 설명 |
|---|---|---|
| `crm_360_profile` | 영업/AM, 운영, 경영진 | 고객사/공급사/임직원/계약/활동 이력을 하나의 프로필로 조회 |
| `customer_assignment_view` | 영업/AM, 운영, 관리자 | 거래처별 현재 담당자 목록, 대표 담당자, 담당 역할, 배정 기간 조회 |
| `employee_assignment_view` | 관리자, 슈퍼바이저 | 임직원별 담당 거래처 목록, 역할, 대표 담당 여부, 변경 이력 조회 |
| `lead_to_cash_timeline` | 영업, 운영, 재무, 슈퍼바이저 | 영업활동, 파이프라인, 견적, 계약, 주문, 출고, 배송, 발행, 매출인식 흐름 조회 |
| `profitability_snapshot` | 경영진, PM, 재무 | 고객사/공급사별 매출, 원가, 마진, 운영 투입량, 위험 신호 요약 |
| `operating_profit_snapshot` | 슈퍼바이저, 경영진 | 산식 버전별 제원원가, 판관비, 일반관리비 기준 영업이익과 원인 지표 |
| `profit_cost_change_report` | Master, 감사/재무, PM | 비용 입력값, 산식 버전, 적용 범위, 적용일, 변경 전후 값, 변경 사유 조회 |
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
| `D-A4-006` | 유통형 업무 흐름은 `sales_activity`부터 `revenue_recognition`까지 영업-매출인식 관계로 연결한다. | `PROCESS_REQUIREMENTS.md`가 영업활동, 파이프라인, 견적, 계약, 주문, 출고, 배송, 발행, 매출인식 순서를 요구한다. | 부서 간 재입력과 누락을 줄이고 병목 단계를 계정/상품/담당자별로 찾는다. |
| `D-A4-007` | `operating_profit_snapshot`은 MVP에서 `salesAmount - salesAmount * 0.5 - salesAmount * 0.5` 고정 산식을 사용한다. | 팀장 지시의 초기 산식이 원가 50%, 판관비/일반관리비 50% 고정 기준이다. | 즉시 비교 가능한 기준선을 만들되 실제 이익 저하 원인은 할인, 반품, 배송비, 처리시간 등 보조 KPI로 분해한다. |
| `D-A4-008` | 모든 핵심 업무 상태 변경과 발행/승인/조회는 `time_log`에 남긴다. | PROCESS_REQUIREMENTS가 타임로그/감사로그를 핵심 요구로 지정했다. | 문제 원인 추적과 결재 지연 확인 시간을 줄여 내부통제와 운영 생산성을 높인다. |
| `D-A4-009` | 임직원과 거래처는 직접 1:1 또는 1:N으로 묶지 않고 `employee_customer_assignment`로 다대다 연결한다. | `/docs/DATA_MODEL.md`와 `/specs/employee/customer-assignment.md`가 임직원 한 명의 복수 거래처 담당과 거래처별 복수 담당자를 요구한다. | 담당자 공백, 중복 문의, 조직 변경 시 수기 재배정 비용을 줄인다. |
| `D-A4-010` | 대표 담당자는 `is_primary` 후보 필드로 표시하되 거래처별 1명 제한 여부는 PM 승인 전 확정하지 않는다. | 스펙의 PM 승인 항목이 대표 담당자 1명 제한 여부를 승인 대상으로 둔다. | 화면에는 대표 담당자를 빠르게 노출하면서도 조직 정책 확정 전 재설계를 막는다. |
| `D-A4-011` | 담당 역할은 `assignment_role` 후보 코드로 관리하고, 배정 생성/변경/종료는 `employee_customer_assignment_history`와 `time_log`에 남긴다. | 주담당, 부담당, 승인담당, 참조담당 등 역할과 변경 로그가 요구된다. | 인수인계와 책임소재 확인 시간을 줄이고 담당자 변경에 따른 업무 누락을 줄인다. |
| `D-A4-012` | 제원원가, 판관비, 일반관리비는 `profit_cost_input`으로 입력하고 `profit_cost_formula_version`을 통해 산식 버전을 관리한다. | `/specs/settings/profit-cost-permission.md`가 비용 입력값, 산식 버전, 적용일, 적용 범위, 변경 이력을 요구한다. | 비용 입력 오류와 산식 혼선을 줄여 영업이익 대시보드 재검산 시간을 줄인다. |
| `D-A4-013` | `제원원가` 용어는 PM 표현 그대로 사용하되 제조원가/상품원가/기타 원가 중 정확한 의미는 PM 승인 필요로 둔다. | 스펙이 `제원원가`의 실제 회계 의미 확정을 PM 승인 항목으로 지정했다. | 잘못된 회계 항목으로 개발되는 재작업과 경영 판단 오류를 줄인다. |
| `D-A4-014` | 비용 입력 생성/수정/삭제는 변경 전후 값, 적용일, 적용 범위, 산식 버전, 변경 사유, 변경자를 `profit_cost_input_history`와 감사로그에 남긴다. | 비용 값 변경은 전사 영업이익에 영향을 줄 수 있고 권한 통제가 필요하다. | 임의 변경과 검증 충돌을 줄여 수익성 지표 신뢰도를 유지한다. |

## 6. CRM 360 개념 엔티티

상세 필드와 관계 정의는 [crm-360-model.md](/Users/kimgwonil/Documents/앱개발/specs/data/crm-360-model.md)에 둔다.

| 엔티티 | 목적 | 주요 식별자 | 핵심 속성 후보 | 주요 관계 |
|---|---|---|---|---|
| `customer_account` | 고객사 기준 단위 | `customer_account_id` | `status`, `segment`, `industry_code`, `employee_count_band`, `account_owner_id` | `contract`, `employee_customer_assignment`, `work_item`, `cs_case`, `activity_log` |
| `supplier_account` | 공급사/입점사 기준 단위 | `supplier_account_id` | `status`, `supplier_type`, `category_group`, `settlement_cycle`, `supplier_owner_id` | `contract`, `settlement_record`, `work_item`, `cs_case`, `activity_log` |
| `employee_account` | 임직원 참조 단위 | `employee_account_id` | `eligibility_status`, `point_policy_id` | `employee_customer_assignment`, `point_account`, `cs_case` |
| `employee_customer_assignment` | 임직원-거래처 담당 배정 | `assignment_id` | `employee_account_id`, `customer_account_id`, `assignment_role`, `is_primary`, `assignment_status`, `effective_from`, `effective_to` | `employee_account`, `customer_account`, `employee_customer_assignment_history`, `time_log` |
| `employee_customer_assignment_history` | 담당 배정 이력 | `assignment_history_id` | `assignment_id`, `change_type`, `previous_role`, `new_role`, `previous_is_primary`, `new_is_primary`, `changed_by`, `changed_at` | `employee_customer_assignment`, `time_log` |
| `product` | 판매상품 기준 단위 | `product_id` | `supplier_account_id`, `product_type`, `category_group`, `status` | `supplier_account`, `sales_price`, `quote_line`, `sales_order_line` |
| `sales_price` | 상품별 판매가격 기준 | `sales_price_id` | `product_id`, `price_type`, `list_price`, `effective_from`, `effective_to` | `product`, `quote_line`, `sales_order_line` |
| `sales_activity` | 영업 방문/통화/미팅/제안 기록 | `sales_activity_id` | `customer_account_id`, `employee_account_id`, `activity_type`, `next_action_at` | `customer_account`, `sales_pipeline`, `time_log` |
| `sales_pipeline` | 영업기회와 단계 관리 | `pipeline_id` | `customer_account_id`, `stage`, `expected_amount`, `probability`, `expected_close_date` | `sales_activity`, `quote`, `contract` |
| `quote` | 견적서와 승인 상태 | `quote_id` | `pipeline_id`, `quote_version`, `status`, `valid_until`, `total_amount` | `quote_line`, `approval_document`, `contract` |
| `quote_line` | 견적 품목/가격/할인 | `quote_line_id` | `quote_id`, `product_id`, `sales_price_id`, `quantity`, `discount_amount` | `quote`, `product`, `sales_price` |
| `contract` | 고객사/공급사 계약 기준 | `contract_id` | `account_type`, `account_id`, `contract_type`, `start_date`, `end_date`, `billing_model`, `renewal_status` | `customer_account` 또는 `supplier_account`, `revenue_record`, `settlement_record` |
| `sales_order` | 계약 기반 주문 | `sales_order_id` | `contract_id`, `customer_account_id`, `order_status`, `requested_delivery_date`, `total_amount` | `sales_order_line`, `outbound_shipment`, `tax_invoice`, `transaction_statement` |
| `sales_order_line` | 주문 상품/수량/가격 | `sales_order_line_id` | `sales_order_id`, `product_id`, `sales_price_id`, `quantity`, `unit_price` | `sales_order`, `product`, `sales_price` |
| `outbound_shipment` | 출고 지시와 완료 상태 | `outbound_shipment_id` | `sales_order_id`, `warehouse_ref`, `status`, `shipped_at` | `sales_order`, `delivery_tracking`, `time_log` |
| `delivery_tracking` | 배송 상태와 예외 | `delivery_tracking_id` | `outbound_shipment_id`, `carrier_code`, `tracking_number_ref`, `delivery_status`, `last_checked_at` | `outbound_shipment`, `work_item` |
| `tax_invoice` | 세금계산서 발행 상태 | `tax_invoice_id` | `sales_order_id`, `issue_status`, `supply_amount`, `tax_amount`, `issued_at` | `sales_order`, `revenue_recognition`, `time_log` |
| `transaction_statement` | 거래명세표 발행 상태 | `transaction_statement_id` | `sales_order_id`, `issue_status`, `total_amount`, `issued_at` | `sales_order`, `sales_order_line`, `time_log` |
| `revenue_recognition` | 매출인식 기준과 금액 | `revenue_recognition_id` | `sales_order_id`, `recognition_basis`, `recognized_amount`, `recognized_at`, `status` | `sales_order`, `tax_invoice`, `revenue_record` |
| `operating_profit_snapshot` | 고정 산식 기반 영업이익 스냅샷 | `operating_profit_snapshot_id` | `period`, `sales_amount`, `fixed_cost_amount`, `fixed_sgna_amount`, `operating_profit_amount` | `revenue_recognition`, `sales_order`, `time_log` |
| `profit_cost_formula_version` | 영업이익 산식 버전 | `formula_version_id` | `formula_name`, `formula_status`, `formula_expression_ref`, `effective_from`, `effective_to`, `approved_status` | `profit_cost_input`, `operating_profit_snapshot`, `profit_cost_input_history` |
| `profit_cost_input` | 수익성 비용 입력값 | `profit_cost_input_id` | `formula_version_id`, `cost_component`, `input_method`, `input_value`, `scope_type`, `scope_ref_id`, `effective_date`, `status` | `profit_cost_formula_version`, `profit_cost_input_history`, `operating_profit_snapshot` |
| `profit_cost_input_history` | 비용 입력 변경 이력 | `profit_cost_input_history_id` | `profit_cost_input_id`, `change_type`, `before_value_ref`, `after_value_ref`, `effective_date`, `changed_by`, `change_reason_ref` | `profit_cost_input`, `time_log`, 감사로그 |
| `point_account` | 포인트 잔액/정책 참조 | `point_account_id` | `employee_account_id`, `point_policy_id`, `status` | `employee_account`, `point_transaction` |
| `point_transaction` | 포인트 변동 근거 | `point_transaction_id` | `transaction_type`, `amount`, `occurred_at`, `source_system`, `reference_id` | `point_account`, `settlement_record` |
| `settlement_record` | 정산 산출 및 상태 | `settlement_id` | `account_type`, `account_id`, `period`, `gross_amount`, `fee_amount`, `net_amount`, `status` | `supplier_account`, `customer_account`, `point_transaction` |
| `revenue_record` | 매출 인식 후보 | `revenue_id` | `contract_id`, `period`, `revenue_type`, `amount`, `source_system` | `contract`, `profitability_snapshot` |
| `cost_record` | 원가/운영비 후보 | `cost_id` | `cost_type`, `allocation_key`, `amount`, `period`, `source_system` | `customer_account`, `supplier_account`, `work_item` |
| `cs_case` | 문의/이슈 처리 | `case_id` | `account_type`, `account_id`, `case_type`, `priority`, `status`, `opened_at`, `closed_at` | `customer_account`, `supplier_account`, `employee_account`, `work_item` |
| `work_item` | 운영 업무 큐 | `work_item_id` | `work_type`, `status`, `assignee_id`, `sla_due_at`, `started_at`, `completed_at` | `customer_account`, `supplier_account`, `contract`, `cs_case` |
| `activity_log` | 접촉/변경/처리 이력 | `activity_id` | `actor_id`, `activity_type`, `account_type`, `account_id`, `occurred_at` | `customer_account`, `supplier_account`, `contract`, `work_item` |
| `time_log` | 핵심 업무 이력/감사 후보 | `time_log_id` | `actor_id`, `target_entity`, `target_id`, `event_type`, `occurred_at` | 모든 핵심 엔티티, 감사로그 |

인당 생산성/마진 기여: 엔티티를 운영 대상과 지표 산출 단위 중심으로 정리해 조회, 배정, 정산, 수익성 분석의 공통 기준을 만든다.

## 7. Profitability Dashboard KPI 정의

| KPI | 산식 초안 | 차원 | 원천 데이터 후보 | 확정 상태 | KPI 영향 |
|---|---|---|---|---|---|
| `gross_revenue` | `sum(revenue_record.amount)` | 고객사, 공급사, 계약, 월 | 계약/매출/정산 | 후보 | 매출 기여 고객과 공급사를 식별 |
| `sales_amount` | `sum(revenue_recognition.recognized_amount)` | 고객, 상품, 담당자, 파이프라인, 월 | 매출인식 | 회계 기준 승인 필요 | 실시간 매출 기준선 제공 |
| `fixed_cost_amount` | `salesAmount * 0.5` | 고객, 상품, 담당자, 파이프라인, 월 | 매출인식, 고정 산식 | PM 승인 필요 | MVP 기준 원가를 즉시 산출 |
| `fixed_sgna_amount` | `salesAmount * 0.5` | 고객, 상품, 담당자, 파이프라인, 월 | 매출인식, 고정 산식 | PM 승인 필요 | MVP 기준 판관비/일반관리비를 즉시 산출 |
| `fixed_operating_profit_amount` | `salesAmount - fixed_cost_amount - fixed_sgna_amount` | 고객, 상품, 담당자, 파이프라인, 월 | 매출인식, 고정 산식 | PM 승인 필요 | 고정 기준 대비 이익 훼손 원인 추적 |
| `fixed_operating_profit_rate` | `fixed_operating_profit_amount / salesAmount` | 고객, 상품, 담당자, 파이프라인, 월 | 매출인식, 고정 산식 | PM 승인 필요 | 슈퍼바이저 이익률 모니터링 |
| `jaewon_cost_amount` | `profit_cost_input` 중 표시명 `제원원가`의 적용 금액 또는 비율 환산액 | 전사, 고객, 상품, 기간, 산식 버전 | 수익성 비용 입력 | 의미 PM 승인 필요 | 원가 항목의 이익 영향 분리 |
| `selling_admin_expense_amount` | `profit_cost_input` 중 `판관비`의 적용 금액 또는 비율 환산액 | 전사, 고객, 상품, 기간, 산식 버전 | 수익성 비용 입력 | PM 승인 필요 | 판매관리비 영향 분리 |
| `general_admin_expense_amount` | `profit_cost_input` 중 `일반관리비`의 적용 금액 또는 비율 환산액 | 전사, 고객, 상품, 기간, 산식 버전 | 수익성 비용 입력 | PM 승인 필요 | 일반관리비 영향 분리 |
| `versioned_operating_profit_amount` | `sales_amount - jaewon_cost_amount - selling_admin_expense_amount - general_admin_expense_amount` | 전사, 고객, 상품, 기간, 산식 버전 | 매출인식, 수익성 비용 입력 | PM 승인 필요 | 산식 버전별 영업이익 추적 |
| `profit_cost_change_count` | `count(profit_cost_input_history_id)` | 비용항목, 변경자, 적용범위, 월 | 비용 입력 변경 이력 | 후보 | 비용 입력 변경 빈도와 검증 부담 측정 |
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
| `pipeline_weighted_amount` | `sum(expected_amount * probability)` | 고객, 담당자, 단계, 월 | 영업 파이프라인 | 후보 | 예상 매출과 담당자 집중도 판단 |
| `quote_conversion_rate` | `contracted_quote_count / issued_quote_count` | 고객, 상품, 담당자, 월 | 견적, 계약 | 후보 | 견적 품질과 할인 정책 개선 |
| `assigned_customer_count` | `count(distinct customer_account_id)` | 임직원, 담당 역할, 월 | 담당 배정 | 후보 | 임직원별 담당 거래처 부하 측정 |
| `customer_assignee_count` | `count(distinct employee_account_id)` | 거래처, 담당 역할, 월 | 담당 배정 | 후보 | 거래처별 담당 공백 또는 과다 배정 식별 |
| `primary_assignee_missing_count` | `count(customer_account_id where active primary assignment is null)` | 거래처, 조직, 월 | 담당 배정 | 대표 담당자 정책 승인 필요 | 대표 담당자 누락 거래처 식별 |
| `assignment_change_count` | `count(assignment_history_id)` | 거래처, 임직원, 변경유형, 월 | 담당 배정 이력, 타임로그 | 후보 | 조직 변경과 인수인계 부담 측정 |
| `order_fulfillment_lead_time` | `shipped_at - order_created_at` | 고객, 상품, 주문, 월 | 주문, 출고 | 후보 | 출고 병목과 납기 리스크 식별 |
| `delivery_exception_rate` | `delivery_exception_count / delivery_count` | 고객, 택배사, 상품, 월 | 배송 추적, 예외 큐 | 외부 연동 승인 필요 | 배송 문의와 반품 리스크 감소 |
| `invoice_issue_delay_days` | `issued_at - revenue_recognition_trigger_at` | 고객, 주문, 월 | 세금계산서, 거래명세표, 매출인식 | 후보 | 청구 지연과 미수 리스크 감소 |
| `approval_cycle_time_minutes` | `approval_completed_at - approval_requested_at` | 문건유형, 담당자, 월 | 결재, 타임로그 | 후보 | 결재 대기 병목 식별 |
| `time_log_event_count` | `count(time_log_id)` | 엔티티, 이벤트유형, 담당자, 월 | 타임로그 | 후보 | 변경/조회/승인 추적성 확보 |

인당 생산성/마진 기여: 매출만 보지 않고 원가와 운영 투입량까지 결합해 같은 인력으로 더 높은 마진을 낼 수 있는 계정 운영 정책을 만든다.

### 7.1 고정 영업이익 산식의 의미와 한계

| 항목 | 산식 | 의미 | 한계 |
|---|---|---|---|
| `salesAmount` | `sum(revenue_recognition.recognized_amount)` | 매출인식 기준 실시간 매출 후보 | 회계 인식 기준 확정 전에는 공식 매출이 아니다. |
| `costAmount` | `salesAmount * 0.5` | MVP에서 모든 매출에 동일 원가율 50%를 적용한 기준선 | 상품/공급사/배송/반품/정산 조건별 실제 원가 차이를 반영하지 못한다. |
| `sgnaAmount` | `salesAmount * 0.5` | MVP에서 판매관리비 및 일반관리비 50%를 적용한 기준선 | 담당자 투입시간, 결재 지연, CS, 예외 처리, 조직별 비용 차이를 반영하지 못한다. |
| `operatingProfit` | `salesAmount - costAmount - sgnaAmount` | 고정 기준 대비 영업이익 후보 | 원가 50%와 판관비/일반관리비 50%를 동시에 적용하면 기본값은 0이다. |
| `operatingProfitRate` | `operatingProfit / salesAmount` | 고정 기준 영업이익률 후보 | 매출이 0인 경우 산출할 수 없고, 실제 영업이익률로 오해하면 안 된다. |

고정 산식은 MVP에서 고객별/상품별/담당자별/파이프라인별 비교 기준선을 빠르게 만들기 위한 운영 지표다. 실제 영업이익을 확정하려면 상품별 원가, 할인, 반품, 배송비, 정산 수수료, 처리시간, 결재 지연, 미수/정산 지연, 회계 인식 기준을 별도로 반영해야 한다.

인당 생산성/마진 기여: 고정 산식의 한계를 명시해 잘못된 손익 판단을 막고, 이익 저하 원인 KPI를 통해 즉시 개선 가능한 업무 병목을 찾는다.

### 7.2 비용 입력 기반 산식 버전 모델

| 항목 | 후보 필드/값 | 의미 | 승인 필요 |
|---|---|---|---|
| 비용 항목 | `cost_component`: `jaewon_cost`, `selling_admin_expense`, `general_admin_expense` | 화면 표시명은 `제원원가`, `판관비`, `일반관리비`로 둔다. | `제원원가`가 제조원가, 상품원가, 기타 원가 중 무엇인지 PM 승인 필요 |
| 입력 방식 | `input_method`: `amount`, `ratio_to_sales` | 금액 직접 입력 또는 매출 대비 비율 입력 | 항목별 허용 방식 PM/재무 승인 필요 |
| 적용 범위 | `scope_type`: `company`, `product`, `customer`, `period` 및 `scope_ref_id` | 전사, 상품, 고객, 기간별 비용 입력 적용 | 범위 우선순위와 중복 적용 정책 승인 필요 |
| 적용일 | `effective_date`, `effective_from`, `effective_to` | 비용 입력 또는 산식 버전이 대시보드에 적용되는 기준일 | 소급 적용 허용 여부 승인 필요 |
| 산식 버전 | `formula_version_id`, `formula_status`, `approved_status` | 영업이익 산식과 비용 입력 조합의 버전 관리 | 최종 승인 전 대시보드 적용 여부 승인 필요 |
| 변경 이력 | `profit_cost_input_history`, `time_log`, 감사로그 | 변경 전후 값, 변경자, 변경 사유, 적용 범위, 적용일 저장 | 로그 보존기간과 감사 접근권한 승인 필요 |

비용 입력 기반 산식은 기존 고정 50% 산식을 대체하거나 보완할 수 있는 후보 모델이다. 승인 전에는 고정 산식과 버전 산식을 모두 후보 지표로 표시하고, 공식 손익 산식으로 확정하지 않는다.

인당 생산성/마진 기여: 비용 입력값과 산식 버전을 분리해 잘못된 비용 입력이 전사 영업이익을 왜곡하는 일을 줄이고 변경 영향 추적 시간을 낮춘다.

## 8. 데이터 품질 기준

| 품질 항목 | 기준 | 실패 예 | 담당 |
|---|---|---|---|
| 식별자 유일성 | `customer_account_id`, `supplier_account_id`, `contract_id`는 중복 없어야 한다. | 같은 고객사가 영업/정산 시스템에서 다른 이름으로 중복 등록 | A4, 백엔드 |
| 참조 무결성 | 업무, CS, 정산, 활동 이력은 가능한 경우 계정 또는 계약을 참조해야 한다. | `work_item.account_id`가 없는 처리 이력 | A4, A2 |
| 최신성 | 대시보드 지표는 산출 기준일과 원천 반영 시각을 표시해야 한다. | 월 매출은 최신이나 CS는 2개월 전 데이터 | A4, A3 |
| 산식 재현성 | KPI는 산식, 필터, 분모, 제외 조건을 문서화해야 한다. | 마진율 산출에 어떤 비용이 들어갔는지 불명확 | A4, 재무 |
| 프로세스 연속성 | 영업활동부터 매출인식까지 단계별 참조 ID가 끊기지 않아야 한다. | 견적은 있으나 주문이나 매출인식과 연결되지 않음 | A4, A2 |
| 담당 배정 무결성 | 활성 배정은 존재하는 임직원과 거래처를 참조해야 하며 배정 기간이 겹치는 경우 정책 기준으로 검토해야 한다. | 퇴사 임직원이 활성 대표 담당자로 남아 있음 | A4, A2, A7 |
| 대표 담당자 정책 | 거래처별 활성 대표 담당자 1명 제한은 PM 승인 전 후보 규칙으로 둔다. | 같은 거래처에 활성 대표 담당자가 2명 이상 존재 | A4, PM |
| 배정 이력 완전성 | 담당 배정 생성, 역할 변경, 대표 담당 변경, 종료는 이력과 타임로그를 가져야 한다. | 담당자는 바뀌었으나 변경자와 변경 시각 없음 | A4, A7, A9 |
| 타임로그 완전성 | 핵심 상태 변경, 승인, 발행, 조회는 `time_log` 후보를 남겨야 한다. | 세금계산서 발행 상태 변경 이력 누락 | A4, A7, A9 |
| 비용 입력 재현성 | 제원원가, 판관비, 일반관리비 입력값은 산식 버전, 적용 범위, 적용일, 변경 사유를 가져야 한다. | 영업이익 값은 바뀌었으나 어떤 비용 입력이 적용됐는지 불명확 | A4, A7, A9 |
| 산식 버전 무결성 | `operating_profit_snapshot`은 적용된 `formula_version_id`와 산출 시각을 가져야 한다. | 대시보드 수치가 어느 산식 버전인지 알 수 없음 | A4, A3 |
| 비용 변경 이력 완전성 | 비용 입력 생성/수정/삭제는 변경 전후 값과 변경자를 남겨야 한다. | 판관비 비율은 바뀌었으나 변경 사유 없음 | A4, A7 |
| 개인정보 최소화 | 승인 전 개인정보/민감정보 원문 필드는 모델 확정에서 제외한다. | 주민등록번호, 건강정보 등 원문 저장 전제 설계 | A4, A7, PM |
| 데이터 계보 | 지표는 `source_system`, `source_record_id`, `loaded_at` 후보를 가져야 한다. | 정산 금액의 원천 거래를 추적할 수 없음 | A4, A6 |

인당 생산성/마진 기여: 품질 기준을 먼저 세워 대시보드 불신으로 인한 수기 검산과 재작업을 줄인다.

## 9. 승인 필요 항목

| 항목 | 승인 필요 사유 | 승인 전 처리 원칙 |
|---|---|---|
| 임직원 개인정보 필드 | 개인정보 처리범위 미확정 | `employee_account_id` 중심의 참조 식별자만 사용하고 원문 필드는 확정하지 않는다. |
| 임직원-거래처 배정 변경 권한 | 담당자 배정은 영업/운영 책임과 개인정보 접근 범위에 영향을 준다. | 권한 없는 사용자의 변경은 금지 후보로 두고 관리자 이상 제한 여부는 PM 승인 후 확정한다. |
| 거래처별 대표 담당자 1명 제한 | 조직 정책에 따라 복수 대표 또는 단일 대표가 달라질 수 있다. | `is_primary`는 후보 필드로 두고 유일성 제약은 PM 승인 후 확정한다. |
| 담당 역할 코드 | 주담당, 부담당, 승인담당, 참조담당의 명칭과 권한 영향 확정 필요 | `assignment_role` 후보 코드로만 정의하고 권한 매핑은 A7/PM 승인 후 확정한다. |
| 민감정보/건강정보/가족정보 | 민감정보 가능성 및 법적 리스크 | CRM Core 기본 모델에서 제외하고 별도 승인 후 최소 필드만 정의한다. |
| 고객사 담당자 연락처 | 개인정보 및 영업정보 가능성 | `contact_profile` 후보로만 두고 저장 필드, 열람권한, 보관기간은 승인 후 정의한다. |
| 공급사 정산 계좌정보 | 금융정보 및 접근통제 필요 | 정산 상태와 금액 모델은 정의하되 계좌 원문 필드는 승인 전 제외한다. |
| 원가 배부율과 인건비 단가 | 재무/인사 정책 정보 | KPI 후보 산식에만 두고 공식 지표로 확정하지 않는다. |
| 고정 영업이익 산식 적용 | 원가 50%, 판관비/일반관리비 50%는 PM 제시 MVP 기준이나 공식 회계 산식은 아니다. | 대시보드 후보 지표로만 사용하고 공식 손익 확정은 승인 후 진행한다. |
| `제원원가` 의미 확정 | PM 표현은 유지하되 제조원가/상품원가/기타 원가 중 정확한 회계 의미가 미확정이다. | `제원원가` 표시명과 `jaewon_cost` 후보 코드만 사용하고 공식 회계 매핑은 승인 후 정의한다. |
| 비용 입력 권한 | 제원원가, 판관비, 일반관리비 입력은 영업이익에 직접 영향을 준다. | `Master` 또는 `ProfitCostInputManager` 후보 권한만 입력 가능하도록 두고 권한 범위는 PM/A7 승인 후 확정한다. |
| 산식 버전 적용 정책 | 비용 입력 변경이 전사 영업이익에 영향을 줄 수 있다. | 적용 범위, 적용일, 소급 적용, 결재 필요 여부는 승인 전 후보로 둔다. |
| 택배사 실시간 배송 연동 | API, 비용, 계약, 송장번호 체계 확인 필요 | 수동 송장 입력과 상태 보정 큐까지 후보로 정의한다. |
| 세금계산서/거래명세표 외부 연동 | 발행 시스템, 인증, 위탁 범위 확인 필요 | 발행 상태와 금액 참조 모델만 우선 정의한다. |
| 외부 데이터 결합 | 위탁/재위탁 및 목적 외 이용 검토 필요 | 결합 목적, 보관기간, 접근권한 승인 전 구현하지 않는다. |

인당 생산성/마진 기여: 승인 게이트를 분리해 보안 사고 가능성과 사후 재설계 비용을 줄인다.

## 10. 인수조건

1. `CRM Core` 백엔드 설계자가 엔티티, 주요 식별자, 관계, 상태 값을 ERD 초안으로 전환할 수 있어야 한다.
2. `Profitability Dashboard` 담당자가 KPI별 산식, 차원, 원천 데이터 후보, 확정 상태를 확인할 수 있어야 한다.
3. 개인정보/민감정보 후보 필드는 확정 모델과 분리되어 PM 승인 필요 항목으로 표시되어야 한다.
4. 각 KPI는 최소 하나 이상의 원천 데이터 후보와 산출 불확실성을 가져야 한다.
5. 영업활동, 파이프라인, 견적, 계약, 주문, 출고, 배송, 세금계산서, 거래명세표, 매출인식, 영업이익, 타임로그 엔티티가 모델에 포함되어야 한다.
6. `employee_customer_assignment`로 임직원-거래처 다대다 배정, 대표 담당자, 담당 역할, 배정 이력, 타임로그 관계가 표현되어야 한다.
7. 제원원가, 판관비, 일반관리비 입력값, 산식 버전, 적용 범위, 적용일, 변경 이력 모델이 포함되어야 한다.
8. `제원원가` 용어는 PM 표현 그대로 두고 제조원가/상품원가/기타 원가 중 정확한 의미는 PM 승인 필요로 표시되어야 한다.
9. 원가 50%, 판관비/일반관리비 50% 고정 산식의 의미와 한계가 명시되어야 한다.
10. 모든 추측성 내용은 `가정` 또는 `후보`로 표시되어야 한다.
11. 각 주요 결정은 인당 생산성/마진 기여 문장을 포함해야 한다.

인당 생산성/마진 기여: 인수조건을 데이터 모델 전환 가능성과 지표 검증 가능성에 맞춰 후속 개발자의 해석 비용을 줄인다.

## 11. 의존성 및 담당

| 의존 항목 | 담당 | A4 관점 필요 산출 |
|---|---|---|
| P0 `CRM Core` 화면/백엔드 경계 | A1, A2 | 엔티티 ID, 조회 단위, 권한 참조 단위 |
| 임직원-거래처 배정 | A2, A3, A4, A7 | `employee_customer_assignment`, 대표 담당자, 담당 역할, 배정 변경 권한, 타임로그 |
| P0 `Operations Console` | A2, A3, A8 | `work_item`, 처리시간, SLA, 업무유형 코드 |
| P0 `Security & Audit Baseline` | A1, A2, A7, A9 | 개인정보 승인 게이트, 접근로그 참조 기준 |
| P0 `Profitability Dashboard` | A3, A4 | KPI 산식, 집계 차원, 데이터 품질 기준 |
| 수익성 비용 입력 설정 | A3, A7, A2, A4, A8, A9 | 제원원가/판관비/일반관리비 입력값, 산식 버전, 적용 범위, 변경 이력, 입력 권한 |
| 유통 프로세스 요구사항 | A2, A3, A4, A6, A7 | 영업활동부터 매출인식까지 엔티티와 상태 흐름 |
| P1 `Settlement & Point Ops` | A2, A4, A5, A6, A7 | 포인트/정산 원천 데이터와 예외 상태 코드 |
| 연동 현황 | A6 | `source_system`, `source_record_id`, 적재 주기 후보 |
| PM 승인 | PM 김권일 | 개인정보 범위, `제원원가` 의미, 비용 입력 권한, 산식 버전 적용 정책, 고정 영업이익 산식 적용, 원가 배부 정책, 외부계약, 아키텍처 확정 |

인당 생산성/마진 기여: 의존성을 명확히 해 A4가 확정할 수 없는 정책 항목 때문에 P0 데이터 설계가 멈추지 않게 한다.

## 12. 가정

- 가정: 고객사 약 2,800개와 임직원 약 260만 명 이상 규모를 고려해 조회/집계는 계정과 계약 단위 식별자를 중심으로 설계한다.
- 가정: 레거시 CRM, 포인트, 정산, CS, 외부 연동의 실제 스키마와 API 명세는 아직 제공되지 않았다.
- 가정: MVP의 수익성 지표는 재무제표 확정 수치가 아니라 운영 의사결정용 후보 지표로 시작한다.
- 가정: 임직원 원문 개인정보는 PM 승인 전 CRM 360 모델에 확정 필드로 포함하지 않는다.
- 가정: 운영 투입량은 초기에는 `work_item` 상태 전환 시각과 담당자 배정 이력을 기준으로 측정한다.
- 가정: 임직원과 거래처의 담당 관계는 직접 FK가 아니라 `employee_customer_assignment` 다대다 배정으로 관리한다.
- 가정: 담당 역할은 `primary_owner`, `secondary_owner`, `approval_owner`, `observer` 후보 코드로 시작하되 명칭과 권한 효과는 PM/A7 승인 후 확정한다.
- 가정: 거래처별 대표 담당자 1명 제한은 후보 품질 규칙이며 PM 승인 전 물리 유일성 제약으로 확정하지 않는다.
- 가정: `PROCESS_REQUIREMENTS.md`의 유통형 업무 흐름은 기존 선택적복지 CRM Core에 추가되는 영업-매출인식 확장 요구로 해석한다.
- 가정: 원가 50%와 판관비/일반관리비 50% 산식은 공식 회계 손익이 아니라 슈퍼바이저 대시보드의 MVP 기준선이다.
- 가정: `제원원가`는 PM 표현 그대로 사용하며, 제조원가/상품원가/기타 원가 중 정확한 회계 의미는 PM 승인 전 확정하지 않는다.
- 가정: 비용 입력은 `Master` 또는 `ProfitCostInputManager` 후보 권한을 가진 사용자만 가능하되, 실제 권한 범위와 결재 필요 여부는 PM/A7 승인 후 확정한다.
- 가정: 비용 입력 기반 산식 버전은 공식 손익 산식이 아니라 승인 전 대시보드 후보 지표다.
- 가정: 배송 실시간 위치, 세금계산서, 거래명세표 외부 연동은 계약/API/비용 확인 전까지 원천 후보와 상태 모델만 정의한다.

인당 생산성/마진 기여: 가정을 명시해 불확실한 원천 시스템과 정책을 확정값처럼 개발하는 낭비를 줄인다.

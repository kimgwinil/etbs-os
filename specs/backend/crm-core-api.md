# CRM Core 및 유통 프로세스 API 스펙 초안

## 1. 문서 목적

이 문서는 A2 백엔드 산출물의 구현 기준 스펙으로, CRM Core와 Operations Console이 제공해야 할 API 리소스, 행위, 상태, 입력, 출력, 권한 검사, 감사로그 요구사항을 정의한다.

본 문서는 개발 확정안이 아니며, 개인정보 처리범위, 외부 발행/배송 연동, 공식 회계 기준, 아키텍처와 인프라 제품 선택은 PM 김권일 승인 후 확정한다.

인당 생산성/마진 기여: 구현자가 같은 API 계약으로 화면, 배치, 연동을 연결하게 해 중복 개발과 수기 업무 전환 비용을 줄인다.

## 2. 공통 API 규칙

### 2.1 기본 경로와 버전

- 기본 경로: `/api/v1`
- 응답 형식: JSON
- 목록 조회: 커서 기반 페이지네이션
- 쓰기 요청: `Idempotency-Key` 헤더 권장, 발행/외부연동/금액 변경은 필수
- 추적 헤더: `X-Request-Id`, `X-Tenant-Id`, `X-Actor-Id`

인당 생산성/마진 기여: 공통 호출 규칙을 정해 프론트와 연동 개발자가 API마다 예외 처리를 다시 만들지 않게 한다.

### 2.2 공통 요청 메타데이터

```json
{
  "request_id": "req_01H...",
  "tenant_id": "tenant_123",
  "tenant_type": "client_company",
  "actor_user_id": "user_123",
  "reason_code": "customer_request",
  "access_purpose": "order_fulfillment"
}
```

인당 생산성/마진 기여: 요청 사유와 액터를 표준화해 감사 추적과 오류 원인 확인 시간을 줄인다.

### 2.3 공통 응답 오류

| 코드 | 의미 | 사용 조건 |
|---|---|---|
| `400 invalid_request` | 요청 형식 오류 | 필수 필드 누락, 타입 오류 |
| `401 unauthorized` | 인증 실패 | 로그인 또는 토큰 필요 |
| `403 tenant_forbidden` | 테넌트 범위 초과 | 대상 리소스가 `tenant_scope` 밖 |
| `403 permission_denied` | 역할 권한 부족 | 승인, 발행, 다운로드 등 권한 없음 |
| `409 invalid_state_transition` | 상태 전이 오류 | 현재 상태에서 허용되지 않는 액션 |
| `409 approval_required` | 결재 필요 | 할인, 금액, 발행, 매출조정 등 |
| `409 approval_line_required` | 결재라인 필요 | 입사등록 또는 결재 대상 업무 상신 전 결재라인 없음 |
| `409 idempotency_conflict` | 멱등 키 충돌 | 같은 키로 다른 payload 요청 |
| `422 purpose_required` | 접근 목적 누락 | 개인정보 상세/다운로드/마스킹 해제 |
| `422 reason_required` | 처리 사유 누락 | 반려, 보류, 담당 배정 변경, 고위험 상태 변경 |
| `429 rate_limited` | 호출 제한 | 대량 조회/외부 연동 보호 |

인당 생산성/마진 기여: 오류 코드를 표준화해 운영자와 개발자가 실패 원인을 빠르게 분류하고 재처리한다.

## 3. 공통 보안, 테넌트, 로그 요구

| API 유형 | 권한 검사 | 로그 |
|---|---|---|
| 목록 조회 | 인증, 역할, 서버 측 `tenant_scope` 필터 | 일반 조회 감사 후보, 개인정보 포함 시 `privacy_access_log` |
| 상세 조회 | 인증, 역할, 테넌트, 필요 시 업무 목적 | 개인정보 상세이면 `privacy_access_log` 필수 |
| 생성/수정/삭제 | 인증, 역할, 테넌트, 상태 전이 | `audit_log` 필수 |
| 상태 변경 | 인증, 역할, 테넌트, 상태 전이, 결재 조건 | `audit_log`, 필요 시 `time_log` |
| 발행/외부연동 | 인증, 역할, 멱등성, 결재 조건 | `audit_log`, `integration_log` |
| 다운로드/마스킹 해제 | 인증, 고위험 권한, 업무 목적, 승인 ID | `privacy_access_log`, `audit_log` |

인당 생산성/마진 기여: 보안 검사를 API 유형별로 고정해 권한 누락과 감사 보완 작업을 줄인다.

### 3.1 A2 요구사항 추적 반영

| 요구 ID | API 반영 위치 | 명확화 내용 |
|---|---|---|
| R01 | `sales_activities` | 영업활동 생성 시 타임로그와 파이프라인 전환 API를 연결 |
| R02 | `opportunities`, `quotes` | 파이프라인 생성, 단계 전이, 견적 발행/버전/결재 상태를 분리 |
| R03 | `contracts` | 계약 활성화와 주문 전환 조건을 상태로 검증 |
| R04 | `sales_orders` | 계약 기반 주문 등록 필수값과 출고 요청 조건을 정의 |
| R05 | `shipments`, `delivery_statuses` | 출고 완료, 부분 출고, 배송 예외 상태를 분리 |
| R06 | `tax_invoices`, `transaction_statements` | 발행, 취소, 정정, 재조회, 통합로그 조건을 정의 |
| R07 | `revenue_recognitions` | 매출 후보, 승인, 확정, 조정, 역처리 상태를 분리 |
| R13 | `client_companies` | 고객 신규 저장은 `POST /client-companies` 성공으로 신규 고객 생성 완료 |
| R14 | `client_companies` | 고객 수정 저장은 `PATCH /client-companies/{id}` 성공과 변경 이력 생성으로 변경 완료 |
| R15 | `products`, `quotes` | `sale_price`를 상품 필수 필드 및 견적 품목 별도 필드로 노출 |
| R18 | `approval_requests` | 상신자는 로그인 사용자 `actor_user_id`로 자동 지정, 클라이언트 임의 지정 불가 |
| R22 | `time_logs` | 로그 대상별 타임로그 생성 조건을 API 트리거로 명시 |
| 추가 | `employee-customer-assignments` | 직원 1명은 여러 거래처, 거래처 1곳은 여러 담당자를 가질 수 있는 다대다 배정 API |
| 추가 | `approval_requests` | 결재/승인/반려/보류/회수 버튼별 결과 상태, 사유, 로그, 권한 검사 |
| 추가 | `employee-onboarding-requests` | 입사등록 `승인상태`를 실제 결재문건 상태로 투영하고 최종 승인 전 계정 활성화 차단 |
| 추가 | `profit-cost-settings` | 제원원가/판관비/일반관리비 입력을 `Master` 또는 `ProfitCostInputManager` 후보 권한으로 제한 |

인당 생산성/마진 기여: 추적표 요구 ID와 API 반영 위치를 연결해 누락 검토와 QA 재확인 시간을 줄인다.

## 4. 리소스별 API 계약

### 4.1 고객사 `client_companies`

| 항목 | 내용 |
|---|---|
| 목적 | 고객사 기준 데이터를 등록, 수정, 조회하고 영업/계약/주문 흐름의 계정 기준으로 사용한다. |
| 입력 | `name`, `business_registration_number`, `status`, `segment`, `owner_user_id`, `contact_ids` |
| 출력 | `client_company_id`, 상태, 담당자, 계약/활동 요약, 감사 메타데이터 |
| DoD | 고객 신규 저장은 `POST /client-companies` 성공 시 신규 `client_company_id`를 반환해야 한다. 고객 수정 저장은 `PATCH /client-companies/{client_company_id}` 성공 시 변경 완료로 간주하고 변경 필드가 있을 때만 변경 이력, 감사로그, 타임로그를 남긴다. 같은 사업자번호 중복 후보를 반환한다. 목록은 개인정보 담당자 연락처 원문을 기본 제외한다. |
| 의존성 | A4 계정 모델, A7 개인정보 승인, A3 고객 화면 |
| 담당 | A2, 협업 A4/A7 |
| KPI 영향 | 고객 등록 중복 감소, 고객 조회 시간 감소 |

| Method | Path | 행위 | 상태/조건 | 권한 | 로그 |
|---|---|---|---|---|---|
| `GET` | `/client-companies` | 고객사 목록 | `status`, `owner_user_id`, 검색어, 커서 | `crm.client.read` | 개인정보 포함 시 접근로그 |
| `POST` | `/client-companies` | 고객 신규 저장 | 중복 후보 확인, 성공 시 신규 고객 생성 완료 | `crm.client.write` | 감사로그, 타임로그 |
| `GET` | `/client-companies/{client_company_id}` | 고객사 상세 | 테넌트 범위 필요 | `crm.client.read` | 상세 조회 로그 후보 |
| `PATCH` | `/client-companies/{client_company_id}` | 고객 수정 저장 | 변경 사유 필요, 변경 필드 없으면 무변경 응답 | `crm.client.write` | 감사로그, 타임로그 |
| `GET` | `/client-companies/{client_company_id}/timeline` | 활동/계약/주문 타임라인 | 기간 필터 | `crm.timeline.read` | 개인정보 포함 시 접근로그 |

인당 생산성/마진 기여: 고객사를 모든 후속 업무의 기준 ID로 만들어 부서별 별도 고객명 매칭을 줄인다.

### 4.2 공급사 `suppliers`

| 항목 | 내용 |
|---|---|
| 목적 | 공급사/입점사 기준 데이터를 관리하고 상품, 출고, 정산, 배송 예외의 기준으로 사용한다. |
| 입력 | `name`, `supplier_type`, `category_group`, `status`, `owner_user_id`, `settlement_cycle` |
| 출력 | `supplier_id`, 상태, 담당자, 상품/주문/정산 요약 |
| DoD | 타 공급사 데이터 접근은 차단된다. 정산 계좌 원문 필드는 PM 승인 전 제외한다. |
| 의존성 | A4 공급사 모델, A6 공급사 연동, A7 금융/개인정보 통제 |
| 담당 | A2, 협업 A4/A6/A7 |
| KPI 영향 | 공급사 문의 대응 시간 감소, 정산/출고 매칭 오류 감소 |

| Method | Path | 행위 | 상태/조건 | 권한 | 로그 |
|---|---|---|---|---|---|
| `GET` | `/suppliers` | 공급사 목록 | 상태, 카테고리, 담당자 필터 | `crm.supplier.read` | 조회 로그 후보 |
| `POST` | `/suppliers` | 공급사 생성 | 중복 후보 확인 | `crm.supplier.write` | 감사로그 |
| `GET` | `/suppliers/{supplier_id}` | 공급사 상세 | 테넌트 범위 필요 | `crm.supplier.read` | 개인정보 포함 시 접근로그 |
| `PATCH` | `/suppliers/{supplier_id}` | 공급사 수정 | 변경 사유 필요 | `crm.supplier.write` | 감사로그 |

인당 생산성/마진 기여: 공급사 운영 기준을 통합해 상품/출고/정산 담당자의 반복 확인을 줄인다.

### 4.3 임직원 `employees`

| 항목 | 내용 |
|---|---|
| 목적 | 고객사 소속 임직원 참조 식별자를 조회하고 주문/포인트/CS와 연결한다. |
| 입력 | `client_company_id`, 외부 임직원 참조 ID, 자격 상태 후보 |
| 출력 | `employee_id`, `client_company_id`, 마스킹된 식별 정보, 상태 |
| DoD | `client_company_id` 없는 목록 조회는 금지한다. 개인정보 원문 필드는 PM 승인 필요이다. |
| 의존성 | A4 임직원 모델, A7 개인정보 처리범위, 베네카페/레거시 연동 |
| 담당 | A2, 협업 A4/A6/A7 |
| KPI 영향 | 임직원 문의 처리시간 감소, 개인정보 노출 리스크 감소 |

| Method | Path | 행위 | 상태/조건 | 권한 | 로그 |
|---|---|---|---|---|---|
| `GET` | `/employees?client_company_id={id}` | 임직원 목록 | 고객사 범위 필수 | `crm.employee.read_masked` | 개인정보 검색노출 로그 후보 |
| `GET` | `/employees/{employee_id}` | 임직원 상세 | 업무 목적 필요 | `crm.employee.read_detail` | 개인정보 접근로그 |
| `PATCH` | `/employees/{employee_id}` | 임직원 참조 상태 수정 | 변경 사유 필요 | `crm.employee.write` | 감사로그, 개인정보 접근로그 |

인당 생산성/마진 기여: 임직원 데이터 접근을 제한적으로 표준화해 문의 처리는 가능하게 하면서 보안 사고 비용을 낮춘다.

### 4.3.1 임직원-거래처 담당 배정 `employee_customer_assignments`

| 항목 | 내용 |
|---|---|
| 목적 | 직원 1명이 여러 거래처를 담당하고, 거래처 1곳도 여러 담당자를 가질 수 있도록 다대다 담당 배정을 관리한다. |
| 입력 | `employee_account_id`, `customer_account_id`, `assignment_role`, `is_primary`, `effective_from`, `effective_to`, `assignment_reason` |
| 출력 | `assignment_id`, 직원별 담당 거래처 목록, 거래처별 담당자 목록, 대표 담당자, 역할, 배정 상태, 변경 이력 |
| DoD | 같은 직원에게 여러 거래처를 배정할 수 있어야 한다. 같은 거래처에 여러 직원을 배정할 수 있어야 한다. 생성/역할 변경/대표 담당자 변경/종료는 권한 검사, 사유 입력, 타임로그, 감사로그를 요구한다. |
| 의존성 | `employee_account`, `customer_account`, A4 데이터 모델, A7 권한/감사 기준, PM 대표 담당자 정책 |
| 담당 | A2, 협업 A3/A4/A7/A8 |
| KPI 영향 | 담당자 공백 감소, 거래처 문의 라우팅 시간 감소, 인수인계 시간 감소 |

| Method | Path | 행위 | 상태/조건 | 권한 | 로그 |
|---|---|---|---|---|---|
| `GET` | `/employee-customer-assignments` | 담당 배정 목록 | 직원, 거래처, 역할, 상태 필터 | `assignment.read` | 조회 로그 후보 |
| `POST` | `/employee-customer-assignments` | 담당 배정 생성 | 직원/거래처/역할/사유 필수 | `assignment.write` | 감사로그, 타임로그 |
| `PATCH` | `/employee-customer-assignments/{assignment_id}` | 역할/기간/대표 여부 수정 | 변경 사유 필수, 대표 담당자 정책 검증 | `assignment.write` | 감사로그, 타임로그 |
| `POST` | `/employee-customer-assignments/{assignment_id}/end` | 담당 배정 종료 | 종료일/종료 사유 필수 | `assignment.write` | 감사로그, 타임로그 |
| `GET` | `/employees/{employee_id}/customer-assignments` | 직원별 담당 거래처 조회 | 활성/종료 포함 필터 | `assignment.read` | 조회 로그 후보 |
| `GET` | `/client-companies/{client_company_id}/employee-assignments` | 거래처별 담당자 조회 | 대표 담당자 우선 정렬 | `assignment.read` | 조회 로그 후보 |

| 필드 | 값 후보 | 설명 |
|---|---|---|
| `assignment_role` | `primary`, `secondary`, `approval_owner`, `observer` | 주담당, 부담당, 승인담당, 참조담당 후보 |
| `assignment_status` | `active`, `scheduled`, `ended`, `cancelled` | 배정 상태 |
| `is_primary` | `true`, `false` | 거래처 대표 담당자 여부. 거래처별 1명 제한은 PM 승인 필요 |

인당 생산성/마진 기여: 담당 배정을 관계 리소스로 분리해 조직 변경과 거래처 확대 시 데이터 재구성 없이 업무 분담을 조정한다.

### 4.3.2 입사등록 결재 `employee_onboarding_requests`

| 항목 | 내용 |
|---|---|
| 목적 | 입사등록의 `approval_status`를 연결된 결재문건 상태로 관리하고, 최종 승인 전 임직원 계정 활성화와 권한 부여 완료를 차단한다. |
| 입력 | 입사등록 대상자 정보 후보, 입사 예정일, 소속/부서 후보, 직무/권한 후보, 상신 사유, 결재라인 |
| 출력 | `employee_onboarding_request_id`, `approval_request_id`, `approval_status`, 현재/다음/최종 결재자, 승인/반려/보류 이력, 활성화 상태 |
| DoD | 입사등록 저장만으로 승인 완료가 되지 않는다. 결재라인이 없으면 상신 API는 `409 approval_line_required`를 반환한다. 최종 승인 전에는 계정 활성화 API가 `409 approval_required`로 차단된다. 승인/반려/보류/활성화는 사유, 권한 검사, 타임로그, 감사로그를 남긴다. |
| 의존성 | `approval_requests`, `approval_lines`, `employee_account`, A7 권한/감사 기준, PM 활성화 방식 승인 |
| 담당 | A2, 협업 A3/A7/A8/A9 |
| KPI 영향 | 승인 없는 계정 활성화 감소, HR 승인 누락 감소, 권한 오부여 재작업 감소 |

| Method | Path | 행위 | 상태/조건 | 권한 | 로그 |
|---|---|---|---|---|---|
| `GET` | `/employee-onboarding-requests` | 입사등록 목록 | 결재상태, 입사예정일, 소속 필터 | `hr.onboarding.read` | 조회 로그 후보 |
| `POST` | `/employee-onboarding-requests` | 입사등록 초안 생성 | 대상자/입사예정일 필수, 상태 `draft` | `hr.onboarding.write` | 감사로그, 타임로그 |
| `GET` | `/employee-onboarding-requests/{onboarding_id}` | 입사등록 상세 | 결재문건 상태와 타임라인 포함 | `hr.onboarding.read` | 조회 로그 후보 |
| `PATCH` | `/employee-onboarding-requests/{onboarding_id}` | 입사등록 수정 | `draft`, `rejected`, `on_hold` 후보에서만 수정 | `hr.onboarding.write` | 감사로그, 타임로그 |
| `POST` | `/employee-onboarding-requests/{onboarding_id}/approval-request` | 결재문건 생성/연결 | 상신자 `actor_user_id` 자동 지정 | `approval.write` | 감사로그, 타임로그 |
| `PATCH` | `/employee-onboarding-requests/{onboarding_id}/approval-line` | 결재라인 설정 | 결재자 1명 이상, 최종 결재권자 지정 후보 | `approval.write` | 감사로그, 타임로그 |
| `POST` | `/employee-onboarding-requests/{onboarding_id}/submit` | 입사등록 결재 상신 | 결재라인 없으면 `409 approval_line_required` | `approval.submit` | 감사로그, 타임로그 |
| `POST` | `/employee-onboarding-requests/{onboarding_id}/activate-employee` | 임직원 계정 활성화 | 최종 승인 전 `409 approval_required`, 승인 후 `employee_activation_pending`만 허용 | `hr.onboarding.activate` | 감사로그, 타임로그 |

| 필드 | 설명 |
|---|---|
| `approval_status` | 별도 수동 상태가 아니라 연결된 `approval_request.status`와 활성화 상태의 투영값 |
| `approval_request_id` | 입사등록 결재문건 ID |
| `activation_status` | `not_allowed`, `employee_activation_pending`, `activated` |
| `activation_policy` | 자동 활성화 또는 관리자 확인 후 활성화. PM 승인 필요 |

인당 생산성/마진 기여: 입사등록과 계정 활성화를 결재 API로 묶어 승인 누락과 권한 오부여에 따른 재작업을 줄인다.

### 4.3.3 수익성 비용 입력 설정 `profit_cost_settings`

| 항목 | 내용 |
|---|---|
| 목적 | 설정 메뉴에서 제원원가, 판관비, 일반관리비를 권한 있는 사용자만 입력/수정/삭제하고 산식 버전과 변경 전후 값을 감사 가능하게 관리한다. |
| 입력 | `cost_type`, `input_method`, `amount`, `rate`, `apply_scope`, `effective_from`, `formula_version`, `change_reason`, `approval_id` 후보 |
| 출력 | `profit_cost_setting_id`, 비용 유형, 현재 값, 변경 전후 값, 적용일, 적용 범위, 산식 버전, 변경자, 결재 상태 후보 |
| DoD | `Master` 또는 `ProfitCostInputManager` 후보 권한이 없으면 생성/수정/삭제가 차단된다. 변경 사유, 적용일, 적용 범위, 산식 버전, 변경 전후 값이 감사로그에 남아야 한다. 권한 없는 저장 시도도 로그로 남긴다. 결재 대상 후보인 변경은 최종 승인 전 대시보드 공식 반영이 차단된다. |
| 의존성 | A4 수익성 지표, A7 권한/감사 기준, A3 설정 화면, A8 권한/산식 QA, PM 비용 권한/결재 정책 승인 |
| 담당 | A2, 협업 A3/A4/A7/A8/A9 |
| KPI 영향 | 영업이익 산식 신뢰도 유지, 비용 입력 오류 감소, 대시보드 재검산 시간 감소 |

| Method | Path | 행위 | 상태/조건 | 권한 | 로그 |
|---|---|---|---|---|---|
| `GET` | `/settings/profit-cost-settings` | 비용 설정 목록 | 비용 유형, 적용일, 적용 범위 필터 | `profit_cost.read` | 조회 로그 후보 |
| `POST` | `/settings/profit-cost-settings` | 비용 설정 생성 | 변경 사유, 적용일, 산식 버전 필수 | `profit_cost.write` with `Master` 또는 `ProfitCostInputManager` | 감사로그, 타임로그 |
| `PATCH` | `/settings/profit-cost-settings/{setting_id}` | 비용 설정 수정 | 변경 전후 값, 변경 사유, 적용일, 산식 버전 필수 | `profit_cost.write` with `Master` 또는 `ProfitCostInputManager` | 감사로그, 타임로그 |
| `POST` | `/settings/profit-cost-settings/{setting_id}/delete` | 비용 설정 삭제 후보 | 삭제 사유, 적용 종료일 필수 | `profit_cost.write` with `Master` 또는 `ProfitCostInputManager` | 감사로그, 타임로그 |
| `POST` | `/settings/profit-cost-settings/{setting_id}/submit-approval` | 비용 변경 결재 상신 후보 | 전사 영향 또는 정책상 결재 대상 | `approval.submit` | 감사로그, 타임로그 |
| `GET` | `/settings/profit-formula-versions` | 산식 버전 목록 | 현재 적용 버전 포함 | `profit_cost.read` | 조회 로그 후보 |

| 필드 | 값 후보 | 설명 |
|---|---|---|
| `cost_type` | `spec_cost`, `selling_admin_expense`, `general_admin_expense` | 제원원가, 판관비, 일반관리비. `spec_cost`의 정확한 회계 의미는 PM 승인 필요 |
| `input_method` | `amount`, `rate` | 금액 또는 매출 대비 비율 |
| `apply_scope` | `company`, `product`, `customer`, `period` | 적용 범위 후보 |
| `formula_version` | 문자열 또는 버전 ID | 대시보드가 표시해야 하는 산식 버전 |
| `before_value`, `after_value` | 금액 또는 비율 | 감사로그 필수 |

권한 없는 사용자가 저장 API를 호출하면 `403 permission_denied`를 반환하고 `profit_cost_setting_denied` 감사 이벤트를 남긴다.

인당 생산성/마진 기여: 비용 입력 API를 권한과 변경 이력 중심으로 통제해 수익성 지표 왜곡과 재검산 시간을 줄인다.

### 4.4 상품 `products`

| 항목 | 내용 |
|---|---|
| 목적 | 견적, 주문, 매출 계산에 필요한 판매상품과 판매가격 후보를 제공한다. |
| 입력 | `supplier_id`, `name`, `sku`, `sale_price`, `currency`, `tax_type`, `effective_from`, `status` |
| 출력 | `product_id`, `sale_price`, 통화, 공급사, 판매 가능 상태, 가격 변경 이력 후보 |
| DoD | `sale_price` 없는 판매상품 저장은 거부한다. 상품 목록과 견적 품목 응답에는 `sale_price`가 별도 필드로 노출된다. 가격 변경은 감사로그와 타임로그 후보를 남긴다. |
| 의존성 | 공급사, A4 상품/매출 모델, PM 가격 정책 |
| 담당 | A2, 협업 A3/A4/A6 |
| KPI 영향 | 견적 작성 시간 감소, 가격 오류와 마진 훼손 감소 |

| Method | Path | 행위 | 상태/조건 | 권한 | 로그 |
|---|---|---|---|---|---|
| `GET` | `/products` | 상품 목록 | 공급사, 상태, 검색어 필터, `sale_price` 별도 반환 | `product.read` | 조회 로그 후보 |
| `POST` | `/products` | 상품 등록 | 공급사와 `sale_price` 필수 | `product.write` | 감사로그, 타임로그 후보 |
| `PATCH` | `/products/{product_id}` | 상품/가격 수정 | `sale_price` 변경 시 변경 사유 필요 | `product.write` | 감사로그, 타임로그 후보 |

인당 생산성/마진 기여: 상품 가격을 구조화해 견적 담당자의 수기 가격 확인과 할인 오류를 줄인다.

### 4.5 영업활동 `sales_activities`

| 항목 | 내용 |
|---|---|
| 목적 | 방문, 통화, 미팅, 제안 등 영업활동과 다음 액션, 타임로그를 남긴다. |
| 입력 | `account_type`, `account_id`, `contact_id`, `activity_type`, `content`, `next_action_at`, `started_at`, `ended_at` |
| 출력 | `sales_activity_id`, `time_log_id`, 파이프라인 후보 |
| DoD | 활동 생성 시 타임로그 생성 또는 연결이 가능하다. 본문 개인정보는 접근통제 대상이다. |
| 의존성 | 고객사/공급사/담당자, A7 개인정보 기준 |
| 담당 | A2, 협업 A3/A4/A7 |
| KPI 영향 | 활동 누락 감소, 담당자별 영업 생산성 측정 |

| Method | Path | 행위 | 상태/조건 | 권한 | 로그 |
|---|---|---|---|---|---|
| `GET` | `/sales-activities` | 활동 목록 | 계정, 담당자, 기간 필터 | `sales.activity.read` | 개인정보 포함 시 접근로그 |
| `POST` | `/sales-activities` | 활동 생성 | 계정 필수 | `sales.activity.write` | 감사로그, 타임로그 |
| `PATCH` | `/sales-activities/{activity_id}` | 활동 수정 | 작성자 또는 관리자 | `sales.activity.write` | 감사로그 |
| `POST` | `/sales-activities/{activity_id}/convert-to-opportunity` | 파이프라인 전환 | 중복 기회 확인 | `sales.opportunity.write` | 감사로그 |

인당 생산성/마진 기여: 활동에서 기회로 바로 전환해 영업 정보 재입력과 후속 누락을 줄인다.

### 4.6 파이프라인 `opportunities`

| 항목 | 내용 |
|---|---|
| 목적 | 영업 기회를 단계, 예상금액, 확률, 예상마감일로 관리하고 견적으로 연결한다. |
| 입력 | `account_id`, `product_items`, `expected_amount`, `probability`, `expected_close_date`, `owner_user_id` |
| 출력 | `opportunity_id`, 단계, 예상금액, 견적 후보 |
| DoD | 단계 변경은 허용 상태만 가능하다. 실패 처리에는 사유가 필요하다. |
| 의존성 | 활동, 상품, 고객사, 수익성 후보 지표 |
| 담당 | A2, 협업 A3/A4 |
| KPI 영향 | 영업 예측 정확도 향상, 저확률 기회 관리 비용 감소 |

| Method | Path | 행위 | 상태/조건 | 권한 | 로그 |
|---|---|---|---|---|---|
| `GET` | `/opportunities` | 파이프라인 목록 | 단계, 담당자, 예상마감일 필터 | `sales.opportunity.read` | 조회 로그 후보 |
| `POST` | `/opportunities` | 기회 생성 | 계정/금액 필수 | `sales.opportunity.write` | 감사로그 |
| `PATCH` | `/opportunities/{opportunity_id}` | 기회 수정 | 금액 변경 사유 필요 | `sales.opportunity.write` | 감사로그 |
| `POST` | `/opportunities/{opportunity_id}/stage-transitions` | 단계 변경 | 상태 전이 검증 | `sales.opportunity.write` | 감사로그, 타임로그 |
| `POST` | `/opportunities/{opportunity_id}/quotes` | 견적 생성 | 상품/가격 필수 | `quote.write` | 감사로그 |

인당 생산성/마진 기여: 단계 전이를 강제해 관리자가 지연 단계와 예상 매출을 빠르게 파악한다.

### 4.7 견적 `quotes`

| 항목 | 내용 |
|---|---|
| 목적 | 견적서 생성, 버전 관리, 결재 요청, 발행, 계약 전환을 처리한다. |
| 입력 | `opportunity_id`, `items.product_id`, `items.sale_price`, `items.quote_unit_price`, `discounts`, `valid_until`, `approval_line_id`, `notes` |
| 출력 | `quote_id`, `quote_version_id`, 상태, 승인 문건, 계약 후보 |
| DoD | 발행된 견적 버전은 수정하지 않고 새 버전을 만든다. 견적 품목은 상품 기준 `sale_price`와 실제 견적 적용가 `quote_unit_price`를 분리해 저장한다. 할인/금액 임계값은 PM 승인 정책에 따른다. |
| 의존성 | 상품, 파이프라인, 결재, PM 할인 정책 |
| 담당 | A2, 협업 A3/A7 |
| KPI 영향 | 견적 작성/수정 시간 감소, 할인 통제 강화 |

| Method | Path | 행위 | 상태/조건 | 권한 | 로그 |
|---|---|---|---|---|---|
| `GET` | `/quotes` | 견적 목록 | 상태, 고객, 담당자 필터 | `quote.read` | 조회 로그 후보 |
| `POST` | `/quotes` | 견적 생성 | 멱등 키 권장 | `quote.write` | 감사로그 |
| `GET` | `/quotes/{quote_id}` | 견적 상세 | 테넌트 검증 | `quote.read` | 조회 로그 후보 |
| `POST` | `/quotes/{quote_id}/versions` | 새 버전 생성 | 기존 발행 버전 보존 | `quote.write` | 감사로그 |
| `POST` | `/quotes/{quote_id}/submit-approval` | 결재 상신 | 결재선 필수 | `approval.write` | 감사로그, 타임로그 |
| `POST` | `/quotes/{quote_id}/issue` | 견적 발행 | 승인 조건 확인 | `quote.issue` | 감사로그 |
| `POST` | `/quotes/{quote_id}/accept` | 견적 수락 | 유효기간 확인 | `quote.write` | 감사로그 |
| `POST` | `/quotes/{quote_id}/contracts` | 계약 전환 | 수락 또는 승인 필요 | `contract.write` | 감사로그 |

인당 생산성/마진 기여: 견적 버전과 승인 조건을 API로 고정해 재발행 혼선과 가격 손실을 줄인다.

### 4.8 결재 `approval_requests`

| 항목 | 내용 |
|---|---|
| 목적 | 견적, 계약, 발행, 매출인식 조정, 입사등록, 수익성 비용 변경 후보의 결재 문건과 결재라인을 관리한다. |
| 입력 | `target_type`, `target_id`, `title`, `approval_line`, `description`, `attachments`. `submitter_user_id`는 요청 본문에서 받지 않는다. |
| 출력 | `approval_request_id`, `submitter_user_id`, 결재 상태, 결재 단계, 최종 승인/반려 결과 |
| DoD | 작성자와 상신자는 로그인 임직원 `actor_user_id`로 자동 지정되며 클라이언트가 임의로 덮어쓸 수 없다. 결재 버튼은 상세/처리 화면 진입으로 상태를 바꾸지 않는다. 승인/반려/보류/회수 버튼은 각각 결과 상태, 사유 입력, 권한 검사, 타임로그, 감사로그 조건을 가진다. 결재라인은 임직원 목록에서 순서 변경 가능해야 한다. 대리상신 허용 여부는 PM 승인 필요이다. |
| 의존성 | 임직원/사용자 디렉터리, A7 결재 감사 기준, A3 UI |
| 담당 | A2, 협업 A3/A7/A9 |
| KPI 영향 | 승인 대기/누락 감소, 책임소재 확인 시간 감소 |

| Method | Path | 행위 | 상태/조건 | 권한 | 로그 |
|---|---|---|---|---|---|
| `GET` | `/approval-requests` | 결재함 조회 | 내 문건, 대기, 완료 필터 | `approval.read` | 조회 로그 후보 |
| `GET` | `/approval-requests/{approval_id}` | 결재 버튼, 상세/처리 화면 진입 | 상태 변경 없음, 결재 타임라인 반환 | `approval.read` 또는 현재 결재자 | 조회 로그 후보 |
| `POST` | `/approval-requests` | 결재 문건 생성 | `submitter_user_id = actor_user_id` 자동 지정, 본문 상신자 무시 또는 거부 | `approval.write` | 감사로그 |
| `PATCH` | `/approval-requests/{approval_id}/line` | 결재선 수정 | `draft` 상태만 | `approval.write` | 감사로그 |
| `POST` | `/approval-requests/{approval_id}/submit` | 상신 | 결재선 1명 이상, 작성자/상신자 일치 검증 | `approval.submit` | 감사로그, 타임로그 |
| `POST` | `/approval-requests/{approval_id}/approve` | 승인 버튼 | 현재 결재자만, 승인 의견 후보 | `approval.approve` | 감사로그, 타임로그 |
| `POST` | `/approval-requests/{approval_id}/reject` | 반려 버튼 | 현재 결재자만, 반려 사유 필수 | `approval.approve` | 감사로그, 타임로그 |
| `POST` | `/approval-requests/{approval_id}/hold` | 보류 버튼 | 현재 결재자만, 보류 사유 필수 | `approval.approve` | 감사로그, 타임로그 |
| `POST` | `/approval-requests/{approval_id}/withdraw` | 회수 버튼 | 상신자 본인, 최종 승인 전, 회수 사유 후보 | `approval.submit` | 감사로그, 타임로그 |

인당 생산성/마진 기여: 결재라인을 API 계약으로 표준화해 금액/문서 승인 흐름의 병목을 측정할 수 있다.

#### 결재 버튼별 결과 상태

| 버튼 | API | 결과 상태 | 필수 입력 | 대상 업무 반영 |
|---|---|---|---|---|
| 결재 | `GET /approval-requests/{approval_id}` | 상태 변경 없음 | 없음 | 현재 상태, 상신자, 현재/다음/최종 결재자, 타임라인 반환 |
| 승인 | `POST /approval-requests/{approval_id}/approve` | 다음 결재자 있으면 `in_progress`, 최종 승인자면 `approved` | `approval_comment` 후보 | 견적/계약/발행/매출인식/입사등록/비용변경의 다음 가능 상태 해제 |
| 반려 | `POST /approval-requests/{approval_id}/reject` | `rejected` | `reject_reason` 필수 | 대상 업무는 수정 필요 또는 요청 반려 상태 |
| 보류 | `POST /approval-requests/{approval_id}/hold` | `on_hold` | `hold_reason` 필수 | 대상 업무는 검토 대기, 후속 확정 차단 |
| 회수 | `POST /approval-requests/{approval_id}/withdraw` | `withdrawn` | `withdraw_reason` 후보 | 상신 전 또는 최종 승인 전 문건 회수 |

인당 생산성/마진 기여: 버튼마다 상태 변경 여부와 후속 업무 영향을 고정해 승인 오처리와 재상신 시간을 줄인다.

#### 결재 액션 권한 검사

| 액션 | 권한 검사 | 실패 처리 |
|---|---|---|
| 결재 상세 조회 | 대상 테넌트 접근, 결재 참여자 또는 조회 권한 | `403 permission_denied` |
| 승인 | 현재 결재 단계의 결재자, 테넌트 범위, 문건 상태 `submitted` 또는 `in_progress` 또는 `on_hold` | `403 permission_denied` 또는 `409 invalid_state_transition` |
| 반려 | 현재 결재 단계의 결재자, 반려 사유 존재 | `422 reason_required` 또는 `403 permission_denied` |
| 보류 | 현재 결재 단계의 결재자, 보류 사유 존재 | `422 reason_required` 또는 `403 permission_denied` |
| 회수 | 상신자 본인, 최종 승인 전 | `403 permission_denied` 또는 `409 invalid_state_transition` |

인당 생산성/마진 기여: 결재 권한을 액션별로 분리해 잘못된 승인과 결재 책임 혼선을 줄인다.

#### 결재 결과의 대상 업무 반영

| 대상 업무 | 최종 승인 시 | 반려 시 | 보류 시 |
|---|---|---|---|
| 견적 | 견적 승인 완료, 발행 또는 계약 전환 가능 | 견적 수정 필요 | 견적 검토 대기 |
| 계약 | 계약 승인 완료, 주문 등록 가능 | 계약 수정 필요 | 계약 검토 대기 |
| 세금계산서/거래명세표 | 발행 진행 가능 | 발행 요청 반려 | 발행 보류 |
| 매출인식 조정 | 매출 조정 반영 가능 | 조정 요청 반려 | 조정 검토 대기 |
| 입사등록 | `employee_activation_pending` 전환 | 입사등록 반려, 수정 필요 | 입사등록 검토 대기, 계정 활성화 차단 |
| 수익성 비용 변경 | 비용/산식 변경 적용 가능 | 비용 변경 반려 | 비용 변경 검토 대기, 대시보드 공식 반영 차단 |

인당 생산성/마진 기여: 결재 결과가 계정 활성화와 수익성 지표 반영을 통제하게 해 승인 없는 변경으로 인한 재작업을 줄인다.

### 4.9 계약 `contracts`

| 항목 | 내용 |
|---|---|
| 목적 | 견적 또는 직접 등록 계약을 활성화하고 주문/매출의 기준으로 사용한다. |
| 입력 | `account_type`, `account_id`, `quote_id`, `contract_period`, `contract_amount`, `billing_model`, `approval_id` |
| 출력 | `contract_id`, 상태, 주문 가능 여부, 매출 후보 기준 |
| DoD | 계약 활성화는 승인/권한/기간/금액 검증을 통과해야 한다. 변경은 전후 이력을 보존한다. |
| 의존성 | 견적, 고객사/공급사, 결재, A4 계약 모델 |
| 담당 | A2, 협업 A4/A7 |
| KPI 영향 | 계약 기준 주문 오류 감소, 갱신/만료 관리 개선 |

| Method | Path | 행위 | 상태/조건 | 권한 | 로그 |
|---|---|---|---|---|---|
| `GET` | `/contracts` | 계약 목록 | 계정, 상태, 만료일 필터 | `contract.read` | 조회 로그 후보 |
| `POST` | `/contracts` | 계약 생성 | 견적 또는 직접 입력 | `contract.write` | 감사로그 |
| `GET` | `/contracts/{contract_id}` | 계약 상세 | 테넌트 검증 | `contract.read` | 조회 로그 후보 |
| `PATCH` | `/contracts/{contract_id}` | 계약 수정 | 상태별 수정 가능 필드 제한 | `contract.write` | 감사로그 |
| `POST` | `/contracts/{contract_id}/activate` | 계약 활성화 | 승인 조건 확인 | `contract.activate` | 감사로그 |
| `POST` | `/contracts/{contract_id}/amend` | 계약 변경 | 결재 필요 후보 | `contract.write` | 감사로그 |
| `POST` | `/contracts/{contract_id}/terminate` | 계약 해지 | 해지 사유 필수 | `contract.write` | 감사로그 |
| `POST` | `/contracts/{contract_id}/orders` | 주문 생성 | `active` 계약만 | `order.write` | 감사로그 |

인당 생산성/마진 기여: 계약 상태를 주문 가능 여부와 연결해 잘못된 출고와 청구 누락을 줄인다.

### 4.10 주문 `sales_orders`

| 항목 | 내용 |
|---|---|
| 목적 | 계약 기반 주문을 생성하고 출고 요청, 청구, 매출 후보로 연결한다. |
| 입력 | `contract_id`, `items`, `requested_delivery_date`, `delivery_address_ref`, `billing_account_id` |
| 출력 | `sales_order_id`, 주문 상태, 출고 요청 가능 여부 |
| DoD | 배송지 개인정보는 승인 전 원문 저장을 확정하지 않는다. 주문 확정 후 핵심 금액 변경은 감사/결재 대상이다. |
| 의존성 | 계약, 상품, 개인정보 처리범위, 출고 |
| 담당 | A2, 협업 A3/A4/A7 |
| KPI 영향 | 주문 재입력 감소, 납기/출고 누락 감소 |

| Method | Path | 행위 | 상태/조건 | 권한 | 로그 |
|---|---|---|---|---|---|
| `GET` | `/sales-orders` | 주문 목록 | 상태, 고객, 납기 필터 | `order.read` | 조회 로그 후보 |
| `POST` | `/sales-orders` | 주문 생성 | 계약 필수 후보 | `order.write` | 감사로그 |
| `GET` | `/sales-orders/{order_id}` | 주문 상세 | 테넌트 검증 | `order.read` | 개인정보 포함 시 접근로그 |
| `PATCH` | `/sales-orders/{order_id}` | 주문 수정 | 상태별 수정 제한 | `order.write` | 감사로그 |
| `POST` | `/sales-orders/{order_id}/confirm` | 주문 확정 | 품목/금액/납기 검증 | `order.confirm` | 감사로그 |
| `POST` | `/sales-orders/{order_id}/hold` | 주문 보류 | 사유 필수 | `order.write` | 감사로그, 타임로그 |
| `POST` | `/sales-orders/{order_id}/shipments` | 출고 요청 | 확정 주문만 | `shipment.write` | 감사로그 |

인당 생산성/마진 기여: 주문 확정과 출고 요청을 분리해 오류 주문이 물류 단계로 넘어가는 것을 줄인다.

### 4.11 출고 `shipments`

| 항목 | 내용 |
|---|---|
| 목적 | 주문 품목의 출고 지시, 피킹/포장, 출고 완료, 송장 등록을 관리한다. |
| 입력 | `sales_order_id`, `warehouse_id`, `items`, `carrier_code`, `tracking_number` |
| 출력 | `shipment_id`, 출고 상태, 배송상태 참조 |
| DoD | 부분 출고를 표현할 수 있어야 한다. 출고 완료 후 배송 추적 리소스가 생성된다. |
| 의존성 | 주문, 배송 어댑터, 공급사/창고 정책 |
| 담당 | A2, 협업 A6/A3 |
| KPI 영향 | 출고 누락 감소, 배송 문의 선제 대응 |

| Method | Path | 행위 | 상태/조건 | 권한 | 로그 |
|---|---|---|---|---|---|
| `GET` | `/shipments` | 출고 목록 | 상태, 창고, 주문 필터 | `shipment.read` | 조회 로그 후보 |
| `POST` | `/shipments` | 출고 생성 | 주문 확정 필요 | `shipment.write` | 감사로그 |
| `PATCH` | `/shipments/{shipment_id}` | 출고 수정 | 출고 전 제한 | `shipment.write` | 감사로그 |
| `POST` | `/shipments/{shipment_id}/mark-shipped` | 출고 완료 | 송장 또는 수동 사유 | `shipment.process` | 감사로그, 타임로그 |
| `POST` | `/shipments/{shipment_id}/cancel` | 출고 취소 | 상태 검증 | `shipment.process` | 감사로그 |

인당 생산성/마진 기여: 출고 상태를 주문과 분리해 물류 병목과 담당자 처리량을 측정할 수 있다.

### 4.12 배송상태 `delivery_statuses`

| 항목 | 내용 |
|---|---|
| 목적 | 택배사 연동 또는 수동 입력으로 현재 위치, 배송상태, 지연/반송 예외를 관리한다. |
| 입력 | `shipment_id`, `carrier_code`, `tracking_number`, 외부 배송 이벤트, 수동 보정 사유 |
| 출력 | `delivery_status_id`, 현재 상태, 현재 위치 후보, 마지막 동기화 시각, 예외 업무 |
| DoD | 연동 실패 시 `work_item` 예외 큐가 생성된다. 택배사 API 상세는 PM 승인 필요이다. |
| 의존성 | A6 배송 어댑터, 택배사 계약, Operations Console |
| 담당 | A2, 협업 A6/A3/A7 |
| KPI 영향 | 배송 조회 수작업 감소, 지연/반송 손실 대응 시간 단축 |

| Method | Path | 행위 | 상태/조건 | 권한 | 로그 |
|---|---|---|---|---|---|
| `GET` | `/delivery-statuses` | 배송 목록 | 상태, 택배사, 지연 필터 | `delivery.read` | 조회 로그 후보 |
| `GET` | `/delivery-statuses/{delivery_status_id}` | 배송 상세 | 테넌트 검증 | `delivery.read` | 조회 로그 후보 |
| `POST` | `/delivery-statuses/{delivery_status_id}/refresh` | 택배사 재조회 | 멱등 키 필수 | `delivery.refresh` | 통합로그, 감사로그 |
| `POST` | `/delivery-statuses/{delivery_status_id}/manual-corrections` | 수동 보정 | 사유/증적 필수 | `delivery.correct` | 감사로그, 타임로그 |

인당 생산성/마진 기여: 배송상태 조회와 보정을 API로 모아 운영자가 택배사별 화면을 오가는 시간을 줄인다.

### 4.13 세금계산서 `tax_invoices`

| 항목 | 내용 |
|---|---|
| 목적 | 주문/청구 기준 세금계산서 발행 요청, 상태 동기화, 실패 재처리, 취소/정정을 관리한다. |
| 입력 | `sales_order_id`, `supply_amount`, `vat_amount`, `issue_date`, `counterparty`, `approval_id` |
| 출력 | `tax_invoice_id`, 발행 상태, 외부 문서 ID, 발행 로그 |
| DoD | 발행 요청은 멱등성을 가져야 한다. 외부 발행 벤더와 전송 항목은 PM 승인 필요이다. |
| 의존성 | 주문, 결재, A6 발행 어댑터, A7 외감/세무 증적 |
| 담당 | A2, 협업 A6/A7/A4 |
| KPI 영향 | 발행 누락 감소, 월마감 증적 수집 시간 감소 |

| Method | Path | 행위 | 상태/조건 | 권한 | 로그 |
|---|---|---|---|---|---|
| `GET` | `/tax-invoices` | 세금계산서 목록 | 상태, 발행일, 고객 필터 | `document.tax.read` | 조회 로그 후보 |
| `POST` | `/tax-invoices` | 발행 후보 생성 | 주문/금액 필수 | `document.tax.write` | 감사로그 |
| `POST` | `/tax-invoices/{tax_invoice_id}/submit-approval` | 발행 결재 | 결재선 필수 후보 | `approval.write` | 감사로그 |
| `POST` | `/tax-invoices/{tax_invoice_id}/issue` | 외부 발행 요청 | 멱등 키/승인 조건 | `document.tax.issue` | 감사로그, 통합로그 |
| `POST` | `/tax-invoices/{tax_invoice_id}/refresh-status` | 상태 동기화 | 외부 ID 필요 | `document.tax.read` | 통합로그 |
| `POST` | `/tax-invoices/{tax_invoice_id}/cancel` | 취소 | 사유/승인 필요 후보 | `document.tax.issue` | 감사로그 |
| `POST` | `/tax-invoices/{tax_invoice_id}/correct` | 정정 | 사유/승인 필요 후보 | `document.tax.issue` | 감사로그 |

인당 생산성/마진 기여: 발행 상태와 주문을 연결해 재무 담당자의 누락 확인과 고객 문의 대응 시간을 줄인다.

### 4.14 거래명세표 `transaction_statements`

| 항목 | 내용 |
|---|---|
| 목적 | 거래명세표 생성, 발행, 전송, 실패 재처리, 정정을 관리한다. |
| 입력 | `sales_order_id`, `items`, `supply_amount`, `vat_amount`, `recipient`, `approval_id` |
| 출력 | `transaction_statement_id`, 발행/전송 상태, 첨부 참조 |
| DoD | 발행/전송 실패는 재처리 또는 수동 보정 큐로 전환된다. 첨부 보관기간은 PM 승인 필요이다. |
| 의존성 | 주문, 발행 어댑터, 문서 저장 정책, A7 증적 기준 |
| 담당 | A2, 협업 A6/A7 |
| KPI 영향 | 거래 증빙 요청 처리시간 감소, 발행 오류 감소 |

| Method | Path | 행위 | 상태/조건 | 권한 | 로그 |
|---|---|---|---|---|---|
| `GET` | `/transaction-statements` | 거래명세표 목록 | 상태, 주문, 고객 필터 | `document.statement.read` | 조회 로그 후보 |
| `POST` | `/transaction-statements` | 문서 생성 | 주문/품목 필수 | `document.statement.write` | 감사로그 |
| `POST` | `/transaction-statements/{statement_id}/issue` | 발행 | 승인 조건 확인 | `document.statement.issue` | 감사로그 |
| `POST` | `/transaction-statements/{statement_id}/send` | 전송 | 수신자/전송 채널 필요 | `document.statement.issue` | 감사로그, 통합로그 |
| `POST` | `/transaction-statements/{statement_id}/correct` | 정정 | 사유 필수 | `document.statement.issue` | 감사로그 |

인당 생산성/마진 기여: 거래명세표 발행과 전송 이력을 남겨 고객사 요청 대응과 증적 수집 시간을 줄인다.

### 4.15 매출인식 `revenue_recognitions`

| 항목 | 내용 |
|---|---|
| 목적 | 출고/검수/청구/계약 기준 매출 후보를 생성하고 승인 후 수익성 지표에 반영한다. |
| 입력 | `contract_id`, `sales_order_id`, `shipment_id`, `tax_invoice_id`, `revenue_amount`, `recognition_basis`, `approval_id` |
| 출력 | `revenue_recognition_id`, 상태, 매출 이벤트, 수익성 반영 여부 |
| DoD | 공식 회계 기준은 PM 승인 필요이다. 조정/역처리는 승인과 감사로그가 필수이다. |
| 의존성 | 주문, 출고, 세금계산서, A4 수익성, A7 외감 기준 |
| 담당 | A2, 협업 A4/A7 |
| KPI 영향 | 매출 누락/오인식 감소, 영업이익 원인 분석 속도 향상 |

| Method | Path | 행위 | 상태/조건 | 권한 | 로그 |
|---|---|---|---|---|---|
| `GET` | `/revenue-recognitions` | 매출 후보 목록 | 상태, 기간, 고객 필터 | `revenue.read` | 조회 로그 후보 |
| `POST` | `/revenue-recognitions` | 매출 후보 생성 | 기준 리소스 필수 | `revenue.write` | 감사로그 |
| `POST` | `/revenue-recognitions/{revenue_id}/submit-approval` | 매출 승인 요청 | 결재선 필수 후보 | `approval.write` | 감사로그 |
| `POST` | `/revenue-recognitions/{revenue_id}/recognize` | 매출 인식 확정 | 승인/권한 필요 | `revenue.recognize` | 감사로그 |
| `POST` | `/revenue-recognitions/{revenue_id}/adjust` | 매출 조정 | 사유/승인 필요 | `revenue.adjust` | 감사로그 |
| `POST` | `/revenue-recognitions/{revenue_id}/reverse` | 역처리 | 사유/승인 필요 | `revenue.adjust` | 감사로그 |

인당 생산성/마진 기여: 매출 후보와 확정을 상태로 분리해 재무 검산과 대시보드 반영 오류를 줄인다.

### 4.16 운영 업무 큐 `work_items`

| 항목 | 내용 |
|---|---|
| 목적 | 운영 업무, 배송/발행/연동 예외, 승인 후속 작업을 접수, 배정, 처리, 완료한다. |
| 입력 | `work_type`, `target_type`, `target_id`, `priority`, `sla_due_at`, `assignee_user_id`, `reason_code` |
| 출력 | `work_item_id`, 상태, 담당자, SLA, 처리 결과, 타임로그 |
| DoD | 모든 상태 변경은 사유와 처리시간을 남긴다. 일괄 처리는 권한과 상태를 개별 검증한다. |
| 의존성 | 전 도메인 이벤트, A3 운영 콘솔, A8 E2E QA |
| 담당 | A2, 협업 A3/A6/A8/A9 |
| KPI 영향 | 운영자 1인당 처리 건수 증가, 평균 처리시간 감소 |

| Method | Path | 행위 | 상태/조건 | 권한 | 로그 |
|---|---|---|---|---|---|
| `GET` | `/work-items` | 업무 목록 | 큐, 상태, SLA, 담당자 필터 | `ops.work.read` | 조회 로그 후보 |
| `POST` | `/work-items` | 업무 생성 | 대상 리소스 필수 | `ops.work.write` | 감사로그 |
| `POST` | `/work-items/{work_item_id}/assign` | 담당자 배정 | 팀/역할 검증 | `ops.work.assign` | 감사로그, 타임로그 |
| `POST` | `/work-items/{work_item_id}/start` | 처리 시작 | 담당자 또는 권한자 | `ops.work.process` | 타임로그 |
| `POST` | `/work-items/{work_item_id}/hold` | 보류 | 사유 필수 | `ops.work.process` | 감사로그, 타임로그 |
| `POST` | `/work-items/{work_item_id}/complete` | 완료 | 결과 필수 | `ops.work.process` | 감사로그, 타임로그 |
| `POST` | `/work-items/{work_item_id}/reject` | 반려 | 사유 필수 | `ops.work.process` | 감사로그, 타임로그 |
| `POST` | `/work-items/bulk-actions` | 일괄 처리 | 개별 권한/상태 검증 | `ops.work.bulk` | 감사로그 |

인당 생산성/마진 기여: 모든 예외와 반복 업무를 같은 API로 처리해 운영자가 시스템별로 작업을 찾는 시간을 줄인다.

### 4.17 타임로그 `time_logs`

| 항목 | 내용 |
|---|---|
| 목적 | 영업활동, 결재 대기, 운영 처리, 상태 변경에 투입된 시간을 기록하고 생산성 지표로 제공한다. |
| 입력 | `target_type`, `target_id`, `activity_type`, `started_at`, `ended_at`, `duration_minutes`, `actor_user_id` |
| 출력 | `time_log_id`, 기간, 처리시간, 대상 업무 |
| DoD | 자동 기록과 수동 보정이 구분되어야 한다. 고객 신규 저장, 고객 수정 저장, 담당자 배정 생성/변경/종료, 영업활동 생성, 파이프라인 단계 변경, 결재 상신/승인/반려/보류/회수, 주문 확정/보류, 출고 완료, 발행 실패/재처리, 매출인식 확정/조정, 운영 업무 시작/보류/완료는 타임로그 생성 또는 갱신 대상이다. 수동 보정은 감사로그를 남긴다. |
| 의존성 | 활동, 업무 큐, 결재, A4 KPI, A9 로그 저장 |
| 담당 | A2, 협업 A4/A9 |
| KPI 영향 | 담당자별 처리량/처리시간 측정, 자동화 후보 식별 |

| Method | Path | 행위 | 상태/조건 | 권한 | 로그 |
|---|---|---|---|---|---|
| `GET` | `/time-logs` | 타임로그 목록 | 대상, 담당자, 기간 필터 | `time_log.read` | 조회 로그 후보 |
| `POST` | `/time-logs` | 수동 기록 | 사유 필수 | `time_log.write` | 감사로그 |
| `PATCH` | `/time-logs/{time_log_id}` | 수동 보정 | 관리자/사유 필요 | `time_log.adjust` | 감사로그 |

인당 생산성/마진 기여: 시간 투입 데이터를 표준화해 고투입 업무와 저마진 고객을 객관적으로 찾는다.

### 4.18 감사로그와 개인정보 접근로그

| 항목 | 내용 |
|---|---|
| 목적 | 생성, 수정, 삭제, 승인, 상태 변경, 조회, 발행, 매출인식, 개인정보 접근 이력을 조회한다. |
| 입력 | 기간, 대상 리소스, 액터, 액션, 테넌트, 요청 ID |
| 출력 | 로그 목록, 상세, 증적 다운로드 후보 |
| DoD | 로그 조회 권한은 업무 데이터 수정 권한과 분리된다. 다운로드와 원문 조회는 접근로그 대상이다. |
| 의존성 | A7 컴플라이언스, A9 로그 저장/보존, PM 보존기간 승인 |
| 담당 | A2, 협업 A7/A9 |
| KPI 영향 | 외감/보안 감사 대응 시간 감소, 원인 조사 시간 감소 |

| Method | Path | 행위 | 상태/조건 | 권한 | 로그 |
|---|---|---|---|---|---|
| `GET` | `/audit-logs` | 감사로그 조회 | 기간/대상 필수 후보 | `audit.read` | 로그 조회 로그 |
| `GET` | `/privacy-access-logs` | 개인정보 접근로그 조회 | 보안/개인정보 역할 | `privacy_log.read` | 로그 조회 로그 |
| `GET` | `/integration-logs` | 연동 로그 조회 | 외부 시스템/상태 필터 | `integration_log.read` | 로그 조회 로그 |
| `POST` | `/audit-exports` | 증적 추출 요청 | 승인 ID 필요 후보 | `audit.export` | 감사로그, 개인정보 접근로그 가능 |

인당 생산성/마진 기여: 감사와 접근 이력을 검색 가능하게 만들어 장애, 분쟁, 외감 대응에 들어가는 수작업을 줄인다.

### 4.19 Lead-to-Cash API 연결 스펙

| 순서 | 단계 | API | 필수 연결 필드 | 성공 시 후속 상태 |
|---|---|---|---|---|
| 1 | 영업활동 | `POST /sales-activities` | `account_type`, `account_id`, `business_flow_id` 후보 | `sales_activity.created`, 타임로그 생성 |
| 2 | 파이프라인 | `POST /sales-activities/{activity_id}/convert-to-opportunity` | `sales_activity_id`, `account_id`, `business_flow_id` | `opportunity.lead` |
| 3 | 단계 전이 | `POST /opportunities/{opportunity_id}/stage-transitions` | `opportunity_id`, `from_stage`, `to_stage`, `reason_code` | 단계 변경, 타임로그 갱신 |
| 4 | 견적 생성 | `POST /opportunities/{opportunity_id}/quotes` | `opportunity_id`, `items.product_id`, `items.sale_price` | `quote.draft` |
| 5 | 견적 발행 | `POST /quotes/{quote_id}/issue` | `quote_id`, `quote_version_id`, 승인 상태 | `quote.issued` |
| 6 | 계약 전환 | `POST /quotes/{quote_id}/contracts` | `quote_id`, `quote_version_id`, `account_id` | `contract.draft` 또는 `contract.active` 후보 |
| 7 | 계약 활성화 | `POST /contracts/{contract_id}/activate` | `contract_id`, 승인 상태, 기간/금액 | `contract.active` |
| 8 | 주문 등록 | `POST /contracts/{contract_id}/orders` 또는 `POST /sales-orders` | `contract_id`, `items`, 납기, 배송 참조 | `sales_order.draft` |
| 9 | 주문 확정 | `POST /sales-orders/{order_id}/confirm` | `sales_order_id`, 품목/금액/납기 | `sales_order.confirmed`, 타임로그 생성 |
| 10 | 출고 요청 | `POST /sales-orders/{order_id}/shipments` | `sales_order_id`, 출고 품목 | `shipment.requested` |
| 11 | 출고 완료 | `POST /shipments/{shipment_id}/mark-shipped` | `shipment_id`, `carrier_code`, `tracking_number` | `shipment.shipped`, `delivery_status.pending` |
| 12 | 발행 | `POST /tax-invoices/{id}/issue`, `POST /transaction-statements/{id}/issue` | 주문/금액/승인 상태 | `issued` 또는 실패 시 예외 큐 |
| 13 | 매출인식 | `POST /revenue-recognitions/{revenue_id}/recognize` | 계약/주문/출고/발행 참조, 승인 상태 | `revenue_recognition.recognized` |

인당 생산성/마진 기여: Lead-to-Cash API 순서와 연결 필드를 고정해 다음 단계 생성 누락과 수기 상태 확인 시간을 줄인다.

### 4.20 타임로그 생성 조건 상세

| API 트리거 | 타임로그 처리 | 필수 연결 |
|---|---|---|
| `POST /client-companies` | `customer_create` 생성 | `client_company_id`, `actor_user_id` |
| `PATCH /client-companies/{client_company_id}` | 변경 필드 존재 시 `customer_update` 생성 | 변경 전후 해시, 사유 |
| `employee-customer-assignments` 생성/수정/종료 | `assignment_action` 생성 | `assignment_id`, 직원, 거래처, 역할, 사유 |
| `employee-onboarding-requests` 생성/수정/상신/활성화 | `onboarding_action` 생성 | 입사등록 ID, 결재 ID, 사유 |
| `profit-cost-settings` 생성/수정/삭제/차단 | `profit_cost_setting_action` 또는 `profit_cost_setting_denied` 생성 | 비용 유형, 적용일, 산식 버전, 변경 전후 값, 사유 |
| `POST /sales-activities` | `sales_activity` 생성 | `sales_activity_id`, `account_id` |
| `POST /opportunities/{opportunity_id}/stage-transitions` | `opportunity_stage_change` 생성 | 이전/다음 단계 |
| `POST /approval-requests/{approval_id}/submit` | `approval_wait` 시작 | `approval_request_id`, `submitter_user_id` |
| `POST /approval-requests/{approval_id}/approve`, `reject`, `hold`, `withdraw` | `approval_action` 생성, 대기시간 갱신 | 결재 단계, 결재자, 사유 |
| `POST /sales-orders/{order_id}/confirm` 또는 `hold` | `order_action` 생성 | 주문 상태, 사유 |
| `POST /shipments/{shipment_id}/mark-shipped` | `shipment_action` 생성 | 출고 상태, 송장 |
| 발행 API 실패/정정/재처리 | `document_issue_action` 생성 | 문서 ID, 실패 사유 |
| `recognize`, `adjust`, `reverse` | `revenue_action` 생성 | 매출 ID, 승인 ID |
| `work-items` 처리 API | `work_item_action` 시작/종료 갱신 | 업무 ID, 담당자 |

인당 생산성/마진 기여: 타임로그 트리거를 API 단위로 명확히 해 처리시간 KPI를 추가 수기 입력 없이 수집한다.

## 5. 상태 코드 사전

### 5.1 핵심 상태

| 리소스 | 상태 |
|---|---|
| `opportunity` | `lead`, `qualified`, `proposal`, `quote_sent`, `won`, `lost` |
| `quote` | `draft`, `approval_required`, `approved`, `issued`, `accepted`, `rejected`, `expired`, `voided` |
| `approval_request` | `draft`, `submitted`, `in_progress`, `on_hold`, `approved`, `rejected`, `withdrawn` |
| `employee_onboarding_request` | `draft`, `submitted`, `in_review`, `on_hold`, `rejected`, `approved`, `employee_activation_pending`, `activated` |
| `profit_cost_setting` | `draft`, `approval_required`, `approved`, `active`, `scheduled`, `expired`, `rejected` |
| `contract` | `draft`, `approval_required`, `active`, `amended`, `suspended`, `expired`, `terminated` |
| `sales_order` | `draft`, `confirmed`, `fulfillment_requested`, `partially_shipped`, `shipped`, `delivered`, `cancelled`, `on_hold` |
| `shipment` | `requested`, `picking`, `packed`, `shipped`, `partially_shipped`, `cancelled`, `failed` |
| `delivery_status` | `pending`, `in_transit`, `out_for_delivery`, `delivered`, `delayed`, `returned`, `lost`, `manual_review` |
| `tax_invoice` | `draft`, `approval_required`, `requested`, `issued`, `failed`, `cancelled`, `corrected` |
| `transaction_statement` | `draft`, `approval_required`, `issued`, `sent`, `failed`, `cancelled`, `corrected` |
| `revenue_recognition` | `candidate`, `approval_required`, `approved`, `recognized`, `adjustment_required`, `reversed`, `rejected` |
| `work_item` | `new`, `assigned`, `in_progress`, `on_hold`, `completed`, `rejected`, `cancelled` |

인당 생산성/마진 기여: 상태 코드를 통일해 화면 필터, SLA, 대시보드, QA 테스트가 같은 기준을 사용하게 한다.

## 6. 이벤트 계약

| 이벤트 | payload 핵심 필드 | 발행 주체 | 소비 주체 |
|---|---|---|---|
| `sales.activity.created` | `sales_activity_id`, `account_id`, `actor_user_id`, `time_log_id` | Sales API | Dashboard, Timeline |
| `crm.employee_customer_assignment.changed` | `assignment_id`, `employee_account_id`, `customer_account_id`, `assignment_role`, `is_primary` | Assignment API | CRM Detail, Timeline, Audit |
| `hr.employee_onboarding.submitted` | `employee_onboarding_request_id`, `approval_request_id`, `submitter_user_id` | Onboarding API | Approval, Timeline, Audit |
| `hr.employee_onboarding.approved` | `employee_onboarding_request_id`, `approval_request_id` | Onboarding API | Employee Activation, Timeline |
| `hr.employee_onboarding.activated` | `employee_onboarding_request_id`, `employee_id`, `activated_by` | Onboarding API | Employee, Audit |
| `settings.profit_cost_setting.changed` | `profit_cost_setting_id`, `cost_type`, `formula_version`, `before_value`, `after_value` | Settings API | Profitability Dashboard, Audit |
| `settings.profit_cost_setting.denied` | `actor_user_id`, `cost_type`, `reason_code` | Settings API | Security Audit |
| `sales.opportunity.stage_changed` | `opportunity_id`, `from_stage`, `to_stage`, `reason_code` | Opportunity API | Dashboard, Audit |
| `sales.quote.issued` | `quote_id`, `quote_version_id`, `issued_at` | Quote API | Contract, Timeline |
| `approval.request.approved` | `approval_request_id`, `target_type`, `target_id` | Approval API | Quote, Contract, Document, Revenue |
| `approval.request.rejected` | `approval_request_id`, `target_type`, `target_id`, `reject_reason` | Approval API | Target Domain, Timeline |
| `approval.request.held` | `approval_request_id`, `target_type`, `target_id`, `hold_reason` | Approval API | Target Domain, Timeline |
| `contract.activated` | `contract_id`, `account_id`, `amount` | Contract API | Order, Revenue Candidate |
| `order.confirmed` | `sales_order_id`, `contract_id`, `amount` | Order API | Shipment, Revenue Candidate |
| `shipment.shipped` | `shipment_id`, `sales_order_id`, `tracking_number` | Shipment API | Delivery, Revenue Candidate |
| `delivery.status_changed` | `delivery_status_id`, `from_status`, `to_status` | Delivery API | Work Queue, Notification |
| `document.tax_invoice.issued` | `tax_invoice_id`, `sales_order_id`, `amount` | Document API | Revenue, Audit |
| `document.transaction_statement.issued` | `statement_id`, `sales_order_id` | Document API | Timeline, Audit |
| `revenue.recognized` | `revenue_recognition_id`, `amount`, `basis` | Revenue API | Profitability Dashboard |
| `work_item.completed` | `work_item_id`, `duration_minutes`, `result_code` | Operations API | Productivity KPI |

인당 생산성/마진 기여: 이벤트를 기준으로 시스템 간 조회를 줄이고 후속 업무를 자동 생성할 수 있게 한다.

## 7. PM 승인 필요 항목

| 항목 | API 영향 | 승인 전 처리 |
|---|---|---|
| 개인정보/민감정보 필드 | `employees`, 배송지, 담당자, 다운로드 | 마스킹/참조 ID/접근로그 요구만 정의 |
| 거래처별 대표 담당자 1명 제한 여부 | `employee-customer-assignments` | `is_primary` 필드와 정책 검증 후보만 정의 |
| 담당 역할 코드 확정 | `employee-customer-assignments.assignment_role` | `primary`, `secondary`, `approval_owner`, `observer` 후보로 시작 |
| 결재 `on_hold` 공식 상태 채택 | `approval-requests/{id}/hold` | 보류 API, 사유, 로그 조건 후보로 정의 |
| 입사등록 결재 필수 여부 | `employee-onboarding-requests` | 결재문건/결재라인/최종 승인 전 활성화 차단 후보로 정의 |
| 최종 승인 후 계정 활성화 방식 | `employee-onboarding-requests/{id}/activate-employee` | 자동 또는 관리자 확인 후 활성화는 후속 결정 |
| `제원원가` 회계 의미 | `profit-cost-settings.cost_type` | `spec_cost` 후보로만 사용, 정확한 의미 PM 승인 필요 |
| 비용 입력 권한 범위 | `profit-cost-settings` | `Master`, `ProfitCostInputManager` 후보 권한으로 정의 |
| 비용 변경 결재 필수 여부 | `profit-cost-settings/{id}/submit-approval` | 전사 영향 변경은 결재 대상 후보로 정의 |
| 택배사 API와 비용/계약 | `delivery_statuses.refresh` | 어댑터 경계와 수동 보정만 정의 |
| 세금계산서/거래명세표 외부 벤더 | `tax_invoices.issue`, `transaction_statements.send` | 발행 상태와 통합로그만 정의 |
| 공식 매출인식 기준 | `revenue_recognitions.recognize` | 후보 상태와 승인 기반 확정만 정의 |
| 원가/판관비 고정 산식 공식화 | 수익성 대시보드 이벤트 | 후보 산식으로만 전달 |
| 로그 보존기간과 원문 저장 여부 | `audit-logs`, `privacy-access-logs`, `integration-logs` | 필수 필드와 조회 권한만 정의 |

인당 생산성/마진 기여: PM 승인 항목을 API 영향과 연결해 승인 지연이 전체 백엔드 경계를 막지 않게 한다.

## 8. API DoD

1. 각 API 그룹은 목적, 입력, 출력, DoD, 의존성, 담당, KPI 영향을 가진다.
2. 모든 쓰기 API는 `tenant_id`, `actor_user_id`, `request_id`, 필요 시 `reason_code`를 검증한다.
3. 상태 변경 API는 허용 상태 전이와 권한을 검증하고 실패 시 표준 오류를 반환한다.
4. 발행, 외부 연동, 매출 확정, 일괄 처리는 멱등성을 가진다.
5. 개인정보 상세, 다운로드, 마스킹 해제, 외부 전송은 접근 목적과 접근로그를 요구한다.
6. 견적, 계약, 발행, 매출인식 조정은 결재라인과 연결 가능해야 한다.
7. 고객 신규 저장은 `POST /client-companies`, 고객 수정 저장은 `PATCH /client-companies/{client_company_id}` 기준으로 완료 여부와 변경 이력을 판단한다.
8. 상품과 견적 품목은 `sale_price`를 별도 판매가격 필드로 제공해야 한다.
9. 결재문건 상신자는 로그인 사용자 `actor_user_id`로 자동 지정되며 요청 본문으로 임의 지정할 수 없다.
10. `employee_customer_assignment` API는 직원 1명 대 여러 거래처, 거래처 1곳 대 여러 담당자를 지원해야 한다.
11. 담당자 배정 생성/변경/종료는 권한 검사, 사유 입력, 타임로그, 감사로그를 요구해야 한다.
12. 승인/반려/보류/결재/회수 버튼별 결과 상태, 필수 입력, 로그, 권한 검사가 검증 가능해야 한다.
13. 입사등록 `approval_status`는 연결된 결재문건 상태와 일치해야 하고 결재라인 설정 전 상신이 차단되어야 한다.
14. 입사등록 최종 승인 전에는 임직원 계정 활성화와 권한 부여 완료가 금지되어야 한다.
15. 제원원가, 판관비, 일반관리비 입력/수정/삭제는 `Master` 또는 `ProfitCostInputManager` 후보 권한으로 제한되어야 한다.
16. 비용 입력 변경은 변경 사유, 적용일, 적용 범위, 산식 버전, 변경 전후 값, 변경자를 감사로그로 남겨야 한다.
17. 권한 없는 비용 저장 시도는 차단되고 로그로 남아야 한다.
18. 비용 변경이 결재 대상 후보이면 최종 승인 전 대시보드 공식 반영이 차단되어야 한다.
19. 타임로그 생성 조건은 고객 저장, 담당자 배정, 입사등록, 비용 입력, 영업활동, 파이프라인, 결재, 주문, 출고, 발행, 매출인식, 운영 업무 처리 API별로 검증 가능해야 한다.
20. 영업활동-파이프라인-견적-계약-주문-출고-발행-매출인식 API는 `business_flow_id`와 선행 리소스 ID로 연결 가능해야 한다.
21. 배송/발행/연동 실패는 `work_item` 예외 큐로 승격 가능해야 한다.
22. 모든 핵심 생성, 수정, 삭제, 승인, 상태 변경, 발행, 매출인식은 감사로그 대상이다.

인당 생산성/마진 기여: API 완료 기준을 검증 가능하게 만들어 구현 후 재해석과 QA 보완 비용을 줄인다.

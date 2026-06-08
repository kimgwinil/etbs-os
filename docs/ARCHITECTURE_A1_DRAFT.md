# 이제너두 전사 CRM OS A1 아키텍처 초안

## 1. 문서 목적

이 문서는 이제너두 전사 CRM OS의 STEP1 P0 범위인 `CRM Core`, `Operations Console`, `Security & Audit Baseline`, `Profitability Dashboard`를 기준으로 멀티테넌트, 대용량, 3면 B2B2C 운영을 지원하는 아키텍처 초안을 정의한다.

본 문서는 구현 확정안이 아니라 A2~A9 에이전트가 독립적으로 모듈 설계, 데이터 모델, 화면, 보안, 연동, 검증 작업을 시작할 수 있도록 모듈 경계와 통신규약을 정리한 기준선이다.

인당 생산성/마진 기여: 기준 데이터, 운영 처리, 보안 감사, 수익성 판단의 경계를 먼저 고정해 중복 설계와 재작업을 줄인다.

## 2. 기준 입력

- 기준 문서: `/docs/PRD.md`
- STEP1 P0 모듈:
  - `CRM Core`
  - `Operations Console`
  - `Security & Audit Baseline`
  - `Profitability Dashboard`
- 회사 구조: 공급사/입점사, 플랫폼, 고객사, 임직원으로 구성된 3면 B2B2C
- 운영 규모: 고객사 약 2,800개, 임직원 약 260만 명 이상
- 필수 통제: ISMS, 개인정보 및 민감정보 보호, 외감 회계 대응

인당 생산성/마진 기여: PRD의 P0만 기준 입력으로 삼아 초기 설계가 고비용 저효율 범위로 확장되는 것을 막는다.

## 3. 아키텍처 원칙

### 3.1 멀티테넌트 기준

- 모든 비즈니스 엔티티는 `tenant_id`, `tenant_type`, `visibility_scope`를 기본 접근 통제 키로 가진다.
- `tenant_type`은 초기 초안에서 `client_company`, `supplier`, `platform`으로 구분한다.
- 임직원 데이터는 고객사 테넌트 하위의 `employee` 리소스로 취급한다.
- 플랫폼 운영자는 권한에 따라 복수 테넌트를 조회할 수 있으나, 모든 접근은 감사로그 대상이다.
- `PM 승인 필요`: 테넌트 물리 분리 방식, 고객사별 전용 DB 여부, 개인정보 항목별 분리 저장 범위.

인당 생산성/마진 기여: 테넌트 경계를 공통 규칙으로 만들면 고객사 증가에도 운영자별 수동 권한 관리와 보안 재작업이 줄어든다.

### 3.2 대용량 조회 기준

- 대량 데이터의 기본 조회는 목록 조회, 상세 조회, 검색 인덱스 조회를 분리한다.
- `employee`, `activity`, `work_item`, `audit_log`는 생성량이 크므로 기간, 테넌트, 상태 기준 파티셔닝을 전제로 설계한다.
- 운영 콘솔의 기본 목록은 커서 기반 페이지네이션을 사용한다.
- 분석성 집계는 운영 트랜잭션 저장소에서 직접 계산하지 않고 `Analytics Projection`으로 분리한다.
- `PM 승인 필요`: 실제 DBMS, 검색엔진, 데이터웨어하우스, BI 도구 선정.

인당 생산성/마진 기여: 조회와 집계를 분리해 대량 고객/임직원 데이터에서도 화면 지연과 장애 대응 인력 투입을 줄인다.

### 3.3 3면 CRM 기준

- `CRM Core`는 고객사, 공급사, 임직원, 계약, 담당자, 활동 이력의 기준 ID를 소유한다.
- 고객사와 공급사는 모두 CRM 관리 대상이지만 계약, 정산, 운영 업무의 맥락이 다르므로 역할과 관계를 분리한다.
- 임직원은 고객사 소속 사용자로 보되 복지 포인트, 주문, CS, 개인정보 접근은 별도 도메인과 연동한다.
- 모든 P0 모듈은 `crm_entity_id` 또는 `tenant_id`를 통해 기준 데이터를 참조한다.

인당 생산성/마진 기여: 3면 관계를 단일 고객 테이블로 뭉개지 않아 담당자별 예외 처리와 데이터 해석 비용을 줄인다.

### 3.4 보안 내재화 기준

- 인증, 권한, 감사, 개인정보 접근 기록은 별도 후속 작업이 아니라 P0 공통 의존성이다.
- 모든 쓰기 작업은 `actor_id`, `actor_type`, `request_id`, `reason_code`를 감사 메타데이터로 남긴다.
- 개인정보 원문 조회는 최소 권한, 목적 기반, 사유 입력, 로그 보존을 기본값으로 한다.
- `PM 승인 필요`: 민감정보 항목, 보관기간, 마스킹 수준, 위탁/재위탁 처리범위.

인당 생산성/마진 기여: 보안을 나중에 붙이는 비용과 감사 대응 인력 소모를 줄이고 규제 리스크 손실을 예방한다.

## 4. 전체 논리 구조

```text
User Channels
  - Platform Admin Web
  - Operations Console
  - Executive Dashboard
  - Future Supplier Portal

Application Modules
  - CRM Core
  - Operations Console
  - Security & Audit Baseline
  - Profitability Dashboard
  - Integration Boundary

Shared Platform Capabilities
  - Identity & Access
  - Tenant Context
  - Audit Log
  - Notification
  - Search Projection
  - Analytics Projection
  - Job Queue

External Systems
  - Benecafe
  - Payment Gateway
  - Onnuri
  - Legacy ERP or Settlement System
  - Data Warehouse or Accounting Export
```

인당 생산성/마진 기여: 사용자 채널, 애플리케이션 모듈, 공통 기능, 외부 시스템을 분리해 팀별 병렬 작업과 장애 범위 축소가 가능해진다.

## 5. 모듈 경계

### 5.1 CRM Core

#### 목적

고객사, 공급사, 임직원, 계약, 담당자, 활동 이력의 기준 데이터를 관리하고 모든 운영 업무가 동일한 엔티티 ID를 참조하도록 한다.

인당 생산성/마진 기여: 기준 ID를 통합해 엑셀, 메신저, 레거시 관리자 간 중복 조회와 재입력을 줄인다.

#### 소유 엔티티

| 엔티티 | 식별자 | 설명 |
|---|---|---|
| 고객사 | `client_company_id` | 복지 서비스를 계약한 B2B 고객사 |
| 공급사 | `supplier_id` | 상품, 서비스, 정산 대상 입점사 |
| 임직원 | `employee_id` | 고객사 소속 C 사용자 |
| 계약 | `contract_id` | 고객사 또는 공급사와의 계약 단위 |
| 담당자 | `contact_id` | 고객사, 공급사, 내부 담당자 연락 지점 |
| 활동 | `activity_id` | 상담, 통화, 메일, 이슈, 방문, 내부 메모 |
| 관계 | `relationship_id` | 고객사-공급사-플랫폼 간 운영 관계 |

#### 입력

- 고객사, 공급사, 임직원, 계약 기본정보 등록/수정 요청
- 담당자 및 활동 이력 생성 요청
- 레거시, 베네카페, 정산 시스템에서 수신한 기준 데이터 변경 이벤트
- 운영 콘솔에서 발생한 업무 처리 결과 이벤트

#### 출력

- 표준 엔티티 상세 및 목록
- 엔티티 변경 이벤트
- 검색 인덱스 갱신 이벤트
- 운영 업무와 대시보드에서 참조 가능한 기준 ID

#### 외부 공개 계약

- Query API:
  - `GET /crm/client-companies`
  - `GET /crm/client-companies/{client_company_id}`
  - `GET /crm/suppliers`
  - `GET /crm/suppliers/{supplier_id}`
  - `GET /crm/employees`
  - `GET /crm/employees/{employee_id}`
  - `GET /crm/contracts/{contract_id}`
- Command API:
  - `POST /crm/client-companies`
  - `PATCH /crm/client-companies/{client_company_id}`
  - `POST /crm/suppliers`
  - `PATCH /crm/suppliers/{supplier_id}`
  - `POST /crm/activities`
- Event:
  - `crm.client_company.created`
  - `crm.client_company.updated`
  - `crm.supplier.created`
  - `crm.supplier.updated`
  - `crm.employee.linked`
  - `crm.contract.updated`
  - `crm.activity.created`

#### 인수조건

- 모든 핵심 엔티티는 `tenant_id`, 생성자, 수정자, 생성일, 수정일을 가진다.
- 고객사와 공급사는 단일 명칭이 같아도 서로 다른 엔티티 타입으로 관리된다.
- 임직원 목록 조회는 기본적으로 고객사 테넌트 범위 없이는 실행되지 않는다.
- 개인정보 필드는 기본 목록 응답에 포함하지 않는다.
- 엔티티 생성/수정은 감사로그를 남긴다.
- 변경 이벤트는 최소 1회 발행되며 소비자는 멱등 처리할 수 있어야 한다.

#### 의존성

- `Security & Audit Baseline`: 인증, 권한, 감사 메타데이터
- `Integration Boundary`: 레거시, 베네카페, 결제, 온누리 기준 데이터 동기화
- `Search Projection`: 대량 검색 인덱스
- A4 데이터 에이전트: 최종 데이터 모델 상세화

#### 담당

- 주 담당: A1, A2, A4
- 협업: A6, A7, A9

#### KPI 영향

- 중복 조회 건수 감소
- 고객/공급/임직원 정보 탐색 시간 감소
- 운영 업무 생성 시 기준 데이터 매칭 오류 감소

### 5.2 Operations Console

#### 목적

반복 운영 업무를 접수, 배정, 처리, 보류, 완료, 반려 상태로 표준화하고 운영자가 검색, 필터, 일괄 처리, SLA 기준으로 처리할 수 있게 한다.

인당 생산성/마진 기여: 운영자 1인당 처리 건수를 높이고 업무 누락, 재확인, 수동 배정 시간을 줄인다.

#### 소유 엔티티

| 엔티티 | 식별자 | 설명 |
|---|---|---|
| 업무 항목 | `work_item_id` | 운영자가 처리해야 하는 최소 작업 단위 |
| 업무 큐 | `work_queue_id` | 업무 유형, 우선순위, 담당 조직 기준 큐 |
| 배정 | `assignment_id` | 담당자 또는 팀 배정 이력 |
| SLA 정책 | `sla_policy_id` | 업무 유형별 목표 처리시간 |
| 처리 액션 | `work_action_id` | 승인, 반려, 보류, 완료, 재처리 등 |
| 예외 케이스 | `exception_case_id` | 자동 처리 실패 또는 수동 검토 필요 건 |

#### 입력

- CRM Core 엔티티에서 파생된 업무 생성 요청
- 베네카페, 결제, 온누리, 정산 등 외부 연동 실패 이벤트
- 운영자 수동 접수
- 자동심사 또는 배치 처리 결과

#### 출력

- 업무 목록, 상세, 상태, 담당자, SLA
- 업무 상태 변경 이벤트
- 처리 결과 및 근거
- Profitability Dashboard용 운영 투입량 이벤트

#### 외부 공개 계약

- Query API:
  - `GET /ops/work-items`
  - `GET /ops/work-items/{work_item_id}`
  - `GET /ops/work-queues`
  - `GET /ops/sla-breaches`
- Command API:
  - `POST /ops/work-items`
  - `POST /ops/work-items/{work_item_id}/assign`
  - `POST /ops/work-items/{work_item_id}/transition`
  - `POST /ops/work-items/bulk-transition`
  - `POST /ops/exception-cases/{exception_case_id}/resolve`
- Event:
  - `ops.work_item.created`
  - `ops.work_item.assigned`
  - `ops.work_item.transitioned`
  - `ops.work_item.completed`
  - `ops.work_item.rejected`
  - `ops.exception_case.created`
  - `ops.sla_breached`

#### 상태 모델

```text
received -> triaged -> assigned -> in_progress -> pending_external -> completed
                                  -> on_hold
                                  -> rejected
                                  -> canceled
```

상태 변경은 `transition_reason`, `actor_id`, `evidence_ref`, `request_id`를 포함한다.

#### 인수조건

- 업무 항목은 반드시 `tenant_id`, `work_type`, `priority`, `status`, `source`, `related_entity_ref`를 가진다.
- 업무 목록은 큐, 상태, 담당자, 고객사, 공급사, SLA 초과 여부로 필터링할 수 있어야 한다.
- 일괄 처리는 동일 `work_type`과 허용된 상태 전이에서만 가능하다.
- 일괄 처리는 작업별 성공/실패 결과를 분리해 반환한다.
- 모든 상태 변경은 감사로그와 운영 이벤트를 남긴다.
- 외부 연동 실패는 수동 보정 가능한 예외 케이스로 전환될 수 있어야 한다.

#### 의존성

- `CRM Core`: 관련 고객사, 공급사, 임직원, 계약 참조
- `Security & Audit Baseline`: 작업 권한, 개인정보 마스킹, 감사로그
- `Integration Boundary`: 외부 실패 이벤트와 재처리 액션
- `Profitability Dashboard`: 처리시간, 처리건수, 업무유형별 투입량 제공

#### 담당

- 주 담당: A2, A3, A8
- 협업: A1, A5, A6, A7

#### KPI 영향

- 담당자 1인당 일 처리 건수 증가
- 평균 처리시간 감소
- SLA 초과 건수 감소
- 반복 문의와 재처리 건수 감소

### 5.3 Security & Audit Baseline

#### 목적

CRM OS 전체의 인증, 권한, 테넌트 격리, 개인정보 접근로그, 감사로그, 외감 증적 기준을 제공한다.

인당 생산성/마진 기여: 권한과 감사 기준을 공통화해 ISMS/외감 대응에 필요한 수작업 증적 수집과 사후 보완 비용을 줄인다.

#### 소유 엔티티

| 엔티티 | 식별자 | 설명 |
|---|---|---|
| 사용자 | `user_id` | 내부 운영자, 관리자, 향후 외부 사용자 |
| 역할 | `role_id` | 업무 권한 묶음 |
| 권한 | `permission_id` | 리소스와 액션 단위 권한 |
| 테넌트 접근권 | `tenant_access_id` | 사용자의 테넌트 접근 범위 |
| 감사로그 | `audit_log_id` | 주요 조회, 생성, 수정, 삭제, 승인 이력 |
| 개인정보 접근로그 | `pii_access_log_id` | 개인정보 원문 또는 민감 필드 접근 이력 |
| 승인 정책 | `approval_policy_id` | 고위험 액션의 승인 요구 기준 |

#### 입력

- 로그인 및 세션 검증 요청
- API별 권한 검사 요청
- 개인정보 조회 또는 다운로드 요청
- 주요 업무 상태 변경, 계약 변경, 정산 근거 변경 이벤트

#### 출력

- 권한 판정 결과
- 테넌트 범위 컨텍스트
- 감사로그 및 개인정보 접근로그
- 외감 또는 ISMS 증적 조회용 로그 뷰

#### 외부 공개 계약

- Query API:
  - `GET /security/me`
  - `GET /security/roles`
  - `GET /security/audit-logs`
  - `GET /security/pii-access-logs`
- Command API:
  - `POST /security/authorize`
  - `POST /security/roles`
  - `PATCH /security/roles/{role_id}`
  - `POST /security/tenant-access`
  - `POST /security/audit-logs`
- Event:
  - `security.permission_changed`
  - `security.tenant_access_changed`
  - `security.audit_log.recorded`
  - `security.pii_access.recorded`
  - `security.high_risk_action.requested`

#### 권한 모델 초안

- `platform_admin`: 전체 운영 관리. 고위험 액션은 승인 정책 적용.
- `ops_manager`: 업무 큐, 배정, SLA, 일괄 처리 관리.
- `ops_agent`: 배정된 업무 처리.
- `finance_operator`: 정산, 포인트, 회계 근거 조회와 처리.
- `security_auditor`: 감사로그, 개인정보 접근로그 조회.
- `executive_viewer`: 수익성 및 생산성 집계 조회.
- `supplier_viewer`: 향후 공급사 포털 조회 전용.
- `client_viewer`: 향후 고객사 조회 전용.
- `PM 승인 필요`: 실제 역할명, 조직별 권한 매핑, 외부 사용자 계정 허용 범위.

인당 생산성/마진 기여: 역할을 업무 책임에 맞춰 나누면 과도한 권한으로 인한 사고와 승인 지연을 동시에 줄인다.

#### 인수조건

- 모든 API는 `tenant_context`와 `permission` 판정을 거친다.
- 개인정보 원문 접근은 별도 이벤트와 접근 사유를 남긴다.
- 감사로그는 원본 요청자, 대상 리소스, 변경 전후 요약, 요청 ID를 포함한다.
- 감사로그는 운영자가 임의 수정하거나 삭제할 수 없다.
- 권한 변경은 변경자와 승인 근거를 남긴다.
- 로그 조회 권한은 일반 운영 권한과 분리한다.

#### 의존성

- 사내 인증 시스템 또는 SSO: `PM 승인 필요`
- 개인정보 항목 정의: A7 및 PM 승인 필요
- 로그 보존 기간: A7, A9 및 PM 승인 필요
- 외감 증적 요구: A7, 재무 담당 협의 필요

#### 담당

- 주 담당: A1, A2, A7, A9
- 협업: A3, A4, A6

#### KPI 영향

- 감사 증적 수집 시간 감소
- 권한 오설정 사고 감소
- 개인정보 접근 조사 시간 감소
- 보안 사후 보완 개발 비용 감소

### 5.4 Profitability Dashboard

#### 목적

고객사, 공급사, 업무유형별 매출, 원가, 마진, 운영 투입량, 처리시간을 집계해 경영진과 PM이 저마진 고객/업무를 식별하고 인력 배치를 조정할 수 있게 한다.

인당 생산성/마진 기여: 수익성 낮은 고객, 공급사, 업무유형을 빠르게 식별해 인력 투입과 계약 조건을 마진 기준으로 조정한다.

#### 소유 엔티티

| 엔티티 | 식별자 | 설명 |
|---|---|---|
| 지표 정의 | `metric_definition_id` | 매출, 원가, 마진, 처리시간 등 산식 정의 |
| 지표 스냅샷 | `metric_snapshot_id` | 일/주/월 단위 집계값 |
| 수익성 세그먼트 | `profitability_segment_id` | 고객사, 공급사, 업무유형별 구간 |
| 운영 투입량 | `operation_effort_id` | 처리 건수, 처리시간, 담당자 투입량 |
| 데이터 품질 이슈 | `data_quality_issue_id` | 원천 누락, 산식 오류, 지연 집계 |

#### 입력

- CRM Core의 고객사, 공급사, 계약 기준 데이터
- Operations Console의 처리 건수, 상태, 처리시간, SLA 이벤트
- 정산, 결제, 포인트, 회계 시스템의 매출/원가/정산 데이터
- 수동 보정 또는 데이터 품질 검토 결과

#### 출력

- 고객사별 수익성 뷰
- 공급사별 수익성 뷰
- 업무유형별 처리량 및 비용 뷰
- 저마진/고투입 알림 후보
- 데이터 품질 이슈 목록

#### 외부 공개 계약

- Query API:
  - `GET /profitability/client-companies`
  - `GET /profitability/client-companies/{client_company_id}`
  - `GET /profitability/suppliers`
  - `GET /profitability/work-types`
  - `GET /profitability/data-quality-issues`
- Event:
  - `profitability.metric_snapshot.created`
  - `profitability.low_margin.detected`
  - `profitability.high_effort.detected`
  - `profitability.data_quality_issue.created`

#### 핵심 지표 초안

| 지표 | 식별자 | 설명 | 승인 상태 |
|---|---|---|---|
| 매출 | `revenue_amount` | 고객사 또는 공급사 기준 기간 매출 | PM 승인 필요 |
| 직접 원가 | `direct_cost_amount` | 상품, 결제, 정산 등 직접 귀속 원가 | PM 승인 필요 |
| 운영 원가 | `operation_cost_amount` | 업무 처리시간과 인력 단가 기반 추정 원가 | PM 승인 필요 |
| 마진 | `gross_margin_amount` | 매출에서 직접 원가를 차감한 금액 | PM 승인 필요 |
| 기여이익 | `contribution_margin_amount` | 매출에서 직접 원가와 운영 원가를 차감한 금액 | PM 승인 필요 |
| 처리 건수 | `processed_work_item_count` | 완료된 업무 항목 수 | 초안 |
| 평균 처리시간 | `avg_processing_minutes` | 업무 접수부터 완료까지 평균 시간 | 초안 |
| SLA 초과율 | `sla_breach_rate` | 목표 처리시간 초과 비율 | 초안 |

#### 인수조건

- 지표는 고객사, 공급사, 업무유형, 기간 단위로 필터링할 수 있어야 한다.
- 운영 트랜잭션 원장을 직접 수정하지 않고 집계 스냅샷으로 제공한다.
- 지표 산식과 원천 시스템은 화면 또는 메타데이터로 추적 가능해야 한다.
- 데이터 품질 문제가 있는 지표는 정상 지표와 구분해 표시한다.
- 개인정보 원문 없이 경영 지표를 볼 수 있어야 한다.
- 원가와 마진 산식은 PM 승인 전 확정하지 않는다.

#### 의존성

- `CRM Core`: 고객사, 공급사, 계약 기준
- `Operations Console`: 처리량, 처리시간, SLA 이벤트
- `Integration Boundary`: 결제, 정산, 온누리, 베네카페 데이터 수집
- A4 데이터 에이전트: 지표 산식 및 원천 매핑
- PM 승인: 원가 배부 기준, 인력 단가, 마진 산식

#### 담당

- 주 담당: A3, A4
- 협업: A1, A2, A6, A7

#### KPI 영향

- 저마진 고객사 식별 시간 감소
- 고투입 업무유형 식별
- 인력 배치 의사결정 속도 증가
- 계약 조건 개선 후보 발굴

## 6. 통합 경계와 어댑터 원칙

### 6.1 Integration Boundary 목적

베네카페, 결제, 온누리, 레거시 정산/포인트 시스템은 P0 모듈 내부에 직접 결합하지 않고 `Integration Boundary`를 통해 표준 이벤트와 표준 상태로 변환한다.

인당 생산성/마진 기여: 외부 시스템별 예외를 운영 화면과 핵심 CRM에 흘려보내지 않아 장애 대응과 재처리 시간을 줄인다.

### 6.2 통합 대상 초안

| 대상 | 식별자 | 주요 데이터 | P0 사용처 | 승인 상태 |
|---|---|---|---|---|
| 베네카페 | `benecafe` | 고객사, 임직원, 복지 포인트, 주문 또는 신청 상태 | CRM Core, Operations Console, Profitability Dashboard | 연동 상세 PM 승인 필요 |
| 결제 | `payment_gateway` | 승인, 취소, 환불, 실패, 수수료 | Operations Console, Profitability Dashboard | 외부계약/연동 상세 PM 승인 필요 |
| 온누리 | `onnuri` | 상품권, 사용, 정산, 실패 상태 | Operations Console, Profitability Dashboard | 연동 상세 PM 승인 필요 |
| 정산/회계 | `settlement_accounting` | 매출, 원가, 정산, 회계 근거 | Profitability Dashboard, Security & Audit | 연동 상세 PM 승인 필요 |
| 레거시 CRM/Admin | `legacy_admin` | 기존 고객사, 공급사, 계약, 담당자 | CRM Core | 데이터 품질 확인 필요 |

### 6.3 어댑터 원칙

- 외부 시스템별 어댑터는 외부 API 모델을 내부 도메인 모델로 변환한다.
- 핵심 모듈은 외부 시스템의 원본 필드명, 에러 코드, 인증 방식을 직접 알지 않는다.
- 모든 외부 요청은 `request_id`, `idempotency_key`, `external_system`, `external_ref`를 가진다.
- 외부 실패는 `retryable`, `non_retryable`, `manual_review_required`로 분류한다.
- 재시도는 지수 백오프와 최대 횟수 기준을 사용한다.
- 수동 보정이 필요한 실패는 `ops.exception_case.created` 이벤트로 전환한다.
- 외부 원본 응답은 개인정보와 보관기간 기준에 따라 저장 범위를 제한한다.
- `PM 승인 필요`: 외부 원본 전문 저장 여부, 암호화 범위, 보관기간, 외부 API 호출량 예산.

인당 생산성/마진 기여: 어댑터 표준화로 신규 연동과 장애 대응을 반복 가능한 작업으로 만들어 개발/운영 투입량을 줄인다.

### 6.4 표준 외부 상태 매핑

| 표준 상태 | 설명 | 운영 처리 |
|---|---|---|
| `received` | 외부 이벤트 또는 응답 수신 | 검증 대기 |
| `validated` | 필수 필드와 서명이 검증됨 | 도메인 이벤트 발행 |
| `synced` | 내부 반영 완료 | 업무 종료 또는 지표 반영 |
| `retry_pending` | 일시 실패로 재시도 대기 | 자동 재시도 |
| `manual_review_required` | 자동 처리 불가 | 운영 예외 큐 생성 |
| `rejected` | 비즈니스 규칙상 반려 | 반려 사유 기록 |
| `dead_lettered` | 최대 재시도 초과 | 관리자 점검 |

인당 생산성/마진 기여: 실패 상태를 표준화해 운영자가 시스템별 장애 용어를 해석하는 시간을 줄인다.

## 7. 모듈 간 통신규약

### 7.1 동기 API 사용 기준

- 화면 조회, 단건 검증, 권한 판정은 동기 API를 사용한다.
- 동기 API는 기본적으로 `tenant_context`, `actor_context`, `request_id`를 요구한다.
- 대량 처리, 외부 연동, 집계 갱신은 동기 API만으로 처리하지 않는다.

인당 생산성/마진 기여: 동기 호출을 사용자 응답이 필요한 범위로 제한해 화면 지연과 장애 전파를 줄인다.

### 7.2 비동기 이벤트 사용 기준

- 엔티티 변경, 업무 상태 변경, 감사로그 기록, 지표 집계 갱신, 외부 연동 결과는 이벤트로 전달한다.
- 이벤트 소비자는 멱등성을 보장해야 한다.
- 이벤트는 최소 1회 전달을 전제로 하고, 중복 이벤트를 허용한다.
- 이벤트 스키마 변경은 하위 호환을 원칙으로 한다.

인당 생산성/마진 기여: 비동기 이벤트로 모듈 병렬 개발과 장애 격리를 가능하게 해 조직 전체 개발 효율을 높인다.

### 7.3 공통 API 헤더

| 헤더 | 설명 |
|---|---|
| `X-Request-Id` | 요청 추적 ID |
| `X-Actor-Id` | 요청자 ID |
| `X-Actor-Type` | `internal_user`, `system`, `external_user` |
| `X-Tenant-Id` | 요청 테넌트 |
| `X-Tenant-Type` | `platform`, `client_company`, `supplier` |
| `X-Reason-Code` | 개인정보 조회, 정산 변경 등 사유 코드 |
| `Idempotency-Key` | 중복 처리 방지 키 |

인당 생산성/마진 기여: 공통 메타데이터를 강제해 장애 추적, 감사 대응, 중복 처리 방지에 드는 시간을 줄인다.

### 7.4 공통 이벤트 필드

| 필드 | 설명 |
|---|---|
| `event_id` | 이벤트 고유 ID |
| `event_type` | 이벤트 타입 |
| `event_version` | 스키마 버전 |
| `occurred_at` | 발생 시각 |
| `producer` | 발행 모듈 |
| `tenant_id` | 대상 테넌트 |
| `actor_id` | 유발자 |
| `request_id` | 요청 추적 ID |
| `idempotency_key` | 멱등 처리 키 |
| `resource_type` | 대상 리소스 타입 |
| `resource_id` | 대상 리소스 ID |
| `payload` | 이벤트 본문 |

인당 생산성/마진 기여: 이벤트 추적성을 확보해 연동 실패나 수익성 데이터 오류 조사 시간을 줄인다.

## 8. 데이터 소유권과 읽기 모델

| 데이터 | 소유 모듈 | 읽기 소비자 | 쓰기 원칙 |
|---|---|---|---|
| 고객사/공급사/임직원/계약 | CRM Core | Operations Console, Profitability Dashboard, Integration Boundary | CRM Core Command API만 쓰기 |
| 업무 항목/상태/SLA | Operations Console | Profitability Dashboard, CRM Core 활동 이력 | Operations Console Command API만 쓰기 |
| 권한/감사/개인정보 접근로그 | Security & Audit Baseline | 모든 모듈, 감사 담당자 | Security API 또는 감사 이벤트만 쓰기 |
| 수익성 지표/스냅샷 | Profitability Dashboard | 경영진, PM, 운영 리더 | 집계 파이프라인만 쓰기 |
| 외부 연동 원본/상태 | Integration Boundary | Operations Console, Profitability Dashboard | 어댑터만 쓰기 |

인당 생산성/마진 기여: 데이터 소유권을 명확히 해 동일 데이터를 여러 팀이 다르게 수정하는 비용과 장애 원인을 줄인다.

## 9. 보안 및 감사 기준

### 9.1 개인정보 처리 초안

- 개인정보는 목적에 맞는 최소 필드만 화면과 API에 노출한다.
- 목록 API는 개인정보 원문을 기본 제외한다.
- 상세 API도 권한과 사유 코드가 없으면 마스킹한다.
- 다운로드, 대량 조회, 외부 반출은 고위험 액션으로 분류한다.
- `PM 승인 필요`: 개인정보 및 민감정보 필드 목록, 마스킹 규칙, 다운로드 허용 범위, 보관기간.

인당 생산성/마진 기여: 개인정보 노출을 최소화해 사고 대응 비용과 업무 중단 리스크를 줄인다.

### 9.2 감사로그 대상

- 로그인, 로그아웃, 세션 만료
- 권한 생성, 변경, 삭제
- 테넌트 접근권 변경
- 고객사, 공급사, 임직원, 계약 생성/수정/삭제
- 개인정보 원문 조회, 다운로드, 외부 전송
- 업무 상태 변경, 일괄 처리, 예외 케이스 해소
- 외부 연동 재처리, 수동 보정
- 지표 산식 변경, 원가 보정, 회계 근거 변경

인당 생산성/마진 기여: 감사 대상을 사전에 정의해 외감/ISMS 요청 시 담당자별 자료 취합 시간을 줄인다.

## 10. 비기능 요구사항

| 영역 | 요구사항 | 인수 기준 |
|---|---|---|
| 성능 | 대량 목록은 커서 기반 페이지네이션 사용 | 260만 임직원 규모에서도 테넌트 범위 조회가 가능해야 함 |
| 확장성 | 운영 트랜잭션과 분석 집계 분리 | 지표 집계 실패가 운영 업무 처리를 막지 않아야 함 |
| 가용성 | 외부 연동 실패는 예외 큐로 격리 | 결제/온누리 장애가 CRM 조회를 막지 않아야 함 |
| 보안 | 모든 API 권한 및 테넌트 판정 | 권한 없는 테넌트 데이터 접근 차단 |
| 감사 | 주요 변경과 개인정보 접근 로그 보존 | 요청 ID로 변경 이력 추적 가능 |
| 관측성 | API, 이벤트, 배치, 외부 호출 추적 | 장애 건별 원인 시스템 식별 가능 |
| 운영성 | 수동 보정 큐 제공 | 자동 처리 실패 건이 담당자에게 배정 가능 |

인당 생산성/마진 기여: 운영 확대 시 장애, 지연, 감사 대응에 필요한 추가 인력을 억제한다.

## 11. 유통회사 표준 프로세스 반영

### 11.1 반영 목적

`/docs/PROCESS_REQUIREMENTS.md`의 표준 흐름인 영업활동, 파이프라인, 견적, 계약, 주문, 출고, 배송/입출고, 세금계산서/거래명세표, 매출인식, 영업이익 확인을 P0 아키텍처 경계에 반영한다.

이 흐름은 별도 신규 확정 모듈로 두지 않고, STEP1에서는 기존 P0 모듈과 `Integration Boundary`의 책임으로 나눈다. 단, `Product/Order/Fulfillment/Billing` 도메인의 독립 모듈화 여부는 PM 승인 후 STEP2에서 결정한다.

인당 생산성/마진 기여: 영업부터 매출인식까지 단일 상태 흐름으로 연결해 부서 간 재입력, 누락, 수기 검산, 낮은 이익 원인 추적 시간을 줄인다.

### 11.2 End-to-End 상태머신 초안

```text
sales_activity_logged
  -> pipeline_created
  -> quote_drafted
  -> quote_approval_requested
  -> quote_approved
  -> contract_drafted
  -> contract_approved
  -> contract_active
  -> order_registered
  -> release_requested
  -> released
  -> shipment_requested
  -> in_transit
  -> delivered
  -> statement_issued
  -> tax_invoice_issued
  -> revenue_recognition_requested
  -> revenue_recognized
  -> operating_profit_reviewed
```

예외 상태는 모든 단계에서 `approval_rejected`, `external_failed`, `manual_review_required`, `canceled`, `reversed`를 사용할 수 있다.

상태 변경은 `actor_id`, `approval_document_id`, `transition_reason`, `evidence_ref`, `request_id`, `idempotency_key`를 포함한다.

인당 생산성/마진 기여: 업무 흐름을 상태 기반으로 표준화해 다음 처리 대상, 병목 단계, 이익 훼손 지점을 즉시 식별한다.

### 11.3 단계별 상태와 모듈 경계

| 단계 | 핵심 상태 | 소유 모듈 | 주요 입력 | 주요 출력 | PM 승인 필요 |
|---|---|---|---|---|---|
| 영업활동 | `sales_activity_logged` | CRM Core | 고객, 담당자, 활동내용, 다음 액션 | 활동 타임로그, 파이프라인 후보 | 활동 유형 표준 |
| 영업파이프라인 | `pipeline_created`, `pipeline_updated`, `pipeline_lost`, `pipeline_won` | CRM Core | 고객, 상품, 수량, 예상금액, 확률 | 파이프라인 상태, 견적 후보 | 단계명, 확률 기준 |
| 견적 | `quote_drafted`, `quote_approval_requested`, `quote_approved`, `quote_rejected`, `quote_expired` | Operations Console | 상품, 판매가격, 할인, 수량, 유효기간 | 견적서, 승인 문건 | 할인 승인 기준 |
| 계약 | `contract_drafted`, `contract_approved`, `contract_active`, `contract_expired`, `contract_terminated` | CRM Core | 고객, 계약기간, 계약금액, 담당자 | 계약 레코드, 주문 후보 | 계약 승인 기준 |
| 주문 | `order_registered`, `order_confirmed`, `order_canceled` | Operations Console | 계약, 고객, 상품, 수량, 납기, 배송지 | 주문 레코드, 출고 요청 | 주문 취소/변경 권한 |
| 출고 | `release_requested`, `release_approved`, `released`, `release_failed` | Operations Console | 주문, 창고/출고처, 수량 | 출고 상태, 배송 요청 | 재고/창고 원천 시스템 |
| 배송/입출고 | `shipment_requested`, `in_transit`, `delivered`, `returned`, `lost`, `manual_tracking_required` | Integration Boundary | 송장번호, 택배사, 출고정보 | 배송 상태, 위치, 예외 알림 | 택배사 API/비용/계약 |
| 세금계산서/거래명세표 | `statement_issued`, `tax_invoice_requested`, `tax_invoice_issued`, `tax_invoice_failed` | Operations Console, Integration Boundary | 주문, 공급가, 세액, 거래처 | 발행 문서, 발행 로그 | 전자세금계산서 연동 범위 |
| 매출인식 | `revenue_recognition_requested`, `revenue_recognized`, `revenue_adjusted`, `revenue_reversed` | Profitability Dashboard | 주문, 출고, 청구, 회계 기준 | 매출 레코드, 수익성 지표 | 매출인식 기준 |
| 영업이익 확인 | `operating_profit_calculated`, `operating_profit_reviewed` | Profitability Dashboard | 매출, 원가율, 판관비율, 일반관리비율 | 이익률, 원인 지표 | MVP 산식 및 공개 범위 |

인당 생산성/마진 기여: 단계별 소유 모듈을 명확히 해 업무 중복 처리와 책임 공백을 줄인다.

### 11.4 모듈별 아키텍처 영향

| 모듈 | 추가 책임 | 추가 계약 초안 | 인수조건 | KPI 영향 |
|---|---|---|---|---|
| CRM Core | 영업활동, 파이프라인, 계약 기준 데이터 소유 | `/crm/sales-activities`, `/crm/pipelines`, `/crm/contracts`; `crm.pipeline.*`, `crm.contract.*` | 파이프라인과 계약은 고객사/담당자/활동 이력과 연결되어야 한다. | 영업 이력 탐색 시간 감소, 계약 전환율 추적 |
| Operations Console | 견적, 주문, 출고, 발행 업무 큐와 결재 대상 관리 | `/ops/quotes`, `/ops/orders`, `/ops/releases`, `/ops/billing-documents`; `ops.quote.*`, `ops.order.*`, `ops.release.*`, `ops.billing_document.*` | 견적/주문/출고/발행은 상태 전이와 결재 이력을 남겨야 한다. | 승인 대기와 누락 감소, 처리 리드타임 감소 |
| Security & Audit Baseline | 결재 문건, 결재 라인, 권한별 메뉴, 타임로그/감사로그 통제 | `/security/approval-documents`, `/security/approval-lines`, `/security/timelogs`; `security.approval.*`, `security.timelog.recorded` | 결재 작성자는 로그인 사용자로 자동 지정되고 변경 이력이 남아야 한다. | 책임소재 확인 시간 감소, 내부통제 대응 비용 감소 |
| Profitability Dashboard | 매출인식, 영업이익 산식, 원인 지표 집계 | `/profitability/revenue-recognitions`, `/profitability/operating-profit`; `profitability.revenue_recognized`, `profitability.operating_profit_calculated` | 산식과 원천 데이터 품질 이슈를 표시하고 PM 승인 전 확정 지표로 표시하지 않는다. | 저마진 원인 식별, 가격/할인/배송비 정책 개선 |
| Integration Boundary | 택배사, 전자세금계산서, 거래명세표, 재고/입출고 원천 연동 | `carrier_tracking`, `e_tax_invoice`, `inventory_warehouse`; `integration.delivery.*`, `integration.tax_invoice.*`, `integration.inventory.*` | 연동 실패는 운영 예외 큐로 전환하고 수동 보정 경로를 제공해야 한다. | 배송 문의와 발행 실패 대응 시간 감소 |

인당 생산성/마진 기여: 신규 프로세스를 기존 P0 모듈 책임으로 흡수해 새 조직 경계로 인한 지연 없이 업무 흐름을 표준화한다.

### 11.5 결재 아키텍처 영향

- 결재 문건 작성자는 현재 로그인한 `user_id`로 자동 지정한다.
- 결재 문건은 `approval_document_id`, `document_type`, `target_resource_type`, `target_resource_id`, `submitter_id`, `status`를 가진다.
- 결재 라인은 `approval_line_id`, `approval_document_id`, `approver_id`, `sequence`, `status`, `decided_at`을 가진다.
- 결재 대상 후보는 견적, 계약, 세금계산서/거래명세표 발행, 매출인식 조정, 영업이익 산식 변경이다.
- 결재 상태는 `draft`, `submitted`, `in_review`, `approved`, `rejected`, `canceled`, `returned`를 사용한다.
- 결재 라인 임의 지정과 순서 변경은 허용하되, 결재권자 범위와 대리결재 정책은 `PM 승인 필요`로 둔다.
- 결재 상태 변경은 타임로그와 감사로그를 모두 남긴다.

인당 생산성/마진 기여: 결재 흐름을 시스템 이벤트로 만들면 승인 대기, 누락, 책임소재 확인 시간을 줄인다.

### 11.6 로그 아키텍처 영향

- `timelog`는 업무 맥락 중심 이력이며 사용자가 화면에서 확인하는 작업 이력으로 둔다.
- `audit_log`는 보안, 내부통제, 외감 증적 중심의 변경 불가 로그로 둔다.
- 동일 행위가 업무 이력과 통제 증적을 모두 요구하면 `timelog`와 `audit_log`를 함께 기록한다.
- 추가 로그 대상은 고객정보, 임직원정보, 매출정보, 상품정보, 견적, 계약, 주문, 출고, 배송, 세금계산서, 거래명세표, 매출인식, 결재 문건, 결재 라인, 영업이익 산식 변경이다.
- 설정 메뉴의 로그기록 확인은 `security_auditor`, `supervisor`, `platform_admin` 후보 권한에 제공하되 개인정보 처리범위는 `PM 승인 필요`로 둔다.

인당 생산성/마진 기여: 업무 타임로그와 감사로그를 분리해 현장 추적성과 외감 대응을 모두 만족하면서 로그 조회 혼선을 줄인다.

### 11.7 연동 아키텍처 영향

| 연동 | 내부 식별자 | 목적 | 실패 처리 | PM 승인 필요 |
|---|---|---|---|---|
| 택배사 위치 조회 | `carrier_tracking` | 배송 현재 위치와 상태 확인 | 수동 송장 입력, 상태 보정, 재조회 큐 | API, 비용, 계약 조건, 송장번호 체계 |
| 재고/입출고 원천 | `inventory_warehouse` | 출고 가능 수량, 창고, 입출고 상태 확인 | 출고 실패 예외 큐, 수동 출고 상태 보정 | 원천 시스템과 책임 범위 |
| 전자세금계산서 | `e_tax_invoice` | 세금계산서 발행과 발행 상태 수신 | 발행 실패 예외 큐, 재발행, 수동 첨부 | 외부 서비스, 위탁 범위, 원본 보관 |
| 거래명세표 | `transaction_statement` | 거래명세표 발행, 첨부, 전송 | 재전송, 수동 첨부, 발행 취소 | 양식, 법적 보관 범위 |
| 회계/매출 원천 | `revenue_accounting` | 매출인식과 회계 근거 반영 | 데이터 품질 이슈, 수동 보정 큐 | 매출인식 기준, 외감 증적 범위 |

인당 생산성/마진 기여: 배송, 발행, 매출인식 실패를 표준 예외 큐로 올려 반복 문의와 수동 추적 시간을 줄인다.

### 11.8 영업이익 산식 반영

`/docs/PROCESS_REQUIREMENTS.md`의 MVP 산식은 다음 초안 지표로 매핑한다. 단, 산식 확정과 슈퍼바이저 공개 범위는 `PM 승인 필요`로 둔다.

| 지표 | 식별자 | 초안 산식 | 승인 상태 |
|---|---|---|---|
| 매출금액 | `salesAmount` | 주문 또는 매출인식 기준 금액 | PM 승인 필요 |
| 원가 | `costAmount` | `salesAmount * 0.5` | PM 승인 필요 |
| 판매관리비 및 일반관리비 | `sgnaAmount` | `salesAmount * 0.5` | PM 승인 필요 |
| 영업이익 | `operatingProfit` | `salesAmount - costAmount - sgnaAmount` | PM 승인 필요 |
| 영업이익률 | `operatingProfitRate` | `operatingProfit / salesAmount` | PM 승인 필요 |

원가 50%와 판매관리비 및 일반관리비 50%를 동시에 적용하면 기본 영업이익은 0이므로, 대시보드는 할인, 반품, 배송비, 처리시간, 결재 지연, 정산 지연, 예외 처리 건수를 이익 저하 원인 후보로 함께 표시한다.

인당 생산성/마진 기여: 단순 MVP 산식으로 빠르게 지표를 시작하되 이익 저하 원인을 분해해 가격, 할인, 업무 배정 조정에 바로 연결한다.

### 11.9 권한과 메뉴 영향

| 권한 후보 | 표시 메뉴 | 제한 | PM 승인 필요 |
|---|---|---|---|
| `general_user` | 내 영업활동, 내 파이프라인, 견적, 주문, 내 결재함 | 전사 영업이익 산식과 전사 로그 접근 제한 | 역할명과 조직 매핑 |
| `admin_user` | 고객, 상품, 주문, 출고, 세금계산서, 거래명세표, 팀 업무 | 권한/산식 변경 제한 | 메뉴 범위 |
| `supervisor` | 전사 대시보드, 영업이익, 로그, 설정, 권한 관리 | 개인정보는 승인된 항목만 접근 | 임직원정보/로그 공개 범위 |

인당 생산성/마진 기여: 역할별 메뉴를 제한해 반복 업무 집중도를 높이고 민감 정보 노출에 따른 리스크 비용을 줄인다.

### 11.10 추가 PM 승인 필요 항목

1. 유통회사 표준 프로세스를 P0 확장 범위로 둘지, STEP2 별도 도메인 모듈로 분리할지 여부
2. 영업이익 MVP 산식: 원가 50%, 판매관리비 및 일반관리비 50% 고정 반영 여부
3. 택배사 실시간 위치 연동의 API, 계약, 비용, 송장번호 체계
4. 전자세금계산서와 거래명세표 발행 연동 범위, 법적 보관 범위, 외부 위탁 범위
5. 결재 라인 임의 지정 범위, 대리결재, 전결, 반려 후 재상신 정책
6. 매출인식 기준: 출고, 배송완료, 검수, 청구, 입금 중 어떤 시점을 기준으로 할지
7. 슈퍼바이저가 조회 가능한 영업이익, 로그, 임직원정보 범위
8. 상품, 재고, 창고, 배송지 개인정보의 원천 시스템과 처리범위

인당 생산성/마진 기여: 비용, 회계, 개인정보 리스크가 큰 결정을 승인 게이트로 분리해 잘못된 구현과 재작업을 막는다.

## 12. 아키텍처 결정 초안

| 결정 ID | 결정 | 상태 | PM 승인 | 인당 생산성/마진 기여 |
|---|---|---|---|---|
| `ADR-A1-001` | P0 모듈은 CRM Core, Operations Console, Security & Audit Baseline, Profitability Dashboard로 분리한다. | 초안 | 필요 | 병렬 개발과 책임 분리로 재작업을 줄인다. |
| `ADR-A1-002` | 모든 비즈니스 데이터는 `tenant_id`와 권한 판정을 기본 전제로 한다. | 초안 | 필요 | 고객사 증가에도 권한 관리 인력 증가를 억제한다. |
| `ADR-A1-003` | 외부 시스템은 핵심 모듈에 직접 결합하지 않고 어댑터로 격리한다. | 초안 | 필요 | 연동 장애 대응과 신규 연동 개발 비용을 줄인다. |
| `ADR-A1-004` | 운영 트랜잭션과 수익성 집계 모델을 분리한다. | 초안 | 필요 | 대시보드 부하가 운영 처리량을 떨어뜨리지 않게 한다. |
| `ADR-A1-005` | 개인정보 원문 접근은 사유 코드와 감사로그를 필수로 한다. | 초안 | 필요 | 사고 조사와 ISMS 대응 비용을 줄인다. |
| `ADR-A1-006` | 업무 상태 변경은 표준 상태 모델과 이벤트로 기록한다. | 초안 | 필요 | 업무 누락과 담당자별 임의 처리를 줄인다. |
| `ADR-A1-007` | 원가, 마진, 인력 단가 산식은 PM 승인 전 확정하지 않는다. | 초안 | 필요 | 잘못된 수익성 지표 기반 의사결정과 재작업을 막는다. |
| `ADR-A1-008` | 유통회사 표준 프로세스는 STEP1에서 기존 P0 모듈 책임으로 매핑하고 신규 모듈 확정은 보류한다. | 초안 | 필요 | 새 모듈 확정 전에도 영업-매출 흐름을 표준화해 병렬 작업 지연을 줄인다. |
| `ADR-A1-009` | 견적, 계약, 발행, 매출인식 조정은 결재 문건과 결재 라인 이벤트를 통해 추적한다. | 초안 | 필요 | 승인 누락과 책임소재 확인 시간을 줄인다. |
| `ADR-A1-010` | 배송/입출고, 세금계산서, 거래명세표 연동 실패는 Operations Console 예외 큐로 전환한다. | 초안 | 필요 | 수동 추적과 재처리 시간을 줄여 운영 처리량을 높인다. |
| `ADR-A1-011` | 타임로그는 업무 이력, 감사로그는 통제 증적으로 분리한다. | 초안 | 필요 | 현장 조회성과 외감 대응을 동시에 만족해 로그 관리 비용을 줄인다. |
| `ADR-A1-012` | 영업이익 MVP 산식은 요구사항 입력으로 반영하되 PM 승인 전 확정 지표로 표시하지 않는다. | 초안 | 필요 | 잘못된 손익 판단으로 가격/인력 정책을 오조정하는 비용을 막는다. |

## 13. 가정

- 가정: 베네카페, 결제, 온누리의 상세 API 문서와 호출 제한은 아직 제공되지 않았다.
- 가정: 기존 레거시 관리자 또는 정산 시스템이 CRM Core의 초기 데이터 원천이 될 수 있다.
- 가정: 초기 사용자 채널은 네이티브 앱이 아니라 반응형 웹 또는 PWA 중심으로 검토한다.
- 가정: 임직원 260만 명 이상 데이터는 실시간 전체 스캔이 아니라 테넌트, 상태, 기간, 검색 인덱스 기준 조회가 필요하다.
- 가정: Profitability Dashboard의 매출/원가/마진 지표는 회계 및 PM 검토 후 확정한다.
- 가정: 외부 공급사 또는 고객사 포털은 P2 이후 확장 대상으로 둔다.
- 가정: 상품, 재고, 창고, 배송, 전자세금계산서, 거래명세표 원천 시스템은 아직 확정되지 않았다.
- 가정: 유통회사 표준 프로세스는 STEP1에서 아키텍처 경계와 상태머신만 반영하고 직접 구현하지 않는다.

인당 생산성/마진 기여: 불확실한 전제를 가정으로 분리해 승인 전 과투자와 잘못된 구현을 막는다.

## 14. PM 승인 필요 항목

1. P0 모듈 범위 확정: `CRM Core`, `Operations Console`, `Security & Audit Baseline`, `Profitability Dashboard`
2. 멀티테넌트 물리 분리 수준: 단일 DB 논리 분리, 스키마 분리, 고객사별 전용 저장소 여부
3. 개인정보 및 민감정보 필드 목록, 마스킹 기준, 보관기간, 다운로드 정책
4. 외부 연동 원본 전문 저장 여부와 보관기간
5. 베네카페, 결제, 온누리 상세 API, 외부계약, 호출량 예산
6. 인증/SSO, 권한 역할명, 조직별 권한 매핑
7. 수익성 지표 산식: 매출, 직접 원가, 운영 원가, 마진, 기여이익
8. 인력 단가 또는 업무 처리 원가 산정 기준
9. 감사로그 보존기간과 외감 증적 제공 범위
10. 기술스택, DBMS, 검색엔진, 메시지 브로커, BI 도구 최종 선정
11. 유통회사 표준 프로세스를 P0 확장 범위로 둘지 또는 STEP2 별도 도메인으로 분리할지 여부
12. 영업이익 MVP 산식: 원가 50%, 판매관리비 및 일반관리비 50% 고정 기준 반영 여부
13. 택배사 실시간 위치 연동 API, 계약, 비용, 송장번호 체계
14. 전자세금계산서/거래명세표 발행 연동 범위, 법적 보관 범위, 외부 위탁 범위
15. 결재 라인 임의 지정, 대리결재, 전결, 반려 후 재상신 정책
16. 매출인식 기준과 매출 조정 권한
17. 슈퍼바이저 전용 대시보드의 영업이익, 로그, 임직원정보 공개 범위

인당 생산성/마진 기여: 승인 게이트를 명확히 해 비용, 보안, 회계 리스크가 큰 결정을 무단 확정하지 않는다.

## 15. 타 에이전트 작업 기준

| 에이전트 | 독립 작업 입력 | 산출물 기대 |
|---|---|---|
| A2 | P0 API, 업무 상태 모델, 유통 표준 프로세스 상태 | 서비스 설계, API 상세, 영업-주문-발행 처리 플로우 |
| A3 | Operations Console, Profitability Dashboard 경계, 권한별 메뉴 | 화면 IA, 사용자 플로우, 결재 라인 UI, 대시보드 와이어 |
| A4 | CRM Core 엔티티, 지표 초안, 매출인식/영업이익 데이터 | 데이터 모델, 지표 산식 검증, 원천 매핑 |
| A5 | 업무 큐, 예외 케이스, 결재/배송/이익 저하 자동화 후보 | 자동화 후보, 사람 검토 기준 |
| A6 | Integration Boundary, 택배사/세금계산서/거래명세표 어댑터 원칙 | 연동 질문지와 어댑터 스펙 |
| A7 | Security & Audit Baseline, 결재/로그/개인정보 승인 항목 | 개인정보 흐름도, ISMS/외감 통제 요구 |
| A8 | E2E 상태머신, Operations Console 처리량 KPI | 운영 프로세스, SLA, 일괄 처리, 권한별 검증 기준 |
| A9 | 비기능 요구사항, 보안/관측성/로그 보존 기준 | 인프라, 로그, 모니터링, 배포 기준 |

인당 생산성/마진 기여: 에이전트별 입력과 산출물을 나눠 병렬 작업 중 충돌과 대기 시간을 줄인다.

## 16. 완료조건 점검

| 항목 | 반영 여부 |
|---|---|
| 목적 | 반영 |
| 입력 | 반영 |
| 출력 | 반영 |
| 인수조건 | 반영 |
| 의존성 | 반영 |
| 담당 | 반영 |
| KPI 영향 | 반영 |
| PM 승인 필요 표시 | 반영 |
| 가정 표시 | 반영 |
| 모듈 경계 | 반영 |
| 통신규약 | 반영 |
| 베네카페/결제/온누리 연동 경계 | 반영 |
| 유통회사 표준 프로세스 상태머신 | 반영 |
| 결재/로그/배송/발행/매출인식 영향 | 반영 |

인당 생산성/마진 기여: DoD를 문서 내에서 점검해 후속 검토와 재작성 비용을 줄인다.

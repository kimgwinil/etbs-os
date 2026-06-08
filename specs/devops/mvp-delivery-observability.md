# MVP Delivery & Observability Spec

## 1. 목적

이 스펙은 이제너두 전사 CRM OS MVP P0 모듈을 대상으로 한 명령 빌드/테스트/배포와 운영 관측성의 최소 구현 계약을 정의한다.

대상 P0 모듈:

- CRM Core
- Operations Console
- Security & Audit Baseline
- Profitability Dashboard

인당 생산성/마진 기여: MVP 개발팀이 같은 배포와 관측성 계약을 사용하게 해 통합 지연, 수동 검증, 장애 조사 시간을 줄인다.

## 2. 입력

| 입력 | 설명 |
|---|---|
| `/docs/PRD.md` | MVP P0 모듈과 비기능 요구사항 |
| `/docs/PROCESS_REQUIREMENTS.md` | 영업부터 영업이익 확인까지의 업무 프로세스, 타임로그, 배송/입출고, 권한별 메뉴 요구사항 |
| `/specs/audit/timelog-auditlog.md` | 타임로그/감사로그 필드, 로그기록 메뉴, 수익성 비용 입력 로그 기준 |
| `/specs/settings/profit-cost-permission.md` | 제원원가, 판관비, 일반관리비 입력 권한과 산식 버전 요구사항 |
| A1 Architecture | 서비스 경계, 런타임, 배포 대상 |
| A2 Backend | API, 업무 이벤트, 감사로그 발생 지점 |
| A3 Frontend/Product | 운영 콘솔, 대시보드 사용자 흐름 |
| A4 Data | 수익성 KPI 원천 데이터와 계산 주기 |
| A6 Integration | 외부 연동 장애, 재시도, 멱등성 기준 |
| A7 Security | RBAC, 개인정보, 감사로그, ISMS 기준 |
| A8 Automation | 자동화 처리량, 예외 큐, 수동 보정 기준 |

인당 생산성/마진 기여: 필요한 입력을 선명히 해 각 담당 에이전트가 병렬로 산출물을 만들고 통합 시간을 줄인다.

## 3. 출력

| 출력 | 설명 |
|---|---|
| Command Contract | `make` 기반 빌드/검증/배포/롤백 명령 계약 |
| Pipeline Gate | PR, main, staging, prod 배포 검증 게이트 |
| Environment Contract | local/dev/staging/prod 환경 분리 기준 |
| Secret Contract | 시크릿 저장, 주입, 회전, 감사 기준 |
| Observability Contract | 로그, 메트릭, 트레이스, 알림 기준 |
| KPI Mapping | 운영 KPI와 시스템 지표 연결 기준 |
| Audit Evidence | 타임로그, 감사로그, 배포, 권한/설정 변경, 개인정보 접근, 주요 변경 증적 기준 |

인당 생산성/마진 기여: 산출물을 계약 형태로 정의해 구현 도구가 바뀌어도 업무 자동화와 감사 대응 기준을 유지한다.

## 4. Command Contract

### 4.1 필수 명령

| 명령 | 입력 | 출력 | 인수조건 |
|---|---|---|---|
| `make setup` | 잠금 파일, 샘플 설정 | 실행 가능한 로컬 환경 | 신규 담당자가 문서만 보고 로컬 헬스체크까지 완료할 수 있다. |
| `make lint` | 소스 코드 | lint/type 결과 | CI와 로컬 결과가 동일하다. |
| `make test` | 테스트 코드, 샘플 데이터 | 테스트 리포트 | 단위/계약/권한 핵심 테스트가 통과한다. |
| `make build` | 소스 코드, 버전 정보 | 배포 아티팩트 | 커밋 SHA와 버전이 아티팩트에 포함된다. |
| `make migrate ENV=<env>` | 마이그레이션 파일 | 적용/검증 결과 | 적용 전 검증과 롤백 가능성 확인이 수행된다. |
| `make deploy ENV=<env>` | 배포 아티팩트, 승인 정보 | 배포 결과 | 대상 환경 헬스체크와 smoke test가 통과한다. |
| `make rollback ENV=<env> VERSION=<version>` | 복구 대상 버전 | 롤백 결과 | 롤백 후 헬스체크와 smoke test가 통과한다. |

결정: MVP의 자동화 진입점은 `make` 명령 계약으로 표준화한다.

인당 생산성/마진 기여: 명령 진입점을 통일해 담당자 교체와 신규 합류 시 온보딩 시간을 줄인다.

PM 승인 필요: 실제 패키지 매니저, 빌드 시스템, 배포 런타임 확정.

### 4.2 명령 공통 요구

- 모든 명령은 성공 시 0, 실패 시 0이 아닌 종료 코드를 반환한다.
- 모든 명령은 사람이 읽을 수 있는 요약과 CI가 읽을 수 있는 결과 파일을 남긴다.
- `ENV=prod` 명령은 승인 정보 없이 실행되지 않아야 한다.
- 운영 배포와 롤백은 배포 이력 저장소에 기록되어야 한다.
- 배포 결과는 외감 대응 증적 필드와 연결되어야 한다.
- 개인정보 또는 시크릿 값은 출력에 포함하지 않는다.

인당 생산성/마진 기여: 자동화 결과를 기계와 사람이 함께 읽을 수 있게 해 장애 시 수동 확인 시간을 줄인다.

## 5. Pipeline Gate

### 5.1 PR Gate

| Gate | 필수 체크 | 실패 시 |
|---|---|---|
| Source Integrity | 잠금 파일, 금지 파일, 대용량 파일 확인 | 병합 차단 |
| Static Quality | lint, format, type check | 병합 차단 |
| Test | unit, contract, permission baseline test | 병합 차단 |
| Build | 아티팩트 생성 가능성 확인 | 병합 차단 |
| Secret Scan | 커밋과 diff 내 시크릿 탐지 | 병합 차단 및 시크릿 폐기 절차 |
| Dependency Scan | 취약점 기준 확인 | 기준 초과 시 병합 차단 |
| Migration Check | DB 변경 적용/롤백 검증 | 병합 차단 |
| Audit Impact | 개인정보/권한/설정/영업이익 산식/정산/배포 영향 표시 | 승인자 확인 필요 |

인당 생산성/마진 기여: 결함을 운영 전 단계에서 자동 차단해 장애 대응과 재배포 비용을 줄인다.

### 5.2 Release Gate

| Gate | dev | staging | prod |
|---|---|---|---|
| 자동 배포 | 필수 | 선택 | 금지 |
| 승인 | 선택 | 담당 승인 | PM 또는 위임 릴리즈 책임자 승인 |
| smoke test | 필수 | 필수 | 필수 |
| rollback plan | 권장 | 필수 | 필수 |
| 배포 이력 | 필수 | 필수 | 필수 |
| 외감 증적 | 권장 | 필수 | 필수 |
| 모니터링 윈도우 | 권장 | 필수 | 필수 |

결정: prod는 승인 기반 배포만 허용한다.

인당 생산성/마진 기여: 운영 장애로 인한 업무 중단과 고객 신뢰 손실을 줄인다.

PM 승인 필요: prod 승인자, 릴리즈 책임 위임 범위, 긴급 배포 절차.

## 6. Environment Contract

| 환경 | 용도 | 데이터 | 보호 기준 |
|---|---|---|---|
| local | 개인 개발 | 샘플/더미 | 실데이터 금지 |
| dev | 통합 개발 | 비식별 테스트 데이터 | 팀 내부 접근 |
| staging | 운영 전 검증 | 마스킹된 운영 유사 데이터 가능 | 승인된 담당자 접근 |
| prod | 실제 운영 | 승인된 운영 데이터 | 최소권한, 감사로그 필수 |

환경별 설정은 다음 키를 최소 포함한다.

| 키 | 설명 |
|---|---|
| `APP_ENV` | 환경 이름 |
| `APP_VERSION` | 배포 버전 |
| `DATABASE_URL` | 환경별 DB 접속 정보 |
| `SECRET_STORE_REF` | 시크릿 저장소 참조 |
| `LOG_LEVEL` | 로그 수준 |
| `OBSERVABILITY_ENDPOINT` | 로그/메트릭 전송 대상 |
| `FEATURE_FLAGS` | 기능 플래그 |
| `EXTERNAL_API_BASE_URL` | 외부 연동 기본 URL |

결정: 환경별 차이는 설정으로만 표현하고 코드 분기를 최소화한다.

인당 생산성/마진 기여: 환경 차이로 생기는 장애와 디버깅 시간을 줄인다.

PM 승인 필요: staging 데이터 사용 범위, prod 접근 승인자, 최종 환경 수.

## 7. Secret Contract

### 7.1 금지사항

- 시크릿을 Git 저장소에 커밋 금지.
- 시크릿을 문서, PR 설명, 이슈, 메신저, 로그에 노출 금지.
- 운영 시크릿을 local/dev에서 재사용 금지.
- 개인 계정에 운영 시크릿 장기 보관 금지.

### 7.2 필수 수명주기

| 단계 | 요구 |
|---|---|
| 생성 | 소유자, 용도, 환경, 만료/회전 기준 등록 |
| 배포 | CI/CD 또는 런타임에서만 주입 |
| 조회 | 최소권한과 감사로그 적용 |
| 회전 | 정기 회전 및 사고 시 즉시 회전 |
| 폐기 | 사용 중단 후 폐기 이력 기록 |

결정: MVP부터 시크릿은 환경별로 분리하고 감사 가능한 저장소에서만 주입한다.

인당 생산성/마진 기여: 시크릿 사고로 인한 서비스 중단과 보안 대응 비용을 줄인다.

PM 승인 필요: Secret Store/KMS 제품, 운영 키 관리자, 회전 주기.

## 8. Observability Contract

### 8.1 Trace 기준

- 모든 외부 요청은 `trace_id`를 생성하거나 전달받는다.
- 내부 서비스 호출, DB 주요 쿼리, 외부 API 호출은 같은 `trace_id`로 연결한다.
- 운영 업무 이벤트는 `trace_id`, `tenant_id`, `entity_id`, `operation_task_id`를 포함한다.

인당 생산성/마진 기여: 장애와 업무 지연의 원인을 한 번에 추적해 조사 시간을 줄인다.

### 8.2 Log 기준

필수 구조화 로그 필드:

| 필드 | 필수 여부 |
|---|---|
| `timestamp` | 필수 |
| `event_time` | 필수 |
| `log_id` | 필수 |
| `log_type` | 필수 |
| `environment` | 필수 |
| `service` | 필수 |
| `version` | 필수 |
| `trace_id` | 필수 |
| `actor_id` | 조건부 필수 |
| `actor_user_id` | 조건부 필수 |
| `actor_role` | 조건부 필수 |
| `tenant_id` | 조건부 필수 |
| `entity_id` | 조건부 필수 |
| `object_type` | 조건부 필수 |
| `object_id` | 조건부 필수 |
| `menu_id` | 메뉴/설정 화면 이벤트 필수 |
| `menu_name` | 메뉴/설정 화면 이벤트 필수 |
| `route_id` | 메뉴/설정 화면 이벤트 필수 |
| `action` | 필수 |
| `result` | 필수 |
| `duration_ms` | 권장 |
| `error_code` | 실패 시 필수 |
| `pii_accessed` | 개인정보 접근 경로 필수 |
| `before_ref` | 변경 이벤트 필수 |
| `after_ref` | 변경 이벤트 필수 |
| `approval_id` | 결재/승인 이벤트 필수 |
| `cost_input_type` | 수익성 비용 입력 이벤트 필수 |
| `cost_input_value` | 수익성 비용 입력 이벤트 조건부 필수 |
| `formula_version` | 산식/비용 입력 이벤트 필수 |

감사로그 필수 이벤트:

- 인증 성공/실패
- 권한 생성/변경/삭제
- 설정 변경, 메뉴 노출 변경, 기능 플래그 변경
- 개인정보 조회/반출
- 운영 업무 상태 변경
- 영업활동, 파이프라인, 견적, 계약, 주문, 출고, 배송, 발행, 매출인식 상태 변경
- 결재 문건 작성, 상신, 결재 라인 변경, 승인, 반려
- 영업이익 산식/비율 변경
- 수익성 비용 입력/수정/삭제, 비용 입력 권한 차단, 비용 입력 저장 실패
- 배송 지연, 오배송, 반송, 미출고, 수동 송장 입력, 상태 보정
- 메뉴 진입, 목록 조회, 상세 조회, 생성, 수정, 삭제, 결재, 반출, 필터 저장, 권한 차단
- 로그 목록 조회, 로그 상세 조회, 로그 반출 요청
- 입사등록 생성, 수정, 상신, 승인, 반려, 보류, 최종 승인 반영
- 고객사/공급사/계약 주요 변경
- 정산/포인트 금액 변경
- 데이터 반입/반출
- 배포/롤백

인당 생산성/마진 기여: 운영 이슈와 감사 요청의 증거 수집 시간을 줄인다.

PM 승인 필요: 로그 보존기간, 마스킹 정책, 감사로그 저장소.

### 8.2.1 Profit Cost Input Log Contract

| 이벤트 | 필수 필드 | 결과 |
|---|---|---|
| `profit_cost.created` | `cost_input_type`, `cost_input_value`, `formula_version`, `actor_user_id`, `actor_role`, `approval_id`, `result` | success, failure, denied |
| `profit_cost.updated` | `cost_input_type`, `before_ref`, `after_ref`, `formula_version`, `actor_role`, `approval_id`, `result` | success, failure, denied |
| `profit_cost.deleted` | `cost_input_type`, `before_ref`, `formula_version`, `actor_role`, `approval_id`, `result` | success, failure, denied |
| `profit_cost.permission_denied` | `cost_input_type`, `actor_user_id`, `actor_role`, `denial_reason`, `result=denied` | denied |
| `profit_formula.version_changed` | `formula_version`, `before_ref`, `after_ref`, `actor_role`, `approval_id`, `result` | success, failure, denied |

결정: 수익성 비용 입력 로그는 `cost_input_type`, `formula_version`, `actor_role`, `before_ref`, `after_ref`, `approval_id`, `result`를 필수 계약으로 둔다.

인당 생산성/마진 기여: 제원원가, 판관비, 일반관리비 변경 원인을 자동 추적해 영업이익 지표 오류와 재검산 시간을 줄인다.

PM 승인 필요: 제원원가 회계 의미, 비용 입력 권한 범위, 비용 변경 결재 필요 여부.

### 8.2.2 Time Log & Audit Retention

| 대상 | 필수 이벤트 | 보존 요구 |
|---|---|---|
| 고객정보, 임직원정보, 상품정보 | 생성, 수정, 삭제, 조회 | 기간 PM 승인 필요 |
| 매출정보, 매출인식, 영업이익 산출 기준 | 생성, 조정, 산식/비율 변경, 승인 | 기간 PM 승인 필요 |
| 수익성 비용 입력 | 제원원가, 판관비, 일반관리비 입력/수정/삭제, 권한 차단, 저장 실패 | 기간 PM 승인 필요 |
| 견적, 계약, 주문, 출고, 배송, 세금계산서, 거래명세표 | 생성, 발행, 상태 변경, 외부 전송, 실패, 재처리 | 기간 PM 승인 필요 |
| 결재 문건 및 결재 라인 | 작성, 상신, 라인 변경, 승인, 반려 | 기간 PM 승인 필요 |
| 권한 및 설정 | 권한 부여/회수, 메뉴 설정, 기능 플래그, KPI 산식 설정 변경 | 기간 PM 승인 필요 |
| 배포 및 롤백 | version, commit_sha, artifact_id, approver, executor, result | 외감 대응 증적으로 보존, 기간 PM 승인 필요 |

결정: 타임로그는 업무 흐름 추적용, 감사로그는 내부통제와 외감 증적용으로 분리하고 `event_id`로 연결한다.

인당 생산성/마진 기여: 업무 진행 이력과 통제 증적을 동시에 확보해 책임소재 확인과 외감 대응 시간을 줄인다.

PM 승인 필요: 보존기간, 불변 저장 방식, 상용 로그 보관 도구, 파기 정책.

### 8.2.3 Profit Cost Log Integrity

| 통제 | 요구 |
|---|---|
| 보존 | 비용 입력과 산식 버전 변경 로그는 감사로그 보존 대상에 포함한다. |
| 무결성 | `before_ref`, `after_ref`, `formula_version`, `approval_id`는 변경 감지 가능한 방식으로 보존한다. |
| 조회 감사 | 비용 입력 로그 목록 조회, 상세 조회, 반출 요청 자체를 감사로그로 남긴다. |
| 반출 통제 | 반출 시 요청자, 승인자, 목적, 범위, 건수, 결과를 기록한다. |
| 권한 분리 | 비용 입력 권한과 감사/조회 권한은 분리하는 것을 기본 후보로 둔다. |

결정: 비용 입력 로그는 수익성 KPI의 근거 데이터이므로 보존, 무결성, 반출 통제를 감사로그와 같은 수준으로 적용한다.

인당 생산성/마진 기여: 수익성 지표 왜곡 원인을 빠르게 찾고 임의 변경에 따른 마진 판단 오류를 줄인다.

PM 승인 필요: 비용 입력 로그 보존기간, 무결성 검증 방식, 로그 반출 권한, 상용 증적 관리 도구.

### 8.3 Metric 기준

| 영역 | 필수 메트릭 |
|---|---|
| API | request rate, error rate, latency p50/p95/p99 |
| Queue | queue depth, task age, retry count |
| Batch/Integration | job success rate, failure rate, retry exhaustion, carrier integration failure rate |
| Delivery | delivery failure rate, delayed shipment count, return shipment count, manual waybill correction count |
| Security | permission denied rate, pii access count, privileged access count, permission change count, settings change count |
| Profit Cost Input | cost input change count, cost input denied count, cost input failure count, formula version change count |
| Menu/Log View | menu log event count, log view count, log export request count |
| Onboarding Approval | onboarding approval event count, onboarding approval lead time |
| Release | deployment frequency, lead time, change failure rate, MTTR |
| Data/KPI | profitability refresh lag, KPI pipeline success rate, operating profit, operating profit rate |

영업이익 KPI 메트릭:

| 메트릭 | 산출 기준 |
|---|---|
| `sales_amount` | 매출금액 |
| `cost_amount` | MVP 기본 기준 `sales_amount * 0.5` |
| `sgna_amount` | MVP 기본 기준 `sales_amount * 0.5` |
| `operating_profit` | `sales_amount - cost_amount - sgna_amount` |
| `operating_profit_rate` | `operating_profit / sales_amount` |
| `profit_degradation_reason_count` | 할인, 반품, 배송비, 처리시간, 결재 지연, 정산 지연, 예외 처리 건수 |
| `cost_input_change_count` | 제원원가, 판관비, 일반관리비 입력/수정/삭제 건수 |
| `cost_input_denied_count` | 비용 입력 권한 없는 접근 또는 저장 차단 건수 |
| `cost_input_failure_count` | 비용 입력 저장 실패 건수 |
| `formula_version_change_count` | 산식 버전 생성 또는 변경 건수 |

인당 생산성/마진 기여: 업무 처리량과 시스템 품질을 함께 측정해 개발 개선이 실제 마진 개선으로 이어지는지 확인한다.

PM 승인 필요: 메트릭 저장소, 대시보드 도구, SLO 목표값.

결정: 영업이익 산식과 원인 지표는 메트릭과 감사로그 양쪽에 남긴다.

인당 생산성/마진 기여: 영업이익 저하 원인을 자동으로 분해해 가격, 할인, 배송, 결재 지연 개선 대상을 빠르게 찾는다.

PM 승인 필요: 영업이익 산식 최종 확정, 원가율/판관비율 변경 권한, 상용 KPI 대시보드 도구.

### 8.4 Alert 기준

| 알림 | 조건 | 우선순위 |
|---|---|---|
| Service Down | 핵심 서비스 헬스체크 실패 | P1 |
| Auth Failure Spike | 인증 실패 급증 | P1/P2 |
| Audit Log Failure | 감사로그 저장 실패 | P1 |
| PII Access Spike | 개인정보 접근 급증 또는 비정상 패턴 | P1/P2 |
| Operation Queue Backlog | 업무 큐 적체 임계값 초과 | P2 |
| SLA Breach | SLA 초과 건수 증가 | P2 |
| Integration Failure | 외부 연동 실패 지속 | P2 |
| Carrier Integration Failure | 택배사 API 실패 지속 또는 재조회 큐 적체 | P2 |
| Delivery Exception Spike | 배송 지연, 오배송, 반송, 미출고 급증 | P2 |
| Profitability Pipeline Lag | 수익성 데이터 갱신 지연 | P3 |
| Operating Profit Metric Failure | 영업이익 KPI 산출 실패 또는 산식 변경 감사로그 누락 | P2 |
| Permission/Settings Change Spike | 권한 또는 설정 변경 급증 | P2 |
| Profit Cost Input Failure | 제원원가/판관비/일반관리비 입력 저장 실패 | P2 |
| Profit Cost Input Denied Spike | 비용 입력 권한 차단 급증 | P3 |
| Formula Version Change Spike | 산식 버전 변경 급증 또는 승인 없는 변경 시도 | P2 |
| Secret Rotation Due | 시크릿 회전 기한 임박 | P4 |

인당 생산성/마진 기여: 업무 영향이 큰 장애부터 대응하게 해 대응 인력의 시간을 고가치 문제에 집중한다.

PM 승인 필요: 알림 채널, 온콜 기준, 임계값, 고객 공지 기준, 상용 알림 도구, 택배사 연동 계약/API/비용.

## 9. KPI Mapping

| KPI | 이벤트 | 메트릭 | 대시보드 노출 |
|---|---|---|---|
| 담당자 1인당 처리 건수 | `operation_task.completed` | `operation_task_completed_count` | 담당자/팀/업무유형별 |
| 평균 처리시간 | `operation_task.created`, `operation_task.completed` | `operation_task_duration` | p50/p95와 추세 |
| SLA 준수율 | `operation_task.sla_breached` | `sla_breach_count`, `sla_compliance_rate` | 고객사/업무유형별 |
| 운영 큐 적체 | `operation_task.assigned`, `operation_task.pending` | `queue_depth`, `task_age` | 담당자/상태별 |
| 정산 오류율 | `settlement.failed`, `settlement.adjusted` | `settlement_error_rate` | 고객사/공급사별 |
| 포인트 처리 실패율 | `point_job.failed`, `point_job.retried` | `point_job_failure_rate` | 작업/연동별 |
| 외부 연동 안정성 | `integration.requested`, `integration.failed` | `integration_failure_rate`, `retry_count` | 연동사/API별 |
| 배송/입출고 예외 | `delivery.delayed`, `delivery.misdelivered`, `delivery.returned`, `delivery.not_shipped`, `delivery.corrected_manually` | `delivery_failure_rate`, `carrier_integration_failure_rate`, `manual_waybill_correction_count` | 택배사/주문/고객사별 |
| 마진 데이터 신선도 | `profitability_pipeline.completed` | `profitability_refresh_lag` | 고객사/공급사별 |
| 영업이익 | `revenue.recognized`, `operating_profit.calculated` | `sales_amount`, `cost_amount`, `sgna_amount`, `operating_profit`, `operating_profit_rate` | 고객/상품/담당자/파이프라인별 |
| 영업이익 저하 원인 | `discount.applied`, `return.created`, `delivery_cost.recorded`, `exception.handled`, `approval.delayed` | `profit_degradation_reason_count`, `delivery_cost_amount`, `approval_delay_ms` | 원인 유형별 |
| 수익성 비용 입력 추적 | `profit_cost.created`, `profit_cost.updated`, `profit_cost.deleted`, `profit_cost.permission_denied` | `cost_input_change_count`, `cost_input_denied_count`, `cost_input_failure_count` | 비용 유형/입력자/권한/적용일별 |
| 산식 버전 변경 추적 | `profit_formula.version_changed` | `formula_version_change_count` | 산식 버전/승인 ID/변경자별 |
| 메뉴별 로그 수집 | `menu_opened`, `list_viewed`, `detail_viewed`, `created`, `updated`, `deleted`, `export_requested`, `permission_denied` | `menu_log_event_count` | 메뉴/라우트/권한별 |
| 로그 조회 감사 | `log_records.viewed`, `log_records.detail_viewed`, `log_records.export_requested` | `log_view_count`, `log_export_request_count` | 조회자/권한/반출 범위별 |
| 입사등록 결재 관측성 | `onboarding.created`, `onboarding.submitted`, `onboarding.approved`, `onboarding.rejected`, `onboarding.on_hold`, `onboarding.finalized` | `onboarding_approval_event_count`, `onboarding_approval_lead_time` | 입사등록/결재문건/결재자별 |
| 배포 안정성 | `deployment.completed`, `deployment.rolled_back` | `change_failure_rate`, `mttr` | 릴리즈별 |
| 개인정보 접근 통제 | `privacy_data.accessed` | `pii_access_count` | 역할/테넌트별 |
| 권한/설정 변경 추적 | `permission.changed`, `settings.changed`, `feature_flag.changed`, `profit_formula.changed` | `permission_change_count`, `settings_change_count` | 변경자/역할/설정 키별 |

결정: 운영 KPI는 이벤트 스키마와 메트릭 이름을 먼저 고정하고 화면 구현은 후속 산출물과 맞춘다.

인당 생산성/마진 기여: KPI 수집 기준을 먼저 고정해 대시보드가 수기 집계가 아니라 자동 관측 데이터로 운영되게 한다.

PM 승인 필요: KPI 공식 산식, 영업이익 MVP 산식, 마진 데이터 원천, 경영진/슈퍼바이저 공개 범위.

## 10. Audit Evidence

| 증적 | 최소 필드 | 보존 |
|---|---|---|
| 배포 이력 | version, commit_sha, artifact_id, approver, deployer, started_at, finished_at, result | PM 승인 필요 |
| 롤백 이력 | from_version, to_version, reason, approver, executor, result | PM 승인 필요 |
| 권한 변경 | actor, target, before, after, reason, approved_by | PM 승인 필요 |
| 설정 변경 | actor, setting_key, before_summary, after_summary, reason, approved_by | PM 승인 필요 |
| 영업이익 산식 변경 | actor, formula_before, formula_after, effective_at, approved_by | PM 승인 필요 |
| 수익성 비용 입력 | cost_input_type, formula_version, actor_role, before_ref, after_ref, approval_id, result | PM 승인 필요 |
| 비용 입력 차단/실패 | actor, actor_role, cost_input_type, denial_reason/error_code, formula_version, result | PM 승인 필요 |
| 개인정보 접근 | actor, tenant, entity, purpose, result, timestamp | PM 승인 필요 |
| 데이터 반출 | actor, tenant, file_id, row_count, purpose, approved_by | PM 승인 필요 |
| 배송/입출고 예외 처리 | actor, order_id, carrier, invoice_no, exception_type, correction_result | PM 승인 필요 |
| 정산/포인트 변경 | actor, amount_before, amount_after, reason, approved_by, evidence_id | PM 승인 필요 |
| 외감 대응 패키지 | 배포 이력, 권한/설정 변경, 핵심 업무 타임로그, 감사로그 보존 위치, 추출자, 추출 시간 | PM 승인 필요 |

인당 생산성/마진 기여: 외감과 ISMS 대응 증적을 평상시 자동 생성해 감사 시즌의 수작업 취합 비용을 줄인다.

결정: 외감 대응 증적은 배포 이력, 권한/설정 변경, 핵심 업무 타임로그, 감사로그를 하나의 추출 가능한 패키지로 관리한다.

인당 생산성/마진 기여: 감사 요청마다 개별 시스템을 수동 조회하지 않아 대응 시간을 줄이고 오류 가능성을 낮춘다.

PM 승인 필요: 외감 대응 패키지 형식, 보존기간, 불변 저장 방식, 상용 증적 관리 도구.

## 11. Acceptance Criteria

| 구분 | 인수조건 |
|---|---|
| 목적 | P0 모듈의 안전한 MVP 전달과 운영 관측성 기준이 명확하다. |
| 입력 | PRD, PROCESS_REQUIREMENTS, P0 모듈, 에이전트 의존성, 승인 필요 항목이 반영되어 있다. |
| 출력 | Command, Pipeline, Environment, Secret, Observability, KPI, Audit, Evidence 계약이 정의되어 있다. |
| 한 명령 | 필수 `make` 명령과 성공/실패 기준이 정의되어 있다. |
| CI/CD | PR, release, prod gate가 정의되어 있다. |
| 환경 | local/dev/staging/prod의 데이터와 접근 기준이 정의되어 있다. |
| 시크릿 | 저장 금지, 주입, 회전, 폐기, 감사 기준이 정의되어 있다. |
| 관측성 | trace, log, metric, alert 기준이 정의되어 있다. |
| KPI | 운영 KPI, 영업이익 KPI, 배송/연동 실패 지표와 이벤트/메트릭 매핑이 존재한다. |
| 보존 | 타임로그, 감사로그, 배포 이력, 외감 증적 보존 요구가 정의되어 있다. |
| 변경 추적 | 권한 변경, 설정 변경, 영업이익 산식 변경 추적 기준이 정의되어 있다. |
| 비용 입력 관측성 | `cost_input_type`, `formula_version`, `actor_role`, `before_ref`, `after_ref`, `approval_id`, `result`가 비용 입력 로그 필드에 포함되어 있다. |
| 비용 입력 알림 | 비용 입력 실패, 권한 차단, 산식 버전 변경 급증이 알림 후보에 포함되어 있다. |
| 메뉴/로그 조회 | 메뉴별 로그 필드와 로그 조회 자체의 감사로그 기준이 포함되어 있다. |
| 입사등록 결재 | 입사등록 결재 상태 변경과 결재라인 로그가 관측성 대상에 포함되어 있다. |
| 승인 필요 | 클라우드/상용도구/개인정보/예산/외부계약 확정 항목이 PM 승인 필요로 표시되어 있다. |

인당 생산성/마진 기여: 인수조건을 계약화해 구현 담당자가 판단 대기 없이 같은 기준으로 작업하도록 한다.

## 12. Dependencies

| 의존성 | 담당 | 필요 시점 |
|---|---|---|
| 서비스 경계와 런타임 후보 | A1 | CI/CD 상세 설계 전 |
| API와 이벤트 스키마 | A2 | Observability 구현 전 |
| 운영 업무 상태/SLA | A2, A3, A8 | KPI 매핑 확정 전 |
| 수익성 KPI 산식 | A4 | Profitability Dashboard 구현 전 |
| 수익성 비용 입력 권한과 산식 버전 정책 | A4, A7, A9, PM | 비용 입력 관측성 구현 전 |
| 외부 API 실패 정책 | A6 | Integration alert 구현 전 |
| 택배사 API, 송장번호 체계, 배송 계약 조건 | A6, PM | 배송/입출고 알림 확정 전 |
| 타임로그/감사로그 보존기간 | A7, PM | prod 운영 전 |
| 개인정보 처리범위 | A7, PM | prod 운영 전 |
| 릴리즈 승인 체계 | PM | prod 배포 전 |

인당 생산성/마진 기여: 선행 의존성을 드러내 병렬 개발 중 승인 대기와 재작업을 줄인다.

## 13. Owner

| 영역 | Owner | Reviewer |
|---|---|---|
| CI/CD | A9 | A1, A2 |
| Environment | A9 | A1, A7 |
| Secret | A9 | A7, PM |
| Observability | A9 | A2, A3, A4, A6, A7, A8 |
| KPI Mapping | A9, A4 | PM, A3 |
| Audit Evidence | A9, A7 | PM |
| Profit Cost Input Observability | A9, A4, A7 | PM, A8 |
| Delivery/Integration Alert | A9, A6 | A3, PM |

인당 생산성/마진 기여: 책임자를 명시해 결정 지연과 중복 구현을 줄인다.

## 14. PM 승인 필요

- 특정 클라우드와 배포 런타임.
- CI/CD 플랫폼과 상용 관측성 도구.
- Secret Store/KMS 제품과 키 회전 주기.
- 개인정보 처리범위, 보관기간, 마스킹 정책.
- 로그와 감사 증적 보존기간.
- SLO, 알림 임계값, 온콜 운영 방식.
- 운영 배포 승인자와 긴급 배포 기준.
- 수익성 KPI 공식 산식, 영업이익 MVP 산식, 원천 데이터 접근 권한.
- 외부 연동 계약, SLA, 장애 공지 기준.
- 택배사 실시간 위치 연동 계약, API, 비용, 송장번호 체계.
- 권한/설정 변경 추적 범위와 슈퍼바이저 공개 범위.
- 타임로그/감사로그 불변 저장 방식과 상용 증적 관리 도구.
- 제원원가의 정확한 회계 의미, 비용 입력 권한 범위, 비용 입력 변경 결재 필요 여부.
- 수익성 비용 입력 로그 보존기간, 무결성 검증 방식, 로그 반출 통제 기준.

인당 생산성/마진 기여: 승인 대상과 실행 대상을 분리해 불필요한 도구 구매와 구현 방향 변경 비용을 줄인다.

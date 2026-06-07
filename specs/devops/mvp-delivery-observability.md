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
| Audit Evidence | 배포, 권한, 개인정보 접근, 주요 변경 증적 기준 |

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
| Audit Impact | 개인정보/권한/정산/배포 영향 표시 | 승인자 확인 필요 |

인당 생산성/마진 기여: 결함을 운영 전 단계에서 자동 차단해 장애 대응과 재배포 비용을 줄인다.

### 5.2 Release Gate

| Gate | dev | staging | prod |
|---|---|---|---|
| 자동 배포 | 필수 | 선택 | 금지 |
| 승인 | 선택 | 담당 승인 | PM 또는 위임 릴리즈 책임자 승인 |
| smoke test | 필수 | 필수 | 필수 |
| rollback plan | 권장 | 필수 | 필수 |
| 배포 이력 | 필수 | 필수 | 필수 |
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
| `environment` | 필수 |
| `service` | 필수 |
| `version` | 필수 |
| `trace_id` | 필수 |
| `actor_id` | 조건부 필수 |
| `tenant_id` | 조건부 필수 |
| `entity_id` | 조건부 필수 |
| `action` | 필수 |
| `result` | 필수 |
| `duration_ms` | 권장 |
| `error_code` | 실패 시 필수 |
| `pii_accessed` | 개인정보 접근 경로 필수 |

감사로그 필수 이벤트:

- 인증 성공/실패
- 권한 생성/변경/삭제
- 개인정보 조회/반출
- 운영 업무 상태 변경
- 고객사/공급사/계약 주요 변경
- 정산/포인트 금액 변경
- 데이터 반입/반출
- 배포/롤백

인당 생산성/마진 기여: 운영 이슈와 감사 요청의 증거 수집 시간을 줄인다.

PM 승인 필요: 로그 보존기간, 마스킹 정책, 감사로그 저장소.

### 8.3 Metric 기준

| 영역 | 필수 메트릭 |
|---|---|
| API | request rate, error rate, latency p50/p95/p99 |
| Queue | queue depth, task age, retry count |
| Batch/Integration | job success rate, failure rate, retry exhaustion |
| Security | permission denied rate, pii access count, privileged access count |
| Delivery | deployment frequency, lead time, change failure rate, MTTR |
| Data/KPI | profitability refresh lag, KPI pipeline success rate |

인당 생산성/마진 기여: 업무 처리량과 시스템 품질을 함께 측정해 개발 개선이 실제 마진 개선으로 이어지는지 확인한다.

PM 승인 필요: 메트릭 저장소, 대시보드 도구, SLO 목표값.

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
| Profitability Pipeline Lag | 수익성 데이터 갱신 지연 | P3 |
| Secret Rotation Due | 시크릿 회전 기한 임박 | P4 |

인당 생산성/마진 기여: 업무 영향이 큰 장애부터 대응하게 해 대응 인력의 시간을 고가치 문제에 집중한다.

PM 승인 필요: 알림 채널, 온콜 기준, 임계값, 고객 공지 기준.

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
| 마진 데이터 신선도 | `profitability_pipeline.completed` | `profitability_refresh_lag` | 고객사/공급사별 |
| 배포 안정성 | `deployment.completed`, `deployment.rolled_back` | `change_failure_rate`, `mttr` | 릴리즈별 |
| 개인정보 접근 통제 | `privacy_data.accessed` | `pii_access_count` | 역할/테넌트별 |

결정: 운영 KPI는 이벤트 스키마와 메트릭 이름을 먼저 고정하고 화면 구현은 후속 산출물과 맞춘다.

인당 생산성/마진 기여: KPI 수집 기준을 먼저 고정해 대시보드가 수기 집계가 아니라 자동 관측 데이터로 운영되게 한다.

PM 승인 필요: KPI 공식 산식, 마진 데이터 원천, 경영진 공개 범위.

## 10. Audit Evidence

| 증적 | 최소 필드 | 보존 |
|---|---|---|
| 배포 이력 | version, commit_sha, artifact_id, approver, deployer, started_at, finished_at, result | PM 승인 필요 |
| 롤백 이력 | from_version, to_version, reason, approver, executor, result | PM 승인 필요 |
| 권한 변경 | actor, target, before, after, reason, approved_by | PM 승인 필요 |
| 개인정보 접근 | actor, tenant, entity, purpose, result, timestamp | PM 승인 필요 |
| 데이터 반출 | actor, tenant, file_id, row_count, purpose, approved_by | PM 승인 필요 |
| 정산/포인트 변경 | actor, amount_before, amount_after, reason, approved_by, evidence_id | PM 승인 필요 |

인당 생산성/마진 기여: 외감과 ISMS 대응 증적을 평상시 자동 생성해 감사 시즌의 수작업 취합 비용을 줄인다.

## 11. Acceptance Criteria

| 구분 | 인수조건 |
|---|---|
| 목적 | P0 모듈의 안전한 MVP 전달과 운영 관측성 기준이 명확하다. |
| 입력 | PRD, P0 모듈, 에이전트 의존성, 승인 필요 항목이 반영되어 있다. |
| 출력 | Command, Pipeline, Environment, Secret, Observability, KPI, Audit 계약이 정의되어 있다. |
| 한 명령 | 필수 `make` 명령과 성공/실패 기준이 정의되어 있다. |
| CI/CD | PR, release, prod gate가 정의되어 있다. |
| 환경 | local/dev/staging/prod의 데이터와 접근 기준이 정의되어 있다. |
| 시크릿 | 저장 금지, 주입, 회전, 폐기, 감사 기준이 정의되어 있다. |
| 관측성 | trace, log, metric, alert 기준이 정의되어 있다. |
| KPI | 운영 KPI와 이벤트/메트릭 매핑이 존재한다. |
| 승인 필요 | 클라우드/상용도구/개인정보/예산/외부계약 확정 항목이 PM 승인 필요로 표시되어 있다. |

인당 생산성/마진 기여: 인수조건을 계약화해 구현 담당자가 판단 대기 없이 같은 기준으로 작업하도록 한다.

## 12. Dependencies

| 의존성 | 담당 | 필요 시점 |
|---|---|---|
| 서비스 경계와 런타임 후보 | A1 | CI/CD 상세 설계 전 |
| API와 이벤트 스키마 | A2 | Observability 구현 전 |
| 운영 업무 상태/SLA | A2, A3, A8 | KPI 매핑 확정 전 |
| 수익성 KPI 산식 | A4 | Profitability Dashboard 구현 전 |
| 외부 API 실패 정책 | A6 | Integration alert 구현 전 |
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

인당 생산성/마진 기여: 책임자를 명시해 결정 지연과 중복 구현을 줄인다.

## 14. PM 승인 필요

- 특정 클라우드와 배포 런타임.
- CI/CD 플랫폼과 상용 관측성 도구.
- Secret Store/KMS 제품과 키 회전 주기.
- 개인정보 처리범위, 보관기간, 마스킹 정책.
- 로그와 감사 증적 보존기간.
- SLO, 알림 임계값, 온콜 운영 방식.
- 운영 배포 승인자와 긴급 배포 기준.
- 수익성 KPI 공식 산식과 원천 데이터 접근 권한.
- 외부 연동 계약, SLA, 장애 공지 기준.

인당 생산성/마진 기여: 승인 대상과 실행 대상을 분리해 불필요한 도구 구매와 구현 방향 변경 비용을 줄인다.


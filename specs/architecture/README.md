# Architecture Spec Index

이 문서는 이제너두 전사 CRM OS 아키텍처 작업의 색인이다. 상세 초안은 `/docs/ARCHITECTURE_A1_DRAFT.md`를 기준으로 한다.

인당 생산성/마진 기여: 타 에이전트가 필요한 경계 문서를 빠르게 찾게 해 탐색 시간과 중복 질문을 줄인다.

## 현재 기준 문서

- PRD: `/docs/PRD.md`
- A1 아키텍처 초안: `/docs/ARCHITECTURE_A1_DRAFT.md`

## P0 모듈

| 모듈 | 소유 책임 | 주요 계약 |
|---|---|---|
| `CRM Core` | 고객사, 공급사, 임직원, 계약, 담당자, 활동 이력 기준 데이터 | `/crm/*`, `crm.*` events |
| `Operations Console` | 운영 업무 접수, 배정, 상태, SLA, 일괄 처리, 예외 큐 | `/ops/*`, `ops.*` events |
| `Security & Audit Baseline` | RBAC, 테넌트 격리, 개인정보 접근로그, 감사로그 | `/security/*`, `security.*` events |
| `Profitability Dashboard` | 고객사/공급사/업무유형별 매출, 원가, 마진, 운영 투입량 | `/profitability/*`, `profitability.*` events |

## 통합 경계

- 베네카페: `benecafe`
- 결제: `payment_gateway`
- 온누리: `onnuri`
- 정산/회계: `settlement_accounting`
- 레거시 관리자: `legacy_admin`

외부 시스템은 핵심 모듈에 직접 결합하지 않고 어댑터에서 내부 표준 이벤트와 상태로 변환한다.

인당 생산성/마진 기여: 연동별 예외를 어댑터에 가둬 운영 콘솔과 CRM Core의 변경 비용을 낮춘다.

## 공통 통신규약

- 동기 API: 화면 조회, 단건 검증, 권한 판정
- 비동기 이벤트: 엔티티 변경, 업무 상태 변경, 외부 연동 결과, 지표 집계
- 필수 추적 키: `X-Request-Id`, `X-Actor-Id`, `X-Tenant-Id`, `Idempotency-Key`
- 필수 이벤트 키: `event_id`, `event_type`, `event_version`, `tenant_id`, `resource_id`

## PM 승인 필요

- P0 범위 최종 확정
- 개인정보 및 민감정보 처리범위
- 외부 연동 상세, 외부계약, 호출량 예산
- 원가, 마진, 인력 단가 산식
- DBMS, 검색엔진, 메시지 브로커, BI 도구 선정

인당 생산성/마진 기여: 고비용 결정을 승인 게이트로 분리해 승인 전 과투자를 방지한다.

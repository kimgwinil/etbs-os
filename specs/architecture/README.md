# Architecture Spec Index

이 문서는 이제너두 전사 CRM OS 아키텍처 작업의 색인이다. 상세 초안은 `/docs/ARCHITECTURE_A1_DRAFT.md`를 기준으로 한다.

인당 생산성/마진 기여: 타 에이전트가 필요한 경계 문서를 빠르게 찾게 해 탐색 시간과 중복 질문을 줄인다.

## 현재 기준 문서

- PRD: `/docs/PRD.md`
- 프로세스 요구사항: `/docs/PROCESS_REQUIREMENTS.md`
- A1 아키텍처 초안: `/docs/ARCHITECTURE_A1_DRAFT.md`

## P0 모듈

| 모듈 | 소유 책임 | 주요 계약 |
|---|---|---|
| `CRM Core` | 고객사, 공급사, 임직원, 계약, 담당자, 활동 이력 기준 데이터 | `/crm/*`, `crm.*` events |
| `Operations Console` | 운영 업무 접수, 배정, 상태, SLA, 일괄 처리, 예외 큐 | `/ops/*`, `ops.*` events |
| `Security & Audit Baseline` | RBAC, 테넌트 격리, 개인정보 접근로그, 감사로그 | `/security/*`, `security.*` events |
| `Profitability Dashboard` | 고객사/공급사/업무유형별 매출, 원가, 마진, 운영 투입량 | `/profitability/*`, `profitability.*` events |

## 유통회사 표준 프로세스

기준 흐름은 `sales_activity_logged -> pipeline_created -> quote_approved -> contract_active -> order_registered -> released -> delivered -> tax_invoice_issued -> revenue_recognized -> operating_profit_reviewed`이다.

| 단계 | 소유 모듈 |
|---|---|
| 영업활동/파이프라인/계약 | `CRM Core` |
| 견적/주문/출고/발행 업무 | `Operations Console` |
| 결재/권한/타임로그/감사로그 | `Security & Audit Baseline` |
| 매출인식/영업이익 확인 | `Profitability Dashboard` |
| 배송/입출고/세금계산서 외부 연동 | `Integration Boundary` |

인당 생산성/마진 기여: 영업부터 매출인식까지 처리 상태를 한 흐름으로 연결해 누락, 재입력, 이익 원인 추적 시간을 줄인다.

## 통합 경계

- 베네카페: `benecafe`
- 결제: `payment_gateway`
- 온누리: `onnuri`
- 정산/회계: `settlement_accounting`
- 레거시 관리자: `legacy_admin`
- 택배사 위치 조회: `carrier_tracking`
- 재고/입출고 원천: `inventory_warehouse`
- 전자세금계산서: `e_tax_invoice`
- 거래명세표: `transaction_statement`

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
- 영업이익 MVP 산식과 매출인식 기준
- 결재 라인 정책과 슈퍼바이저 공개 범위
- DBMS, 검색엔진, 메시지 브로커, BI 도구 선정

인당 생산성/마진 기여: 고비용 결정을 승인 게이트로 분리해 승인 전 과투자를 방지한다.

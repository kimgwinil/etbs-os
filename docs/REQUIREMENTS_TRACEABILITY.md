# 요구사항 반영 추적표

## 1. 목적

PM이 전달한 전체 업무 프로세스 요구사항이 어떤 문서와 담당자에게 반영되었는지 추적하기 위한 팀장 관리 문서다.

인당 생산성/마진 기여: 요구 누락과 중복 개발을 줄여 담당자별 재작업 시간을 낮춘다.

## 2. 반영 상태 기준

- `반영`: 기준 문서와 담당자 산출물에 포함됨
- `보강 필요`: 큰 방향은 반영됐으나 화면/API/QA 스펙으로 더 쪼개야 함
- `승인 필요`: PM 승인 또는 외부 계약/API/개인정보 검토 후 확정 가능

인당 생산성/마진 기여: 상태를 분리해 당장 진행 가능한 일과 승인 후 진행할 일을 구분한다.

## 3. 요구사항별 반영 추적

| No | 요구사항 | 현재 반영 위치 | 담당 | 상태 | 보강 지시 |
|---|---|---|---|---|---|
| R01 | 영업활동 | `/docs/PROCESS_REQUIREMENTS.md`, `/docs/ARCHITECTURE.md`, `/docs/DATA_MODEL.md`, `/specs/process/lead-to-cash.md` | A1, A2, A3, A4 | 반영 | API와 화면 스펙에서 입력 필드 확정 필요 |
| R02 | 영업파이프라인 생성 및 견적발행 | `/docs/PROCESS_REQUIREMENTS.md`, `/docs/ARCHITECTURE.md`, `/specs/process/lead-to-cash.md` | A2, A3, A4, A7 | 반영 | 견적 발행/버전/결재 상태 세부 스펙 보강 |
| R03 | 계약 | `/docs/PROCESS_REQUIREMENTS.md`, `/docs/DATA_MODEL.md`, `/specs/process/lead-to-cash.md` | A2, A4, A7 | 반영 | 계약 상태와 주문 전환 조건 보강 |
| R04 | 주문등록 | `/docs/PROCESS_REQUIREMENTS.md`, `/docs/ARCHITECTURE.md`, `/docs/DATA_MODEL.md` | A2, A3 | 반영 | 주문 등록 화면/필수값 스펙 보강 |
| R05 | 출고처리 | `/docs/PROCESS_REQUIREMENTS.md`, `/docs/ARCHITECTURE.md`, `/docs/DATA_MODEL.md` | A2, A6 | 반영 | 출고 상태값, 예외 상태 보강 |
| R06 | 세금계산서 및 거래명세표 발행 | `/docs/PROCESS_REQUIREMENTS.md`, `/docs/ARCHITECTURE.md`, `/docs/DATA_MODEL.md` | A2, A7 | 반영 | 발행/취소/재발행 로그 스펙 보강 |
| R07 | 매출인식 | `/docs/PROCESS_REQUIREMENTS.md`, `/docs/ARCHITECTURE.md`, `/docs/DATA_MODEL.md` | A4, A7 | 반영 | 공식 회계 기준은 승인 필요 |
| R08 | 매출금액 대비 원가 50% 고정 | `/docs/PROCESS_REQUIREMENTS.md`, `/docs/DATA_MODEL.md`, `/specs/dashboard/supervisor-profitability.md` | A3, A4 | 반영 | PM 승인 후 운영 지표로 확정 |
| R09 | 판매관리비와 일반관리비 매출 대비 50% 고정 | `/docs/PROCESS_REQUIREMENTS.md`, `/docs/DATA_MODEL.md`, `/specs/dashboard/supervisor-profitability.md` | A3, A4 | 반영 | PM 승인 후 운영 지표로 확정 |
| R10 | 영업이익 실시간 확인 | `/docs/ARCHITECTURE.md`, `/docs/DATA_MODEL.md`, `/specs/dashboard/supervisor-profitability.md` | A3, A4, A9 | 반영 | 데이터 갱신 주기/지연 표시 보강 |
| R11 | 모든 필드값 상단 고정 | `/docs/PROCESS_REQUIREMENTS.md`, `/BACKLOG.md` | A3, A8 | 보강 필요 | 별도 UI 스펙과 QA 조건으로 분리 |
| R12 | 드래그/스크롤 시 필드 종류 식별 | `/docs/PROCESS_REQUIREMENTS.md` | A3, A8 | 보강 필요 | 고정 헤더/가로 스크롤 UX 인수조건 추가 |
| R13 | 고객등록 신규 저장 | `/docs/PROCESS_REQUIREMENTS.md`, `/BACKLOG.md` | A2, A3, A8 | 보강 필요 | 고객 등록/수정 스펙 분리 |
| R14 | 고객 수정 저장 시 변경 간주 | `/docs/PROCESS_REQUIREMENTS.md`, `/BACKLOG.md` | A2, A3, A7, A8 | 보강 필요 | 변경 이력/타임로그 조건 추가 |
| R15 | 판매상품 등록 시 판매가격 별도 표기 | `/docs/PROCESS_REQUIREMENTS.md`, `/docs/DATA_MODEL.md` | A2, A3, A4, A8 | 보강 필요 | 상품 등록 UI 스펙과 필수 컬럼 지정 |
| R16 | 결재라인 임직원 임의 배치 | `/docs/PROCESS_REQUIREMENTS.md`, `/specs/workflow/approval-line.md` | A2, A3, A7, A8 | 반영 | 조직도 연동 여부는 후속 판단 |
| R17 | 최종 결재권자까지 배치 | `/specs/workflow/approval-line.md` | A2, A3, A7 | 반영 | 최종 결재권자 UI 표시 보강 |
| R18 | 로그인 사용자가 무조건 결재문건 상신자 | `/specs/workflow/approval-line.md`, `/docs/DATA_MODEL.md` | A2, A3, A7 | 반영 | 대리상신 허용 여부는 PM 확인 필요 |
| R19 | 이후 임의 결재라인 지정 | `/specs/workflow/approval-line.md` | A2, A3, A7 | 반영 | 결재라인 변경 로그 필수 |
| R20 | 배송/입출고 현황 택배사 실시간 위치 연동 | `/docs/PROCESS_REQUIREMENTS.md`, `/docs/ARCHITECTURE.md`, `/docs/DATA_MODEL.md`, `/BACKLOG.md` | A6, A3, A9 | 승인 필요 | 택배사 API/계약/비용 확인 전 어댑터와 수동 보정 큐만 정의 |
| R21 | 고객정보/임직원정보/매출정보/상품정보 정렬 | `/docs/PROCESS_REQUIREMENTS.md` | A3, A4, A8 | 보강 필요 | 목록 정렬/필터/저장 뷰 스펙 추가 |
| R22 | 모든 정보 타임로그 | `/docs/PROCESS_REQUIREMENTS.md`, `/docs/ARCHITECTURE.md`, `/docs/DATA_MODEL.md` | A7, A9 | 반영 | 로그 대상별 필드 스펙 보강 |
| R23 | 설정 메뉴에 로그기록 확인 메뉴 | `/docs/PROCESS_REQUIREMENTS.md`, `/docs/ARCHITECTURE.md` | A3, A7, A9 | 보강 필요 | 설정 메뉴 내 로그 조회 화면 스펙 추가 |
| R24 | 슈퍼바이저 전용 대시보드 | `/docs/PROCESS_REQUIREMENTS.md`, `/docs/ARCHITECTURE.md`, `/specs/dashboard/supervisor-profitability.md` | A3, A4, A7 | 반영 | 개인정보/임직원 상세 접근 범위 승인 필요 |
| R25 | 일반 유통회사 프로세스 | `/docs/PROCESS_REQUIREMENTS.md`, `/docs/ARCHITECTURE.md`, `/specs/process/lead-to-cash.md` | A1, A2, A4, A8 | 반영 | 전체 E2E 검증 필요 |
| R26 | 영업이익이 적은 이유를 즉각 대응 가능한 경영지표로 표시 | `/docs/DATA_MODEL.md`, `/specs/dashboard/supervisor-profitability.md` | A3, A4, A5 | 반영 | 원인 KPI 우선순위 보강 |
| R27 | 경영자와 직원 메뉴/업무진행 메뉴 차등 | `/docs/PROCESS_REQUIREMENTS.md`, `/docs/ARCHITECTURE.md` | A3, A7, A8 | 보강 필요 | 권한별 메뉴 매트릭스 스펙 추가 |
| R28 | 설정 메뉴 옆 사용자 소속/이름/권한 표시 | `/docs/PROCESS_REQUIREMENTS.md`, `/docs/ARCHITECTURE.md` | A3, A7 | 보강 필요 | UI 헤더 스펙 추가 |
| R29 | 기능 업데이트는 팀장이 팀원에게 병렬 배분 | `/AGENTS.md`, `/BACKLOG.md`, `/HANDOFF.md` | 팀장 | 반영 | 담당자 완료 후 팀장 리뷰/승인 절차 유지 |
| R30 | 임직원 한 명이 다수 거래처를 담당할 수 있어야 함 | `/specs/employee/customer-assignment.md`, `/docs/DATA_MODEL.md` | A2, A3, A4, A7, A8 | 보강 필요 | 임직원-거래처 다대다 배정 모델/화면/API 보강 |
| R31 | 거래처에 담당자를 배정하고 거래처 화면에서 담당자가 보여야 함 | `/specs/employee/customer-assignment.md` | A2, A3, A4, A8 | 보강 필요 | 거래처 상세/목록 담당자 표시와 배정 이력 보강 |
| R32 | 승인/반려/보류 버튼이 무엇을 처리하는지 명확해야 함 | `/specs/workflow/approval-action-semantics.md`, `/specs/workflow/approval-line.md` | A2, A3, A7, A8 | 보강 필요 | 버튼별 대상, 결과 상태, 로그, 후속 업무 영향 정의 |
| R33 | 결재 버튼을 누르면 결재 상태를 즉각 확인할 수 있어야 함 | `/specs/workflow/approval-action-semantics.md` | A2, A3, A7, A8 | 보강 필요 | 결재 상태 패널/타임라인/토스트/목록 상태 표시 보강 |
| R34 | 각 메뉴 오른쪽 상단의 개별 설정 버튼은 제거하고 상단 메인 설정 메뉴만 유지 | `/specs/frontend/role-menu-user-context.md`, `/index.html`, `/app.js`, `/styles.css` | A3, A8 | 반영 | 설정 진입점 단일화, 설정 허브 통합, QA 반려 기준 추가 |
| R35 | 입사등록의 승인상태는 실제 결재라인을 통해 승인되어야 함 | `/specs/hr/employee-onboarding-approval.md`, `/specs/workflow/approval-line.md` | A2, A3, A7, A8 | 보강 필요 | 입사등록 상신, 결재라인 설정, 최종 승인 전 입사 확정 금지 |
| R36 | 입사등록 결재라인 설정이 가능해야 함 | `/specs/hr/employee-onboarding-approval.md` | A2, A3, A7, A8 | 보강 필요 | 입사등록 유형의 결재자 추가/순서변경/최종결재권자 지정 |
| R37 | 설정 메뉴에 메뉴별 로그기록을 남기고 확인 가능해야 함 | `/specs/audit/menu-log-records.md`, `/specs/audit/timelog-auditlog.md` | A3, A7, A8, A9 | 보강 필요 | 메뉴별 조회/생성/수정/삭제/결재/반출 로그와 설정 내 조회 화면 |
| R38 | 제원원가/판관비/일반관리비 입력은 설정에서 마스터 또는 입력 권한 임직원만 가능 | `/specs/settings/profit-cost-permission.md`, `/specs/dashboard/supervisor-profitability.md` | A2, A3, A4, A7, A8, A9 | 보강 필요 | 수익성 비용 입력 권한, 산식 변경 로그, 승인/결재 필요 여부 정의 |
| R39 | 외주 인력이 외부 인터넷 환경에서 IP로 접속 가능해야 함 | `/specs/devops/external-vendor-access.md` | A7, A9, A8 | 승인 필요 | 공개 IP 직접 개방 금지 후보, VPN/허용 IP/계정/감사로그/만료일 기준 검토 |

인당 생산성/마진 기여: 요구사항별 담당과 상태를 보여주면 PM이 누락을 즉시 확인하고 담당자는 필요한 보강만 진행한다.

## 4. 보강이 필요한 첫 스펙

| 스펙 | 목적 | 담당 |
|---|---|---|
| `/specs/frontend/table-and-header-behavior.md` | 고정 필드 헤더, 드래그/스크롤, 정렬 UX | A3, A8 |
| `/specs/frontend/customer-product-entry.md` | 고객 신규/수정 저장, 상품 판매가격 표시 | A3, A2, A4, A8 |
| `/specs/frontend/role-menu-user-context.md` | 권한별 메뉴 차등, 설정 옆 사용자 정보 표시 | A3, A7, A8 |
| `/specs/audit/timelog-auditlog.md` | 설정 메뉴 내 로그기록 확인, 로그 대상/필드 | A7, A9, A8 |
| `/specs/integration/delivery-tracking.md` | 택배사 실시간 위치 연동, 수동 보정 큐 | A6, A3, A9 |
| `/specs/employee/customer-assignment.md` | 임직원-거래처 다대다 담당 배정 | A2, A3, A4, A7, A8 |
| `/specs/workflow/approval-action-semantics.md` | 승인/반려/보류/결재 버튼 의미와 상태 확인 | A2, A3, A7, A8 |
| `/specs/frontend/role-menu-user-context.md` | 상단 메인 설정 메뉴 단일화, 메뉴별 중복 설정 버튼 제거 | A3, A8 |
| `/specs/hr/employee-onboarding-approval.md` | 입사등록 승인상태와 결재라인 연동 | A2, A3, A7, A8 |
| `/specs/audit/menu-log-records.md` | 설정 메뉴의 메뉴별 로그기록 조회 | A3, A7, A8, A9 |
| `/specs/settings/profit-cost-permission.md` | 제원원가/판관비/일반관리비 입력 권한 통제 | A2, A3, A4, A7, A8, A9 |
| `/specs/devops/external-vendor-access.md` | 외주 인력 외부 접속 보안 기준 | A7, A9, A8 |

인당 생산성/마진 기여: 보강 스펙을 UI/로그/연동 단위로 분리해 담당자별 병렬 보완이 가능하게 한다.

## 5. PM 승인 항목

1. `보강 필요` 항목을 위 스펙들로 쪼개서 다음 작업으로 진행해도 되는가?
2. 택배사 실시간 위치 연동은 외부 API/계약 확인 전까지 수동 보정 큐 기준으로 진행해도 되는가?
3. 슈퍼바이저와 경영자의 메뉴/정보 접근 범위를 개인정보 승인 게이트로 분리해도 되는가?

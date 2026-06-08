const navItems = [
  ["dashboard", "대시보드", "▦"],
  ["customers", "고객관리", "◎"],
  ["products", "판매상품", "◫"],
  ["logistics", "배송/입출고", "⇄"],
  ["pipeline", "영업 파이프라인", "◇"],
  ["approvals", "결재관리", "✓"],
  ["settings", "설정", "⚙"]
];

const companyPrefixes = ["한빛", "동서", "서울", "푸른", "넥스트", "브라이트", "에이치", "청담", "동부", "하나", "미래", "세종", "대한", "우진", "케이", "더웰", "가온", "라온", "비전", "코어"];
const companySuffixes = ["전자", "바이오", "제약", "식품", "모빌리티", "랩", "케어", "교육", "물류", "푸드", "테크", "리테일", "건설", "서비스", "금융", "헬스", "미디어", "솔루션", "에너지", "커머스"];
const productCategories = ["복지 포인트", "온누리 모바일권", "건강검진", "도서 쿠폰", "선물세트", "여행 바우처", "교육 수강권", "식대 포인트", "문화상품권", "의료비 지원"];
const suppliers = ["복지포인트", "온누리 API", "케어파트너", "그린문고", "모두복지몰", "트래블웰", "러닝허브", "푸드링크", "컬처넷", "메디서포트"];
const teams = ["정산팀", "운영팀", "CS팀", "상품팀", "영업팀", "HR팀", "보안팀"];
const roles = ["정산 승인자", "운영 처리자", "개인정보 제한", "상품 승인자", "AM", "결재권한 관리자", "접근로그 감사자"];
const positions = ["사원", "주임", "대리", "과장", "차장", "부장", "팀장"];
const familyNames = ["김", "박", "이", "최", "정", "강", "조", "윤", "장", "임"];
const givenNames = ["서연", "지훈", "도윤", "민재", "하린", "나은", "윤서", "도현", "서진", "지우"];
const statuses = ["정상", "주의", "개선"];
const contracts = ["운영중", "갱신 30일 전", "갱신 74일 전", "계약 검토", "신규 온보딩", "조건 재협상"];
const MAX_TEAM_ATTACHMENT_BYTES = 20 * 1024 * 1024;
const TODAY = new Date("2026-06-08T00:00:00+09:00");

function padId(prefix, index) {
  return `${prefix}-${String(index).padStart(3, "0")}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatChatTime(date = new Date()) {
  return date.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function makeCustomer(index) {
  const prefix = companyPrefixes[index % companyPrefixes.length];
  const suffix = companySuffixes[Math.floor(index / companyPrefixes.length) % companySuffixes.length];
  const status = statuses[index % statuses.length];
  const margin = (3.1 + ((index * 7) % 72) / 10).toFixed(1);
  return {
    id: padId("CUS", index + 1),
    name: `${prefix}${suffix}`,
    tenant: "client_company",
    contract: contracts[index % contracts.length],
    manager: `AM ${familyNames[index % familyNames.length]}${givenNames[(index + 5) % givenNames.length]}`,
    margin: `${margin}%`,
    issue: ["정산 증적 보완", "배송 지연 증가", "SLA 위험", "상품 승인 대기", "권한 검토 필요"][index % 5],
    address: `서울시 중구 테스트로 ${index + 1}`,
    phone: `02-${String(1000 + index).padStart(4, "0")}-${String(2000 + index).padStart(4, "0")}`,
    contactPerson: `${familyNames[index % familyNames.length]}${givenNames[(index + 2) % givenNames.length]}`,
    email: `contact${String(index + 1).padStart(3, "0")}@example.test`,
    status,
    employeeCount: 10 + ((index * 13) % 240),
    productCount: 2 + (index % 7)
  };
}

function makeProduct(index) {
  const customer = customers[index % customers.length];
  const category = productCategories[index % productCategories.length];
  const supplier = suppliers[index % suppliers.length];
  const marginValue = 3.5 + ((index * 11) % 65) / 10;
  const approvalState = index % 11 === 0 ? "PM 승인 필요" : index % 7 === 0 ? "승인대기" : index % 13 === 0 ? "중지검토" : "판매중";
  const signal = index % 10 === 0 ? "배송 지연" : index % 8 === 0 ? "재고 위험" : index % 6 === 0 ? "저마진" : "정상";
  return [
    `${category} ${String(index + 1).padStart(2, "0")}`,
    supplier,
    customer.name,
    approvalState,
    approvalState === "PM 승인 필요" ? "PM 승인 필요" : `${marginValue.toFixed(1)}%`,
    signal,
    120 + ((index * 19) % 880),
    `AUD-PROD-${String(1400 + index).padStart(4, "0")}`
  ];
}

function makeEmployee(index) {
  const customer = customers[index % customers.length];
  const team = teams[index % teams.length];
  const name = `${familyNames[index % familyNames.length]}${givenNames[index % givenNames.length]}`;
  const employmentStatus = index % 19 === 0 ? "퇴사" : index % 13 === 0 ? "휴직" : index % 11 === 0 ? "병가" : "재직";
  const date = `20${String(8 + (index % 18)).padStart(2, "0")}-${String((index % 12) + 1).padStart(2, "0")}-${String((index % 27) + 1).padStart(2, "0")}`;
  const securityState = employmentStatus === "퇴사" ? "권한 회수 완료" : index % 9 === 0 ? "열람 사유 필요" : "정상";
  return [
    padId("EMP", index + 1),
    name,
    customer.name,
    team,
    employmentStatus,
    date,
    roles[index % roles.length],
    securityState
  ];
}

const customers = Array.from({ length: 100 }, (_, index) => makeCustomer(index));
const products = Array.from({ length: 100 }, (_, index) => makeProduct(index));
const employees = Array.from({ length: 50 }, (_, index) => makeEmployee(index));
const employeeRanks = ["사원", "주임", "대리", "과장", "차장", "부장", "이사"];
const employeeProfiles = employees.map((employee, index) => {
  const birthYear = 1978 + (index % 22);
  const birthDate = `${birthYear}-${String((index % 12) + 1).padStart(2, "0")}-${String((index % 27) + 1).padStart(2, "0")}`;
  const terminationDate = employee[4] === "퇴사" ? `2026-${String(((index + 5) % 12) + 1).padStart(2, "0")}-${String(((index + 13) % 27) + 1).padStart(2, "0")}` : "";
  return {
    id: employee[0],
    rank: employeeRanks[index % employeeRanks.length],
    birthDate,
    maskedBirthDate: `${birthDate.slice(0, 4)}-**-**`,
    hireDate: employee[5],
    terminationDate,
    leaveUsed: employee[4] === "퇴사" ? 0 : index % 9,
    leavePending: employee[4] === "재직" ? index % 3 : 0
  };
});
const hrLeaveUsage = Object.fromEntries(employees.map((employee, index) => [employee[0], index % 9]));
const hrLeaveRequests = [];

const currentProfitCostUser = { name: "김권일", role: "Master" };
const profitCostSettings = {
  productCostRate: 0.08,
  sellingAdminRate: 0.09,
  generalAdminRate: 0.05,
  formulaVersion: "profit-v2026.06",
  authorizedRoles: ["Master", "ProfitCostInputManager"]
};
const productFinanceRecords = products.slice(0, 24).map((product, index) => {
  const salesUnitPrice = 32000 + ((index * 7300) % 128000);
  const purchaseUnitPrice = Math.round(salesUnitPrice * (0.54 + ((index % 5) * 0.035)));
  const soldQuantity = 80 + ((index * 17) % 220);
  const salesStatus = index % 4 === 0 ? "견적" : "매출처리 완료";
  return {
    id: `PFIN-${String(index + 1).padStart(3, "0")}`,
    productName: product[0],
    supplier: product[1],
    customerName: product[2],
    salesUnitPrice,
    purchaseUnitPrice,
    soldQuantity,
    productCostRate: profitCostSettings.productCostRate,
    sellingAdminRate: profitCostSettings.sellingAdminRate,
    generalAdminRate: profitCostSettings.generalAdminRate,
    salesStatus
  };
});

function classifyFinancialRecords() {
  const completedRecords = productFinanceRecords.filter((record) => record.salesStatus === "매출처리 완료");
  const revenue = completedRecords.reduce((sum, record) => sum + record.salesUnitPrice * record.soldQuantity, 0);
  const purchase = completedRecords.reduce((sum, record) => sum + record.purchaseUnitPrice * record.soldQuantity, 0);
  const classified = {
    revenue,
    purchase,
    product_cost: completedRecords.reduce((sum, record) => sum + getRecordCost(record, "productCostRate"), 0),
    selling_admin: completedRecords.reduce((sum, record) => sum + getRecordCost(record, "sellingAdminRate"), 0),
    general_admin: completedRecords.reduce((sum, record) => sum + getRecordCost(record, "generalAdminRate"), 0)
  };
  classified.totalCost = classified.purchase + classified.product_cost + classified.selling_admin + classified.general_admin;
  classified.operatingProfit = classified.revenue - classified.totalCost;
  classified.marginRate = classified.revenue ? classified.operatingProfit / classified.revenue : 0;
  return classified;
}

function getRecordRevenue(record) {
  return record.salesUnitPrice * record.soldQuantity;
}

function getRecordPurchase(record) {
  return record.purchaseUnitPrice * record.soldQuantity;
}

function getRecordCost(record, rateKey) {
  return Math.round(getRecordRevenue(record) * record[rateKey]);
}

function getRecordOperatingProfit(record) {
  return getRecordRevenue(record) - getRecordPurchase(record) - getRecordCost(record, "productCostRate") - getRecordCost(record, "sellingAdminRate") - getRecordCost(record, "generalAdminRate");
}

let dashboardMetrics = [];

const workloadBars = [
  ["고객 CS", 82, "#0f766e"],
  ["정산/포인트", 68, "#2563eb"],
  ["배송/입출고", 54, "#b7791f"],
  ["상품 승인", 42, "#7c3aed"],
  ["권한/감사", 28, "#b42318"]
];

const dashboardActions = [
  ["테스트 데이터 연결 완료", "고객 100개, 판매상품 100개, 임직원 50명이 고객사 기준으로 연결됨", "neutral"],
  ["SLA 초과 고객사 3곳", `${customers[1].name}, ${customers[0].name}, ${customers[2].name} 업무 재배정 필요`, "danger"],
  ["저마진 상품군", "배송 예외율이 높은 복지몰 상품 마진 재검토", "warning"],
  ["승인 대기", "고금액 정산 4건과 결재권한 변경 2건", "neutral"],
  ["PM 승인 필요", "개인정보/민감정보 처리범위와 AI 자동응답 정책", "warning"]
];

const logistics = {
  inbound: [
    ["입고 대기", "건강검진 제휴권", "240건"],
    ["검수 필요", "선물세트 옵션", "18건"]
  ],
  outbound: [
    ["출고 준비", "도서 쿠폰", "96건"],
    ["출고 완료", "복지 포인트", "312건"]
  ],
  delivery: [
    ["배송중", "선물세트", "128건"],
    ["배송 지연", "온누리 모바일권", "14건"]
  ],
  exception: [
    ["주소 확인", "EMP-18***", "PM 승인 필요"],
    ["운송사 오류", "송장 API", "재처리"]
  ]
};

const pipeline = [
  ["리드", "6건", "5.2억", [customers[6].name, customers[7].name]],
  ["제안", "8건", "9.8억", [customers[8].name, customers[9].name]],
  ["계약검토", "9건", "18.1억", [customers[2].name, customers[5].name]],
  ["수주", "4건", "9.7억", [customers[4].name]],
  ["실패/보류", "3건", "1.4억", ["저마진 조건"]]
];

const monthLabels = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];
const salesPeople = ["김나은", "최윤서", "박도현", "이서진", "김권일"];

const salesPerformance = salesPeople.map((name, personIndex) => ({
  id: padId("SALE", personIndex + 1),
  name,
  team: "영업팀",
  monthly: monthLabels.map((month, monthIndex) => {
    const target = 75000000 + personIndex * 12000000 + monthIndex * 3500000;
    const actual = target - 9000000 + ((personIndex + monthIndex) % 5) * 4500000;
    return { month, target, actual };
  })
}));

const aiMessages = [
  ["assistant", "오늘 SLA 초과 7건 중 배송/입출고 4건, 정산 2건, CS 1건입니다. 개인정보 원문 없이 집계 기준으로 요약했습니다."],
  ["user", "저마진 고객사 원인을 알려줘"],
  ["assistant", "동서바이오는 배송 지연과 예외 재처리 비율이 높습니다. 계약/원가 산식은 PM 승인 필요 상태입니다."]
];

const chatMembers = [
  { id: "EMP-001", name: "김서연", team: "정산팀", role: "정산 승인자" },
  { id: "EMP-002", name: "박지훈", team: "운영팀", role: "운영 처리자" },
  { id: "EMP-003", name: "이도윤", team: "CS팀", role: "개인정보 제한" },
  { id: "EMP-004", name: "최민재", team: "상품팀", role: "상품 승인자" },
  { id: "EMP-005", name: "김나은", team: "영업팀", role: "AM" },
  { id: "EMP-006", name: "HR 관리자", team: "HR팀", role: "결재권한 관리자" }
];

const currentChatUser = { id: "ME", name: "김권일", team: "PM", role: "작성자" };

const teamRooms = [
  {
    id: "ROOM-001",
    type: "group",
    title: "배송 지연 대응방",
    participants: ["EMP-002", "EMP-003", "EMP-004"],
    messages: [
      ["운영팀 박지훈", "배송 지연 건은 운송사 API 재처리 후 결과 남기겠습니다.", "AUD-CHAT-772", "09:12"],
      ["CS팀 이도윤", "고객 문의 파일은 마스킹본만 공유하겠습니다.", "AUD-FILE-128", "09:18"]
    ]
  },
  {
    id: "ROOM-002",
    type: "dm",
    title: "김서연",
    participants: ["EMP-001"],
    messages: [["정산팀 김서연", "한빛전자 정산 증적 4건 승인 대기입니다.", "AUD-CHAT-771", "08:54"]]
  }
];

let activeTeamRoomId = teamRooms[0].id;
let selectedTeamMemberIds = ["EMP-001"];

const auditRows = [
  ["AUD-10291", "개인정보 상세 열람", "CS팀 이도윤", "EMP-77***", "사유 입력 완료", "보존기간 PM 승인 필요"],
  ["AUD-10292", "결재권한 변경", "HR 관리자", "김서연", "승인 ID APR-42", "변경 전후 기록"],
  ["AUD-10293", "파일 첨부", "CS팀 이도윤", "고객문의_마스킹본.xlsx", "대화 로그 연결", "다운로드 권한 제한"],
  ["AUD-10294", "상품 가격 변경", "상품팀 최민재", "온누리 모바일권", "승인 대기", "PM 승인 필요"],
  ["AUD-10295", "AI 프롬프트", "운영팀 박지훈", "SLA 초과 요약", "개인정보 미포함", "자동 의사결정 금지"]
];

const toast = document.querySelector("#toast");
let auditFilter = "all";
let activeSettingsIndex = 0;
let activeHrEmployeeId = employees[0][0];

const approvalLines = [
  ["정산 승인", "정산팀 김서연", "재무리더", "승인/반려/보류"],
  ["상품 승인", "상품팀 최민재", "상품리더", "승인/반려/보류"],
  ["고객 계약", "AM 김나은", "영업리더", "승인/반려/보류"],
  ["결재권한 변경", "HR 관리자", "보안책임자", "승인/반려/보류"]
];

const approvalDocuments = [
  { id: "APR-101", title: "복지 포인트 01 판매가격 변경", requester: "상품팀 최민재", approver: "김권일", nextApprover: "상품리더", finalApprover: "PM 김권일", menu: "판매상품", amount: 18400000, status: "승인대기", reason: "판매가격 변경 승인 필요" },
  { id: "APR-102", title: "한빛전자 고객 계약 조건 변경", requester: "영업팀 김나은", approver: "김권일", nextApprover: "재무리더", finalApprover: "PM 김권일", menu: "고객관리", amount: 42000000, status: "승인대기", reason: "계약 조건 재협상" },
  { id: "APR-103", title: "입사등록 계정 활성화", requester: "HR팀 HR 관리자", approver: "김권일", nextApprover: "보안책임자", finalApprover: "PM 김권일", menu: "결재/입사등록", amount: 0, status: "보류", reason: "결재라인 보완 필요" },
  { id: "APR-104", title: "배송 지연 보상 정산", requester: "운영팀 박지훈", approver: "김권일", nextApprover: "재무리더", finalApprover: "PM 김권일", menu: "배송/입출고", amount: 3600000, status: "승인완료", reason: "고객사 SLA 대응" }
];

const settingsHub = [
  {
    menu: "대시보드/재무",
    scope: "품목별 판매/매입 데이터와 제품원가, 판매관리비, 일반관리비 기준율 및 영업이익 산식 버전 관리",
    owner: "Master · ProfitCostInputManager",
    controls: ["비용 기준 설정 권한자 지정", "품목별 판매/매입 기준", "영업이익 산식 버전", "슈퍼바이저 대시보드 노출"],
    badge: "수익성 비용",
    fields: [
      ["제품원가율(%)", "number", String(profitCostSettings.productCostRate * 100), "매출액 대비 제품원가 기준"],
      ["판관비율(%)", "number", String(profitCostSettings.sellingAdminRate * 100), "매출액 대비 판매관리비 기준"],
      ["일반관리비율(%)", "number", String(profitCostSettings.generalAdminRate * 100), "매출액 대비 일반관리비 기준"],
      ["산식 버전", "text", "profit-v2026.06", "대시보드 표시 버전"]
    ],
    toggles: ["슈퍼바이저 대시보드 노출", "저장 전 영향 범위 확인", "비용 기준 변경 결재 대상"],
    permissions: ["Master", "ProfitCostInputManager"],
    audit: "제품원가율/판관비율/일반관리비율 변경 전후 값, 영향 범위, 산식 버전이 감사로그에 남습니다."
  },
  {
    menu: "고객관리",
    scope: "신규/수정 저장 정책, 거래처 담당자 배정, 담당자 다중 선택 기준",
    owner: "관리자",
    controls: ["고객 신규 등록 승인", "거래처 담당자 다중 배정", "고객 수정 변경 로그"],
    badge: "거래처 담당",
    fields: [
      ["신규 고객 저장 정책", "select", "중복 경고 후 저장", "저장 전 중복 검사"],
      ["대표 담당자 기준", "select", "거래처당 1명", "거래처 목록 표시"],
      ["변경 사유 필수 범위", "select", "연락처/계약/담당자", "타임로그 대상"]
    ],
    toggles: ["담당자 다중 선택", "고객 수정 변경 전후 표시", "권한 없는 수정 차단"],
    permissions: ["관리자", "AM 리더", "개인정보 승인자"],
    audit: "고객 생성, 수정, 담당자 배정, 대표 담당자 변경은 메뉴별 로그와 타임로그에 남습니다."
  },
  {
    menu: "판매상품",
    scope: "판매가격 표시, 상품 승인 요청, 가격/수수료 변경 승인 기준",
    owner: "상품 승인자",
    controls: ["판매가격 필수 표시", "상품 승인 결재라인", "가격/수수료 변경 로그"],
    badge: "가격 통제",
    fields: [
      ["판매가격 표시 방식", "select", "목록 고정 컬럼", "상품/견적/주문 공통"],
      ["가격 변경 승인 기준", "select", "변경률 5% 이상", "결재 후보"],
      ["재고 연동 기준", "select", "입출고 상태 갱신", "배송/입출고 연결"]
    ],
    toggles: ["판매가격 필수 표시", "할인 후 가격 비교", "가격 변경 이력 링크"],
    permissions: ["상품 승인자", "Master"],
    audit: "판매가격, 수수료, 공급사, 재고 변경은 변경 전후 값과 승인 상태가 감사로그에 남습니다."
  },
  {
    menu: "배송/입출고",
    scope: "택배사 연동, 배송 위치 조회, 입고/출고 상태 코드와 예외 처리",
    owner: "운영 처리자",
    controls: ["택배사 연동 상태", "입고/출고 상태 코드", "배송 예외 알림 기준"],
    badge: "배송 예외",
    fields: [
      ["택배사 연동 모드", "select", "수동 송장+재조회 큐", "API 계약 전 기본값"],
      ["배송 위치 갱신 주기", "select", "30분", "지연 감지 기준"],
      ["예외 큐 전환 기준", "select", "지연/반송/오배송/미출고", "운영 콘솔 연동"]
    ],
    toggles: ["배송 지연 알림", "수동 송장 입력 허용", "상태 보정 사유 필수"],
    permissions: ["운영 처리자", "운영 리더"],
    audit: "송장 입력, 상태 보정, 재조회, 예외 큐 전환은 배송 메뉴 로그로 기록됩니다."
  },
  {
    menu: "영업 파이프라인",
    scope: "견적 발행, 계약 전환, 주문 등록, 매출인식 상태 전이 기준",
    owner: "영업 관리자",
    controls: ["견적 발행 단계", "계약 전환 조건", "매출인식 상태 전이"],
    badge: "매출 흐름",
    fields: [
      ["기회 단계", "select", "제안-견적-계약-주문", "파이프라인 칸반"],
      ["계약 전환 조건", "select", "견적 최종 승인", "주문 등록 게이트"],
      ["매출인식 기준", "select", "출고/검수/청구 확인", "PM 승인 필요"]
    ],
    toggles: ["예상금액 필수", "다음 액션 필수", "저마진 원인 드릴다운"],
    permissions: ["영업 관리자", "경영자/PM"],
    audit: "기회 단계 변경, 견적 발행, 계약 전환, 매출인식 상태 변경이 메뉴별 로그에 남습니다."
  },
  {
    menu: "결재/입사등록",
    scope: "로그인 사용자 자동 상신, 결재라인 지정, 승인/반려/보류 상태 처리",
    owner: "결재권한 관리자",
    controls: ["상신자 자동 지정", "결재라인 순서 변경", "입사등록 최종 승인 전 활성화 차단"],
    badge: "승인 상태",
    fields: [
      ["결재라인 기본 템플릿", "select", "부서장-보안책임자-최종권자", "입사등록 포함"],
      ["보류 공식 상태", "select", "사용", "사유 필수"],
      ["입사등록 활성화 기준", "select", "최종 승인 후 대기", "계정 활성화 표시 금지"]
    ],
    toggles: ["상신자 자동 지정", "반려/보류 사유 필수", "현재/다음/최종 결재자 표시"],
    permissions: ["결재권한 관리자", "HR 관리자"],
    audit: "결재라인 설정, 승인, 반려, 보류, 입사등록 활성화 대기는 감사로그에 남습니다."
  },
  {
    menu: "임직원 신상명세/근태·연차",
    scope: "임직원 신상명세, 재직상태, 입퇴사, 휴직/병가, 연차 자동계산과 신청/잔여관리",
    owner: "HR 관리자 · Master",
    controls: ["신상명세 마스킹", "재직상태 코드", "입사연도 기준 연차 자동계산", "연차 신청 승인 상태"],
    badge: "HR/Leave",
    fields: [
      ["연차 산정 기준", "select", "입사일 기준", "근로기준법 제60조 가정"],
      ["1년 미만 기준", "select", "1개월 개근 1일", "최대 11일"],
      ["장기근속 가산", "select", "3년 이상 2년마다 +1일", "최대 25일"]
    ],
    toggles: ["신상명세 기본 마스킹", "퇴사자 권한 회수", "연차 신청 감사로그"],
    permissions: ["HR 관리자", "Master"],
    audit: "신상명세 조회, 재직상태 변경, 연차 신청/승인/잔여 변경은 감사로그와 접근로그에 남습니다."
  },
  {
    menu: "로그기록",
    scope: "메뉴 진입, 조회, 생성, 수정, 결재, 반출 로그 조회와 보존 정책",
    owner: "접근로그 감사자",
    controls: ["메뉴별 로그 필터", "로그 보존 기간", "반출 승인 기록"],
    badge: "감사 추적",
    fields: [
      ["기본 로그 탭", "select", "메뉴별 로그", "전체/메뉴별 전환"],
      ["보존 기간", "select", "감사로그 기준 동일", "PM 승인 필요"],
      ["반출 권한", "select", "슈퍼바이저+감사 담당", "CSV/Excel 제한"]
    ],
    toggles: ["메뉴 진입 로그", "로그 상세 조회 로그", "개인정보 기본 마스킹"],
    permissions: ["접근로그 감사자", "슈퍼바이저"],
    audit: "로그 조회와 로그 상세 조회 자체도 감사로그에 남고 권한 없는 접근은 permission_denied로 기록됩니다."
  }
];

const commandTemplates = {
  "customer-create": ["고객 등록", "신규 고객사 등록 폼을 열었습니다.", "고객사명, 담당자, 계약 상태 입력 후 승인 요청으로 전환됩니다."],
  "product-approval": ["상품 승인 요청", "선택 가능한 판매상품 승인 요청 큐를 생성했습니다.", "가격/수수료/공급사 변경은 감사로그와 PM 승인 필요 상태로 기록됩니다."],
  "pipeline-create": ["기회 등록", "영업 기회 등록 작업을 시작했습니다.", "고객사, 예상 금액, 단계, 다음 액션을 입력하는 테스트 흐름입니다."],
  "employee-create": ["입사 등록", "임직원 입사 등록 작업을 시작했습니다.", "신상명세와 결재권한 항목은 마스킹 및 PM 승인 필요 상태로 관리됩니다."],
  metric: ["대시보드 지표", "선택한 KPI 기준으로 관련 업무 목록을 조회합니다.", "현재는 테스트 데이터 기준 필터 프리뷰입니다."],
  action: ["우선 조치", "선택한 조치 항목을 운영 검토 큐에 추가했습니다.", "담당자 배정과 승인 여부는 감사로그로 남습니다."],
  productRow: ["판매상품 상세", "판매상품 상세 패널을 열었습니다.", "상품 상태, 공급사, 연결 고객사, 재고, 감사로그를 확인합니다."],
  employeeRow: ["임직원 상세", "임직원 상세 패널을 열었습니다.", "개인정보 원문은 표시하지 않고 권한/결재/입퇴사 상태만 확인합니다."],
  auditRow: ["감사 로그 상세", "감사 로그 상세를 열었습니다.", "이벤트, 행위자, 대상, 통제 상태를 확인합니다."],
  pipelineItem: ["파이프라인 상세", "영업 파이프라인 항목을 열었습니다.", "고객사 기회 단계와 다음 액션을 검토합니다."],
  approval: ["결재 처리", "승인/반려/보류 결재 작업을 선택했습니다.", "결재권한과 결재라인 기준으로 처리됩니다."]
};

const formConfigs = {
  "customer-create": [
    ["customerName", "고객사명", "text", "예: 신규복지테크", "신규복지테크"],
    ["manager", "담당 AM", "text", "예: AM 김권일", "AM 김권일"],
    ["contract", "계약 상태", "text", "예: 신규 온보딩", "신규 온보딩"],
    ["issue", "최근 이슈", "text", "예: 초기 계약 검토", "초기 계약 검토"],
    ["margin", "마진율", "text", "예: 7.5%", "7.5%"],
    ["address", "주소", "text", "예: 서울시 중구 테스트로 1", "서울시 중구 테스트로 1"],
    ["phone", "연락처", "text", "예: 02-1234-5678", "02-1234-5678"],
    ["contactPerson", "거래처 담당자", "text", "예: 홍길동", "홍길동"],
    ["email", "이메일", "email", "예: contact@example.com", "contact@example.com"]
  ],
  "product-approval": [
    ["productName", "상품명", "text", "예: 선택복지 상품 101", "선택복지 상품 101"],
    ["supplier", "공급사", "text", "예: 신규공급사", "신규공급사"],
    ["customerName", "연결 고객사", "text", "예: 한빛전자", "한빛전자"],
    ["margin", "마진율", "text", "예: PM 승인 필요", "PM 승인 필요"],
    ["stock", "재고", "number", "예: 300", "300"]
  ],
  "pipeline-create": [
    ["opportunityName", "기회/기획명", "text", "예: 2026 복지몰 확대 제안", "2026 복지몰 확대 제안"],
    ["stage", "단계", "text", "예: 리드", "리드"],
    ["amount", "예상 금액", "text", "예: 2.4억", "2.4억"],
    ["nextAction", "다음 액션", "text", "예: 제안서 발송", "제안서 발송"]
  ],
  "employee-create": [
    ["employeeName", "이름", "text", "예: 홍길동", "홍길동"],
    ["customerName", "소속 고객사", "text", "예: 한빛전자", "한빛전자"],
    ["team", "조직", "text", "예: 운영팀", "운영팀"],
    ["startDate", "입사일", "date", "", "2026-06-07"],
    ["approvalRole", "결재권한", "text", "예: 운영 처리자", "운영 처리자"]
  ]
};

let activeCommand = null;
let activeAuditId = null;

function renderNav() {
  document.querySelector("#navList").innerHTML = navItems
    .map(
      ([id, label, icon], index) => `
        <button class="nav-item ${index === 0 ? "active" : ""}" data-view="${id}" type="button" title="${label}">
          <span aria-hidden="true">${icon}</span>
          ${label}
        </button>
      `
    )
    .join("");
}

function getAnnualSalesTarget() {
  return salesPerformance.reduce((sum, person) => sum + sumPerson(person, "target"), 0);
}

function getAnnualSalesActual() {
  return salesPerformance.reduce((sum, person) => sum + sumPerson(person, "actual"), 0);
}

function renderDashboard() {
  const finance = classifyFinancialRecords();
  const target = getAnnualSalesTarget();
  const actual = getAnnualSalesActual();
  const achievement = target ? Math.round((actual / target) * 1000) / 10 : 0;
  dashboardMetrics = [
    ["목표금액", formatWon(target), "영업사원 1년 목표 합계", "neutral"],
    ["매출금액", formatWon(actual), `달성율 ${achievement}%`, "positive"],
    ["실시간 매출 현황", formatWon(finance.revenue), "원천 매출 레코드 기준", "positive"],
    ["영업이익", formatWon(finance.operatingProfit), "매출-매입-비용", finance.operatingProfit >= 0 ? "positive" : "danger"],
    ["운영 처리량", "641건", "전월 대비 +18%", "neutral"],
    ["마진 추이", `${Math.round((finance.operatingProfit / finance.revenue) * 1000) / 10}%`, "영업이익률", "warning"]
  ];

  document.querySelector("#dashboardMetrics").innerHTML = dashboardMetrics
    .map(
      ([label, value, helper, tone]) => `
        <button class="metric ${tone}" type="button" data-command="metric" data-command-label="${label}">
          <span>${label}</span>
          <strong>${value}</strong>
          <small>${helper}</small>
        </button>
      `
    )
    .join("");

  renderMarginTrendChart();
  document.querySelector("#workloadBars").innerHTML = workloadBars
    .map(
      ([label, value, color]) => `
        <div class="bar-row">
          <div><strong>${label}</strong><span>${value}%</span></div>
          <div class="bar-track"><i style="width:${value}%; background:${color}"></i></div>
        </div>
      `
    )
    .join("");

  renderActionList("#dashboardActions", dashboardActions);
  renderFinanceInputs();
  renderProductFinanceTable();
  renderRealtimeSales();
}

function renderMarginTrendChart() {
  const values = monthLabels.map((month, index) => {
    const actual = sumMonthly(index, "actual");
    const target = sumMonthly(index, "target") || 1;
    const rate = 12 + (actual / target) * 8 + (index % 3) * 0.9;
    return { month, rate: Math.round(rate * 10) / 10 };
  });
  const width = 640;
  const height = 220;
  const left = 34;
  const right = 620;
  const top = 44;
  const bottom = 190;
  const min = Math.min(...values.map((item) => item.rate)) - 2;
  const max = Math.max(...values.map((item) => item.rate)) + 2;
  const points = values.map((item, index) => {
    const x = left + ((right - left) / (values.length - 1)) * index;
    const y = bottom - ((item.rate - min) / (max - min || 1)) * (bottom - top);
    return { ...item, x: Math.round(x), y: Math.round(y) };
  });
  const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x} ${point.y}`).join(" ");
  const areaPath = `${linePath} L${right} ${bottom} L${left} ${bottom} Z`;
  document.querySelector("#marginTrendChart").innerHTML = `
    <svg class="line-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="1월부터 12월까지 월별 마진율 추이">
      <defs>
        <linearGradient id="lineFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="#0f766e" stop-opacity="0.22" />
          <stop offset="100%" stop-color="#0f766e" stop-opacity="0" />
        </linearGradient>
      </defs>
      <path class="area-path" d="${areaPath}" />
      <path class="line-path" d="${linePath}" />
      <g class="chart-grid">
        <line x1="${left}" y1="${bottom}" x2="${right}" y2="${bottom}" />
        <line x1="${left}" y1="154" x2="${right}" y2="154" />
        <line x1="${left}" y1="104" x2="${right}" y2="104" />
        <line x1="${left}" y1="54" x2="${right}" y2="54" />
      </g>
      <g class="chart-labels">
        ${points.map((point) => `<text x="${point.x - 10}" y="214">${point.month}</text>`).join("")}
      </g>
      <g class="chart-points">
        ${points.map((point) => `<circle cx="${point.x}" cy="${point.y}" r="3"><title>${point.month} ${point.rate}%</title></circle>`).join("")}
      </g>
    </svg>
  `;
}

function renderFinanceInputs() {
  const finance = classifyFinancialRecords();
  const basisCards = [
    ["품목 매출액", formatWon(finance.revenue), `${productFinanceRecords.length}개 품목 판매금액 합계`],
    ["품목 매입액", formatWon(finance.purchase), "품목별 매입금액 합계"],
    ["제품원가", formatWon(finance.product_cost), `매출액 x ${formatPercent(profitCostSettings.productCostRate)}`],
    ["판매관리비", formatWon(finance.selling_admin), `매출액 x ${formatPercent(profitCostSettings.sellingAdminRate)}`],
    ["일반관리비", formatWon(finance.general_admin), `매출액 x ${formatPercent(profitCostSettings.generalAdminRate)}`]
  ];
  document.querySelector("#financeInputs").innerHTML = basisCards
    .map(
      ([label, value, help]) => `
        <div class="finance-basis-card">
          <span>${label}</span>
          <strong>${value}</strong>
          <em>${help}</em>
        </div>
      `
    )
    .join("");
  document.querySelector("#operatingProfitFormula").innerHTML = `
    <strong>영업이익 ${formatWon(finance.operatingProfit)} · 이익률 ${formatPercent(finance.marginRate)}</strong>
    <span>품목별 매출 ${formatWon(finance.revenue)} - 품목별 매입 ${formatWon(finance.purchase)} - 제품원가 ${formatWon(finance.product_cost)} - 판매관리비 ${formatWon(finance.selling_admin)} - 일반관리비 ${formatWon(finance.general_admin)}</span>
    <div class="finance-record-preview">
      ${productFinanceRecords
        .slice(0, 4)
        .map(
          (record) => `
            <span>${escapeHtml(record.productName)} · 판매 ${formatWon(record.salesUnitPrice)} · 매입 ${formatWon(record.purchaseUnitPrice)} · ${record.soldQuantity}건</span>
          `
        )
        .join("")}
    </div>
    <small>기준 변경 권한: ${profitCostSettings.authorizedRoles.join(", ")} · 현재 사용자 ${currentProfitCostUser.name}(${currentProfitCostUser.role}) · 산식 ${profitCostSettings.formulaVersion}</small>
  `;
}

function renderProductFinanceTable() {
  document.querySelector("#productFinanceTable").innerHTML = `
    <table>
      <thead>
        <tr>
          <th>품목</th>
          <th>상태</th>
          <th>판매가격</th>
          <th>매입가격</th>
          <th>수량</th>
          <th>제품원가율</th>
          <th>판관비율</th>
          <th>일반관리비율</th>
          <th>예상 영업이익</th>
          <th>처리</th>
        </tr>
      </thead>
      <tbody>
        ${productFinanceRecords
          .slice(0, 8)
          .map((record, index) => renderProductFinanceRow(record, index))
          .join("")}
      </tbody>
    </table>
  `;
}

function renderProductFinanceRow(record, index) {
  return `
    <tr>
      <td>${escapeHtml(record.productName)}</td>
      <td><span class="status-pill ${record.salesStatus === "매출처리 완료" ? "active" : ""}">${record.salesStatus}</span></td>
      <td><input class="finance-basis-input" data-finance-record="${index}" data-finance-field="salesUnitPrice" inputmode="numeric" value="${formatWon(record.salesUnitPrice)}" /></td>
      <td><input class="finance-basis-input" data-finance-record="${index}" data-finance-field="purchaseUnitPrice" inputmode="numeric" value="${formatWon(record.purchaseUnitPrice)}" /></td>
      <td><input class="finance-basis-input" data-finance-record="${index}" data-finance-field="soldQuantity" inputmode="numeric" value="${record.soldQuantity}" /></td>
      <td><input class="finance-basis-input" data-finance-record="${index}" data-finance-field="productCostRate" inputmode="decimal" value="${formatPercent(record.productCostRate)}" /></td>
      <td><input class="finance-basis-input" data-finance-record="${index}" data-finance-field="sellingAdminRate" inputmode="decimal" value="${formatPercent(record.sellingAdminRate)}" /></td>
      <td><input class="finance-basis-input" data-finance-record="${index}" data-finance-field="generalAdminRate" inputmode="decimal" value="${formatPercent(record.generalAdminRate)}" /></td>
      <td><strong>${formatWon(getRecordOperatingProfit(record))}</strong></td>
      <td><button class="secondary-button compact-button" type="button" data-complete-sale="${index}">매출처리 완료</button></td>
    </tr>
  `;
}

function saveProductFinanceBasis() {
  document.querySelectorAll(".finance-basis-input").forEach((input) => {
    const record = productFinanceRecords[Number(input.dataset.financeRecord)];
    const field = input.dataset.financeField;
    if (!record || !field) return;
    if (field.endsWith("Rate")) {
      record[field] = parseNumberRate(input.value);
      input.value = formatPercent(record[field]);
      return;
    }
    record[field] = parseWon(input.value);
    input.value = field === "soldQuantity" ? record[field] : formatWon(record[field]);
  });
  const auditId = `AUD-PROFIT-${Date.now().toString().slice(-6)}`;
  auditRows.unshift([auditId, "품목별 영업이익 기준 저장", currentProfitCostUser.name, "대시보드/재무", "저장 완료", "판매가격/매입가격/비용율 기준 재계산"]);
  auditRows.splice(20);
  renderDashboard();
  renderAudit();
  showToast("품목별 기준값을 저장하고 영업이익을 재계산했습니다.");
}

function completeProductSale(recordIndex) {
  saveProductFinanceBasis();
  const record = productFinanceRecords[recordIndex];
  if (!record) return;
  record.salesStatus = "매출처리 완료";
  const auditId = `AUD-SALE-${Date.now().toString().slice(-6)}`;
  auditRows.unshift([auditId, "매출처리 완료", currentProfitCostUser.name, record.productName, "완료", `영업이익 ${formatWon(getRecordOperatingProfit(record))} 대시보드 반영`]);
  auditRows.splice(20);
  renderDashboard();
  renderAudit();
  showToast(`${record.productName} 매출처리 완료 후 영업이익을 반영했습니다.`);
}

function renderRealtimeSales() {
  const values = monthLabels.map((month, index) => ({ month, amount: sumMonthly(index, "actual") }));
  const max = Math.max(...values.map((item) => item.amount));
  document.querySelector("#realtimeSalesBars").innerHTML = values
    .map(
      (item) => `
        <div class="realtime-row">
          <span>${item.month}</span>
          <div class="bar-track"><i style="width:${Math.max(8, Math.round((item.amount / max) * 100))}%"></i></div>
          <strong>${formatWon(item.amount)}</strong>
        </div>
      `
    )
    .join("");
}

function renderCustomers() {
  document.querySelector("#customerList").innerHTML = customers
    .map(
      (customer, index) => `
        <button class="entity-row ${index === 0 ? "selected" : ""}" type="button" data-customer="${customer.name}">
          <div>
            <strong>${customer.name}</strong>
            <span>${customer.manager} · ${customer.contract}</span>
          </div>
          <em class="${customer.status === "개선" ? "danger" : customer.status === "주의" ? "warning" : ""}">${customer.margin}</em>
        </button>
      `
    )
    .join("");
  renderCustomerDetail(customers[0].name);
}

function renderCustomerDetail(name) {
  const customer = customers.find((item) => item.name === name) || customers[0];
  const linkedProducts = products.filter((product) => product[2] === customer.name).length;
  const linkedEmployees = employees.filter((employee) => employee[2] === customer.name).length;
  document.querySelector("#customerDetail").innerHTML = `
    <div class="detail-header">
      <span class="status-pill">${customer.tenant}</span>
      <h2>${customer.name}</h2>
      <p>${customer.id} · ${customer.issue} · ${customer.status}</p>
    </div>
    <div class="detail-grid">
      <div><span>담당자</span><strong>${customer.manager}</strong></div>
      <div><span>계약 상태</span><strong>${customer.contract}</strong></div>
      <div><span>마진율</span><strong>${customer.margin}</strong></div>
      <div><span>주소</span><strong>${customer.address}</strong></div>
      <div><span>연락처</span><strong>${customer.phone}</strong></div>
      <div><span>거래처 담당자</span><strong>${customer.contactPerson}</strong></div>
      <div><span>이메일</span><strong>${customer.email}</strong></div>
      <div><span>연결 상품</span><strong>${linkedProducts}개</strong></div>
      <div><span>연결 임직원</span><strong>${linkedEmployees}명</strong></div>
      <div><span>고객 임직원 규모</span><strong>${customer.employeeCount}명</strong></div>
      <div><span>개인정보</span><strong>마스킹 기본</strong></div>
      <div><span>접근로그</span><strong>AUD-CUS-${customer.id.split("-")[1]}</strong></div>
      <div><span>승인</span><strong>상세 열람 사유 필요</strong></div>
    </div>
    <div class="notice">고객사 테넌트 범위 밖 상세 조회와 연락처 원문 검색은 PM 승인 필요입니다.</div>
  `;
}

function renderProducts() {
  document.querySelector("#productTable").innerHTML = `
    <table>
      <thead>
        <tr>
          <th>상품명</th>
          <th>공급사</th>
          <th>연결 고객사</th>
          <th>상태</th>
          <th>마진</th>
          <th>운영 신호</th>
          <th>재고</th>
          <th>감사로그</th>
        </tr>
      </thead>
      <tbody>
        ${products
          .map(
            (product, index) => `
              <tr data-command="productRow" data-command-label="${product[0]}">
                <td>${product[0]}</td>
                <td>${product[1]}</td>
                <td>${product[2]}</td>
                <td>${product[3]}</td>
                <td>${product[4]}</td>
                <td>${product[5]}</td>
                <td>
                  <input
                    class="stock-input"
                    data-product-index="${index}"
                    type="number"
                    min="0"
                    step="1"
                    value="${product[6]}"
                    aria-label="${product[0]} 재고"
                  />
                </td>
                <td>${product[7]}</td>
              </tr>
            `
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function renderLogistics() {
  const labels = {
    inbound: "입고",
    outbound: "출고",
    delivery: "배송",
    exception: "예외"
  };
  document.querySelector("#logisticsBoard").innerHTML = Object.entries(logistics)
    .map(
      ([key, rows]) => `
        <div class="lane">
          <h3>${labels[key]}</h3>
          ${rows
            .map(
              ([title, item, meta]) => `
                <div class="lane-card">
                  <strong>${title}</strong>
                  <span>${item}</span>
                  <em>${meta}</em>
                </div>
              `
            )
            .join("")}
        </div>
      `
    )
    .join("");
  renderActionList("#inventoryRisks", getInventoryRisks());
}

function getInventoryRisks() {
  return products
    .slice()
    .sort((a, b) => Number(a[6]) - Number(b[6]))
    .slice(0, 5)
    .map((product) => {
      const stock = Number(product[6]);
      const tone = stock < 180 ? "danger" : stock < 260 ? "warning" : "neutral";
      return [product[0], `현재 재고 ${stock.toLocaleString("ko-KR")}개 · 입출고 관리 연동`, tone];
    });
}

function saveProductInventory() {
  document.querySelectorAll(".stock-input").forEach((input) => {
    const index = Number(input.dataset.productIndex);
    products[index][6] = Math.max(0, Number(input.value) || 0);
  });
  const auditId = `AUD-STOCK-${Date.now().toString().slice(-6)}`;
  auditRows.unshift([auditId, "판매상품 재고 변경", "현재 사용자", "판매상품", "저장 완료", "입출고 현황 갱신"]);
  auditRows.splice(20);
  renderProducts();
  renderLogistics();
  renderAudit();
  showToast("판매상품 재고를 숫자로 저장하고 입출고 현황을 갱신했습니다.");
}

function renderPipeline() {
  document.querySelector("#pipelineBoard").innerHTML = pipeline
    .map(
      ([stage, count, amount, names]) => `
        <div class="pipeline-stage">
          <div class="stage-head">
            <strong>${stage}</strong>
            <span>${count}</span>
          </div>
          <div class="stage-amount">${amount}</div>
          ${names.map((name) => `<button type="button" data-command="pipelineItem" data-command-label="${name}">${name}</button>`).join("")}
        </div>
      `
    )
    .join("");
  renderSalesPerformance();
}

function formatWon(value) {
  return `${Math.round(Number(value) || 0).toLocaleString("ko-KR")}원`;
}

function formatPercent(value) {
  return `${(Number(value) * 100).toFixed(1).replace(/\.0$/, "")}%`;
}

function formatFileSize(bytes) {
  if (!bytes) return "0B";
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024).toLocaleString("ko-KR")}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

function parseWon(value) {
  return Number(String(value).replace(/[^\d]/g, "")) || 0;
}

function sumMonthly(monthIndex, key) {
  return salesPerformance.reduce((sum, person) => sum + person.monthly[monthIndex][key], 0);
}

function sumPerson(person, key) {
  return person.monthly.reduce((sum, month) => sum + month[key], 0);
}

function renderSalesPerformance() {
  const totalTarget = salesPerformance.reduce((sum, person) => sum + sumPerson(person, "target"), 0);
  const totalActual = salesPerformance.reduce((sum, person) => sum + sumPerson(person, "actual"), 0);
  const achievement = totalTarget ? Math.round((totalActual / totalTarget) * 1000) / 10 : 0;

  document.querySelector("#salesSummary").innerHTML = `
    <div><span>연간 목표 합계</span><strong>${formatWon(totalTarget)}</strong></div>
    <div><span>연간 실적 합계</span><strong>${formatWon(totalActual)}</strong></div>
    <div><span>달성률</span><strong>${achievement}%</strong></div>
  `;

  document.querySelector("#salesPerformanceTable").innerHTML = `
    <table class="sales-table">
      <thead>
        <tr>
          <th rowspan="2">영업사원</th>
          ${monthLabels.map((month) => `<th colspan="2">${month}</th>`).join("")}
          <th colspan="2">개인 1년 합계</th>
        </tr>
        <tr>
          ${monthLabels.map(() => `<th>목표</th><th>실적</th>`).join("")}
          <th>목표</th><th>실적</th>
        </tr>
      </thead>
      <tbody>
        ${salesPerformance
          .map(
            (person, personIndex) => `
              <tr>
                <th>${person.name}<span>${person.team}</span></th>
                ${person.monthly
                  .map(
                    (month, monthIndex) => `
                      <td>
                        <input
                          class="sales-target-input"
                          data-person-index="${personIndex}"
                          data-month-index="${monthIndex}"
                          inputmode="numeric"
                          value="${formatWon(month.target)}"
                        />
                      </td>
                      <td>${formatWon(month.actual)}</td>
                    `
                  )
                  .join("")}
                <td class="total-cell">${formatWon(sumPerson(person, "target"))}</td>
                <td class="total-cell">${formatWon(sumPerson(person, "actual"))}</td>
              </tr>
            `
          )
          .join("")}
        <tr class="month-total-row">
          <th>월 합계</th>
          ${monthLabels
            .map((_, monthIndex) => `<td>${formatWon(sumMonthly(monthIndex, "target"))}</td><td>${formatWon(sumMonthly(monthIndex, "actual"))}</td>`)
            .join("")}
          <td>${formatWon(totalTarget)}</td>
          <td>${formatWon(totalActual)}</td>
        </tr>
      </tbody>
    </table>
  `;
}

function saveSalesTargets() {
  document.querySelectorAll(".sales-target-input").forEach((input) => {
    const personIndex = Number(input.dataset.personIndex);
    const monthIndex = Number(input.dataset.monthIndex);
    salesPerformance[personIndex].monthly[monthIndex].target = parseWon(input.value);
  });
  const auditId = `AUD-SALES-${Date.now().toString().slice(-6)}`;
  auditRows.unshift([auditId, "매출목표 변경", "현재 사용자", "영업팀", "저장 완료", "원 단위 목표 변경"]);
  auditRows.splice(20);
  renderSalesPerformance();
  renderAudit();
  showToast("매출목표를 원 단위로 저장했습니다.");
}

function renderChats() {
  document.querySelector("#aiChat").innerHTML = aiMessages.map(renderMessage).join("");
  renderTeamRooms();
  renderTeamMembers();
  renderTeamRoomMessages();
  const activeRoom = getActiveTeamRoom();
  document.querySelector("#chatAuditFeed").innerHTML = activeRoom.messages
    .slice(-8)
    .reverse()
    .map(
      ([sender, message, audit, time]) => `
        <div class="audit-item">
          <strong>${escapeHtml(audit)}</strong>
          <span>${escapeHtml(activeRoom.title)} · ${escapeHtml(sender)} · ${escapeHtml(time || "시간 미기록")}</span>
          <p>${escapeHtml(message)}</p>
        </div>
      `
    )
    .join("");

  document.querySelector("#aiControls").innerHTML = [
    ["개인정보 입력 방지", "프롬프트와 파일 첨부는 마스킹 기준으로 제한"],
    ["AI 자동 의사결정 금지", "승인, 반려, 정산 확정은 사람이 검토"],
    ["로그 보존", "프롬프트/응답 보존기간은 PM 승인 필요"]
  ]
    .map(([title, text]) => `<div class="control-item"><strong>${title}</strong><p>${text}</p></div>`)
    .join("");
}

function getActiveTeamRoom() {
  return teamRooms.find((room) => room.id === activeTeamRoomId) || teamRooms[0];
}

function getMemberLabel(memberId) {
  const member = getChatMember(memberId);
  return member ? `${member.team} ${member.name}` : memberId;
}

function getChatMember(memberId) {
  if (memberId === currentChatUser.id) return currentChatUser;
  return chatMembers.find((item) => item.id === memberId);
}

function getRoomMemberIds(room) {
  return [currentChatUser.id, ...room.participants];
}

function getCurrentSenderLabel() {
  return `${currentChatUser.team} ${currentChatUser.name}`;
}

function renderTeamRooms() {
  document.querySelector("#teamRoomCount").textContent = `${teamRooms.length}개`;
  document.querySelector("#teamRoomList").innerHTML = teamRooms
    .map((room) => {
      const latest = room.messages[room.messages.length - 1];
      return `
        <button class="team-room-item ${room.id === activeTeamRoomId ? "active" : ""}" type="button" data-team-room="${room.id}">
          <span>${room.type === "dm" ? "DM" : "단톡방"} · ${room.participants.length + 1}명</span>
          <strong>${escapeHtml(room.title)}</strong>
          <em>${latest ? `${escapeHtml(latest[3] || "시간 미기록")} · ${escapeHtml(latest[1])}` : "새 채팅방"}</em>
        </button>
      `;
    })
    .join("");
}

function renderTeamMembers() {
  document.querySelector("#teamMemberPicker").innerHTML = chatMembers
    .map(
      (member) => `
        <div class="member-option ${selectedTeamMemberIds.includes(member.id) ? "active" : ""}" role="button" tabindex="0" data-team-member-option="${member.id}">
          <input type="checkbox" value="${member.id}" data-team-member="${member.id}" ${selectedTeamMemberIds.includes(member.id) ? "checked" : ""} />
          <span>
            <strong>${escapeHtml(member.team)} ${escapeHtml(member.name)}</strong>
            <em>${escapeHtml(member.role)}</em>
          </span>
        </div>
      `
    )
    .join("");
  document.querySelector("#teamSelectedParticipants").innerHTML =
    selectedTeamMemberIds.length === 0
      ? "<span>참여자를 선택하면 DM 또는 단톡방을 생성할 수 있습니다.</span>"
      : selectedTeamMemberIds
          .map(getChatMember)
          .filter(Boolean)
          .map((member) => `<span class="participant-chip active">${escapeHtml(member.team)} ${escapeHtml(member.name)}</span>`)
          .join("");
}

function renderTeamRoomMessages() {
  const room = getActiveTeamRoom();
  const memberIds = getRoomMemberIds(room);
  document.querySelector("#activeTeamRoomBadge").textContent = room.type === "dm" ? "DM" : "단톡방";
  document.querySelector("#activeTeamRoomTitle").textContent = room.title;
  document.querySelector("#activeTeamRoomMeta").textContent = `${memberIds.length}명 참여 · 메시지 ${room.messages.length}건 · 전송/첨부 이력 감사로그 보존`;
  document.querySelector("#activeTeamRoomParticipants").innerHTML = memberIds
    .map(getChatMember)
    .filter(Boolean)
    .map((member) => `<span class="participant-chip">${escapeHtml(member.team)} ${escapeHtml(member.name)}</span>`)
    .join("");
  document.querySelector("#teamChat").innerHTML = room.messages
    .map(renderTeamMessage)
    .join("");
}

function renderTeamMessage([sender, message, audit, time, attachments = []]) {
  const isMine = sender.includes(currentChatUser.name) || sender.includes("현재 사용자");
  return `
    <article class="team-message ${isMine ? "mine" : "theirs"}">
      <strong class="message-sender">${escapeHtml(sender)}</strong>
      <div class="message-row">
        <div class="message-bubble">
          <span>${escapeHtml(message)}</span>
          ${renderTeamAttachments(attachments)}
        </div>
        <div class="message-meta">
          <span>${escapeHtml(time || "시간 미기록")}</span>
          <span>${escapeHtml(audit)}</span>
        </div>
      </div>
    </article>
  `;
}

function renderTeamAttachments(attachments) {
  if (!attachments.length) return "";
  return `
    <div class="attachment-stack">
      ${attachments
        .map(
          (attachment) => `
            <a class="attachment-chip" href="${escapeHtml(attachment.url)}" download="${escapeHtml(attachment.name)}">
              <strong>${escapeHtml(attachment.name)}</strong>
              <span>${escapeHtml(attachment.sizeLabel)}</span>
            </a>
          `
        )
        .join("")}
    </div>
  `;
}

function getSelectedChatMembers() {
  return selectedTeamMemberIds;
}

function normalizeMemberIds(memberIds) {
  return [...memberIds].sort().join("|");
}

function findTeamRoomByParticipants(type, participantIds) {
  const targetKey = normalizeMemberIds(participantIds);
  return teamRooms.find((room) => room.type === type && normalizeMemberIds(room.participants) === targetKey);
}

function enterSelectedTeamRoom() {
  const selected = getSelectedChatMembers();
  if (selected.length === 0) {
    renderTeamMembers();
    showToast("팀원을 선택하면 기존 대화방 또는 새 채팅방으로 이동합니다.");
    return;
  }
  const type = selected.length === 1 ? "dm" : "group";
  createTeamRoom(type);
}

function enterDirectTeamMemberRoom(memberId) {
  selectedTeamMemberIds = [memberId];
  createTeamRoom("dm");
}

function getTeamRoomOpenMessage(type, title) {
  return type === "dm"
    ? `${title}님과의 DM 채팅방을 열었습니다.`
    : `${title} 단톡방을 열었습니다.`;
}

function createTeamRoom(type) {
  const selected = getSelectedChatMembers();
  if (type === "dm" && selected.length !== 1) {
    showToast("DM은 팀원 1명을 선택해야 합니다.");
    return;
  }
  if (type === "group" && selected.length < 2) {
    showToast("단톡방은 팀원 2명 이상을 선택해야 합니다.");
    return;
  }
  const existingRoom = findTeamRoomByParticipants(type, selected);
  if (existingRoom) {
    activeTeamRoomId = existingRoom.id;
    renderChats();
    showToast(`${existingRoom.title} 기존 채팅방으로 이동했습니다.`);
    return;
  }
  const title =
    type === "dm"
      ? chatMembers.find((member) => member.id === selected[0]).name
      : selected.map((memberId) => chatMembers.find((member) => member.id === memberId).name).join(", ");
  const auditId = `AUD-ROOM-${Date.now().toString().slice(-6)}`;
  const room = {
    id: `ROOM-${String(teamRooms.length + 1).padStart(3, "0")}`,
    type,
    title,
    participants: [...selected],
    messages: [[getCurrentSenderLabel(), getTeamRoomOpenMessage(type, title), auditId, formatChatTime()]]
  };
  teamRooms.unshift(room);
  activeTeamRoomId = room.id;
  auditRows.unshift([auditId, "채팅방 생성", "현재 사용자", room.title, "저장 완료", `${type === "dm" ? "DM" : "단톡방"} 참여자 ${selected.length + 1}명`]);
  auditRows.splice(20);
  renderChats();
  renderAudit();
  showToast(`${room.title} 채팅방을 생성하고 로그를 기록했습니다.`);
}

function renderMessage([role, message]) {
  return `
    <div class="message ${role}">
      <p>${message}</p>
    </div>
  `;
}

function renderEmployees(activeEmployeeId = activeHrEmployeeId) {
  const employeeRows = employees.map((employee) => {
    const record = getHrEmployeeRecord(employee);
    return [
      employee[0],
      employee[1],
      record.position,
      record.maskedBirthDate,
      employee[2],
      employee[3],
      record.employmentState,
      record.hireDate,
      record.resignDate,
      `${record.remainingLeave}일`
    ];
  });
  renderDataTable("#employeeTable", ["직원 ID", "이름", "직급", "생년월일", "고객사", "조직", "재직상태", "입사일", "퇴사일", "잔여연차"], employeeRows);
  activeHrEmployeeId = employees.some((employee) => employee[0] === activeEmployeeId) ? activeEmployeeId : employees[0][0];
  renderEmployeeDetail(activeHrEmployeeId);
  renderHrLeaveManagement();
}

function renderEmployeeDetail(employeeId) {
  const employee = employees.find((item) => item[0] === employeeId) || employees[0];
  const record = getHrEmployeeRecord(employee);
  document.querySelector("#employeeDetail").innerHTML = `
    <div class="detail-header">
      <span class="status-pill">PII Protected</span>
      <h2>${employee[1]}</h2>
      <p>${employee[0]} · ${employee[2]} · ${employee[3]} · ${record.position}</p>
    </div>
    <div class="detail-grid">
      <div><span>신상명세</span><strong>${record.maskedName}</strong></div>
      <div><span>생년월일</span><strong>${record.maskedBirthDate}</strong></div>
      <div><span>입사일</span><strong>${record.hireDate}</strong></div>
      <div><span>퇴사일</span><strong>${record.resignDate}</strong></div>
      <div><span>재직 상태</span><strong>${record.employmentState}</strong></div>
      <div><span>결재권한</span><strong>${employee[6]}</strong></div>
      <div><span>권한 회수</span><strong>${employee[7]}</strong></div>
      <div><span>자동연차</span><strong>${record.annualLeave}일</strong></div>
      <div><span>사용/잔여</span><strong>${record.usedLeave}일 / ${record.remainingLeave}일</strong></div>
      <div><span>감사로그</span><strong>AUD-HR-${employee[0].split("-")[1]}</strong></div>
    </div>
    <div class="notice">신상명세 및 민감정보 항목, 보존기간, 퇴사자 데이터 처리범위는 PM 승인 필요입니다.</div>
  `;
}

function getEmployeeIndex(employee) {
  return Math.max(0, Number(String(employee[0]).split("-")[1]) - 1);
}

function getHrEmployeeRecord(employee) {
  const index = getEmployeeIndex(employee);
  const profile = employeeProfiles.find((item) => item.id === employee[0]);
  const hireDate = employee[5];
  const employmentState = employee[4];
  const resignDate = profile?.terminationDate || "-";
  const birthDate = profile?.birthDate || `19${String(76 + (index % 22)).padStart(2, "0")}-${String((index % 12) + 1).padStart(2, "0")}-${String((index % 27) + 1).padStart(2, "0")}`;
  const annualLeave = calculateAnnualLeave(hireDate, employmentState);
  const usedLeave = Math.min(annualLeave, hrLeaveUsage[employee[0]] ?? profile?.leaveUsed ?? 0);
  const pendingLeave = employmentState === "재직" ? profile?.leavePending || 0 : 0;
  return {
    id: employee[0],
    name: employee[1],
    maskedName: maskName(employee[1]),
    customer: employee[2],
    team: employee[3],
    position: profile?.rank || positions[index % positions.length],
    birthDate,
    maskedBirthDate: maskBirthDate(birthDate),
    hireDate,
    resignDate,
    employmentState,
    annualLeave,
    usedLeave,
    pendingLeave,
    remainingLeave: Math.max(0, annualLeave - usedLeave - pendingLeave)
  };
}

function calculateAnnualLeave(hireDate, employmentState) {
  if (["퇴사", "휴직", "병가"].includes(employmentState)) return 0;
  const start = new Date(`${hireDate}T00:00:00+09:00`);
  const months = Math.max(0, (TODAY.getFullYear() - start.getFullYear()) * 12 + TODAY.getMonth() - start.getMonth());
  if (months < 12) return Math.min(11, months);
  const years = Math.floor(months / 12);
  return Math.min(25, 15 + Math.floor((years - 1) / 2));
}

function maskName(name) {
  return name.length < 2 ? `${name}*` : `${name[0]}*${name.slice(2)}`;
}

function maskBirthDate(birthDate) {
  return birthDate.replace(/(\d{4})-(\d{2})-(\d{2})/, "$1-**-**");
}

function getHrEmployeeRecords() {
  return employees.map(getHrEmployeeRecord);
}

function renderHrLeaveManagement() {
  const records = getHrEmployeeRecords();
  const active = records.find((record) => record.id === activeHrEmployeeId) || records[0];
  activeHrEmployeeId = active.id;
  const summary = [
    ["테스트 임직원", `${records.length}명`, "더미 데이터 전체"],
    ["재직", `${records.filter((record) => record.employmentState === "재직").length}명`, "연차 자동계산 대상"],
    ["휴직/병가", `${records.filter((record) => ["휴직", "병가"].includes(record.employmentState)).length}명`, "연차 사용 제한 안내"],
    ["잔여연차 합계", `${records.reduce((sum, record) => sum + record.remainingLeave, 0)}일`, "문의 대응 기준"]
  ];
  document.querySelector("#hrLeaveSummary").innerHTML = summary
    .map(
      ([label, value, help]) => `
        <div class="hr-summary-card">
          <span>${label}</span>
          <strong>${value}</strong>
          <em>${help}</em>
        </div>
      `
    )
    .join("");
  document.querySelector("#hrLeaveTable").innerHTML = `
    <table>
      <thead>
        <tr>
          <th>직원 ID</th>
          <th>이름</th>
          <th>직급</th>
          <th>생년월일</th>
          <th>입사일</th>
          <th>퇴사일</th>
          <th>재직상태</th>
          <th>자동연차</th>
          <th>사용/잔여</th>
          <th>연차 신청</th>
        </tr>
      </thead>
      <tbody>
        ${records
          .map(
            (record) => `
              <tr class="${record.id === active.id ? "selected-row" : ""}" data-hr-employee="${record.id}">
                <td>${record.id}</td>
                <td>${record.maskedName}</td>
                <td>${record.position}</td>
                <td>${record.maskedBirthDate}</td>
                <td>${record.hireDate}</td>
                <td>${record.resignDate}</td>
                <td><span class="status-pill ${record.employmentState === "재직" ? "active" : ""}">${record.employmentState}</span></td>
                <td>${record.annualLeave}일</td>
                <td>${record.usedLeave}일 / ${record.remainingLeave}일</td>
                <td><button class="secondary-button compact-button" type="button" data-leave-request="${record.id}">연차 신청</button></td>
              </tr>
            `
          )
          .join("")}
      </tbody>
    </table>
  `;
  renderHrLeaveDetail(active.id);
}

function renderHrLeaveDetail(employeeId) {
  const record = getHrEmployeeRecords().find((item) => item.id === employeeId) || getHrEmployeeRecords()[0];
  activeHrEmployeeId = record.id;
  const recentRequests = hrLeaveRequests.filter((request) => request.employeeId === record.id).slice(-3);
  document.querySelector("#hrLeaveDetail").innerHTML = `
    <div class="detail-header">
      <span class="status-pill">PII Masked</span>
      <h2>${record.maskedName}</h2>
      <p>${record.id} · ${record.team} · ${record.position}</p>
    </div>
    <div class="detail-grid">
      <div><span>이름</span><strong>${record.maskedName}</strong></div>
      <div><span>생년월일</span><strong>${record.maskedBirthDate}</strong></div>
      <div><span>입사일</span><strong>${record.hireDate}</strong></div>
      <div><span>퇴사일</span><strong>${record.resignDate}</strong></div>
      <div><span>재직상태</span><strong>${record.employmentState}</strong></div>
      <div><span>연차 자동계산</span><strong>${record.annualLeave}일</strong></div>
      <div><span>사용 연차</span><strong>${record.usedLeave}일</strong></div>
      <div><span>승인대기</span><strong>${record.pendingLeave}일</strong></div>
      <div><span>잔여 연차</span><strong>${record.remainingLeave}일</strong></div>
    </div>
    <div class="approval-actions">
      <button class="primary-button" type="button" data-leave-request="${record.id}">연차 신청</button>
    </div>
    <div class="notice">신상명세 원문과 생년월일 전체값은 권한과 열람 사유가 있어야 확인 가능합니다. 연차 계산식과 휴직/병가 처리 기준은 PM 승인 필요입니다.</div>
    <form class="inline-edit-form" data-hr-edit-form="${record.id}">
      <div class="settings-modal-section-title">
        <strong>현재 화면 수정</strong>
        <span>목록을 보면서 저장하면 즉시 반영됩니다.</span>
      </div>
      <div class="settings-field-grid">
        <label class="settings-field">
          <span>이름</span>
          <input type="text" value="${record.name}" data-hr-edit-field="name" />
          <em>저장 후 목록과 상세가 함께 갱신됩니다.</em>
        </label>
        <label class="settings-field">
          <span>직급</span>
          <select data-hr-edit-field="rank">
            ${employeeRanks.map((rank) => `<option ${rank === record.position ? "selected" : ""}>${rank}</option>`).join("")}
          </select>
          <em>직급 기준 필터와 인사 현황에 사용됩니다.</em>
        </label>
        <label class="settings-field">
          <span>생년월일</span>
          <input type="date" value="${record.birthDate}" data-hr-edit-field="birthDate" />
          <em>목록에는 마스킹 값만 표시됩니다.</em>
        </label>
        <label class="settings-field">
          <span>입사일</span>
          <input type="date" value="${record.hireDate}" data-hr-edit-field="hireDate" />
          <em>연차 자동계산 기준입니다.</em>
        </label>
        <label class="settings-field">
          <span>퇴사일</span>
          <input type="date" value="${record.resignDate === "-" ? "" : record.resignDate}" data-hr-edit-field="terminationDate" />
          <em>퇴사 상태일 때만 필수 후보입니다.</em>
        </label>
        <label class="settings-field">
          <span>재직상태</span>
          <select data-hr-edit-field="employmentState">
            ${["재직", "퇴사", "휴직", "병가"].map((status) => `<option ${status === record.employmentState ? "selected" : ""}>${status}</option>`).join("")}
          </select>
          <em>상태 변경은 감사로그에 남습니다.</em>
        </label>
        <label class="settings-field">
          <span>사용 연차</span>
          <input type="number" min="0" value="${record.usedLeave}" data-hr-edit-field="leaveUsed" />
          <em>승인 완료 연차 기준입니다.</em>
        </label>
        <label class="settings-field">
          <span>승인대기 연차</span>
          <input type="number" min="0" value="${record.pendingLeave}" data-hr-edit-field="leavePending" />
          <em>상신 후 결재 전 연차입니다.</em>
        </label>
      </div>
      <div class="inline-edit-actions">
        <button class="primary-button" type="button" data-hr-edit-save="${record.id}">수정 저장</button>
        <button class="secondary-button" type="button" data-hr-edit-cancel="${record.id}">취소</button>
      </div>
    </form>
    <div class="hr-request-list">
      ${recentRequests.length ? recentRequests.map(renderLeaveRequestItem).join("") : "<span>최근 연차 신청 없음</span>"}
    </div>
  `;
}

function saveHrInlineEdit(employeeId) {
  const employee = employees.find((item) => item[0] === employeeId);
  const profile = employeeProfiles.find((item) => item.id === employeeId);
  const form = document.querySelector(`[data-hr-edit-form="${employeeId}"]`);
  if (!employee || !profile || !form) return;
  const readField = (field) => form.querySelector(`[data-hr-edit-field="${field}"]`)?.value.trim() || "";
  const before = getHrEmployeeRecord(employee);
  const nextName = readField("name");
  const nextBirthDate = readField("birthDate");
  const nextHireDate = readField("hireDate");
  const nextStatus = readField("employmentState");
  const nextTerminationDate = readField("terminationDate");
  if (!nextName || !nextBirthDate || !nextHireDate) {
    showToast("이름, 생년월일, 입사일은 필수입니다.");
    return;
  }
  if (nextStatus === "퇴사" && !nextTerminationDate) {
    showToast("퇴사 상태는 퇴사일을 입력해야 합니다.");
    return;
  }
  employee[1] = nextName;
  employee[4] = nextStatus;
  employee[5] = nextHireDate;
  employee[7] = nextStatus === "퇴사" ? "권한 회수 완료" : employee[7] === "권한 회수 완료" ? "정상" : employee[7];
  profile.rank = readField("rank") || profile.rank;
  profile.birthDate = nextBirthDate;
  profile.maskedBirthDate = `${nextBirthDate.slice(0, 4)}-**-**`;
  profile.hireDate = nextHireDate;
  profile.terminationDate = nextStatus === "퇴사" ? nextTerminationDate : "";
  profile.leaveUsed = Math.max(0, Number(readField("leaveUsed")) || 0);
  profile.leavePending = nextStatus === "재직" ? Math.max(0, Number(readField("leavePending")) || 0) : 0;
  hrLeaveUsage[employeeId] = profile.leaveUsed;
  const after = getHrEmployeeRecord(employee);
  const auditId = `AUD-HR-${Date.now().toString().slice(-6)}`;
  auditRows.unshift([
    auditId,
    "임직원 현재 화면 수정",
    currentProfitCostUser.name,
    employeeId,
    "저장 완료",
    `${before.name}/${before.employmentState}/${before.remainingLeave}일 -> ${after.name}/${after.employmentState}/${after.remainingLeave}일`
  ]);
  auditRows.splice(20);
  activeHrEmployeeId = employeeId;
  renderEmployees(employeeId);
  renderAudit();
  showToast(`${after.maskedName} 정보를 현재 화면에서 저장했습니다.`);
}

function renderLeaveRequestItem(request) {
  const actionButtons =
    request.status === "승인대기"
      ? `
        <span class="hr-request-actions">
          <button class="secondary-button compact-button" type="button" data-leave-decision="승인완료" data-leave-request-id="${request.id}">승인</button>
          <button class="secondary-button compact-button" type="button" data-leave-decision="반려" data-leave-request-id="${request.id}">반려</button>
        </span>
      `
      : "";
  return `
    <span class="hr-request-item">
      <span>${request.auditId} · ${request.days}일 신청 · ${request.status}</span>
      ${actionButtons}
    </span>
  `;
}

function requestAnnualLeave(employeeId) {
  const record = getHrEmployeeRecords().find((item) => item.id === employeeId);
  if (!record) return;
  if (record.remainingLeave <= 0 || record.employmentState !== "재직") {
    showToast("재직 상태와 잔여연차가 있어야 연차를 신청할 수 있습니다.");
    return;
  }
  const auditId = `AUD-LEAVE-${Date.now().toString().slice(-6)}`;
  const profile = employeeProfiles.find((item) => item.id === record.id);
  if (profile) profile.leavePending += 1;
  hrLeaveRequests.push({ id: `LR-${String(hrLeaveRequests.length + 1).padStart(3, "0")}`, employeeId: record.id, days: 1, status: "승인대기", auditId });
  auditRows.unshift([auditId, "연차 신청", currentProfitCostUser.name, record.id, "승인대기", "개인정보 마스킹 · 승인대기 연차 반영"]);
  auditRows.splice(20);
  activeHrEmployeeId = record.id;
  renderHrLeaveManagement();
  renderAudit();
  showToast(`${record.maskedName} 연차 1일 신청을 승인대기로 기록했습니다.`);
}

function decideAnnualLeaveRequest(requestId, nextStatus) {
  const request = hrLeaveRequests.find((item) => item.id === requestId);
  if (!request || request.status !== "승인대기") return;
  const employee = employees.find((item) => item[0] === request.employeeId);
  const profile = employeeProfiles.find((item) => item.id === request.employeeId);
  if (profile) profile.leavePending = Math.max(0, profile.leavePending - request.days);
  if (nextStatus === "승인완료") hrLeaveUsage[request.employeeId] = (hrLeaveUsage[request.employeeId] || 0) + request.days;
  request.status = nextStatus;
  const record = employee ? getHrEmployeeRecord(employee) : null;
  const auditId = `AUD-LEAVE-${Date.now().toString().slice(-6)}`;
  auditRows.unshift([auditId, "연차 결재", currentProfitCostUser.name, request.employeeId, nextStatus, `${request.id} · ${request.days}일 · 잔여연차 재계산`]);
  auditRows.splice(20);
  activeHrEmployeeId = request.employeeId;
  renderHrLeaveManagement();
  renderAudit();
  showToast(`${record?.maskedName || request.employeeId} 연차 신청을 ${nextStatus} 처리했습니다.`);
}

function renderAudit() {
  const filteredRows =
    auditFilter === "all"
      ? auditRows
      : auditRows.filter((row) => row.join(" ").includes(auditFilter));
  renderDataTable("#auditTable", ["로그 ID", "이벤트", "행위자", "대상", "상태", "통제"], filteredRows);
}

function renderApprovalLines() {
  renderDataTable("#approvalLineTable", ["결재 유형", "요청자", "승인자", "처리 메뉴"], approvalLines);
}

function renderApprovalManagement(activeId = approvalDocuments[0]?.id) {
  const statusCounts = ["승인대기", "승인완료", "반려", "보류"].map((status) => [status, approvalDocuments.filter((doc) => doc.status === status).length]);
  document.querySelector("#approvalSummary").innerHTML = `
    ${statusCounts.map(([status, count]) => `<div><span>${status}</span><strong>${count}건</strong></div>`).join("")}
    <div><span>처리 기준</span><strong>승인/반려/보류 즉시 로그</strong></div>
  `;
  document.querySelector("#approvalRequestTable").innerHTML = `
    <table>
      <thead>
        <tr>
          <th>문건 ID</th>
          <th>제목</th>
          <th>요청자</th>
          <th>처리 메뉴</th>
          <th>상태</th>
          <th>현재 결재자</th>
          <th>다음 결재자</th>
        </tr>
      </thead>
      <tbody>
        ${approvalDocuments
          .map(
            (doc) => `
              <tr class="${doc.id === activeId ? "selected-row" : ""}" data-approval-document="${doc.id}">
                <td>${doc.id}</td>
                <td>${escapeHtml(doc.title)}</td>
                <td>${escapeHtml(doc.requester)}</td>
                <td>${escapeHtml(doc.menu)}</td>
                <td><span class="status-pill ${doc.status === "승인완료" ? "active" : ""}">${doc.status}</span></td>
                <td>${escapeHtml(doc.approver)}</td>
                <td>${escapeHtml(doc.nextApprover)}</td>
              </tr>
            `
          )
          .join("")}
      </tbody>
    </table>
  `;
  renderApprovalDetail(activeId);
}

function renderApprovalDetail(activeId) {
  const doc = approvalDocuments.find((item) => item.id === activeId) || approvalDocuments[0];
  if (!doc) return;
  document.querySelector("#approvalDetail").innerHTML = `
    <div class="panel-header compact">
      <div>
        <span class="status-pill">${doc.status}</span>
        <h2>${escapeHtml(doc.title)}</h2>
        <p>${doc.id} · ${escapeHtml(doc.menu)} · 상신자 ${escapeHtml(doc.requester)}</p>
      </div>
    </div>
    <div class="detail-grid">
      <div><span>현재 결재자</span><strong>${escapeHtml(doc.approver)}</strong></div>
      <div><span>다음 결재자</span><strong>${escapeHtml(doc.nextApprover)}</strong></div>
      <div><span>최종 결재권자</span><strong>${escapeHtml(doc.finalApprover)}</strong></div>
      <div><span>처리 금액</span><strong>${doc.amount ? formatWon(doc.amount) : "금액 없음"}</strong></div>
      <div><span>상신/반려/보류 사유</span><strong>${escapeHtml(doc.reason)}</strong></div>
      <div><span>다음 상태</span><strong>승인완료 / 반려 / 보류</strong></div>
    </div>
    <div class="approval-actions">
      <button class="primary-button" type="button" data-approval-action="승인완료" data-approval-id="${doc.id}">승인</button>
      <button class="secondary-button" type="button" data-approval-action="반려" data-approval-id="${doc.id}">반려</button>
      <button class="secondary-button" type="button" data-approval-action="보류" data-approval-id="${doc.id}">보류</button>
    </div>
    <div class="notice">결재 처리 시 상태, 결재자, 대상 메뉴, 사유가 감사로그에 남습니다.</div>
  `;
}

function processApprovalDocument(docId, nextStatus) {
  const doc = approvalDocuments.find((item) => item.id === docId);
  if (!doc) return;
  doc.status = nextStatus;
  const auditId = `AUD-APR-${Date.now().toString().slice(-6)}`;
  auditRows.unshift([auditId, "결재 처리", currentProfitCostUser.name, doc.title, nextStatus, `${doc.menu} · ${doc.reason}`]);
  auditRows.splice(20);
  renderApprovalManagement(doc.id);
  renderAudit();
  showToast(`${doc.title} 문건을 ${nextStatus} 상태로 처리했습니다.`);
}

function renderSettingsHub() {
  document.querySelector("#settingsHub").innerHTML = settingsHub
    .map(
      ({ menu, scope, owner }, index) => `
        <button class="settings-hub-item ${index === activeSettingsIndex ? "active" : ""}" type="button" data-settings-index="${index}">
          <strong>${menu}</strong>
          <p>${scope}</p>
          <span>${owner}</span>
        </button>
      `
    )
    .join("");
  renderSettingsHubDetail();
}

function renderSettingsHubDetail() {
  const item = settingsHub[activeSettingsIndex];
  document.querySelector("#settingsHubDetail").innerHTML = `
    <div>
      <span class="status-pill">활성 설정</span>
      <h3>${item.menu}</h3>
      <p>${item.scope}</p>
    </div>
    <ul>
      ${item.controls.map((control) => `<li>${control}</li>`).join("")}
    </ul>
    <strong>${item.owner}</strong>
    <button class="primary-button" type="button" data-settings-open="${activeSettingsIndex}">설정 패널 열기</button>
  `;
}

function openSettingsModal(index) {
  activeSettingsIndex = index;
  renderSettingsHub();
  renderSettingsModal();
  document.querySelector("#settingsModal").classList.add("active");
  document.querySelector("#settingsModal").setAttribute("aria-hidden", "false");
}

function closeSettingsModal() {
  document.querySelector("#settingsModal").classList.remove("active");
  document.querySelector("#settingsModal").setAttribute("aria-hidden", "true");
}

function renderSettingsModal() {
  syncProfitCostSettingsFields();
  const item = settingsHub[activeSettingsIndex];
  document.querySelector("#settingsModalBadge").textContent = item.badge;
  document.querySelector("#settingsModalTitle").textContent = `${item.menu} 설정`;
  document.querySelector("#settingsModalDescription").textContent = item.scope;
  document.querySelector("#settingsModalNotice").textContent = item.audit;
  document.querySelector("#settingsModalForm").innerHTML = `
    <section class="settings-modal-section">
      <div class="settings-modal-section-title">
        <strong>설정 가능한 필드</strong>
        <span class="status-pill active">선택 항목 활성</span>
      </div>
      <div class="settings-field-grid">
        ${item.fields.map(([label, type, value, help], index) => renderSettingsField(label, type, value, help, index)).join("")}
      </div>
    </section>
    <section class="settings-modal-section">
      <div class="settings-modal-section-title">
        <strong>토글</strong>
        <span>켜짐 상태는 저장 대상입니다.</span>
      </div>
      <div class="settings-toggle-grid">
        ${item.toggles.map((toggle, index) => `
          <label class="settings-toggle active">
            <input type="checkbox" checked data-setting-toggle="${index}" />
            <span>${toggle}</span>
          </label>
        `).join("")}
      </div>
    </section>
    <section class="settings-modal-section">
      <div class="settings-modal-section-title">
        <strong>수정 권한</strong>
        <span>권한 없는 사용자는 메뉴 숨김 또는 차단 사유 표시</span>
      </div>
      <div class="permission-chip-row">
        ${item.permissions.map((permission) => `<span class="permission-chip active">${permission}</span>`).join("")}
      </div>
    </section>
  `;
}

function syncProfitCostSettingsFields() {
  const financeSetting = settingsHub[0];
  financeSetting.fields[0][2] = String(profitCostSettings.productCostRate * 100);
  financeSetting.fields[1][2] = String(profitCostSettings.sellingAdminRate * 100);
  financeSetting.fields[2][2] = String(profitCostSettings.generalAdminRate * 100);
  financeSetting.fields[3][2] = profitCostSettings.formulaVersion;
}

function renderSettingsField(label, type, value, help, index) {
  if (type === "select") {
    const options = [value, "권한 검토 필요", "PM 승인 필요", "비활성"];
    return `
      <label class="settings-field">
        <span>${label}</span>
        <select data-setting-field="${index}">
          ${options.map((option) => `<option ${option === value ? "selected" : ""}>${option}</option>`).join("")}
        </select>
        <em>${help}</em>
      </label>
    `;
  }
  return `
    <label class="settings-field">
      <span>${label}</span>
      <input type="${type}" value="${value}" data-setting-field="${index}" />
      <em>${help}</em>
    </label>
  `;
}

function saveSettingsModal() {
  const item = settingsHub[activeSettingsIndex];
  const auditId = padId("AUD", auditRows.length + 1);
  if (activeSettingsIndex === 0 && !profitCostSettings.authorizedRoles.includes(currentProfitCostUser.role)) {
    auditRows.unshift([
      auditId,
      "수익성 기준 저장 차단",
      currentProfitCostUser.name,
      item.menu,
      "권한 없음",
      `필요 권한 ${profitCostSettings.authorizedRoles.join(", ")}`
    ]);
    auditRows.splice(20);
    renderAudit();
    closeSettingsModal();
    showToast("수익성 기준은 Master 또는 ProfitCostInputManager만 변경할 수 있습니다.");
    return;
  }
  if (activeSettingsIndex === 0) saveProfitCostSettingsFromModal();
  auditRows.unshift([
    auditId,
    "메뉴별 설정 저장",
    currentProfitCostUser.name,
    item.menu,
    "저장 완료",
    "변경 전후 값 · 권한 · 감사로그 안내 확인"
  ]);
  auditRows.splice(20);
  renderAudit();
  renderDashboard();
  renderSettingsHub();
  closeSettingsModal();
  showToast(`${item.menu} 설정을 저장하고 감사로그에 기록했습니다.`);
}

function saveProfitCostSettingsFromModal() {
  const fields = Array.from(document.querySelectorAll("[data-setting-field]")).map((field) => field.value);
  profitCostSettings.productCostRate = Math.max(0, parseNumberRate(fields[0]));
  profitCostSettings.sellingAdminRate = Math.max(0, parseNumberRate(fields[1]));
  profitCostSettings.generalAdminRate = Math.max(0, parseNumberRate(fields[2]));
  profitCostSettings.formulaVersion = fields[3] || profitCostSettings.formulaVersion;
  syncProfitCostSettingsFields();
}

function parseNumberRate(value) {
  return (Number(String(value).replace(/[^\d.]/g, "")) || 0) / 100;
}

function renderDataTable(selector, headers, rows) {
  const commandByTable = {
    "#productTable": "productRow",
    "#employeeTable": "employeeRow",
    "#auditTable": "auditRow",
    "#approvalLineTable": "approval"
  };
  const rowCommand = commandByTable[selector] || "tableRow";
  document.querySelector(selector).innerHTML = `
    <table>
      <thead>
        <tr>${headers.map((header) => `<th>${header}</th>`).join("")}</tr>
      </thead>
      <tbody>
        ${rows
          .map(
            (row) => `
              <tr data-command="${rowCommand}" data-command-label="${row[0]}">
                ${row.map((cell) => `<td>${cell}</td>`).join("")}
              </tr>
            `
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function renderActionList(selector, items) {
  document.querySelector(selector).innerHTML = items
    .map(
      ([title, text, tone]) => `
        <button class="action-item ${tone || ""}" type="button" data-command="action" data-command-label="${title}">
          <strong>${title}</strong>
          <span>${text}</span>
        </button>
      `
    )
    .join("");
}

function showView(viewId) {
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.view === viewId);
  });
  document.querySelectorAll(".view").forEach((view) => view.classList.remove("active"));
  document.querySelector(`#${viewId}View`).classList.add("active");
  const nav = navItems.find(([id]) => id === viewId);
  document.querySelector("#pageTitle").textContent = nav ? nav[1] : "ETBS OS";
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2200);
}

function openCommandPanel(command, label = "") {
  const template = commandTemplates[command] || ["작업 실행", "선택한 작업을 실행했습니다.", "테스트 데이터 기준으로 실행 결과를 표시합니다."];
  const auditId = `AUD-ACT-${Date.now().toString().slice(-6)}`;
  const title = label && label !== template[0] ? `${template[0]} · ${label}` : template[0];
  activeCommand = command;
  activeAuditId = auditId;
  document.querySelector("#commandBadge").textContent = auditId;
  document.querySelector("#commandTitle").textContent = title;
  document.querySelector("#commandDescription").textContent = template[1];
  document.querySelector("#commandMeta").innerHTML = formConfigs[command]
    ? `
      <div><span>대상</span><strong>${label || "ETBS OS"}</strong></div>
      <div><span>처리 방식</span><strong>입력 후 저장</strong></div>
      <div><span>승인 상태</span><strong>필요 시 PM 승인 필요</strong></div>
    `
    : `
      <div><span>대상</span><strong>${label || "ETBS OS"}</strong></div>
      <div><span>안내</span><strong>상세 로그는 설정 메뉴에서 확인</strong></div>
    `;
  renderCommandForm(command);
  document.querySelector("#commandNotice").textContent = template[2];
  document.querySelector("#commandPanel").classList.add("active");
  if (formConfigs[command]) {
    auditRows.unshift([auditId, template[0], "현재 사용자", label || "ETBS OS", "요청 생성", "저장 시 확정"]);
    auditRows.splice(20);
    renderAudit();
  }
  showToast(`${template[0]} 실행 결과를 표시했습니다.`);
}

function closeCommandPanel() {
  document.querySelector("#commandPanel").classList.remove("active");
}

function renderCommandForm(command) {
  const fields = formConfigs[command] || [];
  const form = document.querySelector("#commandForm");
  const saveButton = document.querySelector("#commandSave");
  const cancelButton = document.querySelector("#commandCancel");

  form.innerHTML = fields
    .map(
      ([name, label, type, placeholder, defaultValue]) => `
        <label>
          <span>${label}</span>
          <input name="${name}" type="${type}" placeholder="${placeholder}" value="${defaultValue || ""}" />
        </label>
      `
    )
    .join("");

  const hasForm = fields.length > 0;
  form.classList.toggle("hidden", !hasForm);
  saveButton.classList.toggle("hidden", !hasForm);
  cancelButton.textContent = hasForm ? "취소" : "닫기";
}

function getFormValues() {
  return Object.fromEntries(new FormData(document.querySelector("#commandForm")).entries());
}

function saveCommandForm() {
  if (!formConfigs[activeCommand]) {
    closeCommandPanel();
    return;
  }

  const values = getFormValues();
  if (Object.values(values).some((value) => !String(value).trim())) {
    showToast("필수 항목을 모두 입력해야 저장할 수 있습니다.");
    return;
  }

  if (activeCommand === "customer-create") saveCustomer(values);
  if (activeCommand === "product-approval") saveProduct(values);
  if (activeCommand === "pipeline-create") savePipeline(values);
  if (activeCommand === "employee-create") saveEmployee(values);

  auditRows.unshift([activeAuditId, "등록 저장", "현재 사용자", Object.values(values)[0], "저장 완료", "로컬 샘플 데이터"]);
  auditRows.splice(20);
  renderAudit();
  document.querySelector("#commandDescription").textContent = "입력 항목을 저장하고 관련 목록을 갱신했습니다.";
  document.querySelector("#commandNotice").textContent = "저장 완료: 실제 운영 반영 전 승인/권한/감사 정책 연결이 필요합니다.";
  showToast("입력 항목을 저장했습니다.");
}

function saveCustomer(values) {
  customers.unshift({
    id: padId("CUS", customers.length + 1),
    name: values.customerName,
    tenant: "client_company",
    contract: values.contract,
    manager: values.manager,
    margin: values.margin,
    issue: values.issue,
    address: values.address,
    phone: values.phone,
    contactPerson: values.contactPerson,
    email: values.email,
    status: "정상",
    employeeCount: 0,
    productCount: 0
  });
  renderDashboard();
  renderCustomers();
}

function saveProduct(values) {
  products.unshift([
    values.productName,
    values.supplier,
    values.customerName,
    "승인대기",
    values.margin,
    "승인 요청",
    Math.max(0, Number(values.stock) || 0),
    activeAuditId
  ]);
  renderDashboard();
  renderProducts();
  renderLogistics();
}

function savePipeline(values) {
  const targetStage = pipeline.find(([stage]) => stage === values.stage) || pipeline[0];
  targetStage[3].unshift(values.opportunityName);
  targetStage[1] = `${targetStage[3].length}건`;
  targetStage[2] = values.amount;
  renderPipeline();
}

function saveEmployee(values) {
  const newEmployeeId = padId("EMP", employees.length + 1);
  employees.unshift([
    newEmployeeId,
    values.employeeName,
    values.customerName,
    values.team,
    "재직",
    values.startDate,
    values.approvalRole,
    "정상"
  ]);
  employeeProfiles.unshift({
    id: newEmployeeId,
    rank: "사원",
    birthDate: "1990-01-01",
    maskedBirthDate: "1990-**-**",
    hireDate: values.startDate,
    terminationDate: "",
    leaveUsed: 0,
    leavePending: 0
  });
  hrLeaveUsage[newEmployeeId] = 0;
  renderDashboard();
  activeHrEmployeeId = newEmployeeId;
  renderEmployees(newEmployeeId);
}

function handleTeamAttachment(files) {
  const attachmentFiles = Array.from(files || []);
  if (!attachmentFiles.length) return;
  const totalBytes = attachmentFiles.reduce((sum, file) => sum + file.size, 0);
  const room = getActiveTeamRoom();
  const auditId = `AUD-FILE-${Date.now().toString().slice(-6)}`;
  if (totalBytes > MAX_TEAM_ATTACHMENT_BYTES) {
    auditRows.unshift([auditId, "채팅 파일 첨부 차단", "현재 사용자", room.title, "20MB 초과", `요청 용량 ${formatFileSize(totalBytes)} · 최대 20MB`]);
    auditRows.splice(20);
    renderAudit();
    showToast(`첨부 용량은 한 번에 최대 20MB입니다. 현재 ${formatFileSize(totalBytes)}입니다.`);
    return;
  }
  const attachments = attachmentFiles.map((file) => ({
    name: file.name,
    sizeLabel: formatFileSize(file.size),
    url: URL.createObjectURL(file)
  }));
  const fileSummary = attachments.map((file) => `${file.name} (${file.sizeLabel})`).join(", ");
  room.messages.push([getCurrentSenderLabel(), `파일 첨부 ${attachments.length}건`, auditId, formatChatTime(), attachments]);
  auditRows.unshift([auditId, "채팅 파일 첨부", "현재 사용자", room.title, "첨부 기록", `${fileSummary} · 마스킹/다운로드 권한/보존기간 확인 필요`]);
  auditRows.splice(20);
  renderChats();
  renderAudit();
  showToast(`${room.title}에 파일 ${attachments.length}건을 첨부했습니다.`);
}

function setTeamDropState(isActive) {
  document.querySelector("#teamDropZone")?.classList.toggle("active", isActive);
  document.querySelector("#teamPopup")?.classList.toggle("drag-active", isActive);
}

function sendTeamMessage() {
  const input = document.querySelector("#teamMessage");
  if (!input.value.trim()) return;
  const room = getActiveTeamRoom();
  const auditId = `AUD-CHAT-${Date.now().toString().slice(-6)}`;
  room.messages.push([getCurrentSenderLabel(), input.value.trim(), auditId, formatChatTime()]);
  auditRows.unshift([auditId, "채팅 메시지 전송", "현재 사용자", room.title, "전송 완료", "채팅 로그 보존"]);
  auditRows.splice(20);
  input.value = "";
  renderChats();
  renderAudit();
  showToast(`${room.title} 메시지를 전송하고 채팅 로그를 기록했습니다.`);
}

document.addEventListener("click", (event) => {
  const navItem = event.target.closest(".nav-item");
  if (navItem) showView(navItem.dataset.view);

  const customerRow = event.target.closest("[data-customer]");
  if (customerRow) {
    document.querySelectorAll("[data-customer]").forEach((item) => item.classList.remove("selected"));
    customerRow.classList.add("selected");
    renderCustomerDetail(customerRow.dataset.customer);
  }

  if (event.target.closest("#refreshButton")) showToast("ETBS OS 화면 데이터를 새로고침했습니다.");
  if (event.target.closest("#openFinanceSettings")) openSettingsModal(0);
  if (event.target.closest("#saveProductFinanceBasis")) saveProductFinanceBasis();
  if (event.target.closest("#saveSalesTargets")) saveSalesTargets();
  if (event.target.closest("#saveProductInventory")) saveProductInventory();

  const completeSaleButton = event.target.closest("[data-complete-sale]");
  if (completeSaleButton) completeProductSale(Number(completeSaleButton.dataset.completeSale));

  const approvalDocumentRow = event.target.closest("[data-approval-document]");
  if (approvalDocumentRow) renderApprovalManagement(approvalDocumentRow.dataset.approvalDocument);

  const approvalAction = event.target.closest("[data-approval-action]");
  if (approvalAction) processApprovalDocument(approvalAction.dataset.approvalId, approvalAction.dataset.approvalAction);

  const leaveRequestButton = event.target.closest("[data-leave-request]");
  if (leaveRequestButton) {
    requestAnnualLeave(leaveRequestButton.dataset.leaveRequest);
    return;
  }

  const leaveDecisionButton = event.target.closest("[data-leave-decision]");
  if (leaveDecisionButton) {
    decideAnnualLeaveRequest(leaveDecisionButton.dataset.leaveRequestId, leaveDecisionButton.dataset.leaveDecision);
    return;
  }

  const hrEditSaveButton = event.target.closest("[data-hr-edit-save]");
  if (hrEditSaveButton) {
    saveHrInlineEdit(hrEditSaveButton.dataset.hrEditSave);
    return;
  }

  const hrEditCancelButton = event.target.closest("[data-hr-edit-cancel]");
  if (hrEditCancelButton) {
    renderHrLeaveDetail(hrEditCancelButton.dataset.hrEditCancel);
    showToast("현재 화면 수정 내용을 취소했습니다.");
    return;
  }

  const hrEmployeeRow = event.target.closest("[data-hr-employee]");
  if (hrEmployeeRow && !event.target.closest("[data-leave-request]")) {
    activeHrEmployeeId = hrEmployeeRow.dataset.hrEmployee;
    renderHrLeaveManagement();
    renderEmployeeDetail(activeHrEmployeeId);
    showToast(`${activeHrEmployeeId} 임직원 상세와 연차 현황을 열었습니다.`);
    return;
  }

  const employeeTableRow = event.target.closest("#employeeTable [data-command='employeeRow']");
  if (employeeTableRow) {
    const employeeId = employeeTableRow.dataset.commandLabel;
    activeHrEmployeeId = employeeId;
    renderEmployeeDetail(employeeId);
    renderHrLeaveManagement();
    showToast(`${employeeId} 임직원 상세와 연차 현황을 열었습니다.`);
    return;
  }

  const memberOption = event.target.closest("[data-team-member-option]");
  if (memberOption && !event.target.closest("[data-team-member]")) {
    event.preventDefault();
    enterDirectTeamMemberRoom(memberOption.dataset.teamMemberOption);
  }

  const teamRoomButton = event.target.closest("[data-team-room]");
  if (teamRoomButton) {
    activeTeamRoomId = teamRoomButton.dataset.teamRoom;
    renderChats();
    showToast(`${getActiveTeamRoom().title} 채팅방으로 전환했습니다.`);
  }

  const auditFilterButton = event.target.closest("[data-audit-filter]");
  if (auditFilterButton) {
    auditFilter = auditFilterButton.dataset.auditFilter;
    renderAudit();
    showToast("감사 로그 필터를 적용했습니다.");
  }

  const settingsHubButton = event.target.closest("[data-settings-index]");
  if (settingsHubButton) {
    activeSettingsIndex = Number(settingsHubButton.dataset.settingsIndex);
    renderSettingsHub();
    openSettingsModal(activeSettingsIndex);
    showToast(`${settingsHub[activeSettingsIndex].menu} 설정 창을 열었습니다.`);
  }

  const settingsOpenButton = event.target.closest("[data-settings-open]");
  if (settingsOpenButton) {
    openSettingsModal(Number(settingsOpenButton.dataset.settingsOpen));
    showToast(`${settingsHub[activeSettingsIndex].menu} 설정 창을 열었습니다.`);
  }

  if (event.target.closest("#settingsModalClose")) closeSettingsModal();
  if (event.target.closest("#settingsModalCancel")) closeSettingsModal();
  if (event.target.closest("#settingsModalSave")) saveSettingsModal();

  if (event.target.closest("#commandClose")) closeCommandPanel();
  if (event.target.closest("#commandCancel")) closeCommandPanel();
  if (event.target.closest("#commandSave")) saveCommandForm();

  const isInlineControl = event.target.closest(
    "input, select, textarea, #saveProductInventory, #saveSalesTargets, #settingsModalSave, #settingsModalCancel, #settingsModalClose, #commandSave, #commandCancel, #commandClose"
  );
  const commandTarget = isInlineControl ? null : event.target.closest("[data-command]");
  if (commandTarget) {
    openCommandPanel(commandTarget.dataset.command, commandTarget.dataset.commandLabel || commandTarget.textContent.trim());
  }

  const chatLauncher = event.target.closest("[data-chat-open]");
  if (chatLauncher) openChatPopup(chatLauncher.dataset.chatOpen);

  const chatClose = event.target.closest("[data-chat-close]");
  if (chatClose) closeChatPopup(chatClose.dataset.chatClose);

  if (event.target.classList.contains("chat-backdrop")) closeAllChatPopups();
});

document.addEventListener("change", (event) => {
  const memberInput = event.target.closest("[data-team-member]");
  if (!memberInput) return;
  selectedTeamMemberIds = Array.from(document.querySelectorAll("[data-team-member]:checked")).map((input) => input.dataset.teamMember);
  enterSelectedTeamRoom();
});

document.addEventListener("dragenter", (event) => {
  if (!event.target.closest("#teamPopup")) return;
  event.preventDefault();
  setTeamDropState(true);
});

document.addEventListener("dragover", (event) => {
  if (!event.target.closest("#teamPopup")) return;
  event.preventDefault();
  setTeamDropState(true);
});

document.addEventListener("dragleave", (event) => {
  if (!event.target.closest("#teamPopup") || event.relatedTarget?.closest?.("#teamPopup")) return;
  setTeamDropState(false);
});

document.addEventListener("drop", (event) => {
  if (!event.target.closest("#teamPopup")) return;
  event.preventDefault();
  setTeamDropState(false);
  handleTeamAttachment(event.dataTransfer.files);
});

document.addEventListener("keydown", (event) => {
  if (event.target.closest("#teamMessage") && event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendTeamMessage();
  }
  const memberOption = event.target.closest("[data-team-member-option]");
  if (memberOption && event.key === "Enter") {
    event.preventDefault();
    enterDirectTeamMemberRoom(memberOption.dataset.teamMemberOption);
  }
});

function openChatPopup(type) {
  closeAllChatPopups();
  document.querySelector("#chatBackdrop").classList.add("active");
  document.querySelector(`#${type}Popup`).classList.add("active");
}

function closeChatPopup(type) {
  document.querySelector(`#${type}Popup`).classList.remove("active");
  if (!document.querySelector(".chat-popup.active")) {
    document.querySelector("#chatBackdrop").classList.remove("active");
  }
}

function closeAllChatPopups() {
  document.querySelectorAll(".chat-popup").forEach((popup) => popup.classList.remove("active"));
  document.querySelector("#chatBackdrop").classList.remove("active");
}

document.querySelector("#aiSend").addEventListener("click", () => {
  const input = document.querySelector("#aiPrompt");
  if (!input.value.trim()) return;
  aiMessages.push(["user", input.value.trim()]);
  aiMessages.push(["assistant", "요청을 접수했습니다. 개인정보 원문 없이 집계 기준으로 답변하며, 실행 액션은 승인 후 처리됩니다."]);
  input.value = "";
  renderChats();
  showToast("AI 프롬프트 로그 AUD-AI-9001을 기록했습니다.");
});

document.querySelector("#teamSend").addEventListener("click", sendTeamMessage);

renderNav();
renderDashboard();
renderCustomers();
renderProducts();
renderLogistics();
renderPipeline();
renderChats();
renderEmployees();
renderHrLeaveManagement();
renderApprovalLines();
renderApprovalManagement();
renderSettingsHub();
renderAudit();

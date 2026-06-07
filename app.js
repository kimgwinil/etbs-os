const navItems = [
  ["dashboard", "대시보드", "▦"],
  ["customers", "고객관리", "◎"],
  ["products", "판매상품", "◫"],
  ["logistics", "배송/입출고", "⇄"],
  ["pipeline", "영업 파이프라인", "◇"],
  ["ai", "AI 채팅방", "✦"],
  ["teamChat", "직원 채팅방", "☰"],
  ["employees", "임직원 관리", "♢"],
  ["audit", "보안/감사", "◷"]
];

const companyPrefixes = ["한빛", "동서", "서울", "푸른", "넥스트", "브라이트", "에이치", "청담", "동부", "하나", "미래", "세종", "대한", "우진", "케이", "더웰", "가온", "라온", "비전", "코어"];
const companySuffixes = ["전자", "바이오", "제약", "식품", "모빌리티", "랩", "케어", "교육", "물류", "푸드", "테크", "리테일", "건설", "서비스", "금융", "헬스", "미디어", "솔루션", "에너지", "커머스"];
const productCategories = ["복지 포인트", "온누리 모바일권", "건강검진", "도서 쿠폰", "선물세트", "여행 바우처", "교육 수강권", "식대 포인트", "문화상품권", "의료비 지원"];
const suppliers = ["복지포인트", "온누리 API", "케어파트너", "그린문고", "모두복지몰", "트래블웰", "러닝허브", "푸드링크", "컬처넷", "메디서포트"];
const teams = ["정산팀", "운영팀", "CS팀", "상품팀", "영업팀", "HR팀", "보안팀"];
const roles = ["정산 승인자", "운영 처리자", "개인정보 제한", "상품 승인자", "AM", "결재권한 관리자", "접근로그 감사자"];
const familyNames = ["김", "박", "이", "최", "정", "강", "조", "윤", "장", "임"];
const givenNames = ["서연", "지훈", "도윤", "민재", "하린", "나은", "윤서", "도현", "서진", "지우"];
const statuses = ["정상", "주의", "개선"];
const contracts = ["운영중", "갱신 30일 전", "갱신 74일 전", "계약 검토", "신규 온보딩", "조건 재협상"];

function padId(prefix, index) {
  return `${prefix}-${String(index).padStart(3, "0")}`;
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
    `재고 ${120 + ((index * 19) % 880)}`,
    `AUD-PROD-${String(1400 + index).padStart(4, "0")}`
  ];
}

function makeEmployee(index) {
  const customer = customers[index % customers.length];
  const team = teams[index % teams.length];
  const name = `${familyNames[index % familyNames.length]}${givenNames[index % givenNames.length]}`;
  const employmentStatus = index % 17 === 0 ? "퇴사예정" : index % 13 === 0 ? "입사예정" : "재직";
  const date = `202${index % 6}-${String((index % 12) + 1).padStart(2, "0")}-${String((index % 27) + 1).padStart(2, "0")}`;
  const securityState = employmentStatus === "퇴사예정" ? "권한 회수 예약" : index % 9 === 0 ? "열람 사유 필요" : "정상";
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

const dashboardMetrics = [
  ["고객사", `${customers.length}개`, "테스트 고객정보", "positive"],
  ["판매상품", `${products.length}개`, "고객사/공급사 연결", "neutral"],
  ["임직원", `${employees.length}명`, "마스킹 테스트 데이터", "positive"],
  ["SLA 초과", "7건", "즉시 조치", "danger"],
  ["배송 지연", "14건", "입출고 확인", "warning"],
  ["월 매출", "18.4억", "산식 PM 승인 필요", "warning"]
];

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

const inventoryRisks = [
  [products[2][0], "입고 검수 지연으로 SLA 위험", "warning"],
  [products[4][0], "배송 지연 14건, 운송사 확인 필요", "danger"],
  [products[1][0], "외부 API 전송 항목 PM 승인 필요", "warning"]
];

const pipeline = [
  ["리드", "6건", "5.2억", [customers[6].name, customers[7].name]],
  ["제안", "8건", "9.8억", [customers[8].name, customers[9].name]],
  ["계약검토", "9건", "18.1억", [customers[2].name, customers[5].name]],
  ["수주", "4건", "9.7억", [customers[4].name]],
  ["실패/보류", "3건", "1.4억", ["저마진 조건"]]
];

const aiMessages = [
  ["assistant", "오늘 SLA 초과 7건 중 배송/입출고 4건, 정산 2건, CS 1건입니다. 개인정보 원문 없이 집계 기준으로 요약했습니다."],
  ["user", "저마진 고객사 원인을 알려줘"],
  ["assistant", "동서바이오는 배송 지연과 예외 재처리 비율이 높습니다. 계약/원가 산식은 PM 승인 필요 상태입니다."]
];

const teamMessages = [
  ["정산팀 김서연", "한빛전자 정산 증적 4건 승인 대기입니다.", "AUD-CHAT-771"],
  ["운영팀 박지훈", "배송 지연 건은 운송사 API 재처리 후 결과 남기겠습니다.", "AUD-CHAT-772"],
  ["CS팀 이도윤", "첨부파일: 고객문의_마스킹본.xlsx", "AUD-FILE-128"]
];

const auditRows = [
  ["AUD-10291", "개인정보 상세 열람", "CS팀 이도윤", "EMP-77***", "사유 입력 완료", "보존기간 PM 승인 필요"],
  ["AUD-10292", "결재권한 변경", "HR 관리자", "김서연", "승인 ID APR-42", "변경 전후 기록"],
  ["AUD-10293", "파일 첨부", "CS팀 이도윤", "고객문의_마스킹본.xlsx", "대화 로그 연결", "다운로드 권한 제한"],
  ["AUD-10294", "상품 가격 변경", "상품팀 최민재", "온누리 모바일권", "승인 대기", "PM 승인 필요"],
  ["AUD-10295", "AI 프롬프트", "운영팀 박지훈", "SLA 초과 요약", "개인정보 미포함", "자동 의사결정 금지"]
];

const toast = document.querySelector("#toast");

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

function renderDashboard() {
  document.querySelector("#dashboardMetrics").innerHTML = dashboardMetrics
    .map(
      ([label, value, helper, tone]) => `
        <button class="metric ${tone}" type="button">
          <span>${label}</span>
          <strong>${value}</strong>
          <small>${helper}</small>
        </button>
      `
    )
    .join("");

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
  renderDataTable("#productTable", ["상품명", "공급사", "연결 고객사", "상태", "마진", "운영 신호", "재고", "감사로그"], products);
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
  renderActionList("#inventoryRisks", inventoryRisks);
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
          ${names.map((name) => `<button type="button">${name}</button>`).join("")}
        </div>
      `
    )
    .join("");
}

function renderChats() {
  document.querySelector("#aiChat").innerHTML = aiMessages.map(renderMessage).join("");
  document.querySelector("#teamChat").innerHTML = teamMessages
    .map(([sender, message, audit]) => renderMessage(["assistant", `<b>${sender}</b><br>${message}<small>${audit}</small>`]))
    .join("");
  document.querySelector("#chatAuditFeed").innerHTML = teamMessages
    .map(
      ([sender, message, audit]) => `
        <div class="audit-item">
          <strong>${audit}</strong>
          <span>${sender}</span>
          <p>${message}</p>
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

function renderMessage([role, message]) {
  return `
    <div class="message ${role}">
      <p>${message}</p>
    </div>
  `;
}

function renderEmployees() {
  renderDataTable("#employeeTable", ["직원 ID", "이름", "고객사", "조직", "상태", "입사/퇴사일", "결재권한", "보안 상태"], employees);
  renderEmployeeDetail(employees[0][0]);
}

function renderEmployeeDetail(employeeId) {
  const employee = employees.find((item) => item[0] === employeeId) || employees[0];
  document.querySelector("#employeeDetail").innerHTML = `
    <div class="detail-header">
      <span class="status-pill">PII Protected</span>
      <h2>${employee[1]}</h2>
      <p>${employee[0]} · ${employee[2]} · ${employee[3]}</p>
    </div>
    <div class="detail-grid">
      <div><span>신상명세</span><strong>마스킹 표시</strong></div>
      <div><span>인적사항</span><strong>상세 열람 사유 필요</strong></div>
      <div><span>입사/퇴사</span><strong>${employee[5]}</strong></div>
      <div><span>재직 상태</span><strong>${employee[4]}</strong></div>
      <div><span>결재권한</span><strong>${employee[6]}</strong></div>
      <div><span>권한 회수</span><strong>${employee[7]}</strong></div>
      <div><span>감사로그</span><strong>AUD-HR-${employee[0].split("-")[1]}</strong></div>
    </div>
    <div class="notice">신상명세 및 민감정보 항목, 보존기간, 퇴사자 데이터 처리범위는 PM 승인 필요입니다.</div>
  `;
}

function renderAudit() {
  renderDataTable("#auditTable", ["로그 ID", "이벤트", "행위자", "대상", "상태", "통제"], auditRows);
}

function renderDataTable(selector, headers, rows) {
  document.querySelector(selector).innerHTML = `
    <table>
      <thead>
        <tr>${headers.map((header) => `<th>${header}</th>`).join("")}</tr>
      </thead>
      <tbody>
        ${rows
          .map(
            (row) => `
              <tr>
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
        <button class="action-item ${tone || ""}" type="button">
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

document.addEventListener("click", (event) => {
  const navItem = event.target.closest(".nav-item");
  if (navItem) showView(navItem.dataset.view);

  const customerRow = event.target.closest("[data-customer]");
  if (customerRow) {
    document.querySelectorAll("[data-customer]").forEach((item) => item.classList.remove("selected"));
    customerRow.classList.add("selected");
    renderCustomerDetail(customerRow.dataset.customer);
  }

  if (event.target.closest("#auditButton")) showView("audit");
  if (event.target.closest("#refreshButton")) showToast("ETBS OS 화면 데이터를 새로고침했습니다.");
  if (event.target.closest("#attachButton")) showToast("파일 첨부는 로그 기록과 다운로드 권한 검증 대상입니다.");
});

document.querySelector("#aiSend").addEventListener("click", () => {
  const input = document.querySelector("#aiPrompt");
  if (!input.value.trim()) return;
  aiMessages.push(["user", input.value.trim()]);
  aiMessages.push(["assistant", "요청을 접수했습니다. 개인정보 원문 없이 집계 기준으로 답변하며, 실행 액션은 승인 후 처리됩니다."]);
  input.value = "";
  renderChats();
  showToast("AI 프롬프트 로그 AUD-AI-9001을 기록했습니다.");
});

document.querySelector("#teamSend").addEventListener("click", () => {
  const input = document.querySelector("#teamMessage");
  if (!input.value.trim()) return;
  teamMessages.push(["운영팀", input.value.trim(), `AUD-CHAT-${780 + teamMessages.length}`]);
  input.value = "";
  renderChats();
  showToast("직원 채팅 로그를 기록했습니다.");
});

renderNav();
renderDashboard();
renderCustomers();
renderProducts();
renderLogistics();
renderPipeline();
renderChats();
renderEmployees();
renderAudit();

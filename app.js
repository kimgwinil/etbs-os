const tasks = [
  {
    id: "OPS-10482",
    type: "Settlement",
    typeLabel: "정산",
    status: "pending_approval",
    client: "한빛전자",
    supplier: "모두복지몰",
    assignee: "정산팀 김서연",
    sla: "risk",
    amount: "높음",
    employeeRef: "EMP-82***",
    exception: "증적 보완 필요",
    lastEvent: "13분 전",
    audit: "정산 확정 전 승인 ID 필요"
  },
  {
    id: "OPS-10481",
    type: "Integration",
    typeLabel: "연동",
    status: "exception",
    client: "동서바이오",
    supplier: "온누리 API",
    assignee: "플랫폼 운영팀",
    sla: "breached",
    amount: "중간",
    employeeRef: "EMP-19***",
    exception: "외부 연동 실패",
    lastEvent: "28분 전",
    audit: "재시도 요청과 실패 코드를 감사로그에 기록"
  },
  {
    id: "OPS-10480",
    type: "Point",
    typeLabel: "포인트",
    status: "in_progress",
    client: "에이치케어",
    supplier: "복지포인트",
    assignee: "운영팀 박지훈",
    sla: "normal",
    amount: "낮음",
    employeeRef: "EMP-44***",
    exception: "없음",
    lastEvent: "44분 전",
    audit: "포인트 보정 시 변경 전후 값 기록"
  },
  {
    id: "OPS-10479",
    type: "CS",
    typeLabel: "CS",
    status: "assigned",
    client: "서울제약",
    supplier: "베네카페",
    assignee: "CS팀 이도윤",
    sla: "risk",
    amount: "없음",
    employeeRef: "EMP-77***",
    exception: "고객 확인 대기",
    lastEvent: "1시간 전",
    audit: "개인정보 상세 열람 시 목적 입력 필요"
  },
  {
    id: "OPS-10478",
    type: "Review",
    typeLabel: "심사",
    status: "new",
    client: "푸른식품",
    supplier: "의료비 심사",
    assignee: "미배정",
    sla: "normal",
    amount: "중간",
    employeeRef: "EMP-31***",
    exception: "정책 검토 필요",
    lastEvent: "2시간 전",
    audit: "민감정보 항목은 PM 승인 필요"
  },
  {
    id: "OPS-10477",
    type: "Settlement",
    typeLabel: "정산",
    status: "completed",
    client: "넥스트모빌리티",
    supplier: "그린문고",
    assignee: "정산팀 김서연",
    sla: "normal",
    amount: "중간",
    employeeRef: "EMP-58***",
    exception: "없음",
    lastEvent: "오늘 09:20",
    audit: "완료 근거와 승인자를 보존"
  }
];

const profitRows = [
  { client: "동서바이오", margin: 3.1, cases: 184, exceptionRate: 19, effort: "높음" },
  { client: "한빛전자", margin: 4.6, cases: 221, exceptionRate: 15, effort: "높음" },
  { client: "푸른식품", margin: 7.8, cases: 96, exceptionRate: 11, effort: "중간" },
  { client: "서울제약", margin: 9.2, cases: 140, exceptionRate: 8, effort: "중간" }
];

const statusLabels = {
  new: "신규",
  assigned: "배정",
  in_progress: "진행",
  pending_approval: "승인 대기",
  blocked: "보류",
  exception: "예외",
  completed: "완료"
};

const slaLabels = {
  normal: "정상",
  risk: "위험",
  breached: "초과"
};

const selectedTaskIds = new Set();
let activeTaskId = null;

const taskTable = document.querySelector("#taskTable");
const operationsMetrics = document.querySelector("#operationsMetrics");
const taskDetail = document.querySelector("#taskDetail");
const emptyDetail = document.querySelector("#emptyDetail");
const toast = document.querySelector("#toast");

function renderMetrics() {
  const metrics = [
    ["신규", tasks.filter((task) => task.status === "new").length],
    ["진행중", tasks.filter((task) => task.status === "in_progress").length],
    ["SLA 위험", tasks.filter((task) => task.sla === "risk").length],
    ["SLA 초과", tasks.filter((task) => task.sla === "breached").length],
    ["예외", tasks.filter((task) => task.status === "exception").length],
    ["오늘 완료", tasks.filter((task) => task.status === "completed").length]
  ];

  operationsMetrics.innerHTML = metrics
    .map(
      ([label, value]) => `
        <button class="metric" type="button" data-metric="${label}">
          <span>${label}</span>
          <strong>${value}</strong>
        </button>
      `
    )
    .join("");
}

function getFilteredTasks() {
  const search = document.querySelector("#searchInput").value.trim().toLowerCase();
  const status = document.querySelector("#statusFilter").value;
  const sla = document.querySelector("#slaFilter").value;
  const type = document.querySelector("#typeFilter").value;

  return tasks.filter((task) => {
    const matchesSearch =
      !search ||
      task.id.toLowerCase().includes(search) ||
      task.client.toLowerCase().includes(search) ||
      task.supplier.toLowerCase().includes(search);
    const matchesStatus = status === "all" || task.status === status;
    const matchesSla = sla === "all" || task.sla === sla;
    const matchesType = type === "all" || task.type === type;
    return matchesSearch && matchesStatus && matchesSla && matchesType;
  });
}

function renderTasks() {
  const filteredTasks = getFilteredTasks();
  taskTable.innerHTML = filteredTasks
    .map(
      (task) => `
        <tr class="${task.id === activeTaskId ? "selected-row" : ""}" data-task-id="${task.id}">
          <td>
            <input type="checkbox" aria-label="${task.id} 선택" data-select-task="${task.id}" ${
              selectedTaskIds.has(task.id) ? "checked" : ""
            } />
          </td>
          <td><span class="status ${task.status}">${statusLabels[task.status]}</span></td>
          <td class="task-cell">
            <strong>${task.id}</strong>
            <span>${task.typeLabel} · ${task.exception}</span>
          </td>
          <td class="client-cell">
            <strong>${task.client}</strong>
            <span>${task.supplier}</span>
          </td>
          <td>${task.assignee}</td>
          <td><span class="sla ${task.sla}">${slaLabels[task.sla]}</span></td>
          <td>${task.amount}</td>
        </tr>
      `
    )
    .join("");

  document.querySelector("#selectAll").checked =
    filteredTasks.length > 0 && filteredTasks.every((task) => selectedTaskIds.has(task.id));
}

function renderDetail(taskId) {
  const task = tasks.find((item) => item.id === taskId);
  if (!task) return;

  activeTaskId = taskId;
  emptyDetail.classList.add("hidden");
  taskDetail.classList.remove("hidden");
  taskDetail.innerHTML = `
    <div class="detail-header">
      <span class="status ${task.status}">${statusLabels[task.status]}</span>
      <h2>${task.id}</h2>
      <p class="task-subtitle">${task.client} · ${task.typeLabel}</p>
    </div>
    <div class="detail-grid">
      <div class="detail-item"><span>공급사/연동</span><strong>${task.supplier}</strong></div>
      <div class="detail-item"><span>담당자</span><strong>${task.assignee}</strong></div>
      <div class="detail-item"><span>임직원 참조</span><strong>${task.employeeRef}</strong></div>
      <div class="detail-item"><span>SLA</span><strong>${slaLabels[task.sla]}</strong></div>
      <div class="detail-item"><span>금액 영향</span><strong>${task.amount}</strong></div>
      <div class="detail-item"><span>최근 이벤트</span><strong>${task.lastEvent}</strong></div>
    </div>
    <div class="audit-box">${task.audit}</div>
    <div class="detail-actions">
      <button type="button" data-detail-action="complete">상태 변경</button>
      <button type="button" data-detail-action="pii">상세 열람</button>
      <button type="button" data-detail-action="approve">승인 요청</button>
      <button type="button" data-detail-action="note">감사 메모</button>
    </div>
  `;
  renderTasks();
}

function renderProfitability() {
  const metricData = [
    ["매출", "18.4억", "기간 내 계약 기준"],
    ["공헌이익", "1.12억", "산식 검토중"],
    ["평균 마진율", "6.1%", "PM/재무 승인 필요"],
    ["운영 처리건", "641건", "SLA 초과 7건"]
  ];

  document.querySelector("#profitMetrics").innerHTML = metricData
    .map(
      ([label, value, helper]) => `
        <div class="profit-card">
          <span>${label}</span>
          <strong>${value}</strong>
          <small>${helper}</small>
        </div>
      `
    )
    .join("");

  document.querySelector("#profitRows").innerHTML = profitRows
    .map(
      (row) => `
        <button class="profit-row" type="button" data-client="${row.client}">
          <div>
            <strong>${row.client}</strong>
            <p class="task-subtitle">처리 ${row.cases}건 · 예외율 ${row.exceptionRate}% · 투입 ${row.effort}</p>
            <div class="bar"><span style="width: ${Math.min(row.exceptionRate * 4, 100)}%"></span></div>
          </div>
          <span class="risk-tag">${row.margin}%</span>
        </button>
      `
    )
    .join("");
}

function renderSecurityControls() {
  const controls = [
    ["RBAC", "역할, 테넌트 범위, 승인 상태, 업무 목적을 함께 평가합니다."],
    ["Tenant Isolation", "고객사/공급사/임직원 데이터는 서버 기준 격리 조건을 적용합니다."],
    ["PII Access Log", "조회, 검색 노출, 다운로드, 마스킹 해제를 모두 기록합니다."],
    ["Audit Log", "계약, 포인트, 정산, 권한 변경, 외부 연동 재처리를 증적화합니다."]
  ];

  document.querySelector("#securityControls").innerHTML = controls
    .map(
      ([title, copy]) => `
        <div class="control-item">
          <strong>${title}</strong>
          <p>${copy}</p>
        </div>
      `
    )
    .join("");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2400);
}

document.addEventListener("click", (event) => {
  const navItem = event.target.closest(".nav-item");
  if (navItem) {
    document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("active"));
    document.querySelectorAll(".view").forEach((view) => view.classList.remove("active"));
    navItem.classList.add("active");
    document.querySelector(`#${navItem.dataset.view}View`).classList.add("active");
  }

  const row = event.target.closest("tr[data-task-id]");
  if (row && !event.target.matches("input")) {
    renderDetail(row.dataset.taskId);
  }

  const taskCheckbox = event.target.closest("[data-select-task]");
  if (taskCheckbox) {
    const taskId = taskCheckbox.dataset.selectTask;
    if (taskCheckbox.checked) selectedTaskIds.add(taskId);
    else selectedTaskIds.delete(taskId);
    renderTasks();
  }

  const batchAction = event.target.closest("[data-action]");
  if (batchAction) {
    const count = selectedTaskIds.size;
    showToast(count ? `${count}건 ${batchAction.textContent} 요청을 기록했습니다.` : "선택된 업무가 없습니다.");
  }

  const detailAction = event.target.closest("[data-detail-action]");
  if (detailAction) {
    showToast(`${detailAction.textContent} 이벤트를 감사 로그 대상으로 표시했습니다.`);
  }

  const profitRow = event.target.closest("[data-client]");
  if (profitRow) {
    document.querySelector(".nav-item[data-view='operations']").click();
    document.querySelector("#searchInput").value = profitRow.dataset.client;
    renderTasks();
    showToast(`${profitRow.dataset.client} 관련 업무로 이동했습니다.`);
  }
});

document.querySelector("#selectAll").addEventListener("change", (event) => {
  getFilteredTasks().forEach((task) => {
    if (event.target.checked) selectedTaskIds.add(task.id);
    else selectedTaskIds.delete(task.id);
  });
  renderTasks();
});

["#searchInput", "#statusFilter", "#slaFilter", "#typeFilter"].forEach((selector) => {
  document.querySelector(selector).addEventListener("input", renderTasks);
});

document.querySelector("#refreshButton").addEventListener("click", () => {
  renderMetrics();
  renderTasks();
  showToast("업무 큐를 새로고침했습니다.");
});

document.querySelector("#approvalButton").addEventListener("click", () => {
  document.querySelector("#statusFilter").value = "pending_approval";
  document.querySelector(".nav-item[data-view='operations']").click();
  renderTasks();
});

renderMetrics();
renderTasks();
renderProfitability();
renderSecurityControls();

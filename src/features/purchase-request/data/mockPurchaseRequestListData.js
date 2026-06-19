const seedRequests = [
  {
    title: "2분기 정기 설비 부품 구매 요청",
    requester: "김호현",
    department: "구매전략팀",
    requestedAt: "2026-06-01",
    desiredInboundAt: "2026-06-15",
    itemCount: 3,
    totalAmount: 2450000,
    priority: "긴급",
    status: "승인 대기",
  },
  {
    title: "사무용 소모품(A4용지, 토너) 구매",
    requester: "이지민",
    department: "인사총무팀",
    requestedAt: "2026-05-30",
    desiredInboundAt: "2026-06-05",
    itemCount: 5,
    totalAmount: 420000,
    priority: "일반",
    status: "발주 완료",
  },
  {
    title: "연구소 테스트용 정밀 센서 12종",
    requester: "박준서",
    department: "R&D센터",
    requestedAt: "2026-05-28",
    desiredInboundAt: "2026-06-20",
    itemCount: 12,
    totalAmount: 12800000,
    priority: "일반",
    status: "승인 완료",
  },
  {
    title: "서버실 무정전 전원장치(UPS) 교체",
    requester: "최유진",
    department: "IT운영팀",
    requestedAt: "2026-05-27",
    desiredInboundAt: "2026-06-10",
    itemCount: 2,
    totalAmount: 8500000,
    priority: "긴급",
    status: "반려",
  },
  {
    title: "생산라인 3번 컨베이어 벨트 부품",
    requester: "정다은",
    department: "생산관리팀",
    requestedAt: "2026-05-26",
    desiredInboundAt: "2026-06-01",
    itemCount: 1,
    totalAmount: 1200000,
    priority: "긴급",
    status: "승인 완료",
  },
  {
    title: "식당용 식자재 정기 구매(6월)",
    requester: "문서연",
    department: "지원팀",
    requestedAt: "2026-05-24",
    desiredInboundAt: "2026-06-01",
    itemCount: 45,
    totalAmount: 3150000,
    priority: "일반",
    status: "발주 완료",
  },
  {
    title: "홍보물 리플렛 및 포스터 제작",
    requester: "강동현",
    department: "마케팅팀",
    requestedAt: "2026-05-22",
    desiredInboundAt: "2026-06-05",
    itemCount: 3,
    totalAmount: 5600000,
    priority: "일반",
    status: "승인 대기",
  },
  {
    title: "노후 PC 및 모니터 교체 사업",
    requester: "김철수",
    department: "IT운영팀",
    requestedAt: "2026-05-20",
    desiredInboundAt: "2026-06-30",
    itemCount: 20,
    totalAmount: 45000000,
    priority: "일반",
    status: "승인 완료",
  },
  {
    title: "물류센터 안전보호구 추가 구매",
    requester: "윤서진",
    department: "물류운영팀",
    requestedAt: "2026-05-18",
    desiredInboundAt: "2026-06-03",
    itemCount: 8,
    totalAmount: 1980000,
    priority: "긴급",
    status: "승인 대기",
  },
  {
    title: "신규 입사자 업무용 노트북 구매",
    requester: "조민재",
    department: "인사총무팀",
    requestedAt: "2026-05-17",
    desiredInboundAt: "2026-06-08",
    itemCount: 6,
    totalAmount: 9360000,
    priority: "일반",
    status: "승인 완료",
  },
]

const remainingStatusAllocation = [
  ...Array(13).fill("승인 대기"),
  ...Array(78).fill("승인 완료"),
  ...Array(5).fill("반려"),
  ...Array(18).fill("발주 완료"),
]

const seedRequestNumbers = [
  "PR-2026-0008",
  "PR-2026-0007",
  "PR-2026-0006",
  "PR-2026-0005",
  "PR-2026-0004",
  "PR-2026-0003",
  "PR-2026-0002",
  "PR-2026-0001",
  "PR-2026-0009",
  "PR-2026-0010",
]

const departments = [
  "구매전략팀",
  "인사총무팀",
  "R&D센터",
  "IT운영팀",
  "생산관리팀",
  "지원팀",
  "마케팅팀",
  "물류운영팀",
]

const requesters = [
  "김호현",
  "이지민",
  "박준서",
  "최유진",
  "정다은",
  "문서연",
  "강동현",
  "김철수",
  "윤서진",
  "조민재",
]

function subtractDays(dateString, days) {
  const date = new Date(`${dateString}T00:00:00`)
  date.setDate(date.getDate() - days)

  return date.toISOString().slice(0, 10)
}

function addDays(dateString, days) {
  const date = new Date(`${dateString}T00:00:00`)
  date.setDate(date.getDate() + days)

  return date.toISOString().slice(0, 10)
}

const generatedRequests = Array.from({ length: 124 }, (_, index) => {
  const requestedAt = subtractDays("2026-06-01", index)
  const desiredInboundAt = addDays(requestedAt, 5 + (index % 17))

  return {
    id: index + 1,
    requestNumber: `PR-2026-${String(index + 1).padStart(4, "0")}`,
    title: `${departments[index % departments.length]} 운영 물품 정기 구매 요청 ${index + 1}`,
    requester: requesters[index % requesters.length],
    department: departments[index % departments.length],
    requestedAt,
    desiredInboundAt,
    itemCount: (index % 15) + 1,
    totalAmount: 320000 + ((index * 370000) % 11800000),
    priority: index % 9 === 0 ? "긴급" : "일반",
    status:
      index < seedRequests.length
        ? seedRequests[index].status
        : remainingStatusAllocation[index - seedRequests.length],
  }
})

export const mockPurchaseRequests = generatedRequests.map((request, index) => {
  if (index >= seedRequests.length) {
    return request
  }

  return {
    ...request,
    ...seedRequests[index],
    requestNumber: seedRequestNumbers[index],
  }
})

export const purchaseRequestFilterOptions = {
  departments: ["전체 부서", ...departments],
  statuses: [
    "전체",
    "승인 대기",
    "승인 완료",
    "반려",
    "발주 완료",
    "요청 취소",
  ],
  priorities: ["전체", "일반", "긴급"],
}

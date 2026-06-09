export const DEFAULT_PURCHASE_REQUEST_FILTERS = {
  requestNumber: "",
  title: "",
  requester: "",
  department: "전체 부서",
  status: "전체",
  priority: "전체",
  requestedFrom: "",
  requestedTo: "",
  desiredInboundFrom: "",
  desiredInboundTo: "",
}

export const DEFAULT_PURCHASE_REQUEST_FILTER_OPTIONS = {
  departments: ["전체 부서"],
  statuses: [
    "전체",
    "임시 저장",
    "승인 대기",
    "승인 완료",
    "반려",
    "발주 완료",
  ],
  priorities: ["전체", "일반", "긴급"],
}

export const DEFAULT_PURCHASE_REQUEST_PAGINATION = {
  page: 1,
  size: 15,
  totalElements: 0,
  totalPages: 1,
}

export const PURCHASE_REQUEST_TABLE_HEADERS = [
  "요청 번호",
  "요청 제목",
  "요청자",
  "요청 부서",
  "요청일",
  "희망 입고일",
  "품목 수",
  "총 요청 금액",
  "우선순위",
  "상태",
  "관리",
]

export function formatWon(value = 0) {
  return `${Number(value).toLocaleString("ko-KR")}원`
}

export function createPageNumbers(currentPage, totalPages) {
  if (totalPages <= 6) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis-right", totalPages]
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      "ellipsis-left",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ]
  }

  return [
    1,
    "ellipsis-left",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis-right",
    totalPages,
  ]
}

function escapeCsvValue(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`
}

export function downloadPurchaseRequestCsv(requests) {
  const headers = [
    "요청 번호",
    "요청 제목",
    "요청자",
    "요청 부서",
    "요청일",
    "희망 입고일",
    "품목 수",
    "총 요청 금액",
    "우선순위",
    "상태",
  ]

  const rows = requests.map((request) => [
    request.requestNumber,
    request.title,
    request.requester,
    request.department,
    request.requestedAt,
    request.desiredInboundAt,
    request.itemCount,
    request.totalAmount,
    request.priority,
    request.status,
  ])

  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\n")

  const blob = new Blob(["\uFEFF", csv], {
    type: "text/csv;charset=utf-8;",
  })

  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")

  link.href = url
  link.download = "구매요청목록.csv"

  document.body.appendChild(link)
  link.click()
  link.remove()

  URL.revokeObjectURL(url)
}

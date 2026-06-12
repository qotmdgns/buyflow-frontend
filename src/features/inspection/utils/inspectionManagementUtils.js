export const DEFAULT_INSPECTION_FILTERS = {
  inspectionNumber: "",
  inboundNumber: "",
  orderNumber: "",
  supplierName: "전체 공급업체",
  warehouseName: "전체 창고",
  priority: "전체",
  receivedFrom: "",
  receivedTo: "",
}

export const DEFAULT_INSPECTION_FILTER_OPTIONS = {
  suppliers: ["전체 공급업체"],
  warehouses: ["전체 창고"],
  priorities: ["전체", "일반", "긴급"],
}

export const DEFAULT_INSPECTION_PAGINATION = {
  page: 1,
  size: 15,
  totalElements: 0,
  totalPages: 1,
}

export const INSPECTION_TABLE_HEADERS = [
  "검수 대기 번호",
  "입고 번호",
  "발주 번호",
  "공급업체",
  "입고 창고",
  "입고일",
  "검수 기한",
  "품목 수",
  "검수 대상 수량",
  "우선순위",
  "상태",
  "관리",
]

export function getTodayString(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

export function isInspectionOverdue(inspection, today = getTodayString()) {
  return inspection.status === "PENDING" && inspection.inspectionDueAt < today
}

export function getInspectionStatusMeta(status) {
  if (status === "PENDING") {
    return {
      label: "검수 대기",
      badgeClassName: "border-amber-200 bg-amber-50 text-amber-600",
    }
  }

  return {
    label: status,
    badgeClassName: "border-slate-200 bg-slate-50 text-slate-500",
  }
}

export function formatNumber(value = 0) {
  return Number(value).toLocaleString("ko-KR")
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

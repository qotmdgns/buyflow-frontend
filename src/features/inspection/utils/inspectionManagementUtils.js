export const INSPECTION_SUMMARY_FILTERS = {
  ALL: "ALL",
  TODAY: "TODAY",
  URGENT: "URGENT",
  OVERDUE: "OVERDUE",
}

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
  inspectionTypes: ["전체", "입고검수", "품질검수", "출하검수"],
  inspectionResults: ["전체", "합격", "불합격", "부분합격", "검수대기"],
  dispositions: ["입고", "반품", "폐기", "재검수"],
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
  const statusMap = {
    PENDING: {
      label: "검수 대기",
      badgeClassName: "border-amber-200 bg-amber-50 text-amber-600",
    },

    COMPLETED: {
      label: "검수 완료",
      badgeClassName: "border-emerald-200 bg-emerald-50 text-emerald-600",
    },

    PARTIAL_ACCEPTED: {
      label: "부분 합격",
      badgeClassName: "border-orange-200 bg-orange-50 text-orange-600",
    },

    REJECTED: {
      label: "불합격",
      badgeClassName: "border-rose-200 bg-rose-50 text-rose-500",
    },

    PASS: {
      label: "검수 완료",
      badgeClassName: "border-emerald-200 bg-emerald-50 text-emerald-600",
    },

    DEFECT: {
      label: "불량 발생",
      badgeClassName: "border-rose-200 bg-rose-50 text-rose-500",
    },
  }

  return (
    statusMap[status] ?? {
      label: status || "-",
      badgeClassName: "border-slate-200 bg-slate-50 text-slate-500",
    }
  )
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
export function getDispositionLabel(disposition) {
  const labels = {
    NONE: "-",
    RETURN: "반품",
    EXCHANGE: "교환 요청",
    CONDITIONAL_ACCEPTANCE: "조건부 입고",
  }

  return labels[disposition] ?? disposition ?? "-"
}

export function getInspectionItemResultMeta(item) {
  if (item.acceptedQuantity == null || item.defectiveQuantity == null) {
    return {
      label: "검수 대기",
      badgeClassName: "border-slate-200 bg-slate-50 text-slate-500",
    }
  }

  if (Number(item.defectiveQuantity) === 0) {
    return {
      label: "합격",
      badgeClassName: "border-emerald-200 bg-emerald-50 text-emerald-600",
    }
  }

  if (Number(item.acceptedQuantity) === 0) {
    return {
      label: "불합격",
      badgeClassName: "border-rose-200 bg-rose-50 text-rose-500",
    }
  }

  return {
    label: "부분 합격",
    badgeClassName: "border-orange-200 bg-orange-50 text-orange-600",
  }
}

export const COMPLETED_INSPECTION_RESULT_FILTERS = {
  ALL: "ALL",
  PASS: "PASS",
  DEFECT: "DEFECT",
}

export const DEFAULT_COMPLETED_INSPECTION_FILTERS = {
  inspectionNumber: "",
  inboundNumber: "",
  orderNumber: "",
  supplierName: "전체 공급업체",
  warehouseName: "전체 창고",
  priority: "전체",
  receivedFrom: "",
  receivedTo: "",
  inspectionResult: "ALL",
}

export const COMPLETED_INSPECTION_TABLE_HEADERS = [
  "검수 번호",
  "입고 번호",
  "발주 번호",
  "공급업체",
  "입고 창고",
  "입고일",
  "검수 일시",
  "품목 수",
  "입고 수량",
  "합격 수량",
  "불량 수량",
  "상태",
  "관리",
]

export const INBOUND_STATUS_META = {
  EXPECTED: {
    label: "입고 예정",
    badgeClassName: "border-blue-200 bg-blue-50 text-blue-600",
  },
  DELAYED: {
    label: "납기 지연",
    badgeClassName: "border-rose-200 bg-rose-50 text-rose-500",
  },
  PARTIAL: {
    label: "부분 입고",
    badgeClassName: "border-amber-200 bg-amber-50 text-amber-600",
  },
  COMPLETED: {
    label: "입고 완료",
    badgeClassName: "border-emerald-200 bg-emerald-50 text-emerald-600",
  },
}

export const INBOUND_TABS = [
  { key: "EXPECTED", label: "입고 예정" },
  { key: "PARTIAL", label: "부분 입고" },
  { key: "COMPLETED", label: "입고 완료" },
]

export const DEFAULT_INBOUND_FILTERS = {
  orderNumber: "",
  supplierKeyword: "",
  itemKeyword: "",
  warehouseName: "전체 창고",
  expectedFrom: "",
  expectedTo: "",
  status: "전체 상태",
}

export const DEFAULT_INBOUND_PAGINATION = {
  page: 1,
  size: 10,
  totalElements: 0,
  totalPages: 1,
}

export function getInboundStatusMeta(status) {
  return (
    INBOUND_STATUS_META[status] ?? {
      label: status || "-",
      badgeClassName: "border-slate-200 bg-slate-50 text-slate-500",
    }
  )
}

export function formatNumber(value = 0) {
  return Number(value).toLocaleString("ko-KR")
}

export function createPageNumbers(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const pages = new Set([1, totalPages, currentPage])

  if (currentPage > 1) {
    pages.add(currentPage - 1)
  }

  if (currentPage < totalPages) {
    pages.add(currentPage + 1)
  }

  const sortedPages = [...pages].sort((a, b) => a - b)
  const result = []

  sortedPages.forEach((page, index) => {
    const previousPage = sortedPages[index - 1]

    if (index > 0 && page - previousPage > 1) {
      result.push(`ellipsis-${previousPage}-${page}`)
    }

    result.push(page)
  })

  return result
}

function escapeCsvCell(value) {
  const text = String(value ?? "")

  if (/[",\n]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`
  }

  return text
}

export function downloadInboundCsv(inbounds) {
  const headers = [
    "발주 번호",
    "공급업체",
    "발주일",
    "입고 예정일",
    "입고 창고",
    "품목 수",
    "발주 수량",
    "누적 입고",
    "미입고",
    "상태",
  ]

  const rows = inbounds.map((inbound) => [
    inbound.orderNumber,
    inbound.supplierName,
    inbound.orderedAt,
    inbound.expectedInboundAt,
    inbound.warehouseName,
    inbound.itemCount,
    inbound.orderQuantity,
    inbound.receivedQuantity,
    inbound.remainingQuantity,
    getInboundStatusMeta(inbound.status).label,
  ])

  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCsvCell).join(","))
    .join("\n")

  const blob = new Blob([`\uFEFF${csv}`], {
    type: "text/csv;charset=utf-8;",
  })

  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")

  link.href = url
  link.download = "inbound-list.csv"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

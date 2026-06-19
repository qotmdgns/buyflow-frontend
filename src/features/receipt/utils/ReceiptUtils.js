export const RECEIPT_STATUS_META = {
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

export const RECEIPT_TABS = [
  { key: "EXPECTED", label: "입고 예정" },
  { key: "PARTIAL", label: "부분 입고" },
  { key: "COMPLETED", label: "입고 완료" },
]

export const DEFAULT_RECEIPT_FILTERS = {
  orderNumber: "",
  supplierKeyword: "",
  itemKeyword: "",
  warehouseName: "전체 창고",
  expectedFrom: "",
  expectedTo: "",
  status: "전체 상태",
}

export const DEFAULT_RECEIPT_PAGINATION = {
  page: 1,
  size: 10,
  totalElements: 0,
  totalPages: 1,
}

export function getReceiptStatusMeta(status) {
  return (
    RECEIPT_STATUS_META[status] ?? {
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

export function downloadReceiptCsv(receipts) {
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

  const rows = receipts.map((receipt) => [
    receipt.orderNumber,
    receipt.supplierName,
    receipt.orderedAt,
    receipt.expectedReceiptAt,
    receipt.warehouseName,
    receipt.itemCount,
    receipt.orderQuantity,
    receipt.receivedQuantity,
    receipt.remainingQuantity,
    getReceiptStatusMeta(receipt.status).label,
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
  link.download = "receipt-list.csv"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const EMPTY_RECEIPT_FORM = {
  receiptNumber: "",
  targetReceiptId: "",
  orderNumber: "",
  supplierName: "",
  warehouseName: "",
  receivedAt: "",
  receiverName: "김철수",
  memo: "",
}

export function getTodayString() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

export function createReceiptForm() {
  return {
    ...EMPTY_RECEIPT_FORM,
    receivedAt: getTodayString(),
  }
}

export function createReceiptReceiptItem(item) {
  return {
    ...item,
    currentReceivedQuantity: 0,
  }
}

export function calculateReceiptReceiptSummary(items = []) {
  return items.reduce(
    (summary, item) => {
      const currentReceivedQuantity = Number(item.currentReceivedQuantity ?? 0)

      return {
        currentReceivedQuantity:
          summary.currentReceivedQuantity + currentReceivedQuantity,

        afterRemainingQuantity:
          summary.afterRemainingQuantity +
          Number(item.remainingQuantity ?? 0) -
          currentReceivedQuantity,
      }
    },
    {
      currentReceivedQuantity: 0,
      afterRemainingQuantity: 0,
    },
  )
}

export function validateReceiptReceiptForm(form, items = []) {
  const errors = {}

  if (!form.targetReceiptId) {
    errors.targetReceiptId = "입고 처리할 발주를 선택하세요."
  }

  if (!form.receivedAt) {
    errors.receivedAt = "실제 입고일을 입력하세요."
  }

  if (!String(form.receiverName ?? "").trim()) {
    errors.receiverName = "입고 담당자를 입력하세요."
  }

  if (!items.length) {
    errors.items = "입고 처리할 품목이 없습니다."
  } else if (
    items.every((item) => Number(item.currentReceivedQuantity ?? 0) === 0)
  ) {
    errors.items = "금회 입고 수량을 1개 이상 입력하세요."
  } else if (
    items.some(
      (item) =>
        Number(item.currentReceivedQuantity ?? 0) < 0 ||
        Number(item.currentReceivedQuantity ?? 0) >
          Number(item.remainingQuantity ?? 0),
    )
  ) {
    errors.items = "금회 입고 수량은 미입고 수량을 초과할 수 없습니다."
  }

  return errors
}

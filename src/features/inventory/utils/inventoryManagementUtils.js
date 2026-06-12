export const DEFAULT_INVENTORY_FILTERS = {
  itemCode: "",
  itemName: "",
  category: "전체",
  warehouseCode: "전체",
  stockStatus: "전체",
}

export const DEFAULT_HISTORY_FILTERS = {
  fromDate: "",
  toDate: "",
  itemKeyword: "",
  warehouseCode: "전체",
  movementType: "전체",
}

export const DEFAULT_PAGINATION = {
  page: 1,
  size: 10,
  totalElements: 0,
  totalPages: 1,
}

export const DEFAULT_INVENTORY_FILTER_OPTIONS = {
  categories: ["전체"],
  warehouses: [{ value: "전체", label: "전체" }],
  stockStatuses: ["전체", "정상", "안전재고 미만", "재고 없음"],
  movementTypes: ["전체", "입고", "재고 조정 증가", "재고 조정 감소"],
}

export const INVENTORY_TABLE_HEADERS = [
  "품목 코드",
  "품목명",
  "카테고리",
  "창고",
  "보관 위치",
  "단위",
  "현재 재고",
  "안전재고",
  "가용 차이",
  "재고 상태",
  "관리",
]

export const INVENTORY_HISTORY_TABLE_HEADERS = [
  "변경 일시",
  "변경 유형",
  "품목",
  "창고",
  "변경 수량",
  "변경 전",
  "변경 후",
  "참조 번호",
  "사유",
  "처리자",
]

export function getStockStatus(currentStock, safetyStock) {
  const current = Number(currentStock)
  const safety = Number(safetyStock)

  if (current <= 0) {
    return "재고 없음"
  }

  if (current < safety) {
    return "안전재고 미만"
  }

  return "정상"
}

export function formatNumber(value = 0) {
  return Number(value).toLocaleString("ko-KR")
}

export function formatSignedQuantity(value = 0) {
  const number = Number(value)

  return `${number > 0 ? "+" : ""}${formatNumber(number)}`
}

export function createPageNumbers(currentPage, totalPages) {
  if (totalPages <= 6) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, "ellipsis-right", totalPages]
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      "ellipsis-left",
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

function escapeCsvCell(value) {
  const text = String(value ?? "")

  if (!/[",\n]/.test(text)) {
    return text
  }

  return `"${text.replaceAll('"', '""')}"`
}

function downloadCsv(filename, headers, rows) {
  if (!rows.length) {
    window.alert("내보낼 데이터가 없습니다.")
    return
  }

  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCsvCell).join(","))
    .join("\n")

  const blob = new Blob(["\uFEFF", csv], {
    type: "text/csv;charset=utf-8;",
  })

  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")

  anchor.href = url
  anchor.download = filename

  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()

  URL.revokeObjectURL(url)
}

export function downloadInventoryCsv(inventories) {
  const rows = inventories.map((inventory) => [
    inventory.itemCode,
    inventory.itemName,
    inventory.category,
    inventory.warehouseName,
    inventory.locationCode,
    inventory.unit,
    inventory.currentStock,
    inventory.safetyStock,
    inventory.currentStock - inventory.safetyStock,
    getStockStatus(inventory.currentStock, inventory.safetyStock),
  ])

  downloadCsv(
    `inventory-list-${new Date().toISOString().slice(0, 10)}.csv`,
    INVENTORY_TABLE_HEADERS.slice(0, -1),
    rows,
  )
}

export function downloadInventoryHistoryCsv(histories) {
  const rows = histories.map((history) => [
    history.occurredAt,
    history.movementType,
    `${history.itemCode} ${history.itemName}`,
    history.warehouseName,
    formatSignedQuantity(history.quantity),
    history.beforeStock,
    history.afterStock,
    history.referenceNumber,
    history.reason,
    history.processedBy,
  ])

  downloadCsv(
    `inventory-history-${new Date().toISOString().slice(0, 10)}.csv`,
    INVENTORY_HISTORY_TABLE_HEADERS,
    rows,
  )
}

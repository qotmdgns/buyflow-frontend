export const DEFAULT_WAREHOUSE_FILTERS = {
  warehouseCode: "",
  warehouseName: "",
  manager: "",
  activeStatus: "전체",
}

export const DEFAULT_WAREHOUSE_PAGINATION = {
  page: 1,
  size: 10,
  totalElements: 0,
  totalPages: 1,
}

export const DEFAULT_WAREHOUSE_FILTER_OPTIONS = {
  activeStatuses: ["전체", "사용 중", "사용 중지"],
}

export const WAREHOUSE_TABLE_HEADERS = [
  "창고 코드",
  "창고명",
  "위치(주소)",
  "사용 여부",
  "담당자",
  "연락처",
  "등록일",
  "관리",
]

export function createPageNumbers(currentPage, totalPages, visibleCount = 4) {
  if (totalPages <= visibleCount) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  let startPage = Math.max(1, currentPage - 1)
  let endPage = Math.min(totalPages, startPage + visibleCount - 1)

  if (endPage - startPage + 1 < visibleCount) {
    startPage = Math.max(1, endPage - visibleCount + 1)
  }

  return Array.from(
    { length: endPage - startPage + 1 },
    (_, index) => startPage + index,
  )
}

function escapeCsvCell(value) {
  const text = String(value ?? "")

  if (!/[",\n]/.test(text)) {
    return text
  }

  return `"${text.replaceAll('"', '""')}"`
}

export function downloadWarehouseCsv(warehouses) {
  if (!warehouses.length) {
    window.alert("내보낼 창고 데이터가 없습니다.")
    return
  }

  const header = [
    "창고 코드",
    "창고명",
    "위치(주소)",
    "사용 여부",
    "담당자",
    "연락처",
    "등록일",
  ]

  const rows = warehouses.map((warehouse) => [
    warehouse.code,
    warehouse.name,
    warehouse.address,
    warehouse.activeStatus,
    warehouse.manager,
    warehouse.phone,
    warehouse.registeredAt,
  ])

  const csv = [header, ...rows]
    .map((row) => row.map(escapeCsvCell).join(","))
    .join("\n")

  const blob = new Blob(["\uFEFF", csv], {
    type: "text/csv;charset=utf-8;",
  })

  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")

  anchor.href = url
  anchor.download = `warehouse-list-${new Date().toISOString().slice(0, 10)}.csv`

  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()

  URL.revokeObjectURL(url)
}

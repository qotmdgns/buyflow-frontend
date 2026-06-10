export const WAREHOUSE_TYPE_OPTIONS = [
  "일반 창고",
  "냉장 창고",
  "냉동 창고",
  "위험물 창고",
  "보세 창고",
]

export const DEFAULT_WAREHOUSE_FILTERS = {
  type: "전체",
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
  warehouseTypes: ["전체", ...WAREHOUSE_TYPE_OPTIONS],
  activeStatuses: ["전체", "사용 중", "사용 중지"],
}

export const EMPTY_WAREHOUSE_FORM = {
  code: "",
  name: "",
  type: "일반 창고",
  activeStatus: "사용 중",
  baseAddress: "",
  detailAddress: "",
  manager: "",
  phone: "",
  memo: "",
}

export const WAREHOUSE_TABLE_HEADERS = [
  "창고 유형",
  "창고명",
  "위치(주소)",
  "사용 여부",
  "담당자",
  "연락처",
  "등록일",
  "관리",
]

export function buildWarehouseAddress(baseAddress, detailAddress) {
  return [baseAddress?.trim(), detailAddress?.trim()].filter(Boolean).join(" ")
}

export function validateWarehouseForm(form) {
  const errors = {}

  if (!form.code.trim()) {
    errors.code = "창고 코드를 입력하세요."
  } else if (!/^WH-[A-Z0-9-]+$/i.test(form.code.trim())) {
    errors.code = "창고 코드는 WH- 형식으로 입력하세요. 예: WH-001"
  }

  if (!form.name.trim()) {
    errors.name = "창고명을 입력하세요."
  }

  if (!form.baseAddress.trim()) {
    errors.baseAddress = "기본 주소를 입력하세요."
  }

  if (
    form.phone.trim() &&
    !/^0\d{1,2}-\d{3,4}-\d{4}$/.test(form.phone.trim())
  ) {
    errors.phone = "연락처 형식을 확인하세요. 예: 010-1234-5678"
  }

  return errors
}

export function createPageNumbers(currentPage, totalPages) {
  if (totalPages <= 6) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  if (currentPage <= 4) {
    return [1, 2, 3, "ellipsis-right", totalPages]
  }

  if (currentPage >= totalPages - 3) {
    return [1, "ellipsis-left", totalPages - 2, totalPages - 1, totalPages]
  }

  return [1, "ellipsis-left", currentPage, "ellipsis-right", totalPages]
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
    "창고 유형",
    "창고명",
    "위치(주소)",
    "사용 여부",
    "담당자",
    "연락처",
    "등록일",
  ]

  const rows = warehouses.map((warehouse) => [
    warehouse.type,
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

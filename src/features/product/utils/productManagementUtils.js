export const DEFAULT_FILTERS = {
  itemCode: "",
  itemName: "",
  category: "전체",
  unit: "전체",
  activeStatus: "사용",
}

export const DEFAULT_PAGINATION = {
  page: 1,
  size: 15,
  totalElements: 0,
  totalPages: 1,
}

export const DEFAULT_FILTER_OPTIONS = {
  categories: ["전체"],
  units: ["전체"],
  activeStatuses: ["전체", "사용", "미사용"],
}

export const PRODUCT_TABLE_HEADERS = [
  "품목 코드",
  "품목명",
  "카테고리",
  "규격",
  "단위",
  "기준 단가",
  "사용 여부",
  "등록일",
  "수정일",
  "관리",
]

export function formatWon(value = 0) {
  return `₩${Number(value).toLocaleString("ko-KR")}`
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

export function downloadProductCsv(products) {
  const headers = [
    "품목 코드",
    "품목명",
    "카테고리",
    "규격",
    "단위",
    "기준 단가",
    "사용 여부",
    "등록일",
    "수정일",
  ]

  const rows = products.map((product) => [
    product.code,
    product.name,
    product.category,
    product.spec,
    product.unit,
    product.unitPrice,
    product.isActive ? "사용" : "미사용",
    product.registeredAt,
    product.updatedAt,
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
  link.download = "품목관리.csv"

  document.body.appendChild(link)
  link.click()
  link.remove()

  URL.revokeObjectURL(url)
}

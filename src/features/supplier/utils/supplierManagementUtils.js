export const DEFAULT_SUPPLIER_FILTERS = {
  supplierCode: "",
  supplierName: "",
  manager: "",
  tradeStatus: "전체",
}

export const DEFAULT_SUPPLIER_PAGINATION = {
  page: 1,
  size: 15,
  totalElements: 0,
  totalPages: 1,
}

export const DEFAULT_SUPPLIER_FILTER_OPTIONS = {
  tradeStatuses: ["전체", "거래중", "거래중지"],
}

export const SUPPLIER_TABLE_HEADERS = [
  "공급업체 코드",
  "공급업체명",
  "사업자 등록번호",
  "담당자",
  "연락처",
  "이메일",
  "주소",
  "상태",
  "등록일",
  "관리",
]

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

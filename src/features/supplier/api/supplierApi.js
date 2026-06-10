import {
  mockSuppliers,
  supplierFilterOptions,
} from "@/features/supplier/data/mockSupplierData"

const USE_MOCK = process.env.NEXT_PUBLIC_USE_SUPPLIER_MOCK !== "false"

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

function includesKeyword(value, keyword) {
  return value.toLowerCase().includes(keyword.trim().toLowerCase())
}

function getMockSuppliers(params) {
  const {
    page = 1,
    size = 10,
    supplierCode = "",
    supplierName = "",
    manager = "",
    tradeStatus = "전체",
  } = params

  const filteredSuppliers = mockSuppliers.filter((supplier) => {
    const matchesSupplierCode =
      !supplierCode || includesKeyword(supplier.code, supplierCode)

    const matchesSupplierName =
      !supplierName || includesKeyword(supplier.name, supplierName)

    const matchesManager =
      !manager || includesKeyword(supplier.manager, manager)

    const matchesTradeStatus =
      tradeStatus === "전체" || supplier.tradeStatus === tradeStatus

    return (
      matchesSupplierCode &&
      matchesSupplierName &&
      matchesManager &&
      matchesTradeStatus
    )
  })

  const totalElements = filteredSuppliers.length
  const totalPages = Math.max(1, Math.ceil(totalElements / size))

  const safePage = Math.min(Math.max(page, 1), totalPages)

  const offset = (safePage - 1) * size

  return {
    items: filteredSuppliers.slice(offset, offset + size),
    pagination: {
      page: safePage,
      size,
      totalElements,
      totalPages,
    },
  }
}

function normalizeSupplierResponse(data) {
  if (Array.isArray(data.items) && data.pagination) {
    return data
  }

  return {
    items: data.content ?? [],
    pagination: {
      page: (data.number ?? 0) + 1,
      size: data.size ?? 10,
      totalElements: data.totalElements ?? 0,
      totalPages: Math.max(data.totalPages ?? 1, 1),
    },
  }
}

export async function fetchSuppliers(params = {}) {
  if (USE_MOCK) {
    await wait(150)
    return getMockSuppliers(params)
  }

  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === "" || value === "전체") {
      return
    }

    // 화면에서는 1페이지부터 표시하고,
    // Spring Pageable에는 0페이지부터 전달합니다.
    query.set(key, key === "page" ? String(Number(value) - 1) : String(value))
  })

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/suppliers?${query.toString()}`,
    { cache: "no-store" },
  )

  if (!response.ok) {
    throw new Error("공급업체 목록을 불러오지 못했습니다.")
  }

  return normalizeSupplierResponse(await response.json())
}

export async function fetchSupplierFilterOptions() {
  if (USE_MOCK) {
    return supplierFilterOptions
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/suppliers/filter-options`,
    { cache: "no-store" },
  )

  if (!response.ok) {
    throw new Error("공급업체 검색 조건을 불러오지 못했습니다.")
  }

  return response.json()
}

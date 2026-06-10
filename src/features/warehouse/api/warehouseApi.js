import {
  mockWarehouses,
  warehouseFilterOptions,
} from "@/features/warehouse/data/mockWarehouseData"

const USE_MOCK = process.env.NEXT_PUBLIC_USE_WAREHOUSE_MOCK !== "false"

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

function includesKeyword(value, keyword) {
  return value.toLowerCase().includes(keyword.trim().toLowerCase())
}

function getMockWarehouses(params) {
  const {
    page = 1,
    size = 10,
    warehouseCode = "",
    warehouseName = "",
    manager = "",
    activeStatus = "전체",
  } = params

  const filteredWarehouses = mockWarehouses.filter((warehouse) => {
    const matchesWarehouseCode =
      !warehouseCode || includesKeyword(warehouse.code, warehouseCode)

    const matchesWarehouseName =
      !warehouseName || includesKeyword(warehouse.name, warehouseName)

    const matchesManager =
      !manager || includesKeyword(warehouse.manager, manager)

    const matchesActiveStatus =
      activeStatus === "전체" || warehouse.activeStatus === activeStatus

    return (
      matchesWarehouseCode &&
      matchesWarehouseName &&
      matchesManager &&
      matchesActiveStatus
    )
  })

  const totalElements = filteredWarehouses.length
  const totalPages = Math.max(1, Math.ceil(totalElements / size))
  const safePage = Math.min(Math.max(page, 1), totalPages)
  const offset = (safePage - 1) * size

  return {
    items: filteredWarehouses.slice(offset, offset + size),
    pagination: {
      page: safePage,
      size,
      totalElements,
      totalPages,
    },
  }
}

function normalizeWarehouseResponse(data) {
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

export async function fetchWarehouses(params = {}) {
  if (USE_MOCK) {
    await wait(150)
    return getMockWarehouses(params)
  }

  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === "" || value === "전체") {
      return
    }

    query.set(key, key === "page" ? String(Number(value) - 1) : String(value))
  })

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/warehouses?${query.toString()}`,
    { cache: "no-store" },
  )

  if (!response.ok) {
    throw new Error("창고 목록을 불러오지 못했습니다.")
  }

  return normalizeWarehouseResponse(await response.json())
}

export async function fetchWarehouseFilterOptions() {
  if (USE_MOCK) {
    return warehouseFilterOptions
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/warehouses/filter-options`,
    { cache: "no-store" },
  )

  if (!response.ok) {
    throw new Error("창고 검색 조건을 불러오지 못했습니다.")
  }

  return response.json()
}

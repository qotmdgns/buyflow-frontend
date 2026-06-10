import {
  mockWarehouses,
  warehouseFilterOptions,
} from "@/features/warehouse/data/mockWarehouseData"
import { buildWarehouseAddress } from "@/features/warehouse/utils/warehouseManagementUtils"

const USE_MOCK = process.env.NEXT_PUBLIC_USE_WAREHOUSE_MOCK !== "false"

let warehouseDatabase = mockWarehouses.map((warehouse) => ({ ...warehouse }))

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

function includesKeyword(value, keyword) {
  return String(value ?? "")
    .toLowerCase()
    .includes(keyword.trim().toLowerCase())
}

function getTodayString() {
  return new Date().toISOString().slice(0, 10)
}

function createWarehouseRecord(payload, id, registeredAt = getTodayString()) {
  const baseAddress = payload.baseAddress.trim()
  const detailAddress = payload.detailAddress.trim()

  return {
    id,
    code: payload.code.trim().toUpperCase(),
    name: payload.name.trim(),
    type: payload.type,
    activeStatus: payload.activeStatus,
    baseAddress,
    detailAddress,
    address: buildWarehouseAddress(baseAddress, detailAddress),
    manager: payload.manager.trim(),
    phone: payload.phone.trim(),
    memo: payload.memo.trim(),
    registeredAt,
  }
}

function getMockWarehouses(params) {
  const {
    page = 1,
    size = 10,
    type = "전체",
    warehouseName = "",
    manager = "",
    activeStatus = "전체",
  } = params

  const filteredWarehouses = warehouseDatabase.filter((warehouse) => {
    const matchesWarehouseType = type === "전체" || warehouse.type === type

    const matchesWarehouseName =
      !warehouseName || includesKeyword(warehouse.name, warehouseName)

    const matchesManager =
      !manager || includesKeyword(warehouse.manager, manager)

    const matchesActiveStatus =
      activeStatus === "전체" || warehouse.activeStatus === activeStatus

    return (
      matchesWarehouseType &&
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

export async function fetchWarehouseById(warehouseId) {
  if (USE_MOCK) {
    await wait(100)

    const warehouse = warehouseDatabase.find(
      (item) => item.id === Number(warehouseId),
    )

    if (!warehouse) {
      throw new Error("창고 정보를 찾을 수 없습니다.")
    }

    return { ...warehouse }
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/warehouses/${warehouseId}`,
    { cache: "no-store" },
  )

  if (!response.ok) {
    throw new Error("창고 상세 정보를 불러오지 못했습니다.")
  }

  return response.json()
}

export async function createWarehouse(payload) {
  if (USE_MOCK) {
    await wait(200)

    const normalizedCode = payload.code.trim().toUpperCase()

    const duplicated = warehouseDatabase.some(
      (warehouse) => warehouse.code.toUpperCase() === normalizedCode,
    )

    if (duplicated) {
      throw new Error("이미 사용 중인 창고 코드입니다.")
    }

    const nextId =
      warehouseDatabase.reduce(
        (maximumId, warehouse) => Math.max(maximumId, warehouse.id),
        0,
      ) + 1

    const createdWarehouse = createWarehouseRecord(payload, nextId)

    warehouseDatabase = [createdWarehouse, ...warehouseDatabase]

    return createdWarehouse
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/warehouses`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  )

  if (!response.ok) {
    throw new Error("신규 창고를 등록하지 못했습니다.")
  }

  return response.json()
}

export async function updateWarehouse(warehouseId, payload) {
  if (USE_MOCK) {
    await wait(200)

    const targetIndex = warehouseDatabase.findIndex(
      (warehouse) => warehouse.id === Number(warehouseId),
    )

    if (targetIndex === -1) {
      throw new Error("수정할 창고 정보를 찾을 수 없습니다.")
    }

    const normalizedCode = payload.code.trim().toUpperCase()

    const duplicated = warehouseDatabase.some(
      (warehouse) =>
        warehouse.id !== Number(warehouseId) &&
        warehouse.code.toUpperCase() === normalizedCode,
    )

    if (duplicated) {
      throw new Error("이미 사용 중인 창고 코드입니다.")
    }

    const previousWarehouse = warehouseDatabase[targetIndex]

    const updatedWarehouse = createWarehouseRecord(
      payload,
      Number(warehouseId),
      previousWarehouse.registeredAt,
    )

    warehouseDatabase = warehouseDatabase.map((warehouse) =>
      warehouse.id === Number(warehouseId) ? updatedWarehouse : warehouse,
    )

    return updatedWarehouse
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/warehouses/${warehouseId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  )

  if (!response.ok) {
    throw new Error("창고 정보를 수정하지 못했습니다.")
  }

  return response.json()
}

export async function deleteWarehouse(warehouseId) {
  if (USE_MOCK) {
    await wait(150)

    const exists = warehouseDatabase.some(
      (warehouse) => warehouse.id === Number(warehouseId),
    )

    if (!exists) {
      throw new Error("삭제할 창고 정보를 찾을 수 없습니다.")
    }

    warehouseDatabase = warehouseDatabase.filter(
      (warehouse) => warehouse.id !== Number(warehouseId),
    )

    return
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/warehouses/${warehouseId}`,
    {
      method: "DELETE",
    },
  )

  if (!response.ok) {
    throw new Error("창고 정보를 삭제하지 못했습니다.")
  }
}

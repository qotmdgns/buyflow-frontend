import { apiFetch } from "@/lib/api/fetchClient"
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

function formatDate(value) {
  if (!value) {
    return ""
  }

  return String(value).slice(0, 10)
}

function toUseYn(activeStatus) {
  return activeStatus === "사용 중지" ? "N" : "Y"
}

function toActiveStatus(useYn) {
  return useYn === "N" ? "사용 중지" : "사용 중"
}

function toBackendPayload(payload, includeCode = true) {
  const result = {
    warehouseName: payload.name ? payload.name.trim() : (payload.warehouseName ? payload.warehouseName.trim() : ""),
    zipcode: payload.zipcode ? payload.zipcode.trim() : "",
    address: payload.baseAddress ? payload.baseAddress.trim() : (payload.address ? payload.address.trim() : ""),
    detailAddress: payload.detailAddress ? payload.detailAddress.trim() : "",
    contact: payload.phone ? payload.phone.trim() : (payload.contact ? payload.contact.trim() : ""),
    useYn: toUseYn(payload.activeStatus),
    type: payload.type,
    memo: payload.memo ? payload.memo.trim() : ""
  }

  result.warehouseCode = payload.code ? payload.code.trim().toUpperCase() : (payload.warehouseCode ? payload.warehouseCode.trim().toUpperCase() : "");

  if (payload.userId) {
    result.userId = payload.userId
  }

  if (payload.manager || payload.managerName) {
    const mgr = payload.manager || payload.managerName
    result.managerName = mgr.trim()
    result.manager = mgr.trim()
  }

  return result
}

function toFrontendWarehouse(data) {
  const baseAddress = data.baseAddress ?? data.address ?? ""
  const detailAddress = data.detailAddress ?? ""

  return {
    id: data.id ?? data.warehouseCode ?? data.code,
    code: data.code ?? data.warehouseCode ?? "",
    name: data.name ?? data.warehouseName ?? "",
    type: data.type ?? "",
    zipcode: data.zipcode ?? "",
    baseAddress,
    detailAddress,
    address: buildWarehouseAddress(baseAddress, detailAddress),
    activeStatus: data.activeStatus ?? toActiveStatus(data.useYn),
    manager: data.manager ?? data.managerName ?? "",
    userId: data.userId ?? data.user?.userId ?? "",
    phone: data.phone ?? data.contact ?? "",
    memo: data.memo ?? "",
    registeredAt: data.registeredAt ?? formatDate(data.createdAt),
    updatedAt: data.updatedAt ? formatDate(data.updatedAt) : "",
  }
}

async function readJsonOrNull(response) {
  const text = await response.text()

  if (!text) {
    return null
  }

    return JSON.parse(text)
  }


function createWarehouseRecord(payload, id, registeredAt = getTodayString()) {
  const zipcode = payload.zipcode.trim()
  const baseAddress = payload.baseAddress.trim()
  const detailAddress = payload.detailAddress.trim()

  return {
    id,
    code: payload.code.trim().toUpperCase(),
    name: payload.name.trim(),
    type: payload.type,
    zipcode,
    activeStatus: payload.activeStatus,
    baseAddress,
    detailAddress,
    address: buildWarehouseAddress(baseAddress, detailAddress),
    manager: payload.manager.trim(),
    userId: payload.userId,
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
  if (Array.isArray(data)) {
    return {
      items: data.map(toFrontendWarehouse),
      pagination: {
        page: 1,
        size: data.length,
        totalElements: data.length,
        totalPages: 1,
      },
    }
  }

  if (Array.isArray(data.items) && data.pagination) {
    return {
      items: data.items.map(toFrontendWarehouse),
      pagination: data.pagination,
    }
  }

  return {
    items: (data.content ?? []).map(toFrontendWarehouse),
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
  if (params.warehouseName) query.set("warehouseName", params.warehouseName)
  if (params.type && params.type !== "전체") query.set("type", params.type)
  if (params.useYn && params.useYn !== "전체") query.set("useYn", toUseYn(params.useYn))
  if (params.managerName) query.set("managerName", params.managerName)

  const queryString = query.toString() ? `?${query.toString()}` : ""
  const data = await apiFetch(`/api/warehouses${queryString}`, { method: "GET" })

  return normalizeWarehouseResponse(data)
}

export async function fetchWarehouseFilterOptions() {
  if (USE_MOCK) return warehouseFilterOptions

  const data = await apiFetch(`/api/warehouses/filter-options`, { method: "GET" })
  return data
}

export async function fetchWarehouseById(warehouseCode) {
  if (USE_MOCK) {
    await wait(100)
    const warehouse = warehouseDatabase.find((item) => item.id === Number(warehouseCode))
    if (!warehouse) throw new Error("창고 정보를 찾을 수 없습니다.")
    return { ...warehouse }
  }

  const data = await apiFetch(`/api/warehouses/${warehouseCode}`, { method: "GET" })
  return toFrontendWarehouse(data)
}

export async function createWarehouse(payload) {
  if (USE_MOCK) {
    await wait(200)
    const normalizedCode = payload.code.trim().toUpperCase()
    const duplicated = warehouseDatabase.some((w) => w.code.toUpperCase() === normalizedCode)
    if (duplicated) throw new Error("이미 사용 중인 창고 코드입니다.")

    const nextId = warehouseDatabase.reduce((max, w) => Math.max(max, w.id), 0) + 1
    const createdWarehouse = createWarehouseRecord(payload, nextId)
    warehouseDatabase = [createdWarehouse, ...warehouseDatabase]
    return createdWarehouse
  }

  const data = await apiFetch(`/api/warehouses`, {
    method: "POST",
    body: JSON.stringify(toBackendPayload(payload)),
  })

  if (data) {
    return toFrontendWarehouse(data)
  }
  return createWarehouseRecord(payload, payload.code.trim().toUpperCase())
}

export async function updateWarehouse(warehouseCode, payload) {
  if (USE_MOCK) {
    await wait(200)
    const targetIndex = warehouseDatabase.findIndex((w) => w.id === Number(warehouseCode))
    if (targetIndex === -1) throw new Error("수정할 창고 정보를 찾을 수 없습니다.")

    const normalizedCode = payload.code.trim().toUpperCase()
    const duplicated = warehouseDatabase.some((w) => w.id !== Number(warehouseCode) && w.code.toUpperCase() === normalizedCode)
    if (duplicated) throw new Error("이미 사용 중인 창고 코드입니다.")

    const previousWarehouse = warehouseDatabase[targetIndex]
    const updatedWarehouse = createWarehouseRecord(payload, Number(warehouseCode), previousWarehouse.updatedAt)
    warehouseDatabase = warehouseDatabase.map((w) => w.id === Number(warehouseCode) ? updatedWarehouse : w)
    return updatedWarehouse
  }

  const data = await apiFetch(`/api/warehouses/${warehouseCode}`, {
    method: "PATCH",
    body: JSON.stringify(toBackendPayload(payload, false)),
  })

  if (data) {
    return toFrontendWarehouse(data)
  }
  return createWarehouseRecord(payload, warehouseCode)
}

export async function deleteWarehouse(warehouseCode) {
  if (USE_MOCK) {
    await wait(150)
    const exists = warehouseDatabase.some((w) => w.id === Number(warehouseCode))
    if (!exists) throw new Error("삭제할 창고 정보를 찾을 수 없습니다.")
    warehouseDatabase = warehouseDatabase.filter((w) => w.id !== Number(warehouseCode))
    return
  }

  await apiFetch(`/api/warehouses/${warehouseCode}`, { method: "DELETE" })
}

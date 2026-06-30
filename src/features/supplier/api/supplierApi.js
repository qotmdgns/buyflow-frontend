import { apiFetch, getApiUrl } from "@/lib/api/fetchClient"
import { getAccessToken } from "@/utils/authStorage"
import {
  mockSuppliers,
  supplierFilterOptions,
} from "@/features/supplier/data/mockSupplierData"

const USE_MOCK = process.env.NEXT_PUBLIC_USE_SUPPLIER_MOCK !== "false"

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

function includesKeyword(value, keyword) {
  return String(value ?? "")
    .toLowerCase()
    .includes(keyword.trim().toLowerCase())
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
    return {
      ...data,
      items: data.items.map(normalizeSupplierDetailResponse),
    }
  }

  return {
    items: (data.content ?? []).map(normalizeSupplierDetailResponse),
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

  // apiFetch: JWT 토큰 자동 첨부 + base URL 기본값 + ApiResponse 언래핑
  const data = await apiFetch(`/api/suppliers?${query.toString()}`, {
    cache: "no-store",
  })

  return normalizeSupplierResponse(data)
}

export async function fetchSupplierFilterOptions() {
  if (USE_MOCK) {
    return supplierFilterOptions
  }

  return apiFetch("/api/suppliers/filter-options", { cache: "no-store" })
}

const SUPPLIER_TRADE_STATUS_LABELS = {
  ACTIVE: "거래중",
  STOPPED: "거래중지",
  INACTIVE: "거래중지",
}

function toTradeStatusCode(value) {
  if (value === "거래중" || value === "ACTIVE") {
    return "ACTIVE"
  }

  if (value === "거래중지" || value === "STOPPED" || value === "INACTIVE") {
    return "STOPPED"
  }

  return value || "ACTIVE"
}

function normalizeBusinessNumber(value) {
  return String(value ?? "").replace(/[^0-9]/g, "")
}

function toSupplierRequestPayload(form) {
  return {
    supplierCode: form.code?.trim() || null,
    supplierName: form.name?.trim() || "",
    businessNumber: normalizeBusinessNumber(form.businessNumber) || null,
    manager: form.manager?.trim() || null,
    phone: form.phone?.trim() || null,
    email: form.email?.trim() || null,
    address: form.address?.trim() || null,
    tradeStatus: toTradeStatusCode(form.tradeStatus),
  }
}

function normalizeSupplierDetailResponse(data) {
  const tradeStatusCode =
    data.tradeStatusCode ?? toTradeStatusCode(data.tradeStatus)

  return {
    id: data.id ?? data.supplierId,
    code: data.code ?? data.supplierCode ?? "",
    name: data.name ?? data.supplierName ?? "",
    businessNumber:
      data.businessNumber ?? data.businessRegistrationNumber ?? "",
    manager: data.manager ?? data.managerName ?? "",
    phone: data.phone ?? data.contactNumber ?? "",
    email: data.email ?? "",
    address: data.address ?? "",
    tradeStatus:
      SUPPLIER_TRADE_STATUS_LABELS[tradeStatusCode] ?? data.tradeStatus ?? "",
    tradeStatusCode,
    registeredAt:
      data.registeredAt ??
      data.createdAt?.slice?.(0, 10) ??
      data.createdAt ??
      "",
  }
}

export async function fetchSupplierById(supplierId) {
  if (!supplierId) {
    throw new Error("공급업체 ID가 없습니다.")
  }

  if (USE_MOCK) {
    await wait(100)

    const supplier = mockSuppliers.find(
      (item) => item.id === Number(supplierId),
    )

    if (!supplier) {
      throw new Error("공급업체 정보를 찾을 수 없습니다.")
    }

    return normalizeSupplierDetailResponse(supplier)
  }

  const data = await apiFetch(
    `/api/suppliers/${encodeURIComponent(supplierId)}`,
    { cache: "no-store" },
  )

  return normalizeSupplierDetailResponse(data)
}

export async function createSupplier(form) {
  if (USE_MOCK) {
    await wait(100)
    return normalizeSupplierDetailResponse({
      id: Date.now(),
      ...toSupplierRequestPayload(form),
    })
  }

  const data = await apiFetch("/api/suppliers", {
    method: "POST",
    body: JSON.stringify(toSupplierRequestPayload(form)),
  })

  return normalizeSupplierDetailResponse(data)
}

export async function updateSupplier(supplierId, form) {
  if (!supplierId) {
    throw new Error("수정할 공급업체 ID가 없습니다.")
  }

  if (USE_MOCK) {
    await wait(100)
    return normalizeSupplierDetailResponse({
      id: supplierId,
      ...toSupplierRequestPayload(form),
    })
  }

  const data = await apiFetch(
    `/api/suppliers/${encodeURIComponent(supplierId)}`,
    {
      method: "PUT",
      body: JSON.stringify(toSupplierRequestPayload(form)),
    },
  )

  return normalizeSupplierDetailResponse(data)
}

export async function downloadSupplierExcel() {
  if (USE_MOCK) {
    throw new Error("Mock 모드에서는 공급업체 엑셀 다운로드를 사용할 수 없습니다.")
  }

  const headers = new Headers()
  const token = getAccessToken()

  headers.set(
    "Accept",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  )

  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const response = await fetch(getApiUrl("/api/suppliers/excel"), {
    method: "GET",
    headers,
  })

  if (!response.ok) {
    throw new Error("공급업체 엑셀 다운로드에 실패했습니다.")
  }

  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.download = `공급업체목록_${new Date()
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "")}.xlsx`

  document.body.appendChild(link)
  link.click()
  link.remove()

  window.URL.revokeObjectURL(url)
}
import {
  inspectionFilterOptions,
  mockPendingInspections,
} from "@/features/inspection/data/mockInspectionData"

import {
  DEFAULT_INSPECTION_FILTER_OPTIONS,
  getTodayString,
  INSPECTION_SUMMARY_FILTERS,
  isInspectionOverdue,
} from "@/features/inspection/utils/inspectionManagementUtils"

import {
  getMockInspectionDetail,
  hasMockInspectionResult,
  saveMockInspectionResult,
} from "@/features/inspection/data/mockInspectionDetailData"

import { apiFetch } from "@/lib/api/fetchClient"

const USE_MOCK = process.env.NEXT_PUBLIC_USE_INSPECTION_MOCK === "true"

const INSPECTION_API_BASE = "/api/inspections"

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

function createApiUrl(path) {
  const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(
    /\/$/,
    "",
  )

  const normalizedPath = path.startsWith("/") ? path : `/${path}`

  return `${baseUrl}${normalizedPath}`
}

function includesKeyword(value, keyword) {
  return String(value ?? "")
    .toLowerCase()
    .includes(
      String(keyword ?? "")
        .trim()
        .toLowerCase(),
    )
}

function isWithinRange(value, from, to) {
  if (from && value < from) return false
  if (to && value > to) return false

  return true
}

function matchesSummaryFilter(inspection, summaryFilter, today) {
  switch (summaryFilter) {
    case INSPECTION_SUMMARY_FILTERS.TODAY:
      return inspection.receivedAt === today

    case INSPECTION_SUMMARY_FILTERS.URGENT:
      return inspection.priority === "긴급"

    case INSPECTION_SUMMARY_FILTERS.OVERDUE:
      return isInspectionOverdue(inspection, today)

    case INSPECTION_SUMMARY_FILTERS.ALL:
    default:
      return true
  }
}

function filterMockPendingInspections(params = {}) {
  const {
    inspectionNumber = "",
    receiptNumber = "",
    orderNumber = "",
    supplierName = "전체 공급업체",
    warehouseName = "전체 창고",
    priority = "전체",
    receivedFrom = "",
    receivedTo = "",
    summaryFilter = INSPECTION_SUMMARY_FILTERS.ALL,
  } = params

  const today = getTodayString()

  return mockPendingInspections.filter((inspection) => {
    if (hasMockInspectionResult(inspection.id)) {
      return false
    }

    return (
      matchesSummaryFilter(inspection, summaryFilter, today) &&
      (!inspectionNumber ||
        includesKeyword(inspection.inspectionNumber, inspectionNumber)) &&
      (!receiptNumber ||
        includesKeyword(inspection.receiptNumber, receiptNumber)) &&
      (!orderNumber || includesKeyword(inspection.orderNumber, orderNumber)) &&
      (supplierName === "전체 공급업체" ||
        inspection.supplierName === supplierName) &&
      (warehouseName === "전체 창고" ||
        inspection.warehouseName === warehouseName) &&
      (priority === "전체" || inspection.priority === priority) &&
      isWithinRange(inspection.receivedAt, receivedFrom, receivedTo)
    )
  })
}

function getMockPendingInspections(params = {}) {
  const page = Number(params.page ?? 1)

  const size = Number(params.size ?? 15)

  const filteredInspections = filterMockPendingInspections(params)

  const totalElements = filteredInspections.length

  const totalPages = Math.max(1, Math.ceil(totalElements / size))

  const safePage = Math.min(Math.max(page, 1), totalPages)

  const offset = (safePage - 1) * size

  return {
    items: filteredInspections.slice(offset, offset + size),

    pagination: {
      page: safePage,
      size,
      totalElements,
      totalPages,
    },
  }
}

function getMockPendingInspectionSummary() {
  const today = getTodayString()

  const pendingInspections = mockPendingInspections.filter(
    (inspection) => !hasMockInspectionResult(inspection.id),
  )

  return {
    total: pendingInspections.length,

    receivedToday: pendingInspections.filter(
      (inspection) => inspection.receivedAt === today,
    ).length,

    urgent: pendingInspections.filter(
      (inspection) => inspection.priority === "긴급",
    ).length,

    overdue: pendingInspections.filter((inspection) =>
      isInspectionOverdue(inspection, today),
    ).length,
  }
}

function createQueryString(params = {}) {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (
      value === "" ||
      value === "ALL" ||
      value === "전체" ||
      value === "전체 공급업체" ||
      value === "전체 창고"
    ) {
      return
    }

    // 화면은 1페이지부터 시작하지만
    // Spring Pageable은 0페이지부터 시작합니다.
    query.set(
      key,
      key === "page" ? String(Math.max(Number(value), 1)) : String(value),
    )
  })

  return query.toString()
}

function normalizeInspectionListResponse(data = {}) {
  const items = Array.isArray(data.items)
    ? data.items
    : Array.isArray(data.content)
      ? data.content
      : []

  if (data.pagination) {
    return {
      items: items.map(normalizeInspectionDetailResponse),
      pagination: data.pagination,
    }
  }

  return {
    items: items.map(normalizeInspectionDetailResponse),

    pagination: {
      page: data.page ?? (data.number ?? 0) + 1,
      size: data.size ?? 15,
      totalElements: data.totalElements ?? 0,
      totalPages: Math.max(data.totalPages ?? 1, 1),
    },
  }
}

function normalizeInspectionFilterOptions(data = {}) {
  return {
    suppliers: Array.isArray(data.suppliers)
      ? data.suppliers
      : DEFAULT_INSPECTION_FILTER_OPTIONS.suppliers,

    warehouses: Array.isArray(data.warehouses)
      ? data.warehouses
      : DEFAULT_INSPECTION_FILTER_OPTIONS.warehouses,

    priorities: Array.isArray(data.priorities)
      ? data.priorities
      : DEFAULT_INSPECTION_FILTER_OPTIONS.priorities,

    inspectionTypes: Array.isArray(data.inspectionTypes)
      ? data.inspectionTypes
      : [],

    inspectionResults: Array.isArray(data.inspectionResults)
      ? data.inspectionResults
      : [],

    dispositions: Array.isArray(data.dispositions) ? data.dispositions : [],
  }
}

function normalizeNumber(value, fallback = 0) {
  const numberValue = Number(value)

  if (!Number.isFinite(numberValue)) {
    return fallback
  }

  return numberValue
}

function normalizeInspectionItemResponse(item = {}) {
  const receivedQuantity = normalizeNumber(item.receivedQuantity)

  return {
    id: item.id ?? item.receiptItemId,
    receiptItemId: item.receiptItemId ?? item.id,

    itemCode: item.itemCode ?? "-",
    itemName: item.itemName ?? "-",
    category: item.category ?? "-",
    specification: item.specification ?? "-",
    unit: item.unit ?? "-",
    lotNumber: item.lotNumber ?? "-",

    receivedQuantity,
    acceptedQuantity:
      item.acceptedQuantity == null
        ? receivedQuantity
        : normalizeNumber(item.acceptedQuantity),

    defectiveQuantity:
      item.defectiveQuantity == null
        ? 0
        : normalizeNumber(item.defectiveQuantity),

    defectReason: item.defectReason ?? "",
    disposition: item.disposition ?? "NONE",
  }
}

function normalizeInspectionDetailResponse(data = {}) {
  const items = Array.isArray(data.items)
    ? data.items.map(normalizeInspectionItemResponse)
    : []

  const totalReceivedQuantity =
    data.totalReceivedQuantity ??
    items.reduce(
      (total, item) => total + normalizeNumber(item.receivedQuantity),
      0,
    )

  return {
    id: data.id,
    inspectionNumber: data.inspectionNumber ?? "-",
    receiptNumber: data.receiptNumber ?? "-",
    orderNumber: data.orderNumber ?? "-",
    supplierName: data.supplierName ?? "-",
    warehouseName: data.warehouseName ?? "-",
    receivedAt: data.receivedAt ?? "",
    inspectionDueAt: data.inspectionDueAt ?? "",
    priority: data.priority ?? "일반",
    status: data.status ?? data.inspectionResult?.status ?? "PENDING",
    receivedBy: data.receivedBy ?? "-",

    itemCount: data.itemCount ?? items.length,
    totalReceivedQuantity,

    items,

    inspectionResult: data.inspectionResult
      ? {
          status: data.inspectionResult.status ?? data.status ?? "PENDING",
          inspectorName: data.inspectionResult.inspectorName ?? "",
          inspectedAt: data.inspectionResult.inspectedAt ?? "",
          note: data.inspectionResult.note ?? "",
          items: Array.isArray(data.inspectionResult.items)
            ? data.inspectionResult.items.map(normalizeInspectionItemResponse)
            : items,
        }
      : null,
  }
}

export async function fetchPendingInspections(params = {}) {
  if (USE_MOCK) {
    await wait(150)

    return getMockPendingInspections(params)
  }

  const query = createQueryString(params)

  const path = query
    ? `${INSPECTION_API_BASE}/pending?${query}`
    : `${INSPECTION_API_BASE}/pending`

  const data = await apiFetch(path, {
    cache: "no-store",
  })

  return normalizeInspectionListResponse(data)
}

export async function fetchCompletedInspections(params = {}) {
  if (USE_MOCK) {
    await wait(150)

    return {
      items: [],
      pagination: {
        page: 1,
        size: 15,
        totalElements: 0,
        totalPages: 1,
      },
    }
  }

  const query = createQueryString(params)

  const path = query
    ? `${INSPECTION_API_BASE}/completed?${query}`
    : `${INSPECTION_API_BASE}/completed`

  const data = await apiFetch(path, {
    cache: "no-store",
  })

  return normalizeInspectionListResponse(data)
}

export async function fetchInspectionFilterOptions() {
  if (USE_MOCK) {
    return inspectionFilterOptions
  }

  const data = await apiFetch(`${INSPECTION_API_BASE}/pending/filter-options`, {
    cache: "no-store",
  })

  return normalizeInspectionFilterOptions(data)
}

export async function fetchPendingInspectionSummary() {
  if (USE_MOCK) {
    return getMockPendingInspectionSummary()
  }

  const data = await apiFetch(`${INSPECTION_API_BASE}/pending/summary`, {
    cache: "no-store",
  })

  return {
    total: Number(data.total ?? data.totalCount ?? data.pendingCount ?? 0),
    receivedToday: Number(data.receivedToday ?? 0),
    urgent: Number(data.urgent ?? 0),
    overdue: Number(data.overdue ?? 0),
  }
}

export async function fetchCompletedInspectionSummary() {
  if (USE_MOCK) {
    return {
      total: 0,
      pass: 0,
      defect: 0,
    }
  }

  const data = await apiFetch(`${INSPECTION_API_BASE}/completed/summary`, {
    cache: "no-store",
  })

  return {
    total: Number(data.total ?? data.totalCount ?? 0),
    pass: Number(data.pass ?? data.passCount ?? 0),
    defect: Number(data.defect ?? data.defectCount ?? 0),
  }
}

export async function fetchInspectionDetail(inspectionId) {
  if (!inspectionId) {
    throw new Error("검수 대기 ID가 없습니다.")
  }

  if (USE_MOCK) {
    await wait(150)

    const mockDetail = getMockInspectionDetail(inspectionId)

    if (!mockDetail) {
      throw new Error("존재하지 않는 검수 대기 건입니다.")
    }

    return normalizeInspectionDetailResponse(mockDetail)
  }

  const data = await apiFetch(
    `${INSPECTION_API_BASE}/${encodeURIComponent(inspectionId)}`,
    {
      cache: "no-store",
    },
  )

  return normalizeInspectionDetailResponse(data)
}

export async function submitInspectionResult(inspectionId, payload) {
  if (!inspectionId) {
    throw new Error("검수 대기 ID가 없습니다.")
  }

  if (USE_MOCK) {
    await wait(250)

    const savedInspection = saveMockInspectionResult(inspectionId, payload)

    if (!savedInspection) {
      throw new Error("존재하지 않는 검수 대기 건입니다.")
    }

    return normalizeInspectionDetailResponse(savedInspection)
  }

  await apiFetch(
    `${INSPECTION_API_BASE}/${encodeURIComponent(inspectionId)}/result`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  )

  return fetchInspectionDetail(inspectionId)
}

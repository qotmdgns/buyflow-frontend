import {
  inspectionFilterOptions,
  mockPendingInspections,
} from "@/features/inspection/data/mockInspectionData"

import {
  getTodayString,
  INSPECTION_SUMMARY_FILTERS,
  isInspectionOverdue,
} from "@/features/inspection/utils/inspectionManagementUtils"

import {
  getMockInspectionDetail,
  hasMockInspectionResult,
  saveMockInspectionResult,
} from "@/features/inspection/data/mockInspectionDetailData"

const USE_MOCK = process.env.NEXT_PUBLIC_USE_INSPECTION_MOCK !== "false"

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
    inboundNumber = "",
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
      (!inboundNumber ||
        includesKeyword(inspection.inboundNumber, inboundNumber)) &&
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

function normalizeInspectionListResponse(data) {
  if (Array.isArray(data.items) && data.pagination) {
    return data
  }

  return {
    items: data.content ?? [],

    pagination: {
      page: (data.number ?? 0) + 1,
      size: data.size ?? 15,
      totalElements: data.totalElements ?? 0,
      totalPages: Math.max(data.totalPages ?? 1, 1),
    },
  }
}

export async function fetchPendingInspections(params = {}) {
  if (USE_MOCK) {
    await wait(150)

    return getMockPendingInspections(params)
  }

  const query = createQueryString(params)

  const path = query
    ? `/api/inspections/pending?${query}`
    : "/api/inspections/pending"

  const response = await fetch(createApiUrl(path), {
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error("검수 대기 목록을 불러오지 못했습니다.")
  }

  return normalizeInspectionListResponse(await response.json())
}

export async function fetchInspectionFilterOptions() {
  if (USE_MOCK) {
    return inspectionFilterOptions
  }

  const response = await fetch(
    createApiUrl("/api/inspections/pending/filter-options"),
    {
      cache: "no-store",
    },
  )

  if (!response.ok) {
    throw new Error("검수 검색 조건을 불러오지 못했습니다.")
  }

  return response.json()
}

export async function fetchPendingInspectionSummary() {
  if (USE_MOCK) {
    return getMockPendingInspectionSummary()
  }

  const response = await fetch(
    createApiUrl("/api/inspections/pending/summary"),
    {
      cache: "no-store",
    },
  )

  if (!response.ok) {
    throw new Error("검수 대기 현황을 불러오지 못했습니다.")
  }

  return response.json()
}

function normalizeNullableNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null
  }

  return Number(value)
}

function normalizeInspectionDetailResponse(data) {
  const rawResult = data.inspectionResult ?? data.result ?? null

  const rawItems = rawResult?.items ?? data.items ?? data.inspectionItems ?? []

  const items = rawItems.map((item, index) => {
    const receiptItemId =
      item.receiptItemId ?? item.id ?? item.inspectionItemId ?? index + 1

    return {
      id: receiptItemId,

      receiptItemId,

      itemCode: item.itemCode ?? item.code ?? "",

      itemName: item.itemName ?? item.name ?? "",

      category: item.category ?? item.categoryName ?? "",

      specification: item.specification ?? item.spec ?? "",

      unit: item.unit ?? "",

      lotNumber: item.lotNumber ?? item.lotNo ?? "",

      receivedQuantity: Number(
        item.receivedQuantity ?? item.receiptQty ?? item.quantity ?? 0,
      ),

      acceptedQuantity: normalizeNullableNumber(
        item.acceptedQuantity ?? item.acceptedQty,
      ),

      defectiveQuantity: normalizeNullableNumber(
        item.defectiveQuantity ?? item.defectQuantity ?? item.defectQty,
      ),

      defectReason: item.defectReason ?? "",

      disposition: item.disposition ?? "NONE",
    }
  })

  const totalReceivedQuantity = items.reduce(
    (total, item) => total + Number(item.receivedQuantity ?? 0),

    0,
  )

  return {
    id: data.id ?? data.inspectionId,

    inspectionNumber: data.inspectionNumber ?? "",

    inboundNumber: data.inboundNumber ?? "",

    orderNumber: data.orderNumber ?? "",

    supplierName: data.supplierName ?? "",

    warehouseName: data.warehouseName ?? "",

    receivedAt: data.receivedAt ?? "",

    inspectionDueAt: data.inspectionDueAt ?? "",

    priority: data.priority ?? "일반",

    status: data.status ?? rawResult?.status ?? "PENDING",

    receivedBy: data.receivedBy ?? "",

    itemCount: Number(data.itemCount ?? items.length),

    totalReceivedQuantity: Number(
      data.totalReceivedQuantity ?? totalReceivedQuantity,
    ),

    items,

    inspectionResult: rawResult
      ? {
          status: rawResult.status ?? data.status,

          inspectorName: rawResult.inspectorName ?? "",

          inspectedAt: rawResult.inspectedAt ?? "",

          note: rawResult.note ?? "",

          items,
        }
      : null,
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

  const response = await fetch(
    createApiUrl(`/api/inspections/${encodeURIComponent(inspectionId)}`),

    {
      cache: "no-store",
    },
  )

  if (response.status === 404) {
    throw new Error("존재하지 않는 검수 대기 건입니다.")
  }

  if (!response.ok) {
    throw new Error("검수 상세 정보를 불러오지 못했습니다.")
  }

  return normalizeInspectionDetailResponse(await response.json())
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

  const response = await fetch(
    createApiUrl(`/api/inspections/${encodeURIComponent(inspectionId)}/result`),
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(payload),
    },
  )

  if (!response.ok) {
    throw new Error("검수 결과를 저장하지 못했습니다.")
  }

  return fetchInspectionDetail(inspectionId)
}

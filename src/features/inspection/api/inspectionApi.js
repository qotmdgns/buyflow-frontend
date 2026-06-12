import {
  inspectionFilterOptions,
  mockPendingInspections,
} from "@/features/inspection/data/mockInspectionData"

import {
  getTodayString,
  isInspectionOverdue,
} from "@/features/inspection/utils/inspectionManagementUtils"

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
  } = params

  return mockPendingInspections.filter((inspection) => {
    return (
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

  return {
    total: mockPendingInspections.length,

    receivedToday: mockPendingInspections.filter(
      (inspection) => inspection.receivedAt === today,
    ).length,

    urgent: mockPendingInspections.filter(
      (inspection) => inspection.priority === "긴급",
    ).length,

    overdue: mockPendingInspections.filter((inspection) =>
      isInspectionOverdue(inspection, today),
    ).length,
  }
}

function createQueryString(params = {}) {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (
      value === "" ||
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
      key === "page" ? String(Math.max(Number(value) - 1, 0)) : String(value),
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

  const response = await fetch(
    createApiUrl(`/api/inspections/pending?${query}`),
    {
      cache: "no-store",
    },
  )

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

import {
  mockPurchaseRequests,
  purchaseRequestFilterOptions,
} from "@/features/purchase-request/data/mockPurchaseRequestListData"
import { getMockPurchaseRequestDetail } from "@/features/purchase-request/data/mockPurchaseRequestDetailData"

const USE_MOCK = process.env.NEXT_PUBLIC_USE_PURCHASE_REQUEST_MOCK !== "false"

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

function includesKeyword(value, keyword) {
  return value.toLowerCase().includes(keyword.trim().toLowerCase())
}

function isWithinRange(value, from, to) {
  if (from && value < from) return false
  if (to && value > to) return false

  return true
}

function filterMockPurchaseRequests(params = {}) {
  const {
    requestNumber = "",
    title = "",
    requester = "",
    department = "전체 부서",
    status = "전체",
    priority = "전체",
    requestedFrom = "",
    requestedTo = "",
    desiredInboundFrom = "",
    desiredInboundTo = "",
  } = params

  return mockPurchaseRequests.filter((request) => {
    const matchesRequestNumber =
      !requestNumber || includesKeyword(request.requestNumber, requestNumber)

    const matchesTitle = !title || includesKeyword(request.title, title)

    const matchesRequester =
      !requester || includesKeyword(request.requester, requester)

    const matchesDepartment =
      department === "전체 부서" || request.department === department

    const matchesStatus = status === "전체" || request.status === status

    const matchesPriority = priority === "전체" || request.priority === priority

    const matchesRequestedAt = isWithinRange(
      request.requestedAt,
      requestedFrom,
      requestedTo,
    )

    const matchesDesiredInboundAt = isWithinRange(
      request.desiredInboundAt,
      desiredInboundFrom,
      desiredInboundTo,
    )

    return (
      matchesRequestNumber &&
      matchesTitle &&
      matchesRequester &&
      matchesDepartment &&
      matchesStatus &&
      matchesPriority &&
      matchesRequestedAt &&
      matchesDesiredInboundAt
    )
  })
}

function getMockPurchaseRequests(params = {}) {
  const { page = 1, size = 10 } = params
  const filteredRequests = filterMockPurchaseRequests(params)

  const totalElements = filteredRequests.length
  const totalPages = Math.max(1, Math.ceil(totalElements / size))
  const safePage = Math.min(Math.max(page, 1), totalPages)
  const offset = (safePage - 1) * size

  return {
    items: filteredRequests.slice(offset, offset + size),
    pagination: {
      page: safePage,
      size,
      totalElements,
      totalPages,
    },
  }
}

function getMockPurchaseRequestSummary() {
  const statusCounts = mockPurchaseRequests.reduce(
    (counts, request) => ({
      ...counts,
      [request.status]: (counts[request.status] ?? 0) + 1,
    }),
    {},
  )

  return {
    total: mockPurchaseRequests.length,
    draft: statusCounts["임시 저장"] ?? 0,
    pending: statusCounts["승인 대기"] ?? 0,
    approved: statusCounts["승인 완료"] ?? 0,
    rejected: statusCounts["반려"] ?? 0,
    ordered: statusCounts["발주 완료"] ?? 0,
  }
}

function normalizePurchaseRequestResponse(data) {
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

function createQueryString(params) {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (
      value === "" ||
      value === false ||
      value === "전체" ||
      value === "전체 부서"
    ) {
      return
    }

    // 화면은 1페이지부터 시작하지만 Spring Pageable은 0페이지부터 시작합니다.
    query.set(key, key === "page" ? String(Number(value) - 1) : String(value))
  })

  return query.toString()
}

export async function fetchPurchaseRequests(params = {}) {
  if (USE_MOCK) {
    await wait(150)
    return getMockPurchaseRequests(params)
  }

  const query = createQueryString(params)

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/purchase-requests?${query}`,
    { cache: "no-store" },
  )

  if (!response.ok) {
    throw new Error("구매 요청 목록을 불러오지 못했습니다.")
  }

  return normalizePurchaseRequestResponse(await response.json())
}

export async function fetchPurchaseRequestFilterOptions() {
  if (USE_MOCK) {
    return purchaseRequestFilterOptions
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/purchase-requests/filter-options`,
    { cache: "no-store" },
  )

  if (!response.ok) {
    throw new Error("구매 요청 검색 조건을 불러오지 못했습니다.")
  }

  return response.json()
}

export async function fetchPurchaseRequestSummary() {
  if (USE_MOCK) {
    return getMockPurchaseRequestSummary()
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/purchase-requests/summary`,
    { cache: "no-store" },
  )

  if (!response.ok) {
    throw new Error("구매 요청 현황을 불러오지 못했습니다.")
  }

  return response.json()
}

const PURCHASE_REQUEST_STATUS_LABELS = {
  DRAFT: "임시 저장",
  PENDING: "승인 대기",
  APPROVED: "승인 완료",
  REJECTED: "반려",
  ORDERED: "발주 완료",
}

const PURCHASE_REQUEST_PRIORITY_LABELS = {
  NORMAL: "일반",
  URGENT: "긴급",
}

function createApiUrl(path) {
  const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(
    /\/$/,
    "",
  )
  const normalizedPath = path.startsWith("/") ? path : `/${path}`

  return `${baseUrl}${normalizedPath}`
}

function normalizeDownloadUrl(downloadUrl) {
  if (!downloadUrl) {
    return ""
  }

  if (/^https?:\/\//i.test(downloadUrl)) {
    return downloadUrl
  }

  return createApiUrl(downloadUrl)
}

function normalizePurchaseRequestDetailResponse(data) {
  const rawItems = data.items ?? data.requestItems ?? []

  const items = rawItems.map((item, index) => {
    const requestQuantity = Number(item.requestQuantity ?? item.quantity ?? 0)

    const estimatedUnitPrice = Number(
      item.estimatedUnitPrice ?? item.unitPrice ?? 0,
    )

    return {
      id: item.id ?? item.requestItemId ?? index + 1,
      itemCode: item.itemCode ?? item.code ?? "",
      itemName: item.itemName ?? item.name ?? "",
      category: item.category ?? item.categoryName ?? "",
      specification: item.specification ?? item.spec ?? "",
      requestQuantity,
      unit: item.unit ?? "",
      estimatedUnitPrice,
      estimatedAmount: Number(
        item.estimatedAmount ?? estimatedUnitPrice * requestQuantity,
      ),
      remark: item.remark ?? "",
      createdAt: item.createdAt ?? "",
      updatedAt: item.updatedAt ?? "",
    }
  })

  const attachments = (data.attachments ?? data.files ?? []).map(
    (attachment, index) => ({
      id: attachment.id ?? attachment.attachmentId ?? index + 1,
      fileName: attachment.fileName ?? attachment.originalFileName ?? "",
      downloadUrl: normalizeDownloadUrl(attachment.downloadUrl),
    }),
  )

  const calculatedTotalAmount = items.reduce(
    (total, item) => total + item.estimatedAmount,
    0,
  )

  return {
    id: data.id ?? data.requestId,
    requestNumber: data.requestNumber ?? "",
    title: data.title ?? data.requestTitle ?? "",
    requester: data.requester ?? data.requesterName ?? "",
    department: data.department ?? data.departmentName ?? "",
    requestedAt: data.requestedAt ?? data.requestDate ?? "",
    desiredInboundAt: data.desiredInboundAt ?? data.expectedDate ?? "",
    createdAt: data.createdAt ?? data.requestedAt ?? data.requestDate ?? "",
    updatedAt: data.updatedAt ?? "",
    priority:
      PURCHASE_REQUEST_PRIORITY_LABELS[data.priority] ?? data.priority ?? "",
    status: PURCHASE_REQUEST_STATUS_LABELS[data.status] ?? data.status ?? "",
    reason: data.reason ?? data.requestReason ?? "",
    totalAmount: Number(data.totalAmount ?? calculatedTotalAmount),
    items,
    attachments,
  }
}

export async function fetchPurchaseRequestDetail(requestId) {
  if (!requestId) {
    throw new Error("구매 요청 ID가 없습니다.")
  }

  if (USE_MOCK) {
    await wait(150)

    const mockDetail = getMockPurchaseRequestDetail(requestId)

    if (!mockDetail) {
      throw new Error("존재하지 않는 구매 요청입니다.")
    }

    return normalizePurchaseRequestDetailResponse(mockDetail)
  }

  const response = await fetch(
    createApiUrl(`/api/purchase-requests/${encodeURIComponent(requestId)}`),
    {
      cache: "no-store",
    },
  )

  if (response.status === 404) {
    throw new Error("존재하지 않는 구매 요청입니다.")
  }

  if (!response.ok) {
    throw new Error("구매 요청 상세 정보를 불러오지 못했습니다.")
  }

  return normalizePurchaseRequestDetailResponse(await response.json())
}

export async function createPurchaseRequest(payload) {
  const response = await fetch(createApiUrl("/api/purchase-requests"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("구매 요청 등록에 실패했습니다.")
  }

  return normalizePurchaseRequestDetailResponse(await response.json())
}

export async function fetchPurchaseRequestProducts() {
  const response = await fetch(createApiUrl("/api/products"), {
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error("품목 목록을 불러오지 못했습니다.")
  }

  const data = await response.json()
  const products = Array.isArray(data)
    ? data
    : (data.items ?? data.content ?? [])

  return products.map((product) => ({
    id: product.productId,
    code: product.productNo,
    name: product.productName,
    category: product.categoryName ?? "",
    spec: product.spec ?? "",
    unit: product.unit ?? "",
    currentStock: product.currentStock ?? 0,
    unitPrice: Number(product.unitPrice ?? 0),
  }))
}

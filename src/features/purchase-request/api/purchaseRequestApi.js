import { apiFetch, getApiUrl } from "@/lib/api/fetchClient"
import { getAccessToken } from "@/utils/authStorage"
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

function filterMockPurchaseRequests(params = {}) {
  const {
    requestNumber = "",
    title = "",
    requester = "",
    department = "전체 부서",
    status = "전체",
    priority = "전체",
    desiredReceiptAt = "",
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

    const matchesDesiredReceiptAt =
      !desiredReceiptAt || request.desiredReceiptAt === desiredReceiptAt

    return (
      matchesRequestNumber &&
      matchesTitle &&
      matchesRequester &&
      matchesDepartment &&
      matchesStatus &&
      matchesPriority &&
      matchesDesiredReceiptAt
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
  return normalizePurchaseRequestSummary({
    total: mockPurchaseRequests.length,
    normalPriority: mockPurchaseRequests.filter(
      (request) => request.priority === "일반",
    ).length,
    urgentPriority: mockPurchaseRequests.filter(
      (request) => request.priority === "긴급",
    ).length,
    canceled: mockPurchaseRequests.filter(
      (request) => request.status === "요청 취소",
    ).length,
  })
}

function normalizePurchaseRequestListItem(item, index = 0) {
  const rawPriority = item.priority ?? item.urgency ?? ""
  const rawStatus = item.status ?? item.requestStatus ?? ""

  return {
    id: item.id ?? item.requestId ?? index + 1,
    requestNumber: item.requestNumber ?? item.requestNo ?? "",
    title: item.title ?? item.requestTitle ?? "",
    requester: item.requester ?? item.requesterName ?? "-",
    department: item.department ?? item.departmentName ?? "-",
    requestedAt: item.requestedAt ?? item.requestDate ?? "",
    desiredReceiptAt:
      item.desiredReceiptAt ?? item.desiredReceiptAt ?? item.expectedDate ?? "",
    createdAt: item.createdAt ?? item.requestedAt ?? item.requestDate ?? "",
    updatedAt: item.updatedAt ?? "",
    itemCount: Number(item.itemCount ?? item.items?.length ?? 0),
    totalAmount: Number(item.totalAmount ?? 0),
    priority:
      PURCHASE_REQUEST_PRIORITY_LABELS[rawPriority] ?? rawPriority ?? "일반",
    status:
      PURCHASE_REQUEST_STATUS_LABELS[rawStatus] ?? rawStatus ?? "승인 대기",
    items: item.items ?? [],
  }
}

function normalizePurchaseRequestResponse(data) {
  if (Array.isArray(data.items) && data.pagination) {
    return {
      ...data,
      items: data.items.map(normalizePurchaseRequestListItem),
    }
  }

  const items = data.content ?? []

  return {
    items: items.map(normalizePurchaseRequestListItem),
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

    const queryValue =
      key === "page" ? String(Math.max(Number(value) - 1, 0)) : String(value)

    query.set(key, queryValue)
  })

  return query.toString()
}

export async function fetchPurchaseRequests(params = {}) {
  if (USE_MOCK) {
    await wait(150)
    return getMockPurchaseRequests(params)
  }

  const query = createQueryString(params)
  const path = query
    ? `/api/purchase-requests?${query}`
    : "/api/purchase-requests"

  const data = await apiFetch(path, {
    cache: "no-store",
  })

  return normalizePurchaseRequestResponse(data)
}

export async function fetchPurchaseRequestFilterOptions() {
  if (USE_MOCK) {
    return purchaseRequestFilterOptions
  }

  return apiFetch("/api/purchase-requests/filter-options", {
    cache: "no-store",
  })
}

function normalizePurchaseRequestSummary(data = {}) {
  return {
    total: Number(data.total ?? 0),
    normalPriority: Number(data.normalPriority ?? 0),
    urgentPriority: Number(data.urgentPriority ?? 0),
    canceled: Number(data.canceled ?? 0),
  }
}

export async function fetchPurchaseRequestSummary() {
  if (USE_MOCK) {
    return normalizePurchaseRequestSummary(getMockPurchaseRequestSummary())
  }

  const data = await apiFetch("/api/purchase-requests/summary", {
    cache: "no-store",
  })

  return normalizePurchaseRequestSummary(data)
}

const PURCHASE_REQUEST_STATUS_LABELS = {
  DRAFT: "승인 대기",
  PENDING: "승인 대기",
  PENDING_APPROVAL: "승인 대기",
  WAITING: "승인 대기",
  REQUESTED: "승인 대기",
  APPROVED: "승인 완료",
  REJECTED: "반려",
  ORDERED: "발주 완료",
  CANCELED: "요청 취소",
  CANCELLED: "요청 취소",
  CANCEL_REQUESTED: "요청 취소",
}

const PURCHASE_REQUEST_PRIORITY_LABELS = {
  NORMAL: "일반",
  URGENT: "긴급",
}

function normalizeDownloadUrl(downloadUrl) {
  if (!downloadUrl) {
    return ""
  }

  if (/^https?:\/\//i.test(downloadUrl)) {
    return downloadUrl
  }

  return getApiUrl(downloadUrl)
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
      productId: item.productId ?? item.product?.productId ?? null,
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
      fileName:
        attachment.fileName ??
        attachment.originalFileName ??
        attachment.originalName ??
        "",
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
    desiredReceiptAt:
      data.desiredReceiptAt ?? data.desiredReceiptAt ?? data.expectedDate ?? "",
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

function getFileNameFromDisposition(disposition, fallback) {
  if (!disposition) return fallback

  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i)
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1])
  }

  const normalMatch = disposition.match(/filename="?([^"]+)"?/i)
  if (normalMatch?.[1]) {
    return decodeURIComponent(normalMatch[1])
  }

  return fallback
}

export async function downloadPurchaseRequestExcel() {
  const headers = new Headers()
  const token = getAccessToken()

  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const response = await fetch(getApiUrl("/api/purchase-requests/excel"), {
    method: "GET",
    headers,
  })

  if (!response.ok) {
    throw new Error("엑셀 파일을 생성하지 못했습니다.")
  }

  const fallbackFileName = `구매요청목록_${new Date()
    .toISOString()
    .slice(0, 10)
    .replaceAll("-", "")}.xlsx`

  const fileName = getFileNameFromDisposition(
    response.headers.get("Content-Disposition"),
    fallbackFileName,
  )

  return {
    blob: await response.blob(),
    fileName,
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

  try {
    const data = await apiFetch(
      `/api/purchase-requests/${encodeURIComponent(requestId)}`,
      {
        cache: "no-store",
      },
    )

    return normalizePurchaseRequestDetailResponse(data)
  } catch (error) {
    if (isApiErrorStatus(error, 404)) {
      throw new Error("존재하지 않는 구매 요청입니다.")
    }

    throw new Error(
      getApiErrorMessage(error, "구매 요청 상세 정보를 불러오지 못했습니다."),
    )
  }
}

function createPurchaseRequestFormData(payload, attachment) {
  const formData = new FormData()

  formData.append(
    "data",
    new Blob([JSON.stringify(payload)], {
      type: "application/json",
    }),
  )

  if (attachment) {
    formData.append("file", attachment)
  }

  return formData
}

export async function createPurchaseRequest(payload, attachment = null) {
  try {
    const data = await apiFetch("/api/purchase-requests", {
      method: "POST",
      body: createPurchaseRequestFormData(payload, attachment),
    })

    return normalizePurchaseRequestDetailResponse(data)
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "구매 요청 등록에 실패했습니다."))
  }
}

function getApiErrorStatus(error) {
  return error?.status ?? error?.response?.status ?? error?.cause?.status
}

function getApiErrorMessage(error, fallbackMessage) {
  return (
    error?.data?.message ??
    error?.data?.error ??
    error?.message ??
    fallbackMessage
  )
}

function isApiErrorStatus(error, status) {
  return getApiErrorStatus(error) === status
}

export async function updatePurchaseRequest(
  requestId,
  payload,
  attachment = null,
) {
  if (!requestId) {
    throw new Error("구매 요청 ID가 없습니다.")
  }

  try {
    const data = await apiFetch(
      `/api/purchase-requests/${encodeURIComponent(requestId)}`,
      {
        method: "PUT",
        body: createPurchaseRequestFormData(payload, attachment),
      },
    )

    return normalizePurchaseRequestDetailResponse(data)
  } catch (error) {
    if (isApiErrorStatus(error, 404)) {
      throw new Error("존재하지 않는 구매 요청입니다.")
    }

    if (isApiErrorStatus(error, 409)) {
      throw new Error(
        getApiErrorMessage(
          error,
          "현재 상태에서는 구매 요청을 수정할 수 없습니다.",
        ),
      )
    }

    throw new Error(getApiErrorMessage(error, "구매 요청 수정에 실패했습니다."))
  }
}

export async function cancelPurchaseRequest(requestId) {
  if (!requestId) {
    throw new Error("구매 요청 ID가 없습니다.")
  }

  try {
    const data = await apiFetch(
      `/api/purchase-requests/${encodeURIComponent(requestId)}/cancel`,
      {
        method: "PATCH",
      },
    )

    return normalizePurchaseRequestDetailResponse(data)
  } catch (error) {
    if (isApiErrorStatus(error, 404)) {
      throw new Error("존재하지 않는 구매 요청입니다.")
    }

    if (isApiErrorStatus(error, 409)) {
      throw new Error(
        getApiErrorMessage(
          error,
          "승인 대기 상태의 구매 요청만 취소할 수 있습니다.",
        ),
      )
    }

    throw new Error(getApiErrorMessage(error, "구매 요청 취소에 실패했습니다."))
  }
}

export async function deletePurchaseRequest(requestId) {
  if (!requestId) {
    throw new Error("구매 요청 ID가 없습니다.")
  }

  try {
    return await apiFetch(
      `/api/purchase-requests/${encodeURIComponent(requestId)}`,
      {
        method: "DELETE",
      },
    )
  } catch (error) {
    if (isApiErrorStatus(error, 404)) {
      throw new Error("존재하지 않는 구매 요청입니다.")
    }

    if (isApiErrorStatus(error, 409)) {
      throw new Error(
        getApiErrorMessage(
          error,
          "현재 상태에서는 구매 요청을 삭제할 수 없습니다.",
        ),
      )
    }

    throw new Error(getApiErrorMessage(error, "구매 요청 삭제에 실패했습니다."))
  }
}

export async function fetchPurchaseRequestProducts() {
  try {
    const query = new URLSearchParams()

    query.set("page", "0")
    query.set("size", "20000")
    query.set("activeStatus", "사용")

    const data = await apiFetch(`/api/products?${query.toString()}`, {
      cache: "no-store",
    })

    const products = Array.isArray(data)
      ? data
      : (data.items ?? data.content ?? [])

    return products.map((product) => ({
      id: product.productId ?? product.id,
      productId: product.productId ?? product.id,
      code: product.productNo ?? product.itemCode ?? product.code ?? "",
      name: product.productName ?? product.itemName ?? product.name ?? "",
      category: product.categoryName ?? product.category ?? "",
      spec: product.spec ?? product.specification ?? "",
      unit: product.unit ?? "",
      currentStock: Number(product.currentStock ?? product.stockQuantity ?? 0),
      unitPrice: Number(product.unitPrice ?? product.price ?? 0),
      createdAt: product.createdAt ?? product.registeredAt ?? "",
      updatedAt: product.updatedAt ?? "",
    }))
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "품목 목록을 불러오지 못했습니다."),
    )
  }
}

import { apiFetch } from "@/lib/api/fetchClient"
import { mockApprovalDetails } from "@/features/approval/data/mockApprovalData"

const USE_MOCK = process.env.NEXT_PUBLIC_USE_APPROVAL_MOCK !== "false"

const mockStore = new Map(
  Object.entries(mockApprovalDetails).map(([key, value]) => [key, value]),
)

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function getMockApproval(approvalId) {
  const approval = mockStore.get(String(approvalId))

  if (!approval) {
    throw new Error("승인 요청 정보를 찾을 수 없습니다.")
  }

  return approval
}

function updateMockDecision(approvalId, decision, comment) {
  const approval = clone(getMockApproval(approvalId))
  const approved = decision === "APPROVE"

  approval.requestStatus = approved ? "APPROVED" : "REJECTED"
  approval.requestStatusLabel = approved ? "승인 완료" : "반려"

  approval.currentStep = {
    ...approval.currentStep,
    stepLabel: approved ? "최종 승인" : "반려 처리",
  }

  approval.history = approval.history.map((history) =>
    history.status === "CURRENT"
      ? {
          ...history,
          status: "DONE",
          description: approved ? "승인 완료" : "반려 완료",
        }
      : history,
  )

  approval.history.push({
    historyId: Date.now(),
    status: "DONE",
    title: approved ? "승인 완료" : "승인 반려",
    actorName: approval.currentStep.approver.name,
    actorPosition: approval.currentStep.approver.position,
    processedAt: new Date().toISOString(),
    description: comment || (approved ? "승인 처리 완료" : "반려 처리 완료"),
  })

  mockStore.set(String(approvalId), approval)

  return approval
}

export async function fetchApprovalDetail(approvalId) {
  if (USE_MOCK) {
    await wait(150)

    return clone(getMockApproval(approvalId))
  }

  return apiFetch(`/api/approvals/${encodeURIComponent(approvalId)}`, {
    cache: "no-store",
  })
}

export async function approveApproval(approvalId, payload) {
  if (USE_MOCK) {
    await wait(150)

    return clone(updateMockDecision(approvalId, "APPROVE", payload.comment))
  }

  return apiFetch(`/api/approvals/${encodeURIComponent(approvalId)}/approve`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function rejectApproval(approvalId, payload) {
  if (USE_MOCK) {
    await wait(150)

    return clone(updateMockDecision(approvalId, "REJECT", payload.comment))
  }

  return apiFetch(`/api/approvals/${encodeURIComponent(approvalId)}/reject`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function requestApprovalCancellation(approvalId) {
  if (USE_MOCK) {
    await wait(150)

    const approval = clone(getMockApproval(approvalId))

    approval.requestStatus = "CANCEL_REQUESTED"
    approval.requestStatusLabel = "요청 취소"

    mockStore.set(String(approvalId), approval)

    return approval
  }

  return apiFetch(
    `/api/approvals/${encodeURIComponent(approvalId)}/cancel-request`,
    {
      method: "PATCH",
    },
  )
}

function includesKeyword(value, keyword) {
  return String(value ?? "")
    .toLowerCase()
    .includes(keyword.trim().toLowerCase())
}

function isWithinRange(value, from, to) {
  if (from && value < from) return false
  if (to && value > to) return false

  return true
}

function calculateApprovalTotalAmount(items = []) {
  return items.reduce(
    (total, item) => total + Number(item.expectedAmount ?? 0),
    0,
  )
}

function toApprovalListItem(approval) {
  return {
    approvalId: approval.approvalId,
    requestId: approval.requestId,
    requestNumber: approval.requestNumber,
    title: approval.title,
    requester: approval.requester?.name ?? "",
    department: approval.requestDepartment?.name ?? "",
    requestedAt: approval.requestedAt,
    desiredReceiptAt: approval.desiredReceiptAt,
    createdAt: approval.createdAt ?? approval.requestedAt ?? "",
    updatedAt: approval.updatedAt ?? "",
    totalAmount: calculateApprovalTotalAmount(approval.items),
    priority: approval.priorityLabel,
    requestStatus: approval.requestStatus,
    requestStatusLabel: approval.requestStatusLabel,
    approvalStep: approval.currentStep?.stepLabel ?? "-",
    approver: approval.currentStep?.approver
      ? `${approval.currentStep.approver.name} ${approval.currentStep.approver.position}`
      : "-",
  }
}

function filterMockApprovals(params = {}) {
  const {
    requestNumber = "",
    title = "",
    requester = "",
    department = "",
    status = "전체",
    requestedFrom = "",
    requestedTo = "",
  } = params

  return Array.from(mockStore.values())
    .map(toApprovalListItem)
    .filter((approval) => {
      const matchesRequestNumber =
        !requestNumber || includesKeyword(approval.requestNumber, requestNumber)

      const matchesTitle = !title || includesKeyword(approval.title, title)

      const matchesRequester =
        !requester || includesKeyword(approval.requester, requester)

      const matchesDepartment =
        !department || includesKeyword(approval.department, department)

      const matchesStatus =
        status === "전체" || approval.requestStatus === status

      const matchesRequestedAt = isWithinRange(
        approval.requestedAt,
        requestedFrom,
        requestedTo,
      )

      return (
        matchesRequestNumber &&
        matchesTitle &&
        matchesRequester &&
        matchesDepartment &&
        matchesStatus &&
        matchesRequestedAt
      )
    })
    .sort((a, b) => b.approvalId - a.approvalId)
}

function getMockApprovals(params = {}) {
  const page = Number(params.page ?? 1)
  const size = Number(params.size ?? 10)

  const filteredApprovals = filterMockApprovals(params)

  const totalElements = filteredApprovals.length
  const totalPages = Math.max(1, Math.ceil(totalElements / size))
  const safePage = Math.min(Math.max(page, 1), totalPages)
  const offset = (safePage - 1) * size

  return {
    items: filteredApprovals.slice(offset, offset + size),
    pagination: {
      page: safePage,
      size,
      totalElements,
      totalPages,
    },
  }
}

function createApprovalListQueryString(params = {}) {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === "" || value === "전체") {
      return
    }

    // 프론트엔드는 1페이지부터 시작하고,
    // Spring Pageable은 0페이지부터 시작합니다.
    query.set(
      key,
      key === "page" ? String(Math.max(Number(value) - 1, 0)) : String(value),
    )
  })

  return query.toString()
}

const REQUEST_STATUS_LABELS = {
  DRAFT: "임시 저장",
  PENDING: "승인 대기",
  PENDING_APPROVAL: "승인 대기",
  WAITING: "승인 대기",
  REQUESTED: "승인 대기",
  APPROVED: "승인 완료",
  REJECTED: "반려",
  ORDERED: "발주 완료",
  CANCEL_REQUESTED: "요청 취소",
  CANCELED: "요청 취소",
  CANCELLED: "요청 취소",
}

function normalizeApprovalListItem(item, index = 0) {
  const requestStatus = item.requestStatus ?? item.status ?? "PENDING_APPROVAL"

  return {
    approvalId: item.approvalId ?? item.id ?? index + 1,
    requestId: item.requestId ?? item.purchaseRequestId ?? null,
    requestNumber: item.requestNumber ?? item.requestNo ?? "",
    title: item.title ?? item.requestTitle ?? "",
    requester: item.requester?.name ?? item.requester ?? "-",
    department: item.requestDepartment?.name ?? item.department ?? "-",
    requestedAt: item.requestedAt ?? item.requestDate ?? "",
    desiredReceiptAt:
      item.desiredReceiptAt ?? item.desiredReceiptAt ?? item.expectedDate ?? "",
    createdAt: item.createdAt ?? item.requestedAt ?? item.requestDate ?? "",
    updatedAt: item.updatedAt ?? "",
    totalAmount: Number(item.totalAmount ?? 0),
    priority: item.priority ?? item.priorityLabel ?? "일반",
    requestStatus,
    requestStatusLabel:
      item.requestStatusLabel ??
      REQUEST_STATUS_LABELS[requestStatus] ??
      requestStatus,
    approvalStep: item.approvalStep ?? item.currentStep?.stepLabel ?? "-",
    approver: item.approver ?? item.currentStep?.approver?.name ?? "-",
  }
}

function normalizeApprovalListResponse(data) {
  if (Array.isArray(data.items) && data.pagination) {
    return {
      ...data,
      items: data.items.map(normalizeApprovalListItem),
    }
  }

  const items = data.content ?? []

  return {
    items: items.map(normalizeApprovalListItem),
    pagination: {
      page: (data.number ?? 0) + 1,
      size: data.size ?? 10,
      totalElements: data.totalElements ?? 0,
      totalPages: Math.max(data.totalPages ?? 1, 1),
    },
  }
}

export async function fetchApprovals(params = {}) {
  if (USE_MOCK) {
    await wait(150)

    return getMockApprovals(params)
  }

  const query = createApprovalListQueryString(params)

  const queryString = query ? `?${query}` : ""
  const data = await apiFetch(`/api/approvals${queryString}`, {
    cache: "no-store",
  })

  return normalizeApprovalListResponse(data)
}

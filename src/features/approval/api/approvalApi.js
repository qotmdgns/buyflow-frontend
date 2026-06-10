import { mockApprovalDetails } from "@/features/approval/data/mockApprovalData"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? ""
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

async function parseResponse(response, fallbackMessage) {
  if (!response.ok) {
    let message = fallbackMessage

    try {
      const data = await response.json()
      message = data.message || data.error || fallbackMessage
    } catch {
      // JSON 오류 응답이 아니면 기본 메시지를 사용합니다.
    }

    throw new Error(message)
  }

  return response.json()
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

  const response = await fetch(
    `${API_BASE_URL}/api/approvals/${encodeURIComponent(approvalId)}`,
    {
      cache: "no-store",
    },
  )

  return parseResponse(response, "승인 요청 정보를 불러오지 못했습니다.")
}

export async function approveApproval(approvalId, payload) {
  if (USE_MOCK) {
    await wait(150)

    return clone(updateMockDecision(approvalId, "APPROVE", payload.comment))
  }

  const response = await fetch(
    `${API_BASE_URL}/api/approvals/${encodeURIComponent(approvalId)}/approve`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  )

  return parseResponse(response, "승인 처리에 실패했습니다.")
}

export async function rejectApproval(approvalId, payload) {
  if (USE_MOCK) {
    await wait(150)

    return clone(updateMockDecision(approvalId, "REJECT", payload.comment))
  }

  const response = await fetch(
    `${API_BASE_URL}/api/approvals/${encodeURIComponent(approvalId)}/reject`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  )

  return parseResponse(response, "반려 처리에 실패했습니다.")
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

  const response = await fetch(
    `${API_BASE_URL}/api/approvals/${encodeURIComponent(
      approvalId,
    )}/cancel-request`,
    {
      method: "PATCH",
    },
  )

  return parseResponse(response, "요청 취소 처리에 실패했습니다.")
}

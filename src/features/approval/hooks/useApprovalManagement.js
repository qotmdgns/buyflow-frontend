"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  approveApproval,
  fetchApprovalDetail,
  rejectApproval,
  requestApprovalCancellation,
} from "@/features/approval/api/approvalApi"

export default function useApprovalManagement(approvalId) {
  const router = useRouter()

  const [approval, setApproval] = useState(null)
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(true)
  const [submittingAction, setSubmittingAction] = useState("")
  const [error, setError] = useState("")
  const [actionError, setActionError] = useState("")

  useEffect(() => {
    let ignore = false

    async function loadApproval() {
      setLoading(true)
      setError("")

      try {
        const data = await fetchApprovalDetail(approvalId)

        if (!ignore) {
          setApproval(data)
        }
      } catch (requestError) {
        if (!ignore) {
          setError(
            requestError.message || "승인 요청 정보를 불러오지 못했습니다.",
          )
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    loadApproval()

    return () => {
      ignore = true
    }
  }, [approvalId])

  async function submitDecision(decision) {
    const normalizedComment = comment.trim()

    if (decision === "REJECT" && !normalizedComment) {
      setActionError("반려 처리 시에는 결재 의견을 입력해 주세요.")

      return
    }

    setSubmittingAction(decision)
    setActionError("")

    try {
      const payload = {
        comment: normalizedComment,
      }

      const updatedApproval =
        decision === "APPROVE"
          ? await approveApproval(approvalId, payload)
          : await rejectApproval(approvalId, payload)

      setApproval(updatedApproval)
      setComment("")

      window.alert(
        decision === "APPROVE"
          ? "승인 처리되었습니다."
          : "반려 처리되었습니다.",
      )

      router.push("/approvals")
      router.refresh()
    } catch (requestError) {
      setActionError(requestError.message || "결재 처리에 실패했습니다.")
    } finally {
      setSubmittingAction("")
    }
  }

  async function cancelRequest() {
    const confirmed = window.confirm("해당 구매 요청을 취소하시겠습니까?")

    if (!confirmed) return

    setSubmittingAction("CANCEL")
    setActionError("")

    try {
      const updatedApproval = await requestApprovalCancellation(approvalId)

      setApproval(updatedApproval)

      window.alert("요청 취소 처리되었습니다.")
    } catch (requestError) {
      setActionError(requestError.message || "요청 취소 처리에 실패했습니다.")
    } finally {
      setSubmittingAction("")
    }
  }

  return {
    approval,
    comment,
    loading,
    submittingAction,
    error,
    actionError,
    setComment,
    submitDecision,
    cancelRequest,
  }
}

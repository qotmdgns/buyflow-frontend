"use client"

import { useEffect, useState } from "react"
import {
  cancelPurchaseRequest,
  deletePurchaseRequest,
  fetchPurchaseRequestDetail,
} from "@/features/purchase-request/api/purchaseRequestApi"

export default function usePurchaseRequestDetail(requestId) {
  const [request, setRequest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let ignore = false

    async function loadPurchaseRequestDetail() {
      setLoading(true)
      setError("")

      try {
        const nextRequest = await fetchPurchaseRequestDetail(requestId)

        if (!ignore) {
          setRequest(nextRequest)
        }
      } catch (requestError) {
        if (!ignore) {
          setRequest(null)
          setError(
            requestError.message ||
              "구매 요청 상세 정보를 불러오지 못했습니다.",
          )
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    loadPurchaseRequestDetail()

    return () => {
      ignore = true
    }
  }, [requestId, reloadKey])

  function reload() {
    setReloadKey((currentKey) => currentKey + 1)
  }

  async function cancelRequest() {
    const nextRequest = await cancelPurchaseRequest(requestId)
    setRequest(nextRequest)
    return nextRequest
  }

  async function deleteRequest() {
    await deletePurchaseRequest(requestId)
  }

  return {
    request,
    loading,
    error,
    reload,
    cancelRequest,
    deleteRequest,
  }
}

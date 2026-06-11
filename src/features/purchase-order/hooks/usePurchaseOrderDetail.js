"use client"

import { useEffect, useState } from "react"
import { fetchPurchaseOrderById } from "@/features/purchase-order/api/purchaseOrderApi"

export default function usePurchaseOrderDetail(orderId) {
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!orderId) {
      return
    }

    let ignore = false

    async function loadDetail() {
      setLoading(true)
      setError("")

      try {
        const data = await fetchPurchaseOrderById(orderId)

        if (!ignore) {
          setDetail(data)
        }
      } catch (requestError) {
        if (!ignore) {
          setDetail(null)
          setError(
            requestError.message || "발주 상세 정보를 불러오지 못했습니다.",
          )
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    loadDetail()

    return () => {
      ignore = true
    }
  }, [orderId])

  return {
    detail: orderId ? detail : null,
    loading: Boolean(orderId) && loading,
    error: orderId ? error : "",
  }
}

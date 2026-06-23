"use client"

import { useEffect, useState } from "react"

import {
  fetchReceiptById,
  fetchReceiptByOrderId,
} from "@/features/receipt/api/ReceiptApi"

export default function useReceiptDetail(
  receiptId,
  mode = "receipt",
) {
  const [receipt, setReceipt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    console.log("mode =", mode)
console.log("receiptId =", receiptId)
    let ignore = false

    async function loadReceipt() {
      setLoading(true)
      setError("")

      try {

      const data =
  mode === "order"
    ? await fetchReceiptByOrderId(receiptId)
    : await fetchReceiptById(receiptId)
        
       if (!ignore) {
          setReceipt(data)
        }
      } catch (requestError) {
        if (!ignore) {
          setReceipt(null)

          setError(
            requestError.message ||
              "입고 상세 정보를 불러오지 못했습니다.",
          )
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    loadReceipt()

    return () => {
      ignore = true
    }
  }, [receiptId, mode, reloadKey])

  function reload() {
    setReloadKey((currentKey) => currentKey + 1)
  }

  return {
    receipt,
    loading,
    error,
    reload,
  }
}
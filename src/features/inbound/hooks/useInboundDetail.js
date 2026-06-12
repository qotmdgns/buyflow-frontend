"use client"

import { useEffect, useState } from "react"

import { fetchInboundById } from "@/features/inbound/api/inboundApi"

export default function useInboundDetail(inboundId) {
  const [inbound, setInbound] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let ignore = false

    async function loadInbound() {
      setLoading(true)
      setError("")

      try {
        const data = await fetchInboundById(inboundId)

        if (!ignore) {
          setInbound(data)
        }
      } catch (requestError) {
        if (!ignore) {
          setInbound(null)

          setError(
            requestError.message || "입고 상세 정보를 불러오지 못했습니다.",
          )
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    loadInbound()

    return () => {
      ignore = true
    }
  }, [inboundId, reloadKey])

  function reload() {
    setReloadKey((currentKey) => currentKey + 1)
  }

  return {
    inbound,
    loading,
    error,
    reload,
  }
}

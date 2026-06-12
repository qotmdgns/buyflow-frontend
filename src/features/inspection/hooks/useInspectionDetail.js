"use client"

import { useEffect, useState } from "react"

import { fetchInspectionDetail } from "@/features/inspection/api/inspectionApi"

export default function useInspectionDetail(inspectionId) {
  const [inspection, setInspection] = useState(null)

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState("")

  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let ignore = false

    async function loadInspectionDetail() {
      setLoading(true)
      setError("")

      try {
        const nextInspection = await fetchInspectionDetail(inspectionId)

        if (!ignore) {
          setInspection(nextInspection)
        }
      } catch (requestError) {
        if (!ignore) {
          setInspection(null)

          setError(
            requestError.message || "검수 상세 정보를 불러오지 못했습니다.",
          )
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    loadInspectionDetail()

    return () => {
      ignore = true
    }
  }, [inspectionId, reloadKey])

  function reload() {
    setReloadKey((currentKey) => currentKey + 1)
  }

  return {
    inspection,
    loading,
    error,
    reload,
  }
}

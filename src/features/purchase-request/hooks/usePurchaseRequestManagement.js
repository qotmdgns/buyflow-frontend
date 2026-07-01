"use client"

import { useEffect, useMemo, useState } from "react"
import {
  cancelPurchaseRequest,
  deletePurchaseRequest,
  fetchPurchaseRequestFilterOptions,
  fetchPurchaseRequests,
  fetchPurchaseRequestSummary,
} from "@/features/purchase-request/api/purchaseRequestApi"
import {
  DEFAULT_PURCHASE_REQUEST_FILTER_OPTIONS,
  DEFAULT_PURCHASE_REQUEST_FILTERS,
  DEFAULT_PURCHASE_REQUEST_PAGINATION,
} from "@/features/purchase-request/utils/purchaseRequestManagementUtils"

const DEFAULT_SUMMARY = {
  total: 0,
  normalPriority: 0,
  urgentPriority: 0,
  canceled: 0,
}

const SUMMARY_KEY_BY_STATUS = {
  "승인 대기": "pending",
  "승인 완료": "approved",
  반려: "rejected",
  "발주 완료": "ordered",
  "요청 취소": "canceled",
}

function createDisplayedSummary(baseSummary, activeFilters, totalElements) {
  const status = activeFilters?.status ?? "전체"
  const priority = activeFilters?.priority ?? "전체"

  if (status === "전체" && priority === "전체") {
    return baseSummary
  }

  return {
    total: totalElements,
    normalPriority: priority === "일반" ? totalElements : 0,
    urgentPriority: priority === "긴급" ? totalElements : 0,
    canceled: status === "요청 취소" ? totalElements : 0,
  }
}

export default function usePurchaseRequestManagement() {
  const [draftFilters, setDraftFilters] = useState(
    DEFAULT_PURCHASE_REQUEST_FILTERS,
  )

  const [appliedFilters, setAppliedFilters] = useState(
    DEFAULT_PURCHASE_REQUEST_FILTERS,
  )

  const [requests, setRequests] = useState([])
  const [pagination, setPagination] = useState(
    DEFAULT_PURCHASE_REQUEST_PAGINATION,
  )

  const [pageSize, setPageSize] = useState(15)

  const [filterOptions, setFilterOptions] = useState(
    DEFAULT_PURCHASE_REQUEST_FILTER_OPTIONS,
  )

  const [summary, setSummary] = useState(DEFAULT_SUMMARY)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [refreshkey, setRefreshKey] = useState(0)

  useEffect(() => {
    let ignore = false

    Promise.all([
      fetchPurchaseRequestFilterOptions(),
      fetchPurchaseRequestSummary(),
    ])
      .then(([nextFilterOptions, nextSummary]) => {
        if (ignore) return

        setFilterOptions(nextFilterOptions)
        setSummary(nextSummary)
      })
      .catch(() => {
        if (ignore) return

        setFilterOptions(DEFAULT_PURCHASE_REQUEST_FILTER_OPTIONS)
        setSummary(DEFAULT_SUMMARY)
      })

    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    let ignore = false

    async function loadPurchaseRequests() {
      setLoading(true)
      setError("")

      try {
        const data = await fetchPurchaseRequests({
          ...appliedFilters,
          page: pagination.page,
          size: pageSize,
        })

        if (ignore) return

        setRequests(data.items)
        setPagination(data.pagination)
      } catch (requestError) {
        if (!ignore) {
          setError(
            requestError.message || "구매 요청 목록을 불러오지 못했습니다.",
          )
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    loadPurchaseRequests()

    return () => {
      ignore = true
    }
  }, [appliedFilters, pagination.page, pageSize, refreshkey])

  function updateFilter(name, value) {
    setDraftFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }))
  }

  function searchRequests(event) {
    event.preventDefault()

    setPagination((currentPagination) => ({
      ...currentPagination,
      page: 1,
    }))

    setAppliedFilters({ ...draftFilters })
  }

  function resetFilters() {
    setDraftFilters({ ...DEFAULT_PURCHASE_REQUEST_FILTERS })
    setAppliedFilters({ ...DEFAULT_PURCHASE_REQUEST_FILTERS })

    setPagination((currentPagination) => ({
      ...currentPagination,
      page: 1,
    }))
  }

  function selectSummaryFilter(filter) {
    const nextFilters = {
      ...appliedFilters,
      status: filter.status ?? "전체",
      priority: filter.priority ?? "전체",
    }

    setDraftFilters(nextFilters)
    setAppliedFilters(nextFilters)

    setPagination((currentPagination) => ({
      ...currentPagination,
      page: 1,
    }))
  }

  function movePage(nextPage) {
    const safePage = Math.min(Math.max(nextPage, 1), pagination.totalPages)

    setPagination((currentPagination) => ({
      ...currentPagination,
      page: safePage,
    }))
  }

  function changePageSize(nextPageSize) {
    setPageSize(nextPageSize)

    setPagination((currentPagination) => ({
      ...currentPagination,
      page: 1,
    }))
  }

  async function exportRequests() {
    const data = await fetchPurchaseRequests({
      ...appliedFilters,
      page: 1,
      size: Math.max(pagination.totalElements, 1),
    })

    return data.items
  }

  async function refreshSummaryAndList() {
    const nextSummary = await fetchPurchaseRequestSummary()
    setSummary(nextSummary)
    setRefreshKey((currentKey) => currentKey + 1)
  }

  async function cancelRequest(requestId) {
    await cancelPurchaseRequest(requestId)
    await refreshSummaryAndList()
  }

  async function deleteRequest(requestId) {
    await deletePurchaseRequest(requestId)
    await refreshSummaryAndList()
  }

  const displayedSummary = useMemo(
    () =>
      createDisplayedSummary(summary, appliedFilters, pagination.totalElements),
    [summary, appliedFilters, pagination.totalElements],
  )

  return {
    draftFilters,
    appliedFilters,
    filterOptions,
    requests,
    pagination,
    pageSize,
    summary: displayedSummary,
    loading,
    error,
    selectSummaryFilter,
    updateFilter,
    searchRequests,
    resetFilters,
    movePage,
    changePageSize,
    exportRequests,
    deleteRequest,

    selectSummaryFilter,
  }
}

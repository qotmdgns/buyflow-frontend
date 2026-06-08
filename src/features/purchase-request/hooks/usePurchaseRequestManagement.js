"use client"

import { useEffect, useState } from "react"
import {
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
  draft: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
  ordered: 0,
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

  const [pageSize, setPageSize] = useState(10)

  const [filterOptions, setFilterOptions] = useState(
    DEFAULT_PURCHASE_REQUEST_FILTER_OPTIONS,
  )

  const [summary, setSummary] = useState(DEFAULT_SUMMARY)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

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
        setSelectedIds(new Set())
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
  }, [appliedFilters, pagination.page, pageSize])

  const allCurrentRowsSelected =
    requests.length > 0 &&
    requests.every((request) => selectedIds.has(request.id))

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

  function selectSummaryStatus(status) {
    const nextFilters = {
      ...draftFilters,
      status,
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

  function toggleAllRows() {
    if (allCurrentRowsSelected) {
      setSelectedIds(new Set())
      return
    }

    setSelectedIds(new Set(requests.map((request) => request.id)))
  }

  function toggleRow(requestId) {
    setSelectedIds((currentIds) => {
      const nextIds = new Set(currentIds)

      if (nextIds.has(requestId)) {
        nextIds.delete(requestId)
      } else {
        nextIds.add(requestId)
      }

      return nextIds
    })
  }

  return {
    draftFilters,
    appliedFilters,
    filterOptions,
    summary,
    requests,
    pagination,
    pageSize,
    selectedIds,
    allCurrentRowsSelected,
    loading,
    error,
    updateFilter,
    searchRequests,
    resetFilters,
    selectSummaryStatus,
    movePage,
    changePageSize,
    exportRequests,
    toggleAllRows,
    toggleRow,
  }
}

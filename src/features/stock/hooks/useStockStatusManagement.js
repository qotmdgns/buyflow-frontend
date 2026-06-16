"use client"

import { useEffect, useState } from "react"
import {
  createStockAdjustment,
  fetchStocks,
  fetchStockFilterOptions,
} from "@/features/stock/api/stockApi"
import {
  DEFAULT_STOCK_FILTER_OPTIONS,
  DEFAULT_STOCK_FILTERS,
  DEFAULT_PAGINATION,
} from "@/features/stock/utils/stockManagementUtils"

const DEFAULT_SUMMARY = {
  total: 0,
  normal: 0,
  low: 0,
  outOfStock: 0,
}

export default function useStockStatusManagement() {
  const [draftFilters, setDraftFilters] = useState({
    ...DEFAULT_STOCK_FILTERS,
  })

  const [appliedFilters, setAppliedFilters] = useState({
    ...DEFAULT_STOCK_FILTERS,
  })

  const [filterOptions, setFilterOptions] = useState(
    DEFAULT_STOCK_FILTER_OPTIONS,
  )

  const [stocks, setStocks] = useState([])
  const [summary, setSummary] = useState(DEFAULT_SUMMARY)
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION)
  const [pageSize, setPageSize] = useState(10)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)
  const [adjustmentTarget, setAdjustmentTarget] = useState(null)

  useEffect(() => {
    let ignore = false

    fetchStockFilterOptions()
      .then((data) => {
        if (!ignore) {
          setFilterOptions(data)
        }
      })
      .catch(() => {
        if (!ignore) {
          setFilterOptions(DEFAULT_STOCK_FILTER_OPTIONS)
        }
      })

    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    let ignore = false

    async function loadStocks() {
      setLoading(true)
      setError("")

      try {
        const data = await fetchStocks({
          ...appliedFilters,
          page: pagination.page,
          size: pageSize,
        })

        if (ignore) return

        setStocks(data.items)
        setPagination(data.pagination)
        setSummary(data.summary ?? DEFAULT_SUMMARY)
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message || "재고 현황을 불러오지 못했습니다.")
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    loadStocks()

    return () => {
      ignore = true
    }
  }, [appliedFilters, pagination.page, pageSize, refreshKey])

  function updateFilter(name, value) {
    setDraftFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }))
  }

  function searchStocks(event) {
    event.preventDefault()

    setPagination((currentPagination) => ({
      ...currentPagination,
      page: 1,
    }))

    setAppliedFilters({ ...draftFilters })
  }

  function resetFilters() {
    setDraftFilters({ ...DEFAULT_STOCK_FILTERS })

    setPagination((currentPagination) => ({
      ...currentPagination,
      page: 1,
    }))

    setAppliedFilters({ ...DEFAULT_STOCK_FILTERS })
  }

  function selectSummaryStatus(stockStatus) {
    setDraftFilters((currentFilters) => ({
      ...currentFilters,
      stockStatus,
    }))

    setPagination((currentPagination) => ({
      ...currentPagination,
      page: 1,
    }))

    setAppliedFilters((currentFilters) => ({
      ...currentFilters,
      stockStatus,
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

  function openAdjustment(stock) {
    setAdjustmentTarget(stock)
  }

  function closeAdjustment() {
    setAdjustmentTarget(null)
  }

  async function saveAdjustment(form) {
    await createStockAdjustment({
      stockId: adjustmentTarget.id,
      ...form,
    })

    closeAdjustment()
    setRefreshKey((currentKey) => currentKey + 1)
  }

  return {
    draftFilters,
    appliedFilters,
    filterOptions,
    stocks,
    summary,
    pagination,
    pageSize,
    loading,
    error,
    adjustmentTarget,
    updateFilter,
    searchStocks,
    resetFilters,
    selectSummaryStatus,
    movePage,
    changePageSize,
    openAdjustment,
    closeAdjustment,
    saveAdjustment,
  }
}

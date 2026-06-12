"use client"

import { useEffect, useState } from "react"
import {
  createInventoryAdjustment,
  fetchInventories,
  fetchInventoryFilterOptions,
} from "@/features/inventory/api/inventoryApi"
import {
  DEFAULT_INVENTORY_FILTER_OPTIONS,
  DEFAULT_INVENTORY_FILTERS,
  DEFAULT_PAGINATION,
} from "@/features/inventory/utils/inventoryManagementUtils"

const DEFAULT_SUMMARY = {
  total: 0,
  normal: 0,
  low: 0,
  outOfStock: 0,
}

export default function useInventoryStatusManagement() {
  const [draftFilters, setDraftFilters] = useState({
    ...DEFAULT_INVENTORY_FILTERS,
  })

  const [appliedFilters, setAppliedFilters] = useState({
    ...DEFAULT_INVENTORY_FILTERS,
  })

  const [filterOptions, setFilterOptions] = useState(
    DEFAULT_INVENTORY_FILTER_OPTIONS,
  )

  const [inventories, setInventories] = useState([])
  const [summary, setSummary] = useState(DEFAULT_SUMMARY)
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION)
  const [pageSize, setPageSize] = useState(10)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)
  const [adjustmentTarget, setAdjustmentTarget] = useState(null)

  useEffect(() => {
    let ignore = false

    fetchInventoryFilterOptions()
      .then((data) => {
        if (!ignore) {
          setFilterOptions(data)
        }
      })
      .catch(() => {
        if (!ignore) {
          setFilterOptions(DEFAULT_INVENTORY_FILTER_OPTIONS)
        }
      })

    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    let ignore = false

    async function loadInventories() {
      setLoading(true)
      setError("")

      try {
        const data = await fetchInventories({
          ...appliedFilters,
          page: pagination.page,
          size: pageSize,
        })

        if (ignore) return

        setInventories(data.items)
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

    loadInventories()

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

  function searchInventories(event) {
    event.preventDefault()

    setPagination((currentPagination) => ({
      ...currentPagination,
      page: 1,
    }))

    setAppliedFilters({ ...draftFilters })
  }

  function resetFilters() {
    setDraftFilters({ ...DEFAULT_INVENTORY_FILTERS })

    setPagination((currentPagination) => ({
      ...currentPagination,
      page: 1,
    }))

    setAppliedFilters({ ...DEFAULT_INVENTORY_FILTERS })
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

  function openAdjustment(inventory) {
    setAdjustmentTarget(inventory)
  }

  function closeAdjustment() {
    setAdjustmentTarget(null)
  }

  async function saveAdjustment(form) {
    await createInventoryAdjustment({
      inventoryId: adjustmentTarget.id,
      ...form,
    })

    closeAdjustment()
    setRefreshKey((currentKey) => currentKey + 1)
  }

  return {
    draftFilters,
    filterOptions,
    inventories,
    summary,
    pagination,
    pageSize,
    loading,
    error,
    adjustmentTarget,
    updateFilter,
    searchInventories,
    resetFilters,
    movePage,
    changePageSize,
    openAdjustment,
    closeAdjustment,
    saveAdjustment,
  }
}

"use client"

import { useEffect, useState } from "react"
import {
  fetchInventoryFilterOptions,
  fetchInventoryHistories,
} from "@/features/inventory/api/inventoryApi"
import {
  DEFAULT_HISTORY_FILTERS,
  DEFAULT_INVENTORY_FILTER_OPTIONS,
  DEFAULT_PAGINATION,
} from "@/features/inventory/utils/inventoryManagementUtils"

function createInitialFilters(initialFilters = {}) {
  return {
    ...DEFAULT_HISTORY_FILTERS,
    ...initialFilters,
  }
}

export default function useInventoryHistoryManagement(initialFilters = {}) {
  const [draftFilters, setDraftFilters] = useState(() =>
    createInitialFilters(initialFilters),
  )

  const [appliedFilters, setAppliedFilters] = useState(() =>
    createInitialFilters(initialFilters),
  )

  const [filterOptions, setFilterOptions] = useState(
    DEFAULT_INVENTORY_FILTER_OPTIONS,
  )

  const [histories, setHistories] = useState([])
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION)
  const [pageSize, setPageSize] = useState(10)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

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

    async function loadHistories() {
      setLoading(true)
      setError("")

      try {
        const data = await fetchInventoryHistories({
          ...appliedFilters,
          page: pagination.page,
          size: pageSize,
        })

        if (ignore) return

        setHistories(data.items)
        setPagination(data.pagination)
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message || "재고 이력을 불러오지 못했습니다.")
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    loadHistories()

    return () => {
      ignore = true
    }
  }, [appliedFilters, pagination.page, pageSize])

  function updateFilter(name, value) {
    setDraftFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }))
  }

  function searchHistories(event) {
    event.preventDefault()

    setPagination((currentPagination) => ({
      ...currentPagination,
      page: 1,
    }))

    setAppliedFilters({ ...draftFilters })
  }

  function resetFilters() {
    setDraftFilters({ ...DEFAULT_HISTORY_FILTERS })

    setPagination((currentPagination) => ({
      ...currentPagination,
      page: 1,
    }))

    setAppliedFilters({ ...DEFAULT_HISTORY_FILTERS })
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

  return {
    draftFilters,
    filterOptions,
    histories,
    pagination,
    pageSize,
    loading,
    error,
    updateFilter,
    searchHistories,
    resetFilters,
    movePage,
    changePageSize,
  }
}

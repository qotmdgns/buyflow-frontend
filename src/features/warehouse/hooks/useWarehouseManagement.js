"use client"

import { useEffect, useState } from "react"
import {
  fetchWarehouseFilterOptions,
  fetchWarehouses,
} from "@/features/warehouse/api/warehouseApi"
import {
  DEFAULT_WAREHOUSE_FILTER_OPTIONS,
  DEFAULT_WAREHOUSE_FILTERS,
  DEFAULT_WAREHOUSE_PAGINATION,
} from "@/features/warehouse/utils/warehouseManagementUtils"

export default function useWarehouseManagement() {
  const [draftFilters, setDraftFilters] = useState(DEFAULT_WAREHOUSE_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState(
    DEFAULT_WAREHOUSE_FILTERS,
  )
  const [warehouses, setWarehouses] = useState([])
  const [pagination, setPagination] = useState(DEFAULT_WAREHOUSE_PAGINATION)
  const [pageSize, setPageSize] = useState(10)

  const [filterOptions, setFilterOptions] = useState(
    DEFAULT_WAREHOUSE_FILTER_OPTIONS,
  )

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let ignore = false

    fetchWarehouseFilterOptions()
      .then((data) => {
        if (!ignore) {
          setFilterOptions(data)
        }
      })
      .catch(() => {
        if (!ignore) {
          setFilterOptions(DEFAULT_WAREHOUSE_FILTER_OPTIONS)
        }
      })

    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    let ignore = false

    async function loadWarehouses() {
      setLoading(true)
      setError("")

      try {
        const data = await fetchWarehouses({
          ...appliedFilters,
          page: pagination.page,
          size: pageSize,
        })

        if (ignore) return

        setWarehouses(data.items)
        setPagination(data.pagination)
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message || "창고 목록을 불러오지 못했습니다.")
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    loadWarehouses()

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

  function searchWarehouses(event) {
    event.preventDefault()

    setPagination((currentPagination) => ({
      ...currentPagination,
      page: 1,
    }))

    setAppliedFilters({ ...draftFilters })
  }

  function resetFilters() {
    setDraftFilters({ ...DEFAULT_WAREHOUSE_FILTERS })

    setPagination((currentPagination) => ({
      ...currentPagination,
      page: 1,
    }))

    setAppliedFilters({ ...DEFAULT_WAREHOUSE_FILTERS })
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
    warehouses,
    pagination,
    pageSize,
    loading,
    error,
    updateFilter,
    searchWarehouses,
    resetFilters,
    movePage,
    changePageSize,
  }
}

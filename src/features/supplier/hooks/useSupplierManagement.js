"use client"

import { useEffect, useState } from "react"
import {
  fetchSupplierFilterOptions,
  fetchSuppliers,
} from "@/features/supplier/api/supplierApi"
import {
  DEFAULT_SUPPLIER_FILTER_OPTIONS,
  DEFAULT_SUPPLIER_FILTERS,
  DEFAULT_SUPPLIER_PAGINATION,
} from "@/features/supplier/utils/supplierManagementUtils"

export default function useSupplierManagement() {
  const [draftFilters, setDraftFilters] = useState(DEFAULT_SUPPLIER_FILTERS)

  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_SUPPLIER_FILTERS)

  const [suppliers, setSuppliers] = useState([])
  const [pagination, setPagination] = useState(DEFAULT_SUPPLIER_PAGINATION)

  const [pageSize, setPageSize] = useState(10)

  const [filterOptions, setFilterOptions] = useState(
    DEFAULT_SUPPLIER_FILTER_OPTIONS,
  )

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let ignore = false

    fetchSupplierFilterOptions()
      .then((data) => {
        if (!ignore) {
          setFilterOptions(data)
        }
      })
      .catch(() => {
        if (!ignore) {
          setFilterOptions(DEFAULT_SUPPLIER_FILTER_OPTIONS)
        }
      })

    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    let ignore = false

    async function loadSuppliers() {
      setLoading(true)
      setError("")

      try {
        const data = await fetchSuppliers({
          ...appliedFilters,
          page: pagination.page,
          size: pageSize,
        })

        if (ignore) return

        setSuppliers(data.items)
        setPagination(data.pagination)
      } catch (requestError) {
        if (!ignore) {
          setError(
            requestError.message || "공급업체 목록을 불러오지 못했습니다.",
          )
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    loadSuppliers()

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

  function searchSuppliers(event) {
    event.preventDefault()

    setPagination((currentPagination) => ({
      ...currentPagination,
      page: 1,
    }))

    setAppliedFilters({ ...draftFilters })
  }

  function resetFilters() {
    setDraftFilters({ ...DEFAULT_SUPPLIER_FILTERS })

    setPagination((currentPagination) => ({
      ...currentPagination,
      page: 1,
    }))

    setAppliedFilters({ ...DEFAULT_SUPPLIER_FILTERS })
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
    suppliers,
    pagination,
    pageSize,
    loading,
    error,
    updateFilter,
    searchSuppliers,
    resetFilters,
    movePage,
    changePageSize,
  }
}

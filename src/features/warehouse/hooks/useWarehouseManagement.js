"use client"

import { useEffect, useState } from "react"
import {
  createWarehouse,
  deleteWarehouse,
  fetchWarehouseById,
  fetchWarehouseFilterOptions,
  fetchWarehouses,
  updateWarehouse,
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
  const [refreshKey, setRefreshKey] = useState(0)

  const [formMode, setFormMode] = useState(null)
  const [editingWarehouse, setEditingWarehouse] = useState(null)
  const [detailWarehouse, setDetailWarehouse] = useState(null)

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
  }, [appliedFilters, pagination.page, pageSize, refreshKey])

  function refreshWarehouses() {
    setRefreshKey((currentKey) => currentKey + 1)
  }

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

  function openWarehouseCreate() {
    setEditingWarehouse(null)
    setFormMode("create")
  }

  function openWarehouseEdit(warehouse) {
    setDetailWarehouse(null)
    setEditingWarehouse(warehouse)
    setFormMode("edit")
  }

  function closeWarehouseForm() {
    setEditingWarehouse(null)
    setFormMode(null)
  }

  async function saveWarehouse(form) {
    if (formMode === "edit" && editingWarehouse) {
      await updateWarehouse(editingWarehouse.id, form)
    } else {
      await createWarehouse(form)

      setPagination((currentPagination) => ({
        ...currentPagination,
        page: 1,
      }))
    }

    closeWarehouseForm()
    refreshWarehouses()
  }

  async function openWarehouseDetail(warehouse) {
    try {
      const detail = await fetchWarehouseById(warehouse.id)
      setDetailWarehouse(detail)
    } catch (requestError) {
      window.alert(
        requestError.message || "창고 상세 정보를 불러오지 못했습니다.",
      )
    }
  }

  function closeWarehouseDetail() {
    setDetailWarehouse(null)
  }

async function removeWarehouse(warehouse) {
    const confirmed = window.confirm(
      `${warehouse.name} 창고를 삭제하시겠습니까?`,
    )

    if (!confirmed) {
      return
    }

    try {
      await deleteWarehouse(warehouse.code)
      
      setDetailWarehouse(null)
      refreshWarehouses()
    } catch (requestError) {
      const serverMessage = requestError.response?.data?.message || requestError.response?.data;
      
      window.alert(serverMessage || "해당 창고를 사용하는 발주 내역이 존재하여 삭제할 수 없습니다.")
    }
  }

  return {
    draftFilters,
    filterOptions,
    warehouses,
    pagination,
    pageSize,
    loading,
    error,
    formMode,
    editingWarehouse,
    detailWarehouse,
    updateFilter,
    searchWarehouses,
    resetFilters,
    movePage,
    changePageSize,
    openWarehouseCreate,
    openWarehouseEdit,
    closeWarehouseForm,
    saveWarehouse,
    openWarehouseDetail,
    closeWarehouseDetail,
    removeWarehouse,
  }
}

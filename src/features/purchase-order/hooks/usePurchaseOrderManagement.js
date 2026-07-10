"use client"

import { useEffect, useState } from "react"

import {
  cancelPurchaseOrder,
  fetchPurchaseOrderFilterOptions,
  fetchPurchaseOrders,
} from "@/features/purchase-order/api/purchaseOrderApi"

import usePurchaseOrderDetail from "@/features/purchase-order/hooks/usePurchaseOrderDetail"

import {
  DEFAULT_PURCHASE_ORDER_FILTERS,
  DEFAULT_PURCHASE_ORDER_PAGINATION,
} from "@/features/purchase-order/utils/purchaseOrderUtils"

export default function usePurchaseOrderManagement() {
  const [draftFilters, setDraftFilters] = useState(
    DEFAULT_PURCHASE_ORDER_FILTERS,
  )
  const [appliedFilters, setAppliedFilters] = useState(
    DEFAULT_PURCHASE_ORDER_FILTERS,
  )
  const [filterOptions, setFilterOptions] = useState({
    suppliers: [],
    statuses: [],
  })
  const [orders, setOrders] = useState([])
  const [pagination, setPagination] = useState(
    DEFAULT_PURCHASE_ORDER_PAGINATION,
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const [cancelTarget, setCancelTarget] = useState(null)
  const [canceling, setCanceling] = useState(false)
  const [cancelError, setCancelError] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)

  const detailState = usePurchaseOrderDetail(selectedOrderId)

  useEffect(() => {
    let ignore = false

    async function loadFilterOptions() {
      try {
        const response = await fetchPurchaseOrderFilterOptions()

        if (ignore) {
          return
        }

        setFilterOptions({
          suppliers: response?.suppliers || [],
          statuses:
            response?.statuses ||
            ["전체", "PENDING", "APPROVED", "CANCELLED"],
        })
      } catch (e) {
        if (!ignore) {
          console.error("발주 검색 옵션 로딩 실패:", e)
        }
      }
    }

    void loadFilterOptions()

    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    let ignore = false

    async function loadOrders() {
      setLoading(true)
      setError("")

      try {
        const params = {
          ...appliedFilters,
          page: pagination.page - 1,
          size: pagination.size,
        }

        const data = await fetchPurchaseOrders(params)

        if (ignore) {
          return
        }

        const list = data.content || data.items || data || []

        setOrders(list)
        setPagination((previousPagination) => ({
          ...previousPagination,
          size: data.size ?? previousPagination.size,
          totalElements:
            data.totalElements ??
            data.pagination?.totalElements ??
            list.length,
          totalPages:
            data.totalPages ??
            data.pagination?.totalPages ??
            1,
        }))
      } catch (e) {
        if (!ignore) {
          setError(e.message || "발주 목록을 불러오지 못했습니다.")
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    void loadOrders()

    return () => {
      ignore = true
    }
  }, [appliedFilters, pagination.page, pagination.size, refreshKey])

  function updateFilter(name, value) {
    setDraftFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }))
  }

  function searchOrders(event) {
    event.preventDefault()
    setPagination((previousPagination) => ({
      ...previousPagination,
      page: 1,
    }))
    setAppliedFilters({ ...draftFilters })
  }

  function resetFilters() {
    setDraftFilters({ ...DEFAULT_PURCHASE_ORDER_FILTERS })
    setAppliedFilters({ ...DEFAULT_PURCHASE_ORDER_FILTERS })
    setPagination((previousPagination) => ({
      ...previousPagination,
      page: 1,
    }))
  }

  function movePage(page) {
    const newPage = Math.max(1, Math.min(page, pagination.totalPages || 1))
    setPagination((previousPagination) => ({
      ...previousPagination,
      page: newPage,
    }))
  }

  function changePageSize(size) {
    setPagination((previousPagination) => ({
      ...previousPagination,
      page: 1,
      size: Number(size),
    }))
  }

  function openDetail(order) {
    setSelectedOrderId(order.orderId || order.id)
  }

  function closeDetail() {
    setSelectedOrderId(null)
  }

  function openCancel(order) {
    setCancelTarget(order)
    setCancelError("")
  }

  function closeCancel() {
    setCancelTarget(null)
    setCancelError("")
  }

  async function confirmCancel(cancelReason) {
    if (!cancelTarget) {
      return
    }

    setCanceling(true)
    setCancelError("")

    try {
      await cancelPurchaseOrder(
        cancelTarget.id || cancelTarget.orderId,
        cancelReason,
      )

      setCancelTarget(null)
      setSelectedOrderId(null)
      setRefreshKey((currentKey) => currentKey + 1)
    } catch (e) {
      setCancelError(e.message || "발주 취소 처리에 실패했습니다.")
    } finally {
      setCanceling(false)
    }
  }

  return {
    draftFilters,
    filterOptions,
    orders,
    pagination,
    loading,
    error,
    selectedOrderId,
    detailState,
    cancelTarget,
    canceling,
    cancelError,
    updateFilter,
    searchOrders,
    resetFilters,
    movePage,
    changePageSize,
    openDetail,
    closeDetail,
    openCancel,
    closeCancel,
    confirmCancel,
  }
}

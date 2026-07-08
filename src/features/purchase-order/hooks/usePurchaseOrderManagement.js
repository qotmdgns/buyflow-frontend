"use client"

import { useCallback, useEffect, useState } from "react"

import {
  cancelPurchaseOrder,
  fetchPurchaseOrderFormOptions,
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

  const detailState = usePurchaseOrderDetail(selectedOrderId)

  const reloadOrders = useCallback(async () => {
    setLoading(true)
    setError("")

    try {
      const params = {
        ...appliedFilters,
        page: pagination.page - 1,
        size: pagination.size,
      }

      const data = await fetchPurchaseOrders(params)

      const list = data.content || data.items || data || []

      setOrders(list)

      setPagination(prev => ({
          ...prev,
          size: data.size ??  prev.size,
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
      setError(e.message || "발주 목록을 불러오지 못했습니다.")
    } finally {
      setLoading(false)
    }
  }, [
    appliedFilters,
    pagination.page,
    pagination.size,
  ])

  useEffect(() => {
    let ignore = false

    async function loadFormOptions() {
      try {
        const response = await fetchPurchaseOrderFormOptions()

        if (ignore) {
          return
        }

        setFilterOptions({
          suppliers: response.suppliers || [],
          statuses: response.statuses || ["전체", "PENDING", "APPROVED", "CANCELLED"],
        });
      } catch (err) {
        console.error("폼 옵션 로딩 실패:", err);
      }
    }

    void loadFormOptions()

    return () => { ignore = true; }
  }, [])

  useEffect(() => {
    void reloadOrders()
  }, [reloadOrders])

  function updateFilter(name, value) {
    setDraftFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }))
  }

  function searchOrders(event) {
    event.preventDefault()

    setPagination(prev => ({
      ...prev,
      page: 1,
    }))

    setAppliedFilters({ ...draftFilters })
  }

  function resetFilters() {
    setDraftFilters({ ...DEFAULT_PURCHASE_ORDER_FILTERS })
    setAppliedFilters({ ...DEFAULT_PURCHASE_ORDER_FILTERS })

    setPagination(prev => ({
      ...prev,
      page: 1,
    }))
  }

  function movePage(page) {
    const newPage = Math.max(
      1, 
      Math.min(page, pagination.totalPages || 1),
    )

    setPagination(prev => ({ 
      ...prev, 
      page: newPage 
    }))
  }

  function changePageSize(size) {
    setPagination(prev => ({
      ...prev,
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
    if (!cancelTarget) return

    setCanceling(true)

    try {
      await cancelPurchaseOrder(
        cancelTarget.id || cancelTarget.orderId, 
        cancelReason,
      )

      setCancelTarget(null)
      setSelectedOrderId(null)

      await reloadOrders()
    } catch (e) {
      setCancelError(
        e.message || "발주 취소 처리에 실패했습니다."
      )
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

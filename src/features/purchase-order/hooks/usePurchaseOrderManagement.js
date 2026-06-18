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
    suppliers: ["전체 공급업체"],
    statuses: ["전체"],
  })

  const [orders, setOrders] = useState([])
  const [pagination, setPagination] = useState(
    DEFAULT_PURCHASE_ORDER_PAGINATION,
  )

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)

  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const [cancelTarget, setCancelTarget] = useState(null)
  const [canceling, setCanceling] = useState(false)
  const [cancelError, setCancelError] = useState("")

  const detailState = usePurchaseOrderDetail(selectedOrderId)

  useEffect(() => {
    fetchPurchaseOrderFilterOptions().then(setFilterOptions)
  }, [])

  useEffect(() => {
    let ignore = false

    async function loadOrders() {
      setLoading(true)
      setError("")

      try {
        const data = await fetchPurchaseOrders({
          ...appliedFilters,
          page: pagination.page,
          size: pagination.size,
        })

        if (!ignore) {
          setOrders(data.items)
          console.log("현재 page", pagination.page)
          console.log("현재 size", pagination.size)

          console.log("서버 page", data.pagination.page)
          console.log("서버 size", data.pagination.size)
          setPagination(data.pagination)
        }
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message || "발주 목록을 불러오지 못했습니다.")
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    loadOrders()

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

    setPagination((currentPagination) => ({
      ...currentPagination,
      page: 1,
    }))

    setAppliedFilters({ ...draftFilters })
  }

  function resetFilters() {
    setDraftFilters({ ...DEFAULT_PURCHASE_ORDER_FILTERS })
    setAppliedFilters({ ...DEFAULT_PURCHASE_ORDER_FILTERS })
  }

  function movePage(page) {
    setPagination((currentPagination) => ({
      ...currentPagination,
      page,
    }))
  }

  function changePageSize(size) {
    setPagination((currentPagination) => ({
      ...currentPagination,
      page: 1,
      size,
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

    try {
      await cancelPurchaseOrder(cancelTarget.id, cancelReason)

      setCancelTarget(null)
      setSelectedOrderId(null)
      setRefreshKey((currentKey) => currentKey + 1)
    } catch (requestError) {
      setCancelError(requestError.message || "발주 취소 처리에 실패했습니다.")
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

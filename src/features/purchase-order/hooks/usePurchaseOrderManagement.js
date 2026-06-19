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
          // 🚀 [최종 지뢰 진압 완료]: 백엔드 자바 컨트롤러에서 사출해 준 
          // PageResponse 표준 족보 주머니 이름인 'content' 또는 'items' 가드 매핑!
          const realContentList = data.content || data.items || data || [];
          setOrders(realContentList)

          console.log("현재 page", pagination.page)
          console.log("현재 size", pagination.size)

          // 페이징 객체 안전핀 가드레일 매핑
          if (data.pagination) {
            setPagination(data.pagination)
          } else if (data.page) {
            setPagination({
              page: data.page,
              size: data.size,
              totalElements: data.totalElements,
              totalPages: data.totalPages
            })
          }
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
      await cancelPurchaseOrder(cancelTarget.id || cancelTarget.orderId, cancelReason)

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
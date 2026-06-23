"use client"

import { useEffect, useState } from "react"

import {
  cancelPurchaseOrder,
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
  const [refreshKey, setRefreshKey] = useState(0)

  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const [cancelTarget, setCancelTarget] = useState(null)
  const [canceling, setCanceling] = useState(false)
  const [cancelError, setCancelError] = useState("")

  const detailState = usePurchaseOrderDetail(selectedOrderId)

  useEffect(() => {
    let ignore = false

    async function loadFormOptions() {
      try {
        // 성공하는 URL로 바꿔보세요
        const res = await fetch("http://localhost:8080/api/orders/form-options", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!res.ok) {
          console.error("Status:", res.status);
          throw new Error(`HTTP ${res.status}`);
        }
        
        const response = await res.json();
        console.log("✅ 성공적으로 받아옴:", response);

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
    let ignore = false

    async function loadOrders() {
      setLoading(true)
      setError("")

      try {
        const params = {
          ...appliedFilters,
          page: pagination.page - 1,
          size: pagination.size,
        };

        console.log("📤 [SEARCH] 최종 params:", params);

        const data = await fetchPurchaseOrders(params);

        if (!ignore) {
          const realContentList = data.content || data.items || data || [];
          setOrders(realContentList);

          const newPagination = {
            page: data.number !== undefined ? data.number + 1 : pagination.page,
            size: data.size ?? data.pagination?.size ?? pagination.size,
            totalElements: data.totalElements ?? data.pagination?.totalElements ?? realContentList.length,
            totalPages: data.totalPages ?? data.pagination?.totalPages ?? 1,
          };

          console.log("🆕 새 pagination 적용:", newPagination);
          setPagination(newPagination);
        }
      } catch (requestError) {
        console.error("목록 로드 실패:", requestError);
        if (!ignore) {
          setError(requestError.message || "발주 목록을 불러오지 못했습니다.");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadOrders();

    return () => { ignore = true; };
  }, [appliedFilters, refreshKey, pagination.page, pagination.size]);

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
    const newPage = Math.max(1, Math.min(page, pagination.totalPages || 1));
    console.log(`🔄 movePage: ${pagination.page} → ${newPage}`);

    setPagination(prev => ({ ...prev, page: newPage }));
    setRefreshKey(k => k + 1);   // 강제 트리거
  }

  function changePageSize(size) {
    setPagination(prev => ({
      ...prev,
      page: 1,
      size: Number(size),
    }));
    setRefreshKey(k => k + 1);
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

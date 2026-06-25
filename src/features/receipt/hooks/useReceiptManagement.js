"use client"

import { useEffect, useMemo, useState } from "react"

import {
  fetchReceipts,
  fetchReceiptFilterOptions,
  fetchReceiptSummary,
} from "@/features/receipt/api/ReceiptApi"

import {
  DEFAULT_RECEIPT_FILTERS,
  DEFAULT_RECEIPT_PAGINATION,
} from "@/features/receipt/utils/ReceiptUtils"

const EMPTY_SUMMARY = {
  todayExpected: 0,
  yesterdayDifference: 0,
  delayed: 0,
  partial: 0,
  progressRate: 0,
  tabCounts: {
    EXPECTED: 0,
    PARTIAL: 0,
    COMPLETED: 0,
  },
}

export default function useReceiptManagement() {
  const [draftFilters, setDraftFilters] = useState(DEFAULT_RECEIPT_FILTERS)

  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_RECEIPT_FILTERS)

  const [activeTab, setActiveTab] = useState("EXPECTED")
  const [cardFilter, setCardFilter] = useState("ALL")

  const [filterOptions, setFilterOptions] = useState({
    warehouses: ["전체 창고"],
    statuses: ["전체 상태"],
  })

  const [summary, setSummary] = useState(EMPTY_SUMMARY)
  const [receipts, setReceipts] = useState([])

  const [pagination, setPagination] = useState(DEFAULT_RECEIPT_PAGINATION)

  const [selectedIds, setSelectedIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const currentPage = pagination?.page ?? DEFAULT_RECEIPT_PAGINATION.page ?? 1
  const currentSize = pagination?.size ?? DEFAULT_RECEIPT_PAGINATION.size ?? 10

  useEffect(() => {
    fetchReceiptFilterOptions()
      .then((data) => {
        setFilterOptions(
          data ?? {
            warehouses: ["전체 창고"],
            statuses: ["전체 상태"],
          },
        )
      })
      .catch(() => {
        setFilterOptions({
          warehouses: ["전체 창고"],
          statuses: ["전체 상태"],
        })
      })

    fetchReceiptSummary()
      .then((data) => {
        setSummary(data ?? EMPTY_SUMMARY)
      })
      .catch(() => setSummary(EMPTY_SUMMARY))
  }, [])

  useEffect(() => {
    let ignore = false

    async function loadReceipts() {
      setLoading(true)
      setError("")

      try {
  console.log("loadReceipts 실행됨")
  console.log("activeTab =", activeTab)
  console.log("appliedFilters =", appliedFilters)

  const data = await fetchReceipts({
    ...appliedFilters,
    activeTab,
    cardFilter,
    page: currentPage,
    size: currentSize,
  })

  console.log("API 응답 =", data)

  if (!ignore) {
const nextItems = data?.items ?? []

const nextPagination = {
  ...DEFAULT_RECEIPT_PAGINATION,
  ...(data?.pagination ?? {}),
  page: data?.pagination?.page ?? currentPage,
  size: data?.pagination?.size ?? currentSize,
}

          setReceipts(nextItems)
          setPagination(nextPagination)
          setSelectedIds(new Set())
        }
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message || "입고 목록을 불러오지 못했습니다.")
          setReceipts([])
          setPagination((currentPagination) => ({
            ...DEFAULT_RECEIPT_PAGINATION,
            ...(currentPagination ?? {}),
          }))
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    loadReceipts()

    return () => {
      ignore = true
    }
  }, [activeTab, cardFilter, appliedFilters, currentPage, currentSize])

  const allCurrentRowsSelected = useMemo(() => {
    return (
      receipts.length > 0 &&
      receipts.every((receipt) => selectedIds.has(receipt.id))
    )
  }, [receipts, selectedIds])

  function updateFilter(name, value) {
    setDraftFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }))
  }

  function searchReceipts(event) {
    event.preventDefault()

    setPagination((currentPagination) => ({
      ...DEFAULT_RECEIPT_PAGINATION,
      ...(currentPagination ?? {}),
      page: 1,
    }))

    setAppliedFilters({ ...draftFilters })
  }

  function resetFilters() {
    setDraftFilters({ ...DEFAULT_RECEIPT_FILTERS })
    setAppliedFilters({ ...DEFAULT_RECEIPT_FILTERS })

    setPagination((currentPagination) => ({
      ...DEFAULT_RECEIPT_PAGINATION,
      ...(currentPagination ?? {}),
      page: 1,
    }))
  }

  function selectTab(tab) {
    setActiveTab(tab)
    setCardFilter("ALL")

    setDraftFilters((currentFilters) => ({
      ...currentFilters,
      status: "전체 상태",
    }))

    setAppliedFilters((currentFilters) => ({
      ...currentFilters,
      status: "전체 상태",
    }))

    setPagination((currentPagination) => ({
      ...DEFAULT_RECEIPT_PAGINATION,
      ...(currentPagination ?? {}),
      page: 1,
    }))
  }

 function selectCard(filter) {
  setCardFilter(filter)

  // 카드를 누르면 탭은 전체 기준으로 조회
  setActiveTab("ALL")

  setPagination((currentPagination) => ({
    ...DEFAULT_RECEIPT_PAGINATION,
    ...(currentPagination ?? {}),
    page: 1,
  }))
}

  function movePage(page) {
    setPagination((currentPagination) => ({
      ...DEFAULT_RECEIPT_PAGINATION,
      ...(currentPagination ?? {}),
      page,
    }))
  }

  function changePageSize(size) {
    setPagination((currentPagination) => ({
      ...DEFAULT_RECEIPT_PAGINATION,
      ...(currentPagination ?? {}),
      page: 1,
      size,
    }))
  }

  function toggleAllRows() {
    if (allCurrentRowsSelected) {
      setSelectedIds(new Set())
      return
    }

    setSelectedIds(new Set(receipts.map((receipt) => receipt.id)))
  }

  function toggleRow(receiptId) {
    setSelectedIds((currentIds) => {
      const nextIds = new Set(currentIds)

      if (nextIds.has(receiptId)) {
        nextIds.delete(receiptId)
      } else {
        nextIds.add(receiptId)
      }

      return nextIds
    })
  }

  async function exportReceipts() {
    const data = await fetchReceipts({
      ...appliedFilters,
      activeTab,
      page: 1,
      size: 10000,
    })

    return data?.items ?? []
  }

  return {
    draftFilters,
    activeTab,
    cardFilter,
    filterOptions,
    summary,
    receipts,
    pagination,
    selectedIds,
    allCurrentRowsSelected,
    loading,
    error,
    updateFilter,
    searchReceipts,
    resetFilters,
    selectTab,
    selectCard,
    movePage,
    changePageSize,
    toggleAllRows,
    toggleRow,
    exportReceipts,
  }
}

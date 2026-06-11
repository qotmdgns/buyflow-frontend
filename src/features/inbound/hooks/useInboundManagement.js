"use client"

import { useEffect, useMemo, useState } from "react"

import {
  fetchInboundFilterOptions,
  fetchInboundSummary,
  fetchInbounds,
} from "@/features/inbound/api/inboundApi"

import {
  DEFAULT_INBOUND_FILTERS,
  DEFAULT_INBOUND_PAGINATION,
} from "@/features/inbound/utils/inboundUtils"

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

export default function useInboundManagement() {
  const [draftFilters, setDraftFilters] = useState(DEFAULT_INBOUND_FILTERS)

  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_INBOUND_FILTERS)

  const [activeTab, setActiveTab] = useState("EXPECTED")

  const [filterOptions, setFilterOptions] = useState({
    warehouses: ["전체 창고"],
    statuses: ["전체 상태"],
  })

  const [summary, setSummary] = useState(EMPTY_SUMMARY)
  const [inbounds, setInbounds] = useState([])

  const [pagination, setPagination] = useState(DEFAULT_INBOUND_PAGINATION)

  const [selectedIds, setSelectedIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchInboundFilterOptions()
      .then(setFilterOptions)
      .catch(() => {
        setFilterOptions({
          warehouses: ["전체 창고"],
          statuses: ["전체 상태"],
        })
      })

    fetchInboundSummary()
      .then(setSummary)
      .catch(() => setSummary(EMPTY_SUMMARY))
  }, [])

  useEffect(() => {
    let ignore = false

    async function loadInbounds() {
      setLoading(true)
      setError("")

      try {
        const data = await fetchInbounds({
          ...appliedFilters,
          activeTab,
          page: pagination.page,
          size: pagination.size,
        })

        if (!ignore) {
          setInbounds(data.items)
          setPagination(data.pagination)
          setSelectedIds(new Set())
        }
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message || "입고 목록을 불러오지 못했습니다.")
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    loadInbounds()

    return () => {
      ignore = true
    }
  }, [activeTab, appliedFilters, pagination.page, pagination.size])

  const allCurrentRowsSelected = useMemo(() => {
    return (
      inbounds.length > 0 &&
      inbounds.every((inbound) => selectedIds.has(inbound.id))
    )
  }, [inbounds, selectedIds])

  function updateFilter(name, value) {
    setDraftFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }))
  }

  function searchInbounds(event) {
    event.preventDefault()

    setPagination((currentPagination) => ({
      ...currentPagination,
      page: 1,
    }))

    setAppliedFilters({ ...draftFilters })
  }

  function resetFilters() {
    setDraftFilters({ ...DEFAULT_INBOUND_FILTERS })
    setAppliedFilters({ ...DEFAULT_INBOUND_FILTERS })

    setPagination((currentPagination) => ({
      ...currentPagination,
      page: 1,
    }))
  }

  function selectTab(tab) {
    setActiveTab(tab)

    setDraftFilters((currentFilters) => ({
      ...currentFilters,
      status: "전체 상태",
    }))

    setAppliedFilters((currentFilters) => ({
      ...currentFilters,
      status: "전체 상태",
    }))

    setPagination((currentPagination) => ({
      ...currentPagination,
      page: 1,
    }))
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

  function toggleAllRows() {
    if (allCurrentRowsSelected) {
      setSelectedIds(new Set())
      return
    }

    setSelectedIds(new Set(inbounds.map((inbound) => inbound.id)))
  }

  function toggleRow(inboundId) {
    setSelectedIds((currentIds) => {
      const nextIds = new Set(currentIds)

      if (nextIds.has(inboundId)) {
        nextIds.delete(inboundId)
      } else {
        nextIds.add(inboundId)
      }

      return nextIds
    })
  }

  async function exportInbounds() {
    const data = await fetchInbounds({
      ...appliedFilters,
      activeTab,
      page: 1,
      size: 10000,
    })

    return data.items
  }

  return {
    draftFilters,
    activeTab,
    filterOptions,
    summary,
    inbounds,
    pagination,
    selectedIds,
    allCurrentRowsSelected,
    loading,
    error,
    updateFilter,
    searchInbounds,
    resetFilters,
    selectTab,
    movePage,
    changePageSize,
    toggleAllRows,
    toggleRow,
    exportInbounds,
  }
}

"use client"

import { useEffect, useState } from "react"

import {
  fetchInspectionFilterOptions,
  fetchPendingInspections,
  fetchPendingInspectionSummary,
} from "@/features/inspection/api/inspectionApi"

import {
  DEFAULT_INSPECTION_FILTER_OPTIONS,
  DEFAULT_INSPECTION_FILTERS,
  DEFAULT_INSPECTION_PAGINATION,
  INSPECTION_SUMMARY_FILTERS,
} from "@/features/inspection/utils/inspectionManagementUtils"

const DEFAULT_SUMMARY = {
  total: 0,
  receivedToday: 0,
  urgent: 0,
  overdue: 0,
}

export default function useInspectionManagement() {
  const [draftFilters, setDraftFilters] = useState(DEFAULT_INSPECTION_FILTERS)

  const [appliedFilters, setAppliedFilters] = useState(
    DEFAULT_INSPECTION_FILTERS,
  )

  const [summaryFilter, setSummaryFilter] = useState(
    INSPECTION_SUMMARY_FILTERS.ALL,
  )

  const [filterOptions, setFilterOptions] = useState(
    DEFAULT_INSPECTION_FILTER_OPTIONS,
  )

  const [summary, setSummary] = useState(DEFAULT_SUMMARY)

  const [inspections, setInspections] = useState([])

  const [pagination, setPagination] = useState(DEFAULT_INSPECTION_PAGINATION)

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState("")

  useEffect(() => {
    let ignore = false

    Promise.all([
      fetchInspectionFilterOptions(),
      fetchPendingInspectionSummary(),
    ])
      .then(([nextFilterOptions, nextSummary]) => {
        if (ignore) return

        setFilterOptions(nextFilterOptions)

        setSummary(nextSummary)
      })
      .catch(() => {
        if (ignore) return

        setFilterOptions(DEFAULT_INSPECTION_FILTER_OPTIONS)

        setSummary(DEFAULT_SUMMARY)
      })

    return () => {
      ignore = true
    }
  }, [])

useEffect(() => {
    let ignore = false

    async function loadInspections() {
      setLoading(true)
      setError("")

      try {
        // 🚀 핵심 해결책: Promise.all을 써서 목록(List)과 요약(Summary)을 '항상 동시에' 서버에 요청합니다.
        const [listData, summaryData] = await Promise.all([
          fetchPendingInspections({
            ...appliedFilters,
            summaryFilter,
            page: pagination.page,
            size: pagination.size,
          }),
          // 💡 요약 데이터도 새로 요청! (검색 조건이 요약에 반영되길 원한다면 appliedFilters를 넘겨주면 됩니다)
          fetchPendingInspectionSummary(appliedFilters) 
        ]);

        if (ignore) return

        // 1. 목록 업데이트
        setInspections(listData.items || [])
        setPagination(listData.pagination ?? DEFAULT_INSPECTION_PAGINATION)
        
        // 2. 요약 카드 업데이트 (프론트에서 억지로 0으로 만들지 않고, 서버가 준 값을 그대로 믿고 꽂아 넣습니다!)
        if (summaryData) {
          setSummary(summaryData)
        }

      } catch (requestError) {
        if (!ignore) {
          setInspections([])
          setSummary({ total: 0, receivedToday: 0, urgent: 0, overdue: 0 })
          setError(
            requestError.message || "검수 대기 목록을 불러오지 못했습니다.",
          )
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    loadInspections()

    return () => {
      ignore = true
    }
  }, [appliedFilters, summaryFilter, pagination.page, pagination.size])

  function updateFilter(name, value) {
    setDraftFilters((currentFilters) => ({
      ...currentFilters,

      [name]: value,
    }))
  }

  function searchInspections(event) {
    event.preventDefault()

    setPagination((currentPagination) => ({
      ...currentPagination,

      page: 1,
    }))

    setAppliedFilters({
      ...draftFilters,
    })
  }

  function resetFilters() {
    setDraftFilters({
      ...DEFAULT_INSPECTION_FILTERS,
    })

    setAppliedFilters({
      ...DEFAULT_INSPECTION_FILTERS,
    })

    setSummaryFilter(INSPECTION_SUMMARY_FILTERS.ALL)

    setPagination((currentPagination) => ({
      ...currentPagination,

      page: 1,
    }))
  }

  function changeSummaryFilter(nextFilter) {
    setSummaryFilter(nextFilter)

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

  return {
    draftFilters,
    summaryFilter,
    filterOptions,
    summary,
    inspections,
    pagination,
    loading,
    error,
    updateFilter,
    searchInspections,
    resetFilters,
    changeSummaryFilter,
    movePage,
    changePageSize,
  }
}

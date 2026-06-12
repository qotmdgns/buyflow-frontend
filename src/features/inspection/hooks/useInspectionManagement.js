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
        const data = await fetchPendingInspections({
          ...appliedFilters,

          summaryFilter,

          page: pagination.page,

          size: pagination.size,
        })

        if (ignore) return

        setInspections(data.items)

        setPagination(data.pagination)
      } catch (requestError) {
        if (!ignore) {
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

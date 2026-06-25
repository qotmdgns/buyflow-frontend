"use client"

import { useEffect, useState } from "react"

import {
  fetchCompletedInspections,
  fetchCompletedInspectionSummary,
  fetchInspectionFilterOptions,
} from "@/features/inspection/api/inspectionApi"

import {
  COMPLETED_INSPECTION_RESULT_FILTERS,
  DEFAULT_COMPLETED_INSPECTION_FILTERS,
  DEFAULT_INSPECTION_FILTER_OPTIONS,
  DEFAULT_INSPECTION_PAGINATION,
} from "@/features/inspection/utils/inspectionManagementUtils"

const DEFAULT_SUMMARY = {
  total: 0,
  pass: 0,
  defect: 0,
}

export default function useCompletedInspectionManagement() {
  const [draftFilters, setDraftFilters] = useState(
    DEFAULT_COMPLETED_INSPECTION_FILTERS,
  )

  const [appliedFilters, setAppliedFilters] = useState(
    DEFAULT_COMPLETED_INSPECTION_FILTERS,
  )

  const [resultFilter, setResultFilter] = useState(
    COMPLETED_INSPECTION_RESULT_FILTERS.ALL,
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

    async function loadInitialData() {
      try {
        const [nextFilterOptions, nextSummary] = await Promise.all([
          fetchInspectionFilterOptions(),
          fetchCompletedInspectionSummary(),
        ])

        if (ignore) return

        setFilterOptions(nextFilterOptions)
        setSummary(nextSummary)
      } catch {
        if (ignore) return

        setFilterOptions(DEFAULT_INSPECTION_FILTER_OPTIONS)
        setSummary(DEFAULT_SUMMARY)
      }
    }

    loadInitialData()

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

        const [listData, summaryData] = await Promise.all([
          fetchCompletedInspections({
          ...appliedFilters,
          inspectionResult: resultFilter,
          page: pagination.page,
          size: pagination.size,
          }),
          fetchCompletedInspectionSummary(appliedFilters)
        ])

        if (ignore) return

        setInspections(listData.items || [])
        setPagination(listData.pagination ?? DEFAULT_INSPECTION_PAGINATION)

        if (summaryData) {
          setSummary(summaryData)
        }

      } catch (requestError) {
        if (!ignore) {
          setInspections([])
          setSummary({ total: 0, pass: 0, defect: 0 })
          setError(
            requestError.message || "검수 완료 목록을 불러오지 못했습니다.",
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
  }, [appliedFilters, resultFilter, pagination.page, pagination.size])



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
      ...DEFAULT_COMPLETED_INSPECTION_FILTERS,
    })

    setAppliedFilters({
      ...DEFAULT_COMPLETED_INSPECTION_FILTERS,
    })

    setResultFilter(COMPLETED_INSPECTION_RESULT_FILTERS.ALL)

    setPagination((currentPagination) => ({
      ...currentPagination,
      page: 1,
    }))
  }

  function changeResultFilter(nextFilter) {
    setResultFilter(nextFilter)

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
    resultFilter,
    filterOptions,
    summary,
    inspections,
    pagination,
    loading,
    error,
    updateFilter,
    searchInspections,
    resetFilters,
    changeResultFilter,
    movePage,
    changePageSize,
  }
}

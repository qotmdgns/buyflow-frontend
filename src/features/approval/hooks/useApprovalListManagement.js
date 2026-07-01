"use client"

import { useEffect, useMemo, useState } from "react"
import {
  fetchApprovals,
  fetchApprovalSummary,
} from "@/features/approval/api/approvalApi"

const DEFAULT_FILTERS = {
  requestNumber: "",
  title: "",
  requester: "",
  department: "",
  status: "전체",
  desiredReceiptAt: "",
}

const DEFAULT_PAGINATION = {
  page: 1,
  size: 10,
  totalElements: 0,
  totalPages: 1,
}

const DEFAULT_SUMMARY = {
  total: 0,
  pending: 0,
  rejected: 0,
  approved: 0,
}

function createDisplayedSummary(baseSummary, activeFilters, totalElements) {
  const status = activeFilters?.status ?? "전체"

  if (status === "전체") {
    return baseSummary
  }

  return {
    total: totalElements,
    pending: status === "PENDING_APPROVAL" ? totalElements : 0,
    rejected: status === "REJECTED" ? totalElements : 0,
    approved: status === "APPROVED" ? totalElements : 0,
  }
}

export default function useApprovalListManagement() {
  const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS)

  const [approvals, setApprovals] = useState([])
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION)
  const [pageSize, setPageSize] = useState(10)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [summary, setSummary] = useState(DEFAULT_SUMMARY)

  useEffect(() => {
    let ignore = false

    async function loadApprovals() {
      setLoading(true)
      setError("")

      try {
        const data = await fetchApprovals({
          ...appliedFilters,
          page: pagination.page,
          size: pageSize,
        })

        if (!ignore) {
          setApprovals(data.items)
          setPagination(data.pagination)
        }
      } catch (requestError) {
        if (!ignore) {
          setError(
            requestError.message || "승인 관리 목록을 불러오지 못했습니다.",
          )
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    loadApprovals()

    return () => {
      ignore = true
    }
  }, [appliedFilters, pagination.page, pageSize])

  useEffect(() => {
    let ignore = false

    async function loadSummary() {
      try {
        const data = await fetchApprovalSummary()

        if (!ignore) {
          setSummary(data)
        }
      } catch (error) {
        console.error("승인 요약 조회 중 오류가 발생했습니다.", error)

        if (!ignore) {
          setSummary(DEFAULT_SUMMARY)
        }
      }
    }

    loadSummary()

    return () => {
      ignore = true
    }
  }, [])

  function updateFilter(name, value) {
    setDraftFilters((previousFilters) => ({
      ...previousFilters,
      [name]: value,
    }))
  }

  function searchApprovals() {
    setAppliedFilters({ ...draftFilters })

    setPagination((previousPagination) => ({
      ...previousPagination,
      page: 1,
    }))
  }

  function resetFilters() {
    setDraftFilters(DEFAULT_FILTERS)
    setAppliedFilters(DEFAULT_FILTERS)

    setPagination((previousPagination) => ({
      ...previousPagination,
      page: 1,
    }))
  }

  function movePage(page) {
    setPagination((previousPagination) => ({
      ...previousPagination,
      page,
    }))
  }

  function changePageSize(size) {
    setPageSize(size)

    setPagination((previousPagination) => ({
      ...previousPagination,
      page: 1,
    }))
  }

  const displayedSummary = useMemo(
    () =>
      createDisplayedSummary(summary, appliedFilters, pagination.totalElements),
    [summary, appliedFilters, pagination.totalElements],
  )

  function selectSummaryFilter(filter) {
    const nextFilters = {
      ...appliedFilters,
      status: filter.status ?? "전체",
    }

    setDraftFilters(nextFilters)
    setAppliedFilters(nextFilters)

    setPagination((previousPagination) => ({
      ...previousPagination,
      page: 1,
    }))
  }

  return {
    draftFilters,
    appliedFilters,
    approvals,
    pagination,
    pageSize,
    loading,
    error,
    summary: displayedSummary,
    updateFilter,
    searchApprovals,
    resetFilters,
    movePage,
    changePageSize,
    selectSummaryFilter,
  }
}

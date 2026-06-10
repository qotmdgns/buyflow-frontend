"use client"

import { useEffect, useState } from "react"
import { fetchApprovals } from "@/features/approval/api/approvalApi"

const DEFAULT_FILTERS = {
  requestNumber: "",
  title: "",
  requester: "",
  department: "",
  status: "전체",
  requestedFrom: "",
  requestedTo: "",
}

const DEFAULT_PAGINATION = {
  page: 1,
  size: 10,
  totalElements: 0,
  totalPages: 1,
}

export default function useApprovalListManagement() {
  const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS)

  const [approvals, setApprovals] = useState([])
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION)
  const [pageSize, setPageSize] = useState(10)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

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

  return {
    draftFilters,
    approvals,
    pagination,
    pageSize,
    loading,
    error,
    updateFilter,
    searchApprovals,
    resetFilters,
    movePage,
    changePageSize,
  }
}

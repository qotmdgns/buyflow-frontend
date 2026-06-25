"use client"

import { useEffect, useState } from "react"
import {
  fetchProductById,
  fetchProductFilterOptions,
  fetchProducts,
} from "@/features/product/api/productApi"
import {
  DEFAULT_FILTER_OPTIONS,
  DEFAULT_FILTERS,
  DEFAULT_PAGINATION,
} from "@/features/product/utils/productManagementUtils"

export default function useProductManagement() {
  const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS)

  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION)
  const [pageSize, setPageSize] = useState(15)

  const [filterOptions, setFilterOptions] = useState(DEFAULT_FILTER_OPTIONS)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [reloadKey, setReloadKey] = useState(0)

  // 선택한 품목의 상세 Modal 데이터
  const [detailProduct, setDetailProduct] = useState(null)

  useEffect(() => {
    let ignore = false

    fetchProductFilterOptions()
      .then((data) => {
        if (!ignore) {
          setFilterOptions(data)
        }
      })
      .catch(() => {
        if (!ignore) {
          setFilterOptions(DEFAULT_FILTER_OPTIONS)
        }
      })

    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    let ignore = false

    async function loadProducts() {
      setLoading(true)
      setError("")

      try {
        const data = await fetchProducts({
          ...appliedFilters,
          page: pagination.page,
          size: pageSize,
        })

        if (ignore) {
          return
        }

        setProducts(data.items)
        setPagination(data.pagination)
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message || "품목 목록을 불러오지 못했습니다.")
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    loadProducts()

    return () => {
      ignore = true
    }
  }, [appliedFilters, pagination.page, pageSize, reloadKey])

  function updateFilter(name, value) {
    setDraftFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }))
  }

  function searchProducts(event) {
    event.preventDefault()

    setPagination((currentPagination) => ({
      ...currentPagination,
      page: 1,
    }))

    setAppliedFilters({ ...draftFilters })
  }

  function resetFilters() {
    setDraftFilters({ ...DEFAULT_FILTERS })

    setPagination((currentPagination) => ({
      ...currentPagination,
      page: 1,
    }))

    setAppliedFilters({ ...DEFAULT_FILTERS })
  }

  function movePage(nextPage) {
    const safePage = Math.min(Math.max(nextPage, 1), pagination.totalPages)

    setPagination((currentPagination) => ({
      ...currentPagination,
      page: safePage,
    }))
  }

  function changePageSize(nextPageSize) {
    setPageSize(nextPageSize)

    setPagination((currentPagination) => ({
      ...currentPagination,
      page: 1,
    }))
  }

  async function openProductDetail(product) {
    try {
      const detail = await fetchProductById(product.id)
      setDetailProduct(detail)
    } catch (requestError) {
      window.alert(
        requestError.message || "품목 상세 정보를 불러오지 못했습니다.",
      )
    }
  }

  function closeProductDetail() {
    setDetailProduct(null)
  }

  function reloadProducts() {
    setReloadKey((currentKey) => currentKey + 1)
  }

  return {
    draftFilters,
    filterOptions,
    products,
    pagination,
    pageSize,
    loading,
    error,
    detailProduct,
    updateFilter,
    searchProducts,
    resetFilters,
    movePage,
    changePageSize,
    openProductDetail,
    closeProductDetail,
    reloadProducts,
  }
}

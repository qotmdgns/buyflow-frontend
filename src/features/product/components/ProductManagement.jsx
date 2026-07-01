"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Download, Plus } from "lucide-react"
import ProductDetailModal from "@/features/product/components/ProductDetailModal"
import ProductPagination from "@/features/product/components/ProductPagination"
import ProductSearchForm from "@/features/product/components/ProductSearchForm"
import ProductTable from "@/features/product/components/ProductTable"
import useProductManagement from "@/features/product/hooks/useProductManagement"
import {
  deleteProduct,
  downloadProductExcel,
} from "@/features/product/api/productApi"

export default function ProductManagement() {
  const {
    draftFilters,
    appliedFilters,
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
  } = useProductManagement()

  const router = useRouter()
  const [isDeletingProduct, setIsDeletingProduct] = useState(false)

  function openProductEdit(product) {
    closeProductDetail()
    router.push(`/products/${product.id}/edit`)
  }

  async function handleDeleteProduct(product) {
    if (!product?.id) {
      window.alert("삭제할 품목 정보를 찾을 수 없습니다.")
      return
    }

    const isConfirmed = window.confirm(
      `[${product.name}] 품목을 삭제하시겠습니까?\n삭제된 품목은 기본 목록에서 보이지 않습니다.`,
    )

    if (!isConfirmed) {
      return
    }

    setIsDeletingProduct(true)

    try {
      await deleteProduct(product.id)

      window.alert("품목이 삭제되었습니다.")

      closeProductDetail()

      if (typeof reloadProducts === "function") {
        reloadProducts()
      } else {
        searchProducts()
      }
    } catch (error) {
      console.error("품목 삭제 중 오류가 발생했습니다.", error)
      window.alert("품목 삭제에 실패했습니다. 다시 시도해 주세요.")
    } finally {
      setIsDeletingProduct(false)
    }
  }

  async function handleProductExcelDownload() {
    try {
      const { blob, fileName } = await downloadProductExcel(appliedFilters)

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")

      link.href = url
      link.download = fileName

      document.body.appendChild(link)
      link.click()
      link.remove()

      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("품목 엑셀 다운로드 중 오류가 발생했습니다.", error)
      window.alert(error.message || "품목 엑셀 파일을 다운로드하지 못했습니다.")
    }
  }

  return (
    <div className="w-full">
      <header className="bf-page-header">
        <div>
          <p className="bf-page-eyebrow">MASTER DATA</p>

          <h1 className="bf-page-title">품목 관리</h1>

          <p className="bf-page-description">
            물류 시스템에서 사용하는 품목 기준정보를 조회하고 관리합니다.
          </p>
        </div>
      </header>

      <ProductSearchForm
        filters={draftFilters}
        filterOptions={filterOptions}
        onChange={updateFilter}
        onSearch={searchProducts}
        onReset={resetFilters}
      />

      <section className="mt-3">
        <div className="bf-section-toolbar">
          <p className="text-[14px] font-semibold text-slate-700">
            조회 결과
            <span className="ml-1 text-blue-600">
              {pagination.totalElements}
            </span>
            <span className="ml-0.5 text-slate-400">건</span>
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleProductExcelDownload}
              className="bf-btn bf-btn-secondary"
            >
              <Download size={13} />
              엑셀 다운로드
            </button>

            <Link href="/products/new" className="bf-btn bf-btn-primary">
              <Plus size={14} />
              신규 품목 등록
            </Link>
          </div>
        </div>

        <div className="bf-panel">
          <ProductTable
            products={products}
            loading={loading}
            error={error}
            onDetail={openProductDetail}
            onEdit={openProductEdit}
          />

          <ProductPagination
            pagination={pagination}
            pageSize={pageSize}
            onChangePageSize={changePageSize}
            onMovePage={movePage}
          />
        </div>
      </section>

      <ProductDetailModal
        open={Boolean(detailProduct)}
        product={detailProduct}
        onClose={closeProductDetail}
        onEdit={openProductEdit}
        onDelete={handleDeleteProduct}
        isDeleting={isDeletingProduct}
      />
    </div>
  )
}

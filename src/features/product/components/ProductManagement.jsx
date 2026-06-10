"use client"

import Link from "next/link"
import { Download, Plus } from "lucide-react"
import ProductPagination from "@/features/product/components/ProductPagination"
import ProductSearchForm from "@/features/product/components/ProductSearchForm"
import ProductTable from "@/features/product/components/ProductTable"
import useProductManagement from "@/features/product/hooks/useProductManagement"
import { downloadProductCsv } from "@/features/product/utils/productManagementUtils"

export default function ProductManagement() {
  const {
    draftFilters,
    filterOptions,
    products,
    pagination,
    pageSize,
    selectedIds,
    allCurrentRowsSelected,
    loading,
    error,
    updateFilter,
    searchProducts,
    resetFilters,
    movePage,
    changePageSize,
    toggleAllRows,
    toggleRow,
  } = useProductManagement()

  function openProductDetail(product) {
    window.alert(`${product.name} 상세 화면은 추후 연결합니다.`)
  }

  function openProductEdit(product) {
    window.alert(`${product.name} 수정 화면은 추후 연결합니다.`)
  }

  return (
    <div className="w-full">
      <header className="mb-3">
        <h1 className="text-[22px] font-bold text-slate-900">품목 관리</h1>

        <p className="mt-1 text-[13px] text-slate-400">
          물류 시스템에서 사용하는 품목 기준정보를 조회하고 관리합니다.
        </p>
      </header>

      <ProductSearchForm
        filters={draftFilters}
        filterOptions={filterOptions}
        onChange={updateFilter}
        onSearch={searchProducts}
        onReset={resetFilters}
      />

      <section className="mt-3">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
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
              onClick={() => downloadProductCsv(products)}
              className="flex h-10 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-4 text-[13px] font-semibold text-slate-500 transition hover:bg-slate-50"
            >
              <Download size={13} />
              CSV 다운로드
            </button>

            <Link
              href="/products/new"
              className="flex h-10 items-center gap-1.5 rounded-md bg-blue-600 px-4 text-[13px] font-semibold text-white transition hover:bg-blue-700"
            >
              <Plus size={14} />
              신규 품목 등록
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <ProductTable
            products={products}
            loading={loading}
            error={error}
            selectedIds={selectedIds}
            allCurrentRowsSelected={allCurrentRowsSelected}
            onToggleAll={toggleAllRows}
            onToggleRow={toggleRow}
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
    </div>
  )
}

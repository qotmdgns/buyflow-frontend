"use client"

import SupplierDetailModal from "@/features/supplier/components/SupplierDetailModal"
import SupplierPagination from "@/features/supplier/components/SupplierPagination"
import SupplierSearchForm from "@/features/supplier/components/SupplierSearchForm"
import SupplierTable from "@/features/supplier/components/SupplierTable"
import useSupplierManagement from "@/features/supplier/hooks/useSupplierManagement"

export default function SupplierManagement() {
  const {
    draftFilters,
    filterOptions,
    suppliers,
    pagination,
    pageSize,
    loading,
    error,
    detailSupplier,
    updateFilter,
    searchSuppliers,
    resetFilters,
    movePage,
    changePageSize,
    openSupplierDetail,
    closeSupplierDetail,
  } = useSupplierManagement()

  function openSupplierEdit(supplier) {
    closeSupplierDetail()

    window.alert(`${supplier.name} 수정 화면은 추후 연결합니다.`)
  }

  return (
    <div className="w-full">
      <header className="mb-3">
        <h1 className="text-[22px] font-bold tracking-tight text-slate-900">
          공급업체 관리
        </h1>
      </header>

      <SupplierSearchForm
        filters={draftFilters}
        filterOptions={filterOptions}
        onChange={updateFilter}
        onSearch={searchSuppliers}
        onReset={resetFilters}
      />

      <section className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
          <h2 className="text-[15px] font-bold text-slate-800">
            공급업체 목록
          </h2>

          <span className="text-[13px] text-slate-500">
            총 {pagination.totalElements}건
          </span>
        </div>

        <SupplierTable
          suppliers={suppliers}
          loading={loading}
          error={error}
          onDetail={openSupplierDetail}
        />

        <SupplierPagination
          pagination={pagination}
          pageSize={pageSize}
          onChangePageSize={changePageSize}
          onMovePage={movePage}
        />
      </section>

      <SupplierDetailModal
        open={Boolean(detailSupplier)}
        supplier={detailSupplier}
        onClose={closeSupplierDetail}
        onEdit={openSupplierEdit}
      />
    </div>
  )
}

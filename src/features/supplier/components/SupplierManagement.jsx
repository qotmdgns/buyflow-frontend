"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { FileDown, Plus } from "lucide-react"
import SupplierDetailModal from "@/features/supplier/components/SupplierDetailModal"
import SupplierPagination from "@/features/supplier/components/SupplierPagination"
import SupplierSearchForm from "@/features/supplier/components/SupplierSearchForm"
import SupplierTable from "@/features/supplier/components/SupplierTable"
import useSupplierManagement from "@/features/supplier/hooks/useSupplierManagement"
import { downloadSupplierExcel } from "@/features/supplier/api/supplierApi"
import { hasPermission } from "@/utils/permissions"
import useClientReady from "@/utils/useClientReady"

export default function SupplierManagement() {
  const router = useRouter()
  const ready = useClientReady()

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

  const canManageSuppliers = ready && hasPermission("suppliers.write")

  const canReadSuppliers =
    ready &&
    (hasPermission("suppliers.read") || hasPermission("suppliers.write"))

  async function handleExcelDownload() {
    try {
      await downloadSupplierExcel()
    } catch (error) {
      window.alert(error.message || "공급업체 엑셀 다운로드에 실패했습니다.")
    }
  }

  function openSupplierEdit(supplier) {
    closeSupplierDetail()

    if (!supplier?.id) {
      window.alert("수정할 공급업체 ID를 찾을 수 없습니다.")
      return
    }

    router.push(`/suppliers/${supplier.id}/edit`)
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
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] font-bold text-slate-800">
              공급업체 목록
            </h2>

            <span className="text-[13px] text-slate-500">
              총 {pagination.totalElements}건
            </span>
          </div>

          <div className="flex items-center gap-2">
            {canReadSuppliers && (
              <button
                type="button"
                onClick={handleExcelDownload}
                className="flex h-9 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                <FileDown size={14} />
                엑셀 다운로드
              </button>
            )}

            {canManageSuppliers && (
              <Link
                href="/suppliers/new"
                className="flex h-9 items-center gap-1.5 rounded-md bg-blue-600 px-3 text-[13px] font-semibold text-white transition hover:bg-blue-700"
              >
                <Plus size={14} />
                신규 공급업체 등록
              </Link>
            )}
          </div>
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
        onEdit={canManageSuppliers ? openSupplierEdit : undefined}
      />
    </div>
  )
}
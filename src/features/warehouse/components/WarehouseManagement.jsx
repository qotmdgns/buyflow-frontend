"use client"

import { Download, Plus } from "lucide-react"
import WarehouseDetailModal from "@/features/warehouse/components/WarehouseDetailModal"
import WarehouseFormModal from "@/features/warehouse/components/WarehouseFormModal"
import WarehousePagination from "@/features/warehouse/components/WarehousePagination"
import WarehouseSearchForm from "@/features/warehouse/components/WarehouseSearchForm"
import WarehouseTable from "@/features/warehouse/components/WarehouseTable"
import useWarehouseManagement from "@/features/warehouse/hooks/useWarehouseManagement"
import { downloadWarehouseCsv } from "@/features/warehouse/utils/warehouseManagementUtils"

export default function WarehouseManagement() {
  const {
    draftFilters,
    filterOptions,
    warehouses,
    pagination,
    pageSize,
    loading,
    error,
    formMode,
    editingWarehouse,
    detailWarehouse,
    updateFilter,
    searchWarehouses,
    resetFilters,
    movePage,
    changePageSize,
    openWarehouseCreate,
    openWarehouseEdit,
    closeWarehouseForm,
    saveWarehouse,
    openWarehouseDetail,
    closeWarehouseDetail,
    removeWarehouse,
  } = useWarehouseManagement()

  return (
    <div className="w-full">
      <header className="mb-3">
        <h1 className="text-[22px] font-bold tracking-tight text-slate-900">
          창고 관리
        </h1>

        <p className="mt-1 text-[13px] text-slate-400">
          스마트 물류를 위한 창고 정보를 관리합니다.
        </p>
      </header>

      <WarehouseSearchForm
        filters={draftFilters}
        filterOptions={filterOptions}
        onChange={updateFilter}
        onSearch={searchWarehouses}
        onReset={resetFilters}
      />

      <section className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] font-bold text-slate-800">창고 목록</h2>

            <span className="text-[13px] text-slate-500">
              총 {pagination.totalElements}건
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => downloadWarehouseCsv(warehouses)}
              className="flex h-9 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <Download size={14} />
              엑셀 내보내기
            </button>

            <button
              type="button"
              onClick={openWarehouseCreate}
              className="flex h-9 items-center gap-1.5 rounded-md bg-blue-600 px-3 text-[13px] font-semibold text-white transition hover:bg-blue-700"
            >
              <Plus size={14} />
              신규 창고 등록
            </button>
          </div>
        </div>

        <WarehouseTable
          warehouses={warehouses}
          loading={loading}
          error={error}
          onDetail={openWarehouseDetail}
          onEdit={openWarehouseEdit}
        />

        <WarehousePagination
          pagination={pagination}
          pageSize={pageSize}
          onChangePageSize={changePageSize}
          onMovePage={movePage}
        />
      </section>

      {formMode && (
        <WarehouseFormModal
          key={`${formMode}-${editingWarehouse?.id ?? "new"}`}
          mode={formMode}
          initialValue={editingWarehouse}
          onClose={closeWarehouseForm}
          onSubmit={saveWarehouse}
        />
      )}

      <WarehouseDetailModal
        open={Boolean(detailWarehouse)}
        warehouse={detailWarehouse}
        onClose={closeWarehouseDetail}
        onEdit={openWarehouseEdit}
        onDelete={removeWarehouse}
      />
    </div>
  )
}

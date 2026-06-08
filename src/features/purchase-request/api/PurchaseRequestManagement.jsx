"use client"

import Link from "next/link"
import { Download, Plus } from "lucide-react"
import PurchaseRequestPagination from "@/features/purchase-request/components/PurchaseRequestPagination"
import PurchaseRequestSearchForm from "@/features/purchase-request/components/PurchaseRequestSearchForm"
import PurchaseRequestSummaryCards from "@/features/purchase-request/components/PurchaseRequestSummaryCards"
import PurchaseRequestTable from "@/features/purchase-request/components/PurchaseRequestTable"
import usePurchaseRequestManagement from "@/features/purchase-request/hooks/usePurchaseRequestManagement"
import { downloadPurchaseRequestCsv } from "@/features/purchase-request/utils/purchaseRequestManagementUtils"

export default function PurchaseRequestManagement() {
  const {
    draftFilters,
    appliedFilters,
    filterOptions,
    summary,
    requests,
    pagination,
    pageSize,
    selectedIds,
    allCurrentRowsSelected,
    loading,
    error,
    updateFilter,
    searchRequests,
    resetFilters,
    selectSummaryStatus,
    movePage,
    changePageSize,
    exportRequests,
    toggleAllRows,
    toggleRow,
  } = usePurchaseRequestManagement()

  async function handleDownload() {
    try {
      const allFilteredRequests = await exportRequests()
      downloadPurchaseRequestCsv(allFilteredRequests)
    } catch (error) {
      console.error("구매 요청 목록 다운로드 중 오류가 발생했습니다.", error)
      window.alert("구매 요청 목록을 다운로드하지 못했습니다.")
    }
  }

  return (
    <div className="mx-auto max-w-[1500px]">
      <header className="mb-5">
        <h1 className="text-[18px] font-bold text-slate-900">구매 요청 목록</h1>

        <p className="mt-1 text-[11px] text-slate-400">
          등록된 구매 요청을 조회하고 진행 상태를 확인할 수 있습니다.
        </p>
      </header>

      <PurchaseRequestSearchForm
        filters={draftFilters}
        filterOptions={filterOptions}
        onChange={updateFilter}
        onSearch={searchRequests}
        onReset={resetFilters}
      />

      <PurchaseRequestSummaryCards
        summary={summary}
        activeStatus={appliedFilters.status}
        onSelect={selectSummaryStatus}
      />

      <section className="mt-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[12px] font-semibold text-slate-700">
            검색 결과
            <span className="ml-1 text-slate-400">
              (총 {pagination.totalElements}건)
            </span>
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="flex h-9 items-center gap-1 rounded-md border border-slate-200 bg-white px-3 text-[11px] font-semibold text-slate-500 transition hover:bg-slate-50"
            >
              <Download size={13} />
              엑셀 다운로드
            </button>

            <Link
              href="/purchase-requests/new"
              className="flex h-9 items-center gap-1 rounded-md bg-blue-600 px-3 text-[11px] font-semibold text-white transition hover:bg-blue-700"
            >
              <Plus size={14} />
              신규 구매 요청
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <PurchaseRequestTable
            requests={requests}
            loading={loading}
            error={error}
            selectedIds={selectedIds}
            allCurrentRowsSelected={allCurrentRowsSelected}
            onToggleAll={toggleAllRows}
            onToggleRow={toggleRow}
          />

          <PurchaseRequestPagination
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

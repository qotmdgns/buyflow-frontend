"use client"

import Link from "next/link"
import { Download, Plus } from "lucide-react"
import PurchaseRequestPagination from "@/features/purchase-request/components/PurchaseRequestPagination"
import PurchaseRequestSearchForm from "@/features/purchase-request/components/PurchaseRequestSearchForm"
import PurchaseRequestSummaryCards from "@/features/purchase-request/components/PurchaseRequestSummaryCards"
import PurchaseRequestTable from "@/features/purchase-request/components/PurchaseRequestTable"
import usePurchaseRequestManagement from "@/features/purchase-request/hooks/usePurchaseRequestManagement"
import { downloadPurchaseRequestExcel } from "@/features/purchase-request/api/purchaseRequestApi"
import { hasPermission } from "@/utils/permissions"

export default function PurchaseRequestManagement() {
  const {
    draftFilters,
    appliedFilters,
    filterOptions,
    summary,
    requests,
    pagination,
    loading,
    error,
    updateFilter,
    searchRequests,
    resetFilters,
    selectSummaryFilter,
    movePage,
    exportRequests,
    deleteRequest,
  } = usePurchaseRequestManagement()

  async function handleDownload() {
    try {
      const { blob, fileName } = await downloadPurchaseRequestExcel()

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")

      link.href = url
      link.download = fileName

      document.body.appendChild(link)
      link.click()
      link.remove()

      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("엑셀 다운로드 중 오류가 발생했습니다.", error)
      window.alert(error.message || "엑셀 파일을 다운로드하지 못했습니다.")
    }
  }

  async function handleDeleteRequest(request) {
    const confirmed = window.confirm(
      `${request.requestNumber} 구매 요청을 삭제하시겠습니까?
삭제 후 목록에서 숨김 처리됩니다.`,
    )

    if (!confirmed) {
      return
    }

    try {
      await deleteRequest(request.id)
      window.alert("구매 요청을 삭제했습니다.")
    } catch (error) {
      console.error("구매 요청 삭제 중 오류가 발생했습니다.", error)
      window.alert(error.message || "구매 요청 삭제에 실패했습니다.")
    }
  }

  return (
    <div className="w-full">
      <header className="bf-page-header">
        <div>
          <p className="bf-page-eyebrow">PURCHASE REQUEST</p>

          <h1 className="bf-page-title">구매요청 관리</h1>

          <p className="bf-page-description">
            구매요청 내역을 조회하고 진행 상태를 관리합니다.
          </p>
        </div>
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
        activeFilters={appliedFilters}
        onSelect={selectSummaryFilter}
      />

      <section className="mt-3">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[14px] font-semibold text-slate-700">
            검색 결과
            <span className="ml-1 text-slate-400">
              (총 {pagination.totalElements}건)
            </span>
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="flex h-10 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-[13px] font-semibold text-slate-500 transition hover:bg-slate-50"
            >
              <Download size={13} />
              엑셀 다운로드
            </button>

            {hasPermission("purchase-requests.write") && (
              <Link
                href="/purchase-requests/new"
                className="flex h-10 items-center gap-1.5 rounded-md bg-blue-600 px-3 text-[13px] font-semibold text-white transition hover:bg-blue-700"
              >
                <Plus size={14} />
                신규 구매 요청
              </Link>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <PurchaseRequestTable
            requests={requests}
            loading={loading}
            error={error}
            onDeleteRequest={handleDeleteRequest}
          />

          <PurchaseRequestPagination
            pagination={pagination}
            onMovePage={movePage}
          />
        </div>
      </section>
    </div>
  )
}

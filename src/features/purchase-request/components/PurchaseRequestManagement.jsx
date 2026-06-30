"use client"

import Link from "next/link"
import { Download, Plus } from "lucide-react"
import PurchaseRequestPagination from "@/features/purchase-request/components/PurchaseRequestPagination"
import PurchaseRequestSearchForm from "@/features/purchase-request/components/PurchaseRequestSearchForm"
import PurchaseRequestSummaryCards from "@/features/purchase-request/components/PurchaseRequestSummaryCards"
import PurchaseRequestTable from "@/features/purchase-request/components/PurchaseRequestTable"
import usePurchaseRequestManagement from "@/features/purchase-request/hooks/usePurchaseRequestManagement"
import { downloadPurchaseRequestCsv } from "@/features/purchase-request/utils/purchaseRequestManagementUtils"
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
    selectSummaryStatus,
    movePage,
    exportRequests,
    deleteRequest,
  } = usePurchaseRequestManagement()

  async function handleDownload() {
    try {
      const excelApiUrl = "http://localhost:8080/api/purchase-requests/excel"

      const response = await fetch(excelApiUrl, {
        method: "GET",
      })

      if (!response.ok) {
        throw new Error("엑셀 파일을 생성하지 못했습니다.")
      }

      // 1. 서버에서 넘어온 바이너리 데이터(Excel)를 Blob 객체로 변환
      const blob = await response.blob()

      // 2. 브라우저 메모리에 가상의 다운로드 URL 생성
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")

      link.href = url
      // 3. 다운로드될 파일명 강제 지정 (서버 헤더를 읽어와도 되지만 프론트에서 고정하는 것이 편합니다)
      link.download = `구매요청목록_${new Date().toISOString().slice(0, 10).replace(/-/g, "")}.xlsx`

      // 4. 링크를 클릭한 것처럼 이벤트를 발생시켜 다운로드 실행
      document.body.appendChild(link)
      link.click()
      link.remove()

      // 5. 메모리 누수 방지를 위해 가상 URL 해제
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("엑셀 다운로드 중 오류가 발생했습니다.", error)
      window.alert("엑셀 파일을 다운로드하지 못했습니다.")
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
        activeStatus={appliedFilters.status}
        onSelect={selectSummaryStatus}
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

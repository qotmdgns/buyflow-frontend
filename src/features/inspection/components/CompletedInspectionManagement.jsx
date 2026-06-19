"use client"

import Link from "next/link"
import { ClipboardList } from "lucide-react"

import CompletedInspectionSummaryCards from "@/features/inspection/components/CompletedInspectionSummaryCards"
import CompletedInspectionTable from "@/features/inspection/components/CompletedInspectionTable"
import InspectionPagination from "@/features/inspection/components/InspectionPagination"
import InspectionSearchForm from "@/features/inspection/components/InspectionSearchForm"

import useCompletedInspectionManagement from "@/features/inspection/hooks/useCompletedInspectionManagement"

export default function CompletedInspectionManagement() {
  const {
    draftFilters,
    resultFilter,
    filterOptions,
    summary,
    inspections,
    pagination,
    loading,
    error,
    updateFilter,
    searchInspections,
    resetFilters,
    changeResultFilter,
    movePage,
    changePageSize,
  } = useCompletedInspectionManagement()

  return (
    <div className="w-full">
      <header className="mb-3">
        <h1 className="text-[22px] font-bold text-slate-900">검수 완료 목록</h1>

        <p className="mt-1 text-[13px] text-slate-400">
          검수 결과가 저장된 입고 건을 조회하고 합격 수량, 불량 수량, 처리
          결과를 확인합니다.
        </p>
      </header>

      <InspectionSearchForm
        filters={draftFilters}
        filterOptions={filterOptions}
        onChange={updateFilter}
        onSearch={searchInspections}
        onReset={resetFilters}
        inspectionNumberLabel="검수 번호"
      />

      <CompletedInspectionSummaryCards
        summary={summary}
        activeFilter={resultFilter}
        onChangeFilter={changeResultFilter}
      />

      <section className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="text-[15px] font-bold text-slate-800">
            검수 완료 목록
          </h2>

          <p className="mt-0.5 text-[13px] text-slate-400">
            총 {pagination.totalElements.toLocaleString("ko-KR")}건
          </p>
        </div>

        <CompletedInspectionTable
          inspections={inspections}
          loading={loading}
          error={error}
        />

        <InspectionPagination
          pagination={pagination}
          onChangePageSize={changePageSize}
          onMovePage={movePage}
        />
      </section>
    </div>
  )
}

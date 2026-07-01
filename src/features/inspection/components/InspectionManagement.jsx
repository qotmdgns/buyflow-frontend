"use client"

import Link from "next/link"
import { CheckCircle2 } from "lucide-react"

import InspectionPagination from "@/features/inspection/components/InspectionPagination"
import InspectionSearchForm from "@/features/inspection/components/InspectionSearchForm"
import InspectionSummaryCards from "@/features/inspection/components/InspectionSummaryCards"
import InspectionTable from "@/features/inspection/components/InspectionTable"

import useInspectionManagement from "@/features/inspection/hooks/useInspectionManagement"

export default function InspectionManagement() {
  const {
    draftFilters,
    summaryFilter,
    filterOptions,
    summary,
    inspections,
    pagination,
    loading,
    error,
    updateFilter,
    searchInspections,
    resetFilters,
    changeSummaryFilter,
    movePage,
    changePageSize,
  } = useInspectionManagement()

  return (
    <div className="w-full">
      <header className="bf-page-header">
        <div>
          <p className="bf-page-eyebrow">INSPECTION</p>

          <h1 className="bf-page-title">검수 관리</h1>

          <p className="bf-page-description">
            입고 품목의 검수 결과와 처리 상태를 조회하고 관리합니다.
          </p>
        </div>
      </header>
      <InspectionSearchForm
        filters={draftFilters}
        filterOptions={filterOptions}
        onChange={updateFilter}
        onSearch={searchInspections}
        onReset={resetFilters}
      />

      <InspectionSummaryCards
        summary={summary}
        activeFilter={summaryFilter}
        onChangeFilter={changeSummaryFilter}
      />

      <section className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-[15px] font-bold text-slate-800">
              검수 대기 목록
            </h2>

            <p className="mt-0.5 text-[13px] text-slate-400">
              총 {pagination.totalElements.toLocaleString("ko-KR")}건
            </p>
          </div>

          <Link
            href="/inspections/completed"
            className="inline-flex h-9 w-fit items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-[13px] font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-blue-600"
          >
            <CheckCircle2 size={15} />
            검수 완료 목록
          </Link>
        </div>

        <InspectionTable
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

"use client"

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
      <header className="mb-3">
        <h1 className="text-[22px] font-bold text-slate-900">검수 대기 목록</h1>

        <p className="mt-1 text-[13px] text-slate-400">
          입고 처리된 품목 중 검수가 완료되지 않은 건을 조회하고 검수 등록을
          시작합니다.
        </p>
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
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="text-[15px] font-bold text-slate-800">
            검수 대기 목록
          </h2>

          <p className="mt-0.5 text-[13px] text-slate-400">
            총 {pagination.totalElements.toLocaleString("ko-KR")}건
          </p>
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

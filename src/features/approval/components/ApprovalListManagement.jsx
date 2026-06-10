"use client"

import Link from "next/link"
import { ChevronLeft, ChevronRight, RotateCcw, Search } from "lucide-react"

import useApprovalListManagement from "@/features/approval/hooks/useApprovalListManagement"

import {
  formatWon,
  getRequestStatusStyle,
} from "@/features/approval/utils/approvalUtils"

function SearchInput({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12px] font-semibold text-slate-500">
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-[13px] text-slate-600 outline-none placeholder:text-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  )
}

function StatusBadge({ status, label }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[12px] font-semibold ${getRequestStatusStyle(
        status,
      )}`}
    >
      {label}
    </span>
  )
}

function TableMessage({ children, isError = false }) {
  return (
    <tr>
      <td
        colSpan={12}
        className={`h-48 text-center text-[14px] ${
          isError ? "text-rose-500" : "text-slate-400"
        }`}
      >
        {children}
      </td>
    </tr>
  )
}

export default function ApprovalListManagement() {
  const {
    draftFilters,
    approvals,
    pagination,
    pageSize,
    loading,
    error,
    updateFilter,
    searchApprovals,
    resetFilters,
    movePage,
    changePageSize,
  } = useApprovalListManagement()

  return (
    <div className="w-full">
      <header className="mb-3">
        <h1 className="text-[22px] font-bold text-slate-900">승인 관리 목록</h1>

        <p className="mt-1 text-[13px] text-slate-400">
          결재가 필요한 구매 요청과 승인 처리 결과를 조회할 수 있습니다.
        </p>
      </header>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <SearchInput
            label="요청 번호"
            name="requestNumber"
            value={draftFilters.requestNumber}
            onChange={updateFilter}
            placeholder="예: PR-2026-0001"
          />

          <SearchInput
            label="요청 제목"
            name="title"
            value={draftFilters.title}
            onChange={updateFilter}
            placeholder="요청 제목 입력"
          />

          <SearchInput
            label="요청자"
            name="requester"
            value={draftFilters.requester}
            onChange={updateFilter}
            placeholder="요청자 이름 입력"
          />

          <SearchInput
            label="요청 부서"
            name="department"
            value={draftFilters.department}
            onChange={updateFilter}
            placeholder="부서명 입력"
          />

          <label className="block">
            <span className="mb-1 block text-[12px] font-semibold text-slate-500">
              승인 상태
            </span>

            <select
              value={draftFilters.status}
              onChange={(event) => updateFilter("status", event.target.value)}
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-[13px] text-slate-600 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              <option value="전체">전체</option>
              <option value="PENDING_APPROVAL">승인 대기</option>
              <option value="APPROVED">승인 완료</option>
              <option value="REJECTED">반려</option>
              <option value="CANCEL_REQUESTED">요청 취소</option>
            </select>
          </label>

          <SearchInput
            label="요청일 시작"
            name="requestedFrom"
            value={draftFilters.requestedFrom}
            onChange={updateFilter}
            type="date"
          />

          <SearchInput
            label="요청일 종료"
            name="requestedTo"
            value={draftFilters.requestedTo}
            onChange={updateFilter}
            type="date"
          />
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={resetFilters}
            className="flex h-10 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-[13px] font-semibold text-slate-500 transition hover:bg-slate-50"
          >
            <RotateCcw size={14} />
            초기화
          </button>

          <button
            type="button"
            onClick={searchApprovals}
            className="flex h-10 items-center gap-1.5 rounded-md bg-blue-600 px-4 text-[13px] font-semibold text-white transition hover:bg-blue-700"
          >
            <Search size={14} />
            검색
          </button>
        </div>
      </section>

      <section className="mt-3">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-[14px] font-semibold text-slate-700">
            검색 결과
            <span className="ml-1 text-slate-400">
              (총 {pagination.totalElements}건)
            </span>
          </p>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1380px] text-left text-[13px]">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  {[
                    "요청 번호",
                    "요청 제목",
                    "요청자",
                    "요청 부서",
                    "요청일",
                    "희망 입고일",
                    "총 요청 금액",
                    "우선순위",
                    "승인 단계",
                    "승인 담당자",
                    "상태",
                    "관리",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="whitespace-nowrap px-3 py-2.5 font-medium"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <TableMessage>
                    승인 관리 목록을 불러오는 중입니다.
                  </TableMessage>
                )}

                {!loading && error && (
                  <TableMessage isError>{error}</TableMessage>
                )}

                {!loading && !error && approvals.length === 0 && (
                  <TableMessage>
                    검색 조건에 해당하는 승인 요청이 없습니다.
                  </TableMessage>
                )}

                {!loading &&
                  !error &&
                  approvals.map((approval) => (
                    <tr
                      key={approval.approvalId}
                      className="border-t border-slate-100 text-slate-600 hover:bg-slate-50/60"
                    >
                      <td className="whitespace-nowrap px-3 py-3 font-semibold text-blue-600">
                        <Link
                          href={`/approvals/${approval.approvalId}`}
                          className="hover:underline"
                        >
                          {approval.requestNumber}
                        </Link>
                      </td>

                      <td className="min-w-[220px] px-3 py-3 font-medium text-slate-700">
                        {approval.title}
                      </td>

                      <td className="whitespace-nowrap px-3 py-3">
                        {approval.requester}
                      </td>

                      <td className="whitespace-nowrap px-3 py-3">
                        {approval.department}
                      </td>

                      <td className="whitespace-nowrap px-3 py-3">
                        {approval.requestedAt}
                      </td>

                      <td className="whitespace-nowrap px-3 py-3">
                        {approval.desiredInboundAt}
                      </td>

                      <td className="whitespace-nowrap px-3 py-3 text-right font-semibold text-slate-700">
                        {formatWon(approval.totalAmount)}
                      </td>

                      <td className="whitespace-nowrap px-3 py-3">
                        {approval.priority}
                      </td>

                      <td className="whitespace-nowrap px-3 py-3">
                        {approval.approvalStep}
                      </td>

                      <td className="whitespace-nowrap px-3 py-3">
                        {approval.approver}
                      </td>

                      <td className="whitespace-nowrap px-3 py-3">
                        <StatusBadge
                          status={approval.requestStatus}
                          label={approval.requestStatusLabel}
                        />
                      </td>

                      <td className="whitespace-nowrap px-3 py-3">
                        <Link
                          href={`/approvals/${approval.approvalId}`}
                          className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[12px] font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-blue-600"
                        >
                          상세보기
                        </Link>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-[13px] text-slate-400">
            <select
              value={pageSize}
              onChange={(event) => changePageSize(Number(event.target.value))}
              className="h-8 rounded-md border border-slate-200 bg-white px-2 text-[13px] text-slate-500 outline-none"
            >
              {[10, 15, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size}개씩 보기
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => movePage(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-400 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="이전 페이지"
              >
                <ChevronLeft size={15} />
              </button>

              <span className="min-w-16 text-center text-slate-500">
                {pagination.page} / {pagination.totalPages}
              </span>

              <button
                type="button"
                onClick={() => movePage(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-400 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="다음 페이지"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

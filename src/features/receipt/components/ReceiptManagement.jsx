"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo } from "react"

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CheckCircle2,
  CircleAlert,
  Download,
  Package,
  Plus,
  Printer,
  RefreshCcw,
  Search,
  Truck,
} from "lucide-react"

import useReceiptManagement from "@/features/receipt/hooks/useReceiptManagement"
import { downloadFileWithAuth } from "@/lib/api/downloadClient"
import { useAuth } from "@/features/auth/context/AuthContext"

import {
  createPageNumbers,
  formatNumber,
  getReceiptStatusMeta,
  RECEIPT_TABS,
} from "@/features/receipt/utils/ReceiptUtils"

const INPUT_CLASS_NAME =
  "h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-[13px] text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"

function MetricCard({
  title,
  value,
  helper,
  icon: Icon,
  tone,
  active,
  onClick,
}) {
  const toneStyles = {
    slate: {
      card: "border-l-slate-700",
      icon: "bg-slate-100 text-slate-600",
      active: "bg-slate-50 ring-2 ring-slate-300",
    },
    rose: {
      card: "border-l-rose-500",
      icon: "bg-rose-50 text-rose-500",
      active: "bg-rose-50/60 ring-2 ring-rose-200",
    },
    amber: {
      card: "border-l-amber-500",
      icon: "bg-amber-50 text-amber-500",
      active: "bg-amber-50/60 ring-2 ring-amber-200",
    },
    emerald: {
      card: "border-l-emerald-500",
      icon: "bg-emerald-50 text-emerald-500",
      active: "bg-emerald-50/60 ring-2 ring-emerald-200",
    },
  }

  const style = toneStyles[tone]

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`cursor-pointer flex min-h-[92px] items-center justify-between rounded-lg border border-slate-200 border-l-4 bg-white px-4 py-3 shadow-sm transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-md 
        ${style.card}
        ${active ? style.active : ""}
      `}
    >
      <div>
        <p className="text-[13px] font-semibold text-slate-500">{title}</p>

        <p className="mt-1 text-[24px] font-bold leading-none text-slate-900">
          {String(value).padStart(2, "0")}

          <span className="ml-1 text-[13px] font-semibold text-slate-500">
            건
          </span>
        </p>
        <p className="mt-2 text-[12px] text-slate-400">{helper}</p>
      </div>

      <span
        className={`flex h-9 w-9 items-center justify-center rounded-full transition-transform durtion-200 ease-out group-hover:scale-110 group-hover:-rotate-3 ${style.icon}`}
      >
        <Icon size={17} />
      </span>
    </button>
  )
}

function StatusBadge({ status }) {
  const meta = getReceiptStatusMeta(status)

  return (
    <span
      className={`inline-flex rounded-full border px-2 py-1 text-[12px] font-semibold ${meta.badgeClassName}`}
    >
      {meta.label}
    </span>
  )
}

function TableMessage({ children, isError = false }) {
  return (
    <tr>
      <td
        colSpan={12}
        className={`h-48 text-center text-[13px] ${
          isError ? "text-rose-500" : "text-slate-400"
        }`}
      >
        {children}
      </td>
    </tr>
  )
}

function PageIconButton({ children, label, disabled, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-400 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  )
}

export default function ReceiptManagement() {
  const router = useRouter()
  const { user, isAuthReady } = useAuth()
  const canWriteReceipts =
    isAuthReady &&
    (user?.roles?.includes("ADMIN") ||
      user?.permissions?.includes("receipts.write"))

  const {
    draftFilters,
    activeTab,
    cardFilter,
    filterOptions,
    summary,
    receipts,
    pagination,
    selectedIds,
    allCurrentRowsSelected,
    loading,
    error,
    updateFilter,
    searchReceipts,
    resetFilters,
    selectTab,
    selectCard,
    movePage,
    changePageSize,
    toggleAllRows,
    toggleRow,
  } = useReceiptManagement()

  const pageNumbers = useMemo(
    () => createPageNumbers(pagination.page, pagination.totalPages),
    [pagination.page, pagination.totalPages],
  )

  const firstRow = pagination.totalElements
    ? (pagination.page - 1) * pagination.size + 1
    : 0

  const lastRow = Math.min(
    pagination.page * pagination.size,
    pagination.totalElements,
  )

  async function handleDownload() {
    try {
      await downloadFileWithAuth("/api/receipts/excel", "receipts.xlsx")
    } catch (error) {
      console.error("receipt excel download failed", error)
      window.alert("엑셀 파일을 다운로드하지 못했습니다.")
    }
  }

  function handlePrintReport() {
    window.print()
  }

  return (
    <div className="w-full">
      <header className="bf-page-header">
        <div>
          <p className="bf-page-eyebrow">RECEIPT </p>
          <h1 className="bf-page-title">입고 관리</h1>
          <p className="bf-page-description">
            발주별 입고 예정, 부분 입고, 완료 현황을 조회하고 관리합니다.
          </p>
        </div>

        {canWriteReceipts && (
        <div className="flex items-center gap-2">
          <Link
            href="/receipts/new"
            className="flex h-10 items-center gap-1.5 rounded-md bg-blue-600 px-3 text-[13px] font-semibold text-white transition hover:bg-blue-700"
          >
            <Plus size={14} />
            신규 입고 등록
          </Link>
        </div>
        )}
      </header>

      <form
        onSubmit={searchReceipts}
        className="mt-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <label>
            <span className="mb-1 block text-[13px] font-semibold text-slate-600">
              발주 번호
            </span>

            <input
              value={draftFilters.orderNumber}
              onChange={(event) =>
                updateFilter("orderNumber", event.target.value)
              }
              placeholder="PO-YYYY-XXXX"
              className={INPUT_CLASS_NAME}
            />
          </label>

          <label>
            <span className="mb-1 block text-[13px] font-semibold text-slate-600">
              공급업체
            </span>

            <input
              value={draftFilters.supplierKeyword}
              onChange={(event) =>
                updateFilter("supplierKeyword", event.target.value)
              }
              placeholder="공급업체명 검색"
              className={INPUT_CLASS_NAME}
            />
          </label>

          <label>
            <span className="mb-1 block text-[13px] font-semibold text-slate-600">
              품목 코드 또는 품목명
            </span>

            <input
              value={draftFilters.itemKeyword}
              onChange={(event) =>
                updateFilter("itemKeyword", event.target.value)
              }
              placeholder="SKU-XXXXX 또는 품목명"
              className={INPUT_CLASS_NAME}
            />
          </label>

          <label>
            <span className="mb-1 block text-[13px] font-semibold text-slate-600">
              입고 창고
            </span>

            <select
              value={draftFilters.warehouseName}
              onChange={(event) =>
                updateFilter("warehouseName", event.target.value)
              }
              className={INPUT_CLASS_NAME}
            >
              {filterOptions.warehouses.map((warehouse) => (
                <option key={warehouse} value={warehouse}>
                  {warehouse}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-1 block text-[13px] font-semibold text-slate-600">
              입고 예정일
            </span>

            <div className="grid grid-cols-[minmax(0,1fr)_12px_minmax(0,1fr)] items-center gap-1">
              <input
                type="date"
                value={draftFilters.expectedFrom}
                onChange={(event) =>
                  updateFilter("expectedFrom", event.target.value)
                }
                className={`${INPUT_CLASS_NAME} px-2`}
              />

              <span className="text-center text-[13px] text-slate-300">-</span>

              <input
                type="date"
                value={draftFilters.expectedTo}
                onChange={(event) =>
                  updateFilter("expectedTo", event.target.value)
                }
                className={`${INPUT_CLASS_NAME} px-2`}
              />
            </div>
          </label>

          <label>
            <span className="mb-1 block text-[13px] font-semibold text-slate-600">
              입고 상태
            </span>

            <select
              value={draftFilters.status}
              onChange={(event) => updateFilter("status", event.target.value)}
              className={INPUT_CLASS_NAME}
            >
              {filterOptions.statuses.map((status) => (
                <option key={status} value={status}>
                  {status === "전체 상태"
                    ? status
                    : getReceiptStatusMeta(status).label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-3 flex justify-end gap-2 border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={resetFilters}
            className="flex h-10 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-4 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <RefreshCcw size={14} />
            초기화
          </button>

          <button
            type="submit"
            className="flex h-10 items-center gap-1.5 rounded-md bg-blue-600 px-4 text-[13px] font-semibold text-white transition hover:bg-blue-700"
          >
            <Search size={14} />
            검색
          </button>
        </div>
      </form>

      <section className="grid gap-3 md:grid-cols-5">
        <MetricCard
          title="전체"
          value={
            (summary.tabCounts?.expected ?? 0) +
            (summary.delayed ?? 0) +
            (summary.tabCounts?.partial ?? 0) +
            (summary.tabCounts?.completed ?? 0)
          }
          helper="전체 입고 목록"
          icon={Package}
          tone="slate"
          active={cardFilter === "ALL"}
          onClick={() => selectCard("ALL")}
        />

        <MetricCard
          title="입고 예정"
          value={summary.tabCounts?.expected ?? 0}
          helper={"입고 대기"}
          icon={Truck}
          tone="slate"
          active={cardFilter === "EXPECTED"}
          onClick={() => selectCard("EXPECTED")}
        />

        <MetricCard
          title="납기 지연"
          value={summary.delayed}
          helper="즉시 확인 필요"
          icon={CircleAlert}
          tone="rose"
          active={cardFilter === "DELAYED"}
          onClick={() => selectCard("DELAYED")}
        />

        <MetricCard
          title="부분 입고"
          value={summary.partial}
          helper={`진행률 ${summary.progressRate}%`}
          icon={Package}
          tone="amber"
          active={cardFilter === "PARTIAL"}
          onClick={() => selectCard("PARTIAL")}
        />

        <MetricCard
          title="입고 완료"
          value={summary.tabCounts?.completed ?? 0}
          helper="입고 완료"
          icon={CheckCircle2}
          tone="emerald"
          active={cardFilter === "COMPLETED"}
          onClick={() => selectCard("COMPLETED")}
        />
      </section>

      <div className="hidden">
        {RECEIPT_TABS.map((tab) => {
          const isActive = activeTab === tab.key

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => selectTab(tab.key)}
              className={`border-b-2 px-1 pb-2 text-[13px] font-semibold transition ${
                isActive
                  ? "border-slate-800 text-slate-800"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              {tab.label} (
              {summary.tabCounts?.[tab.key] ??
                summary.tabCounts?.[tab.key.toLowerCase()] ??
                0}
              )
            </button>
          )
        })}
      </div>

      <section className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] font-bold text-slate-800">입고 목록</h2>

            <p className="text-[13px] text-slate-400">
              총 {pagination.totalElements}건의 데이터가 검색되었습니다.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="flex h-9 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <Download size={13} />
              엑셀 다운로드
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1380px] text-left text-[13px]">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                {[
                  "발주 번호",
                  "공급업체",
                  "발주일",
                  "입고 예정일",
                  "입고 창고",
                  "품목 수",
                  "발주 수량",
                  "누적 입고",
                  "미입고",
                  "상태",
                  "관리",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="whitespace-nowrap px-3 py-3 font-semibold"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading && (
                <TableMessage>입고 목록을 불러오는 중입니다.</TableMessage>
              )}

              {!loading && error && (
                <TableMessage isError>{error}</TableMessage>
              )}

              {!loading && !error && receipts.length === 0 && (
                <TableMessage>
                  검색 조건에 해당하는 입고 내역이 없습니다.
                </TableMessage>
              )}

              {!loading &&
                !error &&
                receipts.map((receipt) => (
                  <tr
  key={receipt.id}
  className={`border-t border-slate-100 text-slate-600 ${
    receipt.status === "DELAYED" ? "bg-rose-50/60" : ""
  }`}
>                    

                    <td className="whitespace-nowrap px-3 py-3 font-semibold">
                      {receipt.orderNumber}
                    </td>

                    <td className="whitespace-nowrap px-3 py-3">
                      {receipt.supplierName}
                    </td>

                    <td className="whitespace-nowrap px-3 py-3">
                      {receipt.orderedAt}
                    </td>

                    <td
                      className={`whitespace-nowrap px-3 py-3 ${
                        receipt.status === "DELAYED"
                          ? "font-semibold text-rose-500"
                          : ""
                      }`}
                    >
                      {receipt.expectedReceiptAt}
                    </td>

                    <td className="whitespace-nowrap px-3 py-3">
                      {receipt.warehouseName}
                    </td>

                    <td className="whitespace-nowrap px-3 py-3 text-right">
                      {formatNumber(receipt.itemCount)}
                    </td>

                    <td className="whitespace-nowrap px-3 py-3 text-right">
                      {formatNumber(receipt.orderQuantity)}
                    </td>

                    <td className="whitespace-nowrap px-3 py-3 text-right">
                      {formatNumber(receipt.receivedQuantity)}
                    </td>

                    <td
                      className={`whitespace-nowrap px-3 py-3 text-right font-semibold ${
                        receipt.remainingQuantity > 0
                          ? "text-amber-600"
                          : "text-slate-400"
                      }`}
                    >
                      {formatNumber(receipt.remainingQuantity)}
                    </td>

                    <td className="whitespace-nowrap px-3 py-3">
                      <StatusBadge status={receipt.status} />
                    </td>

                    <td className="whitespace-nowrap px-3 py-3 text-center">
                      <Link
                        href={
                          receipt.receiptId > 0
                            ? `/receipts/${receipt.receiptId}`
                            : `/receipts/order/${receipt.orderId}`
                        }
                        aria-label={`${receipt.orderNumber} 입고 상세 보기`}
                        className="inline-flex items-center justify-center rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-[13px] font-semibold text-blue-600 transition hover:bg-blue-100"
                      >
                        입고 상세
                      </Link>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="flex w-full flex-wrap items-center justify-end gap-3 border-t border-slate-100 px-4 py-3 text-[13px] text-slate-400">
          <div className="flex items-center gap-1">
            <PageIconButton
              label="첫 페이지"
              disabled={pagination.page === 1}
              onClick={() => movePage(1)}
            >
              <ChevronsLeft size={15} />
            </PageIconButton>

            <PageIconButton
              label="이전 페이지"
              disabled={pagination.page === 1}
              onClick={() => movePage(pagination.page - 1)}
            >
              <ChevronLeft size={15} />
            </PageIconButton>

            {pageNumbers.map((pageNumber) => {
              if (typeof pageNumber !== "number") {
                return (
                  <span key={pageNumber} className="px-1 text-slate-400">
                    ···
                  </span>
                )
              }

              return (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => movePage(pageNumber)}
                  className={`flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-[13px] font-semibold ${
                    pagination.page === pageNumber
                      ? "bg-blue-600 text-white"
                      : "border border-transparent bg-white text-slate-500 hover:border-slate-200"
                  }`}
                >
                  {pageNumber}
                </button>
              )
            })}

            <PageIconButton
              label="다음 페이지"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => movePage(pagination.page + 1)}
            >
              <ChevronRight size={15} />
            </PageIconButton>

            <PageIconButton
              label="마지막 페이지"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => movePage(pagination.totalPages)}
            >
              <ChevronsRight size={15} />
            </PageIconButton>
          </div>
        </div>
      </section>
    </div>
  )
}

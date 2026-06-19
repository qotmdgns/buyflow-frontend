"use client"

import { Download, RefreshCcw, Search } from "lucide-react"
import StockPagination from "@/features/stock/components/StockPagination"
import useStockHistoryManagement from "@/features/stock/hooks/useStockHistoryManagement"
import {
  downloadStockHistoryCsv,
  formatNumber,
  formatSignedQuantity,
  STOCK_HISTORY_TABLE_HEADERS,
} from "@/features/stock/utils/stockManagementUtils"

const INPUT_CLASS_NAME =
  "h-10 w-full rounded-md border border-slate-200 px-3 text-[14px] outline-none transition placeholder:text-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"

function FieldLabel({ children }) {
  return (
    <span className="mb-1 block text-[13px] font-semibold text-slate-600">
      {children}
    </span>
  )
}

function SelectField({
  value,
  options = [],
  onChange,
}) {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`${INPUT_CLASS_NAME} bg-white text-slate-600`}
    >
      {(options ?? []).map((option) => {
        const optionValue =
          typeof option === "string"
            ? option
            : option?.value ?? ""

        const label =
          typeof option === "string"
            ? option
            : option?.label ?? optionValue

        return (
          <option
            key={optionValue}
            value={optionValue}
          >
            {label}
          </option>
        )
      })}
    </select>
  )
}

function MovementBadge({ type }) {
  const styles = {
    입고: "border-blue-200 bg-blue-50 text-blue-600",
    "재고 조정 증가": "border-emerald-200 bg-emerald-50 text-emerald-600",
    "재고 조정 감소": "border-rose-200 bg-rose-50 text-rose-500",
  }

  return (
    <span
      className={`inline-flex rounded-full border px-2 py-1 text-[12px] font-semibold ${styles[type]}`}
    >
      {type}
    </span>
  )
}

export default function StockHistoryManagement({ initialFilters }) {
  const {
    draftFilters,
    filterOptions,
    histories,
    pagination,
    pageSize,
    loading,
    error,
    updateFilter,
    searchHistories,
    resetFilters,
    movePage,
    changePageSize,
  } = useStockHistoryManagement(initialFilters)

  return (
    <div className="w-full">
      <header className="mb-3">
        <h1 className="text-[22px] font-bold tracking-tight text-slate-900">
          재고 이력
        </h1>

        <p className="mt-1 text-[13px] text-slate-400">
          입고와 재고 조정으로 변경된 수량을 조회합니다.
        </p>
      </header>

      <form
        onSubmit={searchHistories}
        className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
      >
        <div className="grid gap-x-3 gap-y-2.5 md:grid-cols-2 xl:grid-cols-5">
          <label>
            <FieldLabel>시작일</FieldLabel>

            <input
              type="date"
              value={draftFilters.fromDate}
              onChange={(event) => updateFilter("fromDate", event.target.value)}
              className={INPUT_CLASS_NAME}
            />
          </label>

          <label>
            <FieldLabel>종료일</FieldLabel>

            <input
              type="date"
              value={draftFilters.toDate}
              onChange={(event) => updateFilter("toDate", event.target.value)}
              className={INPUT_CLASS_NAME}
            />
          </label>

          <label>
            <FieldLabel>품목 코드 또는 품목명</FieldLabel>

            <input
              value={draftFilters.itemKeyword}
              onChange={(event) =>
                updateFilter("itemKeyword", event.target.value)
              }
              placeholder="검색어 입력"
              className={INPUT_CLASS_NAME}
            />
          </label>

          <label>
            <FieldLabel>창고</FieldLabel>

            <SelectField
              value={draftFilters.warehouseCode}
              options={filterOptions.warehouses}
              onChange={(event) =>
                updateFilter("warehouseCode", event.target.value)
              }
            />
          </label>

          <label>
            <FieldLabel>변경 유형</FieldLabel>

            <SelectField
              value={draftFilters.movementType}
              options={filterOptions.movementTypes}
              onChange={(event) =>
                updateFilter("movementType", event.target.value)
              }
            />
          </label>
        </div>

        <div className="mt-3 flex justify-end gap-2">
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

      <section className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] font-bold text-slate-800">
              재고 변경 목록
            </h2>

            <span className="text-[13px] text-slate-500">
              총 {pagination.totalElements}건
            </span>
          </div>

          <button
            type="button"
            onClick={() => downloadStockHistoryCsv(histories)}
            className="flex h-9 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <Download size={14} />
            CSV 다운로드
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1450px] text-left text-[13px]">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                {STOCK_HISTORY_TABLE_HEADERS.map((heading) => (
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
                <tr>
                  <td
                    colSpan={STOCK_HISTORY_TABLE_HEADERS.length}
                    className="px-3 py-12 text-center text-slate-400"
                  >
                    재고 이력을 불러오는 중입니다.
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td
                    colSpan={STOCK_HISTORY_TABLE_HEADERS.length}
                    className="px-3 py-12 text-center text-rose-500"
                  >
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && histories.length === 0 && (
                <tr>
                  <td
                    colSpan={STOCK_HISTORY_TABLE_HEADERS.length}
                    className="px-3 py-12 text-center text-slate-400"
                  >
                    검색 조건에 해당하는 재고 이력이 없습니다.
                  </td>
                </tr>
              )}

{!loading &&
  !error &&
  histories.map((history) => (
    <tr
      key={history.id}
      className="border-t border-slate-100 text-slate-600"
    >
      <td className="whitespace-nowrap px-3 py-3">
        {history.occurredAt}
      </td>

      <td className="whitespace-nowrap px-3 py-3">
        <MovementBadge type={history.movementType} />
      </td>

      <td className="px-3 py-3">
        <p className="font-semibold text-slate-800">
          {history.itemName}
        </p>

        <p className="mt-0.5 text-[12px] text-slate-400">
          {history.itemCode}
        </p>
      </td>

      <td className="whitespace-nowrap px-3 py-3">
        {history.warehouseName}
      </td>

      <td
        className={`px-3 py-3 font-bold ${
          history.quantity > 0
            ? "text-emerald-600"
            : "text-rose-500"
        }`}
      >
        {formatSignedQuantity(history.quantity)}
      </td>

      <td className="px-3 py-3">
        {formatNumber(history.beforeStock)}
      </td>

      <td className="px-3 py-3 font-semibold text-slate-800">
        {formatNumber(history.afterStock)}
      </td>

      <td className="whitespace-nowrap px-3 py-3 text-slate-400">
        {history.referenceNumber}
      </td>

      <td className="min-w-56 px-3 py-3">
        {history.reason}
      </td>

      <td className="whitespace-nowrap px-3 py-3">
        {history.processedBy}
      </td>
    </tr>
  ))}
            </tbody>
          </table>
        </div>

        <StockPagination
          pagination={pagination}
          pageSize={pageSize}
          onChangePageSize={changePageSize}
          onMovePage={movePage}
        />
      </section>
    </div>
  )
}

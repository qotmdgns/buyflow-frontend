"use client"

import Link from "next/link"
import {
  Download,
  History,
  RefreshCcw,
  Search,
  SlidersHorizontal,
} from "lucide-react"
import StockAdjustmentModal from "@/features/stock/components/StockAdjustmentModal"
import StockPagination from "@/features/stock/components/StockPagination"
import StockSummaryCards from "@/features/stock/components/StockSummaryCards"
import useStockStatusManagement from "@/features/stock/hooks/useStockStatusManagement"
import {
  formatNumber,
  getStockStatus,
  STOCK_TABLE_HEADERS,
} from "@/features/stock/utils/stockManagementUtils"
import { downloadFileWithAuth } from "@/lib/api/downloadClient"
import useClientReady from "@/utils/useClientReady"
import { hasPermission } from "@/utils/permissions"

const INPUT_CLASS_NAME = "bf-input"

function FieldLabel({ children }) {
  return <span className="bf-field-label">{children}</span>
}

function SelectField({ value, options = [], onChange }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`${INPUT_CLASS_NAME} bg-white text-slate-600`}
    >
      {options.map((option) => {
        const optionValue = typeof option === "string" ? option : option.value

        const optionLabel = typeof option === "string" ? option : option.label

        return (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        )
      })}
    </select>
  )
}

function StockStatusBadge({ stock }) {
  const status = getStockStatus(stock.currentStock, stock.safetyStock)

  const styles = {
    정상: "border-emerald-200 bg-emerald-50 text-emerald-600",
    "안전재고 미만": "border-amber-200 bg-amber-50 text-amber-600",
    "재고 없음": "border-rose-200 bg-rose-50 text-rose-500",
  }

  return (
    <span
      className={`inline-flex rounded-full border px-2 py-1 text-[12px] font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  )
}

export default function StockStatusManagement({ initialFilters = {} }) {
  const ready = useClientReady()
  const canAdjustStock = ready && hasPermission("stock.adjust")
  const {
    draftFilters,
    appliedFilters,
    filterOptions,
    stocks,
    summary,
    pagination,
    pageSize,
    loading,
    error,
    adjustmentTarget,
    updateFilter,
    searchStocks,
    resetFilters,
    selectSummaryStatus,
    movePage,
    changePageSize,
    openAdjustment,
    closeAdjustment,
    saveAdjustment,
  } = useStockStatusManagement(initialFilters)

  return (
    <div className="w-full">
      <header className="bf-page-header">
        <div>
          <p className="bf-page-eyebrow">STOCK</p>

          <h1 className="bf-page-title">재고 현황</h1>

          <p className="bf-page-description">
            품목별 현재 재고 수량과 창고별 보유 현황을 조회합니다.
          </p>
        </div>
      </header>

      <form onSubmit={searchStocks} className="bf-search-panel">
        <div className="grid gap-x-3 gap-y-2.5 md:grid-cols-2 xl:grid-cols-5">
          <label>
            <FieldLabel>품목 코드</FieldLabel>

            <input
              value={draftFilters.itemCode}
              onChange={(event) => updateFilter("itemCode", event.target.value)}
              placeholder="품목 코드 입력"
              className={INPUT_CLASS_NAME}
            />
          </label>

          <label>
            <FieldLabel>품목명</FieldLabel>

            <input
              value={draftFilters.itemName}
              onChange={(event) => updateFilter("itemName", event.target.value)}
              placeholder="품목명 입력"
              className={INPUT_CLASS_NAME}
            />
          </label>

          <label>
            <FieldLabel>카테고리</FieldLabel>

            <SelectField
              value={draftFilters.category}
              options={filterOptions.categories}
              onChange={(event) => updateFilter("category", event.target.value)}
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
            <FieldLabel>재고 상태</FieldLabel>

            <SelectField
              value={draftFilters.stockStatus}
              options={filterOptions.stockStatuses}
              onChange={(event) =>
                updateFilter("stockStatus", event.target.value)
              }
            />
          </label>
        </div>

        <div className="mt-3 flex justify-end gap-2">
          <button
            type="button"
            onClick={resetFilters}
            className="bf-btn bf-btn-secondary"
          >
            <RefreshCcw size={14} />
            초기화
          </button>

          <button type="submit" className="bf-btn bf-btn-primary">
            <Search size={14} />
            검색
          </button>
        </div>
      </form>

      <div className="mt-3">
        <StockSummaryCards
          summary={summary}
          selectedStatus={appliedFilters.stockStatus}
          onSelectStatus={selectSummaryStatus}
        />
      </div>

      <section className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] font-bold text-slate-800">재고 목록</h2>

            <span className="text-[13px] text-slate-500">
              총 {pagination.totalElements}건
            </span>
          </div>

          <button
            type="button"
            onClick={() =>
              downloadFileWithAuth("/api/inventories/excel", "inventories.xlsx")
            }
            className="flex h-9 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <Download size={14} />
            엑셀 다운로드
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1240px] text-left text-[13px]">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                {STOCK_TABLE_HEADERS.map((heading) => (
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
                    colSpan={STOCK_TABLE_HEADERS.length}
                    className="px-3 py-12 text-center text-slate-400"
                  >
                    재고 현황을 불러오는 중입니다.
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td
                    colSpan={STOCK_TABLE_HEADERS.length}
                    className="px-3 py-12 text-center text-rose-500"
                  >
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && stocks.length === 0 && (
                <tr>
                  <td
                    colSpan={STOCK_TABLE_HEADERS.length}
                    className="px-3 py-12 text-center text-slate-400"
                  >
                    검색 조건에 해당하는 재고가 없습니다.
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                stocks.map((stock) => {
                  const difference = stock.currentStock - stock.safetyStock

                  return (
                    <tr
                      key={stock.id}
                      className="border-t border-slate-100 text-slate-600"
                    >
                      <td className="whitespace-nowrap px-3 py-3 text-slate-400">
                        {stock.itemCode}
                      </td>

                      <td className="px-3 py-3 font-semibold text-slate-800">
                        {stock.itemName}
                      </td>

                      <td className="whitespace-nowrap px-3 py-3">
                        {stock.category}
                      </td>

                      <td className="whitespace-nowrap px-3 py-3">
                        {stock.warehouseName}
                      </td>

                      <td className="px-3 py-3">{stock.unit}</td>

                      <td className="px-3 py-3 font-semibold text-slate-800">
                        {formatNumber(stock.currentStock)}
                      </td>

                      <td className="px-3 py-3">
                        {formatNumber(stock.safetyStock)}
                      </td>

                      <td
                        className={`px-3 py-3 font-semibold ${
                          difference < 0 ? "text-rose-500" : "text-emerald-600"
                        }`}
                      >
                        {difference > 0 ? "+" : ""}
                        {formatNumber(difference)}
                      </td>

                      <td className="px-3 py-3">
                        <StockStatusBadge stock={stock} />
                      </td>

                      <td className="whitespace-nowrap px-3 py-3">
                        <div className="flex gap-2">
                          {canAdjustStock && (
                            <button
                              type="button"
                              onClick={() => openAdjustment(stock)}
                              className="flex items-center gap-1 text-[12px] font-semibold text-blue-600 hover:underline"
                            >
                              <SlidersHorizontal size={13} />
                              재고 조정
                            </button>
                          )}

                          <Link
                            href={`/stock/history?itemCode=${encodeURIComponent(
                              stock.itemCode,
                            )}&warehouseCode=${encodeURIComponent(
                              stock.warehouseCode,
                            )}`}
                            className="flex items-center gap-1 text-[12px] font-semibold text-slate-500 hover:text-blue-600 hover:underline"
                          >
                            <History size={13} />
                            이력 확인
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
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

      {adjustmentTarget && canAdjustStock && (
        <StockAdjustmentModal
          stock={adjustmentTarget}
          onClose={closeAdjustment}
          onSubmit={saveAdjustment}
        />
      )}
    </div>
  )
}

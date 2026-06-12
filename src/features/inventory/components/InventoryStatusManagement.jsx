"use client"

import Link from "next/link"
import {
  Download,
  History,
  RefreshCcw,
  Search,
  SlidersHorizontal,
} from "lucide-react"
import InventoryAdjustmentModal from "@/features/inventory/components/InventoryAdjustmentModal"
import InventoryPagination from "@/features/inventory/components/InventoryPagination"
import InventorySummaryCards from "@/features/inventory/components/InventorySummaryCards"
import useInventoryStatusManagement from "@/features/inventory/hooks/useInventoryStatusManagement"
import {
  downloadInventoryCsv,
  formatNumber,
  getStockStatus,
  INVENTORY_TABLE_HEADERS,
} from "@/features/inventory/utils/inventoryManagementUtils"

const INPUT_CLASS_NAME =
  "h-10 w-full rounded-md border border-slate-200 px-3 text-[14px] outline-none transition placeholder:text-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"

function FieldLabel({ children }) {
  return (
    <span className="mb-1 block text-[13px] font-semibold text-slate-600">
      {children}
    </span>
  )
}

function SelectField({ value, options, onChange }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`${INPUT_CLASS_NAME} bg-white text-slate-600`}
    >
      {options.map((option) => {
        const value = typeof option === "string" ? option : option.value

        const label = typeof option === "string" ? option : option.label

        return (
          <option key={value} value={value}>
            {label}
          </option>
        )
      })}
    </select>
  )
}

function StockStatusBadge({ inventory }) {
  const status = getStockStatus(inventory.currentStock, inventory.safetyStock)

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

export default function InventoryStatusManagement() {
  const {
    draftFilters,
    appliedFilters,
    filterOptions,
    inventories,
    summary,
    pagination,
    pageSize,
    loading,
    error,
    adjustmentTarget,
    updateFilter,
    searchInventories,
    resetFilters,
    selectSummaryStatus,
    movePage,
    changePageSize,
    openAdjustment,
    closeAdjustment,
    saveAdjustment,
  } = useInventoryStatusManagement()

  return (
    <div className="w-full">
      <header className="mb-3">
        <h1 className="text-[22px] font-bold tracking-tight text-slate-900">
          현재 재고 현황
        </h1>

        <p className="mt-1 text-[13px] text-slate-400">
          창고별 보유 재고와 안전재고 부족 여부를 조회합니다.
        </p>
      </header>

      <InventorySummaryCards
        summary={summary}
        selectedStatus={appliedFilters.stockStatus}
        onSelectStatus={selectSummaryStatus}
      />

      <form
        onSubmit={searchInventories}
        className="mt-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
      >
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
            <h2 className="text-[15px] font-bold text-slate-800">재고 목록</h2>

            <span className="text-[13px] text-slate-500">
              총 {pagination.totalElements}건
            </span>
          </div>

          <button
            type="button"
            onClick={() => downloadInventoryCsv(inventories)}
            className="flex h-9 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <Download size={14} />
            CSV 다운로드
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1380px] text-left text-[13px]">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                {INVENTORY_TABLE_HEADERS.map((heading) => (
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
                    colSpan={INVENTORY_TABLE_HEADERS.length}
                    className="px-3 py-12 text-center text-slate-400"
                  >
                    재고 현황을 불러오는 중입니다.
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td
                    colSpan={INVENTORY_TABLE_HEADERS.length}
                    className="px-3 py-12 text-center text-rose-500"
                  >
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && inventories.length === 0 && (
                <tr>
                  <td
                    colSpan={INVENTORY_TABLE_HEADERS.length}
                    className="px-3 py-12 text-center text-slate-400"
                  >
                    검색 조건에 해당하는 재고가 없습니다.
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                inventories.map((inventory) => {
                  const difference =
                    inventory.currentStock - inventory.safetyStock

                  return (
                    <tr
                      key={inventory.id}
                      className="border-t border-slate-100 text-slate-600"
                    >
                      <td className="whitespace-nowrap px-3 py-3 text-slate-400">
                        {inventory.itemCode}
                      </td>

                      <td className="px-3 py-3 font-semibold text-slate-800">
                        {inventory.itemName}
                      </td>

                      <td className="whitespace-nowrap px-3 py-3">
                        {inventory.category}
                      </td>

                      <td className="whitespace-nowrap px-3 py-3">
                        {inventory.warehouseName}
                      </td>

                      <td className="whitespace-nowrap px-3 py-3">
                        {inventory.locationCode}
                      </td>

                      <td className="px-3 py-3">{inventory.unit}</td>

                      <td className="px-3 py-3 font-semibold text-slate-800">
                        {formatNumber(inventory.currentStock)}
                      </td>

                      <td className="px-3 py-3">
                        {formatNumber(inventory.safetyStock)}
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
                        <StockStatusBadge inventory={inventory} />
                      </td>

                      <td className="whitespace-nowrap px-3 py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => openAdjustment(inventory)}
                            className="flex items-center gap-1 text-[12px] font-semibold text-blue-600 hover:underline"
                          >
                            <SlidersHorizontal size={13} />
                            재고 조정
                          </button>

                          <Link
                            href={`/inventory/history?itemCode=${encodeURIComponent(
                              inventory.itemCode,
                            )}&warehouseCode=${encodeURIComponent(
                              inventory.warehouseCode,
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

        <InventoryPagination
          pagination={pagination}
          pageSize={pageSize}
          onChangePageSize={changePageSize}
          onMovePage={movePage}
        />
      </section>

      {adjustmentTarget && (
        <InventoryAdjustmentModal
          inventory={adjustmentTarget}
          onClose={closeAdjustment}
          onSubmit={saveAdjustment}
        />
      )}
    </div>
  )
}

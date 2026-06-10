import { useMemo } from "react"
import { createPageNumbers } from "@/features/warehouse/utils/warehouseManagementUtils"

const PAGE_SIZES = [10, 20, 50]

export default function WarehousePagination({
  pagination,
  pageSize,
  onChangePageSize,
  onMovePage,
}) {
  const { page, totalPages } = pagination

  const pageNumbers = useMemo(
    () => createPageNumbers(page, totalPages),
    [page, totalPages],
  )

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-[13px] text-slate-500">
      <div className="flex items-center gap-3">
        <span>표시 개수</span>

        <select
          value={pageSize}
          onChange={(event) => onChangePageSize(Number(event.target.value))}
          className="h-8 rounded-md border border-slate-200 bg-white px-2 text-[13px] text-slate-600 outline-none"
        >
          {PAGE_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>

        <span>
          페이지 {page} / {totalPages}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onMovePage(page - 1)}
          disabled={page === 1}
          className="h-8 rounded-md border border-slate-200 bg-white px-3 text-[13px] font-semibold text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          이전
        </button>

        {pageNumbers.map((pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            onClick={() => onMovePage(pageNumber)}
            className={`flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-[13px] font-semibold transition ${
              page === pageNumber
                ? "bg-blue-600 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {pageNumber}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onMovePage(page + 1)}
          disabled={page === totalPages}
          className="h-8 rounded-md border border-slate-200 bg-white px-3 text-[13px] font-semibold text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          다음
        </button>
      </div>
    </div>
  )
}

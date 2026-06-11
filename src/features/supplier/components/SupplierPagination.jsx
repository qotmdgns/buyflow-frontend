import { useMemo } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { createPageNumbers } from "@/features/supplier/utils/supplierManagementUtils"

const PAGE_SIZES = [10, 15, 20, 50]

function PageIconButton({ children, label, disabled, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  )
}

export default function SupplierPagination({
  pagination,
  pageSize,
  onChangePageSize,
  onMovePage,
}) {
  const { page, totalPages, totalElements } = pagination

  const pageNumbers = useMemo(
    () => createPageNumbers(page, totalPages),
    [page, totalPages],
  )

  const firstRow = totalElements ? (page - 1) * pageSize + 1 : 0
  const lastRow = Math.min(page * pageSize, totalElements)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-[13px] text-slate-500">
      <div className="flex items-center gap-3">
        <span>페이지당 행 수</span>

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

        <p>
          총 {totalElements}건 중 {firstRow} - {lastRow}
        </p>
      </div>

      <div className="flex items-center gap-1">
        <PageIconButton
          label="이전 페이지"
          disabled={page === 1}
          onClick={() => onMovePage(page - 1)}
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
              onClick={() => onMovePage(pageNumber)}
              className={`flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-[13px] font-semibold transition ${
                page === pageNumber
                  ? "bg-blue-600 text-white"
                  : "border border-transparent bg-white text-slate-600 hover:border-slate-200"
              }`}
            >
              {pageNumber}
            </button>
          )
        })}

        <PageIconButton
          label="다음 페이지"
          disabled={page === totalPages}
          onClick={() => onMovePage(page + 1)}
        >
          <ChevronRight size={15} />
        </PageIconButton>
      </div>
    </div>
  )
}

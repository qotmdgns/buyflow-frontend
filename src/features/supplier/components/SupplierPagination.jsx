import { useMemo } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { createPageNumbers } from "@/features/supplier/utils/supplierManagementUtils"

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

export default function SupplierPagination({ pagination, onMovePage }) {
  const { page, totalPages } = pagination

  const pageNumbers = useMemo(
    () => createPageNumbers(page, totalPages),
    [page, totalPages],
  )

  return (
    <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 px-4 py-3 text-[13px] text-slate-500">
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

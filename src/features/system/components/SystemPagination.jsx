export default function SystemPagination({
  pagination,
  pageSize,
  onChangePageSize,
  onMovePage,
}) {
  return (
    <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-[13px]">
      <select
        value={pageSize}
        onChange={(event) => onChangePageSize(Number(event.target.value))}
        className="h-8 rounded-md border border-slate-200 px-2"
      >
        <option value={10}>10개씩 보기</option>
        <option value={20}>20개씩 보기</option>
        <option value={50}>50개씩 보기</option>
      </select>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={pagination.page === 1}
          onClick={() => onMovePage(pagination.page - 1)}
          className="rounded-md border border-slate-200 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          이전
        </button>

        <span>
          {pagination.page} / {pagination.totalPages}
        </span>

        <button
          type="button"
          disabled={pagination.page === pagination.totalPages}
          onClick={() => onMovePage(pagination.page + 1)}
          className="rounded-md border border-slate-200 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          다음
        </button>
      </div>
    </div>
  )
}

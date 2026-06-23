const summaryItems = [
  { key: "total", label: "전체", status: "전체", tone: "default" },
  { key: "pending", label: "승인 대기", status: "승인 대기", tone: "muted" },
  { key: "approved", label: "승인 완료", status: "승인 완료", tone: "primary" },
  { key: "rejected", label: "반려", status: "반려", tone: "danger" },
  { key: "ordered", label: "발주 완료", status: "발주 완료", tone: "muted" },
  { key: "canceled", label: "요청 취소", status: "요청 취소", tone: "muted" },
]

const toneStyles = {
  default: "border-slate-900 text-slate-900",
  muted: "border-slate-300 text-slate-700",
  primary: "border-blue-500 text-blue-700",
  danger: "border-rose-400 text-rose-600",
}

export default function PurchaseRequestSummaryCards({
  summary,
  activeStatus,
  onSelect,
}) {
  return (
    <section className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {summaryItems.map((item) => {
        const isActive = activeStatus === item.status

        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onSelect(item.status)}
            aria-pressed={isActive}
            className={`rounded-md border-2 bg-white px-3 py-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow ${
              toneStyles[item.tone]
            } ${isActive ? "ring-2 ring-slate-200 ring-offset-1" : ""}`}
          >
            <span className="block text-[13px] font-semibold">
              {item.label}
            </span>

            <strong className="mt-1 block text-[22px] leading-none">
              {String(summary[item.key] ?? 0).padStart(2, "0")}
            </strong>
          </button>
        )
      })}
    </section>
  )
}

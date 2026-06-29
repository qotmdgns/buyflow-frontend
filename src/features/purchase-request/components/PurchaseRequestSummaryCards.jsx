const summaryItems = [
  { key: "total", label: "전체", status: "전체", tone: "default" },
  { key: "pending", label: "승인 대기", status: "승인 대기", tone: "muted" },
  { key: "approved", label: "승인 완료", status: "승인 완료", tone: "primary" },
  { key: "rejected", label: "반려", status: "반려", tone: "danger" },
  { key: "ordered", label: "발주 완료", status: "발주 완료", tone: "muted" },
  { key: "canceled", label: "요청 취소", status: "요청 취소", tone: "muted" },
]

const toneStyles = {
  default: {
    accent: "border-l-slate-700",
    active: "bg-slate-50 ring-2 ring-slate-300",
  },
  muted: {
    accent: "border-l-slate-500",
    active: "bg-slate-50 ring-2 ring-slate-300",
  },
  primary: {
    accent: "border-l-blue-600",
    active: "bg-blue-50/60 ring-2 ring-blue-200",
  },
  danger: {
    accent: "border-l-rose-500",
    active: "bg-rose-50/60 ring-2 ring-rose-200",
  },
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
            className={`group flex flex-col rounded-lg border border-l-4 border-slate-200 bg-white px-4
            py-3
            text-left
            shadow-sm
            transition-all
            duration-200
            ease-out
            hover:-translate-y-1
            hover:shadow-md
            focus:outline-none
            focus:ring-2
            focus:ring-blue-200
            ${toneStyles[item.tone].accent}
            ${isActive ? toneStyles[item.tone].active : ""}
            `}
          >
          <p className="text-[13px] font-semibold text-slate-500">
            {item.label}
          </p>

            <strong className="mt-1 block text-[22px] leading-none">
              {String(summary[item.key] ?? 0).padStart(2, "0")}
            </strong>
          </button>
        )
      })}
    </section>
  )
}

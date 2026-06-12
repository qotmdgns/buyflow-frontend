const cards = [
  {
    key: "total",
    label: "전체 검수 대기",
  },
  {
    key: "receivedToday",
    label: "오늘 입고",
  },
  {
    key: "urgent",
    label: "긴급 검수",
  },
  {
    key: "overdue",
    label: "기한 초과",
  },
]

export default function InspectionSummaryCards({ summary }) {
  return (
    <section className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article
          key={card.key}
          className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm"
        >
          <p className="text-[13px] font-semibold text-slate-500">
            {card.label}
          </p>

          <p className="mt-1 text-[22px] font-bold text-slate-900">
            {Number(summary[card.key] ?? 0).toLocaleString("ko-KR")}

            <span className="ml-1 text-[13px] font-medium text-slate-400">
              건
            </span>
          </p>
        </article>
      ))}
    </section>
  )
}

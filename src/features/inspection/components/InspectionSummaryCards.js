import {
  CalendarCheck2,
  ClipboardList,
  Siren,
  TriangleAlert,
} from "lucide-react"

import { INSPECTION_SUMMARY_FILTERS } from "@/features/inspection/utils/inspectionManagementUtils"

const cards = [
  {
    filter: INSPECTION_SUMMARY_FILTERS.ALL,
    summaryKey: "total",
    label: "전체 검수 대기",
    description: "검수 대상 전체",
    Icon: ClipboardList,

    accentClassName: "border-l-slate-700",

    iconClassName: "bg-slate-100 text-slate-600",

    activeClassName: "bg-slate-50 ring-2 ring-slate-300",
  },

  {
    filter: INSPECTION_SUMMARY_FILTERS.TODAY,
    summaryKey: "receivedToday",
    label: "오늘 입고",
    description: "금일 입고된 품목",
    Icon: CalendarCheck2,

    accentClassName: "border-l-blue-600",

    iconClassName: "bg-blue-50 text-blue-600",

    activeClassName: "bg-blue-50/60 ring-2 ring-blue-200",
  },

  {
    filter: INSPECTION_SUMMARY_FILTERS.URGENT,
    summaryKey: "urgent",
    label: "긴급 검수",
    description: "우선 처리 필요",
    Icon: Siren,

    accentClassName: "border-l-orange-500",

    iconClassName: "bg-orange-50 text-orange-500",

    activeClassName: "bg-orange-50/60 ring-2 ring-orange-200",
  },

  {
    filter: INSPECTION_SUMMARY_FILTERS.OVERDUE,
    summaryKey: "overdue",
    label: "기한 초과",
    description: "즉시 확인 필요",
    Icon: TriangleAlert,

    accentClassName: "border-l-rose-500",

    iconClassName: "bg-rose-50 text-rose-500",

    activeClassName: "bg-rose-50/60 ring-2 ring-rose-200",
  },
]

export default function InspectionSummaryCards({
  summary,
  activeFilter,
  onChangeFilter,
}) {
  return (
    <section className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const {
          filter,
          summaryKey,
          label,
          description,
          Icon,
          accentClassName,
          iconClassName,
          activeClassName,
        } = card

        const isActive = activeFilter === filter

        return (
          <button
            key={filter}
            type="button"
            onClick={() => onChangeFilter(filter)}
            aria-pressed={isActive}
            className={`group flex w-full items-center justify-between rounded-lg border border-l-4 border-slate-200 bg-white px-4 py-3 text-left shadow-sm transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-200 ${accentClassName} ${
              isActive ? activeClassName : ""
            }`}
          >
            <div>
              <p className="text-[13px] font-semibold text-slate-500">
                {label}
              </p>

              <p className="mt-1 text-[22px] font-bold text-slate-900">
                {Number(summary?.[summaryKey] ?? 0).toLocaleString("ko-KR")}

                <span className="ml-1 text-[13px] font-medium text-slate-400">
                  건
                </span>
              </p>

              <p className="mt-1 text-[12px] text-slate-400">{description}</p>
            </div>

            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-transform duration-200 ease-out group-hover:scale-110 group-hover:-rotate-3 ${iconClassName}`}
            >
              <Icon size={18} />
            </span>
          </button>
        )
      })}
    </section>
  )
}

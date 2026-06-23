"use client"

import { Search, Check, AlertCircle, X } from "lucide-react"

import { formatNumber } from "@/features/stock/utils/stockManagementUtils"

const CARD_ITEMS = [
  {
    status: "전체",
    summaryKey: "total",
    title: "조회 재고 건수",
    description: "검색 조건에 포함된 전체 품목",
    icon: Search,
    borderClassName: "border-l-slate-700",
    iconClassName: "bg-slate-100 text-slate-600",
    valueClassName: "text-slate-900",
  },
  {
    status: "정상",
    summaryKey: "normal",
    title: "정상 재고",
    description: "안전재고 이상 보유",
    icon: Check,
    borderClassName: "border-l-emerald-500",
    iconClassName: "bg-emerald-50 text-emerald-500",
    valueClassName: "text-emerald-600",
  },
  {
    status: "안전재고 미만",
    summaryKey: "low",
    title: "안전재고 미만",
    description: "재고 보충 확인 필요",
    icon: AlertCircle,
    borderClassName: "border-l-amber-500",
    iconClassName: "bg-amber-50 text-amber-500",
    valueClassName: "text-amber-500",
  },
  {
    status: "재고 없음",
    summaryKey: "outOfStock",
    title: "재고 없음",
    description: "즉시 발주 또는 조정 필요",
    icon: X,
    borderClassName: "border-l-rose-500",
    iconClassName: "bg-rose-50 text-rose-500",
    valueClassName: "text-rose-500",
  },
]

export default function StockSummaryCards({
  summary,
  selectedStatus,
  onSelectStatus,
}) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {CARD_ITEMS.map((card) => {
        const Icon = card.icon
        const isSelected = selectedStatus === card.status

        return (
          <button
            key={card.status}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelectStatus(card.status)}
            className={`
              group rounded-lg border border-l-4 bg-white p-4 text-left
              shadow-sm transition duration-200 ease-out
              hover:-translate-y-1 hover:shadow-md
              active:translate-y-0 active:shadow-sm
              ${card.borderClassName}
              ${
                isSelected
                  ? "ring-2 ring-blue-200 ring-offset-1"
                  : "hover:border-slate-300"
              }
            `}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[13px] font-semibold text-slate-500">
                  {card.title}
                </p>

                <strong
                  className={`mt-2 block text-[24px] ${card.valueClassName}`}
                >
                  {formatNumber(summary[card.summaryKey])}
                  <span className="ml-1 text-[13px] font-semibold text-slate-400">
                    건
                  </span>
                </strong>

                <p className="mt-2 text-[12px] text-slate-400">
                  {card.description}
                </p>
              </div>

              <div
                className={`
                  flex h-10 w-10 shrink-0 items-center justify-center
                  rounded-full transition duration-200
                  group-hover:scale-110
                  ${card.iconClassName}
                `}
              >
                <Icon size={18} />
              </div>
            </div>
          </button>
        )
      })}
    </section>
  )
}

"use client"

import { useMemo, useState, useSyncExternalStore } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { MoreVertical, X } from "lucide-react"

const emptySubscribe = () => () => {}

function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  )
}

function ChartCard({ title, description, children, action }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h2 className="text-[15px] font-bold text-slate-800">{title}</h2>

          <p className="mt-0.5 text-[12px] text-slate-400">{description}</p>
        </div>

        {action || <MoreVertical size={15} className="text-slate-400" />}
      </div>

      {children}
    </section>
  )
}

function MonthlyReceiptDetailModal({ activeMonth, rows, onClose }) {
  if (!activeMonth) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/45 px-4 py-6">
      <section className="w-full max-w-[960px] overflow-hidden rounded-xl bg-white shadow-2xl">
        <header className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-[18px] font-bold text-slate-900">
              {activeMonth.month} 입고 현황
            </h2>

            <p className="mt-1 text-[13px] text-slate-400">
              선택한 월의 입고 건수, 품목 라인, 입고 수량을 확인합니다.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </header>

        <div className="grid grid-cols-3 gap-3 border-b border-slate-100 bg-slate-50 px-5 py-4">
          <div className="rounded-lg bg-white p-3 shadow-sm">
            <p className="text-[12px] text-slate-400">입고 건수</p>
            <strong className="mt-1 block text-[22px] text-blue-600">
              {formatNumber(activeMonth.receiptCount)}건
            </strong>
          </div>

          <div className="rounded-lg bg-white p-3 shadow-sm">
            <p className="text-[12px] text-slate-400">품목 라인 수</p>
            <strong className="mt-1 block text-[22px] text-slate-900">
              {formatNumber(activeMonth.itemLineCount)}건
            </strong>
          </div>

          <div className="rounded-lg bg-white p-3 shadow-sm">
            <p className="text-[12px] text-slate-400">총 입고 수량</p>
            <strong className="mt-1 block text-[22px] text-rose-500">
              {formatNumber(activeMonth.quantity)}개
            </strong>
          </div>
        </div>

        <div className="max-h-[55vh] overflow-auto">
          <table className="w-full min-w-[760px] text-left text-[13px]">
            <thead className="sticky top-0 bg-white text-slate-500 shadow-sm">
              <tr>
                {[
                  "입고 번호",
                  "입고일",
                  "창고",
                  "상태",
                  "품목 수",
                  "입고 수량",
                ].map((heading) => (
                  <th key={heading} className="px-4 py-3 font-semibold">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-slate-400"
                  >
                    표시할 입고 상세가 없습니다.
                  </td>
                </tr>
              )}

              {rows.map((row) => (
                <tr
                  key={row.receiptId}
                  className="border-t border-slate-100 text-slate-600 transition hover:bg-blue-50/40"
                >
                  <td className="px-4 py-3 font-semibold text-blue-600">
                    {row.receiptNo}
                  </td>

                  <td className="px-4 py-3">{row.receiptDate}</td>

                  <td className="px-4 py-3">{row.warehouseName}</td>

                  <td className="px-4 py-3">{row.status}</td>

                  <td className="px-4 py-3">{formatNumber(row.itemCount)}</td>

                  <td className="px-4 py-3 font-semibold text-slate-900">
                    {formatNumber(row.receiptQuantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <footer className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-md border border-slate-200 bg-white px-4 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-100"
          >
            닫기
          </button>
        </footer>
      </section>
    </div>
  )
}

export function MonthlyReceiptChart({ data, details = [], receiptMonths = 6 }) {
  const mounted = useMounted()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeMonth, setActiveMonth] = useState(null)

  const activeRows = useMemo(() => {
    if (!activeMonth?.monthKey) {
      return []
    }

    return details.filter((row) => row.monthKey === activeMonth.monthKey)
  }, [activeMonth, details])

  function changeReceiptMonths(event) {
    const nextMonths = event.target.value
    const query = new URLSearchParams(searchParams.toString())

    query.set("receiptMonths", nextMonths)

    router.push(`/dashboard?${query.toString()}`)
  }

  return (
    <>
      <ChartCard
        title="월별 입고 현황"
        description={`${receiptMonths}개월간 입고 처리 건수 / 막대 클릭 시 상세 확인`}
        action={
          <select
            value={receiptMonths}
            onChange={changeReceiptMonths}
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[13px] text-slate-500 outline-none"
          >
            {RECEIPT_PERIODS.map((period) => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
        }
      >
        <div className="h-[230px]">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{
                  top: 4,
                  right: 6,
                  left: -20,
                  bottom: 0,
                }}
              >
                <CartesianGrid
                  vertical={false}
                  stroke="#e8eef6"
                  strokeDasharray="4 4"
                />

                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 12,
                    fill: "#64748b",
                  }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 12,
                    fill: "#64748b",
                  }}
                />

                <Tooltip
                  cursor={{
                    fill: "#eff6ff",
                  }}
                  formatter={(value, name, props) => {
                    const row = props.payload ?? {}

                    return [
                      `${formatNumber(value)}건 / 수량 ${formatNumber(row.quantity)}개`,
                      "입고 건수",
                    ]
                  }}
                />

                <Bar
                  dataKey="receiptCount"
                  name="입고 건수"
                  fill="#2f80ed"
                  radius={[3, 3, 0, 0]}
                  barSize={40}
                  cursor="pointer"
                  onClick={(event) => setActiveMonth(event?.payload)}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full animate-pulse rounded-md bg-slate-50" />
          )}
        </div>
      </ChartCard>

      {activeMonth && (
        <MonthlyReceiptDetailModal
          activeMonth={activeMonth}
          rows={activeRows}
          onClose={() => setActiveMonth(null)}
        />
      )}
    </>
  )
}

const RECEIPT_PERIODS = [
  { label: "최근 3개월", value: 3 },
  { label: "최근 6개월", value: 6 },
  { label: "최근 12개월", value: 12 },
]

function formatNumber(value) {
  return Number(value ?? 0).toLocaleString("ko-KR")
}

function createStockStatusHref(statusKey) {
  const statusMap = {
    NORMAL: "정상",
    LOW_STOCK: "안전재고 미만",
    OUT_OF_STOCK: "재고 없음",
  }

  const query = new URLSearchParams({
    stockStatus: statusMap[statusKey] ?? "전체",
  })

  return `/stock?${query.toString()}`
}

export function StockStatusChart({ data }) {
  const mounted = useMounted()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  function moveTo(path) {
    setMenuOpen(false)
    router.push(path)
  }

  return (
    <ChartCard
      title="재고 상태 비율"
      description="현재 보유 품목별 재고 상태"
      action={
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <MoreVertical size={15} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-7 z-20 w-40 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 text-[13px] shadow-lg">
              <button
                type="button"
                onClick={() => moveTo("/stock")}
                className="block w-full px-3 py-2 text-left text-slate-600 hover:bg-slate-50"
              >
                전체 재고 보기
              </button>

              <button
                type="button"
                onClick={() => moveTo(createStockStatusHref("LOW_STOCK"))}
                className="block w-full px-3 py-2 text-left text-slate-600 hover:bg-slate-50"
              >
                안전재고 부족 보기
              </button>

              <button
                type="button"
                onClick={() => moveTo(createStockStatusHref("OUT_OF_STOCK"))}
                className="block w-full px-3 py-2 text-left text-slate-600 hover:bg-slate-50"
              >
                재고 없음 보기
              </button>

              <button
                type="button"
                onClick={() => moveTo("/stock/history")}
                className="block w-full px-3 py-2 text-left text-slate-600 hover:bg-slate-50"
              >
                재고 이력 보기
              </button>
            </div>
          )}
        </div>
      }
    >
      <div className="h-[180px]">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                formatter={(value, name, props) => {
                  const row = props.payload ?? {}

                  return [
                    `${formatNumber(value)}% / ${formatNumber(row.count)}개`,
                    row.name,
                  ]
                }}
              />

              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={70}
                paddingAngle={3}
                stroke="#ffffff"
                strokeWidth={3}
                cursor="pointer"
                onClick={(event) => {
                  if (event?.statusKey) {
                    router.push(createStockStatusHref(event.statusKey))
                  }
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="mx-auto mt-6 h-32 w-32 animate-pulse rounded-full bg-slate-50" />
        )}
      </div>

      <div className="grid grid-cols-3 border-t border-slate-100 pt-3 text-center">
        {data.map((item) => (
          <button
            type="button"
            key={item.name}
            onClick={() => router.push(createStockStatusHref(item.statusKey))}
            className="rounded-md p-1 transition hover:bg-slate-50"
          >
            <span
              className="mx-auto mb-1 block h-2 w-2 rounded-sm"
              style={{
                background: item.fill,
              }}
            />

            <p className="text-[12px] text-slate-400">{item.name}</p>

            <p
              className="mt-1 text-[14px] font-bold"
              style={{
                color: item.fill,
              }}
            >
              {item.value}% · {formatNumber(item.count)}개
            </p>
          </button>
        ))}
      </div>
    </ChartCard>
  )
}

"use client"

import { useSyncExternalStore } from "react"
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
import { MoreVertical } from "lucide-react"

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
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="text-[13px] font-bold text-slate-800">{title}</h2>

          <p className="mt-0.5 text-[10px] text-slate-400">{description}</p>
        </div>

        {action || <MoreVertical size={15} className="text-slate-400" />}
      </div>

      {children}
    </section>
  )
}

export function MonthlyInboundChart({ data }) {
  const mounted = useMounted()

  return (
    <ChartCard
      title="월별 입고 현황"
      description="최근 6개월간 총 입고 처리 수량 (단위: 건)"
      action={
        <select className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] text-slate-500 outline-none">
          <option>최근 6개월</option>
        </select>
      }
    >
      <div className="h-[245px]">
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
                  fontSize: 10,
                  fill: "#64748b",
                }}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 10,
                  fill: "#64748b",
                }}
              />

              <Tooltip
                cursor={{
                  fill: "#eff6ff",
                }}
              />

              <Bar
                dataKey="quantity"
                name="입고 수량"
                fill="#2f80ed"
                radius={[3, 3, 0, 0]}
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full animate-pulse rounded-md bg-slate-50" />
        )}
      </div>
    </ChartCard>
  )
}

export function InventoryStatusChart({ data }) {
  const mounted = useMounted()

  return (
    <ChartCard title="재고 상태 비율" description="현재 보유 품목별 재고 상태">
      <div className="h-[190px]">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip formatter={(value) => `${value}%`} />

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
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="mx-auto mt-6 h-32 w-32 animate-pulse rounded-full bg-slate-50" />
        )}
      </div>

      <div className="grid grid-cols-3 border-t border-slate-100 pt-3 text-center">
        {data.map((item) => (
          <div key={item.name}>
            <span
              className="mx-auto mb-1 block h-2 w-2 rounded-sm"
              style={{
                background: item.fill,
              }}
            />

            <p className="text-[9px] text-slate-400">{item.name}</p>

            <p
              className="mt-1 text-[11px] font-bold"
              style={{
                color: item.fill,
              }}
            >
              {item.value}%
            </p>
          </div>
        ))}
      </div>
    </ChartCard>
  )
}

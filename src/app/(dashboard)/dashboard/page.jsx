import { getDashboardData } from "@/features/dashboard/api/dashboardApi"
import {
  InventoryStatusChart,
  MonthlyReceiptChart,
} from "@/features/dashboard/components/DashboardCharts"
import DashboardSummaryCards from "@/features/dashboard/components/DashboardSummaryCards"
import DashboardTables from "@/features/dashboard/components/DashboardTables"

export const metadata = {
  title: "대시보드 | BuyFlow ERP",
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-[22px] font-bold text-slate-900">현황 요약</h1>

        <p className="text-[13px] text-slate-400">
          최종 업데이트: {data.lastUpdated}
        </p>
      </div>

      <DashboardSummaryCards
        summary={data.summary ?? []}
        summaryDetails={data.summaryDetails ?? {}}
      />

      <div className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <MonthlyReceiptChart data={data.monthlyReceipt ?? []} />

        <InventoryStatusChart data={data.inventoryStatus ?? []} />
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <DashboardTables
          recentRequests={data.recentRequests ?? []}
          recentRequestTotal={data.recentRequestTotal ?? 0}
          lowStockItems={data.lowStockItems ?? []}
          lowStockTotal={data.lowStockTotal ?? 0}
        />
      </div>

      <footer className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 py-3 text-[12px] text-slate-400">
        <span>© 2026 BuyFlow ERP Corp. All Rights Reserved.</span>

        <span>개인정보처리방침 · 서비스이용약관 · 고객지원센터</span>
      </footer>
    </>
  )
}

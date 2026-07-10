"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { getDashboardData } from "@/features/dashboard/api/dashboardApi"
import {
  StockStatusChart,
  MonthlyReceiptChart,
} from "@/features/dashboard/components/DashboardCharts"
import DashboardSummaryCards from "@/features/dashboard/components/DashboardSummaryCards"
import DashboardTables from "@/features/dashboard/components/DashboardTables"
import { useAuth } from "@/features/auth/context/AuthContext"

function normalizeReceiptMonths(value) {
  const months = Number(value)

  if ([3, 6, 12].includes(months)) {
    return months
  }

  return 6
}

export default function DashboardPageClient() {
  const searchParams = useSearchParams()
  const { isAuthReady, user } = useAuth()
  const receiptMonths = normalizeReceiptMonths(searchParams.get("receiptMonths"))
  const [data, setData] = useState(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthReady || !user) {
      return
    }

    let ignore = false

    async function loadDashboard() {
      setLoading(true)
      setErrorMessage("")

      try {
        const nextData = await getDashboardData({ receiptMonths })

        if (!ignore) {
          setData(nextData)
        }
      } catch (error) {
        if (!ignore) {
          setErrorMessage(
            error?.message || "대시보드 정보를 불러오지 못했습니다.",
          )
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    loadDashboard()

    return () => {
      ignore = true
    }
  }, [isAuthReady, receiptMonths, user])

  if (!isAuthReady || loading) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-6 text-[14px] font-semibold text-slate-500 shadow-sm">
        대시보드 정보를 불러오는 중입니다.
      </section>
    )
  }

  if (errorMessage) {
    return (
      <section className="rounded-lg border border-rose-200 bg-rose-50 p-6 text-[14px] font-semibold text-rose-600">
        {errorMessage}
      </section>
    )
  }

  const dashboardData = data ?? {}

  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-[22px] font-bold text-slate-900">현황 요약</h1>

        <p className="text-[13px] text-slate-400">
          최종 업데이트: {dashboardData.lastUpdated}
        </p>
      </div>

      <DashboardSummaryCards
        summary={dashboardData.summary ?? []}
        summaryDetails={dashboardData.summaryDetails ?? {}}
      />

      <div className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <MonthlyReceiptChart
          data={dashboardData.monthlyReceipt ?? []}
          details={dashboardData.monthlyReceiptDetails ?? []}
          receiptMonths={receiptMonths}
        />

        <StockStatusChart data={dashboardData.stockStatus ?? []} />
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <DashboardTables
          recentRequests={dashboardData.recentRequests ?? []}
          recentRequestTotal={dashboardData.recentRequestTotal ?? 0}
          lowStockItems={dashboardData.lowStockItems ?? []}
          lowStockTotal={dashboardData.lowStockTotal ?? 0}
        />
      </div>

      <footer className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 py-3 text-[12px] text-slate-400">
        <span>© 2026 BuyFlow ERP Corp. All Rights Reserved.</span>

        <span>개인정보처리방침 · 서비스이용약관 · 고객지원센터</span>
      </footer>
    </>
  )
}

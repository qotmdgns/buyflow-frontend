import Link from "next/link"
import {
  AlertTriangle,
  ArrowRight,
  ClipboardCheck,
  Clock3,
  Download,
  MoreVertical,
  PackageOpen,
  RefreshCcw,
  Search,
  Truck,
} from "lucide-react"
import { getDashboardData } from "@/features/dashboard/api/dashboardApi"
import {
  InventoryStatusChart,
  MonthlyInboundChart,
} from "@/features/dashboard/components/DashboardCharts"

const summaryIcons = {
  delayedOrders: RefreshCcw,
  pendingApprovals: ClipboardCheck,
  scheduledInbound: Truck,
  pendingInspections: Clock3,
  lowStock: AlertTriangle,
}

const toneStyles = {
  default: "border-slate-200 text-slate-900",
  danger: "border-l-rose-500 text-rose-500",
}

function SummaryCard({ item }) {
  const Icon = summaryIcons[item.key] || PackageOpen
  const danger = item.tone === "danger"

  return (
    <article
      className={`min-h-[110px] rounded-lg border bg-white p-3 shadow-sm ${toneStyles[item.tone]}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[13px] text-slate-500">{item.label}</p>

          <div className="mt-1 flex items-baseline gap-1">
            <strong
              className={`text-[24px] ${
                danger ? "text-rose-500" : "text-slate-900"
              }`}
            >
              {item.value}
            </strong>

            {item.badge && (
              <span className="text-[12px] font-semibold text-rose-500">
                {item.badge}
              </span>
            )}
          </div>
        </div>

        <span
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
            danger ? "bg-rose-50 text-rose-500" : "bg-blue-50 text-blue-500"
          }`}
        >
          <Icon size={15} />
        </span>
      </div>

      <p className="mt-2 text-[12px] text-slate-400">{item.note}</p>

      <button
        type="button"
        className="mt-2 flex items-center gap-1 text-[12px] text-slate-500 hover:text-blue-600"
      >
        상세보기
        <ArrowRight size={10} />
      </button>
    </article>
  )
}

function StatusBadge({ status }) {
  const styles = {
    승인완료: "bg-emerald-50 text-emerald-600",
    승인대기: "bg-slate-100 text-slate-600",
    반려: "bg-rose-50 text-rose-500",
  }

  return (
    <span className={`rounded-full px-2 py-1 text-[12px] ${styles[status]}`}>
      {status}
    </span>
  )
}

function RecentRequests({ requests }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-3">
        <div className="flex items-center gap-2">
          <h2 className="text-[15px] font-bold">최근 구매 요청</h2>

          <Link
            href="/purchase-requests"
            className="text-[13px] text-blue-600 hover:underline"
          >
            전체 보기
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex h-8 items-center gap-1 rounded-md border border-slate-200 px-2">
            <Search size={12} className="text-slate-400" />

            <input
              placeholder="요청자/번호 검색"
              className="w-24 text-[10px] outline-none"
            />
          </label>

          <button
            type="button"
            className="flex h-8 items-center gap-1 rounded-md border border-slate-200 px-2 text-[10px] text-slate-500"
          >
            <Download size={12} />
            내보내기
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] text-left text-[10px]">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              {["요청 번호", "요청자", "요청일", "요청 금액", "상태", ""].map(
                (heading) => (
                  <th key={heading} className="px-3 py-2.5 font-medium">
                    {heading}
                  </th>
                ),
              )}
            </tr>
          </thead>

          <tbody>
            {requests.map((request) => (
              <tr
                key={request.id}
                className="border-t border-slate-100 text-slate-600"
              >
                <td className="px-3 py-2.5 font-medium text-blue-600">
                  {request.id}
                </td>

                <td className="px-3 py-2.5">
                  {request.requester}
                  <br />
                  <span className="text-slate-400">{request.team}</span>
                </td>

                <td className="px-3 py-2.5">{request.date}</td>

                <td className="px-3 py-2.5 font-medium text-slate-700">
                  {request.amount}
                </td>

                <td className="px-3 py-2.5">
                  <StatusBadge status={request.status} />
                </td>

                <td className="px-3 py-2.5">
                  <MoreVertical size={13} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 p-4 text-[13px] text-slate-400">
        <span>페이지 당 행 수: 5</span>
        <span>1-5 / 124</span>
      </div>
    </section>
  )
}

function LowStockItems({ items }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] font-bold">안전재고 부족 품목</h2>

            <a href="#" className="text-[10px] text-blue-600 hover:underline">
              전체 보기
            </a>
          </div>

          <span className="mt-1 inline-block rounded-full bg-rose-500 px-2.5 py-1 text-[12px] text-white">
            관리 시급 5건
          </span>
        </div>

        <label className="flex h-8 items-center gap-1 rounded-md border border-slate-200 px-2">
          <Search size={12} className="text-slate-400" />

          <input
            placeholder="품목명/코드 검색"
            className="w-24 text-[10px] outline-none"
          />
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] text-left text-[13px]">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              {[
                "품목 코드",
                "품목명",
                "창고",
                "현재 재고",
                "안전재고",
                "부족 수량",
              ].map((heading) => (
                <th key={heading} className="px-3 py-2.5 font-medium">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {items.map((item) => (
              <tr
                key={item.code}
                className="border-t border-slate-100 text-slate-600"
              >
                <td className="px-3 py-2.5 text-slate-400">{item.code}</td>

                <td className="px-3 py-2.5 font-medium text-slate-700">
                  {item.name}
                </td>

                <td className="px-3 py-2.5">{item.warehouse}</td>

                <td className="px-3 py-2.5">{item.current}</td>

                <td className="px-3 py-2.5">{item.safety}</td>

                <td className="px-3 py-2.5 font-semibold text-rose-500">
                  {item.shortage}개 부족
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 p-3 text-[13px] text-slate-400">
        <span>※ 현재 화면은 임시 데이터로 표시됩니다.</span>

        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-md border border-slate-200 px-2 py-1 text-slate-600"
          >
            재고 조정
          </button>

          <button
            type="button"
            className="rounded-md border border-slate-200 px-2 py-1 text-slate-600"
          >
            이력 확인
          </button>
        </div>
      </div>
    </section>
  )
}

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

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {data.summary.map((item) => (
          <SummaryCard key={item.key} item={item} />
        ))}
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <MonthlyInboundChart data={data.monthlyInbound} />

        <InventoryStatusChart data={data.inventoryStatus} />
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <RecentRequests requests={data.recentRequests} />

        <LowStockItems items={data.lowStockItems} />
      </div>

      <footer className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 py-3 text-[12px] text-slate-400">
        <span>© 2026 BuyFlow ERP Corp. All Rights Reserved.</span>

        <span>개인정보처리방침 · 서비스이용약관 · 고객지원센터</span>
      </footer>
    </>
  )
}

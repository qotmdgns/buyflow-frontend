"use client"

import Link from "next/link"
import { MoreVertical, Search } from "lucide-react"
import { useMemo, useState } from "react"

const LOW_STOCK_STATUS = "안전재고 미만"

function createQueryHref(path, params) {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return
    }

    query.set(key, String(value))
  })

  const queryString = query.toString()

  return queryString ? `${path}?${queryString}` : path
}

const LOW_STOCK_LIST_HREF = createQueryHref("/stock", {
  stockStatus: LOW_STOCK_STATUS,
})

function StatusBadge({ status }) {
  const styles = {
    승인완료: "bg-emerald-50 text-emerald-600",
    승인대기: "bg-slate-100 text-slate-600",
    반려: "bg-rose-50 text-rose-500",
    발주완료: "bg-blue-50 text-blue-600",
    요청취소: "bg-slate-100 text-slate-400",
  }

  return (
    <span
      className={`rounded-full px-2 py-1 text-[12px] ${
        styles[status] ?? "bg-slate-100 text-slate-600"
      }`}
    >
      {status}
    </span>
  )
}

function includesKeyword(value, keyword) {
  return String(value ?? "")
    .toLowerCase()
    .includes(keyword.trim().toLowerCase())
}

function createStockItemHref(item) {
  return createQueryHref("/stock", {
    stockStatus: LOW_STOCK_STATUS,
    itemCode: item.code,
    warehouseCode: item.warehouseCode,
  })
}

function RecentRequests({ requests = [] }) {
  const [keyword, setKeyword] = useState("")

  const filteredRequests = useMemo(() => {
    if (!keyword.trim()) {
      return requests
    }

    return requests.filter((request) => {
      return (
        includesKeyword(request.id, keyword) ||
        includesKeyword(request.requester, keyword) ||
        includesKeyword(request.team, keyword) ||
        includesKeyword(request.status, keyword)
      )
    })
  }, [requests, keyword])

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

        <label className="flex h-8 items-center gap-1 rounded-md border border-slate-200 px-2">
          <Search size={12} className="text-slate-400" />

          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="요청자/번호 검색"
            className="w-28 text-[10px] outline-none"
          />
        </label>
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
            {filteredRequests.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-10 text-center text-[13px] text-slate-400"
                >
                  검색 조건에 해당하는 최근 구매 요청이 없습니다.
                </td>
              </tr>
            )}

            {filteredRequests.map((request) => (
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
    </section>
  )
}

function LowStockItems({ items = [], total = 0 }) {
  const [keyword, setKeyword] = useState("")

  const filteredItems = useMemo(() => {
    if (!keyword.trim()) {
      return items
    }

    return items.filter((item) => {
      return (
        includesKeyword(item.code, keyword) ||
        includesKeyword(item.name, keyword) ||
        includesKeyword(item.warehouse, keyword) ||
        includesKeyword(item.warehouseCode, keyword)
      )
    })
  }, [items, keyword])

  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] font-bold">안전재고 부족 품목</h2>

            <Link
              href={LOW_STOCK_LIST_HREF}
              className="text-[10px] text-blue-600 hover:underline"
            >
              전체 보기
            </Link>
          </div>

          <span className="mt-1 inline-block rounded-full bg-rose-500 px-2.5 py-1 text-[12px] text-white">
            관리 시급 {total ?? items.length}건
          </span>
        </div>

        <label className="flex h-8 items-center gap-1 rounded-md border border-slate-200 px-2">
          <Search size={12} className="text-slate-400" />

          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="품목명/코드 검색"
            className="w-28 text-[10px] outline-none"
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
            {filteredItems.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-10 text-center text-slate-400"
                >
                  검색 조건에 해당하는 안전재고 부족 품목이 없습니다.
                </td>
              </tr>
            )}

            {filteredItems.map((item) => (
              <tr
                key={`${item.stockId ?? item.code}-${item.warehouseCode ?? item.warehouse}`}
                className="border-t border-slate-100 text-slate-600"
              >
                <td className="px-3 py-2.5">
                  <Link
                    href={createStockItemHref(item)}
                    className="text-slate-400 hover:text-blue-600 hover:underline"
                  >
                    {item.code}
                  </Link>
                </td>

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
        <span>※ 안전재고 미만 품목을 부족 수량 기준으로 표시합니다.</span>

        <div className="flex gap-2">
          <Link
            href={LOW_STOCK_LIST_HREF}
            className="rounded-md border border-slate-200 px-2 py-1 text-slate-600 transition hover:bg-slate-50"
          >
            재고 조정
          </Link>

          <Link
            href="/stock/history"
            className="rounded-md border border-slate-200 px-2 py-1 text-slate-600 transition hover:bg-slate-50"
          >
            이력 확인
          </Link>
        </div>
      </div>
    </section>
  )
}

export default function DashboardTables({
  recentRequests,
  recentRequestTotal,
  lowStockItems,
  lowStockTotal,
}) {
  return (
    <>
      <RecentRequests requests={recentRequests} total={recentRequestTotal} />

      <LowStockItems items={lowStockItems} total={lowStockTotal} />
    </>
  )
}

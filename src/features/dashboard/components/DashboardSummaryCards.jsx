"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import {
  AlertTriangle,
  ClipboardCheck,
  Clock3,
  PackageOpen,
  RefreshCcw,
  Truck,
  X,
} from "lucide-react"

const summaryIcons = {
  delayedOrders: RefreshCcw,
  pendingApprovals: ClipboardCheck,
  scheduledReceipt: Truck,
  pendingInspections: Clock3,
  lowStock: AlertTriangle,
}

const toneStyles = {
  default: "border-slate-200 text-slate-900",
  danger: "border-l-rose-500 text-rose-500",
}

const detailKeyBySummaryKey = {
  delayedOrders: "delayedOrders",
  pendingApprovals: "pendingApprovals",
  scheduledReceipt: "scheduledReceipts",
  pendingInspections: "pendingInspections",
  lowStock: "lowStockItems",
}

const pageHrefBySummaryKey = {
  delayedOrders: "/purchase-orders",
  pendingApprovals: "/approvals",
  scheduledReceipt: "/purchase-orders",
  pendingInspections: "/inspections",
  lowStock:
    "/stock?stockStatus=%EC%95%88%EC%A0%84%EC%9E%AC%EA%B3%A0%20%EB%AF%B8%EB%A7%8C",
}

function getValue(value) {
  return value === undefined || value === null || value === "" ? "-" : value
}

function getModalConfig(key) {
  const configs = {
    delayedOrders: {
      title: "납기 지연 발주 목록",
      description: "납기일이 지났지만 완료 또는 취소 처리되지 않은 발주입니다.",
      columns: [
        { label: "발주 번호", render: (row) => row.orderNo },
        { label: "공급업체", render: (row) => row.supplierName },
        { label: "납기일", render: (row) => row.dueDate },
        { label: "상태", render: (row) => row.status },
        { label: "금액", render: (row) => row.amount },
      ],
    },

    pendingApprovals: {
      title: "승인 대기 요청 목록",
      description: "승인 처리가 필요한 구매 요청입니다.",
      columns: [
        { label: "요청 번호", render: (row) => row.requestNo },
        { label: "요청자", render: (row) => row.requester },
        { label: "부서/직급", render: (row) => row.team },
        { label: "요청일", render: (row) => row.createdAt },
        { label: "금액", render: (row) => row.amount },
        { label: "상태", render: (row) => row.status },
      ],
    },

    scheduledReceipt: {
      title: "입고 예정 발주 목록",
      description: "이번 주 입고 예정인 발주입니다.",
      columns: [
        { label: "발주 번호", render: (row) => row.orderNo },
        { label: "공급업체", render: (row) => row.supplierName },
        { label: "입고 예정일", render: (row) => row.dueDate },
        { label: "상태", render: (row) => row.status },
        { label: "금액", render: (row) => row.amount },
      ],
    },

    pendingInspections: {
      title: "검수 대기 입고 목록",
      description: "입고는 되었지만 아직 검수 결과가 등록되지 않은 건입니다.",
      columns: [
        { label: "입고 번호", render: (row) => row.receiptNo },
        { label: "발주 번호", render: (row) => row.orderNo },
        { label: "창고", render: (row) => row.warehouseName },
        { label: "입고일", render: (row) => row.receiptDate },
        { label: "품목 수", render: (row) => row.itemCount },
        { label: "입고 수량", render: (row) => row.receiptQuantity },
      ],
    },

    lowStock: {
      title: "안전재고 부족 품목 목록",
      description: "현재 재고가 안전재고보다 낮은 품목입니다.",
      columns: [
        { label: "품목 코드", render: (row) => row.code },
        { label: "품목명", render: (row) => row.name },
        { label: "창고", render: (row) => row.warehouse },
        { label: "현재 재고", render: (row) => row.current },
        { label: "안전재고", render: (row) => row.safety },
        { label: "부족 수량", render: (row) => `${row.shortage}개 부족` },
      ],
    },
  }

  return configs[key]
}

function SummaryCard({ item, onClick }) {
  const Icon = summaryIcons[item.key] || PackageOpen
  const danger = item.tone === "danger"

  return (
    <button
      type="button"
      onClick={() => onClick(item)}
      className={`min-h-[110px] rounded-lg border bg-white p-3 text-left shadow-sm transition hover:-translate-y-[1px] hover:shadow-md ${
        toneStyles[item.tone] ?? toneStyles.default
      }`}
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
    </button>
  )
}

function DashboardSummaryModal({ activeItem, rows, onClose }) {
  const config = getModalConfig(activeItem.key)

  if (!config) {
    return null
  }

  const pageHref = pageHrefBySummaryKey[activeItem.key]

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/45 px-4 py-6">
      <section className="max-h-[calc(100vh-2rem)] w-full max-w-[1080px] overflow-hidden rounded-lg bg-white shadow-2xl">
        <header className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-[17px] font-bold text-slate-900">
              {config.title}
            </h2>

            <p className="mt-1 text-[13px] text-slate-400">
              {config.description}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 transition hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </header>

        <div className="max-h-[65vh] overflow-auto">
          <table className="w-full min-w-[820px] text-left text-[13px]">
            <thead className="sticky top-0 bg-slate-50 text-slate-500">
              <tr>
                {config.columns.map((column) => (
                  <th
                    key={column.label}
                    className="whitespace-nowrap px-4 py-3 font-semibold"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={config.columns.length}
                    className="px-4 py-12 text-center text-slate-400"
                  >
                    표시할 데이터가 없습니다.
                  </td>
                </tr>
              )}

              {rows.map((row, rowIndex) => (
                <tr
                  key={`${activeItem.key}-${row.id ?? row.orderId ?? row.requestId ?? row.receiptId ?? row.stockId ?? rowIndex}`}
                  className="border-t border-slate-100 text-slate-600"
                >
                  {config.columns.map((column) => (
                    <td
                      key={column.label}
                      className="whitespace-nowrap px-4 py-3"
                    >
                      {getValue(column.render(row))}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <footer className="flex justify-between border-t border-slate-100 bg-slate-50 px-5 py-3">
          <span className="text-[13px] text-slate-400">총 {rows.length}건</span>

          <div className="flex gap-2">
            {pageHref && (
              <Link
                href={pageHref}
                className="flex h-9 items-center rounded-md bg-blue-600 px-4 text-[13px] font-semibold text-white transition hover:bg-blue-700"
              >
                관련 화면으로 이동
              </Link>
            )}

            <button
              type="button"
              onClick={onClose}
              className="h-9 rounded-md border border-slate-200 bg-white px-4 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              닫기
            </button>
          </div>
        </footer>
      </section>
    </div>
  )
}

export default function DashboardSummaryCards({
  summary = [],
  summaryDetails = {},
}) {
  const [activeItem, setActiveItem] = useState(null)

  const activeRows = useMemo(() => {
    if (!activeItem) {
      return []
    }

    const detailKey = detailKeyBySummaryKey[activeItem.key]

    return summaryDetails?.[detailKey] ?? []
  }, [activeItem, summaryDetails])

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {summary.map((item) => (
          <SummaryCard key={item.key} item={item} onClick={setActiveItem} />
        ))}
      </div>

      {activeItem && (
        <DashboardSummaryModal
          activeItem={activeItem}
          rows={activeRows}
          onClose={() => setActiveItem(null)}
        />
      )}
    </>
  )
}

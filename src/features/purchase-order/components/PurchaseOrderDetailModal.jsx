"use client"

import { Ban, Pencil, X } from "lucide-react"

import {
  canCancelPurchaseOrder,
  canEditPurchaseOrder,
  formatWon,
  getPurchaseOrderStatusMeta,
} from "@/features/purchase-order/utils/purchaseOrderUtils"

export default function PurchaseOrderDetailModal({
  order,
  loading,
  error,
  onClose,
  onEdit,
  onCancel,
}) {
  if (loading) {
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/45">
        <div className="rounded-lg bg-white px-10 py-8 text-slate-400">
          발주 상세 정보를 불러오는 중입니다.
        </div>
      </div>
    )
  }

  if (!order) {
    return null
  }

  const statusMeta = getPurchaseOrderStatusMeta(order.status)

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/45 px-4 py-6">
      <section className="max-h-[calc(100vh-2rem)] w-full max-w-[980px] overflow-y-auto rounded-lg bg-white shadow-2xl">
        <header className="flex justify-between border-b px-5 py-4">
          <h2 className="text-[16px] font-bold">발주 상세 정보</h2>

          <button type="button" onClick={onClose}>
            <X size={17} />
          </button>
        </header>

        <div className="space-y-4 px-5 py-4">
          <div className="flex justify-between rounded-md border bg-slate-50 px-4 py-3">
            <strong className="text-blue-600">{order.orderNumber}</strong>

            <span
              className={`rounded-full border px-2.5 py-1 text-[12px] font-semibold ${statusMeta.badgeClassName}`}
            >
              {statusMeta.label}
            </span>
          </div>

          <dl className="grid gap-3 md:grid-cols-2">
            <div>
              <dt className="text-[12px] text-slate-400">구매 요청 번호</dt>

              <dd>{order.requestNumber}</dd>
            </div>

            <div>
              <dt className="text-[12px] text-slate-400">공급업체</dt>

              <dd>{order.supplierName}</dd>
            </div>

            <div>
              <dt className="text-[12px] text-slate-400">발주 담당자</dt>

              <dd>{order.orderManager}</dd>
            </div>

            <div>
              <dt className="text-[12px] text-slate-400">입고 예정일</dt>

              <dd>
                {order.expectedInboundFrom} ~ {order.expectedInboundTo}
              </dd>
            </div>

            <div>
              <dt className="text-[12px] text-slate-400">입고 창고</dt>

              <dd>{order.warehouseName}</dd>
            </div>

            <div>
              <dt className="text-[12px] text-slate-400">총 발주 금액</dt>

              <dd className="font-bold text-blue-600">
                {formatWon(order.totalAmount)}
              </dd>
            </div>
          </dl>

          {error && <p className="text-rose-500">{error}</p>}
        </div>

        <footer className="flex justify-between border-t bg-slate-50 px-5 py-3">
          <div>
            {canCancelPurchaseOrder(order.status) && (
              <button
                type="button"
                onClick={() => onCancel(order)}
                className="flex h-10 items-center gap-1.5 rounded-md border border-rose-200 bg-white px-4 text-[13px] font-semibold text-rose-600"
              >
                <Ban size={14} />
                발주 취소
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-md border bg-white px-4 text-[13px]"
            >
              닫기
            </button>

            {canEditPurchaseOrder(order.status) && (
              <button
                type="button"
                onClick={() => onEdit(order)}
                className="flex h-10 items-center gap-1.5 rounded-md bg-blue-600 px-4 text-[13px] font-semibold text-white"
              >
                <Pencil size={14} />
                수정하기
              </button>
            )}
          </div>
        </footer>
      </section>
    </div>
  )
}

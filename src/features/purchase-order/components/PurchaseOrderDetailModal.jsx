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

  const currentStatus = order.orderStatus || order.status || "DRAFT";
  const statusMeta = getPurchaseOrderStatusMeta(currentStatus)

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/45 px-4 py-6">
      <section className="max-h-[calc(100vh-2rem)] w-full max-w-[980px] overflow-y-auto rounded-lg bg-white shadow-2xl">
        <header className="flex justify-between border-b px-5 py-4">
          <h2 className="text-[16px] font-bold text-slate-800">발주 상세 정보</h2>

          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={17} />
          </button>
        </header>

        <div className="space-y-4 px-5 py-4 text-[13px] text-slate-600">
          <div className="flex justify-between items-center rounded-md border bg-slate-50 px-4 py-3">
            <strong className="text-blue-600 font-bold text-[15px]">
              {order.orderNo || order.orderNumber || `- (ID: ${order.orderId})`}
            </strong>

            <span
              className={`rounded-full border px-2.5 py-1 text-[12px] font-semibold ${statusMeta.badgeClassName}`}
            >
              {statusMeta.label}
            </span>
          </div>

          <dl className="grid gap-4 md:grid-cols-2 bg-white p-2">
            <div className="border-b border-slate-50 pb-2">
              <dt className="text-[12px] font-semibold text-slate-400 mb-0.5">구매 요청 번호</dt>
              <dd className="font-medium text-slate-800">{order.requestNo || order.requestNumber || "-"}</dd>
            </div>

            <div className="border-b border-slate-50 pb-2">
              <dt className="text-[12px] font-semibold text-slate-400 mb-0.5">공급업체</dt>
              <dd className="font-medium text-slate-800">{order.supplierName || "-"}</dd>
            </div>

            <div>
              <dt className="text-[12px] text-slate-400">발주 담당자</dt>
              <dd>{order.orderManager || order.userName || "-"}</dd>
            </div>

            <div>
              <dt className="text-[12px] text-slate-400">발주 담당자 연락처</dt>
              <dd className="font-medium text-slate-800">{order.orderManagerPhone || "-"}</dd>
            </div>

            <div className="border-b border-slate-50 pb-2">
              <dt className="text-[12px] font-semibold text-slate-400 mb-0.5">입고 예정일</dt>
              <dd className="font-medium text-slate-800">
                {order.expectedInboundFrom && order.expectedInboundTo 
                  ? `${order.expectedInboundFrom} ~ ${order.expectedInboundTo}`
                  : (order.dueDate ? String(order.dueDate).slice(0, 10) : "-")}
              </dd>
            </div>

            <div className="border-b border-slate-50 pb-2">
              <dt className="text-[12px] font-semibold text-slate-400 mb-0.5">입고 창고</dt>
              <dd className="font-medium text-slate-800">
                {order.warehouseName || (order.warehouseCode ? `창고 코드: ${order.warehouseCode}` : "일반 창고")}
              </dd>
            </div>

            <div className="border-b border-slate-50 pb-2">
              <dt className="text-[12px] font-semibold text-slate-400 mb-0.5">총 발주 금액</dt>
              <dd className="font-bold text-[16px] text-blue-600">
                {formatWon(order.totalAmount)}
              </dd>
            </div>
          </dl>

          {order.memo && (
            <div className="rounded-md border border-slate-100 bg-slate-50/50 px-4 py-2.5 mt-2">
              <dt className="text-[12px] font-semibold text-slate-400 mb-1">비고 / 특이사항</dt>
              <dd className="text-slate-700 whitespace-pre-wrap">{order.memo}</dd>
            </div>
          )}

          {error && <p className="text-rose-500 font-medium">{error}</p>}
        </div>

        <footer className="flex justify-between border-t bg-slate-50 px-5 py-3">
          <div>
            {canCancelPurchaseOrder(currentStatus) && (
              <button
                type="button"
                onClick={() => onCancel(order)}
                className="flex h-10 items-center gap-1.5 rounded-md border border-rose-200 bg-white px-4 text-[13px] font-semibold text-rose-600 transition hover:bg-rose-50"
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
              className="h-10 rounded-md border border-slate-200 bg-white px-4 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              닫기
            </button>

            {canEditPurchaseOrder(currentStatus) && (
              <button
                type="button"
                onClick={() => onEdit(order)}
                className="flex h-10 items-center gap-1.5 rounded-md bg-blue-600 px-4 text-[13px] font-semibold text-white transition hover:bg-blue-700"
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
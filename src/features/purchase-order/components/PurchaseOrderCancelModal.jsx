"use client"

import { useState } from "react"
import { Ban, X } from "lucide-react"

export default function PurchaseOrderCancelModal({
  order,
  submitting,
  error,
  onClose,
  onConfirm,
}) {
  const [cancelReason, setCancelReason] = useState("")

  if (!order) {
    return null
  }

  function submitCancel(event) {
    event.preventDefault()

    if (!cancelReason.trim()) {
      return
    }

    onConfirm(cancelReason)
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/50 px-4">
      <section className="w-full max-w-[520px] rounded-lg border border-slate-200 bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b px-5 py-4">
          <div className="flex items-center gap-2">
            <Ban size={18} className="text-rose-500" />

            <h2 className="text-[16px] font-bold text-slate-800">발주 취소</h2>
          </div>

          <button type="button" onClick={onClose}>
            <X size={17} />
          </button>
        </header>

        <form onSubmit={submitCancel}>
          <div className="space-y-4 px-5 py-4">
            <p className="rounded-md bg-rose-50 px-3 py-2 text-[13px] text-rose-700">
              {order.orderNumber} 발주를 취소 상태로 변경합니다.
            </p>

            <textarea
              value={cancelReason}
              onChange={(event) => setCancelReason(event.target.value)}
              rows={4}
              placeholder="취소 사유를 입력하세요."
              className="w-full resize-none rounded-md border border-slate-200 px-3 py-2 text-[13px] outline-none focus:border-blue-400"
            />

            {error && <p className="text-[13px] text-rose-500">{error}</p>}
          </div>

          <footer className="flex justify-end gap-2 border-t bg-slate-50 px-5 py-3">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-md border bg-white px-4 text-[13px]"
            >
              닫기
            </button>

            <button
              type="submit"
              disabled={submitting || !cancelReason.trim()}
              className="h-10 rounded-md bg-rose-600 px-4 text-[13px] font-semibold text-white disabled:opacity-50"
            >
              {submitting ? "처리 중..." : "발주 취소 확정"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  )
}

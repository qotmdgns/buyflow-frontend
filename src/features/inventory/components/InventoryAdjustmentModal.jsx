"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { formatNumber } from "@/features/inventory/utils/inventoryManagementUtils"

const INPUT_CLASS_NAME =
  "h-10 w-full rounded-md border border-slate-200 px-3 text-[14px] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"

export default function InventoryAdjustmentModal({
  inventory,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState({
    adjustmentType: "increase",
    quantity: "",
    reason: "",
  })

  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const quantity = Number(form.quantity) || 0

  const afterStock =
    form.adjustmentType === "increase"
      ? inventory.currentStock + quantity
      : inventory.currentStock - quantity

  function updateForm(name, value) {
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError("")

    if (!Number.isInteger(quantity) || quantity <= 0) {
      setError("조정 수량은 1 이상의 정수로 입력하세요.")
      return
    }

    if (afterStock < 0) {
      setError("현재 재고보다 많은 수량을 차감할 수 없습니다.")
      return
    }

    if (!form.reason.trim()) {
      setError("재고 조정 사유를 입력하세요.")
      return
    }

    setSubmitting(true)

    try {
      await onSubmit(form)
    } catch (requestError) {
      setError(requestError.message || "재고 조정에 실패했습니다.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <section className="w-full max-w-lg overflow-hidden rounded-lg bg-white shadow-xl">
        <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-[17px] font-bold text-slate-900">
              재고 수량 조정
            </h2>

            <p className="mt-1 text-[12px] text-slate-400">
              조정 결과는 재고 이력에 자동으로 기록됩니다.
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

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div className="rounded-md bg-slate-50 p-3 text-[13px]">
            <p className="font-semibold text-slate-800">{inventory.itemName}</p>

            <p className="mt-1 text-slate-500">
              {inventory.itemCode} · {inventory.warehouseName}
            </p>

            <p className="mt-1 text-slate-500">
              현재 재고:{" "}
              <strong className="text-slate-800">
                {formatNumber(inventory.currentStock)} {inventory.unit}
              </strong>
            </p>
          </div>

          <label className="block">
            <span className="mb-1 block text-[13px] font-semibold text-slate-600">
              조정 유형
            </span>

            <select
              value={form.adjustmentType}
              onChange={(event) =>
                updateForm("adjustmentType", event.target.value)
              }
              className={`${INPUT_CLASS_NAME} bg-white`}
            >
              <option value="increase">수량 증가</option>
              <option value="decrease">수량 감소</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-[13px] font-semibold text-slate-600">
              조정 수량
            </span>

            <input
              type="number"
              min="1"
              step="1"
              value={form.quantity}
              onChange={(event) => updateForm("quantity", event.target.value)}
              placeholder="수량을 입력하세요"
              className={INPUT_CLASS_NAME}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-[13px] font-semibold text-slate-600">
              조정 사유
            </span>

            <textarea
              value={form.reason}
              onChange={(event) => updateForm("reason", event.target.value)}
              placeholder="예: 실물 재고 확인 결과 2개 파손"
              className="min-h-24 w-full resize-none rounded-md border border-slate-200 px-3 py-2 text-[14px] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <div className="rounded-md border border-blue-100 bg-blue-50 p-3 text-[13px] text-blue-700">
            조정 후 예상 재고:{" "}
            <strong>
              {formatNumber(afterStock)} {inventory.unit}
            </strong>
          </div>

          {error && (
            <p className="text-[13px] font-semibold text-rose-500">{error}</p>
          )}

          <footer className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-md border border-slate-200 bg-white px-4 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              취소
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="h-10 rounded-md bg-blue-600 px-4 text-[13px] font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "처리 중..." : "재고 조정"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  )
}

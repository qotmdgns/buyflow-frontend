"use client"

import { X } from "lucide-react"
import { formatWon } from "@/features/purchase-order/utils/purchaseOrderUtils"

export default function PurchaseOrderItemSelectModal({
  requestItems = [],
  selectedIds,
  onToggle,
  onClose,
  onConfirm,
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/45 px-4">
      <section className="w-full max-w-[980px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-[16px] font-bold text-slate-800">
              발주 품목 선택
            </h2>
            <p className="mt-1 text-[13px] text-slate-400">
              승인 완료된 구매 요청에 포함된 품목만 선택할 수 있습니다.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="창 닫기"
          >
            <X size={16} />
          </button>
        </header>

        <div className="max-h-[460px] overflow-auto">
          <table className="w-full min-w-[820px] text-left text-[13px]">
            <thead className="sticky top-0 bg-slate-50 text-slate-500">
              <tr>
                <th className="w-14 px-4 py-3 text-center">선택</th>
                <th className="px-3 py-3">품목 코드</th>
                <th className="px-3 py-3">품목명</th>
                <th className="px-3 py-3">규격</th>
                <th className="px-3 py-3 text-right">요청 수량</th>
                <th className="px-3 py-3">단위</th>
                <th className="px-3 py-3 text-right">기준 단가</th>
              </tr>
            </thead>

            <tbody>
              {requestItems.map((item) => {
                const currentId = item.requestItemId || item.id;

                return (
                  <tr
                    key={currentId}
                    className="border-t border-slate-100 text-slate-600"
                  >
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(Number(currentId))}
                        onChange={() => onToggle(Number(currentId))}
                        className="h-4 w-4 accent-blue-600 cursor-pointer"
                      />
                    </td>

                    <td className="whitespace-nowrap px-3 py-3 font-semibold text-blue-600">
                      {item.itemCode}
                    </td>

                    <td className="px-3 py-3 font-medium text-slate-700">
                      {item.itemName}
                    </td>

                    <td className="px-3 py-3 text-slate-500">
                      {item.specification}
                    </td>

                    <td className="px-3 py-3 text-right">
                      {item.requestQuantity || item.requestedQuantity}
                    </td>

                    <td className="px-3 py-3">{item.unit}</td>

                    <td className="px-3 py-3 text-right">
                      {formatWon(item.estimatedUnitPrice || item.defaultUnitPrice || 0)}
                    </td>
                  </tr>
                );
              })}

              {requestItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="h-32 text-center text-slate-400">
                    선택 가능한 구매 요청 품목이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <footer className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-5 py-3">
          <p className="text-[13px] text-slate-500">
            선택한 품목
            <strong className="ml-1 text-blue-600">{selectedIds.size}건</strong>
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-md border border-slate-200 bg-white px-4 text-[13px] font-semibold text-slate-600 hover:bg-slate-50"
            >
              취소
            </button>

            <button
              type="button"
              onClick={onConfirm}
              className="h-10 rounded-md bg-blue-600 px-4 text-[13px] font-semibold text-white hover:bg-blue-700"
            >
              선택 완료
            </button>
          </div>
        </footer>
      </section>
    </div>
  )
}
import { Plus, Trash2 } from "lucide-react"
import { formatWon } from "@/features/purchase-request/utils/purchaseRequestUtils"

function EmptyItems() {
  return (
    <div className="flex min-h-36 items-center justify-center border-t border-slate-100 text-[11px] text-slate-400">
      품목 추가 버튼을 눌러 구매 요청 품목을 선택해 주세요.
    </div>
  )
}

export default function PurchaseRequestItemSection({
  items,
  totalAmount,
  onOpenItemModal,
  onChangeQuantity,
  onRemoveItem,
}) {
  return (
    <section className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-4 w-1 rounded-full bg-blue-600" />

          <h2 className="text-[13px] font-bold text-slate-800">
            구매 요청 품목
          </h2>
        </div>

        <button
          type="button"
          onClick={onOpenItemModal}
          className="flex h-8 items-center gap-1 rounded-md bg-blue-600 px-3 text-[11px] font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus size={13} />
          품목 추가
        </button>
      </div>

      {items.length === 0 ? (
        <EmptyItems />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left text-[10px]">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                {[
                  "품목 코드",
                  "품목명",
                  "카테고리",
                  "규격",
                  "단위",
                  "요청 수량",
                  "기준 단가",
                  "요청 금액",
                  "",
                ].map((heading) => (
                  <th
                    key={heading || "actions"}
                    className="whitespace-nowrap px-4 py-3 font-medium"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="border-t border-slate-100 text-slate-600 hover:bg-slate-50/60"
                >
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-blue-600">
                    {item.code}
                  </td>

                  <td className="min-w-48 px-4 py-3 font-medium text-slate-700">
                    {item.name}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3">
                    {item.category}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                    {item.spec}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3">{item.unit}</td>

                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(event) =>
                        onChangeQuantity(item.id, event.target.value)
                      }
                      className="h-8 w-20 rounded-md border border-slate-200 px-2 text-right text-[11px] outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    {formatWon(item.unitPrice)}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-slate-700">
                    {formatWon(item.unitPrice * item.quantity)}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      aria-label={`${item.name} 삭제`}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-4">
        <p className="text-[11px] text-slate-500">
          총 품목 수
          <strong className="ml-1 text-blue-600">{items.length}건</strong>
        </p>

        <p className="text-[12px] font-semibold text-slate-700">
          총 요청 금액
          <strong className="ml-2 text-[20px] text-blue-600">
            {formatWon(totalAmount)}
          </strong>
        </p>
      </div>
    </section>
  )
}

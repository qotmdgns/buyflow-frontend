"use client"

import { CircleAlert, FileUp, PackageCheck, Save } from "lucide-react"

import { formatNumber } from "@/features/inbound/utils/inboundUtils"

const INPUT_CLASS_NAME =
  "h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-[13px] text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"

function FieldLabel({ children, required = false }) {
  return (
    <span className="mb-1 block text-[13px] font-semibold text-slate-600">
      {children}
      {required && <span className="ml-0.5 text-rose-500">*</span>}
    </span>
  )
}

function FieldError({ message }) {
  if (!message) {
    return null
  }

  return <p className="mt-1 text-[12px] font-medium text-rose-500">{message}</p>
}

export default function InboundForm({
  options,
  form,
  items,
  attachment,
  errors,
  submitError,
  loading,
  submitting,
  summary,
  onChange,
  onChangeOrder,
  onChangeItemQuantity,
  onFillAllRemainingQuantities,
  onChangeAttachment,
  onCancel,
  onSave,
}) {
  return (
    <div className="w-full">
      <header className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[22px] font-bold text-slate-900">입고 등록</h1>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="h-10 rounded-md border border-slate-200 bg-white px-4 text-[13px] font-semibold text-slate-600 hover:bg-slate-50"
          >
            취소
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={loading || submitting}
            className="flex h-10 items-center gap-1.5 rounded-md bg-blue-600 px-4 text-[13px] font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save size={14} />
            {submitting ? "처리 중..." : "입고 확정"}
          </button>
        </div>
      </header>

      <section className="flex items-start gap-2 rounded-md border border-blue-100 bg-blue-50 px-4 py-3 text-[13px] text-blue-700">
        <CircleAlert size={15} className="mt-0.5 shrink-0" />

        <p>
          입고 예정, 납기 지연 또는 부분 입고 상태인 발주만 선택할 수 있습니다.
          품목별 금회 입고 수량을 입력하면 누적 입고량과 미입고량이 갱신됩니다.
        </p>
      </section>

      <section className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="text-[15px] font-bold text-slate-800">
            입고 기본정보
          </h2>
        </div>

        <div className="grid gap-x-8 gap-y-3 p-4 lg:grid-cols-2">
          <label className="block">
            <FieldLabel>입고 번호</FieldLabel>

            <input
              value={form.inboundNumber}
              disabled
              className={INPUT_CLASS_NAME}
            />
          </label>

          <label className="block">
            <FieldLabel required>발주 번호</FieldLabel>

            <select
              value={form.targetInboundId}
              onChange={(event) => onChangeOrder(event.target.value)}
              className={INPUT_CLASS_NAME}
              disabled={loading}
            >
              <option value="">입고 처리할 발주 선택</option>

              {options.eligibleOrders.map((order) => (
                <option key={order.id} value={order.id}>
                  {order.orderNumber} / {order.supplierName} / 미입고{" "}
                  {formatNumber(order.remainingQuantity)}
                </option>
              ))}
            </select>

            <FieldError message={errors.targetInboundId} />
          </label>

          <label className="block">
            <FieldLabel>공급업체</FieldLabel>

            <input
              value={form.supplierName}
              disabled
              className={INPUT_CLASS_NAME}
            />
          </label>

          <label className="block">
            <FieldLabel>입고 창고</FieldLabel>

            <input
              value={form.warehouseName}
              disabled
              className={INPUT_CLASS_NAME}
            />
          </label>

          <label className="block">
            <FieldLabel required>실제 입고일</FieldLabel>

            <input
              type="date"
              value={form.receivedAt}
              onChange={(event) => onChange("receivedAt", event.target.value)}
              className={INPUT_CLASS_NAME}
            />

            <FieldError message={errors.receivedAt} />
          </label>

          <label className="block">
            <FieldLabel required>입고 담당자</FieldLabel>

            <input
              value={form.receiverName}
              onChange={(event) => onChange("receiverName", event.target.value)}
              placeholder="입고 담당자 입력"
              className={INPUT_CLASS_NAME}
            />

            <FieldError message={errors.receiverName} />
          </label>

          <label className="block lg:col-span-2">
            <FieldLabel>첨부파일</FieldLabel>

            <span className="flex min-h-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-slate-200 px-3 py-3 text-center text-[13px] text-slate-400 hover:bg-slate-50">
              <FileUp size={18} />

              <span>
                {attachment?.name ??
                  "거래명세서 또는 입고 증빙 파일을 업로드하세요."}
              </span>

              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.xlsx,.xls"
                className="hidden"
                onChange={onChangeAttachment}
              />
            </span>
          </label>

          <label className="block lg:col-span-2">
            <FieldLabel>비고</FieldLabel>

            <textarea
              value={form.memo}
              onChange={(event) => onChange("memo", event.target.value)}
              rows={3}
              placeholder="입고 관련 참고사항을 입력하세요."
              className="w-full resize-y rounded-md border border-slate-200 bg-white px-3 py-2 text-[13px] outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </label>
        </div>
      </section>

      <section className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
          <div>
            <h2 className="text-[15px] font-bold text-slate-800">입고 품목</h2>
            <FieldError message={errors.items} />
          </div>

          <button
            type="button"
            onClick={onFillAllRemainingQuantities}
            disabled={!items.length}
            className="flex h-9 items-center gap-1.5 rounded-md border border-blue-200 bg-white px-3 text-[13px] font-semibold text-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <PackageCheck size={14} />
            잔량 전체 입력
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] text-left text-[13px]">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                {[
                  "번호",
                  "품목 코드",
                  "품목명",
                  "규격",
                  "발주 수량",
                  "누적 입고",
                  "미입고",
                  "금회 입고",
                  "입고 후 잔량",
                  "단위",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="whitespace-nowrap px-3 py-3 font-semibold"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {!items.length && (
                <tr>
                  <td colSpan={10} className="h-32 text-center text-slate-400">
                    발주 번호를 선택하면 입고 가능한 품목이 표시됩니다.
                  </td>
                </tr>
              )}

              {items.map((item, index) => {
                const afterRemaining =
                  item.remainingQuantity - item.currentReceivedQuantity

                return (
                  <tr
                    key={item.orderItemId}
                    className="border-t border-slate-100 text-slate-600"
                  >
                    <td className="px-3 py-2.5 text-center">{index + 1}</td>

                    <td className="whitespace-nowrap px-3 py-2.5 font-semibold text-blue-600">
                      {item.itemCode}
                    </td>

                    <td className="px-3 py-2.5">{item.itemName}</td>

                    <td className="px-3 py-2.5">{item.specification}</td>

                    <td className="px-3 py-2.5 text-right">
                      {formatNumber(item.orderQuantity)}
                    </td>

                    <td className="px-3 py-2.5 text-right">
                      {formatNumber(item.cumulativeReceivedQuantity)}
                    </td>

                    <td className="px-3 py-2.5 text-right font-semibold text-amber-600">
                      {formatNumber(item.remainingQuantity)}
                    </td>

                    <td className="px-3 py-2.5">
                      <input
                        type="number"
                        min="0"
                        max={item.remainingQuantity}
                        value={item.currentReceivedQuantity}
                        onChange={(event) =>
                          onChangeItemQuantity(
                            item.orderItemId,
                            event.target.value,
                          )
                        }
                        className="h-9 w-24 rounded-md border border-slate-200 px-2 text-right outline-none focus:border-blue-400"
                      />
                    </td>

                    <td className="px-3 py-2.5 text-right font-semibold text-slate-700">
                      {formatNumber(afterRemaining)}
                    </td>

                    <td className="px-3 py-2.5">{item.unit}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end border-t border-slate-100 px-5 py-4">
          <dl className="w-full max-w-xs space-y-2 text-[13px]">
            <div className="flex justify-between">
              <dt>금회 입고 수량</dt>

              <dd className="font-semibold text-blue-600">
                {formatNumber(summary.currentReceivedQuantity)}
              </dd>
            </div>

            <div className="flex justify-between border-t pt-3">
              <dt className="font-bold">입고 후 미입고 수량</dt>

              <dd className="font-bold text-amber-600">
                {formatNumber(summary.afterRemainingQuantity)}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {submitError && (
        <p className="mt-3 rounded-md bg-rose-50 px-4 py-3 text-[13px] font-medium text-rose-600">
          {submitError}
        </p>
      )}
    </div>
  )
}

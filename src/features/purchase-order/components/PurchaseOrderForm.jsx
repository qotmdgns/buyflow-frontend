"use client"

import { CircleAlert, FileUp, Plus, Save, Send, Trash2 } from "lucide-react"
import PurchaseOrderItemSelectModal from "@/features/purchase-order/components/PurchaseOrderItemSelectModal"
import {
  calculatePurchaseOrderLine,
  formatWon,
  getPurchaseOrderStatusMeta,
} from "@/features/purchase-order/utils/purchaseOrderUtils"

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
  if (!message) return null
  return <p className="mt-1 text-[12px] font-medium text-rose-500">{message}</p>
}

function StatusBadge({ status }) {
  const meta = getPurchaseOrderStatusMeta(status)
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[12px] font-semibold ${meta.badgeClassName}`}
    >
      {meta.label}
    </span>
  )
}

export default function PurchaseOrderForm({
  mode,
  form,
  options,
  items,
  attachment,
  errors,
  submitError,
  submitting,
  summary,
  editable = true,
  editableCoreFields = true,
  isItemModalOpen = false,
  draftSelectedItemIds = new Set(),
  availableRequestItems = [],
  onChange,
  onChangeSupplier,
  onApplyPurchaseRequest,
  onChangeItemValue,
  onRemoveItem,
  onChangeAttachment,
  onCancel,
  onSave,
  openItemModal,
  closeItemModal,
  toggleDraftItem,
  confirmSelectedItems,
}) {
  const isEditMode = mode === "edit"

  return (
    <div className="w-full">
      <header className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[22px] font-bold text-slate-900">
          {isEditMode ? "발주 수정" : "발주 등록"}
        </h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="h-10 rounded-md border border-slate-200 bg-white px-4 text-[13px] font-semibold text-slate-600 hover:bg-slate-50"
          >
            취소
          </button>
          {editable && (
            <button
              type="button"
              onClick={() => onSave("DRAFT")}
              disabled={submitting}
              className="flex h-10 items-center gap-1.5 rounded-md border border-blue-200 bg-white px-4 text-[13px] font-semibold text-blue-600 hover:bg-blue-50 disabled:opacity-50"
            >
              <Save size={14} />
              저장
            </button>
          )}
          {editableCoreFields && (
            <button
              type="button"
              onClick={() => onSave("CONFIRMED")}
              disabled={submitting}
              className="flex h-10 items-center gap-1.5 rounded-md bg-blue-600 px-4 text-[13px] font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <Send size={14} />
              발주 확정
            </button>
          )}
        </div>
      </header>

      <section className="flex items-start gap-2 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] text-slate-500">
        <CircleAlert size={15} className="mt-0.5 shrink-0 text-slate-500" />
        <div>
          <p className="font-semibold text-slate-700">안내사항</p>
          <p className="mt-0.5">
            {form.status === "CONFIRMED"
              ? "발주 확정 상태에서는 입고 예정일, 입고 창고, 첨부파일, 비고만 수정할 수 있습니다."
              : "승인 완료된 구매 요청을 기반으로 발주서를 생성합니다."}
          </p>
        </div>
      </section>

      <section className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="text-[15px] font-bold text-slate-800">
            발주 기본정보
          </h2>
        </div>
        <div className="grid gap-x-8 gap-y-3 p-4 lg:grid-cols-2">
          <div className="space-y-3">
            <label className="block">
              <FieldLabel>발주 번호</FieldLabel>
              <input
                placeholder="[저장 시 시스템에서 자동 번호 부여]"
                disabled
                className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-[13px] text-blue-500 font-semibold outline-none cursor-not-allowed placeholder:text-blue-500/70"
              />
            </label>

            <label className="block">
              <FieldLabel required>구매 요청 번호</FieldLabel>
              <select
                value={form.requestId || ""}
                onChange={(event) => onApplyPurchaseRequest(event.target.value)}
                disabled={!editableCoreFields}
                className={INPUT_CLASS_NAME}
              >
                <option value="">승인 완료 구매 요청 선택</option>
                {options.approvedPurchaseRequests.map((request, index) => (
                  <option key={request.id || index} value={request.id}>
                    {request.requestNumber} / {request.title}
                  </option>
                ))}
              </select>
              <FieldError message={errors.requestId} />
            </label>

            <label className="block">
              <FieldLabel>구매 요청 제목</FieldLabel>
              <input
                value={form.requestTitle || ""}
                disabled
                className={INPUT_CLASS_NAME}
              />
            </label>

            <label className="block">
              <FieldLabel required>공급업체</FieldLabel>
              <select
                value={form.supplierId || ""}
                onChange={(event) => onChangeSupplier(event.target.value)}
                disabled={!editableCoreFields}
                className={INPUT_CLASS_NAME}
              >
                <option value="">공급업체 선택</option>
                {options.suppliers?.map((supplier, index) => {
                  if (typeof supplier === "string") {
                    return (
                      <option key={`supplier-opt-${index}`} value={supplier}>
                        {supplier}
                      </option>
                    )
                  }
                  const sId = supplier.supplierId || supplier.id || index

                  const sName =
                    supplier.supplierName ||
                    supplier.suppliername ||
                    supplier.name ||
                    supplier.nameKo ||
                    supplier.supplierCode ||
                    `공급업체(${sId})`

                  return (
                    <option key={`supplier-opt-${sId}`} value={sId}>
                      {sName}
                    </option>
                  )
                })}
              </select>
              <FieldError
                message={errors.supplierName || errors.supplierCode}
              />
            </label>

            <label className="block">
              <FieldLabel>공급업체 담당자</FieldLabel>
              <input
                value={form.manager || ""}
                disabled
                className={INPUT_CLASS_NAME}
              />
            </label>

            <label className="block">
              <FieldLabel>담당자 연락처</FieldLabel>
              <input
                value={form.supplierContact || ""}
                disabled
                className={INPUT_CLASS_NAME}
              />
            </label>
          </div>

          <div className="space-y-3">
            <div>
              <FieldLabel>발주 상태</FieldLabel>
              <StatusBadge status={form.status} />
            </div>
            <label className="block">
              <FieldLabel required>발주 담당자</FieldLabel>
              <input
                value={form.orderManager || ""}
                onChange={(event) =>
                  onChange("orderManager", event.target.value)
                }
                disabled={!editableCoreFields}
                className={INPUT_CLASS_NAME}
              />
              <FieldError message={errors.orderManager} />
            </label>

            <label className="block">
              <FieldLabel>발주일</FieldLabel>
              <input
                type="date"
                value={form.orderedAt || ""}
                disabled
                className={INPUT_CLASS_NAME}
              />
            </label>

            <div>
              <FieldLabel required>입고 예정일</FieldLabel>
              <div className="grid grid-cols-[minmax(0,1fr)_12px_minmax(0,1fr)] items-center gap-1">
                <input
                  type="date"
                  value={form.expectedReceiptFrom || ""}
                  onChange={(event) =>
                    onChange("expectedReceiptFrom", event.target.value)
                  }
                  disabled={!editable}
                  className={INPUT_CLASS_NAME}
                />
                <span className="text-center text-slate-300">~</span>
                <input
                  type="date"
                  value={form.expectedReceiptTo || ""}
                  onChange={(event) =>
                    onChange("expectedReceiptTo", event.target.value)
                  }
                  disabled={!editable}
                  className={INPUT_CLASS_NAME}
                />
              </div>
              <FieldError message={errors.expectedReceipt} />
            </div>

            <label className="block">
              <FieldLabel required>입고 창고</FieldLabel>
              <select
                value={form.warehouseCode || ""}
                onChange={(event) =>
                  onChange("warehouseCode", event.target.value)
                }
                disabled={!editable}
                className={INPUT_CLASS_NAME}
              >
                <option value="">입고 창고 선택</option>
                {options.warehouses.map((warehouse, index) => (
                  <option
                    key={warehouse.warehouseCode || index}
                    value={warehouse.warehouseCode}
                  >
                    {warehouse.warehouseName}
                  </option>
                ))}
              </select>
              <FieldError message={errors.warehouseCode} />
            </label>

            <label className="block">
              <FieldLabel>첨부파일</FieldLabel>
              <span className="flex min-h-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-slate-200 px-3 py-3 text-center text-[13px] text-slate-400 hover:bg-slate-50">
                <FileUp size={18} />
                <span>{attachment?.name ?? "파일을 클릭하여 업로드"}</span>
                <input
                  type="file"
                  className="hidden"
                  disabled={!editable}
                  onChange={onChangeAttachment}
                />
              </span>
            </label>
          </div>

          <label className="block lg:col-span-2">
            <FieldLabel>비고</FieldLabel>
            <textarea
              value={form.memo || ""}
              onChange={(event) => onChange("memo", event.target.value)}
              disabled={!editable}
              rows={3}
              className="w-full resize-y rounded-md border border-slate-200 bg-white px-3 py-2 text-[13px] outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
            />
          </label>
        </div>
      </section>

      <section className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div>
            <h2 className="text-[15px] font-bold text-slate-800">발주 품목</h2>
            <FieldError message={errors.items} />
          </div>
          {typeof openItemModal === "function" && editableCoreFields && (
            <button
              type="button"
              onClick={openItemModal}
              disabled={!form.requestId}
              className="flex h-9 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus size={14} />
              품목 추가
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1350px] text-left text-[13px]">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                {[
                  "번호",
                  "품목 코드",
                  "품목명",
                  "규격",
                  "요청 수량",
                  "발주 수량",
                  "단위",
                  "공급 단가",
                  "공급가액",
                  "부가세",
                  "합계 금액",
                  "삭제",
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
              {items.map((item, index) => {
                const line = calculatePurchaseOrderLine(item)
                return (
                  <tr
                    key={item.requestItemId || index}
                    className="border-t border-slate-100 text-slate-600"
                  >
                    <td className="px-3 py-2.5 text-center">{index + 1}</td>
                    <td className="px-3 py-2.5 font-semibold text-blue-600">
                      {item.itemCode}
                    </td>
                    <td className="px-3 py-2.5">{item.itemName}</td>
                    <td className="px-3 py-2.5">{item.specification}</td>
                    <td className="px-3 py-2.5 text-right">
                      {item.requestedQuantity}
                    </td>
                    <td className="px-3 py-2.5">
                      <input
                        type="number"
                        min="1"
                        value={item.orderQuantity || ""}
                        onChange={(event) =>
                          onChangeItemValue(
                            item.requestItemId,
                            "orderQuantity",
                            event.target.value,
                          )
                        }
                        disabled={!editableCoreFields}
                        className="h-9 w-20 rounded-md border border-slate-200 px-2 text-right disabled:bg-slate-50"
                      />
                    </td>
                    <td className="px-3 py-2.5">{item.unit}</td>
                    <td className="px-3 py-2.5">
                      <input
                        type="number"
                        min="0"
                        value={item.unitPrice || 0}
                        onChange={(event) =>
                          onChangeItemValue(
                            item.requestItemId,
                            "unitPrice",
                            event.target.value,
                          )
                        }
                        disabled={!editableCoreFields}
                        className="h-9 w-28 rounded-md border border-slate-200 px-2 text-right disabled:bg-slate-50"
                      />
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      {formatWon(line.supplyAmount)}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      {formatWon(line.vatAmount)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-semibold">
                      {formatWon(line.totalAmount)}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.requestItemId)}
                        disabled={!editableCoreFields}
                        className="text-slate-400 hover:text-rose-500 disabled:opacity-30"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end border-t border-slate-100 px-5 py-4">
          <dl className="w-full max-w-xs space-y-2 text-[13px]">
            <div className="flex justify-between">
              <dt>공급가액</dt>
              <dd>{formatWon(summary.supplyAmount)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>부가세 (10%)\</dt>
              <dd>{formatWon(summary.vatAmount)}</dd>
            </div>
            <div className="flex justify-between border-t pt-3">
              <dt className="font-bold">총 발주 금액</dt>
              <dd className="text-[20px] font-bold text-blue-600">
                {formatWon(summary.totalAmount)}
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
      {isItemModalOpen && (
        <PurchaseOrderItemSelectModal
          requestItems={availableRequestItems}
          selectedIds={draftSelectedItemIds}
          onToggle={toggleDraftItem}
          onClose={closeItemModal}
          onConfirm={confirmSelectedItems}
        />
      )}
    </div>
  )
}

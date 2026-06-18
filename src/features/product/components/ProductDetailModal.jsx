"use client"

import { useEffect } from "react"
import {
  Barcode,
  Boxes,
  CircleAlert,
  Package,
  Pencil,
  Tag,
  Warehouse,
  X,
} from "lucide-react"
import { warehouseOptions } from "@/features/product/data/productCreateOptions"
import { formatWon } from "@/features/product/utils/productManagementUtils"

function ActiveStatusBadge({ isActive }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[12px] font-semibold ${
        isActive
          ? "bg-emerald-50 text-emerald-600"
          : "bg-slate-100 text-slate-500"
      }`}
    >
      {isActive ? "사용" : "미사용"}
    </span>
  )
}

function StockStatusBadge({ isLowStock }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[12px] font-semibold ${
        isLowStock ? "bg-rose-50 text-rose-500" : "bg-blue-50 text-blue-600"
      }`}
    >
      {isLowStock ? "안전재고 미만" : "정상"}
    </span>
  )
}

function DetailItem({ label, value, icon: Icon }) {
  return (
    <div>
      <p className="text-[12px] font-semibold text-slate-400">{label}</p>

      <div className="mt-1 flex min-h-10 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] text-slate-700">
        {Icon && <Icon size={14} className="shrink-0 text-slate-400" />}
        <span>{value ?? "-"}</span>
      </div>
    </div>
  )
}

function StockCard({ label, value, emphasize = false }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-[12px] font-semibold text-slate-400">{label}</p>

      <p
        className={`mt-1 text-[18px] font-bold ${
          emphasize ? "text-rose-500" : "text-slate-800"
        }`}
      >
        {Number(value ?? 0).toLocaleString("ko-KR")}
      </p>
    </div>
  )
}

function getWarehouseName(setting) {
  if (setting.warehouseName) {
    return setting.warehouseName
  }

  return (
    warehouseOptions.find(
      (warehouse) => warehouse.value === setting.warehouseCode,
    )?.label ??
    setting.warehouseCode ??
    "-"
  )
}

function WarehouseSettingTable({ settings }) {
  return (
    <div className="overflow-x-auto rounded-md border border-slate-200">
      <table className="w-full min-w-[700px] text-left text-[13px]">
        <thead className="bg-slate-50 text-slate-500">
          <tr>
            {[
              "창고명",
              "보관 위치 (Loc)",
              "현재 재고",
              "안전재고",
              "재주문 기준",
            ].map((heading) => (
              <th key={heading} className="px-3 py-2.5 font-semibold">
                {heading}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {settings.length === 0 ? (
            <tr>
              <td colSpan={5} className="h-20 text-center text-slate-400">
                등록된 창고별 재고 기준이 없습니다.
              </td>
            </tr>
          ) : (
            settings.map((setting, index) => {
              const currentStock = Number(setting.currentStock ?? 0)
              const safetyStock = Number(setting.safetyStock ?? 0)
              const isLowStock = currentStock < safetyStock

              return (
                <tr
                  key={`${setting.warehouseCode ?? "warehouse"}-${index}`}
                  className="border-t border-slate-100 text-slate-600"
                >
                  <td className="min-w-[170px] px-3 py-2.5 font-medium text-slate-700">
                    {getWarehouseName(setting)}
                  </td>

                  <td className="whitespace-nowrap px-3 py-2.5">
                    {setting.locationCode || "-"}
                  </td>

                  <td
                    className={`whitespace-nowrap px-3 py-2.5 font-semibold ${
                      isLowStock ? "text-rose-500" : "text-slate-700"
                    }`}
                  >
                    {currentStock.toLocaleString("ko-KR")}
                  </td>

                  <td className="whitespace-nowrap px-3 py-2.5">
                    {safetyStock.toLocaleString("ko-KR")}
                  </td>

                  <td className="whitespace-nowrap px-3 py-2.5">
                    {Number(setting.reorderPoint ?? 0).toLocaleString("ko-KR")}
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}

export default function ProductDetailModal({ open, product, onClose, onEdit }) {
  useEffect(() => {
    if (!open) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    function handleEscape(event) {
      if (event.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener("keydown", handleEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", handleEscape)
    }
  }, [open, onClose])

  if (!open || !product) {
    return null
  }

  const currentStock = Number(product.currentStock ?? 0)
  const safetyStock = Number(product.safetyStock ?? 0)
  const isLowStock = currentStock < safetyStock
  const warehouseSettings = product.warehouseSettings ?? []

  return (
    <div
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/45 px-4 py-6 backdrop-blur-[1px]"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label="품목 상세 정보"
        className="max-h-[calc(100vh-2rem)] w-full max-w-[900px] overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <Package size={18} className="text-blue-600" />

            <h2 className="text-[16px] font-bold text-slate-800">
              품목 상세 정보
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={17} />
          </button>
        </header>

        <div className="space-y-5 px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
            <div>
              <p className="text-[12px] font-semibold text-slate-400">
                품목 코드
              </p>

              <p className="mt-1 text-[16px] font-bold text-blue-600">
                {product.code}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <StockStatusBadge isLowStock={isLowStock} />
              <ActiveStatusBadge isActive={product.isActive} />
            </div>
          </div>

          <section>
            <h3 className="mb-3 border-l-[3px] border-blue-500 pl-2 text-[14px] font-bold text-slate-800">
              기본 정보
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <DetailItem label="품목명" value={product.name} icon={Package} />
              <DetailItem
                label="카테고리"
                value={product.category}
                icon={Tag}
              />
              <DetailItem label="규격" value={product.spec} />
              <DetailItem label="단위" value={product.unit} />
              <DetailItem
                label="기준 단가"
                value={formatWon(product.unitPrice)}
              />
              <DetailItem label="제조사" value={product.manufacturer} />
              <DetailItem
                label="바코드"
                value={product.barcode}
                icon={Barcode}
              />
              <DetailItem label="등록일" value={product.registeredAt} />
            </div>
          </section>

          <section>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="border-l-[3px] border-blue-500 pl-2 text-[14px] font-bold text-slate-800">
                재고 정보
              </h3>

              {isLowStock && (
                <p className="flex items-center gap-1 text-[12px] font-semibold text-rose-500">
                  <CircleAlert size={13} />
                  현재 재고가 안전재고보다 부족합니다.
                </p>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <StockCard
                label="현재 재고"
                value={currentStock}
                emphasize={isLowStock}
              />

              <StockCard label="안전재고" value={safetyStock} />

              <StockCard
                label="가용 재고 차이"
                value={currentStock - safetyStock}
                emphasize={isLowStock}
              />
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center gap-2">
              <Warehouse size={15} className="text-blue-600" />

              <h3 className="text-[14px] font-bold text-slate-800">
                창고별 재고 기준
              </h3>
            </div>

            <WarehouseSettingTable settings={warehouseSettings} />
          </section>

          <section>
            <h3 className="mb-3 flex items-center gap-2 text-[14px] font-bold text-slate-800">
              <Boxes size={15} className="text-blue-600" />
              비고
            </h3>

            <div className="min-h-20 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] leading-6 text-slate-600">
              {product.description || "등록된 비고가 없습니다."}
            </div>
          </section>
        </div>

        <footer className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-md border border-slate-200 bg-white px-4 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            닫기
          </button>

          <button
            type="button"
            onClick={() => onEdit(product)}
            className="flex h-10 items-center gap-1.5 rounded-md bg-blue-600 px-4 text-[13px] font-semibold text-white transition hover:bg-blue-700"
          >
            <Pencil size={14} />
            수정하기
          </button>
        </footer>
      </section>
    </div>
  )
}

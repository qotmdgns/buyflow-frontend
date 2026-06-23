"use client"

import { useEffect } from "react"
import {
  Building2,
  MapPin,
  Pencil,
  Phone,
  Trash2,
  UserRound,
  Warehouse,
  X,
} from "lucide-react"

function StatusBadge({ status }) {
  const isActive = status === "사용 중"

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[12px] font-semibold ${
        isActive ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-500"
      }`}
    >
      {status}
    </span>
  )
}

function DetailItem({ label, value, icon: Icon, fullWidth = false }) {
  return (
    <div className={fullWidth ? "md:col-span-2" : ""}>
      <p className="text-[12px] font-semibold text-slate-400">{label}</p>

      <div className="mt-1 flex min-h-10 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] text-slate-700">
        {Icon && <Icon size={14} className="shrink-0 text-slate-400" />}
        <span>{value || "-"}</span>
      </div>
    </div>
  )
}

export default function WarehouseDetailModal({
  open,
  warehouse,
  onClose,
  onEdit,
  onDelete,
}) {
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

  if (!open || !warehouse) {
    return null
  }

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
        aria-label="창고 상세 정보"
        className="w-full max-w-[680px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <Warehouse size={18} className="text-blue-600" />

            <h2 className="text-[16px] font-bold text-slate-800">
              창고 상세 정보
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

        <div className="space-y-4 px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
            <div>
              <p className="text-[12px] font-semibold text-slate-400">
                창고 코드
              </p>

              <p className="mt-1 text-[16px] font-bold text-blue-600">
                {warehouse.code}
              </p>
            </div>

            <StatusBadge status={warehouse.activeStatus} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <DetailItem
              label="창고명"
              value={warehouse.name}
              icon={Building2}
            />

            <DetailItem label="창고 유형" value={warehouse.type} />

            <DetailItem label="우편번호" value={warehouse.zipcode} />

            <DetailItem
              label="기본 주소"
              value={warehouse.baseAddress || warehouse.address}
              icon={MapPin}
              fullWidth
            />

            <DetailItem
              label="상세 주소"
              value={warehouse.detailAddress}
              fullWidth
            />

            <DetailItem
              label="담당자"
              value={warehouse.manager}
              icon={UserRound}
            />

            <DetailItem label="연락처" value={warehouse.phone} icon={Phone} />

            <DetailItem label="등록일" value={warehouse.registeredAt} />

            <DetailItem label="수정일" value={warehouse.updatedAt} />

            <DetailItem label="비고" value={warehouse.memo} fullWidth />
          </div>
        </div>

        <footer className="flex flex-wrap justify-between gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3">
          <button
            type="button"
            onClick={() => onDelete(warehouse)}
            className="flex h-10 items-center gap-1.5 rounded-md border border-rose-200 bg-white px-4 text-[13px] font-semibold text-rose-600 transition hover:bg-rose-50"
          >
            <Trash2 size={14} />
            삭제
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-md border border-slate-200 bg-white px-4 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              닫기
            </button>

            <button
              type="button"
              onClick={() => onEdit(warehouse)}
              className="flex h-10 items-center gap-1.5 rounded-md bg-blue-600 px-4 text-[13px] font-semibold text-white transition hover:bg-blue-700"
            >
              <Pencil size={14} />
              수정하기
            </button>
          </div>
        </footer>
      </section>
    </div>
  )
}

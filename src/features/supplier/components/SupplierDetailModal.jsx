"use client"

import { useEffect } from "react"
import {
  Building2,
  CalendarDays,
  FileText,
  Mail,
  MapPin,
  Pencil,
  Phone,
  UserRound,
  X,
} from "lucide-react"

function StatusBadge({ status }) {
  const isActive = status === "거래중"

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[12px] font-semibold ${
        isActive ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-500"
      }`}
    >
      {status || "-"}
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

export default function SupplierDetailModal({
  open,
  supplier,
  onClose,
  onEdit,
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

  if (!open || !supplier) {
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
        aria-label="공급업체 상세 정보"
        className="w-full max-w-[720px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <Building2 size={18} className="text-blue-600" />

            <h2 className="text-[16px] font-bold text-slate-800">
              공급업체 상세 정보
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
                공급업체 코드
              </p>

              <p className="mt-1 text-[16px] font-bold text-blue-600">
                {supplier.code}
              </p>
            </div>

            <StatusBadge status={supplier.tradeStatus} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <DetailItem
              label="공급업체명"
              value={supplier.name}
              icon={Building2}
            />

            <DetailItem
              label="사업자 등록번호"
              value={supplier.businessNumber}
              icon={FileText}
            />

            <DetailItem
              label="담당자"
              value={supplier.manager}
              icon={UserRound}
            />

            <DetailItem label="연락처" value={supplier.phone} icon={Phone} />

            <DetailItem label="이메일" value={supplier.email} icon={Mail} />

            <DetailItem
              label="등록일"
              value={supplier.registeredAt}
              icon={CalendarDays}
            />

            <DetailItem
              label="주소"
              value={supplier.address}
              icon={MapPin}
              fullWidth
            />
          </div>
        </div>

        <footer className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-md border border-slate-200 bg-white px-4 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            닫기
          </button>

          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(supplier)}
              className="flex h-10 items-center gap-1.5 rounded-md bg-blue-600 px-4 text-[13px] font-semibold text-white transition hover:bg-blue-700"
            >
              <Pencil size={14} />
              수정하기
            </button>
          )}
        </footer>
      </section>
    </div>
  )
}

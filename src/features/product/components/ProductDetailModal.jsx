"use client"

import { useEffect } from "react"
import { Boxes, Package, Pencil, Tag, X, Trash2 } from "lucide-react"
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

function DetailItem({ label, value, icon: Icon }) {
  return (
    <div>
      <p className="text-[12px] font-semibold text-slate-400">{label}</p>

      <div className="mt-1 flex min-h-10 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] text-slate-700">
        {Icon && <Icon size={14} className="shrink-0 text-slate-400" />}
        <span className="min-w-0 break-words">{value ?? "-"}</span>
      </div>
    </div>
  )
}

export default function ProductDetailModal({
  open,
  product,
  onClose,
  onEdit,
  onDelete,
  isDeleting = false,
}) {
  useEffect(() => {
    if (!open) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    function handleEscape(event) {
      if (event.key === "Escape" && !isDeleting) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", handleEscape)
    }
  }, [open, onClose, isDeleting])

  function handleDeleteClick() {
    if (!product) {
      return
    }

    onDelete?.(product)
  }

  if (!open || !product) {
    return null
  }

  return (
    <div
      role="presentation"
      onMouseDown={(event) => {
        if (isDeleting) {
          return
        }

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
            disabled={isDeleting}
            aria-label="닫기"
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
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
                label="업체명"
                value={product.companyName ?? product.manufacturer}
              />
              <DetailItem label="사업자등록번호" value={product.bizRegNo} />
              <DetailItem
                label="상위 카테고리"
                value={product.parentCategory}
              />
              <DetailItem label="원산지" value={product.origin} />
              <DetailItem
                label="경쟁 제품 여부"
                value={product.competingProduct === "Y" ? "Y" : "N"}
              />
              <DetailItem label="유효 시작일" value={product.validStartDate} />
              <DetailItem label="유효 종료일" value={product.validEndDate} />

              <DetailItem label="등록일" value={product.registeredAt} />
              <DetailItem label="수정일" value={product.updatedAt} />
            </div>
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

        <footer className="flex items-center justify-between border-t border-slate-200 px-5 py-3">
          <button
            type="button"
            onClick={handleDeleteClick}
            disabled={isDeleting}
            className="flex h-9 items-center gap-1.5 rounded-md border border-red-200 bg-white px-4 text-[13px] font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Trash2 size={13} />
            {isDeleting ? "삭제 중..." : "삭제"}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="h-9 rounded-md border border-slate-200 bg-white px-4 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              닫기
            </button>

            <button
              type="button"
              onClick={() => onEdit(product)}
              disabled={isDeleting}
              className="flex h-9 items-center gap-1.5 rounded-md bg-blue-600 px-4 text-[13px] font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              <Pencil size={13} />
              수정하기
            </button>
          </div>
        </footer>
      </section>
    </div>
  )
}

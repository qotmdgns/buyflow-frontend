"use client"

import Link from "next/link"
import { CircleAlert, List } from "lucide-react"
import { useRouter } from "next/navigation"
import PurchaseItemSelectModal from "@/features/purchase-request/components/PurchaseItemSelectModal"
import PurchaseRequestBasicForm from "@/features/purchase-request/components/PurchaseRequestBasicForm"
import PurchaseRequestItemSection from "@/features/purchase-request/components/PurchaseRequestItemSection"
import usePurchaseRequestEdit from "@/features/purchase-request/hooks/usePurchaseRequestEdit"
import LoadingOverlay from "@/components/common/LoadingOverlay"

export default function PurchaseRequestEdit({ requestId }) {
  const router = useRouter()

  const {
    originalRequest,
    form,
    attachment,
    requestItems,
    totalAmount,
    loading,
    error,
    isSubmitting,
    isItemModalOpen,
    draftSelectedIds,
    keyword,
    category,
    categoryOptions,
    filteredProducts,
    updateForm,
    changeAttachment,
    openItemModal,
    closeItemModal,
    setKeyword,
    setCategory,
    searchProducts,
    toggleDraftProduct,
    toggleAllFilteredProducts,
    confirmSelectedProducts,
    changeQuantity,
    changeRemark,
    removeItem,
    submitUpdate,
  } = usePurchaseRequestEdit(requestId)

  function handleCancel() {
    const shouldLeave = window.confirm(
      "수정 중인 내용이 저장되지 않을 수 있습니다. 취소하시겠습니까?",
    )

    if (shouldLeave) {
      router.push(`/purchase-requests/${requestId}`)
    }
  }

  if (loading) {
    return <LoadingOverlay minDuration={1000} />
  }

  if (error) {
    return (
      <div className="rounded-lg border border-rose-100 bg-white px-4 py-16 text-center shadow-sm">
        <p className="text-[14px] text-rose-500">{error}</p>

        <button
          type="button"
          onClick={() => router.push(`/purchase-requests/${requestId}`)}
          className="mt-4 h-9 rounded-md border border-slate-200 bg-white px-3 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          상세 화면으로 돌아가기
        </button>
      </div>
    )
  }

  return (
    <div className="w-full">
      <LoadingOverlay show={isSubmitting} minDuration={1000} />
      <header className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-slate-900">
            구매 요청 수정
          </h1>

          <p className="mt-1 text-[13px] text-slate-400">
            요청 번호: {form.requestNumber || "-"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/purchase-requests"
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <List size={13} />
            목록
          </Link>

          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[12px] font-semibold text-blue-600">
            {originalRequest?.status ?? "수정중"}
          </span>
        </div>
      </header>

      <PurchaseRequestBasicForm
        form={form}
        attachment={attachment}
        onChange={updateForm}
        onAttachmentChange={changeAttachment}
      />

      <PurchaseRequestItemSection
        items={requestItems}
        totalAmount={totalAmount}
        onOpenItemModal={openItemModal}
        onChangeQuantity={changeQuantity}
        onChangeRemark={changeRemark}
        onRemoveItem={removeItem}
      />

      <div className="mt-3 flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-3 text-[12px] text-slate-500">
        <CircleAlert size={13} className="shrink-0 text-slate-400" />
        승인 대기 상태의 구매 요청만 수정할 수 있습니다.
      </div>

      <footer className="mt-3 flex justify-end gap-2">
        <Link
          href="/purchase-requests"
          className="inline-flex h-10 items-center rounded-md border border-slate-200 bg-white px-4 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          목록
        </Link>
        <button
          type="button"
          onClick={handleCancel}
          className="h-10 rounded-md border border-slate-200 bg-white px-4 text-[13px] font-semibold text-slate-500 transition hover:bg-slate-50"
        >
          취소
        </button>

        <button
          type="button"
          onClick={submitUpdate}
          disabled={isSubmitting}
          className="h-10 rounded-md bg-blue-600 px-4 text-[13px] font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {isSubmitting ? "수정 중..." : "수정 완료"}
        </button>
      </footer>

      {isItemModalOpen && (
        <PurchaseItemSelectModal
          products={filteredProducts}
          selectedIds={draftSelectedIds}
          keyword={keyword}
          category={category}
          categoryOptions={categoryOptions}
          onKeywordChange={setKeyword}
          onCategoryChange={setCategory}
          onSearch={searchProducts}
          onToggleProduct={toggleDraftProduct}
          onToggleAll={toggleAllFilteredProducts}
          onClose={closeItemModal}
          onConfirm={confirmSelectedProducts}
        />
      )}
    </div>
  )
}

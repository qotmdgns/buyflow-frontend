"use client"

import { CircleAlert } from "lucide-react"
import { useRouter } from "next/navigation"
import PurchaseItemSelectModal from "@/features/purchase-request/components/PurchaseItemSelectModal"
import PurchaseRequestBasicForm from "@/features/purchase-request/components/PurchaseRequestBasicForm"
import PurchaseRequestItemSection from "@/features/purchase-request/components/PurchaseRequestItemSection"
import usePurchaseRequestCreate from "@/features/purchase-request/hooks/usePurchaseRequestCreate"
import LoadingOverlay from "@/components/common/LoadingOverlay"

export default function PurchaseRequestCreate() {
  const router = useRouter()

  const {
    form,
    attachment,
    requestItems,
    totalAmount,
    isSubmitting,
    isProductLoading,
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
    submitApproval,
  } = usePurchaseRequestCreate()

  function handleCancel() {
    const shouldLeave = window.confirm(
      "작성 중인 내용이 저장되지 않을 수 있습니다, 취소하시겠습니까?",
    )

    if (shouldLeave) {
      router.push("/purchase-requests")
    }
  }

  return (
    <div className="w-full">
      <LoadingOverlay
        show={isSubmitting || isProductLoading}
        minDuration={1000}
      />
      <header className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-slate-900">
            구매 요청 등록
          </h1>

          <p className="mt-1 text-[13px] text-slate-400">
            새로운 물품 구매를 위한 요청서를 작성합니다.
          </p>
        </div>

        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[12px] font-semibold text-blue-600">
          작성중
        </span>
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
        구매 요청 후에는 승인 완료 또는 반려 전까지 내용을 수정할 수 없습니다.
      </div>

      <footer className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={handleCancel}
          className="h-10 rounded-md border border-slate-200 bg-white px-4 text-[13px] font-semibold text-slate-500 transition hover:bg-slate-50"
        >
          취소
        </button>

        <button
          type="button"
          onClick={submitApproval}
          disabled={isSubmitting}
          className="h-10 rounded-md bg-blue-600 px-4 text-[13px] font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {isSubmitting ? "처리 중..." : "구매 요청"}
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

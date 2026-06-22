"use client"

import { useRouter } from "next/navigation"

import PurchaseOrderForm from "@/features/purchase-order/components/PurchaseOrderForm"

import usePurchaseOrderEdit from "@/features/purchase-order/hooks/usePurchaseOrderEdit"

export default function PurchaseOrderEdit({ orderId }) {
  const router = useRouter()

  const purchaseOrder = usePurchaseOrderEdit(orderId)

  if (purchaseOrder.detailState.loading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-10 text-center text-slate-400">
        발주 정보를 불러오는 중입니다.
      </div>
    )
  }

  if (purchaseOrder.detailState.error) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-10 text-center text-rose-500">
        {purchaseOrder.detailState.error}
      </div>
    )
  }

  if (!purchaseOrder.editable) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-10 text-center text-rose-500">
        현재 상태에서는 발주 정보를 수정할 수 없습니다.
      </div>
    )
  }

  async function saveOrder() {
    const result = await purchaseOrder.saveOrder()

    if (!result) {
      return
    }

    window.alert(`${result.orderNumber} 발주 정보를 수정했습니다.`)

    router.push("/purchase-orders")
  }

  return (
    <PurchaseOrderForm
      mode="edit"
      {...purchaseOrder}
      onChange={purchaseOrder.updateForm}
      onChangeSupplier={purchaseOrder.changeSupplier}
      onChangeItemValue={purchaseOrder.changeItemValue}
      onRemoveItem={purchaseOrder.removeItem}
      onChangeAttachment={purchaseOrder.changeAttachment}
      onCancel={() => router.push("/purchase-orders")}
      onSave={saveOrder}

      onApplyPurchaseRequest={purchaseOrder.onApplyPurchaseRequest}
    />
  )
}

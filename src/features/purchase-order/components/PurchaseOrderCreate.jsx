"use client"

import { useRouter } from "next/navigation"

import PurchaseOrderForm from "@/features/purchase-order/components/PurchaseOrderForm"

import usePurchaseOrderCreate from "@/features/purchase-order/hooks/usePurchaseOrderCreate"

export default function PurchaseOrderCreate() {
  const router = useRouter()

  const purchaseOrder = usePurchaseOrderCreate()

  async function saveOrder(status) {
    const result = await purchaseOrder.saveOrder(status)

    if (!result) {
      return
    }

    window.alert(
      status === "CONFIRMED"
        ? `${result.orderNumber} 발주를 확정했습니다.`
        : `${result.orderNumber} 발주를 임시 저장했습니다.`,
    )

    router.push("/purchase-orders")
  }

  return (
    <PurchaseOrderForm
      mode="create"
      {...purchaseOrder}
      onChange={purchaseOrder.updateForm}
      onChangeSupplier={purchaseOrder.changeSupplier}
      onApplyPurchaseRequest={purchaseOrder.applyPurchaseRequest}
      onChangeItemValue={purchaseOrder.changeItemValue}
      onRemoveItem={purchaseOrder.removeItem}
      onChangeAttachment={purchaseOrder.changeAttachment}
      onCancel={() => router.push("/purchase-orders")}
      onSave={saveOrder}
    />
  )
}

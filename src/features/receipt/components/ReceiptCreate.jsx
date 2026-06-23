"use client"

import { useRouter } from "next/navigation"

import ReceiptForm from "@/features/receipt/components/ReceiptForm"
import useReceiptCreate from "@/features/receipt/hooks/useReceiptCreate"

export default function ReceiptCreate({ initialReceiptId = "" }) {
  const router = useRouter()
  const receipt = useReceiptCreate(initialReceiptId)

  async function saveReceipt() {
    const result = await receipt.saveReceipt()

    if (!result) {
      return
    }

    window.alert(`${result.latestReceipt.receiptNumber} 입고를 등록했습니다.`)
    router.push(`/receipts/${result.id}`)
  }

  return (
    <ReceiptForm
      {...receipt}
      onChange={receipt.updateForm}
      onChangeOrder={receipt.changeOrder}
      onChangeItemQuantity={receipt.changeItemQuantity}
      onFillAllRemainingQuantities={receipt.fillAllRemainingQuantities}
      onChangeAttachment={receipt.changeAttachment}
      onCancel={() => router.push("/receipts")}
      onSave={saveReceipt}
    />
  )
}

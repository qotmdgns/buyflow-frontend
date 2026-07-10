"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

import { useAuth } from "@/features/auth/context/AuthContext"
import ReceiptForm from "@/features/receipt/components/ReceiptForm"
import useReceiptCreate from "@/features/receipt/hooks/useReceiptCreate"

export default function ReceiptCreate({ initialReceiptId = "" }) {
  const router = useRouter()
  const { user, isAuthReady } = useAuth()
  const canWriteReceipts =
    isAuthReady &&
    (user?.roles?.includes("ADMIN") ||
      user?.permissions?.includes("receipts.write"))

  useEffect(() => {
    if (isAuthReady && !canWriteReceipts) {
      router.replace("/receipts")
    }
  }, [canWriteReceipts, isAuthReady, router])

  if (!isAuthReady || !canWriteReceipts) {
    return null
  }

  return <ReceiptCreateForm initialReceiptId={initialReceiptId} />
}

function ReceiptCreateForm({ initialReceiptId = "" }) {
  const router = useRouter()
  const receipt = useReceiptCreate(initialReceiptId)

  async function saveReceipt() {
  const result = await receipt.saveReceipt()

  if (!result) {
    return
  }

  window.alert("입고가 등록되었습니다.")
  router.push("/receipts")
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

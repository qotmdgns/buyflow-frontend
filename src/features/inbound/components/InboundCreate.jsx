"use client"

import { useRouter } from "next/navigation"

import InboundForm from "@/features/inbound/components/InboundForm"
import useInboundCreate from "@/features/inbound/hooks/useInboundCreate"

export default function InboundCreate({ initialInboundId = "" }) {
  const router = useRouter()
  const inbound = useInboundCreate(initialInboundId)

  async function saveInbound() {
    const result = await inbound.saveInbound()

    if (!result) {
      return
    }

    window.alert(`${result.latestReceipt.inboundNumber} 입고를 등록했습니다.`)
    router.push(`/inbounds/${result.id}`)
  }

  return (
    <InboundForm
      {...inbound}
      onChange={inbound.updateForm}
      onChangeOrder={inbound.changeOrder}
      onChangeItemQuantity={inbound.changeItemQuantity}
      onFillAllRemainingQuantities={inbound.fillAllRemainingQuantities}
      onChangeAttachment={inbound.changeAttachment}
      onCancel={() => router.push("/inbounds")}
      onSave={saveInbound}
    />
  )
}

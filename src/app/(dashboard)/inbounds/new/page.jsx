import InboundCreate from "@/features/inbound/components/InboundCreate"

export const metadata = {
  title: "입고 등록 | BuyFlow ERP",
}

export default async function NewInboundPage({ searchParams }) {
  const { inboundId = "" } = await searchParams

  return <InboundCreate initialInboundId={inboundId} />
}

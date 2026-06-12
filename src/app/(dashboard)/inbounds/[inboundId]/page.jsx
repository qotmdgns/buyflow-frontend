import InboundDetail from "@/features/inbound/components/InboundDetail"

export const metadata = {
  title: "입고 상세 | BuyFlow ERP",
}

export default async function InboundDetailPage({ params }) {
  const { inboundId } = await params

  return <InboundDetail inboundId={inboundId} />
}

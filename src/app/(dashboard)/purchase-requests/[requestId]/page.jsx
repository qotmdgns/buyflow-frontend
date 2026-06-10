import PurchaseRequestDetail from "@/features/purchase-request/components/PurchaseRequestDetail"

export const metadata = {
  title: "구매 요청 상세 | BuyFlow ERP",
}

export default async function PurchaseRequestDetailPage({ params }) {
  const { requestId } = await params

  return <PurchaseRequestDetail requestId={requestId} />
}

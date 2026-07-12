import PermissionRouteGuard from "@/components/auth/PermissionRouteGuard"
import PurchaseRequestEdit from "@/features/purchase-request/components/PurchaseRequestEdit"

export const metadata = {
  title: "구매 요청 수정 | BuyFlow ERP",
}

export default async function PurchaseRequestEditPage({ params }) {
  const { requestId } = await params

  return (
    <PermissionRouteGuard
      permissions={["purchase-requests.write"]}
      fallbackPath={`/purchase-requests/${requestId}`}
    >
      <PurchaseRequestEdit requestId={requestId} />
    </PermissionRouteGuard>
  )
}

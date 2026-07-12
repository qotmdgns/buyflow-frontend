import PermissionRouteGuard from "@/components/auth/PermissionRouteGuard"
import PurchaseRequestCreate from "@/features/purchase-request/components/PurchaseRequestCreate"

export const metadata = {
  title: "구매 요청 등록 | BuyFlow ERP",
}

export default function NewPurchaseRequestPage() {
  return (
    <PermissionRouteGuard
      permissions={["purchase-requests.write"]}
      fallbackPath="/purchase-requests"
    >
      <PurchaseRequestCreate />
    </PermissionRouteGuard>
  )
}

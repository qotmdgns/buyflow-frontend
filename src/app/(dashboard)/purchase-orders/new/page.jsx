import PermissionRouteGuard from "@/components/auth/PermissionRouteGuard"
import PurchaseOrderCreate from "@/features/purchase-order/components/PurchaseOrderCreate"

export const metadata = {
  title: "발주 등록 | BuyFlow ERP",
}

export default function NewPurchaseOrderPage() {
  return (
    <PermissionRouteGuard
      permissions={["purchase-orders.write"]}
      fallbackPath="/purchase-orders"
    >
      <PurchaseOrderCreate />
    </PermissionRouteGuard>
  )
}

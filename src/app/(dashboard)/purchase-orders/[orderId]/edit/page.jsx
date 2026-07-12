import PermissionRouteGuard from "@/components/auth/PermissionRouteGuard"
import PurchaseOrderEdit from "@/features/purchase-order/components/PurchaseOrderEdit"

export const metadata = {
  title: "발주 수정 | BuyFlow ERP",
}

export default async function PurchaseOrderEditPage({ params }) {
  const { orderId } = await params

  return (
    <PermissionRouteGuard
      permissions={["purchase-orders.write"]}
      fallbackPath="/purchase-orders"
    >
      <PurchaseOrderEdit orderId={orderId} />
    </PermissionRouteGuard>
  )
}

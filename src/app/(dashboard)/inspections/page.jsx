import PermissionRouteGuard from "@/components/auth/PermissionRouteGuard"
import InspectionManagement from "@/features/inspection/components/InspectionManagement"

export const metadata = {
  title: "검수 대기 목록 | BuyFlow ERP",
}

export default function InspectionsPage() {
  return (
    <PermissionRouteGuard
      permissions={["inspections.read", "inspections.process"]}
      fallbackPath="/dashboard"
    >
      <InspectionManagement />
    </PermissionRouteGuard>
  )
}

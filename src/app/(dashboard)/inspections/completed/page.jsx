import PermissionRouteGuard from "@/components/auth/PermissionRouteGuard"
import CompletedInspectionManagement from "@/features/inspection/components/CompletedInspectionManagement"

export const metadata = {
  title: "검수 완료 목록 | BuyFlow ERP",
}

export default function CompletedInspectionsPage() {
  return (
    <PermissionRouteGuard
      permissions={["inspections.read", "inspections.process"]}
      fallbackPath="/dashboard"
    >
      <CompletedInspectionManagement />
    </PermissionRouteGuard>
  )
}

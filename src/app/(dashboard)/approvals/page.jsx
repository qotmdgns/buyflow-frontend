import PermissionRouteGuard from "@/components/auth/PermissionRouteGuard"
import ApprovalListManagement from "@/features/approval/components/ApprovalListManagement"

export const metadata = {
  title: "승인 관리 목록 | BuyFlow ERP",
}

export default function ApprovalsPage() {
  return (
    <PermissionRouteGuard
      permissions={["approvals.read", "approvals.process"]}
      fallbackPath="/dashboard"
    >
      <ApprovalListManagement />
    </PermissionRouteGuard>
  )
}

import PermissionRouteGuard from "@/components/auth/PermissionRouteGuard"
import ApprovalManagement from "@/features/approval/components/ApprovalManagement"

export const metadata = {
  title: "승인 관리 상세 | BuyFlow ERP",
}

export default async function ApprovalDetailPage({ params }) {
  const { approvalId } = await params

  return (
    <PermissionRouteGuard
      permissions={["approvals.read", "approvals.process"]}
      fallbackPath="/dashboard"
    >
      <ApprovalManagement approvalId={approvalId} />
    </PermissionRouteGuard>
  )
}

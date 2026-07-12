import PermissionRouteGuard from "@/components/auth/PermissionRouteGuard"
import System from "@/features/system/components/System"

export default function SystemPage() {
  return (
    <PermissionRouteGuard
      permissions={[
        "users.read",
        "users.write",
        "USER_MANAGE",
        "roles.write",
        "ROLE_MANAGE",
      ]}
      fallbackPath="/dashboard"
    >
      <System />
    </PermissionRouteGuard>
  )
}

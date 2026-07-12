"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

import { useAuth } from "@/features/auth/context/AuthContext"

function normalizeRoleCode(roleCode) {
  return String(roleCode ?? "").replace(/^ROLE_/, "")
}

export default function PermissionRouteGuard({
  permissions,
  fallbackPath,
  children,
}) {
  const router = useRouter()
  const { user, isAuthReady } = useAuth()
  const isAdmin = user?.roles?.some(
    (roleCode) => normalizeRoleCode(roleCode) === "ADMIN",
  )
  const hasRequiredPermission = permissions.some((permissionCode) =>
    user?.permissions?.includes(permissionCode),
  )
  const isAllowed = isAuthReady && (isAdmin || hasRequiredPermission)

  useEffect(() => {
    if (isAuthReady && !isAllowed) {
      router.replace(fallbackPath)
    }
  }, [fallbackPath, isAllowed, isAuthReady, router])

  if (!isAllowed) {
    return null
  }

  return children
}

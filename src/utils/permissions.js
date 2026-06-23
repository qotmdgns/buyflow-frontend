import { getAuthSession } from "@/utils/authStorage"

function normalizeRoleCode(roleCode) {
  return String(roleCode ?? "").replace(/^ROLE_/, "")
}

function normalizePermissionCode(code) {
  return String(code ?? "").trim()
}

// 세션(로그인 시 저장된 roles/permissions)을 기준으로 권한 보유 여부를 확인한다.
// ADMIN 역할은 슈퍼유저로 취급해 모든 권한을 통과시킨다.
export function hasPermission(code) {
  const session = getAuthSession()

  if (!session) {
    return false
  }

  if (session.roles?.includes("ADMIN")) {
    return true
  }

  const permissionCode = normalizePermissionCode(code)
  return (
    session.permissions?.some(
      (permission) => normalizePermissionCode(permission) === permissionCode,
    ) ?? false
  )
}

export function hasRole(roleCode) {
  const session = getAuthSession()

  if (!session) {
    return false
  }

  const normalizedRoleCode = normalizeRoleCode(roleCode)
  return (
    session.roles?.some(
      (role) => normalizeRoleCode(role) === normalizedRoleCode,
    ) ?? false
  )
}

export function hasAnyRole(roleCodes) {
  return roleCodes.some((roleCode) => hasRole(roleCode))
}

export function isAdmin() {
  return hasRole("ADMIN")
}

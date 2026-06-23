import { getAuthSession } from "@/utils/authStorage"

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

  return session.permissions?.includes(code) ?? false
}

export function isAdmin() {
  return getAuthSession()?.roles?.includes("ADMIN") ?? false
}
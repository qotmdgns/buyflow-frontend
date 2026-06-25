import { apiFetch } from "@/lib/api/fetchClient"
import { mockUsers } from "@/features/system/data/mockSystemData"

// 읽기(목록/역할/필터)는 항상 실제 백엔드를 사용한다.
// 쓰기(생성/수정)는 아직 백엔드 관리자 API가 정리되지 않아 mock 토글을 유지한다.
//   (백엔드: 관리자 "생성" 엔드포인트 없음 / 수정은 profile·roles·status 로 분리)
const USE_MOCK_WRITE = process.env.NEXT_PUBLIC_USE_SYSTEM_MOCK !== "false"

let userDatabase = mockUsers.map((user) => ({ ...user }))

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

const PERMISSION_GROUP_LABELS = {
  DASHBOARD: "대시보드",
  MASTER_DATA: "기준정보 관리",
  PURCHASE: "구매 및 입고",
  STOCK: "재고 관리",
  SYSTEM: "설정",
}

const USER_ROLE_LABELS = {
  ADMIN: "시스템 관리자",
  TEAM_MANAGER: "부서 팀장",
  VIEWER: "조회 전용",
}

export const SYSTEM_ADMIN_PERMISSION_PROFILE_ID = "role:ADMIN"

export function isSystemAdminPermissionProfile(profileId) {
  return profileId === SYSTEM_ADMIN_PERMISSION_PROFILE_ID
}

// ─────────────────────────────────────────────────────────────
// 백엔드(코드 배열) ↔ 화면(groups 구조) 변환 어댑터 (권한 관리 패널용)
// ─────────────────────────────────────────────────────────────
function buildGroupsFromPermissionCatalog(permissions, permissionCodes) {
  const codeSet = new Set(permissionCodes ?? [])

  const groups = new Map()

  ;(permissions ?? []).forEach((permission) => {
    const groupKey = permission.permissionGroup || "ETC"

    if (!groups.has(groupKey)) {
      groups.set(groupKey, {
        key: groupKey,
        label: PERMISSION_GROUP_LABELS[groupKey] || groupKey,
        permissions: [],
      })
    }

    groups.get(groupKey).permissions.push({
      key: permission.permissionCode,
      label: permission.permissionName || permission.permissionCode,
      checked: codeSet.has(permission.permissionCode),
    })
  })

  return Array.from(groups.values())
}

function extractCheckedCodes(groups) {
  const codes = []
  groups.forEach((group) => {
    group.permissions.forEach((permission) => {
      if (permission.checked) codes.push(permission.key)
    })
  })
  return codes
}

// ─────────────────────────────────────────────────────────────
// 백엔드 응답 → 화면 사용자/역할 모양으로 변환하는 어댑터
//   AdminUserResponse = { user: UserResponse, roles: RoleResponse[], permissions: string[] }
//   UserResponse      = { userId, loginId, userName, email, departmentName,
//                         positionName, jobRank, status, useYn, createdAt, ... }
//   RoleResponse      = { roleId, roleCode, roleName, roleGroup, sortOrder, useYn }
// ─────────────────────────────────────────────────────────────
function statusLabel(user) {
  if (user.status === "PENDING") return "승인 대기"
  const inactive =
    user.useYn === "N" ||
    user.status === "INACTIVE" ||
    user.status === "SUSPENDED"
  return inactive ? "사용 중지" : "사용 중"
}

// 직급(사원/주임/대리/과장) 표시.
//   - 백엔드 UserResponse.jobRank 가 원본(과장 등)이면 그대로 사용
//   - 아직 USER/ADMIN 으로 정규화돼 오면 positionName 으로 폴백
//   → 백엔드 수정 전/후 모두 동작
function rankLabel(user) {
  const raw = user.jobRank
  if (raw && raw !== "USER" && raw !== "ADMIN") return raw
  return user.positionName || ""
}

// 여러 역할 중 대표 역할(우선순위 = sortOrder 작은 것: ADMIN > MANAGER > ...)
function pickPrimaryRole(roles = []) {
  if (!roles.length) return null
  return [...roles].sort(
    (a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99),
  )[0]
}

function adaptUser(item) {
  const user = item.user ?? item
  const roles = item.roles ?? []
  const primary = pickPrimaryRole(roles)
  const roleIds = roles.map((role) => role.roleCode).filter(Boolean)
  const departmentAuthorized = item.departmentAuthorized ?? true

  return {
    id: user.userId,
    employeeNo: user.loginId ?? "", // 백엔드에 사번 컬럼이 없어 loginId 사용
    name: user.userName ?? "",
    email: user.email ?? "",
    department: user.departmentName ?? "",
    position: rankLabel(user),
    roleId: primary?.roleCode ?? "",
    roleIds,
    roleName: displayUserRoleName(roles, departmentAuthorized),
    departmentAuthorized,
    activeStatus: statusLabel(user),
    registeredAt: String(user.createdAt ?? "").slice(0, 10),
  }
}

function displayUserRoleName(roles, departmentAuthorized) {
  const roleCodes = new Set(
    (roles ?? []).map((role) => normalizeRoleCode(role.roleCode)),
  )
  const labels = []

  if (roleCodes.has("ADMIN")) labels.push(USER_ROLE_LABELS.ADMIN)
  if (roleCodes.has("TEAM_MANAGER")) labels.push(USER_ROLE_LABELS.TEAM_MANAGER)
  if (departmentAuthorized) labels.push("부서원")
  if (!departmentAuthorized && roleCodes.has("VIEWER")) {
    labels.push(USER_ROLE_LABELS.VIEWER)
  }

  return labels.length ? labels.join(", ") : "-"
}

function adaptRole(role) {
  return {
    id: role.roleCode, // 화면 roleId = ROLE_CODE (예: ADMIN, WAREHOUSE)
    name: role.roleName,
    description: role.description ?? "",
    group: role.roleGroup,
    userCount: undefined, // 백엔드 미제공 → 패널은 (?? 0) 처리
  }
}

function normalizeRoleCode(roleIdOrCode) {
  if (!roleIdOrCode || roleIdOrCode === "전체") {
    return ""
  }

  return String(roleIdOrCode).replace(/^ROLE_/, "")
}

// ─────────────────────────────────────────────────────────────
// 읽기: 실제 백엔드
// ─────────────────────────────────────────────────────────────

// 사용자 목록: ADMIN은 전체, TEAM_MANAGER는 백엔드에서 자기 부서로 제한된다.
export async function fetchUsers(params = {}) {
  const {
    page = 1,
    size = 10,
    keyword = "",
    department = "전체",
    roleId = "전체",
    activeStatus = "전체",
  } = params

  const query = new URLSearchParams()
  query.set("page", String(Math.max(0, Number(page) - 1)))
  query.set("size", String(size))
  if (keyword) query.set("keyword", keyword)
  if (department && department !== "전체") query.set("department", department)
  if (normalizeRoleCode(roleId)) query.set("roleCode", normalizeRoleCode(roleId))
  if (activeStatus === "사용 중") query.set("useYn", "Y")
  if (activeStatus === "사용 중지") query.set("useYn", "N")

  const data = await apiFetch(`/api/admin/users/page?${query.toString()}`, {
    method: "GET",
  })

  const items = (data?.items ?? []).map(adaptUser)
  const pagination = data?.pagination ?? {}

  return {
    items,
    pagination: {
      page: pagination.page ?? Number(page),
      size: pagination.size ?? size,
      totalElements: pagination.totalElements ?? items.length,
      totalPages: pagination.totalPages ?? 1,
    },
  }
}

// 역할별 인원수: 전체 사용자(GET /api/admin/users)의 roles 를 집계
//   - 한 사용자가 여러 역할을 가지면 각 역할에 1명씩 카운트
//   - 실패해도 카드가 0명으로만 보이도록 빈 맵 폴백
async function fetchRoleUserCounts() {
  try {
    const users = await apiFetch(`/api/admin/users`, { method: "GET" })
    const counts = {}
    ;(users ?? []).forEach((item) => {
      ;(item.roles ?? []).forEach((role) => {
        if (!role?.roleCode) return
        counts[role.roleCode] = (counts[role.roleCode] ?? 0) + 1
      })
    })
    return counts
  } catch {
    return {}
  }
}

// 역할 목록: 현재 사용자가 부여할 수 있는 활성 역할 + 인원수 집계
export async function fetchRoles() {
  const [data, counts] = await Promise.all([
    apiFetch(`/api/admin/users/assignable-roles`, { method: "GET" }),
    fetchRoleUserCounts(),
  ])

  return (data ?? [])
    .filter((role) => role.useYn !== "N")
    .map((role) => ({
      ...adaptRole(role),
      userCount: counts[role.roleCode] ?? 0,
    }))
}

export function buildPermissionProfiles(roles, departmentProfiles) {
  const adminRole = (roles ?? []).find(
    (role) => normalizeRoleCode(role.id) === "ADMIN",
  )
  const profiles = []

  if (adminRole) {
    profiles.push({
      id: SYSTEM_ADMIN_PERMISSION_PROFILE_ID,
      name: adminRole.name || "시스템 관리자",
      description: "전체 메뉴 조회 및 변경 권한",
      userCount: adminRole.userCount ?? 0,
      profileType: "role",
      roleId: adminRole.id,
    })
  }

  return [
    ...profiles,
    ...(departmentProfiles ?? []).map((profile) => ({
      ...profile,
      profileType: "department",
    })),
  ]
}

function adaptDepartmentProfile(profile) {
  const userCount = profile.userCount ?? 0
  const authorizedUserCount = profile.authorizedUserCount ?? 0

  return {
    id: profile.departmentName,
    name: profile.departmentName,
    description: `${authorizedUserCount}명 부서원 자격 / 전체 ${userCount}명`,
    userCount,
    authorizedUserCount,
  }
}

export async function fetchDepartmentPermissionProfiles() {
  const data = await apiFetch(`/api/admin/departments/permission-profiles`, {
    method: "GET",
  })

  return (data ?? []).map(adaptDepartmentProfile)
}

async function fetchPermissionCatalog() {
  return apiFetch(`/api/admin/permissions`, { method: "GET" })
}

export async function fetchDepartmentPermissions(departmentName) {
  const [permissions, permissionCodes] = await Promise.all([
    fetchPermissionCatalog(),
    apiFetch(
      `/api/admin/departments/${encodeURIComponent(departmentName)}/permissions`,
      { method: "GET" },
    ),
  ])

  return buildGroupsFromPermissionCatalog(permissions, permissionCodes)
}

export async function updateDepartmentPermissions(departmentName, groups) {
  const permissions = await fetchPermissionCatalog()
  const permissionCodes = extractCheckedCodes(groups)
  const savedCodes = await apiFetch(
    `/api/admin/departments/${encodeURIComponent(departmentName)}/permissions`,
    {
      method: "PUT",
      body: JSON.stringify({ permissionCodes }),
    },
  )

  return buildGroupsFromPermissionCatalog(permissions, savedCodes)
}

export async function fetchUserFilterOptions(rolesSource) {
  const rolesPromise =
    rolesSource === undefined ? fetchRoles() : Promise.resolve(rolesSource)
  const [departments, roles] = await Promise.all([
    apiFetch(`/api/admin/users/departments`, { method: "GET" }),
    rolesPromise,
  ])

  return {
    departments: ["전체", ...(departments ?? [])],
    roles,
    activeStatuses: ["전체", "사용 중", "사용 중지"],
  }
}

// ─────────────────────────────────────────────────────────────
// 쓰기: 실제 백엔드
// ─────────────────────────────────────────────────────────────

// 관리자 직접 "생성"은 지원하지 않는다 (백엔드에 생성 엔드포인트 없음).
// 사용자는 회원가입(/signup) 후 관리자 승인 절차로 등록된다.
export async function createUser() {
  throw new Error(
    "관리자 직접 생성은 지원하지 않습니다. 사용자는 회원가입 후 승인으로 등록됩니다.",
  )
}

function payloadRoleIds(payload) {
  const values = payload.roleIds?.length ? payload.roleIds : [payload.roleId]
  return [...new Set(values.filter(Boolean))]
}

// 화면 roleId(코드 'WAREHOUSE' / 'ROLE_WAREHOUSE' / 숫자)[] → 백엔드 숫자 roleId[]
async function resolveRoleNumericIds(roleIdsOrCodes) {
  const values = [...new Set((roleIdsOrCodes ?? []).filter(Boolean))]
  if (values.length === 0) return []

  const numericIds = []
  const codeValues = []

  values.forEach((value) => {
    if (/^\d+$/.test(String(value))) {
      numericIds.push(Number(value))
    } else {
      codeValues.push(value)
    }
  })

  if (codeValues.length === 0) {
    return numericIds
  }

  const roles = await apiFetch(`/api/admin/users/assignable-roles`, {
    method: "GET",
  })
  const resolvedIds = codeValues.map((roleIdOrCode) => {
    const code = normalizeRoleCode(roleIdOrCode)
    const match = (roles ?? []).find((role) => role.roleCode === code)

    if (!match) {
      throw new Error("선택한 역할을 찾을 수 없습니다.")
    }

    return match.roleId
  })

  return [...numericIds, ...resolvedIds]
}

// 화면 사용여부 라벨 → 상태 PATCH body (알 수 없는 값이면 null = 상태 미변경)
function toStatusBody(activeStatus) {
  if (activeStatus === "사용 중") return { status: "ACTIVE", useYn: "Y" }
  if (activeStatus === "사용 중지") return { status: "INACTIVE", useYn: "N" }
  return null
}

// 사용자 수정: 프로필(부서·직급) + 상태(사용여부) + 역할(권한 그룹)을 실제 저장.
//   PUT   /admin/users/{id}/profile  { departmentName, jobRank }
//   PATCH /admin/users/{id}/status   { status, useYn }
//   PUT   /admin/users/{id}/roles    { roleIds: [숫자] }   ← 역할이 바뀐 경우에만
//     (역할 미변경 시 호출 생략 → 다중역할 사용자가 단일역할로 줄어드는 것 방지)
export async function updateUser(userId, payload, options = {}) {
  let response

  if (options.delegateOnly) {
    if (options.skipDepartmentAuthorization) {
      return payload
    }

    response = await apiFetch(`/api/admin/users/${userId}/department-authorization`, {
      method: "PUT",
      body: JSON.stringify({
        authorized: Boolean(payload.departmentAuthorized),
      }),
    })

    return adaptUser(response)
  }

  // 1) 프로필 (부서 + 직급). 빈 값은 null 로 보내 덮어쓰기 방지
  response = await apiFetch(`/api/admin/users/${userId}/profile`, {
    method: "PUT",
    body: JSON.stringify({
      departmentName: payload.department?.trim() || null,
      jobRank: payload.position?.trim() || null,
    }),
  })

  // 2) 상태 (사용여부) — 알려진 값일 때만
  const statusBody = toStatusBody(payload.activeStatus)
  if (statusBody) {
    response = await apiFetch(`/api/admin/users/${userId}/status`, {
      method: "PATCH",
      body: JSON.stringify(statusBody),
    })
  }

  // 3) 역할 — 변경된 경우에만 교체
  if (!options.skipRoles) {
    const numericRoleIds = await resolveRoleNumericIds(payloadRoleIds(payload))
    if (numericRoleIds.length === 0) {
      throw new Error("역할을 하나 이상 선택하세요.")
    }
    response = await apiFetch(`/api/admin/users/${userId}/roles`, {
      method: "PUT",
      body: JSON.stringify({ roleIds: numericRoleIds }),
    })
  }

  return adaptUser(response)
}

// 가입 승인: PATCH /api/admin/users/{userId}/approve  → status ACTIVE, useYn Y
export async function approveUser(userId) {
  const updated = await apiFetch(`/api/admin/users/${userId}/approve`, {
    method: "PATCH",
  })
  return adaptUser(updated)
}

// ─────────────────────────────────────────────────────────────
// 권한 관리: 항상 실제 백엔드 (이미 정상)
//   GET /api/roles/{roleCode}/permissions  -> 권한 코드 배열
//   PUT /api/roles/{roleCode}/permissions  -> body { permissionCodes: [...] }
// ─────────────────────────────────────────────────────────────
export async function fetchRolePermissions(roleId) {
  const roleCode = roleId.replace(/^ROLE_/, "")
  const [permissions, permissionCodes] = await Promise.all([
    fetchPermissionCatalog(),
    apiFetch(`/api/roles/${roleCode}/permissions`, {
      method: "GET",
    }),
  ])

  return buildGroupsFromPermissionCatalog(permissions, permissionCodes)
}

export async function updateRolePermissions(roleId, groups) {
  const roleCode = roleId.replace(/^ROLE_/, "")
  const permissions = await fetchPermissionCatalog()
  const permissionCodes = extractCheckedCodes(groups)
  const savedCodes = await apiFetch(`/api/roles/${roleCode}/permissions`, {
    method: "PUT",
    body: JSON.stringify({ permissionCodes }),
  })

  return buildGroupsFromPermissionCatalog(permissions, savedCodes)
}

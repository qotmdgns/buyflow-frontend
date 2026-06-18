import { apiFetch } from "@/lib/api/fetchClient"
import {
  mockDepartments,
  mockRolePermissions,
  mockRoles,
  mockUsers,
} from "@/features/system/data/mockSystemData"

const USE_MOCK = process.env.NEXT_PUBLIC_USE_SYSTEM_MOCK !== "false"

let userDatabase = mockUsers.map((user) => ({ ...user }))

let rolePermissionDatabase = Object.fromEntries(
  Object.entries(mockRolePermissions).map(([roleId, groups]) => [
    roleId,
    clonePermissionGroups(groups),
  ]),
)

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

function clonePermissionGroups(groups) {
  return groups.map((group) => ({
    ...group,
    permissions: group.permissions.map((permission) => ({ ...permission })),
  }))
}

// ─────────────────────────────────────────────────────────────
// [추가] 백엔드(코드 배열) ↔ 화면(groups 구조) 변환 어댑터
// 백엔드는 권한을 ["dashboard.read", ...] 코드 배열로 주고받지만,
// 화면(RolePermissionPanel)은 그룹/체크박스 구조(groups)를 쓴다.
// ROLE_ADMIN 템플릿이 모든 권한을 포함하므로 이를 골격으로 사용한다.
// ─────────────────────────────────────────────────────────────
function buildGroupsFromCodes(permissionCodes) {
  const codeSet = new Set(permissionCodes ?? [])

  return clonePermissionGroups(mockRolePermissions.ROLE_ADMIN).map((group) => ({
    ...group,
    permissions: group.permissions.map((permission) => ({
      ...permission,
      checked: codeSet.has(permission.key),
    })),
  }))
}

function extractCheckedCodes(groups) {
  const codes = []

  groups.forEach((group) => {
    group.permissions.forEach((permission) => {
      if (permission.checked) {
        codes.push(permission.key)
      }
    })
  })

  return codes
}

function includesKeyword(value, keyword) {
  return String(value ?? "")
    .toLowerCase()
    .includes(keyword.trim().toLowerCase())
}

function findRoleName(roleId) {
  return mockRoles.find((role) => role.id === roleId)?.name ?? "-"
}

function withRoleName(user) {
  return {
    ...user,
    roleName: findRoleName(user.roleId),
  }
}

function getTodayString() {
  return new Date().toISOString().slice(0, 10)
}

function getMockUsers(params) {
  const {
    page = 1,
    size = 10,
    department = "전체",
    roleId = "전체",
    keyword = "",
    activeStatus = "전체",
  } = params

  const filteredUsers = userDatabase.filter((user) => {
    const matchesDepartment =
      department === "전체" || user.department === department

    const matchesRole = roleId === "전체" || user.roleId === roleId

    const matchesKeyword =
      !keyword ||
      includesKeyword(user.name, keyword) ||
      includesKeyword(user.employeeNo, keyword) ||
      includesKeyword(user.email, keyword)

    const matchesActiveStatus =
      activeStatus === "전체" || user.activeStatus === activeStatus

    return (
      matchesDepartment && matchesRole && matchesKeyword && matchesActiveStatus
    )
  })

  const totalElements = filteredUsers.length
  const totalPages = Math.max(1, Math.ceil(totalElements / size))
  const safePage = Math.min(Math.max(page, 1), totalPages)
  const offset = (safePage - 1) * size

  return {
    items: filteredUsers.slice(offset, offset + size).map(withRoleName),
    pagination: {
      page: safePage,
      size,
      totalElements,
      totalPages,
    },
  }
}

function createUserRecord(payload, id, registeredAt = getTodayString()) {
  return {
    id,
    employeeNo: payload.employeeNo.trim().toUpperCase(),
    name: payload.name.trim(),
    email: payload.email.trim().toLowerCase(),
    department: payload.department.trim(),
    position: payload.position.trim(),
    roleId: payload.roleId,
    activeStatus: payload.activeStatus,
    registeredAt,
  }
}

function ensureUniqueUser(payload, targetId = null) {
  const employeeNo = payload.employeeNo.trim().toUpperCase()
  const email = payload.email.trim().toLowerCase()

  const duplicatedEmployeeNo = userDatabase.some(
    (user) =>
      user.id !== targetId && user.employeeNo.toUpperCase() === employeeNo,
  )

  if (duplicatedEmployeeNo) {
    throw new Error("이미 사용 중인 사번입니다.")
  }

  const duplicatedEmail = userDatabase.some(
    (user) => user.id !== targetId && user.email.toLowerCase() === email,
  )

  if (duplicatedEmail) {
    throw new Error("이미 사용 중인 이메일입니다.")
  }
}

export async function fetchUsers(params = {}) {
  if (USE_MOCK) {
    await wait(150)
    return getMockUsers(params)
  }

  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === "" || value === "전체") {
      return
    }

    query.set(key, key === "page" ? String(Number(value) - 1) : String(value))
  })

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/system/users?${query.toString()}`,
    { cache: "no-store" },
  )

  if (!response.ok) {
    throw new Error("사용자 목록을 불러오지 못했습니다.")
  }

  return response.json()
}

export async function fetchUserFilterOptions() {
  if (USE_MOCK) {
    return {
      departments: ["전체", ...mockDepartments],
      roles: mockRoles,
      activeStatuses: ["전체", "사용 중", "사용 중지"],
    }
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/system/users/filter-options`,
    { cache: "no-store" },
  )

  if (!response.ok) {
    throw new Error("사용자 검색 조건을 불러오지 못했습니다.")
  }

  return response.json()
}

export async function fetchRoles() {
  if (USE_MOCK) {
    await wait(80)

    return mockRoles.map((role) => ({
      ...role,
      userCount: userDatabase.filter((user) => user.roleId === role.id).length,
    }))
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/system/roles`,
    { cache: "no-store" },
  )

  if (!response.ok) {
    throw new Error("권한 그룹 목록을 불러오지 못했습니다.")
  }

  return response.json()
}

export async function createUser(payload) {
  if (USE_MOCK) {
    await wait(180)
    ensureUniqueUser(payload)

    const nextId =
      userDatabase.reduce((maxId, user) => Math.max(maxId, user.id), 0) + 1

    const createdUser = createUserRecord(payload, nextId)

    userDatabase = [createdUser, ...userDatabase]

    return withRoleName(createdUser)
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/system/users`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  )

  if (!response.ok) {
    throw new Error("신규 사용자를 등록하지 못했습니다.")
  }

  return response.json()
}

export async function updateUser(userId, payload) {
  if (USE_MOCK) {
    await wait(180)

    const targetId = Number(userId)
    const targetIndex = userDatabase.findIndex((user) => user.id === targetId)

    if (targetIndex === -1) {
      throw new Error("수정할 사용자를 찾을 수 없습니다.")
    }

    ensureUniqueUser(payload, targetId)

    const updatedUser = createUserRecord(
      payload,
      targetId,
      userDatabase[targetIndex].registeredAt,
    )

    userDatabase = userDatabase.map((user) =>
      user.id === targetId ? updatedUser : user,
    )

    return withRoleName(updatedUser)
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/system/users/${userId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  )

  if (!response.ok) {
    throw new Error("사용자 정보를 수정하지 못했습니다.")
  }

  return response.json()
}

// ─────────────────────────────────────────────────────────────
// 권한 관리: 항상 실제 백엔드(Oracle DB) 사용
//   GET /api/roles/{roleCode}/permissions  -> 권한 코드 배열
//   PUT /api/roles/{roleCode}/permissions  -> body { permissionCodes: [...] }
// apiFetch가 JWT 토큰 첨부 + ApiResponse 언래핑(data 반환)을 처리한다.
// roleId 는 'ROLE_ADMIN' 같은 역할 코드이며 DB의 ROLE_CODE 와 일치한다.
// ─────────────────────────────────────────────────────────────
export async function fetchRolePermissions(roleId) {
  const permissionCodes = await apiFetch(`/api/roles/${roleId}/permissions`, {
    method: "GET",
  })

  return buildGroupsFromCodes(permissionCodes)
}

export async function updateRolePermissions(roleId, groups) {
  const permissionCodes = extractCheckedCodes(groups)

  const savedCodes = await apiFetch(`/api/roles/${roleId}/permissions`, {
    method: "PUT",
    body: JSON.stringify({ permissionCodes }),
  })

  return buildGroupsFromCodes(savedCodes)
}
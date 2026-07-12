"use client"

import { useEffect, useState } from "react"
import {
  approveUser as requestApproveUser,
  buildPermissionProfiles,
  createUser,
  fetchDepartmentPermissionProfiles,
  fetchDepartmentPermissions,
  fetchPermissionRoles,
  fetchRolePermissions,
  fetchRoles,
  fetchUserFilterOptions,
  fetchUsers,
  isRolePermissionProfile,
  roleCodeFromPermissionProfileId,
  updateDepartmentPermissions,
  updateRolePermissions,
  updateUser,
} from "@/features/system/api/systemApi"
import {
  DEFAULT_USER_FILTER_OPTIONS,
  DEFAULT_USER_FILTERS,
  DEFAULT_USER_PAGINATION,
} from "@/features/system/utils/systemUtils"

function roleCodeOf(role) {
  if (typeof role === "string" || typeof role === "number") {
    return String(role).replace(/^ROLE_/, "")
  }

  return String(role?.id ?? role?.code ?? role?.roleCode ?? "").replace(
    /^ROLE_/,
    "",
  )
}

function normalizedRoleIds(value) {
  return [...new Set((value ?? []).filter(Boolean).map(roleCodeOf))].sort()
}

function isSameRoleSet(left, right) {
  const leftRoles = normalizedRoleIds(left)
  const rightRoles = normalizedRoleIds(right)

  return (
    leftRoles.length === rightRoles.length &&
    leftRoles.every((roleId, index) => roleId === rightRoles[index])
  )
}

export default function useSystem({
  delegateOnly = false,
  canManageUsers = true,
  canWriteUsers = canManageUsers,
  canManageRoles = true,
  canWriteRoles = canManageRoles,
  canWriteGlobalRoles = false,
  ready = true,
} = {}) {
  const [selectedTab, setSelectedTab] = useState("users")

  const [draftFilters, setDraftFilters] = useState(DEFAULT_USER_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_USER_FILTERS)
  const [filterOptions, setFilterOptions] = useState(
    DEFAULT_USER_FILTER_OPTIONS,
  )

  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState(DEFAULT_USER_PAGINATION)
  const [pageSize, setPageSize] = useState(10)
  const [userLoading, setUserLoading] = useState(true)
  const [userError, setUserError] = useState("")
  const [userRefreshKey, setUserRefreshKey] = useState(0)

  const [formMode, setFormMode] = useState(null)
  const [editingUser, setEditingUser] = useState(null)

  const [roles, setRoles] = useState([])
  const [departmentProfiles, setDepartmentProfiles] = useState([])
  const [selectedRoleId, setSelectedRoleId] = useState("")
  const [permissionGroups, setPermissionGroups] = useState([])
  const [permissionLoading, setPermissionLoading] = useState(false)
  const [permissionError, setPermissionError] = useState("")
  const [permissionDirty, setPermissionDirty] = useState(false)
  const [permissionSaving, setPermissionSaving] = useState(false)
  const canWriteSelectedPermissions =
    canWriteRoles &&
    (canWriteGlobalRoles || !isRolePermissionProfile(selectedRoleId))

  const activeTab =
    selectedTab === "permissions" && !canManageRoles
      ? "users"
      : selectedTab === "users" && !canManageUsers && canManageRoles
        ? "permissions"
        : selectedTab

  useEffect(() => {
    if (!ready || (!canManageUsers && !canManageRoles)) {
      return
    }

    let ignore = false

    async function loadInitialOptions() {
      try {
        const [
          nextFilterOptions,
          nextUserRoles,
          nextPermissionRoles,
          nextDepartmentProfiles,
        ] = await Promise.all([
          canManageUsers
            ? fetchUserFilterOptions()
            : Promise.resolve(DEFAULT_USER_FILTER_OPTIONS),
          canWriteUsers ? fetchRoles() : Promise.resolve([]),
          canManageRoles
            ? fetchPermissionRoles({ includeUserCounts: canManageUsers })
            : Promise.resolve([]),
          canManageRoles
            ? fetchDepartmentPermissionProfiles()
            : Promise.resolve([]),
        ])

        if (ignore) return

        const nextPermissionProfiles = buildPermissionProfiles(
          nextPermissionRoles,
          nextDepartmentProfiles,
          { includeRoleProfiles: canWriteGlobalRoles },
        )

        setFilterOptions(nextFilterOptions)
        setRoles(nextUserRoles)
        setDepartmentProfiles(nextPermissionProfiles)

        setSelectedRoleId((currentRoleId) => {
          if (!nextPermissionProfiles.length) return ""
          return nextPermissionProfiles.some((role) => role.id === currentRoleId)
            ? currentRoleId
            : nextPermissionProfiles[0].id
        })
      } catch {
        if (!ignore) {
          setFilterOptions(DEFAULT_USER_FILTER_OPTIONS)
          setRoles([])
          setDepartmentProfiles([])
          setSelectedRoleId("")
        }
      }
    }

    loadInitialOptions()

    return () => {
      ignore = true
    }
  }, [
    ready,
    canManageUsers,
    canWriteUsers,
    canManageRoles,
    canWriteGlobalRoles,
  ])

  useEffect(() => {
    if (!ready || !canManageUsers) {
      return
    }

    let ignore = false

    async function loadUsers() {
      setUserLoading(true)
      setUserError("")

      try {
        const data = await fetchUsers({
          ...appliedFilters,
          page: pagination.page,
          size: pageSize,
        })

        if (ignore) return

        setUsers(data.items)
        setPagination(data.pagination)
      } catch (requestError) {
        if (!ignore) {
          setUserError(
            requestError.message || "사용자 목록을 불러오지 못했습니다.",
          )
        }
      } finally {
        if (!ignore) {
          setUserLoading(false)
        }
      }
    }

    loadUsers()

    return () => {
      ignore = true
    }
  }, [
    ready,
    canManageUsers,
    appliedFilters,
    pagination.page,
    pageSize,
    userRefreshKey,
  ])

  useEffect(() => {
    if (!ready || !canManageRoles || activeTab !== "permissions" || !selectedRoleId) {
      return
    }

    let ignore = false

    async function loadPermissions() {
      setPermissionLoading(true)
      setPermissionError("")

      try {
        const data = isRolePermissionProfile(selectedRoleId)
          ? await fetchRolePermissions(roleCodeFromPermissionProfileId(selectedRoleId))
          : await fetchDepartmentPermissions(selectedRoleId)

        if (!ignore) {
          setPermissionGroups(data)
          setPermissionDirty(false)
        }
      } catch (requestError) {
        if (!ignore) {
          setPermissionError(
            requestError.message || "권한 정보를 불러오지 못했습니다.",
          )
        }
      } finally {
        if (!ignore) {
          setPermissionLoading(false)
        }
      }
    }

    loadPermissions()

    return () => {
      ignore = true
    }
  }, [ready, canManageRoles, activeTab, selectedRoleId])

  function updateFilter(name, value) {
    setDraftFilters((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function searchUsers(event) {
    event.preventDefault()
    setPagination((current) => ({ ...current, page: 1 }))
    setAppliedFilters({ ...draftFilters })
  }

  function resetFilters() {
    setDraftFilters({ ...DEFAULT_USER_FILTERS })
    setPagination((current) => ({ ...current, page: 1 }))
    setAppliedFilters({ ...DEFAULT_USER_FILTERS })
  }

  function movePage(nextPage) {
    const safePage = Math.min(Math.max(nextPage, 1), pagination.totalPages)
    setPagination((current) => ({ ...current, page: safePage }))
  }

  function changePageSize(nextPageSize) {
    setPageSize(nextPageSize)
    setPagination((current) => ({ ...current, page: 1 }))
  }

  function openUserCreate() {
    setEditingUser(null)
    setFormMode("create")
  }

  function openUserEdit(user) {
    setEditingUser(user)
    setFormMode("edit")
  }

  function closeUserForm() {
    setEditingUser(null)
    setFormMode(null)
  }

  async function reloadRoles() {
    if (!canManageUsers) {
      return
    }

    const nextRoles = await fetchRoles()
    setRoles(nextRoles)
  }

  async function saveUser(form) {
    if (!canWriteUsers) {
      throw new Error("사용자를 관리할 권한이 없습니다.")
    }

    if (formMode === "edit" && editingUser) {
      const nextRoleIds = form.roleIds?.length ? form.roleIds : [form.roleId]
      const currentRoleIds = editingUser.roleIds?.length
        ? editingUser.roleIds
        : [editingUser.roleId]

      await updateUser(editingUser.id, form, {
        delegateOnly,
        skipRoles: !delegateOnly && isSameRoleSet(nextRoleIds, currentRoleIds),
        skipDepartmentAuthorization:
          delegateOnly &&
          Boolean(form.departmentAuthorized) ===
            Boolean(editingUser.departmentAuthorized),
      })
    } else {
      await createUser(form)
      setPagination((current) => ({ ...current, page: 1 }))
    }

    closeUserForm()
    setUserRefreshKey((current) => current + 1)

    reloadRoles().catch(() => {
      // 사용자 저장은 완료되었으므로 인원 수 갱신 실패는 무시합니다.
    })
  }

  // 가입 승인 (PENDING → ACTIVE)
  async function approveUser(user) {
    if (!canWriteUsers) {
      window.alert("사용자를 승인할 권한이 없습니다.")
      return
    }

    try {
      await requestApproveUser(user.id)
      setUserRefreshKey((current) => current + 1)
      reloadRoles().catch(() => {})
    } catch (requestError) {
      window.alert(requestError.message || "승인에 실패했습니다.")
    }
  }

  function selectRole(roleId) {
    if (permissionDirty) {
      const confirmed = window.confirm(
        "저장하지 않은 권한 변경 사항이 있습니다. 이동하시겠습니까?",
      )

      if (!confirmed) return
    }

    setSelectedRoleId(roleId)
  }

  function togglePermission(groupKey, permissionKey) {
    setPermissionGroups((currentGroups) =>
      currentGroups.map((group) =>
        group.key === groupKey
          ? {
              ...group,
              permissions: group.permissions.map((permission) =>
                permission.key === permissionKey
                  ? { ...permission, checked: !permission.checked }
                  : permission,
              ),
            }
          : group,
      ),
    )

    setPermissionDirty(true)
  }

  async function savePermissions() {
    if (!canWriteSelectedPermissions) {
      setPermissionError("권한을 관리할 권한이 없습니다.")
      return
    }

    setPermissionSaving(true)
    setPermissionError("")

    try {
      const savedGroups = isRolePermissionProfile(selectedRoleId)
        ? await updateRolePermissions(
            roleCodeFromPermissionProfileId(selectedRoleId),
            permissionGroups,
          )
        : await updateDepartmentPermissions(selectedRoleId, permissionGroups, {
            includeSystemPermissions: canWriteGlobalRoles,
          })

      setPermissionGroups(savedGroups)
      setPermissionDirty(false)

      window.alert(
        "권한 설정이 저장되었습니다. 변경된 권한은 대상 사용자가 다시 로그인한 뒤 적용됩니다.",
      )
    } catch (requestError) {
      setPermissionError(
        requestError.message || "권한 설정을 저장하지 못했습니다.",
      )
    } finally {
      setPermissionSaving(false)
    }
  }

  return {
    activeTab,
    setActiveTab: setSelectedTab,
    draftFilters,
    filterOptions,
    users,
    pagination,
    pageSize,
    userLoading,
    userError,
    formMode,
    editingUser,
    roles,
    permissionRoles: departmentProfiles,
    selectedRoleId,
    permissionGroups,
    permissionLoading,
    permissionError,
    permissionDirty,
    permissionSaving,
    canWriteUsers,
    canWriteRoles,
    canWriteSelectedPermissions,
    updateFilter,
    searchUsers,
    resetFilters,
    movePage,
    changePageSize,
    openUserCreate,
    openUserEdit,
    closeUserForm,
    saveUser,
    approveUser,
    selectRole,
    togglePermission,
    savePermissions,
  }
}

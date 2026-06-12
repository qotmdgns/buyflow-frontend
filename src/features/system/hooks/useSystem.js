"use client"

import { useEffect, useState } from "react"
import {
  createUser,
  fetchRolePermissions,
  fetchRoles,
  fetchUserFilterOptions,
  fetchUsers,
  updateRolePermissions,
  updateUser,
} from "@/features/system/api/systemApi"
import {
  DEFAULT_USER_FILTER_OPTIONS,
  DEFAULT_USER_FILTERS,
  DEFAULT_USER_PAGINATION,
} from "@/features/system/utils/systemUtils"

export default function useSystem() {
  const [activeTab, setActiveTab] = useState("users")

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
  const [selectedRoleId, setSelectedRoleId] = useState("")
  const [permissionGroups, setPermissionGroups] = useState([])
  const [permissionLoading, setPermissionLoading] = useState(false)
  const [permissionError, setPermissionError] = useState("")
  const [permissionDirty, setPermissionDirty] = useState(false)
  const [permissionSaving, setPermissionSaving] = useState(false)

  useEffect(() => {
    let ignore = false

    async function loadInitialOptions() {
      try {
        const [nextFilterOptions, nextRoles] = await Promise.all([
          fetchUserFilterOptions(),
          fetchRoles(),
        ])

        if (ignore) return

        setFilterOptions(nextFilterOptions)
        setRoles(nextRoles)

        if (nextRoles.length > 0) {
          setSelectedRoleId(nextRoles[0].id)
        }
      } catch {
        if (!ignore) {
          setFilterOptions(DEFAULT_USER_FILTER_OPTIONS)
        }
      }
    }

    loadInitialOptions()

    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
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
  }, [appliedFilters, pagination.page, pageSize, userRefreshKey])

  useEffect(() => {
    if (activeTab !== "permissions" || !selectedRoleId) {
      return
    }

    let ignore = false

    async function loadPermissions() {
      setPermissionLoading(true)
      setPermissionError("")

      try {
        const data = await fetchRolePermissions(selectedRoleId)

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
  }, [activeTab, selectedRoleId])

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
    const nextRoles = await fetchRoles()
    setRoles(nextRoles)
  }

  async function saveUser(form) {
    if (formMode === "edit" && editingUser) {
      await updateUser(editingUser.id, form)
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
    setPermissionSaving(true)
    setPermissionError("")

    try {
      const savedGroups = await updateRolePermissions(
        selectedRoleId,
        permissionGroups,
      )

      setPermissionGroups(savedGroups)
      setPermissionDirty(false)

      window.alert("권한 설정이 저장되었습니다.")
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
    setActiveTab,
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
    selectedRoleId,
    permissionGroups,
    permissionLoading,
    permissionError,
    permissionDirty,
    permissionSaving,
    updateFilter,
    searchUsers,
    resetFilters,
    movePage,
    changePageSize,
    openUserCreate,
    openUserEdit,
    closeUserForm,
    saveUser,
    selectRole,
    togglePermission,
    savePermissions,
  }
}

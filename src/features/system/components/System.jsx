"use client"

import { ShieldCheck, UsersRound } from "lucide-react"
import RolePermissionPanel from "./RolePermissionPanel"
import SystemPagination from "./SystemPagination"
import UserFormModal from "./UserFormModal"
import UserSearchForm from "./UserSearchForm"
import UserTable from "./UserTable"
import useSystem from "../hooks/useSystem"
import { hasPermission, hasRole } from "@/utils/permissions"
import useClientReady from "@/utils/useClientReady"

export default function System() {
  const ready = useClientReady()
  const admin = ready && hasRole("ADMIN")
  const teamManager = ready && hasRole("TEAM_MANAGER")
  const canReadUsers =
    ready &&
    (admin ||
      hasPermission("users.read") ||
      hasPermission("users.write") ||
      hasPermission("USER_MANAGE"))
  const canWriteUsers =
    ready && (admin || hasPermission("users.write") || hasPermission("USER_MANAGE"))
  const canReadRoles =
    ready &&
    (admin ||
      hasPermission("roles.read") ||
      hasPermission("roles.write") ||
      hasPermission("ROLE_MANAGE"))
  const canWriteRoles =
    ready && (admin || hasPermission("roles.write") || hasPermission("ROLE_MANAGE"))
  const access = {
    admin,
    teamManager,
    users: canReadUsers,
    userWrite: canWriteUsers,
    roles: canReadRoles,
    roleWrite: canWriteRoles,
    ready,
  }
  const delegateOnly = access.teamManager && !access.admin
  const management = useSystem({
    delegateOnly,
    canManageUsers: access.users,
    canWriteUsers: access.userWrite,
    canManageRoles: access.roles,
    canWriteRoles: access.roleWrite,
    canWriteGlobalRoles: access.admin,
    ready: access.ready,
  })

  // 마운트 전에는 깜빡임 방지로 렌더하지 않는다
  if (!access.ready) {
    return null
  }

  // 두 탭 모두 권한 없음 → 페이지 접근 차단
  if (!access.users && !access.roles) {
    return (
      <div>
        <header className="mb-3">
          <h1 className="text-[22px] font-bold">시스템 관리</h1>
        </header>

        <div className="rounded-lg border border-slate-200 bg-white px-4 py-16 text-center text-[14px] text-slate-500">
          이 페이지에 접근할 권한이 없습니다. 시스템 관리자에게 문의하세요.
        </div>
      </div>
    )
  }

  // 활성 탭이 권한 없는 탭이면 허용된 탭으로 보정
  const effectiveTab =
    management.activeTab === "permissions" && !access.roles
      ? "users"
      : management.activeTab === "users" && !access.users
        ? "permissions"
        : management.activeTab

  return (
    <div className="w-full">
      <header className="bf-page-header">
        <div>
          <p className="bf-page-eyebrow">SYSTEM</p>

          <h1 className="bf-page-title">시스템 관리</h1>

          <p className="bf-page-description">
            사용자 계정과 역할별 접근 권한을 관리합니다.
          </p>
        </div>
      </header>

      <div className="mb-3 flex gap-1 rounded-lg border border-slate-200 bg-white p-1">
        {access.users && (
          <button
            type="button"
            onClick={() => management.setActiveTab("users")}
            className={`flex items-center gap-1 rounded-md px-3 py-2 text-[13px] font-semibold ${
              effectiveTab === "users"
                ? "bg-blue-600 text-white"
                : "text-slate-500"
            }`}
          >
            <UsersRound size={15} />
            사용자 관리
          </button>
        )}

        {access.roles && (
          <button
            type="button"
            onClick={() => management.setActiveTab("permissions")}
            className={`flex items-center gap-1 rounded-md px-3 py-2 text-[13px] font-semibold ${
              effectiveTab === "permissions"
                ? "bg-blue-600 text-white"
                : "text-slate-500"
            }`}
          >
            <ShieldCheck size={15} />
            권한 관리
          </button>
        )}
      </div>

      {effectiveTab === "users" ? (
        <>
          <UserSearchForm
            filters={management.draftFilters}
            filterOptions={management.filterOptions}
            onChange={management.updateFilter}
            onSearch={management.searchUsers}
            onReset={management.resetFilters}
          />

          <section className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <span className="font-bold">
                사용자 목록 · 총 {management.pagination.totalElements}건
              </span>
            </div>

            <UserTable
              users={management.users}
              loading={management.userLoading}
              error={management.userError}
              onEdit={access.userWrite ? management.openUserEdit : null}
              onApprove={access.userWrite && !delegateOnly ? management.approveUser : null}
            />

            <SystemPagination
              pagination={management.pagination}
              pageSize={management.pageSize}
              onChangePageSize={management.changePageSize}
              onMovePage={management.movePage}
            />
          </section>
        </>
      ) : (
        <RolePermissionPanel
          roles={management.permissionRoles}
          selectedRoleId={management.selectedRoleId}
          permissionGroups={management.permissionGroups}
          loading={management.permissionLoading}
          error={management.permissionError}
          dirty={management.permissionDirty}
          saving={management.permissionSaving}
          canWrite={management.canWriteSelectedPermissions}
          canWriteSystemPermissions={access.admin}
          onSelectRole={management.selectRole}
          onTogglePermission={management.togglePermission}
          onSave={management.savePermissions}
        />
      )}

      {management.formMode && access.userWrite && (
        <UserFormModal
          key={`${management.formMode}-${management.editingUser?.id ?? "new"}`}
          mode={management.formMode}
          initialValue={management.editingUser}
          roles={management.roles}
          departments={management.filterOptions.departments}
          delegateMode={delegateOnly}
          onClose={management.closeUserForm}
          onSubmit={management.saveUser}
        />
      )}
    </div>
  )
}

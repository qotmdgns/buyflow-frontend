"use client"

import { Plus, ShieldCheck, UsersRound } from "lucide-react"
import RolePermissionPanel from "./RolePermissionPanel"
import SystemPagination from "./SystemPagination"
import UserFormModal from "./UserFormModal"
import UserSearchForm from "./UserSearchForm"
import UserTable from "./UserTable"
import useSystem from "../hooks/useSystem"

export default function System() {
  const management = useSystem()

  return (
    <div>
      <header className="mb-3">
        <h1 className="text-[22px] font-bold">시스템 관리</h1>

        <p className="mt-1 text-[13px] text-slate-400">
          사용자 계정과 역할별 접근 권한을 관리합니다.
        </p>
      </header>

      <div className="mb-3 flex gap-1 rounded-lg border border-slate-200 bg-white p-1">
        <button
          type="button"
          onClick={() => management.setActiveTab("users")}
          className={`flex items-center gap-1 rounded-md px-3 py-2 text-[13px] font-semibold ${
            management.activeTab === "users"
              ? "bg-blue-600 text-white"
              : "text-slate-500"
          }`}
        >
          <UsersRound size={15} />
          사용자 관리
        </button>

        <button
          type="button"
          onClick={() => management.setActiveTab("permissions")}
          className={`flex items-center gap-1 rounded-md px-3 py-2 text-[13px] font-semibold ${
            management.activeTab === "permissions"
              ? "bg-blue-600 text-white"
              : "text-slate-500"
          }`}
        >
          <ShieldCheck size={15} />
          권한 관리
        </button>
      </div>

      {management.activeTab === "users" ? (
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

              <button
                type="button"
                onClick={management.openUserCreate}
                className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-2 text-[13px] font-semibold text-white"
              >
                <Plus size={14} />
                신규 사용자 등록
              </button>
            </div>

            <UserTable
              users={management.users}
              loading={management.userLoading}
              error={management.userError}
              onEdit={management.openUserEdit}
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
          roles={management.roles}
          selectedRoleId={management.selectedRoleId}
          permissionGroups={management.permissionGroups}
          loading={management.permissionLoading}
          error={management.permissionError}
          dirty={management.permissionDirty}
          saving={management.permissionSaving}
          onSelectRole={management.selectRole}
          onTogglePermission={management.togglePermission}
          onSave={management.savePermissions}
        />
      )}

      {management.formMode && (
        <UserFormModal
          key={`${management.formMode}-${management.editingUser?.id ?? "new"}`}
          mode={management.formMode}
          initialValue={management.editingUser}
          roles={management.roles}
          onClose={management.closeUserForm}
          onSubmit={management.saveUser}
        />
      )}
    </div>
  )
}

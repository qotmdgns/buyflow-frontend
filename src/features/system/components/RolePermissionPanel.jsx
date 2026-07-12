import { Save } from "lucide-react"
import { SYSTEM_PERMISSION_GROUP } from "@/features/system/api/systemApi"

export default function RolePermissionPanel({
  roles,
  selectedRoleId,
  permissionGroups,
  loading,
  error,
  dirty,
  saving,
  canWrite = true,
  canWriteSystemPermissions = false,
  onSelectRole,
  onTogglePermission,
  onSave,
}) {
  const selectedRole = roles.find((role) => role.id === selectedRoleId)

  return (
    <section className="grid gap-3 lg:grid-cols-[260px_1fr]">
      <div className="rounded-lg border border-slate-200 bg-white p-2">
        {roles.map((role) => (
          <button
            key={role.id}
            type="button"
            onClick={() => onSelectRole(role.id)}
            className={`mb-1 w-full rounded-md px-3 py-3 text-left ${
              role.id === selectedRoleId ? "bg-blue-50" : "hover:bg-slate-50"
            }`}
          >
            <div className="flex justify-between text-[13px] font-bold">
              <span>{role.name}</span>
              <span>{role.userCount ?? 0}명</span>
            </div>

            <p className="mt-1 text-[12px] text-slate-400">
              {role.description}
            </p>
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold">{selectedRole?.name ?? "권한 설정"}</h2>

          <button
            type="button"
            disabled={!canWrite || !dirty || saving}
            onClick={onSave}
            className="flex h-9 items-center gap-1 rounded-md bg-blue-600 px-3 text-[13px] font-semibold text-white disabled:opacity-40"
          >
            <Save size={14} />
            {saving ? "저장 중..." : "권한 저장"}
          </button>
        </div>

        {loading || error ? (
          <p className="py-20 text-center text-slate-400">
            {loading ? "권한 정보를 불러오는 중입니다." : error}
          </p>
        ) : (
          permissionGroups.map((group) => (
            <div
              key={group.key}
              className="grid border-t border-slate-100 py-3 md:grid-cols-[180px_1fr]"
            >
              <strong className="text-[13px]">{group.label}</strong>

              <div className="grid gap-2 sm:grid-cols-2">
                {group.permissions.map((permission) => (
                  <label key={permission.key} className="text-[13px]">
                    <input
                      type="checkbox"
                      checked={permission.checked}
                      disabled={
                        !canWrite ||
                        (!canWriteSystemPermissions &&
                          group.key === SYSTEM_PERMISSION_GROUP)
                      }
                      onChange={() =>
                        onTogglePermission(group.key, permission.key)
                      }
                      className="mr-2 accent-blue-600"
                    />

                    {permission.label}
                  </label>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}

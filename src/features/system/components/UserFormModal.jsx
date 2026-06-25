"use client"

import { useState } from "react"
import {
  EMPTY_USER_FORM,
  validateUserForm,
} from "@/features/system/utils/systemUtils"

const USER_RANK_OPTIONS = ["사원", "주임", "대리", "과장", "팀장"]
const USER_FORM_ROLE_CODES = new Set(["VIEWER", "TEAM_MANAGER"])
const USER_FORM_ROLE_LABELS = {
  VIEWER: "조회 전용",
  TEAM_MANAGER: "부서 팀장",
}

// roles 목록에서 코드(VIEWER 등)에 해당하는 role.id 를 찾는다.
// role.id 형식이 "VIEWER" / "ROLE_VIEWER" / 숫자+code 어느 쪽이든 대응.
function normalizeRoleCode(roleOrCode) {
  const value =
    typeof roleOrCode === "object"
      ? roleOrCode.roleCode ?? roleOrCode.code ?? roleOrCode.id
      : roleOrCode

  return String(value ?? "").replace(/^ROLE_/, "")
}

function findRoleIdByCode(roles, code) {
  if (!code) return null
  const match = roles.find(
    (role) =>
      normalizeRoleCode(role.id) === code ||
      normalizeRoleCode(role.code) === code ||
      normalizeRoleCode(role.roleCode) === code,
  )
  return match ? match.id : null
}

// ADMIN(시스템 관리자) 역할인지 — 등록 폼 드롭다운에서 숨기기 위함
function isAdminRole(role) {
  return normalizeRoleCode(role) === "ADMIN" || role.group === "SYSTEM"
}

function isUserFormRole(role) {
  return USER_FORM_ROLE_CODES.has(normalizeRoleCode(role))
}

function getRoleLabel(role) {
  const code = normalizeRoleCode(role)
  return USER_FORM_ROLE_LABELS[code] ?? role.name
}

// 생성 시 안전한 기본 역할: VIEWER → 표시 가능한 첫 항목 순으로 폴백
// (roles[0]=ADMIN 이 기본으로 잡혀 슈퍼유저가 양산되는 것을 방지)
function safeDefaultRoleId(roles) {
  return (
    findRoleIdByCode(roles, "VIEWER") ||
    roles.find((role) => isUserFormRole(role))?.id ||
    ""
  )
}

function normalizeRoleIds(base, roles) {
  if (base.roleIds?.length > 0) {
    return base.roleIds
  }

  const roleId = base.roleId || safeDefaultRoleId(roles)
  return roleId ? [roleId] : []
}

function normalizeRankOption(value) {
  if (!value) return ""
  if (USER_RANK_OPTIONS.includes(value)) return value
  if (value.includes("팀장")) return "팀장"
  return ""
}

function normalizeDepartmentOptions(departments) {
  return [
    ...new Set(
      (departments ?? []).filter(
        (department) => department && department !== "전체",
      ),
    ),
  ]
}

function normalizeDepartmentOption(value, departmentOptions) {
  if (!value) return ""
  return departmentOptions.includes(value) ? value : ""
}

export default function UserFormModal({
  mode,
  initialValue,
  roles,
  departments = [],
  delegateMode = false,
  onClose,
  onSubmit,
}) {
  const base = { ...EMPTY_USER_FORM, ...initialValue }
  const departmentOptions = normalizeDepartmentOptions(departments)
  const initialRoleIds = normalizeRoleIds(base, roles)

  const [form, setForm] = useState({
    ...base,
    department: normalizeDepartmentOption(base.department, departmentOptions),
    position: normalizeRankOption(base.position),
    roleIds: initialRoleIds,
    roleId: base.roleId || initialRoleIds[0] || "",
    departmentAuthorized: base.departmentAuthorized ?? true,
  })

  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState("")

  const selectableRoles = roles.filter(
    (role) => !isAdminRole(role) && isUserFormRole(role),
  )

  const updateForm = (name, value) => {
    setForm((current) => {
      return { ...current, [name]: value }
    })

    setErrors((current) => ({ ...current, [name]: "" }))
  }

  const handleRoleToggle = (value) => {
    setForm((current) => {
      const hasRole = current.roleIds.includes(value)
      const roleIds = hasRole
        ? current.roleIds.filter((roleId) => roleId !== value)
        : [...current.roleIds, value]

      return {
        ...current,
        roleIds,
        roleId: roleIds[0] || "",
      }
    })

    setErrors((current) => ({ ...current, roleId: "", roleIds: "" }))
  }

  const submitForm = async (event) => {
    event.preventDefault()

    const nextErrors = validateUserForm(form)

    if (delegateMode) {
      Object.keys(nextErrors).forEach((key) => {
        delete nextErrors[key]
      })
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    try {
      await onSubmit(form)
    } catch (error) {
      setSubmitError(error.message)
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/45 px-4">
      <form
        onSubmit={submitForm}
        className="w-full max-w-[680px] rounded-lg bg-white p-5 shadow-2xl"
      >
        <h2 className="mb-4 text-[17px] font-bold">
          {delegateMode
            ? "부서원 자격 변경"
            : mode === "edit"
              ? "사용자 정보 수정"
              : "신규 사용자 등록"}
        </h2>

        <div className="grid gap-3 md:grid-cols-2">
          {[
            ["employeeNo", "사번", "EMP-001"],
            ["name", "사용자명", "이름 입력"],
            ["email", "이메일", "user@buyflow.co.kr"],
            ["department", "부서", "물류운영팀"],
            ["position", "직급", "사원"],
          ].map(([name, label, placeholder]) => (
            <label key={name}>
              <span className="mb-1 block text-[13px] font-semibold">
                {label}
              </span>

              {name === "department" ? (
                <select
                  value={form[name]}
                  disabled={delegateMode}
                  onChange={(event) => updateForm(name, event.target.value)}
                  className="h-10 w-full rounded-md border border-slate-200 px-3 text-[13px] disabled:bg-slate-50 disabled:text-slate-400"
                >
                  <option value="" disabled>
                    부서 선택
                  </option>

                  {departmentOptions.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </select>
              ) : name === "position" ? (
                <select
                  value={form[name]}
                  disabled={delegateMode}
                  onChange={(event) => updateForm(name, event.target.value)}
                  className="h-10 w-full rounded-md border border-slate-200 px-3 text-[13px] disabled:bg-slate-50 disabled:text-slate-400"
                >
                  <option value="" disabled>
                    직급 선택
                  </option>

                  {USER_RANK_OPTIONS.map((rank) => (
                    <option key={rank} value={rank}>
                      {rank}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  value={form[name]}
                  placeholder={placeholder}
                  disabled={delegateMode}
                  onChange={(event) => updateForm(name, event.target.value)}
                  className="h-10 w-full rounded-md border border-slate-200 px-3 text-[13px] disabled:bg-slate-50 disabled:text-slate-400"
                />
              )}

              {errors[name] && (
                <p className="mt-1 text-[12px] text-rose-500">{errors[name]}</p>
              )}
            </label>
          ))}

          <div>
            <span className="mb-1 block text-[13px] font-semibold">
              {delegateMode ? "부서원 자격" : "권한 그룹"}
            </span>

            {delegateMode ? (
              <label className="flex min-h-10 items-center gap-2 rounded-md border border-slate-200 p-2 text-[13px]">
                <input
                  type="checkbox"
                  checked={Boolean(form.departmentAuthorized)}
                  onChange={(event) =>
                    updateForm("departmentAuthorized", event.target.checked)
                  }
                  className="accent-blue-600"
                />
                부서 권한 사용 허용
              </label>
            ) : (
              <div className="grid min-h-10 gap-2 rounded-md border border-slate-200 p-2">
                {selectableRoles.map((role) => (
                  <label
                    key={role.id}
                    className="flex items-center gap-2 text-[13px]"
                  >
                    <input
                      type="checkbox"
                      checked={form.roleIds.includes(role.id)}
                      onChange={() => handleRoleToggle(role.id)}
                      className="accent-blue-600"
                    />
                    {getRoleLabel(role)}
                  </label>
                ))}
              </div>
            )}

            {!delegateMode && (errors.roleIds || errors.roleId) && (
              <p className="mt-1 text-[12px] text-rose-500">
                {errors.roleIds || errors.roleId}
              </p>
            )}

          </div>

          <label>
            <span className="mb-1 block text-[13px] font-semibold">
              사용 여부
            </span>

            <select
              value={form.activeStatus}
              disabled={delegateMode}
              onChange={(event) =>
                updateForm("activeStatus", event.target.value)
              }
              className="h-10 w-full rounded-md border border-slate-200 px-3 text-[13px] disabled:bg-slate-50 disabled:text-slate-400"
            >
              <option>사용 중</option>
              <option>사용 중지</option>
            </select>
          </label>
        </div>

        {submitError && (
          <p className="mt-3 text-[13px] text-rose-500">{submitError}</p>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-200 px-4 py-2 text-[13px]"
          >
            취소
          </button>

          <button className="rounded-md bg-blue-600 px-4 py-2 text-[13px] font-semibold text-white">
            {delegateMode ? "자격 저장" : "저장하기"}
          </button>
        </div>
      </form>
    </div>
  )
}

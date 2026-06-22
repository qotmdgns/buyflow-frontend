"use client"

import { useState } from "react"
import {
  EMPTY_USER_FORM,
  validateUserForm,
} from "@/features/system/utils/systemUtils"
import { recommendRole } from "@/features/system/utils/recommendRole"

// roles 목록에서 코드(WAREHOUSE 등)에 해당하는 role.id 를 찾는다.
// role.id 형식이 "WAREHOUSE" / "ROLE_WAREHOUSE" / 숫자+code 어느 쪽이든 대응.
function findRoleIdByCode(roles, code) {
  if (!code) return null
  const match = roles.find(
    (role) =>
      role.id === code ||
      role.id === `ROLE_${code}` ||
      role.code === code ||
      role.roleCode === code,
  )
  return match ? match.id : null
}

// 부서·직급 → 추천 역할 id (목록에 없으면 null)
function recommendedRoleId(roles, department, position) {
  return findRoleIdByCode(roles, recommendRole(department, position))
}

// ADMIN(시스템 관리자) 역할인지 — 등록 폼 드롭다운에서 숨기기 위함
function isAdminRole(role) {
  return (
    role.id === "ADMIN" ||
    role.id === "ROLE_ADMIN" ||
    role.code === "ADMIN" ||
    role.roleCode === "ADMIN" ||
    role.group === "SYSTEM"
  )
}

// 생성 시 안전한 기본 역할: 추천값 → VIEWER → ADMIN 아닌 첫 항목 순으로 폴백
// (roles[0]=ADMIN 이 기본으로 잡혀 슈퍼유저가 양산되는 것을 방지)
function safeDefaultRoleId(roles, department, position) {
  return (
    recommendedRoleId(roles, department, position) ||
    findRoleIdByCode(roles, "VIEWER") ||
    roles.find((role) => !isAdminRole(role))?.id ||
    roles[0]?.id ||
    ""
  )
}

export default function UserFormModal({
  mode,
  initialValue,
  roles,
  onClose,
  onSubmit,
}) {
  const base = { ...EMPTY_USER_FORM, ...initialValue }

  const [form, setForm] = useState({
    ...base,
    roleId:
      base.roleId || safeDefaultRoleId(roles, base.department, base.position),
  })

  // 수정 모드이거나 admin이 권한 그룹을 직접 고르면, 부서·직급 변경에 따른
  // 자동 추천을 더 이상 덮어쓰지 않는다.
  const [roleTouched, setRoleTouched] = useState(mode === "edit")

  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState("")

  // 권한 그룹 드롭다운: ADMIN(시스템 관리자)은 숨긴다.
  // 단, 현재 선택값이 ADMIN이면(기존 admin 사용자 수정 중) 값 유지를 위해 표시.
  const selectableRoles = roles.filter(
    (role) => !isAdminRole(role) || role.id === form.roleId,
  )

  const updateForm = (name, value) => {
    setForm((current) => {
      const next = { ...current, [name]: value }

      // 부서/직급을 바꾸면, 아직 역할을 손대지 않은 경우에만 추천 역할로 자동 세팅
      if ((name === "department" || name === "position") && !roleTouched) {
        const suggested = recommendedRoleId(roles, next.department, next.position)
        if (suggested) {
          next.roleId = suggested
        }
      }

      return next
    })

    setErrors((current) => ({ ...current, [name]: "" }))
  }

  const handleRoleChange = (value) => {
    setRoleTouched(true)
    updateForm("roleId", value)
  }

  const submitForm = async (event) => {
    event.preventDefault()

    const nextErrors = validateUserForm(form)

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
          {mode === "edit" ? "사용자 정보 수정" : "신규 사용자 등록"}
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

              <input
                value={form[name]}
                placeholder={placeholder}
                onChange={(event) => updateForm(name, event.target.value)}
                className="h-10 w-full rounded-md border border-slate-200 px-3 text-[13px]"
              />

              {errors[name] && (
                <p className="mt-1 text-[12px] text-rose-500">{errors[name]}</p>
              )}
            </label>
          ))}

          <label>
            <span className="mb-1 block text-[13px] font-semibold">
              권한 그룹
            </span>

            <select
              value={form.roleId}
              onChange={(event) => handleRoleChange(event.target.value)}
              className="h-10 w-full rounded-md border border-slate-200 px-3 text-[13px]"
            >
              {selectableRoles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>

            {mode !== "edit" && !roleTouched && (
              <p className="mt-1 text-[12px] text-slate-400">
                부서·직급에 따라 자동 추천됩니다. 필요하면 직접 바꾸세요.
              </p>
            )}
          </label>

          <label>
            <span className="mb-1 block text-[13px] font-semibold">
              사용 여부
            </span>

            <select
              value={form.activeStatus}
              onChange={(event) =>
                updateForm("activeStatus", event.target.value)
              }
              className="h-10 w-full rounded-md border border-slate-200 px-3 text-[13px]"
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
            저장하기
          </button>
        </div>
      </form>
    </div>
  )
}

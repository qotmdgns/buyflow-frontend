"use client"

import { useState } from "react"
import {
  EMPTY_USER_FORM,
  validateUserForm,
} from "@/features/system/utils/systemUtils"

export default function UserFormModal({
  mode,
  initialValue,
  roles,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState({
    ...EMPTY_USER_FORM,
    ...initialValue,
    roleId: initialValue?.roleId || roles[0]?.id || "",
  })

  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState("")

  const updateForm = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: "" }))
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
              onChange={(event) => updateForm("roleId", event.target.value)}
              className="h-10 w-full rounded-md border border-slate-200 px-3 text-[13px]"
            >
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
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

"use client"

import { useMemo, useState } from "react"
import {
  BadgeCheck,
  Building2,
  CheckCircle2,
  Hash,
  IdCard,
  KeyRound,
  Lock,
  Mail,
  Phone,
  RotateCcw,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react"
import { useAuth } from "@/features/auth/context/AuthContext"

const INPUT_CLASS_NAME =
  "h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-[13px] text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"

const PERMISSION_LABELS = {
  "dashboard.read": "대시보드 조회",
  "products.read": "품목 조회",
  "products.write": "품목 등록·수정",
  "suppliers.read": "공급업체 조회",
  "suppliers.write": "공급업체 등록·수정",
  "warehouses.read": "창고 조회",
  "warehouses.write": "창고 등록·수정",
  "purchase-requests.read": "구매 요청 조회",
  "purchase-requests.write": "구매 요청 등록·수정",
  "approvals.read": "승인 조회",
  "approvals.process": "승인 처리",
  "purchase-orders.read": "발주 조회",
  "purchase-orders.write": "발주 등록·수정",
  "receipts.read": "입고 조회",
  "receipts.write": "입고 등록·수정",
  "inspections.read": "검수 조회",
  "inspections.process": "검수 처리",
  "stock.read": "재고 현황 조회",
  "stock.adjust": "재고 조정",
  "stock-history.read": "재고 이력 조회",
  "users.read": "사용자 조회",
  "users.write": "사용자 등록·수정",
  "roles.write": "권한 설정 변경",
}

function getInitial(name) {
  return name?.slice(0, 1) || "U"
}

function getValue(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== "") ?? ""
}

function formatDateTime(value) {
  if (!value) return "-"

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return String(value)
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

function getProfile(user) {
  return {
    userId: getValue(user?.userId, user?.employeeNo),
    employeeNo: getValue(user?.employeeNo, user?.userId, user?.loginId),
    loginId: getValue(user?.loginId),
    name: getValue(user?.name, user?.userName),
    email: getValue(user?.email),
    phone: getValue(user?.phone),
    department: getValue(user?.department, user?.departmentName),
    rank: getValue(user?.rank, user?.jobRank, user?.positionName),
    role: getValue(user?.role),
    accountStatus: getValue(user?.accountStatus, user?.status),
    createdAt: user?.createdAt,
    updatedAt: user?.updatedAt,
    roles: Array.isArray(user?.roles) ? user.roles : [],
    permissions: Array.isArray(user?.permissions) ? user.permissions : [],
  }
}

function validateProfileForm(form) {
  const errors = {}

  if (!form.userName.trim()) {
    errors.userName = "이름을 입력해 주세요."
  } else if (form.userName.trim().length > 50) {
    errors.userName = "이름은 50자 이하로 입력해 주세요."
  }

  if (!form.email.trim()) {
    errors.email = "이메일을 입력해 주세요."
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "올바른 이메일 형식으로 입력해 주세요."
  } else if (form.email.trim().length > 100) {
    errors.email = "이메일은 100자 이하로 입력해 주세요."
  }

  if (form.phone.trim() && form.phone.trim().length > 20) {
    errors.phone = "연락처는 20자 이하로 입력해 주세요."
  }

  return errors
}

function InfoItem({ icon: Icon, label, value, locked = false }) {
  return (
    <div className="flex min-h-16 items-center gap-3 rounded-md border border-slate-200 bg-white px-4 py-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-50 text-slate-500">
        <Icon size={17} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-400">
          <span>{label}</span>
          {locked && <Lock size={12} />}
        </div>

        <p className="mt-1 truncate text-[14px] font-semibold text-slate-800">
          {value || "-"}
        </p>
      </div>
    </div>
  )
}

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-bold text-slate-700">
        {label}
      </span>

      {children}

      {error && (
        <span className="mt-1.5 block text-[12px] font-semibold text-rose-500">
          {error}
        </span>
      )}
    </label>
  )
}

function PermissionBadge({ permission }) {
  const label = PERMISSION_LABELS[permission] ?? permission

  return (
    <span
      title={permission}
      className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[12px] font-semibold text-slate-600"
    >
      {label}
    </span>
  )
}

export default function MyPageManagement() {
  const { user, isAuthReady, updateProfile } = useAuth()
  const profile = useMemo(() => getProfile(user), [user])
  const baseForm = useMemo(
    () => ({
      userName: profile.name,
      email: profile.email,
      phone: profile.phone,
    }),
    [profile.name, profile.email, profile.phone],
  )

  const [draftForm, setDraftForm] = useState(null)
  const [errors, setErrors] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")
  const [permissionsExpanded, setPermissionsExpanded] = useState(false)

  const form = draftForm ?? baseForm
  const isDirty =
    form.userName !== baseForm.userName ||
    form.email !== baseForm.email ||
    form.phone !== baseForm.phone

  const visiblePermissions = permissionsExpanded
    ? profile.permissions
    : profile.permissions.slice(0, 8)
  const hiddenPermissionCount = Math.max(profile.permissions.length - 8, 0)

  function handleChange(event) {
    const { name, value } = event.target

    setDraftForm((prevForm) => ({
      ...(prevForm ?? baseForm),
      [name]: value,
    }))
    setSaveMessage("")
  }

  function handleReset() {
    setDraftForm(null)
    setErrors({})
    setSaveMessage("")
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const nextErrors = validateProfileForm(form)
    setErrors(nextErrors)
    setSaveMessage("")

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setIsSaving(true)

    try {
      await updateProfile(form)
      setDraftForm(null)
      setSaveMessage("내 정보가 저장되었습니다.")
    } catch (error) {
      setSaveMessage(error?.message || "내 정보를 저장하지 못했습니다.")
    } finally {
      setIsSaving(false)
    }
  }

  if (!isAuthReady) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="h-6 w-40 animate-pulse rounded bg-slate-100" />
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-16 animate-pulse rounded-md bg-slate-100"
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-[22px] font-black text-white shadow-sm">
              {getInitial(profile.name)}
            </div>

            <div className="min-w-0">
              <p className="text-[12px] font-black uppercase tracking-[0.12em] text-blue-600">
                My Page
              </p>

              <h1 className="mt-1 truncate text-[24px] font-black text-slate-900">
                {profile.name || profile.loginId || "내 정보"}
              </h1>

              <p className="mt-1 truncate text-[14px] font-semibold text-slate-500">
                {profile.department || "-"} · {profile.rank || "-"}
              </p>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <div className="rounded-md border border-blue-100 bg-blue-50 px-4 py-3">
              <p className="text-[12px] font-bold text-blue-500">권한 수</p>
              <p className="mt-1 text-[20px] font-black text-slate-900">
                {profile.permissions.length}개
              </p>
            </div>

            <div className="rounded-md border border-emerald-100 bg-emerald-50 px-4 py-3">
              <p className="text-[12px] font-bold text-emerald-500">계정 상태</p>
              <p className="mt-1 text-[20px] font-black text-slate-900">
                {profile.accountStatus || "-"}
              </p>
            </div>

            <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-[12px] font-bold text-slate-500">최근 수정</p>
              <p className="mt-1 text-[13px] font-bold text-slate-700">
                {formatDateTime(profile.updatedAt)}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="text-[17px] font-black text-slate-900">
                기본 정보 수정
              </h2>

              <p className="mt-1 text-[13px] text-slate-500">
                이름, 이메일, 연락처만 직접 변경할 수 있습니다.
              </p>
            </div>

            <BadgeCheck className="text-blue-500" size={22} />
          </div>

          <div className="grid gap-4 px-5 py-5 md:grid-cols-2">
            <Field label="이름" error={errors.userName}>
              <div className="relative">
                <UserRound
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  name="userName"
                  value={form.userName}
                  onChange={handleChange}
                  className={`${INPUT_CLASS_NAME} pl-9`}
                  placeholder="이름 입력"
                />
              </div>
            </Field>

            <Field label="이메일" error={errors.email}>
              <div className="relative">
                <Mail
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className={`${INPUT_CLASS_NAME} pl-9`}
                  placeholder="email@example.com"
                />
              </div>
            </Field>

            <Field label="연락처" error={errors.phone}>
              <div className="relative">
                <Phone
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className={`${INPUT_CLASS_NAME} pl-9`}
                  placeholder="010-0000-0000"
                />
              </div>
            </Field>

            <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-2 text-[13px] font-bold text-slate-700">
                <Lock size={15} className="text-slate-400" />
                조직 정보는 관리자만 변경
              </div>

              <p className="mt-1 text-[12px] text-slate-500">
                부서, 직급, 권한은 시스템 관리 또는 부서 팀장 승인 흐름을 통해
                관리됩니다.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p
              className={`min-h-5 text-[13px] font-semibold ${
                saveMessage.includes("못했습니다")
                  ? "text-rose-500"
                  : "text-emerald-600"
              }`}
            >
              {saveMessage}
            </p>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleReset}
                disabled={!isDirty || isSaving}
                className="flex h-9 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-4 text-[13px] font-bold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RotateCcw size={15} />
                되돌리기
              </button>

              <button
                type="submit"
                disabled={!isDirty || isSaving}
                className="flex h-9 items-center gap-1.5 rounded-md bg-blue-600 px-4 text-[13px] font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save size={15} />
                {isSaving ? "저장 중" : "저장하기"}
              </button>
            </div>
          </div>
        </form>

        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-[17px] font-black text-slate-900">
              계정 식별 정보
            </h2>
            <p className="mt-1 text-[13px] text-slate-500">
              변경할 수 없는 계정 기준 정보입니다.
            </p>
          </div>

          <div className="grid gap-3 p-5">
            <InfoItem
              icon={Hash}
              label="사원번호"
              value={profile.employeeNo}
              locked
            />
            <InfoItem icon={IdCard} label="아이디" value={profile.loginId} locked />
            <InfoItem
              icon={Building2}
              label="부서"
              value={profile.department}
              locked
            />
            <InfoItem icon={UserRound} label="직급" value={profile.rank} locked />
            <InfoItem
              icon={CheckCircle2}
              label="가입일"
              value={formatDateTime(profile.createdAt)}
              locked
            />
          </div>
        </section>
      </div>

      <section className="mt-4 rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-[17px] font-black text-slate-900">
              권한 정보
            </h2>
            <p className="mt-1 text-[13px] text-slate-500">
              권한은 읽기 전용입니다. 변경은 시스템 관리자 또는 부서 팀장에게
              요청해 주세요.
            </p>
          </div>

          <ShieldCheck className="text-blue-500" size={23} />
        </div>

        <div className="grid gap-4 p-5 lg:grid-cols-[320px_minmax(0,1fr)]">
          <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-4">
            <div className="flex items-center gap-2 text-[13px] font-bold text-slate-500">
              <KeyRound size={15} />
              권한 그룹
            </div>

            <p className="mt-3 text-[16px] font-black text-slate-900">
              {profile.role || "-"}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {profile.roles.length > 0 ? (
                profile.roles.map((role) => (
                  <span
                    key={role}
                    className="rounded-md border border-blue-100 bg-blue-50 px-2.5 py-1 text-[12px] font-bold text-blue-600"
                  >
                    {role}
                  </span>
                ))
              ) : (
                <span className="text-[13px] text-slate-400">-</span>
              )}
            </div>
          </div>

          <div className="rounded-md border border-slate-200 bg-white px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-[13px] font-bold text-slate-500">
                세부 권한
              </div>

              <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[12px] font-bold text-slate-500">
                총 {profile.permissions.length}개
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {visiblePermissions.length > 0 ? (
                <>
                  {visiblePermissions.map((permission) => (
                    <PermissionBadge key={permission} permission={permission} />
                  ))}
                  {hiddenPermissionCount > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        setPermissionsExpanded((expanded) => !expanded)
                      }
                      aria-expanded={permissionsExpanded}
                      className="rounded-md bg-slate-900 px-2.5 py-1 text-[12px] font-bold text-white transition hover:bg-slate-700"
                    >
                      {permissionsExpanded ? "접기" : `+${hiddenPermissionCount}`}
                    </button>
                  )}
                </>
              ) : (
                <span className="text-[13px] text-slate-400">
                  부여된 세부 권한이 없습니다.
                </span>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

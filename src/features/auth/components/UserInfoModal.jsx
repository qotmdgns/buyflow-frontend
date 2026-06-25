"use client"

import { useEffect } from "react"
import { createPortal } from "react-dom"
import {
  Building2,
  CircleCheck,
  Clock3,
  Hash,
  IdCard,
  LockKeyhole,
  LogOut,
  Mail,
  Phone,
  UserRound,
  X,
} from "lucide-react"

function getInitial(name) {
  return name?.slice(0, 1) ?? "U"
}

function getDisplayName(profile) {
  const displayName = [profile?.name, profile?.rank].filter(Boolean).join(" ")

  return displayName || profile?.loginId || "-"
}

function InfoRow({ icon: Icon, label, value, valueClassName = "" }) {
  return (
    <div className="grid grid-cols-[100px_minmax(0,1fr)] items-center gap-3 border-b border-slate-100 py-2.5 last:border-b-0">
      <div className="flex items-center gap-2 text-[12px] text-slate-400">
        <Icon size={14} className="shrink-0" />

        <span>{label}</span>
      </div>

      <div
        className={`min-w-0 break-words text-[12px] font-medium text-slate-700 ${valueClassName}`}
      >
        {value || "-"}
      </div>
    </div>
  )
}

export default function UserInfoModal({ user, onClose, onLogout }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose()
      }
    }

    const previousOverflow = document.body.style.overflow

    document.body.style.overflow = "hidden"
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [onClose])

  if (typeof document === "undefined") {
    return null
  }

  const profile = {
    employeeNo: user?.employeeNo ?? user?.userId ?? user?.loginId ?? "",
    loginId: user?.loginId ?? "",
    name: user?.name ?? user?.userName ?? "",
    rank: user?.rank ?? user?.jobRank ?? user?.positionName ?? "",
    department: user?.department ?? user?.departmentName ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    role:
      user?.role ??
      (Array.isArray(user?.roles) && user.roles.length > 0
        ? user.roles.join(", ")
        : ""),
    accountStatus: user?.accountStatus ?? user?.status ?? "",
    lastLoginAt: user?.lastLoginAt ?? "",
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 px-4 py-6"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-info-modal-title"
        className="flex overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
        style={{
          width: "min(92vw, 460px)",
          maxHeight: "min(86vh, 680px)",
          flexDirection: "column",
        }}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2
              id="user-info-modal-title"
              className="text-[17px] font-bold text-slate-900"
            >
              사용자 정보
            </h2>

            <p className="mt-1 text-[12px] text-slate-400">
              현재 로그인한 계정의 상세 정보입니다.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="사용자 정보 창 닫기"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[15px] font-bold text-white">
              {getInitial(profile.name)}
            </div>

            <div className="min-w-0">
              <p className="truncate text-[15px] font-bold text-slate-800">
                {getDisplayName(profile)}
              </p>

              <p className="mt-1 truncate text-[12px] font-medium text-emerald-500">
                ● {profile.department || "-"}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-slate-200 px-4">
            <InfoRow icon={Hash} label="사원번호" value={profile.employeeNo} />

            <InfoRow icon={IdCard} label="아이디" value={profile.loginId} />

            <InfoRow icon={Mail} label="이메일" value={profile.email} />

            <InfoRow icon={Phone} label="연락처" value={profile.phone} />

            <InfoRow icon={Building2} label="부서" value={profile.department} />

            <InfoRow icon={UserRound} label="직급" value={profile.rank} />

            <InfoRow icon={LockKeyhole} label="권한" value={profile.role} />

            <InfoRow
              icon={CircleCheck}
              label="계정 상태"
              value={profile.accountStatus}
              valueClassName="text-emerald-600"
            />

            <InfoRow
              icon={Clock3}
              label="최근 로그인"
              value={profile.lastLoginAt}
            />
          </div>
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-slate-100 bg-slate-50 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-md border border-slate-200 bg-white px-4 text-[12px] font-semibold text-slate-600 transition hover:bg-slate-100"
          >
            닫기
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="flex h-9 items-center justify-center gap-1.5 rounded-md bg-rose-500 px-4 text-[12px] font-semibold text-white transition hover:bg-rose-600"
          >
            <LogOut size={14} />
            로그아웃
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

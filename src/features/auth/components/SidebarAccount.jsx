"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { LogIn, LogOut, UserRound } from "lucide-react"
import UserInfoModal from "@/features/auth/components/UserInfoModal"
import { useAuth } from "@/features/auth/context/AuthContext"

function getInitial(name) {
  return name?.slice(0, 1) ?? "U"
}

function getDisplayName(user) {
  return [user?.name, user?.rank].filter(Boolean).join(" ")
}

export default function SidebarAccount() {
  const router = useRouter()
  const { user, isAuthReady, logout } = useAuth()

  const [isModalOpen, setIsModalOpen] = useState(false)

  function handleLogout() {
    logout()
    setIsModalOpen(false)

    router.replace("/login")
    router.refresh()
  }

  if (!isAuthReady) {
    return <div className="h-12 animate-pulse rounded-md bg-slate-100" />
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-3 rounded-md p-2 transition hover:bg-slate-50"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <UserRound size={16} />
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-slate-700">
            로그인이 필요합니다
          </p>

          <p className="truncate text-[12px] text-slate-400">
            계정으로 로그인하세요
          </p>
        </div>

        <LogIn size={14} className="shrink-0 text-slate-400" />
      </Link>
    )
  }

  return (
    <>
      <div className="flex items-center gap-1 rounded-md p-1 transition hover:bg-slate-50">
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-md p-1 text-left"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[12px] font-bold text-white">
            {getInitial(user.name)}
          </span>

          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-semibold text-slate-700">
              {getDisplayName(user)}
            </span>

            <span className="block truncate text-[12px] text-emerald-500">
              ● {user.department ?? "-"}
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={handleLogout}
          aria-label="로그아웃"
          title="로그아웃"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
        >
          <LogOut size={15} />
        </button>
      </div>

      {isModalOpen && (
        <UserInfoModal
          user={user}
          onClose={() => setIsModalOpen(false)}
          onLogout={handleLogout}
        />
      )}
    </>
  )
}

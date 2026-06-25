"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/features/auth/context/AuthContext"

export default function RequireAuth({ children }) {
  const router = useRouter()
  const { user, isAuthReady } = useAuth()

  useEffect(() => {
    if (isAuthReady && !user) {
      router.replace("/login")
    }
  }, [isAuthReady, router, user])

  if (!isAuthReady || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] text-[14px] font-semibold text-slate-500">
        로그인 상태를 확인하는 중입니다.
      </div>
    )
  }

  return children
}

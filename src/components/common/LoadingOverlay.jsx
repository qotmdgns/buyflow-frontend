"use client"

import { useEffect, useRef, useState } from "react"

export default function LoadingOverlay({
  show = true,
  message = "BuyFlow ERP 데이터를 처리하는 중입니다.",
  description = "기업 구매 프로세스 정보를 불러오고 있습니다.",
  imageSrc = "/images/buyflow-erp/loading.svg",
  minDuration = 900,
}) {
  const [visible, setVisible] = useState(show)
  const startedAtRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    if (show) {
      startedAtRef.current = Date.now()

      timerRef.current = setTimeout(() => {
        setVisible(true)
        timerRef.current = null
      }, 0)

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current)
          timerRef.current = null
        }
      }
    }

    const startedAt = startedAtRef.current

    if (!startedAt) {
      timerRef.current = setTimeout(() => {
        setVisible(false)
        timerRef.current = null
      }, 0)

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current)
          timerRef.current = null
        }
      }
    }

    const elapsed = Date.now() - startedAt
    const remaining = Math.max(minDuration - elapsed, 0)

    timerRef.current = setTimeout(() => {
      setVisible(false)
      startedAtRef.current = null
      timerRef.current = null
    }, remaining)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [show, minDuration])

  if (!show && !visible) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-[4px]"
      role="status"
      aria-live="polite"
    >
      <div className="flex min-w-[280px] max-w-[380px] flex-col items-center rounded-2xl border border-white/20 bg-white/95 px-8 py-7 text-center shadow-2xl">
        <img
          src={imageSrc}
          alt="BuyFlow ERP 로딩"
          className="h-48 w-48 object-contain"
        />

        <p className="mt-2 text-[16px] font-bold text-slate-900">{message}</p>

        <p className="mt-1 text-[13px] leading-5 text-slate-500">
          {description}
        </p>

        <div className="mt-4 flex gap-2">
          <span className="h-2 w-2 animate-bounce rounded-full bg-blue-600 [animation-delay:-0.3s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-blue-600 [animation-delay:-0.15s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-blue-600" />
        </div>
      </div>
    </div>
  )
}

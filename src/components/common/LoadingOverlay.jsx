"use client"

import { useEffect, useRef, useState } from "react"

export default function LoadingOverlay({
  show = true,
  imageSrc = "/images/buyflow-erp/loading.svg",
  minDuration = 900,
}) {
  const [visible, setVisible] = useState(show)
  const startedAtRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    function clearTimer() {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }

    clearTimer()

    if (show) {
      startedAtRef.current = Date.now()

      timerRef.current = setTimeout(() => {
        setVisible(true)
        timerRef.current = null
      }, 0)

      return clearTimer
    }

    const startedAt = startedAtRef.current

    if (!startedAt) {
      timerRef.current = setTimeout(() => {
        setVisible(false)
        timerRef.current = null
      }, 0)

      return clearTimer
    }

    const elapsed = Date.now() - startedAt
    const remaining = Math.max(minDuration - elapsed, 0)

    timerRef.current = setTimeout(() => {
      setVisible(false)
      startedAtRef.current = null
      timerRef.current = null
    }, remaining)

    return clearTimer
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
      <div className="bf-loading-scene">
        <div className="bf-loading-shadow" />

        <img
          src={imageSrc}
          alt="BuyFlow ERP 로딩"
          className="bf-loading-image"
        />
      </div>

      <style jsx>{`
        .bf-loading-scene {
          position: relative;
          width: 280px;
          height: 280px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: visible;
        }

        .bf-loading-image {
          width: 220px;
          height: 220px;
          display: block;
          object-fit: contain;
          transform-origin: center center;
          filter: drop-shadow(0 18px 26px rgba(15, 23, 42, 0.24));
          animation: bfLoadingFloat 1.8s ease-in-out infinite;
          will-change: transform;
        }

        .bf-loading-shadow {
          position: absolute;
          left: 50%;
          bottom: 36px;
          width: 150px;
          height: 28px;
          border-radius: 9999px;
          background: rgba(15, 23, 42, 0.24);
          filter: blur(18px);
          transform: translateX(-50%);
          animation: bfLoadingShadow 1.8s ease-in-out infinite;
        }

        @keyframes bfLoadingFloat {
          0%,
          100% {
            transform: translateY(0) scale(1);
          }

          50% {
            transform: translateY(-8px) scale(1.03);
          }
        }

        @keyframes bfLoadingShadow {
          0%,
          100% {
            transform: translateX(-50%) scaleX(0.92);
            opacity: 0.2;
          }

          50% {
            transform: translateX(-50%) scaleX(1.08);
            opacity: 0.34;
          }
        }
      `}</style>
    </div>
  )
}

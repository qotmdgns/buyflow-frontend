"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Bell,
  ChevronDown,
  ChevronRight,
  Plus,
  Search,
  Truck,
} from "lucide-react"

const breadcrumbRules = [
  { path: "/dashboard", crumbs: [{ label: "대시보드" }] },
  {
    path: "/products",
    crumbs: [{ label: "기준정보", href: "/products" }, { label: "품목 관리" }],
  },
  {
    path: "/purchase-requests/new",
    crumbs: [
      { label: "구매 및 입고", href: "/purchase-requests" },
      { label: "구매 요청", href: "/purchase-requests" },
      { label: "구매 요청 등록" },
    ],
  },
  {
    path: "/purchase-requests",
    crumbs: [
      { label: "구매 및 입고", href: "/purchase-requests" },
      { label: "구매 요청" },
    ],
  },
  {
    path: "/approvals",
    crumbs: [
      { label: "구매 및 입고", href: "/approvals" },
      { label: "승인 관리" },
    ],
  },
]

function getBreadcrumbs(pathname) {
  return (
    breadcrumbRules.find(
      ({ path }) => pathname === path || pathname.startsWith(`${path}/`),
    )?.crumbs ?? [{ label: "대시보드" }]
  )
}

export default function Header() {
  const pathname = usePathname()
  const breadcrumbs = getBreadcrumbs(pathname)

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6">
      <div className="flex items-center gap-1 text-[11px] text-slate-400">
        {breadcrumbs.map((breadcrumb, index) => (
          <div
            key={`${breadcrumb.label}-${index}`}
            className="flex items-center gap-1"
          >
            {index > 0 && <ChevronRight size={12} />}
            {breadcrumb.href && index < breadcrumbs.length - 1 ? (
              <Link href={breadcrumb.href} className="hover:text-blue-600">
                {breadcrumb.label}
              </Link>
            ) : (
              <span className="font-semibold text-slate-700">
                {breadcrumb.label}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="hidden h-9 items-center gap-8 rounded-md bg-slate-50 px-3 text-[11px] text-slate-500 md:flex"
        >
          전체 창고
          <ChevronDown size={14} />
        </button>

        <label className="hidden h-9 w-56 items-center gap-2 rounded-md bg-slate-50 px-3 md:flex">
          <Search size={14} className="text-slate-400" />

          <input
            type="search"
            placeholder="검색어 입력..."
            className="w-full bg-transparent text-[11px] outline-none placeholder:text-slate-400"
          />
        </label>

        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-50"
        >
          <Bell size={16} />
          <span className="absolute right-2 top-1.5 h-1.5 w-1.5 rounded-full bg-rose-500" />
        </button>

        <Link
          href="/purchase-requests/new"
          className="hidden h-9 items-center gap-1 rounded-md border border-blue-200 px-3 text-[11px] font-semibold text-blue-600 hover:bg-blue-50 sm:flex"
        >
          <Plus size={14} />
          신규 구매 요청
        </Link>

        <button
          type="button"
          className="flex h-9 items-center gap-1 rounded-md bg-blue-600 px-3 text-[11px] font-semibold text-white hover:bg-blue-700"
        >
          <Truck size={14} />
          입고 등록
        </button>
      </div>
    </header>
  )
}

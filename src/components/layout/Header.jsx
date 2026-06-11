"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, ChevronRight, Plus, Search, Truck } from "lucide-react"

const breadcrumbRules = [
  { path: "/dashboard", crumbs: [{ label: "대시보드" }] },
  {
    path: "/products/new",
    crumbs: [
      { label: "기준정보", href: "/products" },
      { label: "품목 관리", href: "/products" },
      { label: "품목 등록" },
    ],
  },
  {
    path: "/products",
    crumbs: [{ label: "기준정보", href: "/products" }, { label: "품목 관리" }],
  },
  {
    path: "/suppliers",
    crumbs: [
      { label: "기준정보", href: "/products" },
      { label: "공급업체 관리" },
    ],
  },
  {
    path: "/warehouses",
    crumbs: [{ label: "기준정보", href: "/products" }, { label: "창고 관리" }],
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
    matches: (pathname) =>
      /^\/purchase-requests\/[^/]+$/.test(pathname) &&
      pathname !== "/purchase-requests/new",
    crumbs: [
      { label: "구매 및 입고", href: "/purchase-requests" },
      { label: "구매 요청", href: "/purchase-requests" },
      { label: "구매 요청 상세" },
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
    matches: (pathname) => /^\/approvals\/[^/]+$/.test(pathname),
    crumbs: [
      { label: "구매 및 입고", href: "/approvals" },
      { label: "승인 관리", href: "/approvals" },
      { label: "승인 상세" },
    ],
  },
  {
    path: "/approvals",
    crumbs: [
      { label: "구매 및 입고", href: "/approvals" },
      { label: "승인 관리" },
    ],
  },
  {
    path: "/approvals",
    crumbs: [
      { label: "구매 및 입고", href: "/approvals" },
      { label: "승인 관리" },
    ],
  },

  {
    path: "/purchase-orders/new",
    crumbs: [
      { label: "구매 및 입고", href: "/purchase-orders" },
      { label: "발주 관리", href: "/purchase-orders" },
      { label: "발주 등록" },
    ],
  },

  {
    matches: (pathname) => /^\/purchase-orders\/[^/]+\/edit$/.test(pathname),
    crumbs: [
      { label: "구매 및 입고", href: "/purchase-orders" },
      { label: "발주 관리", href: "/purchase-orders" },
      { label: "발주 수정" },
    ],
  },

  {
    path: "/purchase-orders",
    crumbs: [
      { label: "구매 및 입고", href: "/purchase-orders" },
      { label: "발주 관리" },
    ],
  },

  {
    path: "/inbounds/new",
    crumbs: [
      { label: "구매 및 입고", href: "/inbounds" },
      { label: "입고 관리", href: "/inbounds" },
      { label: "입고 등록" },
    ],
  },
  {
    matches: (pathname) =>
      /^\/inbounds\/[^/]+$/.test(pathname) && pathname !== "/inbounds/new",
    crumbs: [
      { label: "구매 및 입고", href: "/inbounds" },
      { label: "입고 관리", href: "/inbounds" },
      { label: "입고 상세" },
    ],
  },
  {
    path: "/inbounds",
    crumbs: [
      { label: "구매 및 입고", href: "/inbounds" },
      { label: "입고 관리" },
    ],
  },
]

function getBreadcrumbs(pathname) {
  return (
    breadcrumbRules.find((rule) => {
      if (rule.matches) {
        return rule.matches(pathname)
      }

      return pathname === rule.path || pathname.startsWith(`${rule.path}/`)
    })?.crumbs ?? [{ label: "대시보드" }]
  )
}

export default function Header() {
  const pathname = usePathname()
  const breadcrumbs = getBreadcrumbs(pathname)

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-3 lg:px-4">
      <div className="flex items-center gap-1 text-[13px] text-slate-400">
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
    </header>
  )
}

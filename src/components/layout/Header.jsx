"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"

const breadcrumbRules = [
  { path: "/dashboard", crumbs: [{ label: "대시보드" }] },
  {
    path: "/mypage",
    crumbs: [{ label: "설정", href: "/mypage" }, { label: "마이페이지" }],
  },

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
    path: "/receipts/new",
    crumbs: [
      { label: "구매 및 입고", href: "/receipts" },
      { label: "입고 관리", href: "/receipts" },
      { label: "입고 등록" },
    ],
  },
  {
    matches: (pathname) =>
      /^\/receipts\/[^/]+$/.test(pathname) && pathname !== "/receipts/new",
    crumbs: [
      { label: "구매 및 입고", href: "/receipts" },
      { label: "입고 관리", href: "/receipts" },
      { label: "입고 상세" },
    ],
  },
  {
    path: "/receipts",
    crumbs: [
      { label: "구매 및 입고", href: "/receipts" },
      { label: "입고 관리" },
    ],
  },

  {
    matches: (pathname) => /^\/inspections\/[^/]+\/register$/.test(pathname),
    crumbs: [
      { label: "구매 및 입고", href: "/inspections" },
      { label: "검수 관리", href: "/inspections" },
      { label: "검수 등록" },
    ],
  },
  {
    matches: (pathname) => /^\/inspections\/[^/]+$/.test(pathname),
    crumbs: [
      { label: "구매 및 입고", href: "/inspections" },
      { label: "검수 관리", href: "/inspections" },
      { label: "검수 상세" },
    ],
  },
  {
    path: "/inspections",
    crumbs: [
      { label: "구매 및 입고", href: "/inspections" },
      { label: "검수 관리" },
    ],
  },

  {
    path: "/stock/history",
    crumbs: [{ label: "재고 관리", href: "/stock" }, { label: "재고 이력" }],
  },
  {
    path: "/stock",
    crumbs: [{ label: "재고 관리", href: "/stock" }, { label: "재고 현황" }],
  },
]

function getBreadcrumbs(pathname) {
  return (
    breadcrumbRules.find((rule) => {
      if (rule.matches) {
        return rule.matches(pathname)
      }

      return pathname === rule.path
    })?.crumbs ?? [{ label: "대시보드" }]
  )
}

export default function Header() {
  const pathname = usePathname()
  const breadcrumbs = getBreadcrumbs(pathname)
  const currentTitle = breadcrumbs.at(-1)?.label ?? "대시보드"

  return (
    <header className="app-header">
      <div className="min-w-0">
        <div className="app-breadcrumb">
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

        <strong className="app-header-title">{currentTitle}</strong>
      </div>

      <div className="app-header-chip">BuyFlow ERP 운영 시스템</div>
    </header>
  )
}

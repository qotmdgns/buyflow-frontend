"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Boxes,
  Building2,
  CheckSquare,
  ClipboardList,
  History,
  LayoutDashboard,
  Package,
  PackageCheck,
  Settings,
  ShoppingCart,
  LogIn,
  Warehouse,
} from "lucide-react"
import SidebarAccount from "@/features/auth/components/SidebarAccount"
import { hasAnyRole, hasPermission } from "@/utils/permissions"
import useClientReady from "@/utils/useClientReady"

const menuGroups = [
  {
    label: "메인",
    items: [
      {
        label: "대시보드",
        href: "/dashboard",
        icon: LayoutDashboard,
        requireAnyPermission: ["dashboard.read"],
      },
    ],
  },
  {
    label: "기준정보 관리",
    items: [
      {
        label: "품목 관리",
        href: "/products",
        icon: Package,
        requireAnyPermission: ["products.read", "products.write"],
      },
      {
        label: "공급업체 관리",
        href: "/suppliers",
        icon: Building2,
        requireAnyPermission: ["suppliers.read", "suppliers.write"],
      },
      {
        label: "창고 관리",
        href: "/warehouses",
        icon: Warehouse,
        requireAnyPermission: ["warehouses.read", "warehouses.write"],
      },
    ],
  },
  {
    label: "구매 및 입고",
    items: [
      {
        label: "구매 요청",
        href: "/purchase-requests",
        icon: ShoppingCart,
        requireAnyPermission: [
          "purchase-requests.read",
          "purchase-requests.write",
        ],
      },
      {
        label: "승인 관리",
        href: "/approvals",
        icon: CheckSquare,
        requireAnyPermission: ["approvals.read", "approvals.process"],
      },
      {
        label: "발주 관리",
        href: "/purchase-orders",
        icon: ClipboardList,
        requireAnyPermission: ["purchase-orders.read", "purchase-orders.write"],
      },
      {
        label: "입고 관리",
        href: "/receipts",
        icon: LogIn,
        requireAnyPermission: ["receipts.read", "receipts.write"],
      },
      {
        label: "검수 관리",
        href: "/inspections",
        icon: PackageCheck,
        requireAnyPermission: ["inspections.read", "inspections.process"],
      },
    ],
  },
  {
    label: "재고 관리",
    items: [
      {
        label: "재고 현황",
        href: "/stock",
        icon: Boxes,
        exact: true,
        requireAnyPermission: ["stock.read", "stock.adjust"],
      },
      {
        label: "재고 이력",
        href: "/stock/history",
        icon: History,
        requireAnyPermission: ["stock-history.read"],
      },
    ],
  },
  {
    label: "설정",
    items: [
      {
        label: "사용자 및 권한 관리",
        href: "/system",
        icon: Settings,
        // ADMIN은 전체 시스템 관리, TEAM_MANAGER는 자기 부서 역할 위임만 접근.
        requireAnyRole: ["ADMIN", "TEAM_MANAGER"],
        requireAnyPermission: ["users.read", "roles.write"],
      },
    ],
  },
]

function Logo() {
  return (
    <Link
      href="/dashboard"
      className="flex h-14 items-center gap-2 border-b border-slate-200 px-4"
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-white">
        <Package size={16} />
      </span>

      <span className="text-[15px] font-bold text-blue-600">BuyFlow ERP</span>
    </Link>
  )
}

export default function Sidebar() {
  const pathname = usePathname()

  const ready = useClientReady()

  const canSee = (item) => {
    if (!item.requireAnyPermission && !item.requireAnyRole) {
      return true
    }

    if (!ready) {
      return false
    }

    return (
      (item.requireAnyRole && hasAnyRole(item.requireAnyRole)) ||
      item.requireAnyPermission?.some((permission) => hasPermission(permission))
    )
  }

  // 권한 없는 항목 제거 + 항목이 모두 빠진 그룹은 라벨까지 숨김
  const visibleGroups = menuGroups
    .map((group) => ({ ...group, items: group.items.filter(canSee) }))
    .filter((group) => group.items.length > 0)

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[220px] border-r border-slate-200 bg-white lg:flex lg:flex-col">
      <Logo />

      <nav className="flex-1 overflow-y-auto py-2">
        {visibleGroups.map((group, groupIndex) => (
          <div
            key={`${group.label}-${groupIndex}`}
            className={groupIndex ? "mt-3" : ""}
          >
            {group.label && (
              <p className="px-4 pb-1 text-[12px] font-bold text-slate-400">
                {group.label}
              </p>
            )}

            <div className="space-y-0.5">
              {group.items.map(({ label, href, icon: Icon, exact = false }) => {
                const active = exact
                  ? pathname === href
                  : pathname === href || pathname.startsWith(`${href}/`)

                return (
                  <Link
                    key={label}
                    href={href}
                    className={`flex h-9 items-center gap-2.5 border-r-2 px-4 text-[13px] transition ${
                      active
                        ? "border-blue-600 bg-blue-50 font-semibold text-blue-600"
                        : "border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                    }`}
                  >
                    <Icon size={15} strokeWidth={1.8} />
                    {label}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-200 p-3">
        <SidebarAccount />
      </div>
    </aside>
  )
}

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
  UserRound,
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
        label: "마이페이지",
        href: "/mypage",
        icon: UserRound,
      },
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
    <Link href="/dashboard" className="app-logo">
      <span className="app-logo-icon">
        <Package size={18} />
      </span>

      <span className="app-logo-title">BuyFlow ERP</span>
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
    <aside className="app-sidebar">
      <Logo />

      <nav className="flex-1 overflow-y-auto py-2">
        {visibleGroups.map((group, groupIndex) => (
          <div key={`${group.label}-${groupIndex}`} className="app-nav-group">
            {group.label && (
              <p className="app-nav-group-label">{group.label}</p>
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
                    className={`app-nav-link ${
                      active ? "app-nav-link-active" : "app-nav-link-idle"
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

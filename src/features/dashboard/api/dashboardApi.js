import { apiFetch } from "@/lib/api/fetchClient"
import { mockDashboardData } from "@/features/dashboard/data/mockDashboardData"

const USE_MOCK = process.env.NEXT_PUBLIC_USE_DASHBOARD_MOCK !== "false"

export async function getDashboardData() {
  if (USE_MOCK) {
    return mockDashboardData
  }

  return apiFetch("/api/dashboard", {
    cache: "no-store",
  })
}

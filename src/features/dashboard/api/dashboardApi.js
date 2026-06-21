import { mockDashboardData } from "@/features/dashboard/data/mockDashboardData"

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080"
).replace(/\/$/, "")

const USE_MOCK = process.env.NEXT_PUBLIC_USE_DASHBOARD_MOCK !== "false"

export async function getDashboardData() {
  if (USE_MOCK) {
    return mockDashboardData
  }

  const response = await fetch(`${API_BASE_URL}/api/dashboard`, {
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error("대시보드 데이터를 불러오지 못했습니다.")
  }

  return response.json()
}

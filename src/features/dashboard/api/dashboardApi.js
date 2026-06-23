import { mockDashboardData } from "@/features/dashboard/data/mockDashboardData"

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080"
).replace(/\/$/, "")

const USE_MOCK = process.env.NEXT_PUBLIC_USE_DASHBOARD_MOCK !== "false"

export async function getDashboardData() {
  if (USE_MOCK) {
    return mockDashboardData
  }

  const url = `${API_BASE_URL}/api/dashboard`

  try {
    const response = await fetch(url, {
      cache: "no-store",
    })

    if (!response.ok) {
      const errorText = await response.text()

      console.error("[Dashboard API Error]", {
        url,
        status: response.status,
        body: errorText,
      })

      throw new Error(`대시보드 API 호출 실패: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error("[Dashboard Fetch Failed]", {
      url,
      message: error?.message,
      cause: error?.cause,
    })

    throw error
  }
}

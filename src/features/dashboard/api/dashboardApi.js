import { mockDashboardData } from "@/features/dashboard/data/mockDashboardData"

export async function getDashboardData() {
  // Spring Boot API 연동 후 아래 주석을 해제합니다.
  //
  // const response = await fetch(
  //   `${process.env.API_BASE_URL}/api/dashboard`,
  //   {
  //     cache: "no-store",
  //   }
  // )
  //
  // if (!response.ok) {
  //   throw new Error("대시보드 데이터를 불러오지 못했습니다.")
  // }
  //
  // return response.json()

  return mockDashboardData
}

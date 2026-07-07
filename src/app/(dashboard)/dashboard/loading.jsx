import LoadingOverlay from "@/components/common/LoadingOverlay"

export default function DashboardLoading() {
  return (
    <LoadingOverlay
      message="대시보드 현황을 불러오는 중입니다."
      description="구매요청, 입고, 재고 상태 데이터를 집계하고 있습니다."
    />
  )
}

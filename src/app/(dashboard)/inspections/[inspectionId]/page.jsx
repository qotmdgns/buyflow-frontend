import InspectionDetail from "@/features/inspection/components/InspectionDetail"

export const metadata = {
  title: "검수 상세 | BuyFlow ERP",
}

export default async function InspectionDetailPage({ params }) {
  const { inspectionId } = await params

  return <InspectionDetail inspectionId={inspectionId} />
}

import PermissionRouteGuard from "@/components/auth/PermissionRouteGuard"
import InspectionRegister from "@/features/inspection/components/InspectionRegister"

export const metadata = {
  title: "검수 등록 | BuyFlow ERP",
}

export default async function InspectionRegisterPage({ params }) {
  const { inspectionId } = await params

  return (
    <PermissionRouteGuard
      permissions={["inspections.process"]}
      fallbackPath={`/inspections/${inspectionId}`}
    >
      <InspectionRegister inspectionId={inspectionId} />
    </PermissionRouteGuard>
  )
}

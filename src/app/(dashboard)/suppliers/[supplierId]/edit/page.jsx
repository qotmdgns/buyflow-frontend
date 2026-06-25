import SupplierForm from "@/features/supplier/components/SupplierForm"

export const metadata = {
  title: "공급업체 수정 | BuyFlow ERP",
}

export default async function SupplierEditPage({ params }) {
  const { supplierId } = await params

  return <SupplierForm mode="edit" supplierId={supplierId} />
}

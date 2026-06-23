import ProductCreate from "@/features/product/components/ProductCreate"

export const metadata = {
  title: "품목 수정 | BuyFlow ERP",
}

export default async function ProductEditPage({ params }) {
  const { productId } = await params

  return <ProductCreate mode="edit" productId={productId} />
}

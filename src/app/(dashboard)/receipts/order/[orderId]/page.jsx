import ReceiptDetail from "@/features/receipt/components/ReceiptDetail"

console.log("ORDER PAGE LOADED")

export const metadata = {
  title: "입고 상세 | BuyFlow ERP",
}

export default async function ReceiptOrderDetailPage({ params }) {
  const { orderId } = await params

  return (
    <ReceiptDetail
      receiptId={orderId}
      mode="order"
    />
  )
}
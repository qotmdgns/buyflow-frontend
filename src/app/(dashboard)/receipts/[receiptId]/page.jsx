import ReceiptDetail from "@/features/receipt/components/ReceiptDetail"

export const metadata = {
  title: "입고 상세 | BuyFlow ERP",
}

export default async function ReceiptDetailPage({ params }) {
  const { receiptId } = await params

  return <ReceiptDetail receiptId={receiptId} />
}

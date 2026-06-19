import ReceiptCreate from "@/features/receipt/components/ReceiptCreate"

export const metadata = {
  title: "입고 등록 | BuyFlow ERP",
}

export default async function NewReceiptPage({ searchParams }) {
  const { receiptId = "" } = await searchParams

  return <ReceiptCreate initialReceiptId={receiptId} />
}

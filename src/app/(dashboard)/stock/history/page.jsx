import StockHistoryManagement from "@/features/stock/components/StockHistoryManagement"

export default async function StockHistoryPage({ searchParams }) {
  const params = await searchParams

  const initialFilters = {
    itemKeyword: getStringParam(params?.itemCode),
    warehouseCode: getStringParam(params?.warehouseCode, "전체"),
  }

  const componentKey = `${initialFilters.itemKeyword}:${initialFilters.warehouseCode}`

  return (
    <StockHistoryManagement
      key={componentKey}
      initialFilters={initialFilters}
    />
  )
}

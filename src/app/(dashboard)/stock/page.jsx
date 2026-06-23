import StockStatusManagement from "@/features/stock/components/StockStatusManagement"

function getStringParam(value, defaultValue = "") {
  if (Array.isArray(value)) {
    return value[0] ?? defaultValue
  }

  return value ?? defaultValue
}

export default async function StockPage({ searchParams }) {
  const params = await searchParams

  const initialFilters = {
    itemCode: getStringParam(params?.itemCode),
    itemName: getStringParam(params?.itemName),
    category: getStringParam(params?.category, "전체"),
    warehouseCode: getStringParam(params?.warehouseCode, "전체"),
    stockStatus: getStringParam(params?.stockStatus, "전체"),
  }

  const componentKey = [
    initialFilters.itemCode,
    initialFilters.itemName,
    initialFilters.category,
    initialFilters.warehouseCode,
    initialFilters.stockStatus,
  ].join(":")

  return (
    <StockStatusManagement key={componentKey} initialFilters={initialFilters} />
  )
}

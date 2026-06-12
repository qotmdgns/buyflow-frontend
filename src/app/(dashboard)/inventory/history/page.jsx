import InventoryHistoryManagement from "@/features/inventory/components/InventoryHistoryManagement"

function getStringParam(value, fallback = "") {
  return typeof value === "string" ? value : fallback
}

export default async function InventoryHistoryPage({ searchParams }) {
  const params = await searchParams

  const initialFilters = {
    itemKeyword: getStringParam(params?.itemCode),
    warehouseCode: getStringParam(params?.warehouseCode, "전체"),
  }

  const componentKey = `${initialFilters.itemKeyword}:${initialFilters.warehouseCode}`

  return (
    <InventoryHistoryManagement
      key={componentKey}
      initialFilters={initialFilters}
    />
  )
}

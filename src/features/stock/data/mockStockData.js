import { mockProducts } from "@/features/product/data/mockProductData"

export const stockWarehouses = [
  {
    code: "WH-001",
    name: "인천 제1 물류센터",
  },
  {
    code: "WH-002",
    name: "평택 냉장창고",
  },
  {
    code: "WH-003",
    name: "대전 유통허브",
  },
  {
    code: "WH-004",
    name: "광주 호남영업소",
  },
]

let stockSequence = 1

export const mockStocks = mockProducts
  .slice(0, 36)
  .flatMap((product, productIndex) => {
    const selectedWarehouses =
      productIndex % 6 === 0
        ? stockWarehouses.slice(0, 2)
        : [stockWarehouses[productIndex % stockWarehouses.length]]

    return selectedWarehouses.map((warehouse, warehouseIndex) => {
      const currentStock = Math.max(
        product.currentStock - warehouseIndex * ((productIndex % 5) + 1),
        0,
      )

      const stock = {
        id: stockSequence,
        itemId: product.id,
        itemCode: product.code,
        itemName: product.name,
        category: product.category,
        spec: product.spec,
        unit: product.unit,
        warehouseCode: warehouse.code,
        warehouseName: warehouse.name,
        locationCode: `A-${String((productIndex % 12) + 1).padStart(
          2,
          "0",
        )}-${String((productIndex % 20) + 1).padStart(2, "0")}`,
        currentStock,
        safetyStock: Math.max(product.safetyStock - warehouseIndex * 2, 1),
        lastChangedAt: "2026-06-12 09:00",
      }

      stockSequence += 1

      return stock
    })
  })

let historySequence = 1

function createHistoryId() {
  const id = `HIS-${String(historySequence).padStart(5, "0")}`

  historySequence += 1

  return id
}

function createMockDate(index, hourOffset = 0) {
  const day = String(12 - (index % 10)).padStart(2, "0")
  const hour = String(9 + ((index + hourOffset) % 8)).padStart(2, "0")

  return `2026-06-${day} ${hour}:00`
}

export const mockStockHistories = mockStocks.flatMap((stock, index) => {
  const adjustmentAmount = index % 4 === 0 ? (index % 5) + 1 : 0
  const stockAfterReceipt = stock.currentStock + adjustmentAmount

  const receiptHistory = {
    id: createHistoryId(),
    stockId: stock.id,
    occurredAt: createMockDate(index),
    movementType: "입고",
    itemCode: stock.itemCode,
    itemName: stock.itemName,
    warehouseCode: stock.warehouseCode,
    warehouseName: stock.warehouseName,
    quantity: stockAfterReceipt,
    beforeStock: 0,
    afterStock: stockAfterReceipt,
    referenceNumber: `RCV-202606-${String(index + 1).padStart(4, "0")}`,
    reason: "검수 완료에 따른 입고 반영",
    processedBy: "김철수 대리",
  }

  if (!adjustmentAmount) {
    return [receiptHistory]
  }

  const adjustmentHistory = {
    id: createHistoryId(),
    stockId: stock.id,
    occurredAt: createMockDate(index, 1),
    movementType: "재고 조정 감소",
    itemCode: stock.itemCode,
    itemName: stock.itemName,
    warehouseCode: stock.warehouseCode,
    warehouseName: stock.warehouseName,
    quantity: -adjustmentAmount,
    beforeStock: stockAfterReceipt,
    afterStock: stock.currentStock,
    referenceNumber: `ADJ-202606-${String(index + 1).padStart(4, "0")}`,
    reason: "실물 재고 확인에 따른 수량 조정",
    processedBy: "김철수 대리",
  }

  return [receiptHistory, adjustmentHistory]
})

export const stockFilterOptions = {
  categories: ["전체", ...new Set(mockStocks.map((stock) => stock.category))],
  warehouses: [
    { value: "전체", label: "전체" },
    ...stockWarehouses.map((warehouse) => ({
      value: warehouse.code,
      label: `${warehouse.code} | ${warehouse.name}`,
    })),
  ],
  stockStatuses: ["전체", "정상", "안전재고 미만", "재고 없음"],
  movementTypes: ["전체", "입고", "재고 조정 증가", "재고 조정 감소"],
}

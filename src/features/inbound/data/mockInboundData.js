const suppliers = [
  "송두리 테크",
  "한빛 산업",
  "미래 로지스틱스",
  "대성 하이텍",
  "현대 부품사",
  "대한 유통",
  "세진 솔루션",
  "우림 상사",
]

export const mockInboundWarehouses = [
  "A-서브 물류 센터",
  "B-글로벌 창고",
  "C-로컬 체인 창고",
]

const products = [
  { itemCode: "SKU-10001", itemName: "산업용 베어링" },
  { itemCode: "SKU-10002", itemName: "포장 박스 M" },
  { itemCode: "SKU-10003", itemName: "알루미늄 브라켓" },
  { itemCode: "SKU-10004", itemName: "물류 라벨지" },
  { itemCode: "SKU-10005", itemName: "완충 포장재" },
  { itemCode: "SKU-10006", itemName: "컨베이어 벨트" },
  { itemCode: "SKU-10007", itemName: "안전 장갑" },
  { itemCode: "SKU-10008", itemName: "부품 보관함" },
]

function createDate(offset) {
  const date = new Date()
  date.setHours(12, 0, 0, 0)
  date.setDate(date.getDate() + offset)

  return date.toISOString().slice(0, 10)
}

function createStatus(index) {
  if (index <= 24) {
    return "EXPECTED"
  }

  if (index <= 27) {
    return "DELAYED"
  }

  if (index <= 39) {
    return "PARTIAL"
  }

  if (index <= 84) {
    return "COMPLETED"
  }

  return "EXPECTED"
}

function createExpectedInboundAt(index, status) {
  if (index <= 24) {
    return createDate(0)
  }

  if (status === "DELAYED") {
    return createDate(-2 - (index % 3))
  }

  if (status === "PARTIAL") {
    return createDate((index % 3) - 1)
  }

  if (status === "COMPLETED") {
    return createDate(-1 - (index % 14))
  }

  return createDate(1 + (index % 12))
}

function createReceivedQuantity(status, orderQuantity, index) {
  if (status === "COMPLETED") {
    return orderQuantity
  }

  if (status === "PARTIAL") {
    return Math.max(1, Math.round(orderQuantity * (0.35 + (index % 4) * 0.12)))
  }

  return 0
}

function createInbound(index) {
  const status = createStatus(index)
  const itemCount = 3 + (index % 18)
  const orderQuantity = 100 + (index % 9) * 150
  const receivedQuantity = createReceivedQuantity(status, orderQuantity, index)
  const primaryProduct = products[index % products.length]
  const orderedAtOffset =
    status === "COMPLETED" ? -18 - (index % 8) : -8 - (index % 7)

  return {
    id: index,
    orderNumber: `PO-2026-${String(index).padStart(4, "0")}`,
    supplierName: suppliers[index % suppliers.length],
    orderedAt: createDate(orderedAtOffset),
    expectedInboundAt: createExpectedInboundAt(index, status),
    warehouseName: mockInboundWarehouses[index % mockInboundWarehouses.length],
    itemCount,
    itemCodes: [primaryProduct.itemCode],
    itemNames: [primaryProduct.itemName],
    orderQuantity,
    receivedQuantity,
    remainingQuantity: orderQuantity - receivedQuantity,
    status,
  }
}

export const mockInbounds = Array.from({ length: 128 }, (_, index) =>
  createInbound(index + 1),
)

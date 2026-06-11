export const mockPurchaseOrderSuppliers = [
  {
    id: 1,
    code: "SUP-001",
    name: "동양산업",
    managerName: "박성호",
    contact: "010-2481-9231",
  },
  {
    id: 2,
    code: "SUP-002",
    name: "대한기계상사",
    managerName: "최유진",
    contact: "010-7712-4820",
  },
  {
    id: 3,
    code: "SUP-003",
    name: "세진테크",
    managerName: "이정민",
    contact: "010-6382-1855",
  },
]

export const mockPurchaseOrderWarehouses = [
  { id: 1, code: "WH-001", name: "본사 자재 창고" },
  { id: 2, code: "WH-002", name: "생산 1동 창고" },
  { id: 3, code: "WH-003", name: "물류센터 A 창고" },
]

export const mockApprovedPurchaseRequests = [
  {
    id: 1,
    requestNumber: "PR-2026-0001",
    title: "생산 설비 유지보수용 부품 구매",
    requester: "김호현",
    department: "구매전략팀",
    items: [
      {
        id: 101,
        itemCode: "ITEM-24-001",
        itemName: "산업용 고압 밸브 (Standard)",
        specification: "1/2 inch, STS304",
        requestedQuantity: 50,
        unit: "EA",
        defaultUnitPrice: 45000,
      },
      {
        id: 102,
        itemCode: "ITEM-24-002",
        itemName: "가스 압력 조절기",
        specification: "Model H-500, High Pressure",
        requestedQuantity: 20,
        unit: "SET",
        defaultUnitPrice: 125000,
      },
      {
        id: 103,
        itemCode: "ITEM-24-005",
        itemName: "정밀 압력계 (디지털)",
        specification: "0-100 bar, ±0.5%",
        requestedQuantity: 10,
        unit: "EA",
        defaultUnitPrice: 89000,
      },
    ],
  },
  {
    id: 2,
    requestNumber: "PR-2026-0002",
    title: "물류센터 안전 장비 구매",
    requester: "윤서진",
    department: "물류운영팀",
    items: [
      {
        id: 201,
        itemCode: "ITEM-31-001",
        itemName: "산업용 안전모",
        specification: "ABS 재질, 조절형",
        requestedQuantity: 80,
        unit: "EA",
        defaultUnitPrice: 18000,
      },
      {
        id: 202,
        itemCode: "ITEM-31-002",
        itemName: "안전 조끼",
        specification: "형광 반사띠, FREE",
        requestedQuantity: 80,
        unit: "EA",
        defaultUnitPrice: 12000,
      },
    ],
  },
]

function createItems(requestId) {
  const request = mockApprovedPurchaseRequests.find(
    (item) => item.id === requestId,
  )

  return request.items.map((item, index) => ({
    id: requestId * 1000 + index + 1,
    requestItemId: item.id,
    itemCode: item.itemCode,
    itemName: item.itemName,
    specification: item.specification,
    requestedQuantity: item.requestedQuantity,
    orderQuantity: item.requestedQuantity,
    unit: item.unit,
    unitPrice: item.defaultUnitPrice,
  }))
}

function calculateAmounts(items) {
  return items.reduce(
    (summary, item) => {
      const supplyAmount = item.orderQuantity * item.unitPrice
      const vatAmount = Math.round(supplyAmount * 0.1)

      return {
        supplyAmount: summary.supplyAmount + supplyAmount,
        vatAmount: summary.vatAmount + vatAmount,
        totalAmount: summary.totalAmount + supplyAmount + vatAmount,
      }
    },
    {
      supplyAmount: 0,
      vatAmount: 0,
      totalAmount: 0,
    },
  )
}

function createOrder({
  id,
  requestId,
  supplierId,
  warehouseId,
  status,
  orderedAt,
}) {
  const request = mockApprovedPurchaseRequests.find(
    (item) => item.id === requestId,
  )

  const supplier = mockPurchaseOrderSuppliers.find(
    (item) => item.id === supplierId,
  )

  const warehouse = mockPurchaseOrderWarehouses.find(
    (item) => item.id === warehouseId,
  )

  const items = createItems(requestId)

  return {
    id,
    orderNumber: `PO-2026-${String(id).padStart(4, "0")}`,
    requestId,
    requestNumber: request.requestNumber,
    requestTitle: request.title,
    supplierId,
    supplierName: supplier.name,
    supplierManagerName: supplier.managerName,
    supplierContact: supplier.contact,
    orderManager: "김철수",
    orderedAt,
    expectedInboundFrom: "2026-06-18",
    expectedInboundTo: "2026-06-20",
    warehouseId,
    warehouseName: warehouse.name,
    memo: "",
    status,
    cancelReason: "",
    canceledAt: "",
    attachments: [],
    items,
    ...calculateAmounts(items),
  }
}

export const mockPurchaseOrders = [
  createOrder({
    id: 1,
    requestId: 1,
    supplierId: 1,
    warehouseId: 1,
    status: "DRAFT",
    orderedAt: "2026-06-11",
  }),
  createOrder({
    id: 2,
    requestId: 2,
    supplierId: 2,
    warehouseId: 3,
    status: "CONFIRMED",
    orderedAt: "2026-06-10",
  }),
]

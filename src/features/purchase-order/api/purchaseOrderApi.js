import {
  mockApprovedPurchaseRequests,
  mockPurchaseOrders,
  mockPurchaseOrderSuppliers,
  mockPurchaseOrderWarehouses,
} from "@/features/purchase-order/data/mockPurchaseOrderData"

import {
  calculatePurchaseOrderSummary,
  canCancelPurchaseOrder,
  canEditPurchaseOrder,
  canEditPurchaseOrderCoreFields,
  getTodayString,
} from "@/features/purchase-order/utils/purchaseOrderUtils"

const USE_MOCK = process.env.
NEXT_PUBLIC_USE_PURCHASE_ORDER_MOCK=false

let purchaseOrderDatabase = structuredClone(mockPurchaseOrders)

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

function clone(value) {
  return structuredClone(value)
}

function createApiUrl(path) {
  const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(
    /\/$/,
    "",
  )

  return `${baseUrl}${path}`
}

function includesKeyword(value, keyword) {
  return String(value ?? "")
    .toLowerCase()
    .includes(
      String(keyword ?? "")
        .trim()
        .toLowerCase(),
    )
}

function nextId() {
  return (
    purchaseOrderDatabase.reduce(
      (maximumId, order) => Math.max(maximumId, Number(order.orderId)),
      0,
    ) + 1
  )
}

function createNextOrderNumber() {
  return `PO-2026-${String(nextId()).padStart(4, "0")}`
}

function createOrderItems(items, idSeed) {
  return items.map((item, index) => ({
    id: item.id ?? idSeed * 1000 + index + 1,
    requestItemId: item.requestItemId,
    itemCode: item.itemCode,
    itemName: item.itemName,
    specification: item.specification,
    requestedQuantity: Number(item.requestedQuantity),
    orderQuantity: Number(item.orderQuantity),
    unit: item.unit,
    unitPrice: Number(item.unitPrice),
  }))
}

function createRecord(payload, id, attachment, previousOrder = null) {
  const request = mockApprovedPurchaseRequests.find(
    (item) => item.id === Number(payload.requestId),
  )

  const supplier = mockPurchaseOrderSuppliers.find(
    (item) => item.id === Number(payload.supplierId),
  )

  const warehouse = mockPurchaseOrderWarehouses.find(
    (item) => item.id === Number(payload.warehouseCode),
  )

  if (!request || !supplier || !warehouse) {
    throw new Error("발주 등록에 필요한 기준정보를 확인하세요.")
  }

  const items = createOrderItems(payload.items, id)
  const amounts = calculatePurchaseOrderSummary(items)

  return {
    id,
    orderNumber: previousOrder?.orderNumber ?? payload.orderNumber,
    requestId: request.id,
    requestNumber: request.requestNumber,
    requestTitle: request.title,
    supplierId: supplier.id,
    supplierName: supplier.name,
    supplierManagerName: supplier.managerName,
    supplierContact: supplier.contact,
    orderManager: payload.userName.trim(),
    orderedAt: previousOrder?.createdBy ?? payload.createdBy,
    expectedInboundFrom: payload.expectedInboundFrom,
    expectedInboundTo: payload.expectedInboundTo,
    warehouseCode: warehouse.warehouseCode,
    warehouseName: warehouse.warehouseName,
    memo: payload.memo.trim(),
    status: payload.orderStatus,
    cancelReason: previousOrder?.cancelReason ?? "",
    canceledAt: previousOrder?.canceledAt ?? "",
    attachments: attachment
      ? [
          ...(previousOrder?.attachments ?? []),
          { id: Date.now(), fileName: attachment.name },
        ]
      : (previousOrder?.attachments ?? []),
    items,
    ...amounts,
  }
}

export async function fetchPurchaseOrders(params = {}) {
  if (!USE_MOCK) {
    const query = new URLSearchParams(params)

    const response = await fetch(
      createApiUrl(`/api/orders` + (query.toString() ? `?${query.toString()}` : "")),
      { cache: "no-store" },
    )

    if (!response.ok) {
      throw new Error("발주 목록을 불러오지 못했습니다.")
    }

    return response.json()
  }

  await wait(120)

  const {
    page = 1,
    size = 10,
    orderNumber = "",
    requestNumber = "",
    supplierName = "전체 공급업체",
    orderManager = "",
    status = "전체",
  } = params

  const filteredOrders = purchaseOrderDatabase.filter((order) => {
    return (
      (!orderNumber || includesKeyword(order.orderNumber, orderNumber)) &&
      (!requestNumber || includesKeyword(order.requestNumber, requestNumber)) &&
      (supplierName === "전체 공급업체" ||
        order.supplierName === supplierName) &&
      (!orderManager || includesKeyword(order.orderManager, orderManager)) &&
      (status === "전체" || order.status === status)
    )
  })

  const totalElements = filteredOrders.length
  const totalPages = Math.max(1, Math.ceil(totalElements / size))
  const safePage = Math.min(Math.max(Number(page), 1), totalPages)
  const offset = (safePage - 1) * size

  return {
    items: filteredOrders.slice(offset, offset + size).map((order) => ({
      ...clone(order),
      itemCount: order.items.length,
    })),
    pagination: {
      page: safePage,
      size,
      totalElements,
      totalPages,
    },
  }
}

export async function fetchPurchaseOrderFilterOptions() {
  if (!USE_MOCK) {
    const response = await fetch(
      createApiUrl("/api/orders/filter-options"),
      { cache: "no-store" },
    )

    if (!response.ok) {
      throw new Error("발주 검색 조건을 불러오지 못했습니다.")
    }

    return response.json()
  }

  return {
    suppliers: [
      "전체 공급업체",
      ...mockPurchaseOrderSuppliers.map((supplier) => supplier.name),
    ],
    statuses: [
      "전체",
      "DRAFT",
      "CONFIRMED",
      "PARTIAL_RECEIVED",
      "RECEIVED",
      "CANCELED",
    ],
  }
}

export async function fetchPurchaseOrderFormOptions() {
  if (!USE_MOCK) {
    const response = await fetch(
      createApiUrl("/api/orders/form-options"),
      { cache: "no-store" },
    )

    if (!response.ok) {
      throw new Error("발주 등록 기준정보를 불러오지 못했습니다.")
    }

    return response.json()
  }

  return {
    nextOrderNumber: createNextOrderNumber(),
    suppliers: clone(mockPurchaseOrderSuppliers),
    warehouses: clone(mockPurchaseOrderWarehouses),
    approvedPurchaseRequests: clone(mockApprovedPurchaseRequests),
  }
}

export async function fetchPurchaseOrderById(orderId) {
  if (!USE_MOCK) {
    const response = await fetch(
      createApiUrl(`/api/orders/${orderId}`),
      { cache: "no-store" },
    )

    if (!response.ok) {
      throw new Error("발주 상세 정보를 불러오지 못했습니다.")
    }

    return response.json()
  }

  await wait(100)

  const order = purchaseOrderDatabase.find(
    (item) => item.id === Number(orderId),
  )

  if (!order) {
    throw new Error("발주 정보를 찾을 수 없습니다.")
  }

  return clone(order)
}

export async function createPurchaseOrder(payload, attachment = null) {
  if (!USE_MOCK) {
    const response = await fetch(createApiUrl("/api/orders"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error("발주를 등록하지 못했습니다.")
    }

    return response.json()
  }

  await wait(200)

  const id = nextId()

  const createdOrder = createRecord(
    {
      ...payload,
      orderNumber: createNextOrderNumber(),
    },
    id,
    attachment,
  )

  purchaseOrderDatabase = [createdOrder, ...purchaseOrderDatabase]

  return clone(createdOrder)
}

export async function updatePurchaseOrder(orderId, payload, attachment = null) {
  if (!USE_MOCK) {
    const response = await fetch(
      createApiUrl(`/api/orders/${orderId}`),
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    )

    if (!response.ok) {
      throw new Error("발주 정보를 수정하지 못했습니다.")
    }

    return response.json()
  }

  await wait(200)

  const previousOrder = purchaseOrderDatabase.find(
    (item) => item.id === Number(orderId),
  )

  if (!previousOrder) {
    throw new Error("수정할 발주 정보를 찾을 수 없습니다.")
  }

  if (!canEditPurchaseOrder(previousOrder.status)) {
    throw new Error("현재 상태에서는 발주 정보를 수정할 수 없습니다.")
  }

  const safePayload = canEditPurchaseOrderCoreFields(previousOrder.status)
    ? payload
    : {
        ...previousOrder,
        expectedInboundFrom: payload.expectedInboundFrom,
        expectedInboundTo: payload.expectedInboundTo,
        warehouseCode: payload.warehouseCode,
        memo: payload.memo,
        status: previousOrder.status,
        items: previousOrder.items,
      }

  const updatedOrder = createRecord(
    safePayload,
    Number(orderId),
    attachment,
    previousOrder,
  )

  purchaseOrderDatabase = purchaseOrderDatabase.map((order) =>
    order.orderId === Number(orderId) ? updatedOrder : order,
  )

  return clone(updatedOrder)
}

export async function cancelPurchaseOrder(orderId, cancelReason) {
  if (!USE_MOCK) {
    const response = await fetch(
      createApiUrl(`/api/orders/${orderId}/cancel`),
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cancelReason }),
      },
    )

    if (!response.ok) {
      throw new Error("발주 취소 처리에 실패했습니다.")
    }

    return response.json()
  }

  await wait(180)

  const previousOrder = purchaseOrderDatabase.find(
    (item) => item.id === Number(orderId),
  )

  if (!previousOrder) {
    throw new Error("취소할 발주 정보를 찾을 수 없습니다.")
  }

  if (!canCancelPurchaseOrder(previousOrder.status)) {
    throw new Error("현재 상태에서는 발주를 취소할 수 없습니다.")
  }

  const canceledOrder = {
    ...previousOrder,
    status: "CANCELED",
    cancelReason: cancelReason.trim(),
    canceledAt: `${getTodayString()} ${new Date().toTimeString().slice(0, 5)}`,
  }

  purchaseOrderDatabase = purchaseOrderDatabase.map((order) =>
    order.orderId === Number(orderId) ? canceledOrder : order,
  )

  return clone(canceledOrder)
}

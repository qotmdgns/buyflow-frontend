import { apiFetch } from "@/lib/api/fetchClient"
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

const USE_MOCK = process.env.NEXT_PUBLIC_USE_PURCHASE_ORDER_MOCK === "true"

let purchaseOrderDatabase = structuredClone(mockPurchaseOrders)

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

function clone(value) {
  return structuredClone(value)
}

function createApiUrl(path) {
  const baseUrl = (
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080"
  ).replace(/\/$/, "")
  const refinedPath = path.startsWith("/") ? path : `/${path}`

  return `${baseUrl}${refinedPath}`
}

function toFrontendPurchaseOrder(data) {
  if (!data) return null
  return {
    orderId: data.orderId,
    id: data.orderId,
    orderNumber:
      data.orderNo || `PO-2026-${String(data.orderId).padStart(4, "0")}`,
    requestId: data.requestId,
    requestNumber: data.requestNo || "-",
    requestTitle: data.requestTitle || "-",
    supplierId: data.supplierId,
    supplierName: data.supplierName || "-",

    // 백엔드 userName을 프론트 그리드용 orderManager로 매핑
    orderManager: data.userName || "-",
    orderManagerPhone: data.userPhone || "-",

    orderedAt: data.createdAt ? String(data.createdAt).slice(0, 10) : "-",
    expectedReceiptFrom:
      data.expectedReceiptFrom ||
      data.expectedReceiptFrom ||
      (data.dueDate ? String(data.dueDate).slice(0, 10) : "-"),
    expectedReceiptTo:
      data.expectedReceiptTo ||
      data.expectedReceiptTo ||
      (data.dueDate ? String(data.dueDate).slice(0, 10) : "-"),
    warehouseCode: data.warehouseCode || "",
    warehouseName: data.warehouseName || "",
    memo: data.memo || "",
    status: data.orderStatus || "",
    items: data.items || [],
    attachmentId: data.attachmentId || null,
    attachmentName: data.attachmentName || null,
  }
}

function normalizePurchaseOrderResponse(data) {
  if (!data)
    return {
      items: [],
      pagination: { page: 1, size: 10, totalElements: 0, totalPages: 1 },
    }

  const itemsArray = data.content || data.items || []

  return {
    items: itemsArray.map(toFrontendPurchaseOrder),
    pagination: {
      page: (data.number ?? 0) + 1,
      size: data.size ?? 10,
      totalElements: data.totalElements ?? itemsArray.length,
      totalPages: Math.max(data.totalPages ?? 1, 1),
    },
  }
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
    expectedReceiptFrom: payload.expectedReceiptFrom,
    expectedReceiptTo: payload.expectedReceiptTo,
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
      createApiUrl(
        `/api/orders` + (query.toString() ? `?${query.toString()}` : ""),
      ),
      { cache: "no-store" },
    )

    if (!response.ok) {
      throw new Error("발주 목록을 불러오지 못했습니다.")
    }

    return normalizePurchaseOrderResponse(await response.json())
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
    const response = await fetch(createApiUrl("/api/orders/filter-options"), {
      cache: "no-store",
    })

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
      "CONFIRMED",
      "PARTIAL_RECEIVED",
      "RECEIVED",
      "CANCELED",
    ],
  }
}

export async function fetchPurchaseOrderFormOptions() {
  if (!USE_MOCK) {
    const response = await fetch(createApiUrl("/api/orders/form-options"), {
      cache: "no-store",
    })

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
    const response = await fetch(createApiUrl(`/api/orders/${orderId}`), {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error("발주 상세 정보를 불러오지 못했습니다.")
    }

    const rawData = await response.json()

    return toFrontendPurchaseOrder(rawData)
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
    const formData = new FormData()

    // 1-1. JSON 데이터를 Blob으로 감싸서 'data'라는 이름으로 포장
    formData.append(
      "data",
      new Blob([JSON.stringify(payload)], { type: "application/json; charset=utf-8" })
    )

    // 1-2. 첨부파일이 있으면 'file'이라는 이름으로 포장
    if (attachment) {
      formData.append("file", attachment)
    }

    // 1-3. POST 메서드로 FormData 전송 (Content-Type 헤더는 비워둬야 합니다!)
    const response = await fetch(createApiUrl("/api/orders"), {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => "발주를 등록하지 못했습니다.")
      throw new Error(errorText || "발주를 등록하지 못했습니다.")
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
    const formData = new FormData();

    // 1-1. JSON 데이터를 Blob으로 감싸서 'data'라는 이름으로 포장 (백엔드의 @RequestPart("data")와 매핑)
    formData.append(
      "data",
      new Blob([JSON.stringify(payload)], { type: "application/json; charset=utf-8" })
    )

    // 1-2. 첨부파일이 있으면 'file'이라는 이름으로 포장 (백엔드의 @RequestPart("file")과 매핑)
    if (attachment) {
      formData.append("file", attachment);
    }

    // 1-3. Fetch 요청 발송 (Content-Type 헤더 제거 필수!)
    const response = await fetch(createApiUrl(`/api/orders/${orderId}`), {
      method: "PUT",
      body: formData, 
    });

    if (!response.ok) {
      // 서버에서 보내주는 에러 메시지가 있다면 그걸 보여주도록 개선
      const errorText = await response.text().catch(() => "발주 정보를 수정하지 못했습니다.");
      throw new Error(errorText || "발주 정보를 수정하지 못했습니다.");
    }

    return response.json();
  }

  await wait(200);

  const previousOrder = purchaseOrderDatabase.find(
    (item) => item.id === Number(orderId)
  );

  if (!previousOrder) {
    throw new Error("수정할 발주 정보를 찾을 수 없습니다.");
  }

  if (!canEditPurchaseOrder(previousOrder.status)) {
    throw new Error("현재 상태에서는 발주 정보를 수정할 수 없습니다.");
  }

  const safePayload = canEditPurchaseOrderCoreFields(previousOrder.status)
    ? payload
    : {
        ...previousOrder,
        expectedReceiptFrom: payload.expectedReceiptFrom,
        expectedReceiptTo: payload.expectedReceiptTo,
        warehouseCode: payload.warehouseCode,
        memo: payload.memo,
        status: previousOrder.status,
        items: previousOrder.items,
      };

  const updatedOrder = createRecord(
    safePayload,
    Number(orderId),
    attachment,
    previousOrder
  );

  purchaseOrderDatabase = purchaseOrderDatabase.map((order) =>
    order.orderId === Number(orderId) ? updatedOrder : order
  );

  return clone(updatedOrder);
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

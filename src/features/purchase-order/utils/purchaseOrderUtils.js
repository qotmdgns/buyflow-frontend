export const PURCHASE_ORDER_STATUS_META = {
  DRAFT: {
    label: "임시 저장",
    badgeClassName: "border-slate-200 bg-slate-50 text-slate-500",
  },
  PENDING: {
    label: "발주 대기",
    badgeClassName: "border-amber-200 bg-amber-50 text-amber-700",
  },
  APPROVED: {
    label: "발주 확정",
    badgeClassName: "border-blue-200 bg-blue-50 text-blue-700",
  },
  CONFIRMED: {
    label: "발주 확정",
    badgeClassName: "border-blue-200 bg-blue-50 text-blue-700",
  },
  ORDERED: {
    label: "발주 완료",
    badgeClassName: "border-blue-200 bg-blue-50 text-blue-700",
  },
  PARTIAL_RECEIVED: {
    label: "부분 입고",
    badgeClassName: "border-amber-200 bg-amber-50 text-amber-600",
  },
  RECEIVED: {
    label: "입고 완료",
    badgeClassName: "border-emerald-200 bg-emerald-50 text-emerald-600",
  },
  COMPLETED: {
    label: "입고 완료",
    badgeClassName: "border-emerald-200 bg-emerald-50 text-emerald-600",
  },
  CANCELED: {
    label: "발주 취소",
    badgeClassName: "border-rose-200 bg-rose-50 text-rose-600",
  },
  CANCELLED: {
    label: "발주 취소",
    badgeClassName: "border-rose-200 bg-rose-50 text-rose-600",
  },
}

export const DEFAULT_PURCHASE_ORDER_FILTERS = {
  orderNo: "",
  requestNo: "",
  supplierName: "전체 공급업체",
  userName: "",
  orderStatus: "전체",
  orderedFrom: "",
  orderedTo: "",
}

export const DEFAULT_PURCHASE_ORDER_PAGINATION = {
  page: 1,
  size: 10,
  totalElements: 0,
  totalPages: 1,
}

export const EMPTY_PURCHASE_ORDER_FORM = {
  orderNumber: "",
  requestId: "",
  requestNumber: "",
  requestTitle: "",
  supplierId: "",
  supplierName: "",
  supplierManagerName: "",
  supplierContact: "",
  orderManager: "김철수",
  orderedAt: "",
  expectedReceiptFrom: "",
  expectedReceiptTo: "",
  warehouseCode: "",
  memo: "",
  status: "",
}

export function getTodayString() {
  return new Date().toISOString().slice(0, 10)
}

export function formatWon(value = 0) {
  return `${Number(value).toLocaleString("ko-KR")}원`
}

export function getPurchaseOrderStatusMeta(status) {
  if (!status) {
    return {
      label: "-",
      badgeClassName: "border-slate-200 bg-slate-50 text-slate-500",
    };
  }

  const key = status.toString().toUpperCase();

  return PURCHASE_ORDER_STATUS_META[key] ?? {
    label: status,
    badgeClassName: "border-slate-200 bg-slate-50 text-slate-500",
  };
}

export function getPurchaseOrderStatusLabel(status) {
  if (!status) return "알 수 없음";
  
  const meta = PURCHASE_ORDER_STATUS_META[status.toUpperCase()];
  return meta ? meta.label : status;
}

export function canEditPurchaseOrder(status) {
  return status === "CONFIRMED"
}

export const canEditPurchaseOrderCoreFields = (status) => {
  if (!status) return true; // status가 없으면 편집 허용

  const editableStatuses = ["DRAFT", "PENDING", "CONFIRMED"]; // 필요에 따라 추가

  return editableStatuses.includes(status);
};

export function canCancelPurchaseOrder(status) {
  return status === "DRAFT" || status === "CONFIRMED"
}

export function calculatePurchaseOrderLine(item = {}) {
  // orderQuantity 또는 quantity 둘 다 지원
  const quantity = Number(item.orderQuantity ?? item.quantity ?? 0)
  const unitPrice = Number(item.unitPrice ?? 0)

  const supplyAmount = quantity * unitPrice
  const vatAmount = Math.round(supplyAmount * 0.1)   // 또는 Math.floor

  console.log("=== [LINE] 계산 ===", { 
    quantity, 
    unitPrice, 
    supplyAmount, 
    vatAmount, 
    totalAmount: supplyAmount + vatAmount 
  })

  return {
    supplyAmount,
    vatAmount,
    totalAmount: supplyAmount + vatAmount,
  }
}

export function calculatePurchaseOrderSummary(items = []) {
  return items.reduce(
    (summary, item) => {
      const line = calculatePurchaseOrderLine(item)

      return {
        supplyAmount: summary.supplyAmount + line.supplyAmount,
        vatAmount: summary.vatAmount + line.vatAmount,
        totalAmount: summary.totalAmount + line.totalAmount,
      }
    },
    { supplyAmount: 0, vatAmount: 0, totalAmount: 0 }
  )
}

export function createOrderItemFromRequestItem(item, previousItem = null) {
  const targetId = item.requestItemId || item.id

  return {
    id: targetId,
    requestItemId: targetId,
    productId: item.productId,
    itemCode: item.itemCode || "-",
    itemName: item.itemName || "이름 없음",
    specification: item.specification || "-",
    requestedQuantity: item.requestedQuantity || 0,
    orderQuantity: previousItem
      ? previousItem.orderQuantity
      : item.requestQuantity > 0
        ? item.requestQuantity
        : 1,
    unit: item.unit || "EA",
    unitPrice: previousItem
      ? previousItem.unitPrice
      : item.estimatedUnitPrice > 0
        ? item.estimatedUnitPrice
        : 1000,
    remark: item.remark || "",
  }
}

export function createPurchaseOrderForm(detail = null) {
  if (!detail) {
    return {
      ...EMPTY_PURCHASE_ORDER_FORM,
      orderedAt: getTodayString(),
    }
  }

  return {
    orderNumber: detail.orderNumber ?? "",
    requestId: String(detail.requestId ?? ""),
    requestNumber: detail.requestNumber ?? "",
    requestTitle: detail.requestTitle ?? "",
    supplierId: String(detail.supplierId ?? ""),
    supplierName: detail.supplierName ?? "",
    supplierManagerName: detail.supplierManagerName ?? "",
    supplierContact: detail.supplierContact ?? "",
    orderManager: detail.orderManager ?? "",
    orderedAt: detail.orderedAt ?? "",
    expectedReceiptFrom: detail.expectedReceiptFrom ?? "",
    expectedReceiptTo: detail.expectedReceiptTo ?? "",
    warehouseCode: String(detail.warehouseCode ?? ""),
    memo: detail.memo ?? "",
    status: detail.status ?? "DRAFT",
  }
}

export function validatePurchaseOrderForm(form, items) {
  const errors = {}

  if (!form.requestId) {
    errors.requestId = "승인 완료된 구매 요청을 선택하세요."
  }

  if (!form.supplierId) {
    errors.supplierId = "공급업체를 선택하세요."
  }

  if (!form.orderManager.trim()) {
    errors.orderManager = "발주 담당자를 입력하세요."
  }

  if (!form.expectedReceiptFrom || !form.expectedReceiptTo) {
    errors.expectedReceipt = "입고 예정일 범위를 입력하세요."
  } else if (form.expectedReceiptFrom > form.expectedReceiptTo) {
    errors.expectedReceipt = "입고 예정일 범위를 확인하세요."
  }

  if (!form.warehouseCode) {
    errors.warehouseCode = "입고 창고를 선택하세요."
  }

  if (!items.length) {
    errors.items = "발주 품목을 1개 이상 추가하세요."
  } else if (items.some((item) => Number(item.orderQuantity) <= 0)) {
    errors.items = "발주 수량은 1개 이상이어야 합니다."
  } else if (items.some((item) => Number(item.unitPrice) < 0)) {
    errors.items = "공급 단가는 0원 이상이어야 합니다."
  }

  return errors
}

import {
  mockReceipts,
  mockReceiptWarehouses,
} from "@/features/receipt/data/mockReceiptData"

const USE_MOCK = process.env.NEXT_PUBLIC_USE_RECEIPT_MOCK !== "false"

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

function distributeQuantity(totalQuantity, itemCount, itemIndex) {
  const baseQuantity = Math.floor(totalQuantity / itemCount)
  const remainder = totalQuantity % itemCount

  return baseQuantity + (itemIndex < remainder ? 1 : 0)
}

function createDetailedReceipt(receipt) {
  const items = Array.from({ length: receipt.itemCount }, (_, index) => {
    const orderQuantity = distributeQuantity(
      receipt.orderQuantity,
      receipt.itemCount,
      index,
    )

    const cumulativeReceivedQuantity = distributeQuantity(
      receipt.receivedQuantity,
      receipt.itemCount,
      index,
    )

    const primaryItemCode = receipt.itemCodes[0]
    const primaryItemName = receipt.itemNames[0]

    return {
      id: receipt.id * 1000 + index + 1,
      orderItemId: receipt.id * 1000 + index + 1,

      itemCode:
        index === 0
          ? primaryItemCode
          : `SKU-${String(receipt.id * 100 + index + 1).padStart(5, "0")}`,

      itemName:
        index === 0
          ? primaryItemName
          : `${primaryItemName} 연계 품목 ${index + 1}`,

      specification: index === 0 ? "표준 규격" : `규격-${index + 1}`,
      unit: "EA",
      orderQuantity,
      cumulativeReceivedQuantity,
      remainingQuantity: orderQuantity - cumulativeReceivedQuantity,
    }
  })

  const histories = receipt.receivedQuantity
    ? [
        {
          id: receipt.id * 100 + 1,
          receiptNumber: `IN-2026-${String(receipt.id).padStart(4, "0")}-01`,
          receivedAt: receipt.expectedReceiptAt,
          receiverName: "김철수",
          memo: "기존 입고 처리 이력",
          totalReceivedQuantity: receipt.receivedQuantity,

          items: items
            .filter((item) => item.cumulativeReceivedQuantity > 0)
            .map((item) => ({
              orderItemId: item.orderItemId,
              itemCode: item.itemCode,
              itemName: item.itemName,
              unit: item.unit,
              receivedQuantity: item.cumulativeReceivedQuantity,
            })),

          attachments: [],
        },
      ]
    : []

  return {
    ...receipt,
    itemCodes: items.map((item) => item.itemCode),
    itemNames: items.map((item) => item.itemName),
    items,
    histories,
  }
}

let receiptDatabase = structuredClone(mockReceipts).map(createDetailedReceipt)

function matchesActiveTab(receipt, activeTab) {
  if (activeTab === "EXPECTED") {
    return receipt.status === "EXPECTED" || receipt.status === "DELAYED"
  }

  if (activeTab === "PARTIAL") {
    return receipt.status === "PARTIAL"
  }

  if (activeTab === "COMPLETED") {
    return receipt.status === "COMPLETED"
  }

  return true
}

function filterReceipts(params) {
  const {
    activeTab = "EXPECTED",
    orderNumber = "",
    supplierKeyword = "",
    itemKeyword = "",
    warehouseName = "전체 창고",
    expectedFrom = "",
    expectedTo = "",
    status = "전체 상태",
  } = params

  return receiptDatabase.filter((receipt) => {
    const itemMatched =
      !itemKeyword ||
      receipt.itemCodes.some((itemCode) =>
        includesKeyword(itemCode, itemKeyword),
      ) ||
      receipt.itemNames.some((itemName) =>
        includesKeyword(itemName, itemKeyword),
      )

    const statusMatched =
      status === "전체 상태"
        ? matchesActiveTab(receipt, activeTab)
        : receipt.status === status

    return (
      (!orderNumber || includesKeyword(receipt.orderNumber, orderNumber)) &&
      (!supplierKeyword ||
        includesKeyword(receipt.supplierName, supplierKeyword)) &&
      itemMatched &&
      (warehouseName === "전체 창고" ||
        receipt.warehouseName === warehouseName) &&
      (!expectedFrom || receipt.expectedReceiptAt >= expectedFrom) &&
      (!expectedTo || receipt.expectedReceiptAt <= expectedTo) &&
      statusMatched
    )
  })
}

function createNextReceiptNumber() {
  const historyCount = receiptDatabase.reduce(
    (count, receipt) => count + receipt.histories.length,
    0,
  )

  return `IN-2026-${String(historyCount + 1).padStart(4, "0")}`
}

function createEligibleOrder(receipt) {
  return {
    id: receipt.id,
    orderNumber: receipt.orderNumber,
    supplierName: receipt.supplierName,
    warehouseName: receipt.warehouseName,
    expectedReceiptAt: receipt.expectedReceiptAt,
    remainingQuantity: receipt.remainingQuantity,
    status: receipt.status,

    items: receipt.items
      .filter((item) => item.remainingQuantity > 0)
      .map((item) => ({ ...item })),
  }
}

export async function fetchReceipts(params = {}) {
  if (!USE_MOCK) {
    const query = new URLSearchParams(params)

    const response = await fetch(
      createApiUrl(`/api/receipts?${query.toString()}`),
      { cache: "no-store" },
    )

    if (!response.ok) {
      throw new Error("입고 목록을 불러오지 못했습니다.")
    }

    return response.json()
  }

  await wait(120)

  const { page = 1, size = 10 } = params
  const filteredReceipts = filterReceipts(params)
  const totalElements = filteredReceipts.length
  const totalPages = Math.max(1, Math.ceil(totalElements / size))
  const safePage = Math.min(Math.max(Number(page), 1), totalPages)
  const offset = (safePage - 1) * size

  return {
    items: clone(filteredReceipts.slice(offset, offset + size)),
    pagination: {
      page: safePage,
      size,
      totalElements,
      totalPages,
    },
  }
}

export async function fetchReceiptFilterOptions() {
  if (!USE_MOCK) {
    const response = await fetch(createApiUrl("/api/receipts/filter-options"), {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error("입고 검색 조건을 불러오지 못했습니다.")
    }

    return response.json()
  }

  return {
    warehouses: ["전체 창고", ...mockReceiptWarehouses],
    statuses: ["전체 상태", "EXPECTED", "DELAYED", "PARTIAL", "COMPLETED"],
  }
}

export async function fetchReceiptSummary() {
  if (!USE_MOCK) {
    const response = await fetch(createApiUrl("/api/receipts/summary"), {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error("입고 현황을 불러오지 못했습니다.")
    }

    return response.json()
  }

  const today = new Date().toISOString().slice(0, 10)

  const expectedCount = receiptDatabase.filter(
    (receipt) => receipt.status === "EXPECTED" || receipt.status === "DELAYED",
  ).length

  const delayedCount = receiptDatabase.filter(
    (receipt) => receipt.status === "DELAYED",
  ).length

  const partialCount = receiptDatabase.filter(
    (receipt) => receipt.status === "PARTIAL",
  ).length

  const completedCount = receiptDatabase.filter(
    (receipt) => receipt.status === "COMPLETED",
  ).length

  const todayExpectedCount = receiptDatabase.filter(
    (receipt) =>
      receipt.expectedReceiptAt === today && receipt.status === "EXPECTED",
  ).length

  return {
    todayExpected: todayExpectedCount,
    yesterdayDifference: 3,
    delayed: delayedCount,
    partial: partialCount,
    progressRate: 68,
    tabCounts: {
      EXPECTED: expectedCount,
      PARTIAL: partialCount,
      COMPLETED: completedCount,
    },
  }
}

export async function fetchReceiptFormOptions() {
  if (!USE_MOCK) {
    const response = await fetch(createApiUrl("/api/receipts/form-options"), {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error("입고 등록 기준정보를 불러오지 못했습니다.")
    }

    return response.json()
  }

  await wait(100)

  return {
    nextReceiptNumber: createNextReceiptNumber(),

    eligibleOrders: clone(
      receiptDatabase
        .filter(
          (receipt) =>
            ["EXPECTED", "DELAYED", "PARTIAL"].includes(receipt.status) &&
            receipt.remainingQuantity > 0,
        )
        .map(createEligibleOrder),
    ),
  }
}

export async function fetchReceiptById(receiptId) {
  if (!USE_MOCK) {
    const response = await fetch(createApiUrl(`/api/receipts/${receiptId}`), {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error("입고 상세 정보를 불러오지 못했습니다.")
    }

    return response.json()
  }

  await wait(100)

  const receipt = receiptDatabase.find((item) => item.id === Number(receiptId))

  if (!receipt) {
    throw new Error("입고 정보를 찾을 수 없습니다.")
  }

  return clone(receipt)
}

export async function createReceiptReceipt(payload, attachment = null) {
  if (!USE_MOCK) {
    const response = await fetch(createApiUrl("/api/receipts"), {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error("입고 내역을 등록하지 못했습니다.")
    }

    return response.json()
  }

  await wait(180)

  const previousReceipt = receiptDatabase.find(
    (item) => item.id === Number(payload.targetReceiptId),
  )

  if (!previousReceipt) {
    throw new Error("입고 처리할 발주 정보를 찾을 수 없습니다.")
  }

  if (!["EXPECTED", "DELAYED", "PARTIAL"].includes(previousReceipt.status)) {
    throw new Error("현재 상태에서는 추가 입고를 등록할 수 없습니다.")
  }

  const receiptQuantityMap = new Map(
    (payload.items ?? []).map((item) => [
      Number(item.orderItemId),
      Number(item.receivedQuantity ?? 0),
    ]),
  )

  const items = previousReceipt.items.map((item) => {
    const receivedQuantity =
      receiptQuantityMap.get(Number(item.orderItemId)) ?? 0

    if (receivedQuantity < 0 || receivedQuantity > item.remainingQuantity) {
      throw new Error(`${item.itemName}의 금회 입고 수량을 확인하세요.`)
    }

    const cumulativeReceivedQuantity =
      item.cumulativeReceivedQuantity + receivedQuantity

    return {
      ...item,
      cumulativeReceivedQuantity,
      remainingQuantity: item.orderQuantity - cumulativeReceivedQuantity,
    }
  })

  const receiptItems = items
    .map((item) => ({
      orderItemId: item.orderItemId,
      itemCode: item.itemCode,
      itemName: item.itemName,
      unit: item.unit,

      receivedQuantity: receiptQuantityMap.get(Number(item.orderItemId)) ?? 0,
    }))
    .filter((item) => item.receivedQuantity > 0)

  if (!receiptItems.length) {
    throw new Error("금회 입고 수량을 1개 이상 입력하세요.")
  }

  const totalReceivedQuantity = receiptItems.reduce(
    (sum, item) => sum + item.receivedQuantity,
    0,
  )

  const receivedQuantity = items.reduce(
    (sum, item) => sum + item.cumulativeReceivedQuantity,
    0,
  )

  const remainingQuantity = items.reduce(
    (sum, item) => sum + item.remainingQuantity,
    0,
  )

  const latestReceipt = {
    id: Date.now(),
    receiptNumber: payload.receiptNumber || createNextReceiptNumber(),
    receivedAt: payload.receivedAt,
    receiverName: String(payload.receiverName ?? "").trim(),
    memo: String(payload.memo ?? "").trim(),
    totalReceivedQuantity,
    items: receiptItems,

    attachments: attachment
      ? [
          {
            id: Date.now() + 1,
            fileName: attachment.name,
            downloadUrl: "",
          },
        ]
      : [],
  }

  const updatedReceipt = {
    ...previousReceipt,
    receivedQuantity,
    remainingQuantity,
    status: remainingQuantity === 0 ? "COMPLETED" : "PARTIAL",
    items,
    histories: [...previousReceipt.histories, latestReceipt],
    latestReceipt,
  }

  receiptDatabase = receiptDatabase.map((receipt) =>
    receipt.id === updatedReceipt.id ? updatedReceipt : receipt,
  )

  return clone(updatedReceipt)
}

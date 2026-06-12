import {
  mockInbounds,
  mockInboundWarehouses,
} from "@/features/inbound/data/mockInboundData"

const USE_MOCK = process.env.NEXT_PUBLIC_USE_INBOUND_MOCK !== "false"

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

function createDetailedInbound(inbound) {
  const items = Array.from({ length: inbound.itemCount }, (_, index) => {
    const orderQuantity = distributeQuantity(
      inbound.orderQuantity,
      inbound.itemCount,
      index,
    )

    const cumulativeReceivedQuantity = distributeQuantity(
      inbound.receivedQuantity,
      inbound.itemCount,
      index,
    )

    const primaryItemCode = inbound.itemCodes[0]
    const primaryItemName = inbound.itemNames[0]

    return {
      id: inbound.id * 1000 + index + 1,
      orderItemId: inbound.id * 1000 + index + 1,

      itemCode:
        index === 0
          ? primaryItemCode
          : `SKU-${String(inbound.id * 100 + index + 1).padStart(5, "0")}`,

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

  const histories = inbound.receivedQuantity
    ? [
        {
          id: inbound.id * 100 + 1,
          inboundNumber: `IN-2026-${String(inbound.id).padStart(4, "0")}-01`,
          receivedAt: inbound.expectedInboundAt,
          receiverName: "김철수",
          memo: "기존 입고 처리 이력",
          totalReceivedQuantity: inbound.receivedQuantity,

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
    ...inbound,
    itemCodes: items.map((item) => item.itemCode),
    itemNames: items.map((item) => item.itemName),
    items,
    histories,
  }
}

let inboundDatabase = structuredClone(mockInbounds).map(createDetailedInbound)

function matchesActiveTab(inbound, activeTab) {
  if (activeTab === "EXPECTED") {
    return inbound.status === "EXPECTED" || inbound.status === "DELAYED"
  }

  if (activeTab === "PARTIAL") {
    return inbound.status === "PARTIAL"
  }

  if (activeTab === "COMPLETED") {
    return inbound.status === "COMPLETED"
  }

  return true
}

function filterInbounds(params) {
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

  return inboundDatabase.filter((inbound) => {
    const itemMatched =
      !itemKeyword ||
      inbound.itemCodes.some((itemCode) =>
        includesKeyword(itemCode, itemKeyword),
      ) ||
      inbound.itemNames.some((itemName) =>
        includesKeyword(itemName, itemKeyword),
      )

    const statusMatched =
      status === "전체 상태"
        ? matchesActiveTab(inbound, activeTab)
        : inbound.status === status

    return (
      (!orderNumber || includesKeyword(inbound.orderNumber, orderNumber)) &&
      (!supplierKeyword ||
        includesKeyword(inbound.supplierName, supplierKeyword)) &&
      itemMatched &&
      (warehouseName === "전체 창고" ||
        inbound.warehouseName === warehouseName) &&
      (!expectedFrom || inbound.expectedInboundAt >= expectedFrom) &&
      (!expectedTo || inbound.expectedInboundAt <= expectedTo) &&
      statusMatched
    )
  })
}

function createNextInboundNumber() {
  const historyCount = inboundDatabase.reduce(
    (count, inbound) => count + inbound.histories.length,
    0,
  )

  return `IN-2026-${String(historyCount + 1).padStart(4, "0")}`
}

function createEligibleOrder(inbound) {
  return {
    id: inbound.id,
    orderNumber: inbound.orderNumber,
    supplierName: inbound.supplierName,
    warehouseName: inbound.warehouseName,
    expectedInboundAt: inbound.expectedInboundAt,
    remainingQuantity: inbound.remainingQuantity,
    status: inbound.status,

    items: inbound.items
      .filter((item) => item.remainingQuantity > 0)
      .map((item) => ({ ...item })),
  }
}

export async function fetchInbounds(params = {}) {
  if (!USE_MOCK) {
    const query = new URLSearchParams(params)

    const response = await fetch(
      createApiUrl(`/api/inbounds?${query.toString()}`),
      { cache: "no-store" },
    )

    if (!response.ok) {
      throw new Error("입고 목록을 불러오지 못했습니다.")
    }

    return response.json()
  }

  await wait(120)

  const { page = 1, size = 10 } = params
  const filteredInbounds = filterInbounds(params)
  const totalElements = filteredInbounds.length
  const totalPages = Math.max(1, Math.ceil(totalElements / size))
  const safePage = Math.min(Math.max(Number(page), 1), totalPages)
  const offset = (safePage - 1) * size

  return {
    items: clone(filteredInbounds.slice(offset, offset + size)),
    pagination: {
      page: safePage,
      size,
      totalElements,
      totalPages,
    },
  }
}

export async function fetchInboundFilterOptions() {
  if (!USE_MOCK) {
    const response = await fetch(createApiUrl("/api/inbounds/filter-options"), {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error("입고 검색 조건을 불러오지 못했습니다.")
    }

    return response.json()
  }

  return {
    warehouses: ["전체 창고", ...mockInboundWarehouses],
    statuses: ["전체 상태", "EXPECTED", "DELAYED", "PARTIAL", "COMPLETED"],
  }
}

export async function fetchInboundSummary() {
  if (!USE_MOCK) {
    const response = await fetch(createApiUrl("/api/inbounds/summary"), {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error("입고 현황을 불러오지 못했습니다.")
    }

    return response.json()
  }

  const today = new Date().toISOString().slice(0, 10)

  const expectedCount = inboundDatabase.filter(
    (inbound) => inbound.status === "EXPECTED" || inbound.status === "DELAYED",
  ).length

  const delayedCount = inboundDatabase.filter(
    (inbound) => inbound.status === "DELAYED",
  ).length

  const partialCount = inboundDatabase.filter(
    (inbound) => inbound.status === "PARTIAL",
  ).length

  const completedCount = inboundDatabase.filter(
    (inbound) => inbound.status === "COMPLETED",
  ).length

  const todayExpectedCount = inboundDatabase.filter(
    (inbound) =>
      inbound.expectedInboundAt === today && inbound.status === "EXPECTED",
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

export async function fetchInboundFormOptions() {
  if (!USE_MOCK) {
    const response = await fetch(createApiUrl("/api/inbounds/form-options"), {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error("입고 등록 기준정보를 불러오지 못했습니다.")
    }

    return response.json()
  }

  await wait(100)

  return {
    nextInboundNumber: createNextInboundNumber(),

    eligibleOrders: clone(
      inboundDatabase
        .filter(
          (inbound) =>
            ["EXPECTED", "DELAYED", "PARTIAL"].includes(inbound.status) &&
            inbound.remainingQuantity > 0,
        )
        .map(createEligibleOrder),
    ),
  }
}

export async function fetchInboundById(inboundId) {
  if (!USE_MOCK) {
    const response = await fetch(createApiUrl(`/api/inbounds/${inboundId}`), {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error("입고 상세 정보를 불러오지 못했습니다.")
    }

    return response.json()
  }

  await wait(100)

  const inbound = inboundDatabase.find((item) => item.id === Number(inboundId))

  if (!inbound) {
    throw new Error("입고 정보를 찾을 수 없습니다.")
  }

  return clone(inbound)
}

export async function createInboundReceipt(payload, attachment = null) {
  if (!USE_MOCK) {
    const response = await fetch(createApiUrl("/api/inbounds"), {
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

  const previousInbound = inboundDatabase.find(
    (item) => item.id === Number(payload.targetInboundId),
  )

  if (!previousInbound) {
    throw new Error("입고 처리할 발주 정보를 찾을 수 없습니다.")
  }

  if (!["EXPECTED", "DELAYED", "PARTIAL"].includes(previousInbound.status)) {
    throw new Error("현재 상태에서는 추가 입고를 등록할 수 없습니다.")
  }

  const receiptQuantityMap = new Map(
    (payload.items ?? []).map((item) => [
      Number(item.orderItemId),
      Number(item.receivedQuantity ?? 0),
    ]),
  )

  const items = previousInbound.items.map((item) => {
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
    inboundNumber: payload.inboundNumber || createNextInboundNumber(),
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

  const updatedInbound = {
    ...previousInbound,
    receivedQuantity,
    remainingQuantity,
    status: remainingQuantity === 0 ? "COMPLETED" : "PARTIAL",
    items,
    histories: [...previousInbound.histories, latestReceipt],
    latestReceipt,
  }

  inboundDatabase = inboundDatabase.map((inbound) =>
    inbound.id === updatedInbound.id ? updatedInbound : inbound,
  )

  return clone(updatedInbound)
}

import {
  mockInbounds,
  mockInboundWarehouses,
} from "@/features/inbound/data/mockInboundData"

const USE_MOCK = process.env.NEXT_PUBLIC_USE_INBOUND_MOCK !== "false"

let inboundDatabase = structuredClone(mockInbounds)

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

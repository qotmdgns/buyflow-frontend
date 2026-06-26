import {
  stockFilterOptions,
  mockStocks,
  mockStockHistories,
} from "@/features/stock/data/mockStockData"
import { apiFetch } from "@/lib/api/fetchClient"
import { getStockStatus } from "@/features/stock/utils/stockManagementUtils"

const USE_MOCK = process.env.NEXT_PUBLIC_USE_STOCK_MOCK !== "false"

let stockDatabase = mockStocks.map((stock) => ({
  ...stock,
}))

let stockHistoryDatabase = mockStockHistories.map((history) => ({
  ...history,
}))

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

function includesKeyword(value, keyword) {
  return String(value ?? "")
    .toLowerCase()
    .includes(keyword.trim().toLowerCase())
}

function paginate(items, page = 1, size = 10) {
  const totalElements = items.length
  const totalPages = Math.max(1, Math.ceil(totalElements / size))
  const safePage = Math.min(Math.max(Number(page), 1), totalPages)
  const offset = (safePage - 1) * size

  return {
    items: items.slice(offset, offset + size),
    pagination: {
      page: safePage,
      size,
      totalElements,
      totalPages,
    },
  }
}

function buildQuery(params) {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === "" || value === "전체" || value === false) {
      return
    }

    query.set(key, key === "page" ? String(Number(value) - 1) : String(value))
  })

  return query
}

function getStockSummary(inventories) {
  return inventories.reduce(
    (summary, stock) => {
      const status = getStockStatus(stock.currentStock, stock.safetyStock)

      summary.total += 1

      if (status === "정상") {
        summary.normal += 1
      }

      if (status === "안전재고 미만") {
        summary.low += 1
      }

      if (status === "재고 없음") {
        summary.outOfStock += 1
      }

      return summary
    },
    {
      total: 0,
      normal: 0,
      low: 0,
      outOfStock: 0,
    },
  )
}

function getMockInventories(params = {}) {
  const {
    page = 1,
    size = 10,
    itemCode = "",
    itemName = "",
    category = "전체",
    warehouseCode = "전체",
    stockStatus = "전체",
  } = params

  // 품목 코드, 품목명, 카테고리, 창고 조건만 적용합니다.
  // 카드 요약 숫자를 계산할 때는 stockStatus를 제외합니다.
  const baseFilteredInventories = stockDatabase.filter((stock) => {
    return (
      (!itemCode || includesKeyword(stock.itemCode, itemCode)) &&
      (!itemName || includesKeyword(stock.itemName, itemName)) &&
      (category === "전체" || stock.category === category) &&
      (warehouseCode === "전체" || stock.warehouseCode === warehouseCode)
    )
  })

  // 하단 목록에는 카드에서 선택한 stockStatus 조건까지 적용합니다.
  const visibleInventories = baseFilteredInventories.filter((stock) => {
    const status = getStockStatus(stock.currentStock, stock.safetyStock)

    return stockStatus === "전체" || status === stockStatus
  })

  return {
    ...paginate(visibleInventories, page, size),
    summary: getStockSummary(baseFilteredInventories),
  }
}

function getMockStockHistories(params = {}) {
  const {
    page = 1,
    size = 10,
    fromDate = "",
    toDate = "",
    itemKeyword = "",
    warehouseCode = "전체",
    movementType = "전체",
  } = params

  const histories = stockHistoryDatabase
    .filter((history) => {
      const date = history.occurredAt.slice(0, 10)

      const matchesKeyword =
        !itemKeyword ||
        includesKeyword(history.itemCode, itemKeyword) ||
        includesKeyword(history.itemName, itemKeyword)

      return (
        matchesKeyword &&
        (!fromDate || date >= fromDate) &&
        (!toDate || date <= toDate) &&
        (warehouseCode === "전체" || history.warehouseCode === warehouseCode) &&
        (movementType === "전체" || history.movementType === movementType)
      )
    })
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))

  return paginate(histories, page, size)
}

function normalizeListResponse(data) {
  if (Array.isArray(data)) {
    return {
      items: data,
      pagination: {
        page: 1,
        size: data.length,
        totalElements: data.length,
        totalPages: 1,
      },
    }
  }

  if (Array.isArray(data.items) && data.pagination) {
    return data
  }

  return {
    items: data.content ?? [],
    summary: data.summary,
    pagination: {
      page: (data.number ?? 0) + 1,
      size: data.size ?? 10,
      totalElements: data.totalElements ?? 0,
      totalPages: Math.max(data.totalPages ?? 1, 1),
    },
  }
}

function createDateTimeString() {
  const now = new Date()
  const date = now.toISOString().slice(0, 10)
  const time = now.toTimeString().slice(0, 5)

  return `${date} ${time}`
}

export async function fetchStockFilterOptions() {
  if (USE_MOCK) {
    return stockFilterOptions
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/inventories/filter-options`,
    {
      cache: "no-store",
    },
  )

  if (!response.ok) {
    throw new Error("재고 이력 필터 옵션을 불러오지 못했습니다.")
  }

  return response.json()
}
export async function fetchInventories(params = {}) {
  if (USE_MOCK) {
    await wait(150)

    return getMockInventories(params)
  }

  const query = buildQuery(params)

  console.log("stock-query", query.toString())

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/inventories?${query.toString()}`,
    { cache: "no-store" },
  )

  if (!response.ok) {
    throw new Error("재고 현황을 불러오지 못했습니다.")
  }

  return normalizeListResponse(await response.json())
}

export async function fetchStockHistories(params = {}) {
  if (USE_MOCK) {
    await wait(150)

    return getMockStockHistories(params)
  }

  const query = buildQuery(params)
  console.log("query =", query.toString())

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/stock-history?${query.toString()}`,
    { cache: "no-store" },
  )

  if (!response.ok) {
    throw new Error("재고 이력을 불러오지 못했습니다.")
  }

  return normalizeListResponse(await response.json())
}

export async function createStockAdjustment(payload) {
  if (USE_MOCK) {
    await wait(200)

    const target = stockDatabase.find(
      (stock) => stock.id === Number(payload.stockId),
    )

    if (!target) {
      throw new Error("조정할 재고 정보를 찾을 수 없습니다.")
    }

    const quantity = Number(payload.quantity)

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error("조정 수량은 1 이상의 정수로 입력하세요.")
    }

    const signedQuantity =
      payload.adjustmentType === "increase" ? quantity : -quantity

    const afterStock = target.currentStock + signedQuantity

    if (afterStock < 0) {
      throw new Error("현재 재고보다 많은 수량을 차감할 수 없습니다.")
    }

    const occurredAt = createDateTimeString()

    stockDatabase = stockDatabase.map((stock) =>
      stock.id === target.id
        ? {
            ...stock,
            currentStock: afterStock,
            lastChangedAt: occurredAt,
          }
        : stock,
    )

    const history = {
      id: `HIS-ADJ-${Date.now()}`,
      stockId: target.id,
      occurredAt,
      movementType: signedQuantity > 0 ? "재고 조정 증가" : "재고 조정 감소",
      itemCode: target.itemCode,
      itemName: target.itemName,
      warehouseCode: target.warehouseCode,
      warehouseName: target.warehouseName,
      quantity: signedQuantity,
      beforeStock: target.currentStock,
      afterStock,
      referenceNumber: `ADJ-${Date.now()}`,
      reason: payload.reason.trim(),
      processedBy: "김철수 대리",
    }

    stockHistoryDatabase = [history, ...stockHistoryDatabase]

    return history
  }

  return apiFetch(`/api/inventories/${payload.stockId}/adjustments`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function fetchStocks(params = {}) {
  return fetchInventories(params)
}

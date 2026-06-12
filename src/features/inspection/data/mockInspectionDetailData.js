import { mockPendingInspections } from "@/features/inspection/data/mockInspectionData"

const STORAGE_KEY = "buyflow-inspection-results"

const itemCatalog = [
  {
    itemCode: "ITEM-8012",
    itemName: "정밀 베어링 A형",
    category: "기계부품",
    specification: "15mm, 강철",
    unit: "EA",
  },
  {
    itemCode: "ITEM-9421",
    itemName: "고강도 스틸 와이어",
    category: "소모품",
    specification: "50m, 5mm",
    unit: "Roll",
  },
  {
    itemCode: "ITEM-1029",
    itemName: "산업용 윤활유 20L",
    category: "윤활유",
    specification: "합성유",
    unit: "Can",
  },
  {
    itemCode: "ITEM-3104",
    itemName: "산업용 안전장갑",
    category: "안전용품",
    specification: "L, 내유성",
    unit: "Pair",
  },
  {
    itemCode: "ITEM-5580",
    itemName: "스테인리스 체결 볼트",
    category: "기계부품",
    specification: "M12 × 50mm",
    unit: "EA",
  },
]

function readStoredResults() {
  if (typeof window === "undefined") {
    return {}
  }

  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}")
  } catch {
    return {}
  }
}

function writeStoredResults(results) {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(results))
}

function createMockItems(inspection) {
  const itemCount = Math.max(Number(inspection.itemCount ?? 1), 1)

  const totalQuantity = Math.max(
    Number(inspection.totalReceivedQuantity ?? 0),
    0,
  )

  const baseQuantity = Math.floor(totalQuantity / itemCount)

  const remainder = totalQuantity % itemCount

  return Array.from(
    {
      length: itemCount,
    },

    (_, index) => {
      const item = itemCatalog[(inspection.id + index - 1) % itemCatalog.length]

      return {
        id: `${inspection.id}-${index + 1}`,
        ...item,

        lotNumber: `LOT-${String(inspection.id).padStart(3, "0")}-${String(
          index + 1,
        ).padStart(2, "0")}`,

        receivedQuantity: baseQuantity + (index < remainder ? 1 : 0),

        acceptedQuantity: null,
        defectiveQuantity: null,
        defectReason: "",
        disposition: "NONE",
      }
    },
  )
}

function calculateStatus(items) {
  const acceptedTotal = items.reduce(
    (total, item) => total + Number(item.acceptedQuantity ?? 0),

    0,
  )

  const defectiveTotal = items.reduce(
    (total, item) => total + Number(item.defectiveQuantity ?? 0),

    0,
  )

  if (defectiveTotal === 0) {
    return "COMPLETED"
  }

  if (acceptedTotal === 0) {
    return "REJECTED"
  }

  return "PARTIAL_ACCEPTED"
}

export function hasMockInspectionResult(inspectionId) {
  const results = readStoredResults()

  return Boolean(results[String(inspectionId)])
}

export function getMockInspectionDetail(inspectionId) {
  const inspection = mockPendingInspections.find(
    (item) => String(item.id) === String(inspectionId),
  )

  if (!inspection) {
    return null
  }

  const storedResult = readStoredResults()[String(inspectionId)] ?? null

  return {
    ...inspection,

    status: storedResult?.status ?? "PENDING",

    items: storedResult?.items ?? createMockItems(inspection),

    inspectionResult: storedResult,
  }
}

export function saveMockInspectionResult(inspectionId, payload) {
  const inspection = mockPendingInspections.find(
    (item) => String(item.id) === String(inspectionId),
  )

  if (!inspection) {
    return null
  }

  const items = payload.items.map((item) => ({
    ...item,

    acceptedQuantity: Number(item.acceptedQuantity),

    defectiveQuantity: Number(item.defectiveQuantity),
  }))

  const nextResult = {
    status: calculateStatus(items),
    inspectorName: payload.inspectorName,
    inspectedAt: payload.inspectedAt,
    note: payload.note ?? "",
    items,
  }

  const results = readStoredResults()

  results[String(inspectionId)] = nextResult

  writeStoredResults(results)

  return getMockInspectionDetail(inspectionId)
}

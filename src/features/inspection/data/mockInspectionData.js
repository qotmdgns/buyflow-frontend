const suppliers = [
  "한빛산업",
  "세종테크",
  "대성유통",
  "에이스솔루션",
  "동아오피스",
  "미래부품",
]

const warehouses = [
  "본사 자재창고",
  "제1 물류창고",
  "제2 물류창고",
  "소모품 창고",
]

const receivers = ["김철수", "이지민", "박준서", "최유진", "정다은", "윤서진"]

function subtractDays(dateString, days) {
  const date = new Date(`${dateString}T00:00:00`)
  date.setDate(date.getDate() - days)

  return date.toISOString().slice(0, 10)
}

function addDays(dateString, days) {
  const date = new Date(`${dateString}T00:00:00`)
  date.setDate(date.getDate() + days)

  return date.toISOString().slice(0, 10)
}

export const mockPendingInspections = Array.from({ length: 37 }, (_, index) => {
  const id = index + 1
  const receivedAt = subtractDays("2026-06-12", index % 12)

  return {
    id,
    inspectionNumber: `IQC-2026-${String(id).padStart(4, "0")}`,
    inboundNumber: `IN-2026-${String(48 - index).padStart(4, "0")}`,
    orderNumber: `PO-2026-${String(72 - index).padStart(4, "0")}`,
    supplierName: suppliers[index % suppliers.length],
    warehouseName: warehouses[index % warehouses.length],
    receivedAt,
    inspectionDueAt: addDays(receivedAt, index % 4 === 0 ? 1 : 2),
    itemCount: (index % 5) + 1,
    totalReceivedQuantity: 20 + ((index * 13) % 180),
    priority: index % 7 === 0 ? "긴급" : "일반",
    status: "PENDING",
    receivedBy: receivers[index % receivers.length],
  }
})

export const inspectionFilterOptions = {
  suppliers: ["전체 공급업체", ...suppliers],
  warehouses: ["전체 창고", ...warehouses],
  priorities: ["전체", "일반", "긴급"],
}

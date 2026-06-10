import { mockPurchaseRequests } from "@/features/purchase-request/data/mockPurchaseRequestListData"

const representativeItems = [
  {
    id: 1,
    itemCode: "ITEM-8012",
    itemName: "정밀 베어링 A형",
    category: "기계부품",
    specification: "15mm, 강철",
    requestQuantity: 10,
    unit: "EA",
    estimatedUnitPrice: 120000,
    estimatedAmount: 1200000,
  },
  {
    id: 2,
    itemCode: "ITEM-9421",
    itemName: "고강도 스틸 와이어",
    category: "소모품",
    specification: "50m, 5mm",
    requestQuantity: 5,
    unit: "Roll",
    estimatedUnitPrice: 250000,
    estimatedAmount: 1250000,
  },
  {
    id: 3,
    itemCode: "ITEM-1029",
    itemName: "산업용 윤활유 20L",
    category: "윤활유",
    specification: "합성유",
    requestQuantity: 0,
    unit: "Can",
    estimatedUnitPrice: 0,
    estimatedAmount: 0,
  },
]

const representativeAttachments = [
  {
    id: 1,
    fileName: "견적서_20260601.pdf",
    downloadUrl: "",
  },
  {
    id: 2,
    fileName: "품목사양서.xlsx",
    downloadUrl: "",
  },
]

function createFallbackItems(request) {
  return [
    {
      id: `${request.id}-fallback-item`,
      itemCode: "ITEM-DEMO",
      itemName: `${request.title} 관련 품목`,
      category: "기타",
      specification: "-",
      requestQuantity: 1,
      unit: "EA",
      estimatedUnitPrice: request.totalAmount,
      estimatedAmount: request.totalAmount,
    },
  ]
}

export function getMockPurchaseRequestDetail(requestId) {
  const request = mockPurchaseRequests.find(
    (item) => String(item.id) === String(requestId),
  )

  if (!request) {
    return null
  }

  const isRepresentativeRequest = String(requestId) === "1"

  return {
    ...request,
    reason:
      "노후 부품 교체 및 예비 부품 확보를 위해 요청드립니다. 현재 가동 중인 라인의 안정성을 위해 조속한 승인 부탁드립니다.",
    items: isRepresentativeRequest
      ? representativeItems
      : createFallbackItems(request),
    attachments: isRepresentativeRequest ? representativeAttachments : [],
  }
}

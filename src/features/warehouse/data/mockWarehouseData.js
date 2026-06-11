import { WAREHOUSE_TYPE_OPTIONS } from "@/features/warehouse/utils/warehouseManagementUtils"

function createAddress(baseAddress, detailAddress = "") {
  return [baseAddress, detailAddress].filter(Boolean).join(" ")
}

const seedWarehouses = [
  {
    name: "인천 제1 물류센터",
    type: "일반 창고",
    baseAddress: "인천광역시 중구 서해대로 123",
    detailAddress: "",
    activeStatus: "사용 중",
    manager: "김철수",
    phone: "010-1234-5678",
    memo: "수도권 주요 물류 입출고 창고",
    registeredAt: "2023-10-12",
  },
  {
    name: "평택 냉장창고",
    type: "냉장 창고",
    baseAddress: "경기도 평택시 포승읍 평택항로 45",
    detailAddress: "",
    activeStatus: "사용 중",
    manager: "이영희",
    phone: "010-2345-6789",
    memo: "냉장 보관 전용 창고",
    registeredAt: "2023-11-05",
  },
  {
    name: "부산 항만보관소",
    type: "보세 창고",
    baseAddress: "부산광역시 남구 신선로 789",
    detailAddress: "",
    activeStatus: "사용 중지",
    manager: "박지민",
    phone: "010-3456-7890",
    memo: "항만 입고 물품 임시 보관",
    registeredAt: "2023-08-22",
  },
  {
    name: "대전 유통허브",
    type: "일반 창고",
    baseAddress: "대전광역시 대덕구 대화로 100",
    detailAddress: "",
    activeStatus: "사용 중",
    manager: "최준호",
    phone: "010-4567-8901",
    memo: "",
    registeredAt: "2024-01-15",
  },
  {
    name: "광주 호남영업소",
    type: "일반 창고",
    baseAddress: "광주광역시 광산구 하남산단로 55",
    detailAddress: "",
    activeStatus: "사용 중",
    manager: "정수아",
    phone: "010-5678-9012",
    memo: "",
    registeredAt: "2024-02-20",
  },
  {
    name: "서울 북부물류센터",
    type: "일반 창고",
    baseAddress: "서울특별시 노원구 동일로 321",
    detailAddress: "",
    activeStatus: "사용 중",
    manager: "한도윤",
    phone: "010-6789-0123",
    memo: "",
    registeredAt: "2024-03-02",
  },
  {
    name: "용인 중앙창고",
    type: "일반 창고",
    baseAddress: "경기도 용인시 처인구 백암로 210",
    detailAddress: "",
    activeStatus: "사용 중",
    manager: "윤서진",
    phone: "010-7890-1234",
    memo: "",
    registeredAt: "2024-03-11",
  },
  {
    name: "청주 중부보관소",
    type: "냉동 창고",
    baseAddress: "충청북도 청주시 흥덕구 산업단지로 88",
    detailAddress: "",
    activeStatus: "사용 중지",
    manager: "문예린",
    phone: "010-8901-2345",
    memo: "",
    registeredAt: "2024-03-19",
  },
  {
    name: "울산 산업자재창고",
    type: "위험물 창고",
    baseAddress: "울산광역시 남구 산업로 150",
    detailAddress: "",
    activeStatus: "사용 중",
    manager: "장민석",
    phone: "010-9012-3456",
    memo: "산업 자재 보관",
    registeredAt: "2024-04-01",
  },
  {
    name: "제주 지역보관소",
    type: "일반 창고",
    baseAddress: "제주특별자치도 제주시 연삼로 27",
    detailAddress: "",
    activeStatus: "사용 중",
    manager: "오지후",
    phone: "010-0123-4567",
    memo: "",
    registeredAt: "2024-04-09",
  },
]

export const warehouseFilterOptions = {
  warehouseTypes: ["전체", ...WAREHOUSE_TYPE_OPTIONS],
  activeStatuses: ["전체", "사용 중", "사용 중지"],
}

export const mockWarehouses = Array.from({ length: 124 }, (_, index) => {
  const seed = seedWarehouses[index % seedWarehouses.length]
  const repeat = Math.floor(index / seedWarehouses.length)

  return {
    id: index + 1,
    code: `WH-${String(index + 1).padStart(3, "0")}`,
    ...seed,
    name: repeat ? `${seed.name} ${repeat + 1}` : seed.name,
    address: createAddress(seed.baseAddress, seed.detailAddress),
  }
})

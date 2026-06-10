const seedWarehouses = [
  {
    name: "인천 제1 물류센터",
    address: "인천광역시 중구 서해대로 123",
    activeStatus: "사용 중",
    manager: "김철수",
    phone: "010-1234-5678",
    registeredAt: "2023-10-12",
  },
  {
    name: "평택 냉장창고",
    address: "경기도 평택시 포승읍 평택항로 45",
    activeStatus: "사용 중",
    manager: "이영희",
    phone: "010-2345-6789",
    registeredAt: "2023-11-05",
  },
  {
    name: "부산 항만보관소",
    address: "부산광역시 남구 신선로 789",
    activeStatus: "사용 중지",
    manager: "박지민",
    phone: "010-3456-7890",
    registeredAt: "2023-08-22",
  },
  {
    name: "대전 유통허브",
    address: "대전광역시 대덕구 대화로 100",
    activeStatus: "사용 중",
    manager: "최준호",
    phone: "010-4567-8901",
    registeredAt: "2024-01-15",
  },
  {
    name: "광주 호남영업소",
    address: "광주광역시 광산구 하남산단로 55",
    activeStatus: "사용 중",
    manager: "정수아",
    phone: "010-5678-9012",
    registeredAt: "2024-02-20",
  },
  {
    name: "서울 북부물류센터",
    address: "서울특별시 노원구 동일로 321",
    activeStatus: "사용 중",
    manager: "한도윤",
    phone: "010-6789-0123",
    registeredAt: "2024-03-02",
  },
  {
    name: "용인 중앙창고",
    address: "경기도 용인시 처인구 백암로 210",
    activeStatus: "사용 중",
    manager: "윤서진",
    phone: "010-7890-1234",
    registeredAt: "2024-03-11",
  },
  {
    name: "청주 중부보관소",
    address: "충청북도 청주시 흥덕구 산업단지로 88",
    activeStatus: "사용 중지",
    manager: "문예린",
    phone: "010-8901-2345",
    registeredAt: "2024-03-19",
  },
  {
    name: "울산 산업자재창고",
    address: "울산광역시 남구 산업로 150",
    activeStatus: "사용 중",
    manager: "장민석",
    phone: "010-9012-3456",
    registeredAt: "2024-04-01",
  },
  {
    name: "제주 지역보관소",
    address: "제주특별자치도 제주시 연삼로 27",
    activeStatus: "사용 중",
    manager: "오지후",
    phone: "010-0123-4567",
    registeredAt: "2024-04-09",
  },
]

export const warehouseFilterOptions = {
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
  }
})

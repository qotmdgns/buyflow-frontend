const seedSuppliers = [
  {
    name: "(주)코리아테크",
    businessNumber: "120-81-12345",
    manager: "김철수",
    phone: "010-1234-5678",
    email: "cs.kim@gmail.com",
    address: "경기도 성남시 분당구",
    tradeStatus: "거래중",
    registeredAt: "2024-01-15",
  },
  {
    name: "에이치에스테크",
    businessNumber: "214-85-98765",
    manager: "이영희",
    phone: "010-9876-5432",
    email: "yh.lee@hstech.co.kr",
    address: "인천광역시 서구 가남로",
    tradeStatus: "거래중",
    registeredAt: "2024-01-19",
  },
  {
    name: "화신정밀산업",
    businessNumber: "113-81-44556",
    manager: "박준호",
    phone: "010-4455-6677",
    email: "jh.park@hwashin.net",
    address: "경상남도 창원시 성산구",
    tradeStatus: "거래중지",
    registeredAt: "2024-02-02",
  },
  {
    name: "삼양화학공업",
    businessNumber: "305-82-11223",
    manager: "최미나",
    phone: "010-1122-3344",
    email: "mn.choi@samyang.com",
    address: "울산광역시 남구 산업로",
    tradeStatus: "거래중",
    registeredAt: "2024-02-10",
  },
  {
    name: "대한로지스틱스",
    businessNumber: "107-86-77889",
    manager: "정성훈",
    phone: "010-7788-9900",
    email: "sh.jung@daeil.com",
    address: "부산광역시 강서구 유통단지",
    tradeStatus: "거래중",
    registeredAt: "2024-02-16",
  },
  {
    name: "한빛오피스",
    businessNumber: "129-87-34561",
    manager: "윤지혜",
    phone: "010-3456-1234",
    email: "jh.yoon@hanbit.co.kr",
    address: "서울특별시 금천구 가산로",
    tradeStatus: "거래중",
    registeredAt: "2024-02-22",
  },
  {
    name: "미래산업자재",
    businessNumber: "312-86-22445",
    manager: "오민석",
    phone: "010-2244-5566",
    email: "ms.oh@mirae.co.kr",
    address: "충청남도 천안시 서북구",
    tradeStatus: "거래중",
    registeredAt: "2024-03-01",
  },
  {
    name: "세림전자",
    businessNumber: "606-88-90123",
    manager: "강서연",
    phone: "010-9012-3456",
    email: "sy.kang@serim.co.kr",
    address: "경기도 수원시 영통구",
    tradeStatus: "거래중지",
    registeredAt: "2024-03-07",
  },
  {
    name: "대성패키징",
    businessNumber: "410-81-76543",
    manager: "문현우",
    phone: "010-7654-3210",
    email: "hw.moon@daesung.net",
    address: "광주광역시 광산구 평동산단",
    tradeStatus: "거래중",
    registeredAt: "2024-03-13",
  },
  {
    name: "제일안전물산",
    businessNumber: "134-84-45678",
    manager: "송하늘",
    phone: "010-4567-8901",
    email: "hn.song@jeil.co.kr",
    address: "대전광역시 대덕구 산업단지",
    tradeStatus: "거래중",
    registeredAt: "2024-03-20",
  },
]

export const supplierFilterOptions = {
  tradeStatuses: ["전체", "거래중", "거래중지"],
}

export const mockSuppliers = Array.from({ length: 234 }, (_, index) => {
  const seed = seedSuppliers[index % seedSuppliers.length]

  const repeat = Math.floor(index / seedSuppliers.length)

  return {
    id: index + 1,
    code: `SUP-2024-${String(index + 1).padStart(3, "0")}`,
    ...seed,
    name: repeat ? `${seed.name} ${repeat + 1}` : seed.name,
  }
})

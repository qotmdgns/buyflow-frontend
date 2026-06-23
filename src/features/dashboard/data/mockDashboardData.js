const recentRequests = [
  {
    id: "PR-2024-05-24",
    requester: "이민수",
    team: "대리",
    date: "2024-05-24",
    amount: "2,450,000원",
    status: "승인대기",
  },
  {
    id: "PR-2024-05-23",
    requester: "박준형",
    team: "팀장",
    date: "2024-05-23",
    amount: "12,000,000원",
    status: "승인완료",
  },
  {
    id: "PR-2024-05-22",
    requester: "최빛지",
    team: "주임",
    date: "2024-05-23",
    amount: "850,000원",
    status: "반려",
  },
  {
    id: "PR-2024-05-21",
    requester: "이민수",
    team: "대리",
    date: "2024-05-22",
    amount: "4,200,000원",
    status: "승인완료",
  },
  {
    id: "PR-2024-05-20",
    requester: "김소라",
    team: "사원",
    date: "2024-05-21",
    amount: "1,100,000원",
    status: "승인대기",
  },
]

const lowStockItems = [
  {
    stockId: 1,
    code: "ITEM-8012",
    name: "정밀 베어링 A형",
    warehouse: "제1창고",
    warehouseCode: "WH001",
    current: 12,
    safety: 50,
    shortage: 38,
  },
  {
    stockId: 2,
    code: "ITEM-9421",
    name: "고강도 스틸 와이어",
    warehouse: "제2창고",
    warehouseCode: "WH002",
    current: 45,
    safety: 100,
    shortage: 55,
  },
  {
    stockId: 3,
    code: "ITEM-1029",
    name: "산업용 윤활유 20L",
    warehouse: "제1창고",
    warehouseCode: "WH001",
    current: 5,
    safety: 20,
    shortage: 15,
  },
  {
    stockId: 4,
    code: "ITEM-3345",
    name: "PCB 메인보드 V3",
    warehouse: "제3창고",
    warehouseCode: "WH003",
    current: 8,
    safety: 30,
    shortage: 22,
  },
  {
    stockId: 5,
    code: "ITEM-5520",
    name: "유압 실린더 패킹",
    warehouse: "제2창고",
    warehouseCode: "WH002",
    current: 110,
    safety: 150,
    shortage: 40,
  },
]

export const mockDashboardData = {
  lastUpdated: "2026년 6월 1일 03:20",

  summary: [
    {
      key: "delayedOrders",
      label: "납기 지연 발주",
      value: "03건",
      badge: "위험",
      note: "발주 지연 항목 조치",
      tone: "danger",
    },
    {
      key: "pendingApprovals",
      label: "승인 대기 요청",
      value: "12건",
      badge: "15%",
      note: "전일 대비 신규 건수 증가",
      tone: "default",
    },
    {
      key: "scheduledReceipt",
      label: "입고 예정 건수",
      value: "24건",
      badge: "5%",
      note: "이번 주 누적 예정 데이터",
      tone: "default",
    },
    {
      key: "pendingInspections",
      label: "검수 대기 건수",
      value: "08건",
      badge: "",
      note: "품질 검수 우선순위 높음",
      tone: "default",
    },
    {
      key: "lowStock",
      label: "안전재고 부족 품목",
      value: "05개",
      badge: "",
      note: "발주 필요 항목 포함",
      tone: "danger",
    },
  ],

  monthlyReceipt: [
    { month: "1월", quantity: 410 },
    { month: "2월", quantity: 370 },
    { month: "3월", quantity: 500 },
    { month: "4월", quantity: 455 },
    { month: "5월", quantity: 575 },
    { month: "6월", quantity: 620 },
  ],

  stockStatus: [
    { name: "정상", value: 65, fill: "#2f80ed" },
    { name: "안전재고 이하", value: 15, fill: "#ef4444" },
    { name: "재고 없음", value: 20, fill: "#111827" },
  ],

  recentRequests,

  recentRequestTotal: 124,

  lowStockItems,

  lowStockTotal: lowStockItems.length,

  summaryDetails: {
    delayedOrders: [
      {
        orderId: 1,
        orderNo: "PO-2026-0001",
        supplierName: "테스트공급업체",
        dueDate: "2026-06-10",
        status: "발주대기",
        amount: "1,200,000원",
      },
      {
        orderId: 2,
        orderNo: "PO-2026-0002",
        supplierName: "코리아테크",
        dueDate: "2026-06-12",
        status: "입고예정",
        amount: "3,400,000원",
      },
      {
        orderId: 3,
        orderNo: "PO-2026-0003",
        supplierName: "화신컴퓨터",
        dueDate: "2026-06-15",
        status: "발주대기",
        amount: "2,800,000원",
      },
    ],

    pendingApprovals: recentRequests.map((request, index) => ({
      requestId: index + 1,
      requestNo: request.id,
      requester: request.requester,
      team: request.team,
      createdAt: request.date,
      amount: request.amount,
      status: request.status,
    })),

    scheduledReceipts: [
      {
        orderId: 4,
        orderNo: "PO-2026-0004",
        supplierName: "코리아테크",
        dueDate: "2026-06-28",
        status: "입고예정",
        amount: "3,400,000원",
      },
      {
        orderId: 5,
        orderNo: "PO-2026-0005",
        supplierName: "테스트공급업체",
        dueDate: "2026-06-29",
        status: "입고예정",
        amount: "1,900,000원",
      },
    ],

    pendingInspections: [
      {
        receiptId: 1,
        receiptNo: "RCP-2026-0001",
        orderNo: "PO-2026-0002",
        warehouseName: "제1창고",
        receiptDate: "2026-06-21",
        itemCount: 3,
        receiptQuantity: 120,
      },
      {
        receiptId: 2,
        receiptNo: "RCP-2026-0002",
        orderNo: "PO-2026-0004",
        warehouseName: "제2창고",
        receiptDate: "2026-06-22",
        itemCount: 5,
        receiptQuantity: 240,
      },
    ],

    lowStockItems,
  },
}

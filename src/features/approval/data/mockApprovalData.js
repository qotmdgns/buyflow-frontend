export const mockApprovalDetails = {
  1: {
    approvalId: 1,
    requestId: 1,
    requestNumber: "PR-2026-0001",
    title: "2분기 정기 설비 부품 구매 요청",

    requestStatus: "PENDING_APPROVAL",
    requestStatusLabel: "승인 대기",

    requester: {
      employeeId: 101,
      name: "김호현",
    },

    requestDepartment: {
      departmentId: 10,
      name: "구매전략팀",
    },

    requestedAt: "2026-06-01",
    desiredReceiptAt: "2026-06-15",

    priority: "NORMAL",
    priorityLabel: "일반",

    reason:
      "노후 부품 교체 및 예비 부품 확보를 위해 요청드립니다. 현재 가동 중인 라인의 안정성을 위해 조속한 승인 부탁드립니다.",

    currentStep: {
      stepNo: 1,
      stepLabel: "1차 승인",

      approver: {
        employeeId: 201,
        name: "박준영",
        position: "팀장",
      },
    },

    items: [
      {
        requestItemId: 1,
        itemId: 8012,
        itemCode: "ITEM-8012",
        itemName: "정밀 베어링 A형",
        category: "기계부품",
        specification: "15mm, 정렬",
        quantity: 10,
        unit: "EA",
        expectedUnitPrice: 120000,
        expectedAmount: 1200000,
      },
      {
        requestItemId: 2,
        itemId: 9421,
        itemCode: "ITEM-9421",
        itemName: "고강도 스틸 와이어",
        category: "소모품",
        specification: "50m, 5mm",
        quantity: 5,
        unit: "Roll",
        expectedUnitPrice: 250000,
        expectedAmount: 1250000,
      },
      {
        requestItemId: 3,
        itemId: 1029,
        itemCode: "ITEM-1029",
        itemName: "산업용 윤활유 20L",
        category: "유류",
        specification: "합성유",
        quantity: 0,
        unit: "Can",
        expectedUnitPrice: 0,
        expectedAmount: 0,
      },
    ],

    attachments: [
      {
        attachmentId: 1,
        fileName: "견적서_20260601.pdf",
        downloadUrl: "",
      },
      {
        attachmentId: 2,
        fileName: "품목사양서.xlsx",
        downloadUrl: "",
      },
    ],

    history: [
      {
        historyId: 1,
        status: "DONE",
        title: "구매 요청 등록",
        actorName: "김호현",
        actorPosition: "대리",
        processedAt: "2026-06-02T09:20:00",
        description: "요청 등록 완료",
      },
      {
        historyId: 2,
        status: "CURRENT",
        title: "승인 검토 중",
        actorName: "박준영",
        actorPosition: "팀장",
        processedAt: "2026-06-02T10:10:00",
        description: "승인 대기",
      },
      {
        historyId: 3,
        status: "PENDING",
        title: "최종 승인",
        actorName: "-",
        actorPosition: "",
        processedAt: "",
        description: "처리 예정",
      },
    ],
  },
}

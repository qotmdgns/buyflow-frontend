export const mockRoles = [
  {
    id: "ROLE_ADMIN",
    name: "시스템 관리자",
    description: "전체 메뉴 조회 및 변경 권한",
  },
  {
    id: "ROLE_MANAGER",
    name: "구매 관리자",
    description: "구매 요청, 승인, 발주 업무 관리",
  },
  {
    id: "ROLE_WAREHOUSE",
    name: "창고 담당자",
    description: "입고, 검수, 재고 업무 관리",
  },
  {
    id: "ROLE_VIEWER",
    name: "조회 전용",
    description: "주요 현황 조회만 가능",
  },
]

export const mockDepartments = [
  "경영지원팀",
  "구매관리팀",
  "물류운영팀",
  "재고관리팀",
  "품질관리팀",
]

const seedUsers = [
  {
    employeeNo: "EMP-001",
    name: "김철수",
    email: "chulsoo.kim@buyflow.co.kr",
    department: "물류운영팀",
    position: "대리",
    roleId: "ROLE_WAREHOUSE",
    activeStatus: "사용 중",
    registeredAt: "2024-01-12",
  },
  {
    employeeNo: "EMP-002",
    name: "이영희",
    email: "younghee.lee@buyflow.co.kr",
    department: "구매관리팀",
    position: "과장",
    roleId: "ROLE_MANAGER",
    activeStatus: "사용 중",
    registeredAt: "2024-01-18",
  },
  {
    employeeNo: "EMP-003",
    name: "박지민",
    email: "jimin.park@buyflow.co.kr",
    department: "경영지원팀",
    position: "팀장",
    roleId: "ROLE_ADMIN",
    activeStatus: "사용 중",
    registeredAt: "2024-02-03",
  },
  {
    employeeNo: "EMP-004",
    name: "최준호",
    email: "junho.choi@buyflow.co.kr",
    department: "재고관리팀",
    position: "사원",
    roleId: "ROLE_WAREHOUSE",
    activeStatus: "사용 중",
    registeredAt: "2024-02-11",
  },
  {
    employeeNo: "EMP-005",
    name: "정수아",
    email: "sua.jung@buyflow.co.kr",
    department: "품질관리팀",
    position: "대리",
    roleId: "ROLE_VIEWER",
    activeStatus: "사용 중지",
    registeredAt: "2024-02-20",
  },
  {
    employeeNo: "EMP-006",
    name: "한도윤",
    email: "doyoon.han@buyflow.co.kr",
    department: "구매관리팀",
    position: "사원",
    roleId: "ROLE_MANAGER",
    activeStatus: "사용 중",
    registeredAt: "2024-03-02",
  },
]

export const mockUsers = Array.from({ length: 42 }, (_, index) => {
  const seed = seedUsers[index % seedUsers.length]
  const repeat = Math.floor(index / seedUsers.length)

  return {
    id: index + 1,
    ...seed,
    employeeNo: `EMP-${String(index + 1).padStart(3, "0")}`,
    name: repeat ? `${seed.name}${repeat + 1}` : seed.name,
    email: repeat
      ? `${seed.email.split("@")[0]}${repeat + 1}@buyflow.co.kr`
      : seed.email,
  }
})

const permissionTemplate = [
  {
    key: "dashboard",
    label: "대시보드",
    permissions: [{ key: "dashboard.read", label: "현황 조회" }],
  },
  {
    key: "master-data",
    label: "기준정보 관리",
    permissions: [
      { key: "products.read", label: "품목 조회" },
      { key: "products.write", label: "품목 등록·수정" },
      { key: "suppliers.read", label: "공급업체 조회" },
      { key: "warehouses.write", label: "창고 등록·수정" },
    ],
  },
  {
    key: "purchase",
    label: "구매 및 입고",
    permissions: [
      { key: "purchase-requests.read", label: "구매 요청 조회" },
      { key: "purchase-requests.write", label: "구매 요청 등록·수정" },
      { key: "approvals.process", label: "승인 처리" },
      { key: "purchase-orders.write", label: "발주 등록·수정" },
      { key: "receipts.write", label: "입고 등록·수정" },
      { key: "inspections.process", label: "검수 처리" },
    ],
  },
  {
    key: "inventory",
    label: "재고 관리",
    permissions: [
      { key: "inventory.read", label: "재고 현황 조회" },
      { key: "inventory.adjust", label: "재고 조정" },
      { key: "inventory-history.read", label: "재고 이력 조회" },
    ],
  },
  {
    key: "system",
    label: "설정",
    permissions: [
      { key: "users.read", label: "사용자 조회" },
      { key: "users.write", label: "사용자 등록·수정" },
      { key: "roles.write", label: "권한 설정 변경" },
    ],
  },
]

function createPermissionGroups(enabledKeys) {
  return permissionTemplate.map((group) => ({
    ...group,
    permissions: group.permissions.map((permission) => ({
      ...permission,
      checked: enabledKeys.includes(permission.key),
    })),
  }))
}

const allPermissionKeys = permissionTemplate.flatMap((group) =>
  group.permissions.map((permission) => permission.key),
)

export const mockRolePermissions = {
  ROLE_ADMIN: createPermissionGroups(allPermissionKeys),

  ROLE_MANAGER: createPermissionGroups([
    "dashboard.read",
    "products.read",
    "suppliers.read",
    "purchase-requests.read",
    "purchase-requests.write",
    "approvals.process",
    "purchase-orders.write",
    "receipts.write",
    "inventory.read",
    "inventory-history.read",
  ]),

  ROLE_WAREHOUSE: createPermissionGroups([
    "dashboard.read",
    "products.read",
    "purchase-requests.read",
    "receipts.write",
    "inspections.process",
    "inventory.read",
    "inventory.adjust",
    "inventory-history.read",
  ]),

  ROLE_VIEWER: createPermissionGroups([
    "dashboard.read",
    "products.read",
    "suppliers.read",
    "purchase-requests.read",
    "inventory.read",
    "inventory-history.read",
  ]),
}

export const DEFAULT_USER_FILTERS = {
  department: "전체",
  roleId: "전체",
  keyword: "",
  activeStatus: "전체",
}

export const DEFAULT_USER_PAGINATION = {
  page: 1,
  size: 10,
  totalElements: 0,
  totalPages: 1,
}

export const DEFAULT_USER_FILTER_OPTIONS = {
  departments: ["전체"],
  roles: [],
  activeStatuses: ["전체", "사용 중", "사용 중지"],
}

export const EMPTY_USER_FORM = {
  employeeNo: "",
  name: "",
  email: "",
  department: "",
  position: "",
  roleId: "",
  roleIds: [],
  departmentAuthorized: true,
  activeStatus: "사용 중",
}

export const USER_TABLE_HEADERS = [
  "사번",
  "사용자명",
  "이메일",
  "부서",
  "직급",
  "권한 그룹",
  "상태",
  "관리",
]

export function validateUserForm(form) {
  const errors = {}

  if (!form.employeeNo.trim()) {
    errors.employeeNo = "사번을 입력하세요."
  } else if (!/^[A-Z0-9-]+$/i.test(form.employeeNo.trim())) {
    errors.employeeNo = "사번은 영문, 숫자, 하이픈만 입력할 수 있습니다."
  }

  if (!form.name.trim()) {
    errors.name = "사용자명을 입력하세요."
  }

  if (!form.email.trim()) {
    errors.email = "이메일을 입력하세요."
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "올바른 이메일 형식으로 입력하세요."
  }

  if (!form.department.trim()) {
    errors.department = "부서를 입력하세요."
  }

  if (!form.position.trim()) {
    errors.position = "직급을 입력하세요."
  }

  const selectedRoleIds =
    form.roleIds?.length > 0 ? form.roleIds : form.roleId ? [form.roleId] : []

  if (selectedRoleIds.length === 0) {
    errors.roleIds = "권한 그룹을 하나 이상 선택하세요."
  }

  return errors
}

export function createPageNumbers(currentPage, totalPages) {
  if (totalPages <= 6) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, "ellipsis-right", totalPages]
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      "ellipsis-left",
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ]
  }

  return [
    1,
    "ellipsis-left",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis-right",
    totalPages,
  ]
}

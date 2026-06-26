import { apiFetch } from "@/lib/api/fetchClient"

const LOCAL_SESSION_KEY = "buyflow.auth.local-session"
const SESSION_SESSION_KEY = "buyflow.auth.session-session"

const ROLE_LABELS = {
  ADMIN: "시스템 관리자",
  TEAM_MANAGER: "부서 팀장",
  WAREHOUSE: "창고 담당자",
  VIEWER: "조회 전용",
  REQUESTER: "구매 요청자",
  APPROVER: "구매 승인자",
}

function canUseBrowserStorage() {
  return typeof window !== "undefined"
}

function writeJson(storage, key, value) {
  storage.setItem(key, JSON.stringify(value))
}

function readJson(storage, key, fallbackValue) {
  try {
    const rawValue = storage.getItem(key)
    return rawValue ? JSON.parse(rawValue) : fallbackValue
  } catch {
    return fallbackValue
  }
}

function saveSession(session, remember) {
  if (!canUseBrowserStorage()) return

  window.localStorage.removeItem(LOCAL_SESSION_KEY)
  window.sessionStorage.removeItem(LOCAL_SESSION_KEY)
  window.sessionStorage.removeItem(SESSION_SESSION_KEY)

  if (remember) {
    writeJson(window.localStorage, LOCAL_SESSION_KEY, session)
    return
  }
  writeJson(window.sessionStorage, SESSION_SESSION_KEY, session)
}

function normalizeRank(user) {
  const raw = user?.jobRank ?? user?.rank

  if (raw && raw !== "USER" && raw !== "ADMIN") {
    return raw
  }

  return user?.positionName ?? user?.position ?? ""
}

function normalizeStatus(user) {
  if (user?.useYn === "N") return "사용 중지"
  if (user?.status === "PENDING") return "승인 대기"
  if (user?.status === "INACTIVE" || user?.status === "SUSPENDED") {
    return "사용 중지"
  }

  return user?.status ? "정상" : ""
}

function formatRoles(roles) {
  return (roles ?? [])
    .map((role) => ROLE_LABELS[role] ?? role)
    .filter(Boolean)
    .join(", ")
}

function normalizeAuthUser(session) {
  const user = session?.user ?? session

  if (!user) {
    return null
  }

  const roles = session?.roles ?? user.roles ?? []
  const permissions = session?.permissions ?? user.permissions ?? []

  return {
    ...user,
    roles,
    permissions,
    employeeNo: user.employeeNo ?? user.userId ?? user.loginId ?? "",
    name: user.name ?? user.userName ?? "",
    rank: normalizeRank(user),
    department: user.department ?? user.departmentName ?? "",
    role: user.role ?? formatRoles(roles),
    accountStatus: user.accountStatus ?? normalizeStatus(user),
  }
}

export function getCurrentUser() {
  if (!canUseBrowserStorage()) return null

  const session =
    readJson(window.sessionStorage, SESSION_SESSION_KEY, null) ??
    readJson(window.localStorage, LOCAL_SESSION_KEY, null)

  if (!session?.accessToken) {
    logout()
    return null
  }

  return normalizeAuthUser(session)
}

export async function login({ loginId, password, remember }) {
  const data = await apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ loginId: loginId.trim(), password }),
  })

  // 백엔드 응답에 token, user 등이 담겨 옴
  saveSession(data, remember)

  return normalizeAuthUser(data)
}

export function logout() {
  if (!canUseBrowserStorage()) return

  window.localStorage.removeItem(LOCAL_SESSION_KEY)
  window.sessionStorage.removeItem(LOCAL_SESSION_KEY)
  window.sessionStorage.removeItem(SESSION_SESSION_KEY)
}

export function signup({ loginId, password, name, email, department, rank }) {
  return apiFetch("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({
      loginId: loginId.trim(),
      password,
      userName: name?.trim(),
      email: email?.trim().toLowerCase(),
      departmentName: department?.trim(), // department → departmentName
      jobRank: rank?.trim(),              // rank → jobRank (직급)
    }),
  })
}

export function findLoginId({ name, email }) {
  return apiFetch("/api/auth/find-login-id", {
    method: "POST",
    body: JSON.stringify({
      userName: name?.trim(),
      email: email?.trim().toLowerCase(),
    }),
  })
}

export function resetPassword({ loginId, email, newPassword }) {
  return apiFetch("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({
      loginId: loginId?.trim(),
      email: email?.trim().toLowerCase(),
      newPassword,
    }),
  })
}

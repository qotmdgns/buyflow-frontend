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

function getStoredSessionEntry() {
  if (!canUseBrowserStorage()) {
    return null
  }

  const sessionSession = readJson(
    window.sessionStorage,
    SESSION_SESSION_KEY,
    null,
  )

  if (sessionSession?.accessToken) {
    return {
      key: SESSION_SESSION_KEY,
      session: sessionSession,
      storage: window.sessionStorage,
    }
  }

  const localSession = readJson(window.localStorage, LOCAL_SESSION_KEY, null)

  if (localSession?.accessToken) {
    return {
      key: LOCAL_SESSION_KEY,
      session: localSession,
      storage: window.localStorage,
    }
  }

  return null
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

function updateStoredSession(nextSession) {
  const entry = getStoredSessionEntry()

  if (!entry) {
    return nextSession
  }

  const mergedSession = {
    ...entry.session,
    ...nextSession,
    accessToken: entry.session.accessToken,
    roles: nextSession.roles ?? entry.session.roles ?? [],
    permissions: nextSession.permissions ?? entry.session.permissions ?? [],
  }

  writeJson(entry.storage, entry.key, mergedSession)

  return mergedSession
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

  if (user?.status === "ACTIVE") return "정상"

  return user?.status ?? ""
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
  const entry = getStoredSessionEntry()

  if (!entry?.session?.accessToken) {
    logout()
    return null
  }

  return normalizeAuthUser(entry.session)
}

export async function login({ loginId, password, remember }) {
  const data = await apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ loginId: loginId.trim(), password }),
  })

  saveSession(data, remember)

  return normalizeAuthUser(data)
}

export async function refreshCurrentUser() {
  const data = await apiFetch("/api/auth/me")
  const nextSession = updateStoredSession(data)

  return normalizeAuthUser(nextSession)
}

export async function updateCurrentUserProfile(userId, values) {
  const updatedUser = await apiFetch(`/api/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify({
      userName: values.userName?.trim(),
      email: values.email?.trim().toLowerCase(),
      phone: values.phone?.trim(),
    }),
  })

  const entry = getStoredSessionEntry()
  const nextSession = updateStoredSession({
    user: {
      ...(entry?.session?.user ?? {}),
      ...updatedUser,
    },
  })

  return normalizeAuthUser(nextSession)
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
      departmentName: department?.trim(),
      jobRank: rank?.trim(),
    }),
  })
}

export async function findLoginId({ name, email }) {
  const result = await apiFetch("/api/auth/find-login-id", {
    method: "POST",
    body: JSON.stringify({
      userName: name?.trim(),
      email: email?.trim().toLowerCase(),
    }),
  })

  return result.loginId
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

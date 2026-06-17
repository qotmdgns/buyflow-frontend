import { apiFetch } from "@/lib/api/fetchClient"

const LOCAL_SESSION_KEY = "buyflow.auth.local-session"
const SESSION_SESSION_KEY = "buyflow.auth.session-session"

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
  window.sessionStorage.removeItem(SESSION_SESSION_KEY)

  if (remember) {
    writeJson(window.localStorage, LOCAL_SESSION_KEY, session)
    return
  }
  writeJson(window.sessionStorage, SESSION_SESSION_KEY, session)
}

export function getCurrentUser() {
  if (!canUseBrowserStorage()) return null

  const session =
    readJson(window.sessionStorage, SESSION_SESSION_KEY, null) ??
    readJson(window.localStorage, LOCAL_SESSION_KEY, null)

  return session?.user ?? null
}

export async function login({ loginId, password, remember }) {
  const data = await apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ loginId: loginId.trim(), password }),
  })

  // 백엔드 응답에 token, user 등이 담겨 옴
  saveSession(data, remember)

  return data.user ?? data
}

export function logout() {
  if (!canUseBrowserStorage()) return

  window.localStorage.removeItem(LOCAL_SESSION_KEY)
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
      department: department?.trim(),
      rank: rank?.trim(),
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
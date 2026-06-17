const ACCESS_TOKEN_KEY = "buyflow.accessToken"
const AUTH_SESSION_KEY = "buyflow.authSession"

function getBrowserStorage() {
  if (typeof window === "undefined") {
    return null
  }

  try {
    return window.localStorage
  } catch {
    return null
  }
}

function getSessionStorage() {
  if (typeof window === "undefined") {
    return null
  }

  try {
    return window.sessionStorage
  } catch {
    return null
  }
}

export function getAccessToken() {
  const localToken = getBrowserStorage()?.getItem(ACCESS_TOKEN_KEY)

  if (localToken) {
    return localToken
  }

  return getSessionStorage()?.getItem(ACCESS_TOKEN_KEY) ?? null
}

export function saveAuthSession(session, remember = true) {
  const storage = remember ? getBrowserStorage() : getSessionStorage()

  if (!storage) {
    return
  }

  const value = JSON.stringify({
    user: session.user,
    roles: session.roles ?? [],
    permissions: session.permissions ?? [],
  })

  clearAuthSession()
  storage.setItem(ACCESS_TOKEN_KEY, session.accessToken)
  storage.setItem(AUTH_SESSION_KEY, value)
}

export function getAuthSession() {
  const raw =
    getBrowserStorage()?.getItem(AUTH_SESSION_KEY) ??
    getSessionStorage()?.getItem(AUTH_SESSION_KEY)

  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw)
  } catch {
    clearAuthSession()
    return null
  }
}

export function clearAuthSession() {
  getBrowserStorage()?.removeItem(ACCESS_TOKEN_KEY)
  getBrowserStorage()?.removeItem(AUTH_SESSION_KEY)
  getSessionStorage()?.removeItem(ACCESS_TOKEN_KEY)
  getSessionStorage()?.removeItem(AUTH_SESSION_KEY)
}

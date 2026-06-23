const SESSION_KEY = "buyflow.auth.local-session"

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

export function getAuthSession() {
  const raw =
    getBrowserStorage()?.getItem(SESSION_KEY) ??
    getSessionStorage()?.getItem(SESSION_KEY)

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

export function getAccessToken() {
  return getAuthSession()?.accessToken ?? null
}

export function saveAuthSession(session, remember = true) {
  const storage = remember ? getBrowserStorage() : getSessionStorage()

  if (!storage) {
    return
  }

  const value = JSON.stringify({
    accessToken: session.accessToken,
    user: session.user,
    roles: session.roles ?? [],
    permissions: session.permissions ?? [],
  })

  clearAuthSession()
  storage.setItem(SESSION_KEY, value)
}

export function clearAuthSession() {
  getBrowserStorage()?.removeItem(SESSION_KEY)
  getSessionStorage()?.removeItem(SESSION_KEY)
}
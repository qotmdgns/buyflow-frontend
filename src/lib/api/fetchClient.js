import { clearAuthSession, getAccessToken } from "@/utils/authStorage"

const DEFAULT_API_BASE_URL = "http://localhost:8080"

function getApiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL).replace(
    /\/$/,
    "",
  )
}

function createUrl(path) {
  if (/^https?:\/\//i.test(path)) {
    return path
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`

  return `${getApiBaseUrl()}${normalizedPath}`
}

async function parseJson(response) {
  if (response.status === 204) {
    return null
  }

  const text = await response.text()

  if (!text) {
    return null
  }

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

function redirectToLogin() {
  if (typeof window === "undefined") {
    return
  }

  clearAuthSession()

  if (window.location.pathname !== "/login") {
    window.location.href = "/login"
  }
}

export async function apiFetch(path, options = {}) {
  const headers = new Headers(options.headers)
  const token = getAccessToken()
  const hasBody = options.body !== undefined && options.body !== null
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData

  if (hasBody && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json")
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const response = await fetch(createUrl(path), {
    ...options,
    headers,
  })

  const payload = await parseJson(response)

  if (response.status === 401) {
    redirectToLogin()
  }

  if (!response.ok) {
    const message =
      payload?.message ||
      payload?.error ||
      `요청 처리에 실패했습니다. (${response.status})`

    throw new Error(message)
  }

  if (payload && typeof payload === "object" && "success" in payload) {
    if (!payload.success) {
      throw new Error(payload.message || "요청 처리에 실패했습니다.")
    }

    return payload.data
  }

  return payload
}

export function getApiUrl(path) {
  return createUrl(path)
}

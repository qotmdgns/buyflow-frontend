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

export class ApiError extends Error {
  constructor(message, { status, data } = {}) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.data = data
  }
}

function getErrorMessage(payload, status) {
  if (payload && typeof payload === "object") {
    return (
      payload.message ||
      payload.error ||
      `요청 처리에 실패했습니다. (${status})`
    )
  }

  if (typeof payload === "string" && payload.trim()) {
    return payload
  }

  return `요청 처리에 실패했습니다. (${status})`
}

export async function apiFetch(path, options = {}) {
  const headers = new Headers(options.headers)
  const token = getAccessToken()
  const hasBody = options.body !== undefined && options.body !== null
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData

  if (isFormData) {
    headers.delete("Content-Type")
    headers.delete("content-type")
  } else if (hasBody && !headers.has("Content-Type")) {
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

    throw new ApiError("로그인이 필요합니다.", {
      status: response.status,
      data: payload,
    })
  }

  if (!response.ok) {
    throw new ApiError(getErrorMessage(payload, response.status), {
      status: response.status,
      data: payload,
    })
  }

  if (payload && typeof payload === "object" && "success" in payload) {
    if (!payload.success) {
      throw new ApiError(payload.message || "요청 처리에 실패했습니다.", {
        status: response.status,
        data: payload,
      })
    }

    return payload.data
  }

  return payload
}

export function getApiUrl(path) {
  return createUrl(path)
}

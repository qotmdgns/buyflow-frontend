import { getApiUrl } from "@/lib/api/fetchClient"
import { getAccessToken } from "@/utils/authStorage"

function getFileNameFromDisposition(disposition) {
  if (!disposition) {
    return null
  }

  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i)

  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1].replace(/"/g, ""))
  }

  const plainMatch = disposition.match(/filename="?([^";]+)"?/i)

  return plainMatch?.[1] ?? null
}

function saveBlob(blob, fileName) {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement("a")

  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

export async function downloadFileWithAuth(path, fallbackFileName) {
  const token = getAccessToken()
  const headers = new Headers()

  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const response = await fetch(getApiUrl(path), {
    method: "GET",
    headers,
  })

  if (!response.ok) {
    throw new Error(`download failed (${response.status})`)
  }

  const blob = await response.blob()
  const fileName =
    getFileNameFromDisposition(response.headers.get("Content-Disposition")) ||
    fallbackFileName ||
    "download"

  saveBlob(blob, fileName)
}

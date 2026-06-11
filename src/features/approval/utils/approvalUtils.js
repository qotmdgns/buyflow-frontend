export function formatWon(value = 0) {
  return `${Number(value).toLocaleString("ko-KR")}원`
}

export function formatDateTime(value) {
  if (!value) return "-"

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date)
}

export function calculateTotalAmount(items = []) {
  return items.reduce(
    (total, item) => total + Number(item.expectedAmount ?? 0),
    0,
  )
}

export function getRequestStatusStyle(statusCode) {
  const styles = {
    PENDING_APPROVAL: "border-amber-200 bg-amber-50 text-amber-600",
    APPROVED: "border-blue-200 bg-blue-50 text-blue-600",
    REJECTED: "border-rose-200 bg-rose-50 text-rose-500",
    CANCEL_REQUESTED: "border-slate-200 bg-slate-50 text-slate-500",
  }

  return styles[statusCode] ?? "border-slate-200 bg-slate-50 text-slate-500"
}

export function formatWon(value = 0) {
  return `${Number(value).toLocaleString("ko-KR")}원`
}

export function calculateRequestTotal(items) {
  return items.reduce(
    (total, item) => total + Number(item.unitPrice) * Number(item.quantity),
    0,
  )
}

export function getTodayString() {
  const today = new Date()
  const offset = today.getTimezoneOffset() * 60 * 1000

  return new Date(today.getTime() - offset).toISOString().slice(0, 10)
}

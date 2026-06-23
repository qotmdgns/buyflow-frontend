"use client"

import { useEffect, useMemo, useState } from "react"

import {
  createReceiptReceipt,
  fetchReceiptFormOptions,
  fetchReceiptByOrderId,
} from "@/features/receipt/api/ReceiptApi"

import {
  calculateReceiptReceiptSummary,
  createReceiptForm,
  createReceiptReceiptItem,
  validateReceiptReceiptForm,
} from "@/features/receipt/utils/ReceiptUtils"

const EMPTY_OPTIONS = {
  nextReceiptNumber: "",
  eligibleOrders: [],
}

export default function useReceiptCreate(initialReceiptId = "") {
  const [options, setOptions] = useState(EMPTY_OPTIONS)
  const [form, setForm] = useState(createReceiptForm())
  const [items, setItems] = useState([])
  const [attachment, setAttachment] = useState(null)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let ignore = false

    async function loadOptions() {
      setLoading(true)

      try {
        const data = await fetchReceiptFormOptions()

        if (ignore) {
          return
        }

        setOptions(data)

        setForm((currentForm) => ({
          ...currentForm,
          receiptNumber: data.nextReceiptNumber,
        }))

        const initialOrder = data.eligibleOrders.find(
          (order) => order.orderId === Number(initialReceiptId),
        )

        if (initialOrder) {
          applySelectedOrder(initialOrder)
        }
      } catch (requestError) {
        if (!ignore) {
          setSubmitError(
            requestError.message || "입고 등록 기준정보를 불러오지 못했습니다.",
          )
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    loadOptions()

    return () => {
      ignore = true
    }
  }, [initialReceiptId])

  const selectedOrder = useMemo(
    () =>
      options.eligibleOrders.find(
        (order) => order.orderId === Number(form.targetReceiptId),
      ) ?? null,
    [form.targetReceiptId, options.eligibleOrders],
  )

  const summary = useMemo(() => calculateReceiptReceiptSummary(items), [items])

  function applySelectedOrder(order) {
    setForm((currentForm) => ({
      ...currentForm,
      targetReceiptId: String(order.orderId),
      orderNumber: order.orderNumber,
      supplierName: order.supplierName,
      warehouseName: order.warehouseName,
    }))

    setItems(order.items.map(createReceiptReceiptItem))
    setErrors({})
  }

 function applySelectedOrder(order) {
  setForm((currentForm) => ({
    ...currentForm,
    targetReceiptId: String(order.orderId),
    orderNumber: order.orderNumber,
    supplierName: order.supplierName,
    warehouseName: order.warehouseName,
  }))

  setItems((order.items ?? []).map(createReceiptReceiptItem))
  setErrors({})
}

async function changeOrder(receiptId) {
  const order = options.eligibleOrders.find(
    (item) => item.orderId === Number(receiptId),
  )

  if (!order) {
    setForm((currentForm) => ({
      ...currentForm,
      targetReceiptId: "",
      orderNumber: "",
      supplierName: "",
      warehouseName: "",
    }))

    setItems([])
    return
  }

  try {
    const detail = await fetchReceiptByOrderId(order.orderId)

    applySelectedOrder(detail)
  } catch (error) {
    console.error(error)

    setSubmitError(
      error.message || "입고 상세 정보를 불러오지 못했습니다.",
    )
  }
}
  function updateForm(name, value) {
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))

    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: "",
    }))
  }

  function changeItemQuantity(orderItemId, value) {
    setItems((currentItems) =>
      currentItems.map((item) => {
        if (Number(item.orderItemId) !== Number(orderItemId)) {
          return item
        }

        const safeQuantity = Math.min(
          Math.max(0, Number(value) || 0),
          item.remainingQuantity,
        )

        return {
          ...item,
          currentReceivedQuantity: safeQuantity,
        }
      }),
    )

    setErrors((currentErrors) => ({
      ...currentErrors,
      items: "",
    }))
  }

  function fillAllRemainingQuantities() {
    setItems((currentItems) =>
      currentItems.map((item) => ({
        ...item,
        currentReceivedQuantity: item.remainingQuantity,
      })),
    )

    setErrors((currentErrors) => ({
      ...currentErrors,
      items: "",
    }))
  }

  function changeAttachment(event) {
    setAttachment(event.target.files?.[0] ?? null)
  }

  async function saveReceipt() {
    const nextErrors = validateReceiptReceiptForm(form, items)

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return null
    }

    setSubmitting(true)
    setSubmitError("")

    try {
      return await createReceiptReceipt(
        {
          ...form,
          items: items.map((item) => ({
            orderItemId: item.orderItemId,
            receivedQuantity: item.currentReceivedQuantity,
          })),
        },
        attachment,
      )
    } catch (requestError) {
      setSubmitError(requestError.message || "입고 내역을 등록하지 못했습니다.")

      return null
    } finally {
      setSubmitting(false)
    }
  }

  return {
    options,
    form,
    items,
    attachment,
    errors,
    submitError,
    loading,
    submitting,
    selectedOrder,
    summary,
    changeOrder,
    updateForm,
    changeItemQuantity,
    fillAllRemainingQuantities,
    changeAttachment,
    saveReceipt,
  }
}

"use client"

import { useEffect, useMemo, useState } from "react"

import {
  createInboundReceipt,
  fetchInboundFormOptions,
} from "@/features/inbound/api/inboundApi"

import {
  calculateInboundReceiptSummary,
  createInboundForm,
  createInboundReceiptItem,
  validateInboundReceiptForm,
} from "@/features/inbound/utils/inboundUtils"

const EMPTY_OPTIONS = {
  nextInboundNumber: "",
  eligibleOrders: [],
}

export default function useInboundCreate(initialInboundId = "") {
  const [options, setOptions] = useState(EMPTY_OPTIONS)
  const [form, setForm] = useState(createInboundForm())
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
        const data = await fetchInboundFormOptions()

        if (ignore) {
          return
        }

        setOptions(data)

        setForm((currentForm) => ({
          ...currentForm,
          inboundNumber: data.nextInboundNumber,
        }))

        const initialOrder = data.eligibleOrders.find(
          (order) => order.id === Number(initialInboundId),
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
  }, [initialInboundId])

  const selectedOrder = useMemo(
    () =>
      options.eligibleOrders.find(
        (order) => order.id === Number(form.targetInboundId),
      ) ?? null,
    [form.targetInboundId, options.eligibleOrders],
  )

  const summary = useMemo(() => calculateInboundReceiptSummary(items), [items])

  function applySelectedOrder(order) {
    setForm((currentForm) => ({
      ...currentForm,
      targetInboundId: String(order.id),
      orderNumber: order.orderNumber,
      supplierName: order.supplierName,
      warehouseName: order.warehouseName,
    }))

    setItems(order.items.map(createInboundReceiptItem))
    setErrors({})
  }

  function changeOrder(inboundId) {
    const order = options.eligibleOrders.find(
      (item) => item.id === Number(inboundId),
    )

    if (!order) {
      setForm((currentForm) => ({
        ...currentForm,
        targetInboundId: "",
        orderNumber: "",
        supplierName: "",
        warehouseName: "",
      }))

      setItems([])
      return
    }

    applySelectedOrder(order)
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

  async function saveInbound() {
    const nextErrors = validateInboundReceiptForm(form, items)

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return null
    }

    setSubmitting(true)
    setSubmitError("")

    try {
      return await createInboundReceipt(
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
    saveInbound,
  }
}

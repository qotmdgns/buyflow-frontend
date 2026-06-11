"use client"

import { useEffect, useMemo, useState } from "react"

import {
  fetchPurchaseOrderById,
  fetchPurchaseOrderFormOptions,
  updatePurchaseOrder,
} from "@/features/purchase-order/api/purchaseOrderApi"

import {
  calculatePurchaseOrderSummary,
  canEditPurchaseOrder,
  canEditPurchaseOrderCoreFields,
  createPurchaseOrderForm,
  validatePurchaseOrderForm,
} from "@/features/purchase-order/utils/purchaseOrderUtils"

export default function usePurchaseOrderEdit(orderId) {
  const [detailState, setDetailState] = useState({
    detail: null,
    loading: true,
    error: "",
  })

  const [options, setOptions] = useState({
    suppliers: [],
    warehouses: [],
    approvedPurchaseRequests: [],
  })

  const [form, setForm] = useState(createPurchaseOrderForm())
  const [items, setItems] = useState([])
  const [attachment, setAttachment] = useState(null)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let ignore = false

    async function loadPurchaseOrderEditData() {
      try {
        const [detail, formOptions] = await Promise.all([
          fetchPurchaseOrderById(orderId),
          fetchPurchaseOrderFormOptions(),
        ])

        if (ignore) {
          return
        }

        setOptions(formOptions)
        setForm(createPurchaseOrderForm(detail))
        setItems(detail.items ?? [])

        setDetailState({
          detail,
          loading: false,
          error: "",
        })
      } catch (requestError) {
        if (ignore) {
          return
        }

        setDetailState({
          detail: null,
          loading: false,
          error:
            requestError.message || "발주 상세 정보를 불러오지 못했습니다.",
        })
      }
    }

    loadPurchaseOrderEditData()

    return () => {
      ignore = true
    }
  }, [orderId])

  const summary = useMemo(() => calculatePurchaseOrderSummary(items), [items])

  const editable = canEditPurchaseOrder(form.status)

  const editableCoreFields = canEditPurchaseOrderCoreFields(form.status)

  function updateForm(name, value) {
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  function changeSupplier(supplierId) {
    if (!editableCoreFields) {
      return
    }

    const supplier = options.suppliers.find(
      (item) => item.id === Number(supplierId),
    )

    setForm((currentForm) => ({
      ...currentForm,
      supplierId: supplier ? String(supplier.id) : "",
      supplierName: supplier?.name ?? "",
      supplierManagerName: supplier?.managerName ?? "",
      supplierContact: supplier?.contact ?? "",
    }))
  }

  function changeItemValue(requestItemId, name, value) {
    if (!editableCoreFields) {
      return
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        Number(item.requestItemId) === Number(requestItemId)
          ? {
              ...item,
              [name]: Math.max(0, Number(value) || 0),
            }
          : item,
      ),
    )
  }

  function removeItem(requestItemId) {
    if (!editableCoreFields) {
      return
    }

    setItems((currentItems) =>
      currentItems.filter(
        (item) => Number(item.requestItemId) !== Number(requestItemId),
      ),
    )
  }

  function changeAttachment(event) {
    setAttachment(event.target.files?.[0] ?? null)
  }

  async function saveOrder() {
    const nextErrors = validatePurchaseOrderForm(form, items)

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)

      return null
    }

    setErrors({})
    setSubmitError("")
    setSubmitting(true)

    try {
      return await updatePurchaseOrder(
        orderId,
        {
          ...form,
          items,
          ...summary,
        },
        attachment,
      )
    } catch (requestError) {
      setSubmitError(requestError.message || "발주 정보를 수정하지 못했습니다.")

      return null
    } finally {
      setSubmitting(false)
    }
  }

  return {
    detailState,
    options,
    form,
    items,
    attachment,
    errors,
    submitError,
    submitting,
    summary,
    editable,
    editableCoreFields,
    updateForm,
    changeSupplier,
    changeItemValue,
    removeItem,
    changeAttachment,
    saveOrder,
  }
}

"use client"

import { useEffect, useMemo, useState } from "react"

import {
  createPurchaseOrder,
  fetchPurchaseOrderFormOptions,
} from "@/features/purchase-order/api/purchaseOrderApi"

import {
  calculatePurchaseOrderSummary,
  createOrderItemFromRequestItem,
  createPurchaseOrderForm,
  validatePurchaseOrderForm,
} from "@/features/purchase-order/utils/purchaseOrderUtils"

export default function usePurchaseOrderCreate() {
  const [options, setOptions] = useState({
    nextOrderNumber: "",
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
  const [isItemModalOpen, setIsItemModalOpen] = useState(false)
  const [draftSelectedItemIds, setDraftSelectedItemIds] = useState(new Set())

  useEffect(() => {
    fetchPurchaseOrderFormOptions().then((data) => {
      setOptions(data)

      setForm((currentForm) => ({
        ...currentForm,
        orderNumber: data.nextOrderNumber,
      }))
    })
  }, [])

  const selectedRequest = useMemo(
    () =>
      options.approvedPurchaseRequests.find(
        (request) => request.id === Number(form.requestId),
      ) ?? null,
    [form.requestId, options.approvedPurchaseRequests],
  )

  const availableRequestItems = selectedRequest?.items ?? []

  const summary = useMemo(() => calculatePurchaseOrderSummary(items), [items])

  function updateForm(name, value) {
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  function changeSupplier(supplierId) {
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

  function applyPurchaseRequest(requestId) {
    const request = options.approvedPurchaseRequests.find(
      (item) => item.id === Number(requestId),
    )

    if (!request) {
      return
    }

    setForm((currentForm) => ({
      ...currentForm,
      requestId: String(request.id),
      requestNumber: request.requestNumber,
      requestTitle: request.title,
    }))

    setItems(request.items.map((item) => createOrderItemFromRequestItem(item)))
  }

  function changeItemValue(requestItemId, name, value) {
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
    setItems((currentItems) =>
      currentItems.filter(
        (item) => Number(item.requestItemId) !== Number(requestItemId),
      ),
    )
  }

  function openItemModal() {
    if (!form.requestId) {
      window.alert("구매 요청 번호를 먼저 선택해 주세요.")

      return
    }

    setDraftSelectedItemIds(
      new Set(items.map((item) => Number(item.requestItemId))),
    )

    setIsItemModalOpen(true)
  }

  function closeItemModal() {
    setIsItemModalOpen(false)
  }

  function toggleDraftItem(requestItemId) {
    setDraftSelectedItemIds((currentIds) => {
      const nextIds = new Set(currentIds)

      if (nextIds.has(Number(requestItemId))) {
        nextIds.delete(Number(requestItemId))
      } else {
        nextIds.add(Number(requestItemId))
      }

      return nextIds
    })
  }

  function confirmSelectedItems() {
    const previousItemMap = new Map(
      items.map((item) => [Number(item.requestItemId), item]),
    )

    const nextItems = availableRequestItems
      .filter((item) => draftSelectedItemIds.has(Number(item.id)))
      .map((item) =>
        createOrderItemFromRequestItem(
          item,
          previousItemMap.get(Number(item.id)),
        ),
      )

    setItems(nextItems)
    setIsItemModalOpen(false)
  }

  function changeAttachment(event) {
    setAttachment(event.target.files?.[0] ?? null)
  }

  async function saveOrder(status) {
    const nextForm = {
      ...form,
      status,
    }

    const nextErrors = validatePurchaseOrderForm(nextForm, items)

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return null
    }

    setSubmitting(true)
    setSubmitError("")

    try {
      return await createPurchaseOrder(
        {
          ...nextForm,
          items,
          ...summary,
        },
        attachment,
      )
    } catch (requestError) {
      setSubmitError(requestError.message || "발주를 등록하지 못했습니다.")

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
    submitting,
    selectedRequest,
    summary,
    isItemModalOpen,
    draftSelectedItemIds,
    availableRequestItems,
    updateForm,
    changeSupplier,
    applyPurchaseRequest,
    changeItemValue,
    removeItem,
    changeAttachment,
    saveOrder,
    openItemModal,
    closeItemModal,
    toggleDraftItem,
    confirmSelectedItems,
  }
}

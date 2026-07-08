"use client"

import { useEffect, useMemo, useState, useRef } from "react"
import {
  createPurchaseOrder,
  fetchPurchaseOrderFormOptions,
} from "@/features/purchase-order/api/purchaseOrderApi"
import { useAuth } from "@/features/auth/context/AuthContext"
import {
  calculatePurchaseOrderSummary,
  createOrderItemFromRequestItem,
  createPurchaseOrderForm,
  validatePurchaseOrderForm,
} from "@/features/purchase-order/utils/purchaseOrderUtils"
import { setRequestMeta } from "next/dist/server/request-meta"

function getNumberOrNull(value) {
  const numberValue = Number(value)

  if (!Number.isFinite(numberValue) || numberValue <= 0) {
    return null
  }

  return numberValue
}

function getSupplierValue(supplier) {
  if (typeof supplier === "string") {
    return supplier
  }

  return (
    supplier?.supplierId ??
    supplier?.id ??
    supplier?.supplierCode ??
    supplier?.supplierName ??
    supplier?.suppliername ??
    supplier?.name ??
    ""
  )
}

function isSameSupplier(supplier, selectedValue) {
  const normalizedSelectedValue = String(selectedValue ?? "").trim()

  if (!normalizedSelectedValue) {
    return false
  }

  if (typeof supplier === "string") {
    return String(supplier).trim() === normalizedSelectedValue
  }

  const candidates = [
    supplier?.supplierId,
    supplier?.id,
    supplier?.supplierCode,
    supplier?.supplierName,
    supplier?.suppliername,
    supplier?.name,
    supplier?.nameKo,
  ]

  return candidates.some(
    (candidate) => String(candidate ?? "").trim() === normalizedSelectedValue,
  )
}

function getSupplierName(supplier, fallbackValue = "") {
  if (typeof supplier === "string") {
    return supplier
  }

  return (
    supplier?.supplierName ||
    supplier?.suppliername ||
    supplier?.name ||
    supplier?.nameKo ||
    supplier?.supplierCode ||
    fallbackValue ||
    ""
  )
}

function getSupplierManager(supplier) {
  if (!supplier || typeof supplier === "string") {
    return "-"
  }

  return (
    supplier.manager ||
    supplier.managerName ||
    supplier.supplierManager ||
    supplier.contactManager ||
    supplier.contactName ||
    "-"
  )
}

function getSupplierContact(supplier) {
  if (!supplier || typeof supplier === "string") {
    return "-"
  }

  return (
    supplier.contact ||
    supplier.supplierContact ||
    supplier.phone ||
    supplier.phoneNumber ||
    supplier.tel ||
    supplier.mobile ||
    "-"
  )
}

function getSupplierCode(supplier) {
  if (!supplier || typeof supplier === "string") {
    return "-"
  }

  return supplier.supplierCode || supplier.code || "-"
}

export default function usePurchaseOrderCreate() {
  const { user } = useAuth()
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
  const [isSuccess, setIsSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [isItemModalOpen, setIsItemModalOpen] = useState(false)
  const [draftSelectedItemIds, setDraftSelectedItemIds] = useState(new Set())

  useEffect(() => {
    let ignore = false

    async function loadFormOptions() {
      try {
        const data = await fetchPurchaseOrderFormOptions()

        if (ignore) return

        const nextOptions = {
          nextOrderNumber: data?.nextOrderNumber || data?.orderNo || "",
          suppliers: data?.suppliers ?? [],
          warehouses: data?.warehouses ?? [],
          approvedPurchaseRequests: data?.approvedPurchaseRequests ?? [],
        }

        setOptions(nextOptions)

        setForm((currentForm) => ({
          ...currentForm,
          orderNo:
            data?.nextOrderNumber || data?.orderNo || currentForm.orderNo || "",
        }))
      } catch (error) {
        if (!ignore) {
          setSubmitError(
            error.message || "발주 등록 옵션을 불러오지 못했습니다.",
          )
        }
      }
    }

    loadFormOptions()

    return () => {
      ignore = true
    }
  }, [])

  const selectedRequest = useMemo(
    () =>
      options.approvedPurchaseRequests.find(
        (request) =>
          Number(request.id || request.requestId) === Number(form.requestId),
      ) ?? null,
    [form.requestId, options.approvedPurchaseRequests],
  )

  const availableRequestItems = selectedRequest?.items ?? []

  const summary = useMemo(() => calculatePurchaseOrderSummary(items), [items])

  function updateForm(name, value) {
    setForm((currentForm) => {
      const nextForm = {
        ...currentForm,
        [name]: value,
      }

      if (name === "warehouseName" || name === "warehouseCode") {
        const foundWarehouse = options.warehouses.find(
          (warehouse) =>
            warehouse.warehouseName === value ||
            warehouse.name === value ||
            warehouse.warehouseCode === value ||
            warehouse.code === value,
        )

        if (foundWarehouse) {
          nextForm.warehouseCode =
            foundWarehouse.warehouseCode || foundWarehouse.code || value
          nextForm.warehouseName =
            foundWarehouse.warehouseName ||
            foundWarehouse.name ||
            currentForm.warehouseName ||
            ""
        }
      }

      return nextForm
    })

    setTimeout(() => {
      const nextErrors = validatePurchaseOrderForm(
        {...form, [name]: value},
        items,
        false
      )
      setErrors(nextErrors);
    }, 50);
  }

  function changeSupplier(selectedSupplierValue) {
    if (!selectedSupplierValue) {
      setForm((currentForm) => ({
        ...currentForm,
        supplierId: "",
        supplierCode: "",
        supplierName: "",
        manager: "",
        supplierContact: "",
      }))
      return
    }

    const foundSupplier = options.suppliers.find((supplier) =>
      isSameSupplier(supplier, selectedSupplierValue),
    )

    const supplierValue = foundSupplier
      ? getSupplierValue(foundSupplier)
      : selectedSupplierValue

    const supplierId =
      getNumberOrNull(
        typeof foundSupplier === "string"
          ? selectedSupplierValue
          : foundSupplier?.supplierId ||
              foundSupplier?.id ||
              selectedSupplierValue,
      ) ?? selectedSupplierValue

    const supplierName = foundSupplier
      ? getSupplierName(foundSupplier, selectedSupplierValue)
      : selectedSupplierValue

    setForm((currentForm) => ({
      ...currentForm,
      supplierId,
      supplierCode: getSupplierCode(foundSupplier),
      supplierName,
      manager: getSupplierManager(foundSupplier),
      supplierContact: getSupplierContact(foundSupplier),
    }))

    setErrors((currentErrors) => {
      const nextErrors = { ...currentErrors }
      delete nextErrors.supplierId
      delete nextErrors.supplierName
      delete nextErrors.supplierCode
      return nextErrors
    })

    setTimeout(() => {
      const nextErrors = validatePurchaseOrderForm(
        {...form, supplierId: supplierValue},
        items,
        false
      )
      setErrors(nextErrors)
    }, 50)
  }

  function applyPurchaseRequest(requestId) {
    const request = options.approvedPurchaseRequests.find(
      (item) => Number(item.id || item.requestId) === Number(requestId),
    )

    if (!request) return

    setForm((currentForm) => ({
      ...currentForm,
      requestId: String(request.id || request.requestId),
      requestNumber: request.requestNumber || request.requestNo || "",
      requestTitle: request.requestTitle || request.title || "",
    }))

    setItems(
      request.items?.map((item) => createOrderItemFromRequestItem(item)) || [],
    )

    setErrors((currentErrors) => {
      const nextErrors = { ...currentErrors }
      delete nextErrors.requestId
      delete nextErrors.items
      return nextErrors
    })
  }

  function changeItemValue(requestItemId, name, value) {
    setItems((currentItems) =>
      currentItems.map((item) => {
        const targetId = item.requestItemId || item.id
        const matchId = Number(requestItemId)

        if (Number(targetId) !== matchId) {
          return item
        }

        const processedValue =
          value === "" ? "" : Math.max(0, Number(value) || 0)

        return {
          ...item,
          [name]: processedValue,
          orderQuantity:
            name === "orderQuantity" || name === "quantity"
              ? processedValue
              : item.orderQuantity,
        }
      }),
    )
    setTimeout(() => {
      const nextErrors = validatePurchaseOrderForm(form, items, false);
      setErrors(nextErrors);
    }, 50);
  }

  function removeItem(requestItemId) {
    setItems((currentItems) =>
      currentItems.filter(
        (item) =>
          Number(item.requestItemId || item.id) !== Number(requestItemId),
      ),
    )
    setTimeout(() => {
      const nextErrors = validatePurchaseOrderForm(form, items, false);
      setErrors(nextErrors);
    }, 50);
  }

  function openItemModal() {
    if (!form.requestId) {
      window.alert("구매 요청 번호를 먼저 선택해 주세요.")
      return
    }

    setDraftSelectedItemIds(new Set())
    setIsItemModalOpen(true)
  }

  function closeItemModal() {
    setIsItemModalOpen(false)
  }

  function toggleDraftItem(requestItemId) {
    setDraftSelectedItemIds((currentIds) => {
      const nextIds = new Set(currentIds)
      const nextId = Number(requestItemId)

      if (nextIds.has(nextId)) {
        nextIds.delete(nextId)
      } else {
        nextIds.add(nextId)
      }

      return nextIds
    })
  }

  function confirmSelectedItems() {
    const previousItemMap = new Map(
      items.map((item) => [Number(item.requestItemId || item.id), item]),
    )

    const nextItems = availableRequestItems
      .filter((item) =>
        draftSelectedItemIds.has(Number(item.requestItemId || item.id)),
      )
      .map((item) =>
        createOrderItemFromRequestItem(
          item,
          previousItemMap.get(Number(item.requestItemId || item.id)),
        ),
      )

    setItems(nextItems)
    setIsItemModalOpen(false)
  }

  function changeAttachment(event) {
    setAttachment(event.target.files?.[0] ?? null)
  }

  async function saveOrder(status) {
    const normalizedSupplierId =
      getNumberOrNull(form.supplierId) ?? getNumberOrNull(form.supplierCode)

    const nextForm = {
      ...form,
      supplierId:
        normalizedSupplierId || form.supplierId || form.supplierName || "",
        status,
    }

    const nextErrors = validatePurchaseOrderForm(nextForm, items, false)

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return null
    }

    const totalAmountCalculated = items.reduce((acc, item) => {
      const quantity = Number(item.orderQuantity || item.quantity || 0)
      const unitPrice = Number(item.unitPrice || 0)

      return acc + quantity * unitPrice * 1.1
    }, 0)

    const userName = form.orderManager || user?.userName || user?.name || user?.displayName || ""

    const expectedReceiptFrom =
      form.expectedReceiptFrom || form.expectedReceiptFrom || ""

    const expectedReceiptTo =
      form.expectedReceiptTo || form.expectedReceiptTo || ""

    const payloadItems = items.map((item) => {
      const quantity = Number(item.orderQuantity || item.quantity || 0)

      return {
        requestItemId: getNumberOrNull(item.requestItemId || item.id),
        productId: getNumberOrNull(
          item.productId || item.product?.productId || item.id,
        ),
        quantity,
        orderQuantity: quantity,
        unitPrice: Number(item.unitPrice || 0),
      }
    })

    const bffRequestPayload = {
      supplierId: normalizedSupplierId || 2,
      supplierCode: form.supplierCode || "",
      supplierName: form.supplierName || "",
      supplierContact: form.supplierContact || "",
      manager: form.manager || "-",

      createdBy: Number(user?.userId || form.createdBy || form.userId) || null,

      orderManager: userName,
      userName: userName,

      orderStatus: status,
      status,
      orderNo: form.orderNo || null,
      orderNumber: form.orderNo || null,

      requestId: getNumberOrNull(form.requestId),
      requestNumber: form.requestNumber || "",
      requestTitle: form.requestTitle || "",

      dueDate: expectedReceiptTo ? `${expectedReceiptTo}T23:59:59` : null,

      expectedReceiptFrom,
      expectedReceiptTo,

      expectedReceiptFrom: expectedReceiptFrom,
      expectedReceiptTo: expectedReceiptTo,

      warehouseCode: form.warehouseCode || "",
      memo: form.memo || "",

      totalAmount: Math.floor(totalAmountCalculated),

      items: payloadItems,
    }

    setSubmitting(true)
    setSubmitError("")
    setIsSuccess(false)

    try {
      const totalAmountCalculated = items.reduce((acc, item) => {
        const qty = Number(item.orderQuantity || 0);
        const price = Number(item.unitPrice || 0);
        return acc + (qty * price * 1.1); // 부가세 10% 포함 총액 계산
      }, 0);

      const bffRequestPayload = {
        supplierId: (!form.supplierId || isNaN(Number(form.supplierId))) ? 2 : Number(form.supplierId), 
        createdBy: Number(user?.userId || form.createdBy) || null,
        dueDate: form.expectedReceiptTo ? `${form.expectedReceiptTo}T23:59:59` : null, 
        orderStatus: status,                       
        orderNo: form.orderNo || null,           
        requestId: form.requestId ? Number(form.requestId) : null,
        requestNumber: form.requestNumber || "", 
        requestTitle: form.requestTitle || "",
        
        expectedReceiptFrom: form.expectedReceiptFrom || "",
        expectedReceiptTo: form.expectedReceiptTo || "",
        warehouseCode: form.warehouseCode || "",
        memo: form.memo || "",
        manager: form.manager || "-", 
        totalAmount: totalAmountCalculated, 

        items: items.map((item) => ({
          productId: Number(item.productId || item.id), 
          quantity: Number(item.orderQuantity || 0),   
          unitPrice: Number(item.unitPrice || 0)       
        }))
      };

      const result = await createPurchaseOrder(bffRequestPayload, attachment)
      
      setIsSuccess(true)
      setSuccessMessage("발주가 성공적으로 등록되었습니다.")

      return result;
    } catch (requestError) {
      setSubmitError(requestError.message || "발주를 등록하지 못했습니다.")
      return null
    } finally {
      setSubmitting(false)
    }
  }

  const hasSetOrderManager = useRef(false)

  useEffect(() => {
    if (!user) return

    const loggedInUserName =
      user.userName ||
      user.name ||
      user.displayName ||
      user.username ||
      ""

    if (loggedInUserName && !hasSetOrderManager.current) {
      setForm((prevForm) => {
        if (prevForm.orderManager && prevForm.orderManager.trim() !=="") {
          return prevForm
        }
        return {
          ...prevForm,
          orderManager: loggedInUserName,
        }
      })
      hasSetOrderManager.current = true
    }
  }, [user])

  return {
    options,
    form,
    items,
    attachment,
    errors,
    submitError,
    submitting,
    isSuccess,
    successMessage,
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

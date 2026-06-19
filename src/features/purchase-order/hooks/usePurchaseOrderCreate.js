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
        orderNo: data.nextOrderNumber || data.nextOrderNumber || data.orderNo || "",
      }))
    })
  }, [])

  const selectedRequest = useMemo(
    () =>
      options?.approvedPurchaseRequests?.find(
        (request) => Number(request.id || request.requestId) === Number(form.requestId),
      ) ?? null,
    [form.requestId, options?.approvedPurchaseRequests],
  )

  const availableRequestItems = selectedRequest?.items ?? []
  const summary = useMemo(() => calculatePurchaseOrderSummary(items), [items])

  function updateForm(name, value) {
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
    
    if (name === "warehouseName" || name === "warehouseCode") {
      const foundWarehouse = options.warehouses?.find(
        (w) => w.warehouseName === value || w.name === value || w.warehouseCode === value
      );
      if (foundWarehouse) {
        setForm((currentForm) => ({
          ...currentForm,
          // 백엔드가 요구하는 찐 영문/숫자 형태의 창고 코드를 추출해 저장
          warehouseCode: foundWarehouse.warehouseCode || foundWarehouse.code || value,
        }));
      }
    }
  }

  function changeSupplier(selectedSupplierId) {
    if (!selectedSupplierId) return;

    const foundSupplier = options.suppliers?.find(
      (s) => Number(s.supplierId === s.id) === Number(selectedSupplierId)
    );

    setForm((currentForm) => ({
      ...currentForm,
      supplierId: Number(selectedSupplierId),
      supplierCode: foundSupplier ? foundSupplier.supplierCode : "-",
      supplierName: foundSupplier ? (foundSupplier.supplierName || foundSupplier.name) : "-",
      manager: "-", 
      supplierContact: "-",
    }));
  }

  function applyPurchaseRequest(requestId) {
    const request = options.approvedPurchaseRequests.find(
      (item) => Number(item.id || item.requestId) === Number(requestId)
    )

    if (!request) return;

    setForm((currentForm) => ({
      ...currentForm,
      requestId: String(request.id || request.requestId),
      requestNumber: request.requestNumber,
      requestTitle: request.requestTitle || request.title || "",
    }))

    setItems(request.items?.map((item) => createOrderItemFromRequestItem(item)) || [])
  }

  function changeItemValue(requestItemId, name, value) {
    setItems((currentItems) =>
      currentItems.map((item) => {
        const targetId = item.requestItemId || item.id;
        const matchId = Number(requestItemId);

        if (Number(targetId) === matchId) {
          const processedValue = value === "" ? "" : Math.max(0, Number(value) || 0);

          return {
            ...item,
            [name]: processedValue,
            orderQuantity: name === "orderQuantity" || name === "quantity" ? processedValue : item.orderQuantity,
          };
        }
        return item;
      }),
    );
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
    setDraftSelectedItemIds(new Set()) 
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
      .filter((item) => draftSelectedItemIds.has(Number(item.requestItemId || item.id)))
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
    const nextForm = {
      ...form, supplierId: form.supplierId || form.supplierCode || "",
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
      const bffRequestPayload = {

        supplierId: (!form.supplierId || isNaN(Number(form.supplierId))) ? 2 : Number(form.supplierId), 
        
        createdBy: Number(form.createdBy || 5),  
        dueDate: form.expectedInboundTo ? `${form.expectedInboundTo}T23:59:59` : null, 
        orderStatus: status,                      
        orderNo: form.orderNo || null,           
        requestId: Number(form.requestId),
        requestNumber: form.requestNumber || "",
        requestTitle: form.requestTitle || "",
        expectedInboundFrom: form.expectedInboundFrom || "",
        expectedInboundTo: form.expectedInboundTo || "",
        warehouseCode: form.warehouseCode || "",
        memo: form.memo || "",
        items: items.map((item) => ({
          productId: Number(item.productId || item.id), 
          quantity: Number(item.orderQuantity || 0),   
          unitPrice: Number(item.unitPrice || 0)       
        }))
      };

      return await createPurchaseOrder(bffRequestPayload, attachment)
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
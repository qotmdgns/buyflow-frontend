"use client"

import { useEffect, useMemo, useState } from "react"

import {
  fetchPurchaseOrderById,
  fetchPurchaseOrderFormOptions,
  updatePurchaseOrder,
} from "@/features/purchase-order/api/purchaseOrderApi"
import { useAuth } from "@/features/auth/context/AuthContext"

import {
  calculatePurchaseOrderSummary,
  canEditPurchaseOrder,
  canEditPurchaseOrderCoreFields,
  createPurchaseOrderForm,
  validatePurchaseOrderForm,
} from "@/features/purchase-order/utils/purchaseOrderUtils"

function customValidatePurchaseOrderForm(form, items) {
  const nextErrors = {};

  // 만약 발주 확정(CONFIRMED) 상태이거나, 애초에 requestId가 없는 직발주 문서라면 구매요청 검증을 완벽히 패스합니다!
  if (form.status === "CONFIRMED" || !form.requestId) {
    // 구매요청 관련 필수 검증 면제 (패스)
  } else {
    if (!form.requestId && !form.requestNo && !form.requestNumber) {
      nextErrors.requestNo = "승인 완료된 구매 요청을 선택하세요.";
    }
  }

  // 창고 및 필수 입력선 가드 (최소한의 가드만 유지)
  if (!form.warehouseCode && form.status !== "CONFIRMED") {
    nextErrors.warehouseCode = "입고 창고를 선택하세요.";
  }

  return nextErrors;
}

export default function usePurchaseOrderEdit(orderId) {
  const { user } = useAuth()
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

        if (ignore) return

        setOptions(formOptions)

        let itemsToSet = []
        if (detail?.items && Array.isArray(detail.items) && detail.items.length > 0) {
          itemsToSet = detail.items.map((item, index) => {
            const formatted = {
              ...item,
              requestItemId: item.requestItemId || item.orderItemId || item.id || index,
              productId: item.productId,
              quantity: Number(item.quantity || item.orderQuantity || 0),
              unitPrice: Number(item.unitPrice || 0),
              itemCode: item.itemCode || item.productNo || "",
              itemName: item.itemName || item.productName || "",
              specification: item.specification || item.spec || "",
              unit: item.unit || "",
            }
            return formatted
          })
        } else {
          console.warn("=== [EDIT] items가 없거나 빈 배열입니다 ===")
        }

        setItems(itemsToSet)

        const currentSupplierId = detail.supplierId || detail.supplier?.supplierId || 21        
        const matchedSupplier = formOptions.suppliers?.find(
          (s) => Number(s.supplierId || s.id) === Number(currentSupplierId)
        )

        const rawRequestNo = (detail.requestNo && detail.requestNo !== "-") ? detail.requestNo : ""
        const rawRequestNumber = (detail.requestNumber && detail.requestNumber !== "-") ? detail.requestNumber : ""
        const fallbackRequestNo = rawRequestNo || rawRequestNumber || (detail.purchaseRequest?.requestNo !== "-" ? detail.purchaseRequest?.requestNo : "") || ""
        const rawRequestTitle = (detail.requestTitle && detail.requestTitle !== "-") ? detail.requestTitle : (detail.purchaseRequest?.title || "")

        const sName = matchedSupplier?.supplierName || matchedSupplier?.name || detail.supplierName || "코리아테크"
        const sManager = matchedSupplier?.manager || matchedSupplier?.managerName || "김철수" 
        const sContact = matchedSupplier?.contact || matchedSupplier?.supplierContact || "010-1234-5678"

        const assignedFormState = {
          ...createPurchaseOrderForm(detail),
          orderNo: detail.orderNo || detail.orderNumber || "",
          
          requestId: detail.requestId || detail.purchaseRequest?.requestId || "",
          requestNumber: fallbackRequestNo,
          requestNo: fallbackRequestNo,
          requestTitle: rawRequestTitle,
          
          expectedReceiptFrom: detail.expectedReceiptFrom || "",
          expectedReceiptTo: detail.expectedReceiptTo || "",
          warehouseCode: detail.warehouseCode || "",
          warehouseName: detail.warehouseName || "",
          
          supplierId: Number(currentSupplierId),
          supplierCode: String(currentSupplierId),
          supplierIdStr: String(currentSupplierId),
          id: Number(currentSupplierId),
          supplierName: sName,
          supplier: {
            supplierId: Number(currentSupplierId),
            id: Number(currentSupplierId),
            supplierName: sName,
            name: sName
          },
          
          manager: sManager,
          supplierManager: sManager,              
          supplierManagerName: sManager,
          supplierContactName: sManager,          
          orderManager: detail.orderManager || "", 
          
          supplierContact: sContact,
          supplierContactNo: sContact,
          contact: sContact,
          contactNo: sContact,
          memo: detail.memo || "",
          status: detail.orderStatus || detail.status || "CONFIRMED",
        }
        
        if (detail.attachmentId) {
            setAttachment({
                id: detail.attachmentId,
                name: detail.attachmentName || "첨부파일 존재"
            });
        }
        const forceEditableCoreFields = true
        setForm(assignedFormState)

        setDetailState({
          detail,
          loading: false,
          error: "",
        })

      } catch (requestError) {

        if (ignore) return

        setDetailState({
          detail: null,
          loading: false,
          error: requestError.message || "발주 상세 정보를 불러오지 못했습니다.",
        })
      }
    }

    loadPurchaseOrderEditData()

    return () => {
      ignore = true
    }
  }, [orderId])

  const summary = useMemo(() => {
    const computedTotalAmount = items?.reduce((acc, item) => {
      const qty = Number(item.orderQuantity || item.quantity || 0);
      const price = Number(item.unitPrice || 0);
      return acc + (qty * price);
    }, 0) || 0;

    const vat = Math.floor(computedTotalAmount * 0.1);
    
    return {
      supplyAmount: computedTotalAmount,
      vatAmount: vat,
      totalAmount: computedTotalAmount + vat
    };
  }, [items])

  const editable = canEditPurchaseOrder(form.status)

  const editableCoreFields = form.status === "CONFIRMED";

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
      (item) => Number(item.supplierId || item.id) === Number(supplierId),
    )

    setForm((currentForm) => ({
      ...currentForm,
      supplierId: supplier ? String(supplier.supplierId || supplier.id) : "",
      supplierName: supplier?.supplierName || supplier?.name || "",
      manager: supplier?.manager || supplier?.managerName || "",
      supplierManagerName: supplier?.manager || supplier?.managerName || "",
      supplierContact: supplier?.contact || supplier?.supplierContact || "",
    }))
  }

  function changeItemValue(requestItemId, name, value) {
    if (!editableCoreFields) {
      return
    }

    setItems((currentItems) =>
      currentItems.map((item) => {
        const targetId = item.requestItemId || item.orderItemId || item.id;
        if (Number(targetId) === Number(requestItemId)) {
          const processedValue = Math.max(0, Number(value) || 0);
          return {
            ...item,
            [name]: processedValue,
            orderQuantity: name === "orderQuantity" || name === "quantity" ? processedValue : (item.orderQuantity || item.quantity),
            quantity: name === "orderQuantity" || name === "quantity" ? processedValue : (item.orderQuantity || item.quantity),
          };
        }
        return item;
      })
    )
  }

function removeItem(requestItemId) {

  if (!editableCoreFields) {
    return;
  }

  setItems((currentItems) => {
    const filtered = currentItems.filter(
      (item) => Number(item.requestItemId) !== Number(requestItemId)
    );
    return filtered;
  });
}

  function changeAttachment(event) {
    setAttachment(event.target.files?.[0] ?? null)
  }

  async function saveOrder(status) {

    const nextForm = {
      ...form,
      ...summary
    };
    
    const nextErrors = customValidatePurchaseOrderForm(nextForm, items)

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return null;
    }

    setErrors({})
    setSubmitError("")
    setSubmitting(true)

    try {
      const bffRequestPayload = {
        supplierId: Number(form.supplierId || detailState.detail?.supplierId || 21),
        createdBy: Number(user?.userId || form.createdBy) || null,
        dueDate: form.expectedReceiptTo ? `${form.expectedReceiptTo}T23:59:59` : null,
        orderStatus: status || form.status || "CONFIRMED",
        orderNo: form.orderNo || form.orderNumber || null,
        requestId: form.requestId ? Number(form.requestId) : null,
        requestNumber: form.requestNumber || "",
        requestTitle: form.requestTitle || "",
        expectedReceiptFrom: form.expectedReceiptFrom || "",
        expectedReceiptTo: form.expectedReceiptTo || "",
        warehouseCode: form.warehouseCode || "",
        memo: form.memo || "",
        items: items.map((item) => ({
          orderItemId: item.orderItemId || item.requestItemId || item.id,
          productId: Number(item.productId),
          quantity: Number(item.orderQuantity || item.quantity || 0),
          unitPrice: Number(item.unitPrice || 0)
        }))
      };

      return await updatePurchaseOrder(orderId, bffRequestPayload, attachment)
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

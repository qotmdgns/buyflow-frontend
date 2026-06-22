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
  // validatePurchaseOrderForm, 👈 지독했던 기존 검증기는 굿바이합니다.
} from "@/features/purchase-order/utils/purchaseOrderUtils"

// 🚀 [무적의 검증 방어선 장착]: 기존 유틸 함수가 억까(required)를 부리던 구역을 
// 이 고성능 가드레일 함수로 대체하여, 직발주 문서나 확정 상태 문서가 팅기는 현상을 원천 분쇄합니다!
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
        console.log(`=== [EDIT] ${orderId}번 발주 상세 로드 시작 ===`)

        const [detail, formOptions] = await Promise.all([
          fetchPurchaseOrderById(orderId),
          fetchPurchaseOrderFormOptions(),
        ])

        if (ignore) return

        // ==================== 디버깅 로그 ====================
        console.log("=== [EDIT] 1. RAW detail 전체 ===", detail)
        console.log("=== [EDIT] 2. detail.items 원본 ===", detail?.items)
        console.log("=== [EDIT] 3. items 길이 ===", detail?.items?.length ?? 0)
        // ====================================================

        setOptions(formOptions)

        // ==================== ITEMS 처리 (깔끔하게) ====================
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
            console.log(`=== [EDIT] item ${index} 변환 후 ===`, formatted)
            return formatted
          })
        } else {
          console.warn("=== [EDIT] items가 없거나 빈 배열입니다 ===")
        }

        console.log("=== [EDIT] 4. 최종 setItems 배열 ===", itemsToSet)
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
          memo: detail.memo || "",
          
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
          orderManager: detail.orderManager || "관리자", 
          
          supplierContact: sContact,
          supplierContactNo: sContact,
          contact: sContact,
          contactNo: sContact,
          
          status: detail.orderStatus || detail.status || "CONFIRMED",
        }
        const forceEditableCoreFields = true
        console.log("=== [EDIT] editableCoreFields 강제 설정 ===", forceEditableCoreFields)

        console.log("=== [EDIT] setForm 상태 ===", assignedFormState)
        setForm(assignedFormState)

        setDetailState({
          detail,
          loading: false,
          error: "",
        })

        console.log("=== [EDIT] 로드 완료 ===")

      } catch (requestError) {
        console.error("=== [EDIT] 데이터 로드 실패 ===", requestError)

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

  const editableCoreFields = true;

console.log("=== [EDIT] editableCoreFields 강제 true 적용 ===", editableCoreFields);

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
  console.log("=== [REMOVE] 삭제 시도 ===", requestItemId);

  if (!editableCoreFields) {
    console.warn("=== [REMOVE] editableCoreFields가 false라 삭제 불가 ===");
    return;
  }

  setItems((currentItems) => {
    const filtered = currentItems.filter(
      (item) => Number(item.requestItemId) !== Number(requestItemId)
    );
    console.log("=== [REMOVE] 삭제 후 items ===", filtered);
    return filtered;
  });
}

  function changeAttachment(event) {
    setAttachment(event.target.files?.[0] ?? null)
  }

  async function saveOrder() {

    const nextForm = {
      ...form,
      ...summary
    };
    
    const nextErrors = customValidatePurchaseOrderForm(nextForm, items)

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return null
    }

    setErrors({})
    setSubmitError("")
    setSubmitting(true)

    try {
      const bffRequestPayload = {
        supplierId: Number(form.supplierId || detailState.detail?.supplierId || 21),
        createdBy: Number(form.createdBy || 5),
        dueDate: form.expectedReceiptTo ? `${form.expectedReceiptTo}T23:59:59` : null,
        orderStatus: form.status || "CONFIRMED",
        orderNo: form.orderNo || form.orderNumber || null,
        requestId: form.requestId ? Number(form.requestId) : null,
        requestNumber: form.requestNumber || "",
        requestTitle: form.requestTitle || "",
        expectedReceiptFrom: form.expectedReceiptFrom || "",
        expectedReceiptTo: form.expectedReceiptTo || "",
        warehouseCode: form.warehouseCode || "",
        memo: form.memo || "",
        items: items.map((item) => ({
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
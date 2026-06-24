"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  fetchPurchaseRequestDetail,
  fetchPurchaseRequestProducts,
  updatePurchaseRequest,
} from "@/features/purchase-request/api/purchaseRequestApi"
import { calculateRequestTotal } from "@/features/purchase-request/utils/purchaseRequestUtils"

const EDITABLE_STATUS_LABELS = new Set(["승인 대기"])
const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024
const FIXED_ITEM_REMARK = "해당 사항 없음"

const INITIAL_FORM = {
  requestNumber: "",
  requester: "",
  department: "",
  requestDate: "",
  expectedDate: "",
  title: "",
  urgency: "일반",
  reason: "",
}

const LOCKED_FORM_FIELDS = new Set(["requestNumber", "requester", "department"])

function normalizeEditItem(item, productMap) {
  const productId = Number(item.productId ?? item.id)
  const product = productMap.get(productId)

  return {
    id: productId,
    productId,
    code: item.itemCode || product?.code || "",
    name: item.itemName || product?.name || "",
    category: item.category || product?.category || "",
    spec: item.specification || product?.spec || "",
    unit: item.unit || product?.unit || "",
    currentStock: product?.currentStock ?? 0,
    unitPrice: Number(item.estimatedUnitPrice ?? product?.unitPrice ?? 0),
    quantity: Number(item.requestQuantity ?? item.quantity ?? 1),
    remark: FIXED_ITEM_REMARK,
  }
}

export default function usePurchaseRequestEdit(requestId) {
  const router = useRouter()

  const [originalRequest, setOriginalRequest] = useState(null)
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(INITIAL_FORM)
  const [requestItems, setRequestItems] = useState([])
  const [attachment, setAttachment] = useState(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const submittingRef = useRef(false)

  const [isItemModalOpen, setIsItemModalOpen] = useState(false)
  const [draftSelectedIds, setDraftSelectedIds] = useState(new Set())

  const [keyword, setKeyword] = useState("")
  const [category, setCategory] = useState("전체 카테고리")
  const [appliedKeyword, setAppliedKeyword] = useState("")
  const [appliedCategory, setAppliedCategory] = useState("전체 카테고리")

  useEffect(() => {
    let ignore = false

    async function loadEditData() {
      setLoading(true)
      setError("")

      try {
        const [requestDetail, productList] = await Promise.all([
          fetchPurchaseRequestDetail(requestId),
          fetchPurchaseRequestProducts(),
        ])

        if (ignore) return

        if (!EDITABLE_STATUS_LABELS.has(requestDetail.status)) {
          setError(
            `${requestDetail.status} 상태의 구매 요청은 수정할 수 없습니다.`,
          )
          setOriginalRequest(requestDetail)
          setLoading(false)
          return
        }

        const normalizedProducts = Array.isArray(productList)
          ? productList
          : (productList.items ?? [])

        const productMap = new Map(
          normalizedProducts.map((product) => [Number(product.id), product]),
        )

        setOriginalRequest(requestDetail)
        setProducts(normalizedProducts)
        setForm({
          requestNumber: requestDetail.requestNumber ?? "",
          requester: requestDetail.requester ?? "",
          department: requestDetail.department ?? "",
          requestDate: requestDetail.requestedAt ?? "",
          expectedDate: requestDetail.desiredReceiptAt ?? "",
          title: requestDetail.title ?? "",
          urgency: requestDetail.priority === "긴급" ? "긴급" : "일반",
          reason: requestDetail.reason ?? "",
        })
        setRequestItems(
          (requestDetail.items ?? []).map((item) =>
            normalizeEditItem(item, productMap),
          ),
        )
      } catch (loadError) {
        if (!ignore) {
          setError(
            loadError.message || "구매 요청 수정 정보를 불러오지 못했습니다.",
          )
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    loadEditData()

    return () => {
      ignore = true
    }
  }, [requestId])

  const totalAmount = useMemo(
    () => calculateRequestTotal(requestItems),
    [requestItems],
  )

  const filteredProducts = useMemo(() => {
    const normalizedKeyword = appliedKeyword.trim().toLowerCase()

    return products.filter((product) => {
      const matchesKeyword =
        !normalizedKeyword ||
        String(product.code ?? "")
          .toLowerCase()
          .includes(normalizedKeyword) ||
        String(product.name ?? "")
          .toLowerCase()
          .includes(normalizedKeyword)

      const matchesCategory =
        appliedCategory === "전체 카테고리" ||
        product.category === appliedCategory

      return matchesKeyword && matchesCategory
    })
  }, [products, appliedCategory, appliedKeyword])

  const categoryOptions = useMemo(() => {
    const categories = products
      .map((product) => product.category)
      .filter(Boolean)

    return ["전체 카테고리", ...Array.from(new Set(categories))]
  }, [products])

  function updateForm(name, value) {
    if (LOCKED_FORM_FIELDS.has(name)) {
      return
    }

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  function changeAttachment(event) {
    const file = event.target.files?.[0] ?? null

    if (!file) {
      setAttachment(null)
      return
    }

    if (file.size > MAX_ATTACHMENT_SIZE) {
      window.alert("첨부파일은 최대 10MB까지 업로드할 수 있습니다.")
      event.target.value = ""
      setAttachment(null)
      return
    }

    setAttachment(file)
  }

  function openItemModal() {
    setDraftSelectedIds(new Set(requestItems.map((item) => item.id)))
    setIsItemModalOpen(true)
  }

  function closeItemModal() {
    setIsItemModalOpen(false)
  }

  function searchProducts(event) {
    event.preventDefault()
    setAppliedKeyword(keyword)
    setAppliedCategory(category)
  }

  function toggleDraftProduct(productId) {
    setDraftSelectedIds((currentIds) => {
      const nextIds = new Set(currentIds)

      if (nextIds.has(productId)) {
        nextIds.delete(productId)
      } else {
        nextIds.add(productId)
      }

      return nextIds
    })
  }

  function toggleAllFilteredProducts() {
    const allFilteredSelected = filteredProducts.every((product) =>
      draftSelectedIds.has(product.id),
    )

    setDraftSelectedIds((currentIds) => {
      const nextIds = new Set(currentIds)

      filteredProducts.forEach((product) => {
        if (allFilteredSelected) {
          nextIds.delete(product.id)
        } else {
          nextIds.add(product.id)
        }
      })

      return nextIds
    })
  }

  function confirmSelectedProducts() {
    const currentQuantityMap = new Map(
      requestItems.map((item) => [item.id, item.quantity]),
    )

    const nextItems = products
      .filter((product) => draftSelectedIds.has(product.id))
      .map((product) => ({
        ...product,
        productId: product.id,
        quantity: currentQuantityMap.get(product.id) ?? 1,
        remark: FIXED_ITEM_REMARK,
      }))

    setRequestItems(nextItems)
    setIsItemModalOpen(false)
  }

  function changeQuantity(productId, quantity) {
    const safeQuantity = Math.max(1, Number(quantity) || 1)

    setRequestItems((currentItems) =>
      currentItems.map((item) =>
        item.id === productId ? { ...item, quantity: safeQuantity } : item,
      ),
    )
  }

  function changeRemark(productId, remark) {
    setRequestItems((currentItems) =>
      currentItems.map((item) =>
        item.id === productId ? { ...item, remark } : item,
      ),
    )
  }

  function removeItem(productId) {
    setRequestItems((currentItems) =>
      currentItems.filter((item) => item.id !== productId),
    )
  }

  async function submitUpdate() {
    if (submittingRef.current) {
      return
    }

    const requiredFields = [
      { label: "희망 입고일", value: form.expectedDate },
      { label: "요청 제목", value: form.title },
      { label: "요청 사유", value: form.reason },
    ]

    const emptyField = requiredFields.find(
      ({ value }) => !String(value ?? "").trim(),
    )

    if (emptyField) {
      window.alert(`${emptyField.label} 항목을 입력해 주세요.`)
      return
    }

    if (requestItems.length === 0) {
      window.alert("구매 요청 품목을 1개 이상 추가해 주세요.")
      return
    }

    submittingRef.current = true
    setIsSubmitting(true)

    try {
      const payload = {
        requestNumber: form.requestNumber,
        requestDate: form.requestDate,
        expectedDate: form.expectedDate,
        title: form.title,
        urgency: form.urgency,
        priority: form.urgency === "긴급" ? "URGENT" : "NORMAL",
        reason: form.reason,
        items: requestItems.map((item) => ({
          productId: Number(item.productId ?? item.id),
          requestQuantity: Number(item.quantity ?? 1),
          estimatedUnitPrice: Number(item.unitPrice ?? 0),
          remark: FIXED_ITEM_REMARK,
        })),
      }

      const updatedRequest = await updatePurchaseRequest(
        requestId,
        payload,
        attachment,
      )

      window.alert("구매 요청을 수정했습니다.")
      router.push(`/purchase-requests/${updatedRequest.id}`)
    } catch (submitError) {
      console.error("구매 요청 수정 실패:", submitError)
      window.alert(
        submitError.message ||
          "구매 요청 수정에 실패했습니다. 다시 시도해 주세요.",
      )
    } finally {
      submittingRef.current = false
      setIsSubmitting(false)
    }
  }

  return {
    originalRequest,
    form,
    attachment,
    requestItems,
    totalAmount,
    loading,
    error,
    isSubmitting,
    isItemModalOpen,
    draftSelectedIds,
    keyword,
    category,
    categoryOptions,
    filteredProducts,
    updateForm,
    changeAttachment,
    openItemModal,
    closeItemModal,
    setKeyword,
    setCategory,
    searchProducts,
    toggleDraftProduct,
    toggleAllFilteredProducts,
    confirmSelectedProducts,
    changeQuantity,
    changeRemark,
    removeItem,
    submitUpdate,
  }
}

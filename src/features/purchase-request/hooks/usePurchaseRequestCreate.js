"use client"

import { useMemo, useRef, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/features/auth/context/AuthContext"
import {
  createPurchaseRequest,
  fetchPurchaseRequestProducts,
} from "@/features/purchase-request/api/purchaseRequestApi"
import {
  calculateRequestTotal,
  getTodayString,
} from "@/features/purchase-request/utils/purchaseRequestUtils"

const INITIAL_FORM = {
  requestNumber: "",
  requester: "",
  department: "",
  requestDate: getTodayString(),
  expectedDate: "",
  title: "",
  urgency: "일반",
  reason: "",
}

function getCurrentRequestorId(user) {
  const rawUserId = user?.dbUserId ?? user?.userId
  const requestorId = Number(rawUserId)

  if (!Number.isFinite(requestorId) || requestorId <= 0) {
    return null
  }

  return requestorId
}

export default function usePurchaseRequestCreate() {
  const router = useRouter()
  const { user, isAuthReady } = useAuth()

  const [products, setProducts] = useState([])
  const [form, setForm] = useState(INITIAL_FORM)
  const [requestItems, setRequestItems] = useState([])
  const [attachment, setAttachment] = useState(null)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const submittingRef = useRef(false)

  const [isItemModalOpen, setIsItemModalOpen] = useState(false)
  const [draftSelectedIds, setDraftSelectedIds] = useState(new Set())

  const [keyword, setKeyword] = useState("")
  const [category, setCategory] = useState("전체 카테고리")
  const [appliedKeyword, setAppliedKeyword] = useState("")
  const [appliedCategory, setAppliedCategory] = useState("전체 카테고리")

  useEffect(() => {
    if (!isAuthReady || !user) {
      return
    }

    const requesterName = user.name ?? user.userName ?? user.username ?? ""
    const departmentName = user.department ?? user.departmentName ?? ""

    setForm((currentForm) => ({
      ...currentForm,
      requester: currentForm.requester || requesterName,
      department: currentForm.department || departmentName,
    }))
  }, [isAuthReady, user])

  useEffect(() => {
    fetchPurchaseRequestProducts()
      .then((data) => {
        setProducts(Array.isArray(data) ? data : (data.items ?? []))
      })
      .catch((error) => {
        console.error("품목 목록 조회 실패:", error)
        window.alert("품목 목록을 불러오지 못했습니다.")
      })
  }, [])

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
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  function changeAttachment(event) {
    setAttachment(event.target.files?.[0] ?? null)
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

    const currentRemarkMap = new Map(
      requestItems.map((item) => [item.id, item.remark ?? ""]),
    )

    const nextItems = products
      .filter((product) => draftSelectedIds.has(product.id))
      .map((product) => ({
        ...product,
        quantity: currentQuantityMap.get(product.id) ?? 1,
        remark: currentRemarkMap.get(product.id) ?? "",
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

  async function submitApproval() {
    if (submittingRef.current) {
      return
    }

    const requestorId = getCurrentRequestorId(user)

    if (!requestorId) {
      window.alert(
        "로그인 사용자 ID를 확인할 수 없습니다. 다시 로그인해 주세요.",
      )
      return
    }

    const requiredFields = [
      { label: "요청자", value: form.requester },
      { label: "요청 부서", value: form.department },
      { label: "요청일", value: form.requestDate },
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
      const createdRequest = await createPurchaseRequest({
        requestNumber: form.requestNumber,
        requestorId,
        requester: form.requester,
        department: form.department,
        requestDate: form.requestDate,
        expectedDate: form.expectedDate,
        title: form.title,
        urgency: form.urgency,
        priority: form.urgency === "긴급" ? "URGENT" : "NORMAL",
        status: "PENDING_APPROVAL",
        reason: form.reason,
        items: requestItems.map((item) => ({
          productId: item.productId ?? item.id,
          requestQuantity: Number(item.quantity ?? item.requestQuantity ?? 1),
          estimatedUnitPrice: Number(
            item.unitPrice ?? item.estimatedUnitPrice ?? 0,
          ),
          remark: item.remark ?? "",
        })),
      })

      window.alert("승인 요청을 전송했습니다.")
      router.push(`/purchase-requests/${createdRequest.id}`)
    } catch (error) {
      console.error("승인 요청 처리 중 오류가 발생했습니다.", error)
      window.alert("승인 요청 처리에 실패했습니다. 다시 시도해 주세요.")
    } finally {
      submittingRef.current = false
      setIsSubmitting(false)
    }
  }

  return {
    form,
    attachment,
    requestItems,
    totalAmount,
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
    submitApproval,
  }
}

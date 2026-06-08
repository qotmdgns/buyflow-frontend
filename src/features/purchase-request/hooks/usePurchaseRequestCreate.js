"use client"

import { useMemo, useRef, useState } from "react"
import {
  initialPurchaseRequestItems,
  mockPurchaseRequestProducts,
} from "@/features/purchase-request/data/mockPurchaseRequestData"
import {
  calculateRequestTotal,
  getTodayString,
} from "@/features/purchase-request/utils/purchaseRequestUtils"

const INITIAL_FORM = {
  requestNumber: "PR-2026-0001",
  requester: "김철수",
  department: "물류운영팀",
  requestDate: getTodayString(),
  expectedDate: "",
  title: "",
  urgency: "일반",
  reason: "",
}

export default function usePurchaseRequestCreate() {
  const [form, setForm] = useState(INITIAL_FORM)
  const [requestItems, setRequestItems] = useState(initialPurchaseRequestItems)
  const [attachment, setAttachment] = useState(null)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const submittingRef = useRef(false)

  const [isItemModalOpen, setIsItemModalOpen] = useState(false)
  const [draftSelectedIds, setDraftSelectedIds] = useState(new Set())

  const [keyword, setKeyword] = useState("")
  const [category, setCategory] = useState("전체 카테고리")
  const [appliedKeyword, setAppliedKeyword] = useState("")
  const [appliedCategory, setAppliedCategory] = useState("전체 카테고리")

  const totalAmount = useMemo(
    () => calculateRequestTotal(requestItems),
    [requestItems],
  )

  const filteredProducts = useMemo(() => {
    const normalizedKeyword = appliedKeyword.trim().toLowerCase()

    return mockPurchaseRequestProducts.filter((product) => {
      const matchesKeyword =
        !normalizedKeyword ||
        product.code.toLowerCase().includes(normalizedKeyword) ||
        product.name.toLowerCase().includes(normalizedKeyword)

      const matchesCategory =
        appliedCategory === "전체 카테고리" ||
        product.category === appliedCategory

      return matchesKeyword && matchesCategory
    })
  }, [appliedCategory, appliedKeyword])

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

    const nextItems = mockPurchaseRequestProducts
      .filter((product) => draftSelectedIds.has(product.id))
      .map((product) => ({
        ...product,
        quantity: currentQuantityMap.get(product.id) ?? 1,
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

  function removeItem(productId) {
    setRequestItems((currentItems) =>
      currentItems.filter((item) => item.id !== productId),
    )
  }

  function saveDraft() {
    window.alert(
      "구매 요청을 임시 저장했습니다. 백엔드 API는 추후 연결하면 됩니다.",
    )
  }

  async function submitApproval() {
    if (submittingRef.current) {
      return
    }

    const requiredFields = [
      { label: "요청 번호", value: form.requestNumber },
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
      // TODO: 백엔드 API 연동 시 실제 승인 요청 API를 호출합니다.
      // await createPurchaseRequestApproval({
      //   form,
      //   requestItems,
      //   attachment,
      // })

      window.alert(
        "승인 요청을 전송했습니다. 백엔드 API는 추후 연결하면 됩니다.",
      )
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
    removeItem,
    saveDraft,
    submitApproval,
  }
}

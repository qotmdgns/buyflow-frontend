"use client"

import { useEffect, useMemo, useState } from "react"

import {
  fetchInspectionDetail,
  submitInspectionResult,
} from "@/features/inspection/api/inspectionApi"

function getLocalDateTimeValue(date = new Date()) {
  const year = date.getFullYear()

  const month = String(date.getMonth() + 1).padStart(2, "0")

  const day = String(date.getDate()).padStart(2, "0")

  const hours = String(date.getHours()).padStart(2, "0")

  const minutes = String(date.getMinutes()).padStart(2, "0")

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function createInitialForm(inspection) {
  return {
    inspectorName: "김철수 대리",

    inspectedAt: getLocalDateTimeValue(),

    note: "",

    items: inspection.items.map((item) => ({
      ...item,

      acceptedQuantity: item.acceptedQuantity ?? item.receivedQuantity,

      defectiveQuantity: item.defectiveQuantity ?? 0,

      defectReason: item.defectReason ?? "",

      disposition: item.disposition ?? "NONE",
    })),
  }
}

function validateInspectionForm(form) {
  if (!form.inspectorName.trim()) {
    return "검수 담당자를 입력해 주세요."
  }

  if (!form.inspectedAt) {
    return "검수 일시를 입력해 주세요."
  }

  for (const item of form.items) {
    const acceptedQuantity = Number(item.acceptedQuantity)

    const defectiveQuantity = Number(item.defectiveQuantity)

    if (
      !Number.isInteger(acceptedQuantity) ||
      acceptedQuantity < 0 ||
      !Number.isInteger(defectiveQuantity) ||
      defectiveQuantity < 0
    ) {
      return `${item.itemName}의 합격 수량과 불량 수량은 0 이상의 정수로 입력해 주세요.`
    }

    if (acceptedQuantity + defectiveQuantity !== item.receivedQuantity) {
      return `${item.itemName}의 합격 수량과 불량 수량 합계가 입고 수량과 일치하지 않습니다.`
    }

    if (defectiveQuantity > 0 && !item.defectReason.trim()) {
      return `${item.itemName}의 불량 사유를 입력해 주세요.`
    }

    if (defectiveQuantity > 0 && item.disposition === "NONE") {
      return `${item.itemName}의 불량 처리 방식을 선택해 주세요.`
    }
  }

  return ""
}

export default function useInspectionRegister(inspectionId) {
  const [inspection, setInspection] = useState(null)

  const [form, setForm] = useState(null)

  const [loading, setLoading] = useState(true)

  const [submitting, setSubmitting] = useState(false)

  const [error, setError] = useState("")

  const [actionError, setActionError] = useState("")

  useEffect(() => {
    let ignore = false

    async function loadInspection() {
      setLoading(true)
      setError("")

      try {
        const nextInspection = await fetchInspectionDetail(inspectionId)

        if (!ignore) {
          setInspection(nextInspection)

          setForm(createInitialForm(nextInspection))
        }
      } catch (requestError) {
        if (!ignore) {
          setInspection(null)
          setForm(null)

          setError(
            requestError.message || "검수 등록 정보를 불러오지 못했습니다.",
          )
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    loadInspection()

    return () => {
      ignore = true
    }
  }, [inspectionId])

  const totals = useMemo(() => {
    const items = form?.items ?? []

    return items.reduce(
      (result, item) => ({
        received: result.received + Number(item.receivedQuantity ?? 0),

        accepted: result.accepted + Number(item.acceptedQuantity || 0),

        defective: result.defective + Number(item.defectiveQuantity || 0),
      }),

      {
        received: 0,
        accepted: 0,
        defective: 0,
      },
    )
  }, [form])

  function updateField(name, value) {
    setActionError("")

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  function updateItem(itemId, name, value) {
    setActionError("")

    setForm((currentForm) => ({
      ...currentForm,

      items: currentForm.items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              [name]: value,
            }
          : item,
      ),
    }))
  }

  async function submit() {
    const validationMessage = validateInspectionForm(form)

    if (validationMessage) {
      setActionError(validationMessage)

      return null
    }

    setSubmitting(true)
    setActionError("")

    try {
      return await submitInspectionResult(inspectionId, {
        inspectorId: 1,

        inspectorName: form.inspectorName.trim(),

        inspectedAt: form.inspectedAt,

        note: form.note.trim(),

        items: form.items.map((item) => ({
          receiptItemId: item.receiptItemId ?? item.id,

          receivedQuantity: Number(item.receivedQuantity),

          acceptedQuantity: Number(item.acceptedQuantity),

          defectiveQuantity: Number(item.defectiveQuantity),

          defectReason: item.defectReason.trim(),

          disposition: item.disposition,
        })),
      })
    } catch (requestError) {
      setActionError(requestError.message || "검수 결과를 저장하지 못했습니다.")

      return null
    } finally {
      setSubmitting(false)
    }
  }

  return {
    inspection,
    form,
    totals,
    loading,
    submitting,
    error,
    actionError,
    updateField,
    updateItem,
    submit,
  }
}

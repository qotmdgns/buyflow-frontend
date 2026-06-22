"use client"

import { useEffect, useState } from "react"
import {
  createProduct,
  fetchProductById,
  updateProduct,
} from "@/features/product/api/productApi"

const INITIAL_FORM = {
  code: "",
  name: "",
  category: "",
  spec: "",
  unit: "EA",
  unitPrice: "0",
  manufacturer: "",
  isActive: true,
  description: "",
}

function toForm(product) {
  return {
    code: product.code ?? "",
    name: product.name ?? "",
    category: product.category ?? "",
    spec: product.spec ?? "",
    unit: product.unit ?? "EA",
    unitPrice: String(product.unitPrice ?? 0),
    manufacturer: product.manufacturer ?? "",
    isActive: product.isActive ?? true,
    description: product.description ?? "",
  }
}
export default function useProductCreate({
  mode = "create",
  productId = null,
} = {}) {
  const [form, setForm] = useState(INITIAL_FORM)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (mode !== "edit" || !productId) {
      return
    }

    let ignore = false

    async function loadProduct() {
      setIsLoading(true)

      try {
        const product = await fetchProductById(productId)

        if (!ignore) {
          setForm(toForm(product))
        }
      } catch (error) {
        console.error(error)

        if (!ignore) {
          window.alert("품목 수정 정보를 불러오지 못했습니다.")
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    loadProduct()

    return () => {
      ignore = true
    }
  }, [mode, productId])

  function updateForm(name, value) {
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  function validateForm() {
    if (!form.code.trim()) {
      return "품목 코드를 입력해 주세요."
    }

    if (!form.name.trim()) {
      return "품목명을 입력해 주세요."
    }

    if (!form.category) {
      return "카테고리를 선택해 주세요."
    }

    if (!form.unit) {
      return "단위를 선택해 주세요."
    }

    return ""
  }

  async function saveProduct() {
    const validationMessage = validateForm()

    if (validationMessage) {
      window.alert(validationMessage)
      return false
    }

    setIsSaving(true)

    try {
<<<<<<< HEAD

      await new Promise((resolve) => setTimeout(resolve, 300))

      window.alert("품목이 등록되었습니다.")
=======
      if (mode === "edit") {
        await updateProduct(productId, form)
        window.alert("품목이 수정되었습니다.")
      } else {
        await createProduct(form)
        window.alert("품목이 등록되었습니다.")
      }
>>>>>>> 39cfa0052cd44d8e88fdfa8b777f695a7037c9cb

      return true
    } catch (error) {
      console.error("품목 저장 중 오류가 발생했습니다.", error)

      window.alert(
        mode === "edit"
          ? "품목 수정에 실패했습니다. 다시 시도해 주세요."
          : "품목 등록에 실패했습니다. 다시 시도해 주세요.",
      )

      return false
    } finally {
      setIsSaving(false)
    }
  }

  return {
    form,
    isSaving,
    isLoading,
    updateForm,
    saveProduct,
  }
}

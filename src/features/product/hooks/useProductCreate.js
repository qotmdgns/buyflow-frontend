"use client"

import { useEffect, useState } from "react"
import {
  createProduct,
  fetchProductById,
  fetchProductFilterOptions,
  updateProduct,
} from "@/features/product/api/productApi"

const INITIAL_FORM = {
  code: "",
  name: "",
  companyName: "",
  bizRegNo: "",
  category: "",
  parentCategory: "",
  spec: "",
  unit: "",
  unitPrice: "",
  origin: "",
  competingProduct: "",
  validStartDate: "",
  validEndDate: "",
  isActive: true,
  description: "",
}

const INITIAL_FILTER_OPTIONS = {
  categories: ["전체"],
  units: ["전체"],
}

function normalizeDate(value) {
  if (!value) {
    return ""
  }

  return String(value).slice(0, 10)
}

function normalizeBoolean(value, defaultValue = false) {
  if (value === true || value === "Y" || value === "y" || value === "true") {
    return true
  }

  if (value === false || value === "N" || value === "n" || value === "false") {
    return false
  }

  return defaultValue
}

function toForm(product) {
  return {
    code: product.productNo ?? product.code ?? "",
    name: product.productName ?? product.name ?? "",

    companyName:
      product.companyName ?? product.manufacturer ?? product.company ?? "",

    bizRegNo: product.bizRegNo ?? "",
    category: product.categoryName ?? product.category ?? "",
    parentCategory: product.parentCategory ?? "",
    spec: product.spec ?? "",
    unit: product.unit ?? "",
    unitPrice:
      product.unitPrice === null || product.unitPrice === undefined
        ? ""
        : String(product.unitPrice),

    origin: product.origin ?? "",
    competingProduct:
      product.competingProduct === "Y" || product.competingProduct === true
        ? "Y"
        : "N",

    validStartDate: normalizeDate(product.validStartDate),
    validEndDate: normalizeDate(product.validEndDate),

    isActive: normalizeBoolean(product.useYn, product.isActive ?? true),

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
  const [filterOptions, setFilterOptions] = useState(INITIAL_FILTER_OPTIONS)

  useEffect(() => {
    let ignore = false

    async function loadFilterOptions() {
      try {
        const options = await fetchProductFilterOptions()

        if (!ignore) {
          setFilterOptions({
            categories: options?.categories ?? ["전체"],
            units: options?.units ?? ["전체"],
          })
        }
      } catch (error) {
        console.error("품목 옵션 조회 실패", error)
      }
    }

    loadFilterOptions()

    return () => {
      ignore = true
    }
  }, [])

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

    if (
      form.unitPrice !== "" &&
      (Number.isNaN(Number(form.unitPrice)) || Number(form.unitPrice) < 0)
    ) {
      return "기준 단가는 0 이상의 숫자로 입력해 주세요."
    }

    if (
      form.validStartDate &&
      form.validEndDate &&
      form.validStartDate > form.validEndDate
    ) {
      return "유효 시작일은 유효 종료일보다 늦을 수 없습니다."
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
      await new Promise((resolve) => setTimeout(resolve, 300))

      window.alert("품목이 등록되었습니다.")

      if (mode === "edit") {
        if (!productId) {
          window.alert("수정할 품목 ID를 찾을 수 없습니다.")
          return false
        }

        await updateProduct(productId, form)
        window.alert("품목이 수정되었습니다.")
      } else {
        await createProduct(form)
        window.alert("품목이 등록되었습니다.")
      }

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
    filterOptions,
    updateForm,
    saveProduct,
  }
}

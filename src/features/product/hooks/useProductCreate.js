"use client"

import { useEffect, useMemo, useState } from "react"

const INITIAL_FORM = {
  code: "",
  name: "",
  category: "",
  spec: "",
  unit: "EA",
  unitPrice: "0",
  manufacturer: "",
  barcode: "",
  safetyStock: "0",
  isActive: true,
  description: "",
}

const INITIAL_WAREHOUSE_SETTINGS = [
  {
    rowId: 1,
    warehouseId: "WH-001",
    locationCode: "A-12-04",
    safetyStock: "100",
    reorderPoint: "50",
  },
  {
    rowId: 2,
    warehouseId: "WH-001",
    locationCode: "A-12-04",
    safetyStock: "100",
    reorderPoint: "50",
  },
]

const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg"]
const MAX_IMAGE_SIZE = 5 * 1024 * 1024

function toNonNegativeNumber(value) {
  return Math.max(0, Number(value) || 0)
}

export default function useProductCreate() {
  const [form, setForm] = useState(INITIAL_FORM)

  const [warehouseSettings, setWarehouseSettings] = useState(
    INITIAL_WAREHOUSE_SETTINGS,
  )

  const [imageFile, setImageFile] = useState(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl)
      }
    }
  }, [imagePreviewUrl])

  const payload = useMemo(
    () => ({
      ...form,
      unitPrice: toNonNegativeNumber(form.unitPrice),
      safetyStock: toNonNegativeNumber(form.safetyStock),

      warehouseSettings: warehouseSettings.map((setting) => ({
        warehouseId: setting.warehouseId,
        locationCode: setting.locationCode.trim(),
        safetyStock: toNonNegativeNumber(setting.safetyStock),
        reorderPoint: toNonNegativeNumber(setting.reorderPoint),
      })),

      imageFile,
    }),
    [form, imageFile, warehouseSettings],
  )

  function updateForm(name, value) {
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  function changeImage(event) {
    const nextFile = event.target.files?.[0]

    if (!nextFile) {
      return
    }

    if (!ALLOWED_IMAGE_TYPES.includes(nextFile.type)) {
      window.alert("PNG 또는 JPG 형식의 이미지만 등록할 수 있습니다.")
      event.target.value = ""
      return
    }

    if (nextFile.size > MAX_IMAGE_SIZE) {
      window.alert("품목 이미지는 최대 5MB까지 등록할 수 있습니다.")
      event.target.value = ""
      return
    }

    setImageFile(nextFile)
    setImagePreviewUrl(URL.createObjectURL(nextFile))
  }

  function removeImage() {
    setImageFile(null)
    setImagePreviewUrl("")
  }

  function addWarehouseSetting() {
    setWarehouseSettings((currentSettings) => [
      ...currentSettings,
      {
        rowId: Date.now(),
        warehouseId: "WH-001",
        locationCode: "",
        safetyStock: "0",
        reorderPoint: "0",
      },
    ])
  }

  function updateWarehouseSetting(rowId, name, value) {
    setWarehouseSettings((currentSettings) =>
      currentSettings.map((setting) =>
        setting.rowId === rowId ? { ...setting, [name]: value } : setting,
      ),
    )
  }

  function removeWarehouseSetting(rowId) {
    setWarehouseSettings((currentSettings) =>
      currentSettings.filter((setting) => setting.rowId !== rowId),
    )
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

    const emptyLocation = warehouseSettings.find(
      (setting) => !setting.locationCode.trim(),
    )

    if (emptyLocation) {
      return "창고별 보관 위치를 입력해 주세요."
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
      // TODO: 백엔드 구현 후 POST /api/products 요청으로 교체합니다.
      console.log("품목 등록 요청 payload", payload)

      await new Promise((resolve) => setTimeout(resolve, 300))

      window.alert("품목이 등록되었습니다.")

      return true
    } catch (error) {
      console.error("품목 등록 중 오류가 발생했습니다.", error)

      window.alert("품목 등록에 실패했습니다. 다시 시도해 주세요.")

      return false
    } finally {
      setIsSaving(false)
    }
  }

  return {
    form,
    warehouseSettings,
    imageFile,
    imagePreviewUrl,
    isSaving,
    updateForm,
    changeImage,
    removeImage,
    addWarehouseSetting,
    updateWarehouseSetting,
    removeWarehouseSetting,
    saveProduct,
  }
}

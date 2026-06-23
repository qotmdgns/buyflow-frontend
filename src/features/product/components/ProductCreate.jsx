"use client"

import { Save } from "lucide-react"
import { useRouter } from "next/navigation"
import ProductBasicForm from "@/features/product/components/ProductBasicForm"
import useProductCreate from "@/features/product/hooks/useProductCreate"

export default function ProductCreate({ mode = "create", productId = null }) {
  const router = useRouter()

  const { form, isSaving, filterOptions, updateForm, saveProduct } =
    useProductCreate({
      mode,
      productId,
    })

  async function handleSave() {
    const isSaved = await saveProduct()

    if (isSaved) {
      router.push("/products")
    }
  }

  const isEditMode = mode === "edit"

  return (
    <div className="w-full">
      <header className="mb-3">
        <h1 className="text-[22px] font-bold text-slate-900">
          {isEditMode ? "품목 수정" : "품목 등록"}
        </h1>
      </header>

      <ProductBasicForm
        mode={mode}
        form={form}
        filterOptions={filterOptions}
        onChange={updateForm}
      />

      <footer className="mt-3 flex justify-end gap-2 border-t border-slate-200 pt-3">
        <button
          type="button"
          onClick={() => router.push("/products")}
          className="h-10 rounded-md border border-slate-200 bg-white px-5 text-[13px] font-semibold text-slate-500 transition hover:bg-slate-50"
        >
          취소
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="flex h-10 items-center gap-1.5 rounded-md bg-blue-600 px-5 text-[13px] font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          <Save size={13} />

          {isSaving ? "저장 중..." : isEditMode ? "수정" : "저장"}
        </button>
      </footer>
    </div>
  )
}

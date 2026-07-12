"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save } from "lucide-react"
import { useAuth } from "@/features/auth/context/AuthContext"
import {
  createSupplier,
  fetchSupplierById,
  updateSupplier,
} from "@/features/supplier/api/supplierApi"

const INITIAL_FORM = {
  code: "",
  name: "",
  businessNumber: "",
  manager: "",
  phone: "",
  email: "",
  address: "",
  tradeStatus: "ACTIVE",
}

const TRADE_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "거래중" },
  { value: "STOPPED", label: "거래중지" },
]

const INPUT_CLASS_NAME =
  "h-10 w-full rounded-md border border-slate-200 px-3 text-[14px] text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"

function FieldLabel({ children, required = false }) {
  return (
    <span className="mb-1 block text-[13px] font-semibold text-slate-600">
      {children}
      {required && <span className="ml-0.5 text-rose-500">*</span>}
    </span>
  )
}

function normalizeBusinessNumber(value) {
  return String(value ?? "").replace(/[^0-9]/g, "")
}

function toForm(supplier) {
  return {
    code: supplier.code ?? "",
    name: supplier.name ?? "",
    businessNumber: supplier.businessNumber ?? "",
    manager: supplier.manager ?? "",
    phone: supplier.phone ?? "",
    email: supplier.email ?? "",
    address: supplier.address ?? "",
    tradeStatus: supplier.tradeStatusCode ?? "ACTIVE",
  }
}

export default function SupplierForm({ mode = "create", supplierId = null }) {
  const router = useRouter()
  const { user, isAuthReady } = useAuth()
  const isEditMode = mode === "edit"
  const canManageSuppliers =
    isAuthReady &&
    (user?.roles?.includes("ADMIN") ||
      user?.permissions?.includes("suppliers.write"))

  const [form, setForm] = useState(INITIAL_FORM)
  const [isLoading, setIsLoading] = useState(isEditMode)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (isAuthReady && !canManageSuppliers) {
      router.replace("/suppliers")
    }
  }, [canManageSuppliers, isAuthReady, router])

  useEffect(() => {
    if (!isAuthReady || !canManageSuppliers || !isEditMode || !supplierId) {
      return
    }

    let ignore = false

    async function loadSupplier() {
      setIsLoading(true)

      try {
        const supplier = await fetchSupplierById(supplierId)

        if (!ignore) {
          setForm(toForm(supplier))
        }
      } catch (error) {
        console.error("공급업체 수정 정보 조회 실패", error)

        if (!ignore) {
          window.alert("공급업체 수정 정보를 불러오지 못했습니다.")
          router.push("/suppliers")
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    loadSupplier()

    return () => {
      ignore = true
    }
  }, [canManageSuppliers, isAuthReady, isEditMode, router, supplierId])

  function updateForm(name, value) {
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  function validateForm() {
    if (!form.name.trim()) {
      return "공급업체명을 입력해 주세요."
    }

    const businessNumber = normalizeBusinessNumber(form.businessNumber)

    if (businessNumber && businessNumber.length !== 10) {
      return "사업자 등록번호는 숫자 10자리로 입력해 주세요."
    }

    return ""
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const validationMessage = validateForm()

    if (validationMessage) {
      window.alert(validationMessage)
      return
    }

    setIsSaving(true)

    try {
      if (isEditMode) {
        await updateSupplier(supplierId, form)
        window.alert("공급업체 정보가 수정되었습니다.")
      } else {
        await createSupplier(form)
        window.alert("공급업체가 등록되었습니다.")
      }

      router.push("/suppliers")
    } catch (error) {
      console.error("공급업체 저장 실패", error)
      window.alert(
        error.message ||
          (isEditMode
            ? "공급업체 수정에 실패했습니다."
            : "공급업체 등록에 실패했습니다."),
      )
    } finally {
      setIsSaving(false)
    }
  }

  if (!isAuthReady || !canManageSuppliers) {
    return null
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <header className="mb-3">
        <h1 className="text-[22px] font-bold tracking-tight text-slate-900">
          {isEditMode ? "공급업체 수정" : "공급업체 등록"}
        </h1>
        <p className="mt-1 text-[13px] text-slate-400">
          공급업체 기준정보와 거래 상태를 관리합니다.
        </p>
      </header>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        {isLoading ? (
          <div className="py-16 text-center text-[14px] text-slate-400">
            공급업체 정보를 불러오는 중입니다.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <FieldLabel>공급업체 코드</FieldLabel>
              <input
                value={form.code}
                onChange={(event) => updateForm("code", event.target.value)}
                placeholder="예: SUP-001"
                className={INPUT_CLASS_NAME}
              />
            </label>

            <label>
              <FieldLabel required>공급업체명</FieldLabel>
              <input
                value={form.name}
                onChange={(event) => updateForm("name", event.target.value)}
                placeholder="업체명 입력"
                className={INPUT_CLASS_NAME}
              />
            </label>

            <label>
              <FieldLabel>사업자 등록번호</FieldLabel>
              <input
                value={form.businessNumber}
                onChange={(event) =>
                  updateForm("businessNumber", event.target.value)
                }
                placeholder="숫자 10자리"
                className={INPUT_CLASS_NAME}
              />
            </label>

            <label>
              <FieldLabel>담당자</FieldLabel>
              <input
                value={form.manager}
                onChange={(event) => updateForm("manager", event.target.value)}
                placeholder="담당자 성명"
                className={INPUT_CLASS_NAME}
              />
            </label>

            <label>
              <FieldLabel>연락처</FieldLabel>
              <input
                value={form.phone}
                onChange={(event) => updateForm("phone", event.target.value)}
                placeholder="연락처 입력"
                className={INPUT_CLASS_NAME}
              />
            </label>

            <label>
              <FieldLabel>이메일</FieldLabel>
              <input
                value={form.email}
                onChange={(event) => updateForm("email", event.target.value)}
                placeholder="email@example.com"
                className={INPUT_CLASS_NAME}
              />
            </label>

            <label>
              <FieldLabel>거래 상태</FieldLabel>
              <select
                value={form.tradeStatus}
                onChange={(event) =>
                  updateForm("tradeStatus", event.target.value)
                }
                className={`${INPUT_CLASS_NAME} bg-white`}
              >
                {TRADE_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="md:col-span-2">
              <FieldLabel>주소</FieldLabel>
              <input
                value={form.address}
                onChange={(event) => updateForm("address", event.target.value)}
                placeholder="주소 입력"
                className={INPUT_CLASS_NAME}
              />
            </label>
          </div>
        )}
      </section>

      <footer className="mt-3 flex justify-end gap-2 border-t border-slate-200 pt-3">
        <button
          type="button"
          onClick={() => router.push("/suppliers")}
          className="flex h-10 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-5 text-[13px] font-semibold text-slate-500 transition hover:bg-slate-50"
        >
          <ArrowLeft size={14} />
          취소
        </button>

        <button
          type="submit"
          disabled={isLoading || isSaving}
          className="flex h-10 items-center gap-1.5 rounded-md bg-blue-600 px-5 text-[13px] font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          <Save size={14} />
          {isSaving ? "저장 중..." : isEditMode ? "수정" : "등록"}
        </button>
      </footer>
    </form>
  )
}

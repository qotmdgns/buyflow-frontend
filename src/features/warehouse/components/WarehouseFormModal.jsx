"use client"

import { useEffect, useState, useRef } from "react"
import Script from "next/script"
import { useAuth } from "@/features/auth/context/AuthContext"
import {
  Building2,
  MapPin,
  Phone,
  Save,
  UserRound,
  Warehouse,
  X,
} from "lucide-react"
import {
  EMPTY_WAREHOUSE_FORM,
  validateWarehouseForm,
  WAREHOUSE_TYPE_OPTIONS,
} from "@/features/warehouse/utils/warehouseManagementUtils"

const INPUT_CLASS_NAME =
  "h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-[13px] text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"

function FieldLabel({ required = false, children }) {
  return (
    <span className="mb-1 block text-[13px] font-semibold text-slate-600">
      {children}
      {required && <span className="ml-0.5 text-rose-500">*</span>}
    </span>
  )
}

function FieldError({ message }) {
  if (!message) {
    return null
  }

  return <p className="mt-1 text-[12px] text-rose-500">{message}</p>
}

function getCurrentUserId(user) {
  return user?.userId ?? user?.id ?? user?.sub ?? ""
}

function getCurrentUserName(user) {
  return user?.userName ?? user?.name ?? user?.username ?? ""
}

function createFormValue(initialValue) {
  return {
    ...EMPTY_WAREHOUSE_FORM,
    ...initialValue,
  }
}

export default function WarehouseFormModal({
  mode = "create",
  initialValue,
  onClose,
  onSubmit,
}) {
  const { user, isAuthReady } = useAuth()
  const [form, setForm] = useState(() => createFormValue(initialValue))

  const currentUserId = getCurrentUserId(user)
  const currentUserName = getCurrentUserName(user)
  const isEditMode = mode === "edit"

  const resolvedManager =
    !isEditMode && isAuthReady ? form.manager || currentUserName : form.manager

  const resolvedUserId =
    !isEditMode && isAuthReady ? form.userId || currentUserId : form.userId

  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const detailAddressRef = useRef(null)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow

    document.body.style.overflow = "hidden"

    function handleEscape(event) {
      if (event.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener("keydown", handleEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", handleEscape)
    }
  }, [onClose])

  function updateForm(name, value) {
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))

    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: "",
    }))
  }

  function findAddress() {
    if (!window.kakao || !window.kakao.Postcode) {
      setSubmitError(
        "주소 검색 API를 불러오는 중입니다. 잠시 후 다시 시도해주세요.",
      )
      return
    }

    new window.kakao.Postcode({
      oncomplete(data) {
        let selectedAddress = ""

        if (data.userSelectedType === "R") {
          selectedAddress = data.roadAddress
        } else {
          selectedAddress = data.jibunAddress
        }

        updateForm("zipcode", data.zonecode)
        updateForm("baseAddress", selectedAddress)
        updateForm("detailAddress", "")

        window.setTimeout(() => {
          detailAddressRef.current?.focus()
        }, 0)
      },
    }).open()
  }

async function submitForm(event) {
    event.preventDefault();

    const finalManager = form.manager || form.managerName || resolvedManager || "";
    const finalUserId = form.userId || resolvedUserId || "";
    const finalDetailAddress = form.detailAddress || form.detailAddres || "";
    
    const finalCode = form.code ? form.code.trim().toUpperCase() : ""; 
    const finalName = form.name || form.warehouseName || "";

    const submitPayload = {
      ...form,
      code: finalCode,
      name: finalName,
      warehouseCode: finalCode,
      warehouseName: finalName,
      detailAddress: finalDetailAddress,
      detailAddres: finalDetailAddress,
      userId: finalUserId,
      manager: finalManager,
      managerName: finalManager
    };

    const nextErrors = validateWarehouseForm(submitPayload);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      await onSubmit(submitPayload);
    } catch (requestError) {
      setSubmitError(
        requestError.message ||
          `${isEditMode ? "창고 정보를 수정" : "신규 창고를 등록"}하지 못했습니다.`,
      );
    } finally {
      setSubmitting(false);
    }
  }

  function closeModal() {
    if (!submitting) {
      onClose()
    }
  }

  return (
    <div
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          closeModal()
        }
      }}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/45 px-4 py-6 backdrop-blur-[1px]"
    >
      <Script
        src="https://t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
        strategy="afterInteractive"
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-label={isEditMode ? "창고 정보 수정" : "신규 창고 등록"}
        className="max-h-[calc(100vh-2rem)] w-full max-w-[680px] overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <Warehouse size={18} className="text-blue-600" />

            <h2 className="text-[16px] font-bold text-slate-800">
              {isEditMode ? "창고 정보 수정" : "신규 창고 등록"}
            </h2>
          </div>

          <button
            type="button"
            onClick={closeModal}
            aria-label="닫기"
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={17} />
          </button>
        </header>

        <form onSubmit={submitForm}>
          <div className="space-y-4 px-5 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label>
                <FieldLabel required>창고 코드</FieldLabel>

                <input
                  value={form.code || ""}
                  disabled={isEditMode}
                  onChange={(event) => updateForm("code", event.target.value)}
                  placeholder="WH-XXXX"
                  className={INPUT_CLASS_NAME}
                />

                <FieldError message={errors.code} />
              </label>

              <label>
                <FieldLabel required>창고명</FieldLabel>

                <div className="relative">
                  <Building2
                    size={14}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={form.name || ""}
                    onChange={(event) => updateForm("name", event.target.value)}
                    placeholder="창고 이름을 입력하세요"
                    className={`${INPUT_CLASS_NAME} pl-9`}
                  />
                </div>

                <FieldError message={errors.name} />
              </label>

              <label>
                <FieldLabel>창고 유형</FieldLabel>

                <select
                  value={form.type || ""}
                  onChange={(event) => updateForm("type", event.target.value)}
                  className={INPUT_CLASS_NAME}
                >
                  {WAREHOUSE_TYPE_OPTIONS.map((warehouseType) => (
                    <option key={warehouseType} value={warehouseType}>
                      {warehouseType}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <FieldLabel>사용 여부</FieldLabel>

                <select
                  value={form.activeStatus || ""}
                  onChange={(event) =>
                    updateForm("activeStatus", event.target.value)
                  }
                  className={INPUT_CLASS_NAME}
                >
                  <option value="사용 중">사용 (Y)</option>
                  <option value="사용 중지">미사용 (N)</option>
                </select>
              </label>
            </div>

            <div>
              <FieldLabel required>주소</FieldLabel>

              <div className="space-y-2">
                <div className="grid grid-cols-[1fr_86px] gap-2">
                  <input
                    value={form.zipcode || ""}
                    onChange={(event) =>
                      updateForm(
                        "zipcode",
                        event.target.value.replace(/\D/g, "").slice(0, 5),
                      )
                    }
                    placeholder="우편번호"
                    inputMode="numeric"
                    maxLength={5}
                    className={INPUT_CLASS_NAME}
                  />

                  <button
                    type="button"
                    onClick={findAddress}
                    className="h-10 rounded-md border border-slate-200 bg-white px-3 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    주소 찾기
                  </button>
                </div>

                <FieldError message={errors.zipcode} />

                <div className="relative">
                  <MapPin
                    size={14}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={form.baseAddress || ""}
                    onClick={findAddress}
                    onChange={(event) =>
                      updateForm("baseAddress", event.target.value)
                    }
                    placeholder="기본 주소 검색"
                    readOnly
                    className={`${INPUT_CLASS_NAME} pl-9 cursor-pointer bg-slate-50`}
                  />
                </div>

                <FieldError message={errors.baseAddress} />

                <input
                  ref={detailAddressRef}
                  value={form.detailAddress || ""}
                  onChange={(event) =>
                    updateForm("detailAddress", event.target.value)
                  }
                  placeholder="상세 주소를 입력하세요"
                  className={INPUT_CLASS_NAME}
                />

                <FieldError message={errors.detailAddress} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label>
                <FieldLabel>담당자</FieldLabel>

                <div className="relative">
                  <UserRound
                    size={14}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={resolvedManager}
                    onChange={(event) =>
                      updateForm("manager", event.target.value)
                    }
                    placeholder="담당자 성명"
                    className={`${INPUT_CLASS_NAME} pl-9`}
                  />
                </div>
              </label>

              <label>
                <FieldLabel>연락처</FieldLabel>

                <div className="relative">
                  <Phone
                    size={14}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={form.phone || ""}
                    onChange={(event) =>
                      updateForm("phone", event.target.value)
                    }
                    placeholder="010-0000-0000"
                    className={`${INPUT_CLASS_NAME} pl-9`}
                  />
                </div>

                <FieldError message={errors.phone} />
              </label>
            </div>

            <label className="block">
              <FieldLabel>비고</FieldLabel>

              <textarea
                value={form.memo}
                onChange={(event) => updateForm("memo", event.target.value)}
                placeholder="기타 특이사항을 입력하세요"
                rows={3}
                className="w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            {submitError && (
              <p className="rounded-md bg-rose-50 px-3 py-2 text-[13px] font-medium text-rose-600">
                {submitError}
              </p>
            )}
          </div>

          <footer className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3">
            <button
              type="button"
              onClick={closeModal}
              disabled={submitting}
              className="h-10 rounded-md border border-slate-200 bg-white px-4 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              취소
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex h-10 items-center gap-1.5 rounded-md bg-blue-600 px-4 text-[13px] font-semibold text-white transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60"
            >
              <Save size={14} />
              {submitting ? "저장 중..." : "저장하기"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  )
}

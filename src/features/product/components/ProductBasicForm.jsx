const INPUT_CLASS_NAME =
  "h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-[14px] text-slate-600 outline-none transition placeholder:text-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"

const TEXTAREA_CLASS_NAME =
  "w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-2 text-[14px] text-slate-600 outline-none transition placeholder:text-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"

function FieldLabel({ children, required = false }) {
  return (
    <span className="mb-1 block text-[13px] font-semibold text-slate-700">
      {children}

      {required && <strong className="ml-0.5 text-rose-500">*</strong>}
    </span>
  )
}

function TextField({ label, required, ...inputProps }) {
  return (
    <label>
      <FieldLabel required={required}>{label}</FieldLabel>

      <input {...inputProps} className={INPUT_CLASS_NAME} />
    </label>
  )
}

function SelectField({ label, required, options, value, onChange }) {
  return (
    <label>
      <FieldLabel required={required}>{label}</FieldLabel>

      <select value={value} onChange={onChange} className={INPUT_CLASS_NAME}>
        {(options ?? []).map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function TextAreaField({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <label className="md:col-span-2">
      <FieldLabel>{label}</FieldLabel>

      <textarea
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={TEXTAREA_CLASS_NAME}
      />
    </label>
  )
}

function toSelectOptions(values = [], placeholder = "선택") {
  return [
    { value: "", label: placeholder },
    ...values
      .filter((value) => value && value !== "전체")
      .map((value) => ({
        value,
        label: value,
      })),
  ]
}

export default function ProductBasicForm({
  mode = "create",
  form,
  filterOptions,
  onChange,
}) {
  const isEditMode = mode === "edit"
  const categoryOptions = toSelectOptions(
    filterOptions?.categories,
    "카테고리 선택",
  )

  const unitOptions = toSelectOptions(filterOptions?.units, "단위 선택")

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="border-l-[3px] border-blue-500 pl-2 text-[15px] font-bold text-slate-800">
        품목 기본정보
      </h2>

      <div className="mt-3">
        <div className="grid gap-x-3 gap-y-3 md:grid-cols-2">
          <TextField
            label="품목 코드"
            required
            value={form.code ?? ""}
            onChange={(event) => onChange("code", event.target.value)}
            placeholder="예: P-0001"
          />

          <TextField
            label="품목명"
            required
            value={form.name ?? ""}
            onChange={(event) => onChange("name", event.target.value)}
            placeholder="상품 또는 자재 명칭"
          />

          <TextField
            label="업체명"
            value={form.companyName ?? ""}
            onChange={(event) => onChange("companyName", event.target.value)}
            placeholder="공급업체 또는 제조사명"
          />

          <TextField
            label="사업자등록번호"
            value={form.bizRegNo ?? ""}
            onChange={(event) => onChange("bizRegNo", event.target.value)}
            placeholder="예: 123-45-67890"
          />

          <SelectField
            label="카테고리"
            required
            options={categoryOptions}
            value={form.category ?? ""}
            onChange={(event) => onChange("category", event.target.value)}
          />

          <TextField
            label="상위 카테고리"
            value={form.parentCategory ?? ""}
            onChange={(event) => onChange("parentCategory", event.target.value)}
            placeholder="예: 기계/설비"
          />

          <TextField
            label="규격"
            value={form.spec ?? ""}
            onChange={(event) => onChange("spec", event.target.value)}
            placeholder="예: 250ml, 50kg, 1200x800"
          />

          <SelectField
            label="단위"
            required
            options={unitOptions}
            value={form.unit ?? ""}
            onChange={(event) => onChange("unit", event.target.value)}
          />

          <TextField
            label="기준 단가(₩)"
            type="number"
            min="0"
            value={form.unitPrice ?? ""}
            onChange={(event) => onChange("unitPrice", event.target.value)}
            placeholder="예: 10000"
          />

          <TextField
            label="원산지"
            value={form.origin ?? ""}
            onChange={(event) => onChange("origin", event.target.value)}
            placeholder="예: 대한민국"
          />

          <TextField
            label="납품 조건"
            value={form.deliveryCondition ?? ""}
            onChange={(event) =>
              onChange("deliveryCondition", event.target.value)
            }
            placeholder="예: 발주 후 3일 이내"
          />

          <fieldset>
            <FieldLabel>경쟁 제품 여부</FieldLabel>

            <div className="flex h-9 items-center gap-4 text-[14px] text-slate-600">
              <label className="flex items-center gap-1.5">
                <input
                  type="radio"
                  name="competingProduct"
                  checked={form.competingProduct === "Y"}
                  onChange={() => onChange("competingProduct", "Y")}
                  className="accent-blue-600"
                />
                Y
              </label>

              <label className="flex items-center gap-1.5">
                <input
                  type="radio"
                  name="competingProduct"
                  checked={form.competingProduct !== "Y"}
                  onChange={() => onChange("competingProduct", "N")}
                  className="accent-blue-600"
                />
                N
              </label>
            </div>
          </fieldset>

          <TextField
            label="유효 시작일"
            type="date"
            value={form.validStartDate ?? ""}
            onChange={(event) => onChange("validStartDate", event.target.value)}
          />

          <TextField
            label="유효 종료일"
            type="date"
            value={form.validEndDate ?? ""}
            onChange={(event) => onChange("validEndDate", event.target.value)}
          />

          {isEditMode && (
            <fieldset>
              <FieldLabel>사용 여부</FieldLabel>

              <div className="flex h-9 items-center gap-4 text-[14px] text-slate-600">
                <label className="flex items-center gap-1.5">
                  <input
                    type="radio"
                    name="isActive"
                    checked={form.isActive === true}
                    onChange={() => onChange("isActive", true)}
                    className="accent-blue-600"
                  />
                  사용
                </label>

                <label className="flex items-center gap-1.5">
                  <input
                    type="radio"
                    name="isActive"
                    checked={form.isActive !== true}
                    onChange={() => onChange("isActive", false)}
                    className="accent-blue-600"
                  />
                  미사용
                </label>
              </div>
            </fieldset>
          )}

          <TextAreaField
            label="품목 설명"
            value={form.description}
            onChange={(event) => onChange("description", event.target.value)}
            placeholder="상세 규격이나 보관 주의사항 등을 입력하세요"
            rows={4}
          />
        </div>
      </div>
    </section>
  )
}

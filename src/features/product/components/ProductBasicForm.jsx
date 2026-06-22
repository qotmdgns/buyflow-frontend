import {
  productCategoryOptions,
  productUnitOptions,
} from "@/features/product/data/productCreateOptions"

const INPUT_CLASS_NAME =
  "h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-[14px] text-slate-600 outline-none transition placeholder:text-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"

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

function SelectField({ label, options, value, onChange }) {
  return (
    <label>
      <FieldLabel>{label}</FieldLabel>

      <select value={value} onChange={onChange} className={INPUT_CLASS_NAME}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export default function ProductBasicForm({ form, onChange }) {
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
            value={form.code}
            onChange={(event) => onChange("code", event.target.value)}
            placeholder="자동 생성 또는 직접 입력"
          />

          <TextField
            label="품목명"
            required
            value={form.name}
            onChange={(event) => onChange("name", event.target.value)}
            placeholder="상품 또는 자재 명칭"
          />

          <SelectField
            label="카테고리"
            options={productCategoryOptions}
            value={form.category}
            onChange={(event) => onChange("category", event.target.value)}
          />

          <TextField
            label="규격"
            value={form.spec}
            onChange={(event) => onChange("spec", event.target.value)}
            placeholder="예: 250ml, 50kg, 1200x800"
          />

          <SelectField
            label="단위"
            options={productUnitOptions}
            value={form.unit}
            onChange={(event) => onChange("unit", event.target.value)}
          />

          <TextField
            label="기준 단가(₩)"
            type="number"
            min="0"
            value={form.unitPrice}
            onChange={(event) => onChange("unitPrice", event.target.value)}
          />

          <TextField
            label="제조사"
            value={form.manufacturer}
            onChange={(event) => onChange("manufacturer", event.target.value)}
            placeholder="공급업체 또는 제조원"
          />

          <fieldset>
            <FieldLabel>사용 여부</FieldLabel>

            <div className="flex h-9 items-center gap-4 text-[14px] text-slate-600">
              <label className="flex items-center gap-1.5">
                <input
                  type="radio"
                  name="isActive"
                  checked={form.isActive}
                  onChange={() => onChange("isActive", true)}
                  className="accent-blue-600"
                />
                사용
              </label>

              <label className="flex items-center gap-1.5">
                <input
                  type="radio"
                  name="isActive"
                  checked={!form.isActive}
                  onChange={() => onChange("isActive", false)}
                  className="accent-blue-600"
                />
                미사용
              </label>
            </div>
          </fieldset>

          <label className="md:col-span-2">
            <FieldLabel>품목 설명</FieldLabel>

            <textarea
              value={form.description}
              onChange={(event) => onChange("description", event.target.value)}
              placeholder="상세 규격이나 보관 주의사항 등을 입력하세요"
              rows={4}
              className="w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-2 text-[14px] text-slate-600 outline-none transition placeholder:text-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </label>
        </div>
      </div>
    </section>
  )
}

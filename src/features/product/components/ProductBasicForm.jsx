import Image from "next/image"
import { ImageUp, X } from "lucide-react"
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

function ProductImageField({ imageFile, imagePreviewUrl, onChange, onRemove }) {
  return (
    <div>
      <FieldLabel>품목 이미지</FieldLabel>

      <label className="flex min-h-[235px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/40 px-4 text-center transition hover:border-blue-300 hover:bg-blue-50/40">
        <input
          type="file"
          accept="image/png,image/jpeg"
          onChange={onChange}
          className="hidden"
        />

        {imagePreviewUrl ? (
          <>
            <Image
              src={imagePreviewUrl}
              alt="선택한 품목 이미지 미리보기"
              width={144}
              height={144}
              unoptimized
              className="h-36 w-36 rounded-md object-cover"
            />

            <span className="mt-3 max-w-full truncate text-[10px] text-slate-500">
              {imageFile?.name}
            </span>
          </>
        ) : (
          <>
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm">
              <ImageUp size={21} />
            </span>

            <strong className="mt-3 text-[11px] text-slate-600">
              이미지 업로드
            </strong>

            <span className="mt-1 text-[10px] leading-4 text-slate-400">
              PNG, JPG 파일
              <br />
              (최대 5MB)
            </span>

            <span className="mt-3 rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-500">
              파일 탐색기 열기
            </span>
          </>
        )}
      </label>

      {imagePreviewUrl && (
        <button
          type="button"
          onClick={onRemove}
          className="mt-2 flex items-center gap-1 text-[10px] font-medium text-rose-500 hover:underline"
        >
          <X size={12} />
          이미지 삭제
        </button>
      )}
    </div>
  )
}

export default function ProductBasicForm({
  form,
  imageFile,
  imagePreviewUrl,
  onChange,
  onImageChange,
  onImageRemove,
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="border-l-[3px] border-blue-500 pl-2 text-[15px] font-bold text-slate-800">
        품목 기본정보
      </h2>

      <div className="mt-3 grid gap-3 xl:grid-cols-[1fr_255px]">
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

          <TextField
            label="바코드 (EAN-13)"
            value={form.barcode}
            onChange={(event) => onChange("barcode", event.target.value)}
            placeholder="8801234567890"
          />

          <TextField
            label="기본 안전재고"
            type="number"
            min="0"
            value={form.safetyStock}
            onChange={(event) => onChange("safetyStock", event.target.value)}
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

        <ProductImageField
          imageFile={imageFile}
          imagePreviewUrl={imagePreviewUrl}
          onChange={onImageChange}
          onRemove={onImageRemove}
        />
      </div>
    </section>
  )
}

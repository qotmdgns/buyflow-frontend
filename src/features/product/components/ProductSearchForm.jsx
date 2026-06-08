import { RefreshCcw, Search } from "lucide-react"

const INPUT_CLASS_NAME =
  "h-9 w-full rounded-md border border-slate-200 px-3 text-[11px] outline-none transition placeholder:text-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"

function FieldLabel({ children }) {
  return (
    <span className="mb-1.5 block text-[10px] font-semibold text-slate-600">
      {children}
    </span>
  )
}

function SelectField({ value, options, onChange }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`${INPUT_CLASS_NAME} bg-white text-slate-600`}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  )
}

export default function ProductSearchForm({
  filters,
  filterOptions,
  onChange,
  onSearch,
  onReset,
}) {
  return (
    <form
      onSubmit={onSearch}
      className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label>
          <FieldLabel>품목 코드</FieldLabel>

          <input
            value={filters.itemCode}
            onChange={(event) => onChange("itemCode", event.target.value)}
            placeholder="코드를 입력하세요"
            className={INPUT_CLASS_NAME}
          />
        </label>

        <label>
          <FieldLabel>품목명</FieldLabel>

          <input
            value={filters.itemName}
            onChange={(event) => onChange("itemName", event.target.value)}
            placeholder="품목명을 입력하세요"
            className={INPUT_CLASS_NAME}
          />
        </label>

        <label>
          <FieldLabel>카테고리</FieldLabel>

          <SelectField
            value={filters.category}
            options={filterOptions.categories}
            onChange={(event) => onChange("category", event.target.value)}
          />
        </label>

        <label>
          <FieldLabel>사용 여부</FieldLabel>

          <SelectField
            value={filters.activeStatus}
            options={filterOptions.activeStatuses}
            onChange={(event) => onChange("activeStatus", event.target.value)}
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap items-end gap-4">
          <label className="w-[220px] max-w-full">
            <FieldLabel>단위</FieldLabel>

            <SelectField
              value={filters.unit}
              options={filterOptions.units}
              onChange={(event) => onChange("unit", event.target.value)}
            />
          </label>

          <label className="mb-2 flex items-center gap-2 text-[11px] text-slate-600">
            <input
              type="checkbox"
              checked={filters.lowStockOnly}
              onChange={(event) =>
                onChange("lowStockOnly", event.target.checked)
              }
              className="h-3.5 w-3.5 rounded border-slate-300 accent-blue-600"
            />
            안전재고 이하만 보기
          </label>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onReset}
            className="flex h-9 items-center gap-1 rounded-md border border-slate-200 px-3 text-[11px] font-semibold text-slate-500 transition hover:bg-slate-50"
          >
            <RefreshCcw size={13} />
            초기화
          </button>

          <button
            type="submit"
            className="flex h-9 items-center gap-1 rounded-md bg-blue-600 px-4 text-[11px] font-semibold text-white transition hover:bg-blue-700"
          >
            <Search size={13} />
            검색
          </button>
        </div>
      </div>
    </form>
  )
}

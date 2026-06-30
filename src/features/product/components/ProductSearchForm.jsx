import { RefreshCcw, Search } from "lucide-react"

const INPUT_CLASS_NAME = "bf-input"

function FieldLabel({ children }) {
  return <span className="bf-field-label">{children}</span>
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
    <form onSubmit={onSearch} className="bf-search-panel">
      <div className="grid gap-x-3 gap-y-2.5 md:grid-cols-2 xl:grid-cols-4">
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
          <FieldLabel>단위</FieldLabel>

          <SelectField
            value={filters.unit}
            options={filterOptions.units}
            onChange={(event) => onChange("unit", event.target.value)}
          />
        </label>
      </div>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <label className="w-[220px] max-w-full">
            <FieldLabel>사용 여부</FieldLabel>

            <SelectField
              value={filters.activeStatus}
              options={filterOptions.activeStatuses}
              onChange={(event) => onChange("activeStatus", event.target.value)}
            />
          </label>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onReset}
            className="bf-btn bf-btn-secondary"
          >
            <RefreshCcw size={13} />
            초기화
          </button>

          <button type="submit" className="bf-btn bf-btn-primary">
            <Search size={13} />
            검색
          </button>
        </div>
      </div>
    </form>
  )
}

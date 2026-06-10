import { RefreshCcw, Search } from "lucide-react"

const INPUT_CLASS_NAME =
  "h-10 w-full rounded-md border border-slate-200 px-3 text-[14px] text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"

function FieldLabel({ children }) {
  return (
    <span className="mb-1 block text-[13px] font-semibold text-slate-600">
      {children}
    </span>
  )
}

function SelectField({ value, options, onChange }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`${INPUT_CLASS_NAME} bg-white`}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  )
}

export default function WarehouseSearchForm({
  filters,
  filterOptions,
  onChange,
  onSearch,
  onReset,
}) {
  return (
    <form
      onSubmit={onSearch}
      className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
    >
      <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2 text-[14px] font-semibold text-slate-700">
        <Search size={15} className="text-slate-500" />
        검색 필터
      </div>

      <div className="mt-3 grid gap-x-3 gap-y-2.5 md:grid-cols-2 xl:grid-cols-4">
        <label>
          <FieldLabel>창고 유형</FieldLabel>

          <SelectField
            value={filters.type}
            options={filterOptions.warehouseTypes}
            onChange={(event) => onChange("type", event.target.value)}
          />
        </label>

        <label>
          <FieldLabel>창고명</FieldLabel>

          <input
            value={filters.warehouseName}
            onChange={(event) => onChange("warehouseName", event.target.value)}
            placeholder="창고명 입력"
            className={INPUT_CLASS_NAME}
          />
        </label>

        <label>
          <FieldLabel>담당자</FieldLabel>

          <input
            value={filters.manager}
            onChange={(event) => onChange("manager", event.target.value)}
            placeholder="성명 입력"
            className={INPUT_CLASS_NAME}
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

      <div className="mt-3 flex justify-end gap-2 border-t border-slate-100 pt-3">
        <button
          type="button"
          onClick={onReset}
          className="flex h-10 items-center gap-1.5 rounded-md border border-slate-200 px-4 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          <RefreshCcw size={15} />
          초기화
        </button>

        <button
          type="submit"
          className="flex h-10 items-center gap-1.5 rounded-md bg-blue-600 px-5 text-[13px] font-semibold text-white transition hover:bg-blue-700"
        >
          <Search size={15} />
          검색
        </button>
      </div>
    </form>
  )
}

import { RefreshCcw, Search } from "lucide-react"

const INPUT_CLASS_NAME = "bf-input"

function FieldLabel({ children }) {
  return <span className="bf-field-label">{children}</span>
}

function SelectField({ value, options = [], onChange }) {
  const safeOptions =
    Array.isArray(options) && options.length > 0
      ? options
      : [value].filter(Boolean)

  return (
    <select value={value} onChange={onChange} className={INPUT_CLASS_NAME}>
      {safeOptions.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  )
}

function DateRangeField({ from, to, onFromChange, onToChange }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_10px_minmax(0,1fr)] items-center gap-1">
      <input
        type="date"
        value={from}
        onChange={(event) => onFromChange(event.target.value)}
        className={`${INPUT_CLASS_NAME} px-2`}
      />

      <span className="text-center text-[13px] text-slate-300">-</span>

      <input
        type="date"
        value={to}
        onChange={(event) => onToChange(event.target.value)}
        className={`${INPUT_CLASS_NAME} px-2`}
      />
    </div>
  )
}

export default function InspectionSearchForm({
  filters,
  filterOptions,
  onChange,
  onSearch,
  onReset,
  inspectionNumberLabel = "검수 대기 번호",
}) {
  return (
    <form onSubmit={onSearch} className="bf-search-panel">
      <div className="grid gap-x-3 gap-y-2.5 md:grid-cols-2 xl:grid-cols-4">
        <label>
          <FieldLabel>{inspectionNumberLabel}</FieldLabel>

          <input
            value={filters.inspectionNumber}
            onChange={(event) =>
              onChange("inspectionNumber", event.target.value)
            }
            placeholder="IQC-YYYY-XXXX"
            className={INPUT_CLASS_NAME}
          />
        </label>

        <label>
          <FieldLabel>입고 번호</FieldLabel>

          <input
            value={filters.receiptNumber}
            onChange={(event) => onChange("receiptNumber", event.target.value)}
            placeholder="IN-YYYY-XXXX"
            className={INPUT_CLASS_NAME}
          />
        </label>

        <label>
          <FieldLabel>발주 번호</FieldLabel>

          <input
            value={filters.orderNumber}
            onChange={(event) => onChange("orderNumber", event.target.value)}
            placeholder="PO-YYYY-XXXX"
            className={INPUT_CLASS_NAME}
          />
        </label>

        <label>
          <FieldLabel>공급업체</FieldLabel>

          <SelectField
            value={filters.supplierName}
            options={filterOptions.suppliers}
            onChange={(event) => onChange("supplierName", event.target.value)}
          />
        </label>

        <label>
          <FieldLabel>입고 창고</FieldLabel>

          <SelectField
            value={filters.warehouseName}
            options={filterOptions.warehouses}
            onChange={(event) => onChange("warehouseName", event.target.value)}
          />
        </label>

        <label>
          <FieldLabel>우선순위</FieldLabel>

          <SelectField
            value={filters.priority}
            options={filterOptions.priorities}
            onChange={(event) => onChange("priority", event.target.value)}
          />
        </label>

        <label className="xl:col-span-2">
          <FieldLabel>입고일</FieldLabel>

          <DateRangeField
            from={filters.receivedFrom || ""}
            to={filters.receivedTo || ""}
            onFromChange={(value) => onChange("receivedFrom", value)}
            onToChange={(value) => onChange("receivedTo", value)}
          />
        </label>
      </div>

      <div className="mt-3 flex justify-end gap-2 border-t border-slate-100 pt-3">
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
    </form>
  )
}

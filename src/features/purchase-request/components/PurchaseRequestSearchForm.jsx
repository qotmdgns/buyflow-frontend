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

function DateField({ value, onChange }) {
  return (
    <input
      type="date"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={INPUT_CLASS_NAME}
    />
  )
}

export default function PurchaseRequestSearchForm({
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
          <FieldLabel>요청 번호</FieldLabel>

          <input
            value={filters.requestNumber}
            onChange={(event) => onChange("requestNumber", event.target.value)}
            placeholder="PR-YYYY-XXXX"
            className={INPUT_CLASS_NAME}
          />
        </label>

        <label>
          <FieldLabel>요청 제목</FieldLabel>

          <input
            value={filters.title}
            onChange={(event) => onChange("title", event.target.value)}
            placeholder="제목 키워드 입력"
            className={INPUT_CLASS_NAME}
          />
        </label>

        <label>
          <FieldLabel>요청자</FieldLabel>

          <input
            value={filters.requester}
            onChange={(event) => onChange("requester", event.target.value)}
            placeholder="이름 입력"
            className={INPUT_CLASS_NAME}
          />
        </label>

        <label>
          <FieldLabel>요청 부서</FieldLabel>

          <SelectField
            value={filters.department}
            options={filterOptions.departments}
            onChange={(event) => onChange("department", event.target.value)}
          />
        </label>

        <label>
          <FieldLabel>요청 상태</FieldLabel>

          <SelectField
            value={filters.status}
            options={filterOptions.statuses}
            onChange={(event) => onChange("status", event.target.value)}
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

        <label>
          <FieldLabel>희망 입고일</FieldLabel>

          <DateField
            value={filters.desiredReceiptAt}
            onChange={(value) => onChange("desiredReceiptAt", value)}
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

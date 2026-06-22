import { RefreshCcw, Search } from "lucide-react"

const INPUT_CLASS_NAME =
  "h-10 w-full rounded-md border border-slate-200 px-3 text-[14px] text-slate-600 outline-none transition placeholder:text-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"

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

export default function PurchaseRequestSearchForm({
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
          <FieldLabel>요청일</FieldLabel>

          <DateRangeField
            from={filters.requestedFrom}
            to={filters.requestedTo}
            onFromChange={(value) => onChange("requestedFrom", value)}
            onToChange={(value) => onChange("requestedTo", value)}
          />
        </label>

        <label>
          <FieldLabel>희망 입고일</FieldLabel>

          <DateRangeField
            from={filters.desiredReceiptFrom}
            to={filters.desiredReceiptTo}
            onFromChange={(value) => onChange("desiredReceiptFrom", value)}
            onToChange={(value) => onChange("desiredReceiptTo", value)}
          />
        </label>
      </div>

      <div className="mt-3 flex justify-end gap-2 border-t border-slate-100 pt-3">
        <button
          type="button"
          onClick={onReset}
          className="flex h-10 items-center gap-1.5 rounded-md border border-slate-200 px-4 text-[13px] font-semibold text-slate-500 transition hover:bg-slate-50"
        >
          <RefreshCcw size={13} />
          초기화
        </button>

        <button
          type="submit"
          className="flex h-10 items-center gap-1.5 rounded-md bg-blue-600 px-4 text-[13px] font-semibold text-white transition hover:bg-blue-700"
        >
          <Search size={13} />
          검색
        </button>
      </div>
    </form>
  )
}

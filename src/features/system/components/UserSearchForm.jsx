import { RefreshCcw, Search } from "lucide-react"

const INPUT_CLASS_NAME = "bf-input"

export default function UserSearchForm({
  filters,
  filterOptions,
  onChange,
  onSearch,
  onReset,
}) {
  return (
    <form onSubmit={onSearch} className="bf-search-panel">
      <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2 text-[14px] font-semibold text-slate-700">
        <Search size={15} />
        검색 필터
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <select
          value={filters.department}
          onChange={(event) => onChange("department", event.target.value)}
          className={INPUT_CLASS_NAME}
        >
          {filterOptions.departments.map((department) => (
            <option key={department}>{department}</option>
          ))}
        </select>

        <select
          value={filters.roleId}
          onChange={(event) => onChange("roleId", event.target.value)}
          className={INPUT_CLASS_NAME}
        >
          <option value="전체">전체 권한 그룹</option>

          {filterOptions.roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>

        <input
          value={filters.keyword}
          onChange={(event) => onChange("keyword", event.target.value)}
          placeholder="이름, 사번 또는 이메일"
          className={INPUT_CLASS_NAME}
        />

        <select
          value={filters.activeStatus}
          onChange={(event) => onChange("activeStatus", event.target.value)}
          className={INPUT_CLASS_NAME}
        >
          {filterOptions.activeStatuses.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
      </div>

      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={onReset}
          className="bf-btn bf-btn-secondary"
        >
          <RefreshCcw size={15} />
          초기화
        </button>

        <button className="bf-btn bf-btn-primary">
          <Search size={15} />
          검색
        </button>
      </div>
    </form>
  )
}

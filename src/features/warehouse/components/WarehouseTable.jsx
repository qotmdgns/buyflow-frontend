import { WAREHOUSE_TABLE_HEADERS } from "@/features/warehouse/utils/warehouseManagementUtils"

function StatusBadge({ status }) {
  const isActive = status === "사용 중"

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[12px] font-medium ${
        isActive ? "bg-slate-100 text-slate-600" : "bg-slate-50 text-slate-400"
      }`}
    >
      {status}
    </span>
  )
}

function TableMessage({ children, isError = false }) {
  return (
    <tr>
      <td
        colSpan={WAREHOUSE_TABLE_HEADERS.length}
        className={`h-52 text-center text-[14px] ${
          isError ? "text-rose-500" : "text-slate-400"
        }`}
      >
        {children}
      </td>
    </tr>
  )
}

function WarehouseRow({ warehouse, onDetail }) {
  function openDetail() {
    onDetail(warehouse)
  }

  function handleRowKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      openDetail()
    }
  }

  return (
    <tr
      role="button"
      tabIndex={0}
      aria-label={`${warehouse.name} 창고 상세 정보 보기`}
      onClick={openDetail}
      onKeyDown={handleRowKeyDown}
      className="cursor-pointer border-t border-slate-100 text-slate-600 transition hover:bg-blue-50/40 focus:bg-blue-50/40 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-200"
    >
      <td className="whitespace-nowrap px-3 py-2.5 font-semibold text-slate-700">
        {warehouse.type}
      </td>

      <td className="min-w-[150px] px-3 py-2.5 font-semibold text-slate-700">
        {warehouse.name}
      </td>

      <td className="whitespace-nowrap px-3 py-2.5 text-slate-600">
        {warehouse.zipcode || "-"}
      </td>

      <td className="min-w-[250px] px-3 py-2.5 text-slate-600">
        {warehouse.baseAddress || warehouse.address || "-"}
      </td>

      <td className="min-w-[180px] px-3 py-2.5 text-slate-600">
        {warehouse.detailAddress || "-"}
      </td>

      <td className="whitespace-nowrap px-3 py-2.5">
        <StatusBadge status={warehouse.activeStatus} />
      </td>

      <td className="whitespace-nowrap px-3 py-2.5">
        {warehouse.manager || warehouse.managerName || "-"}
      </td>

      <td className="whitespace-nowrap px-3 py-2.5 text-slate-600">
        {warehouse.phone}
      </td>

      <td className="whitespace-nowrap px-3 py-2.5 text-slate-600">
        {warehouse.registeredAt}
      </td>

      <td className="whitespace-nowrap px-3 py-2.5 text-slate-600">
        {warehouse.updatedAt}
      </td>
    </tr>
  )
}

export default function WarehouseTable({
  warehouses,
  loading,
  error,
  onDetail,
}) {
  function renderTableBody() {
    if (loading) {
      return <TableMessage>창고 목록을 불러오는 중입니다.</TableMessage>
    }

    if (error) {
      return <TableMessage isError>{error}</TableMessage>
    }

    if (warehouses.length === 0) {
      return <TableMessage>검색 조건에 해당하는 창고가 없습니다.</TableMessage>
    }

    return warehouses.map((warehouse) => (
      <WarehouseRow
        key={warehouse.id}
        warehouse={warehouse}
        onDetail={onDetail}
      />
    ))
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1200px] text-left text-[13px]">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            {WAREHOUSE_TABLE_HEADERS.map((heading) => (
              <th
                key={heading}
                className="whitespace-nowrap px-3 py-3 font-semibold"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>{renderTableBody()}</tbody>
      </table>
    </div>
  )
}

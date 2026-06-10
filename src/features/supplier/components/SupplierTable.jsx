import { SUPPLIER_TABLE_HEADERS } from "@/features/supplier/utils/supplierManagementUtils"

function StatusBadge({ status }) {
  const isActive = status === "거래중"

  return (
    <span
      className={`inline-flex rounded-full px-2 py-1 text-[9px] font-medium ${
        isActive ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-500"
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
        colSpan={10}
        className={`h-64 text-center text-[11px] ${
          isError ? "text-rose-500" : "text-slate-400"
        }`}
      >
        {children}
      </td>
    </tr>
  )
}

function SupplierRow({ supplier, onDetail, onEdit }) {
  return (
    <tr className="border-t border-slate-100 text-slate-600 hover:bg-slate-50/60">
      <td className="whitespace-nowrap px-3 py-3 font-medium text-blue-600">
        {supplier.code}
      </td>

      <td className="min-w-[160px] px-3 py-3 font-semibold text-slate-700">
        {supplier.name}
      </td>

      <td className="whitespace-nowrap px-3 py-3 text-slate-500">
        {supplier.businessNumber}
      </td>

      <td className="whitespace-nowrap px-3 py-3">{supplier.manager}</td>

      <td className="whitespace-nowrap px-3 py-3 text-slate-500">
        {supplier.phone}
      </td>

      <td className="whitespace-nowrap px-3 py-3 text-slate-500">
        {supplier.email}
      </td>

      <td className="min-w-[220px] px-3 py-3 text-slate-500">
        {supplier.address}
      </td>

      <td className="whitespace-nowrap px-3 py-3">
        <StatusBadge status={supplier.tradeStatus} />
      </td>

      <td className="whitespace-nowrap px-3 py-3 text-slate-500">
        {supplier.registeredAt}
      </td>

      <td className="whitespace-nowrap px-3 py-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onDetail(supplier)}
            className="text-[10px] font-medium text-slate-500 hover:text-blue-600 hover:underline"
          >
            상세
          </button>

          <button
            type="button"
            onClick={() => onEdit(supplier)}
            className="text-[10px] font-medium text-slate-500 hover:text-blue-600 hover:underline"
          >
            수정
          </button>
        </div>
      </td>
    </tr>
  )
}

export default function SupplierTable({
  suppliers,
  loading,
  error,
  onDetail,
  onEdit,
}) {
  function renderTableBody() {
    if (loading) {
      return <TableMessage>공급업체 목록을 불러오는 중입니다.</TableMessage>
    }

    if (error) {
      return <TableMessage isError>{error}</TableMessage>
    }

    if (suppliers.length === 0) {
      return (
        <TableMessage>검색 조건에 해당하는 공급업체가 없습니다.</TableMessage>
      )
    }

    return suppliers.map((supplier) => (
      <SupplierRow
        key={supplier.id}
        supplier={supplier}
        onDetail={onDetail}
        onEdit={onEdit}
      />
    ))
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1280px] text-left text-[10px]">
        <thead className="bg-slate-50 text-slate-500">
          <tr>
            {SUPPLIER_TABLE_HEADERS.map((heading) => (
              <th
                key={heading}
                className="whitespace-nowrap px-3 py-3 font-medium"
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

import { SUPPLIER_TABLE_HEADERS } from "@/features/supplier/utils/supplierManagementUtils"

function StatusBadge({ status }) {
  const isActive = status === "거래중"

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[12px] font-medium ${
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
        colSpan={9}
        className={`h-52 text-center text-[14px] ${
          isError ? "text-rose-500" : "text-slate-400"
        }`}
      >
        {children}
      </td>
    </tr>
  )
}

function SupplierRow({ supplier, onDetail }) {
  function openDetail() {
    onDetail(supplier)
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      openDetail()
    }
  }

  return (
    <tr
      role="button"
      tabIndex={0}
      aria-label={`${supplier.name} 공급업체 상세 정보 보기`}
      onClick={openDetail}
      onKeyDown={handleKeyDown}
      className="cursor-pointer border-t border-slate-100 text-slate-600 transition hover:bg-blue-50/40 focus:bg-blue-50/40 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-200"
    >
      <td className="whitespace-nowrap px-3 py-2.5 font-semibold text-blue-600">
        {supplier.code}
      </td>

      <td className="min-w-[145px] px-3 py-2.5 font-semibold text-slate-700">
        {supplier.name}
      </td>

      <td className="whitespace-nowrap px-3 py-2.5 text-slate-600">
        {supplier.businessNumber}
      </td>

      <td className="whitespace-nowrap px-3 py-2.5">{supplier.manager}</td>

      <td className="whitespace-nowrap px-3 py-2.5 text-slate-600">
        {supplier.phone}
      </td>

      <td className="whitespace-nowrap px-3 py-2.5 text-slate-600">
        {supplier.email}
      </td>

      <td className="min-w-[180px] px-3 py-2.5 text-slate-600">
        {supplier.address}
      </td>

      <td className="whitespace-nowrap px-3 py-2.5">
        <StatusBadge status={supplier.tradeStatus} />
      </td>

      <td className="whitespace-nowrap px-3 py-2.5 text-slate-600">
        {supplier.registeredAt}
      </td>
    </tr>
  )
}

export default function SupplierTable({ suppliers, loading, error, onDetail }) {
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
      <SupplierRow key={supplier.id} supplier={supplier} onDetail={onDetail} />
    ))
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1080px] text-left text-[13px]">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            {SUPPLIER_TABLE_HEADERS.map((heading) => (
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

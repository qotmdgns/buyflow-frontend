import {
  formatWon,
  PRODUCT_TABLE_HEADERS,
} from "@/features/product/utils/productManagementUtils"

function StatusBadge({ isActive }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[12px] font-semibold ${
        isActive
          ? "bg-emerald-50 text-emerald-600"
          : "bg-slate-100 text-slate-500"
      }`}
    >
      {isActive ? "사용" : "미사용"}
    </span>
  )
}

function TableMessage({ children, isError = false }) {
  return (
    <tr>
      <td
        colSpan={11}
        className={`h-52 text-center text-[14px] ${
          isError ? "text-rose-500" : "text-slate-400"
        }`}
      >
        {children}
      </td>
    </tr>
  )
}

function ProductRow({ product, isSelected, onToggle, onDetail, onEdit }) {
  function openDetail() {
    onDetail(product)
  }

  function handleRowKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      openDetail()
    }
  }

  function stopRowEvent(event) {
    event.stopPropagation()
  }

  function handleDetailClick(event) {
    event.stopPropagation()
    onDetail(product)
  }

  function handleEditClick(event) {
    event.stopPropagation()
    onEdit(product)
  }

  return (
    <tr
      role="button"
      tabIndex={0}
      aria-label={`${product.name} 품목 상세 정보 보기`}
      onClick={openDetail}
      onKeyDown={handleRowKeyDown}
      className="cursor-pointer border-t border-slate-100 text-slate-600 transition hover:bg-blue-50/40 focus:bg-blue-50/40 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-200"
    >
      <td className="px-4 py-2.5">
        <input
          type="checkbox"
          checked={isSelected}
          onClick={stopRowEvent}
          onKeyDown={stopRowEvent}
          onChange={() => onToggle(product.id)}
          className="h-3.5 w-3.5 accent-blue-600"
          aria-label={`${product.name} 선택`}
        />
      </td>

      <td className="whitespace-nowrap px-3 py-2.5 font-medium text-blue-600">
        {product.code}
      </td>

      <td className="px-3 py-2.5 font-medium text-slate-700">
        <div className="break-words" title={product.name ?? ""}>
          {product.name || "-"}
        </div>
      </td>

      <td className="whitespace-nowrap px-3 py-2.5">{product.category}</td>

      <td className="px-3 py-2.5 text-slate-500">
        <div className="truncate" title={product.spec ?? ""}>
          {product.spec || "-"}
        </div>
      </td>

      <td className="whitespace-nowrap px-3 py-2.5">{product.unit}</td>

      <td className="whitespace-nowrap px-3 py-2.5 font-medium text-slate-700">
        {formatWon(product.unitPrice)}
      </td>

      <td className="whitespace-nowrap px-3 py-2.5">
        <StatusBadge isActive={product.isActive} />
      </td>

      <td className="whitespace-nowrap px-3 py-2.5 text-slate-500">
        {product.registeredAt || "-"}
      </td>

      <td className="whitespace-nowrap px-3 py-2.5 text-slate-500">
        {product.updatedAt || "-"}
      </td>

      <td className="whitespace-nowrap px-3 py-2.5">
        <div
          className="flex items-center gap-2"
          onClick={stopRowEvent}
          onKeyDown={stopRowEvent}
        >
          <button
            type="button"
            onClick={handleDetailClick}
            className="text-[10px] font-medium text-blue-600 hover:underline"
          >
            상세
          </button>

          <button
            type="button"
            onClick={handleEditClick}
            className="text-[10px] font-medium text-slate-500 hover:text-blue-600 hover:underline"
          >
            수정
          </button>
        </div>
      </td>
    </tr>
  )
}

export default function ProductTable({
  products,
  loading,
  error,
  selectedIds,
  allCurrentRowsSelected,
  onToggleAll,
  onToggleRow,
  onDetail,
  onEdit,
}) {
  function renderTableBody() {
    if (loading) {
      return <TableMessage>품목 목록을 불러오는 중입니다.</TableMessage>
    }

    if (error) {
      return <TableMessage isError>{error}</TableMessage>
    }

    if (products.length === 0) {
      return <TableMessage>검색 조건에 해당하는 품목이 없습니다.</TableMessage>
    }

    return products.map((product) => (
      <ProductRow
        key={product.id}
        product={product}
        isSelected={selectedIds.has(product.id)}
        onToggle={onToggleRow}
        onDetail={onDetail}
        onEdit={onEdit}
      />
    ))
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1320px] table-fixed text-left text-[13px]">
        <colgroup>
          <col className="w-[44px]" />
          <col className="w-[95px]" />
          <col className="w-[220px]" />
          <col className="w-[135px]" />
          <col className="w-[360px]" />
          <col className="w-[70px]" />
          <col className="w-[120px]" />
          <col className="w-[90px]" />
          <col className="w-[120px]" />
          <col className="w-[150px]" />
          <col className="w-[80px]" />
        </colgroup>
        <thead className="bg-slate-50 text-slate-500">
          <tr>
            <th className="w-12 px-4 py-2.5">
              <input
                type="checkbox"
                checked={allCurrentRowsSelected}
                onChange={onToggleAll}
                className="h-3.5 w-3.5 accent-blue-600"
                aria-label="현재 페이지 전체 선택"
              />
            </th>

            {PRODUCT_TABLE_HEADERS.map((heading) => (
              <th
                key={heading}
                className="whitespace-nowrap px-3 py-2.5 font-semibold"
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

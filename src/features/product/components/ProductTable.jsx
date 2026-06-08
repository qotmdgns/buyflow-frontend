import {
  formatWon,
  PRODUCT_TABLE_HEADERS,
} from "@/features/product/utils/productManagementUtils"

function StatusBadge({ isActive }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-1 text-[9px] font-medium ${
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
        className={`h-64 text-center text-[11px] ${
          isError ? "text-rose-500" : "text-slate-400"
        }`}
      >
        {children}
      </td>
    </tr>
  )
}

function ProductRow({ product, isSelected, onToggle, onDetail, onEdit }) {
  const isLowStock = product.currentStock < product.safetyStock

  return (
    <tr className="border-t border-slate-100 text-slate-600 hover:bg-slate-50/60">
      <td className="px-4 py-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggle(product.id)}
          className="h-3.5 w-3.5 accent-blue-600"
          aria-label={`${product.name} 선택`}
        />
      </td>

      <td className="whitespace-nowrap px-3 py-3 font-medium text-blue-600">
        {product.code}
      </td>

      <td className="min-w-[180px] px-3 py-3 font-medium text-slate-700">
        {product.name}
      </td>

      <td className="whitespace-nowrap px-3 py-3">{product.category}</td>

      <td className="whitespace-nowrap px-3 py-3 text-slate-500">
        {product.spec}
      </td>

      <td className="whitespace-nowrap px-3 py-3">{product.unit}</td>

      <td className="whitespace-nowrap px-3 py-3 font-medium text-slate-700">
        {formatWon(product.unitPrice)}
      </td>

      <td
        className={`whitespace-nowrap px-3 py-3 font-semibold ${
          isLowStock ? "text-rose-500" : "text-slate-700"
        }`}
      >
        {product.safetyStock}
      </td>

      <td className="whitespace-nowrap px-3 py-3">
        <StatusBadge isActive={product.isActive} />
      </td>

      <td className="whitespace-nowrap px-3 py-3 text-slate-500">
        {product.registeredAt}
      </td>

      <td className="whitespace-nowrap px-3 py-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onDetail(product)}
            className="text-[10px] font-medium text-blue-600 hover:underline"
          >
            상세
          </button>

          <button
            type="button"
            onClick={() => onEdit(product)}
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
      <table className="w-full min-w-[1120px] text-left text-[10px]">
        <thead className="bg-slate-50 text-slate-500">
          <tr>
            <th className="w-12 px-4 py-3">
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

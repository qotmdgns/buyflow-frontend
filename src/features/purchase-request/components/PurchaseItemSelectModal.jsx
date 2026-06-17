import { Search, X } from "lucide-react"

function CategoryBadge({ children }) {
  return (
    <span className="rounded-full bg-slate-100 px-2 py-1 text-[12px] text-slate-500">
      {children}
    </span>
  )
}

export default function PurchaseItemSelectModal({
  products,
  selectedIds,
  keyword,
  category,
  categoryOptions,
  onKeywordChange,
  onCategoryChange,
  onSearch,
  onToggleProduct,
  onToggleAll,
  onClose,
  onConfirm,
}) {
  const allFilteredSelected =
    products.length > 0 &&
    products.every((product) => selectedIds.has(product.id))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 p-4">
      <section className="w-full max-w-[960px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
        <header className="flex items-center justify-between border-b border-slate-100 px-3 py-2.5">
          <h2 className="text-[15px] font-bold text-slate-800">
            품목 선택 (조회)
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="품목 선택 창 닫기"
            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={15} />
          </button>
        </header>

        <form
          onSubmit={onSearch}
          className="flex flex-wrap gap-2 border-b border-slate-100 p-3"
        >
          <label className="flex h-10 min-w-64 flex-1 items-center gap-2 rounded-md border border-slate-200 px-3">
            <Search size={13} className="text-slate-400" />

            <input
              value={keyword}
              onChange={(event) => onKeywordChange(event.target.value)}
              placeholder="품목 코드 또는 품목명 입력"
              className="w-full text-[14px] text-slate-600 outline-none placeholder:text-slate-300"
            />
          </label>

          <select
            value={category}
            onChange={(event) => onCategoryChange(event.target.value)}
            className="h-10 min-w-40 rounded-md border border-slate-200 bg-white px-3 text-[13px] text-slate-500 outline-none"
          >
            {(categoryOptions ?? ["전체 카테고리"]).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="h-10 rounded-md bg-slate-800 px-4 text-[13px] font-semibold text-white transition hover:bg-slate-900"
          >
            검색
          </button>
        </form>

        <div className="max-h-[360px] overflow-auto">
          <table className="w-full min-w-[760px] text-left text-[13px]">
            <thead className="sticky top-0 bg-slate-50 text-slate-500">
              <tr>
                <th className="w-12 px-4 py-2.5">
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    onChange={onToggleAll}
                    className="h-3.5 w-3.5 accent-blue-600"
                    aria-label="조회 품목 전체 선택"
                  />
                </th>

                {["품목 코드", "품목명", "카테고리", "규격", "현재 재고"].map(
                  (heading) => (
                    <th key={heading} className="px-3 py-2.5 font-semibold">
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>

            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="h-32 text-center text-slate-400">
                    검색 조건에 해당하는 품목이 없습니다.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-t border-slate-100 text-slate-600 hover:bg-slate-50/60"
                  >
                    <td className="px-4 py-2.5">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(product.id)}
                        onChange={() => onToggleProduct(product.id)}
                        className="h-3.5 w-3.5 accent-blue-600"
                        aria-label={`${product.name} 선택`}
                      />
                    </td>

                    <td className="whitespace-nowrap px-3 py-2.5 font-medium text-slate-500">
                      {product.code}
                    </td>

                    <td className="min-w-44 px-3 py-2.5 font-medium text-slate-700">
                      {product.name}
                    </td>

                    <td className="whitespace-nowrap px-3 py-2.5">
                      <CategoryBadge>{product.category}</CategoryBadge>
                    </td>

                    <td className="whitespace-nowrap px-3 py-2.5 text-slate-500">
                      {product.spec}
                    </td>

                    <td className="whitespace-nowrap px-3 py-2.5 text-right font-semibold text-slate-700">
                      {product.currentStock}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <footer className="flex items-center justify-between border-t border-slate-100 px-3 py-2.5">
          <p className="text-[13px] text-slate-500">
            선택한 품목:
            <strong className="ml-1 text-blue-600">{selectedIds.size}종</strong>
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-9 rounded-md border border-slate-200 px-3 text-[13px] font-semibold text-slate-500 transition hover:bg-slate-50"
            >
              취소
            </button>

            <button
              type="button"
              onClick={onConfirm}
              className="h-9 rounded-md bg-blue-600 px-3 text-[13px] font-semibold text-white transition hover:bg-blue-700"
            >
              선택 완료
            </button>
          </div>
        </footer>
      </section>
    </div>
  )
}

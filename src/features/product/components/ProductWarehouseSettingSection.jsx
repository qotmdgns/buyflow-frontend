import { CircleAlert, Plus, Trash2 } from "lucide-react"
import { warehouseOptions } from "@/features/product/data/productCreateOptions"

const INPUT_CLASS_NAME =
  "h-8 w-full rounded-md border border-slate-200 bg-white px-3 text-[10px] text-slate-600 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"

export default function ProductWarehouseSettingSection({
  settings,
  onAdd,
  onChange,
  onRemove,
}) {
  return (
    <section className="mt-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="border-l-[3px] border-blue-500 pl-2 text-[13px] font-bold text-slate-800">
          창고별 안전재고 설정
        </h2>

        <button
          type="button"
          onClick={onAdd}
          className="flex h-8 items-center gap-1 rounded-md border border-slate-200 bg-white px-3 text-[10px] font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          <Plus size={13} />
          창고별 기준 추가
        </button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-md border border-slate-200">
        <table className="w-full min-w-[760px] text-left text-[10px]">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-3 py-2.5 font-medium">창고명</th>

              <th className="px-3 py-2.5 font-medium">보관 위치 (Loc)</th>

              <th className="px-3 py-2.5 font-medium">안전재고</th>

              <th className="px-3 py-2.5 font-medium">재주문 기준</th>

              <th className="w-12 px-3 py-2.5 text-center font-medium">관리</th>
            </tr>
          </thead>

          <tbody>
            {settings.length === 0 ? (
              <tr>
                <td colSpan={5} className="h-20 text-center text-slate-400">
                  등록된 창고별 기준이 없습니다.
                </td>
              </tr>
            ) : (
              settings.map((setting) => (
                <tr key={setting.rowId} className="border-t border-slate-100">
                  <td className="px-3 py-2">
                    <select
                      value={setting.warehouseId}
                      onChange={(event) =>
                        onChange(
                          setting.rowId,
                          "warehouseId",
                          event.target.value,
                        )
                      }
                      className={INPUT_CLASS_NAME}
                    >
                      {warehouseOptions.map((warehouse) => (
                        <option key={warehouse.value} value={warehouse.value}>
                          {warehouse.label}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="px-3 py-2">
                    <input
                      value={setting.locationCode}
                      onChange={(event) =>
                        onChange(
                          setting.rowId,
                          "locationCode",
                          event.target.value,
                        )
                      }
                      placeholder="예: A-12-04"
                      className={INPUT_CLASS_NAME}
                    />
                  </td>

                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min="0"
                      value={setting.safetyStock}
                      onChange={(event) =>
                        onChange(
                          setting.rowId,
                          "safetyStock",
                          event.target.value,
                        )
                      }
                      className={`${INPUT_CLASS_NAME} text-right`}
                    />
                  </td>

                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min="0"
                      value={setting.reorderPoint}
                      onChange={(event) =>
                        onChange(
                          setting.rowId,
                          "reorderPoint",
                          event.target.value,
                        )
                      }
                      className={`${INPUT_CLASS_NAME} text-right`}
                    />
                  </td>

                  <td className="px-3 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => onRemove(setting.rowId)}
                      aria-label="창고별 기준 삭제"
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-md border border-blue-100 bg-blue-50/60 px-3 py-2 text-[10px] text-slate-500">
        <CircleAlert size={13} className="shrink-0 text-blue-500" />
        창고별로 설정한 안전재고는 기본 안전재고 설정값보다 우선하여 적용됩니다.
        재주문 기준 수량 도달 시 시스템 알림이 발생합니다.
      </div>
    </section>
  )
}

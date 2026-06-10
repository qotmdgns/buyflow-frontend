import Link from "next/link"
import { MoreHorizontal } from "lucide-react"
import {
  formatWon,
  PURCHASE_REQUEST_TABLE_HEADERS,
} from "@/features/purchase-request/utils/purchaseRequestManagementUtils"

const statusStyles = {
  "임시 저장": "border-slate-200 bg-slate-50 text-slate-500",
  "승인 대기": "border-slate-200 bg-white text-slate-600",
  "승인 완료": "border-blue-200 bg-blue-50 text-blue-600",
  반려: "border-rose-200 bg-rose-50 text-rose-500",
  "발주 완료": "border-slate-200 bg-slate-50 text-slate-700",
}

function PriorityBadge({ priority }) {
  const isUrgent = priority === "긴급"

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[12px] font-semibold ${
        isUrgent
          ? "border-rose-200 bg-rose-50 text-rose-500"
          : "border-slate-200 bg-white text-slate-500"
      }`}
    >
      {priority}
    </span>
  )
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[12px] font-semibold ${
        statusStyles[status] ?? "border-slate-200 bg-slate-50 text-slate-500"
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
        colSpan={12}
        className={`h-52 text-center text-[14px] ${
          isError ? "text-rose-500" : "text-slate-400"
        }`}
      >
        {children}
      </td>
    </tr>
  )
}

export default function PurchaseRequestTable({
  requests,
  loading,
  error,
  selectedIds,
  allCurrentRowsSelected,
  onToggleAll,
  onToggleRow,
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1400px] text-left text-[13px]">
        <thead className="bg-slate-50 text-slate-500">
          <tr>
            <th className="w-10 px-3 py-2.5">
              <input
                type="checkbox"
                checked={allCurrentRowsSelected}
                onChange={onToggleAll}
                className="h-3.5 w-3.5 accent-blue-600"
                aria-label="현재 페이지 구매 요청 전체 선택"
              />
            </th>

            {PURCHASE_REQUEST_TABLE_HEADERS.map((heading) => (
              <th
                key={heading}
                className="whitespace-nowrap px-3 py-2.5 font-medium"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {loading && (
            <TableMessage>구매 요청 목록을 불러오는 중입니다.</TableMessage>
          )}

          {!loading && error && <TableMessage isError>{error}</TableMessage>}

          {!loading && !error && requests.length === 0 && (
            <TableMessage>
              검색 조건에 해당하는 구매 요청이 없습니다.
            </TableMessage>
          )}

          {!loading &&
            !error &&
            requests.map((request) => (
              <tr
                key={request.id}
                className="border-t border-slate-100 text-slate-600 hover:bg-slate-50/60"
              >
                <td className="px-4 py-2.5">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(request.id)}
                    onChange={() => onToggleRow(request.id)}
                    className="h-3.5 w-3.5 accent-blue-600"
                    aria-label={`${request.requestNumber} 선택`}
                  />
                </td>

                <td className="whitespace-nowrap px-3 py-2.5 font-semibold text-blue-600">
                  <Link
                    href={`/purchase-requests/${request.id}`}
                    className="hover:underline"
                  >
                    {request.requestNumber}
                  </Link>
                </td>

                <td className="min-w-[210px] px-3 py-2.5 font-medium text-slate-700">
                  {request.title}
                </td>

                <td className="whitespace-nowrap px-3 py-2.5">
                  {request.requester}
                </td>

                <td className="whitespace-nowrap px-3 py-2.5 text-slate-500">
                  {request.department}
                </td>

                <td className="whitespace-nowrap px-3 py-2.5">
                  {request.requestedAt}
                </td>

                <td className="whitespace-nowrap px-3 py-2.5">
                  {request.desiredInboundAt}
                </td>

                <td className="whitespace-nowrap px-3 py-2.5 text-right">
                  {request.itemCount}건
                </td>

                <td className="whitespace-nowrap px-3 py-2.5 text-right font-semibold text-slate-700">
                  {formatWon(request.totalAmount)}
                </td>

                <td className="whitespace-nowrap px-3 py-2.5">
                  <PriorityBadge priority={request.priority} />
                </td>

                <td className="whitespace-nowrap px-3 py-2.5">
                  <StatusBadge status={request.status} />
                </td>

                <td className="px-3 py-2.5 text-slate-400">
                  <button
                    type="button"
                    onClick={() =>
                      window.alert(
                        `${request.requestNumber} 관리 메뉴는 추후 연결합니다.`,
                      )
                    }
                    className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-slate-100 hover:text-slate-700"
                    aria-label={`${request.requestNumber} 관리 메뉴`}
                  >
                    <MoreHorizontal size={14} />
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}

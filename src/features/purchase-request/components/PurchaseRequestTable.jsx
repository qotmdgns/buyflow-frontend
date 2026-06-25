"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"

import {
  formatWon,
  PURCHASE_REQUEST_TABLE_HEADERS,
} from "@/features/purchase-request/utils/purchaseRequestManagementUtils"

const statusStyles = {
  "승인 대기": "border-slate-200 bg-white text-slate-600",
  "승인 완료": "border-blue-200 bg-blue-50 text-blue-600",
  반려: "border-rose-200 bg-rose-50 text-rose-500",
  "발주 완료": "border-slate-200 bg-slate-50 text-slate-700",
  "요청 취소": "border-slate-200 bg-slate-100 text-slate-500",
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
        colSpan={13}
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
  onDeleteRequest,
}) {
  const router = useRouter()

  function moveToDetail(requestId) {
    router.push(`/purchase-requests/${requestId}`)
  }

  function handleRowClick(event, requestId) {
    const interactiveElement = event.target.closest?.(
      "a, button, input, label, select, textarea",
    )

    // 체크박스, 링크, 버튼 등 별도 기능이 있는 영역은
    // 행 클릭 이동 대상에서 제외합니다.
    if (interactiveElement) {
      return
    }

    moveToDetail(requestId)
  }

  function handleRowKeyDown(event, requestId) {
    // 행 내부의 체크박스나 버튼에서 발생한 키보드 이벤트는 제외합니다.
    if (event.target !== event.currentTarget) {
      return
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      moveToDetail(requestId)
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1550px] text-left text-[13px]">
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
            requests.map((request) => {
              const canEdit = request.status === "승인 대기"
              const canDelete = request.status === "승인 대기"

              return (
                <tr
                  key={request.id}
                  role="link"
                  tabIndex={0}
                  aria-label={`${request.requestNumber} 구매 요청 상세 화면으로 이동`}
                  onClick={(event) => handleRowClick(event, request.id)}
                  onKeyDown={(event) => handleRowKeyDown(event, request.id)}
                  className="cursor-pointer border-t border-slate-100 text-slate-600 transition hover:bg-blue-50/40 focus:bg-blue-50/40 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-200"
                >
                  <td className="px-4 py-2.5">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(request.id)}
                      onChange={() => onToggleRow(request.id)}
                      onClick={(event) => event.stopPropagation()}
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
                    {request.requestedAt || request.createdAt || "-"}
                  </td>

                  <td className="whitespace-nowrap px-3 py-2.5">
                    {request.updatedAt || "-"}
                  </td>

                  <td className="whitespace-nowrap px-3 py-2.5">
                    {request.desiredReceiptAt}
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

                  <td className="px-3 py-2.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {canEdit && (
                        <Link
                          href={`/purchase-requests/${request.id}/edit`}
                          onClick={(event) => event.stopPropagation()}
                          className="whitespace-nowrap rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[12px] font-semibold text-slate-600 transition hover:bg-slate-50"
                          aria-label={`${request.requestNumber} 수정`}
                        >
                          수정
                        </Link>
                      )}

                      {canDelete && (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            onDeleteRequest?.(request)
                          }}
                          className="whitespace-nowrap rounded-md border border-rose-200 bg-white px-2.5 py-1.5 text-[12px] font-semibold text-rose-500 transition hover:bg-rose-50"
                          aria-label={`${request.requestNumber} 삭제`}
                        >
                          삭제
                        </button>
                      )}

                      {!canEdit && !canDelete && (
                        <span className="text-[12px] text-slate-300">-</span>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
        </tbody>
      </table>
    </div>
  )
}

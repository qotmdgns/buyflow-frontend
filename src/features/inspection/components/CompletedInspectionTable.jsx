"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye } from "lucide-react"

import {
  COMPLETED_INSPECTION_TABLE_HEADERS,
  formatNumber,
  getInspectionStatusMeta,
} from "@/features/inspection/utils/inspectionManagementUtils"

function StatusBadge({ status }) {
  const meta = getInspectionStatusMeta(status)

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[12px] font-semibold ${meta.badgeClassName}`}
    >
      {meta.label}
    </span>
  )
}

function TableMessage({ children, isError = false }) {
  return (
    <tr>
      <td
        colSpan={COMPLETED_INSPECTION_TABLE_HEADERS.length}
        className={`h-52 text-center text-[14px] ${
          isError ? "text-rose-500" : "text-slate-400"
        }`}
      >
        {children}
      </td>
    </tr>
  )
}

function formatDateTime(value) {
  return value ? String(value).replace("T", " ") : "-"
}

function getAcceptedTotal(inspection) {
  const items = inspection.inspectionResult?.items ?? inspection.items ?? []

  return items.reduce(
    (total, item) => total + Number(item.acceptedQuantity ?? 0),
    0,
  )
}

function getDefectiveTotal(inspection) {
  const items = inspection.inspectionResult?.items ?? inspection.items ?? []

  return items.reduce(
    (total, item) => total + Number(item.defectiveQuantity ?? 0),
    0,
  )
}

export default function CompletedInspectionTable({
  inspections,
  loading,
  error,
}) {
  const router = useRouter()

  function moveToDetail(inspectionId) {
    router.push(`/inspections/${inspectionId}`)
  }

  function handleRowClick(event, inspectionId) {
    if (event.target.closest?.("a, button")) {
      return
    }

    moveToDetail(inspectionId)
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1580px] text-left text-[13px]">
        <thead className="bg-slate-50 text-slate-500">
          <tr>
            {COMPLETED_INSPECTION_TABLE_HEADERS.map((heading) => (
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
            <TableMessage>검수 완료 목록을 불러오는 중입니다.</TableMessage>
          )}

          {!loading && error && <TableMessage isError>{error}</TableMessage>}

          {!loading && !error && inspections.length === 0 && (
            <TableMessage>
              검색 조건에 해당하는 검수 완료 건이 없습니다.
            </TableMessage>
          )}

          {!loading &&
            !error &&
            inspections.map((inspection) => {
              const acceptedTotal = getAcceptedTotal(inspection)
              const defectiveTotal = getDefectiveTotal(inspection)
              const inspectedAt = inspection.inspectionResult?.inspectedAt

              return (
                <tr
                  key={inspection.id}
                  role="link"
                  tabIndex={0}
                  aria-label={`${inspection.inspectionNumber} 검수 상세 화면으로 이동`}
                  onClick={(event) => handleRowClick(event, inspection.id)}
                  className="cursor-pointer border-t border-slate-100 text-slate-600 transition hover:bg-blue-50/40"
                >
                  <td className="whitespace-nowrap px-3 py-2.5 font-semibold text-blue-600">
                    {inspection.inspectionNumber}
                  </td>

                  <td className="whitespace-nowrap px-3 py-2.5">
                    {inspection.inboundNumber}
                  </td>

                  <td className="whitespace-nowrap px-3 py-2.5">
                    {inspection.orderNumber}
                  </td>

                  <td className="whitespace-nowrap px-3 py-2.5 font-medium text-slate-700">
                    {inspection.supplierName}
                  </td>

                  <td className="whitespace-nowrap px-3 py-2.5">
                    {inspection.warehouseName}
                  </td>

                  <td className="whitespace-nowrap px-3 py-2.5">
                    {inspection.receivedAt}
                  </td>

                  <td className="whitespace-nowrap px-3 py-2.5">
                    {formatDateTime(inspectedAt)}
                  </td>

                  <td className="whitespace-nowrap px-3 py-2.5 text-right">
                    {formatNumber(inspection.itemCount)}건
                  </td>

                  <td className="whitespace-nowrap px-3 py-2.5 text-right">
                    {formatNumber(inspection.totalReceivedQuantity)}
                  </td>

                  <td className="whitespace-nowrap px-3 py-2.5 text-right font-semibold text-blue-600">
                    {formatNumber(acceptedTotal)}
                  </td>

                  <td className="whitespace-nowrap px-3 py-2.5 text-right font-semibold text-rose-500">
                    {formatNumber(defectiveTotal)}
                  </td>

                  <td className="whitespace-nowrap px-3 py-2.5">
                    <StatusBadge status={inspection.status} />
                  </td>

                  <td className="whitespace-nowrap px-3 py-2.5">
                    <Link
                      href={`/inspections/${inspection.id}`}
                      onClick={(event) => event.stopPropagation()}
                      className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 text-[12px] font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                      <Eye size={13} />
                      상세 보기
                    </Link>
                  </td>
                </tr>
              )
            })}
        </tbody>
      </table>
    </div>
  )
}

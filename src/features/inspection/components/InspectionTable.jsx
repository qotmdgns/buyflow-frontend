"use client";

import Link from "next/link";

import { useRouter } from "next/navigation";

import { ClipboardCheck } from "lucide-react";

import {
  formatNumber,
  getInspectionStatusMeta,
  INSPECTION_TABLE_HEADERS,
  isInspectionOverdue,
} from "@/features/inspection/utils/inspectionManagementUtils";

function StatusBadge({ status }) {
  const meta = getInspectionStatusMeta(status);

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[12px] font-semibold ${meta.badgeClassName}`}>{meta.label}</span>
  );
}

function PriorityBadge({ priority }) {
  const isUrgent = priority === "긴급";

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[12px] font-semibold ${
        isUrgent ? "border-rose-200 bg-rose-50 text-rose-500" : "border-slate-200 bg-white text-slate-500"
      }`}
    >
      {priority}
    </span>
  );
}

function TableMessage({ children, isError = false }) {
  return (
    <tr>
      <td
        colSpan={INSPECTION_TABLE_HEADERS.length}
        className={`h-52 text-center text-[14px] ${isError ? "text-rose-500" : "text-slate-400"}`}
      >
        {children}
      </td>
    </tr>
  );
}

export default function InspectionTable({ inspections, loading, error }) {
  const router = useRouter();

  function moveToDetail(inspectionId) {
    router.push(`/inspections/${inspectionId}`);
  }

  function handleRowClick(event, inspectionId) {
    if (event.target.closest?.("a, button")) {
      return;
    }

    moveToDetail(inspectionId);
  }

  function handleRowKeyDown(event, inspectionId) {
    if (event.target !== event.currentTarget) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();

      moveToDetail(inspectionId);
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1580px] text-left text-[13px]">
        <thead className="bg-slate-50 text-slate-500">
          <tr>
            {INSPECTION_TABLE_HEADERS.map((heading) => (
              <th key={heading} className="whitespace-nowrap px-3 py-2.5 font-medium">
                {heading}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {loading && <TableMessage>검수 대기 목록을 불러오는 중입니다.</TableMessage>}

          {!loading && error && <TableMessage isError>{error}</TableMessage>}

          {!loading && !error && inspections.length === 0 && <TableMessage>검색 조건에 해당하는 검수 대기 건이 없습니다.</TableMessage>}

          {!loading &&
            !error &&
            inspections.map((inspection) => {
              const overdue = isInspectionOverdue(inspection);

              return (
                <tr
                  key={inspection.id}
                  role="link"
                  tabIndex={0}
                  aria-label={`${inspection.inspectionNumber} 검수 상세 화면으로 이동`}
                  onClick={(event) => handleRowClick(event, inspection.id)}
                  onKeyDown={(event) => handleRowKeyDown(event, inspection.id)}
                  className="cursor-pointer border-t border-slate-100 text-slate-600 transition hover:bg-blue-50/40 focus:bg-blue-50/40 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-200"
                >
                  <td className="whitespace-nowrap px-3 py-2.5 font-semibold text-blue-600">{inspection.inspectionNumber}</td>

                  <td className="whitespace-nowrap px-3 py-2.5">{inspection.inboundNumber}</td>

                  <td className="whitespace-nowrap px-3 py-2.5">{inspection.orderNumber}</td>

                  <td className="whitespace-nowrap px-3 py-2.5 font-medium text-slate-700">{inspection.supplierName}</td>

                  <td className="whitespace-nowrap px-3 py-2.5">{inspection.warehouseName}</td>

                  <td className="whitespace-nowrap px-3 py-2.5">{inspection.receivedAt}</td>

                  <td className={`whitespace-nowrap px-3 py-2.5 ${overdue ? "font-semibold text-rose-500" : ""}`}>
                    {inspection.inspectionDueAt}

                    {overdue && <span className="ml-1">(초과)</span>}
                  </td>

                  <td className="whitespace-nowrap px-3 py-2.5 text-right">{formatNumber(inspection.itemCount)}건</td>

                  <td className="whitespace-nowrap px-3 py-2.5 text-right">{formatNumber(inspection.totalReceivedQuantity)}</td>

                  <td className="whitespace-nowrap px-3 py-2.5">
                    <PriorityBadge priority={inspection.priority} />
                  </td>

                  <td className="whitespace-nowrap px-3 py-2.5">
                    <StatusBadge status={inspection.status} />
                  </td>

                  <td className="whitespace-nowrap px-3 py-2.5">
                    <Link
                      href={`/inspections/${inspection.id}/register`}
                      onClick={(event) => event.stopPropagation()}
                      className="inline-flex h-8 items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2.5 text-[12px] font-semibold text-blue-600 transition hover:bg-blue-100"
                    >
                      <ClipboardCheck size={13} />
                      검수 등록
                    </Link>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}

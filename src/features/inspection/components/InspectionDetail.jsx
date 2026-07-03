"use client"

import Link from "next/link"

import { ClipboardCheck, RefreshCcw } from "lucide-react"

import useInspectionDetail from "@/features/inspection/hooks/useInspectionDetail"

import {
  formatNumber,
  getDispositionLabel,
  getInspectionItemResultMeta,
  getInspectionStatusMeta,
} from "@/features/inspection/utils/inspectionManagementUtils"

function SectionTitle({ children }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-4 w-1 rounded-full bg-blue-600" />

      <h2 className="text-[15px] font-bold text-slate-800">{children}</h2>
    </div>
  )
}

function InformationItem({ label, children }) {
  return (
    <div>
      <p className="text-[12px] font-semibold text-slate-500">{label}</p>

      <div className="mt-1 text-[14px] font-medium text-slate-700">
        {children || "-"}
      </div>
    </div>
  )
}

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

function ItemResultBadge({ item }) {
  const meta = getInspectionItemResultMeta(item)

  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-[12px] font-semibold ${meta.badgeClassName}`}
    >
      {meta.label}
    </span>
  )
}

function formatDateTime(value) {
  return value ? value.replace("T", " ") : "-"
}

function LoadingState() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-16 text-center text-[14px] text-slate-400 shadow-sm">
      검수 상세 정보를 불러오는 중입니다.
    </div>
  )
}

function ErrorState({ error, onReload }) {
  return (
    <div className="rounded-lg border border-rose-100 bg-white px-4 py-16 text-center shadow-sm">
      <p className="text-[14px] text-rose-500">{error}</p>

      <button
        type="button"
        onClick={onReload}
        className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-50"
      >
        <RefreshCcw size={13} />
        다시 불러오기
      </button>
    </div>
  )
}

function InspectionBasicInformation({ inspection }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <SectionTitle>검수 대상 기본정보</SectionTitle>

      <div className="mt-4 grid gap-x-12 gap-y-4 md:grid-cols-2 xl:grid-cols-4">
        <InformationItem label="검수 대기 번호">
          {inspection.inspectionNumber}
        </InformationItem>

        <InformationItem label="입고 번호">
          {inspection.receiptNumber}
        </InformationItem>

        <InformationItem label="발주 번호">
          {inspection.orderNumber}
        </InformationItem>

        <InformationItem label="공급업체">
          {inspection.supplierName}
        </InformationItem>

        <InformationItem label="입고 창고">
          {inspection.warehouseName}
        </InformationItem>

        <InformationItem label="입고일">
          {inspection.receivedAt}
        </InformationItem>

        <InformationItem label="검수 기한">
          {inspection.inspectionDueAt}
        </InformationItem>

        <InformationItem label="입고 담당자">
          {inspection.receivedBy}
        </InformationItem>

        <InformationItem label="우선순위">
          {inspection.priority}
        </InformationItem>

        <InformationItem label="검수 대상 품목 수">
          {formatNumber(inspection.itemCount)}건
        </InformationItem>

        <InformationItem label="검수 대상 총수량">
          {formatNumber(inspection.totalReceivedQuantity)}
        </InformationItem>

        <InformationItem label="현재 상태">
          <StatusBadge status={inspection.status} />
        </InformationItem>
      </div>
    </section>
  )
}

function InspectionItems({ items }) {
  return (
    <section className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-3">
        <SectionTitle>검수 대상 품목</SectionTitle>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1420px] text-left text-[13px]">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              {[
                "번호",
                "품목 코드",
                "품목명",
                "카테고리",
                "규격",
                "LOT 번호",
                "입고 수량",
                "합격 수량",
                "불량 수량",
                "판정",
                "불량 사유",
                "처리 방식",
              ].map((heading) => (
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
            {items.map((item, index) => (
              <tr
                key={item.id}
                className="border-t border-slate-100 text-slate-600"
              >
                <td className="whitespace-nowrap px-3 py-2.5 text-center">
                  {index + 1}
                </td>

                <td className="whitespace-nowrap px-3 py-2.5 font-medium text-blue-600">
                  {item.itemCode}
                </td>

                <td className="min-w-44 px-3 py-2.5 font-semibold text-slate-700">
                  {item.itemName}
                </td>

                <td className="whitespace-nowrap px-3 py-2.5">
                  {item.category || "-"}
                </td>

                <td className="whitespace-nowrap px-3 py-2.5">
                  {item.specification || "-"}
                </td>

                <td className="whitespace-nowrap px-3 py-2.5">
                  {item.lotNumber || "-"}
                </td>

                <td className="whitespace-nowrap px-3 py-2.5 text-right font-semibold text-slate-700">
                  {formatNumber(item.receivedQuantity)}
                </td>

                <td className="whitespace-nowrap px-3 py-2.5 text-right">
                  {item.acceptedQuantity == null
                    ? "-"
                    : formatNumber(item.acceptedQuantity)}
                </td>

                <td className="whitespace-nowrap px-3 py-2.5 text-right">
                  {item.defectiveQuantity == null
                    ? "-"
                    : formatNumber(item.defectiveQuantity)}
                </td>

                <td className="whitespace-nowrap px-3 py-2.5">
                  <ItemResultBadge item={item} />
                </td>

                <td className="min-w-56 px-3 py-2.5">
                  {item.defectReason || "-"}
                </td>

                <td className="whitespace-nowrap px-3 py-2.5">
                  {getDispositionLabel(item.disposition)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function InspectionResult({ inspection }) {
  const result = inspection.inspectionResult

  if (!result) {
    return (
      <section className="mt-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <SectionTitle>검수 결과</SectionTitle>

        <p className="mt-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-4 text-[13px] text-slate-500">
          아직 검수 결과가 등록되지 않았습니다.
        </p>
      </section>
    )
  }

  const acceptedTotal = result.items.reduce(
    (total, item) => total + Number(item.acceptedQuantity ?? 0),

    0,
  )

  const defectiveTotal = result.items.reduce(
    (total, item) => total + Number(item.defectiveQuantity ?? 0),

    0,
  )

  return (
    <section className="mt-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <SectionTitle>검수 결과</SectionTitle>

      <div className="mt-4 grid gap-x-12 gap-y-4 md:grid-cols-2 xl:grid-cols-4">
        <InformationItem label="검수 담당자">
          {result.inspectorName}
        </InformationItem>

        <InformationItem label="검수 일시">
          {formatDateTime(result.inspectedAt)}
        </InformationItem>

        <InformationItem label="총 합격 수량">
          {formatNumber(acceptedTotal)}
        </InformationItem>

        <InformationItem label="총 불량 수량">
          {formatNumber(defectiveTotal)}
        </InformationItem>
      </div>

      <div className="mt-4">
        <p className="text-[12px] font-semibold text-slate-500">검수 메모</p>

        <div className="mt-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-[13px] leading-6 text-slate-600">
          {result.note || "-"}
        </div>
      </div>
    </section>
  )
}

export default function InspectionDetail({ inspectionId }) {
  const { inspection, loading, error, reload } =
    useInspectionDetail(inspectionId)

  if (loading) {
    return <LoadingState />
  }

  if (error || !inspection) {
    return <ErrorState error={error} onReload={reload} />
  }

  return (
    <div className="w-full">
      <header className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-[22px] font-bold tracking-tight text-slate-900">
              검수 상세
            </h1>

            <StatusBadge status={inspection.status} />
          </div>

          <p className="mt-1 text-[13px] text-slate-400">
            입고 품목의 검수 대상 정보와 등록된 검수 결과를 확인합니다.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/inspections"
            className="inline-flex h-10 items-center rounded-md border border-slate-200 bg-white px-4 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            목록으로
          </Link>

          {inspection.status === "PENDING" && (
            <Link
              href={`/inspections/${inspection.id}/register?mode=edit`}
              className="inline-flex h-10 items-center gap-1.5 rounded-md bg-blue-600 px-4 text-[13px] font-semibold text-white transition hover:bg-blue-700"
            >
              <ClipboardCheck size={14} />
              검수 수정
            </Link>
          )}
        </div>
      </header>

      <InspectionBasicInformation inspection={inspection} />

      <InspectionItems items={inspection.items} />

      <InspectionResult inspection={inspection} />
    </div>
  )
}

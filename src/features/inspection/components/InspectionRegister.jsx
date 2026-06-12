"use client"

import Link from "next/link"

import { useRouter } from "next/navigation"

import { ClipboardCheck } from "lucide-react"

import useInspectionRegister from "@/features/inspection/hooks/useInspectionRegister"

import {
  formatNumber,
  getInspectionStatusMeta,
} from "@/features/inspection/utils/inspectionManagementUtils"

const INPUT_CLASS_NAME =
  "h-9 w-full rounded-md border border-slate-200 bg-white px-2.5 text-[13px] text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400"

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

function LoadingState() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-16 text-center text-[14px] text-slate-400 shadow-sm">
      검수 등록 정보를 불러오는 중입니다.
    </div>
  )
}

function ErrorState({ error }) {
  return (
    <div className="rounded-lg border border-rose-100 bg-white px-4 py-16 text-center shadow-sm">
      <p className="text-[14px] text-rose-500">{error}</p>

      <Link
        href="/inspections"
        className="mt-4 inline-flex h-9 items-center rounded-md border border-slate-200 px-3 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-50"
      >
        목록으로 돌아가기
      </Link>
    </div>
  )
}

function InspectionTargetSummary({ inspection }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <SectionTitle>검수 대상 기본정보</SectionTitle>

      <div className="mt-4 grid gap-x-12 gap-y-4 md:grid-cols-2 xl:grid-cols-4">
        <InformationItem label="검수 대기 번호">
          {inspection.inspectionNumber}
        </InformationItem>

        <InformationItem label="입고 번호">
          {inspection.inboundNumber}
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

        <InformationItem label="검수 대상 총수량">
          {formatNumber(inspection.totalReceivedQuantity)}
        </InformationItem>
      </div>
    </section>
  )
}

function InspectionResultForm({ form, onChange }) {
  return (
    <section className="mt-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <SectionTitle>검수 결과 기본정보</SectionTitle>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label>
          <span className="mb-1 block text-[12px] font-semibold text-slate-500">
            검수 담당자 <strong className="text-rose-500">*</strong>
          </span>

          <input
            value={form.inspectorName}
            onChange={(event) => onChange("inspectorName", event.target.value)}
            className={INPUT_CLASS_NAME}
            placeholder="검수 담당자 이름을 입력해 주세요."
          />
        </label>

        <label>
          <span className="mb-1 block text-[12px] font-semibold text-slate-500">
            검수 일시 <strong className="text-rose-500">*</strong>
          </span>

          <input
            type="datetime-local"
            value={form.inspectedAt}
            onChange={(event) => onChange("inspectedAt", event.target.value)}
            className={INPUT_CLASS_NAME}
          />
        </label>
      </div>

      <label className="mt-4 block">
        <span className="mb-1 block text-[12px] font-semibold text-slate-500">
          검수 메모
        </span>

        <textarea
          value={form.note}
          onChange={(event) => onChange("note", event.target.value)}
          placeholder="검수 과정에서 확인한 참고 사항을 입력해 주세요."
          className="min-h-20 w-full resize-y rounded-md border border-slate-200 px-3 py-2.5 text-[13px] text-slate-600 outline-none transition placeholder:text-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
      </label>
    </section>
  )
}

function InspectionItemTable({ items, totals, onChange }) {
  return (
    <section className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-3">
        <SectionTitle>품목별 검수 결과</SectionTitle>

        <p className="mt-1 text-[12px] text-slate-400">
          각 품목의 합격 수량과 불량 수량 합계는 입고 수량과 같아야 합니다.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1530px] text-left text-[13px]">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              {[
                "번호",
                "품목 코드",
                "품목명",
                "규격",
                "LOT 번호",
                "입고 수량",
                "합격 수량",
                "불량 수량",
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
            {items.map((item, index) => {
              const hasDefect = Number(item.defectiveQuantity || 0) > 0

              return (
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
                    {item.specification || "-"}
                  </td>

                  <td className="whitespace-nowrap px-3 py-2.5">
                    {item.lotNumber || "-"}
                  </td>

                  <td className="whitespace-nowrap px-3 py-2.5 text-right font-semibold text-slate-700">
                    {formatNumber(item.receivedQuantity)}
                  </td>

                  <td className="px-3 py-2.5">
                    <input
                      type="number"
                      min="0"
                      max={item.receivedQuantity}
                      value={item.acceptedQuantity}
                      onChange={(event) =>
                        onChange(
                          item.id,
                          "acceptedQuantity",
                          event.target.value,
                        )
                      }
                      className={`${INPUT_CLASS_NAME} w-24 text-right`}
                    />
                  </td>

                  <td className="px-3 py-2.5">
                    <input
                      type="number"
                      min="0"
                      max={item.receivedQuantity}
                      value={item.defectiveQuantity}
                      onChange={(event) =>
                        onChange(
                          item.id,
                          "defectiveQuantity",
                          event.target.value,
                        )
                      }
                      className={`${INPUT_CLASS_NAME} w-24 text-right`}
                    />
                  </td>

                  <td className="px-3 py-2.5">
                    <input
                      value={item.defectReason}
                      disabled={!hasDefect}
                      onChange={(event) =>
                        onChange(item.id, "defectReason", event.target.value)
                      }
                      placeholder={hasDefect ? "불량 사유 입력" : "불량 없음"}
                      className={`${INPUT_CLASS_NAME} min-w-56`}
                    />
                  </td>

                  <td className="px-3 py-2.5">
                    <select
                      value={item.disposition}
                      disabled={!hasDefect}
                      onChange={(event) =>
                        onChange(item.id, "disposition", event.target.value)
                      }
                      className={`${INPUT_CLASS_NAME} min-w-36`}
                    >
                      <option value="NONE">선택</option>

                      <option value="RETURN">반품</option>

                      <option value="EXCHANGE">교환 요청</option>

                      <option value="CONDITIONAL_ACCEPTANCE">
                        조건부 입고
                      </option>
                    </select>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap justify-end gap-x-6 gap-y-2 border-t border-slate-100 px-4 py-3 text-[13px] text-slate-500">
        <p>
          입고 수량{" "}
          <strong className="ml-1 text-slate-700">
            {formatNumber(totals.received)}
          </strong>
        </p>

        <p>
          합격 수량{" "}
          <strong className="ml-1 text-blue-600">
            {formatNumber(totals.accepted)}
          </strong>
        </p>

        <p>
          불량 수량{" "}
          <strong className="ml-1 text-rose-500">
            {formatNumber(totals.defective)}
          </strong>
        </p>
      </div>
    </section>
  )
}

export default function InspectionRegister({ inspectionId }) {
  const router = useRouter()

  const {
    inspection,
    form,
    totals,
    loading,
    submitting,
    error,
    actionError,
    updateField,
    updateItem,
    submit,
  } = useInspectionRegister(inspectionId)

  async function handleSubmit(event) {
    event.preventDefault()

    const savedInspection = await submit()

    if (!savedInspection) {
      return
    }

    window.alert("검수 결과가 등록되었습니다.")

    router.push(`/inspections/${inspectionId}`)
  }

  if (loading) {
    return <LoadingState />
  }

  if (error || !inspection || !form) {
    return <ErrorState error={error} />
  }

  if (inspection.status !== "PENDING") {
    return (
      <div className="rounded-lg border border-amber-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <h1 className="text-[22px] font-bold text-slate-900">검수 등록</h1>

          <StatusBadge status={inspection.status} />
        </div>

        <p className="mt-3 text-[14px] text-slate-600">
          이미 검수 결과가 등록된 건입니다. 상세 화면에서 결과를 확인해 주세요.
        </p>

        <Link
          href={`/inspections/${inspectionId}`}
          className="mt-5 inline-flex h-10 items-center rounded-md bg-blue-600 px-4 text-[13px] font-semibold text-white transition hover:bg-blue-700"
        >
          검수 상세로 이동
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <header className="mb-3">
        <h1 className="text-[22px] font-bold tracking-tight text-slate-900">
          검수 등록
        </h1>

        <p className="mt-1 text-[13px] text-slate-400">
          입고 품목별 합격 수량과 불량 수량을 입력하고 검수 결과를 저장합니다.
        </p>
      </header>

      <InspectionTargetSummary inspection={inspection} />

      <InspectionResultForm form={form} onChange={updateField} />

      <InspectionItemTable
        items={form.items}
        totals={totals}
        onChange={updateItem}
      />

      {actionError && (
        <p className="mt-3 rounded-md border border-rose-100 bg-rose-50 px-3 py-2.5 text-[13px] text-rose-500">
          {actionError}
        </p>
      )}

      <div className="mt-4 flex justify-end gap-2">
        <Link
          href={`/inspections/${inspectionId}`}
          className="inline-flex h-10 items-center rounded-md border border-slate-200 bg-white px-4 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          취소
        </Link>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-10 items-center gap-1.5 rounded-md bg-blue-600 px-4 text-[13px] font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ClipboardCheck size={14} />

          {submitting ? "저장 중..." : "검수 결과 저장"}
        </button>
      </div>
    </form>
  )
}

"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Download, FileText, Pencil, Trash2, XCircle } from "lucide-react"
import usePurchaseRequestDetail from "@/features/purchase-request/hooks/usePurchaseRequestDetail"
import { formatWon } from "@/features/purchase-request/utils/purchaseRequestUtils"

const STATUS_CLASS_NAMES = {
  "승인 대기": "border-amber-200 bg-amber-50 text-amber-600",
  "승인 완료": "border-blue-200 bg-blue-50 text-blue-600",
  반려: "border-rose-200 bg-rose-50 text-rose-500",
  "발주 완료": "border-slate-200 bg-slate-100 text-slate-700",
  "요청 취소": "border-slate-200 bg-slate-100 text-slate-500",
}

const PRIORITY_CLASS_NAMES = {
  일반: "border-slate-200 bg-slate-50 text-slate-500",
  긴급: "border-rose-200 bg-rose-50 text-rose-500",
}

const EDITABLE_STATUS_LABELS = new Set(["승인 대기"])
const DELETABLE_STATUS_LABELS = new Set(["승인 대기"])
const CANCELABLE_STATUS_LABELS = new Set(["승인 대기"])

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[12px] font-semibold ${
        STATUS_CLASS_NAMES[status] ??
        "border-slate-200 bg-slate-50 text-slate-500"
      }`}
    >
      {status || "-"}
    </span>
  )
}

function PriorityBadge({ priority }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-[12px] font-semibold ${
        PRIORITY_CLASS_NAMES[priority] ??
        "border-slate-200 bg-slate-50 text-slate-500"
      }`}
    >
      {priority || "-"}
    </span>
  )
}

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

function LoadingState() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-16 text-center text-[14px] text-slate-400 shadow-sm">
      구매 요청 상세 정보를 불러오는 중입니다.
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
        className="mt-4 h-9 rounded-md border border-slate-200 bg-white px-3 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-50"
      >
        다시 불러오기
      </button>
    </div>
  )
}

function PurchaseRequestBasicInformation({ request }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <SectionTitle>구매 요청 기본정보</SectionTitle>

      <div className="mt-4 grid gap-x-12 gap-y-4 md:grid-cols-2">
        <InformationItem label="요청 번호">
          {request.requestNumber}
        </InformationItem>

        <InformationItem label="요청 제목">{request.title}</InformationItem>

        <InformationItem label="요청자">{request.requester}</InformationItem>

        <InformationItem label="요청 부서">
          {request.department}
        </InformationItem>

        <InformationItem label="등록일">
          {request.createdAt || request.requestedAt}
        </InformationItem>

        <InformationItem label="수정일">
          {request.updatedAt || "-"}
        </InformationItem>

        <InformationItem label="희망 입고일">
          {request.desiredReceiptAt}
        </InformationItem>

        <InformationItem label="우선순위">
          <PriorityBadge priority={request.priority} />
        </InformationItem>

        <InformationItem label="요청 상태">{request.status}</InformationItem>
      </div>

      <div className="mt-4">
        <p className="text-[12px] font-semibold text-slate-500">요청 사유</p>

        <div className="mt-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-[13px] leading-6 text-slate-600">
          {request.reason || "-"}
        </div>
      </div>
    </section>
  )
}

function PurchaseRequestItems({ items, totalAmount }) {
  return (
    <section className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-3 py-3">
        <SectionTitle>구매 요청 품목</SectionTitle>
      </div>

      {items.length === 0 ? (
        <div className="flex min-h-32 items-center justify-center text-[14px] text-slate-400">
          등록된 구매 요청 품목이 없습니다.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1450px] text-left text-[13px]">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                {[
                  "번호",
                  "품목 코드",
                  "품목명",
                  "카테고리",
                  "규격",
                  "요청 수량",
                  "단위",
                  "예상 단가",
                  "예상 금액",
                  "비고",
                  "품목 등록일",
                  "품목 수정일",
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
                  key={item.id ?? `${item.itemCode}-${index}`}
                  className="border-t border-slate-100 text-slate-600"
                >
                  <td className="whitespace-nowrap px-3 py-2.5 text-center">
                    {index + 1}
                  </td>

                  <td className="whitespace-nowrap px-3 py-2.5 font-medium text-slate-700">
                    {item.itemCode}
                  </td>

                  <td className="min-w-48 px-3 py-2.5 font-semibold text-slate-700">
                    {item.itemName}
                  </td>

                  <td className="whitespace-nowrap px-3 py-2.5">
                    <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[12px] text-slate-500">
                      {item.category || "-"}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-3 py-2.5 text-slate-500">
                    {item.specification || "-"}
                  </td>

                  <td className="whitespace-nowrap px-3 py-2.5 text-center">
                    {item.requestQuantity.toLocaleString("ko-KR")}
                  </td>

                  <td className="whitespace-nowrap px-3 py-2.5">
                    {item.unit || "-"}
                  </td>

                  <td className="whitespace-nowrap px-3 py-2.5 text-right">
                    {formatWon(item.estimatedUnitPrice)}
                  </td>

                  <td className="whitespace-nowrap px-3 py-2.5 text-right font-semibold text-blue-600">
                    {formatWon(item.estimatedAmount)}
                  </td>

                  <td className="min-w-56 px-3 py-2.5 text-slate-500">
                    {item.remark || "-"}
                  </td>

                  <td className="whitespace-nowrap px-3 py-2.5 text-slate-500">
                    {item.createdAt || "-"}
                  </td>

                  <td className="whitespace-nowrap px-3 py-2.5 text-slate-500">
                    {item.updatedAt || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-col items-end gap-1 border-t border-slate-100 px-4 py-3">
        <p className="text-[13px] text-slate-500">
          총 품목 수 :{" "}
          <strong className="font-semibold text-slate-700">
            {items.length}건
          </strong>
        </p>

        <p className="text-[16px] font-bold text-blue-600">
          총 요청 금액: {formatWon(totalAmount)}
        </p>
      </div>
    </section>
  )
}

function PurchaseRequestAttachments({ attachments, onDownload }) {
  return (
    <section className="mt-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <SectionTitle>첨부파일</SectionTitle>

      <div className="mt-3 space-y-2">
        {attachments.length === 0 ? (
          <div className="rounded-md border border-slate-200 px-3 py-4 text-center text-[13px] text-slate-400">
            등록된 첨부파일이 없습니다.
          </div>
        ) : (
          attachments.map((attachment) => (
            <div
              key={attachment.id ?? attachment.fileName}
              className="flex items-center justify-between gap-3 rounded-md border border-slate-200 px-3 py-2.5"
            >
              <div className="flex min-w-0 items-center gap-2">
                <FileText size={14} className="shrink-0 text-slate-400" />

                <span className="truncate text-[13px] text-slate-600">
                  {attachment.fileName}
                </span>
              </div>

              <button
                type="button"
                onClick={() => onDownload(attachment)}
                className="flex shrink-0 items-center gap-1 text-[12px] font-semibold text-blue-600 hover:underline"
              >
                <Download size={12} />
                다운로드
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  )
}

export default function PurchaseRequestDetail({ requestId }) {
  const router = useRouter()
  const { request, loading, error, reload, cancelRequest, deleteRequest } =
    usePurchaseRequestDetail(requestId)

  function handleDownload(attachment) {
    if (!attachment.downloadUrl) {
      window.alert(
        `${attachment.fileName} 다운로드 API는 Spring Boot 연동 시 연결하면 됩니다.`,
      )

      return
    }

    window.open(attachment.downloadUrl, "_blank", "noopener,noreferrer")
  }

  async function handleCancelRequest() {
    const confirmed = window.confirm(
      `${request.requestNumber} 구매 요청을 취소하시겠습니까?`,
    )

    if (!confirmed) {
      return
    }

    try {
      await cancelRequest()
      window.alert("구매 요청을 취소했습니다.")
    } catch (error) {
      console.error("구매 요청 취소 중 오류가 발생했습니다.", error)
      window.alert(error.message || "구매 요청 취소에 실패했습니다.")
    }
  }

  async function handleDeleteRequest() {
    const confirmed = window.confirm(
      `${request.requestNumber} 구매 요청을 삭제하시겠습니까?\n삭제 후 목록에서 숨김 처리됩니다.`,
    )

    if (!confirmed) {
      return
    }

    try {
      await deleteRequest()
      window.alert("구매 요청을 삭제했습니다.")
      router.push("/purchase-requests")
      router.refresh()
    } catch (error) {
      console.error("구매 요청 삭제 중 오류가 발생했습니다.", error)
      window.alert(error.message || "구매 요청 삭제에 실패했습니다.")
    }
  }

  if (loading) {
    return <LoadingState />
  }

  if (error || !request) {
    return <ErrorState error={error} onReload={reload} />
  }

  const canEdit = EDITABLE_STATUS_LABELS.has(request.status)
  const canDelete = DELETABLE_STATUS_LABELS.has(request.status)
  const canCancel = CANCELABLE_STATUS_LABELS.has(request.status)

  return (
    <div className="w-full">
      <header className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-[22px] font-bold tracking-tight text-slate-900">
              구매 요청 상세
            </h1>

            <StatusBadge status={request.status} />
          </div>

          <p className="mt-1 text-[13px] text-slate-400">
            요청 번호: {request.requestNumber}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canEdit && (
            <Link
              href={`/purchase-requests/${request.id}/edit`}
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-blue-600 px-3 text-[13px] font-semibold text-white transition hover:bg-blue-700"
            >
              <Pencil size={13} />
              수정
            </Link>
          )}

          {canDelete && (
            <button
              type="button"
              onClick={handleDeleteRequest}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-rose-200 bg-white px-3 text-[13px] font-semibold text-rose-500 transition hover:bg-rose-50"
            >
              <Trash2 size={13} />
              삭제
            </button>
          )}

          {canCancel && (
            <button
              type="button"
              onClick={handleCancelRequest}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-[13px] font-semibold text-slate-500 transition hover:bg-slate-50"
            >
              <XCircle size={13} />
              요청 취소
            </button>
          )}
        </div>
      </header>

      <PurchaseRequestBasicInformation request={request} />

      <PurchaseRequestItems
        items={request.items}
        totalAmount={request.totalAmount}
      />

      <PurchaseRequestAttachments
        attachments={request.attachments}
        onDownload={handleDownload}
      />
    </div>
  )
}

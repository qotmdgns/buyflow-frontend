"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Ban,
  Check,
  Circle,
  Download,
  FileText,
  LoaderCircle,
  Pencil,
  X,
} from "lucide-react"

import useApprovalManagement from "@/features/approval/hooks/useApprovalManagement"
import LoadingOverlay from "@/components/common/LoadingOverlay"

import {
  calculateTotalAmount,
  formatDateTime,
  formatWon,
  getRequestStatusStyle,
} from "@/features/approval/utils/approvalUtils"

function SectionCard({ title, children, className = "" }) {
  return (
    <section
      className={`rounded-lg border border-slate-200 bg-white p-4 shadow-sm ${className}`}
    >
      <h2 className="border-l-4 border-blue-600 pl-2 text-[15px] font-bold text-slate-800">
        {title}
      </h2>

      {children}
    </section>
  )
}

function StatusBadge({ approval }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[12px] font-semibold ${getRequestStatusStyle(
        approval.requestStatus,
      )}`}
    >
      {approval.requestStatusLabel}
    </span>
  )
}

function InformationItem({ label, children }) {
  return (
    <div>
      <dt className="text-[12px] font-medium text-slate-400">{label}</dt>

      <dd className="mt-1 text-[13px] font-semibold text-slate-700">
        {children}
      </dd>
    </div>
  )
}

function RequestInfoCard({ approval }) {
  return (
    <SectionCard title="구매 요청 기본정보">
      <dl className="mt-4 grid gap-x-10 gap-y-4 md:grid-cols-2">
        <InformationItem label="요청 번호">
          {approval.requestNumber}
        </InformationItem>

        <InformationItem label="요청 제목">{approval.title}</InformationItem>

        <InformationItem label="요청자">
          {approval.requester.name}
        </InformationItem>

        <InformationItem label="요청 부서">
          {approval.requestDepartment.name}
        </InformationItem>

        <InformationItem label="등록일">
          {approval.createdAt || approval.requestedAt || "-"}
        </InformationItem>

        <InformationItem label="수정일">
          {approval.updatedAt || "-"}
        </InformationItem>

        <InformationItem label="희망 입고일">
          {approval.desiredReceiptAt}
        </InformationItem>

        <InformationItem label="우선순위">
          {approval.priorityLabel}
        </InformationItem>

        <InformationItem label="요청 상태">
          {approval.requestStatusLabel}
        </InformationItem>
      </dl>

      <div className="mt-4">
        <p className="text-[12px] font-medium text-slate-400">요청 사유</p>

        <p className="mt-1 rounded-md border border-slate-100 bg-slate-50 px-3 py-2.5 text-[13px] leading-6 text-slate-600">
          {approval.reason}
        </p>
      </div>
    </SectionCard>
  )
}

function ItemTableCard({ items }) {
  const totalAmount = calculateTotalAmount(items)

  return (
    <SectionCard title="구매 요청 품목">
      <div className="mt-4 overflow-x-auto rounded-md border border-slate-100">
        <table className="w-full min-w-[1350px] text-left text-[12px]">
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
                key={item.requestItemId}
                className="border-t border-slate-100 text-slate-600"
              >
                <td className="px-3 py-3">{index + 1}</td>

                <td className="whitespace-nowrap px-3 py-3 text-slate-500">
                  {item.itemCode}
                </td>

                <td className="whitespace-nowrap px-3 py-3 font-semibold text-slate-700">
                  {item.itemName}
                </td>

                <td className="px-3 py-3">
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] text-slate-500">
                    {item.category}
                  </span>
                </td>

                <td className="whitespace-nowrap px-3 py-3">
                  {item.specification}
                </td>

                <td className="px-3 py-3 text-right">{item.quantity}</td>

                <td className="px-3 py-3">{item.unit}</td>

                <td className="whitespace-nowrap px-3 py-3 text-right">
                  {formatWon(item.expectedUnitPrice)}
                </td>

                <td className="whitespace-nowrap px-3 py-3 text-right font-semibold text-blue-600">
                  {formatWon(item.expectedAmount)}
                </td>

                <td className="min-w-52 px-3 py-3 text-slate-500">
                  {item.remark || "-"}
                </td>

                <td className="whitespace-nowrap px-3 py-3 text-slate-500">
                  {item.createdAt || "-"}
                </td>

                <td className="whitespace-nowrap px-3 py-3 text-slate-500">
                  {item.updatedAt || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-right">
        <p className="text-[12px] text-slate-500">
          총 품목 수: {items.length}건
        </p>

        <p className="mt-1 text-[17px] font-bold text-blue-600">
          총 요청 금액: {formatWon(totalAmount)}
        </p>
      </div>
    </SectionCard>
  )
}

function AttachmentCard({ attachments }) {
  function downloadAttachment(attachment) {
    if (!attachment.downloadUrl) {
      window.alert("백엔드 연동 후 첨부파일 다운로드 URL을 연결합니다.")

      return
    }

    window.open(attachment.downloadUrl, "_blank", "noopener,noreferrer")
  }

  return (
    <SectionCard title="첨부파일">
      <ul className="mt-4 space-y-2">
        {attachments.map((attachment) => (
          <li
            key={attachment.attachmentId}
            className="flex items-center justify-between gap-3 rounded-md border border-slate-200 px-3 py-2.5"
          >
            <span className="flex min-w-0 items-center gap-2 text-[13px] text-slate-600">
              <FileText size={14} className="shrink-0 text-slate-400" />

              <span className="truncate">{attachment.fileName}</span>
            </span>

            <button
              type="button"
              onClick={() => downloadAttachment(attachment)}
              className="flex shrink-0 items-center gap-1 text-[12px] font-semibold text-blue-600 hover:underline"
            >
              <Download size={12} />
              다운로드
            </button>
          </li>
        ))}
      </ul>
    </SectionCard>
  )
}

function ApprovalActionCard({
  approval,
  comment,
  actionError,
  submittingAction,
  onCommentChange,
  onSubmitDecision,
}) {
  const canDecide =
    approval?.requestStatus === "PENDING_APPROVAL" &&
    Boolean(approval?.canProcess)

  const disabled = !canDecide || Boolean(submittingAction)

  return (
    <SectionCard title="승인 처리">
      <dl className="mt-4 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-[12px] text-slate-400">현재 승인 단계</dt>

          <dd className="text-[13px] font-bold text-slate-700">
            {approval.currentStep.stepLabel}
          </dd>
        </div>

        <div className="flex items-center justify-between gap-3">
          <dt className="text-[12px] text-slate-400">승인 담당자</dt>

          <dd className="text-[13px] font-bold text-slate-700">
            {approval.currentStep.approver.name}{" "}
            {approval.currentStep.approver.position}
          </dd>
        </div>
      </dl>

      <label className="mt-4 block">
        <span className="mb-1 block text-[12px] font-medium text-slate-500">
          결재 의견
        </span>

        <textarea
          value={comment}
          onChange={(event) => onCommentChange(event.target.value)}
          placeholder="승인 또는 반려 사유를 입력하세요."
          rows={4}
          disabled={disabled}
          className="w-full resize-none rounded-md border border-slate-200 px-3 py-2 text-[13px] leading-5 text-slate-600 outline-none transition placeholder:text-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
        />
      </label>

      <p className="mt-2 text-[11px] leading-5 text-rose-500">
        반려 처리 시 결재 의견을 반드시 입력해 주세요.
      </p>

      {actionError && (
        <p className="mt-2 rounded-md bg-rose-50 px-2.5 py-2 text-[12px] text-rose-500">
          {actionError}
        </p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onSubmitDecision("REJECT")}
          disabled={disabled}
          className="flex h-10 items-center justify-center gap-1 rounded-md border border-rose-300 text-[13px] font-semibold text-rose-500 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submittingAction === "REJECT" ? (
            <LoaderCircle size={14} className="animate-spin" />
          ) : (
            <X size={14} />
          )}
          반려
        </button>

        <button
          type="button"
          onClick={() => onSubmitDecision("APPROVE")}
          disabled={disabled}
          className="flex h-10 items-center justify-center gap-1 rounded-md bg-blue-600 text-[13px] font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submittingAction === "APPROVE" ? (
            <LoaderCircle size={14} className="animate-spin" />
          ) : (
            <Check size={14} />
          )}
          승인
        </button>
      </div>
    </SectionCard>
  )
}

function TimelineIcon({ status }) {
  if (status === "DONE") {
    return (
      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-white">
        <Check size={10} />
      </span>
    )
  }

  if (status === "CURRENT") {
    return (
      <span className="flex h-4 w-4 items-center justify-center rounded-full border-4 border-blue-600 bg-white" />
    )
  }

  return <Circle size={16} className="fill-slate-200 text-slate-200" />
}

function ApprovalHistoryCard({ history }) {
  return (
    <SectionCard title="승인 이력">
      <ol className="mt-4 space-y-0">
        {history.map((item, index) => (
          <li
            key={item.historyId}
            className="relative flex gap-3 pb-5 last:pb-0"
          >
            {index < history.length - 1 && (
              <span className="absolute left-[7px] top-4 h-full w-px bg-slate-200" />
            )}

            <span className="relative z-10 mt-0.5 shrink-0">
              <TimelineIcon status={item.status} />
            </span>

            <div className="min-w-0">
              <p className="text-[13px] font-bold text-slate-700">
                {item.title}
              </p>

              <p className="mt-1 text-[12px] text-slate-400">
                {item.actorName}

                {item.actorPosition ? ` ${item.actorPosition}` : ""}

                {item.processedAt
                  ? ` | ${formatDateTime(item.processedAt)}`
                  : ""}
              </p>

              <p
                className={`mt-1 text-[12px] ${
                  item.status === "CURRENT"
                    ? "font-semibold text-blue-600"
                    : "text-slate-400"
                }`}
              >
                {item.description}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </SectionCard>
  )
}

function LoadingState() {
  return (
    <div className="flex h-80 items-center justify-center rounded-lg border border-slate-200 bg-white text-[14px] text-slate-400 shadow-sm">
      <LoaderCircle size={18} className="mr-2 animate-spin" />
      승인 요청 정보를 불러오는 중입니다.
    </div>
  )
}

export default function ApprovalManagement({ approvalId }) {
  const {
    approval,
    comment,
    loading,
    submittingAction,
    error,
    actionError,
    setComment,
    submitDecision,
    cancelRequest,
  } = useApprovalManagement(approvalId)

  const [approvalLoadingVisible, setApprovalLoadingVisible] = useState(loading)
  const approvalLoadingTimerRef = useRef(null)

  useEffect(() => {
    function clearApprovalLoadingTimer() {
      if (approvalLoadingTimerRef.current) {
        clearTimeout(approvalLoadingTimerRef.current)
        approvalLoadingTimerRef.current = null
      }
    }

    clearApprovalLoadingTimer()

    approvalLoadingTimerRef.current = setTimeout(
      () => {
        setApprovalLoadingVisible(Boolean(loading))
        approvalLoadingTimerRef.current = null
      },
      loading ? 0 : 1000,
    )

    return clearApprovalLoadingTimer
  }, [loading])

  if (loading || approvalLoadingVisible) {
    return (
      <LoadingOverlay
        show
        minDuration={1000}
        message="승인 요청 정보를 불러오는 중입니다."
        description="구매요청 기본정보, 품목, 승인 이력을 확인하고 있습니다."
      />
    )
  }

  if (error || !approval) {
    return (
      <div className="rounded-lg border border-rose-200 bg-white p-6 text-[14px] text-rose-500 shadow-sm">
        {error || "승인 요청 정보를 찾을 수 없습니다."}
      </div>
    )
  }

  const isPendingApproval = approval?.requestStatus === "PENDING_APPROVAL"

  const canProcessCurrentApproval =
    isPendingApproval && Boolean(approval?.canProcess)

  const canCancel = isPendingApproval

  return (
    <div className="w-full">
      <LoadingOverlay
        show={Boolean(submittingAction)}
        minDuration={1000}
        message={
          submittingAction === "APPROVE"
            ? "승인 처리 중입니다."
            : submittingAction === "REJECT"
              ? "반려 처리 중입니다."
              : "요청 취소 처리 중입니다."
        }
        description="승인 상태와 결재 이력을 갱신하고 있습니다."
      />
      <header className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[22px] font-bold text-slate-900">승인 관리</h1>

            <StatusBadge approval={approval} />
          </div>

          <p className="mt-1 text-[13px] text-slate-400">
            요청 번호: {approval.requestNumber}
          </p>
        </div>

        {isPendingApproval && (
          <div className="flex flex-wrap gap-2">
            <Link
              href="/approvals"
              className="flex h-9 items-center gap-1 rounded-md border border-slate-200 bg-white px-3 text-[13px] font-semibold text-slate-500 transition hover:bg-slate-50"
            >
              <ArrowLeft size={13} />
              목록으로
            </Link>

            <Link
              href={`/purchase-requests/${approval.requestId}/edit`}
              className="flex h-9 items-center gap-1 rounded-md border border-slate-200 bg-white px-3 text-[13px] font-semibold text-slate-500 transition hover:bg-slate-50"
            >
              <Pencil size={13} />
              수정
            </Link>

            <button
              type="button"
              onClick={cancelRequest}
              disabled={!canCancel || Boolean(submittingAction)}
              className="flex h-9 items-center gap-1 rounded-md border border-rose-300 bg-white px-3 text-[13px] font-semibold text-rose-500 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Ban size={13} />
              요청취소
            </button>
          </div>
        )}
      </header>

      <div className="grid items-start gap-3 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-3">
          <RequestInfoCard approval={approval} />

          <ItemTableCard items={approval.items} />

          <AttachmentCard attachments={approval.attachments} />
        </div>

        <aside className="space-y-3">
          {canProcessCurrentApproval && (
            <ApprovalActionCard
              approval={approval}
              comment={comment}
              actionError={actionError}
              submittingAction={submittingAction}
              onCommentChange={setComment}
              onSubmitDecision={submitDecision}
            />
          )}

          <ApprovalHistoryCard history={approval.history} />
        </aside>
      </div>
    </div>
  )
}

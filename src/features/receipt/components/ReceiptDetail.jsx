"use client"

import Link from "next/link"
import { ArrowLeft, Download, FileText, Plus } from "lucide-react"

import useReceiptDetail from "@/features/receipt/hooks/useReceiptDetail"
import { downloadFileWithAuth } from "@/lib/api/downloadClient"
import { useAuth } from "@/features/auth/context/AuthContext"

import {
  formatNumber,
  getReceiptStatusMeta,
} from "@/features/receipt/utils/ReceiptUtils"

function SectionTitle({ children }) {
  return <h2 className="text-[15px] font-bold text-slate-800">{children}</h2>
}

function InformationItem({ label, children }) {
  return (
    <div>
      <dt className="text-[12px] font-semibold text-slate-400">{label}</dt>

      <dd className="mt-1 text-[14px] font-medium text-slate-700">
        {children || "-"}
      </dd>
    </div>
  )
}

function StatusBadge({ status }) {
  const meta = getReceiptStatusMeta(status)

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
      입고 상세 정보를 불러오는 중입니다.
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
        className="mt-4 h-9 rounded-md border border-slate-200 bg-white px-3 text-[13px] font-semibold text-slate-600 hover:bg-slate-50"
      >
        다시 불러오기
      </button>
    </div>
  )
}

export default function ReceiptDetail({ receiptId, mode = "receipt" }) {
  const { user, isAuthReady } = useAuth()
  const canWriteReceipts =
    isAuthReady &&
    (user?.roles?.includes("ADMIN") ||
      user?.permissions?.includes("receipts.write"))
  const { receipt, loading, error, reload } =
    useReceiptDetail(receiptId, mode)

  async function handleAttachmentDownload(attachment) {
    try {
      await downloadFileWithAuth(attachment.downloadUrl, attachment.fileName)
    } catch (error) {
      console.error("receipt attachment download failed", error)
      window.alert("첨부파일을 다운로드하지 못했습니다.")
    }
  }
    
  if (loading) {
    return <LoadingState />
  }

  if (error || !receipt) {
    return <ErrorState error={error} onReload={reload} />
  }

  return (
    <div className="w-full">
      <header className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-[22px] font-bold text-slate-900">입고 상세</h1>
            <StatusBadge status={receipt.status} />
          </div>

          <p className="mt-1 text-[13px] text-slate-400">
            발주 번호: {receipt.orderNumber}
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/receipts"
            className="flex h-10 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-4 text-[13px] font-semibold text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft size={14} />
            목록
          </Link>

          {canWriteReceipts && receipt.remainingQuantity > 0 && (
            <Link
              href={`/receipts/new?receiptId=${receipt.id}`}
              className="flex h-10 items-center gap-1.5 rounded-md bg-blue-600 px-4 text-[13px] font-semibold text-white hover:bg-blue-700"
            >
              <Plus size={14} />
              추가 입고 등록
            </Link>
          )}
        </div>
      </header>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <SectionTitle>발주 및 입고 현황</SectionTitle>

        <dl className="mt-4 grid gap-x-10 gap-y-4 md:grid-cols-2 xl:grid-cols-4">
          <InformationItem label="발주 번호">
            {receipt.orderNumber}
          </InformationItem>

          <InformationItem label="공급업체">
            {receipt.supplierName}
          </InformationItem>

          <InformationItem label="발주일">{receipt.orderedAt}</InformationItem>

          <InformationItem label="입고 예정일">
            {receipt.expectedReceiptAt}
          </InformationItem>

          <InformationItem label="입고 창고">
            {receipt.warehouseName}
          </InformationItem>

          <InformationItem label="발주 수량">
            {formatNumber(receipt.orderQuantity)}
          </InformationItem>

          <InformationItem label="누적 입고">
            {formatNumber(receipt.receivedQuantity)}
          </InformationItem>

          <InformationItem label="미입고">
            {formatNumber(receipt.remainingQuantity)}
          </InformationItem>
        </dl>
      </section>

      <section className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3">
          <SectionTitle>품목별 입고 현황</SectionTitle>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-[13px]">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                {[
                  "번호",
                  "품목 코드",
                  "품목명",
                  "규격",
                  "발주 수량",
                  "누적 입고",
                  "미입고",
                  "단위",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="whitespace-nowrap px-3 py-3 font-semibold"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {(receipt.items || []).map((item, index) => (
                <tr
                  key={item.orderItemId}
                  className="border-t border-slate-100 text-slate-600"
                >
                  <td className="px-3 py-2.5 text-center">{index + 1}</td>

                  <td className="whitespace-nowrap px-3 py-2.5 font-semibold text-blue-600">
                    {item.itemCode}
                  </td>

                  <td className="px-3 py-2.5">{item.itemName}</td>

                  <td className="px-3 py-2.5">{item.specification}</td>

                  <td className="px-3 py-2.5 text-right">
                    {formatNumber(item.orderQuantity)}
                  </td>

                  <td className="px-3 py-2.5 text-right">
                    {formatNumber(item.cumulativeReceivedQuantity)}
                  </td>

                  <td className="px-3 py-2.5 text-right font-semibold text-amber-600">
                    {formatNumber(item.remainingQuantity)}
                  </td>

                  <td className="px-3 py-2.5">{item.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3">
          <SectionTitle>입고 처리 이력</SectionTitle>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-[13px]">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                {[
                  "입고 번호",
                  "실제 입고일",
                  "담당자",
                  "입고 수량",
                  "비고",
                  "첨부파일",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="whitespace-nowrap px-3 py-3 font-semibold"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {!receipt.histories.length && (
                <tr>
                  <td colSpan={6} className="h-28 text-center text-slate-400">
                    아직 등록된 입고 처리 이력이 없습니다.
                  </td>
                </tr>
              )}

              {(receipt.histories || []).map((history) => (
                <tr
                  key={history.id}
                  className="border-t border-slate-100 text-slate-600"
                >
                  <td className="whitespace-nowrap px-3 py-2.5 font-semibold text-blue-600">
                    {history.receiptNumber}
                  </td>

                  <td className="whitespace-nowrap px-3 py-2.5">
                    {history.receivedAt}
                  </td>

                  <td className="whitespace-nowrap px-3 py-2.5">
                    {history.receiverName}
                  </td>

                  <td className="px-3 py-2.5 text-right">
                    {formatNumber(history.totalReceivedQuantity)}
                  </td>

                  <td className="px-3 py-2.5">{history.memo || "-"}</td>

                  <td className="px-3 py-2.5">
                    {!history.attachments?.length ? (
                      <span className="text-slate-400">-</span>
                    ) : (
                      history.attachments.map((attachment) =>
                        attachment.downloadUrl ? (
                          <button
                            key={attachment.id}
                            type="button"
                            onClick={() => handleAttachmentDownload(attachment)}
                            className="flex items-center gap-1 text-blue-600 hover:underline"
                          >
                            <FileText size={13} />
                            {attachment.fileName}
                            <Download size={12} />
                          </button>
                        ) : (
                          <span
                            key={attachment.id}
                            className="flex items-center gap-1 text-blue-600"
                          >
                            <FileText size={13} />
                            {attachment.fileName}
                          </span>
                        ),
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

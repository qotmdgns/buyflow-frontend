"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCcw,
  Search,
  Download,
} from "lucide-react"
import PurchaseOrderCancelModal from "@/features/purchase-order/components/PurchaseOrderCancelModal"
import PurchaseOrderDetailModal from "@/features/purchase-order/components/PurchaseOrderDetailModal"
import usePurchaseOrderManagement from "@/features/purchase-order/hooks/usePurchaseOrderManagement"
import {
  formatWon,
  getPurchaseOrderStatusLabel,
  getPurchaseOrderStatusMeta,
} from "@/features/purchase-order/utils/purchaseOrderUtils"
import { getApiUrl } from "@/lib/api/fetchClient"
import { getAccessToken } from "@/utils/authStorage"
import { hasPermission } from "@/utils/permissions"

const INPUT_CLASS_NAME =
  "h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-[13px] text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"

function StatusBadge({ status }) {
  const meta = getPurchaseOrderStatusMeta(status)
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
        colSpan={9}
        className={`h-40 text-center text-[13px] ${
          isError ? "text-rose-500" : "text-slate-400"
        }`}
      >
        {children}
      </td>
    </tr>
  )
}

function formatDate(value) {
  if (!value) return "-"
  return String(value).substring(0, 10)
}

function getRequestNumber(order) {
  return (
    order.requestNo ||
    order.requestNumber ||
    order.purchaseRequest?.requestNo ||
    order.purchaseRequest?.requestNumber ||
    "-"
  )
}

function getExpectedReceiptText(order) {
  const from = order.expectedReceiptFrom || order.expectedReceiptFrom || "-"
  const to = order.expectedReceiptTo || order.expectedReceiptTo || "-"

  return `${from} ~ ${to}`
}

function getItemCount(order) {
  if (order.itemCount !== undefined && order.itemCount !== null) {
    return order.itemCount
  }

  return order.items?.length ?? 0
}

function getOrderTotalAmount(order) {
  const directTotal = Number(order.totalAmount ?? order.totalPrice ?? 0)

  if (Number.isFinite(directTotal) && directTotal > 0) {
    return directTotal
  }

  const supplyAmount =
    order.items?.reduce((acc, item) => {
      const quantity = Number(
        item.orderQuantity ?? item.quantity ?? item.requestedQuantity ?? 0,
      )
      const unitPrice = Number(item.unitPrice ?? item.price ?? 0)

      return acc + quantity * unitPrice
    }, 0) ?? 0

  if (!Number.isFinite(supplyAmount) || supplyAmount <= 0) {
    return 0
  }

  return supplyAmount + Math.floor(supplyAmount * 0.1)
}

export default function PurchaseOrderManagement() {
  const router = useRouter()

  const {
    draftFilters,
    filterOptions,
    orders,
    pagination,
    loading,
    error,
    selectedOrderId,
    detailState,
    changePageSize,
    cancelTarget,
    canceling,
    cancelError,
    updateFilter,
    searchOrders,
    resetFilters,
    movePage,
    openDetail,
    closeDetail,
    openCancel,
    closeCancel,
    confirmCancel,
  } = usePurchaseOrderManagement()

  async function handleDownload() {
    try {
      const token = getAccessToken()

      const response = await fetch(getApiUrl("/api/orders/excel"), {
        method: "GET",
        headers: {
          Accept:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })

      if (!response.ok) {
        throw new Error("엑셀 파일을 생성하지 못했습니다.")
      }

      // 1. 서버에서 넘어온 바이너리 데이터(Excel)를 Blob 객체로 변환
      const blob = await response.blob()

      // 2. 브라우저 메모리에 가상의 다운로드 URL 생성
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")

      link.href = url
      // 3. 다운로드될 파일명 강제 지정 (서버 헤더를 읽어와도 되지만 프론트에서 고정하는 것이 편합니다)
      link.download = `발주 목록_${new Date().toISOString().slice(0, 10).replace(/-/g, "")}.xlsx`

      // 4. 링크를 클릭한 것처럼 이벤트를 발생시켜 다운로드 실행
      document.body.appendChild(link)
      link.click()
      link.remove()

      // 5. 메모리 누수 방지를 위해 가상 URL 해제
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("엑셀 다운로드 중 오류가 발생했습니다.", error)
      window.alert("엑셀 파일을 다운로드하지 못했습니다.")
    }
  }

  function moveToEdit(order) {
    closeDetail()
    
    const mode = order.orderStatus === "PENDING" ? "register" : "edit"
    router.push(`/purchase-orders/${order.orderId}/edit?mode=${mode}`)
  }

  return (
    <div className="w-full">
      <header className="bf-page-header">
        <div>
          <p className="bf-page-eyebrow">PURCHASE ORDER</p>

          <h1 className="bf-page-title">발주 관리</h1>

          <p className="bf-page-description">
            승인된 구매요청을 기반으로 발주 정보를 조회하고 관리합니다.
          </p>
        </div>
      </header>

      <form
        onSubmit={searchOrders}
        className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <label>
            <span className="mb-1 block text-[13px] font-semibold text-slate-600">
              발주 번호
            </span>

            <input
              value={draftFilters.orderNo}
              onChange={(event) => updateFilter("orderNo", event.target.value)}
              placeholder="PO-YYYY-XXXX"
              className={INPUT_CLASS_NAME}
            />
          </label>

          <label>
            <span className="mb-1 block text-[13px] font-semibold text-slate-600">
              구매 요청 번호
            </span>

            <input
              value={draftFilters.requestNo}
              onChange={(event) =>
                updateFilter("requestNo", event.target.value)
              }
              placeholder="PR-YYYY-XXXX"
              className={INPUT_CLASS_NAME}
            />
          </label>
          <label>
            <span className="mb-1 block text-[13px] font-semibold text-slate-600">
              공급업체
            </span>
            <select
              value={draftFilters.supplierName || ""}
              onChange={(event) =>
                updateFilter("supplierName", event.target.value)
              }
              className={INPUT_CLASS_NAME}
            >
              <option value="">전체</option>

              {(filterOptions?.suppliers ?? []).map((supplier) => (
                <option
                  key={supplier.supplierId || supplier.supplierName}
                  value={supplier.supplierName}
                >
                  {supplier.supplierName}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-1 block text-[13px] font-semibold text-slate-600">
              발주 담당자
            </span>

            <input
              value={draftFilters.userName}
              onChange={(event) => updateFilter("userName", event.target.value)}
              placeholder="담당자 이름 입력"
              className={INPUT_CLASS_NAME}
            />
          </label>
          <label>
            <span className="mb-1 block text-[13px] font-semibold text-slate-600">
              발주 상태
            </span>
            <select
              value={draftFilters.orderStatus}
              onChange={(event) =>
                updateFilter("orderStatus", event.target.value)
              }
              className={INPUT_CLASS_NAME}
            >
              {(filterOptions?.statuses ?? []).map((orderStatus) => (
                <option key={orderStatus} value={orderStatus}>
                  {orderStatus === "전체"
                    ? orderStatus
                    : getPurchaseOrderStatusLabel(orderStatus)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-3 flex justify-end gap-2 border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={resetFilters}
            className="flex h-10 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-4 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <RefreshCcw size={14} />
            초기화
          </button>

          <button
            type="submit"
            className="flex h-10 items-center gap-1.5 rounded-md bg-blue-600 px-4 text-[13px] font-semibold text-white transition hover:bg-blue-700"
          >
            <Search size={14} />
            검색
          </button>
        </div>
      </form>
      <section className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <div>
            <h2 className="text-[15px] font-bold text-slate-800">발주 목록</h2>
            <p className="mt-0.5 text-[13px] text-slate-400">
              총{" "}
              <span className="font-medium text-slate-700">
                {" "}
                {pagination.totalElements}
              </span>
              건
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="flex h-10 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-[13px] font-semibold text-slate-500 transition hover:bg-slate-50"
            >
              <Download size={13} />
              엑셀 다운로드
            </button>
            {hasPermission("purchase-orders.write") && (
              <Link
                href="/purchase-orders/new"
                className="flex h-10 items-center gap-1.5 rounded-md bg-blue-600 px-4 text-[13px] font-semibold text-white transition hover:bg-blue-700"
              >
                <Plus size={14} />
                신규 발주 등록
              </Link>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1250px] text-left text-[13px]">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                {[
                  "발주 번호",
                  "구매 요청 번호",
                  "공급업체",
                  "발주 담당자",
                  "발주일",
                  "입고 예정일",
                  "품목 수",
                  "총 발주 금액",
                  "상태",
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
              {loading && (
                <TableMessage>발주 목록을 불러오는 중입니다.</TableMessage>
              )}

              {!loading && error && (
                <TableMessage isError>{error}</TableMessage>
              )}

              {!loading && !error && orders.length === 0 && (
                <TableMessage>
                  검색 조건에 해당하는 발주 내역이 없습니다.
                </TableMessage>
              )}

              {!loading &&
                !error &&
                orders.map((order) => (
                  <tr
                    key={order.orderId}
                    onClick={() => openDetail(order)}
                    className="cursor-pointer border-t border-slate-100 text-slate-600 transition hover:bg-blue-50/50"
                  >
                    <td className="whitespace-nowrap px-3 py-3 font-semibold text-blue-600">
                      {order.orderNo || order.orderNumber || "-"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      {order.requestNo && order.requestNo !== "-"
                        ? order.requestNo
                        : order.requestNumber || "-"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 font-medium text-slate-700">
                      {order.supplierName || "-"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      {order.orderManager || order.userName || "-"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      {formatDate(order.orderedAt || order.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      {getExpectedReceiptText(order)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-right">
                      {getItemCount(order)}건
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-right font-semibold text-slate-800">
                      {formatWon(getOrderTotalAmount(order))}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      <StatusBadge status={order.orderStatus || order.status} />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => movePage(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="이전 페이지"
            >
              <ChevronLeft size={15} />
            </button>

            <span className="text-[13px] text-slate-500">
              {pagination.page} / {pagination.totalPages}
            </span>

            <button
              type="button"
              onClick={() => movePage(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="다음 페이지"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </section>

      {selectedOrderId && (
        <PurchaseOrderDetailModal
          order={detailState.detail}
          loading={detailState.loading}
          error={detailState.error}
          onClose={closeDetail}
          onEdit={moveToEdit}
          onCancel={openCancel}
        />
      )}

      {cancelTarget && (
        <PurchaseOrderCancelModal
          key={cancelTarget.id || cancelTarget.orderId}
          order={cancelTarget}
          submitting={canceling}
          error={cancelError}
          onClose={closeCancel}
          onConfirm={confirmCancel}
        />
      )}
    </div>
  )
}

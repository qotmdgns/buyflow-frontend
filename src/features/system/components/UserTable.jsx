import { Check, Pencil } from "lucide-react"
import { USER_TABLE_HEADERS } from "@/features/system/utils/systemUtils"

function StatusBadge({ status }) {
  const tone =
    status === "사용 중"
      ? "bg-emerald-50 text-emerald-600"
      : status === "승인 대기"
        ? "bg-amber-50 text-amber-600"
        : "bg-slate-100 text-slate-500"

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${tone}`}
    >
      {status}
    </span>
  )
}

export default function UserTable({ users, loading, error, onEdit, onApprove }) {
  if (loading || error || users.length === 0) {
    return (
      <div className="flex h-52 items-center justify-center text-[14px] text-slate-400">
        {loading
          ? "사용자 목록을 불러오는 중입니다."
          : error || "검색 조건에 해당하는 사용자가 없습니다."}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1050px] text-left text-[13px]">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            {USER_TABLE_HEADERS.map((header) => (
              <th key={header} className="px-3 py-3 font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-t border-slate-100">
              <td className="px-3 py-2.5 font-semibold text-blue-600">
                {user.employeeNo}
              </td>
              <td className="px-3 py-2.5 font-semibold">{user.name}</td>
              <td className="px-3 py-2.5">{user.email}</td>
              <td className="px-3 py-2.5">{user.department}</td>
              <td className="px-3 py-2.5">{user.position}</td>
              <td className="px-3 py-2.5">{user.roleName}</td>
              <td className="px-3 py-2.5">
                <StatusBadge status={user.activeStatus} />
              </td>
              <td className="px-3 py-2.5">
                <div className="flex gap-1.5">
                  {user.activeStatus === "승인 대기" && onApprove && (
                    <button
                      type="button"
                      onClick={() => onApprove(user)}
                      className="flex h-8 items-center gap-1 rounded-md bg-blue-600 px-2.5 font-semibold text-white"
                    >
                      <Check size={13} />
                      승인
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onEdit(user)}
                    className="flex h-8 items-center gap-1 rounded-md border border-slate-200 px-2.5 font-semibold"
                  >
                    <Pencil size={13} />
                    수정
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

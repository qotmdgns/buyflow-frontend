import { CalendarDays, FileUp } from "lucide-react"

const INPUT_CLASS_NAME =
  "h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-[14px] text-slate-600 outline-none transition placeholder:text-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-500"

function FieldLabel({ children, required = false }) {
  return (
    <span className="mb-1 block text-[13px] font-semibold text-slate-600">
      {children}
      {required && <span className="ml-0.5 text-rose-500">*</span>}
    </span>
  )
}

function TextField({ label, required, ...inputProps }) {
  return (
    <label>
      <FieldLabel required={required}>{label}</FieldLabel>
      <input {...inputProps} required={required} className={INPUT_CLASS_NAME} />
    </label>
  )
}

function DateField({ label, required, ...inputProps }) {
  return (
    <label>
      <FieldLabel required={required}>{label}</FieldLabel>

      <span className="relative block">
        <input
          {...inputProps}
          type="date"
          required={required}
          className={INPUT_CLASS_NAME}
        />

        <CalendarDays
          size={13}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </span>
    </label>
  )
}

export default function PurchaseRequestBasicForm({
  form = {},
  attachment,
  onChange = () => {},
  onAttachmentChange = () => {},
}) {
  const safeForm = {
    requestNumber: "",
    requester: "",
    department: "",
    requestDate: "",
    expectedDate: "",
    title: "",
    urgency: "일반",
    reason: "",
    ...form,
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <span className="h-4 w-1 rounded-full bg-blue-600" />

        <h2 className="text-[15px] font-bold text-slate-800">
          구매 요청 기본정보
        </h2>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <TextField
          label="요청 번호"
          value={safeForm.requestNumber || "자동 생성"}
          disabled
          placeholder="구매 요청 시 자동 생성됩니다."
        />
        <TextField
          label="요청자"
          required
          value={safeForm.requester}
          disabled
          placeholder="로그인 사용자 이름이 자동 입력됩니다."
        />

        <TextField
          label="요청 부서"
          required
          value={safeForm.department}
          disabled
          placeholder="로그인 사용자 부서가 자동 입력됩니다."
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <DateField
            label="요청일"
            required
            value={safeForm.requestDate}
            disabled
            readOnly
            min={safeForm.requestDate}
            max={safeForm.requestDate}
          />

          <DateField
            label="희망 입고일"
            required
            value={safeForm.expectedDate}
            min={safeForm.requestDate}
            onChange={(event) => onChange("expectedDate", event.target.value)}
          />
        </div>
      </div>

      <div className="mt-3">
        <TextField
          label="요청 제목"
          required
          value={safeForm.title}
          onChange={(event) => onChange("title", event.target.value)}
          placeholder="예) 2분기 정기 설비 부품 구매 요청"
        />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <fieldset>
          <FieldLabel required>우선순위</FieldLabel>

          <div className="flex h-9 items-center gap-5 text-[11px] text-slate-600">
            {["일반", "긴급"].map((priority) => (
              <label key={priority} className="flex items-center gap-1.5">
                <input
                  type="radio"
                  name="urgency"
                  value={priority}
                  checked={safeForm.urgency === priority}
                  onChange={(event) => onChange("urgency", event.target.value)}
                  className="h-3.5 w-3.5 accent-blue-600"
                />

                {priority}
              </label>
            ))}
          </div>
        </fieldset>

        <label>
          <FieldLabel>첨부파일</FieldLabel>

          <span className="flex h-10 cursor-pointer items-center gap-2 rounded-md border border-dashed border-slate-200 px-3 text-[13px] text-slate-400 hover:border-blue-300 hover:bg-blue-50/40">
            <FileUp size={13} />

            <span className="truncate">
              {attachment?.name ??
                "견적서 또는 관련 공문을 업로드하세요 (최대 10MB)"}
            </span>

            <input
              type="file"
              onChange={onAttachmentChange}
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
            />
          </span>
        </label>
      </div>

      <label className="mt-4 block">
        <FieldLabel required>요청 사유</FieldLabel>

        <textarea
          value={safeForm.reason}
          onChange={(event) => onChange("reason", event.target.value)}
          placeholder="구매가 필요한 구체적인 사유를 입력해주세요. (예: 노후 부품 교체 및 예비 부품 확보)"
          className="min-h-24 w-full resize-y rounded-md border border-slate-200 px-3 py-2.5 text-[14px] text-slate-600 outline-none transition placeholder:text-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
      </label>
    </section>
  )
}

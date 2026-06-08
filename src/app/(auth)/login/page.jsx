import Link from "next/link"

function Icon({ children, className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-4 w-4 shrink-0 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

function CubeLogo() {
  return (
    <div className="flex h-[52px] w-[52px] items-center justify-center rounded-xl bg-blue-100">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500 shadow-sm">
        <Icon className="h-5 w-5 text-white">
          <path d="m12 3.8 6.6 3.7v8.9L12 20.2l-6.6-3.8V7.5L12 3.8Z" />
          <path d="m5.7 7.7 6.3 3.6 6.3-3.6M12 11.3v8.4" />
          <path d="m8.7 5.6 6.4 3.7" />
        </Icon>
      </div>
    </div>
  )
}

function InputField({ id, label, type = "text", placeholder, children }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-[11px] font-bold text-slate-700"
      >
        {label}
      </label>

      <div className="mt-2 flex h-11 items-center gap-2 rounded-md border border-blue-200 bg-[#f8fbff] px-3 transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
        <Icon className="text-blue-600">{children}</Icon>

        <input
          id={id}
          name={id}
          type={type}
          autoComplete={type === "password" ? "current-password" : "username"}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-[12px] text-slate-800 outline-none placeholder:text-slate-400"
          required
        />
      </div>
    </div>
  )
}

export const metadata = {
  title: "로그인 | 물류 ERP 시스템",
  description: "입고 및 재고 관리 시스템 로그인",
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col bg-[#f4f9ff] text-slate-900">
      <section className="flex flex-1 items-center justify-center px-5 py-8">
        <div className="w-full max-w-[440px] rounded-lg border border-slate-100 bg-white px-8 py-9 shadow-[0_5px_18px_rgba(15,48,86,0.04)]">
          <header className="flex flex-col items-center text-center">
            <CubeLogo />

            <h1 className="mt-5 text-[21px] font-bold tracking-[-0.04em]">
              물류 ERP 시스템
            </h1>

            <p className="mt-1 text-[11px] font-medium text-blue-700">
              입고 및 재고 관리 시스템
            </p>
          </header>

          <form className="mt-7 space-y-4">
            <InputField
              id="loginId"
              label="아이디"
              placeholder="아이디를 입력하세요"
            >
              <rect x="4.5" y="6.8" width="15" height="10.4" rx="1.5" />
              <path d="m5.3 7.7 6.7 5 6.7-5" />
            </InputField>

            <InputField
              id="password"
              label="비밀번호"
              type="password"
              placeholder="비밀번호를 입력하세요"
            >
              <rect x="5" y="10" width="14" height="10" rx="1.7" />
              <path d="M8 10V7.3a4 4 0 0 1 8 0V10" />
            </InputField>

            <label className="flex cursor-pointer items-center gap-2 text-[11px] text-slate-500">
              <input
                type="checkbox"
                name="remember"
                defaultChecked
                className="h-[14px] w-[14px] accent-blue-500"
              />
              로그인 상태 유지
            </label>

            <button
              type="button"
              className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-blue-500 text-[12px] font-bold text-white transition hover:bg-blue-600"
            >
              <Icon>
                <path d="M10 17 15 12 10 7M15 12H4" />
                <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
              </Icon>
              로그인
            </button>
          </form>

          <div className="my-7 flex items-center gap-3">
            <span className="h-px flex-1 bg-blue-100" />
            <span className="text-[11px] text-slate-500">또는</span>
            <span className="h-px flex-1 bg-blue-100" />
          </div>

          <Link
            href="/signup"
            className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-blue-200 bg-[#f8fbff] text-[12px] font-medium text-blue-700 transition hover:border-blue-400 hover:bg-blue-50"
          >
            <Icon>
              <circle cx="9" cy="7" r="4" />
              <path d="M15 20a6 6 0 0 0-12 0M19 8v6M16 11h6" />
            </Icon>
            회원가입
          </Link>

          <nav className="mt-8 flex items-center justify-center gap-4 text-[10px] font-medium text-blue-700">
            <a href="#" className="hover:underline">
              아이디 찾기
            </a>

            <span className="h-3 w-px bg-blue-100" />

            <a href="#" className="hover:underline">
              비밀번호 재설정
            </a>
          </nav>
        </div>
      </section>

      <footer className="px-5 pb-4 text-center text-[9px] leading-5 text-slate-400">
        <p>계정 관련 문의는 시스템 관리자에게 연락해 주세요.</p>
        <p>© 2026 BuyFlow ERP SYSTEM. ALL RIGHTS RESERVED.</p>
      </footer>
    </main>
  )
}

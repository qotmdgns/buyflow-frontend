import { Package } from "lucide-react"

export default function AuthShell({ children }) {
  return (
    <main className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.16),transparent_32rem),linear-gradient(180deg,#f4f8ff_0%,#eef4fb_100%)] text-slate-900">
      <section className="flex flex-1 items-center justify-center px-5 py-8">
        <div className="w-full max-w-[440px] rounded-2xl border border-white/80 bg-white/95 px-8 py-9 shadow-[0_24px_70px_rgba(15,48,86,0.14)] backdrop-blur">
          <header className="flex flex-col items-center text-center">
            <div className="flex h-[58px] w-[58px] items-center justify-center rounded-2xl bg-blue-100">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 text-white shadow-[0_12px_24px_rgba(37,99,235,0.28)]">
                <Package size={20} />
              </div>
            </div>

            <h1 className="mt-5 text-[21px] font-bold tracking-[-0.04em]">
              물류 ERP 시스템
            </h1>

            <p className="mt-1 text-[11px] font-medium text-blue-700">
              입고 및 재고 관리 시스템
            </p>
          </header>

          {children}
        </div>
      </section>

      <footer className="px-5 pb-4 text-center text-[9px] leading-5 text-slate-400">
        <p>계정 관련 문의는 시스템 관리자에게 연락해 주세요.</p>
        <p>© 2026 BuyFlow ERP SYSTEM. ALL RIGHTS RESERVED.</p>
      </footer>
    </main>
  )
}

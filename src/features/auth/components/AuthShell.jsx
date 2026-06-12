import { Package } from "lucide-react"

export default function AuthShell({ children }) {
  return (
    <main className="flex min-h-screen flex-col bg-[#f4f9ff] text-slate-900">
      <section className="flex flex-1 items-center justify-center px-5 py-8">
        <div className="w-full max-w-[440px] rounded-lg border border-slate-100 bg-white px-8 py-9 shadow-[0_5px_18px_rgba(15,48,86,0.04)]">
          <header className="flex flex-col items-center text-center">
            <div className="flex h-[52px] w-[52px] items-center justify-center rounded-xl bg-blue-100">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500 text-white shadow-sm">
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

import Header from "@/components/layout/Header"
import Sidebar from "@/components/layout/Sidebar"

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800">
      <Sidebar />

      <div className="lg:pl-[220px]">
        <Header />
        <main className="px-4 py-5 lg:px-6">{children}</main>
      </div>
    </div>
  )
}

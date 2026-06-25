import Header from "@/components/layout/Header"
import Sidebar from "@/components/layout/Sidebar"
import RequireAuth from "@/features/auth/components/RequireAuth"

export default function DashboardLayout({ children }) {
  return (
    <div className="erp-dashboard dashboard-density-90 min-h-screen bg-[#f8fafc] text-slate-800">
      <Sidebar />

      <div className="lg:pl-[220px]">
        <Header />

        <main className="px-3 py-4 lg:px-4">{children}</main>
      </div>
    </div>
  )
}

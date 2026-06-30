import Header from "@/components/layout/Header"
import Sidebar from "@/components/layout/Sidebar"
import RequireAuth from "@/features/auth/components/RequireAuth"

export default function DashboardLayout({ children }) {
  return (
    <RequireAuth>
      <div className="erp-dashboard min-h-screen text-slate-800">
        <Sidebar />

        <div className="dashboard-main-shell">
          <Header />

          <main className="dashboard-main-content">{children}</main>
        </div>
      </div>
    </RequireAuth>
  )
}

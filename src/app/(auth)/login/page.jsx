import AuthFormPage from "@/features/auth/components/AuthFormPage"
import AuthShell from "@/features/auth/components/AuthShell"

export const metadata = {
  title: "로그인 | 물류 ERP 시스템",
  description: "입고 및 재고 관리 시스템 로그인",
}

export default function LoginPage() {
  return (
    <AuthShell>
      <AuthFormPage mode="login" />
    </AuthShell>
  )
}

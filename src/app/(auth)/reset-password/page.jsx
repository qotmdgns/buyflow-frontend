import AuthFormPage from "@/features/auth/components/AuthFormPage"
import AuthShell from "@/features/auth/components/AuthShell"

export const metadata = {
  title: "비밀번호 재설정 | 물류 ERP 시스템",
}

export default function ResetPasswordPage() {
  return (
    <AuthShell>
      <AuthFormPage mode="reset-password" />
    </AuthShell>
  )
}

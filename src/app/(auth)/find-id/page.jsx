import AuthFormPage from "@/features/auth/components/AuthFormPage"
import AuthShell from "@/features/auth/components/AuthShell"

export const metadata = {
  title: "아이디 찾기 | 물류 ERP 시스템",
}

export default function FindIdPage() {
  return (
    <AuthShell>
      <AuthFormPage mode="find-id" />
    </AuthShell>
  )
}

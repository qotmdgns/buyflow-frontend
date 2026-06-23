import AuthFormPage from "@/features/auth/components/AuthFormPage"
import AuthShell from "@/features/auth/components/AuthShell"

export const metadata = {
  title: "회원가입 | 물류 ERP 시스템",
}

export default function SignupPage() {
  return (
    <AuthShell>
      <AuthFormPage mode="signup" />
    </AuthShell>
  )
}

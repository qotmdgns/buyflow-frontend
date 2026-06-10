import { redirect } from "next/navigation"

export default function ApprovalsPage() {
  // 승인 목록 화면을 만들기 전까지 샘플 승인 상세 화면으로 연결합니다.
  redirect("/approvals/1")
}

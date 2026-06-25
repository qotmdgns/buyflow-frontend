"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import {
  Building2,
  IdCard,
  LockKeyhole,
  LogIn,
  Mail,
  RotateCcw,
  Search,
  UserPlus,
  UserRound,
} from "lucide-react"
import AuthInput from "@/features/auth/components/AuthInput"
import { useAuth } from "@/features/auth/context/AuthContext"

const LOGIN_ID_PATTERN = /^[A-Za-z0-9._-]+$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const NAME_PATTERN = /^[가-힣A-Za-z ]+$/
const DEPARTMENT_OPTIONS = ["구매팀", "물류운영팀", "시스템관리팀", "영업팀", "재고관리팀"]
const RANK_OPTIONS = ["사원", "주임", "대리", "과장"]

function validateSignupInput({ name, loginId, email, department, rank, password }) {
  if (loginId.length < 4 || loginId.length > 50) {
    throw new Error("아이디는 4자 이상 50자 이하로 입력하세요.")
  }

  if (!LOGIN_ID_PATTERN.test(loginId)) {
    throw new Error("아이디는 영문, 숫자, 점, 밑줄, 하이픈만 사용할 수 있습니다.")
  }

  if (name.length > 50 || !NAME_PATTERN.test(name)) {
    throw new Error("이름은 한글, 영문, 공백만 입력할 수 있습니다.")
  }

  if (email.length > 100 || !EMAIL_PATTERN.test(email)) {
    throw new Error("올바른 이메일 형식으로 입력하세요.")
  }

  if (!DEPARTMENT_OPTIONS.includes(department)) {
    throw new Error("등록 가능한 부서를 선택하세요.")
  }

  if (!RANK_OPTIONS.includes(rank)) {
    throw new Error("등록 가능한 직급을 선택하세요.")
  }

  if (password.length < 8 || password.length > 100) {
    throw new Error("비밀번호는 8자 이상 100자 이하로 입력하세요.")
  }
}

const FORM_CONFIG = {
  login: {
    submitLabel: "로그인",
    submitIcon: LogIn,
    fields: [
      {
        id: "loginId",
        label: "아이디",
        icon: IdCard,
        placeholder: "아이디를 입력하세요",
        autoComplete: "username",
      },
      {
        id: "password",
        label: "비밀번호",
        icon: LockKeyhole,
        type: "password",
        placeholder: "비밀번호를 입력하세요",
        autoComplete: "current-password",
      },
    ],
  },

  signup: {
    title: "회원가입",
    description: "사용자 계정을 등록합니다.",
    submitLabel: "회원가입",
    submitIcon: UserPlus,
    fields: [
      {
        id: "name",
        label: "이름",
        icon: UserRound,
        placeholder: "이름을 입력하세요",
      },
      {
        id: "loginId",
        label: "아이디",
        icon: IdCard,
        placeholder: "사용할 아이디를 입력하세요",
      },
      {
        id: "email",
        label: "이메일",
        icon: Mail,
        type: "email",
        placeholder: "이메일을 입력하세요",
      },
      {
        id: "department",
        label: "부서",
        icon: Building2,
        placeholder: "부서를 선택하세요",
        options: DEPARTMENT_OPTIONS,
      },
      {
        id: "rank",
        label: "직급",
        icon: UserRound,
        placeholder: "직급을 선택하세요",
        options: RANK_OPTIONS,
      },
      {
        id: "password",
        label: "비밀번호",
        icon: LockKeyhole,
        type: "password",
        placeholder: "비밀번호를 입력하세요",
        autoComplete: "new-password",
      },
      {
        id: "passwordConfirm",
        label: "비밀번호 확인",
        icon: LockKeyhole,
        type: "password",
        placeholder: "비밀번호를 다시 입력하세요",
        autoComplete: "new-password",
      },
    ],
  },

  "find-id": {
    title: "아이디 찾기",
    description: "가입할 때 입력한 이름과 이메일을 확인합니다.",
    submitLabel: "아이디 찾기",
    submitIcon: Search,
    fields: [
      {
        id: "name",
        label: "이름",
        icon: UserRound,
        placeholder: "이름을 입력하세요",
      },
      {
        id: "email",
        label: "이메일",
        icon: Mail,
        type: "email",
        placeholder: "이메일을 입력하세요",
      },
    ],
  },

  "reset-password": {
    title: "비밀번호 재설정",
    description: "아이디와 이메일을 확인한 뒤 새 비밀번호를 등록합니다.",
    submitLabel: "비밀번호 변경",
    submitIcon: RotateCcw,
    fields: [
      {
        id: "loginId",
        label: "아이디",
        icon: IdCard,
        placeholder: "아이디를 입력하세요",
      },
      {
        id: "email",
        label: "이메일",
        icon: Mail,
        type: "email",
        placeholder: "이메일을 입력하세요",
      },
      {
        id: "newPassword",
        label: "새 비밀번호",
        icon: LockKeyhole,
        type: "password",
        placeholder: "새 비밀번호를 입력하세요",
        autoComplete: "new-password",
      },
      {
        id: "passwordConfirm",
        label: "새 비밀번호 확인",
        icon: LockKeyhole,
        type: "password",
        placeholder: "새 비밀번호를 다시 입력하세요",
        autoComplete: "new-password",
      },
    ],
  },
}

export default function AuthFormPage({ mode }) {
  const router = useRouter()
  const { login, signup, findLoginId, resetPassword } = useAuth()
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  const config = FORM_CONFIG[mode]
  const SubmitIcon = config.submitIcon

  async function handleSubmit(event) {
    event.preventDefault()

    setError("")
    setMessage("")

    const formElement = event.currentTarget
    const formData = new FormData(formElement)

    function getValue(key) {
      return String(formData.get(key) ?? "").trim()
    }

    try {
      if (mode === "login") {
        await login({
          loginId: getValue("loginId"),
          password: getValue("password"),
          remember: formData.get("remember") === "on",
        })

        router.push("/dashboard")
        return
      }

      if (mode === "signup") {
        const password = getValue("password")
        const passwordConfirm = getValue("passwordConfirm")
        const signupValues = {
          name: getValue("name"),
          loginId: getValue("loginId"),
          email: getValue("email"),
          department: getValue("department"),
          rank: getValue("rank"),
          password,
        }

        validateSignupInput(signupValues)

        if (password !== passwordConfirm) {
          throw new Error("비밀번호와 비밀번호 확인이 일치하지 않습니다.")
        }

        await signup({
          name: signupValues.name,
          loginId: signupValues.loginId,
          email: signupValues.email,
          department: signupValues.department,
          rank: signupValues.rank,
          password,
        })

        formElement.reset()
        setMessage("회원가입이 완료되었습니다. 로그인 화면에서 로그인하세요.")
        return
      }

      if (mode === "find-id") {
        const loginId = await findLoginId({
          name: getValue("name"),
          email: getValue("email"),
        })

        setMessage(`회원님의 아이디는 ${loginId} 입니다.`)
        return
      }

      if (mode === "reset-password") {
        const newPassword = getValue("newPassword")
        const passwordConfirm = getValue("passwordConfirm")

        if (newPassword !== passwordConfirm) {
          throw new Error("새 비밀번호와 비밀번호 확인이 일치하지 않습니다.")
        }

        await resetPassword({
          loginId: getValue("loginId"),
          email: getValue("email"),
          newPassword,
        })

        formElement.reset()
        setMessage("비밀번호가 변경되었습니다. 새 비밀번호로 로그인하세요.")
      }
    } catch (submitError) {
      setError(submitError.message)
    }
  }

  return (
    <>
      {config.title && (
        <div className="mt-6 text-center">
          <h2 className="text-[16px] font-bold">{config.title}</h2>

          <p className="mt-1 text-[11px] text-slate-400">
            {config.description}
          </p>
        </div>
      )}

      <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
        {config.fields.map((field) => (
          <AuthInput key={field.id} {...field} required />
        ))}

        {mode === "login" && (
          <label className="flex cursor-pointer items-center gap-2 text-[11px] text-slate-500">
            <input
              type="checkbox"
              name="remember"
              defaultChecked
              className="h-[14px] w-[14px] accent-blue-500"
            />
            로그인 상태 유지
          </label>
        )}

        {error && <p className="text-[11px] text-rose-500">{error}</p>}

        {message && (
          <p className="rounded-md bg-emerald-50 p-3 text-[11px] text-emerald-700">
            {message}
          </p>
        )}

        <button
          type="submit"
          className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-blue-500 text-[12px] font-bold text-white transition hover:bg-blue-600"
        >
          <SubmitIcon size={15} />
          {config.submitLabel}
        </button>
      </form>

      {mode === "login" ? (
        <>
          <div className="my-7 flex items-center gap-3">
            <span className="h-px flex-1 bg-blue-100" />
            <span className="text-[11px] text-slate-500">또는</span>
            <span className="h-px flex-1 bg-blue-100" />
          </div>

          <Link
            href="/signup"
            className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-blue-200 bg-[#f8fbff] text-[12px] font-medium text-blue-700 transition hover:border-blue-400 hover:bg-blue-50"
          >
            <UserPlus size={15} />
            회원가입
          </Link>

          <nav className="mt-8 flex items-center justify-center gap-4 text-[10px] font-medium text-blue-700">
            <Link href="/find-id" className="hover:underline">
              아이디 찾기
            </Link>

            <span className="h-3 w-px bg-blue-100" />

            <Link href="/reset-password" className="hover:underline">
              비밀번호 재설정
            </Link>
          </nav>

          <p className="mt-6 text-center text-[10px] text-slate-400">
            테스트 계정: kimcs / 1234
          </p>
        </>
      ) : (
        <Link
          href="/login"
          className="mt-6 block text-center text-[11px] font-medium text-blue-700 hover:underline"
        >
          로그인 화면으로 돌아가기
        </Link>
      )}
    </>
  )
}

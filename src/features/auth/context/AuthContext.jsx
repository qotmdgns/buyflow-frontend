"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import {
  findLoginId as findLoginIdRequest,
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  resetPassword as resetPasswordRequest,
  signup as signupRequest,
} from "@/features/auth/api/authApi"

const AuthContext = createContext(null)

const INITIAL_AUTH_STATE = {
  user: null,
  isAuthReady: false,
}

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(INITIAL_AUTH_STATE)

  useEffect(() => {
    /*
      localStorage와 sessionStorage는 서버 렌더링 중에 읽을 수 없습니다.
      화면이 브라우저에 마운트된 뒤 저장된 로그인 세션을 복원합니다.
    */

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAuthState({
      user: getCurrentUser(),
      isAuthReady: true,
    })
  }, [])

  const auth = useMemo(
    () => ({
      user: authState.user,
      isLoggedIn: Boolean(authState.user),
      isAuthReady: authState.isAuthReady,

      login(values) {
        const nextUser = loginRequest(values)

        setAuthState({
          user: nextUser,
          isAuthReady: true,
        })

        return nextUser
      },

      logout() {
        logoutRequest()

        setAuthState({
          user: null,
          isAuthReady: true,
        })
      },

      signup: signupRequest,
      findLoginId: findLoginIdRequest,
      resetPassword: resetPasswordRequest,
    }),
    [authState],
  )

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth는 AuthProvider 내부에서 사용해야 합니다.")
  }

  return context
}

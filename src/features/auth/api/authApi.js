const USERS_STORAGE_KEY = "buyflow.users"
const LOCAL_SESSION_KEY = "buyflow.auth.local-session"
const SESSION_SESSION_KEY = "buyflow.auth.session-session"

const DEFAULT_USERS = [
  {
    id: "user-001",
    dbUserId: 1,
    employeeNo: "EMP-2024-001",
    loginId: "kimcs",
    password: "1234",
    name: "김철수",
    rank: "대리",
    department: "물류운영팀",
    email: "kimcs@buyflow.co.kr",
    phone: "010-1234-5678",
    role: "물류 운영 담당자",
    accountStatus: "정상",
    lastLoginAt: "2026-06-12 15:30",
  },
]

function canUseBrowserStorage() {
  return typeof window !== "undefined"
}

function readJson(storage, key, fallbackValue) {
  try {
    const rawValue = storage.getItem(key)

    return rawValue ? JSON.parse(rawValue) : fallbackValue
  } catch {
    return fallbackValue
  }
}

function writeJson(storage, key, value) {
  storage.setItem(key, JSON.stringify(value))
}

function getUsers() {
  if (!canUseBrowserStorage()) {
    return DEFAULT_USERS
  }

  const savedUsers = readJson(window.localStorage, USERS_STORAGE_KEY, null)

  if (savedUsers) {
    return savedUsers
  }

  writeJson(window.localStorage, USERS_STORAGE_KEY, DEFAULT_USERS)

  return DEFAULT_USERS
}

function saveUsers(users) {
  writeJson(window.localStorage, USERS_STORAGE_KEY, users)
}

function sanitizeUser(user) {
  const { password, ...safeUser } = user

  return safeUser
}

function saveSession(user, remember) {
  const safeUser = sanitizeUser(user)

  window.localStorage.removeItem(LOCAL_SESSION_KEY)
  window.sessionStorage.removeItem(SESSION_SESSION_KEY)

  if (remember) {
    writeJson(window.localStorage, LOCAL_SESSION_KEY, safeUser)
    return
  }

  writeJson(window.sessionStorage, SESSION_SESSION_KEY, safeUser)
}

export function getCurrentUser() {
  if (!canUseBrowserStorage()) {
    return null
  }

  return (
    readJson(window.sessionStorage, SESSION_SESSION_KEY, null) ??
    readJson(window.localStorage, LOCAL_SESSION_KEY, null)
  )
}

export function login({ loginId, password, remember }) {
  const normalizedLoginId = loginId.trim()

  const user = getUsers().find(
    (item) => item.loginId === normalizedLoginId && item.password === password,
  )

  if (!user) {
    throw new Error("아이디 또는 비밀번호가 올바르지 않습니다.")
  }

  saveSession(user, remember)

  return sanitizeUser(user)
}

export function logout() {
  if (!canUseBrowserStorage()) {
    return
  }

  window.localStorage.removeItem(LOCAL_SESSION_KEY)
  window.sessionStorage.removeItem(SESSION_SESSION_KEY)
}

export function signup({ loginId, password, name, email, department, rank }) {
  const users = getUsers()
  const normalizedLoginId = loginId.trim()
  const normalizedEmail = email.trim().toLowerCase()

  if (users.some((item) => item.loginId === normalizedLoginId)) {
    throw new Error("이미 사용 중인 아이디입니다.")
  }

  if (users.some((item) => item.email.toLowerCase() === normalizedEmail)) {
    throw new Error("이미 가입된 이메일입니다.")
  }

  const newUser = {
    id: `user-${Date.now()}`,
    loginId: normalizedLoginId,
    password,
    name: name.trim(),
    email: normalizedEmail,
    department: department.trim(),
    rank: rank.trim(),
    role: "일반 사용자",
  }

  saveUsers([...users, newUser])

  return sanitizeUser(newUser)
}

export function findLoginId({ name, email }) {
  const normalizedName = name.trim()
  const normalizedEmail = email.trim().toLowerCase()

  const user = getUsers().find(
    (item) =>
      item.name === normalizedName &&
      item.email.toLowerCase() === normalizedEmail,
  )

  if (!user) {
    throw new Error("입력한 정보와 일치하는 계정을 찾을 수 없습니다.")
  }

  return user.loginId
}

export function resetPassword({ loginId, email, newPassword }) {
  const users = getUsers()
  const normalizedLoginId = loginId.trim()
  const normalizedEmail = email.trim().toLowerCase()

  const userIndex = users.findIndex(
    (item) =>
      item.loginId === normalizedLoginId &&
      item.email.toLowerCase() === normalizedEmail,
  )

  if (userIndex < 0) {
    throw new Error("입력한 정보와 일치하는 계정을 찾을 수 없습니다.")
  }

  const nextUsers = users.map((item, index) =>
    index === userIndex
      ? {
          ...item,
          password: newPassword,
        }
      : item,
  )

  saveUsers(nextUsers)
}

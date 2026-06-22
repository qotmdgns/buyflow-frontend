// src/features/system/utils/recommendRole.js
//
// 부서·직급 → 추천 역할(접근역할 1개)을 돌려준다.
// 등록 폼의 부서·직급이 "자유 입력(텍스트)"이라, 정확히 일치(===)가 아니라
// 공백 제거 + 키워드 포함(includes)으로 매칭한다. (표기 흔들림 대응)
// 어디까지나 "기본값"이며, admin이 권한 그룹 드롭다운에서 바꿀 수 있다.
// 반환값: ROLE_ 접두사 없는 코드(ADMIN/MANAGER/WAREHOUSE/VIEWER/REQUESTER/APPROVER)

const SENIOR_RANK_KEYWORDS = ["과장", "차장", "부장", "팀장", "이사", "본부장"]
const LEAD_RANK_KEYWORDS = ["팀장", "부장", "이사", "본부장"]

const norm = (s) => (s || "").replace(/\s/g, "")
const hasAny = (text, keywords) => keywords.some((k) => text.includes(k))

export function recommendRole(department, position) {
  const dept = norm(department)
  const pos = norm(position)

  // 구매 계열(구매팀/구매관리팀): 직급으로 요청 → 승인 → 관리 단계 구분
  if (dept.includes("구매")) {
    if (hasAny(pos, LEAD_RANK_KEYWORDS)) return "MANAGER"
    if (hasAny(pos, SENIOR_RANK_KEYWORDS)) return "APPROVER" // 과장 등
    return "REQUESTER" // 사원/주임/대리
  }

  // 창고 계열(물류운영팀/재고관리팀/창고): 직급 무관 창고 업무
  if (dept.includes("물류") || dept.includes("재고") || dept.includes("창고")) {
    return "WAREHOUSE"
  }

  // 영업팀 / 시스템관리팀 / 기타: 조회 기본
  //  - 시스템관리팀의 실제 관리자는 등록 후 수동 ADMIN 지정 (슈퍼유저 자동 금지)
  //  - 영업팀이 구매요청을 올린다면 REQUESTER로 변경
  return "VIEWER"
}

// 프론트 roleId 형식(ROLE_ 접두사)에 맞춰 쓰고 싶을 때
export function recommendRoleId(department, position) {
  return `ROLE_${recommendRole(department, position)}`
}
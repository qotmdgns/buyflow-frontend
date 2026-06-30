# BuyFlow ERP

구매 요청부터 승인, 발주, 입고, 검수, 재고 관리까지 물류 업무의 흐름을 통합적으로 관리하기 위한 **웹 기반 ERP 시스템**입니다.

BuyFlow ERP는 **Next.js 프론트엔드**, **Spring Boot 백엔드**, **Oracle Autonomous Database**를 기반으로 구현했으며, 최종적으로 **Docker, OCIR, Oracle Kubernetes Engine(OKE), NGINX Ingress, GitHub Actions**를 이용한 CI/CD 자동화 배포까지 완료했습니다.

---

## 1. 프로젝트 개요

### 프로젝트명

```text
BuyFlow ERP
```

### 서비스 주소

```text
https://buyflow-system.168-110-117-4.nip.io
```

### 프로젝트 목적

기업 내부의 구매 및 물류 업무는 품목 등록, 구매 요청, 승인, 발주, 입고, 검수, 재고 반영 등 여러 단계를 거칩니다.

BuyFlow ERP는 이러한 업무 흐름을 하나의 시스템에서 처리할 수 있도록 구성한 물류 ERP 프로젝트입니다.

```text
품목 / 공급업체 / 창고 관리
        ↓
구매 요청 등록
        ↓
승인 또는 반려
        ↓
발주 처리
        ↓
입고 처리
        ↓
검수 처리
        ↓
재고 반영 및 이력 관리
```

---

## 2. Repository 구성

```text
BuyFlow-ERP
├── frontend-buyflow
├── backend-buyflow
└── buyflow-deploy
```

| Repository       | 역할                                                | 운영 기준 브랜치 |
| ---------------- | --------------------------------------------------- | ---------------- |
| frontend-buyflow | Next.js 프론트엔드                                  | master           |
| backend-buyflow  | Spring Boot REST API                                | main             |
| buyflow-deploy   | Kubernetes manifest 및 GitHub Actions 배포 workflow | master           |

---

## 3. 주요 기능

### 인증 및 사용자 관리

- 로그인
- 회원가입
- 아이디 찾기
- 비밀번호 재설정
- 직원 등록
- 사용자 관리
- 역할 및 권한 관리
- 관리자 / 요청자 / 구매담당자 역할 구분
- 메뉴 접근 권한 제어

### 대시보드

- 물류 업무 현황 요약
- 납기 지연 발주 건수 확인
- 승인 대기 요청 건수 확인
- 입고 예정 건수 확인
- 검수 대기 건수 확인
- 안전재고 부족 품목 확인
- 월별 입고 현황 차트
- 재고 상태 비율 차트
- 최근 구매 요청 목록
- 안전재고 부족 품목 목록

### 기준정보 관리

- 품목 관리
- 공급업체 관리
- 창고 관리

### 구매 요청 관리

- 구매 요청 등록
- 구매 요청 목록 조회
- 구매 요청 상세 조회
- 구매 요청 수정 및 삭제
- 구매 요청 취소
- 요청 상태 관리
- 품목 선택 모달
- 첨부파일 업로드
- 구매 요청 검색 및 필터링

### 승인 관리

- 승인 목록 조회
- 승인 상세 조회
- 승인 처리
- 반려 처리
- 요청 취소 처리
- 승인 이력 확인
- 첨부파일 확인

### 발주 관리

- 발주 등록
- 발주 목록 조회
- 발주 상세 조회
- 발주 수정
- 발주 상태 변경

### 입고 관리

- 입고 목록 조회
- 입고 등록
- 발주 기반 입고 처리
- 입고 상세 조회
- 입고 처리에 따른 재고 증가

### 검수 관리

- 검수 목록 조회
- 검수 등록
- 검수 결과 처리
- 검수 완료 목록 조회

### 재고 관리

- 재고 조회
- 창고별 재고 확인
- 안전재고 부족 품목 확인
- 재고 이력 조회
- 재고 변동 이력 관리

### 공통 기능

- 공통 레이아웃
- 사이드바 메뉴
- 권한 기반 메뉴 접근
- 첨부파일 처리
- 엑셀 다운로드
- 공통 API 요청 처리

---

## 4. 기술 스택

### Frontend

| 구분            | 기술                      |
| --------------- | ------------------------- |
| Language        | JavaScript ES6+           |
| UI Library      | React 19                  |
| Framework       | Next.js 16                |
| Routing         | Next.js App Router        |
| Styling         | Tailwind CSS              |
| Chart           | Recharts                  |
| Icon            | lucide-react              |
| Build           | Next.js standalone output |
| Package Manager | npm                       |

### Backend

| 구분       | 기술                 |
| ---------- | -------------------- |
| Language   | Java                 |
| Framework  | Spring Boot          |
| Security   | Spring Security, JWT |
| ORM        | Spring Data JPA      |
| DB Driver  | Oracle JDBC          |
| Build Tool | Gradle               |
| Runtime    | Java 17              |

### Database

| 구분       | 기술                       |
| ---------- | -------------------------- |
| DBMS       | Oracle Autonomous Database |
| Connection | Oracle Wallet              |
| Schema     | BuyFlow.sql                |

### DevOps / Infra

| 구분               | 기술                                       |
| ------------------ | ------------------------------------------ |
| Container          | Docker                                     |
| Container Registry | Oracle Cloud Infrastructure Registry, OCIR |
| Orchestration      | Oracle Kubernetes Engine, OKE              |
| Ingress            | NGINX Ingress Controller                   |
| TLS                | cert-manager, Let's Encrypt                |
| CI/CD              | GitHub Actions                             |
| Domain             | nip.io                                     |

---

## 5. 시스템 아키텍처

```text
사용자
  ↓
https://buyflow-system.168-110-117-4.nip.io
  ↓
nip.io DNS
  ↓
Oracle Cloud Load Balancer
  ↓
NGINX Ingress Controller
  ↓
Oracle Kubernetes Engine
  ↓
namespace: buyflow
  ├── frontend Deployment
  ├── frontend Service
  ├── backend Deployment
  ├── backend Service
  ├── ConfigMap
  ├── Secret
  ├── Oracle Wallet Secret
  └── OCIR Pull Secret
  ↓
Oracle Autonomous Database
```

---

## 6. CI/CD 배포 구조

최종 배포 흐름은 다음과 같습니다.

```text
frontend-buyflow/master 또는 backend-buyflow/main push
        ↓
각 repository의 trigger-deploy workflow 실행
        ↓
buyflow-deploy/master의 deploy workflow 호출
        ↓
GitHub Actions 실행
        ↓
frontend-buyflow/master checkout
backend-buyflow/main checkout
        ↓
Frontend Docker image build
Backend Docker image build
        ↓
OCIR에 Docker image push
        ↓
Kubernetes manifest image tag 갱신
        ↓
OKE에 kubectl apply
        ↓
Deployment rollout 확인
        ↓
Ingress / LoadBalancer / Domain 연결
        ↓
사용자 접속
```

### 배포 이미지 예시

```text
yny.ocir.io/ax0caghpplpc/buyflow-frontend:<timestamp>
yny.ocir.io/ax0caghpplpc/buyflow-backend:<timestamp>
```

### GitHub Actions workflow 구성

| Repository       | Workflow                             | 역할                                             |
| ---------------- | ------------------------------------ | ------------------------------------------------ |
| frontend-buyflow | .github/workflows/trigger-deploy.yml | master push 시 buyflow-deploy 배포 workflow 호출 |
| backend-buyflow  | .github/workflows/trigger-deploy.yml | main push 시 buyflow-deploy 배포 workflow 호출   |
| buyflow-deploy   | .github/workflows/deploy.yml         | Docker build, OCIR push, OKE 배포 수행           |

### buyflow-deploy workflow 주요 작업

```text
1. buyflow-deploy repository checkout
2. frontend-buyflow/master checkout
3. backend-buyflow/main checkout
4. OCI CLI 설치 및 인증
5. OCIR 로그인
6. Frontend Docker image build
7. Backend Docker image build
8. OCIR push
9. OKE kubeconfig 생성
10. Kubernetes Secret 생성 또는 갱신
11. Oracle Wallet Secret 생성 또는 갱신
12. OCIR imagePullSecret 생성 또는 갱신
13. ConfigMap 및 Service 적용
14. Deployment manifest image tag 갱신
15. Deployment apply
16. Ingress apply
17. rollout status 확인
18. 실제 배포 이미지 확인
19. 비정상 Pod 검사
```

---

## 7. Kubernetes 배포 구성

```text
namespace: buyflow

frontend
  ├── Deployment
  └── Service, ClusterIP, 3000

backend
  ├── Deployment
  └── Service, ClusterIP, 8080

common
  ├── ConfigMap
  ├── Secret
  ├── Oracle Wallet Secret
  └── OCIR imagePullSecret

external access
  └── NGINX Ingress
```

### 주요 manifest

```text
buyflow-deploy/k8s/namespace.yaml
buyflow-deploy/k8s/configmap.yaml
buyflow-deploy/k8s/backend-deployment.yaml
buyflow-deploy/k8s/backend-service.yaml
buyflow-deploy/k8s/frontend-deployment.yaml
buyflow-deploy/k8s/frontend-service.yaml
buyflow-deploy/k8s/ingress.yaml
buyflow-deploy/k8s/cert-manager/cluster-issuer-prod.yaml
buyflow-deploy/k8s/cert-manager/cluster-issuer-staging.yaml
```

---

## 8. 데이터베이스 구조

BuyFlow ERP의 데이터베이스는 Oracle 기반으로 구성되어 있습니다.

### 주요 테이블

| 테이블                         | 역할                  |
| ------------------------------ | --------------------- |
| USERS                          | 사용자 정보           |
| ROLES                          | 역할 정보             |
| PERMISSIONS                    | 권한 정보             |
| USER_ROLES                     | 사용자-역할 매핑      |
| ROLE_PERMISSIONS               | 역할-권한 매핑        |
| DEPARTMENT_PERMISSIONS         | 부서별 권한 정보      |
| DEPARTMENT_ROLE_ASSIGN_RULES   | 부서별 역할 부여 규칙 |
| USER_DEPARTMENT_AUTHORIZATIONS | 사용자 부서 권한 정보 |
| PRODUCTS                       | 품목 기준정보         |
| SUPPLIER                       | 공급업체 기준정보     |
| WAREHOUSE                      | 창고 기준정보         |
| PURCHASE_REQUESTS              | 구매 요청 마스터      |
| PURCHASE_REQUEST_ITEM          | 구매 요청 품목 상세   |
| APPROVAL_HISTORY               | 승인 이력             |
| PURCHASE_ORDER                 | 발주 마스터           |
| PURCHASE_ORDER_ITEM            | 발주 품목 상세        |
| RECEIPT                        | 입고 마스터           |
| RECEIPT_ITEM                   | 입고 품목 상세        |
| INSPECTION                     | 검수 정보             |
| STOCK                          | 재고 현황             |
| STOCK_HISTORY                  | 재고 변동 이력        |
| ATTACHMENT                     | 첨부파일 메타데이터   |
| EXCEL_EXPORT_HISTORY           | 엑셀 다운로드 이력    |
| EMAIL_VERIFICATION_CODES       | 이메일 인증 코드      |
| PASSWORD_RESET_TOKENS          | 비밀번호 재설정 토큰  |

### 핵심 데이터 흐름

```text
USERS
  ↓
PURCHASE_REQUESTS
  ↓
PURCHASE_REQUEST_ITEM
  ↓
APPROVAL_HISTORY
  ↓
PURCHASE_ORDER
  ↓
PURCHASE_ORDER_ITEM
  ↓
RECEIPT
  ↓
RECEIPT_ITEM
  ↓
INSPECTION
  ↓
STOCK
  ↓
STOCK_HISTORY
```

---

## 9. 화면 개발 현황

| 구분        | 화면                | URL                                  | 상태 |
| ----------- | ------------------- | ------------------------------------ | ---- |
| 인증        | 로그인              | /login                               | 완료 |
| 인증        | 회원가입            | /signup                              | 완료 |
| 인증        | 아이디 찾기         | /find-id                             | 완료 |
| 인증        | 비밀번호 재설정     | /reset-password                      | 완료 |
| 대시보드    | 현황 요약           | /dashboard                           | 완료 |
| 품목 관리   | 품목 목록 및 검색   | /products                            | 완료 |
| 품목 관리   | 품목 등록           | /products/new                        | 완료 |
| 품목 관리   | 품목 수정           | /products/{productId}/edit           | 완료 |
| 공급업체    | 공급업체 목록       | /suppliers                           | 완료 |
| 공급업체    | 공급업체 등록       | /suppliers/new                       | 완료 |
| 공급업체    | 공급업체 수정       | /suppliers/{supplierId}/edit         | 완료 |
| 창고 관리   | 창고 목록           | /warehouses                          | 완료 |
| 구매 요청   | 구매 요청 목록      | /purchase-requests                   | 완료 |
| 구매 요청   | 구매 요청 등록      | /purchase-requests/new               | 완료 |
| 구매 요청   | 구매 요청 상세      | /purchase-requests/{requestId}       | 완료 |
| 구매 요청   | 구매 요청 수정      | /purchase-requests/{requestId}/edit  | 완료 |
| 승인 관리   | 승인 목록           | /approvals                           | 완료 |
| 승인 관리   | 승인 상세           | /approvals/{approvalId}              | 완료 |
| 발주 관리   | 발주 목록           | /purchase-orders                     | 완료 |
| 발주 관리   | 발주 등록           | /purchase-orders/new                 | 완료 |
| 발주 관리   | 발주 수정           | /purchase-orders/{orderId}/edit      | 완료 |
| 입고 관리   | 입고 목록           | /receipts                            | 완료 |
| 입고 관리   | 입고 등록           | /receipts/new                        | 완료 |
| 입고 관리   | 발주 기반 입고      | /receipts/order/{orderId}            | 완료 |
| 검수 관리   | 검수 목록           | /inspections                         | 완료 |
| 검수 관리   | 검수 상세           | /inspections/{inspectionId}          | 완료 |
| 검수 관리   | 검수 등록           | /inspections/{inspectionId}/register | 완료 |
| 검수 관리   | 검수 완료 목록      | /inspections/completed               | 완료 |
| 재고 관리   | 재고 현황           | /stock                               | 완료 |
| 재고 관리   | 재고 이력           | /stock/history                       | 완료 |
| 시스템 관리 | 사용자 및 권한 관리 | /system                              | 완료 |

---

## 10. 프론트엔드 디렉터리 구조

```text
frontend-buyflow
├── public
├── src
│   ├── app
│   │   ├── (auth)
│   │   └── (dashboard)
│   ├── components
│   │   ├── common
│   │   └── layout
│   ├── features
│   │   ├── auth
│   │   ├── dashboard
│   │   ├── product
│   │   ├── supplier
│   │   ├── warehouse
│   │   ├── purchase-request
│   │   ├── approval
│   │   ├── purchase-order
│   │   ├── receipt
│   │   ├── inspection
│   │   ├── stock
│   │   └── system
│   ├── lib
│   │   └── api
│   ├── constants
│   ├── hooks
│   └── utils
├── Dockerfile
├── next.config.mjs
├── package.json
└── package-lock.json
```

### 주요 폴더 역할

| 폴더           | 역할                                    |
| -------------- | --------------------------------------- |
| src/app        | Next.js App Router 기반 화면 경로 관리  |
| src/components | 공통 UI 및 레이아웃 컴포넌트 관리       |
| src/features   | 업무 기능별 API, 컴포넌트, 훅 관리      |
| src/lib/api    | 백엔드 API 통신 공통 로직 관리          |
| src/constants  | 상태 코드, 메뉴명 등 상수 관리          |
| src/hooks      | 공통 React Hook 관리                    |
| src/utils      | 날짜, 금액, 수량 포맷 등 유틸 함수 관리 |

---

## 11. 백엔드 디렉터리 구조

```text
backend-buyflow
├── src/main/java/com/buyflow/erp
│   ├── Common
│   ├── Config
│   ├── Controller
│   ├── Dto
│   ├── Entity
│   ├── Exception
│   ├── Repository
│   ├── Security
│   ├── Service
│   └── Util
├── src/main/resources
│   ├── application.properties
│   └── db
├── Dockerfile
├── build.gradle
├── settings.gradle
└── gradlew
```

### 주요 계층

| 계층       | 역할                              |
| ---------- | --------------------------------- |
| Controller | REST API 요청 처리                |
| Service    | 비즈니스 로직 처리                |
| Repository | 데이터베이스 접근                 |
| Entity     | DB 테이블 매핑                    |
| DTO        | 요청 및 응답 데이터 전달          |
| Security   | JWT 인증 및 권한 처리             |
| Config     | Security, CORS, Swagger, Web 설정 |
| Common     | 공통 응답, 예외, 에러 코드 관리   |

---

## 12. 로컬 실행 방법

### Frontend

```bash
git clone https://github.com/BuyFlow-ERP/frontend-buyflow.git
cd frontend-buyflow
npm install
npm run dev
```

로컬 접속 주소:

```text
http://localhost:3000
```

### Backend

```bash
git clone https://github.com/BuyFlow-ERP/backend-buyflow.git
cd backend-buyflow
./gradlew bootRun
```

백엔드 기본 주소:

```text
http://localhost:8080/api
```

---

## 13. 환경변수

### Frontend

프로젝트 루트에 `.env.local` 파일을 생성합니다.

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
API_INTERNAL_BASE_URL=http://localhost:8080

NEXT_PUBLIC_USE_DASHBOARD_MOCK=false
NEXT_PUBLIC_USE_PRODUCT_MOCK=false
NEXT_PUBLIC_USE_PURCHASE_REQUEST_MOCK=false
NEXT_PUBLIC_USE_APPROVAL_MOCK=false
NEXT_PUBLIC_USE_SUPPLIER_MOCK=false
NEXT_PUBLIC_USE_WAREHOUSE_MOCK=false
NEXT_PUBLIC_USE_PURCHASE_ORDER_MOCK=false
NEXT_PUBLIC_USE_RECEIPT_MOCK=false
NEXT_PUBLIC_USE_INSPECTION_MOCK=false
NEXT_PUBLIC_USE_STOCK_MOCK=false
```

### Backend

```env
DB_URL=jdbc:oracle:thin:@<SERVICE_NAME>?TNS_ADMIN=/app/wallet
DB_USERNAME=<DB_USERNAME>
DB_PASSWORD=<DB_PASSWORD>
JWT_SECRET=<JWT_SECRET>
CORS_ALLOWED_ORIGIN=http://localhost:3000
JWT_EXPIRATION_MINUTES=120
```

주의 사항:

- `.env.local`은 GitHub에 업로드하지 않습니다.
- DB 비밀번호, JWT Secret, Oracle Wallet 파일은 GitHub에 직접 올리지 않습니다.
- 운영 환경의 민감 정보는 GitHub Actions Secrets와 Kubernetes Secret으로 관리합니다.

---

## 14. GitHub Actions Secrets

### buyflow-deploy repository

```text
CHECKOUT_TOKEN
OCIR_USERNAME
OCIR_AUTH_TOKEN
OCI_USER_OCID
OCI_TENANCY_OCID
OCI_FINGERPRINT
OCI_PRIVATE_KEY_B64
OCI_REGION
OKE_CLUSTER_OCID
DB_URL
DB_USERNAME
DB_PASSWORD
JWT_SECRET
ORACLE_WALLET_ZIP_B64
```

### frontend-buyflow / backend-buyflow repository

```text
DEPLOY_PAT
```

`DEPLOY_PAT`는 frontend 또는 backend repository의 push 이벤트에서 `buyflow-deploy` repository의 `deploy.yml` workflow를 호출하기 위해 사용합니다.

---

## 15. 배포 결과 확인 명령어

```bash
kubectl get pods -n buyflow
kubectl get svc -n buyflow
kubectl get ingress -n buyflow
```

배포 이미지 확인:

```bash
kubectl get deployment buyflow-frontend -n buyflow -o jsonpath="{.spec.template.spec.containers[0].image}"
kubectl get deployment buyflow-backend -n buyflow -o jsonpath="{.spec.template.spec.containers[0].image}"
```

rollout 확인:

```bash
kubectl rollout status deployment/buyflow-frontend -n buyflow
kubectl rollout status deployment/buyflow-backend -n buyflow
```

---

## 16. 팀 정보

### 김호현

- 역할: 팀장
- 담당 영역: DevOps, 대시보드, 품목관리, 구매 요청, 승인 관리
- 구현 내용:
  - Docker, Kubernetes, OKE, OCIR, GitHub Actions CI/CD 구성
  - 대시보드 화면 및 데이터 연동
  - 품목관리 기능 구현
  - 구매 요청 등록, 구매 요청 목록, 구매 요청 상세, 구매 요청 수정/삭제 구현
  - 승인/반려 처리 및 요청 상태 관리 구현

### 하지수

- 역할: 팀원
- 담당 영역: 발주, 검수, 첨부파일, 엑셀 다운로드
- 구현 내용:
  - 공급업체 관리 기능 구현
  - 발주 등록, 발주 목록, 발주 상세 기능 구현
  - 발주 상태 변경 기능 구현
  - 검수 등록 및 검수 결과 처리 기능 구현
  - 첨부파일 처리 및 엑셀 다운로드 기능 구현

### 배승훈

- 역할: 팀원
- 담당 영역: 회원, 권한, 공통 기능
- 구현 내용:
  - 로그인, 회원가입, 직원 등록 기능 구현
  - 권한 관리 기능 구현
  - 관리자 / 요청자 / 구매담당자 역할 구분
  - 공통 레이아웃 구현
  - 권한 기반 메뉴 접근 제어 구현

### 김연준

- 역할: 팀원
- 담당 영역: 입고, 재고
- 구현 내용:
  - 입고 처리 기능 구현
  - 입고 처리에 따른 재고 증가 기능 구현
  - 재고 조회 기능 구현
  - 재고 이력 조회 기능 구현

---

## 17. 최종 완료 상태

```text
Frontend 구현: 완료
Backend API 구현: 완료
Oracle DB 연동: 완료
Oracle Wallet 연동: 완료
Docker 이미지 빌드: 완료
OCIR 이미지 push: 완료
Kubernetes manifest 구성: 완료
OKE 배포: 완료
NGINX Ingress 연결: 완료
도메인 접속: 완료
GitHub Actions CI/CD 자동화 배포: 완료
```

---

## 18. 향후 개선 사항

- 기능별 테스트 코드 보강
- API 응답 표준화 고도화
- 운영 로그 및 모니터링 구성
- Docker layer cache 적용으로 GitHub Actions 빌드 속도 개선
- 첨부파일 저장소를 PersistentVolume 또는 Object Storage 기반으로 분리
- 사용자 권한별 메뉴 노출 및 API 권한 검증 강화
- 배포 이력 태그 관리 및 릴리즈 노트 자동화

---

## 19. License

본 프로젝트는 교육 및 포트폴리오 목적으로 제작되었습니다.

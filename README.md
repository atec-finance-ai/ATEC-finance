# ATEC 월 결산 체크리스트

자금/재무/인사 월 결산 체크리스트 웹앱 (Vite + React + Firebase Firestore + Auth)

## 1. 로컬 실행

```bash
npm install
npm run dev
```

`npm run build` 로 배포용 빌드 생성.

## 2. Firebase 콘솔 설정 (최초 1회)

1. **Authentication** 탭 → Sign-in method 에서 **이메일/비밀번호** 제공업체 활성화
2. **Authentication > Users** 에서 관리자(선생님) 계정 수동 생성
   - 이메일: `이름@atec.local` (예: 정근텍 팀장 → `정근텍@atec.local`)
   - 비밀번호: 6자리 PIN (Firebase 최소 6자 요건과 정확히 일치)
   - 관리 화면 로그인 시 "이름"칸에는 `정근텍`만 입력하면 됩니다.
3. **Firestore Database** 생성 (프로덕션 모드)
4. **Firestore > 규칙** 탭에 이 프로젝트의 `firestore.rules` 내용을 그대로 붙여넣고 게시

## 3. 데이터 구조

```
periods/{YYYY-MM}                 - 담당자, 검토자, 검토요청/완료일자 등 메타
periods/{YYYY-MM}/items/{itemId}  - category(자금/재무/인사), item, content, checked, note

stockItems/{itemId}                       - 품목코드, 품목명, 단위, 현재 재고수량/금액(EUR/원화환산)
stockItems/{itemId}/movements/{moveId}    - 일자, 구분(입고/출고), 수량, 단가(EUR), 환율, 금액(EUR/원화), 거래 후 잔고
```

관리 화면에서 로그인 후 "이번 달 체크리스트 생성" 버튼을 누르면 `src/data/checklistTemplate.js`에 있는
기본 36개 항목이 그 달의 `items` 서브컬렉션으로 자동 복사됩니다.

### 유럽법인 재고 수불부

- 상단 메뉴 "재고 수불부"에서 품목 목록을 확인하고, 품목을 클릭하면 품목별 수불부(입고/출고/잔고) 화면으로 이동합니다.
- 조회는 로그인 없이 가능하고, 품목 등록·입출고 등록은 로그인(관리자)한 사용자만 가능합니다.
- 입출고 이력은 회계장부와 동일하게 **추가만 가능**합니다(수정/삭제 없음). 잘못 입력한 경우 반대 유형(입고 ↔ 출고)의
  정정 전표를 추가하는 방식으로 바로잡아 주세요.
- 금액은 EUR 기준으로 입력하고, 등록 시점의 환율(EUR→KRW)을 함께 입력하면 원화환산액이 자동 계산되어 저장됩니다.

## 4. 폰 홈 화면에 추가 (PWA)

- **iOS(Safari)**: 공유 버튼 → "홈 화면에 추가"
- **Android(Chrome)**: 메뉴(⋮) → "홈 화면에 추가" / "앱 설치"

배포된 주소(https)로 접속했을 때만 정상 동작합니다.

## 5. GitHub push

이 환경에서는 네트워크 정책상 GitHub push를 대신 실행할 수 없어, 아래 명령을 직접 실행해주세요.
(이미 만드신 저장소 `cms5045715-byte/ATEC-finance`는 README.md만 있는 빈 저장소입니다.)

```bash
cd atec-finance
git init
git add .
git commit -m "Initial commit: 월 결산 체크리스트 기본 화면"
git branch -M main
git remote add origin https://github.com/cms5045715-byte/ATEC-finance.git
git pull origin main --allow-unrelated-histories   # 기존 README.md 병합
git push -u origin main
```

push 시 아이디/비밀번호를 물으면 비밀번호 자리에 발급받은 Personal Access Token을 입력하세요.
push가 끝나면 보안을 위해 GitHub 토큰 설정 페이지(https://github.com/settings/tokens)에서 토큰을 삭제(Delete)해주세요.

## 6. 배포

아직 배포 단계는 진행하지 않았습니다. 기본 화면 확인 후 GitHub Pages / Firebase Hosting 중
원하는 방식으로 다음 단계에서 진행하면 됩니다.

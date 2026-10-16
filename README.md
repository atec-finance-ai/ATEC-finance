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
periods/{YYYY-MM}/items/{itemId}  - category(자금/재무/인사), item, content, status(O/△/X), assignee, note
```

관리 화면에서 로그인 후 "이번 달 체크리스트 생성" 버튼을 누르면 `src/data/checklistTemplate.js`에 있는
기본 36개 항목이 그 달의 `items` 서브컬렉션으로 자동 복사됩니다.

## 4. 폰 홈 화면에 추가 (PWA)

- **iOS(Safari)**: 공유 버튼 → "홈 화면에 추가"
- **Android(Chrome)**: 메뉴(⋮) → "홈 화면에 추가" / "앱 설치"

배포된 주소(https)로 접속했을 때만 정상 동작합니다.

## 5. GitHub / 배포

- 저장소: https://github.com/atec-finance-ai/ATEC-finance
- 배포 주소: https://atec-finance.vercel.app (Vercel 팀 `ATEC Finance`)
- `main` 브랜치에 push하면 Vercel이 자동으로 빌드해서 배포합니다.
- 기본 조회 기간은 오늘이 속한 달의 **전월**입니다. (결산은 다음 달 초에 전월 것을 진행하기 때문)

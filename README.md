# 📝 SyncDocs — 비동기 협업 문서 에디터

BlockNote와 Supabase를 기반으로 구현한 블록형 협업 문서 에디터 프로젝트입니다.

실시간 동시 편집 환경에서 발생하는 데이터 충돌, 상태 정합성 유실, 한글 입력(IME) 이슈, 오프라인 처리 등 협업 툴 개발 시 마주치는 문제들을 정의하고 해결하는 데 초점을 맞춰 개발했습니다.

---

## 🔗 링크

- 🌐 웹사이트: https://sync-docs-neon.vercel.app/
- 📄 포트폴리오: https://syncdocs-stz53ug.gamma.site/
- 💻 GitHub: https://github.com/ParkYongHo1/SyncDocs

---

## 🗂️ 프로젝트 구조

Feature-Sliced Design(FSD)을 기반으로, 도메인(entities)과 기능(features)을 분리했습니다.

```text
src/
├─ app/                          # Next.js App Router, Provider 설정
├─ entities/                     # 도메인 단위
│  ├─ auth/                        # 인증 (로그인/로그아웃)
│  ├─ document/                    # 문서 CRUD API, 타입
│  └─ block/                       # 블록 CRUD API, 타입
├─ features/                     # 기능 단위
│  ├─ document-editing/            # 에디터 핵심 로직
│  │  ├─ ui/                         # Editor, Sidebar, EditorHeader, ConflictBanner
│  │  └─ model/                      # useEditorSync, useDocumentManager,
│  │                                    useDocumentStore, useOnlineStatus 등
│  ├─ undo-redo/                   # Command 패턴 기반 Undo/Redo
│  └─ conflict-resolution/         # 버전 충돌 감지·해결 스토어
├─ shared/                       # 공통 유틸 (Supabase 클라이언트 등)
└─ components/                   # shadcn/ui 기반 공용 UI
```

---

## ✨ 주요 기능

- 🧱 **블록 단위 에디터**: BlockNote 기반의 블록형 문서 작성 및 수정
- 🔄 **문서 저장 및 동기화**: Supabase 데이터베이스 연동
- ⚠️ **충돌 감지 및 처리**: 문서 버전(baseVersion) 비교를 통한 충돌 감지 및 UI 제공
- ⚡ **Optimistic Update**: 빠른 UI 반영 및 서버 응답 지연 시 상태 정합성 보장
- 🇰🇷 **한글 IME 대응**: 조합형 문자 입력 중 자동 저장 시 글자 누락 방지
- 📴 **오프라인 큐잉**: 네트워크 끊김 시 변경사항 보관 및 재연결 후 순차 처리

---

## 🛠️ 기술 스택

- **Frontend**: React, Next.js, TypeScript
- **State & Data**: Zustand, TanStack Query
- **Editor & UI**: BlockNote, Tailwind CSS
- **Backend**: Supabase
- **Deployment**: Vercel

---

## 🧩 핵심 문제 해결

### 1️⃣ 동시 편집 충돌 제어 (Conflict Management)
- **Problem**: 두 사용자가 동일한 블록을 동시에 수정할 경우, 이전 버전을 기준으로 덮어써지면서 최신 변경사항이 유실되는 현상 발생 (Silent Overwrite)
- **Solution**: 클라이언트의 `baseVersion`과 서버의 최신 버전을 비교해 충돌을 감지하고, Conflict UI를 통해 사용자가 변경사항을 직접 비교·선택할 수 있도록 구현
- **Result**: 데이터 덮어쓰기 방지 및 정합성 확보

### 2️⃣ Optimistic Update 정합성 개선
- **Problem**: 낙관적 업데이트 적용 시, 서버 응답이 지연되는 동안 새롭게 변경된 Zustand 상태 전체가 서버 응답값으로 덮어써져 사용자 입력이 유실되는 문제
- **Solution**: 서버 응답 객체 전체를 상태에 덮어씌우지 않고, 확정이 필요한 필드만 선택적으로 업데이트(Partial Update)하도록 수정
- **Result**: 입력 유실 방지 및 상태 정합성 개선

### 3️⃣ 한글 IME 입력 및 자동 저장 처리
- **Problem**: 한글 글자 조합이 끝나지 않은 상태에서 Debounce 저장이 동작해 마지막 글자가 누락되는 현상 발생
- **Solution**: `compositionstart` / `compositionend` 이벤트를 통해 IME 조합 상태를 감지하고, 조합이 완료된 시점에만 에디터 컨텐츠 저장을 실행하도록 제어
- **Result**: 한글 입력 중 발생하던 저장 오류 해결

### 4️⃣ Offline Queue 기반 변경사항 재처리
- **Problem**: 오프라인 상태에서 발생한 요청 실패로 편집 내용이 유실되거나, 재연결 시 TanStack Query 자동 refetch와 큐 재전송 간 순서 충돌 문제 발생
- **Solution**: 오프라인 요청을 Zustand Queue에 저장하고 재연결 후 순서대로 재전송. TanStack Query의 자동 refetch를 비활성화해 재전송과 충돌하지 않도록 처리
- **Result**: 오프라인 편집 데이터 유실 방지 및 재연결 후 상태 정합성 보장

### 5️⃣ Custom Hook 간 상태 공유 및 Echo Event 제어
- **Problem**: Hook별로 분산된 동기화 플래그로 인해, 서버로부터 수신한 프로그램적 변경사항을 사용자 입력으로 오인해 불필요한 서버 재동기화가 반복되는 문제
- **Solution**: 공유 상태와 동기화 플래그를 Zustand Store로 단일화하여 프로그램적 변경과 사용자 입력을 분리
- **Result**: 불필요한 Echo Event 및 무한 재동기화 루프 제거

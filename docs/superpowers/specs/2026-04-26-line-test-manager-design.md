# Line Test Manager — Design Spec

## Overview

공정 Line Test 시 차수(Run)별 공정조건·물성평가 결과·사진을 스마트폰으로 입력하고, 차수 간 비교·트렌드 분석하는 단일 사용자 모바일 PWA.

---

## Tech Stack

| 항목 | 선택 |
|---|---|
| 빌드 | Vite + React 18 + TypeScript |
| 스타일 | Tailwind CSS + shadcn/ui |
| 상태관리 | Zustand |
| 라우팅 | React Router v6 |
| 차트 | Recharts |
| PWA | vite-plugin-pwa |
| 데이터 | localStorage (자동 저장) |

---

## 프로젝트 구조

```
src/
├── pages/
│   ├── Home.tsx              # 테스트 목록
│   ├── TestDetail.tsx        # 차수 목록
│   ├── RunForm.tsx           # 차수 입력 폼
│   └── Compare.tsx           # 비교·트렌드
├── components/
│   ├── RunProgressStrip.tsx  # 차수 도트 진행 스트립
│   ├── FormRow.tsx           # 4열 입력 행
│   ├── LegTabs.tsx           # Leg A/B/C 탭
│   ├── ChangedChips.tsx      # 변경 항목 칩 스트립
│   └── TrendChart.tsx        # Recharts 트렌드 차트
├── store/
│   └── useAppStore.ts        # Zustand 스토어 (tests, runs, drafts)
├── types/
│   └── index.ts              # 전체 TypeScript 인터페이스
└── lib/
    └── storage.ts            # localStorage read/write 유틸
```

---

## 데이터 모델

```typescript
interface LineTest {
  id: string;
  name: string;
  productName: string;
  status: 'active' | 'done';
  runs: Run[];
  template: Template;
  createdAt: string;
}

interface Run {
  id: number;
  label: string;
  status: 'done' | 'active' | 'pending';
  note: string;
  hasConditionChange: boolean;
  startTime: string;
  legs: string[];
  conditions: Record<string, ConditionValue>;
  properties: Record<string, ConditionValue>;
  photos: Photo[];
  memo: string;
  tags: string[];
}

interface ConditionValue {
  target: number | string;
  tolerance: string;
  actuals: Record<string, number | string>;
}

interface Template {
  id: string;
  name: string;
  conditionItems: ConditionItem[];
  propertyItems: ConditionItem[];
}

interface ConditionItem {
  id: string;
  label: string;
  unit: string;
  group: 'temperature' | 'operation' | 'analysis';
}

interface Photo {
  id: string;
  dataUrl: string;
  caption: string;
}
```

**기본 공정조건 항목:**
- 공정 온도: T1~T4 온도, Die 온도
- 운전 조건: RPM, 압력, 투입량, 진공도, 냉각수 온도

**기본 물성평가 항목:**
- 분석값: MI, 밀도, 외관, 인장강도(MD), 헤이즈

---

## 화면별 명세

### Screen 1: 홈 (테스트 목록)
- 상단 검색 바
- "진행중" / "완료됨" 섹션 구분
- 진행중 아이템: 노란 배경 강조
- FAB(+): 신규 테스트 생성 모달 (이름, 제품명, 템플릿 선택)
- 탭 → TestDetail 화면

### Screen 2: 테스트 상세 (차수 목록)
- 상단: 테스트명 + 편집 버튼
- 진행 현황 스트립: 완료=검정, 진행중=노랑, 대기=회색 테두리 도트
- 상태 배지: `조건변경`(노란 칩), `진행중`(빨간 칩)
- "+ 새 차수 입력 시작" 고정 하단 버튼
- [비교 보기] / [트렌드] 버튼 → Compare 화면

### Screen 3: 차수 입력 폼 (핵심)
- 상단 바: 테스트명 · Run N + 임시저장 버튼
- 이전 Run 변경 항목 칩 스트립 (T3 온도 +5°C 등)
- 탭: ⚙️공정조건 / 🧪물성평가 / 📷사진·특이점
- Leg 탭: Leg A / Leg B / Leg C / +추가 (상단 고정)
- 4열 폼 행: 변경도트 | 항목명 | Target(읽기전용) | 공차(편집) | 실측값(입력)
- 조건부 스타일:
  - 변경 항목: 행 배경 `#fff8e0`, Target 테두리 주황
  - 공차 이탈: 실측값 칸 빨간 테두리 + `!`
  - 미입력: `—` 표시
- 하단: ← 이전 Run 복사 | 저장 →
- 사진 탭: 가로 스크롤 썸네일, 특이점 메모, 태그 칩

### Screen 4: 비교·트렌드
- 탭: 차수비교 / 트렌드
- 차수비교: Run별/Leg별 토글, 전체/변경항목만 필터
- 계층 테이블: 섹션 헤더(공정조건/물성평가) → 서브헤더(그룹) → 데이터 행
- 셀 스타일: 변경값=노란 배경, 불량=빨간 배경, 미입력=`—`
- 트렌드: Recharts 꺾은선 차트, Leg별 3개 선, 목표값 기준선, 이탈 포인트 빨간 도트

---

## 핵심 UX 동작

- **자동 임시저장**: 폼 변경 시마다 localStorage에 draft 저장, 재진입 시 복원
- **이전 Run 복사**: 신규 차수 생성 시 이전 Run 값 전체 복사 → 변경 항목만 수정
- **공차 이탈 즉시 피드백**: 실측값 입력 즉시 Target±공차 비교, 이탈 시 빨간 테두리
- **숫자 키패드**: 숫자 항목 inputMode="decimal" 자동 적용
- **변경 감지**: 현재 Run과 이전 Run 값 비교 → 달라진 항목 도트+배경 표시

---

## 디자인 토큰 (와이어프레임 기준)

| 역할 | 값 |
|---|---|
| 변경/진행중 강조 | `#fff8e0` (배경), `#fbbf24` (테두리/텍스트) |
| 공차 이탈 경고 | `#ef4444` (빨간 테두리/텍스트) |
| Target 배경 | `#f3f4f6` |
| 미입력 색상 | `#9ca3af` |
| 헤더 배경 | `#111111` |

---

## PWA 설정

- `vite-plugin-pwa`: manifest + service worker 자동 생성
- 홈 화면 추가 시 앱 아이콘, 스플래시 스크린
- 오프라인 캐싱: 앱 셸 + 정적 에셋

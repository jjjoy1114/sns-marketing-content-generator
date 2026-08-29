# 다알려드리미 — SNS 플랫폼별 마케팅 글 생성기

사업 정보를 한 번만 입력하면 **네이버 블로그·인스타그램·네이버 플레이스 소식**에 맞는 마케팅 글(제목·본문·행동 유도 문구·키워드)을 AI가 자동으로 만들어 주는 웹 서비스입니다. 소상공인과 SNS 운영자가 플랫폼마다 따로 글을 쓰는 시간을 줄여줍니다.

🔗 **배포 주소:** https://sns-marketing-content-generator.vercel.app/

> A1-3 · AI 활용 학습(AI Native Advanced) — "AI 웹 개발: 내 아이디어를 현실로" 과제

---

## 주요 기능

- **플랫폼별 맞춤 생성** — 같은 사업 정보로 네이버 블로그/인스타그램/네이버 플레이스 소식에 각각 맞는 글을 생성
- **AI 출력 항목** — 제목, 본문, 행동 유도 문구(CTA), 해시태그·검색 키워드
- **입력 검증 & 실패 처리** — 빈 입력 안내, API 오류 안내, 응답 지연(타임아웃) 안내
- **결과 복사** — 생성된 글을 한 번에 복사
- **반응형** — 모바일·태블릿·데스크톱 대응
- **다크 모드 (보너스)** — 라이트/다크 전환 + `localStorage`로 선택 상태 저장(새로고침·재방문 후에도 유지)

## 기술 스택

| 구분 | 사용 기술 |
|---|---|
| 프론트엔드 | 순수 HTML · CSS · JavaScript (프레임워크 미사용) |
| 백엔드 | Vercel Serverless Functions (Python, `api/` 폴더) |
| AI | Google Gemini API (`google-genai` SDK, 모델 `gemini-3.6-flash`) |
| 배포 | GitHub + Vercel 연동 |

## 폴더 구조

```text
sns-marketing-content-generator/
├── index.html          # 화면(구조)
├── css/style.css       # 디자인 (다크모드 색상 포함)
├── js/app.js           # 동작 (입력검증·fetch 호출·결과표시·다크모드)
├── api/generate.py     # AI 백엔드 (Vercel Serverless Function)
├── requirements.txt    # Python 패키지 목록 (google-genai)
├── vercel.json         # 배포 설정 (정적 + api 함수 구조)
├── .env.example        # 환경 변수 예시 (실제 키는 .env에, git 미포함)
├── docs/               # 서비스 기획서 등 문서
└── images/             # 증빙 캡처
```

## AI 기능 흐름

```text
사용자 입력 → JavaScript 입력 검증 → fetch('/api/generate') 요청
→ Python 백엔드가 Gemini 호출 → 결과(JSON: 제목·본문·CTA·키워드) 반환
→ 화면 결과 카드에 표시
```

## 환경 변수 설정

이 서비스는 AI 호출에 API 키가 필요하며, 키는 **코드에 넣지 않고 환경 변수로만** 관리합니다.

| 변수명 | 설명 |
|---|---|
| `GEMINI_API_KEY` | Google AI Studio에서 발급한 Gemini API 키 |

- **로컬 실행 시:** 프로젝트 루트에 `.env` 파일을 만들고 `GEMINI_API_KEY=발급받은키` 형식으로 저장 (`.env`는 `.gitignore`로 보호되어 GitHub에 올라가지 않음)
- **배포(Vercel) 시:** Vercel 프로젝트 → Settings → **Environment Variables**에 `GEMINI_API_KEY`를 등록

## 로컬 실행 방법

```bash
# 1) 필요한 패키지 설치
pip install -r requirements.txt

# 2) .env 파일에 GEMINI_API_KEY 입력 (.env.example 참고)

# 3) 로컬 개발 서버 실행 (프론트 + 백엔드 함께)
python dev_server.py

# 4) 브라우저에서 http://localhost:8000 접속
```

> `dev_server.py`는 로컬 테스트 전용입니다. 실제 배포에서는 Vercel이 `api/generate.py`를 자동으로 실행합니다.

## 배포 방법

1. 코드를 GitHub 저장소에 push
2. Vercel에서 해당 저장소를 **Import**
3. **Environment Variables**에 `GEMINI_API_KEY` 등록
4. **Deploy** → 발급된 `https://....vercel.app` 주소에서 서비스 확인
5. 이후 GitHub에 push하면 자동으로 재배포

## 보안 주의사항

- API 키는 환경 변수로만 관리하며, 코드·README·스크린샷에 노출하지 않습니다.
- 키 유출이 의심되면 즉시 폐기·재발급합니다.

## 참고

AI가 생성한 글은 **초안**입니다. 게시 전 실제 사업 정보와 맞는지, 과장된 표현은 없는지 확인 후 사용하세요.

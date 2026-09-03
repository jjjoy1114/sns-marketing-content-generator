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
├── index.html              # 화면(구조)
├── css/style.css           # 디자인 (다크모드 색상 포함)
├── js/app.js               # 동작 (입력검증·fetch 호출·결과표시·다크모드)
├── api/
│   ├── generate.py         # AI 백엔드 (Vercel Serverless Function)
│   └── test_local.py       # 로컬 AI 호출 테스트용 (배포 제외)
├── dev_server.py           # 로컬 개발 서버 (프론트+백엔드 함께 실행, 배포 제외)
├── requirements.txt        # Python 패키지 목록 (google-genai)
├── vercel.json             # 배포 설정 (framework: null → 정적 + api 함수)
├── .vercelignore           # 배포 제외 목록 (dev_server.py, api/test_local.py)
├── .env.example            # 환경 변수 예시 (실제 키는 .env에, git 미포함)
├── .gitignore              # .env 등 비공개 파일 제외
├── docs/
│   ├── 서비스_기획서.md      # 목적·타깃·페이지 구성·AI 입출력/실패처리
│   └── 요구사항_충족표.md    # 과제 요구사항 대조표
└── images/
    ├── raw/                # 원본 캡처
    └── report/             # 제출용 증빙 캡처
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

## 배포 문제 진단 및 해결

배포 후 화면이 안 뜨거나 AI 기능이 동작하지 않을 때는 아래 순서로 원인을 찾고 고칩니다.

1. **증상 구분** — 배포 URL 접속 시 (a) 페이지 자체가 안 뜨는지, (b) 페이지는 뜨는데 "글 생성하기"가 안 되는지 확인합니다.
2. **배포 로그 확인 (Vercel)** — Vercel 대시보드 → 프로젝트 → **Deployments** → 해당 배포 클릭 → **Build Logs**(빌드 실패: 패키지 설치 오류 등)와 **Functions/Runtime Logs**(AI 함수 실행 오류: 환경변수 누락, 예외)에서 빨간 에러 메시지를 확인합니다.
3. **브라우저 콘솔 확인** — 배포 URL에서 **F12(개발자도구)** → **Console** 탭에서 JavaScript 에러를, **Network** 탭에서 `/api/generate` 요청의 **상태코드(200/4xx/5xx)**와 응답 내용을 확인합니다.
4. **원인별 조치**
   - 환경변수 누락(AI만 실패, 500 오류): Settings → **Environment Variables**에 `GEMINI_API_KEY` 등록
   - 패키지 오류(빌드 실패): `requirements.txt` 내용 확인
   - 코드 오류: 로컬(`python dev_server.py`)에서 동일 증상을 재현하고 콘솔·로그로 원인 수정
5. **재배포** — 수정 후 `git push`(자동 재배포) 또는 Vercel **Deployments → Redeploy**. **환경변수를 변경한 경우 반드시 Redeploy** 해야 반영됩니다.
6. **재검증** — 배포 URL에서 네비게이션 · AI 생성 · 오류 안내 · 반응형이 모두 정상 동작하는지 다시 확인합니다.

## 성능·응답 지연 개선 방안

현재는 응답이 늦을 때를 대비해 **30초 타임아웃(AbortController)** 후 재시도 안내를 표시합니다(`js/app.js`). 여기서 더 나아가 **응답 속도 자체를 줄이는** 개선 옵션을 아래와 같이 정리합니다.

- **경량 모델 사용** — 현재 백엔드는 지연·비용에 유리한 경량 모델 `gemini-3.6-flash`(`api/generate.py`)를 사용합니다. 속도를 우선하면 flash 계열을 유지하고, 품질이 더 필요할 때만 상위 모델로 바꿔 속도와 트레이드오프를 조정합니다.
- **응답 길이 단축(요약)** — 프롬프트에서 **출력 항목과 글자 수 상한을 지정**(예: 본문 N자 이내)하고 `max_output_tokens`로 생성 토큰을 제한하면 생성 시간이 줄어듭니다.
- **캐시 전략** — **동일 입력(업종·플랫폼·목적 조합)의 결과를 캐시**해 재요청 시 즉시 반환합니다. 캐시 키는 입력값 해시로 만들고, 저장소는 간단히는 클라이언트 `localStorage`, 확장 시 서버측 KV(예: Vercel KV)를 사용합니다. 반복 호출·쿼터를 아끼는 효과가 있습니다.
- **콜드 스타트 완화** — 서버리스 함수의 첫 호출 지연을 줄이기 위해 함수를 가볍게 유지(불필요한 import 제거)하고, 필요 시 주기적 워밍 호출을 둡니다.
- **체감 지연 완화(구현됨)** — 로딩 표시와 안내 문구로 대기 체감을 줄입니다. 추가로 결과를 **스트리밍**으로 표시하면 첫 글자가 빨리 보여 체감 속도가 개선됩니다.

## 보안 주의사항

- API 키는 환경 변수로만 관리하며, 코드·README·스크린샷에 노출하지 않습니다.
- 키 유출이 의심되면 즉시 폐기·재발급합니다.

## 참고

AI가 생성한 글은 **초안**입니다. 게시 전 실제 사업 정보와 맞는지, 과장된 표현은 없는지 확인 후 사용하세요.

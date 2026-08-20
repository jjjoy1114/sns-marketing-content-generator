"""
================================================================
 다알려드리미 — AI 백엔드 (Vercel Serverless Function / Python)
 프론트가 fetch('/api/generate') 로 부르면, Gemini AI를 호출해
 제목·본문·CTA·키워드를 JSON으로 돌려줍니다.
 ※ API 키는 코드에 절대 넣지 않고 환경 변수(GEMINI_API_KEY)에서 읽습니다.
================================================================
"""

from http.server import BaseHTTPRequestHandler
import json
import os
from google import genai   # 구글 공식 Gemini SDK (새 키 형식 자동 처리)

# 사용할 무료 모델
MODEL = "gemini-3.6-flash"


# ---------------------------------------------------------------
# 1) 플랫폼별 프롬프트(AI에게 주는 지시문) 만들기
# ---------------------------------------------------------------
def build_prompt(data):
    platform = data.get("platform", "")

    # 플랫폼마다 글의 방향을 다르게 지시
    platform_guide = {
        "네이버 블로그": "검색 의도에 맞는 제목, 소제목과 문단이 있는 정보성 글, 지역·서비스 정보, 자연스러운 문의 유도.",
        "인스타그램": "시선을 끄는 첫 문장, 짧고 읽기 쉬운 본문, 공감·반응 유도, 관련 해시태그.",
        "네이버 플레이스 소식": "핵심 혜택과 이용 정보 중심의 간결한 안내, 방문·예약·문의 유도.",
    }.get(platform, "플랫폼 특성에 맞는 마케팅 글.")

    return f"""너는 국내 소상공인을 돕는 SNS 마케팅 카피라이터야.
아래 사업 정보를 바탕으로 '{platform}'에 올릴 마케팅 글을 작성해줘.

[플랫폼 작성 방향]
{platform_guide}

[사업 정보]
- 업종: {data.get('industry','')}
- 지역: {data.get('region','')}
- 주요 고객: {data.get('target','')}
- 홍보할 상품/서비스: {data.get('product','')}
- 홍보 목적: {data.get('purpose','')}
- 핵심 정보/강조점: {data.get('keyInfo','')}
- 핵심 키워드: {data.get('keywords','')}
- 말투: {data.get('tone','친근함')}

[출력 규칙]
- 반드시 아래 JSON 형식 그대로만 답해. 다른 설명은 절대 붙이지 마.
- 과장·허위 표현은 피하고, 확인 가능한 정보 위주로 자연스럽게 써.

{{
  "title": "플랫폼에 맞는 제목",
  "body": "게시물 본문",
  "cta": "행동 유도 문구(방문/문의/예약 등)",
  "keywords": "해시태그 또는 검색 키워드"
}}"""


# ---------------------------------------------------------------
# 2) Gemini 호출 → 결과를 dict(제목/본문/cta/키워드)로 반환
# ---------------------------------------------------------------
def generate_marketing_content(data, api_key):
    prompt = build_prompt(data)

    # SDK 클라이언트 만들기 (키는 환경 변수에서 받아온 값)
    client = genai.Client(api_key=api_key)

    response = client.models.generate_content(
        model=MODEL,
        contents=prompt,
        config={
            "temperature": 0.8,
            "response_mime_type": "application/json",  # JSON으로 답하도록 요청
        },
    )

    # 응답 텍스트(JSON 문자열) 꺼내기
    text = response.text.strip()

    # 혹시 ```json 같은 코드펜스가 붙어 오면 제거
    text = text.removeprefix("```json").removeprefix("```").removesuffix("```").strip()

    result = json.loads(text)
    return {
        "title": result.get("title", ""),
        "body": result.get("body", ""),
        "cta": result.get("cta", ""),
        "keywords": result.get("keywords", ""),
    }


# ---------------------------------------------------------------
# 3) Vercel이 부르는 진입점 (POST 요청 처리)
# ---------------------------------------------------------------
class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # (a) 요청 본문 읽기
            length = int(self.headers.get("Content-Length", 0))
            data = json.loads(self.rfile.read(length) or "{}")

            # (b) 필수값 검사 (서버에서도 한 번 더)
            required = ["industry", "product", "purpose", "platform"]
            if any(not data.get(k) for k in required):
                return self._send(400, {"error": "필수값이 누락되었습니다."})

            # (c) 환경 변수에서 API 키 읽기
            api_key = os.environ.get("GEMINI_API_KEY")
            if not api_key:
                return self._send(500, {"error": "서버 설정 오류(API 키 없음)."})

            # (d) AI 호출
            result = generate_marketing_content(data, api_key)
            return self._send(200, result)

        except Exception:
            # 오류 원인은 사용자에게 노출하지 않고 일반 안내만
            return self._send(502, {"error": "생성 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요."})

    def _send(self, status, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.end_headers()
        self.wfile.write(body)

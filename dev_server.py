"""
로컬 개발 서버 (M6 통합 테스트용)
내 컴퓨터에서 프론트(HTML/JS)와 백엔드(api/generate.py)를 함께 실행합니다.

실행:  python dev_server.py
접속:  브라우저에서 http://localhost:8000

※ 실제 배포는 Vercel이 api/generate.py 를 자동으로 실행하므로,
   이 파일은 '로컬 테스트 전용' 도구입니다. (배포에는 영향 없음)
끄기:  터미널에서 Ctrl + C
"""

import http.server
import socketserver
import json
import os
import sys

# api/generate.py 의 핵심 함수 불러오기
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "api"))
from generate import generate_marketing_content

PORT = 8000


# .env 파일에서 GEMINI_API_KEY 읽기 (배포 땐 Vercel이 자동 주입)
def load_env():
    path = os.path.join(os.path.dirname(__file__), ".env")
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip())


load_env()


class Handler(http.server.SimpleHTTPRequestHandler):
    # GET 요청(화면 파일들)은 기본 기능이 알아서 처리해줍니다.

    def do_POST(self):
        # /api/generate 로 오는 POST만 처리
        if self.path != "/api/generate":
            self.send_error(404)
            return
        try:
            length = int(self.headers.get("Content-Length", 0))
            data = json.loads(self.rfile.read(length) or "{}")

            required = ["industry", "product", "purpose", "platform"]
            if any(not data.get(k) for k in required):
                return self._send(400, {"error": "필수값이 누락되었습니다."})

            api_key = os.environ.get("GEMINI_API_KEY")
            if not api_key:
                return self._send(500, {"error": "서버 설정 오류(API 키 없음)."})

            result = generate_marketing_content(data, api_key)
            self._send(200, result)
        except Exception as e:
            print("⚠️ 오류:", e)
            self._send(502, {"error": "생성 중 문제가 발생했습니다."})

    def _send(self, status, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.end_headers()
        self.wfile.write(body)


# 프로젝트 폴더를 기준으로 화면 파일 제공
os.chdir(os.path.dirname(os.path.abspath(__file__)))

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"✅ 로컬 서버 실행 중 → http://localhost:{PORT}   (끄려면 Ctrl+C)")
    httpd.serve_forever()

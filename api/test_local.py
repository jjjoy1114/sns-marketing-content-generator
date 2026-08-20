"""
로컬 테스트용 스크립트 (Vercel 배포 전, 내 컴퓨터에서 Gemini가 잘 되는지 확인)
실행: 프로젝트 폴더에서  python api/test_local.py
"""

import os
import sys

# generate.py 를 불러오기 위한 경로 설정
sys.path.insert(0, os.path.dirname(__file__))
from generate import generate_marketing_content


# .env 파일에서 GEMINI_API_KEY 직접 읽기 (배포 땐 Vercel이 자동 주입)
def load_env():
    env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
    with open(env_path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, value = line.split("=", 1)
                os.environ.setdefault(key.strip(), value.strip())


load_env()
api_key = os.environ.get("GEMINI_API_KEY", "")

if not api_key or "여기에" in api_key:
    print("❌ .env 파일에 실제 GEMINI_API_KEY를 아직 안 넣었어요.")
    sys.exit(1)

# 테스트용 샘플 입력
sample = {
    "industry": "카페",
    "region": "김해시 내동",
    "target": "20~30대 직장인",
    "product": "신메뉴 아메리카노",
    "purpose": "상품 홍보",
    "keyInfo": "오픈 이벤트 2주간 20% 할인",
    "keywords": "김해 카페, 아메리카노",
    "platform": "네이버 블로그",
    "tone": "친근함",
}

print("⏳ Gemini 호출 중...\n")
result = generate_marketing_content(sample, api_key)

print("✅ 성공! AI가 만든 결과:\n")
print("제목:", result["title"])
print("\n본문:", result["body"])
print("\nCTA:", result["cta"])
print("\n키워드:", result["keywords"])

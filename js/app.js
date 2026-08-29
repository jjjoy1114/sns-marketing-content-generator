/* ================================================================
   다알려드리미 — 동작(JavaScript)
   버튼을 누르면: 입력 읽기 → 검사 → 로딩 → 결과 표시 → 복사
   ※ 지금은 진짜 AI 대신 "가짜 결과"를 만듭니다. (M5에서 실제 API로 교체)
================================================================= */

// ----- 1. 화면 요소들을 미리 붙잡아 둡니다 (HTML의 id와 연결) -----
const form        = document.getElementById("marketingForm");
const messageBox  = document.getElementById("message");      // 오류·안내 문구
const loadingBox  = document.getElementById("loading");       // 로딩 표시
const resultBox   = document.getElementById("result");        // 결과 전체
const placeholder = document.getElementById("placeholder");   // 처음 안내
const copyBtn     = document.getElementById("copyBtn");

// 결과 안에 값이 들어갈 자리들
const resultTitle    = document.getElementById("resultTitle");
const resultBody     = document.getElementById("resultBody");
const resultCta      = document.getElementById("resultCta");
const resultKeywords = document.getElementById("resultKeywords");

// 글자 수 제한(핵심 정보 입력칸)
const KEY_INFO_MAX = 200;

// ----- 2. "생성하기" 버튼을 눌렀을 때 실행 -----
form.addEventListener("submit", async (event) => {
  event.preventDefault(); // 폼 기본 동작(새로고침) 막기

  // (2-1) 입력값 모으기
  const data = {
    industry: form.industry.value.trim(),
    region:   form.region.value.trim(),
    target:   form.target.value.trim(),
    product:  form.product.value.trim(),
    purpose:  form.purpose.value,
    keyInfo:  form.keyInfo.value.trim(),
    keywords: form.keywords.value.trim(),
    platform: form.platform.value,
    tone:     form.tone.value,
  };

  // (2-2) 필수값 검사 — 빈 입력이면 여기서 멈춤 (API 호출 안 함)
  if (!data.industry || !data.product || !data.purpose || !data.platform) {
    showMessage("★ 표시된 필수값(업종·상품/서비스·홍보 목적·플랫폼)을 입력하세요.");
    return;
  }

  // (2-3) 너무 긴 입력 안내
  if (data.keyInfo.length > KEY_INFO_MAX) {
    showMessage(`핵심 정보는 ${KEY_INFO_MAX}자 이내로 입력하세요. (현재 ${data.keyInfo.length}자)`);
    return;
  }

  // (2-4) 로딩 시작 + 버튼 중복 클릭 방지
  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  hide(messageBox);
  hide(resultBox);
  hide(placeholder);
  show(loadingBox);

  try {
    // (2-5) 백엔드 AI 호출 (fetch로 /api/generate 요청)
    const result = await callApi(data);

    // (2-6) 결과 화면에 표시
    resultTitle.textContent    = result.title;
    resultBody.textContent     = result.body;
    resultCta.textContent      = "👉 " + result.cta;
    resultKeywords.textContent = result.keywords;
    hide(loadingBox);
    show(resultBox);

  } catch (err) {
    // (2-7) 오류가 나면 원인은 감추고 재시도 안내만
    hide(loadingBox);
    if (err.name === "AbortError") {
      showMessage("응답이 지연되고 있어요. 잠시 후 다시 시도해 주세요.");
    } else {
      showMessage("문제가 발생했어요. 잠시 후 다시 시도해 주세요.");
    }
  } finally {
    submitBtn.disabled = false; // 버튼 다시 누를 수 있게 복원
  }
});

// ----- 3. 결과 복사 버튼 -----
copyBtn.addEventListener("click", () => {
  const text = `${resultTitle.textContent}\n\n${resultBody.textContent}\n\n${resultCta.textContent}\n\n${resultKeywords.textContent}`;
  navigator.clipboard.writeText(text)
    .then(() => { copyBtn.textContent = "✅ 복사됨!"; setTimeout(() => copyBtn.textContent = "📋 결과 복사", 1500); })
    .catch(() => { copyBtn.textContent = "복사 실패"; });
});

// ----- 4. 도우미 함수들 -----
function show(el) { el.hidden = false; }
function hide(el) { el.hidden = true; }
function showMessage(text) {
  messageBox.textContent = text;
  show(messageBox);
  hide(resultBox);
  hide(loadingBox);
  hide(placeholder);
}

// ----- 5. 백엔드 AI 호출 (fetch로 /api/generate 요청) -----
// 프론트 → Python 백엔드(api/generate.py) → Gemini → 결과(JSON) 순으로 흐릅니다.
function callApi(data) {
  const controller = new AbortController();
  // 30초 넘게 응답이 없으면 '지연(타임아웃)'으로 처리
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  return fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    signal: controller.signal,
  }).then((res) => {
    clearTimeout(timeoutId);
    if (!res.ok) {
      // 서버가 400(필수값 누락)·500·502 등 오류를 보낸 경우
      throw new Error("API error " + res.status);
    }
    return res.json();
  });
}

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
    // (2-5) === 지금은 가짜 결과 ===
    // M5에서 이 부분을 fetch('/api/generate') 로 교체합니다.
    const result = await fakeGenerate(data);

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
    showMessage("문제가 발생했어요. 잠시 후 다시 시도해 주세요.");
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

// ----- 5. 가짜 결과 생성기 (M5에서 진짜 AI로 교체) -----
// 플랫폼마다 다른 형태의 샘플을 돌려줘서 흐름을 확인합니다.
function fakeGenerate(data) {
  return new Promise((resolve) => {
    setTimeout(() => {   // 실제 AI처럼 잠깐 기다리는 척 (1초)
      const where = data.region ? `${data.region} ` : "";
      let sample;

      if (data.platform === "인스타그램") {
        sample = {
          title: `${data.product}, 지금 만나보세요 ✨`,
          body: `${where}${data.industry} 소식!\n${data.product} 준비했어요.\n${data.keyInfo || "자세한 내용은 프로필 링크 확인!"}`,
          cta: "지금 저장하고 방문해 보세요!",
          keywords: `#${data.industry} #${(data.keywords || data.product).split(",")[0].trim()} #추천`,
        };
      } else if (data.platform === "네이버 플레이스 소식") {
        sample = {
          title: `[${data.industry}] ${data.product} 안내`,
          body: `${where}고객님께 알려드립니다.\n${data.product} — ${data.keyInfo || "많은 이용 바랍니다."}`,
          cta: "방문·예약·문의 환영합니다.",
          keywords: `${data.keywords || data.product}`,
        };
      } else { // 네이버 블로그(기본)
        sample = {
          title: `${where}${data.industry} 추천, ${data.product} 소개`,
          body: `안녕하세요. ${where}${data.industry}입니다.\n\n오늘은 ${data.product}를 소개합니다.\n${data.keyInfo || "자세한 정보는 아래를 참고하세요."}\n\n${data.target ? data.target + "께 특히 추천드려요." : ""}`,
          cta: "궁금한 점은 언제든 문의해 주세요.",
          keywords: `${data.keywords || data.industry + ", " + data.product}`,
        };
      }
      resolve(sample);
    }, 1000);
  });
}

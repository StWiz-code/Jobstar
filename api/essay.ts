import { GoogleGenAI } from "@google/genai";

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error("GEMINI_API_KEY가 설정되지 않았습니다. Vercel Project Settings의 Environment Variables에서 GEMINI_API_KEY를 추가해주세요.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function callWithRetry<T>(fn: () => Promise<T>, retries = 3, initialDelay = 500): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (error: any) {
      attempt++;
      
      const errStr = String(error?.message || error).toLowerCase();
      const status = error?.status || error?.statusCode || 0;
      
      const isRetryable =
        status === 429 ||
        status === 503 ||
        errStr.includes("503") ||
        errStr.includes("429") ||
        errStr.includes("service_unavailable") ||
        errStr.includes("resource_exhausted") ||
        errStr.includes("timeout") ||
        errStr.includes("time out") ||
        errStr.includes("fetch") ||
        errStr.includes("unavailable") ||
        errStr.includes("overloaded");

      if (attempt > retries || !isRetryable) {
        throw error;
      }

      const waitTime = initialDelay * Math.pow(2, attempt - 1);
      console.warn(`[Gemini API Warning] 호출 실패 (재시도 ${attempt}/${retries}). ${waitTime}ms 후 다시 시도합니다. 에러: ${error?.message || error}`);
      await delay(waitTime);
    }
  }
}

export default async function handler(req: any, res: any) {
  // CORS Headers support
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { application, matchedKeywords, star, question } = req.body || {};

    if (!application || !star || !question) {
      return res.status(400).json({ error: "자기소개서 생성에 필요한 정보가 누락되었습니다." });
    }

    const ai = getGeminiClient();
    const spaceOption = question.includeSpaces ? "공백 포함" : "공백 제외";

    const prompt = `
당신은 합격 자기소개서를 다수 작성한 전문 코치입니다.
아래 확정된 경험(STAR)을 바탕으로 자기소개서 문항에 답하는 본문을
작성하세요.

[지원 정보]
- 기업: ${application.companyName} / 직무: ${application.jobTitle}

[확정 경험 — STAR]
- Experience: ${star.experienceTitle}
- Situation: ${star.situation}
- Task: ${star.task}
- Action: ${star.action}
- Result: ${star.result}

[채용공고 요구역량]
${(matchedKeywords || []).join(", ") || "공고 맞춤 역량"}

[자소서 문항]
${question.questionText}

[작성 규칙]
1. 두괄식: 첫 문장에 핵심 메시지를 명시적으로 제시한다 (예: "OO 동아리에서 빅데이터를 활용하여 시장 기회를 발굴함으로써 공고에 필요한 데이터 분석 역량을 강화했습니다.").
2. STAR 흐름을 적절히 유지하되, 지나치게 인위적인 STAR 레이블 나열 없이 자연스러운 흐름의 줄글로 서술형 변환한다.
3. 목표 글자수: ${question.charLimit}자 (${spaceOption} 기준) 내외로 작성하시오. 반드시 최종 글자수가 ${question.charLimit}자의 ±10% 이내 범위에 들도록 글자 분량을 타이트하게 맞추어 완성도 높은 자소서를 만드세요.
4. 주어진 STAR 카드에 제공되지 않은 거짓 사실이나 구체적인 임의의 실적 수치를 새로 지어내지 마세요.
5. 문항이 핵심적으로 물어보고자 하는 내용(지원동기, 강점, 실패 극복 등)의 성격에 맞게 매끄럽게 서술 구도를 맞추어야 합니다.
6. 다른 서론이나 따옴표, "안녕하세요", "이상입니다" 등 불필요한 언사 없이 자소서 본문 텍스트만 깔끔하게 출력해야 문맥이 잡힙니다. 제목이나 머리글도 금지합니다.
`;

    const response = await callWithRetry(() =>
      ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt
      })
    );

    const bodyText = response.text || "";
    return res.status(200).json({ content: bodyText.trim() });
  } catch (error: any) {
    console.error("Vercel Serverless Essay Error:", error);
    return res.status(500).json({ error: error.message || "자기소개서 본문 생성 과정에서 오류가 발생했습니다." });
  }
}

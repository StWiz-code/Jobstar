import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error("GEMINI_API_KEY가 설정되지 않았습니다. AI Studio 우측 상단의 Secrets 패널에서 API 키를 입력해주세요.");
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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API 1: STAR 카드 도출
  app.post("/api/star", async (req: express.Request, res: express.Response) => {
    try {
      const { application, profile, jobPosting } = req.body;

      if (!application || !profile || !jobPosting) {
        res.status(400).json({ error: "필수 데이터(지원자 정보 또는 채용공고)가 누락되었습니다." });
        return;
      }

      const ai = getGeminiClient();

      // Format Profile Text
      const profileText = `
학교: ${profile.education.school}
전공: ${profile.education.major}
재학상태: ${profile.education.status}
학점: ${profile.education.gpa || "미입력"}
자격증: ${(profile.certifications || []).join(", ") || "없음"}
어학성적: ${(profile.languageScores || []).map((l: any) => `${l.test}: ${l.score}`).join(", ") || "없음"}
보유역량: ${(profile.skills || []).join(", ") || "없음"}

[보유 경험 리스트]
${(profile.experiences || []).map((exp: any, idx: number) => `
경험 ${idx + 1}:
- 활동/직무명: ${exp.title}
- 소속: ${exp.organization}
- 기간: ${exp.period}
- 상세 설명: ${exp.description}
`).join("\n")}
`;

      const prompt = `
당신은 대기업 채용을 다수 경험한 자기소개서 코치입니다.
아래 지원자 정보와 채용공고를 분석하여, 공고 적합도가 가장 높은
경험 3개를 골라 각각 STAR 구조로 정리하세요.

[지원 정보]
- 기업: ${application.companyName}
- 직무: ${application.jobTitle}

[지원자 프로필]
${profileText}

[채용공고]
${jobPosting.rawText}

[작업 지침]
1. 채용공고에서 핵심 요구역량 키워드를 먼저 추출한다.
2. 지원자의 '경험/경력' 중 요구역량과 매칭도가 높은 순서로 최대 3개를 선택한다. (만약 경험이 부족하다면 가능한 한도 내에서 최대한 1~3개 도출)
3. 각 경험을 Situation / Task / Action / Result 4단계로 구조화한다.
4. 반드시 지원자가 실제 입력한 경험 안에서만 작성한다.
   프로필에 없는 사실, 수치, 활동을 지어내지 않는다.
   불확실하면 추측하지 말고 입력된 범위로만 서술한다.
5. 각 카드에 공고 적합 이유(fitReason)와 매칭 키워드를 명시한다.
`;

      const response = await callWithRetry(() =>
        ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  experienceTitle: {
                    type: Type.STRING,
                    description: "어떤 경험 기반인지 작성 (예: 카페 아르바이트, 마케팅 공모전 등)"
                  },
                  fitScore: {
                    type: Type.INTEGER,
                    description: "0~100 공고 적합도 수치"
                  },
                  fitReason: {
                    type: Type.STRING,
                    description: "이 경험이 세부 공고의 어떤 점과 적합한지 한 문장으로 설명"
                  },
                  matchedKeywords: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "채용 공고 키워드 중 이번 경험과 매칭된 것들"
                  },
                  situation: {
                    type: Type.STRING,
                    description: "Situation (상황): 수행 단체의 목표, 처했던 문제 상황 등"
                  },
                  task: {
                    type: Type.STRING,
                    description: "Task (과제): 본인에게 주어진 과업, 해결해야 하는 미션"
                  },
                  action: {
                    type: Type.STRING,
                    description: "Action (행동): 문제를 해결하기 위해 구체적으로 취한 행동과 노력"
                  },
                  result: {
                    type: Type.STRING,
                    description: "Result (결과): 행동의 성과, 배운 점, 수치적 성적"
                  }
                },
                required: [
                  "experienceTitle",
                  "fitScore",
                  "fitReason",
                  "matchedKeywords",
                  "situation",
                  "task",
                  "action",
                  "result"
                ]
              }
            }
          }
        })
      );

      const text = response.text || "[]";
      const cards = JSON.parse(text);
      res.json({ starCards: cards });
    } catch (error: any) {
      console.error("STAR Generation Error:", error);
      res.status(500).json({ error: error.message || "STAR 카드 도출 과정에서 내부 오류가 발생했습니다." });
    }
  });

  // API 2: 자소서 문항별 자소서 생성
  app.post("/api/essay", async (req: express.Request, res: express.Response) => {
    try {
      const { application, matchedKeywords, star, question } = req.body;

      if (!application || !star || !question) {
        res.status(400).json({ error: "자기소개서 생성에 필요한 정보가 누락되었습니다." });
        return;
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
      res.json({ content: bodyText.trim() });
    } catch (error: any) {
      console.error("Essay Generation Error:", error);
      res.status(500).json({ error: error.message || "자기소개서 본문 생성 과정에서 오류가 발생했습니다." });
    }
  });

  // Vite 혹은 static file 서빙
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

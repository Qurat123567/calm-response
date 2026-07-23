import { createServerFn } from "@tanstack/react-start";

export type GroqPlanStep = { action: string; reason: string };
export type GroqPlanMessage = { title: string; body: string };
export type GroqPlan = { steps: GroqPlanStep[]; messages: GroqPlanMessage[] };

export type GroqPlanInput = {
  incidentType: string;
  incidentTitle: string;
  inventory: Record<string, unknown> | null;
};

const SYSTEM_PROMPT = `You are a calm, precise incident-response assistant. Given a user's digital inventory and an incident type, output a numbered, strictly ordered action plan. Prioritize actions that prevent irreversible loss first (for example, securing account recovery paths before anything else that depends on them). For each step, explain briefly WHY it comes in that order. Then draft 2-3 ready-to-copy messages relevant to the incident (such as a bank fraud report, a police complaint, or a platform support ticket), using placeholders like [YOUR NAME] or [ACCOUNT NUMBER] for details you don't have. Never suggest an action that requires information you were not given. Keep the tone reassuring and clear, not alarming. Respond ONLY in valid JSON with this shape: { "steps": [ { "action": "...", "reason": "..." } ], "messages": [ { "title": "...", "body": "..." } ] }`;

export const generateActionPlan = createServerFn({ method: "POST" })
  .inputValidator((input: GroqPlanInput) => input)
  .handler(async ({ data }): Promise<GroqPlan> => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY is not configured");

    const userContent = `Incident type: ${data.incidentTitle} (${data.incidentType})

User's digital inventory:
${JSON.stringify(data.inventory ?? {}, null, 2)}

Generate the ordered action plan and ready-to-copy messages now.`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Groq request failed [${response.status}]: ${errorBody}`);
      throw new Error(`Groq request failed with status ${response.status}`);
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = payload.choices?.[0]?.message?.content ?? "";
    let parsed: GroqPlan;
    try {
      parsed = JSON.parse(content) as GroqPlan;
    } catch {
      console.error("Groq returned non-JSON content:", content);
      throw new Error("Model returned malformed JSON");
    }

    const steps = Array.isArray(parsed.steps)
      ? parsed.steps
          .filter((s) => s && typeof s.action === "string")
          .map((s) => ({ action: s.action, reason: typeof s.reason === "string" ? s.reason : "" }))
      : [];
    const messages = Array.isArray(parsed.messages)
      ? parsed.messages
          .filter((m) => m && typeof m.title === "string" && typeof m.body === "string")
          .map((m) => ({ title: m.title, body: m.body }))
      : [];

    if (steps.length === 0 || messages.length === 0) {
      throw new Error("Model returned an incomplete plan");
    }

    return { steps, messages };
  });

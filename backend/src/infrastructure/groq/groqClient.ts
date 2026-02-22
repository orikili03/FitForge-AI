import Groq from "groq-sdk";

let client: Groq | null = null;

function getClient(): Groq {
  if (!client) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GROQ_API_KEY is not set. Add it to backend/.env and restart."
      );
    }
    client = new Groq({ apiKey });
  }
  return client;
}

const DEFAULT_CHAT_MODEL = "llama-3.3-70b-versatile";

export async function chatCompletion(params: {
  systemPrompt: string;
  userPrompt: string;
  model?: string;
  temperature?: number;
}): Promise<string> {
  const model = params.model ?? process.env.GROQ_MODEL ?? DEFAULT_CHAT_MODEL;

  const response = await getClient().chat.completions.create({
    model,
    messages: [
      { role: "system", content: params.systemPrompt },
      { role: "user", content: params.userPrompt },
    ],
    temperature: params.temperature ?? 0.7,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Groq returned an empty response.");
  }
  return content;
}

import { Router } from "express";
import OpenAI from "openai";

const router = Router();

const openai = new OpenAI({
  baseURL: process.env["AI_INTEGRATIONS_OPENAI_BASE_URL"],
  apiKey: process.env["AI_INTEGRATIONS_OPENAI_API_KEY"] ?? "dummy",
});

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface FinancialContext {
  name?: string;
  language?: string;
  objective?: string;
  monthlyIncome?: number;
  currency?: string;
  balance?: number;
  income?: number;
  expenses?: number;
  patrimony?: number;
  savingsRate?: number;
}

function buildSystemPrompt(context: FinancialContext): string {
  const lang = context?.language === "en" ? "en" : "pt";
  const name = context?.name ? `, ${context.name}` : "";
  const currency = context?.currency ?? "EUR";

  if (lang === "pt") {
    return `És um assistente financeiro pessoal chamado Savvy${name}. Respondes SEMPRE em Português de Portugal. Usas um tom amigável, direto e prático. Forneces conselhos financeiros personalizados com base no perfil do utilizador.

Perfil financeiro atual:
- Nome: ${context?.name ?? "Utilizador"}
- Objetivo principal: ${context?.objective ?? "Não definido"}
- Rendimento mensal: ${context?.monthlyIncome ?? 0} ${currency}
- Saldo do mês: ${context?.balance ?? 0} ${currency}
- Ganhos do mês: ${context?.income ?? 0} ${currency}
- Gastos do mês: ${context?.expenses ?? 0} ${currency}
- Património atual: ${context?.patrimony ?? 0} ${currency}
- Taxa de poupança: ${context?.savingsRate != null ? `${context.savingsRate.toFixed(1)}%` : "N/A"}

Regras:
- Responde SEMPRE em Português de Portugal
- Sê conciso (máximo 3-4 parágrafos curtos)
- Usa dados concretos do perfil quando relevante
- Dá conselhos práticos e acionáveis
- Usa linguagem simples e acessível
- Usa formatação simples (sem markdown excessivo)`;
  }

  return `You are a personal financial assistant called Savvy${name}. You ALWAYS respond in English. You use a friendly, direct, and practical tone. You provide personalized financial advice based on the user's profile.

Current financial profile:
- Name: ${context?.name ?? "User"}
- Main objective: ${context?.objective ?? "Not defined"}
- Monthly income: ${context?.monthlyIncome ?? 0} ${currency}
- Monthly balance: ${context?.balance ?? 0} ${currency}
- Monthly income earned: ${context?.income ?? 0} ${currency}
- Monthly expenses: ${context?.expenses ?? 0} ${currency}
- Current net worth: ${context?.patrimony ?? 0} ${currency}
- Savings rate: ${context?.savingsRate != null ? `${context.savingsRate.toFixed(1)}%` : "N/A"}

Rules:
- ALWAYS respond in English
- Be concise (max 3-4 short paragraphs)
- Use concrete profile data when relevant
- Give practical, actionable advice
- Use simple, accessible language
- Use simple formatting (minimal markdown)`;
}

router.post("/chat", async (req, res) => {
  try {
    const { messages, context }: { messages: ChatMessage[]; context: FinancialContext } = req.body;

    const systemPrompt = buildSystemPrompt(context ?? {});

    const chatMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...(messages ?? []).map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 8192,
      messages: chatMessages,
    });

    const reply = completion.choices[0]?.message?.content ?? "";
    res.json({ reply });
  } catch (err) {
    console.error("AI chat error:", err);
    res.status(500).json({ error: "AI service unavailable" });
  }
});

export default router;

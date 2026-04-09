import { Router } from "express";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const OpenAI = require("openai").default;

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
- Usa linguagem simples e acessível`;
  }

  return `You a

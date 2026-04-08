import { Transaction, TransactionCategory, UserProfile } from "@/context/AppContext";

export const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  salary: "Salário",
  freelance: "Freelance",
  investment: "Investimento",
  gift: "Presente",
  food: "Alimentação",
  housing: "Habitação",
  transport: "Transporte",
  health: "Saúde",
  entertainment: "Lazer",
  shopping: "Compras",
  education: "Educação",
  utilities: "Serviços",
  travel: "Viagem",
  other: "Outro",
};

export const CATEGORY_ICONS: Record<TransactionCategory, string> = {
  salary: "briefcase",
  freelance: "laptop",
  investment: "trending-up",
  gift: "gift",
  food: "coffee",
  housing: "home",
  transport: "navigation",
  health: "heart",
  entertainment: "film",
  shopping: "shopping-bag",
  education: "book",
  utilities: "zap",
  travel: "globe",
  other: "more-horizontal",
};

export const CATEGORY_COLORS: Record<TransactionCategory, string> = {
  salary: "#16a34a",
  freelance: "#0891b2",
  investment: "#7c3aed",
  gift: "#db2777",
  food: "#ea580c",
  housing: "#ca8a04",
  transport: "#2563eb",
  health: "#dc2626",
  entertainment: "#9333ea",
  shopping: "#c026d3",
  education: "#0d9488",
  utilities: "#d97706",
  travel: "#0284c7",
  other: "#6b7280",
};

export const INCOME_CATEGORIES: TransactionCategory[] = [
  "salary",
  "freelance",
  "investment",
  "gift",
];

export const EXPENSE_CATEGORIES: TransactionCategory[] = [
  "food",
  "housing",
  "transport",
  "health",
  "entertainment",
  "shopping",
  "education",
  "utilities",
  "travel",
  "other",
];

export const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: "€",
  USD: "$",
  BRL: "R$",
  GBP: "£",
  JPY: "¥",
  CHF: "Fr",
  CAD: "CA$",
};

export function formatCurrency(amount: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency;
  const absAmount = Math.abs(amount);
  if (absAmount >= 1000000) {
    return `${symbol}${(absAmount / 1000000).toFixed(1)}M`;
  }
  if (absAmount >= 1000) {
    return `${symbol}${(absAmount / 1000).toFixed(1)}k`;
  }
  return `${symbol}${absAmount.toFixed(2)}`;
}

export function getMonthTransactions(transactions: Transaction[], monthOffset = 0): Transaction[] {
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const start = new Date(target.getFullYear(), target.getMonth(), 1);
  const end = new Date(target.getFullYear(), target.getMonth() + 1, 0, 23, 59, 59);

  return transactions.filter((tx) => {
    const d = new Date(tx.date);
    return d >= start && d <= end;
  });
}

export function getMonthlyStats(transactions: Transaction[], monthOffset = 0) {
  const monthTxs = getMonthTransactions(transactions, monthOffset);
  const income = monthTxs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expenses = monthTxs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  return { income, expenses, balance: income - expenses, count: monthTxs.length };
}

export function getCategoryBreakdown(expenseTxs: Transaction[]): Record<string, number> {
  const breakdown: Record<string, number> = {};
  for (const tx of expenseTxs) {
    breakdown[tx.category] = (breakdown[tx.category] ?? 0) + tx.amount;
  }
  return breakdown;
}

export interface MonthData {
  key: string;
  label: string;
  shortLabel: string;
  income: number;
  expenses: number;
  balance: number;
  count: number;
}

export function getLast6MonthsData(transactions: Transaction[]): MonthData[] {
  const result: MonthData[] = [];
  for (let i = -5; i <= 0; i++) {
    const now = new Date();
    const target = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const stats = getMonthlyStats(transactions, i);
    const monthName = target.toLocaleDateString("pt-PT", { month: "short" });
    const fullName = target.toLocaleDateString("pt-PT", { month: "long", year: "numeric" });
    result.push({
      key: `${target.getFullYear()}-${target.getMonth()}`,
      label: fullName.charAt(0).toUpperCase() + fullName.slice(1),
      shortLabel: monthName.charAt(0).toUpperCase() + monthName.slice(1),
      ...stats,
    });
  }
  return result;
}

export function getBestAndWorstMonths(monthsData: MonthData[]): {
  best: MonthData | null;
  worst: MonthData | null;
} {
  const withData = monthsData.filter((m) => m.count > 0);
  if (withData.length === 0) return { best: null, worst: null };
  const sorted = [...withData].sort((a, b) => b.balance - a.balance);
  return { best: sorted[0] ?? null, worst: sorted[sorted.length - 1] ?? null };
}

export function getAllTimeCategoryBreakdown(transactions: Transaction[]): Record<string, number> {
  const expenses = transactions.filter((t) => t.type === "expense");
  return getCategoryBreakdown(expenses);
}

export function generateTips(transactions: Transaction[], profile: UserProfile): string[] {
  const tips: string[] = [];
  const { income, expenses } = getMonthlyStats(transactions);
  const expTxs = getMonthTransactions(transactions).filter((t) => t.type === "expense");
  const breakdown = getCategoryBreakdown(expTxs);
  const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;
  const firstName = profile.name?.split(" ")[0] || "";

  if (profile.mainObjective === "save" && savingsRate < 20) {
    tips.push(`${firstName ? firstName + ", t" : "T"}enta poupar pelo menos 20% do teu rendimento mensalmente para atingir os teus objetivos.`);
  }

  if (income > 0 && expenses > income * 0.8) {
    tips.push("Os teus gastos estão acima de 80% do teu rendimento. Considera reduzir despesas não essenciais.");
  }

  const topCategory = Object.entries(breakdown).sort(([, a], [, b]) => b - a)[0];
  if (topCategory && income > 0 && topCategory[1] > income * 0.3) {
    const catLabel = CATEGORY_LABELS[topCategory[0] as TransactionCategory];
    tips.push(`A tua categoria de maior gasto é ${catLabel}. Representa ${Math.round((topCategory[1] / income) * 100)}% do teu rendimento.`);
  }

  if (profile.debts > 0) {
    tips.push("Tens dívidas em aberto. Prioriza o pagamento das dívidas com juros mais altos primeiro.");
  }

  if (breakdown["entertainment"] && income > 0 && breakdown["entertainment"] > income * 0.15) {
    tips.push("Os gastos com lazer estão elevados. Considera definir um limite mensal para entretenimento.");
  }

  if (savingsRate > 30) {
    tips.push("Excelente! Estás a poupar mais de 30% do teu rendimento. Considera investir o excedente.");
  }

  if (profile.investmentHorizon === "long" && expenses < income) {
    tips.push("Com um horizonte de investimento longo, os teus excedentes mensais podem crescer significativamente com investimentos regulares.");
  }

  if (tips.length === 0) {
    tips.push("Regista as tuas receitas e despesas regularmente para receberes dicas personalizadas.");
    tips.push("Define um orçamento mensal para cada categoria e acompanha o progresso.");
  }

  return tips.slice(0, 4);
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" });
}

export function getMonthName(offset = 0): string {
  const d = new Date();
  d.setMonth(d.getMonth() + offset);
  return d.toLocaleDateString("pt-PT", { month: "long", year: "numeric" });
}

export function getGreeting(name: string): string {
  const hour = new Date().getHours();
  const firstName = name?.trim().split(" ")[0] || "";
  let base: string;
  if (hour < 12) base = "Bom dia";
  else if (hour < 19) base = "Boa tarde";
  else base = "Boa noite";
  return firstName ? `${base}, ${firstName}` : base;
}

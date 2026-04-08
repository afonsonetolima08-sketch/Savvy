import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type TransactionCategory =
  | "salary"
  | "freelance"
  | "investment"
  | "gift"
  | "food"
  | "housing"
  | "transport"
  | "health"
  | "entertainment"
  | "shopping"
  | "education"
  | "utilities"
  | "travel"
  | "other";

export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: TransactionCategory;
  description: string;
  date: string;
}

export interface UserProfile {
  name: string;
  financialGoal: string;
  initialPatrimony: number;
  currentPatrimony: number;
  monthlyIncome: number;
  debts: number;
  hasDependents: boolean;
  mainObjective: string;
  investmentHorizon: string;
  currency: string;
  language: string;
  onboardingCompleted: boolean;
}

const DEFAULT_PROFILE: UserProfile = {
  name: "",
  financialGoal: "",
  initialPatrimony: 0,
  currentPatrimony: 0,
  monthlyIncome: 0,
  debts: 0,
  hasDependents: false,
  mainObjective: "",
  investmentHorizon: "",
  currency: "EUR",
  language: "pt",
  onboardingCompleted: false,
};

export interface ExchangeRates {
  [key: string]: number;
}

interface AppContextValue {
  transactions: Transaction[];
  profile: UserProfile;
  effectivePatrimony: number;
  exchangeRates: ExchangeRates;
  addTransaction: (t: Omit<Transaction, "id">) => void;
  updateTransaction: (t: Transaction) => void;
  deleteTransaction: (id: string) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  convertAmount: (amount: number, toCurrency: string) => number;
  isLoading: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

const STORAGE_KEYS = {
  TRANSACTIONS: "@savvy_transactions",
  PROFILE: "@savvy_profile",
};

const HARDCODED_RATES: ExchangeRates = {
  EUR: 1,
  USD: 1.09,
  BRL: 5.45,
  GBP: 0.86,
  JPY: 165.2,
  CHF: 0.96,
  CAD: 1.47,
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [exchangeRates] = useState<ExchangeRates>(HARDCODED_RATES);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [txRaw, profileRaw] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS),
        AsyncStorage.getItem(STORAGE_KEYS.PROFILE),
      ]);
      if (txRaw) setTransactions(JSON.parse(txRaw));
      if (profileRaw) {
        const p = JSON.parse(profileRaw);
        // Migrate: initialPatrimony defaults to currentPatrimony if missing
        if (p.initialPatrimony === undefined) {
          p.initialPatrimony = p.currentPatrimony ?? 0;
        }
        setProfile(p);
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  const saveTransactions = async (txs: Transaction[]) => {
    await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));
  };

  const saveProfile = async (p: UserProfile) => {
    await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(p));
  };

  // Effective patrimony = initial value + net savings from all transactions
  const effectivePatrimony = useMemo(() => {
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + t.amount, 0);
    const totalExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + t.amount, 0);
    return (profile.initialPatrimony ?? profile.currentPatrimony ?? 0) + totalIncome - totalExpenses;
  }, [transactions, profile.initialPatrimony, profile.currentPatrimony]);

  const addTransaction = useCallback((t: Omit<Transaction, "id">) => {
    const newTx: Transaction = {
      ...t,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
    setTransactions((prev) => {
      const updated = [newTx, ...prev];
      saveTransactions(updated);
      return updated;
    });
  }, []);

  const updateTransaction = useCallback((t: Transaction) => {
    setTransactions((prev) => {
      const updated = prev.map((tx) => (tx.id === t.id ? t : tx));
      saveTransactions(updated);
      return updated;
    });
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => {
      const updated = prev.filter((tx) => tx.id !== id);
      saveTransactions(updated);
      return updated;
    });
  }, []);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfile((prev) => {
      const updated = { ...prev, ...updates };
      saveProfile(updated);
      return updated;
    });
  }, []);

  const convertAmount = useCallback(
    (amount: number, toCurrency: string) => {
      const fromRate = exchangeRates["EUR"] ?? 1;
      const toRate = exchangeRates[toCurrency] ?? 1;
      return (amount / fromRate) * toRate;
    },
    [exchangeRates]
  );

  return (
    <AppContext.Provider
      value={{
        transactions,
        profile,
        effectivePatrimony,
        exchangeRates,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        updateProfile,
        convertAmount,
        isLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

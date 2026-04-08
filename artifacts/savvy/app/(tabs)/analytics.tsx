import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PieChart from "@/components/PieChart";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  formatCurrency,
  getCategoryBreakdown,
  getMonthTransactions,
  getMonthlyStats,
  getMonthName,
} from "@/utils/finance";
import { TransactionCategory } from "@/context/AppContext";

export default function AnalyticsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { transactions, profile } = useApp();
  const [monthOffset, setMonthOffset] = useState(0);
  const currency = profile.currency || "EUR";

  const monthTxs = getMonthTransactions(transactions, monthOffset);
  const stats = {
    income: monthTxs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
    expenses: monthTxs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
  };
  const breakdown = getCategoryBreakdown(monthTxs.filter
    ? (monthTxs.filter((t) => t.type === "expense") as any)
    : monthTxs);

  const breakdownFromAll = (() => {
    const expTxs = monthTxs.filter((t) => t.type === "expense");
    const b: Record<string, number> = {};
    for (const tx of expTxs) {
      b[tx.category] = (b[tx.category] ?? 0) + tx.amount;
    }
    return b;
  })();

  const sortedCategories = Object.entries(breakdownFromAll).sort(([, a], [, b]) => b - a);
  const total = Object.values(breakdownFromAll).reduce((s, v) => s + v, 0);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingTop: topPadding, paddingBottom: 100 + bottomPadding }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.screenTitle, { color: colors.foreground }]}>Análise</Text>
        </View>

        <View style={[styles.monthNav, { borderColor: colors.border }]}>
          <TouchableOpacity onPress={() => setMonthOffset((o) => o - 1)} hitSlop={8}>
            <Feather name="chevron-left" size={22} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.monthLabel, { color: colors.foreground }]}>
            {getMonthName(monthOffset).charAt(0).toUpperCase() + getMonthName(monthOffset).slice(1)}
          </Text>
          <TouchableOpacity
            onPress={() => setMonthOffset((o) => Math.min(0, o + 1))}
            hitSlop={8}
            disabled={monthOffset >= 0}
          >
            <Feather name="chevron-right" size={22} color={monthOffset >= 0 ? colors.mutedForeground : colors.foreground} />
          </TouchableOpacity>
        </View>

        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: "#dcfce7" }]}>
            <Text style={[styles.summaryLabel, { color: "#14532d" }]}>Ganhos</Text>
            <Text style={[styles.summaryValue, { color: "#16a34a" }]}>
              +{formatCurrency(stats.income, currency)}
            </Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: "#fee2e2" }]}>
            <Text style={[styles.summaryLabel, { color: "#991b1b" }]}>Gastos</Text>
            <Text style={[styles.summaryValue, { color: "#ef4444" }]}>
              -{formatCurrency(stats.expenses, currency)}
            </Text>
          </View>
        </View>

        <View style={[styles.chartSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Gastos por Categoria
          </Text>
          <PieChart data={breakdownFromAll} currency={currency} />
        </View>

        {sortedCategories.length > 0 && (
          <View style={[styles.listSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Detalhes
            </Text>
            {sortedCategories.map(([cat, value], i) => (
              <View key={cat} style={[styles.catRow, i < sortedCategories.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                <View style={[styles.catDot, { backgroundColor: CATEGORY_COLORS[cat as TransactionCategory] }]} />
                <Text style={[styles.catLabel, { color: colors.foreground }]}>
                  {CATEGORY_LABELS[cat as TransactionCategory]}
                </Text>
                <View style={styles.catRight}>
                  <Text style={[styles.catPct, { color: colors.mutedForeground }]}>
                    {total > 0 ? `${Math.round((value / total) * 100)}%` : ""}
                  </Text>
                  <Text style={[styles.catValue, { color: colors.expense }]}>
                    -{formatCurrency(value, currency)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 8,
  },
  screenTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginBottom: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  monthLabel: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  summaryRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    gap: 4,
  },
  summaryLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  summaryValue: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  chartSection: {
    margin: 20,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    gap: 16,
    marginTop: 0,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  listSection: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 0,
    marginBottom: 16,
  },
  catRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 10,
  },
  catDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  catLabel: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  catRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  catPct: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  catValue: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
});

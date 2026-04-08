import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PieChart from "@/components/PieChart";
import { TransactionCategory, useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  MonthData,
  formatCurrency,
  getAllTimeCategoryBreakdown,
  getBestAndWorstMonths,
  getLast6MonthsData,
  getMonthTransactions,
  getMonthlyStats,
  getMonthName,
} from "@/utils/finance";

const SCREEN_WIDTH = Dimensions.get("window").width;

function BarChart({
  data,
  currency,
  selectedKey,
  onSelect,
}: {
  data: MonthData[];
  currency: string;
  selectedKey: string | null;
  onSelect: (key: string) => void;
}) {
  const colors = useColors();
  const maxVal = Math.max(...data.map((d) => Math.max(d.income, d.expenses)), 1);
  const barAreaHeight = 100;

  return (
    <View style={styles.barChart}>
      {/* Y-axis reference lines */}
      <View style={[styles.barRefLine, { bottom: barAreaHeight * 0.5, borderColor: colors.border }]} />
      <View style={[styles.barRefLine, { bottom: barAreaHeight, borderColor: colors.border }]} />

      <View style={styles.barsRow}>
        {data.map((month) => {
          const incomeH = Math.max(2, (month.income / maxVal) * barAreaHeight);
          const expH = Math.max(2, (month.expenses / maxVal) * barAreaHeight);
          const isSelected = selectedKey === month.key;

          return (
            <TouchableOpacity
              key={month.key}
              style={styles.barGroup}
              onPress={() => onSelect(month.key)}
              activeOpacity={0.75}
            >
              <View style={[styles.barPair, { height: barAreaHeight }]}>
                {/* Income bar */}
                <View
                  style={[
                    styles.bar,
                    {
                      height: incomeH,
                      backgroundColor: isSelected ? colors.income : colors.income + "99",
                      borderRadius: 4,
                    },
                  ]}
                />
                {/* Expense bar */}
                <View
                  style={[
                    styles.bar,
                    {
                      height: expH,
                      backgroundColor: isSelected ? colors.expense : colors.expense + "99",
                      borderRadius: 4,
                    },
                  ]}
                />
              </View>

              {isSelected && (
                <View style={[styles.barSelector, { backgroundColor: colors.primary }]} />
              )}
              <Text style={[styles.barLabel, { color: isSelected ? colors.primary : colors.mutedForeground }]}>
                {month.shortLabel}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.income }]} />
          <Text style={[styles.legendText, { color: colors.mutedForeground }]}>Ganhos</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.expense }]} />
          <Text style={[styles.legendText, { color: colors.mutedForeground }]}>Gastos</Text>
        </View>
      </View>
    </View>
  );
}

export default function AnalyticsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { transactions, profile } = useApp();
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedBarKey, setSelectedBarKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"monthly" | "categories">("monthly");

  const currency = profile.currency || "EUR";

  const last6 = getLast6MonthsData(transactions);
  const { best, worst } = getBestAndWorstMonths(last6);

  const selectedMonth = selectedBarKey
    ? last6.find((m) => m.key === selectedBarKey)
    : last6[last6.length - 1];

  const monthTxs = getMonthTransactions(transactions, monthOffset);
  const monthStats = {
    income: monthTxs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
    expenses: monthTxs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
  };

  const currentMonthExpenses = monthTxs.filter((t) => t.type === "expense");
  const currentBreakdown = (() => {
    const b: Record<string, number> = {};
    for (const tx of currentMonthExpenses) {
      b[tx.category] = (b[tx.category] ?? 0) + tx.amount;
    }
    return b;
  })();

  const allTimeBreakdown = getAllTimeCategoryBreakdown(transactions);
  const sortedAllTime = Object.entries(allTimeBreakdown).sort(([, a], [, b]) => b - a);
  const allTimeTotal = Object.values(allTimeBreakdown).reduce((s, v) => s + v, 0);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingTop: topPadding + 8, paddingBottom: 80 + bottomPadding }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.screenTitle, { color: colors.foreground }]}>Análise</Text>
        </View>

        {/* Tab Selector */}
        <View style={[styles.tabSelector, { backgroundColor: colors.muted, marginHorizontal: 20 }]}>
          {(["monthly", "categories"] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabBtn, activeTab === tab && { backgroundColor: colors.card }]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, { color: activeTab === tab ? colors.foreground : colors.mutedForeground }]}>
                {tab === "monthly" ? "Por Mês" : "Por Categoria"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === "monthly" && (
          <>
            {/* Bar Chart */}
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>
                Últimos 6 meses
              </Text>
              <BarChart
                data={last6}
                currency={currency}
                selectedKey={selectedBarKey ?? last6[last6.length - 1]?.key}
                onSelect={setSelectedBarKey}
              />

              {selectedMonth && (
                <View style={[styles.selectedMonthDetail, { backgroundColor: colors.muted, borderRadius: 12 }]}>
                  <Text style={[styles.selectedMonthLabel, { color: colors.foreground }]}>
                    {selectedMonth.label}
                  </Text>
                  <View style={styles.selectedMonthStats}>
                    <View style={styles.selectedStat}>
                      <Text style={[styles.selectedStatLabel, { color: colors.mutedForeground }]}>Ganhos</Text>
                      <Text style={[styles.selectedStatValue, { color: colors.income }]}>
                        +{formatCurrency(selectedMonth.income, currency)}
                      </Text>
                    </View>
                    <View style={[styles.vDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.selectedStat}>
                      <Text style={[styles.selectedStatLabel, { color: colors.mutedForeground }]}>Gastos</Text>
                      <Text style={[styles.selectedStatValue, { color: colors.expense }]}>
                        -{formatCurrency(selectedMonth.expenses, currency)}
                      </Text>
                    </View>
                    <View style={[styles.vDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.selectedStat}>
                      <Text style={[styles.selectedStatLabel, { color: colors.mutedForeground }]}>Balanço</Text>
                      <Text
                        style={[
                          styles.selectedStatValue,
                          { color: selectedMonth.balance >= 0 ? colors.income : colors.expense },
                        ]}
                      >
                        {selectedMonth.balance >= 0 ? "+" : ""}{formatCurrency(selectedMonth.balance, currency)}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* Best / Worst Month */}
            {(best || worst) && (
              <View style={styles.bestWorstRow}>
                {best && (
                  <View style={[styles.highlightCard, { backgroundColor: "#dcfce7", flex: 1 }]}>
                    <View style={styles.highlightHeader}>
                      <Feather name="award" size={16} color="#16a34a" />
                      <Text style={[styles.highlightTitle, { color: "#14532d" }]}>Melhor Mês</Text>
                    </View>
                    <Text style={[styles.highlightMonth, { color: "#14532d" }]}>{best.shortLabel}</Text>
                    <Text style={[styles.highlightValue, { color: "#16a34a" }]}>
                      +{formatCurrency(best.balance, currency)}
                    </Text>
                  </View>
                )}
                {worst && worst.key !== best?.key && (
                  <View style={[styles.highlightCard, { backgroundColor: "#fee2e2", flex: 1 }]}>
                    <View style={styles.highlightHeader}>
                      <Feather name="alert-circle" size={16} color="#ef4444" />
                      <Text style={[styles.highlightTitle, { color: "#991b1b" }]}>Pior Mês</Text>
                    </View>
                    <Text style={[styles.highlightMonth, { color: "#991b1b" }]}>{worst.shortLabel}</Text>
                    <Text style={[styles.highlightValue, { color: "#ef4444" }]}>
                      {worst.balance >= 0 ? "+" : ""}{formatCurrency(worst.balance, currency)}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Month Navigator + Donut */}
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.monthNavRow}>
                <TouchableOpacity onPress={() => setMonthOffset((o) => o - 1)} hitSlop={12} style={styles.navBtn}>
                  <Feather name="chevron-left" size={20} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>
                  {getMonthName(monthOffset).charAt(0).toUpperCase() + getMonthName(monthOffset).slice(1)}
                </Text>
                <TouchableOpacity
                  onPress={() => setMonthOffset((o) => Math.min(0, o + 1))}
                  hitSlop={12}
                  style={styles.navBtn}
                  disabled={monthOffset >= 0}
                >
                  <Feather name="chevron-right" size={20} color={monthOffset >= 0 ? colors.muted : colors.foreground} />
                </TouchableOpacity>
              </View>

              <View style={styles.monthSummaryRow}>
                <View style={[styles.summaryPill, { backgroundColor: "#dcfce7" }]}>
                  <Text style={[styles.summaryPillLabel, { color: "#14532d" }]}>Ganhos</Text>
                  <Text style={[styles.summaryPillValue, { color: "#16a34a" }]}>
                    +{formatCurrency(monthStats.income, currency)}
                  </Text>
                </View>
                <View style={[styles.summaryPill, { backgroundColor: "#fee2e2" }]}>
                  <Text style={[styles.summaryPillLabel, { color: "#991b1b" }]}>Gastos</Text>
                  <Text style={[styles.summaryPillValue, { color: "#ef4444" }]}>
                    -{formatCurrency(monthStats.expenses, currency)}
                  </Text>
                </View>
              </View>

              <PieChart data={currentBreakdown} currency={currency} />
            </View>
          </>
        )}

        {activeTab === "categories" && (
          <>
            {/* Top Categories All Time */}
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>Maior gasto por categoria</Text>
              <Text style={[styles.cardSubtitle, { color: colors.mutedForeground }]}>Histórico completo</Text>

              {sortedAllTime.length === 0 ? (
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                  Sem dados suficientes. Regista os teus gastos!
                </Text>
              ) : (
                <View style={styles.catList}>
                  {sortedAllTime.slice(0, 8).map(([cat, value], i) => {
                    const pct = allTimeTotal > 0 ? (value / allTimeTotal) * 100 : 0;
                    const catColor = CATEGORY_COLORS[cat as TransactionCategory];
                    return (
                      <View key={cat} style={styles.catItem}>
                        <View style={styles.catItemHeader}>
                          <View style={[styles.catRank, { backgroundColor: i === 0 ? "#fef3c7" : colors.muted }]}>
                            <Text style={[styles.catRankText, { color: i === 0 ? "#d97706" : colors.mutedForeground }]}>
                              {i + 1}
                            </Text>
                          </View>
                          <View style={[styles.catDot, { backgroundColor: catColor }]} />
                          <Text style={[styles.catLabel, { color: colors.foreground }]}>
                            {CATEGORY_LABELS[cat as TransactionCategory]}
                          </Text>
                          <Text style={[styles.catValue, { color: colors.expense }]}>
                            -{formatCurrency(value, currency)}
                          </Text>
                        </View>
                        <View style={styles.catBarRow}>
                          <View style={[styles.catBarTrack, { backgroundColor: colors.muted }]}>
                            <View
                              style={[styles.catBarFill, { width: `${pct}%`, backgroundColor: catColor }]}
                            />
                          </View>
                          <Text style={[styles.catPct, { color: colors.mutedForeground }]}>
                            {pct.toFixed(0)}%
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>

            {/* All-time Pie */}
            {allTimeTotal > 0 && (
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>Distribuição Total</Text>
                <PieChart data={allTimeBreakdown} currency={currency} />
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  screenTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  tabSelector: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: "center",
  },
  tabText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  card: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 12,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  cardSubtitle: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: -8,
  },
  monthNavRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  navBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  monthSummaryRow: {
    flexDirection: "row",
    gap: 10,
  },
  summaryPill: {
    flex: 1,
    borderRadius: 10,
    padding: 10,
    gap: 2,
  },
  summaryPillLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  summaryPillValue: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.3,
  },
  barChart: {
    gap: 4,
    position: "relative",
  },
  barRefLine: {
    position: "absolute",
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderStyle: "dashed",
    zIndex: 0,
  },
  barsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 4,
    paddingBottom: 4,
  },
  barGroup: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  barPair: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 2,
    justifyContent: "center",
  },
  bar: {
    width: 10,
    minHeight: 2,
  },
  barSelector: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  barLabel: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
  },
  legendRow: {
    flexDirection: "row",
    gap: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  selectedMonthDetail: {
    padding: 12,
    gap: 8,
  },
  selectedMonthLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  selectedMonthStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  selectedStat: {
    flex: 1,
    gap: 2,
  },
  selectedStatLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  selectedStatValue: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.3,
  },
  vDivider: {
    width: 1,
    height: 28,
  },
  bestWorstRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    gap: 10,
    marginBottom: 12,
  },
  highlightCard: {
    borderRadius: 14,
    padding: 14,
    gap: 4,
  },
  highlightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  highlightTitle: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  highlightMonth: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  highlightValue: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  catList: {
    gap: 14,
  },
  catItem: {
    gap: 6,
  },
  catItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  catRank: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  catRankText: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
  },
  catDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  catLabel: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  catValue: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  catBarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingLeft: 30,
  },
  catBarTrack: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    overflow: "hidden",
  },
  catBarFill: {
    height: 5,
    borderRadius: 3,
  },
  catPct: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    width: 32,
    textAlign: "right",
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    paddingVertical: 20,
  },
});

import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import {
  formatCurrency,
  generateTips,
  getMonthlyStats,
} from "@/utils/finance";

export default function TipsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { transactions, profile } = useApp();
  const currency = profile.currency || "EUR";

  const stats = getMonthlyStats(transactions);
  const tips = generateTips(transactions, profile);
  const savingsRate = stats.income > 0 ? ((stats.income - stats.expenses) / stats.income) * 100 : 0;

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : 0;

  const objectiveLabels: Record<string, string> = {
    save: "Poupar",
    reduce_debt: "Reduzir Dívidas",
    invest: "Investir",
    control: "Controlar Gastos",
    freedom: "Independência Financeira",
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingTop: topPadding + 8, paddingBottom: 100 + bottomPadding }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.screenTitle, { color: colors.foreground }]}>Dicas</Text>
          <Text style={[styles.screenSubtitle, { color: colors.mutedForeground }]}>
            Personalizadas com base nos teus hábitos
          </Text>
        </View>

        {profile.mainObjective && (
          <View style={[styles.goalCard, { backgroundColor: colors.secondary, borderColor: colors.primary + "33" }]}>
            <View style={[styles.goalIcon, { backgroundColor: colors.primary + "22" }]}>
              <Feather name="target" size={20} color={colors.primary} />
            </View>
            <View style={styles.goalInfo}>
              <Text style={[styles.goalLabel, { color: colors.mutedForeground }]}>Objetivo principal</Text>
              <Text style={[styles.goalValue, { color: colors.foreground }]}>
                {objectiveLabels[profile.mainObjective] || profile.mainObjective}
              </Text>
            </View>
          </View>
        )}

        {stats.income > 0 && (
          <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>Resumo Financeiro</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Taxa de Poupança</Text>
                <Text style={[styles.statValue, { color: savingsRate >= 20 ? colors.income : colors.expense }]}>
                  {savingsRate.toFixed(0)}%
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Poupança Mensal</Text>
                <Text style={[styles.statValue, { color: colors.foreground }]}>
                  {formatCurrency(Math.max(0, stats.income - stats.expenses), currency)}
                </Text>
              </View>
              {profile.currentPatrimony > 0 && (
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Património</Text>
                  <Text style={[styles.statValue, { color: colors.foreground }]}>
                    {formatCurrency(profile.currentPatrimony, currency)}
                  </Text>
                </View>
              )}
              {profile.debts > 0 && (
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Dívidas</Text>
                  <Text style={[styles.statValue, { color: colors.expense }]}>
                    {formatCurrency(profile.debts, currency)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        <Text style={[styles.tipsTitle, { color: colors.foreground }]}>
          As tuas dicas de poupança
        </Text>

        <View style={styles.tipsList}>
          {tips.map((tip, i) => (
            <View
              key={i}
              style={[styles.tipCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={[styles.tipNumber, { backgroundColor: colors.primary + "15" }]}>
                <Text style={[styles.tipNumberText, { color: colors.primary }]}>{i + 1}</Text>
              </View>
              <Text style={[styles.tipText, { color: colors.foreground }]}>{tip}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.secondary, borderColor: colors.primary + "33" }]}>
          <Feather name="info" size={16} color={colors.primary} style={{ marginTop: 2 }} />
          <Text style={[styles.infoText, { color: colors.foreground }]}>
            As dicas são geradas automaticamente com base nas tuas transações e objetivos. Quanto mais dados registares, mais precisas serão as recomendações.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    gap: 4,
  },
  screenTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  screenSubtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  goalCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  goalIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  goalInfo: { flex: 1 },
  goalLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  goalValue: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  statsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statItem: {
    width: "46%",
    gap: 2,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  statValue: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  tipsTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  tipsList: {
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 16,
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  tipNumber: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  tipNumberText: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  infoCard: {
    flexDirection: "row",
    marginHorizontal: 20,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
    alignItems: "flex-start",
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 19,
  },
});

import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { useCurrency } from "@/hooks/useCurrency";
import { useT } from "@/hooks/useTranslations";
import { generateTips, getMonthlyStats } from "@/utils/finance";

export default function TipsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { transactions, profile, effectivePatrimony } = useApp();
  const { format } = useCurrency();
  const t = useT();

  const stats = getMonthlyStats(transactions);
  const tips = generateTips(transactions, profile);
  const savingsRate = stats.income > 0 ? ((stats.income - stats.expenses) / stats.income) * 100 : 0;
  const firstName = profile.name?.trim().split(" ")[0] || "";

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  const objectiveLabels: Record<string, string> = {
    save: t.objSaveShort,
    reduce_debt: t.objDebtShort,
    invest: t.objInvestShort,
    control: t.objControlShort,
    freedom: t.objFreedomShort,
  };

  const patrimonyGain = effectivePatrimony - (profile.initialPatrimony ?? profile.currentPatrimony ?? 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingTop: topPadding + 8, paddingBottom: 80 + bottomPadding }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.screenTitle, { color: colors.foreground }]}>{t.tipsTitle}</Text>
          <Text style={[styles.screenSubtitle, { color: colors.mutedForeground }]}>
            {firstName
              ? `${t.tipsSubtitleName}, ${firstName}`
              : t.tipsSubtitle}
          </Text>
        </View>

        {profile.mainObjective && (
          <View style={[styles.goalCard, { backgroundColor: colors.secondary, borderColor: colors.primary + "33" }]}>
            <View style={[styles.goalIcon, { backgroundColor: colors.primary + "22" }]}>
              <Feather name="target" size={20} color={colors.primary} />
            </View>
            <View style={styles.goalInfo}>
              <Text style={[styles.goalLabel, { color: colors.mutedForeground }]}>{t.mainObjectiveLabel}</Text>
              <Text style={[styles.goalValue, { color: colors.foreground }]}>
                {objectiveLabels[profile.mainObjective] || profile.mainObjective}
              </Text>
            </View>
          </View>
        )}

        {stats.income > 0 && (
          <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>{t.financialSummary}</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{t.savingsRate}</Text>
                <Text style={[styles.statValue, { color: savingsRate >= 20 ? colors.income : colors.expense }]}>
                  {savingsRate.toFixed(0)}%
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{t.monthlySavings}</Text>
                <Text style={[styles.statValue, { color: colors.foreground }]}>
                  {format(Math.max(0, stats.income - stats.expenses))}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{t.currentPatrimony}</Text>
                <Text style={[styles.statValue, { color: colors.foreground }]}>
                  {format(effectivePatrimony)}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{t.totalEvolution}</Text>
                <Text style={[styles.statValue, { color: patrimonyGain >= 0 ? colors.income : colors.expense }]}>
                  {patrimonyGain >= 0 ? "+" : ""}{format(patrimonyGain)}
                </Text>
              </View>
            </View>
          </View>
        )}

        <Text style={[styles.tipsTitle, { color: colors.foreground }]}>
          {firstName ? `${t.yourTipsName}, ${firstName}` : t.yourTips}
        </Text>

        <View style={styles.tipsList}>
          {tips.map((tip, i) => (
            <View key={i} style={[styles.tipCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.tipNumber, { backgroundColor: colors.primary + "15" }]}>
                <Text style={[styles.tipNumberText, { color: colors.primary }]}>{i + 1}</Text>
              </View>
              <Text style={[styles.tipText, { color: colors.foreground }]}>{tip}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.secondary, borderColor: colors.primary + "33" }]}>
          <Feather name="info" size={16} color={colors.primary} style={{ marginTop: 2 }} />
          <Text style={[styles.infoText, { color: colors.foreground }]}>{t.tipsNote}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12, gap: 4 },
  screenTitle: { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  screenSubtitle: { fontSize: 14, fontFamily: "Inter_400Regular" },
  goalCard: { flexDirection: "row", alignItems: "center", marginHorizontal: 20, marginBottom: 12, padding: 14, borderRadius: 14, borderWidth: 1, gap: 12 },
  goalIcon: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  goalInfo: { flex: 1 },
  goalLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  goalValue: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  statsCard: { marginHorizontal: 20, marginBottom: 20, padding: 16, borderRadius: 16, borderWidth: 1, gap: 12 },
  cardTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 14 },
  statItem: { width: "46%", gap: 2 },
  statLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  statValue: { fontSize: 18, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  tipsTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold", paddingHorizontal: 20, marginBottom: 10 },
  tipsList: { paddingHorizontal: 20, gap: 10, marginBottom: 16 },
  tipCard: { flexDirection: "row", alignItems: "flex-start", padding: 16, borderRadius: 14, borderWidth: 1, gap: 12 },
  tipNumber: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  tipNumberText: { fontSize: 14, fontFamily: "Inter_700Bold" },
  tipText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 21 },
  infoCard: { flexDirection: "row", marginHorizontal: 20, padding: 14, borderRadius: 14, borderWidth: 1, gap: 10, alignItems: "flex-start" },
  infoText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
});

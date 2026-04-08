import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
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
import AddTransactionModal from "@/components/AddTransactionModal";
import TransactionCard from "@/components/TransactionCard";
import { Transaction, useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import {
  CURRENCY_SYMBOLS,
  formatCurrency,
  getMonthlyStats,
  getMonthTransactions,
} from "@/utils/finance";

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { transactions, profile } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);

  const currency = profile.currency || "EUR";
  const symbol = CURRENCY_SYMBOLS[currency] || "€";

  const stats = getMonthlyStats(transactions);
  const recentTxs = getMonthTransactions(transactions).slice(0, 8);

  const now = new Date();
  const monthName = now.toLocaleDateString("pt-PT", { month: "long", year: "numeric" });

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingTop: topPadding, paddingBottom: 100 + bottomPadding }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <Text style={[styles.monthLabel, { color: colors.mutedForeground }]}>
            {monthName.charAt(0).toUpperCase() + monthName.slice(1)}
          </Text>
          <Text style={[styles.balanceTitle, { color: colors.mutedForeground }]}>Saldo do Mês</Text>
          <Text
            style={[
              styles.balanceAmount,
              { color: stats.balance >= 0 ? colors.income : colors.expense },
            ]}
          >
            {stats.balance >= 0 ? "+" : ""}{formatCurrency(stats.balance, currency)}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: "#dcfce7" }]}>
            <View style={styles.statCardHeader}>
              <View style={[styles.statIcon, { backgroundColor: colors.income + "22" }]}>
                <Feather name="trending-up" size={16} color={colors.income} />
              </View>
              <Text style={[styles.statLabel, { color: "#14532d" }]}>Ganhos</Text>
            </View>
            <Text style={[styles.statAmount, { color: colors.income }]}>
              +{formatCurrency(stats.income, currency)}
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: "#fee2e2" }]}>
            <View style={styles.statCardHeader}>
              <View style={[styles.statIcon, { backgroundColor: colors.expense + "22" }]}>
                <Feather name="trending-down" size={16} color={colors.expense} />
              </View>
              <Text style={[styles.statLabel, { color: "#991b1b" }]}>Gastos</Text>
            </View>
            <Text style={[styles.statAmount, { color: colors.expense }]}>
              -{formatCurrency(stats.expenses, currency)}
            </Text>
          </View>
        </View>

        {profile.monthlyIncome > 0 && (
          <View style={[styles.progressSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressLabel, { color: colors.foreground }]}>
                Progresso do Orçamento
              </Text>
              <Text style={[styles.progressPct, { color: colors.mutedForeground }]}>
                {Math.min(100, Math.round((stats.expenses / profile.monthlyIncome) * 100))}%
              </Text>
            </View>
            <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(100, (stats.expenses / profile.monthlyIncome) * 100)}%`,
                    backgroundColor:
                      stats.expenses > profile.monthlyIncome ? colors.expense : colors.income,
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressSub, { color: colors.mutedForeground }]}>
              {formatCurrency(stats.expenses, currency)} de {formatCurrency(profile.monthlyIncome, currency)}
            </Text>
          </View>
        )}

        <View style={styles.txSection}>
          <View style={styles.txHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Transações Recentes
            </Text>
          </View>

          {recentTxs.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="inbox" size={32} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                Sem transações este mês
              </Text>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                Toca no "+" para registar o teu primeiro ganho ou gasto
              </Text>
            </View>
          ) : (
            <View style={styles.txList}>
              {recentTxs.map((tx) => (
                <TransactionCard
                  key={tx.id}
                  transaction={tx}
                  currency={currency}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setEditTx(tx);
                    setShowModal(true);
                  }}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary, bottom: 88 + bottomPadding }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setEditTx(null);
          setShowModal(true);
        }}
        activeOpacity={0.85}
      >
        <Feather name="plus" size={26} color="#fff" />
      </TouchableOpacity>

      <AddTransactionModal
        visible={showModal}
        onClose={() => {
          setShowModal(false);
          setEditTx(null);
        }}
        editTransaction={editTx}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerSection: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 4,
  },
  monthLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  balanceTitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  balanceAmount: {
    fontSize: 42,
    fontFamily: "Inter_700Bold",
    letterSpacing: -1,
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    gap: 8,
  },
  statCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  statLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  statAmount: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  progressSection: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 8,
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressLabel: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  progressPct: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  progressSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  txSection: {
    paddingHorizontal: 20,
    gap: 12,
  },
  txHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  txList: {
    gap: 8,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  fab: {
    position: "absolute",
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
});

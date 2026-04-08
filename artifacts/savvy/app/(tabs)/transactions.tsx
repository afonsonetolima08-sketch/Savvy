import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AddTransactionModal from "@/components/AddTransactionModal";
import TransactionCard from "@/components/TransactionCard";
import { Transaction, TransactionType, useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { useT } from "@/hooks/useTranslations";

export default function TransactionsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { transactions, deleteTransaction } = useApp();
  const t = useT();
  const [showModal, setShowModal] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [filter, setFilter] = useState<TransactionType | "all">("all");

  const filtered = transactions.filter((tx) => filter === "all" || tx.type === filter);

  const handleDelete = (tx: Transaction) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(t.deleteTransactionTitle, t.deleteConfirm, [
      { text: t.cancel, style: "cancel" },
      {
        text: t.delete,
        style: "destructive",
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          deleteTransaction(tx.id);
        },
      },
    ]);
  };

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.headerArea, { paddingTop: topPadding + 8 }]}>
        <View style={styles.titleRow}>
          <Text style={[styles.screenTitle, { color: colors.foreground }]}>{t.transactionsTitle}</Text>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setEditTx(null);
              setShowModal(true);
            }}
            activeOpacity={0.85}
          >
            <Feather name="plus" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={[styles.filterRow, { backgroundColor: colors.muted }]}>
          {(["all", "income", "expense"] as const).map((f) => {
            const label = f === "all" ? t.all : f === "income" ? t.gainLabel : t.expenseLabel;
            const active = filter === f;
            return (
              <TouchableOpacity
                key={f}
                style={[
                  styles.filterBtn,
                  active && {
                    backgroundColor:
                      f === "income" ? colors.income : f === "expense" ? colors.expense : colors.card,
                  },
                ]}
                onPress={() => setFilter(f)}
                activeOpacity={0.8}
              >
                <Text style={[styles.filterText, { color: active ? (f === "all" ? colors.foreground : "#fff") : colors.mutedForeground }]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 + bottomPadding, gap: 8 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onLongPress={() => handleDelete(item)}
            delayLongPress={500}
            onPress={() => {
              Haptics.selectionAsync();
              setEditTx(item);
              setShowModal(true);
            }}
            activeOpacity={1}
          >
            <TransactionCard transaction={item} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="inbox" size={32} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>{t.noTransactionsList}</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>{t.noTransactionsListHint}</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

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
  headerArea: { paddingHorizontal: 20, paddingBottom: 8, gap: 12 },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  screenTitle: { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  addBtn: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  filterRow: { flexDirection: "row", borderRadius: 12, padding: 4 },
  filterBtn: { flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: "center" },
  filterText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
    marginTop: 24,
  },
  emptyTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
});

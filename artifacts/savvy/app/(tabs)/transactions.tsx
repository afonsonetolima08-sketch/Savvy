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

export default function TransactionsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { transactions, profile, deleteTransaction } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [filter, setFilter] = useState<TransactionType | "all">("all");

  const currency = profile.currency || "EUR";

  const filtered = transactions.filter((tx) => filter === "all" || tx.type === filter);

  const handleDelete = (tx: Transaction) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert("Eliminar transação", "Tens a certeza que queres eliminar esta transação?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          deleteTransaction(tx.id);
        },
      },
    ]);
  };

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPadding + 8 }]}>
        <Text style={[styles.screenTitle, { color: colors.foreground }]}>Transações</Text>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setEditTx(null);
            setShowModal(true);
          }}
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          activeOpacity={0.85}
        >
          <Feather name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        {(["all", "income", "expense"] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterChip,
              {
                backgroundColor: filter === f ? colors.primary : colors.card,
                borderColor: filter === f ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setFilter(f)}
            activeOpacity={0.75}
          >
            <Text
              style={[
                styles.filterText,
                { color: filter === f ? "#fff" : colors.foreground },
              ]}
            >
              {f === "all" ? "Todas" : f === "income" ? "Ganhos" : "Gastos"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 100 + bottomPadding,
          gap: 8,
        }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onLongPress={() => handleDelete(item)}
            onPress={() => {
              Haptics.selectionAsync();
              setEditTx(item);
              setShowModal(true);
            }}
            activeOpacity={0.9}
          >
            <TransactionCard transaction={item} currency={currency} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="inbox" size={32} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              Sem transações
            </Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Regista o teu primeiro ganho ou gasto tocando em "+"
            </Text>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  screenTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
  },
  filterChip: {
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
    marginTop: 20,
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
});

import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";
import { Transaction } from "@/context/AppContext";
import { CATEGORY_COLORS, CATEGORY_ICONS, CATEGORY_LABELS, formatCurrency, formatDate } from "@/utils/finance";

interface TransactionCardProps {
  transaction: Transaction;
  currency: string;
  onPress?: () => void;
}

export default function TransactionCard({ transaction, currency, onPress }: TransactionCardProps) {
  const colors = useColors();
  const isIncome = transaction.type === "income";
  const catColor = CATEGORY_COLORS[transaction.category];
  const icon = CATEGORY_ICONS[transaction.category];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={[styles.iconWrap, { backgroundColor: catColor + "1a" }]}>
        <Feather name={icon as any} size={18} color={catColor} />
      </View>
      <View style={styles.info}>
        <Text style={[styles.description, { color: colors.foreground }]} numberOfLines={1}>
          {transaction.description || CATEGORY_LABELS[transaction.category]}
        </Text>
        <Text style={[styles.date, { color: colors.mutedForeground }]}>
          {CATEGORY_LABELS[transaction.category]} · {formatDate(transaction.date)}
        </Text>
      </View>
      <Text style={[styles.amount, { color: isIncome ? colors.income : colors.expense }]}>
        {isIncome ? "+" : "-"}{formatCurrency(transaction.amount, currency)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    gap: 2,
  },
  description: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  date: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  amount: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
});

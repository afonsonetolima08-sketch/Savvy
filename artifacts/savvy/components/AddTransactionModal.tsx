import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Transaction, TransactionCategory, TransactionType, useApp } from "@/context/AppContext";
import {
  CATEGORY_ICONS,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from "@/utils/finance";
import { useCurrency } from "@/hooks/useCurrency";
import { useT } from "@/hooks/useTranslations";
import * as Haptics from "expo-haptics";

interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  editTransaction?: Transaction | null;
}

export default function AddTransactionModal({ visible, onClose, editTransaction }: AddTransactionModalProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addTransaction, updateTransaction, convertAmount } = useApp();
  const { symbol, currency, toBase } = useCurrency();
  const t = useT();

  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<TransactionCategory>("food");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    if (editTransaction) {
      setType(editTransaction.type);
      // Convert stored EUR amount to display currency for editing
      const displayAmt = convertAmount(editTransaction.amount, currency);
      setAmount(Number.isInteger(displayAmt) ? displayAmt.toString() : displayAmt.toFixed(2));
      setCategory(editTransaction.category);
      setDescription(editTransaction.description);
      setDate(editTransaction.date.split("T")[0]);
    } else {
      resetForm();
    }
  }, [editTransaction, visible]);

  const resetForm = () => {
    setType("expense");
    setAmount("");
    setCategory("food");
    setDescription("");
    setDate(new Date().toISOString().split("T")[0]);
  };

  const getCategoryLabel = (cat: TransactionCategory): string => {
    const map: Record<TransactionCategory, string> = {
      salary: t.catSalary,
      freelance: t.catFreelance,
      investment: t.catInvestment,
      gift: t.catGift,
      food: t.catFood,
      housing: t.catHousing,
      transport: t.catTransport,
      health: t.catHealth,
      entertainment: t.catEntertainment,
      shopping: t.catShopping,
      education: t.catEducation,
      utilities: t.catUtilities,
      travel: t.catTravel,
      other: t.catOther,
    };
    return map[cat];
  };

  const handleSave = () => {
    const parsedDisplayAmount = parseFloat(amount.replace(",", "."));
    if (!amount || isNaN(parsedDisplayAmount) || parsedDisplayAmount <= 0) {
      Alert.alert(t.invalidAmount, t.invalidAmountMsg);
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Convert from display currency to EUR (base) for storage
    const eurAmount = toBase(parsedDisplayAmount);

    const txData = {
      type,
      amount: eurAmount,
      category,
      description: description.trim(),
      date: new Date(date).toISOString(),
    };

    if (editTransaction) {
      updateTransaction({ ...txData, id: editTransaction.id });
    } else {
      addTransaction(txData);
    }
    onClose();
  };

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={[styles.header, { borderBottomColor: colors.border, paddingTop: insets.top + 16 }]}>
          <TouchableOpacity onPress={onClose} hitSlop={8}>
            <Feather name="x" size={22} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            {editTransaction ? t.editRecord : t.newRecord}
          </Text>
          <TouchableOpacity onPress={handleSave} hitSlop={8}>
            <Text style={[styles.saveBtn, { color: colors.primary }]}>{t.save}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={[styles.typeSelector, { backgroundColor: colors.muted }]}>
            {(["expense", "income"] as TransactionType[]).map((tp) => (
              <TouchableOpacity
                key={tp}
                style={[
                  styles.typeBtn,
                  type === tp && {
                    backgroundColor: tp === "income" ? colors.income : colors.expense,
                  },
                ]}
                onPress={() => {
                  setType(tp);
                  setCategory(tp === "income" ? "salary" : "food");
                }}
                activeOpacity={0.8}
              >
                <Text style={[styles.typeBtnText, { color: type === tp ? "#fff" : colors.mutedForeground }]}>
                  {tp === "income" ? t.gainLabel : t.expenseLabel}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>{t.amountLabel}</Text>
            <View style={[styles.amountRow, { borderColor: colors.border, backgroundColor: colors.card }]}>
              <Text style={[styles.currencySign, { color: colors.primary }]}>{symbol}</Text>
              <TextInput
                style={[styles.amountInput, { color: colors.foreground }]}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="decimal-pad"
                autoFocus={!editTransaction}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>{t.categoryLabel}</Text>
            <View style={styles.categoryGrid}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: category === cat ? colors.primary : colors.card,
                      borderColor: category === cat ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setCategory(cat)}
                  activeOpacity={0.7}
                >
                  <Feather
                    name={CATEGORY_ICONS[cat] as any}
                    size={14}
                    color={category === cat ? "#fff" : colors.foreground}
                  />
                  <Text
                    style={[
                      styles.categoryChipText,
                      { color: category === cat ? "#fff" : colors.foreground },
                    ]}
                  >
                    {getCategoryLabel(cat)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>{t.descriptionLabel}</Text>
            <TextInput
              style={[styles.textInput, { borderColor: colors.border, backgroundColor: colors.card, color: colors.foreground }]}
              value={description}
              onChangeText={setDescription}
              placeholder={t.descriptionPlaceholder}
              placeholderTextColor={colors.mutedForeground}
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>{t.dateLabel}</Text>
            <TextInput
              style={[styles.textInput, { borderColor: colors.border, backgroundColor: colors.card, color: colors.foreground }]}
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.mutedForeground}
            />
          </View>

          <View style={{ height: 40 + insets.bottom }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  saveBtn: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
  },
  typeSelector: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 4,
    marginTop: 20,
    marginBottom: 4,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  typeBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  section: {
    marginTop: 20,
    gap: 10,
  },
  label: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.8,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 4,
  },
  currencySign: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    paddingVertical: 14,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
});

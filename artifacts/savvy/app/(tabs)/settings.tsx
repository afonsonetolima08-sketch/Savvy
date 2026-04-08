import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
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
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { CURRENCY_SYMBOLS } from "@/utils/finance";

const CURRENCIES = ["EUR", "USD", "BRL", "GBP", "JPY", "CHF", "CAD"];

const OBJECTIVES: { label: string; value: string }[] = [
  { label: "Poupar dinheiro", value: "save" },
  { label: "Reduzir dívidas", value: "reduce_debt" },
  { label: "Investir", value: "invest" },
  { label: "Controlar gastos", value: "control" },
  { label: "Independência financeira", value: "freedom" },
];

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile, updateProfile } = useApp();

  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [showObjectivePicker, setShowObjectivePicker] = useState(false);
  const [editingIncome, setEditingIncome] = useState(false);
  const [incomeValue, setIncomeValue] = useState(profile.monthlyIncome.toString());
  const [editingPatrimony, setEditingPatrimony] = useState(false);
  const [patrimonyValue, setPatrimonyValue] = useState(profile.currentPatrimony.toString());

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : 0;

  const currency = profile.currency || "EUR";
  const symbol = CURRENCY_SYMBOLS[currency] || "€";

  const handleCurrencyChange = (cur: string) => {
    Haptics.selectionAsync();
    updateProfile({ currency: cur });
    setShowCurrencyPicker(false);
  };

  const handleSaveIncome = () => {
    const val = parseFloat(incomeValue.replace(",", ".")) || 0;
    updateProfile({ monthlyIncome: val });
    setEditingIncome(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleSavePatrimony = () => {
    const val = parseFloat(patrimonyValue.replace(",", ".")) || 0;
    updateProfile({ currentPatrimony: val });
    setEditingPatrimony(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const currentObjective = OBJECTIVES.find((o) => o.value === profile.mainObjective);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingTop: topPadding + 8, paddingBottom: 100 + bottomPadding }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.screenTitle, { color: colors.foreground }]}>Definições</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>PERFIL FINANCEIRO</Text>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TouchableOpacity
              style={styles.row}
              onPress={() => {
                setIncomeValue(profile.monthlyIncome.toString());
                setEditingIncome(true);
              }}
            >
              <View style={styles.rowLeft}>
                <View style={[styles.rowIcon, { backgroundColor: colors.primary + "15" }]}>
                  <Feather name="dollar-sign" size={16} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.rowLabel, { color: colors.foreground }]}>Rendimento Mensal</Text>
                  <Text style={[styles.rowValue, { color: colors.mutedForeground }]}>
                    {symbol}{profile.monthlyIncome.toLocaleString()}
                  </Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <TouchableOpacity
              style={styles.row}
              onPress={() => {
                setPatrimonyValue(profile.currentPatrimony.toString());
                setEditingPatrimony(true);
              }}
            >
              <View style={styles.rowLeft}>
                <View style={[styles.rowIcon, { backgroundColor: colors.primary + "15" }]}>
                  <Feather name="archive" size={16} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.rowLabel, { color: colors.foreground }]}>Património Atual</Text>
                  <Text style={[styles.rowValue, { color: colors.mutedForeground }]}>
                    {symbol}{profile.currentPatrimony.toLocaleString()}
                  </Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <TouchableOpacity style={styles.row} onPress={() => setShowObjectivePicker(true)}>
              <View style={styles.rowLeft}>
                <View style={[styles.rowIcon, { backgroundColor: colors.primary + "15" }]}>
                  <Feather name="target" size={16} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.rowLabel, { color: colors.foreground }]}>Objetivo Principal</Text>
                  <Text style={[styles.rowValue, { color: colors.mutedForeground }]}>
                    {currentObjective?.label || "Não definido"}
                  </Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>PREFERÊNCIAS</Text>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TouchableOpacity style={styles.row} onPress={() => setShowCurrencyPicker(true)}>
              <View style={styles.rowLeft}>
                <View style={[styles.rowIcon, { backgroundColor: colors.accent + "15" }]}>
                  <Feather name="globe" size={16} color={colors.accent} />
                </View>
                <View>
                  <Text style={[styles.rowLabel, { color: colors.foreground }]}>Moeda</Text>
                  <Text style={[styles.rowValue, { color: colors.mutedForeground }]}>
                    {currency} — {CURRENCY_SYMBOLS[currency]}
                  </Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <View style={[styles.rowIcon, { backgroundColor: colors.accent + "15" }]}>
                  <Feather name="type" size={16} color={colors.accent} />
                </View>
                <View>
                  <Text style={[styles.rowLabel, { color: colors.foreground }]}>Idioma</Text>
                  <Text style={[styles.rowValue, { color: colors.mutedForeground }]}>Português</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>SOBRE</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <View style={[styles.rowIcon, { backgroundColor: colors.muted }]}>
                  <Feather name="info" size={16} color={colors.mutedForeground} />
                </View>
                <View>
                  <Text style={[styles.rowLabel, { color: colors.foreground }]}>Versão</Text>
                  <Text style={[styles.rowValue, { color: colors.mutedForeground }]}>1.0.0</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal visible={showCurrencyPicker} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowCurrencyPicker(false)}>
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border, paddingTop: insets.top + 16 }]}>
            <TouchableOpacity onPress={() => setShowCurrencyPicker(false)} hitSlop={8}>
              <Feather name="x" size={22} color={colors.foreground} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Escolher Moeda</Text>
            <View style={{ width: 22 }} />
          </View>
          <ScrollView contentContainerStyle={{ padding: 16, gap: 8 }}>
            {CURRENCIES.map((cur) => (
              <TouchableOpacity
                key={cur}
                style={[styles.pickerOption, { backgroundColor: cur === currency ? colors.primary : colors.card, borderColor: cur === currency ? colors.primary : colors.border }]}
                onPress={() => handleCurrencyChange(cur)}
                activeOpacity={0.75}
              >
                <Text style={[styles.pickerSymbol, { color: cur === currency ? "#fff" : colors.primary }]}>
                  {CURRENCY_SYMBOLS[cur]}
                </Text>
                <Text style={[styles.pickerLabel, { color: cur === currency ? "#fff" : colors.foreground }]}>
                  {cur}
                </Text>
                {cur === currency && <Feather name="check" size={18} color="#fff" />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      <Modal visible={showObjectivePicker} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowObjectivePicker(false)}>
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border, paddingTop: insets.top + 16 }]}>
            <TouchableOpacity onPress={() => setShowObjectivePicker(false)} hitSlop={8}>
              <Feather name="x" size={22} color={colors.foreground} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Objetivo Principal</Text>
            <View style={{ width: 22 }} />
          </View>
          <ScrollView contentContainerStyle={{ padding: 16, gap: 8 }}>
            {OBJECTIVES.map((obj) => {
              const sel = profile.mainObjective === obj.value;
              return (
                <TouchableOpacity
                  key={obj.value}
                  style={[styles.pickerOption, { backgroundColor: sel ? colors.primary : colors.card, borderColor: sel ? colors.primary : colors.border }]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    updateProfile({ mainObjective: obj.value });
                    setShowObjectivePicker(false);
                  }}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.pickerLabel, { color: sel ? "#fff" : colors.foreground, flex: 1 }]}>
                    {obj.label}
                  </Text>
                  {sel && <Feather name="check" size={18} color="#fff" />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </Modal>

      <Modal visible={editingIncome} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setEditingIncome(false)}>
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border, paddingTop: insets.top + 16 }]}>
            <TouchableOpacity onPress={() => setEditingIncome(false)} hitSlop={8}>
              <Feather name="x" size={22} color={colors.foreground} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Rendimento Mensal</Text>
            <TouchableOpacity onPress={handleSaveIncome} hitSlop={8}>
              <Text style={[styles.saveText, { color: colors.primary }]}>Guardar</Text>
            </TouchableOpacity>
          </View>
          <View style={{ padding: 24 }}>
            <View style={[styles.numRow, { borderColor: colors.border, backgroundColor: colors.card }]}>
              <Text style={[styles.numSymbol, { color: colors.primary }]}>{symbol}</Text>
              <TextInput
                style={[styles.numInput, { color: colors.foreground }]}
                value={incomeValue}
                onChangeText={setIncomeValue}
                keyboardType="decimal-pad"
                autoFocus
              />
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={editingPatrimony} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setEditingPatrimony(false)}>
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border, paddingTop: insets.top + 16 }]}>
            <TouchableOpacity onPress={() => setEditingPatrimony(false)} hitSlop={8}>
              <Feather name="x" size={22} color={colors.foreground} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Património Atual</Text>
            <TouchableOpacity onPress={handleSavePatrimony} hitSlop={8}>
              <Text style={[styles.saveText, { color: colors.primary }]}>Guardar</Text>
            </TouchableOpacity>
          </View>
          <View style={{ padding: 24 }}>
            <View style={[styles.numRow, { borderColor: colors.border, backgroundColor: colors.card }]}>
              <Text style={[styles.numSymbol, { color: colors.primary }]}>{symbol}</Text>
              <TextInput
                style={[styles.numInput, { color: colors.foreground }]}
                value={patrimonyValue}
                onChangeText={setPatrimonyValue}
                keyboardType="decimal-pad"
                autoFocus
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  screenTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.8,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  rowValue: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  divider: {
    height: 1,
    marginLeft: 62,
  },
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  saveText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  pickerOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  pickerSymbol: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    width: 30,
  },
  pickerLabel: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    flex: 1,
  },
  numRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 20,
  },
  numSymbol: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  numInput: {
    flex: 1,
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    paddingVertical: 16,
    paddingLeft: 8,
  },
});

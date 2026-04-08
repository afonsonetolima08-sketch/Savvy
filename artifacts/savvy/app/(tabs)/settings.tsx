import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
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

type EditModal = "currency" | "objective" | "income" | "patrimony" | "name" | null;

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile, updateProfile } = useApp();

  const [activeModal, setActiveModal] = useState<EditModal>(null);
  const [inputValue, setInputValue] = useState("");

  const currency = profile.currency || "EUR";
  const symbol = CURRENCY_SYMBOLS[currency] || "€";

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  const openEdit = (type: EditModal, initialValue = "") => {
    setInputValue(initialValue);
    setActiveModal(type);
  };

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (activeModal === "income") {
      updateProfile({ monthlyIncome: parseFloat(inputValue.replace(",", ".")) || 0 });
    } else if (activeModal === "patrimony") {
      const val = parseFloat(inputValue.replace(",", ".")) || 0;
      updateProfile({ initialPatrimony: val, currentPatrimony: val });
    } else if (activeModal === "name") {
      updateProfile({ name: inputValue.trim() });
    }
    setActiveModal(null);
  };

  const currentObjective = OBJECTIVES.find((o) => o.value === profile.mainObjective);

  function SettingsRow({
    icon,
    label,
    value,
    onPress,
    iconBg,
    iconColor,
    last = false,
  }: {
    icon: string;
    label: string;
    value: string;
    onPress?: () => void;
    iconBg?: string;
    iconColor?: string;
    last?: boolean;
  }) {
    return (
      <>
        <TouchableOpacity
          style={styles.row}
          onPress={onPress}
          activeOpacity={onPress ? 0.7 : 1}
          disabled={!onPress}
        >
          <View style={[styles.rowIcon, { backgroundColor: iconBg ?? colors.primary + "15" }]}>
            <Feather name={icon as any} size={16} color={iconColor ?? colors.primary} />
          </View>
          <View style={styles.rowText}>
            <Text style={[styles.rowLabel, { color: colors.foreground }]}>{label}</Text>
            <Text style={[styles.rowValue, { color: colors.mutedForeground }]} numberOfLines={1}>
              {value}
            </Text>
          </View>
          {onPress && <Feather name="chevron-right" size={16} color={colors.mutedForeground} />}
        </TouchableOpacity>
        {!last && <View style={[styles.divider, { backgroundColor: colors.border, marginLeft: 62 }]} />}
      </>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingTop: topPadding + 8, paddingBottom: 80 + bottomPadding }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.screenTitle, { color: colors.foreground }]}>Definições</Text>
        </View>

        {/* Profile */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>PERFIL</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <SettingsRow
              icon="user"
              label="Nome"
              value={profile.name || "Não definido"}
              onPress={() => openEdit("name", profile.name || "")}
            />
            <SettingsRow
              icon="dollar-sign"
              label="Rendimento Mensal"
              value={`${symbol}${profile.monthlyIncome.toLocaleString()}`}
              onPress={() => openEdit("income", profile.monthlyIncome.toString())}
            />
            <SettingsRow
              icon="archive"
              label="Património Inicial"
              value={`${symbol}${(profile.initialPatrimony ?? profile.currentPatrimony).toLocaleString()}`}
              onPress={() => openEdit("patrimony", (profile.initialPatrimony ?? profile.currentPatrimony).toString())}
            />
            <SettingsRow
              icon="target"
              label="Objetivo Principal"
              value={currentObjective?.label || "Não definido"}
              onPress={() => setActiveModal("objective")}
              last
            />
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>PREFERÊNCIAS</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <SettingsRow
              icon="globe"
              label="Moeda"
              value={`${currency} — ${CURRENCY_SYMBOLS[currency]}`}
              onPress={() => setActiveModal("currency")}
              iconBg={colors.accent + "15"}
              iconColor={colors.accent}
            />
            <SettingsRow
              icon="type"
              label="Idioma"
              value="Português"
              iconBg={colors.accent + "15"}
              iconColor={colors.accent}
              last
            />
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>SOBRE</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <SettingsRow
              icon="info"
              label="Versão"
              value="1.0.0"
              iconBg={colors.muted}
              iconColor={colors.mutedForeground}
              last
            />
          </View>
        </View>
      </ScrollView>

      {/* Currency Picker Modal */}
      <Modal
        visible={activeModal === "currency"}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border, paddingTop: insets.top + 16 }]}>
            <TouchableOpacity onPress={() => setActiveModal(null)} hitSlop={12}>
              <Feather name="x" size={22} color={colors.foreground} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Escolher Moeda</Text>
            <View style={{ width: 22 }} />
          </View>
          <ScrollView contentContainerStyle={{ padding: 16, gap: 8 }}>
            {CURRENCIES.map((cur) => {
              const sel = cur === currency;
              return (
                <TouchableOpacity
                  key={cur}
                  style={[
                    styles.pickerOption,
                    {
                      backgroundColor: sel ? colors.primary : colors.card,
                      borderColor: sel ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    updateProfile({ currency: cur });
                    setActiveModal(null);
                  }}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.pickerSymbol, { color: sel ? "#fff" : colors.primary }]}>
                    {CURRENCY_SYMBOLS[cur]}
                  </Text>
                  <Text style={[styles.pickerLabel, { color: sel ? "#fff" : colors.foreground }]}>{cur}</Text>
                  {sel && <Feather name="check" size={18} color="#fff" />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </Modal>

      {/* Objective Picker Modal */}
      <Modal
        visible={activeModal === "objective"}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border, paddingTop: insets.top + 16 }]}>
            <TouchableOpacity onPress={() => setActiveModal(null)} hitSlop={12}>
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
                  style={[
                    styles.pickerOption,
                    {
                      backgroundColor: sel ? colors.primary : colors.card,
                      borderColor: sel ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    updateProfile({ mainObjective: obj.value });
                    setActiveModal(null);
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

      {/* Text/Number Edit Modals */}
      {(activeModal === "income" || activeModal === "patrimony" || activeModal === "name") && (
        <Modal
          visible
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setActiveModal(null)}
        >
          <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border, paddingTop: insets.top + 16 }]}>
              <TouchableOpacity onPress={() => setActiveModal(null)} hitSlop={12}>
                <Feather name="x" size={22} color={colors.foreground} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>
                {activeModal === "income"
                  ? "Rendimento Mensal"
                  : activeModal === "patrimony"
                  ? "Património Inicial"
                  : "Nome"}
              </Text>
              <TouchableOpacity onPress={handleSave} hitSlop={12}>
                <Text style={[styles.saveText, { color: colors.primary }]}>Guardar</Text>
              </TouchableOpacity>
            </View>
            <View style={{ padding: 24 }}>
              {activeModal === "name" ? (
                <TextInput
                  style={[
                    styles.nameInput,
                    { borderColor: colors.border, backgroundColor: colors.card, color: colors.foreground },
                  ]}
                  value={inputValue}
                  onChangeText={setInputValue}
                  placeholder="O teu nome"
                  placeholderTextColor={colors.mutedForeground}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={handleSave}
                />
              ) : (
                <View style={[styles.numRow, { borderColor: colors.border, backgroundColor: colors.card }]}>
                  <Text style={[styles.numSymbol, { color: colors.primary }]}>{symbol}</Text>
                  <TextInput
                    style={[styles.numInput, { color: colors.foreground }]}
                    value={inputValue}
                    onChangeText={setInputValue}
                    keyboardType="decimal-pad"
                    autoFocus
                    returnKeyType="done"
                    onSubmitEditing={handleSave}
                  />
                </View>
              )}
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
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
    padding: 14,
    gap: 12,
    minHeight: 60,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: { flex: 1 },
  rowLabel: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  rowValue: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
  divider: { height: 1 },
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
    minHeight: 54,
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
  nameInput: {
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 22,
    fontFamily: "Inter_500Medium",
  },
});

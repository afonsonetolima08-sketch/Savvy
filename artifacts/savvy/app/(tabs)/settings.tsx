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
import { useCurrency } from "@/hooks/useCurrency";
import { useT } from "@/hooks/useTranslations";
import { CURRENCY_SYMBOLS } from "@/utils/finance";

const CURRENCIES = ["EUR", "USD", "BRL", "GBP", "JPY", "CHF", "CAD"];

const OBJECTIVES_CONFIG = [
  { key: "save" },
  { key: "reduce_debt" },
  { key: "invest" },
  { key: "control" },
  { key: "freedom" },
];

const LANGUAGES = [
  { code: "pt", flag: "🇵🇹" },
  { code: "en", flag: "🇬🇧" },
];

type EditModal = "currency" | "objective" | "income" | "patrimony" | "name" | "language" | null;

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile, updateProfile } = useApp();
  const { symbol, convert, toBase } = useCurrency();
  const t = useT();

  const [activeModal, setActiveModal] = useState<EditModal>(null);
  const [inputValue, setInputValue] = useState("");

  const currency = profile.currency || "EUR";

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  const openEdit = (type: EditModal, eurValue?: number) => {
    if (type === "income") {
      setInputValue(convert(eurValue ?? 0).toFixed(2));
    } else if (type === "patrimony") {
      setInputValue(convert(eurValue ?? 0).toFixed(2));
    } else if (type === "name") {
      setInputValue(profile.name || "");
    }
    setActiveModal(type);
  };

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const displayVal = parseFloat(inputValue.replace(",", ".")) || 0;
    if (activeModal === "income") {
      // User entered in display currency → convert to EUR for storage
      updateProfile({ monthlyIncome: toBase(displayVal) });
    } else if (activeModal === "patrimony") {
      const eurVal = toBase(displayVal);
      updateProfile({ initialPatrimony: eurVal, currentPatrimony: eurVal });
    } else if (activeModal === "name") {
      updateProfile({ name: inputValue.trim() });
    }
    setActiveModal(null);
  };

  const objectiveLabels: Record<string, string> = {
    save: t.objSave,
    reduce_debt: t.objDebt,
    invest: t.objInvest,
    control: t.objControl,
    freedom: t.objFreedom,
  };

  const currentObjectiveLabel = profile.mainObjective
    ? objectiveLabels[profile.mainObjective]
    : t.notDefined;

  const currentLangLabel = profile.language === "en" ? t.langEn : t.langPt;

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
            <Text style={[styles.rowValue, { color: colors.mutedForeground }]} numberOfLines={1}>{value}</Text>
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
          <Text style={[styles.screenTitle, { color: colors.foreground }]}>{t.settingsTitle}</Text>
        </View>

        {/* Profile */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>{t.sectionProfile}</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <SettingsRow
              icon="user"
              label={t.nameLabel}
              value={profile.name || t.notDefined}
              onPress={() => openEdit("name")}
            />
            <SettingsRow
              icon="dollar-sign"
              label={t.monthlyIncomeLabel}
              value={`${symbol}${convert(profile.monthlyIncome).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
              onPress={() => openEdit("income", profile.monthlyIncome)}
            />
            <SettingsRow
              icon="archive"
              label={t.initialPatrimonyLabel}
              value={`${symbol}${convert(profile.initialPatrimony ?? profile.currentPatrimony).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
              onPress={() => openEdit("patrimony", profile.initialPatrimony ?? profile.currentPatrimony)}
            />
            <SettingsRow
              icon="target"
              label={t.mainObjectiveSettingsLabel}
              value={currentObjectiveLabel}
              onPress={() => setActiveModal("objective")}
              last
            />
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>{t.sectionPreferences}</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <SettingsRow
              icon="globe"
              label={t.currencyLabel}
              value={`${currency} — ${CURRENCY_SYMBOLS[currency]}`}
              onPress={() => setActiveModal("currency")}
              iconBg={colors.accent + "15"}
              iconColor={colors.accent}
            />
            <SettingsRow
              icon="type"
              label={t.languageLabel}
              value={currentLangLabel}
              onPress={() => setActiveModal("language")}
              iconBg={colors.accent + "15"}
              iconColor={colors.accent}
              last
            />
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>{t.sectionAbout}</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <SettingsRow
              icon="info"
              label={t.versionLabel}
              value="1.0.0"
              iconBg={colors.muted}
              iconColor={colors.mutedForeground}
              last
            />
          </View>
        </View>
      </ScrollView>

      {/* Currency Picker */}
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
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>{t.chooseCurrency}</Text>
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
                    { backgroundColor: sel ? colors.primary : colors.card, borderColor: sel ? colors.primary : colors.border },
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

      {/* Language Picker */}
      <Modal
        visible={activeModal === "language"}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border, paddingTop: insets.top + 16 }]}>
            <TouchableOpacity onPress={() => setActiveModal(null)} hitSlop={12}>
              <Feather name="x" size={22} color={colors.foreground} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>{t.chooseLanguage}</Text>
            <View style={{ width: 22 }} />
          </View>
          <ScrollView contentContainerStyle={{ padding: 16, gap: 8 }}>
            {LANGUAGES.map((lang) => {
              const sel = (profile.language || "pt") === lang.code;
              const labelKey = lang.code === "pt" ? "langPt" : "langEn";
              return (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.pickerOption,
                    { backgroundColor: sel ? colors.primary : colors.card, borderColor: sel ? colors.primary : colors.border },
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    updateProfile({ language: lang.code });
                    setActiveModal(null);
                  }}
                  activeOpacity={0.75}
                >
                  <Text style={styles.flagEmoji}>{lang.flag}</Text>
                  <Text style={[styles.pickerLabel, { color: sel ? "#fff" : colors.foreground, flex: 1 }]}>
                    {t[labelKey as keyof typeof t]}
                  </Text>
                  {sel && <Feather name="check" size={18} color="#fff" />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </Modal>

      {/* Objective Picker */}
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
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>{t.chooseObjective}</Text>
            <View style={{ width: 22 }} />
          </View>
          <ScrollView contentContainerStyle={{ padding: 16, gap: 8 }}>
            {OBJECTIVES_CONFIG.map((obj) => {
              const sel = profile.mainObjective === obj.key;
              const label = objectiveLabels[obj.key];
              return (
                <TouchableOpacity
                  key={obj.key}
                  style={[
                    styles.pickerOption,
                    { backgroundColor: sel ? colors.primary : colors.card, borderColor: sel ? colors.primary : colors.border },
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    updateProfile({ mainObjective: obj.key });
                    setActiveModal(null);
                  }}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.pickerLabel, { color: sel ? "#fff" : colors.foreground, flex: 1 }]}>{label}</Text>
                  {sel && <Feather name="check" size={18} color="#fff" />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </Modal>

      {/* Name / Income / Patrimony Edit Modal */}
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
                  ? t.monthlyIncomeLabel
                  : activeModal === "patrimony"
                  ? t.initialPatrimonyLabel
                  : t.nameLabel}
              </Text>
              <TouchableOpacity onPress={handleSave} hitSlop={12}>
                <Text style={[styles.saveText, { color: colors.primary }]}>{t.save}</Text>
              </TouchableOpacity>
            </View>
            <View style={{ padding: 24 }}>
              {activeModal === "name" ? (
                <TextInput
                  style={[styles.nameInput, { borderColor: colors.border, backgroundColor: colors.card, color: colors.foreground }]}
                  value={inputValue}
                  onChangeText={setInputValue}
                  placeholder={profile.name || t.nameLabel}
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
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  screenTitle: { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  section: { paddingHorizontal: 20, marginBottom: 20, gap: 8 },
  sectionLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 0.8 },
  card: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12, minHeight: 60 },
  rowIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 15, fontFamily: "Inter_500Medium" },
  rowValue: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 1 },
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
  modalTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  saveText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  pickerOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    minHeight: 54,
  },
  flagEmoji: { fontSize: 24 },
  pickerSymbol: { fontSize: 18, fontFamily: "Inter_700Bold", width: 30 },
  pickerLabel: { fontSize: 16, fontFamily: "Inter_500Medium" },
  numRow: { flexDirection: "row", alignItems: "center", borderWidth: 2, borderRadius: 16, paddingHorizontal: 20 },
  numSymbol: { fontSize: 28, fontFamily: "Inter_700Bold" },
  numInput: { flex: 1, fontSize: 36, fontFamily: "Inter_700Bold", paddingVertical: 16, paddingLeft: 8 },
  nameInput: { borderWidth: 2, borderRadius: 16, paddingHorizontal: 20, paddingVertical: 18, fontSize: 22, fontFamily: "Inter_500Medium" },
});

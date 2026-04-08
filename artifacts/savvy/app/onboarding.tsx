import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
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
import { useApp } from "@/context/AppContext";

type Step = {
  id: string;
  question: string;
  subtitle?: string;
  type: "options" | "number" | "boolean";
  field: string;
  options?: { label: string; value: string }[];
};

const STEPS: Step[] = [
  {
    id: "objective",
    question: "Qual é o teu objetivo financeiro principal?",
    subtitle: "Vamos personalizar a tua experiência com base nos teus objetivos.",
    type: "options",
    field: "mainObjective",
    options: [
      { label: "Poupar dinheiro", value: "save" },
      { label: "Reduzir dívidas", value: "reduce_debt" },
      { label: "Investir", value: "invest" },
      { label: "Controlar gastos", value: "control" },
      { label: "Independência financeira", value: "freedom" },
    ],
  },
  {
    id: "income",
    question: "Qual é o teu rendimento mensal aproximado?",
    subtitle: "Em euros. Isto ajuda-nos a calibrar as tuas metas.",
    type: "number",
    field: "monthlyIncome",
  },
  {
    id: "patrimony",
    question: "Qual é o teu património atual?",
    subtitle: "Poupanças, investimentos e outros ativos (em euros).",
    type: "number",
    field: "currentPatrimony",
  },
  {
    id: "debts",
    question: "Tens dívidas? Se sim, qual o valor total?",
    subtitle: "Inclui empréstimos, cartões de crédito, etc. Coloca 0 se não tens.",
    type: "number",
    field: "debts",
  },
  {
    id: "dependents",
    question: "Tens dependentes financeiros?",
    subtitle: "Filhos, cônjuge, pais ou outros que dependem de ti financeiramente.",
    type: "boolean",
    field: "hasDependents",
  },
  {
    id: "horizon",
    question: "Qual é o teu horizonte de investimento?",
    subtitle: "Por quanto tempo pretendes manter os teus investimentos?",
    type: "options",
    field: "investmentHorizon",
    options: [
      { label: "Curto prazo (< 1 ano)", value: "short" },
      { label: "Médio prazo (1-5 anos)", value: "medium" },
      { label: "Longo prazo (5+ anos)", value: "long" },
    ],
  },
];

export default function OnboardingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { updateProfile } = useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [numValue, setNumValue] = useState("");
  const progressAnim = useRef(new Animated.Value(0)).current;

  const step = STEPS[currentStep];
  const progress = (currentStep + 1) / STEPS.length;

  const animateProgress = (p: number) => {
    Animated.timing(progressAnim, {
      toValue: p,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleOption = (value: string | boolean) => {
    Haptics.selectionAsync();
    const updated = { ...answers, [step.field]: value };
    setAnswers(updated);

    if (step.type !== "number") {
      setTimeout(() => goNext(updated), 200);
    }
  };

  const goNext = (updatedAnswers?: Record<string, any>) => {
    const ans = updatedAnswers ?? answers;

    if (step.type === "number") {
      const val = parseFloat(numValue.replace(",", ".")) || 0;
      ans[step.field] = val;
      setAnswers(ans);
      setNumValue("");
    }

    if (currentStep < STEPS.length - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      animateProgress((currentStep + 2) / STEPS.length);
      setCurrentStep((s) => s + 1);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      updateProfile({
        ...ans,
        onboardingCompleted: true,
        currency: "EUR",
        language: "pt",
        financialGoal: ans.mainObjective ?? "",
      });
      router.replace("/(tabs)");
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      animateProgress(currentStep / STEPS.length);
      setCurrentStep((s) => s - 1);
      setNumValue("");
    }
  };

  const canContinue =
    step.type === "number"
      ? numValue.length > 0
      : answers[step.field] !== undefined;

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={[styles.topBar, { paddingTop: insets.top + 16 }]}>
        {currentStep > 0 ? (
          <TouchableOpacity onPress={goBack} hitSlop={12}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 22 }} />
        )}
        <Text style={[styles.stepCounter, { color: colors.mutedForeground }]}>
          {currentStep + 1} / {STEPS.length}
        </Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={[styles.progressBar, { backgroundColor: colors.muted }]}>
        <Animated.View
          style={[styles.progressFill, { backgroundColor: colors.primary, width: progressWidth }]}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.questionBlock}>
          <Text style={[styles.question, { color: colors.foreground }]}>{step.question}</Text>
          {step.subtitle && (
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{step.subtitle}</Text>
          )}
        </View>

        {step.type === "options" && step.options && (
          <View style={styles.options}>
            {step.options.map((opt) => {
              const selected = answers[step.field] === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.optionCard,
                    {
                      backgroundColor: selected ? colors.primary : colors.card,
                      borderColor: selected ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => handleOption(opt.value)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.optionText, { color: selected ? "#fff" : colors.foreground }]}>
                    {opt.label}
                  </Text>
                  {selected && <Feather name="check" size={18} color="#fff" />}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {step.type === "boolean" && (
          <View style={styles.options}>
            {[
              { label: "Sim", value: true },
              { label: "Não", value: false },
            ].map((opt) => {
              const selected = answers[step.field] === opt.value;
              return (
                <TouchableOpacity
                  key={String(opt.value)}
                  style={[
                    styles.optionCard,
                    {
                      backgroundColor: selected ? colors.primary : colors.card,
                      borderColor: selected ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => handleOption(opt.value)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.optionText, { color: selected ? "#fff" : colors.foreground }]}>
                    {opt.label}
                  </Text>
                  {selected && <Feather name="check" size={18} color="#fff" />}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {step.type === "number" && (
          <View style={styles.numberBlock}>
            <View style={[styles.numberRow, { borderColor: canContinue ? colors.primary : colors.border, backgroundColor: colors.card }]}>
              <Text style={[styles.currencySymbol, { color: colors.primary }]}>€</Text>
              <TextInput
                style={[styles.numberInput, { color: colors.foreground }]}
                value={numValue}
                onChangeText={setNumValue}
                placeholder="0"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="decimal-pad"
                autoFocus
              />
            </View>
          </View>
        )}

        {(step.type === "number" || step.type === "boolean") && (
          <TouchableOpacity
            style={[
              styles.continueBtn,
              { backgroundColor: canContinue ? colors.primary : colors.muted },
            ]}
            onPress={() => goNext()}
            disabled={!canContinue}
            activeOpacity={0.85}
          >
            <Text style={[styles.continueBtnText, { color: canContinue ? "#fff" : colors.mutedForeground }]}>
              {currentStep < STEPS.length - 1 ? "Continuar" : "Começar"}
            </Text>
            <Feather
              name={currentStep < STEPS.length - 1 ? "arrow-right" : "check"}
              size={18}
              color={canContinue ? "#fff" : colors.mutedForeground}
            />
          </TouchableOpacity>
        )}

        <View style={{ height: insets.bottom + 32 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  stepCounter: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  progressBar: {
    height: 3,
    marginHorizontal: 24,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: 3,
    borderRadius: 2,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  questionBlock: {
    marginBottom: 32,
    gap: 10,
  },
  question: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  options: {
    gap: 10,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 18,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  optionText: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    flex: 1,
  },
  numberBlock: {
    gap: 16,
  },
  numberRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 20,
    gap: 4,
  },
  currencySymbol: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
  },
  numberInput: {
    flex: 1,
    fontSize: 40,
    fontFamily: "Inter_700Bold",
    paddingVertical: 16,
  },
  continueBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 32,
    paddingVertical: 16,
    borderRadius: 14,
  },
  continueBtnText: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
});

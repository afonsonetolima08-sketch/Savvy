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

type StepType = "options" | "number" | "boolean" | "text";

type Step = {
  id: string;
  question: string;
  subtitle?: string;
  type: StepType;
  field: string;
  options?: { label: string; value: string }[];
  placeholder?: string;
};

const STEPS: Step[] = [
  {
    id: "name",
    question: "Olá! Como te chamas?",
    subtitle: "Vamos personalizar a tua experiência.",
    type: "text",
    field: "name",
    placeholder: "O teu nome",
  },
  {
    id: "objective",
    question: "Qual é o teu objetivo financeiro principal?",
    subtitle: "Adapta as tuas dicas e recomendações.",
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
    subtitle: "Em euros. Ajuda-nos a calibrar as tuas metas.",
    type: "number",
    field: "monthlyIncome",
  },
  {
    id: "patrimony",
    question: "Qual é o teu património atual?",
    subtitle: "Poupanças, investimentos e outros ativos (em euros).",
    type: "number",
    field: "initialPatrimony",
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
  const [textValue, setTextValue] = useState("");
  const [numValue, setNumValue] = useState("");
  const progressAnim = useRef(new Animated.Value(1 / STEPS.length)).current;

  const step = STEPS[currentStep];
  const isLast = currentStep === STEPS.length - 1;

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
    if (step.type !== "number" && step.type !== "text") {
      setTimeout(() => goNext(updated), 220);
    }
  };

  const goNext = (updatedAnswers?: Record<string, any>) => {
    const ans = updatedAnswers ?? { ...answers };

    if (step.type === "number") {
      const val = parseFloat(numValue.replace(",", ".")) || 0;
      ans[step.field] = val;
      setNumValue("");
    } else if (step.type === "text") {
      ans[step.field] = textValue.trim();
      setTextValue("");
    }

    setAnswers(ans);

    if (currentStep < STEPS.length - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      animateProgress((currentStep + 2) / STEPS.length);
      setCurrentStep((s) => s + 1);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      updateProfile({
        ...ans,
        currentPatrimony: ans.initialPatrimony ?? 0,
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
      setTextValue("");
    }
  };

  const canContinue = (() => {
    if (step.type === "number") return numValue.length > 0;
    if (step.type === "text") return textValue.trim().length > 0;
    return answers[step.field] !== undefined;
  })();

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={[styles.topBar, { paddingTop: topPad + 16 }]}>
        {currentStep > 0 ? (
          <TouchableOpacity onPress={goBack} hitSlop={16} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </TouchableOpacity>
        ) : (
          <View style={styles.backBtn} />
        )}
        <Text style={[styles.stepCounter, { color: colors.mutedForeground }]}>
          {currentStep + 1} / {STEPS.length}
        </Text>
        <View style={styles.backBtn} />
      </View>

      <View style={[styles.progressBar, { backgroundColor: colors.muted }]}>
        <Animated.View
          style={[styles.progressFill, { backgroundColor: colors.primary, width: progressWidth }]}
        />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.questionBlock}>
          <Text style={[styles.question, { color: colors.foreground }]}>{step.question}</Text>
          {step.subtitle && (
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{step.subtitle}</Text>
          )}
        </View>

        {step.type === "text" && (
          <View style={styles.inputBlock}>
            <TextInput
              style={[
                styles.textInput,
                {
                  borderColor: textValue.length > 0 ? colors.primary : colors.border,
                  backgroundColor: colors.card,
                  color: colors.foreground,
                },
              ]}
              value={textValue}
              onChangeText={setTextValue}
              placeholder={step.placeholder}
              placeholderTextColor={colors.mutedForeground}
              autoFocus
              returnKeyType="next"
              onSubmitEditing={() => canContinue && goNext()}
            />
          </View>
        )}

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
            <View
              style={[
                styles.numberRow,
                {
                  borderColor: numValue.length > 0 ? colors.primary : colors.border,
                  backgroundColor: colors.card,
                },
              ]}
            >
              <Text style={[styles.currencySymbol, { color: colors.primary }]}>€</Text>
              <TextInput
                style={[styles.numberInput, { color: colors.foreground }]}
                value={numValue}
                onChangeText={setNumValue}
                placeholder="0"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="decimal-pad"
                autoFocus
                returnKeyType="next"
                onSubmitEditing={() => canContinue && goNext()}
              />
            </View>
          </View>
        )}

        {(step.type === "number" || step.type === "text") && (
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
              {isLast ? "Começar" : "Continuar"}
            </Text>
            <Feather
              name={isLast ? "check" : "arrow-right"}
              size={18}
              color={canContinue ? "#fff" : colors.mutedForeground}
            />
          </TouchableOpacity>
        )}
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
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  backBtn: { width: 44, height: 44, justifyContent: "center" },
  stepCounter: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
  },
  progressBar: {
    height: 3,
    marginHorizontal: 20,
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 0,
  },
  progressFill: {
    height: 3,
    borderRadius: 2,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  questionBlock: {
    marginBottom: 28,
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
  inputBlock: {
    gap: 16,
  },
  textInput: {
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 22,
    fontFamily: "Inter_500Medium",
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
    minHeight: 60,
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
    marginTop: 28,
    paddingVertical: 18,
    borderRadius: 14,
    minHeight: 56,
  },
  continueBtnText: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
});

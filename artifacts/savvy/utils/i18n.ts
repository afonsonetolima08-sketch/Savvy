export type Language = "pt" | "en";

const translations = {
  pt: {
    // Tabs
    tabHome: "Início",
    tabAnalysis: "Análise",
    tabTransactions: "Transações",
    tabTips: "Dicas",
    tabSettings: "Definições",

    // Greetings
    morning: "Bom dia",
    afternoon: "Boa tarde",
    evening: "Boa noite",
    greetingSub: "Aqui está o teu resumo financeiro",

    // Dashboard
    monthlyBalance: "Saldo do Mês",
    income: "Ganhos",
    expenses: "Gastos",
    balance: "Balanço",
    recentTransactions: "Transações Recentes",
    noTransactions: "Sem transações este mês",
    noTransactionsHint: 'Toca no "+" para registar o teu primeiro ganho ou gasto',
    currentPatrimony: "Património Atual",
    budgetUsed: "Orçamento usado",

    // Add/Edit Transaction
    newRecord: "Novo Registo",
    editRecord: "Editar Registo",
    save: "Guardar",
    gainLabel: "Ganho",
    expenseLabel: "Gasto",
    amountLabel: "VALOR",
    categoryLabel: "CATEGORIA",
    descriptionLabel: "DESCRIÇÃO",
    dateLabel: "DATA",
    descriptionPlaceholder: "Descrição (opcional)",
    invalidAmount: "Valor inválido",
    invalidAmountMsg: "Por favor insere um valor válido.",

    // Analytics
    analysisTitle: "Análise",
    byMonth: "Por Mês",
    byCategory: "Por Categoria",
    last6months: "Últimos 6 meses",
    bestMonth: "Melhor Mês",
    worstMonth: "Pior Mês",
    topCategories: "Maior gasto por categoria",
    allTime: "Histórico completo",
    totalDistribution: "Distribuição Total",
    noData: "Sem dados suficientes. Regista os teus gastos!",
    noExpenses: "Sem gastos registados este mês",

    // Tips
    tipsTitle: "Dicas",
    tipsSubtitle: "Personalizadas com base nos teus hábitos",
    tipsSubtitleName: "Recomendações para ti",
    mainObjectiveLabel: "Objetivo principal",
    financialSummary: "Resumo Financeiro",
    savingsRate: "Taxa de Poupança",
    monthlySavings: "Poupança Mensal",
    totalEvolution: "Evolução Total",
    yourTips: "As tuas dicas de poupança",
    yourTipsName: "As tuas dicas",
    tipsNote:
      "As dicas são geradas automaticamente com base nas tuas transações e objetivos. Quanto mais dados registares, mais precisas serão as recomendações.",

    // Transactions
    transactionsTitle: "Transações",
    all: "Todas",
    noTransactionsList: "Sem transações",
    noTransactionsListHint: 'Regista o teu primeiro ganho ou gasto tocando em "+"',
    deleteTransactionTitle: "Eliminar transação",
    deleteConfirm: "Tens a certeza que queres eliminar esta transação?",
    cancel: "Cancelar",
    delete: "Eliminar",

    // Settings
    settingsTitle: "Definições",
    sectionProfile: "PERFIL",
    nameLabel: "Nome",
    monthlyIncomeLabel: "Rendimento Mensal",
    initialPatrimonyLabel: "Património Inicial",
    mainObjectiveSettingsLabel: "Objetivo Principal",
    sectionPreferences: "PREFERÊNCIAS",
    currencyLabel: "Moeda",
    languageLabel: "Idioma",
    sectionAbout: "SOBRE",
    versionLabel: "Versão",
    chooseCurrency: "Escolher Moeda",
    chooseLanguage: "Escolher Idioma",
    chooseObjective: "Objetivo Principal",
    notDefined: "Não definido",

    // Languages
    langPt: "Português",
    langEn: "English",

    // Objectives
    objSave: "Poupar dinheiro",
    objDebt: "Reduzir dívidas",
    objInvest: "Investir",
    objControl: "Controlar gastos",
    objFreedom: "Independência financeira",
    objSaveShort: "Poupar",
    objDebtShort: "Reduzir Dívidas",
    objInvestShort: "Investir",
    objControlShort: "Controlar Gastos",
    objFreedomShort: "Independência Financeira",

    // Horizons
    horizonShort: "Curto prazo (< 1 ano)",
    horizonMedium: "Médio prazo (1-5 anos)",
    horizonLong: "Longo prazo (5+ anos)",

    // Category labels
    catSalary: "Salário",
    catFreelance: "Freelance",
    catInvestment: "Investimento",
    catGift: "Presente",
    catFood: "Alimentação",
    catHousing: "Habitação",
    catTransport: "Transporte",
    catHealth: "Saúde",
    catEntertainment: "Lazer",
    catShopping: "Compras",
    catEducation: "Educação",
    catUtilities: "Serviços",
    catTravel: "Viagem",
    catOther: "Outro",

    // Onboarding
    onbName: "Olá! Como te chamas?",
    onbNameSub: "Vamos personalizar a tua experiência.",
    onbNamePlaceholder: "O teu nome",
    onbObjective: "Qual é o teu objetivo financeiro principal?",
    onbObjectiveSub: "Adapta as tuas dicas e recomendações.",
    onbIncome: "Qual é o teu rendimento mensal aproximado?",
    onbIncomeSub: "Em euros. Ajuda-nos a calibrar as tuas metas.",
    onbPatrimony: "Qual é o teu património atual?",
    onbPatrimonySub: "Poupanças, investimentos e outros ativos (em euros).",
    onbDebts: "Tens dívidas? Se sim, qual o valor total?",
    onbDebtsSub: "Inclui empréstimos, cartões de crédito, etc. Coloca 0 se não tens.",
    onbDependents: "Tens dependentes financeiros?",
    onbDependentsSub: "Filhos, cônjuge, pais ou outros que dependem de ti financeiramente.",
    onbHorizon: "Qual é o teu horizonte de investimento?",
    onbHorizonSub: "Por quanto tempo pretendes manter os teus investimentos?",
    onbYes: "Sim",
    onbNo: "Não",
    onbContinue: "Continuar",
    onbStart: "Começar",
  },

  en: {
    // Tabs
    tabHome: "Home",
    tabAnalysis: "Analysis",
    tabTransactions: "Transactions",
    tabTips: "Tips",
    tabSettings: "Settings",

    // Greetings
    morning: "Good morning",
    afternoon: "Good afternoon",
    evening: "Good evening",
    greetingSub: "Here's your financial summary",

    // Dashboard
    monthlyBalance: "Monthly Balance",
    income: "Income",
    expenses: "Expenses",
    balance: "Balance",
    recentTransactions: "Recent Transactions",
    noTransactions: "No transactions this month",
    noTransactionsHint: 'Tap "+" to record your first income or expense',
    currentPatrimony: "Current Assets",
    budgetUsed: "Budget used",

    // Add/Edit Transaction
    newRecord: "New Record",
    editRecord: "Edit Record",
    save: "Save",
    gainLabel: "Income",
    expenseLabel: "Expense",
    amountLabel: "AMOUNT",
    categoryLabel: "CATEGORY",
    descriptionLabel: "DESCRIPTION",
    dateLabel: "DATE",
    descriptionPlaceholder: "Description (optional)",
    invalidAmount: "Invalid amount",
    invalidAmountMsg: "Please enter a valid amount.",

    // Analytics
    analysisTitle: "Analysis",
    byMonth: "By Month",
    byCategory: "By Category",
    last6months: "Last 6 months",
    bestMonth: "Best Month",
    worstMonth: "Worst Month",
    topCategories: "Top spending categories",
    allTime: "All time",
    totalDistribution: "Total Distribution",
    noData: "Not enough data. Start recording your expenses!",
    noExpenses: "No expenses recorded this month",

    // Tips
    tipsTitle: "Tips",
    tipsSubtitle: "Personalized based on your habits",
    tipsSubtitleName: "Recommendations for you",
    mainObjectiveLabel: "Main objective",
    financialSummary: "Financial Summary",
    savingsRate: "Savings Rate",
    monthlySavings: "Monthly Savings",
    totalEvolution: "Total Evolution",
    yourTips: "Your saving tips",
    yourTipsName: "Your tips",
    tipsNote:
      "Tips are automatically generated based on your transactions and goals. The more data you record, the more accurate the recommendations will be.",

    // Transactions
    transactionsTitle: "Transactions",
    all: "All",
    noTransactionsList: "No transactions",
    noTransactionsListHint: 'Record your first income or expense by tapping "+"',
    deleteTransactionTitle: "Delete transaction",
    deleteConfirm: "Are you sure you want to delete this transaction?",
    cancel: "Cancel",
    delete: "Delete",

    // Settings
    settingsTitle: "Settings",
    sectionProfile: "PROFILE",
    nameLabel: "Name",
    monthlyIncomeLabel: "Monthly Income",
    initialPatrimonyLabel: "Initial Assets",
    mainObjectiveSettingsLabel: "Main Objective",
    sectionPreferences: "PREFERENCES",
    currencyLabel: "Currency",
    languageLabel: "Language",
    sectionAbout: "ABOUT",
    versionLabel: "Version",
    chooseCurrency: "Choose Currency",
    chooseLanguage: "Choose Language",
    chooseObjective: "Main Objective",
    notDefined: "Not defined",

    // Languages
    langPt: "Português",
    langEn: "English",

    // Objectives
    objSave: "Save money",
    objDebt: "Reduce debt",
    objInvest: "Invest",
    objControl: "Control spending",
    objFreedom: "Financial freedom",
    objSaveShort: "Save",
    objDebtShort: "Reduce Debt",
    objInvestShort: "Invest",
    objControlShort: "Control Spending",
    objFreedomShort: "Financial Freedom",

    // Horizons
    horizonShort: "Short term (< 1 year)",
    horizonMedium: "Medium term (1-5 years)",
    horizonLong: "Long term (5+ years)",

    // Category labels
    catSalary: "Salary",
    catFreelance: "Freelance",
    catInvestment: "Investment",
    catGift: "Gift",
    catFood: "Food",
    catHousing: "Housing",
    catTransport: "Transport",
    catHealth: "Health",
    catEntertainment: "Entertainment",
    catShopping: "Shopping",
    catEducation: "Education",
    catUtilities: "Utilities",
    catTravel: "Travel",
    catOther: "Other",

    // Onboarding
    onbName: "Hi! What's your name?",
    onbNameSub: "Let's personalize your experience.",
    onbNamePlaceholder: "Your name",
    onbObjective: "What is your main financial goal?",
    onbObjectiveSub: "We'll customize your tips and recommendations.",
    onbIncome: "What is your approximate monthly income?",
    onbIncomeSub: "In euros. Helps us calibrate your goals.",
    onbPatrimony: "What is your current net worth?",
    onbPatrimonySub: "Savings, investments and other assets (in euros).",
    onbDebts: "Do you have debts? If so, what is the total?",
    onbDebtsSub: "Include loans, credit cards, etc. Enter 0 if you have none.",
    onbDependents: "Do you have financial dependents?",
    onbDependentsSub: "Children, spouse, parents or others who depend on you financially.",
    onbHorizon: "What is your investment horizon?",
    onbHorizonSub: "How long do you intend to hold your investments?",
    onbYes: "Yes",
    onbNo: "No",
    onbContinue: "Continue",
    onbStart: "Get Started",
  },
};

export type Translations = typeof translations.pt;

export function getTranslations(language: string): Translations {
  const lang = (language === "en" ? "en" : "pt") as Language;
  return translations[lang];
}

export function getGreetingT(t: Translations, name: string): string {
  const hour = new Date().getHours();
  const firstName = name?.trim().split(" ")[0] || "";
  let base: string;
  if (hour < 12) base = t.morning;
  else if (hour < 19) base = t.afternoon;
  else base = t.evening;
  return firstName ? `${base}, ${firstName}` : base;
}

export default {
  // Common
  common: {
    save: 'Salvar',
    cancel: 'Cancelar',
    delete: 'Excluir',
    edit: 'Editar',
    done: 'Concluído',
    next: 'Próximo',
    back: 'Voltar',
    close: 'Fechar',
    search: 'Buscar',
    loading: 'Carregando...',
    error: 'Erro',
    success: 'Sucesso',
    ok: 'OK',
  },

  // Welcome Flow (multi-step intro)
  welcomeFlow: {
    continue: 'Continuar',
    step1: {
      title: 'Finalmente saiba o que é seguro comer com SOP.',
      subtitle: 'Sem contar calorias. Sem dietas ioiô tóxicas. Apenas respostas simples.',
    },
    step2: {
      title: 'Tire uma foto de qualquer alimento',
    },
    step3: {
      title: 'Saiba exatamente o que comer',
    },
  },

  // Welcome Screen
  welcome: {
    appName: 'PCOS Scanner',
    title: 'PCOS Food Scanner',
    tagline: 'Escaneie qualquer alimento para verificar se é compatível com SOP',
    getStarted: 'Começar',
    signIn: 'Entrar',
    alreadyHaveAccount: 'Já tem uma conta?',
    personalizeTitle: 'Vamos personalizar\nsua experiência',
    personalizeSubtitle: 'Responda algumas perguntas rápidas para que possamos dar melhores recomendações de alimentos.',
    featurePills: {
      personalized: 'Personalizado',
      scienceBacked: 'Baseado em ciência',
      twoMin: '2 min',
    },
    letsGo: 'Vamos lá',
  },

  // Onboarding
  onboarding: {
    common: {
      selectAll: 'Selecione todas que se aplicam',
      skip: 'Pular',
    },
    welcome: {
      title: 'Vamos personalizar sua experiência',
      subtitle: 'Responda algumas perguntas rápidas para que possamos dar melhores recomendações de alimentos.',
      letsGo: 'Vamos lá',
    },
    goal: {
      title: 'Qual é seu objetivo principal?',
      options: {
        manageWeight: 'Controlar meu peso',
        reduceSymptoms: 'Reduzir sintomas da SOP',
        fertility: 'Apoiar fertilidade',
        energy: 'Ter mais energia',
        understand: 'Saber o que posso comer',
        peace: 'Parar de me estressar com comida',
      },
    },
    symptoms: {
      title: 'Quais sintomas você tem?',
      options: {
        irregularPeriods: 'Menstruação irregular',
        weightGain: 'Ganho de peso',
        fatigue: 'Fadiga',
        acne: 'Acne ou problemas de pele',
        hairLoss: 'Queda de cabelo',
        hairGrowth: 'Excesso de pelos',
        moodSwings: 'Mudanças de humor',
        cravings: 'Vontade de doces',
        bloating: 'Inchaço',
        brainFog: 'Névoa mental',
      },
    },
    struggles: {
      title: 'O que tem sido mais difícil para você?',
      options: {
        whatToEat: 'Não saber o que comer',
        groceryShopping: 'Ler rótulos de alimentos',
        eatingOut: 'Comer fora',
        familyMeals: 'Cozinhar para outros',
        time: 'Encontrar tempo para planejar refeições',
        conflictingInfo: 'Muita informação conflitante',
        emotionalEating: 'Comer emocional',
        givingUp: 'Desistir muito cedo',
      },
    },
    foodRelationship: {
      title: 'Como você se sente em relação à comida?',
      options: {
        loveFood: 'Eu amo comida',
        complicated: 'É complicado',
        anxious: 'Comida me deixa ansiosa',
        restricted: 'Tenho sido muito restritiva',
        confused: 'Estou confusa sobre o que comer',
        freshStart: 'Pronta para um novo começo',
      },
    },
    favoriteFoods: {
      title: 'Quais alimentos você gosta?',
      options: {
        chocolate: 'Chocolate',
        bread: 'Pão e massa',
        cheese: 'Queijo',
        coffee: 'Café e lattes',
        sweets: 'Sobremesas e doces',
        rice: 'Arroz',
        fruit: 'Frutas',
        fastFood: 'Fast food',
        snacks: 'Salgadinhos e lanches',
        drinks: 'Vinho e bebidas',
      },
    },
    activity: {
      title: 'Quão ativa você é?',
      options: {
        sedentary: 'Principalmente sentada',
        light: 'Atividade leve',
        moderate: 'Moderadamente ativa',
        active: 'Bem ativa',
        veryActive: 'Muito ativa',
        varies: 'Varia',
      },
    },
    personalized: {
      title: 'Entendi!',
      description: 'Vamos personalizar suas avaliações de alimentos com base no seu perfil.',
      summary: {
        focus: 'Foco',
        symptomsTracked: 'Sintomas rastreados',
        foodsNoted: 'Alimentos anotados',
        symptomCount_one: '{{count}} sintoma',
        symptomCount_other: '{{count}} sintomas',
        foodCount_one: '{{count}} alimento',
        foodCount_other: '{{count}} alimentos',
      },
      goalMessages: {
        manageWeight: 'controle de peso',
        reduceSymptoms: 'redução de sintomas',
        fertility: 'apoio à fertilidade',
        energy: 'níveis de energia',
        understand: 'entendimento alimentar',
        peace: 'paz com a comida',
        default: 'seus objetivos',
      },
    },
    review: {
      title: 'Gostando do app?',
      description: 'Sua avaliação ajuda outras mulheres com SOP a descobrir este app e assumir o controle da sua nutrição.',
      rateButton: 'Avaliar o app',
      maybeLater: 'Talvez depois',
    },
    signup: {
      title: 'Seu plano está pronto!',
      subtitle: 'Crie uma conta para salvar suas preferências e começar a escanear.',
      benefits: {
        personalizedRatings: 'Avaliações personalizadas para SOP',
        basedOnYou: 'Baseado nos seus sintomas e objetivos',
        learnImpact: 'Aprenda como a comida afeta seu corpo',
      },
      continueWithApple: 'Continuar com Apple',
      continueWithGoogle: 'Continuar com Google',
      terms: 'Ao continuar, você concorda com nossos',
      termsLink: 'Termos',
      and: 'e',
      privacyLink: 'Política de Privacidade',
    },
  },

  // Auth
  auth: {
    welcomeBack: 'Bem-vinda de Volta',
    createAccount: 'Criar Conta',
    signInSubtitle: 'Entre para continuar seu progresso',
    signUpSubtitle: 'Cadastre-se para começar sua jornada com SOP',
    continueWithApple: 'Continuar com Apple',
    continueWithGoogle: 'Continuar com Google',
    dontHaveAccount: 'Não tem uma conta?',
    alreadyHaveAccount: 'Já tem uma conta?',
    terms: 'Ao continuar, você concorda com nossos',
    termsLink: 'Termos',
    and: 'e',
    privacyLink: 'Política de Privacidade',
  },

  // Home
  home: {
    title: 'Meus Escaneamentos',
    tabs: {
      all: 'Todos',
      saves: 'Salvos',
    },
    searchPlaceholder: 'Buscar escaneamentos...',
    empty: {
      all: {
        title: 'Nenhum escaneamento ainda',
        description: 'Comece a escanear alimentos para vê-los aqui',
      },
      saves: {
        title: 'Nenhum escaneamento salvo',
        description: 'Salve escaneamentos para encontrá-los aqui',
      },
      search: {
        title: 'Nenhum resultado encontrado',
        description: 'Tente um termo de busca diferente',
      },
    },
  },

  // Scan
  scan: {
    title: 'Escanear Alimento',
    analyzing: 'Analisando...',
    analyzingImage: 'Analisando Imagem',
    notifyWhenDone: 'Avisaremos quando terminar!',
    positionFood: 'Posicione o alimento dentro do quadro',
    analysisComplete: 'Análise Completa',
    analysisFailed: 'Análise Falhou',
    viewResult: 'Ver Resultado',
    cameraPermission: {
      title: 'Acesso à Câmera Necessário',
      description: 'Para escanear alimentos, por favor habilite o acesso à câmera nas configurações do seu dispositivo.',
      openSettings: 'Abrir Configurações',
    },
    capture: 'Capturar',
    photoCaptured: 'Foto Capturada',
    analysisComingSoon: 'Recurso de análise de alimentos em breve! Analisaremos este alimento para compatibilidade com SOP.',
    // Swipe actions
    deleteTitle: 'Excluir Escaneamento',
    deleteMessage: 'Tem certeza que deseja excluir este escaneamento?',
    save: 'Salvar',
    unsave: 'Remover',
    // Free scan limit
    freeScansRemaining: '{{count}} de {{max}} escaneamentos grátis restantes',
    limitReached: {
      title: 'Escaneamentos Grátis Esgotados',
      description: 'Assine para desbloquear escaneamentos ilimitados',
      modalDescription: 'Você usou todos os 3 escaneamentos grátis. Atualize para PCOS AI Premium para continuar analisando alimentos.',
      feature1: 'Escaneamento ilimitado de alimentos',
      feature2: 'Insights personalizados sobre SOP',
      feature3: 'Análise detalhada do impacto hormonal',
      cta: 'Desbloquear Escaneamentos Ilimitados',
      maybeLater: 'Talvez depois',
    },
    // Help tutorial
    help: {
      title: 'Como Escanear',
      step1Title: 'Tire uma Foto',
      step1Description: 'Aponte sua câmera para qualquer alimento, refeição ou rótulo nutricional',
      step2Title: 'Obtenha Resultados',
      step2Description: 'Veja avaliações instantâneas para SOP e recomendações personalizadas',
      gotIt: 'Entendi!',
    },
  },

  // Scan Results
  scanResult: {
    status: {
      safe: 'Compatível com SOP',
      caution: 'Comer com Moderação',
      avoid: 'Melhor Evitar',
    },
    sections: {
      nutritionalAnalysis: 'Análise Nutricional',
      ingredients: 'Ingredientes',
      recommendations: 'Recomendações',
      warnings: 'Avisos',
    },
  },

  // Scan Detail
  scanDetail: {
    notFound: 'Escaneamento não encontrado',
    loading: 'Carregando...',
    sections: {
      analysis: 'Análise Nutricional',
      ingredients: 'Ingredientes',
      recommendations: 'Recomendações',
      warnings: 'Avisos',
    },
    status: {
      safe: 'Compatível com SOP',
      caution: 'Consumir com Cautela',
      avoid: 'Melhor Evitar',
    },
  },

  // Nutrition Metrics
  nutrition: {
    glycemicIndex: 'Índice Glicêmico',
    sugarContent: 'Teor de Açúcar',
    inflammatoryScore: 'Pontuação Inflamatória',
    hormoneImpact: 'Impacto Hormonal',
    fiberContent: 'Teor de Fibra',
    proteinQuality: 'Qualidade da Proteína',
    healthyFats: 'Gorduras Saudáveis',
    processedLevel: 'Nível de Processamento',
    legendTitle: 'O Que Esses Ícones Significam',
    colorGuide: 'Guia de Cores',
    colorGood: 'Bom para SOP',
    colorModerate: 'Consumir com moderação',
    colorPoor: 'Melhor evitar',
    descriptions: {
      gi: 'Quão rápido o alimento eleva o açúcar no sangue',
      sugar: 'Quantidade de açúcares adicionados ou naturais',
      fiber: 'Ajuda na digestão e açúcar no sangue',
      inflammation: 'Pode desencadear ou reduzir inflamação',
      hormone: 'Efeito na insulina e hormônios',
      processed: 'Quão refinado ou alterado é o alimento',
    },
    values: {
      low: 'Baixo',
      moderate: 'Moderado',
      medium: 'Médio',
      high: 'Alto',
      positive: 'Positivo',
      neutral: 'Neutro',
      negative: 'Negativo',
      minimally: 'Minimamente',
      moderately: 'Moderadamente',
      highly: 'Altamente',
      yes: 'Sim',
      no: 'Não',
    },
  },

  // Paywall
  paywall: {
    title: 'Desbloquear Premium',
    subtitle: 'Obtenha escaneamentos ilimitados e dicas personalizadas para sua SOP',
    features: {
      unlimitedScans: {
        title: 'Escaneamentos Ilimitados',
        description: 'Escaneie qualquer alimento, sem limites',
      },
      bloodSugar: {
        title: 'Impacto no Açúcar',
        description: 'Veja como os alimentos afetam sua glicose',
      },
      inflammation: {
        title: 'Pontuação de Inflamação',
        description: 'Identifique alimentos que causam inflamação',
      },
      hormones: {
        title: 'Impacto Hormonal',
        description: 'Entenda os efeitos nos seus hormônios',
      },
      hiddenSugars: {
        title: 'Ingredientes Ocultos',
        description: 'Detecte açúcares e aditivos ocultos',
      },
      personalizedTips: {
        title: 'Dicas Personalizadas',
        description: 'Receba dicas baseadas nos seus sintomas',
      },
    },
    plans: {
      yearly: 'Anual',
      monthly: 'Mensal',
      perMonth: '/mês',
      perMonthFull: '/mês',
      save: '-{{percent}}%',
    },
    trial: {
      days: 'Teste Grátis de {{days}} Dias',
      subtitle: 'Cancele a qualquer momento, sem cobrança',
      then: 'Depois {{price}}/ano',
    },
    cta: {
      startTrial: 'Iniciar Teste de {{days}} Dias',
      subscribeNow: 'Assinar Agora',
      thenPrice: 'Depois {{price}}/ano',
      perMonth: '{{price}}/mês',
    },
    save30: 'Economize 30%',
    continueForFree: 'Continuar Grátis',
    restore: 'Restaurar Compras',
    restoreSuccess: 'Compras restauradas com sucesso',
    restoreNone: 'Nenhuma compra anterior encontrada',
    restoreError: 'Falha ao restaurar compras',
    legal: {
      terms: 'Termos',
      privacy: 'Privacidade',
      disclaimer: 'A assinatura é renovada automaticamente, a menos que seja cancelada pelo menos 24 horas antes do final do período atual.',
    },
  },

  // Settings
  settings: {
    title: 'Configurações',
    sections: {
      account: 'Conta',
      appearance: 'Aparência',
      support: 'Suporte',
      about: 'Sobre',
      legal: 'Legal',
    },
    appearance: {
      system: 'Sistema',
      light: 'Claro',
      dark: 'Escuro',
    },
    items: {
      profile: 'Perfil',
      updatePreferences: 'Atualizar Preferências',
      notifications: 'Notificações',
      language: 'Idioma',
      giveFeedback: 'Dar Feedback',
      rateApp: 'Avaliar o App',
      howItWorks: 'Como Funciona',
      nutritionGuide: 'Guia Nutricional',
      aboutPcos: 'Sobre SOP',
      termsOfService: 'Termos de Serviço',
      privacyPolicy: 'Política de Privacidade',
      logOut: 'Sair',
      deleteAccount: 'Excluir Conta',
    },
    share: {
      title: 'Compartilhar com Amigos',
      description: 'Ajude outros a gerenciar sua dieta para SOP',
      banner: {
        title: 'Conhece alguém com SOP?',
        subtitle: 'Ajude uma amiga em sua jornada',
        earnPerReferral: 'Ajude uma amiga hoje',
      },
      modal: {
        title: 'Ajude uma Amiga com SOP',
        subtitle: 'Compartilhe o app com alguém que poderia se beneficiar',
        howItWorks: 'Por que compartilhar:',
        step1: 'SOP afeta 1 em cada 10 mulheres no mundo',
        step2: 'Muitas têm dificuldade em encontrar alimentos para SOP',
        step3: 'Você pode ajudar alguém a assumir o controle da sua saúde',
        reward: '💜 Sua recomendação pode mudar a vida de alguém',
        shareNow: 'Compartilhar Agora',
        maybeLater: 'Talvez Depois',
      },
    },
    version: 'PCOS Food Scanner v{{version}}',
  },

  // Language Selection
  language: {
    title: 'Idioma',
    select: 'Selecionar Idioma',
    languages: {
      en: 'Inglês',
      es: 'Espanhol',
      fr: 'Francês',
      de: 'Alemão',
      pt: 'Português',
      it: 'Italiano',
      zh: 'Chinês',
      ja: 'Japonês',
      ko: 'Coreano',
      ar: 'Árabe',
      hi: 'Hindi',
      tr: 'Turco',
    },
  },

  // Logout Modal
  logout: {
    title: 'Sair',
    message: 'Tem certeza que deseja sair?',
    confirm: 'Sair',
  },

  // Delete Account Modal
  deleteAccount: {
    title: 'Excluir Conta',
    message: 'Esta ação não pode ser desfeita. Todos os seus dados serão excluídos permanentemente.',
    reasonPrompt: 'Por favor, nos conte por que está saindo:',
    reasons: {
      noLongerNeed: 'Não preciso mais do app',
      foundBetter: 'Encontrei uma alternativa melhor',
      tooHard: 'Muito difícil de usar',
      privacy: 'Preocupações com privacidade',
      other: 'Outro',
    },
    additionalComments: 'Comentários adicionais (opcional)',
    deleting: 'Excluindo sua conta...',
    confirm: 'Excluir Conta',
  },

  // How It Works
  howItWorks: {
    title: 'Como Funciona',
    intro: {
      title: 'Seu Assistente de Dieta para SOP',
      description: 'O PCOS Food Scanner ajuda você a fazer escolhas alimentares informadas analisando alimentos pelo seu potencial impacto nos sintomas da SOP, baseado em pesquisa científica.',
    },
    steps: {
      step1: {
        title: 'Escaneie Qualquer Alimento',
        description: 'Aponte sua câmera para qualquer alimento, embalagem ou refeição. Nossa IA identificará o alimento e seus ingredientes.',
      },
      step2: {
        title: 'Análise por IA',
        description: 'Analisamos o índice glicêmico, propriedades anti-inflamatórias, impacto hormonal e perfil nutricional baseado em pesquisa sobre SOP.',
      },
      step3: {
        title: 'Receba Resultados',
        description: 'Receba uma avaliação clara (Seguro, Cautela ou Evitar) com explicações detalhadas de como o alimento pode afetar seus sintomas de SOP.',
      },
    },
    whatWeAnalyze: 'O Que Analisamos',
    disclaimer: {
      title: 'Nota Importante',
      message: 'Este app é apenas para fins informativos e não substitui aconselhamento médico profissional. Sempre consulte seu profissional de saúde ou nutricionista antes de fazer mudanças significativas na dieta.',
    },
    sources: {
      title: 'Fontes Médicas e Pesquisa',
      description: 'Nossas recomendações são baseadas em pesquisas revisadas por pares e diretrizes de instituições médicas confiáveis.',
    },
  },

  // Nutrition Guide
  nutritionGuide: {
    title: 'Guia Nutricional',
    intro: {
      title: 'Entendendo Seus Resultados',
      description: 'Aprenda o que cada métrica nutricional significa e como pode afetar seus sintomas de SOP.',
    },
    howItAffects: 'Como Afeta a SOP',
    good: 'Bom',
    limit: 'Limitar',
    remember: {
      title: 'Lembre-se',
      message: 'O corpo de cada pessoa responde de forma diferente. Use estas diretrizes como ponto de partida e trabalhe com seu profissional de saúde para encontrar o que funciona melhor para você.',
    },
    references: {
      title: 'Referências Médicas',
      intro: 'As informações neste guia são baseadas em pesquisas revisadas por pares e diretrizes das seguintes fontes médicas reconhecidas:',
      disclaimer: 'Este aplicativo fornece apenas informações gerais e não substitui aconselhamento médico profissional. Consulte sempre seu profissional de saúde para orientação personalizada.',
    },
  },

  // Feedback
  feedback: {
    title: 'Dar Feedback',
    subtitle: 'Adoraríamos ouvir suas ideias sobre como podemos melhorar.',
    label: 'Seu Feedback',
    placeholder: 'Compartilhe seu feedback...',
    submit: 'Enviar',
    success: 'Obrigada pelo seu feedback!',
    error: 'Falha ao enviar feedback',
    signInRequired: 'Por favor, entre para enviar feedback',
  },

  // Profile
  profile: {
    title: 'Perfil',
    name: 'Nome',
    username: 'Nome de usuário',
    email: 'E-mail',
    save: 'Salvar Alterações',
    uploadAvatar: 'Carregar Avatar',
    changeAvatar: 'Alterar Avatar',
    removeAvatar: 'Remover Avatar',
    namePlaceholder: 'Digite seu nome',
    usernamePlaceholder: 'Digite nome de usuário',
  },

  // Referral
  referral: {
    title: 'Ajude uma Amiga',
    codeCopied: 'Link copiado para a área de transferência',
    shareMessage: 'Encontrei este app que ajuda com escolhas de alimentos para SOP! Confira: {{link}}',
    hero: {
      title: 'Espalhe a Palavra',
      subtitle: 'Ajude alguém que você se importa a assumir o controle da sua jornada com SOP',
    },
    yourCode: 'Compartilhe Este Link',
    shareButton: 'Compartilhar com Amigos',
    howToEarn: 'Por que compartilhar',
    steps: {
      step1: 'SOP afeta 1 em cada 10 mulheres, e muitas se sentem perdidas sobre o que comer',
      step2: 'Sua recomendação pode ajudar alguém a descobrir alimentos que funcionam para ela',
    },
    terms: 'Obrigada por ajudar a espalhar a conscientização sobre nutrição para SOP.',
  },

  // Notifications
  notifications: {
    title: 'Notificações',
    pushNotifications: 'Notificações Push',
    pushDescription: 'Seja notificada quando seu escaneamento estiver pronto',
    helpText: 'Notificações ajudam você a saber quando sua análise de alimento está pronta, para que possa continuar seu dia enquanto processamos seu escaneamento.',
    enabled: 'Notificações ativadas',
    disabledTitle: 'Notificações Desativadas',
    disabledMessage: 'Para ativar notificações, vá em Configurações e permita notificações para o PCOS Food Scanner.',
    disableTitle: 'Desativar Notificações',
    disableMessage: 'Para desativar notificações, vá em Configurações e desative notificações para o PCOS Food Scanner.',
  },

  // Errors
  errors: {
    generic: 'Algo deu errado. Por favor, tente novamente.',
    network: 'Erro de rede. Por favor, verifique sua conexão.',
    camera: 'Falha ao capturar foto. Por favor, tente novamente.',
    notAuthenticated: 'Por favor, entre para continuar.',
  },

  // Auth Toasts
  authToasts: {
    signInFailed: 'Falha ao completar o login',
    signInAppleFailed: 'Falha ao entrar com Apple',
    signInGoogleFailed: 'Falha ao entrar com Google',
    signOutFailed: 'Falha ao sair',
    accountDeleted: 'Conta excluída com sucesso',
    accountDeleteFailed: 'Falha ao excluir conta',
    authFailed: 'Falha na autenticação',
    completingSignIn: 'Completando login...',
  },
};

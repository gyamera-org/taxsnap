export default {
  // Common
  common: {
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    done: 'Terminé',
    next: 'Suivant',
    back: 'Retour',
    close: 'Fermer',
    search: 'Rechercher',
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès',
    ok: 'OK',
  },

  // Welcome Flow (multi-step intro)
  welcomeFlow: {
    continue: 'Continuer',
    step1: {
      title: 'Enfin savoir ce qui est bon à manger avec le SOPK.',
      subtitle: 'Fini le comptage des calories. Fini les régimes yoyo toxiques. Juste des réponses simples.',
    },
    step2: {
      title: 'Prenez une photo de n\'importe quel aliment',
    },
    step3: {
      title: 'Sachez exactement quoi manger',
    },
  },

  // Welcome Screen
  welcome: {
    appName: 'PCOS Scanner',
    title: 'PCOS Food Scanner',
    tagline: 'Scannez un aliment pour vérifier sa compatibilité SOPK',
    getStarted: 'Commencer',
    signIn: 'Se Connecter',
    alreadyHaveAccount: 'Vous avez déjà un compte?',
    personalizeTitle: 'Personnalisons\nvotre expérience',
    personalizeSubtitle: 'Répondez à quelques questions rapides pour que nous puissions vous donner de meilleures recommandations alimentaires.',
    featurePills: {
      personalized: 'Personnalisé',
      scienceBacked: 'Basé sur la science',
      twoMin: '2 min',
    },
    letsGo: 'C\'est parti',
  },

  // Onboarding
  onboarding: {
    common: {
      selectAll: 'Sélectionnez tout ce qui s\'applique',
      skip: 'Passer',
    },
    welcome: {
      title: 'Personnalisons votre expérience',
      subtitle: 'Répondez à quelques questions rapides pour que nous puissions vous donner de meilleures recommandations alimentaires.',
      letsGo: 'C\'est parti',
    },
    goal: {
      title: 'Quel est votre objectif principal?',
      options: {
        manageWeight: 'Gérer mon poids',
        reduceSymptoms: 'Réduire les symptômes SOPK',
        fertility: 'Soutenir la fertilité',
        energy: 'Avoir plus d\'énergie',
        understand: 'Savoir ce que je peux manger',
        peace: 'Arrêter de stresser à propos de la nourriture',
      },
    },
    symptoms: {
      title: 'Quels symptômes avez-vous?',
      options: {
        irregularPeriods: 'Règles irrégulières',
        weightGain: 'Prise de poids',
        fatigue: 'Fatigue',
        acne: 'Acné ou problèmes de peau',
        hairLoss: 'Perte de cheveux',
        hairGrowth: 'Pilosité excessive',
        moodSwings: 'Changements d\'humeur',
        cravings: 'Envies de sucre',
        bloating: 'Ballonnements',
        brainFog: 'Brouillard mental',
      },
    },
    struggles: {
      title: 'Qu\'est-ce qui a été le plus difficile pour vous?',
      options: {
        whatToEat: 'Ne pas savoir quoi manger',
        groceryShopping: 'Lire les étiquettes alimentaires',
        eatingOut: 'Manger au restaurant',
        familyMeals: 'Cuisiner pour les autres',
        time: 'Trouver le temps de planifier les repas',
        conflictingInfo: 'Trop d\'informations contradictoires',
        emotionalEating: 'Alimentation émotionnelle',
        givingUp: 'Abandonner trop tôt',
      },
    },
    foodRelationship: {
      title: 'Comment vous sentez-vous face à la nourriture?',
      options: {
        loveFood: 'J\'adore manger',
        complicated: 'C\'est compliqué',
        anxious: 'La nourriture me rend anxieuse',
        restricted: 'J\'ai été très restrictive',
        confused: 'Je suis confuse sur quoi manger',
        freshStart: 'Prête pour un nouveau départ',
      },
    },
    favoriteFoods: {
      title: 'Quels aliments appréciez-vous?',
      options: {
        chocolate: 'Chocolat',
        bread: 'Pain et pâtes',
        cheese: 'Fromage',
        coffee: 'Café et lattes',
        sweets: 'Desserts et sucreries',
        rice: 'Riz',
        fruit: 'Fruits',
        fastFood: 'Fast-food',
        snacks: 'Chips et snacks',
        drinks: 'Vin et boissons',
      },
    },
    activity: {
      title: 'À quel point êtes-vous active?',
      options: {
        sedentary: 'Principalement assise',
        light: 'Activité légère',
        moderate: 'Modérément active',
        active: 'Assez active',
        veryActive: 'Très active',
        varies: 'Ça varie',
      },
    },
    personalized: {
      title: 'Compris!',
      description: 'Nous personnaliserons vos évaluations alimentaires en fonction de votre profil.',
      summary: {
        focus: 'Focus',
        symptomsTracked: 'Symptômes suivis',
        foodsNoted: 'Aliments notés',
        symptomCount_one: '{{count}} symptôme',
        symptomCount_other: '{{count}} symptômes',
        foodCount_one: '{{count}} aliment',
        foodCount_other: '{{count}} aliments',
      },
      goalMessages: {
        manageWeight: 'gestion du poids',
        reduceSymptoms: 'réduction des symptômes',
        fertility: 'soutien à la fertilité',
        energy: 'niveaux d\'énergie',
        understand: 'compréhension des aliments',
        peace: 'paix avec la nourriture',
        default: 'vos objectifs',
      },
    },
    review: {
      title: 'Vous appréciez l\'application?',
      description: 'Votre avis aide d\'autres femmes atteintes de SOPK à découvrir cette application et à prendre le contrôle de leur nutrition.',
      rateButton: 'Noter l\'application',
      maybeLater: 'Peut-être plus tard',
    },
    signup: {
      title: 'Votre plan est prêt!',
      subtitle: 'Créez un compte pour sauvegarder vos préférences et commencer à scanner.',
      benefits: {
        personalizedRatings: 'Évaluations SOPK personnalisées',
        basedOnYou: 'Basé sur vos symptômes et objectifs',
        learnImpact: 'Apprenez comment la nourriture affecte votre corps',
      },
      continueWithApple: 'Continuer avec Apple',
      continueWithGoogle: 'Continuer avec Google',
      terms: 'En continuant, vous acceptez nos',
      termsLink: 'Conditions',
      and: 'et',
      privacyLink: 'Politique de Confidentialité',
    },
  },

  // Auth
  auth: {
    welcomeBack: 'Bon Retour',
    createAccount: 'Créer un Compte',
    signInSubtitle: 'Connectez-vous pour continuer votre progression',
    signUpSubtitle: 'Inscrivez-vous pour commencer votre parcours SOPK',
    continueWithApple: 'Continuer avec Apple',
    continueWithGoogle: 'Continuer avec Google',
    dontHaveAccount: 'Vous n\'avez pas de compte?',
    alreadyHaveAccount: 'Vous avez déjà un compte?',
    terms: 'En continuant, vous acceptez nos',
    termsLink: 'Conditions',
    and: 'et',
    privacyLink: 'Politique de Confidentialité',
  },

  // Home
  home: {
    title: 'Mes Scans',
    tabs: {
      all: 'Tous',
      saves: 'Favoris',
    },
    searchPlaceholder: 'Rechercher des scans...',
    empty: {
      all: {
        title: 'Aucun scan encore',
        description: 'Commencez à scanner des aliments pour les voir ici',
      },
      saves: {
        title: 'Aucun scan sauvegardé',
        description: 'Marquez des scans en favori pour les retrouver ici',
      },
      search: {
        title: 'Aucun résultat',
        description: 'Essayez un autre terme de recherche',
      },
    },
  },

  // Scan
  scan: {
    title: 'Scanner un Aliment',
    analyzing: 'Analyse en cours...',
    analyzingImage: 'Analyse de l\'Image',
    notifyWhenDone: 'Nous vous informerons quand c\'est terminé!',
    positionFood: 'Positionnez l\'aliment dans le cadre',
    cameraPermission: {
      title: 'Accès Caméra Requis',
      description: 'Pour scanner des aliments, veuillez activer l\'accès à la caméra dans les paramètres de votre appareil.',
      openSettings: 'Ouvrir les Paramètres',
    },
    capture: 'Capturer',
    photoCaptured: 'Photo Capturée',
    analysisComingSoon: 'Fonction d\'analyse alimentaire bientôt disponible! Nous analyserons cet aliment pour sa compatibilité SOPK.',
    // Swipe actions
    deleteTitle: 'Supprimer le Scan',
    deleteMessage: 'Êtes-vous sûre de vouloir supprimer ce scan?',
    save: 'Enregistrer',
    unsave: 'Retirer',
    // Help tutorial
    help: {
      title: 'Comment Scanner',
      step1Title: 'Prenez une Photo',
      step1Description: 'Pointez votre caméra vers n\'importe quel aliment, repas ou étiquette nutritionnelle',
      step2Title: 'Obtenez les Résultats',
      step2Description: 'Voyez les évaluations SOPK instantanées et des recommandations personnalisées',
      gotIt: 'Compris!',
    },
  },

  // Scan Results
  scanResult: {
    status: {
      safe: 'Compatible SOPK',
      caution: 'Manger avec Modération',
      avoid: 'À Éviter',
    },
    sections: {
      nutritionalAnalysis: 'Analyse Nutritionnelle',
      ingredients: 'Ingrédients',
      recommendations: 'Recommandations',
      warnings: 'Avertissements',
    },
  },

  // Scan Detail
  scanDetail: {
    notFound: 'Scan non trouvé',
    loading: 'Chargement...',
    sections: {
      analysis: 'Analyse Nutritionnelle',
      ingredients: 'Ingrédients',
      recommendations: 'Recommandations',
      warnings: 'Avertissements',
    },
    status: {
      safe: 'Compatible SOPK',
      caution: 'Manger avec Modération',
      avoid: 'À Éviter',
    },
  },

  // Nutrition Metrics
  nutrition: {
    glycemicIndex: 'Index Glycémique',
    sugarContent: 'Teneur en Sucre',
    inflammatoryScore: 'Score Inflammatoire',
    hormoneImpact: 'Impact Hormonal',
    fiberContent: 'Teneur en Fibres',
    proteinQuality: 'Qualité des Protéines',
    healthyFats: 'Graisses Saines',
    processedLevel: 'Niveau de Transformation',
    legendTitle: 'Signification des Icônes',
    colorGuide: 'Guide des Couleurs',
    colorGood: 'Bon pour le SOPK',
    colorModerate: 'À consommer avec modération',
    colorPoor: 'À éviter',
    descriptions: {
      gi: 'Vitesse d\'augmentation de la glycémie',
      sugar: 'Quantité de sucres ajoutés ou naturels',
      fiber: 'Aide la digestion et la glycémie',
      inflammation: 'Peut déclencher ou réduire l\'inflammation',
      hormone: 'Effet sur l\'insuline et les hormones',
      processed: 'Degré de transformation de l\'aliment',
    },
    values: {
      low: 'Faible',
      moderate: 'Modéré',
      medium: 'Moyen',
      high: 'Élevé',
      positive: 'Positif',
      neutral: 'Neutre',
      negative: 'Négatif',
      minimally: 'Minimalement',
      moderately: 'Modérément',
      highly: 'Hautement',
      yes: 'Oui',
      no: 'Non',
    },
  },

  // Paywall
  paywall: {
    title: 'Sachez Ce Que Vous Mangez',
    subtitle: 'Scannez n\'importe quel aliment pour voir instantanément son impact sur votre glycémie, vos hormones et l\'inflammation. Faites des choix éclairés pour votre SOPK.',
    features: {
      bloodSugar: {
        title: 'Voyez l\'impact sur votre glycémie',
      },
      inflammation: {
        title: 'Détectez les aliments inflammatoires',
      },
      hormones: {
        title: 'Comprenez l\'effet sur vos hormones',
      },
      hiddenSugars: {
        title: 'Trouvez les sucres et additifs cachés',
      },
      personalizedTips: {
        title: 'Conseils adaptés à vos symptômes',
      },
    },
    plans: {
      yearly: 'Annuel',
      monthly: 'Mensuel',
      perMonth: '/mois',
      perMonthFull: '/mois',
      save: '-{{percent}}%',
    },
    trial: {
      days: 'Essai Gratuit de {{days}} Jours',
      subtitle: 'Annulez à tout moment, sans frais',
      then: 'Puis {{price}}/an',
    },
    cta: {
      startTrial: 'Commencer l\'Essai Gratuit de {{days}} Jours',
      subscribeNow: 'S\'Abonner Maintenant',
      thenPrice: 'Puis {{price}}/an',
      perMonth: '{{price}}/mois',
    },
    save30: 'Économisez 30%',
    continueForFree: 'Continuer Gratuitement',
    restore: 'Restaurer les Achats',
    restoreSuccess: 'Achats restaurés avec succès',
    restoreNone: 'Aucun achat précédent trouvé',
    restoreError: 'Échec de la restauration des achats',
    legal: {
      terms: 'Conditions',
      privacy: 'Confidentialité',
      disclaimer: 'L\'abonnement se renouvelle automatiquement sauf annulation au moins 24 heures avant la fin de la période en cours.',
    },
  },

  // Settings
  settings: {
    title: 'Paramètres',
    sections: {
      account: 'Compte',
      appearance: 'Apparence',
      support: 'Support',
      about: 'À Propos',
      legal: 'Mentions Légales',
    },
    appearance: {
      system: 'Système',
      light: 'Clair',
      dark: 'Sombre',
    },
    items: {
      profile: 'Profil',
      updatePreferences: 'Mettre à Jour les Préférences',
      notifications: 'Notifications',
      language: 'Langue',
      giveFeedback: 'Donner un Avis',
      rateApp: 'Noter l\'App',
      howItWorks: 'Comment ça Marche',
      nutritionGuide: 'Guide Nutritionnel',
      aboutPcos: 'À Propos du SOPK',
      termsOfService: 'Conditions d\'Utilisation',
      privacyPolicy: 'Politique de Confidentialité',
      logOut: 'Se Déconnecter',
      deleteAccount: 'Supprimer le Compte',
    },
    share: {
      title: 'Partager avec des Amis',
      description: 'Aidez d\'autres personnes à gérer leur régime SOPK',
      banner: {
        title: 'Connaissez-vous quelqu\'un avec le SOPK?',
        subtitle: 'Aidez une amie dans son parcours',
        earnPerReferral: 'Aidez une amie aujourd\'hui',
      },
      modal: {
        title: 'Aidez une Amie avec le SOPK',
        subtitle: 'Partagez l\'app avec quelqu\'un qui pourrait en bénéficier',
        howItWorks: 'Pourquoi partager:',
        step1: 'Le SOPK touche 1 femme sur 10 dans le monde',
        step2: 'Beaucoup ont du mal à trouver des aliments adaptés au SOPK',
        step3: 'Vous pourriez aider quelqu\'un à prendre le contrôle de sa santé',
        reward: '💜 Votre recommandation pourrait changer la vie de quelqu\'un',
        shareNow: 'Partager Maintenant',
        maybeLater: 'Peut-être Plus Tard',
      },
    },
    version: 'PCOS Food Scanner v{{version}}',
  },

  // Language Selection
  language: {
    title: 'Langue',
    select: 'Choisir la Langue',
    languages: {
      en: 'Anglais',
      es: 'Espagnol',
      fr: 'Français',
      de: 'Allemand',
      pt: 'Portugais',
      it: 'Italien',
      zh: 'Chinois',
      ja: 'Japonais',
      ko: 'Coréen',
      ar: 'Arabe',
      hi: 'Hindi',
      tr: 'Turc',
    },
  },

  // Logout Modal
  logout: {
    title: 'Se Déconnecter',
    message: 'Êtes-vous sûre de vouloir vous déconnecter?',
    confirm: 'Se Déconnecter',
  },

  // Delete Account Modal
  deleteAccount: {
    title: 'Supprimer le Compte',
    message: 'Cette action est irréversible. Toutes vos données seront définitivement supprimées.',
    reasonPrompt: 'Dites-nous pourquoi vous partez:',
    reasons: {
      noLongerNeed: 'Je n\'ai plus besoin de l\'app',
      foundBetter: 'J\'ai trouvé une meilleure alternative',
      tooHard: 'Trop difficile à utiliser',
      privacy: 'Préoccupations de confidentialité',
      other: 'Autre',
    },
    additionalComments: 'Commentaires supplémentaires (optionnel)',
    deleting: 'Suppression de votre compte...',
    confirm: 'Supprimer le Compte',
  },

  // How It Works
  howItWorks: {
    title: 'Comment ça Marche',
    intro: {
      title: 'Votre Assistant Régime SOPK',
      description: 'PCOS Food Scanner vous aide à faire des choix alimentaires éclairés en analysant les aliments pour leur impact potentiel sur les symptômes du SOPK, basé sur la recherche scientifique.',
    },
    steps: {
      step1: {
        title: 'Scannez Tout Aliment',
        description: 'Pointez votre caméra vers un aliment, emballage ou repas. Notre IA identifiera l\'aliment et ses ingrédients.',
      },
      step2: {
        title: 'Analyse IA',
        description: 'Nous analysons l\'index glycémique, les propriétés anti-inflammatoires, l\'impact hormonal et le profil nutritionnel selon la recherche SOPK.',
      },
      step3: {
        title: 'Obtenez les Résultats',
        description: 'Recevez une note claire (Sûr, Précaution ou Éviter) avec des explications détaillées sur l\'impact de l\'aliment sur vos symptômes SOPK.',
      },
    },
    whatWeAnalyze: 'Ce Que Nous Analysons',
    disclaimer: {
      title: 'Note Importante',
      message: 'Cette app est à titre informatif uniquement et ne remplace pas un avis médical professionnel. Consultez toujours votre médecin ou diététicien avant d\'apporter des changements alimentaires significatifs.',
    },
    sources: {
      title: 'Sources Médicales et Recherche',
      description: 'Nos recommandations sont basées sur des recherches évaluées par des pairs et des directives d\'institutions médicales de confiance.',
    },
  },

  // Nutrition Guide
  nutritionGuide: {
    title: 'Guide Nutritionnel',
    intro: {
      title: 'Comprendre Vos Résultats',
      description: 'Découvrez ce que signifie chaque métrique nutritionnelle et comment elle peut affecter vos symptômes SOPK.',
    },
    howItAffects: 'Impact sur le SOPK',
    good: 'Bon',
    limit: 'Limiter',
    remember: {
      title: 'Rappel',
      message: 'Chaque corps réagit différemment. Utilisez ces directives comme point de départ et travaillez avec votre médecin pour trouver ce qui fonctionne le mieux pour vous.',
    },
  },

  // Feedback
  feedback: {
    title: 'Donner un Avis',
    subtitle: 'Nous aimerions connaître votre avis sur les améliorations possibles.',
    label: 'Votre Avis',
    placeholder: 'Partagez votre avis...',
    submit: 'Envoyer',
    success: 'Merci pour votre avis!',
    error: 'Échec de l\'envoi de l\'avis',
    signInRequired: 'Veuillez vous connecter pour soumettre un avis',
  },

  // Profile
  profile: {
    title: 'Profil',
    name: 'Nom',
    username: 'Nom d\'utilisateur',
    email: 'Email',
    save: 'Enregistrer les Modifications',
    uploadAvatar: 'Télécharger un Avatar',
    changeAvatar: 'Changer l\'Avatar',
    removeAvatar: 'Supprimer l\'Avatar',
    namePlaceholder: 'Entrez votre nom',
    usernamePlaceholder: 'Entrez nom d\'utilisateur',
  },

  // Referral
  referral: {
    title: 'Aidez une Amie',
    codeCopied: 'Lien copié dans le presse-papiers',
    shareMessage: 'J\'ai trouvé cette app qui aide avec les choix alimentaires pour le SOPK! Découvrez-la: {{link}}',
    hero: {
      title: 'Faites Passer le Mot',
      subtitle: 'Aidez quelqu\'un qui vous est cher à prendre le contrôle de son parcours SOPK',
    },
    yourCode: 'Partagez Ce Lien',
    shareButton: 'Partager avec des Amis',
    howToEarn: 'Pourquoi partager',
    steps: {
      step1: 'Le SOPK touche 1 femme sur 10, et beaucoup se sentent perdues sur quoi manger',
      step2: 'Votre recommandation pourrait aider quelqu\'un à découvrir des aliments qui lui conviennent',
    },
    terms: 'Merci d\'aider à sensibiliser à la nutrition adaptée au SOPK.',
  },

  // Notifications
  notifications: {
    title: 'Notifications',
    pushNotifications: 'Notifications Push',
    pushDescription: 'Recevez des notifications lorsque votre scan est terminé',
    helpText: 'Les notifications vous aident à savoir quand votre analyse alimentaire est prête, afin que vous puissiez continuer votre journée pendant que nous traitons votre scan.',
    enabled: 'Notifications activées',
    disabledTitle: 'Notifications Désactivées',
    disabledMessage: 'Pour activer les notifications, accédez aux Paramètres et autorisez les notifications pour PCOS Food Scanner.',
    disableTitle: 'Désactiver les Notifications',
    disableMessage: 'Pour désactiver les notifications, accédez aux Paramètres et désactivez les notifications pour PCOS Food Scanner.',
  },

  // Errors
  errors: {
    generic: 'Une erreur est survenue. Veuillez réessayer.',
    network: 'Erreur réseau. Vérifiez votre connexion.',
    camera: 'Échec de la capture photo. Veuillez réessayer.',
    notAuthenticated: 'Veuillez vous connecter pour continuer.',
  },

  // Auth Toasts
  authToasts: {
    signInFailed: 'Échec de la connexion',
    signInAppleFailed: 'Échec de la connexion avec Apple',
    signInGoogleFailed: 'Échec de la connexion avec Google',
    signOutFailed: 'Échec de la déconnexion',
    accountDeleted: 'Compte supprimé avec succès',
    accountDeleteFailed: 'Échec de la suppression du compte',
    authFailed: 'Échec de l\'authentification',
    completingSignIn: 'Connexion en cours...',
  },
};

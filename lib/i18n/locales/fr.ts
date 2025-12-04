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
    cameraPermission: {
      title: 'Accès Caméra Requis',
      description: 'Pour scanner des aliments, veuillez activer l\'accès à la caméra dans les paramètres de votre appareil.',
      openSettings: 'Ouvrir les Paramètres',
    },
    capture: 'Capturer',
    photoCaptured: 'Photo Capturée',
    analysisComingSoon: 'Fonction d\'analyse alimentaire bientôt disponible! Nous analyserons cet aliment pour sa compatibilité SOPK.',
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
    title: 'Débloquer l\'Accès Complet',
    subtitle: 'Obtenez des scans illimités et des conseils diététiques personnalisés pour le SOPK',
    features: {
      unlimitedScans: {
        title: 'Scans Alimentaires Illimités',
        description: 'Scannez tout aliment pour vérifier sa compatibilité SOPK',
      },
      aiAnalysis: {
        title: 'Analyse Propulsée par l\'IA',
        description: 'Obtenez des analyses détaillées des ingrédients et des conseils santé',
      },
      personalized: {
        title: 'Recommandations Personnalisées',
        description: 'Suggestions alimentaires adaptées à vos besoins SOPK',
      },
      scienceBacked: {
        title: 'Résultats Basés sur la Science',
        description: 'Analyse basée sur les dernières recherches SOPK',
      },
    },
    plans: {
      yearly: 'Annuel',
      monthly: 'Mensuel',
      perMonth: '/mois',
      perMonthFull: '/mois',
      save: 'ÉCONOMISEZ {{percent}}%',
    },
    trial: {
      days: 'Essai Gratuit de {{days}} Jours',
      subtitle: 'Essayez gratuitement, annulez à tout moment',
      then: 'Puis {{price}}/an après l\'essai',
    },
    cta: {
      startTrial: 'Commencer l\'Essai Gratuit',
      subscribeNow: 'S\'Abonner Maintenant',
    },
    restore: 'Restaurer les Achats',
    legal: {
      terms: 'Conditions d\'Utilisation',
      privacy: 'Politique de Confidentialité',
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
        title: 'Partager et Gagner',
        subtitle: 'Invitez des amis, gagnez des récompenses',
        earnPerReferral: 'Gagnez 5$ par parrainage',
      },
      modal: {
        title: 'Partager et Gagner des Récompenses',
        subtitle: 'Aidez d\'autres à gérer le SOPK et gagnez des récompenses!',
        howItWorks: 'Comment ça marche:',
        step1: 'Partagez votre lien unique avec des amis',
        step2: 'Quand ils s\'inscrivent, vous obtenez tous les deux 1 semaine de premium gratuit',
        step3: 'Pas de limite! Partagez avec autant d\'amis que vous voulez',
        reward: '🎁 Chaque parrainage = 1 semaine de premium gratuit pour vous deux!',
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
    title: 'Parrainer et Gagner',
    codeCopied: 'Code copié dans le presse-papiers',
    shareMessage: 'Rejoignez-moi sur PCOS Food Scanner! Utilisez mon code de parrainage {{code}} pour obtenir 5$ de réduction. {{link}}',
    hero: {
      title: 'Gagnez des Récompenses',
      subtitle: 'Partagez votre code de parrainage avec des amis et gagnez 5$ par parrainage!',
    },
    yourCode: 'Votre Code de Parrainage',
    shareButton: 'Partager avec des Amis',
    howToEarn: 'Comment gagner',
    steps: {
      step1: 'Partagez votre code promo avec vos amis',
      step2: 'Gagnez 5$ par ami qui s\'inscrit avec votre code',
    },
    terms: 'Les récompenses sont créditées une fois que votre ami a effectué son premier paiement d\'abonnement.',
  },

  // Errors
  errors: {
    generic: 'Une erreur est survenue. Veuillez réessayer.',
    network: 'Erreur réseau. Vérifiez votre connexion.',
    camera: 'Échec de la capture photo. Veuillez réessayer.',
  },
};

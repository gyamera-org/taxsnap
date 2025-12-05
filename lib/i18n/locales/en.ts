export default {
  // Common
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    done: 'Done',
    next: 'Next',
    back: 'Back',
    close: 'Close',
    search: 'Search',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    ok: 'OK',
  },

  // Welcome Screen
  welcome: {
    appName: 'PCOS Scanner',
    title: 'PCOS Food Scanner',
    tagline: "Scan any food to check if it's PCOS-friendly",
    getStarted: 'Get Started',
    signIn: 'Sign In',
    alreadyHaveAccount: 'Already have an account?',
    personalizeTitle: "Let's personalize\nyour experience",
    personalizeSubtitle: 'Answer a few quick questions so we can give you better food recommendations.',
    featurePills: {
      personalized: 'Personalized',
      scienceBacked: 'Science-backed',
      twoMin: '2 min',
    },
    letsGo: "Let's go",
  },

  // Onboarding
  onboarding: {
    common: {
      selectAll: 'Select all that apply',
      skip: 'Skip',
    },
    welcome: {
      title: "Let's personalize your experience",
      subtitle: 'Answer a few quick questions so we can give you better food recommendations.',
      letsGo: "Let's go",
    },
    goal: {
      title: "What's your main goal?",
      options: {
        manageWeight: 'Manage my weight',
        reduceSymptoms: 'Reduce PCOS symptoms',
        fertility: 'Support fertility',
        energy: 'Have more energy',
        understand: 'Know what I can eat',
        peace: 'Stop stressing about food',
      },
    },
    symptoms: {
      title: 'What symptoms do you have?',
      options: {
        irregularPeriods: 'Irregular periods',
        weightGain: 'Weight gain',
        fatigue: 'Fatigue',
        acne: 'Acne or skin issues',
        hairLoss: 'Hair thinning',
        hairGrowth: 'Excess hair growth',
        moodSwings: 'Mood changes',
        cravings: 'Sugar cravings',
        bloating: 'Bloating',
        brainFog: 'Brain fog',
      },
    },
    struggles: {
      title: "What's been hardest for you?",
      options: {
        whatToEat: 'Not knowing what to eat',
        groceryShopping: 'Reading food labels',
        eatingOut: 'Eating out',
        familyMeals: 'Cooking for others',
        time: 'Finding time to plan meals',
        conflictingInfo: 'Too much conflicting info',
        emotionalEating: 'Emotional eating',
        givingUp: 'Giving up too soon',
      },
    },
    foodRelationship: {
      title: 'How do you feel about food?',
      options: {
        loveFood: 'I love food',
        complicated: "It's complicated",
        anxious: 'Food makes me anxious',
        restricted: "I've been very restrictive",
        confused: "I'm confused about what to eat",
        freshStart: 'Ready for a fresh start',
      },
    },
    favoriteFoods: {
      title: 'What foods do you enjoy?',
      options: {
        chocolate: 'Chocolate',
        bread: 'Bread & pasta',
        cheese: 'Cheese',
        coffee: 'Coffee & lattes',
        sweets: 'Desserts & sweets',
        rice: 'Rice',
        fruit: 'Fruit',
        fastFood: 'Fast food',
        snacks: 'Chips & snacks',
        drinks: 'Wine & drinks',
      },
    },
    activity: {
      title: 'How active are you?',
      options: {
        sedentary: 'Mostly sitting',
        light: 'Light activity',
        moderate: 'Moderately active',
        active: 'Pretty active',
        veryActive: 'Very active',
        varies: 'It varies',
      },
    },
    personalized: {
      title: 'Got it!',
      description: "We'll personalize your food ratings based on your profile.",
      summary: {
        focus: 'Focus',
        symptomsTracked: 'Symptoms tracked',
        foodsNoted: 'Foods noted',
        symptomCount_one: '{{count}} symptom',
        symptomCount_other: '{{count}} symptoms',
        foodCount_one: '{{count}} food',
        foodCount_other: '{{count}} foods',
      },
      goalMessages: {
        manageWeight: 'weight management',
        reduceSymptoms: 'symptom reduction',
        fertility: 'fertility support',
        energy: 'energy levels',
        understand: 'food understanding',
        peace: 'food peace',
        default: 'your goals',
      },
    },
    review: {
      title: 'Enjoying the app?',
      description: 'Your review helps other women with PCOS discover this app and take control of their nutrition.',
      rateButton: 'Rate the app',
      maybeLater: 'Maybe later',
    },
    signup: {
      title: 'Your plan is ready!',
      subtitle: 'Create an account to save your preferences and start scanning.',
      benefits: {
        personalizedRatings: 'Personalized PCOS food ratings',
        basedOnYou: 'Based on your symptoms & goals',
        learnImpact: 'Learn how food affects your body',
      },
      continueWithApple: 'Continue with Apple',
      continueWithGoogle: 'Continue with Google',
      terms: 'By continuing, you agree to our',
      termsLink: 'Terms',
      and: '&',
      privacyLink: 'Privacy Policy',
    },
  },

  // Auth
  auth: {
    welcomeBack: 'Welcome Back',
    createAccount: 'Create Account',
    signInSubtitle: 'Sign in to continue your progress',
    signUpSubtitle: 'Sign up to start your PCOS journey',
    continueWithApple: 'Continue with Apple',
    continueWithGoogle: 'Continue with Google',
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: 'Already have an account?',
    terms: 'By continuing, you agree to our',
    termsLink: 'Terms',
    and: '&',
    privacyLink: 'Privacy Policy',
  },

  // Home
  home: {
    title: 'My Scans',
    tabs: {
      all: 'All',
      saves: 'Saves',
    },
    searchPlaceholder: 'Search scans...',
    empty: {
      all: {
        title: 'No scans yet',
        description: 'Start scanning foods to see them here',
      },
      saves: {
        title: 'No saved scans',
        description: 'Bookmark scans to find them here',
      },
      search: {
        title: 'No results found',
        description: 'Try a different search term',
      },
    },
  },

  // Scan
  scan: {
    title: 'Scan Food',
    analyzing: 'Analyzing...',
    analyzingImage: 'Analyzing Image',
    notifyWhenDone: "We'll notify you when done!",
    cameraPermission: {
      title: 'Camera Access Required',
      description: 'To scan food items, please enable camera access in your device settings.',
      openSettings: 'Open Settings',
    },
    capture: 'Capture',
    photoCaptured: 'Photo Captured',
    analysisComingSoon: 'Food analysis feature coming soon! We will analyze this food item for PCOS compatibility.',
  },

  // Scan Results
  scanResult: {
    status: {
      safe: 'PCOS Friendly',
      caution: 'Eat in Moderation',
      avoid: 'Best to Avoid',
    },
    sections: {
      nutritionalAnalysis: 'Nutritional Analysis',
      ingredients: 'Ingredients',
      recommendations: 'Recommendations',
      warnings: 'Warnings',
    },
  },

  // Scan Detail
  scanDetail: {
    notFound: 'Scan not found',
    loading: 'Loading...',
    sections: {
      analysis: 'Nutritional Analysis',
      ingredients: 'Ingredients',
      recommendations: 'Recommendations',
      warnings: 'Warnings',
    },
    status: {
      safe: 'PCOS Friendly',
      caution: 'Consume with Caution',
      avoid: 'Best to Avoid',
    },
  },

  // Nutrition Metrics
  nutrition: {
    glycemicIndex: 'Glycemic Index',
    sugarContent: 'Sugar Content',
    inflammatoryScore: 'Inflammatory Score',
    hormoneImpact: 'Hormone Impact',
    fiberContent: 'Fiber Content',
    proteinQuality: 'Protein Quality',
    healthyFats: 'Healthy Fats',
    processedLevel: 'Processing Level',
    legendTitle: 'What These Icons Mean',
    colorGuide: 'Color Guide',
    colorGood: 'Good for PCOS',
    colorModerate: 'Consume in moderation',
    colorPoor: 'Best to avoid',
    descriptions: {
      gi: 'How quickly food raises blood sugar',
      sugar: 'Amount of added or natural sugars',
      fiber: 'Helps with digestion and blood sugar',
      inflammation: 'May trigger or reduce inflammation',
      hormone: 'Effect on insulin and hormones',
      processed: 'How refined or altered the food is',
    },
    values: {
      low: 'Low',
      moderate: 'Moderate',
      medium: 'Medium',
      high: 'High',
      positive: 'Positive',
      neutral: 'Neutral',
      negative: 'Negative',
      minimally: 'Minimally',
      moderately: 'Moderately',
      highly: 'Highly',
      yes: 'Yes',
      no: 'No',
    },
  },

  // Paywall
  paywall: {
    title: 'Unlock Full Access',
    subtitle: 'Your personal PCOS nutrition guide',
    features: {
      unlimitedScans: {
        title: 'Unlimited Food Scans',
        description: 'Scan any food item to check PCOS compatibility',
      },
      aiAnalysis: {
        title: 'AI-Powered Analysis',
        description: 'Get detailed ingredient breakdowns and health insights',
      },
      personalized: {
        title: 'Personalized Recommendations',
        description: 'Food suggestions tailored to your PCOS needs',
      },
      scienceBacked: {
        title: 'Science-Backed Results',
        description: 'Analysis based on latest PCOS research',
      },
    },
    plans: {
      yearly: 'Yearly',
      monthly: 'Monthly',
      perMonth: '/mo',
      perMonthFull: '/month',
      save: '-{{percent}}%',
    },
    trial: {
      days: '{{days}}-Day Free Trial',
      subtitle: 'Cancel anytime, no charge',
      then: 'Then {{price}}/year',
    },
    cta: {
      startTrial: 'Start {{days}}-Day Free Trial',
      subscribeNow: 'Subscribe Now',
      thenPrice: 'Then {{price}}/year',
      perMonth: '{{price}}/month',
    },
    continueForFree: 'Continue for Free',
    restore: 'Restore Purchases',
    restoreSuccess: 'Purchases restored successfully',
    restoreNone: 'No previous purchases found',
    restoreError: 'Failed to restore purchases',
    legal: {
      terms: 'Terms',
      privacy: 'Privacy',
      disclaimer: 'Subscription automatically renews unless canceled at least 24 hours before the end of the current period.',
    },
  },

  // Settings
  settings: {
    title: 'Settings',
    sections: {
      account: 'Account',
      appearance: 'Appearance',
      support: 'Support',
      about: 'About',
      legal: 'Legal',
    },
    appearance: {
      system: 'System',
      light: 'Light',
      dark: 'Dark',
    },
    items: {
      profile: 'Profile',
      updatePreferences: 'Update Preferences',
      language: 'Language',
      giveFeedback: 'Give Feedback',
      rateApp: 'Rate the App',
      howItWorks: 'How It Works',
      nutritionGuide: 'Nutrition Guide',
      aboutPcos: 'About PCOS',
      termsOfService: 'Terms of Service',
      privacyPolicy: 'Privacy Policy',
      logOut: 'Log Out',
      deleteAccount: 'Delete Account',
    },
    share: {
      title: 'Share with Friends',
      description: 'Help others manage their PCOS diet',
      banner: {
        title: 'Know someone with PCOS?',
        subtitle: 'Help a friend on their journey',
        earnPerReferral: 'Help a friend today',
      },
      modal: {
        title: 'Help a Friend with PCOS',
        subtitle: 'Share the app with someone who could benefit from it',
        howItWorks: 'Why share:',
        step1: 'PCOS affects 1 in 10 women worldwide',
        step2: 'Many struggle to find PCOS-friendly foods',
        step3: 'You could help someone take control of their health',
        reward: '💜 Your recommendation could change someone\'s life',
        shareNow: 'Share Now',
        maybeLater: 'Maybe Later',
      },
    },
    version: 'PCOS Food Scanner v{{version}}',
  },

  // Language Selection
  language: {
    title: 'Language',
    select: 'Select Language',
    languages: {
      en: 'English',
      es: 'Spanish',
      fr: 'French',
      de: 'German',
      pt: 'Portuguese',
      it: 'Italian',
      zh: 'Chinese',
      ja: 'Japanese',
      ko: 'Korean',
      ar: 'Arabic',
      hi: 'Hindi',
    },
  },

  // Logout Modal
  logout: {
    title: 'Log Out',
    message: 'Are you sure you want to log out?',
    confirm: 'Log Out',
  },

  // Delete Account Modal
  deleteAccount: {
    title: 'Delete Account',
    message: 'This action cannot be undone. All your data will be permanently deleted.',
    reasonPrompt: "Please tell us why you're leaving:",
    reasons: {
      noLongerNeed: 'No longer need the app',
      foundBetter: 'Found a better alternative',
      tooHard: 'Too difficult to use',
      privacy: 'Privacy concerns',
      other: 'Other',
    },
    additionalComments: 'Additional comments (optional)',
    deleting: 'Deleting your account...',
    confirm: 'Delete Account',
  },

  // How It Works
  howItWorks: {
    title: 'How It Works',
    intro: {
      title: 'Your PCOS Diet Assistant',
      description: 'PCOS Food Scanner helps you make informed dietary choices by analyzing foods for their potential impact on PCOS symptoms, based on scientific research.',
    },
    steps: {
      step1: {
        title: 'Scan Any Food',
        description: 'Point your camera at any food item, package, or meal. Our AI will identify the food and its ingredients.',
      },
      step2: {
        title: 'AI Analysis',
        description: 'We analyze the glycemic index, anti-inflammatory properties, hormone impact, and nutritional profile based on PCOS research.',
      },
      step3: {
        title: 'Get Results',
        description: 'Receive a clear rating (Safe, Caution, or Avoid) with detailed explanations of how the food may affect your PCOS symptoms.',
      },
    },
    whatWeAnalyze: 'What We Analyze',
    disclaimer: {
      title: 'Important Note',
      message: 'This app is for informational purposes only and is not a substitute for professional medical advice. Always consult with your healthcare provider or a registered dietitian before making significant dietary changes.',
    },
    sources: {
      title: 'Medical Sources & Research',
      description: 'Our recommendations are based on peer-reviewed research and guidelines from trusted medical institutions.',
    },
  },

  // Nutrition Guide
  nutritionGuide: {
    title: 'Nutrition Guide',
    intro: {
      title: 'Understanding Your Scan Results',
      description: 'Learn what each nutritional metric means and how it can affect your PCOS symptoms.',
    },
    howItAffects: 'How It Affects PCOS',
    good: 'Good',
    limit: 'Limit',
    remember: {
      title: 'Remember',
      message: "Everyone's body responds differently. Use these guidelines as a starting point and work with your healthcare provider to find what works best for you.",
    },
  },

  // Feedback
  feedback: {
    title: 'Give Feedback',
    subtitle: 'We\'d love to hear your thoughts on how we can improve.',
    label: 'Your Feedback',
    placeholder: 'Share your feedback...',
    submit: 'Send',
    success: 'Thank you for your feedback!',
    error: 'Failed to send feedback',
    signInRequired: 'Please sign in to submit feedback',
  },

  // Profile
  profile: {
    title: 'Profile',
    name: 'Name',
    username: 'Username',
    email: 'Email',
    save: 'Save Changes',
    uploadAvatar: 'Upload Avatar',
    changeAvatar: 'Change Avatar',
    removeAvatar: 'Remove Avatar',
    namePlaceholder: 'Enter your name',
    usernamePlaceholder: 'Enter username',
  },

  // Referral
  referral: {
    title: 'Help a Friend',
    codeCopied: 'Link copied to clipboard',
    shareMessage: 'I found this app that helps with PCOS-friendly food choices! Check it out: {{link}}',
    hero: {
      title: 'Spread the Word',
      subtitle: 'Help someone you care about take control of their PCOS journey',
    },
    yourCode: 'Share This Link',
    shareButton: 'Share with Friends',
    howToEarn: 'Why share',
    steps: {
      step1: 'PCOS affects 1 in 10 women, and many feel lost about what to eat',
      step2: 'Your recommendation could help someone discover foods that work for them',
    },
    terms: 'Thank you for helping spread awareness about PCOS-friendly nutrition.',
  },

  // Errors
  errors: {
    generic: 'Something went wrong. Please try again.',
    network: 'Network error. Please check your connection.',
    camera: 'Failed to capture photo. Please try again.',
  },
};

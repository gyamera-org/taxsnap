import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StatusBar,
  StyleSheet,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInUp,
  FadeInRight,
  FadeOutLeft,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import {
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Briefcase,
  FolderOpen,
  Receipt,
  TrendingUp,
  Check,
  Star,
  User,
  FileText,
  Megaphone,
  Car,
  Users,
  Shield,
  Scale,
  Laptop,
  Building,
  Package,
  Plane,
  Utensils,
  Wifi,
  Home,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as StoreReview from 'expo-store-review';
import { useThemedColors } from '@/lib/utils/theme';
import { useTheme } from '@/context/theme-provider';
import { useTranslation } from 'react-i18next';
import { PRIMARY } from '@/lib/theme/colors';
import { saveOnboardingData, saveUserName } from '@/lib/utils/onboarding-storage';
import { ScrollView } from 'react-native';

type Step = 'q1' | 'q2' | 'q3' | 'q4' | 'categories' | 'results' | 'rateApp' | 'nameInput';

interface QuizAnswers {
  income: string | null;
  workType: string | null;
  currentTracking: string | null;
  monthlyExpenses: string | null;
  expenseCategories: string[];
}

// Category options for onboarding selection
const ONBOARDING_CATEGORIES = [
  { id: 'office_expense', name: 'Office & Software', icon: Laptop, color: '#F59E0B' },
  { id: 'travel', name: 'Travel', icon: Plane, color: '#0EA5E9' },
  { id: 'meals', name: 'Meals', icon: Utensils, color: '#F97316' },
  { id: 'car_truck', name: 'Car & Mileage', icon: Car, color: '#8B5CF6' },
  { id: 'supplies', name: 'Supplies', icon: Package, color: '#84CC16' },
  { id: 'advertising', name: 'Marketing & Ads', icon: Megaphone, color: '#EC4899' },
  { id: 'home_office', name: 'Home Office', icon: Home, color: '#14B8A6' },
  { id: 'utilities', name: 'Phone & Internet', icon: Wifi, color: '#A855F7' },
  { id: 'legal_professional', name: 'Professional Services', icon: Scale, color: '#6366F1' },
  { id: 'insurance', name: 'Insurance', icon: Shield, color: '#10B981' },
  { id: 'contract_labor', name: 'Contractors', icon: Users, color: '#3B82F6' },
  { id: 'rent_property', name: 'Rent & Coworking', icon: Building, color: '#EF4444' },
] as const;

interface QuestionOption {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

// Calculate estimated savings based on quiz answers - INCREASED VALUES
function calculateSavings(answers: QuizAnswers): { missed: number; savings: number } {
  // Base missed deductions by income level - SIGNIFICANTLY INCREASED
  const incomeMultiplier: Record<string, number> = {
    under75k: 4800,
    '75k150k': 8500,
    '150k300k': 14200,
    over300k: 22000,
  };

  // Work type bonus
  const workTypeBonus: Record<string, number> = {
    freelancer: 1.2,
    contractor: 1.35,
    smallBiz: 1.55,
    sideHustle: 0.9,
  };

  // Current tracking penalty (worse tracking = more missed)
  const trackingMultiplier: Record<string, number> = {
    nowhere: 1.6,
    shoebox: 1.35,
    spreadsheet: 1.15,
    otherApp: 1.0,
  };

  // Monthly expenses multiplier - INCREASED
  const expenseMultiplier: Record<string, number> = {
    under1k: 0.8,
    '1kto2k': 1.1,
    '2kto5k': 1.4,
    over5k: 1.8,
  };

  const base = incomeMultiplier[answers.income || 'under75k'] || 4800;
  const workBonus = workTypeBonus[answers.workType || 'freelancer'] || 1.0;
  const trackingPenalty = trackingMultiplier[answers.currentTracking || 'shoebox'] || 1.0;
  const expenseBonus = expenseMultiplier[answers.monthlyExpenses || '1kto2k'] || 1.0;

  const missed = Math.round(base * workBonus * trackingPenalty * expenseBonus);
  // Assuming ~28% effective tax rate for self-employed (SE tax + income tax)
  const savings = Math.round(missed * 0.28);

  return { missed, savings };
}

interface QuestionSlideProps {
  title: string;
  subtitle: string;
  options: QuestionOption[];
  selectedOption: string | null;
  onSelect: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
  isFirst?: boolean;
  colors: ReturnType<typeof useThemedColors>;
}

function QuestionSlide({
  title,
  subtitle,
  options,
  selectedOption,
  onSelect,
  onNext,
  onBack,
  currentStep,
  totalSteps,
  isFirst,
  colors,
}: QuestionSlideProps) {
  const handleSelect = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(id);
  };

  return (
    <Animated.View
      entering={FadeInRight.duration(300)}
      exiting={FadeOutLeft.duration(300)}
      style={[styles.slideContainer, { backgroundColor: colors.background }]}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          {!isFirst ? (
            <Pressable
              onPress={onBack}
              style={[styles.backButton, { backgroundColor: colors.backgroundSecondary }]}
            >
              <ChevronLeft size={20} color={colors.primary} />
            </Pressable>
          ) : (
            <View style={styles.backButtonPlaceholder} />
          )}

          {/* Progress bar */}
          <View style={[styles.progressBarContainer, { backgroundColor: colors.border }]}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  backgroundColor: colors.primary,
                  width: `${(currentStep / totalSteps) * 100}%`,
                },
              ]}
            />
          </View>

          <View style={styles.backButtonPlaceholder} />
        </View>

        {/* Question Content */}
        <View style={styles.questionContent}>
          <Animated.Text
            entering={FadeInUp.delay(100).duration(400)}
            style={[styles.questionTitle, { color: colors.text }]}
          >
            {title}
          </Animated.Text>
          <Animated.Text
            entering={FadeInUp.delay(150).duration(400)}
            style={[styles.questionSubtitle, { color: colors.textSecondary }]}
          >
            {subtitle}
          </Animated.Text>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {options.map((option, index) => {
              const isSelected = selectedOption === option.id;
              return (
                <Animated.View
                  key={option.id}
                  entering={FadeInUp.delay(200 + index * 50).duration(400)}
                >
                  <Pressable
                    onPress={() => handleSelect(option.id)}
                    style={[
                      styles.optionButton,
                      {
                        backgroundColor: isSelected ? `${colors.primary}15` : colors.card,
                        borderColor: isSelected ? colors.primary : colors.cardBorder,
                      },
                    ]}
                  >
                    {option.icon && (
                      <View
                        style={[
                          styles.optionIcon,
                          { backgroundColor: isSelected ? colors.primary : colors.backgroundSecondary },
                        ]}
                      >
                        {option.icon}
                      </View>
                    )}
                    <Text
                      style={[
                        styles.optionLabel,
                        { color: isSelected ? colors.primary : colors.text },
                      ]}
                    >
                      {option.label}
                    </Text>
                    {isSelected && (
                      <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
                        <Check size={14} color="#fff" strokeWidth={3} />
                      </View>
                    )}
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>
        </View>

        {/* Next button */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.footer}>
          <Pressable
            onPress={onNext}
            disabled={!selectedOption}
            style={[
              styles.primaryButton,
              { backgroundColor: colors.primary },
              !selectedOption && styles.buttonDisabled,
            ]}
          >
            <Text style={styles.buttonText}>Continue</Text>
            <ChevronRight size={20} color="#ffffff" />
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    </Animated.View>
  );
}

interface ResultsSlideProps {
  savings: number;
  missed: number;
  onContinue: () => void;
  colors: ReturnType<typeof useThemedColors>;
}

function ResultsSlide({ savings, missed, onContinue, colors }: ResultsSlideProps) {
  const { t } = useTranslation();
  const [displayedSavings, setDisplayedSavings] = useState(0);
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Start animation after a brief delay
    const timer = setTimeout(() => {
      // Animate the number counting up
      let current = 0;
      const target = savings;
      const duration = 2000; // 2 seconds
      const steps = 60;
      const increment = target / steps;
      const stepDuration = duration / steps;

      const interval = setInterval(() => {
        current += increment;
        if (current >= target) {
          setDisplayedSavings(target);
          clearInterval(interval);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          setDisplayedSavings(Math.round(current));
        }
      }, stepDuration);

      return () => clearInterval(interval);
    }, 500);

    scale.value = withDelay(600, withSpring(1, { damping: 12 }));
    opacity.value = withDelay(600, withTiming(1, { duration: 400 }));

    return () => clearTimeout(timer);
  }, [savings]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      style={[styles.slideContainer, { backgroundColor: colors.background }]}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Decorative elements */}
        <View style={styles.decorativeContainer}>
          <Animated.View
            entering={FadeIn.delay(800).duration(600)}
            style={[styles.confettiDot, styles.confetti1, { backgroundColor: colors.primary }]}
          />
          <Animated.View
            entering={FadeIn.delay(900).duration(600)}
            style={[styles.confettiDot, styles.confetti2, { backgroundColor: `${colors.primary}80` }]}
          />
          <Animated.View
            entering={FadeIn.delay(1000).duration(600)}
            style={[styles.confettiDot, styles.confetti3, { backgroundColor: colors.primary }]}
          />
          <Animated.View
            entering={FadeIn.delay(1100).duration(600)}
            style={[styles.confettiDot, styles.confetti4, { backgroundColor: `${colors.primary}60` }]}
          />
        </View>

        <View style={styles.resultsContent}>
          {/* Icon */}
          <Animated.View
            entering={FadeIn.delay(200).duration(500)}
            style={[styles.resultsIconContainer, { backgroundColor: `${colors.primary}15` }]}
          >
            <TrendingUp size={48} color={colors.primary} />
          </Animated.View>

          {/* Title */}
          <Animated.Text
            entering={FadeInUp.delay(400).duration(500)}
            style={[styles.resultsLabel, { color: colors.textSecondary }]}
          >
            {t('onboarding.results.title')}
          </Animated.Text>

          {/* Animated Savings Number */}
          <Animated.View style={animatedStyle}>
            <Text style={[styles.savingsAmount, { color: colors.primary }]}>
              ${displayedSavings.toLocaleString()}
            </Text>
          </Animated.View>

          <Animated.Text
            entering={FadeInUp.delay(800).duration(500)}
            style={[styles.perYear, { color: colors.textSecondary }]}
          >
            {t('onboarding.results.perYear')}
          </Animated.Text>

          {/* Breakdown Card */}
          <Animated.View
            entering={FadeInUp.delay(1200).duration(500)}
            style={[styles.breakdownCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
          >
            <View style={styles.breakdownRow}>
              <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>
                {t('onboarding.results.missedDeductions')}
              </Text>
              <Text style={[styles.breakdownValue, { color: colors.text }]}>
                ${missed.toLocaleString()}
              </Text>
            </View>
            <View style={[styles.breakdownDivider, { backgroundColor: colors.border }]} />
            <View style={styles.breakdownRow}>
              <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>
                {t('onboarding.results.taxSavings')}
              </Text>
              <Text style={[styles.breakdownValueHighlight, { color: colors.primary }]}>
                ${savings.toLocaleString()}
              </Text>
            </View>
          </Animated.View>

          {/* Subtitle */}
          <Animated.Text
            entering={FadeInUp.delay(1400).duration(500)}
            style={[styles.resultsSubtitle, { color: colors.textSecondary }]}
          >
            {t('onboarding.results.subtitle')}
          </Animated.Text>
        </View>

        {/* CTA */}
        <Animated.View entering={FadeInDown.delay(1600).duration(500)} style={styles.footer}>
          <Pressable
            onPress={onContinue}
            style={[styles.ctaButton, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.ctaButtonText}>{t('onboarding.results.cta')}</Text>
          </Pressable>

          <Text style={[styles.disclaimer, { color: colors.textMuted }]}>
            {t('onboarding.results.disclaimer')}
          </Text>
        </Animated.View>
      </SafeAreaView>
    </Animated.View>
  );
}

interface RateAppSlideProps {
  onRate: () => void;
  onSkip: () => void;
  colors: ReturnType<typeof useThemedColors>;
}

function RateAppSlide({ onRate, onSkip, colors }: RateAppSlideProps) {
  const { t } = useTranslation();

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      style={[styles.slideContainer, { backgroundColor: colors.background }]}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.rateAppContent}>
          {/* Stars */}
          <Animated.View
            entering={FadeIn.delay(200).duration(500)}
            style={styles.starsContainer}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <Animated.View
                key={star}
                entering={FadeIn.delay(200 + star * 100).duration(400)}
              >
                <Star
                  size={40}
                  color={colors.primary}
                  fill={colors.primary}
                />
              </Animated.View>
            ))}
          </Animated.View>

          {/* Title */}
          <Animated.Text
            entering={FadeInUp.delay(600).duration(500)}
            style={[styles.rateAppTitle, { color: colors.text }]}
          >
            {t('onboarding.rateApp.title')}
          </Animated.Text>

          {/* Subtitle */}
          <Animated.Text
            entering={FadeInUp.delay(700).duration(500)}
            style={[styles.rateAppSubtitle, { color: colors.textSecondary }]}
          >
            {t('onboarding.rateApp.subtitle')}
          </Animated.Text>
        </View>

        {/* Buttons */}
        <Animated.View entering={FadeInDown.delay(800).duration(500)} style={styles.footer}>
          <Pressable
            onPress={onRate}
            style={[styles.ctaButton, { backgroundColor: colors.primary }]}
          >
            <Star size={20} color="#ffffff" fill="#ffffff" />
            <Text style={styles.ctaButtonText}>{t('onboarding.rateApp.rateNow')}</Text>
          </Pressable>

          <Pressable onPress={onSkip} style={styles.skipButton}>
            <Text style={[styles.skipButtonText, { color: colors.textSecondary }]}>
              {t('onboarding.rateApp.maybeLater')}
            </Text>
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    </Animated.View>
  );
}

interface NameInputSlideProps {
  name: string;
  onNameChange: (name: string) => void;
  onContinue: () => void;
  colors: ReturnType<typeof useThemedColors>;
}

// Categories Selection Slide
interface CategoriesSlideProps {
  selectedCategories: string[];
  onToggle: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
  colors: ReturnType<typeof useThemedColors>;
}

function CategoriesSlide({ selectedCategories, onToggle, onNext, onBack, colors }: CategoriesSlideProps) {
  const handleToggle = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle(id);
  };

  return (
    <Animated.View
      entering={FadeInRight.duration(300)}
      exiting={FadeOutLeft.duration(300)}
      style={[styles.slideContainer, { backgroundColor: colors.background }]}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={onBack}
            style={[styles.backButton, { backgroundColor: colors.backgroundSecondary }]}
          >
            <ChevronLeft size={20} color={colors.primary} />
          </Pressable>

          {/* Progress bar */}
          <View style={[styles.progressBarContainer, { backgroundColor: colors.border }]}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  backgroundColor: colors.primary,
                  width: '100%',
                },
              ]}
            />
          </View>

          <View style={styles.backButtonPlaceholder} />
        </View>

        {/* Content */}
        <View style={styles.categoriesContent}>
          <Animated.View
            entering={FadeIn.delay(100).duration(400)}
            style={[styles.categoriesHeaderIcon, { backgroundColor: `${colors.primary}15` }]}
          >
            <FileText size={32} color={colors.primary} />
          </Animated.View>

          <Animated.Text
            entering={FadeInUp.delay(150).duration(400)}
            style={[styles.questionTitle, { color: colors.text, textAlign: 'center' }]}
          >
            What expenses do you have?
          </Animated.Text>
          <Animated.Text
            entering={FadeInUp.delay(200).duration(400)}
            style={[styles.questionSubtitle, { color: colors.textSecondary, textAlign: 'center' }]}
          >
            Select all that apply. We'll help you track these.
          </Animated.Text>

          {/* Counter */}
          <Animated.View
            entering={FadeIn.delay(250).duration(400)}
            style={[styles.categoriesCounter, { backgroundColor: `${colors.primary}10` }]}
          >
            <Text style={[styles.categoriesCounterText, { color: colors.primary }]}>
              {selectedCategories.length} selected
            </Text>
          </Animated.View>

          {/* Categories Grid */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScrollContent}
          >
            <View style={styles.categoriesGrid}>
              {ONBOARDING_CATEGORIES.map((category, index) => {
                const isSelected = selectedCategories.includes(category.id);
                const Icon = category.icon;
                return (
                  <Animated.View
                    key={category.id}
                    entering={FadeInUp.delay(300 + index * 30).duration(300)}
                  >
                    <Pressable
                      onPress={() => handleToggle(category.id)}
                      style={[
                        styles.categoryItem,
                        {
                          backgroundColor: isSelected ? `${category.color}12` : colors.card,
                          borderColor: isSelected ? category.color : colors.cardBorder,
                          borderWidth: isSelected ? 2 : 1,
                        },
                      ]}
                    >
                      <View style={[styles.categoryItemIcon, { backgroundColor: `${category.color}15` }]}>
                        <Icon size={18} color={category.color} />
                      </View>
                      <Text
                        style={[
                          styles.categoryItemText,
                          { color: isSelected ? category.color : colors.text },
                        ]}
                        numberOfLines={1}
                      >
                        {category.name}
                      </Text>
                      {isSelected && (
                        <View style={[styles.categoryItemCheck, { backgroundColor: category.color }]}>
                          <Check size={10} color="#fff" strokeWidth={3} />
                        </View>
                      )}
                    </Pressable>
                  </Animated.View>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Next button */}
        <Animated.View entering={FadeInDown.delay(500).duration(400)} style={styles.footer}>
          <Pressable
            onPress={onNext}
            disabled={selectedCategories.length === 0}
            style={[
              styles.primaryButton,
              { backgroundColor: colors.primary },
              selectedCategories.length === 0 && styles.buttonDisabled,
            ]}
          >
            <Text style={styles.buttonText}>Continue</Text>
            <ChevronRight size={20} color="#ffffff" />
          </Pressable>
          <Text style={[styles.skipHint, { color: colors.textMuted }]}>
            You can always change this later
          </Text>
        </Animated.View>
      </SafeAreaView>
    </Animated.View>
  );
}

function NameInputSlide({ name, onNameChange, onContinue, colors }: NameInputSlideProps) {
  const { t } = useTranslation();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.slideContainer, { backgroundColor: colors.background }]}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <Animated.View
          entering={FadeIn.duration(400)}
          style={styles.slideContainer}
        >
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.nameInputContent}>
              {/* Icon */}
              <Animated.View
                entering={FadeIn.delay(200).duration(500)}
                style={[styles.nameIconContainer, { backgroundColor: `${colors.primary}15` }]}
              >
                <User size={40} color={colors.primary} />
              </Animated.View>

              {/* Title */}
              <Animated.Text
                entering={FadeInUp.delay(300).duration(500)}
                style={[styles.nameInputTitle, { color: colors.text }]}
              >
                {t('onboarding.nameInput.title')}
              </Animated.Text>

              {/* Subtitle */}
              <Animated.Text
                entering={FadeInUp.delay(400).duration(500)}
                style={[styles.nameInputSubtitle, { color: colors.textSecondary }]}
              >
                {t('onboarding.nameInput.subtitle')}
              </Animated.Text>

              {/* Text Input */}
              <Animated.View
                entering={FadeInUp.delay(500).duration(500)}
                style={styles.inputContainer}
              >
                <TextInput
                  value={name}
                  onChangeText={onNameChange}
                  placeholder={t('onboarding.nameInput.placeholder')}
                  placeholderTextColor={colors.textMuted}
                  style={[
                    styles.nameInput,
                    {
                      backgroundColor: colors.card,
                      borderColor: name ? colors.primary : colors.cardBorder,
                      color: colors.text,
                    },
                  ]}
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={() => name.trim() && onContinue()}
                />
              </Animated.View>
            </View>

            {/* Continue button */}
            <Animated.View entering={FadeInDown.delay(600).duration(500)} style={styles.footer}>
              <Pressable
                onPress={onContinue}
                disabled={!name.trim()}
                style={[
                  styles.ctaButton,
                  { backgroundColor: colors.primary },
                  !name.trim() && styles.buttonDisabled,
                ]}
              >
                <Text style={styles.ctaButtonText}>{t('onboarding.nameInput.continue')}</Text>
                <ChevronRight size={20} color="#ffffff" />
              </Pressable>
            </Animated.View>
          </SafeAreaView>
        </Animated.View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const colors = useThemedColors();
  const { isDark } = useTheme();
  const { t } = useTranslation();

  const [step, setStep] = useState<Step>('q1');
  const [userName, setUserName] = useState('');
  const [answers, setAnswers] = useState<QuizAnswers>({
    income: null,
    workType: null,
    currentTracking: null,
    monthlyExpenses: null,
    expenseCategories: [],
  });

  const quizSteps: Step[] = ['q1', 'q2', 'q3', 'q4', 'categories'];

  const goBack = () => {
    const i = quizSteps.indexOf(step);
    if (i > 0) {
      setStep(quizSteps[i - 1]);
    } else if (step === 'results') {
      setStep('categories');
    } else {
      router.back();
    }
  };

  const toggleCategory = (categoryId: string) => {
    setAnswers((prev) => ({
      ...prev,
      expenseCategories: prev.expenseCategories.includes(categoryId)
        ? prev.expenseCategories.filter((id) => id !== categoryId)
        : [...prev.expenseCategories, categoryId],
    }));
  };

  const goNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const i = quizSteps.indexOf(step);
    if (i < quizSteps.length - 1) {
      setStep(quizSteps[i + 1]);
    } else if (i === quizSteps.length - 1) {
      // Last quiz question - go to results
      setStep('results');
    }
  };

  const handleResultsContinue = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Save onboarding data
    const { missed, savings } = calculateSavings(answers);
    await saveOnboardingData({
      income: answers.income,
      workType: answers.workType,
      currentTracking: answers.currentTracking,
      monthlyExpenses: answers.monthlyExpenses,
      expenseCategories: answers.expenseCategories,
      estimatedSavings: savings,
      estimatedMissedDeductions: missed,
      completedAt: new Date().toISOString(),
    });

    setStep('rateApp');
  };

  const handleRateApp = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Try to open the native review prompt
    if (await StoreReview.hasAction()) {
      await StoreReview.requestReview();
    }

    setStep('nameInput');
  };

  const handleSkipRating = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep('nameInput');
  };

  const handleNameContinue = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Save the user's name
    if (userName.trim()) {
      await saveUserName(userName.trim());
    }

    // Navigate to auth with signup mode
    router.push('/auth?mode=signup');
  };

  // Question configurations (excludes categories which has its own slide)
  const questions: Record<'q1' | 'q2' | 'q3' | 'q4', {
    title: string;
    subtitle: string;
    options: QuestionOption[];
    answerKey: 'income' | 'workType' | 'currentTracking' | 'monthlyExpenses';
  }> = {
    q1: {
      title: t('onboarding.quiz.question1.title'),
      subtitle: t('onboarding.quiz.question1.subtitle'),
      answerKey: 'income',
      options: [
        { id: 'under75k', label: t('onboarding.quiz.question1.options.under75k'), icon: <DollarSign size={20} color={answers.income === 'under75k' ? '#fff' : colors.textSecondary} /> },
        { id: '75k150k', label: t('onboarding.quiz.question1.options.75k150k'), icon: <DollarSign size={20} color={answers.income === '75k150k' ? '#fff' : colors.textSecondary} /> },
        { id: '150k300k', label: t('onboarding.quiz.question1.options.150k300k'), icon: <DollarSign size={20} color={answers.income === '150k300k' ? '#fff' : colors.textSecondary} /> },
        { id: 'over300k', label: t('onboarding.quiz.question1.options.over300k'), icon: <DollarSign size={20} color={answers.income === 'over300k' ? '#fff' : colors.textSecondary} /> },
      ],
    },
    q2: {
      title: t('onboarding.quiz.question2.title'),
      subtitle: t('onboarding.quiz.question2.subtitle'),
      answerKey: 'workType',
      options: [
        { id: 'freelancer', label: t('onboarding.quiz.question2.options.freelancer'), icon: <Briefcase size={20} color={answers.workType === 'freelancer' ? '#fff' : colors.textSecondary} /> },
        { id: 'contractor', label: t('onboarding.quiz.question2.options.contractor'), icon: <Briefcase size={20} color={answers.workType === 'contractor' ? '#fff' : colors.textSecondary} /> },
        { id: 'smallBiz', label: t('onboarding.quiz.question2.options.smallBiz'), icon: <Briefcase size={20} color={answers.workType === 'smallBiz' ? '#fff' : colors.textSecondary} /> },
        { id: 'sideHustle', label: t('onboarding.quiz.question2.options.sideHustle'), icon: <Briefcase size={20} color={answers.workType === 'sideHustle' ? '#fff' : colors.textSecondary} /> },
      ],
    },
    q3: {
      title: t('onboarding.quiz.question3.title'),
      subtitle: t('onboarding.quiz.question3.subtitle'),
      answerKey: 'currentTracking',
      options: [
        { id: 'nowhere', label: t('onboarding.quiz.question3.options.nowhere'), icon: <FolderOpen size={20} color={answers.currentTracking === 'nowhere' ? '#fff' : colors.textSecondary} /> },
        { id: 'shoebox', label: t('onboarding.quiz.question3.options.shoebox'), icon: <FolderOpen size={20} color={answers.currentTracking === 'shoebox' ? '#fff' : colors.textSecondary} /> },
        { id: 'spreadsheet', label: t('onboarding.quiz.question3.options.spreadsheet'), icon: <FolderOpen size={20} color={answers.currentTracking === 'spreadsheet' ? '#fff' : colors.textSecondary} /> },
        { id: 'otherApp', label: t('onboarding.quiz.question3.options.otherApp'), icon: <FolderOpen size={20} color={answers.currentTracking === 'otherApp' ? '#fff' : colors.textSecondary} /> },
      ],
    },
    q4: {
      title: t('onboarding.quiz.question4.title'),
      subtitle: t('onboarding.quiz.question4.subtitle'),
      answerKey: 'monthlyExpenses',
      options: [
        { id: 'under1k', label: t('onboarding.quiz.question4.options.under1k'), icon: <Receipt size={20} color={answers.monthlyExpenses === 'under1k' ? '#fff' : colors.textSecondary} /> },
        { id: '1kto2k', label: t('onboarding.quiz.question4.options.1kto2k'), icon: <Receipt size={20} color={answers.monthlyExpenses === '1kto2k' ? '#fff' : colors.textSecondary} /> },
        { id: '2kto5k', label: t('onboarding.quiz.question4.options.2kto5k'), icon: <Receipt size={20} color={answers.monthlyExpenses === '2kto5k' ? '#fff' : colors.textSecondary} /> },
        { id: 'over5k', label: t('onboarding.quiz.question4.options.over5k'), icon: <Receipt size={20} color={answers.monthlyExpenses === 'over5k' ? '#fff' : colors.textSecondary} /> },
      ],
    },
  };

  const { missed, savings } = calculateSavings(answers);

  // Render current step
  if (step === 'results') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <ResultsSlide
          savings={savings}
          missed={missed}
          onContinue={handleResultsContinue}
          colors={colors}
        />
      </View>
    );
  }

  if (step === 'rateApp') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <RateAppSlide
          onRate={handleRateApp}
          onSkip={handleSkipRating}
          colors={colors}
        />
      </View>
    );
  }

  if (step === 'nameInput') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <NameInputSlide
          name={userName}
          onNameChange={setUserName}
          onContinue={handleNameContinue}
          colors={colors}
        />
      </View>
    );
  }

  if (step === 'categories') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <CategoriesSlide
          selectedCategories={answers.expenseCategories}
          onToggle={toggleCategory}
          onNext={goNext}
          onBack={goBack}
          colors={colors}
        />
      </View>
    );
  }

  // For regular question steps (q1-q4)
  const currentQuestion = questions[step as 'q1' | 'q2' | 'q3' | 'q4'];
  const currentIndex = quizSteps.indexOf(step);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <QuestionSlide
        title={currentQuestion.title}
        subtitle={currentQuestion.subtitle}
        options={currentQuestion.options}
        selectedOption={answers[currentQuestion.answerKey]}
        onSelect={(id) => setAnswers({ ...answers, [currentQuestion.answerKey]: id })}
        onNext={goNext}
        onBack={goBack}
        currentStep={currentIndex + 1}
        totalSteps={4}
        isFirst={currentIndex === 0}
        colors={colors}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slideContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonPlaceholder: {
    width: 40,
    height: 40,
  },
  progressBarContainer: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  questionContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  questionTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  questionSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 32,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionLabel: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  primaryButton: {
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
  // Results Slide Styles
  decorativeContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  confettiDot: {
    position: 'absolute',
    borderRadius: 50,
  },
  confetti1: {
    width: 12,
    height: 12,
    top: '15%',
    left: '10%',
  },
  confetti2: {
    width: 8,
    height: 8,
    top: '20%',
    right: '15%',
  },
  confetti3: {
    width: 10,
    height: 10,
    top: '35%',
    left: '85%',
  },
  confetti4: {
    width: 14,
    height: 14,
    top: '25%',
    left: '20%',
  },
  resultsContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  resultsIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  resultsLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  savingsAmount: {
    fontSize: 72,
    fontWeight: '800',
    letterSpacing: -2,
  },
  perYear: {
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 32,
  },
  breakdownCard: {
    width: '100%',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    marginBottom: 24,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  breakdownLabel: {
    fontSize: 15,
  },
  breakdownValue: {
    fontSize: 17,
    fontWeight: '600',
  },
  breakdownValueHighlight: {
    fontSize: 20,
    fontWeight: '700',
  },
  breakdownDivider: {
    height: 1,
    marginVertical: 8,
  },
  resultsSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  ctaButton: {
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  ctaButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  disclaimer: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 24,
  },
  // Rate App Styles
  rateAppContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
  },
  rateAppTitle: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  rateAppSubtitle: {
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 16,
  },
  skipButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Name Input Styles
  nameInputContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  nameIconContainer: {
    width: 88,
    height: 88,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  nameInputTitle: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  nameInputSubtitle: {
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 32,
  },
  inputContainer: {
    width: '100%',
  },
  nameInput: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 2,
  },
  // Categories Slide Styles
  categoriesContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  categoriesHeaderIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  categoriesCounter: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  categoriesCounterText: {
    fontSize: 13,
    fontWeight: '600',
  },
  categoriesScrollContent: {
    paddingBottom: 20,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 2,
    gap: 10,
  },
  categoryItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryItemText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  categoryItemCheck: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipHint: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
  },
});

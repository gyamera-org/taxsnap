import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Linking,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Scan, Sparkles, Heart, ShieldCheck, Check } from 'lucide-react-native';
import { useRevenueCat } from '@/context/revenuecat-provider';
import { APP_URLS } from '@/lib/config/urls';
import { useTranslation } from 'react-i18next';

// Fallback prices if RevenueCat fails to load
const FALLBACK_MONTHLY_PRICE = 3.99;
const FALLBACK_YEARLY_PRICE = 29.99;
const TRIAL_DAYS = 7;

type PlanType = 'monthly' | 'yearly';

export default function PaywallScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('yearly');
  const { offerings, purchasePackage, restorePurchases } = useRevenueCat();

  const features = [
    {
      icon: Scan,
      title: t('paywall.features.unlimitedScans.title'),
      description: t('paywall.features.unlimitedScans.description'),
    },
    {
      icon: Sparkles,
      title: t('paywall.features.aiAnalysis.title'),
      description: t('paywall.features.aiAnalysis.description'),
    },
    {
      icon: Heart,
      title: t('paywall.features.personalized.title'),
      description: t('paywall.features.personalized.description'),
    },
    {
      icon: ShieldCheck,
      title: t('paywall.features.scienceBacked.title'),
      description: t('paywall.features.scienceBacked.description'),
    },
  ];

  // Get packages from RevenueCat offerings
  const monthlyPackage = offerings?.current?.monthly;
  const yearlyPackage = offerings?.current?.annual;

  // Use RevenueCat formatted price strings (includes currency symbol)
  const monthlyPriceString = monthlyPackage?.product.priceString ?? `$${FALLBACK_MONTHLY_PRICE}`;
  const yearlyPriceString = yearlyPackage?.product.priceString ?? `$${FALLBACK_YEARLY_PRICE}`;
  const yearlyPerMonthString =
    yearlyPackage?.product.pricePerMonthString ?? `$${(FALLBACK_YEARLY_PRICE / 12).toFixed(2)}`;

  // Numeric prices for calculations
  const monthlyPrice = monthlyPackage?.product.price ?? FALLBACK_MONTHLY_PRICE;
  const yearlyPrice = yearlyPackage?.product.price ?? FALLBACK_YEARLY_PRICE;

  const currentPriceString = selectedPlan === 'yearly' ? yearlyPriceString : monthlyPriceString;
  const savingsPercent = Math.round((1 - yearlyPrice / 12 / monthlyPrice) * 100);

  const handleSubscribe = async () => {
    const packageToPurchase = selectedPlan === 'yearly' ? yearlyPackage : monthlyPackage;

    if (!packageToPurchase) {
      return;
    }

    setIsLoading(true);
    const result = await purchasePackage(packageToPurchase);
    setIsLoading(false);

    if (result.success) {
      router.replace('/(tabs)/home');
    }
  };

  const handleRestore = async () => {
    setIsRestoring(true);
    try {
      const customerInfo = await restorePurchases();
      // Check if user has active entitlements after restore
      const hasActiveSubscription = Object.keys(customerInfo.entitlements.active).length > 0;
      if (hasActiveSubscription) {
        router.replace('/(tabs)/home');
      }
    } catch {
      // Error is handled by the provider
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Liquid Glass Background */}
      <LinearGradient
        colors={['#F0FDFA', '#CCFBF1', '#99F6E4', '#F0FDFA']}
        locations={[0, 0.3, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Floating orbs */}
      <Animated.View entering={FadeIn.duration(1000)} style={styles.orb1} />
      <Animated.View entering={FadeIn.duration(1000).delay(200)} style={styles.orb2} />
      <Animated.View entering={FadeIn.duration(1000).delay(400)} style={styles.orb3} />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View entering={FadeInUp.duration(400)} style={styles.headerSection}>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={['#14B8A6', '#0D9488', '#0F766E']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1}}
                style={styles.iconGradient}
              >
                <Scan size={40} color="#FFFFFF" />
              </LinearGradient>
            </View>
            <Text style={styles.headerTitle}>{t('paywall.title')}</Text>
            <Text style={styles.headerSubtitle}>
              {t('paywall.subtitle')}
            </Text>
          </Animated.View>

          {/* Features - Glass Card */}
          <Animated.View entering={FadeInUp.delay(100).duration(400)} style={styles.glassCard}>
            {features.map((feature, index) => (
              <View
                key={feature.title}
                style={[
                  styles.featureRow,
                  index < features.length - 1 && styles.featureBorder,
                ]}
              >
                <View style={styles.featureIconContainer}>
                  <feature.icon size={24} color="#0D9488" />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
                <Check size={20} color="#14B8A6" />
              </View>
            ))}
          </Animated.View>

          {/* Plan Selection */}
          <Animated.View entering={FadeInUp.delay(200).duration(400)} style={styles.plansContainer}>
            {/* Yearly Plan */}
            <Pressable onPress={() => setSelectedPlan('yearly')} style={styles.planWrapper}>
              <View
                style={[
                  styles.planCard,
                  selectedPlan === 'yearly' && styles.planCardSelected,
                ]}
              >
                {/* Save Badge */}
                {savingsPercent > 0 && (
                  <View style={styles.saveBadge}>
                    <Text style={styles.saveBadgeText}>{t('paywall.plans.save', { percent: savingsPercent })}</Text>
                  </View>
                )}
                <View
                  style={[
                    styles.radioButton,
                    selectedPlan === 'yearly' && styles.radioButtonSelected,
                  ]}
                >
                  {selectedPlan === 'yearly' && <Check size={12} color="#fff" />}
                </View>
                <Text style={styles.planName}>{t('paywall.plans.yearly')}</Text>
                <Text style={styles.planPrice}>{yearlyPriceString}</Text>
                <Text style={styles.planPeriod}>{yearlyPerMonthString}{t('paywall.plans.perMonth')}</Text>
              </View>
            </Pressable>

            {/* Monthly Plan */}
            <Pressable onPress={() => setSelectedPlan('monthly')} style={styles.planWrapper}>
              <View
                style={[
                  styles.planCard,
                  selectedPlan === 'monthly' && styles.planCardSelected,
                ]}
              >
                <View
                  style={[
                    styles.radioButton,
                    selectedPlan === 'monthly' && styles.radioButtonSelected,
                  ]}
                >
                  {selectedPlan === 'monthly' && <Check size={12} color="#fff" />}
                </View>
                <Text style={styles.planName}>{t('paywall.plans.monthly')}</Text>
                <Text style={styles.planPrice}>{monthlyPriceString}</Text>
                <Text style={styles.planPeriod}>{t('paywall.plans.perMonthFull')}</Text>
              </View>
            </Pressable>
          </Animated.View>

          {/* Trial Info - Only for Yearly */}
          {selectedPlan === 'yearly' && (
            <Animated.View entering={FadeInUp.delay(300).duration(400)} style={styles.trialCard}>
              <View style={styles.trialContent}>
                <View style={styles.trialBadge}>
                  <Text style={styles.trialDays}>{TRIAL_DAYS}</Text>
                </View>
                <View style={styles.trialTextContainer}>
                  <Text style={styles.trialTitle}>{t('paywall.trial.days', { days: TRIAL_DAYS })}</Text>
                  <Text style={styles.trialSubtitle}>{t('paywall.trial.subtitle')}</Text>
                </View>
              </View>
            </Animated.View>
          )}
        </ScrollView>

        {/* Fixed Bottom Section */}
        <View style={styles.bottomSection}>
          {/* CTA Button */}
          <Animated.View entering={FadeInUp.delay(400).duration(400)}>
            <Pressable
              onPress={handleSubscribe}
              disabled={isLoading || isRestoring}
              style={[styles.ctaButton, (isLoading || isRestoring) && styles.buttonDisabled]}
            >
              <LinearGradient
                colors={['#14B8A6', '#0D9488', '#0F766E']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.ctaButtonText}>
                    {selectedPlan === 'yearly' ? t('paywall.cta.startTrial') : t('paywall.cta.subscribeNow')}
                  </Text>
                  {selectedPlan === 'yearly' ? (
                    <Text style={styles.ctaButtonSubtext}>
                      {t('paywall.trial.then', { price: currentPriceString })}
                    </Text>
                  ) : (
                    <Text style={styles.ctaButtonSubtext}>{currentPriceString}{t('paywall.plans.perMonthFull')}</Text>
                  )}
                </>
              )}
            </Pressable>
          </Animated.View>

          {/* Restore Purchases */}
          <Pressable
            onPress={handleRestore}
            disabled={isLoading || isRestoring}
            style={styles.restoreButton}
          >
            {isRestoring ? (
              <ActivityIndicator color="#6B7280" />
            ) : (
              <Text style={styles.restoreText}>{t('paywall.restore')}</Text>
            )}
          </Pressable>

          {/* Legal Links */}
          <View style={styles.legalContainer}>
            <View style={styles.legalLinks}>
              <Pressable onPress={() => Linking.openURL(APP_URLS.terms)}>
                <Text style={styles.legalLink}>{t('paywall.legal.terms')}</Text>
              </Pressable>
              <Text style={styles.legalDot}>•</Text>
              <Pressable onPress={() => Linking.openURL(APP_URLS.privacy)}>
                <Text style={styles.legalLink}>{t('paywall.legal.privacy')}</Text>
              </Pressable>
            </View>
            <Text style={styles.legalDisclaimer}>
              {t('paywall.legal.disclaimer')}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 32,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    marginBottom: 16,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  glassCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 20,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureBorder: {
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(209, 213, 219, 0.3)',
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.2)',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  plansContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  planWrapper: {
    flex: 1,
  },
  planCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(209, 213, 219, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 16,
    alignItems: 'center',
  },
  planCardSelected: {
    borderColor: '#14B8A6',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  saveBadge: {
    position: 'absolute',
    top: -2,
    right: 8,
    backgroundColor: '#14B8A6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  saveBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  radioButtonSelected: {
    borderColor: '#14B8A6',
    backgroundColor: '#14B8A6',
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  planPeriod: {
    fontSize: 14,
    color: '#6B7280',
  },
  trialCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.4)',
    backgroundColor: 'rgba(254, 243, 199, 0.6)',
    padding: 16,
  },
  trialContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trialBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(251, 191, 36, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  trialDays: {
    fontSize: 18,
    fontWeight: '700',
    color: '#D97706',
  },
  trialTextContainer: {
    flex: 1,
  },
  trialTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 2,
  },
  trialSubtitle: {
    fontSize: 14,
    color: '#B45309',
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    paddingTop: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(209, 213, 219, 0.3)',
  },
  ctaButton: {
    borderRadius: 16,
    overflow: 'hidden',
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
  },
  ctaButtonSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  restoreButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  restoreText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  legalContainer: {
    alignItems: 'center',
  },
  legalLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legalLink: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'underline',
  },
  legalDot: {
    fontSize: 12,
    color: '#9CA3AF',
    marginHorizontal: 12,
  },
  legalDisclaimer: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  orb1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(20, 184, 166, 0.15)',
    top: -50,
    right: -50,
  },
  orb2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(45, 212, 191, 0.1)',
    bottom: 100,
    left: -30,
  },
  orb3: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(94, 234, 212, 0.12)',
    top: '40%',
    right: 20,
  },
});

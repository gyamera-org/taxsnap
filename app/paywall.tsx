import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Linking,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Scan, Sparkles, Heart, Check, LockOpen } from 'lucide-react-native';
import { useRevenueCat } from '@/context/revenuecat-provider';
import { APP_URLS } from '@/lib/config/urls';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner-native';

// Fallback prices if RevenueCat fails to load
const FALLBACK_MONTHLY_PRICE = 3.99;
const FALLBACK_YEARLY_PRICE = 29.99;
const TRIAL_DAYS = 7;

type PlanType = 'monthly' | 'yearly';

export default function PaywallScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('yearly');
  const { offerings, purchasePackage, restorePurchases } = useRevenueCat();

  const features = [
    { icon: Scan, title: t('paywall.features.unlimitedScans.title') },
    { icon: Sparkles, title: t('paywall.features.aiAnalysis.title') },
    { icon: Heart, title: t('paywall.features.personalized.title') },
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
      router.replace('/(tabs)/home');
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
    setIsLoading(true);
    try {
      const customerInfo = await restorePurchases();
      const hasActiveSubscription = Object.keys(customerInfo.entitlements.active).length > 0;
      if (hasActiveSubscription) {
        toast.success(t('paywall.restoreSuccess'));
        router.replace('/(tabs)/home');
      } else {
        toast.info(t('paywall.restoreNone'));
      }
    } catch {
      toast.error(t('paywall.restoreError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Background gradient */}
      <LinearGradient
        colors={['#F0FDFA', '#CCFBF1', '#99F6E4', '#F0FDFA']}
        locations={[0, 0.3, 0.7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Floating orbs for liquid glass effect */}
      <Animated.View entering={FadeIn.delay(100).duration(1000)} style={styles.orb1} />
      <Animated.View entering={FadeIn.delay(200).duration(1000)} style={styles.orb2} />
      <Animated.View entering={FadeIn.delay(300).duration(1000)} style={styles.orb3} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.headerSection}>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={['#14B8A6', '#0D9488', '#0F766E']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconGradient}
              >
                <LockOpen size={28} color="#FFFFFF" />
              </LinearGradient>
            </View>
            <Text style={styles.headerTitle}>{t('paywall.title')}</Text>
            <Text style={styles.headerSubtitle}>{t('paywall.subtitle')}</Text>
          </View>

          {/* Compact Features - Liquid Glass Style */}
          <View style={styles.featuresCard}>
            {features.map((feature, index) => (
              <View
                key={feature.title}
                style={[
                  styles.featureItem,
                  index < features.length - 1 && styles.featureItemBorder,
                ]}
              >
                <View style={styles.featureIconContainer}>
                  <feature.icon size={16} color="#14B8A6" />
                </View>
                <Text style={styles.featureTitle} numberOfLines={1}>{feature.title}</Text>
                <Check size={16} color="#14B8A6" />
              </View>
            ))}
          </View>

          {/* Plan Selection - Row Layout */}
          <View style={styles.plansContainer}>
            {/* Yearly Plan */}
            <Pressable onPress={() => setSelectedPlan('yearly')} style={styles.planWrapper}>
              <View style={[styles.planCard, selectedPlan === 'yearly' && styles.planCardSelected]}>
                {/* Save Badge */}
                {savingsPercent > 0 && (
                  <View style={styles.saveBadge}>
                    <Text style={styles.saveBadgeText}>
                      {t('paywall.plans.save', { percent: savingsPercent })}
                    </Text>
                  </View>
                )}
                <View
                  style={[
                    styles.radioButton,
                    selectedPlan === 'yearly' && styles.radioButtonSelected,
                  ]}
                >
                  {selectedPlan === 'yearly' && <Check size={10} color="#fff" />}
                </View>
                <Text style={styles.planName}>{t('paywall.plans.yearly')}</Text>
                <Text style={styles.planPriceTotal}>{yearlyPriceString}</Text>
                <Text style={styles.planPeriod}>
                  {yearlyPerMonthString}{t('paywall.plans.perMonth')}
                </Text>
              </View>
            </Pressable>

            {/* Monthly Plan */}
            <Pressable onPress={() => setSelectedPlan('monthly')} style={styles.planWrapper}>
              <View style={[styles.planCard, selectedPlan === 'monthly' && styles.planCardSelected]}>
                <View
                  style={[
                    styles.radioButton,
                    selectedPlan === 'monthly' && styles.radioButtonSelected,
                  ]}
                >
                  {selectedPlan === 'monthly' && <Check size={10} color="#fff" />}
                </View>
                <Text style={styles.planName}>{t('paywall.plans.monthly')}</Text>
                <Text style={styles.planPriceTotal}>{monthlyPriceString}</Text>
                <Text style={styles.planPeriod}>{t('paywall.plans.perMonthFull')}</Text>
              </View>
            </Pressable>
          </View>

          {/* Trial Info - Only for Yearly */}
          {selectedPlan === 'yearly' && (
            <View style={styles.trialCard}>
              <View style={styles.trialIconContainer}>
                <Text style={styles.trialIconText}>{TRIAL_DAYS}</Text>
              </View>
              <View style={styles.trialContent}>
                <Text style={styles.trialTitle}>
                  {t('paywall.trial.days', { days: TRIAL_DAYS })}
                </Text>
                <Text style={styles.trialSubtitle}>{t('paywall.trial.subtitle')}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          {/* CTA Button */}
          <Pressable
            onPress={handleSubscribe}
            disabled={isLoading}
            style={[styles.ctaButton, isLoading && styles.buttonDisabled]}
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
              <View style={styles.ctaContent}>
                <Text style={styles.ctaButtonText}>
                  {selectedPlan === 'yearly'
                    ? t('paywall.cta.startTrial', { days: TRIAL_DAYS })
                    : t('paywall.cta.subscribeNow')}
                </Text>
                <Text style={styles.ctaSubtext}>
                  {selectedPlan === 'yearly'
                    ? t('paywall.cta.thenPrice', { price: currentPriceString })
                    : t('paywall.cta.perMonth', { price: currentPriceString })}
                </Text>
              </View>
            )}
          </Pressable>

          {/* Legal Links */}
          <View style={styles.legalContainer}>
            <View style={styles.legalLinks}>
              <Pressable onPress={() => Linking.openURL(APP_URLS.terms)}>
                <Text style={styles.legalLink}>{t('paywall.legal.terms')}</Text>
              </Pressable>
              <Text style={styles.legalDot}>|</Text>
              <Pressable onPress={() => Linking.openURL(APP_URLS.privacy)}>
                <Text style={styles.legalLink}>{t('paywall.legal.privacy')}</Text>
              </Pressable>
              <Text style={styles.legalDot}>|</Text>
              <Pressable onPress={handleRestore} disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator size="small" color="#9CA3AF" />
                ) : (
                  <Text style={styles.legalLink}>{t('paywall.restore')}</Text>
                )}
              </Pressable>
            </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    marginBottom: 12,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  iconGradient: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  featuresCard: {
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    padding: 12,
    marginBottom: 16,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  featureItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.6)',
  },
  featureIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(20, 184, 166, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  plansContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  planWrapper: {
    flex: 1,
  },
  planCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    padding: 14,
    alignItems: 'center',
  },
  planCardSelected: {
    borderColor: '#14B8A6',
    backgroundColor: 'rgba(240, 253, 250, 0.6)',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#14B8A6',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderBottomLeftRadius: 10,
    borderTopRightRadius: 14,
  },
  saveBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  radioButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  radioButtonSelected: {
    borderColor: '#14B8A6',
    backgroundColor: '#14B8A6',
  },
  planName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  planPriceTotal: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  planPeriod: {
    fontSize: 12,
    color: '#6B7280',
  },
  trialCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    padding: 12,
    marginBottom: 12,
  },
  trialIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  trialIconText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
  },
  trialContent: {
    flex: 1,
  },
  trialTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  trialSubtitle: {
    fontSize: 11,
    color: '#6B7280',
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  ctaButton: {
    borderRadius: 14,
    overflow: 'hidden',
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  ctaContent: {
    alignItems: 'center',
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  ctaSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  legalContainer: {
    alignItems: 'center',
  },
  legalLinks: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legalLink: {
    fontSize: 11,
    color: '#9CA3AF',
    textDecorationLine: 'underline',
  },
  legalDot: {
    fontSize: 11,
    color: '#9CA3AF',
    marginHorizontal: 6,
  },
  orb1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(20, 184, 166, 0.12)',
    top: -60,
    right: -60,
  },
  orb2: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(45, 212, 191, 0.1)',
    bottom: 180,
    left: -50,
  },
  orb3: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(94, 234, 212, 0.08)',
    top: '35%',
    right: -25,
  },
});

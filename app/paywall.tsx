import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Linking,
  StatusBar,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Sparkles, Zap, Shield, Cloud, Star, Crown, Check } from 'lucide-react-native';
import { useRevenueCat } from '@/context/revenuecat-provider';
import { APP_URLS } from '@/lib/config/urls';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner-native';
import { useResponsive } from '@/lib/utils/responsive';
import { useThemedColors } from '@/lib/utils/theme';

// Fallback prices if RevenueCat fails to load
const FALLBACK_MONTHLY_PRICE = 2.99;
const FALLBACK_YEARLY_PRICE = 29.99;
const FALLBACK_YEARLY_PER_MONTH = 2.5;
const TRIAL_DAYS = 3;

type PlanType = 'monthly' | 'yearly';

export default function PaywallScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const colors = useThemedColors();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('yearly');
  const { offerings, purchasePackage, restorePurchases } = useRevenueCat();
  const { isTablet, contentMaxWidth } = useResponsive();

  const features = [
    {
      icon: Sparkles,
      title: t('paywall.features.feature1.title'),
      description: t('paywall.features.feature1.description'),
    },
    {
      icon: Zap,
      title: t('paywall.features.feature2.title'),
      description: t('paywall.features.feature2.description'),
    },
    {
      icon: Shield,
      title: t('paywall.features.feature3.title'),
      description: t('paywall.features.feature3.description'),
    },
    {
      icon: Cloud,
      title: t('paywall.features.feature4.title'),
      description: t('paywall.features.feature4.description'),
    },
    {
      icon: Star,
      title: t('paywall.features.feature5.title'),
      description: t('paywall.features.feature5.description'),
    },
    {
      icon: Crown,
      title: t('paywall.features.feature6.title'),
      description: t('paywall.features.feature6.description'),
    },
  ];

  // Get packages from RevenueCat offerings
  const monthlyPackage = offerings?.current?.monthly;
  const yearlyPackage = offerings?.current?.annual;

  // Use RevenueCat formatted price strings (includes currency symbol)
  const monthlyPriceString = monthlyPackage?.product.priceString ?? `$${FALLBACK_MONTHLY_PRICE}`;
  const yearlyPriceString = yearlyPackage?.product.priceString ?? `$${FALLBACK_YEARLY_PRICE}`;
  const yearlyPerMonthString =
    yearlyPackage?.product.pricePerMonthString ?? `$${FALLBACK_YEARLY_PER_MONTH.toFixed(2)}`;

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

  // Theme-aware gradient colors
  const gradientColors = colors.isDark
    ? (['#0D0D0D', '#1A1A1A', '#262626', '#0D0D0D'] as const)
    : (['#F0FDFA', '#CCFBF1', '#99F6E4', '#F0FDFA'] as const);

  // Dynamic styles for responsive layout and theming
  const dynamicStyles = {
    contentWrapper: {
      maxWidth: isTablet ? contentMaxWidth : undefined,
      alignSelf: isTablet ? ('center' as const) : undefined,
      width: '100%' as const,
    },
    headerTitle: {
      color: colors.text,
    },
    featuresCard: {
      backgroundColor: colors.isDark ? 'rgba(26, 26, 26, 0.8)' : 'rgba(255, 255, 255, 0.6)',
      borderColor: colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.8)',
    },
    featureItemBorder: {
      borderBottomColor: colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
    },
    featureIconContainer: {
      backgroundColor: colors.primaryLight,
    },
    featureTitle: {
      color: colors.text,
    },
    featureDescription: {
      color: colors.textSecondary,
    },
    planCard: {
      borderColor: colors.isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.7)',
      backgroundColor: colors.isDark ? 'rgba(26, 26, 26, 0.6)' : 'rgba(255, 255, 255, 0.5)',
    },
    planCardSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.isDark ? 'rgba(13, 148, 136, 0.15)' : 'rgba(240, 253, 250, 0.7)',
    },
    saveBadge: {
      backgroundColor: colors.primary,
    },
    radioButton: {
      borderColor: colors.isDark ? '#52525B' : '#D1D5DB',
    },
    radioButtonSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary,
    },
    planName: {
      color: colors.text,
    },
    planPriceTotal: {
      color: colors.text,
    },
    planPeriod: {
      color: colors.textSecondary,
    },
    continueButtonText: {
      color: colors.textSecondary,
    },
    legalLink: {
      color: colors.textMuted,
    },
    legalDot: {
      color: colors.textMuted,
    },
    orb1: {
      backgroundColor: colors.isDark ? 'rgba(13, 148, 136, 0.08)' : 'rgba(20, 184, 166, 0.12)',
    },
    orb2: {
      backgroundColor: colors.isDark ? 'rgba(13, 148, 136, 0.06)' : 'rgba(45, 212, 191, 0.1)',
    },
    orb3: {
      backgroundColor: colors.isDark ? 'rgba(13, 148, 136, 0.04)' : 'rgba(94, 234, 212, 0.08)',
    },
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={colors.isDark ? 'light-content' : 'dark-content'} />

      {/* Background gradient */}
      <LinearGradient
        colors={gradientColors}
        locations={[0, 0.3, 0.7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Floating orbs for liquid glass effect */}
      <Animated.View
        entering={FadeIn.delay(100).duration(1000)}
        style={[styles.orb1, dynamicStyles.orb1]}
      />
      <Animated.View
        entering={FadeIn.delay(200).duration(1000)}
        style={[styles.orb2, dynamicStyles.orb2]}
      />
      <Animated.View
        entering={FadeIn.delay(300).duration(1000)}
        style={[styles.orb3, dynamicStyles.orb3]}
      />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.content, dynamicStyles.contentWrapper]}>
            {/* Header */}
            <View style={styles.headerSection}>
              <Text
                style={[styles.headerTitle, isTablet && styles.headerTitleTablet, dynamicStyles.headerTitle]}
              >
                {t('paywall.title')}
              </Text>
            </View>

            {/* Features Card */}
            <View style={[styles.featuresCard, dynamicStyles.featuresCard]}>
              {features.map((feature, index) => (
                <View
                  key={index}
                  style={[
                    styles.featureItem,
                    index < features.length - 1 && styles.featureItemBorder,
                    index < features.length - 1 && dynamicStyles.featureItemBorder,
                  ]}
                >
                  <View style={[styles.featureIconContainer, dynamicStyles.featureIconContainer]}>
                    <feature.icon size={20} color={colors.primary} />
                  </View>
                  <View style={styles.featureTextContainer}>
                    <Text style={[styles.featureTitle, dynamicStyles.featureTitle]} numberOfLines={1}>
                      {feature.title}
                    </Text>
                    <Text style={[styles.featureDescription, dynamicStyles.featureDescription]} numberOfLines={2}>
                      {feature.description}
                    </Text>
                  </View>
                  <Check size={18} color={colors.primary} />
                </View>
              ))}
            </View>

            {/* Plan Selection - Row Layout */}
            <View style={[styles.plansContainer, isTablet && styles.plansContainerTablet]}>
              {/* Yearly Plan */}
              <Pressable onPress={() => setSelectedPlan('yearly')} style={styles.planWrapper}>
                <View
                  style={[
                    styles.planCard,
                    dynamicStyles.planCard,
                    selectedPlan === 'yearly' && styles.planCardSelected,
                    selectedPlan === 'yearly' && dynamicStyles.planCardSelected,
                  ]}
                >
                  {/* Save Badge */}
                  {savingsPercent > 0 && (
                    <View style={[styles.saveBadge, dynamicStyles.saveBadge]}>
                      <Text style={styles.saveBadgeText} numberOfLines={1}>
                        {t('paywall.plans.save', { percent: savingsPercent })}
                      </Text>
                    </View>
                  )}
                  <View
                    style={[
                      styles.radioButton,
                      dynamicStyles.radioButton,
                      selectedPlan === 'yearly' && styles.radioButtonSelected,
                      selectedPlan === 'yearly' && dynamicStyles.radioButtonSelected,
                    ]}
                  >
                    {selectedPlan === 'yearly' && <Check size={10} color="#fff" />}
                  </View>
                  <Text style={[styles.planName, dynamicStyles.planName]} numberOfLines={1}>
                    {t('paywall.plans.yearly')}
                  </Text>
                  <Text style={[styles.planPriceTotal, dynamicStyles.planPriceTotal]} numberOfLines={1} adjustsFontSizeToFit>
                    {yearlyPerMonthString}
                    {t('paywall.plans.perMonth')}
                  </Text>
                  <Text style={[styles.planPeriod, dynamicStyles.planPeriod]} numberOfLines={1}>
                    {yearlyPriceString}
                    {t('paywall.plans.perYear')}
                  </Text>
                </View>
              </Pressable>

              {/* Monthly Plan */}
              <Pressable onPress={() => setSelectedPlan('monthly')} style={styles.planWrapper}>
                <View
                  style={[
                    styles.planCard,
                    dynamicStyles.planCard,
                    selectedPlan === 'monthly' && styles.planCardSelected,
                    selectedPlan === 'monthly' && dynamicStyles.planCardSelected,
                  ]}
                >
                  <View
                    style={[
                      styles.radioButton,
                      dynamicStyles.radioButton,
                      selectedPlan === 'monthly' && styles.radioButtonSelected,
                      selectedPlan === 'monthly' && dynamicStyles.radioButtonSelected,
                    ]}
                  >
                    {selectedPlan === 'monthly' && <Check size={10} color="#fff" />}
                  </View>
                  <Text style={[styles.planName, dynamicStyles.planName]} numberOfLines={1}>
                    {t('paywall.plans.monthly')}
                  </Text>
                  <Text style={[styles.planPriceTotal, dynamicStyles.planPriceTotal]} numberOfLines={1} adjustsFontSizeToFit>
                    {monthlyPriceString}
                  </Text>
                  <Text style={[styles.planPeriod, dynamicStyles.planPeriod]} numberOfLines={1}>
                    {t('paywall.plans.perMonthFull')}
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Section */}
        <View style={[styles.bottomSection, dynamicStyles.contentWrapper]}>
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
                <Text style={[styles.legalLink, dynamicStyles.legalLink]}>{t('paywall.legal.terms')}</Text>
              </Pressable>
              <Text style={[styles.legalDot, dynamicStyles.legalDot]}>|</Text>
              <Pressable onPress={() => Linking.openURL(APP_URLS.privacy)}>
                <Text style={[styles.legalLink, dynamicStyles.legalLink]}>{t('paywall.legal.privacy')}</Text>
              </Pressable>
              <Text style={[styles.legalDot, dynamicStyles.legalDot]}>|</Text>
              <Pressable onPress={handleRestore} disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator size="small" color={colors.textMuted} />
                ) : (
                  <Text style={[styles.legalLink, dynamicStyles.legalLink]}>{t('paywall.restore')}</Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  headerSection: {
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerTitleTablet: {
    fontSize: 28,
  },
  featuresCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  featureItemBorder: {
    borderBottomWidth: 1,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  plansContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  plansContainerTablet: {
    gap: 16,
  },
  planWrapper: {
    flex: 1,
  },
  planCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    padding: 14,
    alignItems: 'center',
  },
  planCardSelected: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomLeftRadius: 10,
    borderTopRightRadius: 14,
  },
  saveBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  radioButtonSelected: {},
  planName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  planPriceTotal: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 2,
  },
  planPeriod: {
    fontSize: 12,
  },
  trialText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
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
    fontSize: 17,
  },
  ctaSubtext: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 13,
    marginTop: 2,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  continueButton: {
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  continueButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  legalContainer: {
    alignItems: 'center',
  },
  legalLinks: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legalLink: {
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  legalDot: {
    fontSize: 12,
    marginHorizontal: 8,
  },
  orb1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    top: -60,
    right: -60,
  },
  orb2: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    bottom: 180,
    left: -50,
  },
  orb3: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    top: '35%',
    right: -25,
  },
});

import { useState, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Linking,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Receipt, Tags, Calculator, Shield, FileText, Infinity, Check } from 'lucide-react-native';
import { useRevenueCat } from '@/context/revenuecat-provider';
import { APP_URLS } from '@/lib/config/urls';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner-native';
import { useResponsive } from '@/lib/utils/responsive';
import { useThemedColors } from '@/lib/utils/theme';
import { PRIMARY } from '@/lib/theme/colors';
import {
  pricingConfig,
  getEnabledPlans,
  getDefaultSelectedPlan,
  calculateSavingsPercent,
  type PricingPlan,
} from '@/lib/config/app.config';

export default function PaywallScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const colors = useThemedColors();
  const [isLoading, setIsLoading] = useState(false);
  const enabledPlans = useMemo(() => getEnabledPlans(), []);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan>(getDefaultSelectedPlan());
  const [freeTrialEnabled, setFreeTrialEnabled] = useState(true);
  const { offerings, purchasePackage, restorePurchases } = useRevenueCat();
  const { isTablet, contentMaxWidth } = useResponsive();

  const features = [
    {
      icon: Receipt,
      title: t('paywall.features.feature1.title'),
      description: t('paywall.features.feature1.description'),
    },
    {
      icon: Tags,
      title: t('paywall.features.feature2.title'),
      description: t('paywall.features.feature2.description'),
    },
    {
      icon: Calculator,
      title: t('paywall.features.feature3.title'),
      description: t('paywall.features.feature3.description'),
    },
    {
      icon: Shield,
      title: t('paywall.features.feature4.title'),
      description: t('paywall.features.feature4.description'),
    },
    {
      icon: FileText,
      title: t('paywall.features.feature5.title'),
      description: t('paywall.features.feature5.description'),
    },
    {
      icon: Infinity,
      title: t('paywall.features.feature6.title'),
      description: t('paywall.features.feature6.description'),
    },
  ];

  // Map plan IDs to RevenueCat package keys
  const getRevenueCatPackage = (planId: PricingPlan) => {
    const current = offerings?.current;
    if (!current) return undefined;

    switch (planId) {
      case 'weekly':
        return current.weekly;
      case 'monthly':
        return current.monthly;
      case 'yearly':
        return current.annual;
      case 'lifetime':
        return current.lifetime;
      default:
        return undefined;
    }
  };

  // Get package data for enabled plans
  const planPackages = useMemo(() => {
    return enabledPlans.map((plan) => {
      const pkg = getRevenueCatPackage(plan.id);
      return {
        ...plan,
        package: pkg,
        priceString: pkg?.product.priceString ?? '',
        price: pkg?.product.price ?? 0,
        pricePerMonthString: pkg?.product.pricePerMonthString ?? '',
      };
    });
  }, [enabledPlans, offerings]);

  // Get selected plan config
  const selectedPlanConfig = pricingConfig.plans[selectedPlan]?.config;
  const selectedPackage = getRevenueCatPackage(selectedPlan);
  const selectedPriceString = selectedPackage?.product.priceString ?? '';

  // Calculate savings for a plan
  const getSavingsPercent = (planId: PricingPlan): number => {
    const planConfig = pricingConfig.plans[planId]?.config;
    if (!planConfig?.showSavings || !planConfig.savingsComparedTo) return 0;

    const planPackage = getRevenueCatPackage(planId);
    const comparisonPackage = getRevenueCatPackage(planConfig.savingsComparedTo);

    if (!planPackage || !comparisonPackage) return 0;

    const planPrice = planPackage.product.price;
    const comparisonPrice = comparisonPackage.product.price;

    // Determine period multiplier based on plan type
    const periodWeeks: Record<PricingPlan, number> = {
      weekly: 1,
      monthly: 4,
      yearly: 52,
      lifetime: 0, // Lifetime doesn't have a period
    };

    return calculateSavingsPercent(planPrice, comparisonPrice, periodWeeks[planId]);
  };

  const handleSubscribe = async () => {
    const packageToPurchase = selectedPackage;

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

  // Check if trial is available for selected plan
  const hasTrialAvailable = selectedPlan === 'weekly' && freeTrialEnabled && selectedPlanConfig?.hasTrial;

  // Get CTA text based on selected plan
  const getCtaText = () => {
    if (hasTrialAvailable) {
      return t('paywall.cta.startTrial');
    }
    if (selectedPlan === 'lifetime') {
      return t('paywall.cta.buyNow');
    }
    return t('paywall.cta.subscribeNow');
  };

  const getCtaSubtext = () => {
    if (hasTrialAvailable) {
      return t('paywall.cta.thenPrice', { price: selectedPriceString });
    }
    if (selectedPlan === 'lifetime') {
      return t('paywall.cta.oneTimePayment');
    }
    return t(`paywall.cta.per${selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)}`, {
      price: selectedPriceString,
    });
  };

  // Theme-aware gradient colors using primary color
  const gradientColors = colors.isDark
    ? (['#0D0D0D', '#1A1A1A', '#262626', '#0D0D0D'] as const)
    : ([`${PRIMARY}08`, `${PRIMARY}15`, `${PRIMARY}20`, `${PRIMARY}08`] as const);

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
      backgroundColor: colors.isDark ? `${PRIMARY}20` : `${PRIMARY}10`,
    },
    saveBadge: {
      backgroundColor: '#E53935',
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
      backgroundColor: colors.isDark ? `${PRIMARY}15` : `${PRIMARY}20`,
    },
    orb2: {
      backgroundColor: colors.isDark ? `${PRIMARY}10` : `${PRIMARY}18`,
    },
    orb3: {
      backgroundColor: colors.isDark ? `${PRIMARY}08` : `${PRIMARY}15`,
    },
  };

  // Render a plan card
  const renderPlanCard = (planData: (typeof planPackages)[0]) => {
    const isSelected = selectedPlan === planData.id;
    const savings = getSavingsPercent(planData.id);
    const badgeText = planData.badge ? t(`paywall.plans.badges.${planData.badge}`) : null;

    return (
      <Pressable
        key={planData.id}
        onPress={() => setSelectedPlan(planData.id)}
        style={styles.planWrapper}
      >
        <View
          style={[
            styles.planCard,
            dynamicStyles.planCard,
            isSelected && styles.planCardSelected,
            isSelected && dynamicStyles.planCardSelected,
          ]}
        >
          {/* Badge (savings or custom badge) */}
          {(savings > 0 || badgeText) && (
            <View style={[styles.saveBadge, dynamicStyles.saveBadge]}>
              <Text style={styles.saveBadgeText} numberOfLines={1}>
                {savings > 0 ? t('paywall.plans.save', { percent: savings }) : badgeText}
              </Text>
            </View>
          )}

          <Text style={[styles.planName, dynamicStyles.planName]} numberOfLines={1}>
            {t(`paywall.plans.${planData.id}`)}
          </Text>

          <Text
            style={[styles.planPriceTotal, dynamicStyles.planPriceTotal]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {planData.id === 'yearly' && planData.pricePerMonthString
              ? `${planData.pricePerMonthString}${t('paywall.plans.perMonth')}`
              : planData.priceString}
          </Text>

          <Text style={[styles.planPeriod, dynamicStyles.planPeriod]} numberOfLines={1}>
            {planData.id === 'yearly'
              ? `${planData.priceString}${t('paywall.plans.perYear')}`
              : planData.id === 'lifetime'
                ? t('paywall.plans.oneTime')
                : t(`paywall.plans.per${planData.id.charAt(0).toUpperCase() + planData.id.slice(1)}`)}
          </Text>
        </View>
      </Pressable>
    );
  };

  // Check if trial can be enabled for the selected plan
  const canEnableTrial = selectedPlan === 'weekly' && selectedPlanConfig?.hasTrial;
  const isTrialToggleEnabled = canEnableTrial && freeTrialEnabled;

  // Render free trial toggle (always visible, but disabled for yearly)
  const renderFreeTrialToggle = () => {
    return (
      <Pressable
        style={[
          styles.trialToggleContainer,
          dynamicStyles.planCard,
          !canEnableTrial && styles.trialToggleDisabled,
        ]}
        onPress={() => canEnableTrial && setFreeTrialEnabled(!freeTrialEnabled)}
        disabled={!canEnableTrial}
      >
        <View style={styles.trialToggleContent}>
          <Text
            style={[
              styles.trialToggleLabel,
              dynamicStyles.planName,
              !canEnableTrial && { opacity: 0.5 },
            ]}
          >
            {t('paywall.plans.enableFreeTrial')}
          </Text>
        </View>
        <View
          style={[
            styles.trialToggleSwitch,
            isTrialToggleEnabled && styles.trialToggleSwitchOn,
            {
              backgroundColor: isTrialToggleEnabled
                ? colors.primary
                : colors.isDark
                  ? '#3A3A3C'
                  : '#E5E5EA',
              opacity: canEnableTrial ? 1 : 0.5,
            },
          ]}
        >
          <View
            style={[
              styles.trialToggleThumb,
              isTrialToggleEnabled && styles.trialToggleThumbOn,
            ]}
          />
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
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
                style={[
                  styles.headerTitle,
                  isTablet && styles.headerTitleTablet,
                  dynamicStyles.headerTitle,
                ]}
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
                    <Text
                      style={[styles.featureDescription, dynamicStyles.featureDescription]}
                      numberOfLines={2}
                    >
                      {feature.description}
                    </Text>
                  </View>
                  <Check size={18} color={colors.primary} />
                </View>
              ))}
            </View>

            {/* Plan Selection */}
            <View style={[styles.plansContainer, isTablet && styles.plansContainerTablet]}>
              {planPackages.map(renderPlanCard)}
            </View>

            {/* Free Trial Toggle */}
            {renderFreeTrialToggle()}
          </View>
        </ScrollView>

        {/* Bottom Section */}
        <View style={[styles.bottomSection, dynamicStyles.contentWrapper]}>
          {/* CTA Button */}
          <Pressable
            onPress={handleSubscribe}
            disabled={isLoading}
            style={[styles.ctaButton, { shadowColor: PRIMARY }, isLoading && styles.buttonDisabled]}
          >
            <LinearGradient
              colors={[PRIMARY, `${PRIMARY}E6`, `${PRIMARY}CC`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <View style={styles.ctaContent}>
                <Text style={styles.ctaButtonText}>{getCtaText()}</Text>
                <Text style={styles.ctaSubtext}>{getCtaSubtext()}</Text>
              </View>
            )}
          </Pressable>

          {/* Continue for Free */}
          {pricingConfig.showContinueForFree && (
            <Pressable
              onPress={() => router.replace('/(tabs)/home')}
              style={styles.continueButton}
              disabled={isLoading}
            >
              <Text style={[styles.continueButtonText, dynamicStyles.continueButtonText]}>
                {t('paywall.continueForFree')}
              </Text>
            </Pressable>
          )}

          {/* Legal Links */}
          <View style={styles.legalContainer}>
            <View style={styles.legalLinks}>
              <Pressable onPress={() => Linking.openURL(APP_URLS.terms)}>
                <Text style={[styles.legalLink, dynamicStyles.legalLink]}>
                  {t('paywall.legal.terms')}
                </Text>
              </Pressable>
              <Text style={[styles.legalDot, dynamicStyles.legalDot]}>|</Text>
              <Pressable onPress={() => Linking.openURL(APP_URLS.privacy)}>
                <Text style={[styles.legalLink, dynamicStyles.legalLink]}>
                  {t('paywall.legal.privacy')}
                </Text>
              </Pressable>
              {pricingConfig.showRestorePurchases && (
                <>
                  <Text style={[styles.legalDot, dynamicStyles.legalDot]}>|</Text>
                  <Pressable onPress={handleRestore} disabled={isLoading}>
                    {isLoading ? (
                      <ActivityIndicator size="small" color={colors.textMuted} />
                    ) : (
                      <Text style={[styles.legalLink, dynamicStyles.legalLink]}>
                        {t('paywall.restore')}
                      </Text>
                    )}
                  </Pressable>
                </>
              )}
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
    flexWrap: 'wrap',
  },
  plansContainerTablet: {
    gap: 16,
  },
  planWrapper: {
    flex: 1,
    minWidth: 140,
  },
  planCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    padding: 14,
    paddingTop: 28,
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
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderBottomLeftRadius: 12,
    borderTopRightRadius: 14,
  },
  saveBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
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
  trialToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  trialToggleDisabled: {
    opacity: 0.6,
  },
  trialToggleContent: {
    flex: 1,
  },
  trialToggleLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  trialToggleSwitch: {
    width: 51,
    height: 31,
    borderRadius: 16,
    padding: 2,
    justifyContent: 'center',
  },
  trialToggleSwitchOn: {},
  trialToggleThumb: {
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  trialToggleThumbOn: {
    alignSelf: 'flex-end',
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

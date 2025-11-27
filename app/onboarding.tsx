import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Keyboard, StatusBar, Platform, ActivityIndicator, Linking, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  SlideInRight,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { ChevronLeft, CreditCard, Layers, TrendingDown, Zap } from 'lucide-react-native';
import { markOnboardingComplete } from './index';
import { useAuth } from '@/context/auth-provider';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { AppleIcon, GoogleIcon } from '@/components/icons/tab-icons';
import {
  useOptimizedDebtCalculations,
  useCurrencyInput,
  formatMoney,
  formatDuration,
} from '@/lib/hooks';
import {
  OnboardingStep,
  CurrencyInput,
  PercentInput,
  OptionCard,
  StrategyCard,
  GradientButton,
} from '@/components/onboarding';

type Step = 'debt' | 'rate' | 'payment' | 'type' | 'reveal' | 'signup';
type DebtType = 'single' | 'multiple';
type Strategy = 'avalanche' | 'snowball';

const ONBOARDING_DATA_KEY = '@debt_free_onboarding_data';

interface OnboardingData {
  totalDebt: number;
  interestRate: number;
  monthlyPayment: number;
  debtType: DebtType;
  strategy: Strategy;
  totalInterest: number;
  payoffMonths: number;
  optimizedPayment: number;
  optimizedMonths: number;
  interestSaved: number;
  monthsSaved: number;
  debtFreeDate: string;
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { signInWithApple, signInWithGoogle, loading: authLoading } = useAuth();

  // Step state
  const [step, setStep] = useState<Step>('debt');

  // Input states
  const debtInput = useCurrencyInput();
  const paymentInput = useCurrencyInput();
  const [interestRate, setInterestRate] = useState('');
  const [debtType, setDebtType] = useState<DebtType | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy>('avalanche');

  // Auth loading states
  const [appleLoading, setAppleLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Animation values
  const revealScale = useSharedValue(0);

  // Parse rate
  const rate = parseFloat(interestRate) || 0;

  // Calculations using the hook
  const calculations = useOptimizedDebtCalculations({
    principal: debtInput.numericValue,
    annualRate: rate / 100,
    monthlyPayment: paymentInput.numericValue,
  });

  const {
    payoffMonths,
    totalInterest,
    minPaymentRequired,
    paymentCoversInterest,
    debtFreeDate,
    optimizedPayment,
    optimizedMonths,
    interestSaved,
    monthsSaved,
  } = calculations;

  const isLoading = authLoading || appleLoading || googleLoading;

  // Validation
  const canProceedFromDebt = debtInput.numericValue > 0;
  const canProceedFromRate = rate > 0 && rate <= 100;
  const canProceedFromPayment = paymentInput.numericValue > 0;
  const canProceedFromType = debtType !== null;

  // Progress
  const steps: Step[] = ['debt', 'rate', 'payment', 'type', 'reveal', 'signup'];
  const progress = steps.indexOf(step);

  const goBack = () => {
    const i = steps.indexOf(step);
    if (i > 0) {
      setStep(steps[i - 1]);
    } else {
      router.back();
    }
  };

  const goToStep = (nextStep: Step) => {
    Keyboard.dismiss();
    setStep(nextStep);

    if (nextStep === 'reveal') {
      setTimeout(() => {
        revealScale.value = withDelay(200, withTiming(1, { duration: 600, easing: Easing.out(Easing.back(1.2)) }));
      }, 100);
    }
  };

  const saveOnboardingData = async () => {
    try {
      const data: OnboardingData = {
        totalDebt: debtInput.numericValue,
        interestRate: rate,
        monthlyPayment: paymentInput.numericValue,
        debtType: debtType || 'single',
        strategy: selectedStrategy,
        totalInterest,
        payoffMonths,
        optimizedPayment,
        optimizedMonths,
        interestSaved,
        monthsSaved,
        debtFreeDate: debtFreeDate.toISOString(),
      };
      await AsyncStorage.setItem(ONBOARDING_DATA_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving onboarding data:', error);
    }
  };

  const handleAppleAuth = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAppleLoading(true);
    try {
      await saveOnboardingData();
      await signInWithApple();
      await markOnboardingComplete();
    } catch (error) {
      console.error('Apple auth error:', error);
    } finally {
      setAppleLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setGoogleLoading(true);
    try {
      await saveOnboardingData();
      await signInWithGoogle();
      await markOnboardingComplete();
    } catch (error) {
      console.error('Google auth error:', error);
    } finally {
      setGoogleLoading(false);
    }
  };

  const revealAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: revealScale.value }],
    opacity: revealScale.value,
  }));

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View className="flex-1 bg-[#0F0F0F]">
        <StatusBar barStyle="light-content" />
        <SafeAreaView className="flex-1">
          {/* Progress Bar with Back Button */}
          <View className="flex-row items-center py-4 px-6">
            <Pressable onPress={goBack} className="flex-row items-center mr-4">
              <ChevronLeft size={24} color="#9CA3AF" />
            </Pressable>
            <View className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
              <View
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${((progress + 1) / steps.length) * 100}%` }}
              />
            </View>
          </View>

          {/* Step 1: Total Debt */}
          {step === 'debt' && (
            <OnboardingStep
              title="What's your total debt?"
              subtitle="Include all credit cards, loans, etc."
              withKeyboardAvoid
              footer={
                <GradientButton
                  onPress={() => goToStep('rate')}
                  disabled={!canProceedFromDebt}
                />
              }
            >
              <CurrencyInput
                value={debtInput.value}
                onChangeText={(text) => debtInput.setValue(text)}
                autoFocus
              />
            </OnboardingStep>
          )}

          {/* Step 2: Interest Rate */}
          {step === 'rate' && (
            <OnboardingStep
              title="What's your interest rate?"
              subtitle="The annual percentage rate (APR)"
              withKeyboardAvoid
              footer={
                <GradientButton
                  onPress={() => goToStep('payment')}
                  disabled={!canProceedFromRate}
                  animated={false}
                />
              }
            >
              <PercentInput
                value={interestRate}
                onChangeText={setInterestRate}
                autoFocus
                hint="Credit cards are typically 15-25%"
              />
            </OnboardingStep>
          )}

          {/* Step 3: Monthly Payment */}
          {step === 'payment' && (
            <OnboardingStep
              title="How much can you pay monthly?"
              subtitle="The amount you can comfortably afford"
              withKeyboardAvoid
              footer={
                <GradientButton
                  onPress={() => goToStep('type')}
                  disabled={!canProceedFromPayment}
                  animated={false}
                />
              }
            >
              <CurrencyInput
                value={paymentInput.value}
                onChangeText={(text) => paymentInput.setValue(text)}
                autoFocus
                hint={
                  debtInput.numericValue > 0 && rate > 0
                    ? `Minimum to cover interest: ${formatMoney(Math.ceil(minPaymentRequired + 1))}`
                    : 'per month'
                }
              />
            </OnboardingStep>
          )}

          {/* Step 4: Debt Type */}
          {step === 'type' && (
            <OnboardingStep
              title="How is your debt structured?"
              subtitle="This helps us find the best strategy"
              footer={
                <GradientButton
                  onPress={() => goToStep('reveal')}
                  disabled={!canProceedFromType}
                  label="See My Plan"
                  animated={false}
                />
              }
            >
              <Animated.View entering={FadeInUp.delay(300).duration(500)}>
                <View className="mb-4">
                  <OptionCard
                    selected={debtType === 'single'}
                    onSelect={() => setDebtType('single')}
                    icon={<CreditCard size={24} color={debtType === 'single' ? '#10B981' : '#9CA3AF'} />}
                    title="Single debt"
                    subtitle="One loan or credit card"
                  />
                </View>
                <OptionCard
                  selected={debtType === 'multiple'}
                  onSelect={() => setDebtType('multiple')}
                  icon={<Layers size={24} color={debtType === 'multiple' ? '#10B981' : '#9CA3AF'} />}
                  title="Multiple debts"
                  subtitle="Several cards or loans to manage"
                />
              </Animated.View>
            </OnboardingStep>
          )}

          {/* Step 5: Reveal */}
          {step === 'reveal' && (
            <Animated.View entering={SlideInRight.duration(300)} className="flex-1 px-6 justify-between pb-8">
              <View className="flex-1 justify-center">
                <Animated.Text
                  entering={FadeInUp.duration(400)}
                  className="text-gray-400 text-center mb-1 mt-4"
                >
                  {formatMoney(debtInput.numericValue)} at {rate}% paying {formatMoney(paymentInput.numericValue)}/mo
                </Animated.Text>
                <Animated.Text
                  entering={FadeInUp.delay(100).duration(400)}
                  className="text-white text-xl font-semibold text-center mb-4"
                >
                  You'll pay in interest
                </Animated.Text>

                <Animated.View style={revealAnimatedStyle} className="items-center mb-6">
                  <Text className="text-red-500 text-5xl font-black text-center">
                    {formatMoney(totalInterest)}
                  </Text>
                  <Text className="text-gray-500 text-sm mt-2">
                    {paymentCoversInterest
                      ? `Paid off in ${formatDuration(payoffMonths)}`
                      : "Payment doesn't cover interest!"}
                  </Text>
                </Animated.View>

                {/* Strategy Selection - Only for multiple debts */}
                {paymentCoversInterest && debtType === 'multiple' && (
                  <Animated.View entering={FadeInUp.delay(500).duration(500)}>
                    <Text className="text-white font-semibold text-center mb-3">
                      Choose your payoff strategy
                    </Text>
                    <View className="mb-3">
                      <StrategyCard
                        selected={selectedStrategy === 'avalanche'}
                        onSelect={() => setSelectedStrategy('avalanche')}
                        icon={<TrendingDown size={20} color={selectedStrategy === 'avalanche' ? '#10B981' : '#9CA3AF'} />}
                        title="Avalanche Method"
                        subtitle="Pay highest interest first"
                        metricLabel="Saves most money"
                        metricValue={formatMoney(interestSaved)}
                        badge={selectedStrategy === 'avalanche' ? 'BEST' : undefined}
                        accentColor="emerald"
                      />
                    </View>
                    <StrategyCard
                      selected={selectedStrategy === 'snowball'}
                      onSelect={() => setSelectedStrategy('snowball')}
                      icon={<Zap size={20} color={selectedStrategy === 'snowball' ? '#3B82F6' : '#9CA3AF'} />}
                      title="Snowball Method"
                      subtitle="Pay smallest balance first"
                      metricLabel="Faster wins, more motivation"
                      metricValue="Quick wins"
                      accentColor="blue"
                    />
                  </Animated.View>
                )}

                {/* Single debt - just show savings */}
                {paymentCoversInterest && debtType === 'single' && (
                  <Animated.View entering={FadeInUp.delay(500).duration(500)}>
                    <View className="rounded-2xl overflow-hidden">
                      <LinearGradient
                        colors={['#0f1f1a', '#0a1512']}
                        style={StyleSheet.absoluteFill}
                      />
                      <View className="p-5 border border-emerald-500/30 rounded-2xl">
                        <Text className="text-emerald-400 text-sm font-semibold mb-3">
                          PAY 20% MORE MONTHLY
                        </Text>
                        <View className="flex-row justify-between mb-2">
                          <Text className="text-gray-400">New payment</Text>
                          <Text className="text-white font-bold">{formatMoney(optimizedPayment)}/mo</Text>
                        </View>
                        <View className="flex-row justify-between mb-2">
                          <Text className="text-gray-400">Interest saved</Text>
                          <Text className="text-emerald-400 font-bold">{formatMoney(interestSaved)}</Text>
                        </View>
                        <View className="flex-row justify-between">
                          <Text className="text-gray-400">Time saved</Text>
                          <Text className="text-white font-bold">{formatDuration(monthsSaved)}</Text>
                        </View>
                      </View>
                    </View>
                  </Animated.View>
                )}
              </View>

              <GradientButton
                onPress={() => goToStep('signup')}
                label="Get My Plan"
                animated={false}
              />
            </Animated.View>
          )}

          {/* Step 6: Signup */}
          {step === 'signup' && (
            <Animated.View entering={SlideInRight.duration(300)} className="flex-1 px-6 justify-between pb-8">
              <View className="flex-1 justify-center">
                <Animated.View
                  entering={FadeInUp.delay(100).duration(500)}
                  className="items-center mb-10"
                >
                  <Text className="text-gray-400 text-lg mb-2">Your goal</Text>
                  <Text className="text-white text-3xl font-black text-center mb-1">
                    Debt-free by
                  </Text>
                  <Text className="text-emerald-400 text-4xl font-black">
                    {debtFreeDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </Text>
                </Animated.View>

                <Animated.View
                  entering={FadeInUp.delay(300).duration(500)}
                  className="rounded-2xl bg-white/5 p-5 mb-8"
                >
                  <View className="flex-row justify-between mb-3">
                    <Text className="text-gray-400">Total debt</Text>
                    <Text className="text-white font-bold">{formatMoney(debtInput.numericValue)}</Text>
                  </View>
                  <View className="flex-row justify-between mb-3">
                    <Text className="text-gray-400">Interest rate</Text>
                    <Text className="text-white font-bold">{rate}%</Text>
                  </View>
                  <View className="flex-row justify-between mb-3">
                    <Text className="text-gray-400">Your payment</Text>
                    <Text className="text-white font-bold">{formatMoney(paymentInput.numericValue)}/mo</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-gray-400">Interest you'll save</Text>
                    <Text className="text-emerald-400 font-bold">{formatMoney(interestSaved)}</Text>
                  </View>
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(500).duration(500)}>
                  {Platform.OS === 'ios' && (
                    <Pressable
                      onPress={handleAppleAuth}
                      disabled={isLoading}
                      className={`rounded-2xl overflow-hidden mb-3 ${isLoading ? 'opacity-70' : ''}`}
                    >
                      <View className="bg-white py-4 flex-row items-center justify-center">
                        {appleLoading ? (
                          <ActivityIndicator color="#000" />
                        ) : (
                          <>
                            <AppleIcon size={20} color="#000" />
                            <Text className="text-black font-semibold text-lg ml-3">Continue with Apple</Text>
                          </>
                        )}
                      </View>
                    </Pressable>
                  )}

                  <Pressable
                    onPress={handleGoogleAuth}
                    disabled={isLoading}
                    className={`rounded-2xl border border-white/20 py-4 flex-row items-center justify-center ${isLoading ? 'opacity-70' : ''}`}
                  >
                    {googleLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <GoogleIcon size={20} />
                        <Text className="text-white font-semibold text-lg ml-3">Continue with Google</Text>
                      </>
                    )}
                  </Pressable>
                </Animated.View>
              </View>

              <Text className="text-gray-600 text-xs text-center">
                By continuing, you agree to our{' '}
                <Text
                  className="text-gray-500 underline"
                  onPress={() => Linking.openURL('https://debt-free.app/terms')}
                >
                  Terms
                </Text>
                {' & '}
                <Text
                  className="text-gray-500 underline"
                  onPress={() => Linking.openURL('https://debt-free.app/privacy')}
                >
                  Privacy Policy
                </Text>
              </Text>
            </Animated.View>
          )}
        </SafeAreaView>
      </View>
    </TouchableWithoutFeedback>
  );
}

export const getOnboardingData = async (): Promise<OnboardingData | null> => {
  try {
    const data = await AsyncStorage.getItem(ONBOARDING_DATA_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting onboarding data:', error);
    return null;
  }
};

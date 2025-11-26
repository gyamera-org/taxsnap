import { useState, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, TextInput, Keyboard, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  FadeIn,
  FadeInUp,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { ChevronRight, ChevronLeft, CreditCard, Layers, TrendingDown, Zap } from 'lucide-react-native';
import { markOnboardingComplete } from './index';

type Step = 'debt' | 'rate' | 'payment' | 'type' | 'reveal' | 'signup';
type DebtType = 'single' | 'multiple';
type Strategy = 'avalanche' | 'snowball';

const ONBOARDING_DATA_KEY = '@debt_free_onboarding_data';

// Storage interface
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
  const [step, setStep] = useState<Step>('debt');
  const [debtAmount, setDebtAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [monthlyPaymentInput, setMonthlyPaymentInput] = useState('');
  const [debtType, setDebtType] = useState<DebtType | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy>('avalanche');
  const debtInputRef = useRef<TextInput>(null);
  const rateInputRef = useRef<TextInput>(null);
  const paymentInputRef = useRef<TextInput>(null);

  // Animation values
  const revealScale = useSharedValue(0);

  // Parse numeric value from formatted string (handles both commas and spaces)
  const parseNumber = (value: string): number => {
    const cleaned = value.replace(/[^0-9.]/g, '');
    return parseFloat(cleaned) || 0;
  };

  // Parse values
  const debt = parseNumber(debtAmount);
  const rate = parseFloat(interestRate) || 0;
  const annualRate = rate / 100;
  const monthlyPayment = parseNumber(monthlyPaymentInput);

  // ========== ACCURATE LOAN CALCULATIONS ==========
  const monthlyRate = annualRate / 12;

  /**
   * Calculate months to pay off with a given payment
   * n = -log(1 - rP/M) / log(1+r)
   */
  const calculateMonthsToPayoff = (principal: number, r: number, payment: number): number => {
    if (payment <= 0 || principal <= 0) return Infinity;
    if (r === 0) return Math.ceil(principal / payment);

    const monthlyInterest = principal * r;
    if (payment <= monthlyInterest) return Infinity;

    const months = -Math.log(1 - (r * principal) / payment) / Math.log(1 + r);
    return Math.ceil(months);
  };

  /**
   * Calculate total interest paid
   */
  const calculateTotalInterest = (principal: number, payment: number, months: number): number => {
    if (months <= 0 || payment <= 0 || principal <= 0 || !isFinite(months)) return 0;
    return (payment * months) - principal;
  };

  // Current scenario with user's payment
  const payoffMonths = calculateMonthsToPayoff(debt, monthlyRate, monthlyPayment);
  const totalInterest = calculateTotalInterest(debt, monthlyPayment, payoffMonths);

  // Optimized scenario: Pay 20% more monthly
  const optimizedPayment = monthlyPayment * 1.2;
  const optimizedMonths = calculateMonthsToPayoff(debt, monthlyRate, optimizedPayment);
  const optimizedTotalInterest = calculateTotalInterest(debt, optimizedPayment, optimizedMonths);

  // Savings
  const interestSaved = Math.max(0, totalInterest - optimizedTotalInterest);
  const monthsSaved = isFinite(payoffMonths) && isFinite(optimizedMonths)
    ? Math.max(0, payoffMonths - optimizedMonths)
    : 0;

  // Debt free date (with optimized payment)
  const debtFreeDate = new Date();
  debtFreeDate.setMonth(debtFreeDate.getMonth() + (isFinite(optimizedMonths) ? optimizedMonths : 0));

  // Check if payment covers interest
  const minPaymentRequired = debt * monthlyRate;
  const paymentCoversInterest = monthlyPayment > minPaymentRequired;

  // ========== END CALCULATIONS ==========

  // Format currency for display
  const formatMoney = (amount: number): string => {
    if (!isFinite(amount) || amount === 0) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format duration for display
  const formatDuration = (months: number): string => {
    if (!isFinite(months) || months <= 0) return 'Never';
    const years = Math.floor(months / 12);
    const remainingMonths = Math.round(months % 12);

    if (years === 0) return `${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
    if (remainingMonths === 0) return `${years} year${years !== 1 ? 's' : ''}`;
    return `${years}y ${remainingMonths}m`;
  };

  // Validation
  const canProceedFromDebt = debt > 0;
  const canProceedFromRate = rate > 0 && rate <= 100;
  const canProceedFromPayment = monthlyPayment > 0;
  const canProceedFromType = debtType !== null;

  // Progress
  const steps: Step[] = ['debt', 'rate', 'payment', 'type', 'reveal', 'signup'];
  const progress = steps.indexOf(step);
  const showBackButton = progress > 0;

  const formatInputValue = (value: string) => {
    // Remove all non-numeric characters
    const numbers = value.replace(/[^0-9]/g, '');
    if (numbers === '') return '';
    const num = parseInt(numbers, 10);
    // Format with commas
    return num.toLocaleString('en-US');
  };

  const goBack = () => {
    const i = steps.indexOf(step);
    if (i > 0) setStep(steps[i - 1]);
  };

  const goToRate = () => {
    Keyboard.dismiss();
    setStep('rate');
  };

  const goToPayment = () => {
    Keyboard.dismiss();
    setStep('payment');
  };

  const goToType = () => {
    Keyboard.dismiss();
    setStep('type');
  };

  const goToReveal = () => {
    setStep('reveal');
    setTimeout(() => {
      revealScale.value = withDelay(200, withTiming(1, { duration: 600, easing: Easing.out(Easing.back(1.2)) }));
    }, 100);
  };

  const goToSignup = () => {
    setStep('signup');
  };

  // Save onboarding data to storage
  const saveOnboardingData = async () => {
    try {
      const data: OnboardingData = {
        totalDebt: debt,
        interestRate: rate,
        monthlyPayment,
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

  const handleSignup = async () => {
    await saveOnboardingData();
    await markOnboardingComplete();
    router.push('/paywall');
  };

  const revealAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: revealScale.value }],
    opacity: revealScale.value,
  }));

  return (
    <View className="flex-1 bg-[#0F0F0F]">
      <StatusBar barStyle="light-content" />
      <SafeAreaView className="flex-1">
        {/* Progress Bar with Back Button */}
        <View className="flex-row items-center py-4 px-6">
          {showBackButton ? (
            <Pressable onPress={goBack} className="flex-row items-center mr-4">
              <ChevronLeft size={24} color="#9CA3AF" />
            </Pressable>
          ) : (
            <View className="w-6 mr-4" />
          )}
          <View className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
            <View
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${((progress + 1) / steps.length) * 100}%` }}
            />
          </View>
        </View>

        {/* Step 1: Total Debt */}
        {step === 'debt' && (
          <Animated.View entering={FadeIn.duration(400)} className="flex-1 px-6 justify-between pb-8">
            <View className="flex-1 justify-center">
              <Animated.Text
                entering={FadeInUp.delay(100).duration(500)}
                className="text-white text-3xl font-bold text-center mb-2"
              >
                What's your total debt?
              </Animated.Text>
              <Animated.Text
                entering={FadeInUp.delay(200).duration(500)}
                className="text-gray-500 text-center mb-10"
              >
                Include all credit cards, loans, etc.
              </Animated.Text>

              <Animated.View
                entering={FadeInUp.delay(300).duration(500)}
                className="items-center"
              >
                <Pressable
                  onPress={() => debtInputRef.current?.focus()}
                  className="flex-row items-center justify-center"
                >
                  <Text className="text-white font-black" style={{ fontSize: 48, lineHeight: 60 }}>$</Text>
                  <TextInput
                    ref={debtInputRef}
                    value={debtAmount}
                    onChangeText={(text) => setDebtAmount(formatInputValue(text))}
                    placeholder="0"
                    placeholderTextColor="#4B5563"
                    keyboardType="number-pad"
                    className="text-white font-black text-center"
                    style={{ fontSize: 48, lineHeight: 60, minWidth: 120 }}
                    autoFocus
                  />
                </Pressable>
              </Animated.View>
            </View>

            <Animated.View entering={FadeInDown.delay(400).duration(500)}>
              <Pressable
                onPress={goToRate}
                disabled={!canProceedFromDebt}
                className={`rounded-2xl overflow-hidden ${!canProceedFromDebt ? 'opacity-40' : ''}`}
              >
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
                <View className="py-4 flex-row items-center justify-center">
                  <Text className="text-white font-bold text-lg mr-2">Continue</Text>
                  <ChevronRight size={20} color="#fff" />
                </View>
              </Pressable>
            </Animated.View>
          </Animated.View>
        )}

        {/* Step 2: Interest Rate */}
        {step === 'rate' && (
          <Animated.View entering={FadeIn.duration(400)} className="flex-1 px-6 justify-between pb-8">
            <View className="flex-1 justify-center">
              <Animated.Text
                entering={FadeInUp.delay(100).duration(500)}
                className="text-white text-3xl font-bold text-center mb-2"
              >
                What's your interest rate?
              </Animated.Text>
              <Animated.Text
                entering={FadeInUp.delay(200).duration(500)}
                className="text-gray-500 text-center mb-10"
              >
                The annual percentage rate (APR)
              </Animated.Text>

              <Animated.View
                entering={FadeInUp.delay(300).duration(500)}
                className="items-center"
              >
                <Pressable
                  onPress={() => rateInputRef.current?.focus()}
                  className="flex-row items-center justify-center"
                >
                  <TextInput
                    ref={rateInputRef}
                    value={interestRate}
                    onChangeText={setInterestRate}
                    placeholder="0"
                    placeholderTextColor="#4B5563"
                    keyboardType="decimal-pad"
                    className="text-white font-black text-center"
                    style={{ fontSize: 48, lineHeight: 60, minWidth: 80 }}
                    autoFocus
                  />
                  <Text className="text-white font-black" style={{ fontSize: 48, lineHeight: 60 }}>%</Text>
                </Pressable>
                <Text className="text-gray-500 text-sm mt-4">
                  Credit cards are typically 15-25%
                </Text>
              </Animated.View>
            </View>

            <Pressable
              onPress={goToPayment}
              disabled={!canProceedFromRate}
              className={`rounded-2xl overflow-hidden ${!canProceedFromRate ? 'opacity-40' : ''}`}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <View className="py-4 flex-row items-center justify-center">
                <Text className="text-white font-bold text-lg mr-2">Continue</Text>
                <ChevronRight size={20} color="#fff" />
              </View>
            </Pressable>
          </Animated.View>
        )}

        {/* Step 3: Monthly Payment */}
        {step === 'payment' && (
          <Animated.View entering={FadeIn.duration(400)} className="flex-1 px-6 justify-between pb-8">
            <View className="flex-1 justify-center">
              <Animated.Text
                entering={FadeInUp.delay(100).duration(500)}
                className="text-white text-3xl font-bold text-center mb-2"
              >
                How much can you pay monthly?
              </Animated.Text>
              <Animated.Text
                entering={FadeInUp.delay(200).duration(500)}
                className="text-gray-500 text-center mb-10"
              >
                The amount you can comfortably afford
              </Animated.Text>

              <Animated.View
                entering={FadeInUp.delay(300).duration(500)}
                className="items-center"
              >
                <Pressable
                  onPress={() => paymentInputRef.current?.focus()}
                  className="flex-row items-center justify-center"
                >
                  <Text className="text-white font-black" style={{ fontSize: 48, lineHeight: 60 }}>$</Text>
                  <TextInput
                    ref={paymentInputRef}
                    value={monthlyPaymentInput}
                    onChangeText={(text) => setMonthlyPaymentInput(formatInputValue(text))}
                    placeholder="0"
                    placeholderTextColor="#4B5563"
                    keyboardType="number-pad"
                    className="text-white font-black text-center"
                    style={{ fontSize: 48, lineHeight: 60, minWidth: 120 }}
                    autoFocus
                  />
                </Pressable>
                <Text className="text-gray-500 text-sm mt-2">per month</Text>
                {debt > 0 && rate > 0 && (
                  <Text className="text-gray-600 text-xs mt-4">
                    Minimum to cover interest: {formatMoney(Math.ceil(minPaymentRequired + 1))}
                  </Text>
                )}
              </Animated.View>
            </View>

            <Pressable
              onPress={goToType}
              disabled={!canProceedFromPayment}
              className={`rounded-2xl overflow-hidden ${!canProceedFromPayment ? 'opacity-40' : ''}`}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <View className="py-4 flex-row items-center justify-center">
                <Text className="text-white font-bold text-lg mr-2">Continue</Text>
                <ChevronRight size={20} color="#fff" />
              </View>
            </Pressable>
          </Animated.View>
        )}

        {/* Step 4: Debt Type */}
        {step === 'type' && (
          <Animated.View entering={FadeIn.duration(400)} className="flex-1 px-6 justify-between pb-8">
            <View className="flex-1 justify-center">
              <Animated.Text
                entering={FadeInUp.delay(100).duration(500)}
                className="text-white text-3xl font-bold text-center mb-2"
              >
                How is your debt structured?
              </Animated.Text>
              <Animated.Text
                entering={FadeInUp.delay(200).duration(500)}
                className="text-gray-500 text-center mb-10"
              >
                This helps us find the best strategy
              </Animated.Text>

              <Animated.View entering={FadeInUp.delay(300).duration(500)}>
                <Pressable
                  onPress={() => setDebtType('single')}
                  className="mb-4"
                >
                  <View
                    className={`rounded-2xl p-5 border-2 ${
                      debtType === 'single'
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-white/10 bg-white/5'
                    }`}
                  >
                    <View className="flex-row items-center">
                      <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${
                        debtType === 'single' ? 'bg-emerald-500/20' : 'bg-white/10'
                      }`}>
                        <CreditCard size={24} color={debtType === 'single' ? '#10B981' : '#9CA3AF'} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-white font-bold text-lg">Single debt</Text>
                        <Text className="text-gray-500 text-sm">One loan or credit card</Text>
                      </View>
                    </View>
                  </View>
                </Pressable>

                <Pressable onPress={() => setDebtType('multiple')}>
                  <View
                    className={`rounded-2xl p-5 border-2 ${
                      debtType === 'multiple'
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-white/10 bg-white/5'
                    }`}
                  >
                    <View className="flex-row items-center">
                      <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${
                        debtType === 'multiple' ? 'bg-emerald-500/20' : 'bg-white/10'
                      }`}>
                        <Layers size={24} color={debtType === 'multiple' ? '#10B981' : '#9CA3AF'} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-white font-bold text-lg">Multiple debts</Text>
                        <Text className="text-gray-500 text-sm">Several cards or loans to manage</Text>
                      </View>
                    </View>
                  </View>
                </Pressable>
              </Animated.View>
            </View>

            <Pressable
              onPress={goToReveal}
              disabled={!canProceedFromType}
              className={`rounded-2xl overflow-hidden ${!canProceedFromType ? 'opacity-40' : ''}`}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <View className="py-4 flex-row items-center justify-center">
                <Text className="text-white font-bold text-lg mr-2">See My Plan</Text>
                <ChevronRight size={20} color="#fff" />
              </View>
            </Pressable>
          </Animated.View>
        )}

        {/* Step 5: Reveal */}
        {step === 'reveal' && (
          <Animated.View entering={FadeIn.duration(400)} className="flex-1 px-6 justify-between pb-8">
            <View className="flex-1">
              <Animated.Text
                entering={FadeInUp.duration(400)}
                className="text-gray-400 text-center mb-1 mt-4"
              >
                {formatMoney(debt)} at {rate}% paying {formatMoney(monthlyPayment)}/mo
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
                    : 'Payment doesn\'t cover interest!'}
                </Text>
              </Animated.View>

              {/* Strategy Selection - Only for multiple debts */}
              {paymentCoversInterest && debtType === 'multiple' && (
                <Animated.View entering={FadeInUp.delay(500).duration(500)}>
                  <Text className="text-white font-semibold text-center mb-3">
                    Choose your payoff strategy
                  </Text>

                  {/* Avalanche Method */}
                  <Pressable
                    onPress={() => setSelectedStrategy('avalanche')}
                    className="mb-3"
                  >
                    <View
                      className={`rounded-2xl p-4 border-2 ${
                        selectedStrategy === 'avalanche'
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-white/10 bg-white/5'
                      }`}
                    >
                      <View className="flex-row items-center mb-2">
                        <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                          selectedStrategy === 'avalanche' ? 'bg-emerald-500/20' : 'bg-white/10'
                        }`}>
                          <TrendingDown size={20} color={selectedStrategy === 'avalanche' ? '#10B981' : '#9CA3AF'} />
                        </View>
                        <View className="flex-1">
                          <Text className="text-white font-bold">Avalanche Method</Text>
                          <Text className="text-gray-500 text-xs">Pay highest interest first</Text>
                        </View>
                        {selectedStrategy === 'avalanche' && (
                          <View className="bg-emerald-500 px-2 py-1 rounded">
                            <Text className="text-white text-xs font-semibold">BEST</Text>
                          </View>
                        )}
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-gray-400 text-sm">Saves most money</Text>
                        <Text className="text-emerald-400 font-bold text-sm">{formatMoney(interestSaved)}</Text>
                      </View>
                    </View>
                  </Pressable>

                  {/* Snowball Method */}
                  <Pressable
                    onPress={() => setSelectedStrategy('snowball')}
                  >
                    <View
                      className={`rounded-2xl p-4 border-2 ${
                        selectedStrategy === 'snowball'
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-white/10 bg-white/5'
                      }`}
                    >
                      <View className="flex-row items-center mb-2">
                        <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                          selectedStrategy === 'snowball' ? 'bg-blue-500/20' : 'bg-white/10'
                        }`}>
                          <Zap size={20} color={selectedStrategy === 'snowball' ? '#3B82F6' : '#9CA3AF'} />
                        </View>
                        <View className="flex-1">
                          <Text className="text-white font-bold">Snowball Method</Text>
                          <Text className="text-gray-500 text-xs">Pay smallest balance first</Text>
                        </View>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-gray-400 text-sm">Faster wins, more motivation</Text>
                        <Text className="text-blue-400 font-bold text-sm">Quick wins</Text>
                      </View>
                    </View>
                  </Pressable>
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

            <Pressable onPress={goToSignup} className="rounded-2xl overflow-hidden">
              <LinearGradient
                colors={['#10B981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <View className="py-4 flex-row items-center justify-center">
                <Text className="text-white font-bold text-lg mr-2">Get My Plan</Text>
                <ChevronRight size={20} color="#fff" />
              </View>
            </Pressable>
          </Animated.View>
        )}

        {/* Step 6: Signup */}
        {step === 'signup' && (
          <Animated.View entering={FadeIn.duration(400)} className="flex-1 px-6 justify-between pb-8">
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
                  <Text className="text-white font-bold">{formatMoney(debt)}</Text>
                </View>
                <View className="flex-row justify-between mb-3">
                  <Text className="text-gray-400">Interest rate</Text>
                  <Text className="text-white font-bold">{rate}%</Text>
                </View>
                <View className="flex-row justify-between mb-3">
                  <Text className="text-gray-400">Your payment</Text>
                  <Text className="text-white font-bold">{formatMoney(monthlyPayment)}/mo</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-400">Interest you'll save</Text>
                  <Text className="text-emerald-400 font-bold">{formatMoney(interestSaved)}</Text>
                </View>
              </Animated.View>

              <Animated.View entering={FadeInUp.delay(500).duration(500)}>
                <Pressable onPress={handleSignup} className="rounded-2xl overflow-hidden mb-3">
                  <View className="bg-white py-4 flex-row items-center justify-center">
                    <Text className="text-black text-xl mr-3"></Text>
                    <Text className="text-black font-semibold text-lg">Continue with Apple</Text>
                  </View>
                </Pressable>

                <Pressable
                  onPress={handleSignup}
                  className="rounded-2xl border border-white/20 py-4 flex-row items-center justify-center"
                >
                  <Text className="text-white text-xl mr-3">G</Text>
                  <Text className="text-white font-semibold text-lg">Continue with Google</Text>
                </Pressable>
              </Animated.View>
            </View>

            <Text className="text-gray-600 text-xs text-center">
              By continuing, you agree to our Terms & Privacy Policy
            </Text>
          </Animated.View>
        )}
      </SafeAreaView>
    </View>
  );
}

// Export helper to get onboarding data
export const getOnboardingData = async (): Promise<OnboardingData | null> => {
  try {
    const data = await AsyncStorage.getItem(ONBOARDING_DATA_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting onboarding data:', error);
    return null;
  }
};

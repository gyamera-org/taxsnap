import { View, Text, Pressable, StyleSheet, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { TrendingDown, ChevronRight } from 'lucide-react-native';

export function WelcomeScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/onboarding');
  };

  const handleSignIn = () => {
    router.push('/auth?mode=signin');
  };

  return (
    <View className="flex-1 bg-[#0F0F0F]">
      <StatusBar barStyle="light-content" />
      <SafeAreaView className="flex-1">
        <View className="flex-1 px-6">
          {/* Top Section with Logo/Brand */}
          <Animated.View
            entering={FadeIn.delay(200).duration(800)}
            className="flex-1 justify-center items-center"
          >
            {/* App Icon */}
            <View className="w-28 h-28 rounded-3xl bg-emerald-500/20 items-center justify-center mb-8">
              <TrendingDown size={56} color="#10B981" />
            </View>

            {/* App Name */}
            <Text className="text-white text-4xl font-bold text-center mb-3">
              DebtFree
            </Text>

            {/* Tagline */}
            <Text className="text-gray-400 text-lg text-center px-8">
              Turn your debt into your greatest savings opportunity
            </Text>
          </Animated.View>

          {/* Bottom Section with Actions */}
          <Animated.View
            entering={FadeInDown.delay(500).duration(800)}
            className="pb-8"
          >
            {/* Stats Preview */}
            <View className="rounded-2xl overflow-hidden mb-8">
              <LinearGradient
                colors={['#1a1a1f', '#141418']}
                style={StyleSheet.absoluteFill}
              />
              <View className="absolute inset-0 rounded-2xl border border-white/[0.08]" />
              <View className="p-5 flex-row">
                <View className="flex-1 items-center border-r border-white/10">
                  <Text className="text-emerald-400 text-2xl font-bold">$5,000+</Text>
                  <Text className="text-gray-500 text-xs mt-1">Avg. Interest Saved</Text>
                </View>
                <View className="flex-1 items-center">
                  <Text className="text-emerald-400 text-2xl font-bold">3+ Years</Text>
                  <Text className="text-gray-500 text-xs mt-1">Earlier Debt Freedom</Text>
                </View>
              </View>
            </View>

            {/* Get Started Button */}
            <Pressable
              onPress={handleGetStarted}
              className="rounded-2xl overflow-hidden mb-4"
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <View className="py-4 px-6 flex-row items-center justify-center">
                <Text className="text-white font-bold text-lg mr-2">
                  Get Started
                </Text>
                <ChevronRight size={20} color="#ffffff" />
              </View>
            </Pressable>

            {/* Sign In Link */}
            <Pressable onPress={handleSignIn} className="py-3">
              <Text className="text-gray-400 text-center">
                Already have an account?{' '}
                <Text className="text-emerald-400 font-semibold">Sign In</Text>
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}

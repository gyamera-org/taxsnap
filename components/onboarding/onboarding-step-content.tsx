import { View, TouchableOpacity, TextInput } from 'react-native';
import { Text } from '@/components/ui/text';
import {
  Target,
  Activity,
  Scale,
  Heart,
  Dumbbell,
  Check,
  Calendar,
  Apple,
  Zap,
  Bot,
} from 'lucide-react-native';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';
import { OnboardingStepContentProps } from '@/types/onboarding';

export const OnboardingStepContent = ({
  stepId,
  data,
  updateData,
  openCalendar,
}: OnboardingStepContentProps & { stepId: string }) => {
  const renderStepContent = () => {
    switch (stepId) {
      case 'welcome':
        return (
          <Animated.View entering={FadeIn.duration(600)} className="items-center">
            <Text className="text-gray-600 text-center text-lg leading-relaxed">
              We'll ask you a few personalized questions to create your custom wellness experience
              tailored just for you.
            </Text>
          </Animated.View>
        );

      case 'personal':
        return (
          <Animated.View entering={SlideInRight.duration(400)}>
            <TextInput
              value={data.name}
              onChangeText={(text) => updateData('name', text)}
              placeholder="Enter your name"
              className="bg-gray-50 rounded-2xl px-6 py-4 text-lg"
              style={{ lineHeight: 24, minHeight: 56 }}
              autoFocus
            />
          </Animated.View>
        );

      case 'birthday':
        return (
          <Animated.View entering={SlideInRight.duration(400)}>
            <TouchableOpacity
              onPress={() => openCalendar('birthday')}
              className="bg-gray-50 rounded-2xl px-6 py-4"
            >
              <Text className={`text-lg ${data.dateOfBirth ? 'text-gray-900' : 'text-gray-500'}`}>
                {data.dateOfBirth
                  ? new Date(data.dateOfBirth).toLocaleDateString()
                  : 'Select your birthday'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        );

      case 'fitness-goal':
        return (
          <Animated.View entering={SlideInRight.duration(400)}>
            <View>
              {[
                { value: 'lose_weight', label: 'Lose Weight', icon: Target, color: '#EF4444' },
                {
                  value: 'build_muscle',
                  label: 'Build Muscle',
                  icon: Dumbbell,
                  color: '#8B5CF6',
                },
                {
                  value: 'improve_endurance',
                  label: 'Improve Endurance',
                  icon: Activity,
                  color: '#10B981',
                },
                {
                  value: 'general_fitness',
                  label: 'General Fitness',
                  icon: Heart,
                  color: '#EC4899',
                },
              ].map((option, index) => {
                const IconComponent = option.icon;
                return (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => updateData('fitnessGoal', option.value)}
                    className={`p-5 border mb-3 ${
                      data.fitnessGoal === option.value
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 bg-white'
                    }`}
                    style={{ borderRadius: 16 }}
                  >
                    <View className="flex-row items-center">
                      <View
                        className="w-12 h-12 rounded-full items-center justify-center mr-4"
                        style={{ backgroundColor: `${option.color}15` }}
                      >
                        <IconComponent size={24} color={option.color} />
                      </View>
                      <Text className="text-lg font-semibold text-gray-900">{option.label}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>
        );

      case 'fitness-frequency':
        return (
          <Animated.View entering={SlideInRight.duration(400)}>
            <View className="flex-row">
              {['1-2', '3-4', '5-6', '7+'].map((freq, index) => (
                <TouchableOpacity
                  key={freq}
                  onPress={() => updateData('fitnessFrequency', freq)}
                  className={`flex-1 p-4 border ${
                    data.fitnessFrequency === freq
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 bg-white'
                  }`}
                  style={{
                    borderRadius: 12,
                    marginRight: index < 3 ? 8 : 0,
                  }}
                >
                  <Text className="text-center font-semibold text-gray-900">{freq}</Text>
                  <Text className="text-center text-sm text-gray-500 mt-1">per week</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        );

      case 'fitness-experience':
        return (
          <Animated.View entering={SlideInRight.duration(400)}>
            <View className="flex-col gap-2">
              {[
                { value: 'beginner', label: 'Beginner' },
                { value: 'intermediate', label: 'Intermediate' },
                { value: 'advanced', label: 'Advanced' },
              ].map((level, index) => (
                <TouchableOpacity
                  key={level.value}
                  onPress={() => updateData('fitnessExperience', level.value)}
                  className={`flex-1 px-2 py-4 border ${
                    data.fitnessExperience === level.value
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 bg-white'
                  }`}
                  style={{
                    borderRadius: 12,
                    marginRight: index < 2 ? 8 : 0,
                  }}
                >
                  <Text className="text-center font-semibold text-gray-900">{level.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        );

      case 'nutrition-goal':
        return (
          <Animated.View entering={SlideInRight.duration(400)}>
            <View>
              {[
                { value: 'lose_weight', label: 'Lose Weight', icon: Target, color: '#EF4444' },
                { value: 'gain_muscle', label: 'Gain Muscle', icon: Dumbbell, color: '#8B5CF6' },
                { value: 'maintain', label: 'Maintain Weight', icon: Scale, color: '#10B981' },
                { value: 'improve_health', label: 'Improve Health', icon: Heart, color: '#EC4899' },
              ].map((option) => {
                const IconComponent = option.icon;
                return (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => updateData('nutritionGoal', option.value)}
                    className={`p-5 border mb-3 ${
                      data.nutritionGoal === option.value
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-white'
                    }`}
                    style={{ borderRadius: 16 }}
                  >
                    <View className="flex-row items-center">
                      <View
                        className="w-12 h-12 rounded-full items-center justify-center mr-4"
                        style={{ backgroundColor: `${option.color}15` }}
                      >
                        <IconComponent size={24} color={option.color} />
                      </View>
                      <Text className="text-lg font-semibold text-gray-900">{option.label}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>
        );

      case 'nutrition-activity':
        return (
          <Animated.View entering={SlideInRight.duration(400)}>
            <View>
              {[
                {
                  value: 'sedentary',
                  label: 'Sedentary',
                  description: 'Desk job, little exercise',
                },
                {
                  value: 'light',
                  label: 'Light Activity',
                  description: 'Light exercise 1-3 days/week',
                },
                {
                  value: 'moderate',
                  label: 'Moderate Activity',
                  description: 'Exercise 3-5 days/week',
                },
                {
                  value: 'active',
                  label: 'Very Active',
                  description: 'Intense exercise 6-7 days/week',
                },
              ].map((level) => (
                <TouchableOpacity
                  key={level.value}
                  onPress={() => updateData('activityLevel', level.value)}
                  className={`p-5 border mb-3 ${
                    data.activityLevel === level.value
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-white'
                  }`}
                  style={{ borderRadius: 16 }}
                >
                  <Text className="text-lg font-semibold text-gray-900 mb-1">{level.label}</Text>
                  <Text className="text-gray-600 text-sm">{level.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        );

      case 'nutrition-experience':
        return (
          <Animated.View entering={SlideInRight.duration(400)}>
            <View className="flex-col gap-2">
              {[
                { value: 'beginner', label: 'Beginner' },
                { value: 'intermediate', label: 'Intermediate' },
                { value: 'advanced', label: 'Advanced' },
              ].map((level, index) => (
                <TouchableOpacity
                  key={level.value}
                  onPress={() => updateData('nutritionExperience', level.value)}
                  className={`flex-1 px-2 py-4 border ${
                    data.nutritionExperience === level.value
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-white'
                  }`}
                  style={{
                    borderRadius: 12,
                    marginRight: index < 2 ? 8 : 0,
                  }}
                >
                  <Text className="text-center font-semibold text-gray-900">{level.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        );

      case 'body-units':
        return (
          <Animated.View entering={SlideInRight.duration(400)}>
            <View className="flex-row">
              {[
                { value: 'metric', label: 'Metric', description: 'kg / cm' },
                { value: 'imperial', label: 'Imperial', description: 'lbs / ft' },
              ].map((unit, index) => (
                <TouchableOpacity
                  key={unit.value}
                  onPress={() => updateData('units', unit.value)}
                  className={`flex-1 p-6 border ${
                    data.units === unit.value
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 bg-white'
                  }`}
                  style={{
                    borderRadius: 16,
                    marginRight: index < 1 ? 16 : 0,
                  }}
                >
                  <Text className="text-center font-semibold text-gray-900 text-lg mb-2">
                    {unit.label}
                  </Text>
                  <Text className="text-center text-gray-600 text-sm">{unit.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        );

      case 'body-measurements':
        return (
          <Animated.View entering={SlideInRight.duration(400)}>
            <View className="mb-6">
              <View className="flex-row mb-4">
                <View className="flex-1" style={{ marginRight: 16 }}>
                  <Text className="text-gray-700 font-semibold mb-3 text-lg">
                    Height {data.units === 'metric' ? '(cm)' : '(ft)'}
                  </Text>
                  <TextInput
                    value={data.height > 0 ? data.height.toString() : ''}
                    onChangeText={(text) => updateData('height', parseFloat(text) || 0)}
                    keyboardType="numeric"
                    placeholder={data.units === 'metric' ? '170' : '5.7'}
                    className="bg-gray-50 px-4 py-4 text-lg font-medium"
                    style={{ borderRadius: 12, lineHeight: 24, minHeight: 56 }}
                  />
                </View>

                <View className="flex-1">
                  <Text className="text-gray-700 font-semibold mb-3 text-lg">
                    Weight {data.units === 'metric' ? '(kg)' : '(lbs)'}
                  </Text>
                  <TextInput
                    value={data.weight > 0 ? data.weight.toString() : ''}
                    onChangeText={(text) => updateData('weight', parseFloat(text) || 0)}
                    keyboardType="numeric"
                    placeholder={data.units === 'metric' ? '65' : '143'}
                    className="bg-gray-50 px-4 py-4 text-lg font-medium"
                    style={{ borderRadius: 12, lineHeight: 24, minHeight: 56 }}
                  />
                </View>
              </View>

              <View>
                <Text className="text-gray-700 font-semibold mb-3 text-lg">
                  Goal Weight {data.units === 'metric' ? '(kg)' : '(lbs)'}
                </Text>
                <TextInput
                  value={data.weightGoal > 0 ? data.weightGoal.toString() : ''}
                  onChangeText={(text) => updateData('weightGoal', parseFloat(text) || 0)}
                  keyboardType="numeric"
                  placeholder={data.units === 'metric' ? '60' : '132'}
                  className="bg-gray-50 px-4 py-4 text-lg font-medium"
                  style={{ borderRadius: 12, lineHeight: 24, minHeight: 56 }}
                />
              </View>
            </View>
          </Animated.View>
        );

      case 'complete':
        return (
          <Animated.View entering={FadeIn.duration(600)} className="items-center">
            {/* Features List */}
            <View className="w-full mb-8">
              {[
                {
                  icon: Calendar,
                  title: 'Cycle Tracking',
                  description: 'Track your period and fertility window',
                  color: '#EC4899',
                },
                {
                  icon: Apple,
                  title: 'Nutrition Planning',
                  description: 'Personalized meal plans and macro tracking',
                  color: '#10B981',
                },
                {
                  icon: Zap,
                  title: 'Fitness Goals',
                  description: 'Workouts that sync with your hormones',
                  color: '#8B5CF6',
                },
                {
                  icon: Bot,
                  title: 'AI Assistant',
                  description: 'Smart insights for your wellness journey',
                  color: '#F59E0B',
                },
              ].map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <View key={index} className="flex-row items-center mb-6">
                    <View
                      className="w-12 h-12 rounded-full items-center justify-center mr-4"
                      style={{ backgroundColor: `${feature.color}15` }}
                    >
                      <IconComponent size={24} color={feature.color} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-lg font-semibold text-gray-900 mb-1">
                        {feature.title}
                      </Text>
                      <Text className="text-gray-600 text-sm">{feature.description}</Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Subscription Options */}
            <View className="w-full mb-4">
              <TouchableOpacity
                onPress={() => updateData('plan', 'yearly')}
                className={`relative p-4 rounded-xl border-2 mb-2 ${
                  data.plan === 'yearly' ? 'border-pink-500 bg-pink-50' : 'border-gray-200 bg-white'
                }`}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-gray-900">Yearly - $0.77/week</Text>
                    <Text className="text-xs text-gray-600">$39.99/year after trial</Text>
                  </View>
                  <View className="bg-pink-500 px-2 py-1 rounded-full">
                    <Text className="text-white text-xs font-bold">Save 58%</Text>
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => updateData('plan', 'monthly')}
                className={`p-4 rounded-xl border-2 ${
                  data.plan === 'monthly'
                    ? 'border-pink-500 bg-pink-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-gray-900">Monthly - $1.84/week</Text>
                    <Text className="text-xs text-gray-600">$7.99/month after trial</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            {/* No Payment Notice */}
            <View className="w-full mb-2">
              <Text className="text-center text-gray-600 text-xs">
                No payment required • Cancel anytime
              </Text>
            </View>

            {/* Restore Purchases */}
            <View className="w-full mb-3">
              <TouchableOpacity className="items-center">
                <Text className="text-gray-500 text-xs underline">Restore Purchases</Text>
              </TouchableOpacity>
            </View>

            {/* Terms & Privacy */}
            <View className="w-full mb-4">
              <View className="flex-row justify-center items-center">
                <TouchableOpacity className="mr-6">
                  <Text className="text-gray-500 text-xs underline">Terms</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text className="text-gray-500 text-xs underline">Privacy</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        );

      default:
        return null;
    }
  };

  return renderStepContent();
};

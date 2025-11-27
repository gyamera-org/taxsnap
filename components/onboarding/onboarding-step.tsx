import { ReactNode } from 'react';
import { View, Platform, KeyboardAvoidingView } from 'react-native';
import Animated, { SlideInRight, FadeInUp } from 'react-native-reanimated';

interface OnboardingStepProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  withKeyboardAvoid?: boolean;
  footer?: ReactNode;
}

export function OnboardingStep({
  children,
  title,
  subtitle,
  withKeyboardAvoid = false,
  footer,
}: OnboardingStepProps) {
  const content = (
    <Animated.View entering={SlideInRight.duration(300)} className="flex-1 px-6 justify-between pb-8">
      <View className="flex-1 justify-center">
        <Animated.Text
          entering={FadeInUp.delay(100).duration(500)}
          className="text-white text-3xl font-bold text-center mb-2"
        >
          {title}
        </Animated.Text>
        {subtitle && (
          <Animated.Text
            entering={FadeInUp.delay(200).duration(500)}
            className="text-gray-500 text-center mb-10"
          >
            {subtitle}
          </Animated.Text>
        )}
        {children}
      </View>
      {footer}
    </Animated.View>
  );

  if (withKeyboardAvoid) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {content}
      </KeyboardAvoidingView>
    );
  }

  return content;
}

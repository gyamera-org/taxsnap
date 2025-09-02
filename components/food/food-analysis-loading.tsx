import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions } from 'react-native';
import { Text } from '@/components/ui/text';
import { ChefHat, Sparkles, Camera, Utensils } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface FoodAnalysisLoadingProps {
  progress?: number; // 0-100
  stage?: 'uploading' | 'analyzing' | 'processing' | 'finalizing';
  foodName?: string;
}

const stages = {
  uploading: {
    icon: Camera,
    title: 'Uploading image...',
    subtitle: 'Preparing your food photo',
    color: '#3B82F6',
  },
  analyzing: {
    icon: ChefHat,
    title: 'AI analyzing your food...',
    subtitle: 'Identifying ingredients and nutrition',
    color: '#10B981',
  },
  processing: {
    icon: Sparkles,
    title: 'Processing nutrition data...',
    subtitle: 'Calculating calories and macros',
    color: '#8B5CF6',
  },
  finalizing: {
    icon: Utensils,
    title: 'Almost ready!',
    subtitle: 'Finalizing your meal entry',
    color: '#F59E0B',
  },
};

export function FoodAnalysisLoading({
  progress = 0,
  stage = 'analyzing',
  foodName,
}: FoodAnalysisLoadingProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const particleAnims = useRef(
    Array.from({ length: 6 }, () => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0),
    }))
  ).current;

  const stageConfig = stages[stage];
  const IconComponent = stageConfig.icon;

  useEffect(() => {
    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  useEffect(() => {
    // Pulsing animation for the main icon
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    // Rotation animation
    const rotationAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    );

    // Particle animations
    const particleAnimations = particleAnims.map((particle, index) => {
      const delay = index * 300;
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(particle.opacity, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(particle.scale, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(particle.x, {
              toValue: (Math.random() - 0.5) * 100,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(particle.y, {
              toValue: (Math.random() - 0.5) * 100,
              duration: 2000,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(particle.opacity, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(particle.scale, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
    });

    pulseAnimation.start();
    rotationAnimation.start();
    particleAnimations.forEach((anim) => anim.start());

    return () => {
      pulseAnimation.stop();
      rotationAnimation.stop();
      particleAnimations.forEach((anim) => anim.stop());
    };
  }, [stage]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [0, width - 80],
  });

  return (
    <View className="flex-1 items-center justify-center p-8 bg-gradient-to-b from-gray-50 to-white">
      {/* Particle Effects */}
      <View className="absolute inset-0 items-center justify-center">
        {particleAnims.map((particle, index) => (
          <Animated.View
            key={index}
            className="absolute w-2 h-2 rounded-full"
            style={{
              backgroundColor: stageConfig.color,
              opacity: particle.opacity,
              transform: [
                { translateX: particle.x },
                { translateY: particle.y },
                { scale: particle.scale },
              ],
            }}
          />
        ))}
      </View>

      {/* Main Loading Circle */}
      <View className="relative mb-8">
        {/* Outer Ring */}
        <View
          className="w-32 h-32 rounded-full border-4 border-opacity-20 items-center justify-center"
          style={{ borderColor: stageConfig.color }}
        >
          {/* Inner Circle with Icon */}
          <Animated.View
            className="w-24 h-24 rounded-full items-center justify-center"
            style={{
              backgroundColor: `${stageConfig.color}15`,
              transform: [{ scale: pulseAnim }],
            }}
          >
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <IconComponent size={32} color={stageConfig.color} />
            </Animated.View>
          </Animated.View>
        </View>

        {/* Progress Ring Overlay */}
        <View className="absolute inset-0 items-center justify-center">
          <View className="w-32 h-32 rounded-full border-4 border-transparent">
            <View
              className="absolute inset-0 rounded-full border-4"
              style={{
                borderColor: stageConfig.color,
                borderTopColor: 'transparent',
                borderRightColor: 'transparent',
                transform: [{ rotate: `${(progress / 100) * 360}deg` }],
              }}
            />
          </View>
        </View>
      </View>

      {/* Status Text */}
      <View className="items-center mb-8">
        <Text className="text-xl font-bold text-gray-900 mb-2 text-center">
          {stageConfig.title}
        </Text>
        <Text className="text-gray-600 text-center mb-4 px-4">{stageConfig.subtitle}</Text>

        {foodName && (
          <View className="bg-white rounded-full px-4 py-2 shadow-sm border border-gray-100">
            <Text className="text-gray-700 font-medium">{foodName}</Text>
          </View>
        )}
      </View>

      {/* Progress Bar */}
      <View className="w-full max-w-xs mb-6">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-sm text-gray-500">Progress</Text>
          <Text className="text-sm font-medium" style={{ color: stageConfig.color }}>
            {Math.round(progress)}%
          </Text>
        </View>

        <View className="w-full bg-gray-200 rounded-full h-2">
          <Animated.View
            className="h-2 rounded-full"
            style={{
              backgroundColor: stageConfig.color,
              width: progressWidth,
            }}
          />
        </View>
      </View>

      {/* Stage Indicators */}
      <View className="flex-row items-center space-x-3">
        {Object.entries(stages).map(([key, config], index) => {
          const isActive = key === stage;
          const isPast = Object.keys(stages).indexOf(key) < Object.keys(stages).indexOf(stage);

          return (
            <View
              key={key}
              className={`w-3 h-3 rounded-full ${
                isActive ? 'ring-2 ring-offset-2' : isPast ? '' : 'opacity-30'
              }`}
              style={{
                backgroundColor: isActive || isPast ? config.color : '#D1D5DB',
                ...(isActive && {
                  ringColor: config.color,
                  shadowColor: config.color,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                }),
              }}
            />
          );
        })}
      </View>

      {/* Realtime Notification */}
      <View className="mt-8 bg-blue-50 rounded-xl p-4 border border-blue-100">
        <View className="flex-row items-center justify-center">
          <View className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse" />
          <Text className="text-blue-700 font-medium text-sm">
            We'll notify you when analysis is complete
          </Text>
        </View>
      </View>
    </View>
  );
}

export default FoodAnalysisLoading;

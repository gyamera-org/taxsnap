import React, { useEffect, useRef } from 'react';
import { View, Image, Animated } from 'react-native';
import { Text } from '@/components/ui/text';
import { Upload, Brain, Cpu, Zap, Sparkles, Timer } from 'lucide-react-native';

interface ModernAnalyzingCardProps {
  imageUrl?: string;
  progress?: number; // 0-100
  stage?: 'uploading' | 'analyzing' | 'processing' | 'finalizing';
  mealType: string;
  time: string;
}

const stageConfig = {
  uploading: {
    icon: Upload,
    title: 'Uploading image...',
    color: '#3B82F6',
    bgColor: '#EFF6FF',
  },
  analyzing: {
    icon: Brain,
    title: 'AI analyzing your food...',
    color: '#10B981',
    bgColor: '#ECFDF5',
  },
  processing: {
    icon: Cpu,
    title: 'Processing nutrition data...',
    color: '#8B5CF6',
    bgColor: '#F3E8FF',
  },
  finalizing: {
    icon: Zap,
    title: 'Almost ready!',
    color: '#F59E0B',
    bgColor: '#FFFBEB',
  },
};

export function ModernAnalyzingCard({
  imageUrl,
  progress = 0,
  stage = 'analyzing',
  mealType,
  time,
}: ModernAnalyzingCardProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const config = stageConfig[stage] || stageConfig.uploading; // Fallback to uploading if stage is invalid
  const IconComponent = config.icon;

  useEffect(() => {
    // Pulse animation for the icon
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
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

    // Shimmer animation for the image overlay
    const shimmer = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    );

    pulse.start();
    shimmer.start();

    return () => {
      pulse.stop();
      shimmer.stop();
    };
  }, [stage]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const shimmerTranslateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 100],
  });

  return (
    <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-50 overflow-hidden">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <Text className="text-sm font-medium text-gray-500 capitalize">{mealType}</Text>
          <View className="w-1 h-1 bg-gray-300 rounded-full mx-2" />
          <Text className="text-xs text-gray-400">{time}</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" />
          <Text className="text-xs text-green-600 font-medium">Live</Text>
        </View>
      </View>

      <View className="flex-row items-center mb-4">
        {/* Food Image with Analysis Overlay */}
        <View className="relative w-16 h-16 rounded-xl overflow-hidden mr-4">
          {imageUrl ? (
            <>
              <Image source={{ uri: imageUrl }} className="w-full h-full" resizeMode="cover" />
              {/* Analysis Overlay */}
              <View
                className="absolute inset-0 items-center justify-center"
                style={{ backgroundColor: `${config.color}20` }}
              >
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                  <IconComponent size={20} color={config.color} />
                </Animated.View>
              </View>

              {/* Shimmer Effect */}
              <Animated.View
                className="absolute inset-0 opacity-30 bg-white"
                style={{
                  transform: [{ translateX: shimmerTranslateX }],
                  width: 100,
                }}
              />
            </>
          ) : (
            <View
              className="w-full h-full items-center justify-center"
              style={{ backgroundColor: config.bgColor }}
            >
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <IconComponent size={24} color={config.color} />
              </Animated.View>
            </View>
          )}
        </View>

        {/* Analysis Info */}
        <View className="flex-1">
          <View className="flex-row items-center mb-2">
            <Animated.View className="mr-2" style={{ transform: [{ scale: pulseAnim }] }}>
              <Sparkles size={16} color={config.color} />
            </Animated.View>
            <Text className="text-base font-semibold text-gray-900">{config.title}</Text>
          </View>

          <Text className="text-sm text-gray-600 mb-2">
            {progress > 0 ? `${Math.round(progress)}% complete` : 'Starting analysis...'}
          </Text>

          {/* Progress Bar */}
          <View className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <Animated.View
              className="h-full rounded-full"
              style={{
                backgroundColor: config.color,
                width: progressWidth.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
              }}
            />
          </View>
        </View>
      </View>

      {/* Status Message */}
      <View className="rounded-xl p-3" style={{ backgroundColor: config.bgColor }}>
        <View className="flex-row items-center justify-center">
          <Timer size={14} color={config.color} />
          <Text className="font-medium ml-2 text-sm" style={{ color: config.color }}>
            We'll notify you when analysis is complete
          </Text>
        </View>
      </View>
    </View>
  );
}

export default ModernAnalyzingCard;
